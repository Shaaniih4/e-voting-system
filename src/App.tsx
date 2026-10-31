/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Public pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ElectionsPage } from './pages/public/ElectionsPage';
import { CandidateDirectoryPage } from './pages/public/CandidateDirectoryPage';
import { PublishedResultsPage } from './pages/public/PublishedResultsPage';
import { ReceiptVerificationPage } from './pages/public/ReceiptVerificationPage';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/auth/ForgotPasswordPage';

// Voter pages
import { VoterDashboard } from './pages/voter/VoterDashboard';
import { BallotPage } from './pages/voter/BallotPage';
import { VoterHistoryPage } from './pages/voter/VoterHistoryPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ElectionManagementPage } from './pages/admin/ElectionManagementPage';
import { CandidateManagementPage } from './pages/admin/CandidateManagementPage';
import { StudentManagementPage } from './pages/admin/StudentManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

// Candidate & Auditor pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { AuditorDashboard } from './pages/auditor/AuditorDashboard';

// Route guard for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Website */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/elections" element={<ElectionsPage />} />
                <Route path="/candidates" element={<CandidateDirectoryPage />} />
                <Route path="/results" element={<PublishedResultsPage />} />
                <Route path="/verify-receipt" element={<ReceiptVerificationPage />} />

                {/* Authentication */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Voter Dashboard & Electronic Voting */}
                <Route
                  path="/voter"
                  element={
                    <ProtectedRoute allowedRoles={['VOTER', 'ADMIN', 'CANDIDATE', 'AUDITOR']}>
                      <VoterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/voter/ballot/:electionId"
                  element={
                    <ProtectedRoute allowedRoles={['VOTER', 'ADMIN', 'CANDIDATE', 'AUDITOR']}>
                      <BallotPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/voter/history"
                  element={
                    <ProtectedRoute allowedRoles={['VOTER', 'ADMIN', 'CANDIDATE', 'AUDITOR']}>
                      <VoterHistoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Console */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/elections"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <ElectionManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/candidates"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <CandidateManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <StudentManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'AUDITOR']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Candidate Portal */}
                <Route
                  path="/candidate"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                      <CandidateDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Auditor Portal */}
                <Route
                  path="/auditor"
                  element={
                    <ProtectedRoute allowedRoles={['AUDITOR', 'ADMIN']}>
                      <AuditorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
