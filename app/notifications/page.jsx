'use client'

import { useState, useEffect } from 'react'
import { Bell, Heart, MessageCircle, Calendar, Megaphone, Mail, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { AppSidebarContent } from '../components/AppSidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/lib/firebase/auth-context'
import { getNotifications } from '@/lib/firebase/notifications'
import { Loader2 } from 'lucide-react'

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return

    const loadNotifications = async () => {
      setIsLoading(true)
      try {
        const notifs = await getNotifications(user.uid)
        setNotifications(notifs)
      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [authLoading, user])

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-current" />
      case "reply":
        return <MessageCircle className="w-5 h-5 text-blue-500 fill-current" />
      case "event":
        return <Calendar className="w-5 h-5 text-purple-500" />
      case "announcement":
        return <Megaphone className="w-5 h-5 text-yellow-500" />
      case "dm":
        return <Mail className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-primary" />
    }
  }

  if (authLoading) {
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
          <h1 className="text-xl font-bold">Notifications</h1>
        </header>

        <main className="divide-y divide-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                  !notification.read && "bg-muted/20",
                )}
              >
                <div className="mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1 space-y-1">
                  {notification.user && (
                    <div className="mb-1">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name || notification.user.email} />
                        <AvatarFallback>{(notification.user.name || notification.user.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <p className="text-sm">
                    {notification.user && <span className="font-bold mr-1">{notification.user.name || notification.user.email?.split('@')[0]}</span>}
                    <span className="text-muted-foreground">{notification.content}</span>
                  </p>
                  {notification.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp.toDate ? new Date(notification.timestamp.toDate()).toLocaleString() : notification.timestamp}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  )
}
