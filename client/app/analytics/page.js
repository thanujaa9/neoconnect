'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const res = await api.getAnalytics();
    setData(res);
    setLoading(false);
  };

  const maxCount = (arr) => Math.max(...arr.map(i => i.count), 1);

  if (loading) return (
    <Layout user={user}>
      <p className="text-slate-500 text-sm">Loading...</p>
    </Layout>
  );

  return (
    <Layout user={user}>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Analytics</h1>
        <p className="text-slate-500 text-sm mb-6">Overview of cases across the organisation</p>

        {data?.hotspots?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-red-700 mb-2">Hotspots Detected</p>
            <div className="flex flex-col gap-1">
              {data.hotspots.map((h, i) => (
                <p key={i} className="text-sm text-red-600">
                  {h._id.department} — {h._id.category} ({h.count} cases)
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total Cases</p>
            <p className="text-2xl font-semibold text-slate-800">
              {data?.byStatus?.reduce((sum, s) => sum + s.count, 0) || 0}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Resolved</p>
            <p className="text-2xl font-semibold text-green-600">
              {data?.byStatus?.find(s => s._id === 'Resolved')?.count || 0}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Escalated</p>
            <p className="text-2xl font-semibold text-red-600">
              {data?.byStatus?.find(s => s._id === 'Escalated')?.count || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Cases by Department</h2>
            <div className="flex flex-col gap-3">
              {data?.byDepartment?.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{d._id || 'Unknown'}</span>
                    <span>{d.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${(d.count / maxCount(data.byDepartment)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Cases by Category</h2>
            <div className="flex flex-col gap-3">
              {data?.byCategory?.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{c._id}</span>
                    <span>{c.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${(c.count / maxCount(data.byCategory)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 col-span-2">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Cases by Status</h2>
            <div className="flex flex-col gap-3">
              {data?.byStatus?.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{s._id}</span>
                    <span>{s.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${(s.count / maxCount(data.byStatus)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}