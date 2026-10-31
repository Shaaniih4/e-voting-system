import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, electionService } from '../../services/api';
import { Election, AuditLog } from '../../types';
import { Eye, ShieldCheck, CheckCircle2, Lock, FileText, ExternalLink, Calendar } from 'lucide-react';

export const AuditorDashboard: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      electionService.getElections(),
      adminService.getAuditLogs(),
    ])
      .then(([elecs, logs]) => {
        setElections(elecs);
        setAuditLogs(logs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Independent Oversight Board</span>
            <span>·</span>
            <span>Auditor Console (Read-Only)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            Electoral Integrity & Audit Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify election configurations, audit log chronologies, and certified ballot tallies. Modifications are disabled for auditor accounts.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Independent Read-Only Role</span>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : (
        <>
          {/* Election Overview for Auditors */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Elections Registry & Certification Verification
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {elections.map((elec) => (
                <div key={elec.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {elec.title}
                      </span>
                      <span className="font-mono text-slate-400">
                        {elec.academicYear}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      Status: <strong className="text-slate-700 dark:text-slate-300">{elec.status}</strong> · {elec.positions.length} Positions Configured
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {elec.status === 'PUBLISHED' ? (
                      <Link
                        to={`/results?electionId=${elec.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Inspect Certified Tallies</span>
                      </Link>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        Tallies sealed until published
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs Stream */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Electoral Audit Log Stream
                </h2>
                <p className="text-xs text-slate-500">
                  Total logged events: <strong className="font-mono">{auditLogs.length}</strong>
                </p>
              </div>
              <Link
                to="/admin/audit-logs"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open Full Audit Screen
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">
                      {log.action}
                    </span>
                    <span className="text-slate-500">
                      by {log.actorEmail || 'System'} ({log.actorRole || 'SYSTEM'})
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
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
