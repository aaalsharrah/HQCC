'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const upcomingEvents = [
  {
    id: 1,
    title: 'Quantum Computing Workshop',
    date: '2024-02-15',
    time: '6:00 PM - 8:00 PM',
    location: 'Engineering Lab 201',
    attendees: 45,
    category: 'Workshop',
    description:
      'Hands-on introduction to quantum algorithms and circuit design using Qiskit.',
    image: '/quantum-computing-workshop.jpg',
    spots: 50,
  },
  {
    id: 2,
    title: 'Guest Lecture: IBM Quantum',
    date: '2024-02-22',
    time: '7:00 PM - 9:00 PM',
    location: 'Auditorium Hall A',
    attendees: 120,
    category: 'Lecture',
    description:
      'Industry leader from IBM Quantum discusses the future of quantum computing.',
    image: '/quantum-lecture-hall.jpg',
    spots: 150,
  },
  {
    id: 3,
    title: 'Quantum Hackathon 2024',
    date: '2024-03-10',
    time: '9:00 AM - 6:00 PM',
    location: 'Computer Science Building',
    attendees: 80,
    category: 'Hackathon',
    description:
      '24-hour quantum computing hackathon with prizes and mentorship.',
    image: '/hackathon-coding.jpg',
    spots: 100,
  },
  {
    id: 4,
    title: 'Lab Tour: Quantum Research Facility',
    date: '2024-03-18',
    time: '2:00 PM - 4:00 PM',
    location: 'Quantum Lab - Physics Building',
    attendees: 25,
    category: 'Tour',
    description:
      "Exclusive tour of the university's quantum research laboratory.",
    image: '/quantum-laboratory.jpg',
    spots: 30,
  },
];

const pastEvents = [
  {
    id: 5,
    title: 'Introduction to Quantum Mechanics',
    date: '2024-01-20',
    time: '5:00 PM - 7:00 PM',
    location: 'Lecture Hall B',
    attendees: 95,
    category: 'Workshop',
    description: 'Foundational workshop covering quantum mechanics principles.',
    image: '/quantum-mechanics-lecture.jpg',
    recording: true,
  },
  {
    id: 6,
    title: 'Quantum Algorithms Study Group',
    date: '2024-01-15',
    time: '6:00 PM - 8:00 PM',
    location: 'Study Room 305',
    attendees: 32,
    category: 'Study Group',
    description: "Weekly study session on Shor's and Grover's algorithms.",
    image: '/study-group-quantum.jpg',
    recording: false,
  },
  {
    id: 7,
    title: 'Meet & Greet - Fall Semester',
    date: '2024-01-10',
    time: '4:00 PM - 6:00 PM',
    location: 'Student Center',
    attendees: 68,
    category: 'Social',
    description:
      'Welcome event for new members with refreshments and networking.',
    image: '/university-meet-and-greet.jpg',
    recording: false,
  },
  {
    id: 8,
    title: 'Quantum Cryptography Seminar',
    date: '2023-12-15',
    time: '7:00 PM - 9:00 PM',
    location: 'Engineering Lab 150',
    attendees: 56,
    category: 'Seminar',
    description:
      'Deep dive into quantum key distribution and post-quantum cryptography.',
    image: '/cryptography-security.jpg',
    recording: true,
  },
];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
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
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group/btn">
                          Register Now
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
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
