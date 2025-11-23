"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Menu, X, User } from "lucide-react"

import { useAuth } from "@/lib/firebase/auth-context"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutMessage, setSignOutMessage] = useState("")
  const { user, loading, signOutUser } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "About", href: "#about" },
    { label: "Activities", href: "#activities" },
    { label: "Timeline", href: "/timeline" },
    { label: "Team", href: "#team" },
    ...(user ? [] : [{ label: "Join", href: "#join" }]),
  ]

  const handleSignOut = async () => {
    setSigningOut(true)
    setSignOutMessage("")
    try {
      await signOutUser()
      setSignOutMessage("Signed out. See you soon!")
      setTimeout(() => setSignOutMessage(""), 4000)
    } catch (error) {
      console.error("Unable to sign out", error)
      setSignOutMessage("Unable to sign out. Please try again.")
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-card/80 backdrop-blur-xl shadow-lg border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="text-2xl font-bold tracking-tight transition-colors hover:text-primary">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              HQCC
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith('/')) {
                    e.preventDefault();
                    window.location.href = item.href;
                    return false;
                  }
                }}
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
            {!user && (
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <a href="#join">Join Club</a>
              </Button>
            )}
            {loading ? (
              <div className="flex items-center gap-2 text-xs font-medium text-foreground/60">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing account…
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/profile?userId=${user.uid}`;
                  }}
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold hover:bg-primary/30 transition-colors cursor-pointer"
                  title="View Profile"
                >
                  {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                </button>
                <div className="flex flex-col items-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="min-w-[108px]"
                  >
                    {signingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing out
                      </>
                    ) : (
                      "Sign out"
                    )}
                  </Button>
                  {signOutMessage && (
                    <span className="text-[11px] text-foreground/50">{signOutMessage}</span>
                  )}
                </div>
              </div>
            ) : null}
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
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-3 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                onClick={(e) => {
                  setIsOpen(false);
                  if (item.href.startsWith('/')) {
                    e.preventDefault();
                    window.location.href = item.href;
                    return false;
                  }
                }}
              >
                {item.label}
              </a>
            ))}
            <div className="px-3 pt-2 space-y-3">
              {!user && (
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <a href="#join">Join Club</a>
                </Button>
              )}
              {loading ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing account…
                </div>
              ) : user ? (
                <div className="rounded-xl border border-border/80 bg-background/80 p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = `/profile?userId=${user.uid}`;
                    }}
                    className="flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors cursor-pointer w-full text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{user.displayName ?? user.email}</div>
                      <div className="text-xs text-foreground/60">View Profile</div>
                    </div>
                  </button>
                  <Button variant="outline" className="w-full" onClick={handleSignOut} disabled={signingOut}>
                    {signingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing out
                      </>
                    ) : (
                      "Sign out"
                    )}
                  </Button>
                  {signOutMessage && (
                    <p className="text-xs text-foreground/60">{signOutMessage}</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
