import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Mock implementations for development or when Firebase config is missing
const mockAuth: Auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    callback(null);
    return () => {};
  }
} as unknown as Auth;

const mockStorage = {} as unknown as FirebaseStorage;
const mockFirestore = {} as unknown as Firestore;

// Initialize Firebase if all required config values are present
let app: FirebaseApp | undefined;
let auth: Auth;
let storage: FirebaseStorage;
let db: Firestore;
let analytics: Promise<Analytics | null> | null = null;

try {
  // Check if all required Firebase config values are available
  if (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  ) {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize services
    auth = getAuth(app);
    storage = getStorage(app);
    db = getFirestore(app);

    // Initialize analytics only if supported
    analytics = (async () => {
      if (await isSupported()) {
        return getAnalytics(app!);
      }
      return null;
    })();

    console.log('Firebase initialized successfully with config:',
      JSON.stringify({
        apiKey: firebaseConfig.apiKey?.substring(0, 5) + '...',
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
      })
    );
  } else {
    console.warn('Firebase configuration is incomplete. Using mock implementations.');
    auth = mockAuth;
    storage = mockStorage;
    db = mockFirestore;
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  auth = mockAuth;
  storage = mockStorage;
  db = mockFirestore;
}

// Export Firebase services
export { auth, storage, db, app };
export const googleProvider = new GoogleAuthProvider();
export { analytics };

export default app;
