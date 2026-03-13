'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function TrackCase() {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    const res = await api.trackCase(trackingId);
    if (res.trackingId) {
      setResult(res);
    } else {
      setError('Case not found');
    }
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-slate-200 p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="font-semibold text-lg text-slate-800">NeoConnect</span>
        </div>

        <h1 className="text-xl font-semibold text-slate-800 mb-1">Track your case</h1>
        <p className="text-slate-500 text-sm mb-6">Enter your tracking ID to check status</p>

        <form onSubmit={handleTrack} className="flex flex-col gap-3">
          <input
            type="text"
            value={trackingId}
            onChange={e => setTrackingId(e.target.value)}
            placeholder="NEO-2024-001"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Case'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mt-4 text-sm">{error}</div>
        )}

        {result && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">{result.trackingId}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[result.status]}`}>
                {result.status}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="text-slate-800">{result.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department</span>
                <span className="text-slate-800">{result.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Severity</span>
                <span className="text-slate-800">{result.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned to</span>
                <span className="text-slate-800">{result.assignedTo}</span>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          <a href="/" className="text-indigo-600 hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  );
}