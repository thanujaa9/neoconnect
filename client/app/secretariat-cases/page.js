'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function SecretariatCases() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    setUser(JSON.parse(stored));
    fetchCases();
  }, []);

  const fetchCases = async () => {
    const res = await api.getSecretariatCases();
    setCases(Array.isArray(res) ? res : []);
    setLoading(false);
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

  const stats = {
    total: cases.length,
    inProgress: cases.filter(c => c.status === 'In Progress').length,
    resolved: cases.filter(c => c.status === 'Resolved').length,
    escalated: cases.filter(c => c.status === 'Escalated').length,
  };

  return (
    <Layout user={user}>
      <div>
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-800">My Assigned Cases</h1>
          <p className="text-slate-500 text-sm mt-0.5">Cases you assigned — track their progress here</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">I assigned</p>
            <p className="text-2xl font-semibold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">In Progress</p>
            <p className="text-2xl font-semibold text-teal-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Resolved</p>
            <p className="text-2xl font-semibold text-green-600">{stats.resolved}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Escalated</p>
            <p className="text-2xl font-semibold text-red-600">{stats.escalated}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : cases.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">You haven't assigned any cases yet.</p>
            <button onClick={() => router.push('/cases')} className="mt-3 text-sm text-teal-600 hover:underline">
              Go to all cases →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cases.map(c => (
              <div
                key={c._id}
                className={`bg-white border border-slate-200 ${severityBorder[c.severity]} rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all`}
                onClick={() => router.push(`/cases/${c._id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-teal-600">{c.trackingId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.department} · Assigned to: <span className="font-medium text-slate-700">{c.assignedTo?.name || 'Unassigned'}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                    {c.resolution?.summary && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full mt-1 block">Resolution filed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}