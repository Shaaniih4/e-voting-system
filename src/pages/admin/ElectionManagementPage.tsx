import React, { useEffect, useState } from 'react';
import { electionService } from '../../services/api';
import { Election, ElectionStatus } from '../../types';
import { Plus, Edit2, Play, Square, CheckCircle, AlertTriangle, X, Trash2, Calendar } from 'lucide-react';

export const ElectionManagementPage: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    academicYear: '2026-2027',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    positions: [
      { title: 'President', maxSelections: 1, description: 'Chief Student Executive' },
      { title: 'Vice President', maxSelections: 1, description: 'Council Vice Chair' },
    ],
  });

  const loadElections = () => {
    setLoading(true);
    electionService.getElections()
      .then((data) => setElections(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadElections();
  }, []);

  const handleStatusChange = async (electionId: string, targetStatus: ElectionStatus) => {
    if (!confirm(`Are you sure you want to transition this election status to ${targetStatus}?`)) {
      return;
    }
    setActionLoading(electionId);
    try {
      await electionService.updateStatus(electionId, targetStatus);
      loadElections();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPosition = () => {
    setFormData({
      ...formData,
      positions: [...formData.positions, { title: '', maxSelections: 1, description: '' }],
    });
  };

  const handleRemovePosition = (index: number) => {
    setFormData({
      ...formData,
      positions: formData.positions.filter((_, i) => i !== index),
    });
  };

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.positions.length === 0 || formData.positions.some((p) => !p.title.trim())) {
      alert('Please define at least one valid position');
      return;
    }

    try {
      await electionService.createElection({
        title: formData.title,
        description: formData.description,
        academicYear: formData.academicYear,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        positions: formData.positions.map((p, idx) => ({
          id: `pos-${Date.now()}-${idx}`,
          title: p.title,
          maxSelections: 1,
          description: p.description,
        })),
        status: 'DRAFT',
      });
      setModalOpen(false);
      loadElections();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create election');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Election Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control election lifecycles, configure ballot positions, and manage scheduling.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Election</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Election Details</th>
                <th className="px-6 py-3.5">Academic Year</th>
                <th className="px-6 py-3.5">Positions</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Loading election records...
                  </td>
                </tr>
              ) : elections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No elections created yet. Click "Create New Election" above.
                  </td>
                </tr>
              ) : (
                elections.map((elec) => (
                  <tr key={elec.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {elec.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                        {elec.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                      {elec.academicYear}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {elec.positions.length} positions
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-xs">
                        {elec.status === 'ACTIVE' && <span className="text-emerald-600 dark:text-emerald-400">● Active</span>}
                        {elec.status === 'SCHEDULED' && <span className="text-blue-600 dark:text-blue-400">Scheduled</span>}
                        {elec.status === 'DRAFT' && <span className="text-slate-500">Draft</span>}
                        {elec.status === 'CLOSED' && <span className="text-amber-600 dark:text-amber-400">Closed</span>}
                        {elec.status === 'PUBLISHED' && <span className="text-purple-600 dark:text-purple-400">Published</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {elec.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(elec.id, 'SCHEDULED')}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100"
                            >
                              Schedule
                            </button>
                            <button
                              onClick={() => handleStatusChange(elec.id, 'ACTIVE')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100"
                            >
                              Activate
                            </button>
                          </>
                        )}
                        {elec.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleStatusChange(elec.id, 'ACTIVE')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100"
                          >
                            Activate Now
                          </button>
                        )}
                        {elec.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(elec.id, 'CLOSED')}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 rounded-lg hover:bg-amber-100"
                          >
                            Close Voting
                          </button>
                        )}
                        {elec.status === 'CLOSED' && (
                          <button
                            onClick={() => handleStatusChange(elec.id, 'PUBLISHED')}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/40 rounded-lg hover:bg-purple-100"
                          >
                            Publish Results
                          </button>
                        )}
                        {elec.status === 'PUBLISHED' && (
                          <span className="text-xs text-slate-400">Certified</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Election Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Create New Campus Election
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateElection} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Election Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Faculty Council Election 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Voting Start
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              {/* Positions List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Election Positions
                  </span>
                  <button
                    type="button"
                    onClick={handleAddPosition}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add Position
                  </button>
                </div>

                {formData.positions.map((pos, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Position title (e.g. General Secretary)"
                      value={pos.title}
                      onChange={(e) => {
                        const next = [...formData.positions];
                        next[idx].title = e.target.value;
                        setFormData({ ...formData, positions: next });
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                    />
                    {formData.positions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePosition(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Create Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
