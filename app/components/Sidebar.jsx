'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  Clock,
  MessageCircle,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Menu,
  AlertTriangle,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '@/app/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const baseNavItems = [
  { label: 'Timeline', href: '/member/timeline', icon: Clock },
  { label: 'Community', href: '/member/community', icon: User },
  { label: 'Events', href: '/member/events', icon: User },
  { label: 'Messages', href: '/member/messages', icon: MessageCircle },
  { label: 'Notifications', href: '/member/notifications', icon: Bell },
  { label: 'Profile', href: '/member/profile', icon: User },
  { label: 'Settings', href: '/member/settings', icon: User },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);

  // Fetch auth + role
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);

      if (!user) {
        setRole(null);
        return;
      }

      try {
        const ref = doc(db, 'members', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRole(snap.data().role || null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error(err);
        setRole(null);
      }
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      document.cookie = 'logged_in=false; Max-Age=0; path=/;';
      document.cookie = 'role=; Max-Age=0; path=/;';
      await signOut(auth);
      router.push('/signin');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const displayName =
    currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Member';

  const username =
    currentUser?.email
      ?.split('@')[0]
      ?.toLowerCase()
      ?.replace(/[^a-z0-9]/g, '') || 'member';

  const avatarUrl = currentUser?.photoURL || '/quantum-computing-student.jpg';

  const navItems = [
    ...baseNavItems,
    ...(role === 'admin'
      ? [{ label: 'Admin', href: '/admin/dashboard', icon: Shield }]
      : []),
  ];

  // Close sidebar after clicking a nav item on mobile
  const handleNavClick = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768; // Tailwind md breakpoint
      if (isMobile && !collapsed) {
        onToggle();
      }
    }
  };

  return (
    <>
      {/* MOBILE FLOATING TOGGLE – ONLY WHEN SIDEBAR IS CLOSED */}
      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed top-4 left-4 z-40 rounded-full border border-border/70 bg-card/90 backdrop-blur px-2 py-2 shadow-md md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-30
          h-screen flex flex-col
          bg-card/80 backdrop-blur-xl border-r border-border
          transition-all duration-300 transform

          /* Mobile: off-canvas */
          w-64
          ${collapsed ? '-translate-x-full' : 'translate-x-0'}

          /* Desktop: always visible; just change width */
          md:translate-x-0
          ${collapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* TOP */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          {!collapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              HQCC
            </span>
          )}

          {/* Header toggle */}
          <button
            onClick={onToggle}
            className="inline-flex p-1 rounded-full border border-border/60 hover:bg-muted/60 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick} // 👈 close on mobile after click
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }
                `}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* PROFILE + LOGOUT */}
        <div className="border-t border-border/60 p-4">
          <div
            className={`flex items-center gap-3 mb-3 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  @{username}
                </p>
                {role && (
                  <p className="text-[11px] text-primary/80 mt-0.5 uppercase tracking-wide">
                    {role}
                  </p>
                )}
              </div>
            )}
          </div>

          <Link
            href="/member/report"
            onClick={handleNavClick}
            className={`flex w-full items-center ${
              collapsed ? 'justify-center' : 'justify-start'
            } gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 mb-2`}
          >
            <AlertTriangle className="h-5 w-5" />
            {!collapsed && <span>Report an issue</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`flex w-full items-center ${
              collapsed ? 'justify-center' : 'justify-start'
            } gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
