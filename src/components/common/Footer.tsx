import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Shield, CheckCircle, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-display font-extrabold text-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Vote className="w-4 h-4" />
              </div>
              <span>E-Vote Campus</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Voice. Your Vote. Your Campus. Digitalizing collegiate student elections with cryptographic ballot confidentiality and audit transparency.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Certified Election Integrity Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3 font-display">
              Electoral Portal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/elections" className="hover:text-white transition-colors">
                  Current & Scheduled Elections
                </Link>
              </li>
              <li>
                <Link to="/candidates" className="hover:text-white transition-colors">
                  Candidate Directory & Manifestos
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-white transition-colors">
                  Certified Election Results
                </Link>
              </li>
              <li>
                <Link to="/verify-receipt" className="hover:text-white transition-colors">
                  Anonymous Receipt Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3 font-display">
              Security & Privacy
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Zero-Knowledge Ballot Segregation
                </Link>
              </li>
              <li>
                <span className="text-slate-400">SHA-256 Receipt Inclusion Proof</span>
              </li>
              <li>
                <span className="text-slate-400">Campus Email Verification Protocol</span>
              </li>
              <li>
                <span className="text-slate-400">Tamper-Evident Administrative Audit Log</span>
              </li>
            </ul>
          </div>

          {/* Academic Capstone Notice */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <h4 className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5 font-display">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Final-Year CS Capstone Project</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed as an advanced full-stack MERN electronic voting prototype. Demonstrating atomic ACID transactions, role-based access control, and decoupled voter identity.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} E-Vote Campus. Central Student Union Election Commission.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-slate-400">v2.4.0-Academic</span>
            <span>·</span>
            <span>College Student Union</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
