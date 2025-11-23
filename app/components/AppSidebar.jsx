"use client"

import { useState } from "react"
import { Home, User, Users, Settings, Clock, LogOut, Bell, MessageSquare, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/firebase/auth-context"

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Users, label: "Community", href: "/community" },
  { icon: Clock, label: "Timeline", href: "/timeline" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function AppSidebarContent() {
  const { user, loading, signOutUser } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOutUser()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          HQCC
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start gap-4 text-lg font-medium h-12"
            asChild
          >
            <a
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith('/')) {
                  e.preventDefault()
                  window.location.href = item.href
                }
              }}
            >
              <item.icon className="w-6 h-6" />
              {item.label}
            </a>
          </Button>
        ))}
      </nav>

      <div className="px-4 mt-auto border-t border-border pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
          disabled={signingOut || loading}
        >
          {signingOut ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Log out
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

