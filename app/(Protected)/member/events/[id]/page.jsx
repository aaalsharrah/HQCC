'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

import { db, auth } from '@/app/lib/firebase/firebase';
import {
  doc,
  getDoc,
  Timestamp,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';

export const dynamicParams = true;

// Helper to parse Firestore / string dates
function parseEventDate(dateField) {
  if (!dateField) return null;
  if (dateField instanceof Timestamp) return dateField.toDate();
  if (dateField?.toDate) return dateField.toDate();
  if (typeof dateField === 'string') return new Date(dateField);
  return null;
}

export default function EventDetailPage(props) {
  const params = use(props.params);
  const { id } = params; // 'id' from /member/events/[id]
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 auth + RSVP state
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // 🔢 attendee count from DB
  const [attendeeCount, setAttendeeCount] = useState(0);

  // Watch auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch event document
  useEffect(() => {
    if (!id) return;

    async function fetchEvent() {
      try {
        setLoading(true);
        const ref = doc(db, 'events', id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setEvent(null);
          return;
        }

        const data = snap.data();
        const eventDate = parseEventDate(data.date);

        const safeEvent = {
          id,
          title: data.title || 'Untitled Event',
          date: eventDate,
          time: data.time || '',
          location: data.location || '',
          // fallback only – real count comes from registrations subcollection
          attendees: data.attendees || 0,
          category: data.category || 'Event',
          description: data.description || '',
          image: data.image || '/logo1.png',
          spots: data.spots || 0,
          organizer: data.organizer || {
            name: 'HQCC',
            role: 'Organizer',
            avatar: '/logo1.png',
          },
          agenda: data.agenda || [],
          requirements: data.requirements || [],
          attendeesList: data.attendeesList || [],
        };

        setEvent(safeEvent);
      } catch (err) {
        console.error('Error loading event detail:', err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  // Fetch attendee count from subcollection events/{id}/registrations
  useEffect(() => {
    if (!id) return;

    async function fetchAttendeeCount() {
      try {
        const regsRef = collection(db, 'events', id, 'registrations');
        const regsSnap = await getDocs(regsRef);
        setAttendeeCount(regsSnap.size);
      } catch (err) {
        console.error('Error fetching attendee count:', err);
        setAttendeeCount(0);
      }
    }

    fetchAttendeeCount();
  }, [id]);

  // Check if current user is registered for this event
  useEffect(() => {
    if (!id || !currentUser) {
      setIsRegistered(false);
      return;
    }

    async function checkRegistration() {
      try {
        const regsRef = collection(db, 'events', id, 'registrations');
        const qSnap = await getDocs(
          query(regsRef, where('userId', '==', currentUser.uid))
        );
        setIsRegistered(!qSnap.empty);
      } catch (err) {
        console.error('Error checking registration:', err);
        setIsRegistered(false);
      }
    }

    checkRegistration();
  }, [id, currentUser]);

  const handleCancelRsvp = async () => {
    if (!currentUser) {
      router.push('/signin');
      return;
    }

    try {
      setCancelling(true);

      const regsRef = collection(db, 'events', id, 'registrations');
      const qSnap = await getDocs(
        query(regsRef, where('userId', '==', currentUser.uid))
      );

      if (qSnap.empty) {
        setIsRegistered(false);
        return;
      }

      // delete all registrations for this user for this event (usually just one)
      await Promise.all(qSnap.docs.map((d) => deleteDoc(d.ref)));

      // Update local state so UI reflects new count immediately
      setIsRegistered(false);
      setAttendeeCount((prev) => Math.max(0, prev - qSnap.docs.length || 1));
    } catch (err) {
      console.error('Error cancelling RSVP:', err);
      alert('Failed to cancel RSVP. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
          <Link href="/member/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const effectiveAttendees =
    typeof attendeeCount === 'number' && attendeeCount >= 0
      ? attendeeCount
      : event.attendees || 0;

  const availableSpots =
    event.spots && effectiveAttendees
      ? Math.max(0, event.spots - effectiveAttendees)
      : event.spots || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link href="/member/events">
            <Button variant="ghost" className="mb-6 hover:bg-card/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>

          {/* Hero Image */}
          <div className="relative h-96 rounded-3xl overflow-hidden mb-8 border border-border">
            <img
              src={event.image || '/logo1.png'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <span className="inline-block px-4 py-2 bg-primary/90 backdrop-blur-sm text-primary-foreground text-sm font-medium rounded-full mb-4">
                {event.category}
              </span>
              <h1 className="text-5xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-foreground/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>
                    {event.date
                      ? event.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Date TBA'}
                  </span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span>{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  About This Event
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {event.description}
                </p>
              </div>

              {/* Agenda */}
              {event.agenda && event.agenda.length > 0 && (
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">
                    Event Agenda
                  </h2>
                  <div className="space-y-4">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary group-hover:bg-primary/30 transition-colors">
                            <Clock className="w-5 h-5 text-primary" />
                          </div>
                          {index < event.agenda.length - 1 && (
                            <div className="w-0.5 h-full bg-border group-hover:bg-primary/50 transition-colors mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-foreground">
                              {item.title}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {item.duration}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {event.requirements && event.requirements.length > 0 && (
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">
                    What to Bring
                  </h2>
                  <ul className="space-y-3">
                    {event.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attendees */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Who&apos;s Coming ({effectiveAttendees})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(event.attendeesList || []).map((attendee, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors"
                    >
                      <Image
                        src={attendee.avatar || '/logo1.png'}
                        alt={attendee.name || 'Attendee'}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                        unoptimized={attendee.avatar?.startsWith('http')}
                        onError={(e) => {
                          e.currentTarget.src = '/logo1.png';
                        }}
                      />

                      <div className="overflow-hidden">
                        <p className="font-medium text-sm text-foreground truncate">
                          {attendee.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {attendee.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* RSVP Card */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 sticky top-24">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Available Spots
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {availableSpots} / {event.spots}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>

                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-primary to-accent h-full transition-all duration-500"
                      style={{
                        width:
                          event.spots > 0
                            ? `${(effectiveAttendees / event.spots) * 100}%`
                            : '0%',
                      }}
                    />
                  </div>

                  {/* Toggle Register / Cancel */}
                  {!authLoading && isRegistered ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          size="lg"
                          disabled={cancelling}
                        >
                          {cancelling ? 'Cancelling...' : 'Cancel RSVP'}
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">
                            Cancel your RSVP?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            This will remove your registration and free up your
                            spot for someone else. Are you sure you want to
                            cancel?
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-background border border-border text-foreground">
                            Keep RSVP
                          </AlertDialogCancel>

                          <AlertDialogAction
                            onClick={handleCancelRsvp}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Yes, Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Link
                      href={`/member/events/${id}/register`}
                      className="w-full"
                    >
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="lg"
                      >
                        Register for Event
                      </Button>
                    </Link>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Organizer Card */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-foreground">
                  Organized By
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={event.organizer.avatar || '/logo1.png'}
                    alt={event.organizer.name || 'Organizer'}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                    unoptimized={event.organizer.avatar?.startsWith('http')}
                    onError={(e) => {
                      e.currentTarget.src = '/logo1.png';
                    }}
                  />

                  <div>
                    <p className="font-semibold text-foreground">
                      {event.organizer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.organizer.role}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Organizer
                </Button>
              </div>

              {/* Map Placeholder */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-foreground">
                  Location
                </h3>
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {event.location || 'Location TBA'}
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  size="sm"
                >
                  View on Map
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
