'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, CheckCheck, Loader2 } from 'lucide-react';

// IMPORT DATA + ICONS
import { getNotificationIcon } from './data';

import { auth } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  subscribeToNotifications,
  markAllNotificationsAsRead,
  formatNotificationTimestamp,
} from '@/app/lib/firebase/notifications';

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const getNotificationContent = (type) => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'reply':
        return 'replied to your post';
      case 'mention':
        return 'mentioned you in a post';
      case 'message':
        return 'sent you a message';
      case 'event':
        return 'New event';
      default:
        return 'interacted with your post';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }
      setCurrentUserId(user.uid);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);
    const unsubscribe = subscribeToNotifications(currentUserId, (fetchedNotifications) => {
      // Map Firestore notifications to component format
      const mappedNotifications = fetchedNotifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        user: {
          name: notif.actorName || 'Unknown User',
          username: notif.actorName?.toLowerCase().replace(/\s+/g, '') || 'unknown',
          avatar: notif.actorAvatar || '/placeholder.svg',
        },
        content: getNotificationContent(notif.type),
        timestamp: formatNotificationTimestamp(notif.createdAt),
        read: notif.read || false,
        postPreview: notif.postContent || null,
        postId: notif.postId || null,
      }));

      setNotifications(mappedNotifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const markAllAsRead = async () => {
    if (!currentUserId || markingAsRead) return;

    try {
      setMarkingAsRead(true);
      await markAllNotificationsAsRead(currentUserId);
      // The real-time listener will update the UI automatically
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('Failed to mark all as read. Please try again.');
    } finally {
      setMarkingAsRead(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'replies') return n.type === 'reply';
    if (filter === 'likes') return n.type === 'like';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Notifications
                </h1>

                {unreadCount > 0 && (
                  <p className="text-muted-foreground">
                    You have {unreadCount} unread notifications
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0 || markingAsRead}
                >
                  {markingAsRead ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  )}
                  Mark all read
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <a href="/settings">
                    <Settings className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* FILTER TABS */}
            <div className="flex gap-2 p-1 bg-card/50 backdrop-blur-xl rounded-lg border border-border">
              {[
                { label: 'All', value: 'all' },
                { label: 'Replies', value: 'replies' },
                { label: 'Likes', value: 'likes' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    filter === tab.value
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* NOTIFICATION LIST */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative bg-card/50 backdrop-blur-xl rounded-xl p-5 border transition-all hover:bg-card/70 hover:shadow-lg hover:scale-[1.01] ${
                  notification.read
                    ? 'border-border'
                    : 'border-primary/30 bg-primary/5'
                }`}
              >
                <div className="flex gap-4">
                  {/* ICON */}
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage
                          src={notification.user.avatar || '/placeholder.svg'}
                          alt={notification.user.name}
                        />
                        <AvatarFallback>
                          {notification.user.name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                            {notification.user.name}
                          </span>

                          <span className="text-muted-foreground text-sm">
                            {notification.content}
                          </span>

                          <span className="text-muted-foreground/60 text-xs ml-auto">
                            {notification.timestamp}
                          </span>
                        </div>

                        {notification.postPreview && (
                          <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-sm text-foreground/80 line-clamp-2">
                              {notification.postPreview}
                            </p>
                          </div>
                        )}
                        
                        {/* Click handler to navigate to relevant page */}
                        {notification.postId && (
                          <button
                            onClick={() => {
                              if (notification.type === 'event') {
                                router.push(`/member/events/${notification.postId}`);
                              } else if (notification.type === 'message') {
                                router.push(`/member/messages/${notification.postId}`);
                              } else {
                                router.push(`/member/post/${notification.postId}`);
                              }
                            }}
                            className="mt-2 text-xs text-primary hover:underline"
                          >
                            View {notification.type === 'event' ? 'event' : notification.type === 'message' ? 'conversation' : 'post'}
                          </button>
                        )}
          </div>

          {/* EMPTY STATE */}
          {filteredNotifications.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <CheckCheck className="h-8 w-8 text-muted-foreground" />
              </div>

              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">You are all caught up!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
