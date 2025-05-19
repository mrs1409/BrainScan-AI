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
} from 'firebase/firestore';
import { db } from './firebase';

export interface ScanResult {
  id?: string;
  userId: string;
  imageUrl: string;
  result: {
    hasTumor: boolean;
    confidence: number;
    tumorType?: string;
  };
  notes?: string;
  createdAt: Timestamp;
}

/**
 * Adds a new scan result to the database
 * @param scanResult The scan result to add
 * @returns Promise resolving to the document ID
 */
export const addScanResult = async (scanResult: Omit<ScanResult, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'scanResults'), scanResult);
  return docRef.id;
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
 * @returns Promise resolving to the scan result
 */
export const getScanResult = async (id: string): Promise<ScanResult | null> => {
  const docRef = doc(db, 'scanResults', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ScanResult;
  }

  return null;
};

/**
 * Gets all scan results for a user
 * @param userId The user ID
 * @returns Promise resolving to an array of scan results
 */
export const getUserScanResults = async (userId: string): Promise<ScanResult[]> => {
  const q = query(
    collection(db, 'scanResults'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const results: ScanResult[] = [];

  querySnapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() } as ScanResult);
  });

  return results;
};
