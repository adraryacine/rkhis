// firebase.js // <-- Assuming this is the actual name of your file
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAfSh3SXCTteP8hvwA4AGoMhjDvyOUmlTQ",
  authDomain: "rkhis-7cbf1.firebaseapp.com",
  projectId: "rkhis-7cbf1",
  storageBucket: "rkhis-7cbf1.firebasestorage.app",
  messagingSenderId: "40930843939",
  appId: "1:40930843939:web:c407263d73ef7287c54096",
  measurementId: "G-GCQ48XMP7Y"
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully."); // Optional: Add a log on success
} catch (e) {
    console.error("Firebase initialization error", e.message); //Log error properly
}


// Initialize Firebase Authentication and get a reference to the service
// Ensure app is initialized before getting auth
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
// Ensure app is initialized before getting firestore
const db = getFirestore(app);

// MODIFIED: Export app along with auth and db
export { app, auth, db }; // <--- Make sure app is listed here