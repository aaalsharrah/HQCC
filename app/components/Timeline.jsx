'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/firebase/auth-context';
import { subscribeToPosts } from '@/lib/firebase/posts';
import { PostForm } from './PostForm';
import { Post as PostComponent } from './Post';

export function Timeline() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToPosts(
        (updatedPosts) => {
          setPosts(updatedPosts);
          setIsLoading(false);
        },
        50,
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err?.message || 'Failed to load posts');
      setIsLoading(false);
    }
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Community Timeline</h1>
        <p className="text-foreground/60">
          Share your thoughts, discoveries, and connect with fellow quantum computing enthusiasts
        </p>
      </div>

      {user && (
        <div className="mb-8">
          <PostForm onPostCreated={() => {}} />
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-12 text-center">
          <p className="text-foreground/60 mb-4">No posts yet</p>
          <p className="text-sm text-foreground/50">
            Be the first to share something with the community!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostComponent key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

