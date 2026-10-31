import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { electionService, resultsService } from '../../services/api';
import { Election, ElectionResultsData } from '../../types';
import {
  Award,
  BarChart2,
  Printer,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  Vote,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const PublishedResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedElectionId = searchParams.get('electionId');

  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [resultsData, setResultsData] = useState<ElectionResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    electionService.getElections()
      .then((elecs) => {
        setElections(elecs);
        // Find published election or requested
        const target = requestedElectionId
          ? elecs.find((e) => e.id === requestedElectionId)
          : elecs.find((e) => e.status === 'PUBLISHED') || elecs[0];

        if (target) {
          setSelectedElectionId(target.id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [requestedElectionId]);

  useEffect(() => {
    if (!selectedElectionId) return;
    setLoading(true);
    setError(null);
    resultsService.getResults(selectedElectionId)
      .then((data) => setResultsData(data))
      .catch((err) => {
        setError(err.response?.data?.error || 'Results are sealed until this election concludes and is published.');
        setResultsData(null);
      })
      .finally(() => setLoading(false));
  }, [selectedElectionId]);

  const handlePrint = () => {
    window.print();
  };

  const BAR_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0 print:m-0">
      {/* Header and Election Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Certified Official Election Results</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Election Results & Analytics
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Verified vote tallies, turnout percentages, position winners, and department participation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            className="px-3.5 py-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 dark:text-white shadow-xs"
            aria-label="Select election to view results"
          >
            {elections.map((elec) => (
              <option key={elec.id} value={elec.id}>
                {elec.title} ({elec.status})
              </option>
            ))}
          </select>

          {resultsData && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print PDF</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : error ? (
        <div className="p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl text-center space-y-3">
          <BarChart2 className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
            Results Sealed
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto leading-relaxed">
            {error}
          </p>
          <div className="pt-2 text-xs text-slate-500">
            Tip: Switch the selector to <span className="font-semibold text-slate-700 dark:text-slate-300">Department Representatives Council 2025</span> to inspect certified published data.
          </div>
        </div>
      ) : resultsData && (
        <div className="space-y-8">
          {/* Printable Report Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
                  Academic Year {resultsData.election.academicYear} · Certified Report
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
                  {resultsData.election.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Certification by: <strong className="text-slate-700 dark:text-slate-300">{resultsData.certifiedBy}</strong>
                </p>
              </div>

              <div className="text-right sm:border-l sm:pl-6 border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                <span className="block font-medium">Certification Date</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {new Date(resultsData.certificationDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Turnout Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Eligible Voters</span>
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {resultsData.stats.totalEligibleVoters}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Vote className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Total Votes Cast</span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {resultsData.stats.totalVotesCast}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                  <span>Voter Turnout</span>
                </div>
                <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
                  {resultsData.stats.turnoutPercentage}%
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ballot Line Items</span>
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {resultsData.stats.totalBallotItems}
                </div>
              </div>
            </div>
          </div>

          {/* Position Winners & Charts */}
          <div className="space-y-8">
            {resultsData.positionResults.map((pos) => (
              <div
                key={pos.positionId}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                      Position: {pos.positionTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total valid ballots recorded: <strong className="font-mono text-slate-700 dark:text-slate-300">{pos.totalVotes}</strong>
                    </p>
                  </div>

                  {pos.winner && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Winner: {pos.winner.candidateName} ({pos.winner.percentage}%)</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Candidates Breakdown Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Certified Candidate Tallies
                    </h4>
                    <div className="space-y-2.5">
                      {pos.candidates.map((cand, idx) => {
                        const isWinner = pos.winner?.candidateId === cand.candidateId;
                        return (
                          <div
                            key={cand.candidateId}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${
                              isWinner
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono text-xs font-bold text-slate-400 w-4">
                                #{idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                  {cand.candidateName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {cand.department} · {cand.symbol || 'Independent'}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                                {cand.votes} votes
                              </div>
                              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                {cand.percentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recharts Bar Chart */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Vote Distribution Chart
                    </h4>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={pos.candidates}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis
                            type="category"
                            dataKey="candidateName"
                            tick={{ fontSize: 11 }}
                            width={100}
                          />
                          <Tooltip
                            formatter={(val: any) => [`${val} Votes`, 'Tally']}
                            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                          />
                          <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
                            {pos.candidates.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={BAR_COLORS[index % BAR_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Department Breakdown */}
          {resultsData.departmentTurnout.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Department Turnout Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {resultsData.departmentTurnout.map((dept) => (
                  <div
                    key={dept.department}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
                  >
                    <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                      {dept.department}
                    </span>
                    <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {dept.votes} votes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
