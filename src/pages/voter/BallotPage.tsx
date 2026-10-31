import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { electionService, votingService } from '../../services/api';
import { Election, Candidate } from '../../types';
import {
  Vote,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Copy,
  Printer,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  User,
  ExternalLink,
} from 'lucide-react';

export const BallotPage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [election, setElection] = useState<(Election & { candidates: Candidate[]; stats: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Position index (0 to positions.length - 1), followed by Review step
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selections, setSelections] = useState<Record<string, string>>({}); // { [positionTitle]: candidateId }
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    receiptCode: string;
    votedAt: string;
    electionTitle: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!electionId) return;
    setLoading(true);
    electionService.getElectionById(electionId)
      .then((data) => {
        setElection(data);
        if (data.userVoted) {
          setError('You have already submitted your ballot for this election. One vote per student is strictly enforced.');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load ballot');
      })
      .finally(() => setLoading(false));
  }, [electionId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Decrypting ballot manifest and verifying eligibility...</p>
      </div>
    );
  }

  if (error && !submissionResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Ballot Unavailable
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {error}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/voter"
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            Return to Dashboard
          </Link>
          <Link
            to="/verify-receipt"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl"
          >
            Verify a Receipt Code
          </Link>
        </div>
      </div>
    );
  }

  if (!election) return null;

  const positions = election.positions;
  const isReviewStep = activeStep === positions.length;
  const currentPosition = positions[activeStep];
  const positionCandidates = currentPosition
    ? election.candidates.filter(
        (c) => c.position.toLowerCase() === currentPosition.title.toLowerCase()
      )
    : [];

  const handleSelectCandidate = (candidateId: string) => {
    setSelections((prev) => ({
      ...prev,
      [currentPosition.title]: candidateId,
    }));
  };

  const handleNext = () => {
    if (activeStep < positions.length) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmitBallot = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await votingService.castVote(election.id, selections);
      setSubmissionResult(res);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // canvas-confetti graceful fallback
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to submit ballot due to network or server error.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReceipt = () => {
    if (!submissionResult) return;
    navigator.clipboard.writeText(submissionResult.receiptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // SUCCESS / RECEIPT SCREEN
  if (submissionResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 shadow-xl space-y-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Ballot Successfully Cast!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Your votes for <strong>{submissionResult.electionTitle}</strong> have been recorded into the sealed anonymous ballot repository.
            </p>
          </div>

          {/* Receipt Code Box */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Official Cryptographic Receipt Code
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
              {submissionResult.receiptCode}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Recorded at: {new Date(submissionResult.votedAt).toLocaleString()}
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleCopyReceipt}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handlePrintReceipt}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>

          {/* Privacy Guarantee Notice */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-left flex items-start gap-3">
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <strong className="block font-bold">Confidentiality Guarantee:</strong>
              <p className="text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                Your student identity was updated to mark that you participated. Your candidate choices were stripped of all identifiers and assigned a SHA-256 hash of this receipt.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/voter"
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Back to Voter Dashboard
            </Link>
            <Link
              to={`/verify-receipt?code=${submissionResult.receiptCode}`}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs inline-flex items-center justify-center gap-1.5"
            >
              <span>Test Receipt Verification</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW & CONFIRMATION STEP
  if (isReviewStep) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Step {positions.length + 1} of {positions.length + 1}</span>
            <span>·</span>
            <span>Review & Final Submission</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Review Your Official Ballot
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please carefully inspect your selections below. Once submitted, ballots cannot be modified or recalled.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden shadow-xs">
          {positions.map((pos) => {
            const selectedCandId = selections[pos.title];
            const candidate = election.candidates.find((c) => c.id === selectedCandId);

            return (
              <div key={pos.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    {pos.title}
                  </span>
                  {candidate ? (
                    <div className="mt-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {candidate.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        ({candidate.department} · {candidate.symbol})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      No candidate selected (Abstain)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(positions.findIndex((p) => p.id === pos.id))}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                >
                  Change
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <strong className="block font-bold">Important Electoral Rule:</strong>
          <span>
            Submitting this ballot will permanently record your vote. You will immediately receive an anonymous cryptographic receipt. You cannot vote again in this election.
          </span>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Candidates</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitBallot}
            disabled={submitting || Object.keys(selections).length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            {submitting ? (
              <span>Submitting Encrypted Ballot...</span>
            ) : (
              <>
                <Vote className="w-4 h-4" />
                <span>Cast Official Ballot Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // POSITION VOTING STEP
  const isSelected = (candId: string) => selections[currentPosition.title] === candId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Step Tracker Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Position {activeStep + 1} of {positions.length}
            </span>
            <span>·</span>
            <span>{election.title}</span>
          </div>
          <span className="font-mono text-slate-400">
            {Object.keys(selections).length}/{positions.length} Selected
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${((activeStep + 1) / (positions.length + 1)) * 100}%` }}
          />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Select {currentPosition.title}
          </h1>
          {currentPosition.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {currentPosition.description}
            </p>
          )}
        </div>
      </div>

      {/* Candidates List for Current Position */}
      {positionCandidates.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
          No certified candidates registered for this position.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positionCandidates.map((cand) => {
            const selected = isSelected(cand.id);
            return (
              <div
                key={cand.id}
                onClick={() => handleSelectCandidate(cand.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                  selected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Photo */}
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  {cand.photo ? (
                    <img
                      src={cand.photo}
                      alt={cand.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400 m-auto mt-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate font-display">
                      {cand.name}
                    </h3>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        selected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {cand.department} · Sem {cand.semester}
                  </div>

                  {cand.symbol && (
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Symbol: {cand.symbol}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed pt-1">
                    {cand.manifesto}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeStep === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Position</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
        >
          <span>{activeStep === positions.length - 1 ? 'Proceed to Review' : 'Next Position'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
