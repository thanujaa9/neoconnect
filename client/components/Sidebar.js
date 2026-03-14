'use client';
import { useRouter } from 'next/navigation';
import Logo from './Logo';

const links = {
  staff: [
    { label: 'Dashboard', href: '/staff-dashboard' },
    { label: 'Submit Case', href: '/submit' },
    { label: 'Track Case', href: '/track' },
    { label: 'Polls', href: '/polls' },
    { label: 'Public Hub', href: '/hub' },
  ],
  secretariat: [
    { label: 'All Cases', href: '/cases' },
    { label: 'My Assigned Cases', href: '/secretariat-cases' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Polls', href: '/polls' },
    { label: 'Public Hub', href: '/hub' },
  ],
  case_manager: [
    { label: 'My Cases', href: '/mycases' },
    { label: 'Polls', href: '/polls' },
    { label: 'Public Hub', href: '/hub' },
  ],
  admin: [
    { label: 'All Cases', href: '/cases' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Polls', href: '/polls' },
    { label: 'Public Hub', href: '/hub' },
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
    <div className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#0f172a"/>
            <path d="M10 26V10L18 18L26 10V26" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="18" cy="18" r="2.5" fill="#14b8a6"/>
          </svg>
          <span className="font-semibold text-lg text-white">NeoConnect</span>
        </div>
        <p className="text-slate-500 text-xs mt-2 capitalize">{user?.role?.replace('_', ' ')}</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navLinks.map(link => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            className="text-left px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 opacity-60"></span>
            {link.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-slate-400 text-xs mb-1">{user?.name}</p>
        <p className="text-slate-600 text-xs mb-3">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}