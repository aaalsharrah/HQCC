'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, ImageIcon, Smile, Menu, ArrowLeft } from 'lucide-react'
import { BackButton } from '../../components/BackButton'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AppSidebarContent } from '../../components/AppSidebar'
import { useAuth } from '@/lib/firebase/auth-context'
import { getDoc, doc } from 'firebase/firestore'
import { sendMessage, subscribeToMessages } from '@/lib/firebase/messages'
import { firestore } from '@/lib/firebase/client'
import { Loader2 } from 'lucide-react'

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const [conversationId, setConversationId] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      setConversationId(id)
    }
  }, [])

  useEffect(() => {
    if (authLoading || !conversationId || !user) return

    const loadConversation = async () => {
      setIsLoading(true)
      try {
        const convRef = doc(firestore, 'conversations', conversationId)
        const convSnap = await getDoc(convRef)
        if (convSnap.exists()) {
          setConversation({ id: convSnap.id, ...convSnap.data() })
        }
      } catch (error) {
        console.error('Error loading conversation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversation()
  }, [conversationId, authLoading, user])

  useEffect(() => {
    if (!conversationId) return

    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [conversationId])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !conversationId || !user) return

    setIsSending(true)
    try {
      await sendMessage({
        conversationId,
        senderId: user.uid,
        content: messageText.trim(),
      })
      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-foreground/60 mb-4">Conversation not found</p>
            <a href="/messages" className="text-primary hover:underline">
              Back to Messages
            </a>
          </div>
        </div>
      </div>
    )
  }

    const otherUserId = conversation.participants?.find(p => p !== user?.uid) || conversation.participants?.[0]
    const otherUser = otherUserId ? { uid: otherUserId } : null

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md p-4 flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <AppSidebarContent />
          </SheetContent>
        </Sheet>
        <button
          onClick={() => window.history.back()}
          className="mr-2 hover:bg-muted p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Avatar className="w-10 h-10">
          <AvatarImage src={otherUser?.avatar || "/placeholder.svg"} alt={otherUser?.name || otherUser?.email} />
          <AvatarFallback>{(otherUser?.name || otherUser?.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-bold">{otherUser?.name || otherUser?.email?.split('@')[0] || 'User'}</h1>
          <p className="text-xs text-muted-foreground">{otherUser?.email}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === user?.uid
            return (
              <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </main>

      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
            <Smile className="w-5 h-5" />
          </Button>
          <Input 
            placeholder="Start a new message" 
            className="flex-1 bg-muted border-none" 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={isSending}
          />
          <Button type="submit" size="icon" className="rounded-full" disabled={!messageText.trim() || isSending}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

