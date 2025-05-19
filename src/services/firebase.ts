import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc
} from 'firebase/firestore';
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
let firebaseInitialized = false;

// Function to validate Firebase config
const isValidFirebaseConfig = () => {
  return (
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.storageBucket &&
    !!firebaseConfig.appId
  );
};

try {
  // Check if all required Firebase config values are available
  if (isValidFirebaseConfig()) {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      try {
        // Initialize Firebase with retry logic
        console.log('Initializing Firebase app...');
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized successfully');
      } catch (initError) {
        console.error('Error initializing Firebase app:', initError);
        throw initError;
      }
    } else {
      console.log('Firebase app already initialized, retrieving instance');
      app = getApps()[0];
    }

    try {
      // Initialize services with explicit error handling
      console.log('Initializing Firebase services...');
      auth = getAuth(app);
      storage = getStorage(app);
      db = getFirestore(app);
      console.log('Firebase services initialized successfully');

      // Initialize analytics only if supported
      analytics = (async () => {
        try {
          if (await isSupported()) {
            return getAnalytics(app!);
          }
        } catch (analyticsError) {
          console.warn('Analytics initialization failed:', analyticsError);
        }
        return null;
      })();

      // Set initialization flag to true only after all services are initialized
      firebaseInitialized = true;
      console.log('Firebase initialized successfully with config:',
        JSON.stringify({
          apiKey: firebaseConfig.apiKey?.substring(0, 5) + '...',
          authDomain: firebaseConfig.authDomain,
          projectId: firebaseConfig.projectId,
        })
      );
    } catch (serviceError) {
      console.error('Error initializing Firebase services:', serviceError);
      firebaseInitialized = false;
      throw serviceError;
    }
  } else {
    console.warn('Firebase configuration is incomplete. Using mock implementations.');
    auth = mockAuth;
    storage = mockStorage;
    db = mockFirestore;
    firebaseInitialized = false;
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  auth = mockAuth;
  storage = mockStorage;
  db = mockFirestore;
  firebaseInitialized = false;
}

/**
 * Attempts to reinitialize Firebase if it failed to initialize previously
 * @returns Promise resolving to true if reinitialization was successful
 */
export const reinitializeFirebase = async (): Promise<boolean> => {
  if (firebaseInitialized) {
    console.log('Firebase is already initialized');
    return true;
  }

  console.log('Attempting to reinitialize Firebase...');

  try {
    // Check if config is valid
    if (!isValidFirebaseConfig()) {
      console.error('Cannot reinitialize Firebase: Invalid configuration');
      return false;
    }

    // Reinitialize app if needed
    if (!app) {
      app = initializeApp(firebaseConfig);
    }

    // Reinitialize services
    auth = getAuth(app);
    storage = getStorage(app);
    db = getFirestore(app);

    // Test connection
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, {
      timestamp: new Date().toISOString(),
      connectionTest: true,
      reconnectAttempt: Date.now()
    });

    if (testDoc.id) {
      console.log('Firebase reinitialization successful');
      firebaseInitialized = true;
      return true;
    } else {
      console.error('Firebase reinitialization failed: Could not write to database');
      return false;
    }
  } catch (error) {
    console.error('Firebase reinitialization failed:', error);
    return false;
  }
};

// Export Firebase services
export { auth, storage, db, app };
export const googleProvider = new GoogleAuthProvider();
export { analytics };
export { firebaseInitialized };

export default app;
