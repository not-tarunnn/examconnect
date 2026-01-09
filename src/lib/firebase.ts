import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAI } from "firebase/ai";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
};

// Initialize Firebase (Singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth instance
const auth = getAuth(app);

// Firestore instance
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

// Realtime Database
const rtdb = getDatabase(app);

// Firebase Storage
const storage = getStorage(app);

// Firebase AI
const ai = getAI(app);

// OAuth Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/fitness.sleep.read");
googleProvider.addScope("profile");
googleProvider.addScope("email");

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("public_profile");
facebookProvider.addScope("email");

const twitterProvider = new TwitterAuthProvider();

const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

// Ensure auth session persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Failed to set auth persistence:", err);
});

// -------------------------------------------
// 🚀 Firebase Cloud Messaging (FCM) Support
// -------------------------------------------
let messaging: any = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

// -------------------------------------------
// Export everything
// -------------------------------------------
export {
  auth,
  db,
  rtdb,
  storage,
  ai,
  googleProvider,
  facebookProvider,
  twitterProvider,
  appleProvider,
  messaging,
  app,
};
