const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const firebaseConfig = require('../firebase.js');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper functions
const getRandomRating = () => (Math.random() * 3 + 2).toFixed(1);
const getRandomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const getRandomImages = (count) => {
  const images = [];
  for (let i = 0; i < count; i++) {
    images.push(`https://source.unsplash.com/random/800x600/?hotel,${i}`);
  }
  return images;
};

const generateHotels = async (count) => {
  const hotels = [];
  for (let i = 0; i < count; i++) {
    hotels.push({
      name: `Hotel ${i + 1}`,
      description: `A beautiful hotel located in the heart of the city. Perfect for both business and leisure travelers.`,
      rating: getRandomRating(),
      price: getRandomPrice(50, 300),
      location: {
        latitude: 36.7538 + (Math.random() * 0.1),
        longitude: 3.0588 + (Math.random() * 0.1),
        address: `Street ${i + 1}, Algiers`
      },
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
      images: getRandomImages(5),
      rooms: [
        { type: 'Standard', price: getRandomPrice(50, 100), available: true },
        { type: 'Deluxe', price: getRandomPrice(100, 200), available: true },
        { type: 'Suite', price: getRandomPrice(200, 300), available: true }
      ],
      reviews: [
        { user: 'User1', rating: 4.5, comment: 'Great stay!' },
        { user: 'User2', rating: 5.0, comment: 'Amazing service!' }
      ]
    });
  }
  return hotels;
};

const generateRestaurants = async (count) => {
  const restaurants = [];
  const cuisines = ['Algerian', 'Italian', 'French', 'Chinese', 'Japanese', 'Mexican'];
  
  for (let i = 0; i < count; i++) {
    restaurants.push({
      name: `Restaurant ${i + 1}`,
      description: `A wonderful dining experience offering delicious ${cuisines[i % cuisines.length]} cuisine.`,
      rating: getRandomRating(),
      priceRange: getRandomPrice(10, 50),
      location: {
        latitude: 36.7538 + (Math.random() * 0.1),
        longitude: 3.0588 + (Math.random() * 0.1),
        address: `Street ${i + 1}, Algiers`
      },
      cuisine: cuisines[i % cuisines.length],
      images: getRandomImages(5),
      menu: [
        { name: 'Starter 1', price: getRandomPrice(5, 15) },
        { name: 'Main Course 1', price: getRandomPrice(15, 30) },
        { name: 'Dessert 1', price: getRandomPrice(5, 10) }
      ],
      reviews: [
        { user: 'User1', rating: 4.0, comment: 'Delicious food!' },
        { user: 'User2', rating: 4.5, comment: 'Great atmosphere!' }
      ]
    });
  }
  return restaurants;
};

const generateAttractions = async (count) => {
  const attractions = [];
  const types = ['Historical', 'Natural', 'Cultural', 'Religious', 'Modern'];
  
  for (let i = 0; i < count; i++) {
    attractions.push({
      name: `Attraction ${i + 1}`,
      description: `A must-visit ${types[i % types.length]} attraction in the city.`,
      rating: getRandomRating(),
      type: types[i % types.length],
      location: {
        latitude: 36.7538 + (Math.random() * 0.1),
        longitude: 3.0588 + (Math.random() * 0.1),
        address: `Street ${i + 1}, Algiers`
      },
      images: getRandomImages(5),
      openingHours: '9:00 AM - 6:00 PM',
      ticketPrice: getRandomPrice(5, 20),
      features: ['Guided Tours', 'Audio Guide', 'Gift Shop', 'Cafeteria'],
      reviews: [
        { user: 'User1', rating: 4.5, comment: 'Amazing place!' },
        { user: 'User2', rating: 5.0, comment: 'Highly recommended!' }
      ]
    });
  }
  return attractions;
};

const generateHikingTrails = async (count) => {
  const trails = [];
  const difficulties = ['Easy', 'Moderate', 'Challenging'];
  
  for (let i = 0; i < count; i++) {
    trails.push({
      name: `Hiking Trail ${i + 1}`,
      description: `A beautiful ${difficulties[i % difficulties.length]} hiking trail with stunning views.`,
      rating: getRandomRating(),
      difficulty: difficulties[i % difficulties.length],
      length: getRandomPrice(2, 10),
      duration: `${getRandomPrice(1, 5)} hours`,
      location: {
        latitude: 36.7538 + (Math.random() * 0.1),
        longitude: 3.0588 + (Math.random() * 0.1),
        address: `Trailhead ${i + 1}, Algiers`
      },
      images: getRandomImages(5),
      features: ['Scenic Views', 'Wildlife', 'Waterfalls', 'Picnic Areas'],
      reviews: [
        { user: 'User1', rating: 4.0, comment: 'Great trail!' },
        { user: 'User2', rating: 4.5, comment: 'Beautiful scenery!' }
      ]
    });
  }
  return trails;
};

const migrateData = async () => {
  try {
    // Generate data
    const hotels = await generateHotels(100);
    const restaurants = await generateRestaurants(100);
    const attractions = await generateAttractions(100);
    const hikingTrails = await generateHikingTrails(50);

    // Migrate to Firestore
    const collections = {
      hotels,
      restaurants,
      attractions,
      hikingTrails
    };

    for (const [collectionName, data] of Object.entries(collections)) {
      console.log(`Migrating ${collectionName}...`);
      for (const item of data) {
        await addDoc(collection(db, collectionName), item);
      }
      console.log(`Successfully migrated ${data.length} ${collectionName}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

migrateData(); 