'use client';

import { useState, useEffect } from 'react';
import { Loader2, CalendarDays } from 'lucide-react';
import { TimelineNav } from '../components/TimelineNav';
import { TimelineSidebar } from '../components/TimelineSidebar';
import { useAuth } from '@/lib/firebase/auth-context';

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TimelineNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <TimelineSidebar />
          <div className="flex-1 w-full min-w-0">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-12 text-center">
              <CalendarDays className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Events</h1>
              <p className="text-foreground/60 mb-6">
                Events and registration system coming soon
              </p>
              {!user && (
                <p className="text-sm text-foreground/50">
                  Sign in to view and register for events
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

