// Firebase helper functions for notifications
import { db } from './firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Subscribe to notifications for a user
 * @param {string} userId - Current user's ID
 * @param {function} callback - Callback function that receives notifications array
 * @returns {function} Unsubscribe function
 */
export function subscribeToNotifications(userId, callback) {
  const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  // Remove orderBy to avoid requiring composite index - sort client-side instead
  const q = query(
    notificationsRef,
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      
      // Sort client-side by createdAt descending (newest first)
      notifications.sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      });
      
      callback(notifications);
    },
    (error) => {
      console.error('Error subscribing to notifications:', error);
      callback([]);
    }
  );
}

/**
 * Create a notification
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - User who receives the notification
 * @param {string} notificationData.type - Type: 'like', 'comment', 'reply', 'message', 'event'
 * @param {string} notificationData.actorId - User who performed the action
 * @param {string} notificationData.actorName - Name of the actor
 * @param {string} notificationData.actorAvatar - Avatar URL of the actor
 * @param {string} notificationData.postId - Post ID (optional)
 * @param {string} notificationData.postContent - Preview of post content (optional)
 * @returns {Promise<string>} Notification ID
 */
export async function createNotification({
  userId,
  type,
  actorId,
  actorName,
  actorAvatar,
  postId = null,
  postContent = null,
}) {
  // Don't create notification if user is notifying themselves
  if (userId === actorId) {
    return null;
  }

  const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const notificationData = {
    userId,
    type,
    actorId,
    actorName,
    actorAvatar,
    read: false,
    createdAt: serverTimestamp(),
  };

  if (postId) {
    notificationData.postId = postId;
  }

  if (postContent) {
    // Truncate post content to ~100 characters for preview
    notificationData.postContent = postContent.length > 100
      ? postContent.substring(0, 100) + '...'
      : postContent;
  }

  try {
    const docRef = await addDoc(notificationsRef, notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function markNotificationAsRead(notificationId) {
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notificationRef, {
    read: true,
  });
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function markAllNotificationsAsRead(userId) {
  const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  const updatePromises = snapshot.docs.map((doc) =>
    updateDoc(doc.ref, { read: true })
  );

  await Promise.all(updatePromises);
}

/**
 * Create notifications for all members about an existing event
 * This is used to backfill notifications for events created before the notification system
 * @param {string} eventId - Event ID
 * @param {string} eventTitle - Event title
 * @param {string} eventDate - Event date (formatted string)
 * @param {string} eventTime - Event time
 * @returns {Promise<void>}
 */
export async function createEventNotificationsForAllMembers(eventId, eventTitle, eventDate, eventTime) {
  try {
    // Check if notifications already exist for this event
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const existingNotificationsQuery = query(
      notificationsRef,
      where('type', '==', 'event'),
      where('postId', '==', eventId)
    );
    const existingSnapshot = await getDocs(existingNotificationsQuery);
    
    // If notifications already exist, skip creating new ones
    if (existingSnapshot.size > 0) {
      console.log(`Notifications already exist for event ${eventId}, skipping...`);
      return;
    }

    // Get all members
    const membersRef = collection(db, 'members');
    const membersSnapshot = await getDocs(membersRef);
    
    // Create notifications for each member
    const notificationPromises = membersSnapshot.docs.map(async (memberDoc) => {
      const memberId = memberDoc.id;
      
      await createNotification({
        userId: memberId,
        type: 'event',
        actorId: 'system',
        actorName: 'HQCC Events',
        actorAvatar: '/quantum-computing-logo.jpg',
        postId: eventId,
        postContent: `${eventTitle} - ${eventDate} at ${eventTime}`,
      });
    });

    await Promise.all(notificationPromises);
    console.log(`Created notifications for event ${eventId} for ${membersSnapshot.size} members`);
  } catch (error) {
    console.error('Error creating event notifications for all members:', error);
    throw error;
  }
}

/**
 * Format Firestore Timestamp to a readable string (e.g., "2m ago", "1h ago", "1/1/2023")
 * @param {Timestamp|Date} timestamp - Firestore Timestamp object or Date object
 * @returns {string} Formatted time string
 */
export function formatNotificationTimestamp(timestamp) {
  if (!timestamp) return '';

  let date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return '';
  }

  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } else if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`;
  } else {
    return 'Just now';
  }
}

