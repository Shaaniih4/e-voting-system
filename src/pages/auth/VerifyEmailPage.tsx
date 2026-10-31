import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { CheckCircle2, MailCheck, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const emailParam = searchParams.get('email') || '';
  const initialCode = (location.state as any)?.demoCode || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(code.trim(), email.trim() || undefined);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Please provide your college email address');
      return;
    }
    setResending(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await authService.resendVerification(email.trim());
      setInfoMessage(`New verification code generated: ${res.demoVerificationCode}`);
      setCode(res.demoVerificationCode);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-600 text-white items-center justify-center shadow-lg shadow-emerald-600/30">
            <MailCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Verify College Email
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Confirm your student address to activate voting credentials
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Email Verified Successfully!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Your student voter account is now fully active. You may now log in and access official ballots.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {infoMessage && (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
                  {infoMessage}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    College Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-3.5 py-2.5 text-center text-lg font-mono tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 dark:text-white"
                  />
                </div>

                {/* Developer Demo Helper */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Pre-seeded freshman code:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('freshman@campus.edu');
                      setCode('123456');
                    }}
                    className="font-mono text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    freshman@campus.edu (123456)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  {loading ? <span>Verifying...</span> : <span>Confirm & Activate Account</span>}
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Didn't receive a code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
