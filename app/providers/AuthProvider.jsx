'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { AuthContext } from '@/lib/firebase/auth-context';
import { auth } from '@/lib/firebase/client';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const runWithPending = useCallback(async (operation) => {
    setPending(true);
    setError(null);

    try {
      return await operation();
    } catch (err) {
      console.error('Firebase auth error', err);
      setError(err?.message ?? 'Something went wrong');
      throw err;
    } finally {
      setPending(false);
    }
  }, []);

  const signUp = useCallback(
    (email, password, profileFields) =>
      runWithPending(async () => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);

        if (profileFields?.displayName) {
          await updateProfile(credential.user, { displayName: profileFields.displayName });
        }

        return credential.user;
      }),
    [runWithPending],
  );

  const signIn = useCallback(
    (email, password) =>
      runWithPending(async () => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential.user;
      }),
    [runWithPending],
  );

  const signOutUser = useCallback(() => runWithPending(() => signOut(auth)), [runWithPending]);

  const value = useMemo(
    () => ({
      user,
      loading: initializing || pending,
      error,
      signUp,
      signIn,
      signOutUser,
    }),
    [user, initializing, pending, error, signUp, signIn, signOutUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

