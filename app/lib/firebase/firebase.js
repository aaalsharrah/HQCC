// app/lib/firebase.js
import { getStorage } from 'firebase/storage';

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// ✅ Safari-safe: ensure we always end up with a known persistence mode
export const persistenceReady = (async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    return "local";
  } catch (e1) {
    try {
      await setPersistence(auth, browserSessionPersistence);
      return "session";
    } catch (e2) {
      await setPersistence(auth, inMemoryPersistence);
      return "memory";
    }
  }
})();
export const db = getFirestore(app);
export const storage = getStorage(app);
