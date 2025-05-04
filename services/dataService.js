// services/dataService.js
// This service handles fetching and saving data, primarily interacting with Firebase Firestore and Storage.
// It also includes mock data as a fallback or initial structure.

// Import necessary Firebase services from your firebase initialization file
// Make sure '../firebase' correctly exports 'db', 'storage', and 'auth' instances
import { db, storage, auth } from '../firebase';

// Import necessary Firestore functions (v9 syntax)
import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy,
    limit,
    setDoc, // Function to create/overwrite/merge a document
    serverTimestamp, // Function to get a server-generated timestamp
} from 'firebase/firestore';

// Import necessary Storage functions (v9 syntax)
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


// --- MOCK DATA (Temporary/Fallback) ---
// Keep mock data structured as it's used in the fetching fallbacks
const mockData = {
  
    
     topRatedRestaurants: [
      { 
        id: 'rest1', 
        name: 'Le Dauphin Bleu', 
        rating: 4.8, 
        cuisine: 'Seafood, Mediterranean', 
        image: 'https://media-cdn.tripadvisor.com/media/photo-m/1280/14/cc/e2/ff/photo1jpg.jpg', 
        priceRange: '$$$',
        description: 'A fine dining experience with fresh seafood and Mediterranean cuisine.',
        location: {
          latitude: 36.7538,
          longitude: 5.0569,
          address: 'Port de Bejaia'
        },
        images: [
          'https://media-cdn.tripadvisor.com/media/photo-m/1280/14/cc/e2/ff/photo1jpg.jpg',
          'https://i0.wp.com/harba-dz.com/wp-content/uploads/2021/02/le-dauphin-2.jpg?fit=576%2C768&ssl=1'
        ],
        menu: [
          { name: 'Grilled Sea Bass', price: '$25' },
          { name: 'Seafood Paella', price: '$30' }
        ],
        reviews: [
          { user: 'John D.', rating: 5.0, comment: 'Amazing seafood!' },
          { user: 'Sarah M.', rating: 4.5, comment: 'Great atmosphere and service' }
        ]
      },
      { 
        id: 'rest2', 
        name: 'Restaurant La Citadelle', 
        rating: 4.6, 
        cuisine: 'Algerian, Grills', 
        image: 'https://media-cdn.tripadvisor.com/media/photo-s/0a/01/9e/8a/restaurant-el-djenina.jpg', 
        priceRange: '$$',
        description: 'Traditional Algerian cuisine with a modern twist.',
        location: {
          latitude: 36.7540,
          longitude: 5.0570,
          address: 'Rue de la Liberté, Bejaia'
        },
        images: [
            'https://media-cdn.tripadvisor.com/media/photo-m/1280/14/cc/e2/ff/photo1jpg.jpg',
            'https://i0.wp.com/harba-dz.com/wp-content/uploads/2021/02/le-dauphin-2.jpg?fit=576%2C768&ssl=1'
          ],
        menu: [
          { name: 'Couscous Royal', price: '$18' },
          { name: 'Mixed Grill Platter', price: '$22' }
        ],
        reviews: [
          { user: 'Ahmed K.', rating: 4.8, comment: 'Authentic Algerian flavors' },
          { user: 'Marie L.', rating: 4.4, comment: 'Delicious food and friendly staff' }
        ]
      },
      { id: 'rest3', name: 'La Voile d\'Or', rating: 4.5, cuisine: 'Italian, Pizza', image: 'https://media-cdn.tripadvisor.com/media/photo-s/13/6c/a4/95/la-voile-d-or.jpg', priceRange: '$$' },
      { id: 'rest4', name: 'Pizzeria Venezia', rating: 4.4, cuisine: 'Pizza, Fast Food', image: 'https://media-cdn.tripadvisor.com/media/photo-f/05/e3/7e/5a/pizzeria-venezia.jpg', priceRange: '$' },
    ],
    recommendedHotels: [
      { 
        id: 'hotel1', 
        name: 'Hotel Royal Bejaia', 
        price: '$140/night', 
        rating: 4.7, 
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/1a/9b/0d/hotel-exterior.jpg', 
        amenities: ['Pool', 'Spa', 'Restaurant', 'Free WiFi', 'Sea View'], 
        address: 'Rue Aissat Idir, Bejaia', 
        phone: '+21334xxxxxx', 
        website: 'http://hotelroyalbejaia.com',
        description: 'Luxury hotel with stunning sea views and modern amenities.',
        latitude: 36.7520,
        longitude: 5.0860,
        images: [
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/1a/9b/0d/hotel-exterior.jpg',
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/1a/9b/0e/hotel-pool.jpg'
        ],
        rooms: [
          { type: 'Standard', price: '$140', capacity: 2 },
          { type: 'Deluxe', price: '$180', capacity: 2 },
          { type: 'Suite', price: '$250', capacity: 4 }
        ],
        reviews: [
          { user: 'David W.', rating: 4.8, comment: 'Excellent service and location' },
          { user: 'Emma R.', rating: 4.6, comment: 'Beautiful views and comfortable rooms' }
        ]
      },
      { 
        id: 'hotel2', 
        name: 'Hotel Zedek', 
        price: '$110/night', 
        rating: 4.3, 
        image: 'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/296065364.jpg', 
        amenities: ['Restaurant', 'Free WiFi', 'City Center', 'Business Center'], 
        address: 'Rue de la Liberté, Bejaia',
        description: 'Comfortable hotel in the heart of the city.',
        latitude: 36.7510,
        longitude: 5.0870,
        images: [
          'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/296065364.jpg',
          'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/296065365.jpg'
        ],
        rooms: [
          { type: 'Standard', price: '$110', capacity: 2 },
          { type: 'Family', price: '$150', capacity: 4 }
        ],
        reviews: [
          { user: 'Michael B.', rating: 4.4, comment: 'Good value for money' },
          { user: 'Sophie T.', rating: 4.2, comment: 'Clean and comfortable' }
        ]
      },
      { 
        id: 'hotel3', 
        name: 'Le Cristal Hotel', 
        price: '$130/night', 
        rating: 4.5, 
        image: 'https://le-cristal-hotel-bejaia.booked.net/data/Photos/OriginalPhoto/11874/1187419/1187419507/Le-Cristal-Hotel-Bejaia-Exterior.JPEG', 
        amenities: ['Beachfront', 'Restaurant', 'Free WiFi', 'Pool'], 
        address: 'Corniche, Bejaia',
        latitude: 36.7500,
        longitude: 5.0840,
        description: 'Modern beachfront hotel with excellent amenities.',
        images: [
          'https://le-cristal-hotel-bejaia.booked.net/data/Photos/OriginalPhoto/11874/1187419/1187419507/Le-Cristal-Hotel-Bejaia-Exterior.JPEG'
        ],
        reviews: [
          { user: 'Alice R.', rating: 4.6, comment: 'Great beachfront location' }
        ]
      },
      { 
        id: 'hotel4', 
        name: 'Hotel Les Hammadites', 
        price: '$160/night', 
        rating: 4.6, 
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/29/25/63/hotel-les-hammadites.jpg?w=1200&h=-1&s=1', 
        amenities: ['Private Beach', 'Pool', 'Tennis', 'Spa', 'Restaurant'], 
        address: 'Tichy Corniche, Tichy',
        latitude: 36.7650,
        longitude: 5.1200,
        description: 'Luxury beach resort with extensive facilities.',
        images: [
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/29/25/63/hotel-les-hammadites.jpg?w=1200&h=-1&s=1'
        ],
        reviews: [
          { user: 'James P.', rating: 4.7, comment: 'Amazing beach resort' }
        ]
      }
    ],
    popularAttractions: [
      { id: 'attr1', name: 'Gouraya park', description: 'Nature & Views', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%E1%B4%B0.jpg/1024px-Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%B0.jpg', latitude: 36.7600, longitude: 5.0900, openingHours: '8 AM - 6 PM', entranceFee: '50 DZD', address: 'Mount Gouraya, Bejaia' },
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
    // Mock user data for fallback and structure reference
    mockUser: {
        fullName: 'Mock User',
        email: 'mock.user@example.com',
        phoneNumber: '+213555123456', // Added mock phone number
        joinDate: new Date(2023, 0, 1).toISOString(), // Use ISO string for mock date
        profilePicUrl: null,
        settings: { language: 'system', currency: 'DZD', theme: 'system' },
    }
};

// --- Firestore Fetching Functions ---
// These functions will *attempt* to fetch from Firestore first and fallback to mock data on error or empty result.

/**
 * Generic helper to fetch documents from a Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {Array<object>} mockFallbackData - Mock data to return on error or empty collection.
 * @param {function} queryRefBuilder - Optional function to build the query (e.g., add orderBy, limit).
 * @returns {Promise<Array<object>>} - A promise resolving with an array of documents.
 */
const fetchFromFirestore = async (collectionName, mockFallbackData, queryRefBuilder = (colRef) => colRef) => {
    if (!db) {
        console.warn(`Firestore DB not initialized for "${collectionName}", returning mock data.`);
        return mockFallbackData;
    }
    try {
        const collectionRef = collection(db, collectionName);
        const q = queryRefBuilder(collectionRef); // Apply custom query (orderBy, limit, etc.)
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log(`No documents found in "${collectionName}", returning mock data.`);
            // You might return [] here instead of mockFallbackData if you prefer
            // an empty state from an empty collection. Returning mock is a stronger fallback.
            return mockFallbackData;
        }

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Successfully fetched ${data.length} documents from "${collectionName}".`);
        return data;

    } catch (error) {
        console.error(`Error fetching data from "${collectionName}" Firestore:`, error);
        return mockFallbackData; // Fallback to mock on any Firestore error
    }
};

const getFeaturedDestinations = async () => {
    // Example: Order by a 'priority' field and limit
    return fetchFromFirestore('featuredDestinations', mockData.featuredDestinations,
        (colRef) => query(colRef, orderBy('priority', 'asc'), limit(10)) // Adjust query as needed
    );
};

const getUpcomingEvents = async () => {
    // Example: Order by 'date' and limit
    return fetchFromFirestore('events', mockData.upcomingEvents,
        (colRef) => query(colRef, orderBy('date', 'asc'), limit(10)) // Adjust query as needed
    );
};

const getTopRatedRestaurants = async () => {
    try {
        if (!db) {
            console.warn('Firestore DB not initialized, returning mock data');
            return mockData.topRatedRestaurants;
        }

        const restaurantsCollection = collection(db, 'restaurants');
        const q = query(restaurantsCollection, orderBy('rating', 'desc'), limit(10));
        
        const querySnapshot = await getDocs(q);
        const restaurants = [];
        
        querySnapshot.forEach((doc) => {
            if (doc.exists()) {
                const data = doc.data();
                console.log('Restaurant document data:', data);
                restaurants.push({
                    id: doc.id,
                    ...data
                });
            }
        });

        if (restaurants.length === 0) {
            console.log('No restaurants found in Firestore, returning mock data');
            return mockData.topRatedRestaurants;
        }

        console.log('Final restaurants array:', restaurants);
        return restaurants;
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return mockData.topRatedRestaurants;
    }
};

const getRecommendedHotels = async () => {
    try {
        if (!db) {
            console.warn('Firestore DB not initialized, returning mock data');
            return mockData.recommendedHotels;
        }

        const hotelsCollection = collection(db, 'hotels');
        const q = query(hotelsCollection, orderBy('rating', 'desc'), limit(10));
        
        const querySnapshot = await getDocs(q);
        const hotels = [];
        
        querySnapshot.forEach((doc) => {
            if (doc.exists()) {
                const data = doc.data();
                console.log('Hotel document data:', data);
                hotels.push({
                    id: doc.id,
                    name: data.name || 'Unknown Hotel',
                    rating: parseFloat(data.rating) || 4.0,
                    price: data.price || '$100/night',
                    image: data.image || data.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
                    amenities: data.amenities || ['Free WiFi'],
                    address: data.address || data.location?.address || 'Bejaia',
                    description: data.description || '',
                    latitude: data.latitude || data.location?.latitude,
                    longitude: data.longitude || data.location?.longitude,
                    images: data.images || [data.image] || [],
                    rooms: data.rooms || [],
                    reviews: data.reviews || [],
                    ...data
                });
            }
        });

        if (hotels.length === 0) {
            console.log('No hotels found in Firestore, seeding initial data...');
            // Seed initial hotel data
            const initialHotels = [
                {
                    id: 'hotel_1',
                    name: 'La roserie',
                    rating: '4.9',
                    price: '$235/night',
                    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
                    amenities: ['Pool', 'Spa', 'Restaurant', 'Free WiFi', 'Sea View'],
                    address: 'Rue Aissat Idir, Bejaia',
                    description: 'Luxury hotel with stunning sea views and modern amenities.',
                    location: {
                        latitude: 36.71302,
                        longitude: 5.03138
                    }
                },
                {
                    id: 'hotel_2',
                    name: 'Hotel 10',
                    rating: '4.8',
                    price: '$147/night',
                    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
                    amenities: ['Restaurant', 'Free WiFi', 'City Center', 'Business Center'],
                    address: 'Downtown Bejaia',
                    description: 'Modern business hotel in the heart of the city.',
                    location: {
                        latitude: 36.79126,
                        longitude: 5.00830
                    }
                },
                {
                    id: 'hotel_3',
                    name: 'Hotel 2',
                    rating: '4.7',
                    price: '$112/night',
                    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
                    amenities: ['Beachfront', 'Restaurant', 'Free WiFi', 'Pool'],
                    address: 'Corniche, Bejaia',
                    description: 'Beachfront hotel with excellent amenities.',
                    location: {
                        latitude: 36.79128,
                        longitude: 5.05352
                    }
                },
                {
                    id: 'hotel_4',
                    name: 'Hotel 3',
                    rating: '4.6',
                    price: '$92/night',
                    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',
                    amenities: ['Private Beach', 'Pool', 'Restaurant'],
                    address: 'Tichy Beach, Bejaia',
                    description: 'Affordable beachfront hotel with great views.',
                    location: {
                        latitude: 36.73428,
                        longitude: 5.02874
                    }
                },
                {
                    id: 'hotel_5',
                    name: 'Hotel 4',
                    rating: '4.5',
                    price: '$163/night',
                    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
                    amenities: ['Spa', 'Pool', 'Restaurant', 'Free WiFi'],
                    address: 'City Center, Bejaia',
                    description: 'Elegant city hotel with premium amenities.',
                    location: {
                        latitude: 36.76319,
                        longitude: 5.01086
                    }
                }
            ];

            // Add hotels to Firestore
            for (const hotel of initialHotels) {
                const docRef = doc(db, 'hotels', hotel.id);
                await setDoc(docRef, hotel);
                hotels.push(hotel);
            }
            console.log('Successfully seeded initial hotel data');
        }

        console.log('Final hotels array:', hotels);
        return hotels;

    } catch (error) {
        console.error('Error fetching hotels:', error);
        return mockData.recommendedHotels;
    }
};

const getPopularAttractions = async () => {
    // Example: Order by 'popularity' or 'name' and limit
    return fetchFromFirestore('attractions', mockData.popularAttractions,
        (colRef) => query(colRef, orderBy('name', 'asc'), limit(20)) // Adjust query as needed
    );
};

// --- Firestore Detail Fetching Functions ---

/**
 * Generic helper to fetch a single document from a Firestore collection by ID.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} id - The document ID.
 * @param {object|null} mockFallbackItem - Mock data item to return on error or if the document is not found.
 * @returns {Promise<object|null>} - A promise resolving with the document data or null/mock.
 */
const fetchDetailFromFirestore = async (collectionName, id, mockFallbackItem) => {
     if (!db) {
         console.warn(`Firestore DB not initialized for "${collectionName}" detail, returning mock data.`);
         return mockFallbackItem;
     }
     if (!id) {
         console.error(`No ID provided for fetching ${collectionName} detail.`);
         return null;
     }
     try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log(`Successfully fetched detail for ${collectionName} ID ${id}.`);
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log(`No document found for ${collectionName} ID ${id}, returning mock data.`);
            return mockFallbackItem; // Fallback if specific document not found
        }
     } catch (error) {
        console.error(`Error fetching ${collectionName} detail for ID ${id} from Firestore:`, error);
        return mockFallbackItem; // Fallback on any Firestore error
     }
};


const getAttractionDetails = async (id) => {
     // Find the item in mock data for fallback (might be in different mock arrays)
     const mockItem = mockData.popularAttractions.find(item => item.id === id)
         || mockData.historicalSites.find(item => item.id === id)
         || mockData.beachesCoastal.find(item => item.id === id)
         || null;
     // Assuming attractions, historicalSites, beaches are all in one 'attractions' collection with different types/fields in Firestore
     // NOTE: If they are SEPARATE collections, you need to query each one here or have a different Firestore structure.
     return fetchDetailFromFirestore('attractions', id, mockItem);
};

const getHotelDetails = async (id) => {
    const mockItem = mockData.recommendedHotels.find(item => item.id === id) || null;
    return fetchDetailFromFirestore('hotels', id, mockItem);
};

const getRestaurantDetails = async (id) => {
    const mockItem = mockData.topRatedRestaurants.find(item => item.id === id) || null;
    return fetchDetailFromFirestore('restaurants', id, mockItem);
};


// --- User Data Service (Firestore 'users' collection) ---

/**
 * Saves (creates or updates) a user profile document in the 'users' collection.
 * Uses the Firebase Auth UID as the document ID.
 * @param {string} userId - The Firebase Authentication user ID.
 * @param {object} profileData - Data to save (e.g., { fullName: '...', phoneNumber: '...', preferences: { ... } }).
 */
export const saveUserProfile = async (userId, profileData) => {
    if (!db) {
        console.error("Firestore DB not initialized. Cannot save profile.");
        throw new Error("Database not available.");
    }
    if (!userId) {
        console.error("Attempted to save user profile without a UID.");
        throw new Error("User UID is required to save profile.");
    }

    console.log(`Attempting to save profile data for user ${userId}:`, profileData);

    try {
         const userDocRef = doc(db, 'users', userId);

         // Fetch existing data to preserve fields not being updated and check for createdAt
         const docSnap = await getDoc(userDocRef);
         const existingData = docSnap.exists() ? docSnap.data() : {};

         const dataToSet = {
             ...profileData, // Include the data passed in (fullName, phoneNumber, preferences, etc.)
             lastUpdated: serverTimestamp(), // Always update lastUpdated timestamp
         };

         // Only add createdAt if the document doesn't exist OR if the existing doc doesn't have it
         // This handles initial creation by authService.register and ensures it's not overwritten later.
         if (!docSnap.exists() || !existingData.createdAt) {
             dataToSet.createdAt = serverTimestamp();
              console.log("Adding createdAt timestamp.");
         } else {
             // If createdAt already exists, don't include it in dataToSet so merge:true doesn't touch it
             // This means we don't need the line 'dataToSet.createdAt = serverTimestamp();' inside the if block.
             // The check `!docSnap.exists() || !existingData.createdAt` is sufficient.
             // If the document exists and has createdAt, we just proceed without adding createdAt to dataToSet.
              console.log("createdAt timestamp already exists.");
         }

         // Important: Ensure preferences object is merged correctly if it exists in profileData
         // setDoc with merge: true handles top-level fields like fullName, phoneNumber.
         // If profileData includes { preferences: { language: 'fr' } }, merge true will:
         // - If preferences doesn't exist, create it as { language: 'fr' }.
         // - If preferences exists like { theme: 'dark' }, it becomes { theme: 'dark', language: 'fr' }.
         // - If preferences exists like { language: 'en' }, it becomes { language: 'fr' }.
         // This is exactly what we want for preferences.

         await setDoc(userDocRef, dataToSet, { merge: true }); // Use merge: true

         console.log(`Profile data saved successfully for user ${userId}.`);
    } catch (error) {
        console.error(`Error saving profile data for user ${userId}:`, error);
        throw error; // Re-throw the error for handling in components/services
    }
};

/**
 * Fetches the user profile document from the 'users' collection.
 * @param {string} userId - The Firebase Authentication user ID.
 * @returns {Promise<object|null>} - The user profile data object (including id), or null if not found or error.
 */
export const getUserProfile = async (userId) => {
     // Fallback to basic Auth user data if DB is not initialized
     if (!db) {
         console.warn("Firestore DB not initialized. Cannot fetch profile from Firestore.");
         const currentUser = auth.currentUser;
         if (currentUser && currentUser.uid === userId) {
              console.warn("Returning basic Auth data as Firestore is unavailable.");
              return {
                 id: userId,
                 email: currentUser.email || 'N/A',
                 // Use Auth displayName if available, otherwise fallback
                 fullName: currentUser.displayName || currentUser.email || 'User',
                 phoneNumber: mockData.mockUser.phoneNumber, // Return mock phone as no real data source
                 profilePicUrl: currentUser.photoURL || null,
                 // Use Auth metadata for join date, fallback to mock date
                 joinDate: currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime) : new Date(mockData.mockUser.joinDate),
                 preferences: mockData.mockUser.settings, // Default/mock settings
             };
         }
          console.error(`Cannot fetch profile for ${userId}: Database not available and Auth user doesn't match.`);
          // Return null if DB not available and Auth user doesn't match requested UID
          return null;
     }
    if (!userId) {
        console.error("Attempted to fetch user profile without a UID.");
        // If Auth is initialized but no userId is provided, return null
        return null;
    }

    console.log(`Attempting to fetch profile data for user ${userId} from Firestore...`);

    try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            console.log(`Profile data found for user ${userId}.`);
            const firestoreData = docSnap.data();

            // Merge data from Auth (guaranteed to exist if currentUser is not null)
            // with data from Firestore. Firestore data takes precedence for editable fields.
            const currentUser = auth.currentUser;
            const combinedData = {
                 // Basic info from Auth (safe fallbacks)
                 id: userId,
                 email: currentUser?.email || firestoreData.email || 'N/A', // Prefer Auth email
                 profilePicUrl: currentUser?.photoURL || firestoreData.profilePicUrl || null, // Prefer Auth photoURL
                 // Auth creation time (often more reliable for join date)
                 joinDate: currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime) : (firestoreData.createdAt?.toDate() || null), // Convert Firestore timestamp to Date

                 // Profile-specific fields from Firestore (can be updated)
                 // Prefer Firestore data, fallback to Auth displayName, then email, then 'User'
                 fullName: firestoreData.fullName || currentUser?.displayName || currentUser?.email || 'User',
                 phoneNumber: firestoreData.phoneNumber || null, // Phone number should come from Firestore profile
                 preferences: firestoreData.preferences || {}, // Use Firestore preferences, fallback to empty object
                 // Add other fields from firestoreData here
            };

            return combinedData;
        } else {
            console.log(`No profile document found for user ${userId} in Firestore.`);
             // If document doesn't exist, return basic data from Auth object
             const currentUser = auth.currentUser;
             if (currentUser && currentUser.uid === userId) {
                 console.log("Returning basic Auth data as Firestore doc is missing.");
                 return {
                     id: userId,
                     email: currentUser.email || 'N/A',
                     fullName: currentUser.displayName || currentUser.email || 'New User',
                     phoneNumber: null, // No phone number if doc is missing
                     profilePicUrl: currentUser.photoURL || null,
                     joinDate: currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime) : null,
                     preferences: {}, // Default empty preferences if doc is missing
                 };
             }
             // If no Auth user matches either, something is wrong, return null
             console.warn(`No Auth user found matching UID ${userId} either.`);
             return null;
        }
    } catch (error) {
        console.error(`Error fetching profile data for user ${userId}:`, error);
         // On error, attempt to return basic data from Auth if available
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === userId) {
            console.warn("Returning basic Auth data due to Firestore fetch error.");
             return {
                 id: userId,
                 email: currentUser.email || 'N/A',
                 fullName: currentUser.displayName || currentUser.email || 'User',
                 phoneNumber: null, // Assume phone number wasn't fetched if error
                 profilePicUrl: currentUser.photoURL || null,
                 joinDate: currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime) : null,
                 preferences: {},
             };
        }
         // If no Auth user matches, re-throw the error or return null
        throw error; // Re-throw for caller handling
    }
};


// --- Storage Functions (PLACEHOLDERS) ---
// Example of how you might upload a profile picture
export const uploadProfilePicture = async (userId, imageUri, fileName = 'profile.jpg') => {
    if (!storage) {
        console.error("Firebase Storage not initialized. Cannot upload.");
        throw new Error("Storage not available.");
    }
     if (!userId) {
        console.error("Attempted to upload profile picture without a UID.");
        throw new Error("User UID is required to upload picture.");
    }

    try {
        // Fetch the image blob
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Create a storage reference
        const storageRef = ref(storage, `profilePictures/${userId}/${fileName}`); // Path example: /profilePictures/user_uid/profile.jpg

        // Upload the blob
        console.log(`Attempting to upload profile picture for user ${userId} to ${storageRef.fullPath}`);
        const uploadResult = await uploadBytes(storageRef, blob);
        console.log(`Upload successful. Snapshot:`, uploadResult.metadata);

        // Get the download URL
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log(`Profile picture download URL: ${downloadURL}`);

        // Optionally, save the download URL to the user's Firestore profile
        console.log("Saving profilePicUrl to Firestore...");
        await saveUserProfile(userId, { profilePicUrl: downloadURL }); // Use saveUserProfile to merge
        console.log("Profile picture URL saved to Firestore.");

        return downloadURL;
    } catch (error) {
        console.error(`Error uploading profile picture for user ${userId}:`, error);
        throw error; // Re-throw for caller handling
    }
};


// Export functions that were not exported inline using 'export const'
export {
  // Data Fetching Functions (Firestore first, then Mock fallback)
  getFeaturedDestinations,
  getUpcomingEvents,
  getTopRatedRestaurants,
  getRecommendedHotels,
  getPopularAttractions,
  getAttractionDetails, // For detail screen
  getHotelDetails, // For detail screen
  getRestaurantDetails, // For restaurant detail screen

  // Export mock data if needed elsewhere for reference or pure mock screens
  mockData // Optional export
};