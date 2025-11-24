'use client';

import { useState, use } from 'react';
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
  UserPlus,
} from 'lucide-react';
import { Navigation } from '@/app/components/Navigation';
import Image from 'next/image';

const mockProfile = {
  name: 'Abdallah Aisharrah',
  username: 'abdallah_ai',
  avatar: '/quantum-computing-student.jpg',
  coverImage: '/quantum-computing-chip-with-glowing-circuits-and-b.jpg',
  bio: 'Founder & President of HQCC | Quantum Computing Enthusiast | Building the future of computing at Hofstra University',
  location: 'Hempstead, NY',
  website: 'hqcc.hofstra.edu',
  joined: 'September 2023',
  following: 324,
  followers: 892,
  isFollowing: false,
};

const mockPosts = [
  {
    id: '1',
    content:
      "Excited to announce our upcoming Quantum Hackathon! We'll be working with IBM Qiskit to build real quantum algorithms. Registration opens next week!",
    image: '/quantum-computing-chip-with-glowing-circuits-and-b.jpg',
    timestamp: '2h ago',
    likes: 42,
    comments: 12,
    shares: 5,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '2',
    content:
      "Great turnout at today's workshop! Love seeing everyone so passionate about quantum computing. Can't wait for the next session.",
    timestamp: '1d ago',
    likes: 67,
    comments: 15,
    shares: 8,
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: '3',
    content:
      "Just finished implementing Shor's algorithm on our quantum simulator. The results are fascinating! Check out our GitHub for the code.",
    image: '/quantum-algorithm-code-screen.jpg',
    timestamp: '3d ago',
    likes: 93,
    comments: 24,
    shares: 31,
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: '4',
    content:
      "Reminder: Weekly study group tomorrow at 6 PM. We'll be diving deep into quantum entanglement. Bring your questions!",
    timestamp: '4d ago',
    likes: 28,
    comments: 9,
    shares: 3,
    isLiked: false,
    isBookmarked: false,
  },
];

const mockMediaPosts = mockPosts.filter((p) => p.image);
const mockLikedPosts = mockPosts.filter((p) => p.isLiked);

export default function ProfilePage(props) {
  const params = use(props.params);
  const { username } = params;
  const [profile] = useState(mockProfile);
  const [posts, setPosts] = useState(mockPosts);
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);

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
          <AvatarFallback>{profile.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
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
            width={196}
            height={10}
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

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
              width={196}
              height={10}
            />
          </div>

          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 md:-top-20">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-card border-4 border-background">
                <AvatarImage src={profile.avatar || '/placeholder.svg'} />
                <AvatarFallback className="text-3xl">
                  {profile.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Follow / Unfollow */}
            <div className="flex justify-end pt-4">
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                onClick={() => setIsFollowing(!isFollowing)}
                className={
                  isFollowing
                    ? 'border-primary/30 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
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
                    href={`https://${profile.website}`}
                    target="_blank"
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
            {mockMediaPosts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockMediaPosts.map((post) => (
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
            {mockLikedPosts.length > 0 ? (
              mockLikedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  postsArray={mockLikedPosts}
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
