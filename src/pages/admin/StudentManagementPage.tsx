import React, { useEffect, useState } from 'react';
import { adminService, electionService } from '../../services/api';
import { User, Election } from '../../types';
import { Search, Upload, CheckCircle, Ban, RefreshCw, X, FileSpreadsheet, AlertCircle } from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  // CSV import state
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [csvResult, setCsvResult] = useState<any>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  const loadStudents = () => {
    setLoading(true);
    adminService.getVoters({
      search: search || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    })
      .then((data) => setStudents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter]);

  useEffect(() => {
    electionService.getElections().then((res) => {
      setElections(res);
      if (res.length > 0) setSelectedElectionId(res[0].id);
    });
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await adminService.updateVoterStatus(userId, newStatus);
      loadStudents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update student status');
    }
  };

  const handleLoadSampleCsv = () => {
    const sample = `name,email,studentId,department,semester
Samantha Ray,samantha.ray@campus.edu,CS2024-0552,Computer Science & Engineering,4
Daniel Kim,daniel.kim@campus.edu,EC2024-0321,Electronics & Communication,4
Aisha Patel,aisha.patel@campus.edu,ME2024-0118,Mechanical Engineering,4
Carlos Santana,carlos.s@campus.edu,CE2024-0809,Civil Engineering,4`;
    setCsvContent(sample);
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    setCsvLoading(true);
    setCsvResult(null);

    try {
      const res = await adminService.importCsv(selectedElectionId || undefined, csvContent);
      setCsvResult(res);
      loadStudents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'CSV import failed');
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Student Voter Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify matriculation status, monitor email authentication, and batch-import eligible voter rosters.
          </p>
        </div>

        <button
          onClick={() => {
            setCsvModalOpen(true);
            setCsvResult(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Import Voter Roster (CSV)</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
          {['ALL', 'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? 'All Accounts'
                : st === 'PENDING_VERIFICATION'
                ? 'Pending'
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Semester</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No students match criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      Sem {student.semester}
                    </td>
                    <td className="px-6 py-4">
                      {student.accountStatus === 'ACTIVE' && (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Active & Verified
                        </span>
                      )}
                      {student.accountStatus === 'PENDING_VERIFICATION' && (
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          Pending Verification
                        </span>
                      )}
                      {student.accountStatus === 'SUSPENDED' && (
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {student.accountStatus !== 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(student.id, 'ACTIVE')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100"
                          >
                            Activate
                          </button>
                        )}
                        {student.accountStatus !== 'SUSPENDED' && (
                          <button
                            onClick={() => handleUpdateStatus(student.id, 'SUSPENDED')}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg hover:bg-rose-100"
                          >
                            Suspend
                          </button>
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

      {/* CSV Import Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                <span>Import Student Roster / Eligibility (CSV)</span>
              </h3>
              <button onClick={() => setCsvModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportCsv} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Election for Eligibility
                </label>
                <select
                  value={selectedElectionId}
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                >
                  <option value="">-- General Student Import (No specific election) --</option>
                  {elections.map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.title} ({el.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Paste CSV Data (Header: name, email, studentId, department, semester)
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleCsv}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Load Sample Rows
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  placeholder={`name,email,studentId,department,semester\nJohn Doe,john@campus.edu,CS-101,Computer Science,4`}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              {csvResult && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="font-bold">{csvResult.message}</div>
                  <div>New students created: {csvResult.summary?.newStudentsRegistered}</div>
                  <div>Existing students matched: {csvResult.summary?.existingStudentsMatched}</div>
                  <div>Election eligibility assigned: {csvResult.summary?.electionEligibilityAssigned}</div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={csvLoading || !csvContent.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  {csvLoading ? 'Processing CSV...' : 'Process Roster Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
