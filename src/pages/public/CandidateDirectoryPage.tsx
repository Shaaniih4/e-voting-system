import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { candidateService, electionService } from '../../services/api';
import { Candidate, Election } from '../../types';
import { Search, Award, BookOpen, X, User } from 'lucide-react';

export const CandidateDirectoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialElectionId = searchParams.get('electionId') || '';

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<string>(initialElectionId);
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [activeManifesto, setActiveManifesto] = useState<Candidate | null>(null);

  useEffect(() => {
    Promise.all([
      candidateService.getCandidates(),
      electionService.getElections(),
    ])
      .then(([candData, elecData]) => {
        setCandidates(candData);
        setElections(elecData);
        if (!initialElectionId && elecData.length > 0) {
          const active = elecData.find((e) => e.status === 'ACTIVE') || elecData[0];
          setSelectedElection(active.id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [initialElectionId]);

  // Positions available for current election
  const currentElectionObj = elections.find((e) => e.id === selectedElection);
  const positions = currentElectionObj?.positions.map((p) => p.title) || [];

  const filteredCandidates = candidates.filter((c) => {
    const matchesElection = !selectedElection || c.electionId === selectedElection;
    const matchesPosition = selectedPosition === 'ALL' || c.position.toLowerCase() === selectedPosition.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.manifesto.toLowerCase().includes(search.toLowerCase());
    return matchesElection && matchesPosition && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Candidate Directory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Get to know the student leaders running for office, read their official manifestos, and review their campaign pledges.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Election Select */}
          <select
            value={selectedElection}
            onChange={(e) => {
              setSelectedElection(e.target.value);
              setSelectedPosition('ALL');
            }}
            aria-label="Filter by election"
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-blue-500 dark:text-white"
          >
            {elections.map((elec) => (
              <option key={elec.id} value={elec.id}>
                {elec.title} ({elec.academicYear})
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate or manifesto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-blue-500 dark:text-white"
            />
          </div>
        </div>

        {/* Position Filter Tabs */}
        {positions.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <button
              onClick={() => setSelectedPosition('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedPosition === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Positions
            </button>
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedPosition.toLowerCase() === pos.toLowerCase()
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Award className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No candidates found</h3>
          <p className="text-xs text-slate-500">There are no approved candidates matching your selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col justify-between hover:border-blue-400 dark:hover:border-slate-600 transition-all shadow-xs"
            >
              <div>
                {/* Photo & Position Tag */}
                <div className="relative aspect-square max-h-56 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {candidate.photo ? (
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                      <User className="w-16 h-16 stroke-1 mb-2" />
                      <span className="text-xs font-medium">Candidate Photo Pending</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    {candidate.position}
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                      {candidate.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {candidate.department} · Sem {candidate.semester}
                    </div>
                  </div>

                  {candidate.symbol && (
                    <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      Symbol: {candidate.symbol}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {candidate.manifesto}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => setActiveManifesto(candidate)}
                  className="w-full py-2.5 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Full Manifesto</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manifesto Reader Modal */}
      {activeManifesto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Official Candidate Manifesto
                </h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {activeManifesto.position} Candidate
                </span>
              </div>
              <button
                onClick={() => setActiveManifesto(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                  {activeManifesto.photo ? (
                    <img
                      src={activeManifesto.photo}
                      alt={activeManifesto.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400 m-auto mt-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    {activeManifesto.name}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Department of {activeManifesto.department} · Student ID: {activeManifesto.studentId}
                  </div>
                  {activeManifesto.symbol && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                      Campaign Symbol: {activeManifesto.symbol}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Campaign Platform & Pledges
                </h5>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-serif">
                  {activeManifesto.manifesto}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveManifesto(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 rounded-lg transition-colors"
              >
                Close Manifesto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
