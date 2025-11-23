'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Trash2, Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/firebase/auth-context';
import {
  likePost,
  unlikePost,
  hasUserLikedPost,
  deletePost,
  subscribeToComments,
} from '@/lib/firebase/posts';
import { CommentForm } from './CommentForm';
import { Comment } from './Comment';

export function Post({ post }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    if (user && post) {
      setIsAuthor(user.uid === post.authorId);
      setLikesCount(post.likesCount || 0);
      checkLikeStatus();
    }
  }, [user, post]);

  useEffect(() => {
    if (showComments && post) {
      const unsubscribe = subscribeToComments(post.id, (updatedComments) => {
        setComments(updatedComments);
      });
      return () => unsubscribe();
    }
  }, [showComments, post]);

  const checkLikeStatus = async () => {
    if (!user || !post) return;
    try {
      const liked = await hasUserLikedPost(post.id, user.uid);
      setIsLiked(liked);
    } catch (err) {
      console.error('Error checking like status:', err);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    setIsLiking(true);
    try {
      if (isLiked) {
        await unlikePost(post.id, user.uid);
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await likePost(post.id, user.uid);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !isAuthor) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      await deletePost(post.id, user.uid);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert(err?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (!post) return null;

  return (
    <article className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-lg font-semibold text-primary">
            {post.authorName?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h4 className="font-semibold text-foreground">{post.authorName || 'Anonymous'}</h4>
              <p className="text-xs text-foreground/50">
                {post.authorEmail} · {formatTimestamp(post.createdAt)}
              </p>
            </div>
            {isAuthor && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          <p className="text-foreground mb-4 whitespace-pre-wrap break-words">{post.content}</p>

          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!user || isLiking}
              className={`gap-2 ${isLiked ? 'text-destructive' : 'text-foreground/60'}`}
            >
              {isLiking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              )}
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-2 text-foreground/60"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </Button>
          </div>

          {showComments && (
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <CommentForm postId={post.id} onCommentAdded={() => setShowComments(true)} />
              <div className="space-y-3">
                {comments.map((comment) => (
                  <Comment key={comment.id} comment={comment} postId={post.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

