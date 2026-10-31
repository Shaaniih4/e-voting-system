import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { votingService } from '../../services/api';
import { BallotReceiptProof } from '../../types';
import { ShieldCheck, Search, CheckCircle2, AlertCircle, Lock, Hash, Calendar, Layers } from 'lucide-react';

export const ReceiptVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get('code') || '';

  const [receiptCode, setReceiptCode] = useState(urlCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BallotReceiptProof | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async (targetCode: string) => {
    if (!targetCode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await votingService.verifyReceipt(targetCode.trim());
      setResult(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Receipt code not found in certified ballot box. Please verify the code format.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlCode) {
      setReceiptCode(urlCode);
      runVerification(urlCode);
    }
  }, [urlCode]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    runVerification(receiptCode);
  };

  const handleFillDemo = (code: string) => {
    setReceiptCode(code);
    runVerification(code);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Independent Cryptographic Ballot Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Verify Vote Inclusion
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Verify that your anonymous ballot was securely recorded in the official ballot box without exposing your candidate selections.
        </p>
      </div>

      {/* Verification Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label
              htmlFor="receipt-code-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Enter Confidential Receipt Code
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="receipt-code-input"
                  type="text"
                  placeholder="e.g. EVC-2026-F41A-98BD"
                  value={receiptCode}
                  onChange={(e) => setReceiptCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-wider bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 dark:text-white uppercase"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !receiptCode.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Verify Receipt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1-Click Demo Helper */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Test with pre-seeded voter receipts:</span>
            <button
              type="button"
              onClick={() => handleFillDemo('EVC-2026-F41A-98BD')}
              className="font-mono text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded"
            >
              EVC-2026-F41A-98BD (John Doe)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('EVC-2026-B102-45DC')}
              className="font-mono text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded"
            >
              EVC-2026-B102-45DC (Alex Rivera)
            </button>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 dark:text-rose-300">
              <strong className="block font-bold mb-0.5">Verification Failed</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Proof Display */}
        {result && (
          <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100 font-display">
                  Ballot Receipt Authenticated
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {result.message}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-slate-500 block mb-0.5">Election</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {result.electionTitle}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-slate-500 block mb-0.5">Recorded Timestamp</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {new Date(result.recordedTimestamp).toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-slate-500 block mb-0.5">Ballot Positions Voted</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {result.ballotItemsRecorded} Positions Recorded
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-slate-500 block mb-0.5">Election Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {result.electionStatus}
                </span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash */}
            <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-1">
              <span className="text-slate-500 block font-medium">Certified SHA-256 Receipt Hash</span>
              <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                {result.cryptographicHashProof}
              </div>
            </div>

            {/* Privacy Assurance Note */}
            <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Confidentiality Assurance:</strong> In accordance with secret ballot principles, this receipt only confirms inclusion into the certified ballot pool. It cannot be used by anyone to reveal your individual candidate votes.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
