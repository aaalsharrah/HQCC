'use client';

<<<<<<< HEAD
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
=======
import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Search,
  Send,
  Smile,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip,
} from 'lucide-react';
import { conversations, messagesByConversation } from '../data';

import Image from 'next/image';
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00

export default function MessageDetailPage() {
  const router = useRouter();
  const params = useParams();
<<<<<<< HEAD
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
=======

  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  const selectedId = Number(params?.id) || conversations[0]?.id;

  const selectedChat = useMemo(() => {
    return conversations.find((c) => c.id === selectedId) || conversations[0];
  }, [selectedId]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get messages for THIS conversation only
  const messages = messagesByConversation[selectedChat.id] || [];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Frontend-only demo: just log it for now
    console.log('Sending message to', selectedChat.id, ':', message);

    // Here you’d normally:
    // - send to your API
    // - update state with new message
    // For now just clear the input:
    setMessage('');
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
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/member/messages/${conv.id}`)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-primary/5 transition-colors border-b border-border/50 ${
                  conv.id === selectedChat.id ? 'bg-primary/10' : ''
                }`}
              >
                <div className="relative">
                  <Image
                    src={conv.avatar || '/placeholder.svg'}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover"
                    width={50}
                    height={50}
                  />
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{conv.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {conv.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <div className="mt-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card/30 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={selectedChat.avatar || '/placeholder.svg'}
                      alt={selectedChat.name}
                      className="w-10 h-10 rounded-full object-cover"
                      width={50}
                      height={50}
                    />
                    {selectedChat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedChat.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.online ? 'Active now' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm">
                    No messages yet. Say hi!
                  </p>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === 'me' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-md ${
                        msg.sender === 'me'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card/80 backdrop-blur-sm border border-border'
                      } rounded-2xl px-4 py-2 shadow-sm`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span
                        className={`text-xs mt-1 block ${
                          msg.sender === 'me'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 hover:bg-primary/10"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 hover:bg-primary/10"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleSendMessage()
                      }
                      className="pr-10 bg-background/50 border-border/50 focus:border-primary/50"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
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
          )}
>>>>>>> f2c366d48b05bc8fd801d3a23e934dd71c5d3c00
        </div>
      </div>
    </div>
  );
}
