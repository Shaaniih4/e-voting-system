import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Vote, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Award, Eye } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'CANDIDATE') navigate('/candidate');
      else if (user.role === 'AUDITOR') navigate('/auditor');
      else navigate('/voter');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid college email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'ADMIN' | 'VOTER' | 'VOTED' | 'CANDIDATE' | 'AUDITOR') => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginAsDemo(role);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'CANDIDATE') navigate('/candidate');
      else if (user.role === 'AUDITOR') navigate('/auditor');
      else navigate('/voter');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-600/30">
            <Vote className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Sign In to E-Vote Campus
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use your verified institutional credentials to access your ballot
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Fill Selector */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1.5 transition-colors text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Admin (Dr. Sterling)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('VOTER')}
                className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5 transition-colors text-left"
              >
                <Vote className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Voter (Alex Rivera)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CANDIDATE')}
                className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1.5 transition-colors text-left"
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Candidate (Elena)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('AUDITOR')}
                className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors text-left"
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Auditor (Janet)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          New student?{' '}
          <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Register your college email
          </Link>
        </div>
      </div>
    </div>
  );
};
