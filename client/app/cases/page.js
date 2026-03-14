'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function CaseDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [managers, setManagers] = useState([]);
  const [note, setNote] = useState('');
  const [resolution, setResolution] = useState({ summary: '', outcome: 'Resolved' });
  const [loading, setLoading] = useState(true);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    setUser(JSON.parse(stored));
    fetchCase();
    fetchManagers();
  }, []);

  const fetchCase = async () => {
    const res = await api.getCase(id);
    setCaseData(res);
    setLoading(false);
  };

  const fetchManagers = async () => {
    const res = await api.getManagers();
    setManagers(Array.isArray(res) ? res : []);
  };

  const handleAssign = async (assignedTo) => {
    if (!assignedTo) return;
    setAssignError('');
    const res = await api.assignCase(id, assignedTo);
    if (res.message) {
      setAssignError(res.message);
    } else {
      fetchCase();
    }
  };

  const handleStatus = async (status) => {
    await api.updateStatus(id, status);
    fetchCase();
  };

  const handleNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await api.addNote(id, note);
    setNote('');
    fetchCase();
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolution.summary.trim()) return;
    await api.resolveCase(id, resolution);
    fetchCase();
  };

  const statusColor = {
    'New': 'bg-slate-100 text-slate-700',
    'Assigned': 'bg-blue-50 text-blue-700',
    'In Progress': 'bg-teal-50 text-teal-700',
    'Pending': 'bg-amber-50 text-amber-700',
    'Resolved': 'bg-green-50 text-green-700',
    'Escalated': 'bg-red-50 text-red-700',
  };

  const severityBorder = {
    'Low': 'border-l-4 border-l-green-400',
    'Medium': 'border-l-4 border-l-amber-400',
    'High': 'border-l-4 border-l-red-500',
  };

  const canAssign = user?.role === 'admin' ||
    (user?.role === 'secretariat' && (!caseData?.assignedBy || caseData?.assignedBy?._id === user?.id));

  if (loading) return (
    <Layout user={user}>
      <p className="text-slate-500 text-sm">Loading...</p>
    </Layout>
  );

  return (
    <Layout user={user}>
      <div className="max-w-3xl">
        <button onClick={() => router.back()} className="text-sm text-teal-600 hover:underline mb-4 block">
          ← Back
        </button>

        <div className={`bg-white border border-slate-200 ${severityBorder[caseData.severity]} rounded-xl p-6 mb-4`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">{caseData.trackingId}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[caseData.status]}`}>
                  {caseData.status}
                </span>
                <span className={`text-xs font-medium ${caseData.severity === 'High' ? 'text-red-500' : caseData.severity === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>
                  {caseData.severity} severity
                </span>
              </div>
              <h1 className="text-xl font-semibold text-slate-800">{caseData.title}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{caseData.department} · {caseData.category}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{caseData.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Submitted by</p>
              <p className="text-slate-800">{caseData.isAnonymous ? 'Anonymous' : caseData.submittedBy?.name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Assigned to</p>
              <p className="text-slate-800">{caseData.assignedTo?.name || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Assigned by</p>
              <p className="text-slate-800">{caseData.assignedBy?.name || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Submitted on</p>
              <p className="text-slate-800">{caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Location</p>
              <p className="text-slate-800">{caseData.location || '—'}</p>
            </div>
          </div>

          {caseData.fileUrl && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              
                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${caseData.fileUrl}`}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm text-teal-600 bg-teal-50 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors"
              >
                View attached file
              </a>
            </div>
          )}
        </div>

        {(user?.role === 'secretariat' || user?.role === 'admin') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Assign to Case Manager</h2>
            {!canAssign && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-amber-700">This case was assigned by another secretariat. Only admin can reassign.</p>
              </div>
            )}
            {assignError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-red-600">{assignError}</p>
              </div>
            )}
            <div className="flex gap-2">
              <select
                id="assignInput"
                disabled={!canAssign}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:bg-slate-50"
              >
                <option value="">Select case manager</option>
                {managers.map(m => (
                  <option key={m._id} value={m._id}>{m.name} — {m.email}</option>
                ))}
              </select>
              <button
                disabled={!canAssign}
                onClick={() => handleAssign(document.getElementById('assignInput').value)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        )}

        {(user?.role === 'case_manager' || user?.role === 'secretariat' || user?.role === 'admin') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Escalated'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                    ${caseData.status === s
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-slate-300 text-slate-600 hover:border-teal-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {(user?.role === 'secretariat' || user?.role === 'admin') && caseData.assignmentHistory?.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Assignment History</h2>
            <div className="flex flex-col gap-2">
              {caseData.assignmentHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-600">
                    Assigned to <span className="font-medium text-slate-800">{h.assignedTo?.name || 'Unknown'}</span>
                    {h.assignedBy?.name && <span className="text-slate-400"> by {h.assignedBy.name}</span>}
                  </span>
                  <span className="text-slate-400">{new Date(h.assignedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Investigation Notes</h2>
          {caseData.notes?.length === 0 && (
            <p className="text-slate-400 text-sm mb-4">No notes yet.</p>
          )}
          <div className="flex flex-col gap-3 mb-4">
            {caseData.notes?.map((n, i) => (
              <div key={i} className="bg-slate-50 border-l-2 border-l-teal-300 rounded-lg px-4 py-3">
                <p className="text-sm text-slate-700">{n.text}</p>
                <p className="text-xs text-slate-400 mt-1">{n.addedBy?.name} · {new Date(n.addedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          {(user?.role === 'case_manager' || user?.role === 'secretariat' || user?.role === 'admin') && (
            <form onSubmit={handleNote} className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={user?.role === 'secretariat' ? 'Add a follow-up note...' : 'Add investigation note...'}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm">
                Add
              </button>
            </form>
          )}
        </div>

        {user?.role === 'case_manager' && caseData.status !== 'Resolved' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Resolution Summary</h2>
            <p className="text-xs text-slate-400 mb-4">Fill this when you close the case. This is visible to secretariat.</p>
            <form onSubmit={handleResolve} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">What action was taken?</label>
                <textarea
                  rows={3}
                  value={resolution.summary}
                  onChange={e => setResolution({ ...resolution, summary: e.target.value })}
                  placeholder="Describe what was done to resolve this case..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Outcome</label>
                <select
                  value={resolution.outcome}
                  onChange={e => setResolution({ ...resolution, outcome: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {['Resolved', 'No Action Required', 'Referred', 'Escalated'].map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Submit Resolution & Close Case
              </button>
            </form>
          </div>
        )}

        {caseData.resolution?.summary && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-green-700 mb-3">Resolution Summary</h2>
            <p className="text-sm text-slate-700 mb-3">{caseData.resolution.summary}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Outcome: <span className="font-medium text-slate-700">{caseData.resolution.outcome}</span></span>
              <span>Resolved by: <span className="font-medium text-slate-700">{caseData.resolution.resolvedBy?.name}</span></span>
              <span>{caseData.resolution.resolvedAt ? new Date(caseData.resolution.resolvedAt).toLocaleDateString() : ''}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}