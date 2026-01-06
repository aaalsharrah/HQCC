'use client';

import { useEffect, useState, useRef, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Heart,
  MessageCircle,
  ImageIcon,
  Send,
  X,
  MoreHorizontal,
} from 'lucide-react';

// shadcn dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { auth, storage, db } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

import {
  createPost,
  subscribeToPosts,
  toggleLike,
  deletePostWithChildren,
} from '@/app/lib/firebase/post';

const PostCard = memo(function PostCard({
  post,
  currentUser,
  onPostUpdated,
  onPostDeleted,
  onLike,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [draftContent, setDraftContent] = useState(post.content || '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const isOwnPost =
      currentUser && post.authorId && post.authorId === currentUser.uid;

    const startEdit = () => {
      setDraftContent(post.content || '');
      setIsEditing(true);
    };

    const cancelEdit = () => {
      setDraftContent(post.content || '');
      setIsEditing(false);
    };

    const saveEdit = async () => {
      const trimmed = draftContent.trim();
      if (!trimmed) {
        alert('Post content cannot be empty.');
        return;
      }

      try {
        setSaving(true);
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, { content: trimmed });

        // local sync
        onPostUpdated(post.id, trimmed);
        setIsEditing(false);
      } catch (err) {
        console.error('Failed to update post', err);
        alert('Failed to update post. Please try again.');
      } finally {
        setSaving(false);
      }
    };

    const handleDeleteClick = async () => {
      try {
        setDeleting(true);
        await deletePostWithChildren(post.id);

        onPostDeleted(post.id);
      } catch (err) {
        console.error('Failed to delete post', err);
        alert('Failed to delete post. Please try again.');
      } finally {
        setDeleting(false);
      }
    };

    return (
      <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300">
        {/* Post header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={post.authorAvatar || '/placeholder.svg'} />
            <AvatarFallback>
              {post.authorName ? post.authorName.slice(0, 2) : 'HQ'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Link to the poster's profile (by uid) */}
                  <Link
                    href={`/profile/${post.authorId}`}
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
                <p className="text-sm text-muted-foreground">
                  {post.timestamp}
                </p>
              </div>

              {isOwnPost && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary h-8 w-8"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={startEdit}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <AlertDialog
          open={showDeleteDialog}
          onOpenChange={(open) => setShowDeleteDialog(open)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClick}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Post content (or editor) */}
        {isEditing ? (
          <div className="mb-4 space-y-2">
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={3}
              className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm resize-none text-foreground"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveEdit}
                disabled={saving || !draftContent.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground mb-4 leading-relaxed">
            {post.content}
          </p>
        )}

        {/* Post image */}
        {post.imageUrl ? (
          <div className="mb-4 rounded-lg overflow-hidden border border-border/50 relative w-full max-h-96 h-96">
            <Image
              src={post.imageUrl}
              alt="Post content"
              fill
              className="object-cover"
              unoptimized // required for Firebase URLs / blob URLs
              onError={() =>
                console.error('Image failed to load:', post.imageUrl)
              }
            />
          </div>
        ) : null}

        {/* Post actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
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

            <Link
              href={`/member/post/${post.id}`}
              className="text-sm text-muted-foreground hover:text-primary hover:underline flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              View thread & reply
            </Link>
          </div>
        </div>
      </Card>
    );
  }
);

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [posting, setPosting] = useState(false);
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // ---- helpers to keep local posts array in sync when editing/deleting ----
  const handlePostUpdated = (postId, newContent) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content: newContent } : p))
    );
  };

  const handlePostDeletedLocally = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleLike = async (postId) => {
    if (!currentUser) {
      alert('You must be logged in to like posts.');
      return;
    }

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked
                ? Math.max(0, (post.likesCount ?? 0) - 1)
                : (post.likesCount ?? 0) + 1,
            }
          : post
      )
    );

    // Firestore toggle (one like per user)
    try {
      await toggleLike(postId, currentUser.uid);
    } catch (e) {
      console.error('Failed to toggle like', e);
      // optional: revert UI here if you want
    }
  };

  // Subscribe to posts on mount
  useEffect(() => {
    let unsubscribePosts = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous subscription if it exists
      if (unsubscribePosts) {
        unsubscribePosts();
      }

      if (!user) {
        setCurrentUser(null);
        setLoadingPosts(false);
        setPosts([]);
        return;
      }

      setCurrentUser(user);

      // Subscribe to posts with user ID for like status
      unsubscribePosts = subscribeToPosts((postsData) => {
        setPosts(postsData);
        setLoadingPosts(false);
      }, user.uid);
    });

    return () => {
      if (unsubscribePosts) {
        unsubscribePosts();
      }
      unsubscribeAuth();
    };
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB.');
      return;
    }

    setPostImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !postImage) return;
    if (!currentUser) {
      alert('You must be logged in to post.');
      return;
    }

    try {
      setPosting(true);

      let imageUrl = null;

      // Upload image if provided
      if (postImage) {
        try {
          const imageRef = ref(
            storage,
            `posts/${Date.now()}_${postImage.name}`
          );
          await uploadBytes(imageRef, postImage);
          imageUrl = await getDownloadURL(imageRef);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          alert('Failed to upload image. Please try again.');
          setPosting(false);
          return;
        }
      }

      // Create post with image URL if available
      await createPost({
        content: newPost.trim(),
        user: currentUser,
        imageUrl: imageUrl,
      });

      // Reset form
      setNewPost('');
      setPostImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // subscribeToPosts will pick it up
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float-gentle" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-float-gentle"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Community Feed
          </h1>
          <p className="text-muted-foreground text-lg">
            Stay connected with the latest from HQCC members
          </p>
        </div>

        {/* Create post card */}
        <Card className="p-6 mb-6 bg-card/50 backdrop-blur-xl border-border/50">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={currentUser?.photoURL || '/placeholder.svg'} />
              <AvatarFallback>
                {currentUser?.displayName
                  ? currentUser.displayName.slice(0, 2)
                  : 'You'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={
                  currentUser
                    ? 'Share your quantum thoughts...'
                    : 'Log in to share your quantum thoughts...'
                }
                disabled={!currentUser || posting}
                className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-20"
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full h-64">
                  <Image
                    src={imagePreview || '/placeholder.svg'}
                    alt="Post preview"
                    fill
                    className="object-cover rounded-lg border border-border/50"
                    unoptimized={imagePreview?.startsWith('http')}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    ref={fileInputRef}
                    className="hidden"
                    id="post-image-input"
                    disabled={!currentUser || posting}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!currentUser || posting}
                    className="text-muted-foreground hover:text-primary"
                    type="button"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  onClick={handlePost}
                  disabled={
                    (!newPost.trim() && !postImage) || !currentUser || posting
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  type="button"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {posting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts feed */}
        {loadingPosts ? (
          <p className="text-muted-foreground">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">
            No posts yet. Be the first to share something!
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onPostUpdated={handlePostUpdated}
                onPostDeleted={handlePostDeletedLocally}
                onLike={handleLike}
              />
            ))}
          </div>
        )}

        {/* Load more placeholder */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="border-primary/30 hover:bg-primary/10 bg-transparent"
            disabled
          >
            Load More Posts
          </Button>
        </div>
      </main>
    </div>
  );
}
