// screens/HomeScreen.js
import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
  Pressable,
  useColorScheme,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withSpring,
  FadeIn,
  SlideInLeft,
  ZoomIn,
  FadeInUp,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Keep AsyncStorage for caching app data
import { useSearch } from '../contexts/SearchContext';
import { useTheme } from '../contexts/ThemeContext';
import SearchBar from '../components/SearchBar';

// IMPORT THE SAVED ITEMS CONTEXT HOOK
import { useSavedItems } from '../contexts/SavedItemsContext'; // <-- USE THE CONTEXT HOOK (Adjust path)


// --- Placeholder Colors ---
const Colors = {
  light: {
    text: '#111827',
    background: '#ffffff',
    tint: '#007AFF', // Example iOS blue
    secondary: '#6b7280',
    border: '#e5e7eb',
    cardBackground: '#ffffff',
    placeholder: '#9ca3af',
    success: '#10b981',
    danger: '#ef4444',
    black: '#000000',
  },
  dark: {
    text: '#ecf0f1',
    background: '#121212',
    tint: '#0A84FF', // Example iOS blue dark
    secondary: '#a1a1aa',
    border: '#374151',
    cardBackground: '#1e1e1e',
    placeholder: '#71717a',
    success: '#34d399',
    danger: '#f87171',
    black: '#000000',
  },
  white: '#ffffff',
};

// --- Placeholder Auth Context --- (Keep for mock data logic)
const AuthContext = createContext(null);

// Example Hook - Provides mock data (Keep as is)
export const useAuth = () => {
    // Simulate auth state
    const [currentUser] = useState({ id: 'P6jRrBnSjCeUl8erFyUttvn2MOu2', email: 'user@example.com' }); // Assume logged in
    const [userData] = useState({ fullName: 'Bejaia Explorer', preferences: {} }); // Mock user data
    const [isLoadingAuth] = useState(false); // Assume auth check is complete

    return { currentUser, userData, isLoadingAuth };
};

// Example Provider (Not strictly needed for this single screen, but good practice)
// This AuthProvider should ideally wrap the SavedItemsProvider in your App.js
export const AuthProvider = ({ children }) => {
  const authValue = useAuth(); // Use the hook to get the mock values
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};


// --- Mock Data (Ensure valid icon names) ---
const initialMockData = {
  featuredDestinations: [ 
    { id: 'dest1',name: 'Bejaia City center',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Vue_g%C3%A9n%C3%A9rale_de_la_ville_de_Bejaia.jpg/2560px-Vue_g%C3%A9n%C3%A9rale_de_la_ville_de_Bejaia.jpg', 
    description: 'Historic port & vibrant center',
    tags: ['city', 'culture'],
    amenities: ['Pool', 'Spa', 'Restaurant'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Vue_g%C3%A9n%C3%A9rale_de_la_ville_de_Bejaia.jpg/2560px-Vue_g%C3%A9n%C3%A9rale_de_la_ville_de_Bejaia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Vue_g%C3%A9n%C3%A9rale_de_la_ville_de_Bejaia.jpg/2560px-Vue_g%C3%A9n%C3%A9rale_de_la_ville_de_Bejaia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Vue_g%C3%A9n%C3%A9rale_de_la_ville_de_Bejaia.jpg/2560px-Vue_g%C3%A9n%C3%A9rale_de_la_ville_de_Bejaia.jpg',
    ]

  },
    { id: 'dest2', name: 'Aokas beach',
       image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa8xUaR-IbIFutFvnib8by2NxRwIWn_tGtSA&s', 
       description: 'Relax on the stunning coastline',
       tags: ['city', 'culture','beach'] ,
       amenities: ['Pool', 'Spa', 'Restaurant'],
       images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa8xUaR-IbIFutFvnib8by2NxRwIWn_tGtSA&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa8xUaR-IbIFutFvnib8by2NxRwIWn_tGtSA&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa8xUaR-IbIFutFvnib8by2NxRwIWn_tGtSA&s',
      ]
      },
    { id: 'dest3', name: 'Tichy Seaside Town', 
      image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/377373240.jpg?k=ce45f8e76c785e6160ef3d1553325297f205df3585ef3910775d8128827f5675&o=&hp=1', 
      description: 'Charming coastal town life',
      tags: ['city', 'culture'],
      amenities: ['Pool', 'Spa', 'Restaurant'],
      images: [
        'https://cf.bstatic.com/xdata/images/hotel/max1024x768/377373240.jpg?k=ce45f8e76c785e6160ef3d1553325297f205df3585ef3910775d8128827f5675&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1024x768/377373240.jpg?k=ce45f8e76c785e6160ef3d1553325297f205df3585ef3910775d8128827f5675&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1024x768/377373240.jpg?k=ce45f8e76c785e6160ef3d1553325297f205df3585ef3910775d8128827f5675&o=&hp=1'
      ]
      },
  ],
   
  topRatedRestaurants: [
    { id: 'rest1', name: 'Le Dauphin Bleu', rating: 4.8,
       cuisine: 'Seafood, Mediterranean', image: 'https://media-cdn.tripadvisor.com/media/photo-m/1280/14/cc/e2/ff/photo1jpg.jpg', 
       priceRange: '250da - 500da' },
    { id: 'rest2', name: 'Restaurant la Citadelle', 
      rating: 4.5, cuisine: 'Algerian, Grill , Seafood', image: 'https://lh3.googleusercontent.com/p/AF1QipNxM52_3EspW-hISjnnXFin3WygZ0OBNLxf-jVI=w419-h240-k-no', priceRange: '150da - 300da' },
  ],
  recommendedHotels: [
    { id: 'hotel1', name: 'Hotel Royal Bejaia', price: '6000da - 12000da', rating: 4.7, image: 'https://hotelroyalbejaia.com/wp-content/uploads/2022/09/IMG_8525.jpg', 
    amenities: ['Pool', 'Spa', 'Restaurant'], latitude: 36.7520, longitude: 5.0860 ,
    images: ['https://hotelroyalbejaia.com/wp-content/uploads/2022/09/IMG_8525.jpg', 'https://hotelroyalbejaia.com/wp-content/uploads/2022/09/IMG_8525.jpg', 'https://hotelroyalbejaia.com/wp-content/uploads/2022/09/IMG_8525.jpg'], 
    description: 'Luxury hotel with stunning sea views and modern amenities.'
  },
    { id: 'hotel2', name: 'Les Hammadites Hotel', price: '5000da - 11500da', rating: 4.3,
       image: 'https://www.clicngo.biz/cr.fwk/images/hotels/Hotel-2737-20210830-101351.JPG',
        amenities: ['Beach Access', 'Restaurant'], latitude: 36.7700, longitude: 5.1400 ,
        description: 'Luxury hotel with stunning sea views and modern amenities.',
        images: ['https://www.clicngo.biz/cr.fwk/images/hotels/Hotel-2737-20210830-101351.JPG',
         'https://www.clicngo.biz/cr.fwk/images/hotels/Hotel-2737-20210830-101351.JPG', 
        'https://www.clicngo.biz/cr.fwk/images/hotels/Hotel-2737-20210830-101351.JPG']}
  ],
  popularAttractions: [
    { id: 'attraction_1', name: 'Gouraya Park', description: 'Nature & Views', image: 'https://www.bejaia-guidedepoche.com/images/CouvertureLieu/127/_thumb2/fortgouraya.jpg', latitude: 36.7600, longitude: 5.0900, openingHours: '8 AM - 6 PM', entranceFee: '50 DZD' },
    { id: 'attraction_2', name: 'Cap Carbon', description: 'Panoramic Coastal Views', image: 'https://dia-algerie.com/wp-content/uploads/2021/03/cap-carbon.jpg', latitude: 36.785, longitude: 5.105 },
    { id: 'attraction_3', name: 'Place Guidon', description: 'City Center Square', image: 'https://www.bejaia-guidedepoche.com/images/CouvertureLieu/206/place-guidon-5.jpg', latitude: 36.753, longitude: 5.083 },
    { id: 'attraction_4', name: 'Monkey Peak (Pic des Singes)', description: 'Hiking & Wildlife Spotting', image: 'https://www.bejaia-guidedepoche.com/images/CouvertureLieu/145/_thumb2/35fa47a2117d0d3a3615d4735c385cda.jpg', latitude: 36.765, longitude: 5.095 },
  ],
  localCulture: [
    { id: 'cult1', title: 'Kabyle Heritage', description: 'Explore the unique Berber traditions, language (Taqbaylit), and vibrant music of the region.' },
    { id: 'cult2', title: 'Local Crafts', description: 'Discover traditional pottery, jewelry, and textiles in local markets.' },
  ],
  historicalSites: [
    { id: 'hist1', name: 'Casbah of Bejaia', description: 'Wander the narrow streets of the ancient fortified city.', latitude: 36.7580, longitude: 5.0880 },
    { id: 'hist2', name: 'Bab El Fouka Gate', description: 'Historic gate marking an entrance to the old city.', latitude: 36.7565, longitude: 5.0875 },
  ],
  beachesCoastal: [
    { id: 'beach1', name: 'Les Aiguades', description: 'Known for clear turquoise water, dramatic cliffs, and snorkeling.', latitude: 36.7700, longitude: 5.1400 },
    { id: 'beach2', name: 'Sakamody Beach', description: 'Popular spot with restaurants and water activities.', latitude: 36.7505, longitude: 5.0600 },
  ],
  // Updated Outdoor Activities - FIX IONICON NAMES
  outdoorActivities: [
    { id: 'out1', name: 'Hiking', icon: 'walk-outline' },
    { id: 'out2', name: 'Parapente', icon: 'airplane-outline' },
    { id: 'out3', name: 'Swimming', icon: 'water-outline' },
  ],
  transportationInfo: [
    { id: 'trans1', type: 'City Buses (ETUB)', details: 'Affordable network, check routes beforehand.', icon: 'bus-outline' },
    { id: 'trans2', type: 'Taxis', details: 'Readily available, agree on fare before starting.', icon: 'car-sport-outline' },
  ],
  emergencyContacts: [
    { id: 'police', name: 'Police', number: '17', icon: 'shield-checkmark-outline' },
    { id: 'ambulance', name: 'Ambulance (SAMU)', number: '14', icon: 'medkit-outline' },
    { id: 'fire', name: 'Civil Protection (Fire)', number: '1021', icon: 'flame-outline' },
  ],
};

// --- Placeholder Data Fetching Functions --- (Keep as is)
const MOCK_DELAY = 500; // Simulate network latency

const getFeaturedDestinations = () => new Promise(resolve => setTimeout(() => resolve(initialMockData.featuredDestinations), MOCK_DELAY));
const getTopRatedRestaurants = () => new Promise(resolve => setTimeout(() => resolve(initialMockData.topRatedRestaurants), MOCK_DELAY + 200));
const getRecommendedHotels = () => new Promise(resolve => setTimeout(() => resolve(initialMockData.recommendedHotels), MOCK_DELAY + 300));
const getPopularAttractions = () => new Promise(resolve => setTimeout(() => resolve(initialMockData.popularAttractions), MOCK_DELAY + 400));


// --- Constants & Utils ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = screenHeight * (screenWidth > 500 ? 0.35 : 0.4);
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 120 : 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const SPACING = 16;
const CARD_SHADOW = {
  shadowColor: Colors.light.black, // Default light mode shadow
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 4,
};

// Placeholder Images
const headerImageUrl = 'https://www.thecasbahpost.com/wp-content/uploads/2017/07/Sam-Semmani-Bejaia.jpg';
// Fallback image in case others fail
const fallbackPlaceholderImage = 'https://via.placeholder.com/300x200/cccccc/969696?text=Image+Error';


// --- Themed Styles --- (Keep as is, ensure correct icon names in use)
const getThemedStyles = (isDarkMode = false) => {
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const dynamicCardShadow = {
    ...CARD_SHADOW,
    shadowColor: colors.black,
  };

  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingBottom: 100,
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
      color: colors.tint,
      fontWeight: '600',
    },
    linkText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.tint,
      textDecorationLine: 'underline',
    },
    // Header
    headerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_MAX_HEIGHT,
      overflow: 'hidden',
      zIndex: 10,
      backgroundColor: colors.secondary,
    },
    headerImageBackground: {
      width: '100%',
      height: '100%',
      justifyContent: 'flex-end',
    },
    headerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.4)',
    },
    headerContent: {
      paddingHorizontal: SPACING * 1.5,
      paddingBottom: SPACING * 4,
      zIndex: 3,
    },
    greetingText: {
      fontSize: screenWidth > 500 ? 36 : 32,
      fontWeight: '800',
      color: Colors.white,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
    },
    locationText: {
      fontSize: screenWidth > 500 ? 20 : 18,
      fontWeight: '600',
      color: Colors.white,
      opacity: 0.9,
      marginVertical: SPACING * 0.5,
    },
    weatherContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: SPACING,
      paddingVertical: SPACING * 0.5,
      paddingHorizontal: SPACING,
      alignSelf: 'flex-start',
      marginTop: SPACING * 0.5,
    },
    weatherText: {
      fontSize: 16,
      fontWeight: '500',
      color: Colors.white,
      marginLeft: SPACING * 0.5,
    },
    // Search Bar
    searchBarContainer: {
      position: 'absolute',
      top: HEADER_MAX_HEIGHT - SPACING * 2.5,
      left: SPACING * 1.5,
      right: SPACING * 1.5,
      zIndex: 15,
    },
    searchBarInner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: SPACING * 2,
      paddingHorizontal: SPACING,
      height: SPACING * 3.5,
      borderWidth: 1,
      borderColor: colors.border,
      ...dynamicCardShadow,
    },
    searchIcon: {
      marginRight: SPACING,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    searchButton: {
      padding: SPACING * 0.5,
    },
    // Section Header
    sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: SPACING * 1.5,
      marginTop: SPACING * 2,
      marginBottom: SPACING * 1.5,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    seeAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.tint,
    },
    // Cards - Base Style
    cardBase: {
      backgroundColor: colors.cardBackground,
      borderRadius: SPACING * 1.5,
      ...dynamicCardShadow,
      overflow: 'hidden',
    },
    // Destination Card
    destinationCard: {
      width: screenWidth * 0.75,
      height: screenHeight * 0.3,
      backgroundColor: colors.border, // Placeholder background
    },
    destinationImage: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    destinationContent: {
      padding: SPACING,
    },
    destinationName: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors.white,
    },
    destinationDescription: {
      fontSize: 14,
      color: Colors.white,
      opacity: 0.9,
      marginTop: SPACING * 0.25,
    },
    // Hotel Card
    hotelCard: {
      width: screenWidth * 0.65,
      backgroundColor: colors.border, // Placeholder background
    },
    hotelImage: {
      width: '100%',
      height: screenHeight * 0.18,
    },
    hotelInfo: {
      padding: SPACING,
    },
    hotelName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING * 0.25,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: SPACING * 0.5,
    },
    hotelRating: {
      fontSize: 14,
      color: colors.secondary,
      marginLeft: SPACING * 0.5,
    },
    hotelPrice: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.success,
      marginTop: SPACING * 0.25,
    },
     // Restaurant Card
    restaurantCard: {
      width: screenWidth * 0.6,
       backgroundColor: colors.border, // Placeholder background
    },
    restaurantImage: {
      width: '100%',
      height: screenHeight * 0.18,
    },
    restaurantInfo: {
      padding: SPACING,
    },
    restaurantName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING * 0.25,
    },
    restaurantDetails: {
      fontSize: 14,
      color: colors.secondary,
      marginTop: SPACING * 0.5,
    },
    // Attraction Card (Grid Layout)
    attractionCardContainer: {
       width: (screenWidth - SPACING * 4.5) / 2,
       // No bottom margin here, it's handled by the FlatList columnWrapper
    },
    attractionCard: {
      flex: 1,
       backgroundColor: colors.border, // Placeholder background
    },
    attractionImage: {
      width: '100%',
      height: screenHeight * 0.15,
    },
    attractionName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      paddingHorizontal: SPACING,
      paddingVertical: SPACING * 0.75,
    },
    // Info Sections (Culture, History etc.)
    infoCard: {
      marginHorizontal: SPACING * 1.5,
      marginVertical: SPACING,
      padding: SPACING * 1.5,
      borderRadius: SPACING * 1.5,
      backgroundColor: colors.cardBackground,
      ...dynamicCardShadow,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING,
    },
    infoText: {
      fontSize: 14,
      color: colors.secondary,
      lineHeight: 20,
      marginBottom: SPACING * 0.5,
    },
    infoItemContainer: {
       flexDirection: 'row',
       marginBottom: SPACING * 0.5,
       alignItems: 'flex-start',
    },
    infoBullet: {
        fontSize: 14,
        color: colors.secondary,
        marginRight: SPACING * 0.5,
        lineHeight: 20,
    },
    infoItemText: {
        flex: 1,
        fontSize: 14,
        color: colors.secondary,
        lineHeight: 20,
    },
    // Outdoor Activity Card
    outdoorActivityCardContainer: {
        width: (screenWidth - SPACING * 4.5) / 3, // Designed for 3 columns
        padding: SPACING * 0.75, // Add padding to create space around card
    },
    outdoorActivityCard: {
        flex: 1, // Make card take up container space
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING,
        minHeight: 90, // Ensure minimum height
    },
    outdoorActivityText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.tint,
        marginTop: SPACING * 0.5,
        textAlign: 'center',
    },
    outdoorGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between', // Distribute items evenly
      marginHorizontal: SPACING * 0.75, // Offset for padding in itemContainer
      marginTop: SPACING * 0.5,
    },
    // Transport
    transportItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING,
    },
    transportItemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    transportIcon: {
      marginRight: SPACING,
    },
    transportTextContainer: {
        flex: 1,
    },
    transportType: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    transportDetails: {
      fontSize: 14,
      color: colors.secondary,
      marginTop: 2,
    },
    // Emergency Contacts
    emergencyContactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING,
      borderRadius: SPACING,
      backgroundColor: colors.cardBackground,
      ...dynamicCardShadow,
      marginBottom: SPACING,
    },
    emergencyContactInfo: {
      flex: 1,
      marginHorizontal: SPACING,
    },
    emergencyContactName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.danger,
    },
    emergencyContactNumber: {
      fontSize: 14,
      color: colors.danger,
    },
    // FlatList specific styles
    horizontalListContent: {
      paddingHorizontal: SPACING * 1.5, // Add padding left/right
      paddingVertical: SPACING * 0.5,
    },
    horizontalListItem: {
         marginRight: SPACING * 1.5, // Add space between items horizontally
    },
    attractionsColumnWrapper: {
       justifyContent: 'space-between', // Distribute columns evenly
       paddingHorizontal: SPACING * 0.75, // Offset for itemContainer padding
       marginBottom: SPACING * 1.5, // Add vertical space between rows
    },
    attractionsContentContainer: {
        paddingHorizontal: SPACING * 0.75, // Add padding left/right
         // No padding bottom here, main scroll view handles it
    },
    // Save Icon Button
    saveButton: {
        position: 'absolute',
        top: SPACING * 0.75,
        right: SPACING * 0.75,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent dark background
        borderRadius: 15, // Circle background
        padding: SPACING * 0.4,
        zIndex: 5, // Ensure button is above image/content
    },
    saveIcon: {
        // Color set dynamically based on saved state below
    },
    searchBar: {
      marginTop: Platform.OS === 'ios' ? 44 : 0,
    },
    searchResultsContainer: {
      flex: 1,
      padding: SPACING,
    },
    searchResultsList: {
      paddingBottom: SPACING * 2,
    },
    searchResultItem: {
      flexDirection: 'row',
      marginBottom: SPACING,
      borderRadius: 12,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    searchResultImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    searchResultContent: {
      flex: 1,
      padding: SPACING,
      justifyContent: 'space-between',
    },
    searchResultHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING / 2,
    },
    searchResultTitle: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
      marginRight: SPACING,
    },
    searchResultType: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchResultTypeText: {
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
    },
    searchResultDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
    noResultsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING * 2,
    },
    noResultsText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: SPACING,
    },
    noResultsSubtext: {
      fontSize: 14,
      marginTop: SPACING / 2,
      textAlign: 'center',
    },
    hotelsSection: {
      marginBottom: SPACING * 2,
    },
    otherResultsSection: {
      flex: 1,
    },
    hotelsList: {
      paddingRight: SPACING,
    },
    hotelSearchCard: {
      width: 200,
      marginRight: SPACING,
      borderRadius: 12,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    hotelSearchImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
    },
    hotelSearchContent: {
      padding: SPACING,
    },
    hotelSearchName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: SPACING / 2,
    },
    hotelSearchInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    hotelSearchRating: {
      fontSize: 14,
      marginLeft: 4,
      marginRight: SPACING,
    },
    hotelSearchPrice: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
};


// --- Reusable Components --- (Keep as is)
const SectionHeader = React.memo(({ title, onSeeAll, isDarkMode }) => {
  const styles = getThemedStyles(isDarkMode);
  return (
    <Animated.View
        entering={FadeInUp.duration(500).delay(100)}
        style={styles.sectionHeaderContainer}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} accessibilityRole="button" accessibilityLabel={`See all ${title}`}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

const AnimatedCard = React.memo(({ children, style, onPress, accessibilityLabel, isDarkMode }) => {
  const scale = useSharedValue(1);
  const styles = getThemedStyles(isDarkMode);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 150 }) }],
  }));

  return (
    // Use Pressable for touch feedback and accessibility
    <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = 0.96)}
        onPressOut={() => (scale.value = 1)}
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
            styles.cardBase,
            style,
            // Optional: Add slight press visual feedback
            { opacity: pressed ? 0.9 : 1 }
        ]}
    >
        <Animated.View style={[{flex: 1}, animatedStyle]}>
             {children}
        </Animated.View>
    </Pressable>
  );
});


const LoadingAnimation = ({ isDarkMode }) => {
    const styles = getThemedStyles(isDarkMode);
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={styles.loadingText.color} />
            <Text style={styles.loadingText}>Discovering Bejaia...</Text>
        </View>
    );
};


// --- Main Home Screen ---
function HomeScreen() {
  // Hooks initialized first
  const navigation = useNavigation();
  const { currentUser, userData, isLoadingAuth } = useAuth(); // Using placeholder hook
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { colors } = useTheme();
  const styles = getThemedStyles(isDarkMode); // Get themed styles once

  // --- Use Saved Items Context ---
  // Get the helper function to check saved status and the function to toggle status
  const { isItemSaved, toggleSaveItem } = useSavedItems(); // <-- USE THE CONTEXT HOOK

  const scrollY = useSharedValue(0);
  const [appData, setAppData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation] = useState('Bejaia'); // Could be dynamic later
  const [greeting, setGreeting] = useState('Hello');
  // FIX: Use valid initial icon name
  const [weather, setWeather] = useState({ temp: '--°C', condition: 'Loading...', icon: 'sync-outline' });

  // State for image loading errors (optional, for fallback UI)
  const [imageErrors, setImageErrors] = useState({});
  const handleImageError = useCallback((id) => {
      setImageErrors(prev => ({ ...prev, [id]: true }));
      console.log(`Failed to load image for ID: ${id}`);
  }, []);

  const { search, searchResults, isSearching } = useSearch();
  const [allData, setAllData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Combine all data for search
  useEffect(() => {
    const combinedData = [
      ...(appData?.featuredDestinations || []),
      ...(appData?.topRatedRestaurants || []),
      ...(appData?.recommendedHotels || []),
      ...(appData?.popularAttractions || [])
    ];
    setAllData(combinedData);
  }, [appData]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    search(query, allData);
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Searching...</Text>
        </View>
      );
    }

    if (searchResults.length > 0) {
      // Filter hotels from search results
      const hotels = searchResults.filter(item => item.type === 'hotel');
      const otherResults = searchResults.filter(item => item.type !== 'hotel');

      return (
        <View style={[styles.searchResultsContainer, { backgroundColor: colors.background }]}>
          {hotels.length > 0 && (
            <View style={styles.hotelsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Hotels</Text>
              <FlatList
                data={hotels}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => navigation.navigate('HotelDetail', { hotel: item, item, type: 'hotel' })}
                    style={({ pressed }) => [
                      styles.hotelSearchCard,
                      { 
                        backgroundColor: colors.card,
                        opacity: pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }]
                      }
                    ]}
                  >
                    <Image
                      source={{ uri: item.image || fallbackPlaceholderImage }}
                      style={styles.hotelSearchImage}
                      onError={() => console.log(`Failed to load image for hotel: ${item.name}`)}
                    />
                    <View style={styles.hotelSearchContent}>
                      <Text style={[styles.hotelSearchName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.hotelSearchInfo}>
                        <Ionicons name="star" size={14} color={colors.success} />
                        <Text style={[styles.hotelSearchRating, { color: colors.secondary }]}>
                          {item.rating || 'N/A'}
                        </Text>
                        <Text style={[styles.hotelSearchPrice, { color: colors.success }]}>
                          {item.price || 'Price on request'}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                )}
                contentContainerStyle={styles.hotelsList}
              />
            </View>
          )}

          {otherResults.length > 0 && (
            <View style={styles.otherResultsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Other Results</Text>
              <FlatList
                data={otherResults}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => {
                  const itemType = item.type || 'location';
                  const itemName = item.name || item.title || 'Untitled';
                  const itemDescription = item.description || 'No description available';
                  const itemImage = item.image || fallbackPlaceholderImage;

                  const handleNavigation = () => {
                    const navigationParams = {
                      [itemType]: item,
                      item: item,
                      type: itemType
                    };

                    switch (itemType) {
                      case 'restaurant':
                        navigation.navigate('RestaurantDetail', navigationParams);
                        break;
                      case 'attraction':
                        navigation.navigate('AttractionDetail', navigationParams);
                        break;
                      case 'destination':
                        navigation.navigate('DestinationDetail', navigationParams);
                        break;
                        case 'hotel':
                          navigation.navigate('HotelDetail', navigationParams);
                          break;
                      default:
                        // For any other type, navigate to the appropriate detail screen
                        if (itemType === 'location') {
                          navigation.navigate('DestinationDetail', navigationParams);
                        } else {
                          console.warn(`No navigation handler for type: ${itemType}`);
                        }
                    }
                  };

                  return (
                    <Pressable
                      onPress={handleNavigation}
                      style={({ pressed }) => [
                        styles.searchResultItem,
                        { 
                          backgroundColor: colors.card,
                          opacity: pressed ? 0.8 : 1,
                          transform: [{ scale: pressed ? 0.98 : 1 }]
                        }
                      ]}
                    >
                      <Image
                        source={{ uri: itemImage }}
                        style={styles.searchResultImage}
                        onError={() => console.log(`Failed to load image for item: ${itemName}`)}
                      />
                      <View style={styles.searchResultContent}>
                        <View style={styles.searchResultHeader}>
                          <Text style={[styles.searchResultTitle, { color: colors.text }]} numberOfLines={1}>
                            {itemName}
                          </Text>
                          <View style={styles.searchResultType}>
                            <Ionicons 
                              name={
                                itemType === 'restaurant' ? 'restaurant-outline' : 
                                itemType === 'destination' ? 'location-outline' :
                                itemType === 'location' ? 'location-outline' :
                                'help-circle-outline'
                              } 
                              size={16} 
                              color={colors.tint} 
                            />
                            <Text style={[styles.searchResultTypeText, { color: colors.tint }]}>
                              {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.searchResultDescription, { color: colors.secondary }]} numberOfLines={2}>
                          {itemDescription}
                        </Text>
                      </View>
                    </Pressable>
                  );
                }}
                contentContainerStyle={styles.searchResultsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={[styles.noResultsContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="search-outline" size={60} color={colors.secondary} />
        <Text style={[styles.noResultsText, { color: colors.text }]}>
          No results found
        </Text>
        <Text style={[styles.noResultsSubtext, { color: colors.secondary }]}>
          Try different keywords
        </Text>
      </View>
    );
  };

  // --- Animations ---
  const handleScroll = (event) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    ),
  }));
  const headerContentAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE / 2],
          [1, 0],
          Extrapolate.CLAMP
      ),
      transform: [{
          translateY: interpolate(
              scrollY.value,
              [0, HEADER_SCROLL_DISTANCE],
              [0, 50], // Move content up as header shrinks
              Extrapolate.CLAMP
          )
      }]
  }));
  const headerImageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      // Scale up the image slightly when scrolling down past 0
      { scale: interpolate(scrollY.value, [-HEADER_MAX_HEIGHT, 0], [1.8, 1], Extrapolate.CLAMP) },
      // Translate the image down slightly as header shrinks (parallax effect)
      { translateY: interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE], [0, HEADER_SCROLL_DISTANCE * 0.5], Extrapolate.CLAMP) },
    ],
  }));
   const searchBarAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          // Move the search bar up so it sticks below the min header height
          translateY: interpolate(
            scrollY.value,
            [0, HEADER_SCROLL_DISTANCE],
            [0, -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - SPACING * 1.5)], // Adjusted translation
            Extrapolate.CLAMP
          ),
        },
      ],
    }));


  // --- Effects ---
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening');
    // Placeholder weather
     // FIX: Use valid ionicon name
    const placeholderWeather = { temp: '28°C', condition: 'Clear', icon: 'sunny-outline' }; // Changed weather-sunny to sunny-outline
    setWeather(placeholderWeather);
  }, []);

  const fetchAllData = useCallback(async (useCache = true) => {
    console.log('Fetching data...');
    if (!refreshing) setIsLoading(true);
    setImageErrors({}); // Reset image errors on fetch

    let cachedData = null;
    if (useCache) {
      try {
        const cachedDataString = await AsyncStorage.getItem('cachedData');
        if (cachedDataString) {
          console.log('Using cached data.');
          cachedData = JSON.parse(cachedDataString);
          setAppData(cachedData);
          // setIsLoading(false); // Keep loading true if we are fetching in background
        }
      } catch (cacheError) {
        console.warn('Error reading cache:', cacheError);
      }
    }

    try {
      // Fetch fresh data - use Promise.allSettled to avoid stopping on one error
      const results = await Promise.allSettled([
        getFeaturedDestinations(),
        getTopRatedRestaurants(),
        getRecommendedHotels(),
        getPopularAttractions(),
      ]);

      // Helper to get result value or fallback (from existing data or initial mock)
      const getValueOrDefault = (result, key, defaultValue = []) => {
         if (result.status === 'fulfilled') {
             return result.value;
         }
         console.warn(`Failed to fetch ${key}:`, result.reason);
         // Fallback: first try existing appData, then initialMockData
         return appData?.[key] ?? initialMockData[key] ?? defaultValue;
      };


      const data = {
        featuredDestinations: getValueOrDefault(results[0], 'featuredDestinations'),
        topRatedRestaurants: getValueOrDefault(results[1], 'topRatedRestaurants'),
        recommendedHotels: getValueOrDefault(results[2], 'recommendedHotels'),
        popularAttractions: getValueOrDefault(results[3], 'popularAttractions'),
        // These sections are read directly from initialMockData and don't need fetch results
        localCulture: initialMockData.localCulture,
        historicalSites: initialMockData.historicalSites,
        beachesCoastal: initialMockData.beachesCoastal,
        outdoorActivities: initialMockData.outdoorActivities, // Use updated mock data
        transportationInfo: initialMockData.transportationInfo,
        emergencyContacts: initialMockData.emergencyContacts,
      };

      setAppData(data);

      // Cache the fetched data if successful
      try {
        // Only cache if we got some successful data back
        if (data.featuredDestinations?.length || data.recommendedHotels?.length || data.popularAttractions?.length || data.topRatedRestaurants?.length) {
             await AsyncStorage.setItem('cachedData', JSON.stringify(data));
             console.log('Fresh data cached successfully.');
        } else if (cachedData) {
             // If fetch failed entirely but we have cache, log that we're keeping the cache
             console.log('Fetch failed entirely, relying on existing cache.');
        }
      } catch (cacheError) {
        console.error('Error caching data:', cacheError);
      }

      // Update weather after successful fetch simulation (or keep previous if fetch failed)
      // FIX: Use valid ionicon name
      setWeather({ temp: '29°C', condition: 'Sunny', icon: 'sunny-outline' }); // Changed weather-sunny

    } catch (error) {
      console.error('Unhandled error fetching data:', error);
      // If fetching failed AND we don't have appData (meaning cache also failed or didn't exist)
      if (!appData) {
        Alert.alert('Error', 'Failed to load essential data. Please check your connection and try again.');
         // FIX: Use valid ionicon name for error
         setWeather({ temp: '--°C', condition: 'Error', icon: 'cloud-offline-outline' });
      } else {
        // If fetching failed but we have cache, inform the user
        Alert.alert('Offline Mode', 'Could not refresh data. Displaying previously loaded information.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [appData, refreshing]); // Depend on appData for fallback logic

  useEffect(() => {
    if (!isLoadingAuth && currentUser) {
      // Fetch data when authenticated user is loaded
      // Note: The SavedItemsContext also loads saved items here.
      // We don't load them again in HomeScreen.
      fetchAllData();
    } else if (!isLoadingAuth && !currentUser) {
       // If no user and auth is loaded, clear data and loading state
      setAppData(null);
      setIsLoading(false);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingAuth, currentUser]); // Depend on auth state and fetchAllData

  // REMOVE: useEffect for loading saved items - Context handles this
  // useEffect(() => { /* ... */ }, []);

  // REMOVE: useEffect for persisting saved items - Context handles this
  // useEffect(() => { /* ... */ }, [savedItems]);


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData(false); // Force fetch, ignore cache
  }, [fetchAllData]);

  // REMOVE: Local toggleSaveItem function - Use the one from context
  // const toggleSaveItem = useCallback((item, type) => { /* ... */ }, []);


  // --- Render Helpers ---

  // This function now uses the isItemSaved and toggleSaveItem from the context hook
  const renderSaveButton = useCallback((item, type, iconColor = Colors.white) => {
     const itemId = item.id || item.name;
      if (!itemId) return null; // Don't render button if item lacks ID/name
    // Use the context's helper function to check if saved
    const isSaved = isItemSaved(item, type); // <-- USE CONTEXT HELPER

    return (
      <TouchableOpacity
        style={styles.saveButton}
        // Use the context's toggle function
        onPress={() => toggleSaveItem(item, type)} // <-- USE CONTEXT TOGGLE
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={isSaved ? `Remove ${item.name || item.title || 'item'}` : `Save ${item.name || item.title || 'item'}`}
      >
        <Ionicons
          name={isSaved ? 'bookmark' : 'bookmark-outline'} // bookmark-outline for unsaved
          size={22}
          color={isSaved ? Colors.light.tint : iconColor} // Use default tint for saved state, iconColor for unsaved
          style={styles.saveIcon}
        />
      </TouchableOpacity>
    );
    // Dependencies now include the context functions/state check
  }, [isItemSaved, toggleSaveItem, styles.saveButton, styles.saveIcon, isDarkMode]); // Added dependencies


  // --- RENDER FUNCTIONS with ENHANCED ANIMATIONS ---

  const renderDestinationCard = useCallback(
    ({ item, index }) => (
      <Animated.View entering={SlideInLeft.delay(index * 100).duration(400)} style={styles.horizontalListItem}> {/* Added margin style */}
        <AnimatedCard
          style={styles.destinationCard}
          // Pass the full item object to the detail screen so it can be saved/unsaved from there too
          onPress={() => navigation.navigate('DestinationDetail', { destinationId: item.id, item: item, type: 'destination' })} // Pass item and type
          accessibilityLabel={`View details for ${item.name}`}
          isDarkMode={isDarkMode}
        >
          <ImageBackground
            source={imageErrors[item.id] ? { uri: fallbackPlaceholderImage } : { uri: item.image }}
            style={styles.destinationImage}
            resizeMode="cover"
            onError={() => handleImageError(item.id)}
          >
            {/* Gradient Overlay */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.destinationContent}>
              <Text style={styles.destinationName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.destinationDescription} numberOfLines={2}>{item.description}</Text>
            </View>
          </ImageBackground>
          {/* Use the shared renderSaveButton */}
          {renderSaveButton(item, 'destination')}
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton, handleImageError, imageErrors]
  );

  const renderHotelCard = useCallback(
    ({ item, index }) => (
      <Animated.View entering={SlideInLeft.delay(index * 120).duration(450)} style={styles.horizontalListItem}> {/* Added margin style */}
        <AnimatedCard
          style={styles.hotelCard}
          // Pass the full item object to the detail screen
          onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id, item: item, type: 'hotel' })} // Pass item and type
          accessibilityLabel={`View details for ${item.name}, Rating ${item.rating}, Price ${item.price}`}
          isDarkMode={isDarkMode}
        >
          <Image
             source={imageErrors[item.id] ? { uri: fallbackPlaceholderImage } : { uri: item.image }}
             style={styles.hotelImage}
             resizeMode="cover"
             onError={() => handleImageError(item.id)}
          />
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={Colors.light.success} /> {/* Use success color for stars */}
              <Text style={styles.hotelRating}>{item.rating} Stars</Text>
            </View>
            <Text style={styles.hotelPrice}>{item.price}/night</Text>
          </View>
           {/* Use the shared renderSaveButton */}
          {renderSaveButton(item, 'hotel', isDarkMode ? Colors.dark.tint : Colors.light.tint)} {/* Pass theme color for outline */}
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton, handleImageError, imageErrors]
  );


  const renderRestaurantCard = useCallback(
    ({ item, index }) => (
      <Animated.View entering={SlideInLeft.delay(index * 120).duration(450)} style={styles.horizontalListItem}> {/* Added margin style */}
        <AnimatedCard
          style={styles.restaurantCard}
          // Pass the full item object to the detail screen
          onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id, item: item, type: 'restaurant' })}
          accessibilityLabel={`View details for ${item.name}, Cuisine: ${item.cuisine}, Price Range: ${item.priceRange}`}
          isDarkMode={isDarkMode}
        >
           <Image
             source={imageErrors[item.id] ? { uri: fallbackPlaceholderImage } : { uri: item.image }}
             style={styles.restaurantImage}
             resizeMode="cover"
             onError={() => handleImageError(item.id)}
            />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.restaurantDetails}>{item.cuisine} • {item.priceRange}</Text>
          </View>
           {/* Use the shared renderSaveButton */}
           {renderSaveButton(item, 'restaurant', isDarkMode ? Colors.dark.tint : Colors.light.tint)} {/* Pass theme color for outline */}
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton, handleImageError, imageErrors]
  );

  const renderAttractionCard = useCallback(
    ({ item, index }) => (
      // Note: FlatList numColumns adds wrap behavior, manage spacing with columnWrapperStyle and itemContainer padding
      <Animated.View
          style={styles.attractionCardContainer}
          entering={FadeIn.delay(index * 75).duration(500)}
      >
          <AnimatedCard
              style={styles.attractionCard}
              // Pass the full item object to the detail screen
              onPress={() => navigation.navigate('AttractionDetail', { attractionId: item.id, item: item, type: 'attraction' })} // Pass item and type
              accessibilityLabel={`View details for ${item.name}`}
              isDarkMode={isDarkMode}
          >
              <Image
                 source={imageErrors[item.id] ? { uri: fallbackPlaceholderImage } : { uri: item.image }}
                 style={styles.attractionImage}
                 resizeMode="cover"
                 onError={() => handleImageError(item.id)}
               />
              <Text style={styles.attractionName} numberOfLines={1}>{item.name}</Text>
               {/* Use the shared renderSaveButton */}
              {renderSaveButton(item, 'attraction', isDarkMode ? Colors.dark.tint : Colors.light.tint)} {/* Pass theme color for outline */}
          </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton, handleImageError, imageErrors]
  );


 const renderInfoItem = useCallback((text, key) => (
     <Animated.View entering={FadeInUp.duration(400).delay(parseInt(key.split('-')[1] || '0') * 50)} style={styles.infoItemContainer} key={key}>
         <Text style={styles.infoBullet}>•</Text>
         <Text style={styles.infoItemText}>{text}</Text>
     </Animated.View>
 ), [styles]);


  const renderOutdoorActivity = useCallback(
    (item, index) => (
      <Animated.View
          key={item.id}
          style={styles.outdoorActivityCardContainer}
          entering={ZoomIn.delay(index * 100).duration(400).springify().damping(12)}
      >
        <AnimatedCard
          style={styles.outdoorActivityCard}
          onPress={() => navigation.navigate(item.name)} // Updated to use item.name for navigation
          accessibilityLabel={`Explore ${item.name} activities`}
          isDarkMode={isDarkMode}
        >
          <Ionicons name={item.icon || 'help-circle-outline'} size={30} color={isDarkMode ? Colors.dark.tint : Colors.light.tint} />
          <Text style={styles.outdoorActivityText}>{item.name}</Text>
        </AnimatedCard>
      </Animated.View>
    ),
    [styles, isDarkMode, navigation]
  );

  const renderTransportInfo = useCallback(
    (item, index, isLast) => (
      <Animated.View key={item.id} entering={FadeInUp.delay(index * 80).duration(400)}>
        <View style={[styles.transportItemContainer, isLast && { borderBottomWidth: 0 }]}>
          <View style={styles.transportItem}>
            <Ionicons name={item.icon || 'alert-circle-outline'} size={24} color={isDarkMode ? Colors.dark.tint : Colors.light.tint} style={styles.transportIcon} />
            <View style={styles.transportTextContainer}>
              <Text style={styles.transportType}>{item.type}</Text>
              <Text style={styles.transportDetails}>{item.details}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    ),
    [styles, isDarkMode]
  );

  const renderEmergencyContact = useCallback(
    (item, index) => (
      <Animated.View key={item.id} entering={FadeInUp.delay(index * 80).duration(400)}>
        <TouchableOpacity
          style={styles.emergencyContactButton}
          onPress={() => Linking.openURL(`tel:${item.number}`).catch(() => Alert.alert('Error', 'Could not open phone dialer.'))}
          accessibilityLabel={`Call ${item.name} at ${item.number}`}
          accessibilityRole="button"
        >
          <Ionicons name={item.icon || 'call-outline'} size={24} color={Colors.light.danger} /> {/* Use danger color */}
          <View style={styles.emergencyContactInfo}>
            <Text style={styles.emergencyContactName}>{item.name}</Text>
            <Text style={styles.emergencyContactNumber}>{item.number}</Text>
          </View>
          {/* Redundant icon here? Maybe remove or make it a call button? */}
          {/* <Ionicons name="call-outline" size={24} color={Colors.light.danger} /> */}
        </TouchableOpacity>
      </Animated.View>
    ),
    [styles]
  );

  // --- Render Logic ---
  if (isLoadingAuth) {
    // Show loading while authenticating
    return <LoadingAnimation isDarkMode={isDarkMode} />;
  }

  if (!currentUser) {
    // Show login prompt if not authenticated
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="log-in-outline" size={60} color={styles.loadingText.color} />
        <Text style={styles.loadingText}>Please log in or sign up</Text>
        <Text style={[styles.infoText, { textAlign: 'center', marginTop: SPACING }]}>
            Log in to discover Bejaia, save your favorite places, and plan your trip!
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: SPACING * 2 }}>
            <Text style={styles.linkText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show initial loading screen if data is not yet loaded and not refreshing
  if (isLoading && !appData && !refreshing) {
    return (
        <LoadingAnimation isDarkMode={isDarkMode} />
    );
  }

   // Show error screen if data failed to load and no cached data exists
  if (!isLoading && !appData && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
         <Ionicons name="cloud-offline-outline" size={60} color={styles.loadingText.color} />
        <Text style={styles.loadingText}>Oops! Something went wrong.</Text>
         <Text style={[styles.infoText, { textAlign: 'center', marginTop: SPACING }]}>
            We couldn't load the data for Bejaia. Please check your internet connection.
        </Text>
        <TouchableOpacity onPress={() => fetchAllData(false)} style={{ marginTop: SPACING * 2 }}>
          <Text style={styles.linkText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // We have appData (or are refreshing), proceed with rendering the main screen
  const userFirstName = userData?.fullName ? userData.fullName.split(' ')[0] : '';
  const formattedGreeting = `${greeting}${userFirstName ? ', ' + userFirstName : ''}!`;

  // Safely access data, defaulting to empty arrays if null/undefined
  const destinationsData = appData?.featuredDestinations ?? [];
  const hotelsData = appData?.recommendedHotels ?? [];
  const restaurantsData = appData?.topRatedRestaurants ?? [];
  const attractionsData = appData?.popularAttractions ?? [];

  // Directly use the potentially updated initialMockData for non-fetched sections
  const outdoorData = initialMockData.outdoorActivities;
  const cultureData = initialMockData.localCulture;
  const historyData = initialMockData.historicalSites;
  const beachesData = initialMockData.beachesCoastal;
  const transportData = initialMockData.transportationInfo;
  const emergencyData = initialMockData.emergencyContacts;

  // Check if sections have data to render
  const hasDestinations = destinationsData.length > 0;
  const hasHotels = hotelsData.length > 0;
  const hasRestaurants = restaurantsData.length > 0;
  const hasAttractions = attractionsData.length > 0;
  const hasOutdoor = outdoorData.length > 0;
  const hasInfo = cultureData.length > 0 || historyData.length > 0 || beachesData.length > 0;
  const hasTransport = transportData.length > 0;
  const hasEmergency = emergencyData.length > 0;


  return (
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <Animated.View style={[styles.searchBarContainer, searchBarAnimatedStyle]}>
        <View style={[styles.searchBarInner, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color={colors.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search destinations, hotels, restaurants..."
            placeholderTextColor={colors.secondary}
            onChangeText={handleSearch}
            value={searchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                setSearchQuery('');
                handleSearch('');
              }}
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color={colors.tint} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => Alert.alert('Filter', 'Filter options coming soon!')}
            accessibilityLabel="Filter options"
          >
            <Ionicons name="options-outline" size={20} color={colors.tint} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {searchResults.length > 0 || isSearching || searchQuery.length > 0 ? (
        renderSearchResults()
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
              title="Refreshing..."
              titleColor={colors.secondary}
              colors={[colors.tint]}
              progressBackgroundColor={colors.card}
            />
          }
        >
          {/* --- Animated Header --- */}
          <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
            <Animated.Image
                source={{ uri: headerImageUrl }}
                style={[styles.headerImageBackground, headerImageAnimatedStyle]}
                resizeMode="cover"
                onError={(e) => console.log(`Failed to load header image: ${headerImageUrl}`, e.nativeEvent.error)}
            />
             <Animated.View style={[styles.headerOverlay, headerImageAnimatedStyle]} />
             <Animated.View style={[styles.headerContent, headerContentAnimatedStyle]}>
                 <Text style={styles.greetingText}>{formattedGreeting}</Text>
                 <Text style={styles.locationText}>{userLocation}</Text>
                 {weather && (
                   <View style={styles.weatherContainer}>
                     {/* Use valid ionicon name */}
                     <Ionicons name={weather.icon || 'thermometer-outline'} size={20} color={Colors.white} />
                     <Text style={styles.weatherText}>{weather.temp}, {weather.condition}</Text>
                   </View>
                 )}
             </Animated.View>
          </Animated.View>

          {/* --- Scrollable Content --- */}
          <View style={{ height: HEADER_MAX_HEIGHT }} />
          {/* Spacer for search bar */}
          <View style={{ height: SPACING * 3 }} />


          {hasDestinations && (
              <>
                  <SectionHeader
                      title="Explore Bejaia"
                      onSeeAll={() => navigation.navigate('Destinations')}
                      isDarkMode={isDarkMode}
                  />
                  <FlatList
                      data={destinationsData}
                      keyExtractor={(item) => `dest-${item.id}`}
                      renderItem={renderDestinationCard}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalListContent}
                  />
              </>
          )}

          {hasHotels && (
              <>
                  <SectionHeader
                      title="Stay in Comfort"
                      onSeeAll={() => navigation.navigate('Hotels')}
                      isDarkMode={isDarkMode}
                  />
                  <FlatList
                      data={hotelsData}
                      keyExtractor={(item) => `hotel-${item.id}`}
                      renderItem={renderHotelCard}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalListContent}
                  />
              </>
          )}

          {hasRestaurants && (
              <>
                  <SectionHeader
                      title="Dine in Style"
                      onSeeAll={() => navigation.navigate('Restaurants')}
                      isDarkMode={isDarkMode}
                  />
                  <FlatList
                      data={restaurantsData}
                      keyExtractor={(item) => `rest-${item.id}`}
                      renderItem={renderRestaurantCard}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalListContent}
                  />
              </>
          )}

          {hasAttractions && (
               <>
                  <SectionHeader
                      title="Must-Visit Spots"
                      onSeeAll={() => navigation.navigate('Attractions')}
                      isDarkMode={isDarkMode}
                  />
                  {/* Using FlatList for grid layout */}
                  <FlatList
                      data={attractionsData}
                      keyExtractor={(item) => `attr-${item.id}`}
                      renderItem={renderAttractionCard}
                      numColumns={2}
                      // columnWrapperStyle handles horizontal spacing between columns/items
                      columnWrapperStyle={styles.attractionsColumnWrapper}
                      contentContainerStyle={styles.attractionsContentContainer}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={false} // Disable scroll inside the main scroll view
                   />
               </>
          )}

          {/* Updated Outdoor Activities Section */}
          {hasOutdoor && (
              <>
                  <SectionHeader
                       title="Activities" // Corrected title
                       isDarkMode={isDarkMode}
                  />
                   <View style={styles.outdoorGridContainer}>
                      {outdoorData.map((item, index) => renderOutdoorActivity(item, index))}
                  </View>
              </>
          )}


          {hasInfo && (
              <Animated.View entering={FadeInUp.duration(500).delay(200)}>
                {/* Combined Info Card for Culture, History, Beaches */}
                <View style={styles.infoCard}>
                  {cultureData.length > 0 && (
                      <>
                          <Text style={styles.infoTitle}>Culture & Traditions</Text>
                          {cultureData.map((item, index) => renderInfoItem(item.description, `cult-${index}`))}
                      </>
                  )}
                  {historyData.length > 0 && (
                      <>
                          <Text style={[styles.infoTitle, { marginTop: cultureData.length > 0 ? SPACING : 0 }]}>Historical Gems</Text>
                          {historyData.map((item, index) => renderInfoItem(`${item.name}: ${item.description}`, `hist-${index}`))}
                      </>
                  )}
                  {beachesData.length > 0 && (
                     <>
                          <Text style={[styles.infoTitle, { marginTop: (cultureData.length > 0 || historyData.length > 0) ? SPACING : 0 }]}>Beaches & Coastline</Text>
                          {beachesData.map((item, index) => renderInfoItem(`${item.name}: ${item.description}`, `beach-${index}`))}
                     </>
                  )}
                </View>
              </Animated.View>
          )}

          {hasTransport && (
               <Animated.View entering={FadeInUp.duration(500).delay(300)}>
                  <SectionHeader title="Getting Around Bejaia" isDarkMode={isDarkMode} />
                  {/* Combined Transport Info Card */}
                  <View style={[styles.infoCard, { paddingVertical: SPACING * 0.5 }]}>
                      {transportData.map((item, index) =>
                          renderTransportInfo(item, index, index === transportData.length - 1)
                      )}
                  </View>
               </Animated.View>
          )}

          {hasEmergency && (
              <Animated.View entering={FadeInUp.duration(500).delay(400)}>
                  <SectionHeader title="Important Contacts" isDarkMode={isDarkMode} />
                  <View style={{ marginHorizontal: SPACING * 1.5, marginBottom: SPACING }}>
                      {emergencyData.map((item, index) => renderEmergencyContact(item, index))}
                  </View>
              </Animated.View>
          )}

          {/* Footer Spacer */}
          <View style={{ height: SPACING * 5 }} />

        </ScrollView>
      )}
    </View>
  );
}

// Export the component
export default HomeScreen;