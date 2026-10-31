import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { votingService } from '../../services/api';
import { History, CheckCircle2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export const VoterHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    votingService.getVoterHistory()
      .then((data) => setHistory(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 rounded-md">
          <History className="w-3.5 h-3.5" />
          <span>Participation Ledger</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Your Voting History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
          Records of elections you have participated in. To safeguard voter secrecy, individual candidate choices are never stored with your student profile.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Voting History Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't cast any ballots yet. Head over to active elections to exercise your democratic right.
          </p>
          <div className="pt-2">
            <Link
              to="/elections"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              <span>Explore Active Elections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.electionId}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ballot Confirmed</span>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono text-slate-500">Year {item.academicYear}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  {item.electionTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Recorded at: {new Date(item.votedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/verify-receipt"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Verify Receipt Inclusion
                </Link>
                {item.resultPublished && (
                  <Link
                    to={`/results?electionId=${item.electionId}`}
                    className="px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    View Final Results
                  </Link>
                )}
              </div>
            </div>
          ))}

          {/* Privacy Notice Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Ballot Secrecy Architecture:</strong> While this history log demonstrates that you fulfilled your civic duty and participated, it stores zero information about candidate choices. Candidate tallies remain anonymous in the certified ballot box.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
