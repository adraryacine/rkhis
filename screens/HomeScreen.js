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
  ActivityIndicator, // Keep ActivityIndicator
  ScrollView,
  RefreshControl,
  Alert,
  Pressable,
  useColorScheme, // Keep useColorScheme
  FlatList // Keep FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Keep Ionicons
import { LinearGradient } from 'expo-linear-gradient'; // Keep LinearGradient
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withSpring,
  FadeIn,
  SlideInLeft,
  SlideInUp, // Added for vertical slide
  ZoomIn, // Keep ZoomIn
  FadeInUp, // Added for fade + slide up
} from 'react-native-reanimated'; // Keep Reanimated
import { useNavigation } from '@react-navigation/native'; // Keep Navigation
// import LottieView from 'lottie-react-native'; // No longer needed
import AsyncStorage from '@react-native-async-storage/async-storage'; // Keep AsyncStorage

// --- Placeholder Colors (Moved here, remove import) ---
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
    black: '#000000', // Black is still black
  },
  white: '#ffffff', // Keep white accessible easily
};

// --- Placeholder Auth Context (Moved here, remove import) ---
const AuthContext = createContext(null);

// Example Hook - Provides mock data
export const useAuth = () => {
    // Simulate auth state
    const [currentUser] = useState({ id: '123', email: 'user@example.com' }); // Assume logged in
    const [userData] = useState({ fullName: 'Bejaia Explorer', preferences: {} }); // Mock user data
    const [isLoadingAuth] = useState(false); // Assume auth check is complete

    return { currentUser, userData, isLoadingAuth };
};

// Example Provider (Not strictly needed for this single screen, but good practice)
export const AuthProvider = ({ children }) => {
  const authValue = useAuth(); // Use the hook to get the mock values
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};


// --- Mock Data (Updated with Picsum URLs) ---
const initialMockData = {
  featuredDestinations: [
    { id: 'dest1', name: 'Bejaia City Exploration', image: 'https://picsum.photos/seed/dest1/600/400', description: 'Historic port & vibrant center', tags: ['city', 'culture'] },
    { id: 'dest2', name: 'Aokas Golden Sands', image: 'https://picsum.photos/seed/dest2/600/400', description: 'Relax on the stunning coastline' },
    { id: 'dest3', name: 'Tichy Seaside Town', image: 'https://picsum.photos/seed/dest3/600/400', description: 'Charming coastal town life' },
  ],
  upcomingEvents: [
    { id: 'event1', name: 'Festival International de Théâtre', date: 'Oct 2024', location: 'Theatre Regional', image: 'https://picsum.photos/seed/event1/400/300' },
    { id: 'event2', name: 'Summer Music Fest', date: 'Jul 2024', location: 'Place Guidon', image: 'https://picsum.photos/seed/event2/400/300' },
  ],
  topRatedRestaurants: [
    { id: 'rest1', name: 'Le Dauphin Bleu', rating: 4.8, cuisine: 'Seafood, Mediterranean', image: 'https://picsum.photos/seed/rest1/600/400', priceRange: '$$$' },
    { id: 'rest2', name: 'Restaurant La Citadelle', rating: 4.5, cuisine: 'Algerian, Grill', image: 'https://picsum.photos/seed/rest2/600/400', priceRange: '$$' },
  ],
  recommendedHotels: [
    { id: 'hotel1', name: 'Hotel Royal Bejaia', price: '~$140', rating: 4.7, image: 'https://picsum.photos/seed/hotel1/600/400', amenities: ['Pool', 'Spa', 'Restaurant'], latitude: 36.7520, longitude: 5.0860 },
    { id: 'hotel2', name: 'Les Hammadites Hotel', price: '~$110', rating: 4.3, image: 'https://picsum.photos/seed/hotel2/600/400', amenities: ['Beach Access', 'Restaurant'], latitude: 36.7700, longitude: 5.1400 },
  ],
  popularAttractions: [
    { id: 'attr1', name: 'Gouraya Park', description: 'Nature & Views', image: 'https://picsum.photos/seed/attr1/400/400', latitude: 36.7600, longitude: 5.0900, openingHours: '8 AM - 6 PM', entranceFee: '50 DZD' },
    { id: 'attr2', name: 'Cap Carbon Lighthouse', description: 'Panoramic Coastal Views', image: 'https://picsum.photos/seed/attr2/400/400', latitude: 36.785, longitude: 5.105 },
    { id: 'attr3', name: 'Place Guidon', description: 'City Center Square', image: 'https://picsum.photos/seed/attr3/400/400', latitude: 36.753, longitude: 5.083 },
    { id: 'attr4', name: 'Monkey Peak (Pic des Singes)', description: 'Hiking & Wildlife Spotting', image: 'https://picsum.photos/seed/attr4/400/400', latitude: 36.765, longitude: 5.095 },
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
  outdoorActivities: [
    { id: 'out1', name: 'Hiking', icon: 'walk-outline' },
    { id: 'out2', name: 'Snorkeling', icon: 'water-outline' },
    { id: 'out3', name: 'Photography', icon: 'camera-outline' },
    { id: 'out4', name: 'Boating', icon: 'boat-outline' },
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

// --- Placeholder Data Fetching Functions (No change needed here) ---
const MOCK_DELAY = 500; // Simulate network latency

const getFeaturedDestinations = () => new Promise(resolve => setTimeout(() => resolve(initialMockData.featuredDestinations), MOCK_DELAY));
const getUpcomingEvents = () => new Promise(resolve => setTimeout(() => resolve(initialMockData.upcomingEvents), MOCK_DELAY + 100));
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
// Use a reliable placeholder for the header too
const headerImageUrl = 'https://picsum.photos/seed/bejaia_main_header/1200/800';
// Fallback image in case others fail
const fallbackPlaceholderImage = 'https://via.placeholder.com/300x200/cccccc/969696?text=Image+Error';


// --- Themed Styles ---
// (getThemedStyles function remains largely the same, ensure styles match components)
const getThemedStyles = (isDarkMode = false) => {
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const dynamicCardShadow = {
    ...CARD_SHADOW,
    shadowColor: colors.black, // Use themed black
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
      paddingBottom: 100, // Ensure space at the bottom
      backgroundColor: colors.background, // Ensure scroll view bg matches screen
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
      backgroundColor: colors.secondary, // Background color while image loads
    },
    headerImageBackground: {
      width: '100%',
      height: '100%',
      justifyContent: 'flex-end', // Align content to bottom
    },
    headerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.4)',
    },
    headerContent: {
      paddingHorizontal: SPACING * 1.5,
      paddingBottom: SPACING * 4, // Increased padding to avoid overlap with search bar
      zIndex: 3,
    },
    greetingText: {
      fontSize: screenWidth > 500 ? 36 : 32,
      fontWeight: '800',
      color: Colors.white, // Always white for contrast on image
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
    },
    locationText: {
      fontSize: screenWidth > 500 ? 20 : 18,
      fontWeight: '600',
      color: Colors.white, // Always white
      opacity: 0.9,
      marginVertical: SPACING * 0.5,
    },
    weatherContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white BG
      borderRadius: SPACING,
      paddingVertical: SPACING * 0.5,
      paddingHorizontal: SPACING,
      alignSelf: 'flex-start', // Only take needed width
      marginTop: SPACING * 0.5,
    },
    weatherText: {
      fontSize: 16,
      fontWeight: '500',
      color: Colors.white, // Always white
      marginLeft: SPACING * 0.5,
    },
    // Search Bar
    searchBarContainer: {
      position: 'absolute',
      top: HEADER_MAX_HEIGHT - SPACING * 2.5, // Adjust vertical position
      left: SPACING * 1.5,
      right: SPACING * 1.5,
      zIndex: 15,
    },
    searchBarInner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: SPACING * 2, // Fully rounded
      paddingHorizontal: SPACING,
      height: SPACING * 3.5,
      borderWidth: 1,
      borderColor: colors.border,
      ...dynamicCardShadow, // Use themed shadow
    },
    searchIcon: {
      marginRight: SPACING,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text, // Use text color for the placeholder text feel
    },
    searchButton: {
      padding: SPACING * 0.5, // Tap target size
    },
    // Section Header
    sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: SPACING * 1.5,
      marginTop: SPACING * 2, // More space after header/search
      marginBottom: SPACING * 1.5, // Space before content
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
      ...dynamicCardShadow, // Use themed shadow
      overflow: 'hidden', // Clip content/images to rounded corners
    },
    // Destination Card
    destinationCard: {
      width: screenWidth * 0.75,
      height: screenHeight * 0.3,
      marginRight: SPACING * 1.5, // Space between cards
      backgroundColor: colors.border, // Background color while image loads
    },
    destinationImage: {
      flex: 1,
      justifyContent: 'flex-end', // Content at bottom
    },
    destinationContent: {
      padding: SPACING,
      // Gradient applied separately
    },
    destinationName: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors.white, // White text on gradient
    },
    destinationDescription: {
      fontSize: 14,
      color: Colors.white, // White text on gradient
      opacity: 0.9,
      marginTop: SPACING * 0.25,
    },
    // Hotel Card
    hotelCard: {
      width: screenWidth * 0.65,
      marginRight: SPACING * 1.5,
      backgroundColor: colors.border, // Background color while image loads
    },
    hotelImage: {
      width: '100%',
      height: screenHeight * 0.18, // Slightly smaller image
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
      color: colors.success, // Assuming success color for price
      marginTop: SPACING * 0.25,
    },
    // Event Card
    eventCard: {
      width: screenWidth * 0.55,
      marginRight: SPACING * 1.5,
      backgroundColor: colors.border, // Background color while image loads
    },
    eventImage: {
      width: '100%',
      height: screenHeight * 0.15,
    },
    eventInfo: {
      padding: SPACING,
    },
    eventName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING * 0.25,
    },
    eventDetails: {
      fontSize: 13,
      color: colors.secondary,
      marginTop: SPACING * 0.5,
    },
    // Restaurant Card
    restaurantCard: {
      width: screenWidth * 0.6,
      marginRight: SPACING * 1.5,
      backgroundColor: colors.border, // Background color while image loads
    },
    restaurantImage: {
      width: '100%',
      height: screenHeight * 0.18, // Match hotel image height
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
    attractionCardContainer: { // Container for the grid item, handles width/margin
       width: (screenWidth - SPACING * 4.5) / 2, // Two columns with spacing
       marginBottom: SPACING * 1.5,
    },
    attractionCard: { // The card itself, takes full width/height of container
      flex: 1,
      backgroundColor: colors.border, // Background color while image loads
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
      paddingVertical: SPACING * 0.75, // Slightly less vertical padding
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
    infoText: { // General text style within info cards
      fontSize: 14,
      color: colors.secondary,
      lineHeight: 20,
      marginBottom: SPACING * 0.5, // Add space between list items
    },
    infoItemContainer: { // Container for bullet + text
       flexDirection: 'row',
       marginBottom: SPACING * 0.5,
       alignItems: 'flex-start', // Align bullet with start of text
    },
    infoBullet: {
        fontSize: 14,
        color: colors.secondary,
        marginRight: SPACING * 0.5,
        lineHeight: 20,
    },
    infoItemText: {
        flex: 1, // Allow text to wrap
        fontSize: 14,
        color: colors.secondary,
        lineHeight: 20,
    },
    // Outdoor Activity Card
    outdoorActivityCardContainer: { // Container for margin/spacing
        width: (screenWidth - SPACING * 4.5) / 3, // Aim for 3 columns, adjust spacing calc
        padding: SPACING * 0.75, // Spacing around each card
    },
    outdoorActivityCard: { // The actual card styling
        flex: 1, // Take full height of container
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING,
        minHeight: 90, // Ensure minimum tap height & content space
    },
    outdoorActivityText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.tint,
        marginTop: SPACING * 0.5,
        textAlign: 'center',
    },
    // Transport
    transportItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING,
      // Apply border only if not the last item (handled in render)
    },
    transportItemContainer: { // Wrapper for border logic
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    transportIcon: {
      marginRight: SPACING,
    },
    transportTextContainer: {
        flex: 1, // Take remaining space
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
      backgroundColor: colors.cardBackground, // Use card background
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
      color: colors.danger, // Use danger color
    },
    emergencyContactNumber: {
      fontSize: 14,
      color: colors.danger, // Use danger color
    },
    // FlatList specific styles
    horizontalListContent: {
      paddingHorizontal: SPACING * 1.5,
      paddingVertical: SPACING * 0.5, // Add some vertical padding
    },
    // Style for the wrapper of columns in the attractions FlatList
    attractionsColumnWrapper: {
       justifyContent: 'space-between', // Distribute items evenly in the row
       paddingHorizontal: SPACING * 0.75, // Horizontal padding between columns
    },
    // Style for the content container of the attractions FlatList
    attractionsContentContainer: {
        paddingHorizontal: SPACING * 0.75, // Overall horizontal padding for the grid
    },
    outdoorGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start', // Align items to start
      marginHorizontal: SPACING * 0.75, // Base margin
      marginTop: SPACING * 0.5,
    },
    // Save Icon Button
    saveButton: {
        position: 'absolute',
        top: SPACING * 0.75,
        right: SPACING * 0.75,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
        borderRadius: 15,
        padding: SPACING * 0.4,
        zIndex: 5, // Ensure it's above image content
    },
    saveIcon: {
        // Color set dynamically based on saved state
    }
  });
};


// --- Reusable Components ---
const SectionHeader = React.memo(({ title, onSeeAll, isDarkMode }) => {
  const styles = getThemedStyles(isDarkMode);
  // Animate the section header itself
  return (
    <Animated.View
        entering={FadeInUp.duration(500).delay(100)} // Fade in and slide up
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
  const styles = getThemedStyles(isDarkMode); // Get themed styles

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 150 }) }], // Adjusted spring
  }));

  return (
    <Animated.View style={[styles.cardBase, style]}>
        {/* Apply pressable and animation wrapper */}
        <Pressable
            onPress={onPress}
            onPressIn={() => (scale.value = 0.96)} // Slightly more pronounced press
            onPressOut={() => (scale.value = 1)}
            accessibilityLabel={accessibilityLabel}
            style={{ flex: 1 }} // Ensure pressable fills the card
        >
            {/* Apply scale animation to this inner view */}
            <Animated.View style={[{flex: 1}, animatedStyle]}>
                 {children}
            </Animated.View>
        </Pressable>
    </Animated.View>
  );
});

const LoadingAnimation = ({ isDarkMode }) => {
    const styles = getThemedStyles(isDarkMode);
    // Using standard ActivityIndicator
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
  const styles = getThemedStyles(isDarkMode); // Get themed styles once

  const scrollY = useSharedValue(0);
  const [appData, setAppData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation] = useState('Bejaia'); // Could be dynamic later
  const [greeting, setGreeting] = useState('Hello');
  const [weather, setWeather] = useState({ temp: '--°C', condition: 'Loading...', icon: 'sync-outline' }); // Default/Placeholder
  const [savedItems, setSavedItems] = useState(new Set()); // Use Set for efficient lookups

  // State for image loading errors (optional, for fallback UI)
  const [imageErrors, setImageErrors] = useState({});
  const handleImageError = useCallback((id) => {
      setImageErrors(prev => ({ ...prev, [id]: true }));
      console.log(`Failed to load image for ID: ${id}`);
  }, []);


  // --- Animations ---
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animations remain the same
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
              [0, 50],
              Extrapolate.CLAMP
          )
      }]
  }));
  const headerImageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollY.value, [-HEADER_MAX_HEIGHT, 0], [1.8, 1], Extrapolate.CLAMP) },
      { translateY: interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE], [0, HEADER_SCROLL_DISTANCE * 0.5], Extrapolate.CLAMP) },
    ],
  }));
  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE],
          [0, -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - SPACING * 1.5)],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  // --- Effects ---
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening');
    const placeholderWeather = { temp: '28°C', condition: 'Clear', icon: 'weather-sunny' };
    setWeather(placeholderWeather);
  }, []);

  const fetchAllData = useCallback(async (useCache = true) => {
    console.log('Fetching data...');
    if (!refreshing) setIsLoading(true);
    setImageErrors({}); // Reset image errors on fetch

    if (useCache) {
      try {
        const cachedDataString = await AsyncStorage.getItem('cachedData');
        if (cachedDataString) {
          console.log('Using cached data.');
          setAppData(JSON.parse(cachedDataString));
          setIsLoading(false);
        }
      } catch (cacheError) {
        console.warn('Error reading cache:', cacheError);
      }
    }

    try {
      const results = await Promise.allSettled([
        getFeaturedDestinations(),
        getUpcomingEvents(),
        getTopRatedRestaurants(),
        getRecommendedHotels(),
        getPopularAttractions(),
      ]);

      const [
        featuredDestinationsResult,
        upcomingEventsResult,
        topRatedRestaurantsResult,
        recommendedHotelsResult,
        popularAttractionsResult,
      ] = results;

      const getValueOrDefault = (result, key, defaultValue = []) =>
        result.status === 'fulfilled' ? result.value : (appData?.[key] || defaultValue);

      const data = {
        featuredDestinations: getValueOrDefault(featuredDestinationsResult, 'featuredDestinations', []),
        upcomingEvents: getValueOrDefault(upcomingEventsResult, 'upcomingEvents', []),
        topRatedRestaurants: getValueOrDefault(topRatedRestaurantsResult, 'topRatedRestaurants', []),
        recommendedHotels: getValueOrDefault(recommendedHotelsResult, 'recommendedHotels', []),
        popularAttractions: getValueOrDefault(popularAttractionsResult, 'popularAttractions', []),
        localCulture: initialMockData.localCulture,
        historicalSites: initialMockData.historicalSites,
        beachesCoastal: initialMockData.beachesCoastal,
        outdoorActivities: initialMockData.outdoorActivities,
        transportationInfo: initialMockData.transportationInfo,
        emergencyContacts: initialMockData.emergencyContacts,
      };

      setAppData(data);
      try {
        if (data.featuredDestinations?.length || data.recommendedHotels?.length) {
             await AsyncStorage.setItem('cachedData', JSON.stringify(data));
             console.log('Data cached successfully.');
        }
      } catch (cacheError) {
        console.error('Error caching data:', cacheError);
      }
      setWeather({ temp: '29°C', condition: 'Sunny', icon: 'weather-sunny' });

    } catch (error) {
      console.error('Error fetching data:', error);
      if (!appData) {
        Alert.alert('Error', 'Failed to load essential data. Please check your connection and try again.');
      } else {
        Alert.alert('Offline Mode', 'Could not refresh data. Displaying previously loaded information.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [appData, refreshing]);

  useEffect(() => {
    if (!isLoadingAuth && currentUser) {
      fetchAllData();
    } else if (!isLoadingAuth && !currentUser) {
      setAppData(null);
      setIsLoading(false);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingAuth, currentUser]);

  useEffect(() => {
    const loadSavedItems = async () => {
        try {
            const savedKeys = await AsyncStorage.getItem('savedTripItems');
            if (savedKeys) {
                setSavedItems(new Set(JSON.parse(savedKeys)));
            }
        } catch (e) {
            console.error("Failed to load saved items:", e);
        }
    };
    loadSavedItems();
  }, []);

  useEffect(() => {
    const persistSavedItems = async () => {
        try {
            const currentSaved = await AsyncStorage.getItem('savedTripItems');
            const newSavedString = JSON.stringify([...savedItems]);
            if (currentSaved !== newSavedString) {
                await AsyncStorage.setItem('savedTripItems', newSavedString);
                 console.log("Saved items persisted.");
            }
        } catch (e) {
            console.error("Failed to save trip items:", e);
        }
    };
     if (savedItems.size > 0 || AsyncStorage.getItem('savedTripItems')) { // Check if loaded or non-empty
        persistSavedItems();
     }
  }, [savedItems]);


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData(false);
  }, [fetchAllData]);

  const toggleSaveItem = useCallback((item, type) => {
    const key = `${type}_${item.id}`;
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
        Alert.alert('Removed', `${item.name} removed from your trip plan.`);
      } else {
        newSet.add(key);
        Alert.alert('Saved', `${item.name} added to your trip plan!`);
      }
      return newSet;
    });
  }, []);

  // --- Render Helpers ---

  const renderSaveButton = useCallback((item, type, iconColor = Colors.white) => {
    const key = `${type}_${item.id}`;
    const isSaved = savedItems.has(key);
    return (
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => toggleSaveItem(item, type)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={isSaved ? `Remove ${item.name} from saved items` : `Save ${item.name}`}
      >
        <Ionicons
          name={isSaved ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={isSaved ? Colors.light.tint : iconColor}
          style={styles.saveIcon}
        />
      </TouchableOpacity>
    );
  }, [savedItems, toggleSaveItem, styles]);

  // --- RENDER FUNCTIONS with ENHANCED ANIMATIONS ---

  const renderDestinationCard = useCallback(
    ({ item, index }) => (
      // Use Animated.View for the entering animation
      <Animated.View entering={SlideInLeft.delay(index * 100).duration(400)}>
        <AnimatedCard
          style={styles.destinationCard}
          onPress={() => navigation.navigate('DestinationDetail', { destinationId: item.id })}
          accessibilityLabel={`View details for ${item.name}`}
          isDarkMode={isDarkMode}
        >
          <ImageBackground
            // Use fallback image source if error occurred
            source={imageErrors[item.id] ? { uri: fallbackPlaceholderImage } : { uri: item.image }}
            style={styles.destinationImage}
            resizeMode="cover"
            onError={() => handleImageError(item.id)} // Use centralized error handler
          >
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.destinationContent}>
              <Text style={styles.destinationName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.destinationDescription} numberOfLines={2}>{item.description}</Text>
            </View>
          </ImageBackground>
          {renderSaveButton(item, 'destination')}
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton, handleImageError, imageErrors] // Add dependencies
  );

  const renderHotelCard = useCallback(
    ({ item, index }) => (
      <Animated.View entering={SlideInLeft.delay(index * 120).duration(450)}> {/* Slightly different timing */}
        <AnimatedCard
          style={styles.hotelCard}
          onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id })}
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
              <Ionicons name="star" size={16} color={Colors.light.success} />
              <Text style={styles.hotelRating}>{item.rating} Stars</Text>
            </View>
            <Text style={styles.hotelPrice}>{item.price}/night</Text>
          </View>
          {renderSaveButton(item, 'hotel', isDarkMode ? Colors.dark.tint : Colors.light.tint)}
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton, handleImageError, imageErrors] // Add dependencies
  );

  const renderEventCard = useCallback(
    ({ item, index }) => (
      <Animated.View entering={SlideInLeft.delay(index * 100).duration(400)}>
        <AnimatedCard
          style={styles.eventCard}
          onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
          accessibilityLabel={`View details for ${item.name} on ${item.date} at ${item.location}`}
          isDarkMode={isDarkMode}
        >
           <Image
             source={imageErrors[item.id] ? { uri: fallbackPlaceholderImage } : { uri: item.image }}
             style={styles.eventImage}
             resizeMode="cover"
             onError={() => handleImageError(item.id)}
           />
          <View style={styles.eventInfo}>
            <Text style={styles.eventName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.eventDetails}>{item.date} • {item.location}</Text>
          </View>
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, handleImageError, imageErrors] // Add dependencies
  );

  const renderRestaurantCard = useCallback(
    ({ item, index }) => (
      <Animated.View entering={SlideInLeft.delay(index * 120).duration(450)}>
        <AnimatedCard
          style={styles.restaurantCard}
          onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
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
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, handleImageError, imageErrors] // Add dependencies
  );

  const renderAttractionCard = useCallback(
    ({ item, index }) => (
      // Apply animation to the container
      <Animated.View
          style={styles.attractionCardContainer} // Use container style for width/margin
          entering={FadeIn.delay(index * 75).duration(500)} // Softer fade-in for grid
      >
          <AnimatedCard
              style={styles.attractionCard} // Card style itself
              onPress={() => navigation.navigate('AttractionDetail', { attractionId: item.id })}
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
              {renderSaveButton(item, 'attraction', isDarkMode ? Colors.dark.tint : Colors.light.tint)}
          </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton, handleImageError, imageErrors] // Add dependencies
  );


 const renderInfoItem = useCallback((text, key) => (
     // Animate each info item
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
          // Bouncy zoom-in for outdoor activities
          entering={ZoomIn.delay(index * 100).duration(400).springify().damping(12)}
      >
        <AnimatedCard
          style={styles.outdoorActivityCard}
          onPress={() => Alert.alert('Explore', `Find ${item.name} activities near you!`)}
          accessibilityLabel={`Explore ${item.name} activities`}
          isDarkMode={isDarkMode}
        >
          <Ionicons name={item.icon || 'help-circle-outline'} size={30} color={isDarkMode ? Colors.dark.tint : Colors.light.tint} />
          <Text style={styles.outdoorActivityText}>{item.name}</Text>
        </AnimatedCard>
      </Animated.View>
    ),
    [styles, isDarkMode]
  );

  const renderTransportInfo = useCallback(
    (item, index, isLast) => (
      // Animate transport items
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
      // Animate emergency contacts
      <Animated.View key={item.id} entering={FadeInUp.delay(index * 80).duration(400)}>
        <TouchableOpacity
          style={styles.emergencyContactButton}
          onPress={() => Linking.openURL(`tel:${item.number}`).catch(() => Alert.alert('Error', 'Could not open phone dialer.'))}
          accessibilityLabel={`Call ${item.name} at ${item.number}`}
          accessibilityRole="button"
        >
          <Ionicons name={item.icon || 'call-outline'} size={24} color={Colors.light.danger} />
          <View style={styles.emergencyContactInfo}>
            <Text style={styles.emergencyContactName}>{item.name}</Text>
            <Text style={styles.emergencyContactNumber}>{item.number}</Text>
          </View>
          <Ionicons name="call-outline" size={24} color={Colors.light.danger} />
        </TouchableOpacity>
      </Animated.View>
    ),
    [styles]
  );

  // --- Render Logic ---
  if (isLoadingAuth) {
    return <LoadingAnimation isDarkMode={isDarkMode} />;
  }

  if (!currentUser) {
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

  if (isLoading && !appData && !refreshing) {
    return <LoadingAnimation isDarkMode={isDarkMode} />;
  }

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
  const eventsData = appData?.upcomingEvents ?? [];
  const restaurantsData = appData?.topRatedRestaurants ?? [];
  const attractionsData = appData?.popularAttractions ?? [];
  const outdoorData = appData?.outdoorActivities ?? [];
  const cultureData = appData?.localCulture ?? [];
  const historyData = appData?.historicalSites ?? [];
  const beachesData = appData?.beachesCoastal ?? [];
  const transportData = appData?.transportationInfo ?? [];
  const emergencyData = appData?.emergencyContacts ?? [];

  // Check if sections have data to render
  const hasDestinations = destinationsData.length > 0;
  const hasHotels = hotelsData.length > 0;
  const hasEvents = eventsData.length > 0;
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
                 <Ionicons name={weather.icon || 'thermometer-outline'} size={20} color={Colors.white} />
                 <Text style={styles.weatherText}>{weather.temp}, {weather.condition}</Text>
               </View>
             )}
         </Animated.View>
      </Animated.View>

      {/* --- Animated Search Bar --- */}
      <Animated.View style={[styles.searchBarContainer, searchBarAnimatedStyle]}>
        <Pressable
          style={styles.searchBarInner}
          onPress={() => Alert.alert('Search', 'Search functionality coming soon!')}
          accessibilityRole="search"
        >
          <Ionicons name="search-outline" size={20} color={styles.searchInput.color} style={styles.searchIcon} />
          <Text style={styles.searchInput} numberOfLines={1}>
              Search Bejaia...
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => Alert.alert('Filter', 'Filter options coming soon!')}
            accessibilityLabel="Filter options"
          >
            <Ionicons name="options-outline" size={20} color={isDarkMode ? Colors.dark.tint : Colors.light.tint} />
          </TouchableOpacity>
        </Pressable>
      </Animated.View>

      {/* --- Scrollable Content --- */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? Colors.dark.tint : Colors.light.tint}
            title="Refreshing..."
            titleColor={isDarkMode ? Colors.dark.secondary : Colors.light.secondary}
            colors={[isDarkMode ? Colors.dark.tint : Colors.light.tint]}
            progressBackgroundColor={isDarkMode ? Colors.dark.cardBackground : Colors.light.cardBackground}
          />
        }
      >
        {/* Spacer View */}
        <View style={{ height: HEADER_MAX_HEIGHT }} />
        <View style={{ height: SPACING }} />

        {/* Render sections conditionally */}
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

        {hasEvents && (
            <>
                <SectionHeader
                    title="What's Happening"
                    onSeeAll={() => navigation.navigate('Events')}
                    isDarkMode={isDarkMode}
                />
                <FlatList
                    data={eventsData}
                    keyExtractor={(item) => `event-${item.id}`}
                    renderItem={renderEventCard}
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
                <FlatList
                    data={attractionsData}
                    keyExtractor={(item) => `attr-${item.id}`}
                    renderItem={renderAttractionCard}
                    numColumns={2}
                    columnWrapperStyle={styles.attractionsColumnWrapper} // Use specific style
                    contentContainerStyle={styles.attractionsContentContainer} // Use specific style
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                 />
             </>
        )}

        {hasOutdoor && (
            <>
                <SectionHeader title="Get Active Outdoors" isDarkMode={isDarkMode} />
                 <View style={styles.outdoorGridContainer}>
                    {outdoorData.map((item, index) => renderOutdoorActivity(item, index))}
                </View>
            </>
        )}


        {hasInfo && (
            // Animate the entire info card container
            <Animated.View entering={FadeInUp.duration(500).delay(200)}>
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
             // Animate the transport section
             <Animated.View entering={FadeInUp.duration(500).delay(300)}>
                <SectionHeader title="Getting Around Bejaia" isDarkMode={isDarkMode} />
                <View style={[styles.infoCard, { paddingVertical: SPACING * 0.5 }]}>
                    {transportData.map((item, index) =>
                        renderTransportInfo(item, index, index === transportData.length - 1)
                    )}
                </View>
             </Animated.View>
        )}

        {hasEmergency && (
            // Animate the emergency section
            <Animated.View entering={FadeInUp.duration(500).delay(400)}>
                <SectionHeader title="Important Contacts" isDarkMode={isDarkMode} />
                <View style={{ marginHorizontal: SPACING * 1.5, marginBottom: SPACING }}>
                    {emergencyData.map((item, index) => renderEmergencyContact(item, index))}
                </View>
            </Animated.View>
        )}

        {/* Footer Spacer */}
        <View style={{ height: SPACING * 5 }} />

      </Animated.ScrollView>
    </View>
  );
}

// Export the component
export default HomeScreen;
