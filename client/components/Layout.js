'use client';
import Sidebar from './Sidebar';

export default function Layout({ user, children }) {
  return (
    <div className="flex min-h-screen">
      <div className="w-64 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Sidebar user={user} />
      </div>
      <main className="flex-1 p-8 bg-slate-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}