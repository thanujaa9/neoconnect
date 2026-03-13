'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function PollsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    setUser(JSON.parse(stored));
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    const res = await api.getPolls();
    setPolls(Array.isArray(res) ? res : []);
    setLoading(false);
  };

  const handleVote = async (pollId, optionId) => {
    await api.vote(pollId, optionId);
    fetchPolls();
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const filtered = newPoll.options.filter(o => o.trim());
    if (filtered.length < 2) return;
    await api.createPoll({ question: newPoll.question, options: filtered });
    setNewPoll({ question: '', options: ['', ''] });
    fetchPolls();
  };

  const hasVoted = (poll) => {
    return poll.options.some(o => o.votes.includes(user?.id));
  };

  const totalVotes = (poll) => {
    return poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  };

  return (
    <Layout user={user}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Polls</h1>
        <p className="text-slate-500 text-sm mb-6">Vote on active polls</p>

        {(user?.role === 'secretariat' || user?.role === 'admin') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Create Poll</h2>
            <form onSubmit={handleCreatePoll} className="flex flex-col gap-3">
              <input
                type="text"
                value={newPoll.question}
                onChange={e => setNewPoll({ ...newPoll, question: e.target.value })}
                placeholder="Poll question"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              {newPoll.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  value={opt}
                  onChange={e => {
                    const updated = [...newPoll.options];
                    updated[i] = e.target.value;
                    setNewPoll({ ...newPoll, options: updated });
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ))}
              <button
                type="button"
                onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })}
                className="text-sm text-indigo-600 hover:underline text-left"
              >
                + Add option
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm"
              >
                Create Poll
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : polls.length === 0 ? (
          <p className="text-slate-500 text-sm">No polls yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {polls.map(poll => (
              <div key={poll._id} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-800">{poll.question}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${poll.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {poll.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {poll.options.map(option => {
                    const total = totalVotes(poll);
                    const pct = total > 0 ? Math.round((option.votes.length / total) * 100) : 0;
                    const voted = hasVoted(poll);

                    return (
                      <div key={option._id}>
                        {!voted && poll.isActive ? (
                          <button
                            onClick={() => handleVote(poll._id, option._id)}
                            className="w-full text-left px-4 py-2.5 border border-slate-300 rounded-lg text-sm hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                          >
                            {option.text}
                          </button>
                        ) : (
                          <div>
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                              <span>{option.text}</span>
                              <span>{pct}% ({option.votes.length})</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-indigo-500 h-2 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-3">{totalVotes(poll)} total votes</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}