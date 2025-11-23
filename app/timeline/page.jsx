'use client';

import { TimelineNav } from '../components/TimelineNav';
import { TimelineSidebar } from '../components/TimelineSidebar';
import { Timeline } from '../components/Timeline';

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-background">
      <TimelineNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <TimelineSidebar />
          <div className="flex-1 w-full min-w-0">
            <Timeline />
          </div>
        </div>
      </div>
    </div>
  );
}

