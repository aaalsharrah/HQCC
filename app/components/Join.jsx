'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Mail, Users, Calendar } from 'lucide-react';
import Image from 'next/image';

export function Join() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section
      id="join"
      className="py-32 px-4 sm:px-6 lg:px-8 relative bg-linear-to-b from-card/20 to-background"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            Join the Quantum Revolution
          </h2>
          <p className="text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed">
            Become part of Hofstra&apos;s quantum computing community and shape
            the future of technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6">
              Sign Up for Updates
            </h3>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground mb-2 block">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    className="bg-background/50 border-border focus:border-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@hofstra.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border focus:border-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="year" className="text-foreground mb-2 block">
                    Year
                  </Label>
                  <Input
                    id="year"
                    placeholder="Freshman, Sophomore, etc."
                    className="bg-background/50 border-border focus:border-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="major" className="text-foreground mb-2 block">
                    Major
                  </Label>
                  <Input
                    id="major"
                    placeholder="Computer Science, Physics, etc."
                    className="bg-background/50 border-border focus:border-primary"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
                >
                  Join Interest List
                </Button>
              </form>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Thanks for joining!
                </h4>
                <p className="text-foreground/60">
                  We&apos;ll be in touch soon with club updates.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 text-center hover:bg-card hover:scale-105 transition-all duration-300">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Scan to Join
              </h3>
              <div className="bg-white rounded-xl p-6 inline-block mb-4">
                <Image
                  src="/qr-code.png"
                  alt="QR Code to join HQCC"
                  width={192}
                  height={192}
                  className="rounded-xl shadow"
                  priority
                />
              </div>
              <p className="text-foreground/60">
                Scan with your phone to quickly access our signup form
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Users,
                  title: 'No Experience Required',
                  description: 'Open to all majors and skill levels',
                },
                {
                  icon: Calendar,
                  title: 'Weekly Meetings',
                  description: 'Every Thursday at 6:00 PM',
                },
                {
                  icon: QrCode,
                  title: 'Discord Community',
                  description: 'Join our active online community',
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 flex items-center gap-4 hover:bg-card hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-sm text-foreground/60">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
