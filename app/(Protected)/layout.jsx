// app/(protected)/layout.jsx
'use client';

export default function ProtectedLayout({ children }) {
  // Sidebar & Navbar are handled globally by AppShell
  return <div className="min-h-screen bg-background">{children}</div>;
}
