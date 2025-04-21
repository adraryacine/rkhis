// dataService.js
// This service handles fetching and saving data, primarily interacting with Firebase Firestore and Storage.
// It also includes mock data as a fallback or initial structure.

// Import necessary Firebase services from your firebase initialization file
import { db, storage, auth } from '../firebase'; // Make sure this path is correct and includes auth, db, and storage

// Import necessary Firestore functions
import { collection, getDocs, doc, getDoc, query, orderBy, limit, setDoc } from 'firebase/firestore';

// Import necessary Storage functions
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


// --- MOCK DATA (Temporary/Fallback) ---
// This should match the structure expected by HomeScreen and Detail Screens
const mockData = {
    featuredDestinations: [
      { id: 'dest1', name: 'Bejaia City Exploration', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg/1280px-Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg', description: 'Historic port & vibrant center' },
      { id: 'dest2', name: 'Aokas Golden Sands', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Plage_d%27Aokas.jpg/1280px-Plage_d%27Aokas.jpg', description: 'Relax on the stunning coastline' },
      { id: 'dest3', name: 'Tichy Seaside Promenade', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/29/25/63/hotel-les-hammadites.jpg?w=1200&h=-1&s=1', description: 'Enjoy cafes and sea views' },
      { id: 'dest4', name: 'Majestic Cap Carbon', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Phare_du_Cap_Carbon.jpg/1024px-Phare_du_Cap_Carbon.jpg', description: 'Iconic lighthouse & panoramas' },
    ],
    upcomingEvents: [
      { id: 'event1', name: 'Festival International de Théâtre', date: 'Oct 2024', location: 'Theatre Regional', image: 'https://via.placeholder.com/160x110/8A2BE2/FFFFFF?text=Theatre+Fest' },
      { id: 'event2', name: 'Artisan Fair - Aokas', date: 'Sept 15-17, 2024', location: 'Aokas Corniche', image: 'https://via.placeholder.com/160x110/DEB887/FFFFFF?text=Artisan+Fair' },
      { id: 'event3', name: 'Andalusian Music Evening', date: 'Sept 22, 2024', location: 'Maison de la Culture', image: 'https://via.placeholder.com/160x110/5F9EA0/FFFFFF?text=Music+Night' },
      { id: 'event4', name: 'Olive Harvest Celebration', date: 'Nov 2024', location: 'Nearby Villages', image: 'https://via.placeholder.com/160x110/228B22/FFFFFF?text=Olive+Harvest' },
    ],
     topRatedRestaurants: [
      { id: 'rest1', name: 'Le Dauphin Bleu', rating: 4.8, cuisine: 'Seafood, Mediterranean', image: 'https://media-cdn.tripadvisor.com/media/photo-s/0f/3c/93/48/le-dauphin-bleu.jpg', priceRange: '$$$' },
      { id: 'rest2', name: 'Restaurant El Djenina', rating: 4.6, cuisine: 'Algerian, Grills', image: 'https://media-cdn.tripadvisor.com/media/photo-s/0a/01/9e/8a/restaurant-el-djenina.jpg', priceRange: '$$' },
      { id: 'rest3', name: 'La Voile d\'Or', rating: 4.5, cuisine: 'Italian, Pizza', image: 'https://media-cdn.tripadvisor.com/media/photo-s/13/6c/a4/95/la-voile-d-or.jpg', priceRange: '$$' },
      { id: 'rest4', name: 'Pizzeria Venezia', rating: 4.4, cuisine: 'Pizza, Fast Food', image: 'https://media-cdn.tripadvisor.com/media/photo-f/05/e3/7e/5a/pizzeria-venezia.jpg', priceRange: '$' },
    ],
    recommendedHotels: [
      { id: 'hotel1', name: 'Hotel Royal Bejaia', price: '~$140', rating: 4.7, image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/1a/9b/0d/hotel-exterior.jpg?w=1200&h=-1&s=1', amenities: ['Pool', 'Spa', 'Restaurant'], latitude: 36.7520, longitude: 5.0860, address: 'Rue Aissat Idir, Bejaia', phone: '+21334xxxxxx', website: 'http://hotelroyalbejaia.com' },
      { id: 'hotel2', name: 'Hotel Zedek', price: '~$110', rating: 4.3, image: 'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/296065364.jpg?k=f8b5c3e0b2a2a625f1a6d6a17907c6a1e2c4c4a5a4f3a1c6f9e7b8d0a6b1c3d4&o=', amenities: ['Restaurant', 'Free WiFi'], latitude: 36.7510, longitude: 5.0870, address: 'Rue de la Liberté, Bejaia', phone: '+21334xxxxxx' },
      { id: 'hotel3', name: 'Le Cristal Hotel', price: '~$130', rating: 4.5, image: 'https://le-cristal-hotel-bejaia.booked.net/data/Photos/OriginalPhoto/11874/1187419/1187419507/Le-Cristal-Hotel-Bejaia-Exterior.JPEG', amenities: ['Beachfront', 'Restaurant'], latitude: 36.7500, longitude: 5.0840, address: 'Corniche, Bejaia' },
      { id: 'hotel4', name: 'Hotel Les Hammadites (Tichy)', price: '~$160', rating: 4.6, image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/29/25/63/hotel-les-hammadites.jpg?w=1200&h=-1&s=1', amenities: ['Private Beach', 'Pool', 'Tennis'], latitude: 36.7650, longitude: 5.1200, address: 'Tichy Corniche' },
    ],
    popularAttractions: [
      { id: 'attr1', name: 'Gouraya Park', description: 'Nature & Views', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%E1%B4%B0.jpg/1024px-Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%B0.jpg', latitude: 36.7600, longitude: 5.0900, openingHours: '8 AM - 6 PM', entranceFee: '50 DZD', address: 'Mount Gouraya, Bejaia' },
      { id: 'attr2', name: 'Monkey Peak', description: 'Wildlife Encounter', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Barbary_macaque_on_Monkey_Mountain.jpg/1024px-Barbary_macaque_on_Monkey_Mountain.jpg', latitude: 36.7680, longitude: 5.0920, openingHours: 'Always Open', entranceFee: 'Free', address: 'Inside Gouraya Park' },
      { id: 'attr3', name: '1er Novembre Sq.', description: 'City Heart', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Place_du_1er_Novembre_Bejaia.jpg/1024px-Place_du_1er_Novembre_Bejaia.jpg', latitude: 36.7550, longitude: 5.0850, openingHours: 'Always Open', entranceFee: 'Free', address: 'City Center, Bejaia' },
      { id: 'attr4', name: 'Brise de Mer', description: 'City Beach', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/92/d5/83/plage-de-boulimat.jpg?w=1200&h=-1&s=1', latitude: 36.7570, longitude: 5.0800, openingHours: 'Always Open', entranceFee: 'Free', address: 'Waterfront, Bejaia' },
      { id: 'attr5', name: 'Casbah', description: 'Old City Charm', image: 'https://live.staticflickr.com/65535/51260998338_a1974185c1_b.jpg', latitude: 36.7580, longitude: 5.0880, openingHours: 'Always Open', entranceFee: 'Free', address: 'Historic Quarter, Bejaia' },
      { id: 'attr6', name: 'Cap Carbon', description: 'Lighthouse Views', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Phare_du_Cap_Carbon.jpg/1024px-Phare_du_Cap_Carbon.jpg', latitude: 36.7750, longitude: 5.0950, openingHours: 'Usually Daytime', entranceFee: 'Small fee for lighthouse', address: 'Cap Carbon, Bejaia' },
    ],
    localCulture: [
      { id: 'cult1', title: 'Kabyle Heritage', description: 'Explore the unique Berber traditions, language (Taqbaylit), and vibrant music of the region.' },
      { id: 'cult2', title: 'Andalusian Influence', description: 'Discover the historical connection reflected in architecture, music, and cuisine.' },
      { id: 'cult3', title: 'Local Festivals & Moussems', description: 'Experience vibrant seasonal celebrations and traditional gatherings.' },
    ],
    historicalSites: [
      { id: 'hist1', name: 'Casbah of Bejaia', description: 'Wander the narrow streets of the ancient fortified city.', latitude: 36.7580, longitude: 5.0880 },
      { id: 'hist2', name: 'Bab El Bahr (Sea Gate)', description: 'Historic gate offering sea views and photo opportunities.', latitude: 36.7565, longitude: 5.0845 },
      { id: 'hist3', name: 'Fort Gouraya', description: 'Remnants of a Spanish fort with breathtaking city panoramas.', latitude: 36.7610, longitude: 5.0910 },
      { id: 'hist4', name: 'Fibonacci Plaque', description: 'Commemorating Leonardo Fibonacci\'s influential time in Bejaia.', latitude: 36.7555, longitude: 5.0855 },
    ],
    beachesCoastal: [
      { id: 'beach1', name: 'Les Aiguades', description: 'Known for clear turquoise water, dramatic cliffs, and snorkeling.', latitude: 36.7700, longitude: 5.1400 },
      { id: 'beach2', name: 'Sakamody Beach', description: 'A more secluded cove ideal for relaxation and quiet swims.', latitude: 36.7800, longitude: 5.1500 },
      { id: 'beach3', name: 'Boulimat Beach', description: 'Popular family-friendly beach west of Bejaia with amenities.', latitude: 36.7900, longitude: 5.1600 },
    ],
    outdoorActivities: [
      { id: 'out1', name: 'Hiking', icon: 'walk-outline' },
      { id: 'out2', name: 'Swimming', icon: 'water-outline' },
      { id: 'out3', name: 'Snorkeling', icon: 'glasses-outline' },
      { id: 'out4', name: 'Photography', icon: 'camera-outline' },
      { id: 'out5', name: 'Bird Watching', icon: 'search-circle-outline'},
    ],
    transportationInfo: [
      { id: 'trans1', type: 'City Buses (ETUB)', details: 'Affordable network, check routes beforehand.', icon: 'bus-outline' },
      { id: 'trans2', type: 'Taxis (Petit & Grand)', details: 'Plentiful, agree on fares, especially for longer trips.', icon: 'car-sport-outline' },
      { id: 'trans3', type: 'Airport (BJA)', details: 'Soummam–Abane Ramdane Airport, taxis available.', icon: 'airplane-outline' },
      { id: 'trans4', name: 'Port Connections', details: 'Check ferry schedules for national/international routes.', icon: 'boat-outline' },
    ],
    emergencyContacts: [
      { id: 'police', name: 'Police', number: '17', icon: 'shield-checkmark-outline' },
      { id: 'ambulance', name: 'SAMU', number: '14', icon: 'pulse-outline' },
      { id: 'fire', name: 'Protection Civile', number: '14', icon: 'flame-outline' },
      { id: 'hospital', name: 'CHU Bejaia', number: '034xxxxxx', icon: 'git-network-outline' },
    ],
};


// --- Firestore Fetching Functions (PLACEHOLDERS) ---
// Replace these with actual queries based on your Firestore structure
// For now, they return mockData after a short delay
const getFeaturedDestinations = async () => {
  console.log("Fetching featured destinations (using mock data)...");
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // Example Firestore fetch (replace with your actual collection name and logic):
  // if (!db) { console.warn("Firestore DB not initialized, returning mock data."); return mockData.featuredDestinations; }
  // try {
  //   const snapshot = await getDocs(collection(db, 'featuredDestinations'));
  //   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // } catch (error) {
  //   console.error("Error fetching featured destinations from Firestore:", error);
  //   return mockData.featuredDestinations; // Fallback to mock on error
  // }
  return mockData.featuredDestinations; // Always return mock for now
};

const getUpcomingEvents = async () => {
   console.log("Fetching upcoming events (using mock data)...");
   await new Promise(resolve => setTimeout(resolve, 500));
   // Example Firestore fetch:
   // if (!db) { console.warn("Firestore DB not initialized, returning mock data."); return mockData.upcomingEvents; }
   // try {
   //   const snapshot = await getDocs(query(collection(db, 'events'), orderBy('date'), limit(10)));
   //   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
   // } catch (error) {
   //   console.error("Error fetching upcoming events from Firestore:", error);
   //   return mockData.upcomingEvents; // Fallback to mock on error
   // }
   return mockData.upcomingEvents; // Always return mock for now
};

const getTopRatedRestaurants = async () => {
   console.log("Fetching top rated restaurants (using mock data)...");
   await new Promise(resolve => setTimeout(resolve, 500));
   // Example Firestore fetch:
   // if (!db) { console.warn("Firestore DB not initialized, returning mock data."); return mockData.topRatedRestaurants; }
   // try {
   //   const snapshot = await getDocs(query(collection(db, 'restaurants'), orderBy('rating', 'desc'), limit(10))); // Example orderBy
   //   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
   // } catch (error) {
   //   console.error("Error fetching top rated restaurants from Firestore:", error);
   //   return mockData.topRatedRestaurants; // Fallback to mock on error
   // }
   return mockData.topRatedRestaurants; // Always return mock for now
};

const getRecommendedHotels = async () => {
   console.log("Fetching recommended hotels (using mock data)...");
   await new Promise(resolve => setTimeout(resolve, 500));
   // Example Firestore fetch:
   // if (!db) { console.warn("Firestore DB not initialized, returning mock data."); return mockData.recommendedHotels; }
   // try {
   //   const snapshot = await getDocs(query(collection(db, 'hotels'), orderBy('price'), limit(10))); // Example orderBy
   //   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
   // } catch (error) {
   //   console.error("Error fetching recommended hotels from Firestore:", error);
   //   return mockData.recommendedHotels; // Fallback to mock on error
   // }
   return mockData.recommendedHotels; // Always return mock for now
};

const getPopularAttractions = async () => {
    console.log("Fetching popular attractions (using mock data)...");
    await new Promise(resolve => setTimeout(resolve, 500));
    // Example Firestore fetch:
    // if (!db) { console.warn("Firestore DB not initialized, returning mock data."); return mockData.popularAttractions; }
    // try {
    //   const snapshot = await getDocs(query(collection(db, 'attractions'), orderBy('popularity', 'desc'), limit(10))); // Example orderBy
    //   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // } catch (error) {
    //   console.error("Error fetching popular attractions from Firestore:", error);
    //   return mockData.popularAttractions; // Fallback to mock on error
    // }
    return mockData.popularAttractions; // Always return mock for now
};

// Function to get details for a single attraction by ID
const getAttractionDetails = async (id) => {
     console.log(`Fetching details for attraction ID ${id} (using mock data)...`);
     await new Promise(resolve => setTimeout(resolve, 300));
     // Example Firestore fetch:
     // if (!db) { console.warn("Firestore DB not initialized, returning mock data."); return mockData.popularAttractions.find(item => item.id === id) || mockData.historicalSites.find(item => item.id === id) || mockData.beachesCoastal.find(item => item.id === id) || null; }
     // try {
     //   const docRef = doc(db, 'attractions', id);
     //   const docSnap = await getDoc(docRef);
     //   if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; }
     //   else { console.log("No such document!"); return null; }
     // } catch (error) {
     //   console.error(`Error fetching attraction details for ID ${id} from Firestore:`, error);
     //   return mockData.popularAttractions.find(item => item.id === id) || mockData.historicalSites.find(item => item.id === id) || mockData.beachesCoastal.find(item => item.id === id) || null; // Fallback
     // }

     // Mock data lookup (search across all mock data arrays for simplicity)
     return mockData.popularAttractions.find(item => item.id === id)
         || mockData.historicalSites.find(item => item.id === id)
         || mockData.beachesCoastal.find(item => item.id === id)
         || null;
}

// Function to get details for a single hotel by ID
const getHotelDetails = async (id) => {
     console.log(`Fetching details for hotel ID ${id} (using mock data)...`);
     await new Promise(resolve => setTimeout(resolve, 300));
     // Example Firestore fetch:
     // if (!db) { console.warn("Firestore DB not initialized, returning mock data."); return mockData.recommendedHotels.find(item => item.id === id) || null; }
     // try {
     //   const docRef = doc(db, 'hotels', id);
     //   const docSnap = await getDoc(docRef);
     //   if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; }
     //   else { console.log("No such document!"); return null; }
     // } catch (error) {
     //    console.error(`Error fetching hotel details for ID ${id} from Firestore:`, error);
     //    return mockData.recommendedHotels.find(item => item.id === id) || null; // Fallback
     // }

     // Mock data lookup
     return mockData.recommendedHotels.find(item => item.id === id) || null;
}

// User Data Service (PLACEHOLDER - needs Firebase Authentication AND Firestore 'users' collection)
// Assuming you have a 'users' collection where doc.id is the user's UID
// import { setDoc } from 'firebase/firestore'; // setDoc is already imported at the top
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // ref, uploadBytes, getDownloadURL are already imported at the top
// import { auth } from './firebase'; // auth is already imported at the top


const saveUserProfile = async (userId, profileData) => {
    console.log(`Saving profile data for user ${userId}:`, profileData);
     if (!db) {
         console.error("Firestore DB not initialized. Cannot save profile.");
         throw new Error("Database not available.");
     }
    try {
         // Example Firestore set/update logic:
         const userDocRef = doc(db, 'users', userId);
         await setDoc(userDocRef, profileData, { merge: true }); // Use merge: true to update existing fields
         console.log(`Profile data saved successfully for user ${userId}.`);
         // In a real app, you'd ideally update the user data in AuthContext here
         // This might require passing a setUserData function from AuthContext or using a global state solution (Redux)
    } catch (error) {
        console.error(`Error saving profile data for user ${userId}:`, error);
        throw error; // Re-throw for component handling
    }
};

const getUserProfile = async (userId) => {
    console.log(`Fetching profile data for user ${userId} (using Firestore/mock fallback)...`);
     if (!db) {
         console.warn("Firestore DB not initialized. Using mock user data.");
         // Fallback to mock user data if DB is not available
          return {
             id: userId,
             fullName: 'Salim Dev (Mock)',
             email: 'mock.user@example.com',
             joinDate: new Date().toISOString(), // Use ISO string for mock date
             profilePicUrl: null,
             settings: { language: 'en', currency: 'USD', theme: 'system' },
         };
     }
    try {
        // Example Firestore get logic:
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            console.log(`Profile data found for user ${userId}.`);
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log(`No profile document found for user ${userId}. Returning basic data.`);
             // Return basic data from auth object if no Firestore document exists
             return {
                 id: userId,
                 fullName: auth.currentUser?.displayName || auth.currentUser?.email || 'New User',
                 email: auth.currentUser?.email || 'N/A',
                 joinDate: auth.currentUser?.metadata?.creationTime ? new Date(auth.currentUser.metadata.creationTime).toISOString() : 'Join date N/A',
                 profilePicUrl: auth.currentUser?.photoURL || null,
                 settings: { language: 'en', currency: 'USD', theme: 'system' }, // Default settings
             };
        }
    } catch (error) {
        console.error(`Error fetching profile data for user ${userId}:`, error);
         // Fallback to basic data or null on error
        return {
            id: userId,
            fullName: auth.currentUser?.displayName || auth.currentUser?.email || 'User',
            email: auth.currentUser?.email || 'N/A',
            joinDate: auth.currentUser?.metadata?.creationTime ? new Date(auth.currentUser.metadata.creationTime).toISOString() : 'Join date N/A',
            profilePicUrl: auth.currentUser?.photoURL || null,
             settings: { language: 'en', currency: 'USD', theme: 'system' },
        };
    }
};

// Keep the original getHotels function if it's used elsewhere,
// although we are now using getRecommendedHotels for the list.
// If this function is never used, you can remove it entirely.
const getHotels = async () => {
    console.log("Fetching hotels (using mock data)...");
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData.recommendedHotels; // Or implement Firestore fetch
};


export {
  getHotels, // Keep the original getHotels if it's used somewhere else
  getFeaturedDestinations,
  getUpcomingEvents,
  getTopRatedRestaurants,
  getRecommendedHotels,
  getPopularAttractions,
  getAttractionDetails, // For detail screen
  getHotelDetails, // For detail screen
  saveUserProfile, // For Profile Screen
  getUserProfile, // For Profile Screen (Used by AuthContext)
  // Add more data fetching functions as needed (e.g., getAttractions, getRestaurants)
};