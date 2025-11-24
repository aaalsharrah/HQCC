'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
} from 'lucide-react';


// 🔥 adjust this path if your firebase file is elsewhere
import { auth, db } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const mediaPosts = posts.filter((p) => p.image);
  const likedPosts = posts.filter((p) => p.isLiked);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      try {
        // ✅ always use the Firebase Auth UID
        const ref = doc(db, 'members', user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          const fallbackName =
            user.displayName || user.email?.split('@')[0] || 'HQCC Member';
          const username =
            user.email
              ?.split('@')[0]
              ?.toLowerCase()
              .replace(/[^a-z0-9]/g, '') || 'member';

          setProfile({
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
            following: 0,
            followers: 0,
          });
        } else {
          const data = snap.data();

          setProfile({
            uid: user.uid,
            name: data.name || 'HQCC Member',
            username: data.username || 'member',
            email: data.email || user.email || '',
            avatar:
              data.avatar || user.photoURL || '/quantum-computing-student.jpg',
            coverImage:
              data.coverImage ||
              '/quantum-computing-chip-with-glowing-circuits-and-b.jpg',
            bio: data.bio || 'HQCC member | Quantum & Computing Enthusiast',
            location: data.location || 'Hempstead, NY',
            website: data.website || 'hqcc.hofstra.edu',
            joined: 'September 2023', // later: format data.createdAt
            following: data.following || 0,
            followers: data.followers || 0,
          });
        }

        setPosts([
          {
            id: '1',
            content:
              'Welcome to your HQCC profile! Soon you will be able to customize your bio and posts.',
            timestamp: 'just now',
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isBookmarked: false,
          },
        ]);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  const handleLike = (postId, postsArray, setPostsArray) => {
    setPostsArray(
      postsArray.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
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

  const PostCard = ({ post, postsArray, setPostsArray }) => (
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
          <AvatarImage src={profile.avatar || '/placeholder.svg'} />
          <AvatarFallback>
            {profile.name ? profile.name.slice(0, 2) : 'HQ'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 ">
              <h3 className="font-semibold text-foreground">{profile.name}</h3>
              <span className="text-xs text-muted-foreground">
                @{profile.username}
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

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-primary"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{post.comments}</span>
        </Button>

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

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading profile...</p>
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
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20">
            <Image
              src={profile.coverImage || '/placeholder.svg'}
              alt="Cover"
              className="w-full h-full object-cover opacity-50"
              width={1200}
              height={400}
            />
          </div>

          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 md:-top-20">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-card border-4 border-background">
                <AvatarImage src={profile.avatar || '/placeholder.svg'} />
                <AvatarFallback className="text-3xl">
                  {profile.name ? profile.name.slice(0, 2) : 'HQ'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Edit Profile button */}
            <div className="flex justify-end pt-4">
              <Link href="/member/settings">
                <Button
                  className="
                    bg-gradient-to-r from-primary via-accent to-secondary
                    text-white font-medium
                    hover:opacity-90
                    transition-all
                  "
                >
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* Profile Info */}
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {profile.name}
              </h1>
              <p className="text-muted-foreground mb-4">@{profile.username}</p>

              <p className="text-foreground leading-relaxed mb-4">
                {profile.bio}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
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

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <button className="hover:underline">
                  <span className="font-bold text-foreground">
                    {profile.following}
                  </span>{' '}
                  <span className="text-muted-foreground">Following</span>
                </button>

                <button className="hover:underline">
                  <span className="font-bold text-foreground">
                    {profile.followers}
                  </span>{' '}
                  <span className="text-muted-foreground">Followers</span>
                </button>
              </div>
            </div>
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
                    <img
                      src={post.image || '/placeholder.svg'}
                      alt="Media"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
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
