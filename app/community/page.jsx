'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getAllMemberProfiles, searchMembers } from '@/lib/firebase/profiles'
import { Search, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/firebase/auth-context'
import { Loader2 } from 'lucide-react'

export default function CommunityPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (authLoading) return

    const loadMembers = async () => {
      setIsLoading(true)
      try {
        const allMembers = await getAllMemberProfiles()
        setMembers(allMembers)
      } catch (error) {
        console.error('Error loading members:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMembers()
  }, [authLoading])

  const handleSearch = async (term) => {
    setSearchTerm(term)
    if (term.trim().length === 0) {
      const allMembers = await getAllMemberProfiles()
      setMembers(allMembers)
      return
    }

    setIsSearching(true)
    try {
      const results = await searchMembers(term)
      setMembers(results)
    } catch (error) {
      console.error('Error searching members:', error)
    } finally {
      setIsSearching(false)
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
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Community Hub
            </h1>
            <p className="text-muted-foreground mt-1">Connect with other quantum enthusiasts</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-9 bg-card/50 border-primary/20 focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading || isSearching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : members.length === 0 ? (
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-12 text-center">
            <p className="text-foreground/60 mb-4">No members found</p>
            <p className="text-sm text-foreground/50">
              {searchTerm ? 'Try a different search term' : 'Be the first to join!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => {
              const isCurrentUser = member.uid === currentUser?.uid
              return (
                <Card
                  key={member.uid}
                  className="bg-card/40 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:bg-card/60 group overflow-hidden"
                >
                  <div className="h-24 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 group-hover:from-primary/30 transition-all" />
                  <CardHeader className="pb-2 relative">
                    <Avatar className="w-20 h-20 border-4 border-background absolute -top-10 shadow-lg">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name || member.email} />
                      <AvatarFallback>{(member.name || member.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="mt-10 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg leading-none">{member.name || member.email?.split('@')[0] || 'User'}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {member.role === 'board' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium mt-1 inline-block">
                            Board Member
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!isCurrentUser && (
                          <a href={`/messages?userId=${member.uid}`}>
                            <Button size="icon" variant="outline" className="rounded-full border-primary/20 bg-transparent">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant={isCurrentUser ? "outline" : "default"}
                          className={isCurrentUser ? "" : "bg-primary/90 hover:bg-primary"}
                          asChild
                        >
                          <a href={`/profile?userId=${member.uid}`}>
                            {isCurrentUser ? "You" : "View"}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {member.bio ? (
                      <p className="text-sm text-foreground/80 line-clamp-2 h-10">{member.bio}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground line-clamp-2 h-10">No bio yet</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
