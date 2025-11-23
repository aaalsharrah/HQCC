'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AppSidebarContent } from '../components/AppSidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useAuth } from '@/lib/firebase/auth-context'
import { getConversations } from '@/lib/firebase/messages'
import { Loader2 } from 'lucide-react'

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return

    const loadConversations = async () => {
      setIsLoading(true)
      try {
        const convos = await getConversations(user.uid)
        setConversations(convos)
      } catch (error) {
        console.error('Error loading conversations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [authLoading, user])

  if (authLoading) {
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUserId = conversation.participants?.find(p => p !== user?.uid) || conversation.participants?.[0]
            const otherUser = otherUserId ? { uid: otherUserId } : null
            const unreadCount = conversation.unreadCount || 0
            const lastMessage = conversation.lastMessage

            return (
              <a
                key={conversation.id}
                href={`/messages/chat?id=${conversation.id}`}
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                  unreadCount > 0 && "bg-muted/20",
                )}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={otherUser?.avatar || "/placeholder.svg"} alt={otherUser?.name || otherUser?.email} />
                  <AvatarFallback>{(otherUser?.name || otherUser?.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={cn("font-medium truncate", unreadCount > 0 && "font-bold")}>
                      {otherUser?.name || otherUser?.email?.split('@')[0] || 'User'}
                    </span>
                    {lastMessage?.timestamp && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {lastMessage.timestamp.toDate ? new Date(lastMessage.timestamp.toDate()).toLocaleString() : 'Just now'}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm text-muted-foreground truncate",
                      unreadCount > 0 && "text-foreground font-medium",
                    )}
                  >
                    {lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {unreadCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />}
              </a>
            )
          })
        )}
      </main>
    </div>
  )
}
