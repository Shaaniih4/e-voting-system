import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Vote, Award, Eye, X } from 'lucide-react';

interface DemoSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DemoSwitcherModal: React.FC<DemoSwitcherProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAsDemo, user } = useAuth();
  const [loadingRole, setLoadingRole] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitch = async (role: 'ADMIN' | 'VOTER' | 'VOTED' | 'CANDIDATE' | 'AUDITOR') => {
    try {
      setLoadingRole(role);
      await loginAsDemo(role);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Demo switch error', err);
    } finally {
      setLoadingRole(null);
    }
  };

  const accounts = [
    {
      role: 'ADMIN' as const,
      name: 'Dr. Arthur Sterling',
      title: 'Dean / Chief Election Commissioner',
      email: 'admin@campus.edu',
      desc: 'Full control over elections, candidate approvals, student directory, CSV import, and publishing final tallies.',
      icon: ShieldCheck,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
      role: 'VOTER' as const,
      name: 'Alex Rivera',
      title: 'Eligible Student Voter (Ready to vote)',
      email: 'student@campus.edu',
      desc: 'Active, verified student ready to open the ballot, vote for 4 positions, and obtain an anonymous receipt.',
      icon: Vote,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      role: 'VOTED' as const,
      name: 'John Doe',
      title: 'Student Voter (Already Voted)',
      email: 'john.doe@campus.edu',
      desc: 'Already submitted ballot. Demonstrates duplicate vote prevention and receipt lookup.',
      icon: UserCheck,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      role: 'CANDIDATE' as const,
      name: 'Elena Vance',
      title: 'Presidential Candidate (CSE)',
      email: 'elena.vance@campus.edu',
      desc: 'Student running for President. Can manage campaign manifesto, campaign symbol, and view candidate dashboard.',
      icon: Award,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400',
    },
    {
      role: 'AUDITOR' as const,
      name: 'Prof. Janet O’Connor',
      title: 'Ethics & Electoral Auditor',
      email: 'auditor@campus.edu',
      desc: 'Independent election auditor with read-only access to tamper-evident audit logs and certified ballot counts.',
      icon: Eye,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              1-Click Demo Role Switcher
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instantly switch test roles to evaluate end-to-end workflows
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close demo switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {accounts.map((acc) => {
            const Icon = acc.icon;
            const isCurrent = user?.email.toLowerCase() === acc.email.toLowerCase();
            const isLoading = loadingRole === acc.role;

            return (
              <button
                key={acc.email}
                onClick={() => handleSwitch(acc.role)}
                disabled={isLoading}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-4 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${acc.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {acc.name}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Active Now
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {acc.title} · <span className="font-mono text-slate-500">{acc.email}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {acc.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Password for all demo accounts is pre-configured</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
