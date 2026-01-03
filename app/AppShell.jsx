'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { Navigation } from '@/app/components/Navigation';
import Sidebar from '@/app/components/Sidebar';
import { useAuth } from '@/app/context/AuthContext';

export function AppShell({ children }) {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const pathname = usePathname();

  const isHome = pathname === '/';

  // Show Navbar:
  const showNavbar = isHome || (!user && !loading);

  // Show Sidebar:
  const showSidebar = !!user && !isHome;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    setSidebarCollapsed(isMobile);
  }, []);

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
