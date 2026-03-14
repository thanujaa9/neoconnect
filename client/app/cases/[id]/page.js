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
  const [loading, setLoading] = useState(true);

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
    await api.assignCase(id, assignedTo);
    fetchCase();
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

  if (loading) return (
    <Layout user={user}>
      <p className="text-slate-500 text-sm">Loading...</p>
    </Layout>
  );

  return (
    <Layout user={user}>
      <div className="max-w-3xl">
        <button
          onClick={() => router.back()}
          className="text-sm text-teal-600 hover:underline mb-4 block"
        >
          ← Back
        </button>

        <div className={`bg-white border border-slate-200 ${severityBorder[caseData.severity]} rounded-xl p-6 mb-4`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-teal-600">{caseData.trackingId}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[caseData.status]}`}>
                  {caseData.status}
                </span>
                <span className={`text-xs font-medium ${caseData.severity === 'High' ? 'text-red-500' : caseData.severity === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>
                  {caseData.severity} severity
                </span>
              </div>
              <h1 className="text-xl font-semibold text-slate-800">{caseData.title}</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {caseData.department} · {caseData.category}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-700 mb-4">{caseData.description}</p>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Submitted by</p>
              <p className="text-slate-800">{caseData.isAnonymous ? 'Anonymous' : caseData.submittedBy?.name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Assigned to</p>
              <p className="text-slate-800">{caseData.assignedTo?.name || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Location</p>
              <p className="text-slate-800">{caseData.location || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Submitted on</p>
              <p className="text-slate-800">{new Date(caseData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {caseData.fileUrl && (
            <div className="mt-4">
              
                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${caseData.fileUrl}`}
                target="_blank"
                className="text-sm text-teal-600 hover:underline"
              >
                View attached file
              </a>
            </div>
          )}
        </div>

        {(user?.role === 'secretariat' || user?.role === 'admin') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Assign to Case Manager</h2>
            <p className="text-xs text-slate-400 mb-3">Secretariat manages assignment. Investigation notes are handled by the case manager.</p>
            <div className="flex gap-2">
              <select
                id="assignInput"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select case manager</option>
                {managers.map(m => (
                  <option key={m._id} value={m._id}>{m.name} — {m.email}</option>
                ))}
              </select>
              <button
                onClick={() => handleAssign(document.getElementById('assignInput').value)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm"
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

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Investigation Notes</h2>

          {caseData.notes?.length === 0 && (
            <p className="text-slate-400 text-sm mb-4">No notes yet.</p>
          )}

          <div className="flex flex-col gap-3 mb-4">
            {caseData.notes?.map((n, i) => (
              <div key={i} className="bg-slate-50 border-l-2 border-l-teal-300 rounded-lg px-4 py-3">
                <p className="text-sm text-slate-700">{n.text}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {n.addedBy?.name} · {new Date(n.addedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {(user?.role === 'case_manager' || user?.role === 'admin') && (
            <form onSubmit={handleNote} className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add investigation note..."
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add
              </button>
            </form>
          )}

          {user?.role === 'secretariat' && (
            <div className="bg-slate-50 rounded-lg px-4 py-3">
              <p className="text-xs text-slate-400">Investigation notes are managed by the assigned Case Manager only.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}