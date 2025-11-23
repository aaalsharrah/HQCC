"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Smile, CalendarClock, MapPin } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { createPost } from "@/lib/firebase/posts"

export function NewPost({ user }) {
  const { user: authUser } = useAuth()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || !authUser) return

    setIsSubmitting(true)
    try {
      await createPost({
        content: content.trim(),
        authorId: authUser.uid,
        authorName: authUser.displayName || authUser.email?.split('@')[0] || 'User',
        authorEmail: authUser.email || '',
      })
      setContent("")
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayUser = user || authUser

  return (
    <div className="p-4 border-b border-border bg-card/30 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={displayUser?.avatar || "/placeholder.svg"} />
            <AvatarFallback>{(displayUser?.name || displayUser?.displayName || displayUser?.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 gap-2 flex flex-col">
            <Textarea
              placeholder="What's happening in the quantum realm?"
              className="min-h-[60px] border-none bg-transparent resize-none focus-visible:ring-0 p-0 text-lg placeholder:text-muted-foreground/70"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
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
              <Button
                type="submit"
                size="sm"
                className="rounded-full font-bold px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={!content.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

