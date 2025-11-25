'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { Navigation } from '@/app/components/Navigation';
import Sidebar from '@/app/components/Sidebar';

import { auth } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function AppShell({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser || null);
    });
    return () => unsub();
  }, []);

  const isHome = pathname === '/';

  // Show Navbar:
  const showNavbar = isHome || (!user && user !== undefined);

  // Show Sidebar:
  const showSidebar = !!user && !isHome;

  // Match content margin to sidebar width
  const contentMarginClass = showSidebar
    ? sidebarCollapsed
      ? 'md:ml-20'
      : 'md:ml-64'
    : '';

  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navigation />}

      {showSidebar && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
      )}

      <div className={contentMarginClass}>{children}</div>
    </div>
  );
}
