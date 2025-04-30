const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');
const firebaseConfig = require('../firebase.js');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const removeMockData = async () => {
  try {
    const collections = ['hotels', 'restaurants', 'attractions', 'hikingTrails'];
    
    for (const collectionName of collections) {
      console.log(`Removing ${collectionName}...`);
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
      }
      
      console.log(`Successfully removed all ${collectionName}`);
    }
    
    console.log('All mock data removed successfully!');
  } catch (error) {
    console.error('Error removing mock data:', error);
  }
};

removeMockData(); 