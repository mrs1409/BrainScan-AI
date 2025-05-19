import React, { useEffect, useState } from 'react';
import { app, auth, db, storage } from './services/firebase';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking Firebase...');
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check environment variables
    const vars = {
      VITE_FIREBASE_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_AUTH_DOMAIN: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      VITE_FIREBASE_PROJECT_ID: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_STORAGE_BUCKET: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      VITE_FIREBASE_MESSAGING_SENDER_ID: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      VITE_FIREBASE_APP_ID: !!import.meta.env.VITE_FIREBASE_APP_ID,
      VITE_FIREBASE_MEASUREMENT_ID: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
    setEnvVars(vars);

    try {
      console.log('Firebase app:', app);
      console.log('Firebase auth:', auth);
      console.log('Firebase db:', db);
      console.log('Firebase storage:', storage);

      if (app) {
        setStatus('Firebase initialized successfully!');
      } else {
        setStatus('Firebase app is undefined');
      }
    } catch (err: any) {
      console.error('Error testing Firebase:', err);
      setError(err.message || 'An error occurred while testing Firebase');
      setStatus('Firebase initialization failed');
    }
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Firebase Test</h1>

      <div className={`p-4 rounded-md mb-4 ${
        error ? 'bg-red-100 text-red-700' :
        status.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
      }`}>
        <p className="font-medium">{status}</p>
        {error && <p className="mt-2 text-sm">{error}</p>}
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
          {Object.entries(envVars).map(([key, value]) => (
            `${key}: ${value ? '✓ (Set)' : '✗ (Not set)'}\n`
          ))}
        </pre>
      </div>

      <div className="mt-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default FirebaseTest;
