'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Code,
  Sparkles,
  TrendingUp,
  Github,
  Loader2,
  GraduationCap,
  Globe,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/app/lib/firebase/firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import Image from 'next/image';

// Helper function to get initials from name
function getInitials(name) {
  if (!name) return 'M';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Helper function to parse interests from bio
function parseInterests(bio) {
  if (!bio) return ['Quantum Computing'];
  const separators = ['|', ',', '•', '-'];
  for (const sep of separators) {
    if (bio.includes(sep)) {
      return bio
        .split(sep)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 3);
    }
  }
  return bio.length > 30 ? ['Quantum Computing'] : [bio];
}

// Pretty label for board roles
function prettyBoardRole(role) {
  switch (role) {
    case 'president':
      return 'President';
    case 'vice_president':
      return 'Vice President';
    case 'secretary':
      return 'Secretary';
    case 'treasurer':
      return 'Treasurer';
    default:
      return role || 'Member';
  }
}

// Helper to prioritize leadership/board at top
function getRolePriority(boardRoleRaw, roleRaw) {
  const boardRole = (boardRoleRaw || '').toLowerCase();
  const role = (roleRaw || '').toLowerCase();

  // Board roles first
  if (boardRole === 'president') return 0;
  if (boardRole === 'vice_president') return 1;
  if (boardRole === 'secretary') return 2;
  if (boardRole === 'treasurer') return 3;

  // Then admins with no specific boardRole
  if (role === 'admin') return 4;

  // General members
  return 5;
}

export default function CommunityPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Active Members', value: '0', icon: Users },
    { label: 'Posts Completed', value: '0', icon: Code },
    { label: 'Events This Year', value: '0', icon: Sparkles },
    { label: 'Growth Rate', value: '0%', icon: TrendingUp },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch members
        const membersRef = collection(db, 'members');
        const membersSnapshot = await getDocs(membersRef);
        const membersData = membersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Member',
            role: data.role || 'Member',           // 'member' | 'admin'
            boardRole: data.boardRole || '',       // 'president', etc.
            major: data.major || null,
            year: data.year || null,
            email: data.email || '',
            bio: data.bio || '',
            avatar: data.avatar || null,
            linkedin: data.linkedin || '#',
            github: data.github || '#',
            website: data.website || '',
            joinedAt: data.joinedAt || data.createdAt || null,
          };
        });

        // Generate avatar initials, parse interests & sort (board/admin first)
        const processedMembers = membersData
          .map((member) => ({
            ...member,
            avatarInitials: getInitials(member.name),
            interests: parseInterests(member.bio),
          }))
          .sort((a, b) => {
            const pa = getRolePriority(a.boardRole, a.role);
            const pb = getRolePriority(b.boardRole, b.role);
            if (pa !== pb) return pa - pb;
            return (a.name || '').localeCompare(b.name || '');
          });

        setMembers(processedMembers);

        // Calculate statistics
        const activeMembersCount = membersData.length;

        // Posts
        const postsRef = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsRef);
        const projectsCount = postsSnapshot.size;

        // Events this year
        let eventsCount = 0;
        try {
          const eventsRef = collection(db, 'events');
          const eventsSnapshot = await getDocs(eventsRef);

          const currentYear = new Date().getFullYear();
          eventsSnapshot.docs.forEach((doc) => {
            const eventData = doc.data();
            let eventDate = null;

            if (eventData.date) {
              if (eventData.date instanceof Timestamp) {
                eventDate = eventData.date.toDate();
              } else if (eventData.date instanceof Date) {
                eventDate = eventData.date;
              } else if (typeof eventData.date === 'string') {
                eventDate = new Date(eventData.date);
              } else if (eventData.date?.toDate) {
                eventDate = eventData.date.toDate();
              }
            } else if (eventData.createdAt) {
              if (eventData.createdAt instanceof Timestamp) {
                eventDate = eventData.createdAt.toDate();
              } else if (eventData.createdAt?.toDate) {
                eventDate = eventData.createdAt.toDate();
              }
            }

            if (eventDate && eventDate.getFullYear() === currentYear) {
              eventsCount++;
            }
          });
        } catch (error) {
          console.error('Error counting events:', error);
          eventsCount = 0;
        }

        // Growth rate
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        const sixtyDaysAgo = new Date(
          now.getTime() - 60 * 24 * 60 * 60 * 1000
        );

        const recentMembers = membersData.filter((m) => {
          if (!m.joinedAt) return false;
          const joinedDate =
            m.joinedAt instanceof Timestamp
              ? m.joinedAt.toDate()
              : new Date(m.joinedAt);
          return joinedDate >= thirtyDaysAgo;
        });

        const previousMembers = membersData.filter((m) => {
          if (!m.joinedAt) return false;
          const joinedDate =
            m.joinedAt instanceof Timestamp
              ? m.joinedAt.toDate()
              : new Date(m.joinedAt);
          return joinedDate >= sixtyDaysAgo && joinedDate < thirtyDaysAgo;
        });

        let growthRate = '0%';
        if (previousMembers.length > 0) {
          const growth =
            ((recentMembers.length - previousMembers.length) /
              previousMembers.length) *
            100;
          growthRate = `${growth >= 0 ? '+' : ''}${Math.round(growth)}%`;
        } else if (recentMembers.length > 0) {
          growthRate = `+${recentMembers.length * 100}%`;
        }

        setStats([
          {
            label: 'Active Members',
            value: activeMembersCount.toString(),
            icon: Users,
          },
          {
            label: 'Posts Completed',
            value: projectsCount.toString(),
            icon: Code,
          },
          {
            label: 'Events This Year',
            value: eventsCount.toString(),
            icon: Sparkles,
          },
          {
            label: 'Growth Rate',
            value: growthRate,
            icon: TrendingUp,
          },
        ]);
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
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
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="relative p-6 bg-card/50 backdrop-blur-xl border-border"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    <div className="text-sm text-foreground/60">Loading...</div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            stats.map((stat, index) => (
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
            ))
          )}
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

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No members found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className="relative group p-6 bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer flex flex-col"
                  onClick={() => router.push(`/member/profile/${member.id}`)}
                >
                  {/* Avatar + top content */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative mb-4">
                      {member.avatar ? (
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                          unoptimized={member.avatar.startsWith('http')}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary via-accent to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                          {member.avatarInitials}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-card" />
                    </div>

                    <h3 className="text-lg font-bold text-center mb-1 line-clamp-2">
                      {member.name}
                    </h3>

                    {/* Badge: Board role for admins, Member for others */}
                    <Badge
                      variant="secondary"
                      className="mb-2 text-center line-clamp-2"
                    >
                      {member.boardRole
                        ? prettyBoardRole(member.boardRole)
                        : member.role === 'admin'
                        ? 'Admin'
                        : 'Member'}
                    </Badge>

                    {member.major && (
                      <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1 line-clamp-2">
                        <GraduationCap className="h-3 w-3 flex-shrink-0" />
                        <span>{member.major}</span>
                      </div>
                    )}
                    {member.year && (
                      <div className="text-xs text-foreground/50">
                        {member.year}
                      </div>
                    )}
                  </div>

                  {/* Interests */}
                  {member.interests && member.interests.length > 0 && (
                    <div className="flex flex-col gap-2 mb-4 items-center px-1 w-full">
                      {member.interests.map((interest, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs px-3 py-1 line-clamp-2 max-w-[240px] whitespace-normal break-words text-center"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="mt-auto">
                    <div
                      className="flex gap-2 justify-center pt-4 border-t border-border/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {member.github && member.github !== '#' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:text-primary"
                          asChild
                        >
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}

                      {member.website && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:text-primary"
                          asChild
                        >
                          <a
                            href={member.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Personal website"
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
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
