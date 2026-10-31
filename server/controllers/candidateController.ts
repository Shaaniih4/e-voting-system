import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { Candidate, CandidateApprovalStatus } from '../models/types';

export const createCandidateSchema = z.object({
  electionId: z.string().min(1),
  name: z.string().min(2),
  photo: z.string().optional().default(''),
  department: z.string().min(2),
  semester: z.number().int().min(1).max(12),
  studentId: z.string().min(3),
  position: z.string().min(2),
  manifesto: z.string().min(10, 'Manifesto must be at least 10 characters'),
  symbol: z.string().min(1, 'Campaign symbol is required'),
});

export const updateCandidateSchema = z.object({
  name: z.string().min(2).optional(),
  photo: z.string().optional(),
  department: z.string().min(2).optional(),
  semester: z.number().int().min(1).max(12).optional(),
  studentId: z.string().min(3).optional(),
  position: z.string().min(2).optional(),
  manifesto: z.string().min(10).optional(),
  symbol: z.string().min(1).optional(),
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export async function getCandidates(req: AuthenticatedRequest, res: Response) {
  try {
    const { electionId, position, status } = req.query;
    let list = db.candidates.find();

    if (electionId && typeof electionId === 'string') {
      list = list.filter((c) => c.electionId === electionId);
    }
    if (position && typeof position === 'string') {
      list = list.filter((c) => c.position.toLowerCase() === position.toLowerCase());
    }
    if (status && typeof status === 'string') {
      list = list.filter((c) => c.approvalStatus === status);
    } else {
      // By default for non-admins, show only approved candidates
      const isAdminOrAuditor = req.user && (req.user.role === 'ADMIN' || req.user.role === 'AUDITOR');
      if (!isAdminOrAuditor) {
        list = list.filter((c) => c.approvalStatus === 'APPROVED');
      }
    }

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching candidates' });
  }
}

export async function getCandidateById(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const candidate = db.candidates.findById(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }
    const election = db.elections.findById(candidate.electionId);

    return res.json({
      ...candidate,
      electionTitle: election?.title || 'Unknown Election',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching candidate' });
  }
}

export async function createCandidate(req: AuthenticatedRequest, res: Response) {
  try {
    const { electionId, name, photo, department, semester, studentId, position, manifesto, symbol } = req.body;

    const election = db.elections.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Target election not found' });
    }

    if (election.status === 'CLOSED' || election.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Cannot nominate candidates for closed or published elections' });
    }

    const positionExists = election.positions.some((p) => p.title.toLowerCase() === position.toLowerCase());
    if (!positionExists) {
      return res.status(400).json({
        error: `Invalid position. Valid positions are: ${election.positions.map((p) => p.title).join(', ')}`,
      });
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const now = new Date().toISOString();

    const candidate: Candidate = {
      id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      electionId,
      userId: req.user?.id || 'manual',
      name,
      photo: photo || '',
      department,
      semester,
      studentId,
      position,
      manifesto,
      symbol,
      approvalStatus: isAdmin ? 'APPROVED' : 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    db.candidates.insertOne(candidate);

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: req.user?.id || 'system',
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'CANDIDATE_NOMINATED',
      entityType: 'CANDIDATE',
      entityId: candidate.id,
      details: { candidateName: name, position, electionId },
      createdAt: now,
    });

    return res.status(201).json(candidate);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error adding candidate' });
  }
}

export async function updateCandidate(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const candidate = db.candidates.findById(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = req.user?.id === candidate.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You are not authorized to edit this candidate profile' });
    }

    // Non-admins cannot change their own approval status
    if (!isAdmin && req.body.approvalStatus) {
      delete req.body.approvalStatus;
    }

    const updated = db.candidates.updateOne(id, req.body);

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'CANDIDATE_UPDATED',
      entityType: 'CANDIDATE',
      entityId: id,
      details: { updatedFields: Object.keys(req.body) },
      createdAt: new Date().toISOString(),
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error updating candidate' });
  }
}

export async function updateCandidateApproval(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body as { status: CandidateApprovalStatus };

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be PENDING, APPROVED, or REJECTED' });
    }

    const candidate = db.candidates.findById(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const updated = db.candidates.updateOne(id, { approvalStatus: status });

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: `CANDIDATE_${status}`,
      entityType: 'CANDIDATE',
      entityId: id,
      details: { candidateName: candidate.name, status },
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: `Candidate approval set to ${status}`, candidate: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error updating candidate status' });
  }
}

export async function deleteCandidate(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const candidate = db.candidates.findById(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    db.candidates.deleteOne(id);

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'CANDIDATE_DELETED',
      entityType: 'CANDIDATE',
      entityId: id,
      details: { candidateName: candidate.name, position: candidate.position },
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: 'Candidate removed successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error deleting candidate' });
  }
}
