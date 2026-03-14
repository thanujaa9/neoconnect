'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== 'admin') { router.push('/dashboard'); return; }
    setUser(parsed);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.getAllUsers();
    setUsers(Array.isArray(res) ? res : []);
    setLoading(false);
  };

  const handleRoleChange = async (id, role) => {
    setUpdating(id);
    await api.updateUserRole(id, role);
    await fetchUsers();
    setUpdating(null);
  };

  const roleColors = {
    'staff': 'bg-slate-100 text-slate-700',
    'secretariat': 'bg-blue-50 text-blue-700',
    'case_manager': 'bg-teal-50 text-teal-700',
    'admin': 'bg-purple-50 text-purple-700',
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    staff: users.filter(u => u.role === 'staff').length,
    managers: users.filter(u => u.role === 'case_manager').length,
    secretariat: users.filter(u => u.role === 'secretariat').length,
  };

  return (
    <Layout user={user}>
      <div className="max-w-4xl">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage user accounts and roles</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total Users</p>
            <p className="text-2xl font-semibold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Staff</p>
            <p className="text-2xl font-semibold text-slate-600">{stats.staff}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Case Managers</p>
            <p className="text-2xl font-semibold text-teal-600">{stats.managers}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Secretariat</p>
            <p className="text-2xl font-semibold text-blue-600">{stats.secretariat}</p>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Current Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-teal-700">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.department || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[u.role]}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u._id === user?.id ? (
                        <span className="text-xs text-slate-400">You</span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={updating === u._id}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                        >
                          <option value="staff">Staff</option>
                          <option value="secretariat">Secretariat</option>
                          <option value="case_manager">Case Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}