import React from 'react';
import { Shield, Database, Lock, Cpu, CheckCircle, FileText, Users, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 rounded-md">
          <span>Final-Year Computer Science Capstone Project</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
          About E-Vote Campus
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          E-Vote Campus is a full-stack Electronic Voting System designed to replace traditional paper-based student elections with a provably fair, transparent, and user-friendly digital voting platform.
        </p>
      </div>

      {/* Technology Stack Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Full-Stack MERN Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Frontend Layer</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Built with React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, and Recharts for dynamic visual turnout statistics. Fully responsive and accessibility-compliant across desktop and mobile.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <Database className="w-4 h-4" />
              <span>Backend & Database Layer</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Node.js and Express.js REST API with Mongoose-compatible schema architectures, Zod request body validation, bcrypt password hashing, and ACID transactional guarantees during ballot submission.
            </p>
          </div>
        </div>
      </section>

      {/* The 4 User Roles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Role-Based Access Control (RBAC)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">1. Admin</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Manages election lifecycles, imports student rosters via CSV, approves candidates, and certifies final results.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">2. Voter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Registers with college email, reviews candidate manifestos, casts an anonymous ballot, and tracks their secret receipt.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">3. Candidate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Submits nomination profiles, uploads photographs, authors campaign manifestos, and designates campaign symbols.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">4. Auditor</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Read-only supervisor verifying audit log sequences, election configuration rules, and total ballot integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Anonymity & Receipt Protocol */}
      <section className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-lg font-display">
          <Lock className="w-5 h-5" />
          <span>The Ballot Confidentiality & Verification Protocol</span>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            A foundational pillar of democratic election theory is the <strong>Secret Ballot</strong>. In E-Vote Campus, we implement a strict two-table segregated architecture:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">VoterEligibility Collection</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contains <code className="font-mono text-blue-600">userId</code>, <code className="font-mono text-blue-600">electionId</code>, and <code className="font-mono text-blue-600">hasVoted: true</code>. Never stores which candidate was picked.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Ballot Collection</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contains <code className="font-mono text-emerald-600">candidateId</code>, <code className="font-mono text-emerald-600">position</code>, and <code className="font-mono text-emerald-600">receiptHash</code> (SHA-256). Contains zero student identity data.
              </p>
            </div>
          </div>
          <p>
            When a student casts a ballot, the server generates a private receipt string (e.g., <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">EVC-2026-XXXX-XXXX</code>). Only the SHA-256 hash is saved alongside the ballot. The raw receipt code is provided solely to the voter on their screen. Later, the student can input this receipt into the public verification engine to prove their ballot was cast into the box without disclosing their vote.
          </p>
        </div>
      </section>

      {/* Academic Disclaimer */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
        <span className="font-bold block">Academic Demonstration Disclaimer:</span>
        <p>
          This application was engineered for academic research, collegiate union elections, and computer science capstone evaluation. It demonstrates practical implementations of secure session cookies, tokenized email verification, role enforcement, and separated anonymous ballot records.
        </p>
      </div>
    </div>
  );
};
