'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);

    if (parsed.role === 'staff') router.push('/submit');
    if (parsed.role === 'secretariat') router.push('/cases');
    if (parsed.role === 'case_manager') router.push('/mycases');
    if (parsed.role === 'admin') router.push('/cases');
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <p className="text-slate-500">Redirecting...</p>
    </div>
  );
}