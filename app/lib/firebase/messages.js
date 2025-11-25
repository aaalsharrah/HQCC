// Firebase helper functions for messages/conversations
import { db, auth } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { createNotification } from './notifications';

/**
 * Subscribe to conversations for a user
 * @param {string} userId - Current user's ID
 * @param {function} callback - Callback function that receives conversations array
 * @returns {function} Unsubscribe function
 */
export function subscribeToConversations(userId, callback) {
  const conversationsRef = collection(db, 'conversations');
  // Query without orderBy to avoid index requirement - we'll sort client-side
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const conversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort client-side by lastMessageTime (most recent first)
      conversations.sort((a, b) => {
        const aTime = a.lastMessageTime?.toMillis?.() || a.lastMessageTime?.seconds || 0;
        const bTime = b.lastMessageTime?.toMillis?.() || b.lastMessageTime?.seconds || 0;
        return bTime - aTime; // Descending order
      });
      
      callback(conversations);
    },
    (error) => {
      console.error('Error subscribing to conversations:', error);
      callback([]);
    }
  );
}

/**
 * Subscribe to messages in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {function} callback - Callback function that receives messages array
 * @returns {function} Unsubscribe function
 */
export function subscribeToMessages(conversationId, callback) {
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    },
    (error) => {
      console.error('Error subscribing to messages:', error);
      callback([]);
    }
  );
}

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} messageText - Message text
 * @returns {Promise<void>}
 */
export async function sendMessage(conversationId, messageText) {
  if (!messageText.trim()) {
    throw new Error('Message cannot be empty');
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated');
  }

  // Add message to subcollection
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );
  await addDoc(messagesRef, {
    message: messageText.trim(),
    senderId: currentUser.uid,
    timestamp: serverTimestamp(),
  });

  // Update conversation with last message
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    lastMessage: messageText.trim(),
    lastMessageTime: serverTimestamp(),
  });

  // Create notification for recipient
  try {
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data();
      const participants = conversationData.participants || [];
      
      // Find the other participant (recipient)
      const recipientId = participants.find((id) => id !== currentUser.uid);
      
      if (recipientId) {
        // Get sender (actor) details from members collection
        const senderRef = doc(db, 'members', currentUser.uid);
        const senderSnap = await getDoc(senderRef);
        
        let senderName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone';
        let senderAvatar = currentUser.photoURL || null;

        if (senderSnap.exists()) {
          const senderData = senderSnap.data();
          senderName = senderData.name || senderName;
          senderAvatar = senderData.avatar || senderAvatar;
        }

        // Create notification
        await createNotification({
          userId: recipientId,
          type: 'message',
          actorId: currentUser.uid,
          actorName: senderName,
          actorAvatar: senderAvatar,
          postId: conversationId, // Use conversationId for navigation
          postContent: messageText.trim(), // Use message text as content preview
        });
      }
    }
  } catch (error) {
    // Don't fail the message send if notification creation fails
    console.error('Error creating message notification:', error);
  }
}

/**
 * Get other user's data from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} currentUserId - Current user's ID
 * @returns {Promise<Object|null>} Other user's data or null
 */
export async function getOtherUser(conversationId, currentUserId) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      return null;
    }

    const data = conversationSnap.data();
    const participants = data.participants || [];

    // Find the other user ID
    const otherUserId = participants.find((id) => id !== currentUserId);
    if (!otherUserId) {
      return null;
    }

    // Get other user's data from members collection
    const memberRef = doc(db, 'members', otherUserId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      return {
        id: otherUserId,
        name: 'Unknown User',
        email: '',
      };
    }

    const memberData = memberSnap.data();
    return {
      id: otherUserId,
      name: memberData.name || 'Unknown User',
      email: memberData.email || '',
      avatar: memberData.avatar || null,
    };
  } catch (error) {
    console.error('Error getting other user:', error);
    return null;
  }
}

/**
 * Format Firestore timestamp for display
 * @param {Timestamp|Date|string} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Just now';

  let date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return 'Just now';
  }

  const now = new Date();
  const difference = now - date;

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor(difference / (1000 * 60));

  if (days > 7) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Create a new conversation
 * @param {Array<string>} userIds - Array of user IDs (participants)
 * @param {string} bookTitle - Optional book title
 * @param {string} bookId - Optional book ID
 * @param {string} sellerId - Optional seller ID
 * @returns {Promise<string>} Conversation ID
 */
export async function createConversation(
  userIds,
  bookTitle = null,
  bookId = null,
  sellerId = null
) {
  const conversationsRef = collection(db, 'conversations');
  const conversationData = {
    participants: userIds,
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
  };

  if (bookTitle) conversationData.bookTitle = bookTitle;
  if (bookId) conversationData.bookId = bookId;
  if (sellerId) conversationData.sellerId = sellerId;

  const docRef = await addDoc(conversationsRef, conversationData);
  return docRef.id;
}

/**
 * Find or create a conversation between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<string>} Conversation ID
 */
export async function findOrCreateConversation(userId1, userId2) {
  if (userId1 === userId2) {
    throw new Error('Cannot create conversation with yourself');
  }

  // Query for existing conversation between these two users
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId1)
  );

  const snapshot = await getDocs(q);
  
  // Check if a conversation already exists with both users
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const participants = data.participants || [];
    
    if (participants.includes(userId1) && participants.includes(userId2)) {
      return docSnap.id; // Return existing conversation ID
    }
  }

  // No existing conversation found, create a new one
  const conversationData = {
    participants: [userId1, userId2],
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
  };

  const docRef = await addDoc(conversationsRef, conversationData);
  return docRef.id;
}

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId) {
  const conversationRef = doc(db, 'conversations', conversationId);
  await deleteDoc(conversationRef);
}

