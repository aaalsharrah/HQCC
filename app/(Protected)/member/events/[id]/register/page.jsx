'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Tag,
  Code,
  Briefcase,
  Plane,
  CheckCircle,
} from 'lucide-react';

import { db, auth } from '@/app/lib/firebase/firebase';
import {
  doc,
  getDoc,
  Timestamp,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const dynamicParams = true;

// Helper to parse Firestore / string dates
function parseEventDate(dateField) {
  if (!dateField) return null;
  if (dateField instanceof Timestamp) return dateField.toDate();
  if (dateField?.toDate) return dateField.toDate();
  if (typeof dateField === 'string') return new Date(dateField);
  return null;
}

export default function RegisterEventPage(props) {
  const params = use(props.params); // Next 15 + React use()
  const { id } = params; // /member/events/[id]/register

  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [formData, setFormData] = useState({
    // Common
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: 'Hofstra University',
    major: '',
    year: '',

    // Hackathon
    teamName: '',
    role: '',
    experienceLevel: '',
    github: '',

    // Workshop
    focusArea: '',
    priorExperience: '',

    // Field Trip
    emergencyContact: '',
    emergencyPhone: '',
    tripNotes: '',
  });

  // 🔐 Watch auth state & require login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);

      if (!user) {
        router.push(`/login?next=/member/events/${id}/register`);
      }
    });

    return () => unsub();
  }, [id, router]);

  // 📄 Load event info
  useEffect(() => {
    if (!id) return;

    async function fetchEvent() {
      try {
        setLoadingEvent(true);
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
          category: data.category || 'Event',
          image: data.image || '/logo1.png',
        };

        setEvent(safeEvent);
      } catch (err) {
        console.error('Error loading event for registration:', err);
        setEvent(null);
      } finally {
        setLoadingEvent(false);
      }
    }

    fetchEvent();
  }, [id]);

  // ✅ Check if user is already registered
  useEffect(() => {
    if (!currentUser || !event) return;

    async function checkRegistration() {
      try {
        const regRef = doc(db, 'events', id, 'registrations', currentUser.uid);
        const regSnap = await getDoc(regRef);
        if (regSnap.exists()) {
          setAlreadyRegistered(true);
        }
      } catch (err) {
        console.error('Error checking registration:', err);
      }
    }

    checkRegistration();
  }, [currentUser, event, id]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = e.target.checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!currentUser) {
        alert('Please log in to register for this event.');
        router.push(`/login?next=/member/events/${id}/register`);
        return;
      }

      const userId = currentUser.uid;
      const fullName =
        `${formData.firstName} ${formData.lastName}`.trim() ||
        currentUser.displayName ||
        'Attendee';

      const eventRef = doc(db, 'events', id);
      const registrationRef = doc(eventRef, 'registrations', userId);

      // 🔁 Extra safety: prevent double registration
      const existing = await getDoc(registrationRef);
      if (existing.exists()) {
        setAlreadyRegistered(true);
        setIsSubmitting(false);
        return;
      }

      // 📝 Save registration
      await setDoc(registrationRef, {
        userId,
        eventId: id,
        category: event.category,
        ...formData,
        createdAt: serverTimestamp(),
      });

      // 🔄 Update event counters + attendeesList
      await updateDoc(eventRef, {
        attendees: increment(1),
        attendeesList: arrayUnion({
          userId,
          name: fullName,
          role: formData.major || 'Attendee',
          avatar: currentUser.photoURL || null,
        }),
      });

      setShowSuccess(true);

      setTimeout(() => {
        router.push(`/member/events/${id}`);
      }, 2500);
    } catch (err) {
      console.error('Error submitting registration:', err);
      alert('Something went wrong submitting your registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ⏳ Loading states
  if (!authChecked || loadingEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
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

  const category = (event.category || '').toLowerCase();
  const isHackathon = category === 'hackathon';
  const isWorkshop = category === 'workshop';
  const isFieldTrip = category === 'field trip' || category === 'field-trip';

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href={`/member/events/${id}`}>
            <Button variant="ghost" className="mb-6 hover:bg-card/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
          </Link>

          {/* Event Summary */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-8">
            <div className="flex gap-6 items-start">
              <img
                src={event.image || '/logo1.png'}
                alt={event.title}
                className="w-28 h-28 rounded-xl object-cover border border-border"
              />
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full mb-3">
                  <Tag className="w-3 h-3" />
                  {event.category}
                </span>
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>
                      {event.date
                        ? event.date.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Date TBA'}
                    </span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-secondary" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form Card */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              {isHackathon && 'Hackathon Registration'}
              {isWorkshop && 'Workshop Registration'}
              {isFieldTrip && 'Field Trip Registration'}
              {!isHackathon &&
                !isWorkshop &&
                !isFieldTrip &&
                'Event Registration'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Please fill out the form below to reserve your spot.
            </p>

            {/* 🔒 Already registered state */}
            {alreadyRegistered && (
              <div className="text-center py-20">
                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  You’re Already Registered
                </h2>
                <p className="text-muted-foreground mb-6">
                  You have already registered for this event. If you need to
                  update your details, please contact the event organizer.
                </p>
                <Link href={`/member/events/${id}`}>
                  <Button className="bg-primary text-primary-foreground">
                    Back to Event
                  </Button>
                </Link>
              </div>
            )}

            {/* 📝 Form (only if NOT already registered & not successful yet) */}
            {!alreadyRegistered && !showSuccess && (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        placeholder="john.doe@hofstra.edu"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Academic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="organization"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Organization *
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        required
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        placeholder="Hofstra University"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="major"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Major/Field of Study *
                      </label>
                      <input
                        type="text"
                        id="major"
                        name="major"
                        required
                        value={formData.major}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label
                        htmlFor="year"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Academic Year *
                      </label>
                      <select
                        id="year"
                        name="year"
                        required
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      >
                        <option value="">Select your year</option>
                        <option value="freshman">Freshman</option>
                        <option value="sophomore">Sophomore</option>
                        <option value="junior">Junior</option>
                        <option value="senior">Senior</option>
                        <option value="graduate">Graduate Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hackathon-specific */}
                {isHackathon && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                      <Code className="w-5 h-5 text-primary" />
                      Hackathon Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="teamName"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Team Name (optional)
                        </label>
                        <input
                          type="text"
                          id="teamName"
                          name="teamName"
                          value={formData.teamName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="Quantum Coders"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="role"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Preferred Role
                        </label>
                        <input
                          type="text"
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="Frontend, Backend, ML, etc."
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="experienceLevel"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Experience Level
                        </label>
                        <select
                          id="experienceLevel"
                          name="experienceLevel"
                          value={formData.experienceLevel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        >
                          <option value="">Select an option</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="github"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          GitHub Profile (optional)
                        </label>
                        <input
                          type="url"
                          id="github"
                          name="github"
                          value={formData.github}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="https://github.com/username"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Workshop-specific */}
                {isWorkshop && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Workshop Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="focusArea"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          What topics are you most interested in?
                        </label>
                        <input
                          type="text"
                          id="focusArea"
                          name="focusArea"
                          value={formData.focusArea}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="e.g., quantum algorithms, hardware, cryptography"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="priorExperience"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Prior experience with this topic (if any)
                        </label>
                        <textarea
                          id="priorExperience"
                          name="priorExperience"
                          value={formData.priorExperience}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                          placeholder="Briefly describe your experience or write 'None'"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Field Trip-specific */}
                {isFieldTrip && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                      <Plane className="w-5 h-5 text-primary" />
                      Field Trip Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="emergencyContact"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Emergency Contact Name *
                        </label>
                        <input
                          type="text"
                          id="emergencyContact"
                          name="emergencyContact"
                          required
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="emergencyPhone"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Emergency Contact Phone *
                        </label>
                        <input
                          type="tel"
                          id="emergencyPhone"
                          name="emergencyPhone"
                          required
                          value={formData.emergencyPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          placeholder="(555) 987-6543"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label
                          htmlFor="tripNotes"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Notes (accessibility, transportation, etc.)
                        </label>
                        <textarea
                          id="tripNotes"
                          name="tripNotes"
                          value={formData.tripNotes}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                          placeholder="Anything we should know to support you on this trip"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Link href={`/member/events/${id}`} className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* ✅ Success state */}
            {!alreadyRegistered && showSuccess && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-6">
                  <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Registration Successful!
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You&apos;re all set for {event.title}. A confirmation email
                  will be sent to {formData.email || 'your email'}.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Redirecting to event page...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
