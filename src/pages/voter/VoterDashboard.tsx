import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { votingService } from '../../services/api';
import {
  Vote,
  CheckCircle,
  AlertTriangle,
  Clock,
  History,
  User,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const VoterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    votingService.getVoterDashboard()
      .then((data) => setDashboardData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>Student Voter Portal</span>
            <span>·</span>
            <span>ID: {user.studentId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Department of {user.department} · Semester {user.semester}
          </p>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center gap-3">
          {user.accountStatus === 'ACTIVE' ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Voter Account Active & Verified</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Pending Email Verification</span>
              <Link to="/verify-email" className="underline font-bold ml-1">
                Verify Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active Union Elections
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {dashboardData?.stats?.activeElectionsCount ?? 1}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Your Ballots Cast
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {dashboardData?.stats?.votesCastCount ?? 0}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Voting History & Receipts
          </span>
          <div>
            <Link
              to="/voter/history"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
            >
              <span>View Past Receipts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Elections Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Active Eligible Elections
          </h2>
          <Link
            to="/elections"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All Elections
          </Link>
        </div>

        {loading ? (
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ) : dashboardData?.elections?.active?.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
            No active elections currently in voting phase.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData?.elections?.active?.map((elec: any) => (
              <div
                key={elec.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 flex flex-col justify-between shadow-xs hover:border-blue-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ● Voting In Progress
                    </span>
                    <span className="font-mono text-slate-400">{elec.academicYear}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                    {elec.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {elec.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>{elec.positionsCount} Executive Positions</span>
                    <span>·</span>
                    <span>{elec.candidateCount} Candidates</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <Link
                    to={`/candidates?electionId=${elec.id}`}
                    className="flex-1 text-center py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    View Candidates
                  </Link>

                  {elec.userVoted ? (
                    <div className="flex-1 py-2 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Ballot Submitted</span>
                    </div>
                  ) : (
                    <Link
                      to={`/voter/ballot/${elec.id}`}
                      className="flex-1 text-center py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Vote className="w-4 h-4" />
                      <span>Open Ballot</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming & Completed Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Scheduled Upcoming Elections</span>
          </h3>
          <div className="space-y-3">
            {dashboardData?.elections?.upcoming?.length === 0 ? (
              <p className="text-xs text-slate-500">No scheduled elections at this time.</p>
            ) : (
              dashboardData?.elections?.upcoming?.map((elec: any) => (
                <div
                  key={elec.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white">
                    {elec.title}
                  </div>
                  <div className="text-slate-500">
                    Academic Year {elec.academicYear} · {elec.positionsCount} Positions
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>Completed & Published Results</span>
          </h3>
          <div className="space-y-3">
            {dashboardData?.elections?.completed?.map((elec: any) => (
              <div
                key={elec.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {elec.title}
                  </div>
                  <div className="text-slate-500">
                    {elec.academicYear} · Certified Results
                  </div>
                </div>
                <Link
                  to={`/results?electionId=${elec.id}`}
                  className="px-3 py-1.5 font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  View Tallies
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
