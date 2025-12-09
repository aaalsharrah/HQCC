'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function MemberLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Send to signin, preserving where they wanted to go
      const next = encodeURIComponent(pathname || '/member/timeline');
      router.replace(`/signin?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    // Nice loading state while Firebase restores the session
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    // Redirect is in progress
    return null;
  }

  // ✅ Authenticated member – render the actual page
  return <div className="min-h-screen bg-background">{children}</div>;
}
