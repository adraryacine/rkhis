// authService.js
import { auth } from '../firebase'; // Make sure this path is correct to your firebase initialization file
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  // Import other auth functions if needed (e.g., sendEmailVerification)
} from 'firebase/auth';

// Function to register a new user with email and password
const register = async (email, password) => {
  try {
    console.log('Attempting Firebase registration for:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Firebase registration successful for user:', userCredential.user.uid);
    // You might want to immediately send an email verification here:
    // await sendEmailVerification(userCredential.user);
    return userCredential.user; // Return the Firebase User object
  } catch (error) {
    console.error('Firebase registration error:', error.code, error.message);
    // Re-throw the error so the calling component can handle it (e.g., display error message)
    throw error;
  }
};

// Function to log in an existing user with email and password
const login = async (email, password) => {
  try {
    console.log('Attempting Firebase login for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase login successful for user:', userCredential.user.uid);
    return userCredential.user; // Return the Firebase User object
  } catch (error) {
    console.error('Firebase login error:', error.code, error.message);
    // Re-throw the error for component handling
    throw error;
  }
};

// Function to log out the current user
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

// Function to send a password reset email
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
  register,
  login,
  logout,
  resetPassword,
  // signInWithGoogle, // Export social login functions when implemented
};