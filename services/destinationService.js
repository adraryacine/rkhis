import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Get featured destinations (ordered by priority)
export const getFeaturedDestinations = async () => {
  try {
    if (!db) {
      console.warn('Firestore DB not initialized');
      return [];
    }

    const destinationsCollection = collection(db, 'destinations');
    const q = query(
      destinationsCollection,
      orderBy('priority', 'asc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const destinations = [];
    
    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        destinations.push({
          id: doc.id,
          name: data.name || 'Unknown Destination',
          description: data.description || '',
          image: data.image || data.images?.[0] || '',
          images: data.images || [],
          location: data.location || {},
          tags: data.tags || [],
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          amenities: data.amenities || [],
          nearbyAttractions: data.nearbyAttractions || [],
          nearbyHotels: data.nearbyHotels || [],
          nearbyRestaurants: data.nearbyRestaurants || [],
          ...data
        });
      }
    });

    return destinations;
  } catch (error) {
    console.error('Error fetching featured destinations:', error);
    return [];
  }
};

// Get destination details by ID
export const getDestinationDetails = async (destinationId) => {
  try {
    if (!db) {
      console.warn('Firestore DB not initialized');
      return null;
    }

    const destinationRef = doc(db, 'destinations', destinationId);
    const docSnap = await getDoc(destinationRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Unknown Destination',
        description: data.description || '',
        image: data.image || data.images?.[0] || '',
        images: data.images || [],
        location: data.location || {},
        tags: data.tags || [],
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        amenities: data.amenities || [],
        nearbyAttractions: data.nearbyAttractions || [],
        nearbyHotels: data.nearbyHotels || [],
        nearbyRestaurants: data.nearbyRestaurants || [],
        ...data
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching destination details:', error);
    return null;
  }
};

// Search destinations by name or tags
export const searchDestinations = async (searchTerm) => {
  try {
    if (!db) {
      console.warn('Firestore DB not initialized');
      return [];
    }

    const destinationsCollection = collection(db, 'destinations');
    const q = query(
      destinationsCollection,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const destinations = [];
    
    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        destinations.push({
          id: doc.id,
          name: data.name || 'Unknown Destination',
          description: data.description || '',
          image: data.image || data.images?.[0] || '',
          ...data
        });
      }
    });

    return destinations;
  } catch (error) {
    console.error('Error searching destinations:', error);
    return [];
  }
}; 