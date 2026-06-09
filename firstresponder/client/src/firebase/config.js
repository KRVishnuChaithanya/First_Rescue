import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase Safely
let app;
let db = null;
let auth = null;
let realtimeDb = null;
let storage = null;
let messaging = null;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    realtimeDb = getDatabase(app);
    storage = getStorage(app);
    
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.log("FCM not supported on this browser.");
    }
  } else {
    console.warn("Firebase API Key missing! Please create a .env file with your Firebase config. Running in Demo Mode.");
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export { db, auth, realtimeDb, storage, messaging };
