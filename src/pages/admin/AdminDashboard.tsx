import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import {
  Users,
  ShieldCheck,
  Vote,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  FileCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>Central Election Commission</span>
            <span>·</span>
            <span>Administrative Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            Electoral Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage election lifecycles, review student registrations, approve candidate slates, and publish certified tallies.
          </p>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/elections"
            className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            Manage Elections
          </Link>
          <Link
            to="/admin/candidates"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Candidates
          </Link>
          <Link
            to="/admin/students"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Students & CSV
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Registered Students</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {data?.metrics?.totalRegisteredStudents ?? 0}
              </div>
              <span className="text-[11px] text-slate-400 block">
                {data?.metrics?.verifiedStudents ?? 0} verified via email
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Active Elections</span>
                <Vote className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {data?.metrics?.activeElections ?? 0}
              </div>
              <span className="text-[11px] text-slate-400 block">
                {data?.metrics?.totalElections ?? 0} total elections in system
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Votes Cast</span>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
                {data?.metrics?.totalVotesCast ?? 0}
              </div>
              <span className="text-[11px] text-slate-400 block">Across all academic years</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Candidate Nominations</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {data?.metrics?.totalCandidates ?? 0}
              </div>
              <span className="text-[11px] text-slate-400 block">
                {data?.metrics?.pendingCandidates ?? 0} pending review
              </span>
            </div>
          </div>

          {/* Interactive Recharts Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Election Turnout Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Election Turnout Performance
                </h3>
                <p className="text-xs text-slate-500">
                  Total voters registered vs. verified ballots cast by election
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.charts?.electionTurnouts || []}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Bar dataKey="eligible" fill="#94A3B8" name="Eligible Voters" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="voted" fill="#2563EB" name="Votes Cast" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Participation Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Department Voter Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Breakdown of active enrolled students across academic branches
                </p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.charts?.departmentChartData || []}
                      dataKey="students"
                      nameKey="department"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${(name || '').split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(data?.charts?.departmentChartData || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Audit Trail Stream */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Recent Administrative Audit Activity
                </h3>
                <p className="text-xs text-slate-500">
                  Tamper-evident logs of administrative actions, nominations, and lifecycle events
                </p>
              </div>
              <Link
                to="/admin/audit-logs"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Full Audit Logs
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {(data?.recentActivity || []).map((log: any) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mr-2">
                      {log.action}
                    </span>
                    <span className="text-slate-500">
                      by {log.actorEmail || 'System'}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
