import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { hashPassword } from '../utils/crypto';
import { User } from '../models/types';

export const updateVoterStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED']),
});

export const importCsvSchema = z.object({
  electionId: z.string().optional(),
  csvContent: z.string().min(5, 'CSV content required'),
});

export async function getAdminDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const totalStudents = db.users.countDocuments((u) => u.role === 'VOTER' || u.role === 'CANDIDATE');
    const verifiedStudents = db.users.countDocuments((u) => u.emailVerifiedAt !== null);
    const activeVoters = db.users.countDocuments((u) => u.accountStatus === 'ACTIVE');

    const totalElections = db.elections.countDocuments();
    const activeElections = db.elections.countDocuments((e) => e.status === 'ACTIVE');
    const completedElections = db.elections.countDocuments((e) => e.status === 'CLOSED' || e.status === 'PUBLISHED');
    const scheduledElections = db.elections.countDocuments((e) => e.status === 'SCHEDULED');

    const totalVotesCast = db.voterEligibility.countDocuments((v) => v.hasVoted);
    const totalCandidates = db.candidates.countDocuments();
    const pendingCandidates = db.candidates.countDocuments((c) => c.approvalStatus === 'PENDING');

    // Turnout by election
    const elections = db.elections.find();
    const electionTurnouts = elections.map((e) => {
      const eligible = db.voterEligibility.countDocuments((v) => v.electionId === e.id);
      const voted = db.voterEligibility.countDocuments((v) => v.electionId === e.id && v.hasVoted);
      const turnout = eligible > 0 ? Math.round((voted / eligible) * 100) : 0;
      return {
        name: e.title.length > 20 ? e.title.substring(0, 20) + '...' : e.title,
        eligible,
        voted,
        turnout,
        status: e.status,
      };
    });

    // Department participation distribution
    const students = db.users.find((u) => u.role === 'VOTER');
    const deptDistribution: Record<string, number> = {};
    students.forEach((s) => {
      deptDistribution[s.department] = (deptDistribution[s.department] || 0) + 1;
    });

    const departmentChartData = Object.entries(deptDistribution).map(([department, count]) => ({
      department,
      students: count,
    }));

    // Recent 10 audit logs
    const recentAuditLogs = db.auditLogs.find().slice(0, 8);

    return res.json({
      metrics: {
        totalRegisteredStudents: totalStudents,
        verifiedStudents,
        approvedVoters: activeVoters,
        totalElections,
        activeElections,
        completedElections,
        scheduledElections,
        totalVotesCast,
        totalCandidates,
        pendingCandidates,
      },
      charts: {
        electionTurnouts,
        departmentChartData,
      },
      recentActivity: recentAuditLogs,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error compiling admin dashboard metrics' });
  }
}

export async function getVoters(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, department, status } = req.query;
    let list = db.users.find((u) => u.role === 'VOTER' || u.role === 'CANDIDATE');

    if (search && typeof search === 'string') {
      const s = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.studentId.toLowerCase().includes(s)
      );
    }

    if (department && typeof department === 'string') {
      list = list.filter((u) => u.department.toLowerCase() === department.toLowerCase());
    }

    if (status && typeof status === 'string') {
      list = list.filter((u) => u.accountStatus === status);
    }

    // Strip passwordHash
    const safeList = list.map(({ passwordHash, ...rest }) => rest);
    return res.json(safeList);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching voters list' });
  }
}

export async function updateVoterStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const user = db.users.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: Partial<User> = { accountStatus: status };
    if (status === 'ACTIVE' && !user.emailVerifiedAt) {
      updates.emailVerifiedAt = new Date().toISOString();
    }

    const updated = db.users.updateOne(id, updates);

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'VOTER_STATUS_UPDATED',
      entityType: 'USER',
      entityId: id,
      details: { previousStatus: user.accountStatus, newStatus: status, targetEmail: user.email },
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: `Student status updated to ${status}`, user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error updating student status' });
  }
}

export async function importEligibilityCsv(req: AuthenticatedRequest, res: Response) {
  try {
    const { electionId, csvContent } = req.body;
    const lines = csvContent.split('\n').map((l: string) => l.trim()).filter(Boolean);

    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must contain a header row and at least one student row' });
    }

    const header = lines[0].toLowerCase().split(',').map((h: string) => h.trim());
    const nameIdx = header.findIndex((h: string) => h.includes('name'));
    const emailIdx = header.findIndex((h: string) => h.includes('email'));
    const studentIdIdx = header.findIndex((h: string) => h.includes('id') || h.includes('roll'));
    const deptIdx = header.findIndex((h: string) => h.includes('dept') || h.includes('department'));
    const semIdx = header.findIndex((h: string) => h.includes('sem'));

    if (emailIdx === -1 || studentIdIdx === -1) {
      return res.status(400).json({
        error: 'CSV must contain at least "email" and "studentId" columns in the header row.',
      });
    }

    let createdUsersCount = 0;
    let existingUsersCount = 0;
    let eligibilityRecordsCreated = 0;
    const defaultPasswordHash = await hashPassword('Student@123456');
    const now = new Date().toISOString();

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p: string) => p.trim());
      const email = parts[emailIdx]?.toLowerCase();
      const studentId = parts[studentIdIdx];
      const name = nameIdx !== -1 && parts[nameIdx] ? parts[nameIdx] : `Student ${studentId}`;
      const department = deptIdx !== -1 && parts[deptIdx] ? parts[deptIdx] : 'General Engineering';
      const semester = semIdx !== -1 && parts[semIdx] ? parseInt(parts[semIdx], 10) || 1 : 1;

      if (!email || !studentId) continue;

      let student = db.users.findOne((u) => u.email.toLowerCase() === email || u.studentId === studentId);
      if (!student) {
        student = db.users.insertOne({
          id: `user-csv-${Date.now()}-${i}`,
          name,
          email,
          passwordHash: defaultPasswordHash,
          studentId,
          department,
          semester,
          role: 'VOTER',
          accountStatus: 'ACTIVE',
          emailVerifiedAt: now,
          createdAt: now,
          updatedAt: now,
        });
        createdUsersCount++;
      } else {
        existingUsersCount++;
      }

      // If an electionId was specified, add to election eligibility table
      if (electionId && student) {
        const alreadyEligible = db.voterEligibility.findOne(
          (v) => v.electionId === electionId && v.userId === student!.id
        );
        if (!alreadyEligible) {
          try {
            db.voterEligibility.insertOne({
              id: `elig-${electionId}-${student.id}`,
              electionId,
              userId: student.id,
              hasVoted: false,
              votedAt: null,
              createdAt: now,
            });
            eligibilityRecordsCreated++;
          } catch {
            // compound key duplicate ignored
          }
        }
      }
    }

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'CSV_ELIGIBILITY_IMPORTED',
      entityType: 'ELIGIBILITY',
      entityId: electionId || 'GLOBAL',
      details: {
        totalRows: lines.length - 1,
        createdUsersCount,
        existingUsersCount,
        eligibilityRecordsCreated,
      },
      createdAt: now,
    });

    return res.json({
      message: 'Student eligibility CSV successfully processed.',
      summary: {
        totalRowsProcessed: lines.length - 1,
        newStudentsRegistered: createdUsersCount,
        existingStudentsMatched: existingUsersCount,
        electionEligibilityAssigned: eligibilityRecordsCreated,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error importing CSV' });
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const { action, entityType } = req.query;
    let list = db.auditLogs.find();

    if (action && typeof action === 'string') {
      list = list.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
    }
    if (entityType && typeof entityType === 'string') {
      list = list.filter((l) => l.entityType === entityType);
    }

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching audit logs' });
  }
}
