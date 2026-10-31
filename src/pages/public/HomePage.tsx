import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { electionService } from '../../services/api';
import { Election } from '../../types';
import {
  Vote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck,
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
  Calendar,
  Building,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    electionService.getElections()
      .then((data) => setElections(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeElection = elections.find((e) => e.status === 'ACTIVE') || elections[0];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-slate-900 to-[#142B48] text-white">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/hero_campus_election_1793428639169.jpg"
            alt="University Campus Student Union Election"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#142B48] via-[#142B48]/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/60 rounded-lg backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Student Union Election Portal 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.1] text-balance">
              Your Voice. Your Vote. <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-300">
                Your Campus.
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              Experience a smarter, more transparent and accessible way to participate in college elections. Digitized with cryptographic ballot privacy, college email verification, and instant receipt tracking.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  to={user.role === 'ADMIN' ? '/admin' : '/voter'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] whitespace-nowrap"
                >
                  <Vote className="w-4 h-4" />
                  <span>Go to {user.role === 'ADMIN' ? 'Admin Console' : 'Voting Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] whitespace-nowrap"
                  >
                    <Vote className="w-4 h-4" />
                    <span>Cast Your Vote</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Register as Student
                  </Link>
                </>
              )}
              <Link
                to="/verify-receipt"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/40 rounded-xl transition-colors whitespace-nowrap"
              >
                <FileCheck className="w-4 h-4" />
                <span>Verify Receipt Code</span>
              </Link>
            </div>

            {/* Quick Proof Strip */}
            <div className="pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
              <div>
                <span className="block font-bold text-lg text-white font-mono tabular-nums">4,800+</span>
                <span className="text-slate-400">Eligible Students</span>
              </div>
              <div>
                <span className="block font-bold text-lg text-emerald-400 font-mono tabular-nums">100%</span>
                <span className="text-slate-400">Anonymous Ballots</span>
              </div>
              <div>
                <span className="block font-bold text-lg text-blue-400 font-mono tabular-nums">SHA-256</span>
                <span className="text-slate-400">Receipt Inclusion</span>
              </div>
              <div>
                <span className="block font-bold text-lg text-white font-mono tabular-nums">Zero</span>
                <span className="text-slate-400">Paper Waste</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Election Banner */}
      {activeElection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                <span>Active Union Election</span>
                <span className="text-slate-400">·</span>
                <span>Academic Year {activeElection.academicYear}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                {activeElection.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl line-clamp-2">
                {activeElection.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>{activeElection.positions.length} Executive Positions</span>
                <span>·</span>
                <span>{activeElection.candidateCount || 4} Certified Candidates</span>
                <span>·</span>
                <span>Closes in 3 Days</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <Link
                to={`/candidates?electionId=${activeElection.id}`}
                className="w-full sm:w-auto text-center px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
              >
                View Candidates
              </Link>
              <Link
                to={user ? `/voter/ballot/${activeElection.id}` : '/login'}
                className="w-full sm:w-auto text-center px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all"
              >
                Vote Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-display">
            Step-by-Step Process
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            How E-Vote Campus Works
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A trusted, 4-step workflow engineered to maximize student turnout while guaranteeing complete secret-ballot privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Student Registration',
              desc: 'Register using your official college email address. The system validates your matriculation ID and department credentials.',
              icon: Building,
            },
            {
              step: '02',
              title: 'Email Verification',
              desc: 'Receive an expiring, single-use verification token to authenticate your student status before voter eligibility is unlocked.',
              icon: Lock,
            },
            {
              step: '03',
              title: 'Confidential Ballot',
              desc: 'Cast one vote per position. Your ballot is completely severed from your student identity into an anonymous encrypted pool.',
              icon: Vote,
            },
            {
              step: '04',
              title: 'Receipt Verification',
              desc: 'Obtain a unique cryptographic receipt code (e.g. EVC-XXXX). Verify that your ballot was counted without revealing choices.',
              icon: FileCheck,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hover:border-blue-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xl font-extrabold text-slate-300 dark:text-slate-600">
                    {item.step}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security & Privacy Pillars */}
      <section className="bg-slate-100 dark:bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-display">
              Cryptographic Safeguards
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Built on High-Integrity Security Principles
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Designed to satisfy the stringent requirements of modern collegiate democratic representation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Segregated Anonymous Ballots
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ballot documents store zero voter identifiers (no student ID, user ID, email, or session tokens). Only a SHA-256 hash of your confidential receipt is associated with the ballot.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Atomic Vote Transactions
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ACID database transactions guarantee that marking a voter as having voted and committing the anonymous ballot occur atomically. Duplicate attempts are rejected immediately.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Sealed Tallying Until Publication
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Candidate vote counts remain strictly sealed during active voting to prevent bandwagon effects or voter coercion. Tallies are certified and published only after election close.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#142B48] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display">
              Ready to Shape the Future of Your Campus?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Log in with your college credentials to participate in active union ballots, review candidate platforms, and inspect certified results.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/elections"
              className="w-full sm:w-auto text-center px-5 py-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Browse All Elections
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-center px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-colors"
            >
              Log In to Vote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
