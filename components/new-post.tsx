"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Smile, CalendarClock, MapPin, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { createPost } from "@/lib/firebase/posts"
import { useRouter } from "next/navigation"

export function NewPost({ user, onPostCreated }: { user: any; onPostCreated?: () => void }) {
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || !authUser || isPosting) return

    setIsPosting(true)
    setError(null)

    try {
      await createPost({
        authorId: authUser.uid,
        authorName: user.name || authUser.displayName || authUser.email?.split('@')[0] || 'User',
        authorEmail: authUser.email || '',
        content: content.trim(),
      })

      // Clear the input
      setContent("")
      
      // Refresh the page or call callback to reload posts
      if (onPostCreated) {
        onPostCreated()
      } else {
        // Refresh the current page to show new post
        router.refresh()
      }
    } catch (err) {
      console.error('Error creating post:', err)
      setError(err.message || 'Failed to post. Please try again.')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="p-4 border-b border-border bg-card/30 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 gap-2 flex flex-col">
            <Textarea
              placeholder="What's happening in the quantum realm?"
              className="min-h-[60px] border-none bg-transparent resize-none focus-visible:ring-0 p-0 text-lg placeholder:text-muted-foreground/70"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
              maxLength={280}
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex gap-0.5 text-primary">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/20">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/20">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/20">
                  <CalendarClock className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/20">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {content.length > 0 && (
                  <span className={`text-xs ${content.length > 280 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {content.length}/280
                  </span>
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full font-bold px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  disabled={!content.trim() || isPosting || content.length > 280}
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
