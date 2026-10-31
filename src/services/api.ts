import axios from 'axios';
import {
  User,
  Election,
  Candidate,
  ElectionResultsData,
  BallotReceiptProof,
  AuditLog,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to attach session token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evote_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    department: string;
    semester: number;
    role?: 'VOTER' | 'CANDIDATE';
  }) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('evote_token', res.data.token);
      localStorage.setItem('evote_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('evote_token');
      localStorage.removeItem('evote_user');
    }
  },

  async getMe(): Promise<{ user: User }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async verifyEmail(code: string, email?: string) {
    const res = await api.post('/auth/verify-email', { code, email });
    return res.data;
  },

  async resendVerification(email: string) {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data: { email: string; code: string; newPassword: string }) {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
};

export const electionService = {
  async getElections(status?: string): Promise<Election[]> {
    const res = await api.get('/elections', { params: { status } });
    return res.data;
  },

  async getElectionById(id: string): Promise<Election & { candidates: Candidate[]; stats: any }> {
    const res = await api.get(`/elections/${id}`);
    return res.data;
  },

  async createElection(data: Partial<Election>): Promise<Election> {
    const res = await api.post('/elections', data);
    return res.data;
  },

  async updateElection(id: string, data: Partial<Election>): Promise<Election> {
    const res = await api.put(`/elections/${id}`, data);
    return res.data;
  },

  async updateStatus(id: string, status: string): Promise<{ message: string; election: Election }> {
    const res = await api.patch(`/elections/${id}/status`, { status });
    return res.data;
  },
};

export const candidateService = {
  async getCandidates(params?: { electionId?: string; position?: string; status?: string }): Promise<Candidate[]> {
    const res = await api.get('/candidates', { params });
    return res.data;
  },

  async getCandidateById(id: string): Promise<Candidate> {
    const res = await api.get(`/candidates/${id}`);
    return res.data;
  },

  async createCandidate(data: Partial<Candidate>): Promise<Candidate> {
    const res = await api.post('/candidates', data);
    return res.data;
  },

  async updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate> {
    const res = await api.put(`/candidates/${id}`, data);
    return res.data;
  },

  async updateApproval(id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING'): Promise<any> {
    const res = await api.patch(`/candidates/${id}/approval`, { status });
    return res.data;
  },

  async deleteCandidate(id: string): Promise<any> {
    const res = await api.delete(`/candidates/${id}`);
    return res.data;
  },
};

export const votingService = {
  async getVoterDashboard(): Promise<any> {
    const res = await api.get('/voter/dashboard');
    return res.data;
  },

  async getVoterHistory(): Promise<any[]> {
    const res = await api.get('/voter/history');
    return res.data;
  },

  async castVote(electionId: string, selections: Record<string, string>): Promise<{
    success: boolean;
    message: string;
    receiptCode: string;
    votedAt: string;
    electionTitle: string;
  }> {
    const res = await api.post('/votes/cast', { electionId, selections });
    return res.data;
  },

  async verifyReceipt(receiptCode: string): Promise<BallotReceiptProof> {
    const res = await api.get('/votes/verify-receipt', { params: { code: receiptCode } });
    return res.data;
  },
};

export const adminService = {
  async getDashboard(): Promise<any> {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getVoters(params?: { search?: string; department?: string; status?: string }): Promise<User[]> {
    const res = await api.get('/admin/voters', { params });
    return res.data;
  },

  async updateVoterStatus(userId: string, status: string): Promise<any> {
    const res = await api.patch(`/admin/voters/${userId}/status`, { status });
    return res.data;
  },

  async importCsv(electionId: string | undefined, csvContent: string): Promise<any> {
    const res = await api.post('/admin/eligibility/import', { electionId, csvContent });
    return res.data;
  },

  async getAuditLogs(params?: { action?: string; entityType?: string }): Promise<AuditLog[]> {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },
};

export const resultsService = {
  async getResults(electionId: string): Promise<ElectionResultsData> {
    const res = await api.get(`/results/${electionId}`);
    return res.data;
  },

  async publishResults(electionId: string): Promise<any> {
    const res = await api.post(`/results/${electionId}/publish`);
    return res.data;
  },
};

export const systemService = {
  async resetDemo(): Promise<any> {
    const res = await api.post('/system/reset-demo');
    return res.data;
  },
};

export default api;
