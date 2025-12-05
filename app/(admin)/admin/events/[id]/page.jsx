'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2,
  Mail,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { db, auth } from '@/app/lib/firebase/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function parseEventDate(dateField) {
  if (!dateField) return null;
  if (dateField instanceof Timestamp) return dateField.toDate();
  if (dateField?.toDate) return dateField.toDate();
  if (typeof dateField === 'string') return new Date(dateField);
  return null;
}

function formatEventDate(eventDate) {
  if (!eventDate) return '';
  return eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeRange(timeString) {
  return timeString || '';
}

export default function AdminEventRegistrationsPage(props) {
  const params = use(props.params);
  const eventId = params.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  // auth / admin check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      try {
        const memberRef = doc(db, 'members', user.uid);
        const memberSnap = await getDoc(memberRef);
        if (!memberSnap.exists()) {
          router.push('/member');
          return;
        }
        const memberData = memberSnap.data();
        if (memberData.role !== 'admin') {
          router.push('/member');
          return;
        }
        setIsAdmin(true);
        setAuthChecked(true);
      } catch (err) {
        console.error('Error checking admin status:', err);
        router.push('/member');
      }
    });

    return () => unsub();
  }, [router]);

  // load event + registrations from subcollection
  useEffect(() => {
    if (!authChecked || !isAdmin) return;
    if (!eventId) return;

    async function fetchEventAndRegistrations() {
      try {
        setLoading(true);

        // --- event doc ---
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) {
          console.warn('Event not found:', eventId);
          setEvent(null);
          setRegistrations([]);
          return;
        }

        const eventData = eventSnap.data();
        const eventDate = parseEventDate(eventData.date);
        const formattedDate = eventDate ? formatEventDate(eventDate) : '';

        const attendeesFromDoc =
          typeof eventData.attendees === 'number'
            ? eventData.attendees
            : typeof eventData.attendeeCount === 'number'
            ? eventData.attendeeCount
            : null;

        const eventObj = {
          id: eventSnap.id,
          title: eventData.title || 'Untitled Event',
          date: formattedDate,
          rawDate: eventDate,
          time: eventData.time || '',
          location: eventData.location || '',
          spots: eventData.spots || 0,
          category: eventData.category || 'Event',
          image: eventData.image || '/placeholder.svg',
          attendees: attendeesFromDoc, // may be null; we’ll fallback later
        };

        setEvent(eventObj);

        // --- registrations subcollection: events/{eventId}/registrations ---
        const regsRef = collection(db, 'events', eventId, 'registrations');
        const regsSnap = await getDocs(regsRef);

        const registrants = [];
        for (const regDoc of regsSnap.docs) {
          const reg = { id: regDoc.id, ...regDoc.data() };

          const registeredAt = reg.createdAt || reg.registeredAt;
          let registeredDate = '';
          if (registeredAt) {
            const d =
              registeredAt instanceof Timestamp
                ? registeredAt.toDate()
                : registeredAt?.toDate
                ? registeredAt.toDate()
                : new Date(registeredAt);
            registeredDate = d.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            });
          }

          const fullName =
            reg.name ||
            reg.displayName ||
            [reg.firstName, reg.lastName].filter(Boolean).join(' ') || // 👈 use first/last
            reg.firstName ||
            'Member';

          registrants.push({
            id: regDoc.id,
            userId: reg.userId || reg.uid || 'unknown',
            name: fullName,
            email: reg.email || '',
            avatar: reg.avatar || '/professional-man.jpg',
            registeredAt: registeredDate,
            status: reg.status || 'Registered',
          });
        }

        registrants.sort((a, b) => {
          if (!a.registeredAt || !b.registeredAt) return 0;
          const da = new Date(a.registeredAt);
          const db = new Date(b.registeredAt);
          return da - db;
        });

        setRegistrations(registrants);
      } catch (err) {
        console.error('Error loading event registrations:', err);
        setEvent(null);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEventAndRegistrations();
  }, [authChecked, isAdmin, eventId]);

  if (!authChecked || !isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading event registrations...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => router.push('/admin/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Event not found</h1>
                <p className="text-sm text-muted-foreground">
                  The event you&apos;re looking for doesn&apos;t exist or was
                  removed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // prefer count from event doc; fallback to number of registration docs
  const subcollectionCount = registrations.length;
  const docAttendeeCount =
    typeof event.attendees === 'number' ? event.attendees : null;
  const filledCount =
    docAttendeeCount !== null ? docAttendeeCount : subcollectionCount;

  const spots = event.spots || 0;
  const fillPercent =
    spots > 0 ? Math.min(100, Math.round((filledCount / spots) * 100)) : null;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-primary/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-accent/25 rounded-full blur-3xl" />
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-28 pb-20 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {event.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Event registrations overview
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="flex items-center gap-1 px-3 py-1"
          >
            <Users className="h-4 w-4" />
            {filledCount} / {spots || '∞'} registered
          </Badge>
        </div>

        {/* Event summary */}
        <Card className="p-6 bg-card/60 backdrop-blur-xl border-border space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {event.date || 'Date TBA'}
                </span>
                {event.time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTimeRange(event.time)}
                  </span>
                )}
                {event.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary">{event.category}</Badge>
                {spots > 0 && (
                  <Badge variant="outline">
                    {filledCount}/{spots} spots filled
                  </Badge>
                )}
                {fillPercent !== null && (
                  <span className="text-xs text-muted-foreground">
                    {fillPercent}% capacity
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Total registrations
              </div>
              <div className="text-2xl font-semibold">{filledCount}</div>
              {docAttendeeCount !== null &&
                docAttendeeCount !== subcollectionCount && (
                  <div className="text-xs text-muted-foreground mt-1">
                    ({subcollectionCount} records in registrations
                    subcollection)
                  </div>
                )}
            </div>
          </div>
        </Card>

        {/* Registrations list */}
        <Card className="bg-card/60 backdrop-blur-xl border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Registered Members
            </h2>
            <div className="text-sm text-muted-foreground">
              {subcollectionCount === 0
                ? 'No registrations yet'
                : `${subcollectionCount} member${
                    subcollectionCount === 1 ? '' : 's'
                  } in subcollection`}
            </div>
          </div>

          {subcollectionCount === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground text-sm">
              Nobody has registered for this event yet. As members RSVP, they
              will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background/60 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Member</th>
                    <th className="text-left px-6 py-3 font-medium">Email</th>
                    <th className="text-left px-6 py-3 font-medium">
                      Registered At
                    </th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-right px-6 py-3 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="border-b border-border/60 hover:bg-background/40 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-primary-foreground">
                            {reg.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium">{reg.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {reg.userId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {reg.email || '—'}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {reg.registeredAt || '—'}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={
                            reg.status === 'Cancelled' ? 'outline' : 'secondary'
                          }
                        >
                          {reg.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {reg.email && (
                            <a href={`mailto:${reg.email}`}>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:text-primary"
                                title="Email member"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
