'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    setUser(JSON.parse(stored));
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const res = await api.getAnalytics();
    setData(res);
    setLoading(false);
  };

  const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

  const statusColors = {
    'New': '#94a3b8',
    'Assigned': '#3b82f6',
    'In Progress': '#14b8a6',
    'Pending': '#f59e0b',
    'Resolved': '#10b981',
    'Escalated': '#ef4444',
  };

  if (loading) return (
    <Layout user={user}>
      <p className="text-slate-500 text-sm">Loading...</p>
    </Layout>
  );

  const totalCases = data?.byStatus?.reduce((sum, s) => sum + s.count, 0) || 0;
  const resolved = data?.byStatus?.find(s => s._id === 'Resolved')?.count || 0;
  const escalated = data?.byStatus?.find(s => s._id === 'Escalated')?.count || 0;
  const inProgress = data?.byStatus?.find(s => s._id === 'In Progress')?.count || 0;

  const deptData = data?.byDepartment?.map(d => ({
    name: d._id || 'Unknown',
    cases: d.count
  })) || [];

  const categoryData = data?.byCategory?.map(c => ({
    name: c._id,
    value: c.count
  })) || [];

  const statusData = data?.byStatus?.map(s => ({
    name: s._id,
    cases: s.count,
    color: statusColors[s._id] || '#94a3b8'
  })) || [];

  return (
    <Layout user={user}>
      <div className="max-w-5xl">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-800">Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Overview of all cases across the organisation</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total Cases</p>
            <p className="text-3xl font-semibold text-slate-800">{totalCases}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Resolved</p>
            <p className="text-3xl font-semibold text-green-600">{resolved}</p>
            <p className="text-xs text-slate-400 mt-1">
              {totalCases > 0 ? Math.round((resolved / totalCases) * 100) : 0}% resolution rate
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">In Progress</p>
            <p className="text-3xl font-semibold text-teal-600">{inProgress}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Escalated</p>
            <p className="text-3xl font-semibold text-red-600">{escalated}</p>
          </div>
        </div>

        {data?.hotspots?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-sm font-semibold text-red-700">Hotspots Detected</p>
            </div>
            <p className="text-xs text-red-500 mb-3">Departments with 5+ cases in the same category — immediate attention required</p>
            <div className="flex flex-col gap-2">
              {data.hotspots.map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-white border border-red-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{h._id.department}</span>
                    <span className="text-xs text-slate-400">—</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{h._id.category}</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{h.count} cases</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Cases by Department</h2>
            {deptData.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="cases" radius={[4, 4, 0, 0]}>
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Cases by Category</h2>
            {categoryData.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Cases by Status</h2>
          {statusData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="cases" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  );
}