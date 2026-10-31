import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { AuditLog } from '../../types';
import { ShieldCheck, Search, Filter, Calendar, Clock, Terminal } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSearch, setActionSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    adminService.getAuditLogs({
      action: actionSearch || undefined,
      entityType: entityFilter !== 'ALL' ? entityFilter : undefined,
    })
      .then((data) => setLogs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [actionSearch, entityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 rounded-md mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tamper-Evident Electoral Audit Trail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Audit Logs & System Integrity
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chronological record of administrative events, candidate approvals, lifecycle status changes, and ballot casting proofs.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action name (e.g. BALLOT, ELECTION)..."
            value={actionSearch}
            onChange={(e) => setActionSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
          {['ALL', 'ELECTION', 'CANDIDATE', 'VOTE', 'USER', 'ELIGIBILITY'].map((ent) => (
            <button
              key={ent}
              onClick={() => setEntityFilter(ent)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                entityFilter === ent
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Actor</th>
                <th className="px-6 py-3.5">Entity Type</th>
                <th className="px-6 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                        <td className="px-6 py-4 font-mono text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.actorEmail || 'System Process'}
                          </div>
                          {log.actorRole && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Role: {log.actorRole}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                          {log.entityType}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/60">
                          <td colSpan={5} className="px-6 py-3">
                            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
