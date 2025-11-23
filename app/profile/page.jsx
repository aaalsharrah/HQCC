'use client'

import { useState, useEffect } from 'react'
import { ProfileHeader } from '../components/ProfileHeader'
import { PostCard } from "@/components/ui/post-card"
import { NewPost } from '../components/NewPost'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from '@/lib/firebase/auth-context'
import { getMemberProfile } from '@/lib/firebase/profiles'
import { subscribeToPosts } from '@/lib/firebase/posts'
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const [userId, setUserId] = useState(null)
  const { user: currentUser, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const isOwnProfile = currentUser?.uid === userId

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('userId')
      if (!id && currentUser) {
        setUserId(currentUser.uid)
      } else {
        setUserId(id)
      }
    }
  }, [currentUser])

  useEffect(() => {
    if (authLoading || !userId) return

    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const memberProfile = await getMemberProfile(userId)
        setProfile(memberProfile)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [userId, authLoading])

  useEffect(() => {
    if (!userId) return

    setIsLoadingPosts(true)
    const unsubscribe = subscribeToPosts((posts) => {
      const filtered = posts.filter((post) => post.authorId === userId)
      const transformedPosts = filtered.map(post => ({
        id: post.id,
        user: {
          name: post.authorName || 'User',
          handle: `@${(post.authorName || post.authorEmail?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '_')}`,
          avatar: null
        },
        content: post.content,
        timestamp: post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Just now',
        likes: post.likesCount || 0,
        comments: post.commentsCount || 0,
        shares: 0,
        authorName: post.authorName,
        authorEmail: post.authorEmail,
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        createdAt: post.createdAt
      }))
      setUserPosts(transformedPosts)
      setIsLoadingPosts(false)
    })

    return () => unsubscribe()
  }, [userId])

  if (authLoading || isLoading || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-foreground/60 mb-4">Profile not found</p>
            <a href="/community" className="text-primary hover:underline">
              Back to Community
            </a>
          </div>
        </div>
      </div>
    )
  }

  const profileUser = {
    name: profile.name || profile.email?.split('@')[0] || 'User',
    handle: `@${(profile.name || profile.email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '_')}`,
    avatar: profile.avatar,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    joinedAt: profile.joinedAt,
    uid: profile.uid,
    id: profile.uid
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-2xl mx-auto pb-10 min-h-screen border-x border-border shadow-2xl bg-card/30 backdrop-blur-md">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
          <h2 className="font-bold text-lg">{profileUser.name}</h2>
          <p className="text-xs text-muted-foreground">{userPosts.length} posts</p>
        </div>

        <ProfileHeader user={profileUser} isOwnProfile={isOwnProfile} />

        <Tabs defaultValue="posts" className="w-full mt-2">
          <TabsList className="w-full justify-between bg-transparent border-b border-border rounded-none h-auto p-0">
            {["Posts", "Replies", "Highlights", "Media", "Likes"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground py-3 hover:bg-muted/30 transition-colors"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="posts" className="m-0">
            {isOwnProfile && <NewPost user={currentUser} />}
            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userPosts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No posts yet</p>
              </div>
            ) : (
              userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
            {userPosts.length > 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <p>End of posts</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="replies" className="m-0 p-8 text-center text-muted-foreground">
            No replies yet.
          </TabsContent>

          <TabsContent value="highlights" className="m-0 p-8 text-center text-muted-foreground">
            No highlights yet.
          </TabsContent>

          <TabsContent value="media" className="m-0 p-8 text-center text-muted-foreground">
            No media yet.
          </TabsContent>

          <TabsContent value="likes" className="m-0 p-8 text-center text-muted-foreground">
            No likes visible.
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
