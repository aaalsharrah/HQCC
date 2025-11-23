"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { getConversations } from "@/lib/firebase/messages"
import { getAllMemberProfiles } from "@/lib/firebase/profiles"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebarContent } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/")
      return
    }

    const loadConversations = async () => {
      try {
        setLoading(true)
        const firebaseConversations = await getConversations(user.uid)
        
        // Get all member profiles to match user info
        const allMembers = await getAllMemberProfiles(100)
        const membersMap = new Map(allMembers.map(m => [m.uid, m]))
        
        // Transform conversations to match component format
        const transformedConversations = await Promise.all(
          firebaseConversations.map(async (conv) => {
            // Find the other participant
            const otherUserId = conv.participants.find(p => p !== user.uid) || conv.participants[0]
            const otherMember = membersMap.get(otherUserId)
            
            return {
              id: conv.id,
              user: {
                name: otherMember?.name || 'User',
                avatar: otherMember?.avatar || "/placeholder.svg",
              },
              lastMessage: conv.lastMessage || 'No messages yet',
              timestamp: conv.lastMessageAt?.toDate 
                ? formatTimestamp(conv.lastMessageAt.toDate())
                : 'Just now',
              unread: 0, // TODO: Calculate unread count
            }
          })
        )
        
        setConversations(transformedConversations)
      } catch (error) {
        console.error('Error loading conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md p-4 flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <AppSidebarContent />
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold">Messages</h1>
      </header>

      <main className="divide-y divide-border">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className={cn(
                "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                conversation.unread > 0 && "bg-muted/20",
              )}
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={conversation.user.avatar || "/placeholder.svg"} alt={conversation.user.name} />
                <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className={cn("font-medium truncate", conversation.unread > 0 && "font-bold")}>
                    {conversation.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{conversation.timestamp}</span>
                </div>
                <p
                  className={cn(
                    "text-sm text-muted-foreground truncate",
                    conversation.unread > 0 && "text-foreground font-medium",
                  )}
                >
                  {conversation.lastMessage}
                </p>
              </div>
              {conversation.unread > 0 && <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />}
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
      </main>
    </div>
  )
}
