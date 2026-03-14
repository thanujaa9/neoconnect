'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function MyCaseDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    setUser(JSON.parse(stored));
    fetchCase();
  }, []);

  const fetchCase = async () => {
  const res = await api.getCase(id);
  console.log('case data:', res);
  setCaseData(res);
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

  const severityColor = {
    'Low': 'text-green-600',
    'Medium': 'text-amber-600',
    'High': 'text-red-600',
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
      <div className="max-w-2xl">
        <button
          onClick={() => router.push('/staff-dashboard')}
          className="text-sm text-teal-600 hover:underline mb-4 block"
        >
          ← Back to dashboard
        </button>

        <div className={`bg-white border border-slate-200 ${severityBorder[caseData.severity]} rounded-xl p-6 mb-4`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">{caseData.trackingId}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[caseData.status]}`}>
                  {caseData.status}
                </span>
              </div>
              <h1 className="text-xl font-semibold text-slate-800">{caseData.title}</h1>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{caseData.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-0.5">Category</p>
              <p className="text-slate-800 font-medium">{caseData.category}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-0.5">Severity</p>
              <p className={`font-medium ${severityColor[caseData.severity]}`}>{caseData.severity}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-0.5">Department</p>
              <p className="text-slate-800 font-medium">{caseData.department}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-0.5">Location</p>
              <p className="text-slate-800 font-medium">{caseData.location || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-0.5">Submitted on</p>
              <p className="text-slate-800 font-medium">{caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-0.5">Assigned to</p>
              <p className="text-slate-800 font-medium">{caseData.assignedTo?.name || 'Not assigned yet'}</p>
            </div>
          </div>

          {caseData.fileUrl && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500 mb-2">Attached file</p>
              
                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${caseData.fileUrl}`}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm text-teal-600 bg-teal-50 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors"
              >
                View attachment
              </a>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Case Progress</h2>
          <p className="text-xs text-slate-400 mb-4">You will be notified when your case is updated</p>
          <div className="flex items-center gap-2">
            {['New', 'Assigned', 'In Progress', 'Resolved'].map((s, i) => {
              const steps = ['New', 'Assigned', 'In Progress', 'Resolved'];
              const currentIndex = steps.indexOf(caseData.status);
              const stepIndex = steps.indexOf(s);
              const isActive = stepIndex <= currentIndex;
              const isEscalated = caseData.status === 'Escalated';
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`flex-1 h-1.5 rounded-full ${isActive ? 'bg-teal-500' : 'bg-slate-200'} ${isEscalated && s === 'In Progress' ? 'bg-red-400' : ''}`}></div>
                  {i === steps.length - 1 && (
                    <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            {['New', 'Assigned', 'In Progress', 'Resolved'].map(s => (
              <span key={s} className={`text-xs ${caseData.status === s ? 'text-teal-600 font-medium' : 'text-slate-400'}`}>{s}</span>
            ))}
          </div>
          {caseData.status === 'Escalated' && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs text-red-600 font-medium">This case has been escalated to management</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}