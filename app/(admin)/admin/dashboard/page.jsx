'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  BarChart3,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { db, auth } from '@/app/lib/firebase/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { createNotification } from '@/app/lib/firebase/notifications';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    avgAttendance: 0,
    engagementRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingEventId, setEditingEventId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    location: '',
    spots: '',
    image: '',
    description: '',
    organizerName: '',
    organizerRole: '',
    organizerAvatar: '',
    agendaText: '',
    requirementsText: '',
    whosComingText: '',
  });

  // helper: format member join date
  function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date =
      timestamp instanceof Timestamp
        ? timestamp.toDate()
        : timestamp?.toDate
        ? timestamp.toDate()
        : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  // helper: parse event date from Firestore/string
  function parseEventDate(dateField) {
    if (!dateField) return null;
    if (dateField instanceof Timestamp) return dateField.toDate();
    if (dateField?.toDate) return dateField.toDate();
    if (typeof dateField === 'string') return new Date(dateField);
    return null;
  }

  // helper: normalize date -> YYYY-MM-DD (UTC) for <input type="date" />
  function formatEventDate(eventDate) {
    if (!eventDate) return '';
    const year = eventDate.getUTCFullYear();
    const month = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'members', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          setLoading(false);
          return;
        }
        const userData = userDocSnap.data();
        if (userData.role !== 'admin') {
          setLoading(false);
          return;
        }

        await fetchData();
      } catch (err) {
        console.error('Error checking admin status:', err);
        setLoading(false);
      }
    });

    async function fetchData() {
      try {
        setLoading(true);

        // --- members ---
        const membersRef = collection(db, 'members');
        const membersSnapshot = await getDocs(membersRef);
        const membersData = membersSnapshot.docs.map((d) => ({
          id: d.id,
          uid: d.id,
          ...d.data(),
        }));

        // --- posts ---
        const postsRef = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsRef);
        const postsData = postsSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // --- events ---
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);
        const eventsData = eventsSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // --- registrations from subcollections ---
        // We flatten all events/{eventId}/registrations into one array.
        const allRegistrations = [];
        for (const eventDoc of eventsSnapshot.docs) {
          try {
            const regsRef = collection(
              db,
              'events',
              eventDoc.id,
              'registrations'
            );
            const regsSnap = await getDocs(regsRef);
            regsSnap.docs.forEach((regDoc) => {
              allRegistrations.push({
                id: regDoc.id,
                eventId: eventDoc.id,
                ...regDoc.data(),
              });
            });
          } catch (e) {
            console.error(
              'Error loading registrations subcollection for event',
              eventDoc.id,
              e
            );
          }
        }

        // --- analytics ---

        const totalUsers = membersData.length;

        // active users: posted in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentPosts = postsData.filter((post) => {
          if (!post.createdAt) return false;
          const postDate =
            post.createdAt instanceof Timestamp
              ? post.createdAt.toDate()
              : post.createdAt?.toDate
              ? post.createdAt.toDate()
              : new Date(post.createdAt);
          return postDate >= thirtyDaysAgo;
        });

        const activeUserIds = new Set(recentPosts.map((p) => p.authorId));
        const activeUsers = membersData.filter((m) =>
          activeUserIds.has(m.uid || m.id)
        ).length;

        // new users this month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const newUsersThisMonth = membersData.filter((m) => {
          const createdAt = m.createdAt || m.joinedAt;
          if (!createdAt) return false;
          const createdDate =
            createdAt instanceof Timestamp
              ? createdAt.toDate()
              : createdAt?.toDate
              ? createdAt.toDate()
              : new Date(createdAt);
          return createdDate >= monthStart;
        }).length;

        // events stats
        const totalEvents = eventsData.length;
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);

        const upcomingEvents = eventsData.filter((e) => {
          const eventDate = parseEventDate(e.date);
          return eventDate && eventDate >= todayMidnight;
        }).length;

        // avg attendance – from events.attendees (fallback: count subcollection)
        const attendanceValues = eventsData
          .map((e) => {
            const fromDoc =
              typeof e.attendees === 'number'
                ? e.attendees
                : typeof e.attendeeCount === 'number'
                ? e.attendeeCount
                : null;
            if (fromDoc !== null) return fromDoc;

            // fallback: count registrations for that event
            return allRegistrations.filter((r) => r.eventId === e.id).length;
          })
          .filter((n) => typeof n === 'number' && !isNaN(n));

        const avgAttendance =
          attendanceValues.length > 0
            ? Math.round(
                attendanceValues.reduce((sum, val) => sum + val, 0) /
                  attendanceValues.length
              )
            : 0;

        // engagement rate – from posts / replies / likes as before

        const engagedUserIds = new Set();
        recentPosts.forEach((post) => {
          if (post.authorId) engagedUserIds.add(post.authorId);
        });

        // replies
        for (const post of postsData) {
          try {
            const repliesRef = collection(db, 'posts', post.id, 'replies');
            const repliesSnapshot = await getDocs(repliesRef);
            repliesSnapshot.docs.forEach((replyDoc) => {
              const replyData = replyDoc.data();
              if (replyData.authorId) {
                const replyDate =
                  replyData.createdAt instanceof Timestamp
                    ? replyData.createdAt.toDate()
                    : replyData.createdAt?.toDate
                    ? replyData.createdAt.toDate()
                    : new Date(replyData.createdAt);
                if (replyDate >= thirtyDaysAgo) {
                  engagedUserIds.add(replyData.authorId);
                }
              }
            });
          } catch {
            // ignore
          }
        }

        // likes
        for (const post of postsData) {
          try {
            const likesRef = collection(db, 'posts', post.id, 'likes');
            const likesSnapshot = await getDocs(likesRef);
            likesSnapshot.docs.forEach((likeDoc) => {
              const likeData = likeDoc.data();
              if (likeData.userId) {
                const likeDate =
                  likeData.createdAt instanceof Timestamp
                    ? likeData.createdAt.toDate()
                    : likeData.createdAt?.toDate
                    ? likeData.createdAt.toDate()
                    : new Date(likeData.createdAt);
                if (likeDate >= thirtyDaysAgo) {
                  engagedUserIds.add(likeData.userId);
                }
              }
            });
          } catch {
            // ignore
          }
        }

        const engagementRate =
          totalUsers > 0
            ? Math.round((engagedUserIds.size / totalUsers) * 100)
            : 0;

        setAnalytics({
          totalUsers,
          activeUsers,
          newUsersThisMonth,
          totalEvents,
          upcomingEvents,
          completedEvents: totalEvents - upcomingEvents,
          avgAttendance,
          engagementRate,
        });

        // --- members table (events count from registrations subcollections) ---
        const processedMembers = await Promise.all(
          membersData.map(async (member) => {
            const memberId = member.uid || member.id;

            const memberPosts = postsData.filter(
              (p) => p.authorId === memberId
            ).length;

            const memberRegistrations = allRegistrations.filter(
              (r) => r.userId === memberId || r.uid === memberId
            ).length;

            const hasRecentPost = recentPosts.some(
              (p) => p.authorId === memberId
            );
            const status = hasRecentPost ? 'Active' : 'Inactive';

            return {
              id: memberId,
              name: member.name || 'Member',
              email: member.email || '',
              role: member.role || 'Member',
              status,
              joinDate: formatDate(member.createdAt || member.joinedAt),
              posts: memberPosts,
              events: memberRegistrations,
            };
          })
        );

        processedMembers.sort((a, b) => {
          const memberA = membersData.find((m) => (m.uid || m.id) === a.id);
          const memberB = membersData.find((m) => (m.uid || m.id) === b.id);
          const aDate = memberA?.createdAt || memberA?.joinedAt;
          const bDate = memberB?.createdAt || memberB?.joinedAt;

          if (aDate && bDate) {
            const aDateObj =
              aDate instanceof Timestamp
                ? aDate.toDate()
                : aDate?.toDate
                ? aDate.toDate()
                : new Date(aDate);
            const bDateObj =
              bDate instanceof Timestamp
                ? bDate.toDate()
                : bDate?.toDate
                ? bDate.toDate()
                : new Date(bDate);
            return bDateObj - aDateObj;
          }
          if (aDate && !bDate) return -1;
          if (!aDate && bDate) return 1;
          return 0;
        });

        setUsers(processedMembers);

        // --- events list for cards (attendees from event doc) ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const processedEvents = eventsData.map((event) => {
          const eventDate = parseEventDate(event.date);

          const attendeesFromDoc =
            typeof event.attendees === 'number'
              ? event.attendees
              : typeof event.attendeeCount === 'number'
              ? event.attendeeCount
              : null;

          const attendees =
            attendeesFromDoc !== null
              ? attendeesFromDoc
              : allRegistrations.filter((r) => r.eventId === event.id).length;

          let dateDisplay = '';
          if (eventDate) {
            dateDisplay = formatEventDate(eventDate);
          } else if (event.date && typeof event.date === 'string') {
            dateDisplay = event.date.split('T')[0];
          }

          return {
            id: event.id,
            title: event.title || 'Untitled Event',
            date: dateDisplay,
            originalDate: eventDate || null,
            time: event.time || '',
            location: event.location || '',
            attendees,
            status: eventDate && eventDate >= today ? 'Scheduled' : 'Completed',
            category: event.category || 'Event',
            description: event.description || '',
            image: event.image || '/placeholder.svg',
            spots: event.spots || 0,
            organizer: event.organizer || {
              name: 'HQCC Team',
              role: 'Organizer',
              avatar: '/professional-man.jpg',
            },
            agenda: event.agenda || [],
            requirements: event.requirements || [],
            attendeesList: event.attendeesList || [],
          };
        });

        processedEvents.sort((a, b) => {
          const aDate = a.date ? new Date(a.date) : new Date(0);
          const bDate = b.date ? new Date(b.date) : new Date(0);
          return bDate - aDate;
        });

        setEvents(processedEvents);
      } catch (error) {
        console.error('❌ Error fetching admin dashboard data:', error);
        setUsers([]);
        setEvents([]);
        setAnalytics({
          totalUsers: 0,
          activeUsers: 0,
          newUsersThisMonth: 0,
          totalEvents: 0,
          upcomingEvents: 0,
          completedEvents: 0,
          avgAttendance: 0,
          engagementRate: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    return () => unsubscribe();
  }, []);

  // --- event form helpers ---
  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const startEditingEvent = (event) => {
    setEditingEventId(event.id);
    setForm({
      title: event.title || '',
      category: event.category || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      spots: event.spots ? String(event.spots) : '',
      image: event.image || '',
      description: event.description || '',
      organizerName: event.organizer?.name || '',
      organizerRole: event.organizer?.role || '',
      organizerAvatar: event.organizer?.avatar || '',
      agendaText: (event.agenda || [])
        .map((item) =>
          `${item.time || ''} | ${item.title || ''} | ${
            item.duration || ''
          }`.trim()
        )
        .join('\n'),
      requirementsText: (event.requirements || []).join('\n'),
      whosComingText: (event.attendeesList || [])
        .map((att) =>
          `${att.name || ''} | ${att.role || ''} | ${att.avatar || ''}`.trim()
        )
        .join('\n'),
    });
    setActiveTab('events');
  };

  const resetForm = () => {
    setEditingEventId(null);
    setForm({
      title: '',
      category: '',
      date: '',
      time: '',
      location: '',
      spots: '',
      image: '',
      description: '',
      organizerName: '',
      organizerRole: '',
      organizerAvatar: '',
      agendaText: '',
      requirementsText: '',
      whosComingText: '',
    });
  };

  const handleDeleteEvent = async (eventId, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the event "${title}"?\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleCreateEvent = async () => {
    if (!form.title || !form.date || !form.time || !form.location) {
      alert('Please fill in at least Title, Date, Time, and Location.');
      return;
    }

    try {
      const agenda =
        form.agendaText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [time, title, duration] = line
              .split('|')
              .map((s) => s.trim());
            return {
              time: time || '',
              title: title || '',
              duration: duration || '',
            };
          }) || [];

      const requirements =
        form.requirementsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean) || [];

      const whosComing =
        form.whosComingText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [name, role, avatar] = line.split('|').map((s) => s.trim());
            return {
              name: name || '',
              role: role || '',
              avatar: avatar || '/professional-man.jpg',
            };
          }) || [];

      let dateTimestamp;
      if (form.date) {
        const [year, month, day] = form.date.split('-').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        dateTimestamp = Timestamp.fromDate(utcDate);
      } else {
        dateTimestamp = Timestamp.now();
      }

      const eventPayload = {
        title: form.title,
        date: dateTimestamp,
        time: form.time,
        location: form.location,
        category: form.category || 'Event',
        description: form.description,
        image: form.image || '/placeholder.svg',
        spots: Number(form.spots) || 0,
        organizer: {
          name: form.organizerName || 'HQCC Team',
          role: form.organizerRole || 'Organizer',
          avatar: form.organizerAvatar || '/professional-man.jpg',
        },
        agenda,
        requirements,
        attendeesList: whosComing,
        // note: attendees count is maintained by RSVP logic elsewhere
      };

      let eventDocRef;

      if (editingEventId) {
        eventDocRef = doc(db, 'events', editingEventId);
        await updateDoc(eventDocRef, {
          ...eventPayload,
          updatedAt: Timestamp.now(),
        });
      } else {
        const eventsRef = collection(db, 'events');
        eventDocRef = await addDoc(eventsRef, {
          ...eventPayload,
          attendees: 0, // new events start with 0 attendees
          createdAt: Timestamp.now(),
        });

        // notify all members about new event (best-effort)
        try {
          const membersRef = collection(db, 'members');
          const membersSnapshot = await getDocs(membersRef);
          const notificationPromises = membersSnapshot.docs.map(
            async (memberDoc) => {
              const memberId = memberDoc.id;
              if (memberId === auth.currentUser?.uid) return;

              await createNotification({
                userId: memberId,
                type: 'event',
                actorId: auth.currentUser?.uid || 'system',
                actorName: 'HQCC Events',
                actorAvatar: '/quantum-computing-logo.jpg',
                postId: eventDocRef.id,
                postContent: `${form.title} - ${form.date} at ${form.time}`,
              });
            }
          );
          await Promise.all(notificationPromises);
        } catch (error) {
          console.error('Error creating event notifications:', error);
        }
      }

      resetForm();

      // re-fetch events quickly so cards stay in sync
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const allRegistrations = [];
      for (const eventDoc of eventsSnapshot.docs) {
        try {
          const regsRef = collection(
            db,
            'events',
            eventDoc.id,
            'registrations'
          );
          const regsSnap = await getDocs(regsRef);
          regsSnap.docs.forEach((regDoc) => {
            allRegistrations.push({
              id: regDoc.id,
              eventId: eventDoc.id,
              ...regDoc.data(),
            });
          });
        } catch {
          // ignore
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const processedEvents = eventsData.map((event) => {
        const eventDate = parseEventDate(event.date);

        const attendeesFromDoc =
          typeof event.attendees === 'number'
            ? event.attendees
            : typeof event.attendeeCount === 'number'
            ? event.attendeeCount
            : null;

        const attendees =
          attendeesFromDoc !== null
            ? attendeesFromDoc
            : allRegistrations.filter((r) => r.eventId === event.id).length;

        let dateDisplay = '';
        if (eventDate) {
          dateDisplay = formatEventDate(eventDate);
        } else if (event.date && typeof event.date === 'string') {
          dateDisplay = event.date.split('T')[0];
        }

        return {
          id: event.id,
          title: event.title || 'Untitled Event',
          date: dateDisplay,
          originalDate: eventDate || null,
          time: event.time || '',
          location: event.location || '',
          attendees,
          status: eventDate && eventDate >= today ? 'Scheduled' : 'Completed',
          category: event.category || 'Event',
          description: event.description || '',
          image: event.image || '/placeholder.svg',
          spots: event.spots || 0,
          organizer: event.organizer || {
            name: 'HQCC Team',
            role: 'Organizer',
            avatar: '/professional-man.jpg',
          },
          agenda: event.agenda || [],
          requirements: event.requirements || [],
          attendeesList: event.attendeesList || [],
        };
      });

      processedEvents.sort((a, b) => {
        const aDate = a.date ? new Date(a.date) : new Date(0);
        const bDate = b.date ? new Date(b.date) : new Date(0);
        return bDate - aDate;
      });

      setEvents(processedEvents);
    } catch (error) {
      console.error('Error creating/updating event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  // UI below is same as previous answer, just using events.attendees everywhere
  // (I’ll keep it as-is but now the `event.attendees` values are coming from the
  // events collection, not from top-level registrations.)

  // -------------- JSX RETURN --------------
  // (unchanged UI structure, but now backed by updated data model)

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-foreground/60">
                Manage your quantum computing club
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/member/settings">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="bg-card/50 backdrop-blur-xl border border-border p-1">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-8">
              {/* Analytics cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Members */}
                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />+
                      {analytics.newUsersThisMonth}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      analytics.totalUsers
                    )}
                  </div>
                  <div className="text-sm text-foreground/60">
                    Total Members
                  </div>
                  <div className="mt-2 text-xs text-primary">
                    {analytics.activeUsers} active
                  </div>
                </Card>

                {/* Events */}
                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-accent/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {analytics.upcomingEvents}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    ) : (
                      analytics.totalEvents
                    )}
                  </div>
                  <div className="text-sm text-foreground/60">Total Events</div>
                  <div className="mt-2 text-xs text-accent">
                    {analytics.upcomingEvents} upcoming
                  </div>
                </Card>

                {/* Avg attendance */}
                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-secondary/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-secondary/10">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                    <Badge variant="secondary">Avg</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                    ) : (
                      analytics.avgAttendance
                    )}
                  </div>
                  <div className="text-sm text-foreground/60">
                    Avg Attendance
                  </div>
                  <div className="mt-2 text-xs text-secondary">per event</div>
                </Card>

                {/* Engagement */}
                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {analytics.engagementRate > 0 ? '+' : ''}
                      {analytics.engagementRate}%
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      `${analytics.engagementRate}%`
                    )}
                  </div>
                  <div className="text-sm text-foreground/60">
                    Engagement Rate
                  </div>
                  <div className="mt-2 text-xs text-primary">last 30 days</div>
                </Card>
              </div>

              {/* Recent members & upcoming events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Members */}
                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Recent Members
                  </h3>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No members found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.slice(0, 4).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-foreground/60">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              user.status === 'Active'
                                ? 'default'
                                : user.status === 'Pending'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {user.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Upcoming Events */}
                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    Upcoming Events
                  </h3>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                  ) : (
                    (() => {
                      const now = new Date();
                      const upcoming = events
                        .filter((event) => {
                          if (!event.originalDate) {
                            if (!event.date) return false;
                            const d = new Date(event.date);
                            return !isNaN(d.getTime()) && d >= now;
                          }
                          return event.originalDate >= now;
                        })
                        .sort((a, b) => {
                          const aDate =
                            a.originalDate ||
                            (a.date ? new Date(a.date) : null);
                          const bDate =
                            b.originalDate ||
                            (b.date ? new Date(b.date) : null);
                          if (!aDate || !bDate) return 0;
                          return aDate - bDate;
                        })
                        .slice(0, 3);

                      if (upcoming.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            No upcoming events
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {upcoming.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                            >
                              <div>
                                <div className="font-medium mb-1">
                                  {event.title}
                                </div>
                                <div className="text-xs text-foreground/60 flex items-center gap-3">
                                  <span>{event.date}</span>
                                  {event.time && (
                                    <>
                                      <span>•</span>
                                      <span>{event.time}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge variant="secondary">
                                {event.attendees} RSVPs
                              </Badge>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* USERS TAB */}
            <TabsContent value="users" className="space-y-6">
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background/50 border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden bg-card/50 backdrop-blur-xl border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-background/50 border-b border-border">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold">
                          Member
                        </th>
                        <th className="text-left p-4 text-sm font-semibold">
                          Role
                        </th>
                        <th className="text-left p-4 text-sm font-semibold">
                          Status
                        </th>
                        <th className="text-left p-4 text-sm font-semibold">
                          Joined
                        </th>
                        <th className="text-left p-4 text-sm font-semibold">
                          Activity
                        </th>
                        <th className="text-right p-4 text-sm font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-muted-foreground"
                          >
                            No members found.
                          </td>
                        </tr>
                      ) : (
                        users
                          .filter((user) => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                              user.name.toLowerCase().includes(query) ||
                              user.email.toLowerCase().includes(query) ||
                              user.role.toLowerCase().includes(query)
                            );
                          })
                          .map((user) => (
                            <tr
                              key={user.id}
                              className="border-b border-border hover:bg-background/50 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                                    {user.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {user.name}
                                    </div>
                                    <div className="text-xs text-foreground/60">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline">{user.role}</Badge>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={
                                    user.status === 'Active'
                                      ? 'default'
                                      : user.status === 'Pending'
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                  className="gap-1"
                                >
                                  {user.status === 'Active' && (
                                    <CheckCircle2 className="h-3 w-3" />
                                  )}
                                  {user.status === 'Inactive' && (
                                    <XCircle className="h-3 w-3" />
                                  )}
                                  {user.status === 'Pending' && (
                                    <Clock className="h-3 w-3" />
                                  )}
                                  {user.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm text-foreground/60">
                                {user.joinDate}
                              </td>
                              <td className="p-4">
                                <div className="text-sm">
                                  <div>{user.posts} posts</div>
                                  <div className="text-xs text-foreground/60">
                                    {user.events} events
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:text-primary"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:text-accent"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:text-primary"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* EVENTS TAB */}
            <TabsContent value="events" className="space-y-6">
              {/* Event form */}
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {editingEventId ? 'Edit Event' : 'Create New Event'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">
                      Event Title
                    </label>
                    <Input
                      placeholder="Quantum Computing Workshop"
                      className="bg-background/50 border-border"
                      value={form.title}
                      onChange={handleFormChange('title')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Category
                    </label>
                    <Input
                      placeholder="Workshop, Lecture, Hackathon..."
                      className="bg-background/50 border-border"
                      value={form.category}
                      onChange={handleFormChange('category')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Date
                    </label>
                    <Input
                      type="date"
                      className="bg-background/50 border-border"
                      value={form.date}
                      onChange={handleFormChange('date')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Time
                    </label>
                    <Input
                      placeholder="6:00 PM - 8:00 PM"
                      className="bg-background/50 border-border"
                      value={form.time}
                      onChange={handleFormChange('time')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Location
                    </label>
                    <Input
                      placeholder="Engineering Lab 201"
                      className="bg-background/50 border-border"
                      value={form.location}
                      onChange={handleFormChange('location')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Total Spots
                    </label>
                    <Input
                      type="number"
                      placeholder="50"
                      className="bg-background/50 border-border"
                      value={form.spots}
                      onChange={handleFormChange('spots')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">
                      Event Image URL
                    </label>
                    <Input
                      placeholder="/quantum-computing-workshop.jpg"
                      className="bg-background/50 border-border"
                      value={form.image}
                      onChange={handleFormChange('image')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe the event..."
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                      rows={3}
                      value={form.description}
                      onChange={handleFormChange('description')}
                    />
                  </div>

                  {/* Organizer info */}
                  <div className="md:col-span-2 pt-2 border-t border-border/60">
                    <h4 className="text-sm font-semibold mb-2">
                      Organizer Details
                    </h4>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Organizer Name
                    </label>
                    <Input
                      placeholder="Abdallah Aisharrah"
                      className="bg-background/50 border-border"
                      value={form.organizerName}
                      onChange={handleFormChange('organizerName')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Organizer Role
                    </label>
                    <Input
                      placeholder="Founder & President"
                      className="bg-background/50 border-border"
                      value={form.organizerRole}
                      onChange={handleFormChange('organizerRole')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">
                      Organizer Avatar URL
                    </label>
                    <Input
                      placeholder="/professional-man.jpg"
                      className="bg-background/50 border-border"
                      value={form.organizerAvatar}
                      onChange={handleFormChange('organizerAvatar')}
                    />
                  </div>

                  {/* Agenda */}
                  <div className="md:col-span-2 pt-2 border-t border-border/60">
                    <h4 className="text-sm font-semibold mb-2">Agenda</h4>
                    <p className="text-xs text-muted-foreground mb-1">
                      One item per line using{' '}
                      <span className="font-mono">time | title | duration</span>{' '}
                      format. Example:
                    </p>
                    <pre className="text-xs font-mono bg-background/60 border border-dashed border-border rounded-md p-2 mb-2">
                      {`6:00 PM | Welcome & Introduction | 15 min
6:15 PM | Quantum Basics Overview | 30 min`}
                    </pre>
                    <textarea
                      placeholder="6:00 PM | Welcome & Introduction | 15 min"
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                      rows={4}
                      value={form.agendaText}
                      onChange={handleFormChange('agendaText')}
                    />
                  </div>

                  {/* Requirements */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold mb-2">Requirements</h4>
                    <p className="text-xs text-muted-foreground mb-1">
                      One requirement per line (shown under &quot;What to
                      Bring&quot;).
                    </p>
                    <textarea
                      placeholder={
                        'Laptop with Python installed\nBasic programming knowledge'
                      }
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                      rows={3}
                      value={form.requirementsText}
                      onChange={handleFormChange('requirementsText')}
                    />
                  </div>

                  {/* Who's coming */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold mb-2">
                      Who&apos;s Coming
                    </h4>
                    <p className="text-xs text-muted-foreground mb-1">
                      One attendee per line using{' '}
                      <span className="font-mono">name | role | avatarUrl</span>{' '}
                      format. Example:
                    </p>
                    <pre className="text-xs font-mono bg-background/60 border border-dashed border-border rounded-md p-2 mb-2">
                      {`Abdallah Aisharrah | Founder & President | /professional-man.jpg
Jane Doe | VP, Events | /team-member-2.jpg`}
                    </pre>
                    <textarea
                      placeholder="Abdallah Aisharrah | Founder & President | /professional-man.jpg"
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                      rows={3}
                      value={form.whosComingText}
                      onChange={handleFormChange('whosComingText')}
                    />
                  </div>

                  {/* Form actions */}
                  <div className="md:col-span-2 flex gap-3 pt-2">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleCreateEvent}
                    >
                      {editingEventId ? 'Update Event' : 'Create Event'}
                    </Button>
                    <Button variant="outline" type="button" onClick={resetForm}>
                      {editingEventId ? 'Cancel Edit' : 'Clear Form'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Events list */}
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Scheduled Events</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No events found. Create your first event above!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Card
                        key={event.id}
                        className="p-4 bg-background/50 border-border hover:border-primary/50 transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">
                                {event.title}
                              </h4>
                              <Badge
                                variant={
                                  event.status === 'Scheduled'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {event.status}
                              </Badge>
                              {event.category && (
                                <Badge variant="outline">
                                  {event.category}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {event.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.time}
                              </span>
                              <span>{event.location}</span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.attendees} attendees
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {/* Public event detail */}
                            <Link href={`/member/events/${event.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 bg-transparent"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </Link>

                            {/* Admin registrations page */}
                            <Link href={`/admin/events/${event.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 bg-transparent"
                              >
                                <Users className="h-4 w-4" />
                                Registrations
                              </Button>
                            </Link>

                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 bg-transparent"
                              onClick={() => startEditingEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 hover:text-destructive hover:border-destructive bg-transparent"
                              onClick={() =>
                                handleDeleteEvent(event.id, event.title)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
