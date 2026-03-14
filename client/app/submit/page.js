'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

function PastCases() {
  const router = useRouter();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('myTrackingIds') || '[]');
    setIds(saved);
  }, []);

  if (ids.length === 0) return null;

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Your Submitted Cases</h2>
      <div className="flex flex-col gap-2">
        {ids.map((item, i) => (
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
  );
}

export default function SubmitCase() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Safety',
    department: '',
    location: '',
    severity: 'Low',
    isAnonymous: false,
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    setUser(JSON.parse(stored));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    if (file) formData.append('file', file);
    const res = await api.submitCase(formData);
    if (res.trackingId) {
      const saved = JSON.parse(localStorage.getItem('myTrackingIds') || '[]');
      saved.push({ id: res.trackingId, caseId: res._id, title: form.title, date: new Date().toLocaleDateString() });
      localStorage.setItem('myTrackingIds', JSON.stringify(saved));
      setSuccess(`Case submitted! Your tracking ID is: ${res.trackingId}`);
      setForm({ title: '', description: '', category: 'Safety', department: '', location: '', severity: 'Low', isAnonymous: false });
      setFile(null);
    } else {
      setError(res.message || 'Submission failed');
    }
    setLoading(false);
  };

  return (
    <Layout user={user}>
      <div className="max-w-2xl">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-800">Submit a Case</h1>
          <p className="text-slate-500 text-sm mt-0.5">Raise a complaint or feedback. You can submit anonymously.</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              placeholder="Brief title of the issue"
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              placeholder="Describe the issue in detail..."
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {['Safety', 'Policy', 'Facilities', 'HR', 'Other'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={e => setForm({ ...form, severity: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {['Low', 'Medium', 'High'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Department</label>
              <input
                type="text"
                value={form.department}
                placeholder="Your department"
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                placeholder="Office / floor / site"
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Attach file (optional)</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors">
              <p className="text-sm text-slate-500">{file ? file.name : 'Drop file here or click to upload'}</p>
              <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>
              <input
                type="file"
                onChange={e => setFile(e.target.files[0])}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-lg">
            <input
              type="checkbox"
              id="anon"
              checked={form.isAnonymous}
              onChange={e => setForm({ ...form, isAnonymous: e.target.checked })}
              className="w-4 h-4 accent-teal-600"
            />
            <div>
              <label htmlFor="anon" className="text-sm font-medium text-slate-700 cursor-pointer">Submit anonymously</label>
              <p className="text-xs text-slate-400">Your name will not be visible to anyone</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Case'}
          </button>
        </form>

        <PastCases />
      </div>
    </Layout>
  );
}