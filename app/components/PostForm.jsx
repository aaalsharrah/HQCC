'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';

import { useAuth } from '@/lib/firebase/auth-context';
import { createPost } from '@/lib/firebase/posts';

export function PostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const maxLength = 280;
  const remainingChars = maxLength - content.length;
  const isOverLimit = content.length > maxLength;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to post');
      return;
    }

    if (content.trim().length === 0) {
      setError('Post content cannot be empty');
      return;
    }

    if (isOverLimit) {
      setError(`Post cannot exceed ${maxLength} characters`);
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        authorEmail: user.email || '',
        content: content.trim(),
      });

      setContent('');
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError(err?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in the quantum computing world?"
          className="w-full min-h-[120px] p-4 bg-background/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-foreground/50"
          maxLength={maxLength}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <span>⚠</span>
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${
                remainingChars < 20
                  ? isOverLimit
                    ? 'text-destructive'
                    : 'text-warning'
                  : 'text-foreground/50'
              }`}
            >
              {remainingChars}
            </span>
            <Button
              type="submit"
              disabled={isSubmitting || content.trim().length === 0 || isOverLimit}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

