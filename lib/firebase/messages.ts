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

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Timestamp;
};

export type CreateConversationPayload = {
  userId1: string;
  userId2: string;
};

export type SendMessagePayload = {
  conversationId: string;
  senderId: string;
  content: string;
};

// Create or get existing conversation between two users
export const getOrCreateConversation = async ({
  userId1,
  userId2,
}: CreateConversationPayload): Promise<string> => {
  // Sort user IDs to ensure consistent conversation ID
  const participants = [userId1, userId2].sort();
  
  // Check if conversation already exists
  const conversationsRef = collection(firestore, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', '==', participants),
    limit(1)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  // Create new conversation
  const docRef = await addDoc(conversationsRef, {
    participants,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Send a message
export const sendMessage = async ({
  conversationId,
  senderId,
  content,
}: SendMessagePayload): Promise<string> => {
  if (content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }

  const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
  const docRef = await addDoc(messagesRef, {
    senderId,
    content: content.trim(),
    read: false,
    createdAt: serverTimestamp(),
  });

  // Update conversation last message
  const conversationRef = doc(firestore, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    lastMessage: content.trim(),
    lastMessageAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get all conversations for a user
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  const conversationsRef = collection(firestore, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Conversation[];
};

// Subscribe to conversations updates
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void,
): (() => void) => {
  const conversationsRef = collection(firestore, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Conversation[];
    callback(conversations);
  });
};

// Get messages for a conversation
export const getMessages = async (conversationId: string, maxMessages: number = 50): Promise<Message[]> => {
  const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(maxMessages));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    conversationId,
    ...doc.data(),
  })) as Message[];
};

// Subscribe to messages updates
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void,
  maxMessages: number = 50,
): (() => void) => {
  const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(maxMessages));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      conversationId,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
  const q = query(
    messagesRef,
    where('senderId', '!=', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);

  const updatePromises = snapshot.docs.map((docSnap) => {
    const messageRef = doc(firestore, 'conversations', conversationId, 'messages', docSnap.id);
    return updateDoc(messageRef, { read: true });
  });

  await Promise.all(updatePromises);
};

