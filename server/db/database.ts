import fs from 'fs';
import path from 'path';
import {
  User,
  Election,
  Candidate,
  VoterEligibility,
  Ballot,
  AuditLog,
  EmailVerificationToken,
  PasswordResetToken,
  Session
} from '../models/types';

export interface DatabaseSchema {
  users: User[];
  elections: Election[];
  candidates: Candidate[];
  voterEligibility: VoterEligibility[];
  ballots: Ballot[];
  auditLogs: AuditLog[];
  emailTokens: EmailVerificationToken[];
  passwordResetTokens: PasswordResetToken[];
  sessions: Session[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'evote_database.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    elections: [],
    candidates: [],
    voterEligibility: [],
    ballots: [],
    auditLogs: [],
    emailTokens: [],
    passwordResetTokens: [],
    sessions: [],
  };

  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        if (fileContent.trim()) {
          this.data = JSON.parse(fileContent);
        }
      }
      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize database file:', err);
      this.isInitialized = true;
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Atomically execute a callback with rollback support (MongoDB ACID transaction simulation)
  public async withTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const backupSnapshot = JSON.stringify(this.data);
    try {
      const result = await operation();
      this.save();
      return result;
    } catch (err) {
      // Rollback memory state on error
      this.data = JSON.parse(backupSnapshot);
      throw err;
    }
  }

  // Collection: Users
  public users = {
    find: (predicate?: (u: User) => boolean): User[] => {
      return predicate ? this.data.users.filter(predicate) : [...this.data.users];
    },
    findOne: (predicate: (u: User) => boolean): User | null => {
      return this.data.users.find(predicate) || null;
    },
    findById: (id: string): User | null => {
      return this.data.users.find((u) => u.id === id) || null;
    },
    insertOne: (user: User): User => {
      if (this.data.users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
        throw new Error('User with this email already exists');
      }
      if (user.studentId && this.data.users.some((u) => u.studentId === user.studentId)) {
        throw new Error('User with this student ID already exists');
      }
      this.data.users.push(user);
      this.save();
      return user;
    },
    updateOne: (id: string, updates: Partial<User>): User | null => {
      const index = this.data.users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      this.data.users[index] = {
        ...this.data.users[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.data.users[index];
    },
    countDocuments: (predicate?: (u: User) => boolean): number => {
      return predicate ? this.data.users.filter(predicate).length : this.data.users.length;
    },
  };

  // Collection: Elections
  public elections = {
    find: (predicate?: (e: Election) => boolean): Election[] => {
      return predicate ? this.data.elections.filter(predicate) : [...this.data.elections];
    },
    findOne: (predicate: (e: Election) => boolean): Election | null => {
      return this.data.elections.find(predicate) || null;
    },
    findById: (id: string): Election | null => {
      return this.data.elections.find((e) => e.id === id) || null;
    },
    insertOne: (election: Election): Election => {
      this.data.elections.push(election);
      this.save();
      return election;
    },
    updateOne: (id: string, updates: Partial<Election>): Election | null => {
      const index = this.data.elections.findIndex((e) => e.id === id);
      if (index === -1) return null;
      this.data.elections[index] = {
        ...this.data.elections[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.data.elections[index];
    },
    deleteOne: (id: string): boolean => {
      const initialLen = this.data.elections.length;
      this.data.elections = this.data.elections.filter((e) => e.id !== id);
      const changed = this.data.elections.length !== initialLen;
      if (changed) this.save();
      return changed;
    },
    countDocuments: (predicate?: (e: Election) => boolean): number => {
      return predicate ? this.data.elections.filter(predicate).length : this.data.elections.length;
    },
  };

  // Collection: Candidates
  public candidates = {
    find: (predicate?: (c: Candidate) => boolean): Candidate[] => {
      return predicate ? this.data.candidates.filter(predicate) : [...this.data.candidates];
    },
    findOne: (predicate: (c: Candidate) => boolean): Candidate | null => {
      return this.data.candidates.find(predicate) || null;
    },
    findById: (id: string): Candidate | null => {
      return this.data.candidates.find((c) => c.id === id) || null;
    },
    insertOne: (candidate: Candidate): Candidate => {
      this.data.candidates.push(candidate);
      this.save();
      return candidate;
    },
    updateOne: (id: string, updates: Partial<Candidate>): Candidate | null => {
      const index = this.data.candidates.findIndex((c) => c.id === id);
      if (index === -1) return null;
      this.data.candidates[index] = {
        ...this.data.candidates[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.data.candidates[index];
    },
    deleteOne: (id: string): boolean => {
      const initialLen = this.data.candidates.length;
      this.data.candidates = this.data.candidates.filter((c) => c.id !== id);
      const changed = this.data.candidates.length !== initialLen;
      if (changed) this.save();
      return changed;
    },
    countDocuments: (predicate?: (c: Candidate) => boolean): number => {
      return predicate ? this.data.candidates.filter(predicate).length : this.data.candidates.length;
    },
  };

  // Collection: VoterEligibility (Compound Unique Index: electionId + userId)
  public voterEligibility = {
    find: (predicate?: (v: VoterEligibility) => boolean): VoterEligibility[] => {
      return predicate ? this.data.voterEligibility.filter(predicate) : [...this.data.voterEligibility];
    },
    findOne: (predicate: (v: VoterEligibility) => boolean): VoterEligibility | null => {
      return this.data.voterEligibility.find(predicate) || null;
    },
    insertOne: (eligibility: VoterEligibility): VoterEligibility => {
      const exists = this.data.voterEligibility.some(
        (v) => v.electionId === eligibility.electionId && v.userId === eligibility.userId
      );
      if (exists) {
        throw new Error('Voter eligibility record already exists for this user and election');
      }
      this.data.voterEligibility.push(eligibility);
      this.save();
      return eligibility;
    },
    insertMany: (records: VoterEligibility[]): number => {
      let count = 0;
      for (const rec of records) {
        const exists = this.data.voterEligibility.some(
          (v) => v.electionId === rec.electionId && v.userId === rec.userId
        );
        if (!exists) {
          this.data.voterEligibility.push(rec);
          count++;
        }
      }
      if (count > 0) this.save();
      return count;
    },
    updateOne: (id: string, updates: Partial<VoterEligibility>): VoterEligibility | null => {
      const index = this.data.voterEligibility.findIndex((v) => v.id === id);
      if (index === -1) return null;
      this.data.voterEligibility[index] = {
        ...this.data.voterEligibility[index],
        ...updates,
      };
      this.save();
      return this.data.voterEligibility[index];
    },
    countDocuments: (predicate?: (v: VoterEligibility) => boolean): number => {
      return predicate ? this.data.voterEligibility.filter(predicate).length : this.data.voterEligibility.length;
    },
  };

  // Collection: Ballots (Anonymous, segregated from voter identity)
  public ballots = {
    find: (predicate?: (b: Ballot) => boolean): Ballot[] => {
      return predicate ? this.data.ballots.filter(predicate) : [...this.data.ballots];
    },
    findOne: (predicate: (b: Ballot) => boolean): Ballot | null => {
      return this.data.ballots.find(predicate) || null;
    },
    findById: (id: string): Ballot | null => {
      return this.data.ballots.find((b) => b.id === id) || null;
    },
    insertOne: (ballot: Ballot): Ballot => {
      this.data.ballots.push(ballot);
      this.save();
      return ballot;
    },
    insertMany: (ballots: Ballot[]): Ballot[] => {
      this.data.ballots.push(...ballots);
      this.save();
      return ballots;
    },
    countDocuments: (predicate?: (b: Ballot) => boolean): number => {
      return predicate ? this.data.ballots.filter(predicate).length : this.data.ballots.length;
    },
  };

  // Collection: AuditLog
  public auditLogs = {
    find: (predicate?: (a: AuditLog) => boolean): AuditLog[] => {
      const list = predicate ? this.data.auditLogs.filter(predicate) : [...this.data.auditLogs];
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    insertOne: (log: AuditLog): AuditLog => {
      this.data.auditLogs.push(log);
      this.save();
      return log;
    },
  };

  // Collection: Email Tokens
  public emailTokens = {
    findOne: (predicate: (t: EmailVerificationToken) => boolean): EmailVerificationToken | null => {
      return this.data.emailTokens.find(predicate) || null;
    },
    insertOne: (token: EmailVerificationToken): EmailVerificationToken => {
      this.data.emailTokens.push(token);
      this.save();
      return token;
    },
    updateOne: (id: string, updates: Partial<EmailVerificationToken>): EmailVerificationToken | null => {
      const index = this.data.emailTokens.findIndex((t) => t.id === id);
      if (index === -1) return null;
      this.data.emailTokens[index] = {
        ...this.data.emailTokens[index],
        ...updates,
      };
      this.save();
      return this.data.emailTokens[index];
    },
  };

  // Collection: Password Reset Tokens
  public passwordResetTokens = {
    findOne: (predicate: (t: PasswordResetToken) => boolean): PasswordResetToken | null => {
      return this.data.passwordResetTokens.find(predicate) || null;
    },
    insertOne: (token: PasswordResetToken): PasswordResetToken => {
      this.data.passwordResetTokens.push(token);
      this.save();
      return token;
    },
    updateOne: (id: string, updates: Partial<PasswordResetToken>): PasswordResetToken | null => {
      const index = this.data.passwordResetTokens.findIndex((t) => t.id === id);
      if (index === -1) return null;
      this.data.passwordResetTokens[index] = {
        ...this.data.passwordResetTokens[index],
        ...updates,
      };
      this.save();
      return this.data.passwordResetTokens[index];
    },
  };

  // Collection: Sessions
  public sessions = {
    findOne: (predicate: (s: Session) => boolean): Session | null => {
      return this.data.sessions.find(predicate) || null;
    },
    insertOne: (session: Session): Session => {
      this.data.sessions.push(session);
      this.save();
      return session;
    },
    deleteOne: (token: string): boolean => {
      const len = this.data.sessions.length;
      this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
      const changed = this.data.sessions.length !== len;
      if (changed) this.save();
      return changed;
    },
  };

  // Reset or reseed
  public clearAll() {
    this.data = {
      users: [],
      elections: [],
      candidates: [],
      voterEligibility: [],
      ballots: [],
      auditLogs: [],
      emailTokens: [],
      passwordResetTokens: [],
      sessions: [],
    };
    this.save();
  }

  public getDataRaw(): DatabaseSchema {
    return this.data;
  }
}

export const db = new Database();
