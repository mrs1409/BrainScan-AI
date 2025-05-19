// Simple script to test the Firestore index functionality
// Run this with Node.js to check if the index exists

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} = require('firebase/firestore');

// Firebase configuration - replace with your own values
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to check if the required index exists
async function checkScanHistoryIndex() {
  try {
    console.log('Running test query to check if required Firestore index exists...');
    
    // Create a test query with the same structure as the main query
    // but with a non-existent userId to avoid returning actual data
    const testQuery = query(
      collection(db, 'scanResults'),
      where('userId', '==', 'test-user-id-that-does-not-exist'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    // Try to execute the query
    await getDocs(testQuery);

    // If we get here, the index exists
    console.log('✅ SUCCESS: Scan history index exists and is properly configured');
    return true;
  } catch (error) {
    // Check if the error is about missing index
    if (error.message && error.message.includes('requires an index')) {
      console.error('❌ ERROR: Scan history index does not exist');
      
      // Extract the index creation URL from the error message
      const urlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/);
      const indexUrl = urlMatch ? urlMatch[0] : null;
      
      if (indexUrl) {
        console.log('Index creation URL:', indexUrl);
        console.log('To fix this issue, visit the URL above and create the index');
      }
      
      return false;
    }

    // For other errors, log the issue
    console.warn('⚠️ WARNING: Error checking index', error);
    
    if (error.code === 'permission-denied') {
      console.warn('Permission denied when checking index. You may not have access to create indexes.');
    } else if (error.code === 'unavailable') {
      console.warn('Firestore service unavailable when checking index.');
    }
    
    return false;
  }
}

// Run the check
checkScanHistoryIndex()
  .then(indexExists => {
    console.log(`Index check complete. Index exists: ${indexExists}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Unexpected error during index check:', error);
    process.exit(1);
  });
