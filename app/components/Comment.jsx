'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/firebase/auth-context';
import { deleteComment } from '@/lib/firebase/posts';

export function Comment({ comment, postId }) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const isAuthor = user && user.uid === comment.authorId;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Just now';
    }
  };

  const handleDelete = async () => {
    if (!user || !isAuthor) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);
    try {
      await deleteComment(postId, comment.id, user.uid);
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert(err?.message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-secondary">
          {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <span className="font-semibold text-sm text-foreground">{comment.authorName || 'Anonymous'}</span>
            <span className="text-xs text-foreground/50 ml-2">{formatTimestamp(comment.createdAt)}</span>
          </div>
          {isAuthor && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6"
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">{comment.content}</p>
      </div>
    </div>
  );
}

