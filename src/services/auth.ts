import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

/**
 * Registers a new user with email and password
 * @param email User's email
 * @param password User's password
 * @param displayName User's display name
 * @returns Promise resolving to the user
 */
export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw new Error(error.message || 'Failed to register');
  }
};

/**
 * Signs in a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Promise resolving to the user
 */
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw new Error(error.message || 'Failed to login');
  }
};

/**
 * Signs in a user with Google
 * @returns Promise resolving to the user
 */
export const loginWithGoogle = async (): Promise<User> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error logging in with Google:', error);
    throw new Error(error.message || 'Failed to login with Google');
  }
};

/**
 * Signs out the current user
 * @returns Promise resolving when sign out is complete
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error logging out:', error);
    throw new Error(error.message || 'Failed to logout');
  }
};

/**
 * Sends a password reset email
 * @param email User's email
 * @returns Promise resolving when the email is sent
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
};
