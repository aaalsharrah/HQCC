import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal } from "lucide-react"

interface PostCardProps {
  post: {
    id: number
    user: {
      name: string
      handle: string
      avatar: string
    }
    content: string
    timestamp: string
    likes: number
    comments: number
    shares: number
  }
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 border border-primary/20">
          <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
          <AvatarFallback>{post.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-bold truncate text-foreground">{post.user.name}</span>
              <span className="text-muted-foreground truncate text-sm">{post.user.handle}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm whitespace-nowrap">{post.timestamp}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-1 text-foreground/90 whitespace-pre-wrap break-words text-sm sm:text-base">{post.content}</p>

          <div className="flex items-center justify-between mt-3 max-w-md text-muted-foreground">
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-primary hover:bg-primary/10 gap-2 group">
              <MessageCircle className="h-4 w-4 group-hover:text-primary" />
              <span className="text-xs">{post.comments}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:text-green-500 hover:bg-green-500/10 gap-2 group"
            >
              <Repeat2 className="h-4 w-4 group-hover:text-green-500" />
              <span className="text-xs">{post.shares}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-pink-500 hover:bg-pink-500/10 gap-2 group">
              <Heart className="h-4 w-4 group-hover:text-pink-500" />
              <span className="text-xs">{post.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-blue-500 hover:bg-blue-500/10 group">
              <Share2 className="h-4 w-4 group-hover:text-blue-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
