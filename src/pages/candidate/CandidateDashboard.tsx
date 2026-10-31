import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { candidateService, electionService } from '../../services/api';
import { Candidate, Election } from '../../types';
import { Award, CheckCircle, Clock, XCircle, Save, User, Building, BookOpen } from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState<Candidate | null>(null);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [manifesto, setManifesto] = useState('');
  const [symbol, setSymbol] = useState('');
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    if (!user) return;
    candidateService.getCandidates()
      .then((cands) => {
        // Find profile belonging to logged in user or matching email/name
        const myProfile = cands.find((c) => c.userId === user.id || c.name.toLowerCase() === user.name.toLowerCase()) || cands[0];
        if (myProfile) {
          setCandidateProfile(myProfile);
          setManifesto(myProfile.manifesto);
          setSymbol(myProfile.symbol);
          setPhoto(myProfile.photo);
          electionService.getElectionById(myProfile.electionId).then((el) => setElection(el));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateProfile) return;

    setSaving(true);
    setSuccessMsg(null);
    try {
      const updated = await candidateService.updateCandidate(candidateProfile.id, {
        manifesto,
        symbol,
        photo,
      });
      setCandidateProfile(updated);
      setSuccessMsg('Candidate campaign profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span>Candidate Portal</span>
            <span>·</span>
            <span>ID: {user.studentId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            Candidate Campaign Headquarters
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Author your election manifesto, set your campaign symbol, and manage candidate details.
          </p>
        </div>

        {/* Approval Badge */}
        {candidateProfile && (
          <div>
            {candidateProfile.approvalStatus === 'APPROVED' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Nomination Approved</span>
              </div>
            )}
            {candidateProfile.approvalStatus === 'PENDING' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Commission Review</span>
              </div>
            )}
            {candidateProfile.approvalStatus === 'REJECTED' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Nomination Rejected</span>
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : !candidateProfile ? (
        <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
          <Award className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Candidate Profile Found
          </h3>
          <p className="text-xs text-slate-500">
            You do not currently have an active nomination on file.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card Preview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Public Profile Preview
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <div className="aspect-square w-full bg-slate-100 dark:bg-slate-900 relative">
                {photo ? (
                  <img src={photo} alt={candidateProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-400 m-auto mt-16" />
                )}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  {candidateProfile.position}
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h4 className="font-bold text-base text-slate-900 dark:text-white font-display">
                  {candidateProfile.name}
                </h4>
                <div className="text-xs text-slate-500">
                  {candidateProfile.department} · Sem {candidateProfile.semester}
                </div>
                {symbol && (
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Symbol: {symbol}
                  </div>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 pt-1">
                  {manifesto}
                </p>
              </div>
            </div>

            {election && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="text-slate-500 block">Assigned Election:</span>
                <span className="font-bold text-slate-900 dark:text-white block">{election.title}</span>
                <span className="text-slate-500">Academic Year {election.academicYear}</span>
              </div>
            )}
          </div>

          {/* Right Column: Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Edit Campaign Platform & Manifesto
                </h3>
                <p className="text-xs text-slate-500">
                  Keep your pledges, initiatives, and symbols updated for voters to review.
                </p>
              </div>

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Campaign Symbol / Slogan
                  </label>
                  <input
                    type="text"
                    required
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g. ⚡ Beacon of Progress"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Photo URL or Asset Path
                  </label>
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="/src/assets/images/candidate_...jpg"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Election Manifesto & Pledges
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={manifesto}
                    onChange={(e) => setManifesto(e.target.value)}
                    placeholder="Outline student advocacy goals, proposed reforms, and leadership platform..."
                    className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving Changes...' : 'Save Campaign Updates'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
