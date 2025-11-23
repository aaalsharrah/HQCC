"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { getAllMemberProfiles } from "@/lib/firebase/profiles"
import { getOrCreateConversation } from "@/lib/firebase/messages"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Search, MessageCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

function MessageButton({ otherUserId }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (e) => {
    e.preventDefault()
    if (!user || isLoading) return

    setIsLoading(true)
    try {
      const conversationId = await getOrCreateConversation({
        userId1: user.uid,
        userId2: otherUserId,
      })
      router.push(`/messages/${conversationId}`)
    } catch (error) {
      console.error('Error creating conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      size="icon" 
      variant="outline" 
      className="rounded-full border-primary/20 bg-transparent"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
    </Button>
  )
}

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/")
      return
    }

    const loadUsers = async () => {
      try {
        setLoading(true)
        const allMembers = await getAllMemberProfiles(100)
        
        // Transform members to match component format
        const transformedUsers = allMembers.map((member) => ({
          name: member.name || member.email?.split('@')[0] || 'User',
          handle: `@${member.email?.split('@')[0] || 'user'}`,
          avatar: member.avatar || "/placeholder.svg",
          bio: member.bio || "Quantum computing enthusiast",
          uid: member.uid,
        }))
        
        setUsers(transformedUsers)
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [user, authLoading, router])

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      u.name.toLowerCase().includes(searchLower) ||
      u.handle.toLowerCase().includes(searchLower) ||
      u.bio.toLowerCase().includes(searchLower)
    )
  })

  if (authLoading || loading) {
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((memberUser) => {
              const isCurrentUser = memberUser.uid === user?.uid
              return (
                <Card
                  key={memberUser.uid}
                  className="bg-card/40 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:bg-card/60 group overflow-hidden"
                >
                  <div className="h-24 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 group-hover:from-primary/30 transition-all" />
                  <CardHeader className="pb-2 relative">
                    <Avatar className="w-20 h-20 border-4 border-background absolute -top-10 shadow-lg">
                      <AvatarImage src={memberUser.avatar || "/placeholder.svg"} alt={memberUser.name} />
                      <AvatarFallback>{memberUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="mt-10 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg leading-none">{memberUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{memberUser.handle}</p>
                      </div>
                      <div className="flex gap-2">
                        {!isCurrentUser && (
                          <Link href={`/messages/${memberUser.uid}`}>
                            <Button size="icon" variant="outline" className="rounded-full border-primary/20 bg-transparent">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant={isCurrentUser ? "outline" : "default"}
                          className={isCurrentUser ? "" : "bg-primary/90 hover:bg-primary"}
                          asChild
                        >
                          <Link href={isCurrentUser ? "/profile" : `/profile?uid=${memberUser.uid}`}>
                            {isCurrentUser ? "You" : "View"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 line-clamp-2 h-10">{memberUser.bio}</p>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-muted-foreground">
                {searchTerm ? `No members found matching "${searchTerm}"` : "No members found"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
