"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { getMemberProfile } from "@/lib/firebase/profiles"

export function Navigation() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("/placeholder-user.jpg")
  const [userInitial, setUserInitial] = useState("U")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!user) {
        setAvatarUrl("/placeholder-user.jpg")
        setUserInitial("U")
        return
      }

      try {
        const profile = await getMemberProfile(user.uid)
        if (profile?.avatar) {
          setAvatarUrl(profile.avatar)
        } else if (user.photoURL) {
          setAvatarUrl(user.photoURL)
        } else {
          setAvatarUrl("/placeholder-user.jpg")
        }

        const name = profile?.name || user.displayName || user.email?.split('@')[0] || 'User'
        setUserInitial(name[0].toUpperCase())
      } catch (error) {
        console.error('Error loading user avatar:', error)
        // Fallback to Firebase Auth data
        if (user.photoURL) {
          setAvatarUrl(user.photoURL)
        }
        const name = user.displayName || user.email?.split('@')[0] || 'User'
        setUserInitial(name[0].toUpperCase())
      }
    }

    loadUserAvatar()
  }, [user])

  const navItems = [
    { label: "About", href: "/#about" },
    { label: "Activities", href: "/#activities" },
    { label: "Team", href: "/#team" },
    { label: "Community", href: "/community" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-card/80 backdrop-blur-xl shadow-lg border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-bold tracking-tight transition-colors hover:text-primary">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              HQCC
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              // Use Link for internal routes, anchor for hash links
              const isHashLink = item.href.startsWith('#')
              const Component = isHashLink ? 'a' : Link
              const props = isHashLink ? { href: item.href } : { href: item.href }
              
              return (
                <Component
                  key={item.label}
                  {...props}
                  className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Component>
              )
            })}
            <div className="flex items-center gap-4">
              {user ? (
                <Button asChild variant="ghost" size="icon" className="rounded-full">
                  <Link href="/profile">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={avatarUrl} alt="Profile" />
                      <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="ghost" size="icon" className="rounded-full">
                  <Link href="/profile">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                      <AvatarFallback className="text-xs">U</AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-foreground">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const isHashLink = item.href.startsWith('#')
              const Component = isHashLink ? 'a' : Link
              const props = isHashLink ? { href: item.href } : { href: item.href }
              
              return (
                <Component
                  key={item.label}
                  {...props}
                  className="block px-3 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Component>
              )
            })}
            <Link
              href="/profile"
              className="block px-3 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
