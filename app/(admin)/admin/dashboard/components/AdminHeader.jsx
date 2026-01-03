'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function AdminHeader() {
  return (
    <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">
              <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </h1>
            <p className="text-foreground/60">
              Manage your quantum computing club
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/member/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
