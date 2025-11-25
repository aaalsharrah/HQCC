'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/app/lib/firebase/firebase';
import {
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { createEventNotificationsForAllMembers } from '@/app/lib/firebase/notifications';

// Helper function to parse event date
function parseEventDate(dateField) {
  if (!dateField) return null;
  if (dateField instanceof Timestamp) return dateField.toDate();
  if (dateField?.toDate) return dateField.toDate();
  if (typeof dateField === 'string') return new Date(dateField);
  return null;
}

// Helper function to format date consistently (YYYY-MM-DD) using UTC
function formatEventDate(eventDate) {
  if (!eventDate) return '';
  // Use UTC methods to ensure date doesn't shift based on timezone
  const year = eventDate.getUTCFullYear();
  const month = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(eventDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);

        // Fetch events
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log('Fetched events from Firebase:', eventsData.length);
        if (eventsData.length > 0) {
          console.log('Sample event data:', {
            id: eventsData[0].id,
            title: eventsData[0].title,
            date: eventsData[0].date,
            dateType: typeof eventsData[0].date,
            isTimestamp: eventsData[0].date instanceof Timestamp,
          });
        }

        // Fetch registrations for attendee counts
        const registrationsRef = collection(db, 'registrations');
        const registrationsSnapshot = await getDocs(registrationsRef);
        const registrationsData = registrationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Process events
        const now = new Date(); // Current datetime

        const processedEvents = eventsData.map((event) => {
          // Parse the date field (could be Timestamp, Date, or string)
          const eventDate = parseEventDate(event.date);
          
          // Calculate attendees from registrations
          const attendees = registrationsData.filter(
            (r) => r.eventId === event.id || r.event === event.id,
          ).length;

          // Format date for display using helper function
          let dateDisplay = '';
          if (eventDate) {
            dateDisplay = formatEventDate(eventDate);
          } else if (event.date) {
            // If it's already a string, try to use it
            if (typeof event.date === 'string') {
              dateDisplay = event.date.split('T')[0]; // Extract date part if ISO string
            }
          }

          return {
            id: event.id,
            title: event.title || 'Untitled Event',
            date: dateDisplay,
            originalDate: eventDate, // Keep original date object for comparison
            time: event.time || '',
            location: event.location || '',
            attendees,
            category: event.category || 'Event',
            description: event.description || '',
            image: event.image || '/placeholder.svg',
            spots: event.spots || 0,
            recording: event.recording || false,
          };
        });

        console.log('Processed events:', processedEvents.length);
        console.log('Sample processed event:', processedEvents[0]);
        console.log('Current datetime:', now.toISOString());

        // Separate into upcoming and past
        // Compare using the original event date (preserves time)
        const upcoming = processedEvents
          .filter((event) => {
            if (!event.originalDate) {
              // Include events without dates in upcoming (they might be drafts)
              console.log('Event without date included in upcoming:', event.title);
              return true;
            }
            try {
              // Compare the actual event datetime with current datetime
              const isUpcoming = event.originalDate >= now;
              console.log(`Event "${event.title}": date=${event.originalDate.toISOString()}, now=${now.toISOString()}, isUpcoming=${isUpcoming}`);
              return isUpcoming;
            } catch (e) {
              console.error('Error comparing date for event:', event.title, e);
              // Include in upcoming if date comparison fails
              return true;
            }
          })
          .sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);
            if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) return 0;
            return aDate - bDate; // Soonest first
          });

        const past = processedEvents
          .filter((event) => {
            if (!event.originalDate) return false;
            try {
              // Compare the actual event datetime with current datetime
              return event.originalDate < now;
            } catch (e) {
              return false;
            }
          })
          .sort((a, b) => {
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);
            return bDate - aDate; // Most recent first
          });

        console.log('Upcoming events:', upcoming.length);
        console.log('Past events:', past.length);
        console.log('Upcoming events list:', upcoming.map(e => ({ title: e.title, date: e.date })));

        // Create notifications for upcoming events that don't have them yet
        // This backfills notifications for existing events
        // Use Promise.allSettled to handle all events even if some fail
        Promise.allSettled(
          upcoming.map((event) =>
            createEventNotificationsForAllMembers(
              event.id,
              event.title,
              event.date,
              event.time
            )
          )
        ).then((results) => {
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Error creating notifications for event ${upcoming[index].id}:`, result.reason);
            }
          });
        });

        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              HQCC Events
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join us for workshops, hackathons, lectures, and networking events
              that push the boundaries of quantum computing
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setActiveTab('upcoming')}
                variant={activeTab === 'upcoming' ? 'default' : 'outline'}
                size="lg"
                className={
                  activeTab === 'upcoming'
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border hover:bg-card/50 backdrop-blur-sm'
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming Events
              </Button>
              <Button
                onClick={() => setActiveTab('past')}
                variant={activeTab === 'past' ? 'default' : 'outline'}
                size="lg"
                className={
                  activeTab === 'past'
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border hover:bg-card/50 backdrop-blur-sm'
                }
              >
                <Clock className="w-4 h-4 mr-2" />
                Past Events
              </Button>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="px-4 pb-24">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-xl text-muted-foreground">
                  {activeTab === 'upcoming'
                    ? 'No upcoming events scheduled.'
                    : 'No past events found.'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {events.map((event, index) => (
                <div
                  key={event.id}
                  className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.image || '/placeholder.svg'}
                      alt={event.title}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-card to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-primary/90 backdrop-blur-sm text-primary-foreground text-sm font-medium rounded-full">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <MapPin className="w-4 h-4 text-secondary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Users className="w-4 h-4 text-primary" />
                        <span>
                          {event.attendees}{' '}
                          {activeTab === 'upcoming'
                            ? `/ ${event.spots} spots`
                            : 'attended'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      {activeTab === 'upcoming' ? (
                        <Link href={`/member/events/${event.id}`}>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group/btn">
                            Register Now
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      ) : event.recording ? (
                        <Button
                          variant="outline"
                          className="w-full border-border hover:bg-card/50 bg-transparent"
                        >
                          View Recording
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button variant="ghost" className="w-full" disabled>
                          No Recording Available
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
