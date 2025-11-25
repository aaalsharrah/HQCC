'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  Home,
  Clock,
  MessageCircle,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
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
<<<<<<< HEAD
  { label: 'Profile', href: '/member/profile', icon: User },
=======
  { label: 'Profile', href: '/member/profile/test', icon: User }, // later: swap 'test'
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
  { label: 'Settings', href: '/member/settings', icon: User },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'member' | null
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);

      if (!user) {
        setRole(null);
        setLoadingRole(false);
        return;
      }

      try {
        const ref = doc(db, 'members', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setRole(null);
      } finally {
        setLoadingRole(false);
      }
    });

    return () => unsub();
  }, []);
  const handleLogout = async () => {
    try {
      // ❌ Clear cookies for middleware
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
      .replace(/[^a-z0-9]/g, '') || 'member';

  const avatarUrl = currentUser?.photoURL || '/quantum-computing-student.jpg';

  // Build nav items including admin if role is admin
  const navItems = [
    ...baseNavItems,
    ...(role === 'admin'
      ? [
          {
            label: 'Admin',
            href: '/admin/dashboard',
            icon: Shield,
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 z-30
        h-screen border-r border-border 
        bg-card/80 backdrop-blur-xl 
        transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        hidden md:flex flex-col
      `}
    >
      {/* TOP */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        {!collapsed && (
          <span className="font-bold text-lg bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            HQCC
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-full border border-border/60 hover:bg-muted/60 transition-colors"
          type="button"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* NAV ITEMS */}
      <nav className="flex-1 mt-4 space-y-1 px-2 overflow-y-auto">
        {/* Optionally, while loading role you can show only base items or a skeleton.
            Right now we still show base + (maybe) admin once role loads. */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM – Profile + Logout */}
      <div className="border-t border-border/60 p-4">
        <div
          className={`flex items-center gap-3 mb-3 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Avatar className="h-10 w-10 border border-primary/20">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>
              {displayName.slice(0, 1).toUpperCase()}
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

        <button
          onClick={handleLogout}
          type="button"
          className={`flex w-full items-center ${
            collapsed ? 'justify-center' : 'justify-start'
          } gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors`}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
