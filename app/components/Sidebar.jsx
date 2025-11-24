'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Home,
  Clock,
  MessageCircle,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Timeline', href: '/member/timeline', icon: Clock },
  { label: 'Community', href: '/member/community', icon: User },
  { label: 'Events', href: '/member/events', icon: User },
  { label: 'Messages', href: '/member/messages', icon: MessageCircle },
  { label: 'Notifications', href: '/member/notifications', icon: Bell },

  { label: 'Profile', href: '/member/profile/test', icon: User },
  { label: 'Settings', href: '/member/settings', icon: User },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    console.log('Logging out…');
  };

  return (
    <aside
      className={`
      fixed top-16 left-0 z-30
      h-[calc(100vh-4rem)] border-r border-border 
      bg-card/80 backdrop-blur-xl 
      transition-all duration-300
      ${collapsed ? 'w-20' : 'w-64'}
      hidden md:flex flex-col
    `}
    >
      {/* TOP */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        {!collapsed && (
          <span className="font-bold text-lg bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            HQCC
          </span>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-1 rounded-full border border-border/60 hover:bg-muted/60 transition-colors"
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
            <AvatarImage src="/quantum-computing-student.jpg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Your Name</p>
              <p className="text-xs text-muted-foreground truncate">
                @username
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
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
