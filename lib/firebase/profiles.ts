import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { firestore } from './client';

export type MemberProfile = {
  uid: string;
  email: string;
  name?: string;
  year?: string;
  major?: string;
  role?: 'board' | 'member';
  bio?: string;
  avatar?: string;
  joinedAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
};

export type UpdateProfilePayload = {
  uid: string;
  name?: string;
  year?: string;
  major?: string;
  bio?: string;
  avatar?: string;
  role?: 'board' | 'member';
};

// Get a single member profile
export const getMemberProfile = async (uid: string): Promise<MemberProfile | null> => {
  const memberRef = doc(firestore, 'members', uid);
  const memberSnap = await getDoc(memberRef);

  if (!memberSnap.exists()) {
    return null;
  }

  return {
    uid: memberSnap.id,
    ...memberSnap.data(),
  } as MemberProfile;
};

// Get all member profiles
export const getAllMemberProfiles = async (maxMembers: number = 100): Promise<MemberProfile[]> => {
  const membersRef = collection(firestore, 'members');
  const q = query(membersRef, orderBy('name', 'asc'), limit(maxMembers));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as MemberProfile[];
};

// Search members by name or email
export const searchMembers = async (searchTerm: string, maxResults: number = 50): Promise<MemberProfile[]> => {
  const membersRef = collection(firestore, 'members');
  const searchLower = searchTerm.toLowerCase();

  // Get all members and filter client-side (Firestore doesn't support case-insensitive search easily)
  const q = query(membersRef, limit(200));
  const snapshot = await getDocs(q);

  const allMembers = snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as MemberProfile[];

  const results = allMembers
    .filter((member) => {
      const name = (member.name || '').toLowerCase();
      const email = (member.email || '').toLowerCase();
      return name.includes(searchLower) || email.includes(searchLower);
    })
    .slice(0, maxResults);

  return results;
};

// Update member profile
export const updateMemberProfile = async (payload: UpdateProfilePayload): Promise<void> => {
  const memberRef = doc(firestore, 'members', payload.uid);
  const updateData: any = {
    updatedAt: serverTimestamp(),
  };

  if (payload.name !== undefined) updateData.name = payload.name || null;
  if (payload.year !== undefined) updateData.year = payload.year || null;
  if (payload.major !== undefined) updateData.major = payload.major || null;
  if (payload.bio !== undefined) updateData.bio = payload.bio || null;
  if (payload.avatar !== undefined) updateData.avatar = payload.avatar || null;
  if (payload.role !== undefined) updateData.role = payload.role || 'member';

  await updateDoc(memberRef, updateData);
};

