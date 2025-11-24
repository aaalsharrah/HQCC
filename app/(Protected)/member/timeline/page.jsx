"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, Bookmark, ImageIcon, Send } from "lucide-react"
import { Navigation } from "@/app/components/Navigation"



const mockPosts = [
  {
    id: "1",
    author: {
      name: "Abdallah Aisharrah",
      username: "abdallah_ai",
      avatar: "/quantum-computing-student.jpg",
      role: "Founder & President",
    },
    content:
      "Excited to announce our upcoming Quantum Hackathon! We'll be working with IBM Qiskit to build real quantum algorithms. Registration opens next week! 🚀",
    image: "/quantum-computing-chip-with-glowing-circuits-and-b.jpg",
    timestamp: "2h ago",
    likes: 42,
    comments: 12,
    shares: 5,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "2",
    author: {
      name: "Sarah Chen",
      username: "sarah_quantum",
      avatar: "/asian-woman-scientist.png",
      role: "VP of Research",
    },
    content:
      "Just finished reading 'Quantum Computing for Computer Scientists'. Highly recommend for anyone looking to understand the mathematical foundations. The chapter on quantum entanglement blew my mind!",
    timestamp: "5h ago",
    likes: 28,
    comments: 8,
    shares: 3,
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: "3",
    author: {
      name: "Michael Rodriguez",
      username: "mike_qbit",
      avatar: "/latino-man-engineer.jpg",
      role: "Tech Lead",
    },
    content:
      "Quick tutorial: How to implement Grover's algorithm for database search. Check out the code in our GitHub repo! Perfect for beginners.",
    image: "/quantum-algorithm-code-screen.jpg",
    timestamp: "8h ago",
    likes: 67,
    comments: 15,
    shares: 22,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "4",
    author: {
      name: "Emily Watson",
      username: "emily_qc",
      avatar: "/woman-quantum-physicist.jpg",
      role: "Events Coordinator",
    },
    content:
      "Amazing turnout at today's lab visit to IBM's Quantum Computing Center! Seeing a real quantum computer in person was absolutely surreal. Thanks to everyone who came! 🎉",
    timestamp: "1d ago",
    likes: 93,
    comments: 24,
    shares: 12,
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: "5",
    author: {
      name: "David Park",
      username: "david_quantum",
      avatar: "/asian-man-computer-science.jpg",
      role: "Member",
    },
    content:
      "Anyone else struggling with quantum superposition concepts? Would love to discuss this over coffee. Drop a comment if you're interested!",
    timestamp: "1d ago",
    likes: 19,
    comments: 31,
    shares: 2,
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: "6",
    author: {
      name: "Lisa Thompson",
      username: "lisa_qtech",
      avatar: "/woman-technology-student.jpg",
      role: "Member",
    },
    content:
      "Just deployed my first quantum circuit on real hardware! The error rates are higher than simulation but it's so cool to see it run on actual qubits. Progress! 💻⚛️",
    timestamp: "2d ago",
    likes: 56,
    comments: 9,
    shares: 7,
    isLiked: false,
    isBookmarked: false,
  },
]

export default function FeedPage() {
  const [posts, setPosts] = useState(mockPosts)
  const [newPost, setNewPost] = useState("")

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post,
      ),
    )
  }

  const handleBookmark = (postId) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post)))
  }

  const handlePost = () => {
    if (!newPost.trim()) return

    const newPostObj = {
      id: Date.now().toString(),
      author: {
        name: "You",
        username: "your_username",
        avatar: "/diverse-user-avatars.png",
        role: "Member",
      },
      content: newPost,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
    }

    setPosts([newPostObj, ...posts])
    setNewPost("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float-gentle" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-float-gentle"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Community Feed
          </h1>
          <p className="text-muted-foreground text-lg">Stay connected with the latest from HQCC members</p>
        </div>

        {/* Create post card */}
        <Card className="p-6 mb-6 bg-card/50 backdrop-blur-xl border-border/50">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src="/diverse-user-avatars.png" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your quantum thoughts..."
                className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-[80px]"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handlePost}
                  disabled={!newPost.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="p-6 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Post header */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{post.author.name}</h3>
                    <span className="text-xs text-muted-foreground">@{post.author.username}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {post.author.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                </div>
              </div>

              {/* Post content */}
              <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

              {/* Post image */}
              {post.image && (
                <div className="mb-4 rounded-lg overflow-hidden border border-border/50">
                  <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-auto" />
                </div>
              )}

              {/* Post actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`gap-2 ${post.isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
                >
                  <Heart className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
                  <span className="text-sm">{post.likes}</span>
                </Button>

                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{post.comments}</span>
                </Button>

                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm">{post.shares}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBookmark(post.id)}
                  className={`${post.isBookmarked ? "text-accent hover:text-accent/80" : "text-muted-foreground hover:text-accent"}`}
                >
                  <Bookmark className={`h-5 w-5 ${post.isBookmarked ? "fill-current" : ""}`} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Load more */}
        <div className="mt-8 text-center">
          <Button variant="outline" className="border-primary/30 hover:bg-primary/10 bg-transparent">
            Load More Posts
          </Button>
        </div>
      </main>
    </div>
  )
}
