import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  Linking,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  ScrollView, // Use ScrollView for vertical scrolling
  RefreshControl, // Added for pull-to-refresh
  Alert, // Added for placeholders
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withTiming,
  withDelay,
  FadeIn, // Added for entry animations
  SlideInLeft, // Added for entry animations
  withSpring, // Added for card press animation
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native'; // Added for navigation

// Import data fetching functions
import {
    getFeaturedDestinations,
    getUpcomingEvents,
    getTopRatedRestaurants,
    getRecommendedHotels,
    getPopularAttractions,
    // getUserProfile, // Use from AuthContext instead
} from '../services/dataService'; // Ensure path is correct

import { useAuth } from '../contexts/AuthContext'; // Import useAuth

// Import theme hook
import { useColorScheme } from 'react-native'; // For theming


// --- Constants & Utils ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = screenHeight * (screenWidth > 500 ? 0.3 : 0.38); // Adjust header height for wider screens
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 115 : 105;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const SPACING = 15; // Consistent spacing unit

// --- Image URLs (Use these as fallbacks if data fetching fails, or just for mock) ---
const headerImageUrl = 'https://images.unsplash.com/photo-1593468663047-3a188a3bc489?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const bejaiaCityImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg/1280px-Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg';
const aokasBeachImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Plage_d%27Aokas.jpg/1280px-Plage_d%27Aokas.jpg';
const tichyCornicheImageUrl = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/29/25/63/hotel-les-hammadites.jpg?w=1200&h=-1&s=1';
const capCarbonImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Phare_du_Cap_Carbon.jpg/1024px-Phare_du_Cap_Carbon.jpg';
const gourayaImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%E1%B4%B0.jpg/1024px-Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%E1%B4%B0.jpg';
const monkeyPeakImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Barbary_macaque_on_Monkey_Mountain.jpg/1024px-Barbary_macaque_on_Monkey_Mountain.jpg';
const placeNovImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Place_du_1er_Novembre_Bejaia.jpg/1024px-Place_du_1er_Novembre_Bejaia.jpg';
const briseDeMerImageUrl = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/92/d5/83/plage-de-boulimat.jpg?w=1200&h=-1&s=1';
const casbahImageUrl = 'https://live.staticflickr.com/65535/51260998338_a1974185c1_b.jpg';
const restaurant1ImageUrl = 'https://media-cdn.tripadvisor.com/media/photo-s/0f/3c/93/48/le-dauphin-bleu.jpg';
const restaurant2ImageUrl = 'https://media-cdn.tripadvisor.com/media/photo-s/0a/01/9e/8a/restaurant-el-djenina.jpg';
const restaurant3ImageUrl = 'https://media-cdn.tripadvisor.com/media/photo-s/13/6c/a4/95/la-voile-d-or.jpg';
const restaurant4ImageUrl = 'https://media-cdn.tripadvisor.com/media/photo-f/05/e3/7e/5a/pizzeria-venezia.jpg';
const hotel1ImageUrl = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/1a/9b/0d/hotel-exterior.jpg?w=1200&h=-1&s=1';
const hotel2ImageUrl = 'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/296065364.jpg?k=f8b5c3e0b2a2a625f1a6d6a17907c6a1e2c4c4a5a4f3a1c6f9e7b8d0a6b1c3d4&o=';
const hotel3ImageUrl = 'https://le-cristal-hotel-bejaia.booked.net/data/Photos/OriginalPhoto/11874/1187419/1187419507/Le-Cristal-Hotel-Bejaia-Exterior.JPEG';
const event1ImageUrl = 'https://via.placeholder.com/160x110/8A2BE2/FFFFFF?text=Theatre+Fest';
const event2ImageUrl = 'https://via.placeholder.com/160x110/DEB887/FFFFFF?text=Artisan+Fair';
const event3ImageUrl = 'https://via.placeholder.com/160x110/5F9EA0/FFFFFF?text=Music+Night';
const event4ImageUrl = 'https://via.placeholder.com/160x110/228B22/FFFFFF?text=Olive+Harvest';

// --- Placeholder Data (Structured to match potential API calls) ---
// This structure mirrors the fetching functions in dataService.js
// This is used as a fallback or initial structure if Firestore is empty
const initialMockData = {
  featuredDestinations: [
    { id: 'dest1', name: 'Bejaia City Exploration', image: bejaiaCityImageUrl, description: 'Historic port & vibrant center' },
    { id: 'dest2', name: 'Aokas Golden Sands', image: aokasBeachImageUrl, description: 'Relax on the stunning coastline' },
    { id: 'dest3', name: 'Tichy Seaside Promenade', image: tichyCornicheImageUrl, description: 'Enjoy cafes and sea views' },
    { id: 'dest4', name: 'Majestic Cap Carbon', image: capCarbonImageUrl, description: 'Iconic lighthouse & panoramas' },
  ],
  upcomingEvents: [
    { id: 'event1', name: 'Festival International de Théâtre', date: 'Oct 2024', location: 'Theatre Regional', image: event1ImageUrl },
    { id: 'event2', name: 'Artisan Fair - Aokas', date: 'Sept 15-17, 2024', location: 'Aokas Corniche', image: event2ImageUrl },
    { id: 'event3', name: 'Andalusian Music Evening', date: 'Sept 22, 2024', location: 'Maison de la Culture', image: event3ImageUrl },
    { id: 'event4', name: 'Olive Harvest Celebration', date: 'Nov 2024', location: 'Nearby Villages', image: event4ImageUrl },
  ],
  topRatedRestaurants: [
    { id: 'rest1', name: 'Le Dauphin Bleu', rating: 4.8, cuisine: 'Seafood, Mediterranean', image: restaurant1ImageUrl, priceRange: '$$$' },
    { id: 'rest2', name: 'Restaurant El Djenina', rating: 4.6, cuisine: 'Algerian, Grills', image: restaurant2ImageUrl, priceRange: '$$' },
    { id: 'rest3', name: 'La Voile d\'Or', rating: 4.5, cuisine: 'Italian, Pizza', image: restaurant3ImageUrl, priceRange: '$$' },
    { id: 'rest4', name: 'Pizzeria Venezia', rating: 4.4, cuisine: 'Pizza, Fast Food', image: restaurant4ImageUrl, priceRange: '$' },
  ],
  recommendedHotels: [
    { id: 'hotel1', name: 'Hotel Royal Bejaia', price: '~$140', rating: 4.7, image: hotel1ImageUrl, amenities: ['Pool', 'Spa', 'Restaurant'], latitude: 36.7520, longitude: 5.0860 },
    { id: 'hotel2', name: 'Hotel Zedek', price: '~$110', rating: 4.3, image: hotel2ImageUrl, amenities: ['Restaurant', 'Free WiFi'], latitude: 36.7510, longitude: 5.0870 },
    { id: 'hotel3', name: 'Le Cristal Hotel', price: '~$130', rating: 4.5, image: hotel3ImageUrl, amenities: ['Beachfront', 'Restaurant'], latitude: 36.7500, longitude: 5.0840 },
    { id: 'hotel4', name: 'Hotel Les Hammadites (Tichy)', price: '~$160', rating: 4.6, image: tichyCornicheImageUrl, amenities: ['Private Beach', 'Pool', 'Tennis'], latitude: 36.7650, longitude: 5.1200 },
  ],
  popularAttractions: [
    { id: 'attr1', name: 'Gouraya Park', description: 'Nature & Views', image: gourayaImageUrl, latitude: 36.7600, longitude: 5.0900, openingHours: '8 AM - 6 PM', entranceFee: '50 DZD' },
    { id: 'attr2', name: 'Monkey Peak', description: 'Wildlife Encounter', image: monkeyPeakImageUrl, latitude: 36.7680, longitude: 5.0920, openingHours: 'Always Open', entranceFee: 'Free' },
    { id: 'attr3', name: '1er Novembre Sq.', description: 'City Heart', image: placeNovImageUrl, latitude: 36.7550, longitude: 5.0850, openingHours: 'Always Open', entranceFee: 'Free' },
    { id: 'attr4', name: 'Brise de Mer', description: 'City Beach', image: briseDeMerImageUrl, latitude: 36.7570, longitude: 5.0800, openingHours: 'Always Open', entranceFee: 'Free' },
    { id: 'attr5', name: 'Casbah', description: 'Old City Charm', image: casbahImageUrl, latitude: 36.7580, longitude: 5.0880, openingHours: 'Always Open', entranceFee: 'Free' },
    { id: 'attr6', name: 'Cap Carbon', description: 'Lighthouse Views', image: capCarbonImageUrl, latitude: 36.7750, longitude: 5.0950, openingHours: 'Usually Daytime', entranceFee: 'Small fee for lighthouse' },
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


// Helper function to get consistent themed colors
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    primaryGreen: isDarkMode ? '#4CAF50' : '#00796B', // Example themed green
    primaryBlue: isDarkMode ? '#2196F3' : '#01579B', // Example themed blue
    primaryOrange: isDarkMode ? '#FF9800' : '#BF360C', // Example themed orange
    primaryRed: isDarkMode ? '#FF453A' : '#C62828', // Example themed red
    inputBorder: isDarkMode ? '#38383A' : '#E0E0E0',
    placeholder: isDarkMode ? '#636366' : '#B0BEC5',
});


// Helper function to get themed styles (using default colors if none provided)
const getThemedHomeStyles = (colors = getThemedColors(false)) => StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background, // Background color applied dynamically
  },
   scrollView: {
    flex: 1,
    backgroundColor: 'transparent', // Make scrollview transparent to see header
  },
  scrollViewContent: {
    paddingBottom: 80, // Space at the bottom to not hide content behind tab bar
    backgroundColor: colors.background,
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
  },
  loadingText: {
      marginTop: SPACING,
      fontSize: 16,
      color: colors.primaryGreen,
      fontWeight: '500',
  },
  linkText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accent,
      textDecorationLine: 'underline',
  },
  // --- Header Styles ---
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    overflow: 'hidden',
    backgroundColor: colors.primaryGreen + '30', // Fallback background
    zIndex: 1,
  },
  headerImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  headerImageOverlay: {
       ...StyleSheet.absoluteFillObject,
       backgroundColor: 'rgba(0, 47, 75, 0.45)', // Dark overlay
   },
  headerTextContent: {
      paddingHorizontal: SPACING * 1.5,
      paddingBottom: SPACING * 2,
      zIndex: 3,
  },
  greetingText: {
      fontSize: screenWidth > 500 ? 38 : 34, // Adjust font size for wider screens
      fontWeight: 'bold',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
      marginBottom: SPACING * 0.5,
  },
  locationText: {
       fontSize: screenWidth > 500 ? 22 : 19,
       fontWeight: '500',
       color: '#E1F5FE', // Light blue/cyan
       textShadowColor: 'rgba(0, 0, 0, 0.4)',
       textShadowOffset: { width: 1, height: 1 },
       textShadowRadius: 3,
       marginBottom: SPACING * 0.75,
  },
   weatherText: {
      fontSize: screenWidth > 500 ? 19 : 17,
      fontWeight: '500',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
  },
   // --- Search Bar Styles ---
   searchBarOuterContainer: {
        position: 'absolute',
        top: HEADER_MAX_HEIGHT - (SPACING * 3), // Position below header
        left: 0,
        right: 0,
        paddingHorizontal: SPACING * 1.5,
        // zIndex handled by animation
   },
   searchBarInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderColor: colors.inputBorder,
        borderWidth: 1,
        borderRadius: SPACING * 2,
        paddingLeft: SPACING * 1.2,
        paddingRight: SPACING * 0.8,
        height: SPACING * 4, // Height of the search bar
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 6,
   },
   searchIcon: {
        marginRight: SPACING,
   },
   searchBar: {
        flex: 1,
        height: '100%',
        fontSize: 17,
        color: colors.text,
   },
    searchFilterButton: {
        padding: SPACING * 0.7,
        marginLeft: SPACING * 0.4,
    },
   // --- General Section Styles ---
  sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: SPACING * 1.5,
      marginTop: SPACING * 2.5, // Adjusted spacing
      marginBottom: SPACING * 1.5, // Adjusted spacing
  },
  sectionTitle: {
    fontSize: 22, // Slightly smaller title
    fontWeight: 'bold',
    color: colors.primaryGreen, // Themed title color
  },
  sectionHeaderAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING * 0.3,
  },
  sectionHeaderActionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primaryGreen, // Themed link color
      marginRight: SPACING * 0.3,
  },
  horizontalListPadding: {
    paddingHorizontal: SPACING * 1.5,
    paddingBottom: SPACING * 1.5,
    paddingTop: SPACING * 0.3,
  },
   // --- Card Base Styles ---
    cardBase: {
        backgroundColor: colors.card,
        borderRadius: SPACING * 1.3,
        shadowColor: '#000', // Use black for shadow base
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, // Reduced opacity
        shadowRadius: 8, // Increased radius for softer shadow
        elevation: 3, // Match elevation for Android
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible', // Android needs overflow hidden for borderRadius + shadow
    },
  // --- Destination Card Styles ---
  destinationCard: {
    width: screenWidth * 0.7, // Make cards slightly smaller
    height: screenHeight * 0.28,
    marginRight: SPACING * 1.5,
  },
  destinationImage: {
      flex: 1,
      borderRadius: SPACING * 1.3,
      justifyContent: 'flex-end',
      overflow: 'hidden',
  },
  destinationGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '70%', // Make gradient cover more
  },
  destinationTextContainer: {
      padding: SPACING * 1.5,
      zIndex: 1,
  },
  destinationName: {
      fontSize: screenWidth > 500 ? 26 : 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: SPACING * 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
  },
  destinationDescription: {
      fontSize: screenWidth > 500 ? 16 : 14,
      color: '#F5F5F5',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0.5, height: 0.5 },
      textShadowRadius: 2,
  },
  // --- Hotel Card Styles ---
  hotelCard: {
      width: screenWidth * 0.6, // Adjust width
      marginRight: SPACING * 1.5,
  },
  hotelImage: {
      width: '100%',
      height: screenHeight * 0.18, // Adjust height
      borderTopLeftRadius: SPACING * 1.3,
      borderTopRightRadius: SPACING * 1.3,
  },
  hotelInfo: {
      padding: SPACING * 1.2, // Adjust padding
  },
  hotelName: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING * 0.4,
  },
  ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING * 0.5,
  },
  hotelRating: {
      fontSize: 14,
      color: colors.secondaryText,
      marginLeft: SPACING * 0.3,
      fontWeight: '500',
  },
  hotelPrice: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.primaryGreen, // Themed price color
      marginBottom: SPACING * 0.6,
  },
  hotelAmenities: {
      fontSize: 12,
      color: colors.secondaryText,
      opacity: 0.8,
  },
  // --- Event Card Styles ---
  eventCard: {
      width: screenWidth * 0.5, // Adjust width
      marginRight: SPACING * 1.5,
   },
  eventImage: {
      width: '100%',
      height: screenHeight * 0.15, // Adjust height
      borderTopLeftRadius: SPACING * 1.3,
      borderTopRightRadius: SPACING * 1.3,
  },
  eventInfo: {
      padding: SPACING, // Adjust padding
  },
  eventName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 20,
      marginBottom: SPACING * 0.5,
      minHeight: 40, // Ensure enough height for 2 lines
  },
  eventDateLocation: {
      fontSize: 13,
      color: colors.secondaryText,
      marginBottom: SPACING * 0.4,
  },
  eventLocationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING * 0.5,
  },
  // --- Restaurant Card Styles ---
  restaurantCard: {
      width: screenWidth * 0.55, // Adjust width
      marginRight: SPACING * 1.5,
  },
  restaurantImage: {
      width: '100%',
      height: screenHeight * 0.2, // Adjust height
      justifyContent: 'flex-end',
      borderTopLeftRadius: SPACING * 1.3,
      borderTopRightRadius: SPACING * 1.3,
      overflow: 'hidden',
  },
  restaurantGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '50%',
  },
  restaurantInfo: {
      padding: SPACING * 1.2, // Adjust padding
  },
  restaurantName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING * 0.4,
  },
  restaurantCuisine: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: SPACING * 0.6,
  },
 // --- Attraction Card Styles (Grid) ---
  attractionGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginHorizontal: SPACING * 1.5,
      paddingTop: SPACING * 0.5,
      marginBottom: SPACING * 2,
      rowGap: SPACING * 1.5, // Gap between rows
  },
  attractionCard: {
     width: (screenWidth - (SPACING * 3) - (SPACING * 1.5)) / 2, // Calculate width for 2 columns with padding
  },
  attractionImage: {
      height: screenHeight * 0.13,
      width: '100%',
      borderTopLeftRadius: SPACING * 1.3,
      borderTopRightRadius: SPACING * 1.3,
  },
  attractionName: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: SPACING * 0.8,
      marginBottom: SPACING * 0.3,
      marginHorizontal: SPACING,
      color: colors.text,
  },
  attractionDescription: {
      fontSize: 12,
      color: colors.secondaryText,
      paddingHorizontal: SPACING,
      paddingBottom: SPACING,
      opacity: 0.8,
  },
   // --- Outdoor Activities Styles ---
  outdoorActivitiesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center', // Center items if they don't fill the row
      marginHorizontal: SPACING,
      marginBottom: SPACING * 2.5,
      marginTop: SPACING * 1.5,
      gap: SPACING, // Gap between items
  },
  outdoorActivityButton: {
      alignItems: 'center',
      paddingVertical: SPACING * 1.2,
      paddingHorizontal: SPACING,
      minWidth: screenWidth / 4 - SPACING * 1.5, // Adjust width for 3-4 items per row
      borderRadius: SPACING,
      borderWidth: 1,
      borderColor: colors.primaryGreen + '80', // BorderColor applied dynamically
      backgroundColor: colors.card, // BackgroundColor applied dynamically
      shadowColor: '#000', // Use black for shadow base
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08, // Reduced opacity
      shadowRadius: 3, // Softer shadow
      elevation: 2,
  },
  outdoorActivityName: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.primaryGreen, // Color applied dynamically
      marginTop: SPACING * 0.6,
      textAlign: 'center',
  },
 // --- Info Section Styles ---
  infoSectionCard: {
      marginHorizontal: SPACING * 1.5,
      marginBottom: SPACING * 2.5,
      padding: SPACING * 1.8,
      borderRadius: SPACING * 1.5,
      backgroundColor: colors.card, // Background color applied dynamically
       shadowColor: '#000', // Use black for shadow base
       shadowOffset: { width: 0, height: 4 },
       shadowOpacity: 0.1, // Reduced opacity
       shadowRadius: 8, // Increased radius
       elevation: 3, // Match elevation
  },
  infoSubSection: {
      marginBottom: SPACING * 1.5,
      paddingBottom: SPACING * 1.2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border, // BorderColor applied dynamically
  },
  infoSubSectionNoBorder: {
      marginBottom: 0,
      paddingBottom: 0,
  },
  infoIconTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING,
  },
  infoCardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: SPACING * 0.8,
      // Color applied dynamically
  },
  infoCardText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.secondaryText, // Themed text color
      marginLeft: SPACING * 0.5, // Indent list items
      marginBottom: SPACING * 0.4,
  },
  // --- Transportation Styles ---
  transportContainer: {
      marginHorizontal: SPACING * 1.5,
      marginBottom: SPACING * 2.5,
      backgroundColor: colors.primaryBlue + '10', // Background color applied dynamically
      padding: SPACING * 1.5,
      paddingTop: SPACING,
      borderRadius: SPACING * 1.3,
      shadowColor: colors.primaryBlue, // Themed shadow color
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  transportItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: SPACING * 1.2,
      paddingBottom: SPACING * 1.2,
      borderBottomWidth: 1,
      borderBottomColor: colors.primaryBlue + '50', // BorderColor applied dynamically
      // For removing the bottom border on the last item, you'd need conditional styling in the map function
  },
  transportIcon: {
      marginRight: SPACING * 1.2,
      marginTop: SPACING * 0.2,
  },
  transportTextContainer: {
      flex: 1,
  },
  transportType: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primaryBlue, // Color applied dynamically
      marginBottom: SPACING * 0.4,
  },
  transportDetails: {
      fontSize: 14,
      color: colors.secondaryText, // Color applied dynamically
      lineHeight: 20,
  },
  // --- Emergency Contacts Styles ---
  emergencyContactsContainer: {
      marginHorizontal: SPACING * 1.5,
      marginBottom: SPACING * 3,
  },
  emergencyContactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryRed + '15', // BackgroundColor applied dynamically
      borderColor: colors.primaryRed + '50', // BorderColor applied dynamically
      padding: SPACING * 1.2,
      borderRadius: SPACING,
      marginBottom: SPACING,
      borderWidth: 1,
      shadowColor: colors.primaryRed, // Themed shadow color
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  emergencyContactInfo: {
      flex: 1,
      marginLeft: SPACING * 1.2,
      marginRight: SPACING * 0.8,
  },
  emergencyContactName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primaryRed, // Color applied dynamically
  },
  emergencyContactNumber: {
      fontSize: 15,
      color: colors.primaryRed, // Color applied dynamically
      marginTop: SPACING * 0.3,
  },
  // --- Footer Spacer ---
  footerSpacer: {
      height: SPACING * 3, // Space at the very bottom
  },
});


// --- Reusable Components (Adjusted for this app's needs) ---
// Section Header (similar to E-Campus)
const SectionHeader = React.memo(({ title, rightActionLabel, onRightActionPress, animatedStyle }) => (
  <Animated.View style={[getThemedHomeStyles().sectionHeaderContainer, animatedStyle]}>
    <Text style={getThemedHomeStyles().sectionTitle}>{title}</Text>
    {rightActionLabel && onRightActionPress && (
        <TouchableOpacity onPress={onRightActionPress} style={getThemedHomeStyles().sectionHeaderAction}>
            <Text style={getThemedHomeStyles().sectionHeaderActionText}>{rightActionLabel}</Text>
            <Ionicons name="arrow-forward-outline" size={16} color={getThemedHomeStyles().sectionHeaderActionText.color} />
        </TouchableOpacity>
    )}
  </Animated.View>
));

// Styled Card (similar to E-Campus)
const StyledCard = React.memo(({ children, style, onPress, animatedStyle, accessibilityLabel }) => {
    const scale = useSharedValue(1);
    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { damping: 10, stiffness: 200 }) }], // Use withSpring for bounce effect
    }));
    const handlePressIn = () => { scale.value = 0.97; };
    const handlePressOut = () => { scale.value = 1; };

    return (
        <Animated.View style={[getThemedHomeStyles().cardBase, style, animatedStyle, cardAnimatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                accessibilityLabel={accessibilityLabel}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
});

// Animated List Item (similar to E-Campus)
const AnimatedListItem = React.memo(({ children, index, delayMultiplier = 60, initialOffset = 40, duration = 500, rotate = false }) => {
    // Ensure delayMultiplier is not too large for faster loading sections
    const adjustedDelayMultiplier = Math.min(delayMultiplier, 100); // Cap the delay

    return (
        <Animated.View
            entering={
                SlideInLeft.delay(index * adjustedDelayMultiplier).duration(duration)
                 .withCallback((finished) => {
                     if (finished && rotate) {
                         // Optional: add a slight spring back after rotation if needed
                         // For simplicity, just fading/sliding in is usually enough
                     }
                 })
            }
            // Apply initial rotation if rotate is true (this will be part of the entering animation)
            // style={rotate ? { transform: [{ rotate: '-3deg' }] } : {}} // Initial rotation is part of entering animation now
        >
            {children}
        </Animated.View>
    );
});


const LoadingIndicator = ({ size = 'large', color = getThemedHomeStyles().loadingText.color }) => (
    <View style={getThemedHomeStyles().loadingContainer}>
        <ActivityIndicator size={size} color={color} />
        <Text style={getThemedHomeStyles().loadingText}>Loading Bejaia's Best...</Text>
    </View>
);


// --- Main Home Screen ---
function HomeScreen() {
  const navigation = useNavigation();
  const { currentUser, userData, isLoadingAuth } = useAuth(); // Get user and loading state from AuthContext
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode); // Define colors based on theme
  const styles = getThemedHomeStyles(colors); // Get themed styles

  const scrollY = useSharedValue(0);
  const [appData, setAppData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for home screen data
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation] = useState('Bejaia'); // Hardcoded for now
  const [greeting, setGreeting] = useState('Hello'); // Initial greeting
  const [weather, setWeather] = useState('Loading weather...'); // Placeholder for weather

  // --- Effects ---
  // Set dynamic greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

   // Fetch all data for the home screen
   const fetchAllData = useCallback(async () => {
       setIsLoading(true); // Set loading true initially
       // No need to set refreshing true here, it's handled by onRefresh
       try {
           // Fetch data using the dataService functions (which use mock data for now)
           const [
               featuredDestinations,
               upcomingEvents,
               topRatedRestaurants,
               recommendedHotels,
               popularAttractions,
           ] = await Promise.all([
               getFeaturedDestinations(),
               getUpcomingEvents(),
               getTopRatedRestaurants(),
               getRecommendedHotels(),
               getPopularAttractions(),
               // Add calls for other sections if they become dynamic
           ]);

           setAppData({
               featuredDestinations,
               upcomingEvents,
               topRatedRestaurants,
               recommendedHotels,
               popularAttractions,
               localCulture: initialMockData.localCulture, // Still using mock for static sections
               historicalSites: initialMockData.historicalSites,
               beachesCoastal: initialMockData.beachesCoastal,
               outdoorActivities: initialMockData.outdoorActivities,
               transportationInfo: initialMockData.transportationInfo,
               emergencyContacts: initialMockData.emergencyContacts,
           });

           setWeather('28°C, Clear Skies'); // Placeholder weather update

       } catch (error) {
           console.error("Error fetching data:", error);
           Alert.alert("Error", "Failed to load data for the home screen.");
            // Set appData to null or a default empty structure on error
           setAppData(null);
       } finally {
           setIsLoading(false);
           setRefreshing(false); // Ensure refreshing is turned off
       }
   }, []); // Dependencies: fetch functions are stable, userData might be needed if fetching user-specific data

   useEffect(() => {
       // Fetch data when the component mounts or when user data changes (if data becomes user-specific)
       // Only fetch if user is logged in and not already loading auth
        if (!isLoadingAuth && currentUser) {
             fetchAllData();
        } else if (!isLoadingAuth && !currentUser) {
             // Clear data if user logs out
             setAppData(null);
             setIsLoading(false);
             setRefreshing(false);
        }
   }, [isLoadingAuth, currentUser, fetchAllData]); // Depend on auth state and fetchAllData callback

   // Pull to refresh handler
   const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAllData(); // Call the main data fetching function
   }, [fetchAllData]);

  // --- Animations ---
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE], [0, -HEADER_SCROLL_DISTANCE], Extrapolate.CLAMP);
    return { transform: [{ translateY }] };
  });

  const headerContentAnimatedStyle = useAnimatedStyle(() => {
       const opacity = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE * 0.6], [1, 0], Extrapolate.CLAMP);
       const translateY = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE * 0.5], [0, 30], Extrapolate.CLAMP);
       return { opacity, transform: [{ translateY }] };
  });

  const headerImageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-HEADER_MAX_HEIGHT, 0], [1.6, 1], Extrapolate.CLAMP); // Effet Parallax/Zoom
    const translateY = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE],[0, HEADER_SCROLL_DISTANCE * 0.6], Extrapolate.CLAMP); // Effet Parallax vertical
    return { transform: [{ translateY }, { scale }] };
  });

  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const targetY = -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) + (Platform.OS === 'ios' ? 50 : 40);
    const translateY = interpolate( scrollY.value, [HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE], [0, targetY], Extrapolate.CLAMP);
    const finalTranslateY = scrollY.value >= HEADER_SCROLL_DISTANCE ? targetY : translateY;
    const zIndex = scrollY.value >= HEADER_SCROLL_DISTANCE ? 15 : 5; // To overlay header when scrolled up
    return { transform: [{ translateY: finalTranslateY }], zIndex };
  });

   // Helper for simple opacity/slide in animation on first section header
   const firstSectionHeaderAnimatedStyle = useAnimatedStyle(() => ({
       opacity: interpolate(scrollY.value, [0, 50], [0, 1], Extrapolate.CLAMP)
   }));


  // --- Render Helper Functions ---
  const renderDestinationCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={80}>
        <StyledCard
            style={styles.destinationCard}
            onPress={() => {
                console.log('Navigate to Destination:', item.name);
                // You'll likely need a specific destination detail screen
                // navigation.navigate('DestinationDetail', { destinationId: item.id });
                Alert.alert("Navigate", `Simulating navigation to ${item.name}`);
            }}
            accessibilityLabel={`View details for ${item.name}`}
        >
            <ImageBackground source={{ uri: item.image }} style={styles.destinationImage} resizeMode="cover">
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']} style={styles.destinationGradient} />
                <View style={styles.destinationTextContainer}>
                    <Text style={styles.destinationName}>{item.name}</Text>
                    <Text style={styles.destinationDescription}>{item.description}</Text>
                </View>
            </ImageBackground>
        </StyledCard>
    </AnimatedListItem>
  ), [navigation, styles]); // Add styles to dependencies if they change based on theme

  const renderHotelCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={70}>
      <StyledCard
           style={styles.hotelCard}
           onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id, hotel: item })} // Pass item for detail screen
           accessibilityLabel={`View details for ${item.name}`}
        >
        <Image source={{ uri: item.image }} style={styles.hotelImage} resizeMode="cover" />
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={15} color="#FFC107" />
            <Text style={styles.hotelRating}>{item.rating || 'N/A'}</Text>
          </View>
          {item.price && <Text style={styles.hotelPrice}>{item.price}/night</Text>}
          {item.amenities && Array.isArray(item.amenities) && item.amenities.length > 0 && <Text style={styles.hotelAmenities} numberOfLines={1}>{item.amenities.join(' • ')}</Text>}
        </View>
      </StyledCard>
    </AnimatedListItem>
  ), [navigation, styles]);

  const renderEventCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={75}>
      <StyledCard
           style={styles.eventCard}
           onPress={() => {
              console.log('Navigate to Event:', item.name);
              // navigation.navigate('EventDetail', { eventId: item.id }); // Assuming an EventDetail screen
              Alert.alert("Navigate", `Simulating navigation to Event: ${item.name}`);
           }}
           accessibilityLabel={`View event details for ${item.name}`}
        >
        <Image source={{ uri: item.image }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventName} numberOfLines={2}>{item.name}</Text>
          {item.date && item.location && (
            <>
              {item.date && <Text style={styles.eventDateLocation}>{item.date}</Text>}
              <View style={styles.eventLocationContainer}><Ionicons name="location-outline" size={12} color={styles.eventDateLocation.color} /><Text style={styles.eventDateLocation}> {item.location}</Text></View>
            </>
          )}
        </View>
      </StyledCard>
    </AnimatedListItem>
  ), [styles]);

  const renderRestaurantCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={80}>
      <StyledCard
           style={styles.restaurantCard}
           onPress={() => {
               console.log('Navigate to Restaurant:', item.name);
               // navigation.navigate('RestaurantDetail', { restaurantId: item.id }); // Assuming a RestaurantDetail screen
                Alert.alert("Navigate", `Simulating navigation to Restaurant: ${item.name}`);
           }}
           accessibilityLabel={`View details for ${item.name}`}
        >
        <ImageBackground source={{ uri: item.image }} style={styles.restaurantImage} resizeMode="cover">
          <LinearGradient colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.6)']} style={styles.restaurantGradient} />
        </ImageBackground>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
          {item.cuisine && item.priceRange && <Text style={styles.restaurantCuisine}>{item.cuisine} • {item.priceRange}</Text>}
          {item.rating && (
             <View style={styles.ratingContainer}><Ionicons name="star" size={16} color="#FFC107" /><Text style={styles.restaurantRating}>{item.rating}</Text></View>
          )}
        </View>
      </StyledCard>
    </AnimatedListItem>
  ), [styles]);

 const renderAttractionCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={50}>
        <StyledCard
            style={styles.attractionCard}
             onPress={() => navigation.navigate('AttractionDetail', { attractionId: item.id, attraction: item })} // Pass item for detail screen
             accessibilityLabel={`View details for ${item.name}`}
        >
            <Image source={{ uri: item.image }} style={styles.attractionImage} />
            <Text style={styles.attractionName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.attractionDescription} numberOfLines={1}>{item.description}</Text>
        </StyledCard>
    </AnimatedListItem>
), [navigation, styles]);


 // Render Local Culture Item
 const renderLocalCulture = useCallback((item, index) => (
    <AnimatedListItem key={item.id} index={index} delayMultiplier={60}>
        <View style={styles.infoCardItem}>
            <Text style={[styles.infoCardText, { color: styles.infoCardText.color }]}> • {item.description}</Text>
        </View>
    </AnimatedListItem>
 ), [styles]);

  // Render Historical Site Item
  const renderHistoricalSite = useCallback((item, index) => (
    <AnimatedListItem key={item.id} index={index} delayMultiplier={60}>
      <View style={styles.infoCardItem}>
        <Text style={[styles.infoCardText, { color: styles.infoCardText.color }]}> • {item.name}</Text>
      </View>
    </AnimatedListItem>
  ), [styles]);

  // Render Beach Item
  const renderBeach = useCallback((item, index) => (
    <AnimatedListItem key={item.id} index={index} delayMultiplier={60}>
      <View style={styles.infoCardItem}>
        <Text style={[styles.infoCardText, { color: styles.infoCardText.color }]}> • {item.name}</Text>
      </View>
    </AnimatedListItem>
  ), [styles]);

 // Render Outdoor Activity Button
 const renderOutdoorActivity = useCallback((item, index) => (
    <AnimatedListItem key={item.id} index={index} delayMultiplier={60}>
        <TouchableOpacity style={[styles.outdoorActivityButton, { borderColor: colors.primaryGreen + '80', backgroundColor: colors.card }]} onPress={() => console.log('Explore:', item.name)} activeOpacity={0.7} accessibilityLabel={`Explore ${item.name} activities`}>
            <Ionicons name={item.icon} size={34} color={colors.primaryGreen} />
            <Text style={[styles.outdoorActivityName, { color: colors.primaryGreen }]}>{item.name}</Text>
        </TouchableOpacity>
    </AnimatedListItem>
 ), [colors, styles]);


const renderTransportInfo = useCallback((item, index) => (
    <AnimatedListItem key={item.id} index={index} delayMultiplier={50}>
        <View style={[styles.transportItem, { borderBottomColor: colors.primaryBlue + '50' }]}>
            <Ionicons name={item.icon} size={28} color={colors.primaryBlue} style={styles.transportIcon} />
            <View style={styles.transportTextContainer}>
                 <Text style={[styles.transportType, { color: colors.primaryBlue }]}>{item.type}</Text>
                 <Text style={[styles.transportDetails, { color: colors.secondaryText }]}>{item.details}</Text>
            </View>
        </View>
    </AnimatedListItem>
), [colors, styles]);

  const renderEmergencyContact = useCallback((item, index) => (
    <AnimatedListItem key={item.id} index={index} delayMultiplier={50}>
      <TouchableOpacity style={[styles.emergencyContactButton, { backgroundColor: colors.primaryRed + '15', borderColor: colors.primaryRed + '50' }]} onPress={() => Linking.openURL(`tel:${item.number}`).catch(err => Alert.alert("Error", "Could not open dialer.")) } activeOpacity={0.7} accessibilityLabel={`Call ${item.name} at ${item.number}`}>
        <Ionicons name={item.icon} size={32} color={colors.primaryRed} />
        <View style={styles.emergencyContactInfo}>
          <Text style={[styles.emergencyContactName, { color: colors.primaryRed }]}>{item.name}</Text>
          <Text style={[styles.emergencyContactNumber, { color: colors.primaryRed }]}>{item.number}</Text>
        </View>
         <Ionicons name="call-outline" size={24} color={colors.primaryRed} />
      </TouchableOpacity>
    </AnimatedListItem>
  ), [colors, styles]);


  // --- Main Render Logic ---
  // Show loading state if AuthContext is still loading
  if (isLoadingAuth) {
       return (
           <View style={[styles.screenContainer, styles.loadingContainer]}>
               <ActivityIndicator size="large" color={colors.accent} />
               <Text style={styles.loadingText}>Checking authentication...</Text>
           </View>
       );
  }

  // If user is not logged in, this screen should not be reachable via AppNavigator,
  // but as a safeguard, we can show a message or redirect.
   if (!currentUser) {
        // This case should ideally be handled by AppNavigator switching to AuthStack
        // If you land here, there might be a navigation setup issue.
        console.warn("HomeScreen rendered without a logged-in user.");
        return (
            <View style={[styles.screenContainer, styles.loadingContainer]}>
                <Text style={[styles.loadingText, {color: colors.secondaryText}]}>Please log in to view this screen.</Text>
            </View>
        );
   }


  if (isLoading && !appData) {
      // Show loading indicator specifically for home screen data fetching
      return <LoadingIndicator color={colors.primaryGreen}/>;
  }

   if (!appData) {
        // Show error state if data fetching failed and no data is available
        return (
            <View style={[styles.screenContainer, styles.loadingContainer]}>
                <Text style={[styles.loadingText, {color: colors.primaryRed}]}>Failed to load data.</Text>
                 <TouchableOpacity onPress={fetchAllData} style={{marginTop: SPACING}}>
                     <Text style={[styles.linkText, {color: colors.accent}]}>Tap to Retry</Text>
                 </TouchableOpacity>
            </View>
        );
    }


  // Get user's first name for greeting
  const userFirstName = userData?.fullName ? userData.fullName.split(' ')[0] : (currentUser?.email ? currentUser.email.split('@')[0] : '');
  const formattedGreeting = `${greeting}${userFirstName ? ', ' + userFirstName : ''}!`;


  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" /> {/* Make status bar transparent to see header image */}

      {/* --- Animated Header Background --- */}
      <Animated.View style={[styles.headerBackgroundContainer, headerAnimatedStyle]}>
        <ImageBackground source={{ uri: headerImageUrl }} style={styles.headerImageBackground} resizeMode="cover">
            {/* Overlay for darkening/tinting */}
            <Animated.View style={[styles.headerImageOverlay, headerImageAnimatedStyle]} />
            {/* Header Text Content */}
            <Animated.View style={[styles.headerTextContent, headerContentAnimatedStyle]}>
                <Text style={styles.greetingText}>{formattedGreeting}</Text>
                <Text style={styles.locationText}>{userLocation}</Text>
                <Text style={styles.weatherText}>{weather}</Text>
            </Animated.View>
        </ImageBackground>
      </Animated.View>

       {/* --- Animated Search Bar --- */}
        <Animated.View style={[styles.searchBarOuterContainer, searchBarAnimatedStyle]}>
            <View style={[styles.searchBarInner, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
                <Ionicons name="search-outline" size={22} color={colors.secondaryText} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchBar, { color: colors.text }]}
                    placeholder={`Explore ${userLocation}...`}
                    placeholderTextColor={colors.placeholder}
                    // Placeholder for actual search functionality
                    onPressIn={() => { console.log("Search bar pressed"); Alert.alert("Search", "Search functionality coming soon!"); }} // Example action on press
                    editable={false} // Make it non-editable for now, just a visual element
                />
                <TouchableOpacity
                    style={styles.searchFilterButton}
                    accessibilityLabel="Filter search results"
                    onPress={() => { console.log("Filter button pressed"); Alert.alert("Filter", "Filter options coming soon!"); }} // Example action
                 >
                     <Ionicons name="options-outline" size={24} color={colors.primaryGreen} />
                </TouchableOpacity>
            </View>
        </Animated.View>

      {/* --- Scrollable Content --- */}
      {/* Use standard ScrollView for the content below the header */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16} // Important for smooth animation updates
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      >
        {/* Spacer to push content down below the fixed header */}
        <View style={{ height: HEADER_MAX_HEIGHT }} />

        {/* --- Sections Rendered Using appData --- */}

        {/* Section "Iconic Locations" */}
        <SectionHeader title="Iconic Locations" rightActionLabel="See All" onRightActionPress={() => { Alert.alert("See All", "See All Destinations coming soon!"); }} animatedStyle={firstSectionHeaderAnimatedStyle} />
        <FlatList
            data={appData.featuredDestinations}
            keyExtractor={(item) => item.id}
            renderItem={renderDestinationCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
            snapToInterval={screenWidth * 0.7 + SPACING * 1.5} // Adjust snap interval based on card width + margin
            decelerationRate="fast"
        />

        {/* Section "Comfortable Stays" */}
        <SectionHeader title="Comfortable Stays" rightActionLabel="View Hotels" onRightActionPress={() => navigation.navigate('Hotels', { hotels: appData.recommendedHotels })} /> {/* Navigate to Hotel List, passing data */}
        <FlatList
            data={appData.recommendedHotels}
            keyExtractor={(item) => item.id}
            renderItem={renderHotelCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
        />

        {/* Section "Upcoming Events" */}
        <SectionHeader title="Upcoming Events" rightActionLabel="Calendar" onRightActionPress={() => { Alert.alert("Calendar", "Events Calendar coming soon!"); }} />
         <FlatList
             data={appData.upcomingEvents}
             keyExtractor={(item) => item.id}
             renderItem={renderEventCard}
             horizontal
             showsHorizontalScrollIndicator={false}
             contentContainerStyle={styles.horizontalListPadding}
         />

        {/* Section "Top Rated Eats" */}
        <SectionHeader title="Top Rated Eats" rightActionLabel="Find Food" onRightActionPress={() => { Alert.alert("Find Food", "Restaurant List/Search coming soon!"); }} />
        <FlatList
            data={appData.topRatedRestaurants}
            keyExtractor={(item) => item.id}
            renderItem={renderRestaurantCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
        />

        {/* Section "Must-See Attractions" */}
        <SectionHeader title="Must-See Attractions" rightActionLabel="See All" onRightActionPress={() => { Alert.alert("See All", "See All Attractions coming soon!"); }}/>
        <View style={styles.attractionGridContainer}>
             {appData.popularAttractions.map((item, index) => renderAttractionCard({ item, index }))}
        </View>


         {/* Section "Get Active Outdoors" */}
        <SectionHeader title="Get Active Outdoors" />
        <View style={styles.outdoorActivitiesRow}>{appData.outdoorActivities.map((item, index) => renderOutdoorActivity(item, index))}</View>


         {/* --- Info Sections Card --- */}
         <AnimatedListItem index={appData.outdoorActivities.length + 1} delayMultiplier={100} initialOffset={50}> {/* Adjust index for animation delay */}
            <StyledCard style={[styles.infoSectionCard, {backgroundColor: colors.card}]} accessibilityLabel="Information about local culture, history, and beaches">
                <View style={[styles.infoSubSection, {borderBottomColor: colors.border}]}>
                    <View style={styles.infoIconTitle}><Ionicons name="earth-outline" size={26} color={colors.primaryGreen} /><Text style={[styles.infoCardTitle, {color: colors.primaryGreen}]}>Culture & Traditions</Text></View>
                     {appData.localCulture.map((item, index) => renderLocalCulture(item, index))}
                </View>
                 <View style={[styles.infoSubSection, {borderBottomColor: colors.border}]}>
                     <View style={styles.infoIconTitle}><Ionicons name="hourglass-outline" size={26} color={colors.primaryOrange} /><Text style={[styles.infoCardTitle, {color: colors.primaryOrange}]}>Historical Sites</Text></View>
                     {appData.historicalSites.map((item, index) => renderHistoricalSite(item, index))}
                 </View>
                  <View style={styles.infoSubSectionNoBorder}>
                     <View style={styles.infoIconTitle}><Ionicons name="water-outline" size={26} color={colors.primaryBlue} /><Text style={[styles.infoCardTitle, {color: colors.primaryBlue}]}>Beaches & Coastline</Text></View>
                     {appData.beachesCoastal.map((item, index) => renderBeach(item, index))}
                 </View>
            </StyledCard>
         </AnimatedListItem>

        {/* Section "Getting Around Bejaia" */}
        <SectionHeader title="Getting Around Bejaia" />
        <View style={[styles.transportContainer, { backgroundColor: colors.primaryBlue + '10' }]}>{appData.transportationInfo.map((item, index) => renderTransportInfo(item, index))}</View>

        {/* Section "Important Contacts" */}
        <SectionHeader title="Important Contacts" />
        <View style={styles.emergencyContactsContainer}>{appData.emergencyContacts.map((item, index) => renderEmergencyContact(item, index))}</View>

        {/* Espaceur final pour éviter que le dernier élément colle au TabNavigator */}
        <View style={styles.footerSpacer} />

      </Animated.ScrollView>
    </View>
  );
}

export default HomeScreen;