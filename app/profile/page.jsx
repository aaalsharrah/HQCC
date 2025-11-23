"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { getMemberProfile, getAllMemberProfiles } from "@/lib/firebase/profiles"
import { getPosts } from "@/lib/firebase/posts"
import { ProfileHeader } from "@/components/profile-header"
import { PostCard } from "@/components/ui/post-card"
import { NewPost } from "@/components/new-post"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Mail, GraduationCap, User } from "lucide-react"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      // Redirect to home if not authenticated
      router.push("/")
      return
    }

    const loadProfile = async () => {
      try {
        setLoading(true)
        const memberProfile = await getMemberProfile(user.uid)
        
        if (!memberProfile) {
          // If profile doesn't exist, create a basic one from auth data
          setProfile({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            handle: `@${user.email?.split('@')[0] || 'user'}`,
            avatar: user.photoURL || "/placeholder.svg",
            banner: "/placeholder.svg",
            bio: "Quantum computing enthusiast ⚛️ | Building the future bit by qubit | Member of HQCC",
            joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            location: null,
            website: null,
            uid: user.uid,
          })
        } else {
          // Transform Firestore profile to match ProfileHeader format
          const joinedDate = memberProfile.joinedAt?.toDate 
            ? memberProfile.joinedAt.toDate() 
            : new Date()
          
          setProfile({
            name: memberProfile.name || user.displayName || user.email?.split('@')[0] || 'User',
            handle: `@${user.email?.split('@')[0] || 'user'}`,
            avatar: memberProfile.avatar || user.photoURL || "/placeholder.svg",
            banner: "/placeholder.svg",
            bio: memberProfile.bio || "Quantum computing enthusiast ⚛️ | Building the future bit by qubit | Member of HQCC",
            joined: joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            location: null,
            website: null,
            uid: user.uid,
          })
        }

        // Load user's posts
        const allPosts = await getPosts(100)
        const userPosts = allPosts.filter((post) => post.authorId === user.uid)
        
        // Transform posts to match PostCard format
        const transformedPosts = userPosts.map((post) => ({
          id: post.id,
          user: {
            name: post.authorName,
            handle: `@${post.authorEmail?.split('@')[0] || 'user'}`,
            avatar: "/placeholder.svg",
          },
          content: post.content,
          timestamp: post.createdAt?.toDate 
            ? formatTimestamp(post.createdAt.toDate())
            : 'Just now',
          likes: post.likesCount || 0,
          comments: 0, // TODO: Get actual comment count
          shares: 0,
        }))
        
        setPosts(transformedPosts)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, authLoading, router])

  const formatTimestamp = (date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatJoinDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Members tab component
  function MembersTab({ members, membersLoading, setMembers, setMembersLoading }) {
    useEffect(() => {
      const loadMembers = async () => {
        if (members.length > 0) return // Already loaded
        
        try {
          setMembersLoading(true)
          const allMembers = await getAllMemberProfiles(100)
          setMembers(allMembers)
        } catch (error) {
          console.error('Error loading members:', error)
        } finally {
          setMembersLoading(false)
        }
      }
      loadMembers()
    }, [])

    if (membersLoading) {
      return (
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )
    }

    if (members.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <p>No members found.</p>
        </div>
      )
    }

    return (
      <div className="p-4 space-y-3">
        {members.map((member) => (
          <Card key={member.uid} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name || 'User'} />
                  <AvatarFallback>
                    {(member.name || member.email?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base leading-none truncate">
                        {member.name || member.email?.split('@')[0] || 'User'}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                    {member.role === 'board' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                        Board
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {member.year && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{member.year}</span>
                      </div>
                    )}
                    {member.major && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{member.major}</span>
                      </div>
                    )}
                    {member.joinedAt && (
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        <span>Joined {formatJoinDate(member.joinedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/60 mb-4">{error || 'Profile not found'}</p>
          <a href="/" className="text-primary hover:underline">
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-2xl mx-auto pb-10 min-h-screen border-x border-border shadow-2xl bg-card/30 backdrop-blur-md">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
          <h2 className="font-bold text-lg">{profile.name}</h2>
          <p className="text-xs text-muted-foreground">{posts.length} posts</p>
        </div>

        <ProfileHeader user={profile} isOwnProfile={true} />

        <Tabs defaultValue="posts" className="w-full mt-2">
          <TabsList className="w-full justify-between bg-transparent border-b border-border rounded-none h-auto p-0">
            {["Posts", "Replies", "Highlights", "Media", "Likes", "Members"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground py-3 hover:bg-muted/30 transition-colors text-xs sm:text-sm"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="posts" className="m-0">
            <NewPost user={profile} onPostCreated={() => {
              // Reload posts after creating a new one
              const reloadPosts = async () => {
                try {
                  const allPosts = await getPosts(100)
                  const userPosts = allPosts.filter((post) => post.authorId === user.uid)
                  const transformedPosts = userPosts.map((post) => ({
                    id: post.id,
                    user: {
                      name: post.authorName,
                      handle: `@${post.authorEmail?.split('@')[0] || 'user'}`,
                      avatar: "/placeholder.svg",
                    },
                    content: post.content,
                    timestamp: post.createdAt?.toDate 
                      ? formatTimestamp(post.createdAt.toDate())
                      : 'Just now',
                    likes: post.likesCount || 0,
                    comments: 0,
                    shares: 0,
                  }))
                  setPosts(transformedPosts)
                } catch (err) {
                  console.error('Error reloading posts:', err)
                }
              }
              reloadPosts()
            }} />
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No posts yet. Start sharing your quantum journey!</p>
              </div>
            )}
            {posts.length > 0 && (
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

          <TabsContent value="members" className="m-0">
            <MembersTab 
              members={members}
              membersLoading={membersLoading}
              setMembers={setMembers}
              setMembersLoading={setMembersLoading}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
