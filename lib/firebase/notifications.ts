import {
  collection,
  doc,
  addDoc,
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

export type NotificationType = 'dm' | 'announcement' | 'event' | 'post_like' | 'post_comment' | 'event_reminder';

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Timestamp;
};

export type CreateNotificationPayload = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

// Create a notification
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationPayload): Promise<string> => {
  const notificationsRef = collection(firestore, 'notifications');
  const docRef = await addDoc(notificationsRef, {
    userId,
    type,
    title,
    message,
    link: link || null,
    read: false,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get notifications for a user
export const getNotifications = async (userId: string, maxNotifications: number = 50): Promise<Notification[]> => {
  const notificationsRef = collection(firestore, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxNotifications)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Notification[];
};

// Subscribe to notifications updates
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
  maxNotifications: number = 50,
): (() => void) => {
  const notificationsRef = collection(firestore, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxNotifications)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
    callback(notifications);
  });
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(firestore, 'notifications', notificationId);
  await updateDoc(notificationRef, { read: true });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const notificationsRef = collection(firestore, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);

  const updatePromises = snapshot.docs.map((docSnap) => {
    const notificationRef = doc(firestore, 'notifications', docSnap.id);
    return updateDoc(notificationRef, { read: true });
  });

  await Promise.all(updatePromises);
};

// Get unread count
export const getUnreadCount = async (userId: string): Promise<number> => {
  const notificationsRef = collection(firestore, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

