export type UserRole = 'ADMIN' | 'VOTER' | 'CANDIDATE' | 'AUDITOR';
export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
export type ElectionStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'CLOSED' | 'PUBLISHED';
export type CandidateApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
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
  eligibleDepartments?: string[];
  publishedAt?: string | null;
  candidateCount?: number;
  userVoted?: boolean;
  userEligible?: boolean;
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
  position: string;
  manifesto: string;
  symbol: string;
  approvalStatus: CandidateApprovalStatus;
  createdAt: string;
  updatedAt: string;
  electionTitle?: string;
}

export interface BallotReceiptProof {
  verified: boolean;
  message: string;
  receiptCode: string;
  electionTitle: string;
  electionStatus: string;
  ballotItemsRecorded: number;
  recordedTimestamp: string;
  cryptographicHashProof: string;
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  department: string;
  photo: string;
  symbol: string;
  votes: number;
  percentage: number;
}

export interface PositionResult {
  positionId: string;
  positionTitle: string;
  description?: string;
  totalVotes: number;
  candidates: CandidateResult[];
  winner: CandidateResult | null;
}

export interface ElectionResultsData {
  election: {
    id: string;
    title: string;
    description: string;
    academicYear: string;
    status: ElectionStatus;
    startTime: string;
    endTime: string;
    publishedAt: string | null;
  };
  stats: {
    totalEligibleVoters: number;
    totalVotesCast: number;
    totalBallotItems: number;
    turnoutPercentage: number;
  };
  positionResults: PositionResult[];
  departmentTurnout: Array<{ department: string; votes: number }>;
  certifiedBy: string;
  certificationDate: string;
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
