const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { db } = require('../firebase');

const destinations = [
  {
    name: "Bejaia City Center",
    description: "The vibrant heart of Bejaia, featuring historic architecture, bustling markets, and cultural landmarks. Explore the old town's narrow streets and discover local crafts and cuisine.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg/1280px-Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg/1280px-Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/B%C3%A9ja%C3%AFa_centre_ville.jpg/1280px-B%C3%A9ja%C3%AFa_centre_ville.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/B%C3%A9ja%C3%AFa_vue_g%C3%A9n%C3%A9rale.jpg/1280px-B%C3%A9ja%C3%AFa_vue_g%C3%A9n%C3%A9rale.jpg"
    ],
    location: {
      latitude: 36.7520,
      longitude: 5.0860,
      address: "Bejaia City Center, Bejaia, Algeria"
    },
    tags: ["city", "culture", "historic", "shopping"],
    priority: 1,
    rating: 4.5,
    reviews: 120,
    amenities: ["parking", "restaurants", "shops", "public transport", "markets"],
    nearbyAttractions: ["attraction1", "attraction2"],
    nearbyHotels: ["hotel1", "hotel2"],
    nearbyRestaurants: ["restaurant1", "restaurant2"]
  },
  {
    name: "Aokas Beach",
    description: "A beautiful coastal town with golden sandy beaches and crystal clear waters. Perfect for swimming, sunbathing, and enjoying fresh seafood at local restaurants.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Plage_d%27Aokas.jpg/1280px-Plage_d%27Aokas.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Plage_d%27Aokas.jpg/1280px-Plage_d%27Aokas.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Aokas_plage.jpg/1280px-Aokas_plage.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Aokas_corniche.jpg/1280px-Aokas_corniche.jpg"
    ],
    location: {
      latitude: 36.7700,
      longitude: 5.1400,
      address: "Aokas Beach, Bejaia, Algeria"
    },
    tags: ["beach", "coast", "swimming", "seafood"],
    priority: 2,
    rating: 4.7,
    reviews: 95,
    amenities: ["beach access", "restaurants", "parking", "showers"],
    nearbyAttractions: ["attraction3", "attraction4"],
    nearbyHotels: ["hotel3", "hotel4"],
    nearbyRestaurants: ["restaurant3", "restaurant4"]
  },
  {
    name: "Cap Carbon",
    description: "A stunning natural landmark with a historic lighthouse offering panoramic views of the Mediterranean Sea. Great for hiking and photography.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Phare_du_Cap_Carbon.jpg/1024px-Phare_du_Cap_Carbon.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Phare_du_Cap_Carbon.jpg/1024px-Phare_du_Cap_Carbon.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Cap_Carbon_vue.jpg/1280px-Cap_Carbon_vue.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Cap_Carbon_sentier.jpg/1280px-Cap_Carbon_sentier.jpg"
    ],
    location: {
      latitude: 36.8000,
      longitude: 5.1000,
      address: "Cap Carbon, Bejaia, Algeria"
    },
    tags: ["nature", "hiking", "views", "lighthouse"],
    priority: 3,
    rating: 4.8,
    reviews: 85,
    amenities: ["hiking trails", "viewpoints", "parking"],
    nearbyAttractions: ["attraction5", "attraction6"],
    nearbyHotels: ["hotel5", "hotel6"],
    nearbyRestaurants: ["restaurant5", "restaurant6"]
  },
  {
    name: "Tichy Beach",
    description: "A popular seaside resort town with a long sandy beach, perfect for families and water sports enthusiasts. The town offers a variety of accommodations and dining options.",
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/29/25/63/hotel-les-hammadites.jpg?w=1200&h=-1&s=1",
    images: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/29/25/63/hotel-les-hammadites.jpg?w=1200&h=-1&s=1",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Tichy_plage.jpg/1280px-Tichy_plage.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Tichy_promenade.jpg/1280px-Tichy_promenade.jpg"
    ],
    location: {
      latitude: 36.73428,
      longitude: 5.02874,
      address: "Tichy Beach, Bejaia, Algeria"
    },
    tags: ["beach", "resort", "family", "watersports"],
    priority: 4,
    rating: 4.6,
    reviews: 110,
    amenities: ["beach access", "hotels", "restaurants", "watersports", "parking"],
    nearbyAttractions: ["attraction7", "attraction8"],
    nearbyHotels: ["hotel7", "hotel8"],
    nearbyRestaurants: ["restaurant7", "restaurant8"]
  }
];

const populateDestinations = async () => {
  try {
    if (!db) {
      console.error('Firestore DB not initialized');
      return;
    }

    const destinationsCollection = collection(db, 'destinations');
    
    for (const destination of destinations) {
      const docRef = await addDoc(destinationsCollection, {
        ...destination,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added destination: ${destination.name} with ID: ${docRef.id}`);
    }

    console.log('Successfully populated destinations collection');
  } catch (error) {
    console.error('Error populating destinations:', error);
  }
};

// Run the population script
populateDestinations(); 