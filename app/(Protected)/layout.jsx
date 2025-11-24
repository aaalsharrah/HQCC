// app/(protected)/layout.jsx (example)
'use client';

import Sidebar from '../components/Sidebar';

export default function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16 flex">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
