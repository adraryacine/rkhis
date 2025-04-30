const { db } = require('../firebase');
const { collection, addDoc, setDoc, doc } = require('firebase/firestore');

// Mock data generators
const generateHotels = (count) => {
  const hotels = [];
  for (let i = 1; i <= count; i++) {
    hotels.push({
      id: `hotel_${i}`,
      name: `Hotel ${i}`,
      description: `A beautiful hotel with amazing views and great service. This is hotel number ${i}.`,
      price: Math.floor(Math.random() * 200) + 50,
      rating: (Math.random() * 2 + 3).toFixed(1),
      location: {
        latitude: 36.7538 + (Math.random() * 0.1 - 0.05),
        longitude: 5.0569 + (Math.random() * 0.1 - 0.05),
      },
      amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa', 'Gym'],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      ],
      rooms: [
        { type: 'Standard', price: Math.floor(Math.random() * 100) + 50 },
        { type: 'Deluxe', price: Math.floor(Math.random() * 150) + 100 },
        { type: 'Suite', price: Math.floor(Math.random() * 200) + 150 },
      ],
    });
  }
  return hotels;
};

const generateRestaurants = (count) => {
  const restaurants = [];
  const cuisines = ['Algerian', 'Italian', 'French', 'Chinese', 'Japanese', 'Mexican'];
  const priceRanges = ['$', '$$', '$$$'];
  
  for (let i = 1; i <= count; i++) {
    const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    const priceRange = priceRanges[Math.floor(Math.random() * priceRanges.length)];
    const rating = (Math.random() * 2 + 3).toFixed(1);
    
    restaurants.push({
      id: `restaurant_${i}`,
      name: `Restaurant ${i}`,
      description: `A wonderful restaurant serving delicious ${cuisine} cuisine.`,
      cuisine: cuisine,
      priceRange: priceRange,
      rating: parseFloat(rating),
      image: `https://picsum.photos/seed/restaurant_${i}/600/400`,
      location: {
        latitude: 36.7538 + (Math.random() * 0.1 - 0.05),
        longitude: 5.0569 + (Math.random() * 0.1 - 0.05),
        address: `Street ${i}, Algiers`
      },
      images: [
        `https://picsum.photos/seed/restaurant_${i}_1/600/400`,
        `https://picsum.photos/seed/restaurant_${i}_2/600/400`,
        `https://picsum.photos/seed/restaurant_${i}_3/600/400`
      ],
      menu: [
        { name: 'Starter', price: `$${Math.floor(Math.random() * 10 + 5)}` },
        { name: 'Main Course', price: `$${Math.floor(Math.random() * 20 + 10)}` },
        { name: 'Dessert', price: `$${Math.floor(Math.random() * 8 + 5)}` }
      ],
      reviews: [
        { user: 'User1', rating: 4.0, comment: 'Delicious food!' },
        { user: 'User2', rating: 4.5, comment: 'Great atmosphere!' }
      ]
    });
  }
  return restaurants;
};

const generateAttractions = (count) => {
  const attractions = [];
  for (let i = 1; i <= count; i++) {
    attractions.push({
      id: `attraction_${i}`,
      name: `Attraction ${i}`,
      description: `A must-visit attraction in the area. This is attraction number ${i}.`,
      type: ['Historical', 'Natural', 'Cultural'][Math.floor(Math.random() * 3)],
      rating: (Math.random() * 2 + 3).toFixed(1),
      location: {
        latitude: 36.7538 + (Math.random() * 0.1 - 0.05),
        longitude: 5.0569 + (Math.random() * 0.1 - 0.05),
      },
      images: [
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      ],
    });
  }
  return attractions;
};

// Function to send data to Firebase
const sendDataToFirebase = async (data, collectionName) => {
  try {
    console.log(`Sending ${data.length} items to ${collectionName}...`);
    
    for (const item of data) {
      await setDoc(doc(db, collectionName, item.id), item);
      console.log(`Added ${item.name} to ${collectionName}`);
    }
    
    console.log(`Successfully sent all ${collectionName} data to Firebase!`);
  } catch (error) {
    console.error(`Error sending ${collectionName} data:`, error);
  }
};

// Main function to generate and send all data
const generateAndSendMockData = async () => {
  try {
    // Generate mock data
    const hotels = generateHotels(10);
    const restaurants = generateRestaurants(10);
    const attractions = generateAttractions(10);

    // Send data to Firebase
    await sendDataToFirebase(hotels, 'hotels');
    await sendDataToFirebase(restaurants, 'restaurants');
    await sendDataToFirebase(attractions, 'attractions');

    console.log('All mock data has been generated and sent to Firebase!');
  } catch (error) {
    console.error('Error in generateAndSendMockData:', error);
  }
};

// Run the script
generateAndSendMockData(); 