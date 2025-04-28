// services/authService.js
// This service handles all Firebase Authentication related operations.

// Make sure '../firebase' correctly initializes and exports your Firebase app and auth instance (using v9 syntax).
// It should also export 'db' and 'storage' if you plan to use them directly in authService (though less common)
import { auth } from '../firebase';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  // Import other auth functions if needed (e.g., sendEmailVerification, updateProfile)
} from 'firebase/auth';

// --- IMPORTANT ---
// Import the Firestore saving function from your data service.
// Assuming dataService.js is in the same 'services' directory.
import { saveUserProfile } from './dataService';

/**
 * Registers a new user with email and password and creates their profile in Firestore.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} fullName - The user's full name. <-- Added
 * @param {string} phoneNumber - The user's phone number (with prefix). <-- Added
 * @returns {Promise<object>} - A promise that resolves with the Firebase User object on success.
 * @throws {FirebaseError} - Throws a Firebase Auth error if registration fails (e.g., invalid email, weak password).
 * @throws {Error} - Throws a generic error if the Firestore profile save fails after Auth registration.
 */
const register = async (email, password, fullName, phoneNumber) => { // <-- Added fullName, phoneNumber params
  try {
    console.log('Attempting Firebase registration for:', email);

    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Firebase registration successful for user UID:', user.uid);

    // 2. --- NEW CRITICAL STEP: Save initial user profile to Firestore ---
    // Call the function from dataService to create the user document in the 'users' collection.
    // We use the user's UID as the document ID and store initial data including new fields.
    try {
         await saveUserProfile(user.uid, {
             email: user.email, // Store the email from auth
             fullName: fullName, // Store the full name from input <-- Added
             phoneNumber: phoneNumber, // Store the phone number from input <-- Added
             // Add any other default fields you want for a new user profile here
             // Example: settings: { theme: 'system', language: 'en' },
             // Example: role: 'user',
         });
         console.log('User profile document created in Firestore for UID:', user.uid);
    } catch (firestoreError) {
         console.error('Error saving user profile to Firestore after Auth registration:', firestoreError);
         // Re-throw a *new* error indicating the profile save failed.
         // This allows the calling screen to distinguish between auth errors and profile save errors.
         // Consider adding a specific error code if you need more granular handling.
         throw new Error(`Profile save failed after successful registration: ${firestoreError.message}`);
         // If you prefer to let the registration screen only worry about Auth errors,
         // you could instead just log the error and *not* re-throw here.
    }
    // --------------------------------------------------------------------

    // You might want to immediately send an email verification here (optional):
    // if (user && !user.emailVerified) {
    //    await sendEmailVerification(user);
    //    console.log('Email verification sent to:', user.email);
    // }

    return user; // Return the Firebase User object

  } catch (error) {
    // This catch block primarily handles errors from createUserWithEmailAndPassword
    // and potentially the re-thrown error from the firestore save catch block.
    console.error('Firebase registration error:', error.code || 'unknown', error.message);

    // Re-throw the error. The calling component (RegisterScreen) will catch this.
    // It could be a Firebase Auth error or the generic error thrown above if Firestore saving failed.
    throw error;
  }
};

/**
 * Logs in an existing user with email and password.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - A promise that resolves with the Firebase User object on success.
 * @throws {FirebaseError} - Throws a Firebase Auth error if login fails.
 */
const login = async (email, password) => {
  try {
    console.log('Attempting Firebase login for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // Get the User object
    console.log('Firebase login successful for user UID:', user.uid);

    // Optional: You might want to fetch the user's profile data from Firestore here
    // and potentially update the AuthContext state with the combined data.
    // This could be done in AuthContext's onAuthStateChanged listener as well.
    // const userProfile = await getUserProfile(user.uid); // Assuming you have getUserProfile in dataService
    // return { user, profile: userProfile }; // Return combined data

    return user; // Return the Firebase User object
  } catch (error) {
    console.error('Firebase login error:', error.code, error.message);
    // Re-throw the error for component handling (LoginScreen)
    throw error;
  }
};

/**
 * Logs out the current user.
 * @returns {Promise<void>} - A promise that resolves when logout is complete.
 * @throws {FirebaseError} - Throws a Firebase Auth error if logout fails.
 */
const logout = async () => {
  try {
    console.log('Attempting Firebase logout...');
    await signOut(auth);
    console.log('Firebase logout successful.');
  } catch (error) {
    console.error('Firebase logout error:', error.code, error.message);
    // Re-throw the error for component handling
    throw error;
  }
};

/**
 * Sends a password reset email to the specified email address.
 * @param {string} email - The email address to send the reset link to.
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 * @throws {FirebaseError} - Throws a Firebase Auth error if sending fails.
 */
const resetPassword = async (email) => {
  try {
    console.log('Attempting to send password reset email to:', email);
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent successfully.');
  } catch (error) {
    console.error('Firebase password reset error:', error.code, error.message);
     // Re-throw the error for component handling
    throw error;
  }
};

// TODO: Add functions for social logins (Google, Facebook, etc.)
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// const signInWithGoogle = async () => { ... }


export {
  register, // Export the updated register function
  login,
  logout,
  resetPassword,
  // signInWithGoogle, // Export social login functions when implemented
};