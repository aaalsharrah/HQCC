import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

import { firestore } from './client';

export type EventType = 'hackathon' | 'trip' | 'speaker' | 'workshop';
export type RegistrationType = 'group' | 'individual' | 'open';

export type Event = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: Timestamp;
  location: string;
  maxAttendees?: number;
  registrationType: RegistrationType;
  createdBy: string;
  createdAt: Timestamp;
};

export type CreateEventPayload = {
  title: string;
  description: string;
  type: EventType;
  date: Date;
  location: string;
  maxAttendees?: number;
  registrationType: RegistrationType;
  createdBy: string;
};

export type Registration = {
  id: string;
  eventId: string;
  userId: string;
  registrationType: RegistrationType;
  data: any; // For hackathons: { teamName, members[] }, etc.
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
};

export type CreateRegistrationPayload = {
  eventId: string;
  userId: string;
  registrationType: RegistrationType;
  data: any;
};

// Create an event
export const createEvent = async (payload: CreateEventPayload): Promise<string> => {
  const eventsRef = collection(firestore, 'events');
  const docRef = await addDoc(eventsRef, {
    ...payload,
    date: Timestamp.fromDate(payload.date),
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get all events
export const getEvents = async (maxEvents: number = 100): Promise<Event[]> => {
  const eventsRef = collection(firestore, 'events');
  const q = query(eventsRef, orderBy('date', 'asc'), limit(maxEvents));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
};

// Get upcoming events
export const getUpcomingEvents = async (maxEvents: number = 50): Promise<Event[]> => {
  const eventsRef = collection(firestore, 'events');
  const now = Timestamp.now();
  const q = query(
    eventsRef,
    where('date', '>=', now),
    orderBy('date', 'asc'),
    limit(maxEvents)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
};

// Subscribe to events updates
export const subscribeToEvents = (
  callback: (events: Event[]) => void,
  maxEvents: number = 100,
): (() => void) => {
  const eventsRef = collection(firestore, 'events');
  const q = query(eventsRef, orderBy('date', 'asc'), limit(maxEvents));

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
    callback(events);
  });
};

// Get a single event
export const getEvent = async (eventId: string): Promise<Event | null> => {
  const eventRef = doc(firestore, 'events', eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return null;
  }

  return {
    id: eventSnap.id,
    ...eventSnap.data(),
  } as Event;
};

// Register for an event
export const registerForEvent = async ({
  eventId,
  userId,
  registrationType,
  data,
}: CreateRegistrationPayload): Promise<string> => {
  const registrationsRef = collection(firestore, 'registrations');
  
  // Check if already registered
  const existingQ = query(
    registrationsRef,
    where('eventId', '==', eventId),
    where('userId', '==', userId)
  );
  const existing = await getDocs(existingQ);
  if (!existing.empty) {
    throw new Error('You are already registered for this event');
  }

  const status = registrationType === 'open' ? 'approved' : 'pending';
  const docRef = await addDoc(registrationsRef, {
    eventId,
    userId,
    registrationType,
    data,
    status,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get registrations for an event
export const getEventRegistrations = async (eventId: string): Promise<Registration[]> => {
  const registrationsRef = collection(firestore, 'registrations');
  const q = query(
    registrationsRef,
    where('eventId', '==', eventId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Registration[];
};

// Update registration status (for board members)
export const updateRegistrationStatus = async (
  registrationId: string,
  status: 'approved' | 'rejected',
): Promise<void> => {
  const registrationRef = doc(firestore, 'registrations', registrationId);
  await updateDoc(registrationRef, { status });
};

// Cancel registration
export const cancelRegistration = async (eventId: string, userId: string): Promise<void> => {
  const registrationsRef = collection(firestore, 'registrations');
  const q = query(
    registrationsRef,
    where('eventId', '==', eventId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Registration not found');
  }

  const registrationRef = doc(firestore, 'registrations', snapshot.docs[0].id);
  await updateDoc(registrationRef, { status: 'rejected' });
};

