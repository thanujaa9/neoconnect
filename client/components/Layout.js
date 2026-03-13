'use client';
import Sidebar from './Sidebar';

export default function Layout({ user, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 p-8 bg-slate-50">
        {children}
      </main>
    </div>
  );
}