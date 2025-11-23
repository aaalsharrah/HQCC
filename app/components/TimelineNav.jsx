'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export function TimelineNav() {
  const { user, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-xl font-bold tracking-tight transition-colors hover:text-primary">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              HQCC
            </span>
          </a>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 text-xs font-medium text-foreground/60">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Syncing...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end leading-tight text-right">
                  <span className="text-[10px] uppercase tracking-wide text-foreground/50">Signed in</span>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                    {user.displayName ?? user.email}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
              </div>
            ) : (
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <a href="/#join">Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

