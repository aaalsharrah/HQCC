'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, MessageCircle, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TimelineNav } from '../components/TimelineNav';
import { TimelineSidebar } from '../components/TimelineSidebar';
import { useAuth } from '@/lib/firebase/auth-context';
import { getAllMemberProfiles, searchMembers } from '@/lib/firebase/profiles';

function MemberCard({ member, currentUserId }) {
  const isCurrentUser = member.uid === currentUserId;

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card hover:border-primary/50 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
          {member.name ? member.name[0].toUpperCase() : member.email[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {member.name || member.email.split('@')[0]}
            </h3>
            {member.role === 'board' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                Board
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/60 truncate">{member.email}</p>
          {member.major && (
            <p className="text-xs text-foreground/50 mt-1">{member.major}</p>
          )}
          {member.year && (
            <p className="text-xs text-foreground/50">{member.year}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!isCurrentUser && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <a href={`/profile?userId=${member.uid}`}>
                <User className="h-4 w-4 mr-1" />
                View
              </a>
            </Button>
          )}
          {!isCurrentUser && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <a href={`/messages?userId=${member.uid}`}>
                <MessageCircle className="h-4 w-4 mr-1" />
                DM
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const allMembers = await getAllMemberProfiles();
        setMembers(allMembers);
      } catch (error) {
        console.error('Error loading members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, [authLoading]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim().length === 0) {
      const allMembers = await getAllMemberProfiles();
      setMembers(allMembers);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMembers(term);
      setMembers(results);
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setIsSearching(false);
    }
  };

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
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Community</h1>
              <p className="text-foreground/60 mb-6">
                Connect with fellow quantum computing enthusiasts
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                <Input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-background/50 border-border focus:border-primary"
                />
              </div>
            </div>

            {isLoading || isSearching ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-12 text-center">
                <p className="text-foreground/60 mb-4">No members found</p>
                <p className="text-sm text-foreground/50">
                  {searchTerm ? 'Try a different search term' : 'Be the first to join!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <MemberCard key={member.uid} member={member} currentUserId={user?.uid} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

