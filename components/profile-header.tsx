import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, LinkIcon, MapPin, MessageCircle, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebarContent } from "@/components/app-sidebar"

interface ProfileHeaderProps {
  user: {
    name: string
    handle: string
    avatar: string
    banner: string
    bio: string
    joined: string
    location?: string
    website?: string
    uid?: string
  }
  isOwnProfile?: boolean
}

export function ProfileHeader({ user, isOwnProfile = false }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-32 sm:h-48 w-full bg-muted overflow-hidden relative">
        <img
          src={user.banner || "/placeholder.svg"}
          alt="Profile Banner"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="px-4 pb-4">
        {/* Avatar & Edit Profile Button */}
        <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-4">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-xl ring-2 ring-primary/20">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} className="object-cover" />
            <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
          </Avatar>

          {/* DM and Sidebar buttons next to Edit Profile */}
          <div className="flex gap-2">
            {isOwnProfile && (
              <Button
                variant="outline"
                className="rounded-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary bg-transparent"
              >
                Edit profile
              </Button>
            )}

            {/* Only show DM button for other users' profiles */}
            {!isOwnProfile && user.uid && (
              <Link href={`/messages/${user.uid}`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary bg-transparent"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </Link>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary bg-transparent"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <AppSidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold leading-none">{user.name}</h1>
          <p className="text-muted-foreground">{user.handle}</p>
        </div>

        <p className="mt-3 text-foreground/90 whitespace-pre-wrap">{user.bio}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-muted-foreground text-sm">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
          {user.website && (
            <div className="flex items-center gap-1">
              <LinkIcon className="w-4 h-4" />
              <a
                href={`https://${user.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {user.website}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            <span>Joined {user.joined}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
