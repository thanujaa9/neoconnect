'use client';
import { useRouter } from 'next/navigation';

const links = {
  staff: [
    { label: 'Submit Case', href: '/submit' },
    { label: 'Track Case', href: '/track' },
    { label: 'Polls', href: '/polls' },
  ],
  secretariat: [
    { label: 'All Cases', href: '/cases' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Polls', href: '/polls' },
  ],
  case_manager: [
    { label: 'My Cases', href: '/mycases' },
    { label: 'Polls', href: '/polls' },
  ],
  admin: [
    { label: 'All Cases', href: '/cases' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Polls', href: '/polls' },
  ],
};

export default function Sidebar({ user }) {
  const router = useRouter();
  const navLinks = links[user?.role] || [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="w-64 min-h-screen bg-slate-800 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="font-semibold text-lg">NeoConnect</span>
        </div>
        <p className="text-slate-400 text-xs mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navLinks.map(link => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            className="text-left px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
          >
            {link.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-slate-400 text-xs mb-2">{user?.name}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}