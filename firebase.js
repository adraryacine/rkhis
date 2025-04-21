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
} catch (e) {
    console.error("Firebase initialization error", e.message); //Log error properly
}


// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, db };