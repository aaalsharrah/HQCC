'use client';

import { Users, QrCode, Calendar, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export function Join() {
  return (
    <section
      id="join"
      className="py-32 px-4 sm:px-6 lg:px-8 relative bg-linear-to-b from-card/20 to-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            Join the Quantum Revolution
          </h2>
          <p className="text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed">
            Become part of Hofstra&apos;s quantum computing community and shape
            the future of technology.
          </p>
        </div>

        {/* NEW: Replace Signup Form With CTA Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side — 3 CTA Cards */}
          <div className="space-y-6">
            {/* Become a Member */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <UserPlus className="w-10 h-10 text-primary" />
                <h3 className="text-2xl font-semibold text-foreground">
                  Become an Official Member
                </h3>
              </div>
              <p className="text-foreground/60 mb-6 leading-relaxed">
                Get access to exclusive events, workshops, hackathons, research
                teams, and leadership opportunities.
              </p>

              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
              >
                <Link href="/signup">Create Your Account</Link>
              </Button>
            </div>

            {/* Join Discord */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <QrCode className="w-10 h-10 text-secondary" />
                <h3 className="text-2xl font-semibold text-foreground">
                  Join Our Discord
                </h3>
              </div>
              <p className="text-foreground/60 mb-6 leading-relaxed">
                Connect with members, ask questions, share resources, and stay
                up-to-date on announcements.
              </p>

              {/* Placeholder QR — replace with your real QR */}

              <Button
                asChild
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-6 text-lg"
              >
                <a href="https://discord.gg/7uSJxdHd" target="_blank">
                  Join Discord
                </a>
              </Button>
            </div>
          </div>

          {/* Right Side — Meeting Info */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-10 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <Calendar className="w-12 h-12 text-accent" />
              <h3 className="text-3xl font-semibold text-foreground">
                Weekly Meetings
              </h3>
            </div>

            <p className="text-lg text-foreground/70 leading-relaxed mb-6">
              Attend discussions, workshops, and collaborative projects with one
              of Hofstra&apos;s fastest-growing tech communities.
            </p>

            <div className="bg-background/40 border border-border rounded-xl p-6 text-center">
              <p className="text-foreground text-xl font-semibold mb-2">
                Thursdays @ 6:00 PM
              </p>
              <p className="text-foreground/60 text-sm">
                Adams Hall – Engineering Lab 201
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 text-center">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 inline-block">
          <p className="text-foreground/60 mb-2">
            © 2025 Hofstra Quantum Computing Club
          </p>
          <p className="text-foreground/50 text-sm">
            Shaping the future, one qubit at a time
          </p>
        </div>
      </footer>
    </section>
  );
}
