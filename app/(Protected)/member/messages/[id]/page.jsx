'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { auth } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  subscribeToMessages,
  sendMessage,
  getOtherUser,
  formatTimestamp,
  deleteConversation,
} from '@/app/lib/firebase/messages';
import { db } from '@/app/lib/firebase/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MessageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.id;
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [conversationData, setConversationData] = useState(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      setCurrentUser(user);

      if (!conversationId) {
        setLoading(false);
        return;
      }

      try {
        // Get conversation data
        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationSnap = await getDoc(conversationRef);

        if (!conversationSnap.exists()) {
          setLoading(false);
          return;
        }

        const convData = {
          id: conversationSnap.id,
          ...conversationSnap.data(),
        };
        setConversationData(convData);

        // Get other user's data
        const other = await getOtherUser(conversationId, user.uid);
        setOtherUser(other);

        // Subscribe to messages
        const unsubscribeMessages = subscribeToMessages(
          conversationId,
          (messagesData) => {
            setMessages(messagesData);
            setLoading(false);
          }
        );

        return () => {
          unsubscribeMessages();
        };
      } catch (error) {
        console.error('Error loading conversation:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [conversationId, router]);

  const handleSendMessage = async (text = null) => {
    const messageToSend = text || messageText.trim();
    if (!messageToSend || !conversationId) return;

    try {
      setSending(true);
      await sendMessage(conversationId, messageToSend);
      if (!text) {
        setMessageText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!conversationData?.bookId) return;

    if (
      !confirm(
        'Are you sure you want to confirm this purchase? This will delete the conversation.'
      )
    ) {
      return;
    }

    try {
      // Delete book if exists
      if (conversationData.bookId) {
        try {
          const bookRef = doc(db, 'books', conversationData.bookId);
          await deleteDoc(bookRef);
        } catch (error) {
          console.error('Error deleting book:', error);
        }
      }

      // Delete conversation
      await deleteConversation(conversationId);

      // Show success message
      alert('Transaction completed!');

      // Navigate back to messages
      router.push('/member/messages');
    } catch (error) {
      console.error('Error confirming purchase:', error);
      alert('Failed to complete transaction. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversationData || !otherUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Conversation Not Found</h1>
          <Button onClick={() => router.push('/member/messages')}>
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  const isSeller =
    conversationData.sellerId === currentUser?.uid ||
    conversationData.sellerId === currentUser?.id;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/50 backdrop-blur-xl border-b border-border p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatar || '/placeholder.svg'} />
            <AvatarFallback>
              {otherUser.name ? otherUser.name[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{otherUser.name}</h2>
            {conversationData.bookTitle && (
              <p className="text-sm text-muted-foreground truncate">
                {conversationData.bookTitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.uid;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/80 backdrop-blur-sm border border-border'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  {msg.timestamp && (
                    <span
                      className={`text-xs mt-1 block ${
                        isMe
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-xl p-4 space-y-4">
        {/* Confirmed button for seller */}
        {isSeller && conversationData.bookId && (
          <Button
            onClick={handleConfirmPurchase}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirmed!
          </Button>
        )}

        {/* Message Input */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!messageText.trim() || sending}
            size="icon"
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
