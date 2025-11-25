'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  subscribeToConversations,
  getOtherUser,
  formatTimestamp,
} from '@/app/lib/firebase/messages';

export default function MessagesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      // Subscribe to conversations
      const unsubscribeConversations = subscribeToConversations(
        user.uid,
        async (conversationsData) => {
          // For each conversation, get the other user's data
          const conversationsWithUsers = await Promise.all(
            conversationsData.map(async (conv) => {
              const otherUser = await getOtherUser(conv.id, user.uid);
              return {
                id: conv.id,
                name: otherUser?.name || 'Unknown User',
                email: otherUser?.email || '',
                avatar: otherUser?.avatar || null,
                lastMessage: conv.lastMessage || '',
                lastMessageTime: conv.lastMessageTime,
                bookTitle: conv.bookTitle || null,
                sellerId: conv.sellerId || null,
                bookId: conv.bookId || null,
              };
            })
          );

          setConversations(conversationsWithUsers);
          setLoading(false);
        }
      );

      return () => {
        unsubscribeConversations();
      };
    });

    return () => unsubscribe();
  }, []);
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20 h-screen flex">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-96 border-r border-border flex flex-col bg-card/30 backdrop-blur-sm">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold mb-4 bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Messages
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Send className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start a conversation with a member to see messages here'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/member/messages/${conv.id}`)}
                  className="w-full p-4 flex items-start gap-3 hover:bg-primary/5 transition-colors border-b border-border/50"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.avatar || '/placeholder.svg'} />
                    <AvatarFallback>
                      {conv.name ? conv.name[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {conv.name}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatTimestamp(conv.lastMessageTime)}
                      </span>
                    </div>
                    {conv.bookTitle && (
                      <p className="text-xs text-muted-foreground/70 mb-1 truncate">
                        Re: {conv.bookTitle}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right side placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Select a conversation
            </h3>
            <p className="text-muted-foreground">
              Choose a message from the list to start chatting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
