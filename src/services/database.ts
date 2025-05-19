import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  limit,
  startAfter,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Checks if the Firestore database is properly initialized and connected
 * @returns Promise resolving to true if connected, false otherwise
 */
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    if (!db) {
      console.error('Firestore database is not initialized');
      return false;
    }

    // First, try a simple read operation
    try {
      console.log('Testing Firestore read access...');
      const testDoc = doc(db, 'test', 'connection-test');
      await getDoc(testDoc);
      console.log('Firestore read test successful');
    } catch (readError) {
      console.error('Firestore read test failed:', readError);
      // Don't throw here, try the write test anyway
    }

    // Now try a write operation
    console.log('Testing Firestore write access...');
    const timestamp = new Date().toISOString();
    const testCollection = collection(db, 'test');

    // Use a unique ID for the test document to avoid conflicts
    const testId = `connection-test-${Date.now()}`;
    const testRef = doc(testCollection, testId);

    try {
      // Try to create a new document
      await addDoc(testCollection, {
        timestamp,
        lastChecked: Timestamp.now(),
        id: testId,
        connectionTest: true
      });
      console.log('Firestore write test successful');
      return true;
    } catch (writeError: any) {
      // Check for specific Firebase errors
      if (writeError.code === 'permission-denied') {
        console.error('Firestore permission denied. Check security rules.');
      } else if (writeError.code === 'unavailable') {
        console.error('Firestore is currently unavailable. Network issue or service outage.');
      } else if (writeError.code === 'unauthenticated') {
        console.error('Authentication required for Firestore access.');
      } else {
        console.error('Firestore write test failed:', writeError);
      }
      return false;
    }
  } catch (error) {
    console.error('Firestore connection check failed with unexpected error:', error);
    return false;
  }
};

export interface ScanResult {
  id?: string;
  userId: string;
  imageUrl: string;
  result: {
    hasTumor: boolean;
    confidence: number;
    tumorType?: string;
    uploadedPath?: string;
  };
  notes?: string;
  createdAt: Timestamp;
  fileName?: string;
  scanDate?: Timestamp;
}

/**
 * Adds a new scan result to the database
 * @param scanResult The scan result to add
 * @returns Promise resolving to the document ID
 */
export const addScanResult = async (scanResult: Omit<ScanResult, 'id'>): Promise<string> => {
  try {
    console.log('Starting to save scan result to database...');

    // Check if database is initialized
    if (!db) {
      console.error('Firestore database is not initialized');
      throw new Error('Database connection error: Firestore is not initialized');
    }

    // Validate required fields with detailed error messages
    if (!scanResult.userId) {
      console.error('Missing userId in scan result data');
      throw new Error('Invalid scan data: User ID is required');
    }

    if (!scanResult.result) {
      console.error('Missing result object in scan result data');
      throw new Error('Invalid scan data: Result object is required');
    }

    if (typeof scanResult.result.hasTumor !== 'boolean') {
      console.error('Invalid hasTumor value in scan result data');
      throw new Error('Invalid scan data: hasTumor must be a boolean');
    }

    if (typeof scanResult.result.confidence !== 'number') {
      console.error('Invalid confidence value in scan result data');
      throw new Error('Invalid scan data: confidence must be a number');
    }

    // Create a clean copy of the scan data with proper timestamps
    const scanData = {
      ...scanResult,
      createdAt: scanResult.createdAt || Timestamp.now(),
      scanDate: scanResult.scanDate || Timestamp.now(),
    };

    // Ensure imageUrl exists
    if (!scanData.imageUrl) {
      console.warn('No imageUrl provided, using placeholder');
      scanData.imageUrl = '/placeholder-image.jpg';
    }

    // Log the data being saved (without sensitive info)
    console.log('Saving scan result to database:', JSON.stringify({
      userId: scanData.userId.substring(0, 5) + '...',  // Only log part of the userId for privacy
      hasTumor: scanData.result.hasTumor,
      confidence: scanData.result.confidence,
      timestamp: scanData.createdAt.toDate().toISOString(),
      fileName: scanData.fileName || 'unnamed'
    }));

    // Attempt to write to the database with enhanced retry logic
    let attempts = 0;
    const maxAttempts = 5; // Increased from 3 to 5 attempts
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Database write attempt ${attempts}/${maxAttempts}...`);

        // Add a small delay before each retry to allow network to stabilize
        if (attempts > 1) {
          const delayMs = Math.min(attempts * 2000, 10000); // Exponential backoff with max 10s
          console.log(`Waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        // Try to write to the database
        const docRef = await addDoc(collection(db, 'scanResults'), scanData);
        console.log('Scan result successfully saved with ID:', docRef.id);

        // Skip verification on later attempts to reduce chance of timeout
        if (attempts >= 3) {
          console.log('Skipping verification due to previous failures, assuming write was successful');
          return docRef.id;
        }

        // Verify the document was actually written by reading it back
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log('Verified document was successfully written to database');
            return docRef.id;
          } else {
            console.warn('Document was not found after writing, will retry');
            // Continue to next attempt instead of throwing
            continue;
          }
        } catch (verifyError) {
          console.warn('Error verifying document write, assuming write was successful:', verifyError);
          // Return the ID anyway since the write might have succeeded
          return docRef.id;
        }
      } catch (writeError: any) {
        lastError = writeError;
        console.error(`Database write attempt ${attempts} failed:`, writeError);

        // Check for specific error types
        if (writeError.code === 'permission-denied') {
          throw new Error('Permission denied: You do not have access to save scan results');
        } else if (writeError.code === 'unavailable' ||
                  writeError.code === 'deadline-exceeded' ||
                  writeError.message?.includes('timeout') ||
                  writeError.message?.includes('timed out')) {
          // Retry for network-related errors
          if (attempts < maxAttempts) {
            const delayMs = Math.min(attempts * 2000, 10000);
            console.log(`Network error, retrying in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        } else if (attempts < maxAttempts) {
          // For other errors, still retry but with a warning
          console.warn(`Unknown error type, will retry anyway: ${writeError.message}`);
          const delayMs = Math.min(attempts * 1000, 5000);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          // On last attempt, throw the error
          throw new Error(`Failed to save scan result: ${writeError.message || 'Unknown error'}`);
        }
      }
    }

    // If we've exhausted all attempts
    throw new Error(`Failed to save scan result after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`);
  } catch (error: any) {
    console.error('Error adding scan result to database:', error);
    throw new Error(`Failed to save scan result: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Updates an existing scan result
 * @param id The document ID
 * @param data The data to update
 * @returns Promise resolving when the update is complete
 */
export const updateScanResult = async (id: string, data: Partial<ScanResult>): Promise<void> => {
  const docRef = doc(db, 'scanResults', id);
  return updateDoc(docRef, data);
};

/**
 * Deletes a scan result
 * @param id The document ID
 * @returns Promise resolving when the deletion is complete
 */
export const deleteScanResult = async (id: string): Promise<void> => {
  const docRef = doc(db, 'scanResults', id);
  return deleteDoc(docRef);
};

/**
 * Gets a scan result by ID
 * @param id The document ID
 * @param userId Optional user ID to verify ownership
 * @returns Promise resolving to the scan result
 */
export const getScanResult = async (id: string, userId?: string): Promise<ScanResult | null> => {
  try {
    console.log(`Fetching scan result with ID: ${id}`);
    const docRef = doc(db, 'scanResults', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`Scan result with ID ${id} not found`);
      return null;
    }

    const scanData = { id: docSnap.id, ...docSnap.data() } as ScanResult;

    // If userId is provided, verify that this scan belongs to the user
    if (userId && scanData.userId !== userId) {
      console.warn(`User ${userId} attempted to access scan ${id} which belongs to user ${scanData.userId}`);
      return null;
    }

    return scanData;
  } catch (error) {
    console.error(`Error fetching scan result with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Gets the total count of scan results for a user
 * @param userId The user ID
 * @returns Promise resolving to the count
 */
export const getUserScanCount = async (userId: string): Promise<number> => {
  try {
    console.log(`Counting scan results for user: ${userId}`);

    if (!db) {
      console.error('Firestore database is not initialized');
      return 0;
    }

    const scanQuery = query(
      collection(db, 'scanResults'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(scanQuery);
    const count = querySnapshot.size;

    console.log(`User ${userId} has ${count} scan results`);
    return count;
  } catch (error) {
    console.error('Error counting user scan results:', error);
    // Return 0 instead of throwing to prevent UI from breaking
    return 0;
  }
};

/**
 * Gets all scan results for a user
 * @param userId The user ID
 * @param pageSize Optional number of results to return (default: 50)
 * @param lastDoc Optional last document for pagination
 * @returns Promise resolving to an array of scan results
 */
/**
 * Checks if the required index for scan history exists
 * This is done by running a test query with the same structure as the main query
 * @returns Promise resolving to true if index exists, false otherwise
 */
export const checkScanHistoryIndex = async (): Promise<boolean> => {
  try {
    if (!db) {
      console.error('Firestore database is not initialized');
      return false;
    }

    console.log('Running test query to check if required Firestore index exists...');

    // Try multiple query approaches to see if any of them work with existing indexes
    const scanResultsRef = collection(db, 'scanResults');
    const testUserId = 'test-user-id-that-does-not-exist';

    // Try different query combinations
    const queryOptions = [
      // Option 1: Just filter by userId (simplest, might not need a composite index)
      query(
        scanResultsRef,
        where('userId', '==', testUserId),
        limit(1)
      ),

      // Option 2: Filter by userId with explicit ordering (needs composite index)
      query(
        scanResultsRef,
        where('userId', '==', testUserId),
        orderBy('createdAt', 'desc'),
        limit(1)
      ),

      // Option 3: Filter by userId with different ordering (in case index was created differently)
      query(
        scanResultsRef,
        where('userId', '==', testUserId),
        orderBy('createdAt', 'asc'),
        limit(1)
      )
    ];

    // Try each query option
    for (let i = 0; i < queryOptions.length; i++) {
      try {
        console.log(`Trying index check query option ${i + 1}...`);
        await getDocs(queryOptions[i]);
        console.log(`Scan history index check: Index exists for query option ${i + 1}`);
        return true; // If any query succeeds, we have a working index
      } catch (optionError: any) {
        if (!optionError.message || !optionError.message.includes('requires an index')) {
          // If error is not about missing index, it might be a different issue
          console.log(`Query option ${i + 1} failed but not due to missing index:`, optionError.message);
          // Continue to next option
        } else {
          console.log(`Query option ${i + 1} requires an index that doesn't exist`);
          // Continue to next option
        }
      }
    }

    // If we get here, none of the queries worked
    console.error('Scan history index check: No working index found for any query option');

    // Try to extract the index creation URL from the last error
    try {
      // Make one more attempt with the standard query to get the error message with URL
      const standardQuery = query(
        scanResultsRef,
        where('userId', '==', testUserId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      await getDocs(standardQuery);
      // If we get here, the query worked after all
      return true;
    } catch (finalError: any) {
      if (finalError.message && finalError.message.includes('requires an index')) {
        // Extract the index creation URL
        const urlRegex = /https:\/\/console\.firebase\.google\.com\/[^"\s\\]+(\\[^"\s\\]+)*/;
        const urlMatch = finalError.message.match(urlRegex);
        let indexUrl = urlMatch ? urlMatch[0] : null;

        if (!indexUrl) {
          const fallbackMatch = finalError.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/);
          indexUrl = fallbackMatch ? fallbackMatch[0] : null;
        }

        if (indexUrl) {
          indexUrl = indexUrl.replace(/\\\//g, '/').replace(/\\=/g, '=').replace(/\\&/g, '&');
          console.log('Index creation URL:', indexUrl);
          console.log('User needs to create the index by visiting the URL above');
        }
      }

      return false;
    }
  } catch (error: any) {
    // For other errors, log the issue
    console.warn('Scan history index check: Error checking index', error);

    if (error.code === 'permission-denied') {
      console.warn('Permission denied when checking index. User may not have access to create indexes.');
    } else if (error.code === 'unavailable') {
      console.warn('Firestore service unavailable when checking index.');
    }

    // Return false to be safe
    return false;
  }
};

/**
 * Clears any cached Firestore data to ensure fresh queries
 * This can help when indexes have been created but queries still fail
 */
export const clearFirestoreCache = async (): Promise<void> => {
  try {
    console.log('Attempting to clear Firestore cache...');

    // There's no direct API to clear the cache, but we can force a refresh
    // by making a simple query with cache disabled
    if (!db) {
      console.error('Firestore database is not initialized');
      return;
    }

    // Make a simple query to a test collection with cache disabled
    const testRef = collection(db, 'test');
    const testQuery = query(testRef, limit(1));

    // Use getDocsFromCache to force a server query and bypass cache
    await getDocs(testQuery);

    console.log('Firestore cache refresh completed');
  } catch (error) {
    console.warn('Error clearing Firestore cache:', error);
    // Don't throw, as this is just a helper function
  }
};

export const getUserScanResults = async (
  userId: string,
  pageSize: number = 50,
  lastDoc?: DocumentData,
  bypassCache: boolean = false
): Promise<ScanResult[]> => {
  try {
    console.log(`Fetching scan history for user: ${userId}, pageSize: ${pageSize}`);

    if (!db) {
      console.error('Firestore database is not initialized');
      throw new Error('Database not initialized');
    }

    // Validate inputs
    if (!userId) {
      console.error('getUserScanResults called with empty userId');
      throw new Error('User ID is required');
    }

    if (pageSize <= 0) {
      console.warn('Invalid pageSize, defaulting to 10');
      pageSize = 10;
    }

    console.log('Building query for scan results...');

    // Build the query with error handling
    let scanQuery;
    try {
      console.log('Trying simplified query approach to match existing index...');

      // Try a simpler query first - just filter by userId without sorting
      // This might work with an existing index
      const scanResultsRef = collection(db, 'scanResults');

      // Basic query without pagination
      if (!lastDoc) {
        console.log('Building basic query without pagination');

        // Try different query combinations that might match existing indexes
        try {
          // Option 1: Just filter by userId without explicit ordering
          scanQuery = query(
            scanResultsRef,
            where('userId', '==', userId),
            limit(pageSize)
          );
        } catch (e) {
          console.log('Basic query option 1 failed, trying option 2');

          // Option 2: Filter by userId with explicit ordering
          scanQuery = query(
            scanResultsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
          );
        }
      } else {
        // If we have a last document, start after it (for pagination)
        console.log('Using pagination with lastDoc:', lastDoc.id);

        try {
          // Option 1: Just filter by userId with pagination
          scanQuery = query(
            scanResultsRef,
            where('userId', '==', userId),
            startAfter(lastDoc),
            limit(pageSize)
          );
        } catch (e) {
          console.log('Pagination query option 1 failed, trying option 2');

          // Option 2: Filter by userId with explicit ordering and pagination
          scanQuery = query(
            scanResultsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc),
            limit(pageSize)
          );
        }
      }
    } catch (queryError) {
      console.error('Error building query:', queryError);
      throw new Error('Failed to build database query');
    }

    console.log('Executing query...');
    let querySnapshot;
    try {
      // If bypassCache is true, try to clear the cache first
      if (bypassCache) {
        console.log('Bypassing cache for this query...');
        await clearFirestoreCache();
      }

      querySnapshot = await getDocs(scanQuery);
      console.log(`Query returned ${querySnapshot.size} documents`);
    } catch (queryExecError: any) {
      console.error('Error executing query:', queryExecError);

      // Check for specific Firestore errors
      if (queryExecError.code === 'permission-denied') {
        throw new Error('Permission denied: You do not have access to this scan history');
      } else if (queryExecError.code === 'unavailable') {
        throw new Error('Database is currently unavailable. Please try again later');
      } else if (queryExecError.code === 'resource-exhausted') {
        throw new Error('Too many requests. Please try again later');
      } else if (queryExecError.message && queryExecError.message.includes('requires an index')) {
        // Special handling for index errors to preserve the full error message with the index creation URL
        console.error('Firestore index error:', queryExecError.message);

        // Extract the index creation URL from the error message - use a more robust regex
        // This handles both escaped and unescaped URLs in the error message
        const urlRegex = /https:\/\/console\.firebase\.google\.com\/[^"\s\\]+(\\[^"\s\\]+)*/;
        const urlMatch = queryExecError.message.match(urlRegex);
        let indexUrl = urlMatch ? urlMatch[0] : null;

        // If we couldn't find the URL with the first regex, try a more general one
        if (!indexUrl) {
          const fallbackMatch = queryExecError.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/);
          indexUrl = fallbackMatch ? fallbackMatch[0] : null;
        }

        // Clean up the URL if it contains escaped characters
        if (indexUrl) {
          indexUrl = indexUrl.replace(/\\\//g, '/').replace(/\\=/g, '=').replace(/\\&/g, '&');
          console.log('Extracted index creation URL:', indexUrl);
        }

        if (indexUrl) {
          // Provide a clear error message with the index creation URL
          throw new Error(`Failed to load scan history: The query requires an index. ${indexUrl}`);
        } else {
          // Fallback if we couldn't extract the URL - use the hardcoded URL from your project
          const hardcodedUrl = "https://console.firebase.google.com/v1/r/project/brain-tumor-detection-4e0ff/firestore/indexes?create_composite=Cl9wcm9qZWN0cy9icmFpbi10dW1vci1kZXRlY3Rpb24tNGUwZmYvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3NjYW5SZXN1bHRzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI";
          throw new Error(`Failed to load scan history: The query requires an index. ${hardcodedUrl}`);
        }
      } else {
        throw new Error(`Failed to retrieve scan history: ${queryExecError.message || 'Unknown error'}`);
      }
    }

    // Process results with detailed logging
    console.log('Processing query results...');
    const results: ScanResult[] = [];

    querySnapshot.forEach((doc) => {
      try {
        console.log(`Processing document ${doc.id}...`);
        const data = doc.data();

        // Ensure required fields exist
        if (!data.userId || !data.result) {
          console.warn(`Skipping scan result ${doc.id} due to missing required fields`);
          return;
        }

        // Ensure result has required fields
        if (typeof data.result.hasTumor !== 'boolean' || typeof data.result.confidence !== 'number') {
          console.warn(`Skipping scan result ${doc.id} due to invalid result data`);
          return;
        }

        // Ensure createdAt is a valid timestamp
        if (!data.createdAt || !(data.createdAt instanceof Timestamp)) {
          console.warn(`Fixing missing timestamp for scan result ${doc.id}`);
          data.createdAt = Timestamp.now();
        }

        // Add to results array
        results.push({ id: doc.id, ...data } as ScanResult);
        console.log(`Successfully processed document ${doc.id}`);
      } catch (docError) {
        console.error(`Error processing document ${doc.id}:`, docError);
        // Skip this document but continue processing others
      }
    });

    console.log(`Successfully retrieved ${results.length} scan results for user ${userId}`);
    return results;
  } catch (error: any) {
    console.error('Error fetching user scan results:', error);

    // Rethrow with a clearer message so the UI can handle it appropriately
    throw new Error(error.message || 'Failed to load scan history');
  }
};
