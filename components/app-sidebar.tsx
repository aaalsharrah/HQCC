"use client"

import Link from "next/link"
import { Home, User, Users, Settings, Clock, LogOut, Bell, MessageSquare, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

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
            <Link href={item.href}>
              <item.icon className="w-6 h-6" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="px-4 mt-auto border-t border-border pt-4">
        <Button variant="ghost" className="w-full justify-start gap-4 text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5" />
          Log out
        </Button>
      </div>
    </div>
  )
}
