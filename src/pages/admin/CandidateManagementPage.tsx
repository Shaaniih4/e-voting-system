import React, { useEffect, useState } from 'react';
import { candidateService, electionService } from '../../services/api';
import { Candidate, Election } from '../../types';
import { Check, X, Award, Plus, Trash2, Edit2, User } from 'lucide-react';

export const CandidateManagementPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New candidate form
  const [formData, setFormData] = useState({
    electionId: '',
    name: '',
    photo: '',
    department: 'Computer Science & Engineering',
    semester: 6,
    studentId: '',
    position: '',
    manifesto: '',
    symbol: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      candidateService.getCandidates({ status: undefined }),
      electionService.getElections(),
    ])
      .then(([candList, elecList]) => {
        setCandidates(candList);
        setElections(elecList);
        if (elecList.length > 0 && !formData.electionId) {
          setFormData((prev) => ({
            ...prev,
            electionId: elecList[0].id,
            position: elecList[0].positions[0]?.title || '',
          }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproval = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await candidateService.updateApproval(id, status);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update candidate status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await candidateService.deleteCandidate(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete candidate');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await candidateService.createCandidate(formData);
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add candidate');
    }
  };

  const currentElecObj = elections.find((e) => e.id === formData.electionId);
  const currentPositions = currentElecObj?.positions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Candidate Nomination & Approval
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review candidate applications, verify credentials, and approve student campaign slates.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nominate Candidate</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-6 py-3.5">Position & Election</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Symbol</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading candidates...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No candidates nominated yet.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => {
                  const elec = elections.find((e) => e.id === cand.electionId);
                  return (
                    <tr key={cand.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                            {cand.photo ? (
                              <img src={cand.photo} alt={cand.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-slate-400 m-auto mt-2" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {cand.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {cand.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {cand.position}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {elec?.title || 'Unknown Election'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {cand.department} · Sem {cand.semester}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                        {cand.symbol || 'None'}
                      </td>
                      <td className="px-6 py-4">
                        {cand.approvalStatus === 'APPROVED' && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Approved</span>
                        )}
                        {cand.approvalStatus === 'PENDING' && (
                          <span className="font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
                        )}
                        {cand.approvalStatus === 'REJECTED' && (
                          <span className="font-semibold text-rose-600 dark:text-rose-400">Rejected</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cand.approvalStatus !== 'APPROVED' && (
                            <button
                              onClick={() => handleApproval(cand.id, 'APPROVED')}
                              title="Approve candidate"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {cand.approvalStatus !== 'REJECTED' && (
                            <button
                              onClick={() => handleApproval(cand.id, 'REJECTED')}
                              title="Reject candidate"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(cand.id)}
                            title="Delete candidate"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nominate Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Nominate Candidate
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Election
                </label>
                <select
                  value={formData.electionId}
                  onChange={(e) => {
                    const elecId = e.target.value;
                    const el = elections.find((x) => x.id === elecId);
                    setFormData({
                      ...formData,
                      electionId: elecId,
                      position: el?.positions[0]?.title || '',
                    });
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                >
                  {elections.map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    {currentPositions.map((pos) => (
                      <option key={pos.id} value={pos.title}>
                        {pos.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Campaign Symbol
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ⚡ Unity Light"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Campaign Manifesto
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline key pledges, student welfare policies, and goals..."
                  value={formData.manifesto}
                  onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
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
                  Save & Nominate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
