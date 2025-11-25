'use client';

import { useState, useEffect } from 'react';
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
  X,
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/app/lib/firebase/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

// If you’re using output: 'export' you can keep this:
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
  const { id } = props.params; // 'id' from /member/events/[id]
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        // Fallbacks so UI doesn’t break if fields are missing
        const safeEvent = {
          id,
          title: data.title || 'Untitled Event',
          date: eventDate,
          time: data.time || '',
          location: data.location || '',
          attendees: data.attendees || 0,
          category: data.category || 'Event',
          description: data.description || '',
          image: data.image || '/placeholder.svg',
          spots: data.spots || 0,
          organizer: data.organizer || {
            name: 'HQCC',
            role: 'Organizer',
            avatar: '/placeholder.svg',
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

  const handleRSVP = () => {
    // later you’ll write Firestore registration logic here
    setIsRegistered(true);
    setShowRSVP(false);
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

  const availableSpots =
    event.spots && event.attendees
      ? event.spots - event.attendees
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
              src={event.image || '/placeholder.svg'}
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
                  Who&apos;s Coming ({event.attendees})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(event.attendeesList || []).map((attendee, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors"
                    >
                      <img
                        src={attendee.avatar || '/placeholder.svg'}
                        alt={attendee.name}
                        className="w-12 h-12 rounded-full object-cover"
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
                      className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                      style={{
                        width:
                          event.spots > 0
                            ? `${(event.attendees / event.spots) * 100}%`
                            : '0%',
                      }}
                    />
                  </div>

                  {isRegistered ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary p-4 bg-primary/10 rounded-xl border border-primary/20">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">
                          You&apos;re Registered!
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => setIsRegistered(false)}
                      >
                        Cancel Registration
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                      onClick={() => setShowRSVP(true)}
                    >
                      Register for Event
                    </Button>
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
                  <img
                    src={event.organizer.avatar || '/placeholder.svg'}
                    alt={event.organizer.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
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

      {/* RSVP Modal */}
      {showRSVP && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowRSVP(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Confirm Registration
            </h2>
            <p className="text-muted-foreground mb-6">
              You&apos;re about to register for{' '}
              <span className="font-semibold text-foreground">
                {event.title}
              </span>
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-foreground">
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
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-5 h-5 text-accent" />
                  <span className="text-foreground">{event.time}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <span className="text-foreground">{event.location}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowRSVP(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleRSVP}
              >
                Confirm RSVP
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
