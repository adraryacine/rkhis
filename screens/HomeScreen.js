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
  ZoomIn,
} from 'react-native-reanimated'; // Keep Reanimated
import { useNavigation } from '@react-navigation/native'; // Keep Navigation
// import LottieView from 'lottie-react-native'; // No longer needed, commented out
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


// --- Mock Data (abridged for brevity) ---
// NOTE: In a real app, data fetching functions would handle this.
const initialMockData = {
  featuredDestinations: [
    { id: 'dest1', name: 'Bejaia City Exploration', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg/1280px-Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg', description: 'Historic port & vibrant center', tags: ['city', 'culture'] },
    { id: 'dest2', name: 'Aokas Golden Sands', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Plage_d%27Aokas.jpg/1280px-Plage_d%27Aokas.jpg', description: 'Relax on the stunning coastline' },
  ],
  upcomingEvents: [
    { id: 'event1', name: 'Festival International de Théâtre', date: 'Oct 2024', location: 'Theatre Regional', image: 'https://via.placeholder.com/160x110/8A2BE2/FFFFFF?text=Theatre+Fest' },
  ],
  topRatedRestaurants: [
    { id: 'rest1', name: 'Le Dauphin Bleu', rating: 4.8, cuisine: 'Seafood, Mediterranean', image: 'https://media-cdn.tripadvisor.com/media/photo-s/0f/3c/93/48/le-dauphin-bleu.jpg', priceRange: '$$$' },
  ],
  recommendedHotels: [
    { id: 'hotel1', name: 'Hotel Royal Bejaia', price: '~$140', rating: 4.7, image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/1a/9b/0d/hotel-exterior.jpg?w=1200&h=-1&s=1', amenities: ['Pool', 'Spa', 'Restaurant'], latitude: 36.7520, longitude: 5.0860 },
  ],
  popularAttractions: [
    { id: 'attr1', name: 'Gouraya Park', description: 'Nature & Views', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%E1%B4%B0.jpg/1024px-Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%E1%B4%B0.jpg', latitude: 36.7600, longitude: 5.0900, openingHours: '8 AM - 6 PM', entranceFee: '50 DZD' },
    { id: 'attr2', name: 'Cap Carbon Lighthouse', description: 'Panoramic Coastal Views', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Cap_Carbon_%28B%C3%A9ja%C3%AFa%29_-_Alg%C3%A9rie.jpg/1280px-Cap_Carbon_%28B%C3%A9ja%C3%AFa%29_-_Alg%C3%A9rie.jpg', latitude: 36.785, longitude: 5.105 },
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

// --- Placeholder Data Fetching Functions (Moved here, remove import) ---
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
const headerImageUrl = 'https://images.unsplash.com/photo-1593468663047-3a188a3bc489?q=80&w=1974&auto=format&fit=crop';
const placeholderImage = 'https://via.placeholder.com/300x200.png?text=Image+Loading';


// --- Themed Styles ---
// (getThemedStyles function remains the same as before)
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
    },
    destinationImage: {
      flex: 1,
      // No border radius here, handled by cardBase overflow: 'hidden'
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
    },
    hotelImage: {
      width: '100%',
      height: screenHeight * 0.18, // Slightly smaller image
      // Top radius handled by cardBase overflow: 'hidden'
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
    attractionCard: {
      width: (screenWidth - SPACING * 4.5) / 2, // Two columns with spacing
      marginBottom: SPACING * 1.5,
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
    gridContainer: {
      // This style is now applied to FlatList's columnWrapperStyle
      justifyContent: 'space-between', // Distribute items evenly in the row
      paddingHorizontal: SPACING * 0.75, // Horizontal padding for the grid overall
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
  return (
    <Animated.View entering={FadeIn.delay(200)} style={styles.sectionHeaderContainer}>
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
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <Animated.View style={[styles.cardBase, style, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = 0.97)} // Slightly less pronounced press
        onPressOut={() => (scale.value = 1)}
        accessibilityLabel={accessibilityLabel}
        style={{ flex: 1 }} // Ensure pressable fills the card
      >
        {children}
      </Pressable>
    </Animated.View>
  );
});

// No longer needed if Lottie is removed
// const AnimatedLottie = React.memo(({ source, style, loop = true }) => (
//   <LottieView
//     source={source}
//     autoPlay
//     loop={loop}
//     style={style}
//     hardwareAccelerationAndroid // Enable hardware acceleration if possible
//     renderMode={Platform.OS === 'ios' ? 'HARDWARE' : 'AUTOMATIC'} // Optimize render mode
//     onError={(error) => console.warn('Lottie animation failed to load:', error)}
//   />
// ));

const LoadingAnimation = ({ isDarkMode }) => {
    const styles = getThemedStyles(isDarkMode);
    // *** FIX: Using standard ActivityIndicator instead of Lottie ***
    return (
        <View style={styles.loadingContainer}>
            {/* Use standard ActivityIndicator */}
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

  // --- Animations ---
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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
          [0, HEADER_SCROLL_DISTANCE / 2], // Fade out quicker
          [1, 0],
          Extrapolate.CLAMP
      ),
      transform: [{
          translateY: interpolate(
              scrollY.value,
              [0, HEADER_SCROLL_DISTANCE],
              [0, 50], // Move down slightly as it fades
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
          [0, -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - SPACING * 1.5)], // Adjust target position
          Extrapolate.CLAMP
        ),
      },
    ],
    // Optionally fade in/out or change shadow based on scroll
  }));

  // --- Effects ---
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening');
    // TODO: Fetch real weather based on location
    // For now, use placeholder and determine icon
    // This is a simplified mapping
    const placeholderWeather = { temp: '28°C', condition: 'Clear', icon: 'weather-sunny' }; // Example
    setWeather(placeholderWeather);

  }, []); // Run only once on mount

  const fetchAllData = useCallback(async (useCache = true) => {
    console.log('Fetching data...');
    if (!refreshing) setIsLoading(true); // Show loading only if not refreshing

    // Try loading from cache first if allowed
    if (useCache) {
      try {
        const cachedDataString = await AsyncStorage.getItem('cachedData');
        if (cachedDataString) {
          console.log('Using cached data.');
          setAppData(JSON.parse(cachedDataString));
          setIsLoading(false); // Stop loading indicator if cache is used
        }
      } catch (cacheError) {
        console.warn('Error reading cache:', cacheError);
      }
    }

    // Fetch fresh data from API (using placeholders)
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

      // Helper to get value or default to empty array on failure
      const getValueOrDefault = (result, key, defaultValue = []) => // Added key param
        result.status === 'fulfilled' ? result.value : (appData?.[key] || defaultValue); // Fallback to existing appData if fetch fails


      const data = {
        featuredDestinations: getValueOrDefault(featuredDestinationsResult, 'featuredDestinations', []),
        upcomingEvents: getValueOrDefault(upcomingEventsResult, 'upcomingEvents', []),
        topRatedRestaurants: getValueOrDefault(topRatedRestaurantsResult, 'topRatedRestaurants', []),
        recommendedHotels: getValueOrDefault(recommendedHotelsResult, 'recommendedHotels', []),
        popularAttractions: getValueOrDefault(popularAttractionsResult, 'popularAttractions', []),
        // Keep static data from initialMockData
        localCulture: initialMockData.localCulture,
        historicalSites: initialMockData.historicalSites,
        beachesCoastal: initialMockData.beachesCoastal,
        outdoorActivities: initialMockData.outdoorActivities,
        transportationInfo: initialMockData.transportationInfo,
        emergencyContacts: initialMockData.emergencyContacts,
      };

      setAppData(data);
      // Cache the newly fetched data
      try {
        // Only cache if data is meaningful (e.g., not just empty arrays from failed fetches)
        if (data.featuredDestinations?.length || data.recommendedHotels?.length) {
             await AsyncStorage.setItem('cachedData', JSON.stringify(data));
             console.log('Data cached successfully.');
        }
      } catch (cacheError) {
        console.error('Error caching data:', cacheError);
      }

      // TODO: Fetch real weather here
      setWeather({ temp: '29°C', condition: 'Sunny', icon: 'weather-sunny' }); // Update weather if fetch succeeds

    } catch (error) {
      console.error('Error fetching data:', error);
      // If fetching fails and we don't have cached data, show error
      if (!appData) {
        Alert.alert('Error', 'Failed to load essential data. Please check your connection and try again.');
      } else {
        // If fetching fails but we *do* have cached data, inform the user
        Alert.alert('Offline Mode', 'Could not refresh data. Displaying previously loaded information.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [appData, refreshing]); // Depend on appData and refreshing state

  // Initial data load logic
  useEffect(() => {
    if (!isLoadingAuth && currentUser) {
      fetchAllData(); // Fetch data (will try cache first)
    } else if (!isLoadingAuth && !currentUser) {
      // Handle logged out state - clear data, show login prompt etc.
      setAppData(null);
      setIsLoading(false);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingAuth, currentUser]); // Run when auth state changes

  // Load saved items from storage on mount
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

  // Persist saved items whenever they change
  useEffect(() => {
    // Avoid saving the initial empty set unnecessarily
    const persistSavedItems = async () => {
        try {
            // Check if savedItems actually changed before writing
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
    // Only run if savedItems is not the initial empty set, or if it has been loaded
     if (savedItems.size > 0 || AsyncStorage.getItem('savedTripItems')) {
        persistSavedItems();
     }
  }, [savedItems]);


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData(false); // Force fetch fresh data, don't rely on cache first
  }, [fetchAllData]);

  // Trip Planner Save/Unsave Logic
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
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase tap area
        accessibilityLabel={isSaved ? `Remove ${item.name} from saved items` : `Save ${item.name}`}
      >
        <Ionicons
          name={isSaved ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={isSaved ? Colors.light.tint : iconColor} // Use tint color when saved
          style={styles.saveIcon}
        />
      </TouchableOpacity>
    );
  }, [savedItems, toggleSaveItem, styles]); // Include styles if it uses themed colors directly

  const renderDestinationCard = useCallback(
    ({ item, index }) => ( // Added index for potential animation delay
      <Animated.View entering={SlideInLeft.delay(index * 100).duration(400)}>
        <AnimatedCard
          style={styles.destinationCard}
          onPress={() => navigation.navigate('DestinationDetail', { destinationId: item.id })} // Ensure 'DestinationDetail' exists
          accessibilityLabel={`View details for ${item.name}`}
          isDarkMode={isDarkMode}
        >
          <ImageBackground
            source={{ uri: item.image || placeholderImage }}
            style={styles.destinationImage}
            resizeMode="cover"
            // Add onError fallback for ImageBackground if needed
             onError={(e) => console.log(`Failed to load image: ${item.image}`, e.nativeEvent.error)}
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
          {renderSaveButton(item, 'destination')}
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton]
  );

  const renderHotelCard = useCallback(
    ({ item, index }) => (
      <Animated.View entering={SlideInLeft.delay(index * 100).duration(400)}>
        <AnimatedCard
          style={styles.hotelCard}
          onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id })} // Ensure 'HotelDetail' exists
          accessibilityLabel={`View details for ${item.name}, Rating ${item.rating}, Price ${item.price}`}
          isDarkMode={isDarkMode}
        >
          <Image
             source={{ uri: item.image || placeholderImage }}
             style={styles.hotelImage}
             resizeMode="cover"
             onError={(e) => console.log(`Failed to load image: ${item.image}`, e.nativeEvent.error)}
          />
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={Colors.light.success} /> {/* Consistent color */}
              <Text style={styles.hotelRating}>{item.rating} Stars</Text>
            </View>
            <Text style={styles.hotelPrice}>{item.price}/night</Text>
          </View>
          {renderSaveButton(item, 'hotel', isDarkMode ? Colors.dark.tint : Colors.light.tint)}
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton]
  );

  const renderEventCard = useCallback(
    ({ item, index }) => (
      <Animated.View entering={SlideInLeft.delay(index * 100).duration(400)}>
        <AnimatedCard
          style={styles.eventCard}
          onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} // Ensure 'EventDetail' exists
          accessibilityLabel={`View details for ${item.name} on ${item.date} at ${item.location}`}
          isDarkMode={isDarkMode}
        >
           <Image
             source={{ uri: item.image || placeholderImage }}
             style={styles.eventImage}
             resizeMode="cover"
             onError={(e) => console.log(`Failed to load image: ${item.image}`, e.nativeEvent.error)}
           />
          <View style={styles.eventInfo}>
            <Text style={styles.eventName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.eventDetails}>{item.date} • {item.location}</Text>
          </View>
          {/* No save button for events in this design, could be added */}
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode]
  );

  const renderRestaurantCard = useCallback(
    ({ item, index }) => (
      <Animated.View entering={SlideInLeft.delay(index * 100).duration(400)}>
        <AnimatedCard
          style={styles.restaurantCard}
          onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })} // Ensure 'RestaurantDetail' exists
          accessibilityLabel={`View details for ${item.name}, Cuisine: ${item.cuisine}, Price Range: ${item.priceRange}`}
          isDarkMode={isDarkMode}
        >
           <Image
             source={{ uri: item.image || placeholderImage }}
             style={styles.restaurantImage}
             resizeMode="cover"
             onError={(e) => console.log(`Failed to load image: ${item.image}`, e.nativeEvent.error)}
            />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.restaurantDetails}>{item.cuisine} • {item.priceRange}</Text>
            {/* Optional: Add rating here */}
          </View>
          {/* No save button for restaurants here, could be added */}
        </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode]
  );

  const renderAttractionCard = useCallback(
    ({ item, index }) => ( // Index for potential stagger animation
      <Animated.View
          style={{ width: styles.attractionCard.width, marginBottom: SPACING * 1.5 }} // Apply width and bottom margin here
          entering={ZoomIn.delay(index * 50).duration(300)} // Staggered zoom-in
      >
          <AnimatedCard
              style={{ flex: 1 }} // Card takes full space of the animated view container
              onPress={() => navigation.navigate('AttractionDetail', { attractionId: item.id })} // Ensure 'AttractionDetail' exists
              accessibilityLabel={`View details for ${item.name}`}
              isDarkMode={isDarkMode}
          >
              <Image
                 source={{ uri: item.image || placeholderImage }}
                 style={styles.attractionImage}
                 resizeMode="cover"
                 onError={(e) => console.log(`Failed to load image: ${item.image}`, e.nativeEvent.error)}
               />
              <Text style={styles.attractionName} numberOfLines={1}>{item.name}</Text>
              {/* Save button absolutely positioned within the card */}
              {renderSaveButton(item, 'attraction', isDarkMode ? Colors.dark.tint : Colors.light.tint)}
          </AnimatedCard>
      </Animated.View>
    ),
    [navigation, styles, isDarkMode, renderSaveButton]
  );


 const renderInfoItem = useCallback((text, key) => (
     <View style={styles.infoItemContainer} key={key}>
         <Text style={styles.infoBullet}>•</Text>
         <Text style={styles.infoItemText}>{text}</Text>
     </View>
 ), [styles]);


  const renderOutdoorActivity = useCallback(
    (item, index) => (
      <Animated.View
          key={item.id}
          style={styles.outdoorActivityCardContainer} // Use container for spacing
          entering={ZoomIn.delay(index * 80).springify()}
      >
        <AnimatedCard
          style={styles.outdoorActivityCard} // Apply styling to the card itself
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
      <Animated.View key={item.id} entering={SlideInLeft.delay(index * 100).springify()}>
        {/* Apply border style conditionally */}
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
    (item, index) => ( // Added index for animation delay
      <Animated.View key={item.id} entering={SlideInLeft.delay(index * 100).springify()}>
        <TouchableOpacity
          style={styles.emergencyContactButton}
          onPress={() => Linking.openURL(`tel:${item.number}`).catch(() => Alert.alert('Error', 'Could not open phone dialer.'))}
          accessibilityLabel={`Call ${item.name} at ${item.number}`}
          accessibilityRole="button"
        >
          <Ionicons name={item.icon || 'call-outline'} size={24} color={Colors.light.danger} /> {/* Consistent Danger color */}
          <View style={styles.emergencyContactInfo}>
            <Text style={styles.emergencyContactName}>{item.name}</Text>
            <Text style={styles.emergencyContactNumber}>{item.number}</Text>
          </View>
          <Ionicons name="call-outline" size={24} color={Colors.light.danger} />
        </TouchableOpacity>
      </Animated.View>
    ),
    [styles] // No dark mode dependency here if colors are fixed
  );

  // --- Render Logic ---
  if (isLoadingAuth) {
    // Show loading animation while checking authentication
    return <LoadingAnimation isDarkMode={isDarkMode} />;
  }

  if (!currentUser) {
    // User is not logged in, show a prompt to log in
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="log-in-outline" size={60} color={styles.loadingText.color} />
        <Text style={styles.loadingText}>Please log in or sign up</Text>
        <Text style={[styles.infoText, { textAlign: 'center', marginTop: SPACING }]}>
            Log in to discover Bejaia, save your favorite places, and plan your trip!
        </Text>
        {/* Button to navigate to Login screen (ensure 'Login' screen exists in your navigator) */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: SPACING * 2 }}>
            <Text style={styles.linkText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading only if data is truly null initially AND not refreshing
  if (isLoading && !appData && !refreshing) {
    return <LoadingAnimation isDarkMode={isDarkMode} />;
  }

  // Handle case where initial fetch failed and no cache exists
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

  // Check if essential data sections are available to render
  // Use optional chaining ?. and nullish coalescing ?? [] to safely access data
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
            style={[styles.headerImageBackground, headerImageAnimatedStyle]} // Apply transform to Image directly
            resizeMode="cover"
            onError={(e) => console.log(`Failed to load header image: ${headerImageUrl}`, e.nativeEvent.error)}
        />
         {/* Overlay must be separate */}
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
          {/* Use Text to display placeholder when not editable */}
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
        scrollEventThrottle={16} // iOS optimized rate
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? Colors.dark.tint : Colors.light.tint}
            title="Refreshing..." // iOS only
            titleColor={isDarkMode ? Colors.dark.secondary : Colors.light.secondary} // iOS only
            colors={[isDarkMode ? Colors.dark.tint : Colors.light.tint]} // Android progress color
            progressBackgroundColor={isDarkMode ? Colors.dark.cardBackground : Colors.light.cardBackground} // Android BG color
          />
        }
      >
        {/* Spacer View to push content below the absolute positioned header */}
        <View style={{ height: HEADER_MAX_HEIGHT }} />
        {/* Extra space before the first section */}
        <View style={{ height: SPACING }} />

        {/* Render sections only if data exists */}
        {hasDestinations && (
            <>
                <SectionHeader
                    title="Explore Bejaia"
                    onSeeAll={() => navigation.navigate('Destinations')}
                    isDarkMode={isDarkMode}
                />
                <FlatList
                    data={destinationsData} // Use safe data variable
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
                    data={hotelsData} // Use safe data variable
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
                    data={eventsData} // Use safe data variable
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
                    data={restaurantsData} // Use safe data variable
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
                {/* Use FlatList for Grid for potential optimizations */}
                <FlatList
                    data={attractionsData} // Use safe data variable
                    keyExtractor={(item) => `attr-${item.id}`}
                    renderItem={renderAttractionCard}
                    numColumns={2} // Specify number of columns
                    // Apply column wrapper style for spacing between columns in a row
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: SPACING * 0.75 }}
                    // Apply content container style for overall padding/margin if needed
                    contentContainerStyle={{ paddingHorizontal: SPACING * 0.75 }} // Overall horizontal padding for the grid
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false} // Disable scroll if inside ScrollView
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
            <Animated.View entering={FadeIn.delay(300)}>
              <View style={styles.infoCard}>
                {cultureData.length > 0 && (
                    <>
                        <Text style={styles.infoTitle}>Culture & Traditions</Text>
                        {cultureData.map((item) => renderInfoItem(item.description, `cult-${item.id}`))}
                    </>
                )}
                {historyData.length > 0 && (
                    <>
                        <Text style={[styles.infoTitle, { marginTop: cultureData.length > 0 ? SPACING : 0 }]}>Historical Gems</Text>
                        {historyData.map((item) => renderInfoItem(`${item.name}: ${item.description}`, `hist-${item.id}`))}
                    </>
                )}
                {beachesData.length > 0 && (
                   <>
                        <Text style={[styles.infoTitle, { marginTop: (cultureData.length > 0 || historyData.length > 0) ? SPACING : 0 }]}>Beaches & Coastline</Text>
                        {beachesData.map((item) => renderInfoItem(`${item.name}: ${item.description}`, `beach-${item.id}`))}
                   </>
                )}
              </View>
            </Animated.View>
        )}

        {hasTransport && (
             <>
                <SectionHeader title="Getting Around Bejaia" isDarkMode={isDarkMode} />
                <View style={[styles.infoCard, { paddingVertical: SPACING * 0.5 }]}>
                    {transportData.map((item, index) =>
                        renderTransportInfo(item, index, index === transportData.length - 1)
                    )}
                </View>
             </>
        )}

        {hasEmergency && (
            <>
                <SectionHeader title="Important Contacts" isDarkMode={isDarkMode} />
                <View style={{ marginHorizontal: SPACING * 1.5, marginBottom: SPACING }}>
                    {emergencyData.map((item, index) => renderEmergencyContact(item, index))}
                </View>
            </>
        )}

        {/* Footer Spacer */}
        <View style={{ height: SPACING * 5 }} />

      </Animated.ScrollView>
    </View>
  );
}

// Export the component
export default HomeScreen;
