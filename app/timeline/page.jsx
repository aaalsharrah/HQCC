'use client'

import { useState, useEffect } from 'react'
import { PostCard } from "@/components/ui/post-card"
import { NewPost } from "../components/NewPost"
import { AppSidebarContent } from "../components/AppSidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { subscribeToPosts } from "@/lib/firebase/posts"
import { Loader2 } from "lucide-react"

export default function TimelinePage() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    setIsLoading(true)
    const unsubscribe = subscribeToPosts((fetchedPosts) => {
      // Transform Firebase posts to match PostCard format
      const transformedPosts = fetchedPosts.map(post => ({
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
      setPosts(transformedPosts)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [authLoading])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
            {user && <NewPost user={user} />}
          </div>

          <div>
            {posts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
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
