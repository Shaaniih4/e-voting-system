import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { Election, ElectionStatus } from '../models/types';

export const createElectionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  academicYear: z.string().min(4),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  positions: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(2),
      maxSelections: z.number().int().min(1).default(1),
      description: z.string().optional(),
    })
  ).min(1, 'At least one election position required'),
  eligibleDepartments: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE']).default('DRAFT'),
});

export const updateElectionSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  academicYear: z.string().min(4).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  positions: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(2),
      maxSelections: z.number().int().min(1).default(1),
      description: z.string().optional(),
    })
  ).optional(),
  eligibleDepartments: z.array(z.string()).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'CLOSED', 'PUBLISHED']),
});

// Valid state machine transitions
const VALID_TRANSITIONS: Record<ElectionStatus, ElectionStatus[]> = {
  DRAFT: ['SCHEDULED', 'ACTIVE'],
  SCHEDULED: ['ACTIVE', 'DRAFT'],
  ACTIVE: ['CLOSED'],
  CLOSED: ['PUBLISHED', 'ACTIVE'],
  PUBLISHED: [], // Terminal published state
};

export async function getElections(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.query;
    let list = db.elections.find();

    if (status && typeof status === 'string') {
      list = list.filter((e) => e.status === status);
    }

    // Enrich with candidate count and voter's personal status if user is logged in
    const enriched = list.map((election) => {
      const candidates = db.candidates.find(
        (c) => c.electionId === election.id && c.approvalStatus === 'APPROVED'
      );
      let userVoted = false;
      let userEligible = false;

      if (req.user) {
        const elig = db.voterEligibility.findOne(
          (v) => v.electionId === election.id && v.userId === req.user!.id
        );
        if (elig) {
          userEligible = true;
          userVoted = elig.hasVoted;
        } else {
          // If no specific eligibility list set up yet or empty, all verified students are eligible by default
          userEligible = req.user.accountStatus === 'ACTIVE';
        }
      }

      return {
        ...election,
        candidateCount: candidates.length,
        userVoted,
        userEligible,
      };
    });

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching elections' });
  }
}

export async function getElectionById(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const election = db.elections.findById(id);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const isAdminOrAuditor = req.user && (req.user.role === 'ADMIN' || req.user.role === 'AUDITOR');
    const candidates = db.candidates.find((c) => {
      if (c.electionId !== election.id) return false;
      return isAdminOrAuditor ? true : c.approvalStatus === 'APPROVED';
    });

    let userVoted = false;
    let userEligible = false;
    let votedAt: string | null = null;

    if (req.user) {
      const elig = db.voterEligibility.findOne(
        (v) => v.electionId === election.id && v.userId === req.user!.id
      );
      if (elig) {
        userEligible = true;
        userVoted = elig.hasVoted;
        votedAt = elig.votedAt;
      } else {
        userEligible = req.user.accountStatus === 'ACTIVE';
      }
    }

    const totalEligible = db.voterEligibility.countDocuments((v) => v.electionId === election.id);
    const totalVotes = db.voterEligibility.countDocuments((v) => v.electionId === election.id && v.hasVoted);

    return res.json({
      ...election,
      candidates,
      userVoted,
      userEligible,
      votedAt,
      stats: {
        totalEligibleVoters: totalEligible,
        totalVotesCast: totalVotes,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching election details' });
  }
}

export async function createElection(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, description, academicYear, startTime, endTime, positions, eligibleDepartments, status } = req.body;

    const positionsWithIds = positions.map((p: any, idx: number) => ({
      id: p.id || `pos-${Date.now()}-${idx}`,
      title: p.title,
      maxSelections: p.maxSelections || 1,
      description: p.description || '',
    }));

    const now = new Date().toISOString();
    const newElection: Election = {
      id: `elec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      academicYear,
      positions: positionsWithIds,
      startTime,
      endTime,
      status: status || 'DRAFT',
      createdBy: req.user!.id,
      eligibleDepartments: eligibleDepartments || [],
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    db.elections.insertOne(newElection);

    // Auto-create eligibility records for all active students if departments match or empty
    const activeStudents = db.users.find((u) => u.accountStatus === 'ACTIVE' && u.role === 'VOTER');
    activeStudents.forEach((student) => {
      const matchesDept = !newElection.eligibleDepartments?.length ||
        newElection.eligibleDepartments.includes(student.department);
      if (matchesDept) {
        try {
          db.voterEligibility.insertOne({
            id: `elig-${newElection.id}-${student.id}`,
            electionId: newElection.id,
            userId: student.id,
            hasVoted: false,
            votedAt: null,
            createdAt: now,
          });
        } catch {
          // ignore duplicate in initial batch
        }
      }
    });

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ELECTION_CREATED',
      entityType: 'ELECTION',
      entityId: newElection.id,
      details: { title: newElection.title, status: newElection.status },
      createdAt: now,
    });

    return res.status(201).json(newElection);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error creating election' });
  }
}

export async function updateElection(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const election = db.elections.findById(id);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (election.status === 'ACTIVE' || election.status === 'CLOSED' || election.status === 'PUBLISHED') {
      return res.status(400).json({
        error: `Cannot modify election details while in status '${election.status}'. Election must be in DRAFT or SCHEDULED state.`,
      });
    }

    const updated = db.elections.updateOne(id, req.body);

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ELECTION_UPDATED',
      entityType: 'ELECTION',
      entityId: id,
      details: { fields: Object.keys(req.body) },
      createdAt: new Date().toISOString(),
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error updating election' });
  }
}

export async function updateElectionStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { status: targetStatus } = req.body as { status: ElectionStatus };

    const election = db.elections.findById(id);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const allowed = VALID_TRANSITIONS[election.status] || [];
    if (!allowed.includes(targetStatus)) {
      return res.status(400).json({
        error: `Invalid status transition from '${election.status}' to '${targetStatus}'. Allowed: ${allowed.join(', ') || 'None'}`,
      });
    }

    const updates: Partial<Election> = { status: targetStatus };
    if (targetStatus === 'PUBLISHED') {
      updates.publishedAt = new Date().toISOString();
    }

    const updated = db.elections.updateOne(id, updates);

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: `ELECTION_STATUS_${targetStatus}`,
      entityType: 'ELECTION',
      entityId: id,
      details: { previousStatus: election.status, newStatus: targetStatus },
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: `Election status updated to ${targetStatus}`,
      election: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error changing election status' });
  }
}
