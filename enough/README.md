# Enough

A low-pressure daily check-in across 12 wellbeing items. Swipe through them
once a day, then look back at a calm 3-month grid to see where the gaps are.
No streaks, no goals, no scores — just noticing.

Everything runs in the browser. All data lives in local storage by default.
Signing in with Google is optional and syncs check-ins to a Firestore
database if you've set that up (see below) — without it, the app works
exactly the same, just on-device.

## Running it

```bash
npm install
npm run dev -- --host
```

The `--host` flag exposes the dev server on your local network so you can
open it on a phone. Vite will print a `Network:` URL (something like
`http://192.168.x.x:5173/`) — open that on a phone connected to the same
Wi-Fi to try it on a real touchscreen.

## Editing the items

The 12 items live in `src/data/items.js` — each one is a plain object with
an `id`, `section`, `name`, front-of-card `front` question, and back-of-card
`back` description. Add, remove, or reorder entries there; nothing else
needs to change. Each item also has an `image` field, left `null` for now,
for dropping in a card background image later.

## Dev tools

Open the `⋯` tab in the bottom bar for two dev-only actions: filling in
three months of random test data (so the Progress grid has something to
show immediately) and resetting all stored data.

## Setting up sign-in (optional)

By default there's no account system — the Settings sheet just says so.
To turn on email/password sign-in and sync check-ins to an account, you
need a free Firebase project. Email/password was chosen over Google
Sign-In because it needs no OAuth consent screen or authorized-domain
config, and it doesn't rely on a popup window — which matters here since
the app is meant to be installed to a phone's home screen, and
`signInWithPopup`-style flows are unreliable in that standalone mode on
iOS Safari.

**1. Create the project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → give it any name → you can skip Google Analytics.

**2. Turn on email/password sign-in**
   - In the left sidebar: **Build → Authentication → Get started**.
   - Under the **Sign-in method** tab, enable **Email/Password**, save.

**3. Create the database**
   - Left sidebar: **Build → Firestore Database → Create database**.
   - Start in **production mode** (the rules below lock it down properly), pick any region.
   - Once created, go to the **Rules** tab and replace the contents with:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```
     This means each signed-in user can only ever read or write their own document — nobody else's data is reachable.

**4. Register a web app**
   - **Project settings** (gear icon) → scroll to **Your apps** → **Add app** → the `</>` (web) icon → give it a nickname → **Register app**.
   - You'll see a `firebaseConfig` object. Copy its values into a `.env.local` file in `enough/` (there's a `.env.example` template to copy):
     ```
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=...
     VITE_FIREBASE_PROJECT_ID=...
     VITE_FIREBASE_STORAGE_BUCKET=...
     VITE_FIREBASE_MESSAGING_SENDER_ID=...
     VITE_FIREBASE_APP_ID=...
     ```
   - Restart `npm run dev` after adding it. The Settings sheet should now show email/password sign-in fields, and the end of onboarding will offer the same.
   - For the deployed GitHub Pages build, add these as repository variables/secrets and pass them into the build step in `.github/workflows/deploy-enough.yml` as env vars — Firebase web config values are safe to expose publicly, so plain repo variables (not secrets) are fine.

Once configured, signing in merges whatever's already on that device with
whatever's already in the account (nothing gets overwritten), then keeps
both in sync from then on.
