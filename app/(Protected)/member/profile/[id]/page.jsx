'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Calendar,
  LinkIcon,
  MoreHorizontal,
  Send,
  Loader2,
} from 'lucide-react';

import { auth, db, storage } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { findOrCreateConversation } from '@/app/lib/firebase/messages';
import { toggleLike } from '@/app/lib/firebase/post';

// Add this NEW helper:
async function getReplyCount(postId) {
  const repliesRef = collection(db, 'posts', postId, 'replies');
  const snap = await getDocs(repliesRef);
  return snap.size;
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params?.id; // Get the profile ID from route

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  const mediaPosts = posts.filter((p) => p.image);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      setCurrentUserId(user.uid);
      
      // Determine if viewing own profile or another user's profile
      const targetUserId = profileId || user.uid;
      const isOwnProfile = targetUserId === user.uid;
      setIsCurrentUserProfile(isOwnProfile);

      (async () => {
        try {
          // 🔹 Load profile from "members" - use targetUserId instead of user.uid
          const refDoc = doc(db, 'members', targetUserId);
          const snap = await getDoc(refDoc);

          let loadedProfile;

          if (!snap.exists()) {
            // If viewing another user's profile that doesn't exist, show error
            if (!isOwnProfile) {
              setProfile(null);
              setError('Profile not found');
              setLoading(false);
              return;
            }

            const fallbackName =
              user.displayName || user.email?.split('@')[0] || 'HQCC Member';
            const username =
              user.email
                ?.split('@')[0]
                ?.toLowerCase()
                .replace(/[^a-z0-9]/g, '') || 'member';

            loadedProfile = {
              uid: user.uid,
              name: fallbackName,
              username,
              email: user.email,
              avatar: user.photoURL || '/quantum-computing-student.jpg',
              coverImage:
                '/quantum-computing-chip-with-glowing-circuits-and-b.jpg',
              bio: 'HQCC member | Quantum & Computing Enthusiast',
              location: 'Hempstead, NY',
              website: 'hqcc.hofstra.edu',
              joined: 'September 2023',
            };

            // create initial member doc
            await setDoc(
              refDoc,
              {
                name: loadedProfile.name,
                username: loadedProfile.username,
                email: loadedProfile.email,
                avatar: loadedProfile.avatar,
                coverImage: loadedProfile.coverImage,
                bio: loadedProfile.bio,
                location: loadedProfile.location,
                website: loadedProfile.website,
                createdAt: new Date(),
              },
              { merge: true }
            );
          } else {
            const data = snap.data();
            
            // Format joined date
            let joinedDate = 'Unknown';
            if (data.createdAt) {
              const date = data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date(data.createdAt);
              joinedDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            }

            loadedProfile = {
              uid: targetUserId,
              name: data.name || 'HQCC Member',
              username: data.username || 'member',
              email: data.email || '',
              avatar: data.avatar || '/quantum-computing-student.jpg',
              coverImage:
                data.coverImage ||
                '/quantum-computing-chip-with-glowing-circuits-and-b.jpg',
              bio: data.bio || 'HQCC member | Quantum & Computing Enthusiast',
              location: data.location || 'Hempstead, NY',
              website: data.website || 'hqcc.hofstra.edu',
              joined: joinedDate,
            };
          }

          setProfile(loadedProfile);

          // 🔹 Initialize edit form from loaded profile
          setEditData({
            name: loadedProfile.name || '',
            username: loadedProfile.username || '',
            bio: loadedProfile.bio || '',
            location: loadedProfile.location || '',
            website: loadedProfile.website || '',
          });

          // 🔹 Fetch this user's posts (use targetUserId)
          let postsDocs = [];
          try {
            const postsRef = collection(db, 'posts');
            const q = query(
              postsRef,
              where('authorId', '==', targetUserId),
              orderBy('createdAt', 'desc')
            );
            const postsSnap = await getDocs(q);
            postsDocs = postsSnap.docs;
          } catch (error) {
            console.error('Error fetching posts (may need index):', error);
            // Try without orderBy if index doesn't exist
            try {
              const postsRef = collection(db, 'posts');
              const q = query(
                postsRef,
                where('authorId', '==', targetUserId)
              );
              const postsSnap = await getDocs(q);
              postsDocs = postsSnap.docs;
              // Sort client-side
              postsDocs.sort((a, b) => {
                const aData = a.data();
                const bData = b.data();
                const aTime = aData.createdAt?.toMillis?.() || aData.createdAt?.seconds || 0;
                const bTime = bData.createdAt?.toMillis?.() || bData.createdAt?.seconds || 0;
                return bTime - aTime; // Descending order
              });
            } catch (err) {
              console.error('Error fetching posts without orderBy:', err);
              postsDocs = [];
            }
          }

          const userPosts = [];

          for (const docSnap of postsDocs) {
            const data = docSnap.data();

            let replyCount = 0;
            try {
              replyCount = await getReplyCount(docSnap.id);
            } catch (err) {
              console.error(
                'Error getting reply count for post',
                docSnap.id,
                err
              );
            }

            // Check if current user has liked this post
            let isLiked = false;
            if (user.uid) {
              try {
                const likeRef = doc(db, 'posts', docSnap.id, 'likes', user.uid);
                const likeSnap = await getDoc(likeRef);
                isLiked = likeSnap.exists();
              } catch (err) {
                console.error('Error checking like status:', err);
              }
            }

            userPosts.push({
              id: docSnap.id,
              content: data.content || '',
              timestamp: data.createdAt
                ? data.createdAt.toDate().toLocaleString()
                : 'Just now',
              likes: data.likesCount ?? 0,
              comments: replyCount, // ✅ reply count from subcollection
              shares: data.sharesCount ?? 0,
              isLiked,
              isBookmarked: false,
              image: data.imageUrl || null,
            });
          }

          if (userPosts.length > 0) {
            setPosts(userPosts);
          } else {
            setPosts([
              {
                id: 'welcome',
                content:
                  'Welcome to your HQCC profile! Start posting to see your content here.',
                timestamp: 'just now',
                likes: 0,
                comments: 0,
                shares: 0,
                isLiked: false,
                isBookmarked: false,
              },
            ]);
          }

          // Fetch posts that this user has liked (for Likes tab)
          // Only fetch if viewing own profile
          if (isOwnProfile && user.uid) {
            try {
              // Get all posts
              const allPostsRef = collection(db, 'posts');
              const allPostsSnap = await getDocs(allPostsRef);
              
              const likedPostsList = [];
              
              // Check each post to see if user has liked it
              for (const postDoc of allPostsSnap.docs) {
                try {
                  const likeRef = doc(db, 'posts', postDoc.id, 'likes', user.uid);
                  const likeSnap = await getDoc(likeRef);
                  
                  if (likeSnap.exists()) {
                    // User has liked this post, fetch full post data
                    const postData = postDoc.data();
                    
                    let replyCount = 0;
                    try {
                      replyCount = await getReplyCount(postDoc.id);
                    } catch (err) {
                      console.error('Error getting reply count:', err);
                    }
                    
                    likedPostsList.push({
                      id: postDoc.id,
                      content: postData.content || '',
                      timestamp: postData.createdAt
                        ? postData.createdAt.toDate().toLocaleString()
                        : 'Just now',
                      likes: postData.likesCount ?? 0,
                      comments: replyCount,
                      shares: postData.sharesCount ?? 0,
                      isLiked: true,
                      isBookmarked: false,
                      image: postData.imageUrl || null,
                      authorId: postData.authorId,
                      authorName: postData.authorName || 'Member',
                      authorEmail: postData.authorEmail || '',
                    });
                  }
                } catch (err) {
                  console.error('Error checking like for post', postDoc.id, err);
                }
              }
              
              // Sort by timestamp (most recent first)
              likedPostsList.sort((a, b) => {
                const aTime = new Date(a.timestamp).getTime();
                const bTime = new Date(b.timestamp).getTime();
                return bTime - aTime;
              });
              
              setLikedPosts(likedPostsList);
            } catch (err) {
              console.error('Error fetching liked posts:', err);
              setLikedPosts([]);
            }
          } else {
            // For other users' profiles, show empty (or fetch their liked posts if you want)
            setLikedPosts([]);
          }
        } catch (err) {
          console.error('Error loading profile or posts:', err);
          setError('Failed to load profile. Please try again.');
          setLoading(false);
        } finally {
          setLoading(false);
        }
      })();
    });

    return () => unsub();
  }, [router, profileId]);

  const handleLike = async (postId, postsArray, setPostsArray) => {
    if (!currentUserId) {
      alert('You must be logged in to like posts.');
      return;
    }

    const post = postsArray.find((p) => p.id === postId);
    const wasLiked = post?.isLiked || false;

    // Optimistic UI update
    setPostsArray(
      postsArray.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );

    // Firestore toggle (one like per user)
    try {
      await toggleLike(postId, currentUserId);
      
      // Update likedPosts list if viewing own profile
      if (isCurrentUserProfile) {
        if (wasLiked) {
          // Remove from likedPosts
          setLikedPosts((prev) => prev.filter((p) => p.id !== postId));
        } else {
          // Add to likedPosts - fetch the post data
          try {
            const postRef = doc(db, 'posts', postId);
            const postSnap = await getDoc(postRef);
            if (postSnap.exists()) {
              const postData = postSnap.data();
              let replyCount = 0;
              try {
                replyCount = await getReplyCount(postId);
              } catch (err) {
                console.error('Error getting reply count:', err);
              }
              
              const newLikedPost = {
                id: postId,
                content: postData.content || '',
                timestamp: postData.createdAt
                  ? postData.createdAt.toDate().toLocaleString()
                  : 'Just now',
                likes: (postData.likesCount ?? 0) + 1,
                comments: replyCount,
                shares: postData.sharesCount ?? 0,
                isLiked: true,
                isBookmarked: false,
                image: postData.imageUrl || null,
                authorId: postData.authorId,
                authorName: postData.authorName || 'Member',
                authorEmail: postData.authorEmail || '',
              };
              
              setLikedPosts((prev) => [newLikedPost, ...prev]);
            }
          } catch (err) {
            console.error('Error fetching liked post:', err);
          }
        }
      }
    } catch (e) {
      console.error('Failed to toggle like', e);
      // Revert UI on error
      setPostsArray(
        postsArray.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: post.isLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
                isLiked: !post.isLiked,
              }
            : post
        )
      );
      alert('Failed to like post. Please try again.');
    }
  };

  const handleBookmark = (postId, postsArray, setPostsArray) => {
    setPostsArray(
      postsArray.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  // Handle sending a message to this user
  const handleSendMessage = async () => {
    if (!currentUserId || !profile?.uid || currentUserId === profile.uid) {
      return;
    }

    try {
      setSendingMessage(true);
      const conversationId = await findOrCreateConversation(
        currentUserId,
        profile.uid
      );
      router.push(`/member/messages/${conversationId}`);
    } catch (error) {
      console.error('Error creating/finding conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Validate file before upload
  const validateFile = (file, type = 'avatar') => {
    const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatar, 10MB for cover
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) return null;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.`;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return `File size too large. Maximum size is ${maxSizeMB}MB for ${type === 'avatar' ? 'avatars' : 'cover images'}.`;
    }

    return null;
  };

  // Save profile changes (text fields + avatar + cover photo)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);

      // Validate files before upload
      if (avatarFile) {
        const avatarError = validateFile(avatarFile, 'avatar');
        if (avatarError) {
          alert(avatarError);
          setSaving(false);
          return;
        }
      }

      if (coverFile) {
        const coverError = validateFile(coverFile, 'cover');
        if (coverError) {
          alert(coverError);
          setSaving(false);
          return;
        }
      }

      let avatarUrl = profile.avatar;
      let coverUrl = profile.coverImage;

      // Upload avatar if provided
      if (avatarFile) {
        try {
          console.log('Uploading avatar to Firebase Storage...');
          const avatarRef = ref(storage, `avatars/${profile.uid}`);
          await uploadBytes(avatarRef, avatarFile);
          avatarUrl = await getDownloadURL(avatarRef);
          console.log('Avatar uploaded successfully:', avatarUrl);
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError);
          
          // Handle specific Firebase Storage errors
          if (uploadError.code === 'storage/unauthorized') {
            throw new Error('Permission denied. Please check Firebase Storage security rules.');
          } else if (uploadError.code === 'storage/quota-exceeded') {
            throw new Error('Storage quota exceeded. Please contact support.');
          } else if (uploadError.code === 'storage/unauthenticated') {
            throw new Error('You must be logged in to upload images.');
          } else {
            throw new Error(`Failed to upload avatar: ${uploadError.message || 'Unknown error'}`);
          }
        }
      }

      // Upload cover image if provided
      if (coverFile) {
        try {
          console.log('Uploading cover image to Firebase Storage...');
          const coverRef = ref(storage, `covers/${profile.uid}`);
          await uploadBytes(coverRef, coverFile);
          coverUrl = await getDownloadURL(coverRef);
          console.log('Cover image uploaded successfully:', coverUrl);
        } catch (uploadError) {
          console.error('Cover image upload error:', uploadError);
          
          // Handle specific Firebase Storage errors
          if (uploadError.code === 'storage/unauthorized') {
            throw new Error('Permission denied. Please check Firebase Storage security rules.');
          } else if (uploadError.code === 'storage/quota-exceeded') {
            throw new Error('Storage quota exceeded. Please contact support.');
          } else if (uploadError.code === 'storage/unauthenticated') {
            throw new Error('You must be logged in to upload images.');
          } else {
            throw new Error(`Failed to upload cover image: ${uploadError.message || 'Unknown error'}`);
          }
        }
      }

      // Save to Firestore
      try {
        console.log('Saving profile data to Firestore...');
        const refDoc = doc(db, 'members', profile.uid);

        await setDoc(
          refDoc,
          {
            name: editData.name.trim() || profile.name,
            username:
              editData.username.trim() ||
              profile.username ||
              profile.email.split('@')[0],
            bio: editData.bio.trim(),
            location: editData.location.trim(),
            website: editData.website.trim(),
            avatar: avatarUrl,
            coverImage: coverUrl,
          },
          { merge: true }
        );
        console.log('Profile saved successfully to Firestore');
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        throw new Error(`Failed to save profile: ${firestoreError.message || 'Unknown error'}`);
      }

      // Update local state
      setProfile((prev) => ({
        ...prev,
        name: editData.name.trim() || prev.name,
        username:
          editData.username.trim() || prev.username || prev.email.split('@')[0],
        bio: editData.bio.trim(),
        location: editData.location.trim(),
        website: editData.website.trim(),
        avatar: avatarUrl,
        coverImage: coverUrl,
      }));

      setIsEditing(false);
      setAvatarFile(null);
      setCoverFile(null);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      const errorMessage = err.message || 'Failed to save profile. Please try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const PostCard = ({ post, postsArray, setPostsArray }) => {
    // For liked posts, show the post author's info; for own posts, show profile owner's info
    const displayName = post.authorName || profile.name;
    const displayUsername = post.authorEmail?.split('@')[0] || profile.username;
    const displayAvatar = post.authorAvatar || profile.avatar;
    
    return (
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
          <AvatarImage src={displayAvatar || '/placeholder.svg'} />
          <AvatarFallback>
            {displayName ? displayName.slice(0, 2).toUpperCase() : 'HQ'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 ">
              {post.authorId ? (
                <Link
                  href={`/member/profile/${post.authorId}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {displayName}
                </Link>
              ) : (
                <h3 className="font-semibold text-foreground">{displayName}</h3>
              )}
              <span className="text-xs text-muted-foreground">
                @{displayUsername}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{post.timestamp}</p>
        </div>
      </div>

      <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

      {post.image && (
        <div className="mb-4 rounded-lg overflow-hidden border border-border/50">
          <Image
            src={post.image || '/placeholder.svg'}
            alt="Post content"
            className="w-full h-auto"
            width={600}
            height={400}
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleLike(post.id, postsArray, setPostsArray)}
          className={`gap-2 ${
            post.isLiked
              ? 'text-red-500 hover:text-red-600'
              : 'text-muted-foreground hover:text-red-500'
          }`}
        >
          <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{post.likes}</span>
        </Button>

        {/* 🔹 Open comments thread for this post */}
        <Link
          href={`/member/post/${post.id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{post.comments}</span>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-primary"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-sm">{post.shares}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBookmark(post.id, postsArray, setPostsArray)}
          className={`${
            post.isBookmarked
              ? 'text-accent hover:text-accent/80'
              : 'text-muted-foreground hover:text-accent'
          }`}
        >
          <Bookmark
            className={`h-5 w-5 ${post.isBookmarked ? 'fill-current' : ''}`}
          />
        </Button>
      </div>
    </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            {error || 'Profile not found'}
          </h1>
          <Button onClick={() => router.push('/member/community')}>
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float-gentle" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-float-gentle"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-20 pb-20">
        {/* Profile header */}
        <Card className="overflow-hidden bg-card/50 backdrop-blur-xl border-border/50 mb-6">
          <div className="relative h-48 md:h-64 bg-linear-to-r from-primary/20 via-accent/20 to-secondary/20">
            <Image
              src={profile.coverImage || '/placeholder.svg'}
              alt="Cover"
              className="w-full h-full object-cover opacity-50"
              width={1200}
              height={400}
            />

            {isEditing && isCurrentUserProfile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <label className="bg-background/80 px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-background">
                  Change cover photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Add top padding so content starts below avatar */}
          <div className="relative px-6 pb-6 pt-20 md:pt-24">
            {/* Avatar */}
            <div className="absolute -top-16 md:-top-20">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-card border-4 border-background">
                <AvatarImage src={profile.avatar || '/placeholder.svg'} />
                <AvatarFallback className="text-3xl">
                  {profile.name ? profile.name.slice(0, 2) : 'HQ'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Edit Profile toggle or Send Message button */}
            <div className="flex justify-end">
              {isCurrentUserProfile ? (
                <Button
                  onClick={() => setIsEditing((prev) => !prev)}
                  className="
                    bg-linear-to-r from-primary via-accent to-secondary
                    text-white font-medium
                    hover:opacity-90
                    transition-all
                  "
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              ) : (
                <Button
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                  className="
                    bg-primary
                    text-primary-foreground font-medium
                    hover:bg-primary/90
                    transition-all
                  "
                >
                  {sendingMessage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Profile Info / Edit Form */}
            {!isEditing ? (
              <div className="mt-4">
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  {profile.name}
                </h1>
                <p className="text-muted-foreground mb-4">
                  @{profile.username}
                </p>

                <p className="text-foreground leading-relaxed mb-4">
                  {profile.bio}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {profile.website && (
                    <a
                      href={
                        profile.website.startsWith('http')
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>{profile.website}</span>
                    </a>
                  )}

                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {profile.joined}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
                {/* Small note about selected cover */}
                {coverFile && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Selected cover: {coverFile.name}
                  </p>
                )}

                {/* Avatar upload */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 ring-2 ring-primary/40">
                    <AvatarImage src={profile.avatar || '/placeholder.svg'} />
                    <AvatarFallback>
                      {profile.name ? profile.name.slice(0, 2) : 'HQ'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Profile picture
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setAvatarFile(e.target.files?.[0] || null)
                      }
                      className="text-sm text-muted-foreground"
                    />
                    {avatarFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Selected: {avatarFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Name & username */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <div className="flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm">
                      <span className="text-muted-foreground mr-1">@</span>
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            username: e.target.value.toLowerCase(),
                          }))
                        }
                        className="flex-1 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    rows={3}
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>

                {/* Location & Website */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      value={editData.website}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      placeholder="hqcc.hofstra.edu"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarFile(null);
                      setCoverFile(null);
                      // reset form to current profile values
                      setEditData({
                        name: profile.name || '',
                        username: profile.username || '',
                        bio: profile.bio || '',
                        location: profile.location || '',
                        website: profile.website || '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="
                      bg-linear-to-r from-primary via-accent to-secondary
                      text-white font-medium
                      hover:opacity-90
                      transition-all
                    "
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="w-full bg-card/50 backdrop-blur-xl border border-border/50 p-1">
            <TabsTrigger
              value="posts"
              className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Posts
            </TabsTrigger>

            <TabsTrigger
              value="replies"
              className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Replies
            </TabsTrigger>

            <TabsTrigger
              value="media"
              className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Media
            </TabsTrigger>

            <TabsTrigger
              value="likes"
              className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                postsArray={posts}
                setPostsArray={setPosts}
              />
            ))}
          </TabsContent>

          <TabsContent value="replies" className="space-y-6">
            <Card className="p-12 text-center bg-card/50 backdrop-blur-xl border-border/50">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No replies yet
              </h3>
              <p className="text-muted-foreground">
                When {profile.name} replies to posts, they&apos;ll appear here.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            {mediaPosts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaPosts.map((post) => (
                  <div
                    key={post.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border/50 group cursor-pointer"
                  >
                    <Image
                      src={post.image || '/placeholder.svg'}
                      alt="Media"
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1 text-white">
                        <Heart className="h-5 w-5" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-card/50 backdrop-blur-xl border-border/50">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Share2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No media yet
                </h3>
                <p className="text-muted-foreground">
                  When {profile.name} posts media, it&apos;ll appear here.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="likes" className="space-y-6">
            {likedPosts.length > 0 ? (
              likedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  postsArray={likedPosts}
                  setPostsArray={() => {}}
                />
              ))
            ) : (
              <Card className="p-12 text-center bg-card/50 backdrop-blur-xl border-border/50">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No likes yet
                </h3>
                <p className="text-muted-foreground">
                  When {profile.name} likes posts, they&apos;ll appear here.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
