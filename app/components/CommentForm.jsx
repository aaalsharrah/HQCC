'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/firebase/auth-context';
import { createComment } from '@/lib/firebase/posts';

export function CommentForm({ postId, onCommentAdded }) {
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
      setError('You must be signed in to comment');
      return;
    }

    if (content.trim().length === 0) {
      setError('Comment cannot be empty');
      return;
    }

    if (isOverLimit) {
      setError(`Comment cannot exceed ${maxLength} characters`);
      return;
    }

    setIsSubmitting(true);

    try {
      await createComment({
        postId,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        authorEmail: user.email || '',
        content: content.trim(),
      });

      setContent('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      setError(err?.message || 'Failed to create comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          maxLength={maxLength}
          disabled={isSubmitting}
          className="flex-1 bg-background/50 border-border focus:border-primary"
        />
        <Button
          type="submit"
          disabled={isSubmitting || content.trim().length === 0 || isOverLimit}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
      {remainingChars < 50 && !isOverLimit && (
        <p className="text-xs text-foreground/50">{remainingChars} characters remaining</p>
      )}
    </form>
  );
}

