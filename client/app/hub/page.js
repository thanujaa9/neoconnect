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

  const tabs = ['digest', 'impact', 'minutes'];

  return (
    <Layout user={user}>
      <div className="max-w-4xl">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-800">Public Hub</h1>
          <p className="text-slate-500 text-sm mt-0.5">See how staff feedback is creating real change</p>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                ${tab === t
                  ? 'bg-teal-600 text-white'
                  : 'border border-slate-300 text-slate-600 hover:border-teal-400'}`}
            >
              {t === 'digest' ? 'Quarterly Digest' : t === 'impact' ? 'Impact Tracking' : 'Minutes Archive'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : (
          <>
            {tab === 'digest' && (
              <div className="flex flex-col gap-4">
                {digest.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                    <p className="text-slate-500 text-sm">No resolved cases yet.</p>
                  </div>
                ) : digest.map((c, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-teal-600">{c.trackingId}</span>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Resolved</span>
                      <span className="text-xs text-slate-400">{c.category}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">{c.title}</h3>
                    <p className="text-xs text-slate-500">{c.department} · Handled by {c.assignedTo?.name || 'Management'}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'impact' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {impact.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-slate-500 text-sm">No resolved cases with resolution summaries yet.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">What was raised</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Action taken</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {impact.map((c, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800">{c.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{c.department} · {c.category}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{c.resolution?.summary}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                              {c.resolution?.outcome}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === 'minutes' && (
              <div>
                {(user?.role === 'secretariat' || user?.role === 'admin') && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3">Upload Meeting Minutes</h2>
                    <form onSubmit={handleUploadMinutes} className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={minuteTitle}
                        onChange={e => setMinuteTitle(e.target.value)}
                        placeholder="Meeting title e.g. JCC Q1 2024"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors">
                        <p className="text-sm text-slate-500">{minuteFile ? minuteFile.name : 'Click to upload PDF'}</p>
                        <input
                          type="file"
                          onChange={e => setMinuteFile(e.target.files[0])}
                          className="hidden"
                          accept=".pdf"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Upload Minutes'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="mb-3">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search minutes..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {filteredMinutes.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                    <p className="text-slate-500 text-sm">No minutes uploaded yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredMinutes.map((m, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{m.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Uploaded by {m.uploadedBy?.name} · {new Date(m.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                          <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${m.fileUrl}`}
                          target="_blank"
                          className="text-xs bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
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