'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/'); return; }
    const user = JSON.parse(stored);
    if (user.role === 'staff') router.push('/staff-dashboard');
    if (user.role === 'secretariat') router.push('/cases');
    if (user.role === 'case_manager') router.push('/mycases');
    if (user.role === 'admin') router.push('/cases');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-500 text-sm">Redirecting...</p>
    </div>
  );
}