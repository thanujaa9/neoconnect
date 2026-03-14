'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

export default function TrackCase() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefill = localStorage.getItem('trackSearch');
    if (prefill) {
      setTrackingId(prefill);
      localStorage.removeItem('trackSearch');
    }
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    const res = await api.trackCase(trackingId);
    if (res.trackingId) {
      setResult(res);
    } else {
      setError('Case not found. Check your tracking ID.');
    }
    setLoading(false);
  };

  const statusColor = {
    'New': 'bg-slate-800 text-slate-300',
    'Assigned': 'bg-blue-950 text-blue-300',
    'In Progress': 'bg-teal-950 text-teal-300',
    'Pending': 'bg-amber-950 text-amber-300',
    'Resolved': 'bg-green-950 text-green-300',
    'Escalated': 'bg-red-950 text-red-300',
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Logo size="md" />
        </div>

        <h1 className="text-2xl font-semibold text-white mb-1">Track your case</h1>
        <p className="text-slate-400 text-sm mb-8">Enter your tracking ID to check status</p>

        <form onSubmit={handleTrack} className="flex flex-col gap-3">
          <input
            type="text"
            value={trackingId}
            onChange={e => setTrackingId(e.target.value)}
            placeholder="NEO-2024-001"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Case'}
          </button>
        </form>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 px-4 py-3 rounded-lg mt-4 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-mono text-teal-400">{result.trackingId}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[result.status]}`}>
                {result.status}
              </span>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="text-slate-200">{result.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department</span>
                <span className="text-slate-200">{result.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Severity</span>
                <span className="text-slate-200">{result.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned to</span>
                <span className="text-slate-200">{result.assignedTo}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push('/staff-dashboard')}
          className="mt-6 text-sm text-teal-400 hover:underline block"
        >
          ← Back to dashboard
        </button>
      </div>
    </div>
  );
}