'use client';

<<<<<<< HEAD
import { useEffect, useState, useRef } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ImageIcon,
  Send,
<<<<<<< HEAD
  X,
} from 'lucide-react';

import { auth, storage } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
=======
} from 'lucide-react';

import { auth } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00

import {
  createPost,
  subscribeToPosts,
  toggleLike,
} from '@/app/lib/firebase/post';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [posting, setPosting] = useState(false);
<<<<<<< HEAD
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
=======
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00

  // Get current user
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });

    return () => unsubAuth();
  }, []);

  // Subscribe to posts in real-time
  useEffect(() => {
<<<<<<< HEAD
    if (!currentUser) return;

    const unsubPosts = subscribeToPosts(
      (fetchedPosts) => {
        // Debug: Log posts with images
        fetchedPosts.forEach((post) => {
          if (post.imageUrl) {
            console.log('Post with image:', post.id, 'imageUrl:', post.imageUrl);
          }
        });
        setPosts(fetchedPosts);
        setLoadingPosts(false);
      },
      currentUser.uid
    );

    return () => unsubPosts();
  }, [currentUser]);
=======
    const unsubPosts = subscribeToPosts((fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoadingPosts(false);
    });

    return () => unsubPosts();
  }, []);
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00

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

  const handleBookmark = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

<<<<<<< HEAD
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
=======
  const handlePost = async () => {
    if (!newPost.trim()) return;
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
    if (!currentUser) {
      alert('You must be logged in to post.');
      return;
    }

    try {
      setPosting(true);
<<<<<<< HEAD

      let imageUrl = null;

      // Upload image if provided
      if (postImage) {
        try {
          const imageRef = ref(storage, `posts/${Date.now()}_${postImage.name}`);
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
=======
      await createPost({
        content: newPost.trim(),
        user: currentUser,
      });

      setNewPost('');
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
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
              <AvatarImage
                src={currentUser?.photoURL || '/images.jpeg'}
              />
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
<<<<<<< HEAD
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3 relative">
                  <img
                    src={imagePreview}
                    alt="Post preview"
                    className="w-full max-h-64 object-cover rounded-lg border border-border/50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
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
=======
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="text-muted-foreground hover:text-primary"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
                <Button
                  onClick={handlePost}
                  disabled={!newPost.trim() || !currentUser || posting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
              <Card
                key={post.id}
                className="p-6 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                {/* Post header */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src="/diverse-user-avatars.png" />
                    <AvatarFallback>
                      {post.authorName ? post.authorName.slice(0, 2) : 'HQ'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
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
                </div>

                {/* Post content */}
                <p className="text-foreground mb-4 leading-relaxed">
                  {post.content}
                </p>

<<<<<<< HEAD
                {/* Post image */}
                {post.imageUrl ? (
                  <div className="mb-4 rounded-lg overflow-hidden border border-border/50">
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="w-full h-auto max-h-96 object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', post.imageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : null}

=======
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
                {/* Post actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`gap-2 ${
                        post.isLiked
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-muted-foreground hover:text-red-500'
                      }`}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          post.isLiked ? 'fill-current' : ''
                        }`}
                      />
                      <span className="text-sm">
                        {post.likesCount ?? 0}
                      </span>
                    </Button>

                    <Link
                      href={`/member/post/${post.id}`}
                      className="text-sm text-muted-foreground hover:text-primary hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      View thread & reply
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(post.id)}
                      className={`${
                        post.isBookmarked
                          ? 'text-accent hover:text-accent/80'
                          : 'text-muted-foreground hover:text-accent'
                      }`}
                    >
                      <Bookmark
                        className={`h-5 w-5 ${
                          post.isBookmarked ? 'fill-current' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </Card>
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
