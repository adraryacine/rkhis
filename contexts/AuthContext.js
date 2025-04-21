// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // Ensure this path is correct to your firebase initialization
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '../services/dataService'; // Import the function to fetch user data

// Define the structure of the context value
const AuthContext = createContext({
  currentUser: null, // Firebase Auth user object (null if logged out)
  isLoadingAuth: true, // True while checking initial auth state
  userData: null, // Additional profile data from Firestore/database
});

// Custom hook to easily access the AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and manages auth state
// --- Change this from named export to default export ---
const AuthProvider = ({ children }) => { // Keep the function definition name
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userData, setUserData] = useState(null); // State for additional user data

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false); // Authentication state is now known

      // If a user is logged in, fetch their additional profile data
      if (user) {
        console.log(`Auth state changed: User logged in (${user.uid}). Fetching user data...`);
        try {
          const data = await getUserProfile(user.uid); // Call dataService function
          setUserData(data);
          console.log("User data fetched:", data);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUserData(null); // Set to null if fetching fails
        }
      } else {
        console.log("Auth state changed: User logged out.");
        setUserData(null); // Clear user data on logout
      }
    });

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []); // Empty dependency array means this effect runs only once on mount and cleans up on unmount

  // The value provided to consumers of the context
  const value = {
    currentUser,
    isLoadingAuth,
    userData,
    // You can add login, register, logout functions here,
    // or keep them in authService and use them directly in screens.
    // Keeping them in authService is often cleaner.
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Export AuthProvider as the default export ---
export default AuthProvider; // <-- Changed export statement