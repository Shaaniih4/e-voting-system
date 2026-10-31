export type UserRole = 'ADMIN' | 'VOTER' | 'CANDIDATE' | 'AUDITOR';
export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
export type ElectionStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'CLOSED' | 'PUBLISHED';
export type CandidateApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  studentId: string;
  department: string;
  semester: number;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ElectionPosition {
  id: string;
  title: string;
  maxSelections: number;
  description?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  academicYear: string;
  positions: ElectionPosition[];
  startTime: string;
  endTime: string;
  status: ElectionStatus;
  createdBy: string;
  eligibleDepartments?: string[]; // empty means all departments
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  electionId: string;
  userId: string;
  name: string;
  photo: string;
  department: string;
  semester: number;
  studentId: string;
  position: string; // matches position title or id
  manifesto: string;
  symbol: string;
  approvalStatus: CandidateApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VoterEligibility {
  id: string;
  electionId: string;
  userId: string;
  hasVoted: boolean;
  votedAt: string | null;
  createdAt: string;
}

// NOTE: Separated anonymous ballot. Voter ID is NOT stored here to respect ballot secrecy.
export interface Ballot {
  id: string;
  electionId: string;
  candidateId: string;
  position: string;
  receiptHash: string; // SHA-256 hash of secret receipt given to voter
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: 'ELECTION' | 'CANDIDATE' | 'USER' | 'VOTE' | 'SYSTEM' | 'ELIGIBILITY';
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface EmailVerificationToken {
  id: string;
  userId: string;
  tokenHash: string;
  code: string; // human-friendly 6-digit code for testing/development
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  code: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}
