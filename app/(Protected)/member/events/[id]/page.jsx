'use client';

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
import { useState } from 'react';

// Event data (in production, this would come from a database)
const eventsData = {
  1: {
    id: 1,
    title: 'Quantum Computing Workshop',
    date: '2024-02-15',
    time: '6:00 PM - 8:00 PM',
    location: 'Engineering Lab 201',
    attendees: 45,
    category: 'Workshop',
    description:
      "Join us for an intensive hands-on workshop where you'll learn the fundamentals of quantum algorithms and circuit design using Qiskit. This workshop is perfect for beginners and intermediate learners looking to expand their quantum computing knowledge.",
    image: '/quantum-computing-workshop.jpg',
    spots: 50,
    organizer: {
      name: 'Abdallah Aisharrah',
      role: 'Founder & President',
      avatar: '/professional-man.jpg',
    },
    agenda: [
      { time: '6:00 PM', title: 'Welcome & Introduction', duration: '15 min' },
      { time: '6:15 PM', title: 'Quantum Basics Overview', duration: '30 min' },
      {
        time: '6:45 PM',
        title: 'Hands-on Qiskit Tutorial',
        duration: '45 min',
      },
      {
        time: '7:30 PM',
        title: 'Build Your First Circuit',
        duration: '20 min',
      },
      { time: '7:50 PM', title: 'Q&A Session', duration: '10 min' },
    ],
    requirements: [
      'Laptop with Python installed',
      'Basic programming knowledge',
      'Qiskit installed (installation guide will be sent)',
      'Curiosity and enthusiasm!',
    ],
    attendeesList: [
      {
        name: 'Sarah Chen',
        avatar: '/serene-asian-woman.png',
        role: 'CS Senior',
      },
      {
        name: 'Marcus Johnson',
        avatar: '/thoughtful-man.png',
        role: 'Physics Junior',
      },
      {
        name: 'Emily Rodriguez',
        avatar: '/confident-latina-woman.png',
        role: 'Math Sophomore',
      },
      {
        name: 'David Kim',
        avatar: '/thoughtful-asian-man.png',
        role: 'CS Junior',
      },
      {
        name: 'Jessica Taylor',
        avatar: '/woman-student.png',
        role: 'Engineering Senior',
      },
      {
        name: 'Alex Martinez',
        avatar: '/man-student.png',
        role: 'Physics Sophomore',
      },
    ],
  },
  2: {
    id: 2,
    title: 'Guest Lecture: IBM Quantum',
    date: '2024-02-22',
    time: '7:00 PM - 9:00 PM',
    location: 'Auditorium Hall A',
    attendees: 120,
    category: 'Lecture',
    description:
      'An exclusive lecture from a leading researcher at IBM Quantum discussing the latest breakthroughs in quantum computing, real-world applications, and the future trajectory of the field. This is a rare opportunity to learn from industry pioneers.',
    image: '/quantum-lecture-hall.jpg',
    spots: 150,
    organizer: {
      name: 'Abdallah Aisharrah',
      role: 'Founder & President',
      avatar: '/professional-man.jpg',
    },
    agenda: [
      { time: '7:00 PM', title: 'Introduction & Welcome', duration: '10 min' },
      { time: '7:10 PM', title: 'IBM Quantum Overview', duration: '30 min' },
      { time: '7:40 PM', title: 'Recent Breakthroughs', duration: '40 min' },
      { time: '8:20 PM', title: 'Industry Applications', duration: '20 min' },
      { time: '8:40 PM', title: 'Q&A with Speaker', duration: '20 min' },
    ],
    requirements: [
      'No prerequisites required',
      'Bring your questions!',
      'Business casual attire recommended',
    ],
    attendeesList: [
      {
        name: 'Sarah Chen',
        avatar: '/serene-asian-woman.png',
        role: 'CS Senior',
      },
      {
        name: 'Marcus Johnson',
        avatar: '/thoughtful-man.png',
        role: 'Physics Junior',
      },
      {
        name: 'Emily Rodriguez',
        avatar: '/confident-latina-woman.png',
        role: 'Math Sophomore',
      },
      {
        name: 'David Kim',
        avatar: '/thoughtful-asian-man.png',
        role: 'CS Junior',
      },
    ],
  },
};

export default function EventDetailPage({ params }) {
  const event = eventsData[params.id];
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);

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

  const handleRSVP = () => {
    setIsRegistered(true);
    setShowRSVP(false);
  };

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
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <span>{event.location}</span>
                </div>
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

              {/* Requirements */}
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

              {/* Attendees */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Who&apos;s Coming ({event.attendees})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.attendeesList.map((attendee, index) => (
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
                  {event.attendees > event.attendeesList.length && (
                    <div className="flex items-center justify-center p-3 rounded-xl bg-background/50 border border-border">
                      <span className="text-sm text-muted-foreground">
                        +{event.attendees - event.attendeesList.length} more
                      </span>
                    </div>
                  )}
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
                        {event.spots - event.attendees} / {event.spots}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>

                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                      style={{
                        width: `${(event.attendees / event.spots) * 100}%`,
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
                  {event.location}
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
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-accent" />
                <span className="text-foreground">{event.time}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-secondary" />
                <span className="text-foreground">{event.location}</span>
              </div>
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
