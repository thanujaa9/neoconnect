'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function MyCases() {
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
    const res = await api.getMyCases();
    setCases(Array.isArray(res) ? res : []);
    setLoading(false);
  };

  const statusColor = {
    'New': 'bg-slate-100 text-slate-700',
    'Assigned': 'bg-blue-50 text-blue-700',
    'In Progress': 'bg-indigo-50 text-indigo-700',
    'Pending': 'bg-yellow-50 text-yellow-700',
    'Resolved': 'bg-green-50 text-green-700',
    'Escalated': 'bg-red-50 text-red-700',
  };

  return (
    <Layout user={user}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">My Cases</h1>
        <p className="text-slate-500 text-sm mb-6">Cases assigned to you</p>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : cases.length === 0 ? (
          <p className="text-slate-500 text-sm">No cases assigned to you yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {cases.map(c => (
              <div
                key={c._id}
                onClick={() => router.push(`/cases/${c._id}`)}
                className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-indigo-600">{c.trackingId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.department} · {c.category}</p>
                  </div>
                  <p className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}