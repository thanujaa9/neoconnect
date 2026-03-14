'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function PublicHub() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [digest, setDigest] = useState([]);
  const [impact, setImpact] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('digest');
  const [uploading, setUploading] = useState(false);
  const [minuteTitle, setMinuteTitle] = useState('');
  const [minuteFile, setMinuteFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    setUser(JSON.parse(stored));
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [d, i, m] = await Promise.all([
      api.getDigest(),
      api.getImpact(),
      api.getMinutes()
    ]);
    setDigest(Array.isArray(d) ? d : []);
    setImpact(Array.isArray(i) ? i : []);
    setMinutes(Array.isArray(m) ? m : []);
    setLoading(false);
  };

  const handleUploadMinutes = async (e) => {
    e.preventDefault();
    if (!minuteFile || !minuteTitle) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('title', minuteTitle);
    formData.append('file', minuteFile);
    await api.uploadMinutes(formData);
    setMinuteTitle('');
    setMinuteFile(null);
    setUploading(false);
    fetchAll();
  };

  const filteredMinutes = minutes.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const categoryColors = {
    'Safety': 'bg-red-50 text-red-700 border-red-200',
    'HR': 'bg-purple-50 text-purple-700 border-purple-200',
    'Facilities': 'bg-blue-50 text-blue-700 border-blue-200',
    'Policy': 'bg-amber-50 text-amber-700 border-amber-200',
    'Other': 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <Layout user={user}>
      <div className="max-w-4xl">

        <div className="bg-slate-900 rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500 opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-teal-400"></div>
              <span className="text-teal-400 text-xs font-medium uppercase tracking-wider">Transparency Portal</span>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">Public Hub</h1>
            <p className="text-slate-400 text-sm max-w-lg">Every voice matters. See how staff feedback is driving real change across the organisation — tracked, resolved, and published here.</p>
            <div className="flex gap-6 mt-6">
              <div>
                <p className="text-2xl font-semibold text-teal-400">{digest.length}</p>
                <p className="text-slate-500 text-xs mt-0.5">Cases resolved</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-teal-400">{impact.length}</p>
                <p className="text-slate-500 text-xs mt-0.5">Actions taken</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-teal-400">{minutes.length}</p>
                <p className="text-slate-500 text-xs mt-0.5">Meeting minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { key: 'digest', label: 'Quarterly Digest' },
            { key: 'impact', label: 'Impact Tracking' },
            { key: 'minutes', label: 'Minutes Archive' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === t.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        ) : (
          <>
            {tab === 'digest' && (
              <div>
                {digest.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="w-5 h-5 border-2 border-slate-300 rounded"></div>
                    </div>
                    <p className="text-slate-500 text-sm">No resolved cases published yet.</p>
                    <p className="text-slate-400 text-xs mt-1">Resolved cases will appear here once closed by a case manager.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {digest.map((c, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-300 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">{c.trackingId}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${categoryColors[c.category] || categoryColors['Other']}`}>
                                {c.category}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-1">{c.title}</h3>
                            <p className="text-xs text-slate-500">{c.department}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1.5 justify-end mb-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              <span className="text-xs text-green-600 font-medium">Resolved</span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '—'}
                            </p>
                            {c.assignedTo?.name && (
                              <p className="text-xs text-slate-400 mt-0.5">by {c.assignedTo.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'impact' && (
              <div>
                <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs text-teal-700">This table shows the direct impact of staff feedback — what was raised, what action was taken, and what changed as a result.</p>
                </div>

                {impact.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <p className="text-slate-500 text-sm">No impact records yet.</p>
                    <p className="text-slate-400 text-xs mt-1">Records appear when case managers submit resolution summaries.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {impact.map((c, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">What was raised</p>
                            <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{c.department} · {c.category}</p>
                            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full border font-medium ${categoryColors[c.category] || categoryColors['Other']}`}>
                              {c.severity} severity
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Action taken</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{c.resolution?.summary}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">What changed</p>
                            <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              {c.resolution?.outcome}
                            </span>
                            <p className="text-xs text-slate-400 mt-2">
                              {c.resolution?.resolvedAt ? new Date(c.resolution.resolvedAt).toLocaleDateString() : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'minutes' && (
              <div>
                {(user?.role === 'secretariat' || user?.role === 'admin') && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3">Upload Meeting Minutes</h2>
                    <form onSubmit={handleUploadMinutes} className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={minuteTitle}
                        onChange={e => setMinuteTitle(e.target.value)}
                        placeholder="e.g. JCC Meeting Q1 2024"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors">
                        <p className="text-sm text-slate-500">{minuteFile ? minuteFile.name : 'Click to upload PDF'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">PDF files only</p>
                        <input type="file" onChange={e => setMinuteFile(e.target.files[0])} className="hidden" accept=".pdf" />
                      </label>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                      >
                        {uploading ? 'Uploading...' : 'Upload Minutes'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="mb-4">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search meeting minutes..."
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {filteredMinutes.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <p className="text-slate-500 text-sm">No minutes found.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredMinutes.map((m, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-teal-300 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-red-600">PDF</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {m.uploadedBy?.name} · {new Date(m.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                          <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${m.fileUrl}`}
                          target="_blank"
                          className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors shrink-0"
                        >
                          View PDF
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}