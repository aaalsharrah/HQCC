'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Home, Users, Calendar, QrCode, LogOut, MessageCircle, Bell, CalendarDays } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/client';

export function TimelineSidebar() {
  const { user, loading, signOutUser } = useAuth();
  const [postCount, setPostCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoadingStats(false);
      return;
    }

    const fetchUserPostCount = async () => {
      try {
        const postsRef = collection(firestore, 'posts');
        const q = query(postsRef, where('authorId', '==', user.uid));
        const snapshot = await getDocs(q);
        setPostCount(snapshot.size);
      } catch (error) {
        console.error('Error fetching user post count:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchUserPostCount();
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  const navItems = [
    { label: 'Timeline', href: '/timeline', icon: Home },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Messages', href: '/messages', icon: MessageCircle },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Events', href: '/events', icon: CalendarDays },
  ];

  const footerNavItems = [
    { label: 'About', href: '/#about', icon: Users },
    { label: 'Activities', href: '/#activities', icon: Calendar },
    { label: 'Team', href: '/#team', icon: Users },
    { label: 'Join', href: '/#join', icon: QrCode },
  ];

  return (
    <aside className="w-full lg:w-80 shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* User Profile Card */}
        {loading ? (
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : user ? (
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate">
                  {user.displayName || user.email.split('@')[0]}
                </h3>
                <p className="text-sm text-foreground/60 truncate">{user.email}</p>
              </div>
            </div>
            {isLoadingStats ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : (
              <div className="pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{postCount}</div>
                  <div className="text-xs text-foreground/60 uppercase tracking-wide">Posts</div>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-4 border-destructive/30 hover:border-destructive hover:bg-destructive/10 text-destructive"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Join the Community</h3>
            <p className="text-sm text-foreground/60 mb-4">
              Sign in to view and participate in the community timeline
            </p>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href="/#join">Sign In</a>
            </Button>
          </div>
        )}

        {/* Main Navigation Links */}
        {user && (
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Community</h4>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors group"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        )}

        {/* Footer Navigation Links */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Website</h4>
          <nav className="space-y-2">
            <a
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors group"
            >
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Home</span>
            </a>
            {footerNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors group"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}

