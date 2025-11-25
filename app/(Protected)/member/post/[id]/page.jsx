'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react';

import { auth } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import {
  subscribeToPost,
  subscribeToReplies,
  createReply,
  toggleLike,
} from '@/app/lib/firebase/post';

export default function PostThreadPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // post id (string)

  const [currentUser, setCurrentUser] = useState(null);
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [postingReply, setPostingReply] = useState(false);

  // 🔹 Listen to auth & enforce sign-in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentUser(null);
        setLoading(false);
        router.push('/signin');
        return;
      }
      setCurrentUser(user);
    });

    return () => unsub();
  }, [router]);

  // 🔹 Subscribe to the post + replies
  useEffect(() => {
    if (!id || !currentUser?.uid) return;

    const unsubPost = subscribeToPost(
      id,
      (fetchedPost) => {
        setPost(fetchedPost);
        setLoading(false);
      },
      currentUser.uid
    );

    const unsubReplies = subscribeToReplies(id, (fetchedReplies) => {
      setReplies(fetchedReplies);
    });

    return () => {
      unsubPost?.();
      unsubReplies?.();
    };
  }, [id, currentUser?.uid]);

  const handleLike = async () => {
    if (!post || !currentUser) {
      alert('You must be logged in to like posts.');
      return;
    }

    // Optimistic UI update
    setPost((prev) =>
      prev
        ? {
            ...prev,
            likesCount: prev.isLiked
              ? Math.max(0, (prev.likesCount ?? 0) - 1)
              : (prev.likesCount ?? 0) + 1,
            isLiked: !prev.isLiked,
          }
        : prev
    );

    try {
      await toggleLike(id, currentUser.uid);
    } catch (err) {
      console.error('Failed to toggle like', err);
      // Revert UI on error
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likesCount: prev.isLiked
                ? (prev.likesCount ?? 0) + 1
                : Math.max(0, (prev.likesCount ?? 0) - 1),
              isLiked: !prev.isLiked,
            }
          : prev
      );
      alert('Failed to like post. Please try again.');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (!currentUser) {
      alert('You must be logged in to reply.');
      return;
    }

    try {
      setPostingReply(true);
      await createReply({
        postId: id,
        content: replyText.trim(),
        user: currentUser,
      });
      setReplyText('');
    } catch (err) {
      console.error('Error creating reply:', err);
      alert('Failed to post reply. Please try again.');
    } finally {
      setPostingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4">
        <p className="text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4">
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <p className="text-destructive">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* simple background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 right-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-20 space-y-6">
        {/* Back link */}
        <Button
          variant="ghost"
          className="mb-2 gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Button>

        {/* Main post card */}
        <Card className="p-6 bg-card/60 backdrop-blur-xl border-border/60">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src="/diverse-user-avatars.png" />
              <AvatarFallback>
                {post.authorName ? post.authorName.slice(0, 2) : 'HQ'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Link
                  href={`/member/profile/${post.authorId}`}
                  className="font-semibold text-foreground hover:underline"
                >
                  {post.authorName || 'Member'}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {post.authorEmail}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Member
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
          </div>

          <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${
                post.isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart
                className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`}
              />
              <span className="text-sm">{post.likesCount ?? 0}</span>
            </Button>

            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>{replies.length} replies</span>
            </div>
          </div>
        </Card>

        {/* Reply box */}
        <Card className="p-4 bg-card/60 border-border/60">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage
                src={currentUser?.photoURL || '/diverse-user-avatars.png'}
              />
              <AvatarFallback>
                {currentUser?.displayName
                  ? currentUser.displayName.slice(0, 2)
                  : 'You'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  currentUser ? 'Reply to this post...' : 'Log in to reply...'
                }
                disabled={!currentUser || postingReply}
                className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-[60px]"
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleReply}
                  disabled={!replyText.trim() || !currentUser || postingReply}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="sm"
                >
                  {postingReply ? 'Replying...' : 'Reply'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Replies list */}
        <div className="space-y-3">
          {replies.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No replies yet. Be the first to reply!
            </p>
          ) : (
            replies.map((reply) => (
              <Card key={reply.id} className="p-4 bg-card/40 border-border/50">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                    <AvatarImage src="/diverse-user-avatars.png" />
                    <AvatarFallback>
                      {reply.authorName ? reply.authorName.slice(0, 2) : 'HQ'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        href={`/member/profile/${reply.authorId}`}
                        className="font-medium text-sm text-foreground hover:underline"
                      >
                        {reply.authorName || 'Member'}
                      </Link>
                      {reply.authorEmail && (
                        <span className="text-xs text-muted-foreground">
                          {reply.authorEmail}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{reply.content}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
