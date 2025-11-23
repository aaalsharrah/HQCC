import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { firestore } from './client';

export type MemberProfilePayload = {
  uid: string;
  email: string;
  name?: string;
  year?: string;
  major?: string;
  role?: 'board' | 'member';
};

export const saveMemberProfile = async ({
  uid,
  email,
  name,
  year,
  major,
  role = 'member',
}: MemberProfilePayload): Promise<void> => {
  const memberRef = doc(firestore, 'members', uid);
  const memberSnap = await getDoc(memberRef);
  const isNewMember = !memberSnap.exists();

  await setDoc(
    memberRef,
    {
      email,
      name: name ?? null,
      year: year ?? null,
      major: major ?? null,
      role: role ?? 'member',
      updatedAt: serverTimestamp(),
      ...(isNewMember && { joinedAt: serverTimestamp() }),
    },
    { merge: true },
  );
};

