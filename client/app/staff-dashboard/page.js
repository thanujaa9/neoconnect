'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myIds, setMyIds] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    setUser(JSON.parse(stored));
    const saved = JSON.parse(localStorage.getItem('myTrackingIds') || '[]');
    setMyIds(saved);
  }, []);

  const statusColor = {
    'New': 'bg-slate-800 text-slate-300',
    'Assigned': 'bg-blue-950 text-blue-300',
    'In Progress': 'bg-teal-950 text-teal-300',
    'Pending': 'bg-amber-950 text-amber-300',
    'Resolved': 'bg-green-950 text-green-300',
    'Escalated': 'bg-red-950 text-red-300',
  };

  return (
    <Layout user={user}>
      <div className="max-w-3xl">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-800">Welcome, {user?.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's your activity overview</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Cases submitted</p>
            <p className="text-2xl font-semibold text-slate-800">{myIds.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Department</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{user?.department || '—'}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Role</p>
            <p className="text-sm font-semibold text-teal-600 mt-1 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => router.push('/submit')}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl p-5 text-left transition-colors"
          >
            <p className="font-semibold mb-1">Submit a Case</p>
            <p className="text-teal-100 text-xs">Raise a complaint or feedback</p>
          </button>
          <button
            onClick={() => router.push('/track')}
            className="bg-white border border-slate-200 hover:border-teal-400 rounded-xl p-5 text-left transition-colors"
          >
            <p className="font-semibold text-slate-800 mb-1">Track a Case</p>
            <p className="text-slate-400 text-xs">Check status using tracking ID</p>
          </button>
        </div>

        {myIds.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Your Submitted Cases</h2>
            <div className="flex flex-col gap-2">
              {myIds.map((item, i) => (
  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div>
      <span className="font-mono text-teal-600 text-xs">{item.id}</span>
      <p className="text-sm text-slate-700 mt-0.5">{item.title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{item.date}</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          localStorage.setItem('trackSearch', item.id);
          router.push('/track');
        }}
        className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:border-teal-400 transition-colors"
      >
        Track
      </button>
      <button
  onClick={() => router.push(`/mycase/${item.caseId}`)}
  className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors"
>
  View
</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {myIds.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">You haven't submitted any cases yet.</p>
            <button
              onClick={() => router.push('/submit')}
              className="mt-3 text-sm text-teal-600 hover:underline"
            >
              Submit your first case →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}