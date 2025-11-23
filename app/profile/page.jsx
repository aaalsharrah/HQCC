'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageCircle, Edit, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineNav } from '../components/TimelineNav';
import { TimelineSidebar } from '../components/TimelineSidebar';
import { useAuth } from '@/lib/firebase/auth-context';
import { getMemberProfile } from '@/lib/firebase/profiles';
import { subscribeToPosts } from '@/lib/firebase/posts';
import { Post as PostComponent } from '../components/Post';

export default function ProfilePage() {
  const [userId, setUserId] = useState(null);
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('userId');
      // If no userId provided and user is logged in, show their own profile
      if (!id && currentUser) {
        setUserId(currentUser.uid);
      } else {
        setUserId(id);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (authLoading || !userId) return;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const memberProfile = await getMemberProfile(userId);
        setProfile(memberProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, authLoading]);

  useEffect(() => {
    if (!userId) return;

    setIsLoadingPosts(true);
    const unsubscribe = subscribeToPosts((posts) => {
      const filtered = posts.filter((post) => post.authorId === userId);
      setUserPosts(filtered);
      setIsLoadingPosts(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (authLoading || isLoading || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <TimelineNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-foreground/60 mb-4">Profile not found</p>
            <a href="/community" className="text-primary hover:underline">
              Back to Community
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TimelineNav />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start px-4 sm:px-6 lg:px-8 py-8">
          <TimelineSidebar />
          <div className="flex-1 w-full min-w-0">
            {/* Profile Banner */}
            <div className="h-48 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-t-2xl mb-0"></div>
            
            {/* Profile Header Card */}
            <div className="bg-card/50 backdrop-blur-sm border-x border-b border-border rounded-b-2xl px-6 pb-6 -mt-16 relative">
              {/* Avatar positioned over banner */}
              <div className="flex justify-between items-end mb-4">
                <div className="w-32 h-32 rounded-full bg-card border-4 border-card flex items-center justify-center text-primary font-bold text-4xl -mt-16 ml-4">
                  {profile.name ? profile.name[0].toUpperCase() : profile.email[0].toUpperCase()}
                </div>
                <div className="flex gap-3 mt-4">
                  {isOwnProfile && (
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  {!isOwnProfile && currentUser && (
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <a href={`/messages?userId=${userId}`}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="px-4">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {profile.name || profile.email.split('@')[0]}
                  </h1>
                  {profile.role === 'board' && (
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-medium">
                      Board Member
                    </span>
                  )}
                </div>
                <p className="text-foreground/60 mb-3">{profile.email}</p>
                {profile.bio && (
                  <p className="text-foreground/80 mb-4">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-6 text-sm text-foreground/60 mb-4">
                  {profile.major && (
                    <span>
                      <strong className="text-foreground">Major:</strong> {profile.major}
                    </span>
                  )}
                  {profile.year && (
                    <span>
                      <strong className="text-foreground">Year:</strong> {profile.year}
                    </span>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex gap-6 pt-4 border-t border-border">
                  <div>
                    <span className="font-semibold text-foreground">{userPosts.length}</span>
                    <span className="text-foreground/60 ml-1">Posts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Posts ({userPosts.length})
              </h2>
              {isLoadingPosts ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userPosts.length === 0 ? (
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-12 text-center">
                  <p className="text-foreground/60 mb-4">No posts yet</p>
                  <p className="text-sm text-foreground/50">
                    {isOwnProfile ? 'Start sharing your thoughts!' : 'This user hasn\'t posted anything yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {userPosts.map((post) => (
                    <PostComponent key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

