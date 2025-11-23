"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { getMemberProfile } from "@/lib/firebase/profiles"
import { getPosts } from "@/lib/firebase/posts"
import { PostCard } from "@/components/ui/post-card"
import { NewPost } from "@/components/new-post"
import { AppSidebarContent } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TimelinePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/")
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load user profile
        const memberProfile = await getMemberProfile(user.uid)
        if (memberProfile) {
          setCurrentUser({
            name: memberProfile.name || user.displayName || user.email?.split('@')[0] || 'User',
            handle: `@${user.email?.split('@')[0] || 'user'}`,
            avatar: memberProfile.avatar || user.photoURL || "/placeholder.svg",
          })
        } else {
          setCurrentUser({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            handle: `@${user.email?.split('@')[0] || 'user'}`,
            avatar: user.photoURL || "/placeholder.svg",
          })
        }

        // Load all posts
        const allPosts = await getPosts(100)
        
        // Transform posts to match PostCard format
        const transformedPosts = allPosts.map((post) => ({
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
      } catch (error) {
        console.error('Error loading timeline:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
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

  const reloadPosts = async () => {
    try {
      const allPosts = await getPosts(100)
      const transformedPosts = allPosts.map((post) => ({
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
    } catch (error) {
      console.error('Error reloading posts:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 border-r border-border bg-background/50 backdrop-blur-xl z-30">
        <AppSidebarContent />
      </div>

      <div className="flex-1 md:ml-64 w-full">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md p-4 flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <AppSidebarContent />
            </SheetContent>
          </Sheet>
          <h2 className="font-bold text-lg">Timeline</h2>
        </header>

        <main className="max-w-2xl mx-auto pb-10 min-h-screen border-x border-border/50 shadow-2xl bg-card/30 backdrop-blur-md">
          <div className="border-b border-border">
            <NewPost user={currentUser} onPostCreated={reloadPosts} />
          </div>

          <div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No posts yet. Start sharing your quantum journey!</p>
              </div>
            )}
          </div>

          {posts.length > 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>You're all caught up!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
