import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const getHotels = async () => {
  const hotelsCollection = collection(db, 'hotels');
  const hotelSnapshot = await getDocs(hotelsCollection);
  return hotelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Add similar functions for fetching attractions, user data, etc.

export { getHotels };