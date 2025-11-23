import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

// Direct access to env vars - Next.js replaces process.env.NEXT_PUBLIC_* at build time
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

let analyticsPromise: Promise<Analytics | undefined> | null = null;

const getAnalyticsInstance = (): Promise<Analytics | undefined> => {
  if (!analyticsPromise) {
    analyticsPromise =
      typeof window === 'undefined'
        ? Promise.resolve(undefined)
        : isSupported()
            .then((supported) => (supported ? getAnalytics(app) : undefined))
            .catch(() => undefined);
  }

  return analyticsPromise;
};

export { app, auth, firestore, getAnalyticsInstance };

