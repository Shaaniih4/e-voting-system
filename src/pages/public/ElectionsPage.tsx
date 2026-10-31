import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { electionService } from '../../services/api';
import { Election } from '../../types';
import { Calendar, Users, Award, Vote, CheckCircle, ArrowRight, Search, Clock } from 'lucide-react';

export const ElectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    electionService.getElections()
      .then((data) => setElections(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = elections.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.academicYear.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Election['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">● Active Voting Open</span>;
      case 'SCHEDULED':
        return <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Scheduled</span>;
      case 'PUBLISHED':
        return <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Official Results Certified</span>;
      case 'CLOSED':
        return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Voting Closed · Tallying</span>;
      case 'DRAFT':
      default:
        return <span className="text-xs font-semibold text-slate-500">Draft Setup</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Campus Elections Directory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Browse active union ballots, scheduled representative councils, and certified historical election outcomes.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search elections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-blue-500 dark:text-white"
          />
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
          {['ALL', 'ACTIVE', 'SCHEDULED', 'PUBLISHED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Elections' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Elections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Vote className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No elections found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((election) => (
            <div
              key={election.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-slate-600 transition-all shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{getStatusBadge(election.status)}</span>
                  <span className="font-mono">{election.academicYear}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display line-clamp-1">
                  {election.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {election.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-500" />
                    <span>{election.positions.length} Positions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{election.candidateCount ?? 0} Candidates</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <Link
                  to={`/candidates?electionId=${election.id}`}
                  className="flex-1 text-center px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap"
                >
                  Candidates
                </Link>

                {election.status === 'PUBLISHED' && (
                  <Link
                    to={`/results?electionId=${election.id}`}
                    className="flex-1 text-center px-3 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors whitespace-nowrap"
                  >
                    View Results
                  </Link>
                )}

                {election.status === 'ACTIVE' && (
                  election.userVoted ? (
                    <span className="flex-1 text-center px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Voted</span>
                    </span>
                  ) : (
                    <Link
                      to={user ? `/voter/ballot/${election.id}` : '/login'}
                      className="flex-1 text-center px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Vote Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
