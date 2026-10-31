import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateReceiptCode, sha256 } from '../utils/crypto';
import { Ballot } from '../models/types';

export const castVoteSchema = z.object({
  electionId: z.string().min(1),
  selections: z.record(z.string(), z.string()).refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'At least one position selection must be cast' }
  ),
});

export async function castVote(req: AuthenticatedRequest, res: Response) {
  try {
    const voter = req.user;
    if (!voter) {
      return res.status(401).json({ error: 'Authentication required to vote.' });
    }

    if (voter.accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Your student account is pending email verification or suspended. Only active students can cast ballots.',
      });
    }

    const { electionId, selections } = req.body as { electionId: string; selections: Record<string, string> };

    const election = db.elections.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (election.status !== 'ACTIVE') {
      return res.status(400).json({
        error: `Voting is not open for this election. Current status: ${election.status}. Only ACTIVE elections accept ballots.`,
      });
    }

    // Check time bounds
    const nowTime = Date.now();
    if (new Date(election.startTime).getTime() > nowTime) {
      return res.status(400).json({ error: 'This election has not started yet.' });
    }
    if (new Date(election.endTime).getTime() < nowTime) {
      return res.status(400).json({ error: 'This election has ended. Ballot submissions are closed.' });
    }

    // Check department eligibility
    if (election.eligibleDepartments && election.eligibleDepartments.length > 0) {
      if (!election.eligibleDepartments.includes(voter.department)) {
        return res.status(403).json({
          error: `Students from department '${voter.department}' are not eligible for this election.`,
        });
      }
    }

    // Check or find eligibility record
    let eligibility = db.voterEligibility.findOne(
      (v) => v.electionId === electionId && v.userId === voter.id
    );

    // If eligibility record doesn't exist yet, create it on demand if voter is an active student
    if (!eligibility) {
      eligibility = db.voterEligibility.insertOne({
        id: `elig-${electionId}-${voter.id}`,
        electionId,
        userId: voter.id,
        hasVoted: false,
        votedAt: null,
        createdAt: new Date().toISOString(),
      });
    }

    // Prevent duplicate submission on the server
    if (eligibility.hasVoted) {
      return res.status(409).json({
        error: 'Ballot already submitted. You have already cast your vote in this election. One vote per student is strictly enforced.',
      });
    }

    // Validate candidates selected exist and belong to the election and positions
    const candidateEntries: Array<{ position: string; candidateId: string }> = [];
    for (const [positionTitle, candidateId] of Object.entries(selections)) {
      const positionDef = election.positions.find(
        (p) => p.title.toLowerCase() === positionTitle.toLowerCase() || p.id === positionTitle
      );
      if (!positionDef) {
        return res.status(400).json({ error: `Invalid election position: ${positionTitle}` });
      }

      const candidate = db.candidates.findById(candidateId);
      if (!candidate || candidate.electionId !== election.id || candidate.approvalStatus !== 'APPROVED') {
        return res.status(400).json({ error: `Invalid or unapproved candidate selected for position ${positionTitle}` });
      }

      candidateEntries.push({ position: positionDef.title, candidateId });
    }

    // Generate cryptographic receipt code and its SHA-256 hash
    // The hash is saved on the anonymous ballot; the code is given ONLY to the voter.
    const { code: receiptCode, hash: receiptHash } = generateReceiptCode();
    const submissionTime = new Date().toISOString();

    // ATOMIC TRANSACTION:
    // Update voter eligibility status to hasVoted = true AND insert segregated anonymous ballots
    await db.withTransaction(async () => {
      // 1. Mark voter eligibility record as voted
      db.voterEligibility.updateOne(eligibility.id, {
        hasVoted: true,
        votedAt: submissionTime,
      });

      // 2. Insert anonymous ballots (CRITICAL: zero voterId or email stored in ballot!)
      const ballotsToInsert: Ballot[] = candidateEntries.map((entry, index) => ({
        id: `ballot-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        electionId: election.id,
        candidateId: entry.candidateId,
        position: entry.position,
        receiptHash,
        createdAt: submissionTime,
      }));

      db.ballots.insertMany(ballotsToInsert);

      // 3. Log audit event without revealing vote choices
      db.auditLogs.insertOne({
        id: `log-${Date.now()}`,
        actorId: voter.id,
        actorEmail: voter.email,
        actorRole: voter.role,
        action: 'BALLOT_CAST',
        entityType: 'VOTE',
        entityId: election.id,
        details: {
          electionTitle: election.title,
          receiptHashPrefix: receiptHash.substring(0, 8),
          positionsVotedCount: candidateEntries.length,
        },
        createdAt: submissionTime,
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Ballot successfully cast and recorded into the anonymous ballot box.',
      receiptCode,
      votedAt: submissionTime,
      electionTitle: election.title,
      disclaimer: 'This receipt code enables you to cryptographically verify inclusion in the certified ballot box without revealing candidate selection.',
    });
  } catch (err: any) {
    console.error('Vote casting error:', err);
    return res.status(500).json({ error: err.message || 'Failed to submit ballot due to server error' });
  }
}

export async function getVoterDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const voter = req.user!;
    const elections = db.elections.find();

    const activeList = [];
    const upcomingList = [];
    const completedList = [];

    for (const e of elections) {
      const elig = db.voterEligibility.findOne((v) => v.electionId === e.id && v.userId === voter.id);
      const userVoted = elig ? elig.hasVoted : false;
      const candidates = db.candidates.find((c) => c.electionId === e.id && c.approvalStatus === 'APPROVED');

      const card = {
        id: e.id,
        title: e.title,
        description: e.description,
        academicYear: e.academicYear,
        status: e.status,
        startTime: e.startTime,
        endTime: e.endTime,
        positionsCount: e.positions.length,
        candidateCount: candidates.length,
        userVoted,
        votedAt: elig?.votedAt || null,
        userEligible: voter.accountStatus === 'ACTIVE',
      };

      if (e.status === 'ACTIVE') activeList.push(card);
      else if (e.status === 'SCHEDULED' || e.status === 'DRAFT') upcomingList.push(card);
      else completedList.push(card);
    }

    const totalElections = elections.length;
    const votesCastCount = db.voterEligibility.countDocuments((v) => v.userId === voter.id && v.hasVoted);

    return res.json({
      user: {
        id: voter.id,
        name: voter.name,
        email: voter.email,
        studentId: voter.studentId,
        department: voter.department,
        semester: voter.semester,
        accountStatus: voter.accountStatus,
        emailVerifiedAt: voter.emailVerifiedAt,
      },
      stats: {
        totalElections,
        activeElectionsCount: activeList.length,
        votesCastCount,
      },
      elections: {
        active: activeList,
        upcoming: upcomingList,
        completed: completedList,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching voter dashboard' });
  }
}

export async function getVoterHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const voter = req.user!;
    const eligibilities = db.voterEligibility.find((v) => v.userId === voter.id && v.hasVoted);

    // Build participation history. DO NOT expose candidate choices!
    const history = eligibilities.map((elig) => {
      const election = db.elections.findById(elig.electionId);
      return {
        electionId: elig.electionId,
        electionTitle: election?.title || 'Unknown Election',
        academicYear: election?.academicYear || '2026',
        votedAt: elig.votedAt,
        status: election?.status || 'UNKNOWN',
        resultPublished: election?.status === 'PUBLISHED',
      };
    });

    return res.json(history);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching voting history' });
  }
}

export async function verifyReceipt(req: AuthenticatedRequest, res: Response) {
  try {
    const receiptCode = (req.query.code || req.params.code) as string;
    if (!receiptCode || typeof receiptCode !== 'string') {
      return res.status(400).json({ error: 'Receipt code required' });
    }

    const receiptHash = sha256(receiptCode.trim());
    const matchingBallots = db.ballots.find((b) => b.receiptHash === receiptHash);

    if (matchingBallots.length === 0) {
      return res.status(404).json({
        verified: false,
        message: 'No recorded ballots match this receipt code. Please check your code format (e.g. EVC-2026-XXXX-XXXX).',
      });
    }

    const election = db.elections.findById(matchingBallots[0].electionId);

    // Return verification proof WITHOUT revealing candidate choices
    return res.json({
      verified: true,
      message: 'Cryptographic receipt confirmed! Your ballot is safely recorded in the official ballot box.',
      receiptCode: receiptCode.trim(),
      electionTitle: election?.title || 'Unknown Election',
      electionStatus: election?.status || 'UNKNOWN',
      ballotItemsRecorded: matchingBallots.length,
      recordedTimestamp: matchingBallots[0].createdAt,
      cryptographicHashProof: receiptHash,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error verifying receipt' });
  }
}
