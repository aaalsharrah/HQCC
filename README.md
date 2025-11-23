# HQCC

Hofstra Quantum Computing Club (HQCC) Web App. This web application powers the Hofstra Quantum Computing Club (HQCC), a student-led group committed to advancing quantum technology through exploration, hands-on building, and active collaboration.

## Getting Started

1. Install dependencies with `npm install`.
2. Copy `env.local.example` to `.env.local`.
3. Fill in the Firebase config values from the HQCC Firebase project (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, and measurementId). These values were provided in the Firebase console when the project was created.
4. Run `npm run dev` and open `http://localhost:3000`.

### Required environment variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

The site will read these values client-side, so keep your `.env.local` file out of version control.

### HQCC Firebase reference config

If you are using the existing HQCC Firebase project, the client-safe configuration is:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAYlZriET5OuHbuZMZiiMMckSW1GyzTkIc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hqcc-141ca.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hqcc-141ca
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hqcc-141ca.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=87707899718
NEXT_PUBLIC_FIREBASE_APP_ID=1:87707899718:web:0a5989c1bfc3c8a5c73747
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-43JZ8SE4SS
```

## Testing the auth + Firestore flow

1. Create `.env.local` with the Firebase values above.
2. Run `npm run dev` and open `http://localhost:3000`.
3. Scroll to the **Join** section and submit the form in **create account** mode with a valid email and password. The UI now waits for Firebase to confirm success before showing the confirmation state. A new document is written to the `members` collection in Firestore with the name, year, and major you entered.
4. Toggle to **Log in** mode and sign in with the same credentials. The nav bar will show your signed-in status along with a sign-out button.
5. (Optional) Use the nav sign-out button to confirm the session ends cleanly—status messaging will confirm once the sign-out request finishes.

These manual steps serve as a smoke test. Automated coverage can be added later with integration tests that mock the Firebase SDK.
