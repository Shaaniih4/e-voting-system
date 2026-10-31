import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../controllers/authController';
import {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  updateElectionStatus,
  createElectionSchema,
  updateElectionSchema,
  updateStatusSchema,
} from '../controllers/electionController';
import {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  updateCandidateApproval,
  deleteCandidate,
  createCandidateSchema,
  updateCandidateSchema,
} from '../controllers/candidateController';
import {
  castVote,
  getVoterDashboard,
  getVoterHistory,
  verifyReceipt,
  castVoteSchema,
} from '../controllers/voteController';
import {
  getAdminDashboard,
  getVoters,
  updateVoterStatus,
  importEligibilityCsv,
  getAuditLogs,
  updateVoterStatusSchema,
  importCsvSchema,
} from '../controllers/adminController';
import {
  getElectionResults,
  publishResults,
} from '../controllers/resultController';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { seedDatabase } from '../db/seed';

const router = Router();

// ================= AUTHENTICATION =================
router.post('/auth/register', validateBody(registerSchema), register);
router.post('/auth/verify-email', validateBody(verifyEmailSchema), verifyEmail);
router.post('/auth/resend-verification', resendVerification);
router.post('/auth/login', validateBody(loginSchema), login);
router.post('/auth/logout', requireAuth, logout);
router.get('/auth/me', requireAuth, getMe);
router.post('/auth/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/auth/reset-password', validateBody(resetPasswordSchema), resetPassword);

// ================= ELECTIONS =================
router.get('/elections', optionalAuth, getElections);
router.get('/elections/:id', optionalAuth, getElectionById);
router.post('/elections', requireAuth, requireRole('ADMIN'), validateBody(createElectionSchema), createElection);
router.put('/elections/:id', requireAuth, requireRole('ADMIN'), validateBody(updateElectionSchema), updateElection);
router.patch('/elections/:id/status', requireAuth, requireRole('ADMIN'), validateBody(updateStatusSchema), updateElectionStatus);

// ================= CANDIDATES =================
router.get('/candidates', optionalAuth, getCandidates);
router.get('/candidates/:id', optionalAuth, getCandidateById);
router.post('/candidates', requireAuth, requireRole('ADMIN', 'CANDIDATE'), validateBody(createCandidateSchema), createCandidate);
router.put('/candidates/:id', requireAuth, validateBody(updateCandidateSchema), updateCandidate);
router.patch('/candidates/:id/approval', requireAuth, requireRole('ADMIN'), updateCandidateApproval);
router.delete('/candidates/:id', requireAuth, requireRole('ADMIN'), deleteCandidate);

// ================= VOTING & VOTER DASHBOARD =================
router.get('/voter/dashboard', requireAuth, getVoterDashboard);
router.get('/voter/elections', optionalAuth, getElections);
router.get('/voter/history', requireAuth, getVoterHistory);
router.post('/votes/cast', requireAuth, validateBody(castVoteSchema), castVote);
router.get('/votes/verify-receipt', verifyReceipt);
router.get('/votes/verify-receipt/:code', verifyReceipt);

// ================= ADMIN & AUDITING =================
router.get('/admin/dashboard', requireAuth, requireRole('ADMIN'), getAdminDashboard);
router.get('/admin/voters', requireAuth, requireRole('ADMIN'), getVoters);
router.patch('/admin/voters/:id/status', requireAuth, requireRole('ADMIN'), validateBody(updateVoterStatusSchema), updateVoterStatus);
router.post('/admin/eligibility/import', requireAuth, requireRole('ADMIN'), validateBody(importCsvSchema), importEligibilityCsv);
router.get('/admin/audit-logs', requireAuth, requireRole('ADMIN', 'AUDITOR'), getAuditLogs);

// ================= RESULTS =================
router.get('/results/:electionId', optionalAuth, getElectionResults);
router.post('/results/:electionId/publish', requireAuth, requireRole('ADMIN'), publishResults);

// ================= SYSTEM / DEMO =================
router.post('/system/reset-demo', async (req, res) => {
  await seedDatabase(true);
  res.json({ message: 'Demo database refreshed successfully' });
});

export default router;
