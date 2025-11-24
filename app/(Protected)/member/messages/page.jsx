'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

import { Search, Send } from 'lucide-react';
import { conversations } from './data';

import Image from 'next/image';

export default function MessagesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.username.toLowerCase().includes(searchQuery.toLowerCase())
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
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/member/messages/${conv.id}`)}
                className="w-full p-4 flex items-start gap-3 hover:bg-primary/5 transition-colors border-b border-border/50"
              >
                <div className="relative">
                  <Image
                    src={conv.avatar || '/placeholder.svg'}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover"
                    width={10}
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
