'use client';

import {
  Users,
  Mail,
  Linkedin,
  Github,
  GraduationCap,
  Code,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Navigation } from '@/app/components/Navigation';

const members = [
  {
    name: 'Abdallah Aisharrah',
    role: 'Founder & President',
    major: 'Computer Science',
    year: 'Senior',
    interests: ['Quantum Algorithms', 'Research', 'Leadership'],
    email: 'abdallah@hqcc.org',
    linkedin: '#',
    github: '#',
    avatar: 'AA',
  },
  {
    name: 'Sarah Chen',
    role: 'Vice President',
    major: 'Physics',
    year: 'Junior',
    interests: ['Quantum Mechanics', 'Hardware', 'Education'],
    email: 'sarah@hqcc.org',
    linkedin: '#',
    github: '#',
    avatar: 'SC',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Technical Lead',
    major: 'Computer Engineering',
    year: 'Senior',
    interests: ['Quantum Circuits', 'Qiskit', 'Innovation'],
    email: 'marcus@hqcc.org',
    linkedin: '#',
    github: '#',
    avatar: 'MR',
  },
  {
    name: 'Emily Thompson',
    role: 'Events Coordinator',
    major: 'Mathematics',
    year: 'Sophomore',
    interests: ['Cryptography', 'Workshops', 'Networking'],
    email: 'emily@hqcc.org',
    linkedin: '#',
    github: '#',
    avatar: 'ET',
  },
  {
    name: 'David Kim',
    role: 'Research Director',
    major: 'Computer Science',
    year: 'Graduate',
    interests: ['Machine Learning', 'Quantum ML', 'Papers'],
    email: 'david@hqcc.org',
    linkedin: '#',
    github: '#',
    avatar: 'DK',
  },
  {
    name: 'Aisha Patel',
    role: 'Community Manager',
    major: 'Information Systems',
    year: 'Junior',
    interests: ['Collaboration', 'Outreach', 'Design'],
    email: 'aisha@hqcc.org',
    linkedin: '#',
    github: '#',
    avatar: 'AP',
  },
  {
    name: 'James Wilson',
    role: 'Member',
    major: 'Physics',
    year: 'Freshman',
    interests: ['Quantum Theory', 'Learning', 'Experiments'],
    email: 'james@hqcc.org',
    linkedin: '#',
    github: '#',
    avatar: 'JW',
  },
  {
    name: 'Olivia Martinez',
    role: 'Member',
    major: 'Applied Math',
    year: 'Sophomore',
    interests: ['Optimization', 'Algorithms', 'Coding'],
    email: 'olivia@hqcc.org',
    linkedin: '#',
    github: '#',
    avatar: 'OM',
  },
];

const stats = [
  { label: 'Active Members', value: '45+', icon: Users },
  { label: 'Projects Completed', value: '12', icon: Code },
  { label: 'Events This Year', value: '28', icon: Sparkles },
  { label: 'Growth Rate', value: '+150%', icon: TrendingUp },
];

export default function CommunityPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navigation />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Our Community
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance">
            Meet the{' '}
            <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              HQCC Family
            </span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto text-balance">
            A diverse group of students passionate about pushing the boundaries
            of quantum computing and building the future together.
          </p>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="relative p-6 bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-foreground/60">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Members Grid */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Leadership & Members</h2>
            <p className="text-foreground/60 max-w-2xl">
              Connect with our talented members who are driving innovation in
              quantum computing at Hofstra University.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member, index) => (
              <Card
                key={index}
                className="relative group p-6 bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
              >
                {/* Avatar */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary via-accent to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      {member.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-card" />
                  </div>

                  <h3 className="text-lg font-bold text-center mb-1">
                    {member.name}
                  </h3>
                  <Badge variant="secondary" className="mb-2">
                    {member.role}
                  </Badge>

                  <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{member.major}</span>
                  </div>
                  <div className="text-xs text-foreground/50">
                    {member.year}
                  </div>
                </div>

                {/* Interests */}
                <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
                  {member.interests.map((interest, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex gap-2 justify-center pt-4 border-t border-border/50">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-primary"
                    asChild
                  >
                    <a href={`mailto:${member.email}`} aria-label="Email">
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-primary"
                    asChild
                  >
                    <a href={member.linkedin} aria-label="LinkedIn">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-primary"
                    asChild
                  >
                    <a href={member.github} aria-label="GitHub">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden p-12 bg-linear-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/30">
            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Want to Join Our Community?
              </h2>
              <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
                Become part of a vibrant community exploring the future of
                quantum computing. All skill levels welcome!
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                asChild
              >
                <Link href="/#join">Apply Now</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
