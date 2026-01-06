'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, Loader2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  subscribeToConversations,
  getOtherUser,
  formatTimestamp,
  hideConversationForUser,
} from '@/app/lib/firebase/messages';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function MessagesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.name?.toLowerCase().includes(query) ||
      conv.email?.toLowerCase().includes(query) ||
      conv.lastMessage?.toLowerCase().includes(query) ||
      conv.bookTitle?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    let unsubscribeConversations = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // User logged out
      if (!user) {
        setCurrentUser(null);
        setConversations([]);
        setLoading(false);

        if (unsubscribeConversations) {
          unsubscribeConversations();
          unsubscribeConversations = null;
        }

        // optional: redirect to signin or leave as is
        // router.push('/signin');
        return;
      }

      // User logged in
      setCurrentUser(user);

      // Clean up any existing conversations listener before making a new one
      if (unsubscribeConversations) {
        unsubscribeConversations();
        unsubscribeConversations = null;
      }

      // Subscribe to conversations for this user
      unsubscribeConversations = subscribeToConversations(
        user.uid,
        async (conversationsData) => {
          try {
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
          } catch (err) {
            console.error('Error processing conversations:', err);
            setLoading(false);
          }
        }
      );
    });

    // Cleanup when component unmounts
    return () => {
      unsubscribeAuth();
      if (unsubscribeConversations) {
        unsubscribeConversations();
      }
    };
  }, []);

  const handleDeleteConversation = async (conversationId) => {
    if (!currentUser) return;
    try {
      setDeletingId(conversationId);
      await hideConversationForUser(conversationId, currentUser.uid);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

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
                  {searchQuery
                    ? 'No conversations found'
                    : 'No conversations yet'}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start a conversation with a member to see messages here'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => router.push(`/member/messages/${conv.id}`)}
                  className="w-full p-4 flex items-start gap-3 hover:bg-primary/5 transition-colors border-b border-border/50 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      router.push(`/member/messages/${conv.id}`);
                    }
                  }}
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the conversation from your messages
                          only. The other person will still see it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deletingId === conv.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                        >
                          {deletingId === conv.id ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
