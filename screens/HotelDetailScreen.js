// screens/HotelDetailScreen.js
const React = require('react');
const {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
  Share,
  StatusBar,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Modal,
  TextInput,
  Animated,
  PanResponder,
} = require('react-native');
const { Ionicons } = require('@expo/vector-icons');
const { useNavigation, useRoute } = require('@react-navigation/native');
const { LinearGradient } = require('expo-linear-gradient');
const { useSavedItems } = require('../contexts/SavedItemsContext');
const { getHotelDetails } = require('../services/dataService');
const { addDoc, collection, serverTimestamp } = require('firebase/firestore');
const { db } = require('../firebase');
const { useLanguage } = require('../contexts/LanguageContext');
const LocationView = require('../components/LocationView').default;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const SPACING = 16;
const CARD_MARGIN_HORIZONTAL = SPACING;
const CARD_MARGIN_VERTICAL = SPACING * 0.6;

// --- getThemedColors (SYNTAX FIXED) ---
// Ensure this color palette matches your application's theme consistently
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#121212' : '#F8F9FA', // Used app background
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF', // Used for cards, sections, amenity tags
    text: isDarkMode ? '#E0E0E0' : '#1A1A1A', // Primary text color
    secondaryText: isDarkMode ? '#B0B0B0' : '#6B7280', // Secondary text (descriptions, labels, N/A)
    accent: isDarkMode ? '#0A84FF' : '#007AFF', // Accent color (links, interactive elements)
    primaryGreen: isDarkMode ? '#4CAF50' : '#00796B', // Positive actions (Booking button)
    primaryBlue: isDarkMode ? '#2196F3' : '#01579B', // Info/Action (Map/Contact icons)
    primaryOrange: isDarkMode ? '#FF9800' : '#BF360C', // Price color (maybe?) - Using secondaryText for N/A
    primaryRed: isDarkMode ? '#FF453A' : '#C62828', // Danger (Error text)
    border: isDarkMode ? '#333333' : '#E0E0E0', // Borders, separators, image placeholders
    searchBackground: isDarkMode ? '#2A2A2A' : '#F0F0F0',
    modalBackground: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
    // Specific colors for elements
    starColor: isDarkMode ? '#FFD700' : '#FFC107', // Gold/Yellow for stars
    gradientStart: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    gradientEnd: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)',
});

// --- getThemedHotelDetailStyles (Improved Styling) ---
const getThemedHotelDetailStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING,
        paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.75,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 150,
    },
    content: {
        flex: 1,
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
        paddingTop: 20,
    },
    sectionCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        marginHorizontal: SPACING,
        marginBottom: SPACING,
        padding: SPACING,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: SPACING,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: colors.secondaryText,
        marginBottom: SPACING,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primaryGreen,
    },
    pricePerNight: {
        fontSize: 14,
        color: colors.secondaryText,
        marginLeft: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING,
    },
    rating: {
        fontSize: 16,
        color: colors.primaryOrange,
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 14,
        color: colors.secondaryText,
        marginLeft: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING,
    },
    locationText: {
        fontSize: 14,
        color: colors.secondaryText,
        marginLeft: 4,
        flex: 1,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SPACING,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    amenityText: {
        fontSize: 14,
        color: colors.text,
        marginLeft: 4,
    },
    description: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
        marginBottom: SPACING,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginHorizontal: SPACING,
        marginBottom: SPACING,
    },
    actionButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    primaryButton: {
        backgroundColor: colors.primaryGreen,
    },
    secondaryButton: {
        backgroundColor: colors.primaryBlue,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
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
        color: colors.secondaryText,
    },
});

function HotelDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { t } = useLanguage();
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedHotelDetailStyles(colors);

  // Add scroll animation
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [HEADER_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Get parameters from the route with better error handling
  const params = route.params || {};
  const routeHotelId = params.hotelId;
  const initialItem = params.item || null;
  const initialHotel = params.hotel || null;
  const type = params.type || 'hotel';

  // Determine the ID to use for fetching with better validation
  const currentHotelId = React.useMemo(() => {
    if (routeHotelId) return String(routeHotelId);
    if (initialItem?.id) return String(initialItem.id);
    if (initialHotel?.id) return String(initialHotel.id);
    return null;
  }, [routeHotelId, initialItem, initialHotel]);

  // State to hold the fetched hotel details
  const [hotelDetails, setHotelDetails] = React.useState(initialItem || initialHotel || null);
  const [isLoading, setIsLoading] = React.useState(!!currentHotelId && !hotelDetails);
  const [error, setError] = React.useState(null);

  // Use Saved Items Context
  const { savedItems, toggleSaveItem, isItemSaved } = useSavedItems();

  // Initialize isSaved state safely
  const [isSaved, setIsSaved] = React.useState(false);

  // Effect to Load Full Hotel Details
  React.useEffect(() => {
      const fetchDetails = async (id) => {
      if (!id) {
              console.error("HotelDetailScreen: No valid Hotel ID provided for fetching.");
        setError("Hotel ID is missing or invalid.");
              setIsLoading(false);
        setHotelDetails(null);
              return;
          }

          console.log(`Fetching hotel details for ID: ${id}...`);
      setIsLoading(true);
      setError(null);

          try {
        const hotelData = await getHotelDetails(id);

              if (hotelData) {
                  console.log(`Successfully fetched details for hotel ID: ${id}`);
          setHotelDetails(hotelData);
                  navigation.setOptions({ title: hotelData.name || 'Hotel Details' });
                  setError(null);
              } else {
                  console.warn(`Hotel with ID ${id} not found in data service.`);
          setError(`Hotel details not found.`);
          setHotelDetails(null);
              }
          } catch (err) {
              console.error(`Error fetching hotel details for ID ${id}:`, err);
        setError("Failed to load hotel details.");
        setHotelDetails(null);
          } finally {
        setIsLoading(false);
          }
      };

    const shouldFetch = currentHotelId && (!hotelDetails || hotelDetails.id !== currentHotelId);

      if (shouldFetch) {
           fetchDetails(currentHotelId);
    } else if (!currentHotelId) {
           console.error("HotelDetailScreen: No valid Hotel ID available in params.");
           setError("Cannot display details: Hotel ID is missing or invalid in navigation parameters.");
           setIsLoading(false);
           setHotelDetails(null);
      } else {
      console.log(`Using existing data for hotel ID: ${currentHotelId}`);
      setIsLoading(false);
      setError(null);
          const itemToTitle = hotelDetails || initialItem || initialHotel;
          if (itemToTitle?.name) {
               navigation.setOptions({ title: itemToTitle.name });
          } else {
               navigation.setOptions({ title: 'Hotel Details' });
          }
      }
  }, [currentHotelId, hotelDetails, initialItem, initialHotel, navigation]);

  // Effect to Update Saved Status with better validation
  React.useEffect(() => {
      const itemForSavedCheck = hotelDetails || initialItem || initialHotel;
    
    // Only check saved status if we have a valid item with an ID
    if (itemForSavedCheck && itemForSavedCheck.id) {
      try {
          setIsSaved(isItemSaved(itemForSavedCheck, type));
      } catch (err) {
        console.error("Error checking saved status:", err);
           setIsSaved(false);
      }
    } else {
      setIsSaved(false);
    }
  }, [savedItems, hotelDetails, initialItem, initialHotel, type, isItemSaved]);

  // --- Handle Save Button Press ---
  // This function uses the item data that is currently displayed (either fetched or initial).
  const handleToggleSave = React.useCallback(() => {
      // Use the item data currently in the state (fetched data takes precedence)
      const itemToSave = hotelDetails || initialItem || initialHotel;
      // Ensure item has a valid identifier before trying to save/unsave
      if (itemToSave && (itemToSave.id || itemToSave.name)) {
          // Call the context's toggle function with the item object and its type
          toggleSaveItem(itemToSave, type); // <-- USE CONTEXT TOGGLE

          // The saved status will automatically update via the useEffect above
          // which watches for changes in the context's `savedItems`
      } else {
          // This case should ideally not happen if the UI is only shown when hotelDetails exists
          Alert.alert("Error", "Cannot save item as details are not available.");
          console.error("Attempted to save item with no ID/Name:", itemToSave);
      }
  }, [hotelDetails, initialItem, initialHotel, type, toggleSaveItem]);

  // --- Placeholder Functions (DEFINED INSIDE THE COMPONENT) ---
  // Moved these definitions inside the component scope
   const renderReviewsPlaceholder = () => (
       <View style={[styles.sectionCard]}> {/* Use the new sectionCard style */}
          <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
          <Text style={styles.secondaryText}>User reviews not available.</Text>
       </View>
   );
   const renderPriceComparisonPlaceholder = () => (
        <View style={[styles.sectionCard]}> {/* Use the new sectionCard style */}
           <Text style={styles.sectionTitle}>Price Comparison</Text>
           <Text style={styles.secondaryText}>Price comparison not available.</Text>
        </View>
   );
   // --- END Placeholder Functions ---

  const handleBookNow = () => {
    if (!hotelDetails) return;
    
    navigation.navigate('BookHotel', {
        hotelId: hotelDetails.id,
        hotelName: hotelDetails.name,
        hotelImage: hotelDetails.images?.[0],
        price: hotelDetails.price,
        location: hotelDetails.location,
    });
  };

  // --- Render Logic ---

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText]}>Loading hotel details...</Text>
      </SafeAreaView>
    );
  }

  // Show error state if loading finished but there's an error or no data
  if (error || !hotelDetails) {
        return (
             <SafeAreaView style={[styles.container, styles.centered]}>
                 <Ionicons name="warning-outline" size={50} color={colors.danger} style={{ marginBottom: 10 }}/>
                <Text style={styles.errorText}>{error || "Details not found."}</Text>
                 {/* Optional: Retry button */}
                 {/* Only show retry if not loading and we have a valid ID to retry with */}
                 {!isLoading && currentHotelId && typeof currentHotelId === 'string' && (
                     // When retrying, clear hotelDetails to trigger the fetch effect again
                    <TouchableOpacity onPress={() => { setHotelDetails(null); setError(null); setIsLoading(true); }} style={{ marginTop: 20 }}>
                         <Text style={styles.linkText}>Tap to Retry</Text>
                    </TouchableOpacity>
                 )}
             </SafeAreaView>
        );
    }

  // If we reach here, isLoading is false and hotelDetails is a valid object.
  // Use hotelDetails for rendering.
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: hotelDetails?.images?.[0] }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {hotelDetails?.name}
          </Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              // Implement share functionality
            }}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{hotelDetails?.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{hotelDetails?.price}</Text>
              <Text style={styles.pricePerNight}>/ night</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color={colors.primaryOrange} />
              <Text style={styles.rating}>
                {typeof hotelDetails?.rating === 'object' 
                  ? `${hotelDetails.rating.average || 'N/A'} Stars` 
                  : `${hotelDetails?.rating || 'N/A'} Stars`}
              </Text>
              <Text style={styles.reviewCount}>
                ({typeof hotelDetails?.reviews === 'object' 
                  ? hotelDetails.reviews.length || 0 
                  : hotelDetails?.reviews || 0} reviews)
              </Text>
            </View>
            <LocationView 
              location={{
                latitude: hotelDetails?.latitude,
                longitude: hotelDetails?.longitude,
                address: hotelDetails?.address
              }}
              style={styles.locationContainer}
              textStyle={styles.locationText}
              iconColor={colors.accent}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {(hotelDetails?.amenities || []).map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.primaryGreen} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{hotelDetails?.description || 'No description available.'}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: SPACING }}
            >
              {(hotelDetails?.images || []).map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ marginRight: SPACING }}
                  onPress={() => {
                    // Handle image preview
                  }}
                >
                  <Image
                    source={{ uri: image }}
                    style={{
                      width: 200,
                      height: 150,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleToggleSave}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleBookNow}
        >
          <Text style={styles.buttonText}>{t('bookNow')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 18,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    marginLeft: 8,
  },
  location: {
    fontSize: 16,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  perNight: {
    fontSize: 16,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 4,
    flex: 1,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
  },
  bookNowButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  bookNowButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
  },
});

module.exports = HotelDetailScreen;