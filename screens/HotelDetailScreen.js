// screens/HotelDetailScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator,
  Alert, Linking, Platform, TouchableOpacity, useColorScheme, SafeAreaView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// Import the data service function to fetch hotel details
import { getHotelDetails } from '../services/dataService'; // <-- IMPORT THIS
// Import the Saved Items Context hook
import { useSavedItems } from '../contexts/SavedItemsContext'; // <-- IMPORT THIS


const SPACING = 15; // Base spacing unit

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
    // Specific colors for elements
    starColor: isDarkMode ? '#FFD700' : '#FFC107', // Gold/Yellow for stars
});

// --- getThemedHotelDetailStyles (Improved Styling) ---
const getThemedHotelDetailStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    scrollContent: { paddingBottom: SPACING * 4 }, // Add bottom padding to the scrollable content
    loadingText: { marginTop: SPACING, fontSize: 16, color: colors.secondaryText },
    errorText: { fontSize: 18, color: colors.danger, textAlign: 'center' },
    hotelImageContainer: { // Container for the image/fallback
        width: '100%',
        height: 250, // Fixed height for the image area
        backgroundColor: colors.border, // Background for fallback/loading
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackIcon: { // Style for fallback icon
         marginBottom: SPACING * 0.5,
         color: colors.secondaryText, // Icon color when image is not available
    },
    fallbackText: { // Style for fallback text
        fontSize: 14,
        color: colors.secondaryText, // Text color when image is not available
    },
     // NEW style for the main content wrapper below the image
     mainContentWrapper: {
        paddingHorizontal: SPACING, // Apply consistent horizontal padding to everything below the image
        paddingTop: SPACING, // Add some space between the image and the first content block
     },
    // Styles for the card-like containers for different sections
    sectionCard: {
        backgroundColor: colors.card, // Use card background
        borderRadius: SPACING,
        padding: SPACING, // Internal padding for card content
        marginBottom: SPACING, // Space between sections
        shadowColor: '#000', // Basic shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    hotelName: { fontSize: 24, fontWeight: 'bold', marginBottom: SPACING, color: colors.text }, // Adjust margin bottom
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING * 1.5 }, // Adjust margin bottom
    ratingContainer: { flexDirection: 'row', alignItems: 'center' },
    hotelRating: { fontSize: 18, fontWeight: '600', marginLeft: SPACING * 0.5, color: colors.secondaryText }, // Use secondary color for rating/N/A
    hotelPrice: { fontSize: 18, fontWeight: 'bold', color: colors.secondaryText }, // Use secondary color for price/N/A
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: SPACING * 0.8, // Space below title
        // Removed border/padding bottom here, let sections define their own internal layout if needed
    },
    secondaryText: { fontSize: 15, lineHeight: 22, color: colors.secondaryText }, // Used for description text
    amenitiesList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING * 0.8, marginTop: SPACING*0.5 }, // Space between amenity tags
    amenityItem: {
        paddingVertical: SPACING * 0.5,
        paddingHorizontal: SPACING,
        borderRadius: SPACING * 1.5, // Pill shape
        borderWidth: 1,
        borderColor: colors.border, // Border color
        backgroundColor: colors.background, // Use background color within the card
    },
    amenityText: { fontSize: 14, color: colors.text }, // Text color for amenity tags
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING * 0.8, paddingVertical: SPACING * 0.5 }, // Space between info rows
    infoIcon: { marginRight: SPACING, color: colors.secondaryText, marginTop: 3 }, // Icon styling
    infoText: { fontSize: 16, color: colors.secondaryText, flex: 1 }, // Info text style, wraps
    linkText: { fontSize: 16, fontWeight: '600', color: colors.accent, textDecorationLine: 'underline' }, // Styled link text for phone/website
    button: {
        paddingVertical: SPACING * 1.2,
        borderRadius: SPACING, // Rounded corners for button
        alignItems: 'center',
        marginTop: SPACING * 2, // Space above button
        marginBottom: SPACING * 2, // Space below button
        // marginHorizontal is handled by mainContentWrapper padding
    },
    buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }, // Button text color
     saveButtonContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20, // Adjust based on status bar/notch for header area
        right: SPACING, // Aligned with main content padding
        zIndex: 10, // High zIndex to ensure it's tappable over the image
        backgroundColor: 'rgba(0,0,0,0.4)', // Semi-transparent dark background
        borderRadius: 20, // Make it round
        padding: 5, // Padding inside the circle
        justifyContent: 'center', // Center icon
        alignItems: 'center', // Center icon
    },
    saveIcon: {
        // Color set dynamically in JSX
    },
    footerSpacer: { height: SPACING * 4 } // Space at the bottom
});


function HotelDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedHotelDetailStyles(colors);

  // Get parameters from the route
  // Use a fallback object {} to prevent errors if params are null/undefined
  // Look for 'hotelId', 'item', and 'type'
  const {
      hotelId: routeHotelId, // Parameter named 'hotelId'
      item: initialItem, // Parameter named 'item' (from HomeScreen/FavoritesScreen)
      hotel: initialHotel, // Parameter named 'hotel' (from HotelReservationScreen)
      type = 'hotel' // Default type if not provided
  } = route.params || {}; // Use a fallback object {}

   // Determine the ID to use for fetching. Prioritize routeHotelId, then item.id, then hotel.id
   // Ensure the ID is treated as a string for consistency with Firestore document IDs
   // Handle potential null/undefined IDs gracefully
  const currentHotelId = String(routeHotelId || initialItem?.id || initialHotel?.id || ''); // Default to empty string if no ID found


  // State to hold the fetched hotel details. Use passed data for initial state if available.
  const [hotelDetails, setHotelDetails] = useState(initialItem || initialHotel || null);
  // State for loading status. True if we have a valid ID but no initial data.
  // Check if currentHotelId is a non-empty string AND we don't have initial data.
  const [isLoading, setIsLoading] = useState(!!currentHotelId && !hotelDetails);
  // State for error message
  const [error, setError] = useState(null);

  // Use Saved Items Context for save status and toggling
  const { savedItems, toggleSaveItem, isItemSaved } = useSavedItems(); // <-- USE CONTEXT HOOK

  // State to track if the current hotel is saved (based on context)
  // Initialize based on the *initial* item data we might have
  const [isSaved, setIsSaved] = useState(isItemSaved(initialItem || initialHotel, type));


  // --- Effect to Load Full Hotel Details ---
  // This effect runs when the component mounts or when currentHotelId changes.
  // Added hotelDetails to dependencies to avoid stale data when checking shouldFetch
  useEffect(() => {
      const fetchDetails = async (id) => {
          // Also check if id is a non-empty string
          if (!id || typeof id !== 'string') {
              console.error("HotelDetailScreen: No valid Hotel ID provided for fetching.");
              setError("Hotel ID is missing or invalid."); // User-friendly error
              setIsLoading(false);
              setHotelDetails(null); // Clear any partial data
              return;
          }

          console.log(`Fetching hotel details for ID: ${id}...`);
          setIsLoading(true); // Start loading
          setError(null); // Clear previous errors

          try {
              // Fetch the full details from your data service using the ID
              const data = await getHotelDetails(id); // <-- Call your data service function

              if (data) {
                  console.log(`Successfully fetched details for hotel ID: ${id}`);
                  setHotelDetails(data); // Update state with the full fetched data
                  // Update the screen title once data is loaded
                  navigation.setOptions({ title: data.name || 'Hotel Details' });

              } else {
                   // If dataService returns null (meaning not found even in mock/fallback)
                  console.warn(`Hotel with ID ${id} not found in data service.`);
                  setError(`Hotel details not found.`); // User-friendly error message
                  setHotelDetails(null); // Clear details
              }
          } catch (err) {
              console.error(`Error fetching hotel details for ID ${id}:`, err);
              setError("Failed to load hotel details."); // User-friendly error message on fetch error
              setHotelDetails(null); // Clear details on error
          } finally {
              setIsLoading(false); // End loading regardless of success or failure
          }
      };

      // Decide whether to fetch:
      // We should fetch if we have a valid ID AND
      //   (1) We didn't get an initial data object (item or hotel) OR
      //   (2) The data we currently have in state is null OR
      //   (3) The ID in the data state is different from the ID we should be showing
      const hasInitialData = initialItem || initialHotel; // Check if *any* initial data object was passed
      const shouldFetch = currentHotelId && typeof currentHotelId === 'string' &&
                          (!hasInitialData || hotelDetails === null || hotelDetails.id !== currentHotelId);


      if (shouldFetch) {
           fetchDetails(currentHotelId);
      } else if (!currentHotelId || typeof currentHotelId !== 'string') {
          // Handle case where *no* valid ID is available at all
           console.error("HotelDetailScreen: No valid Hotel ID available in params.");
           setError("Cannot display details: Hotel ID is missing or invalid in navigation parameters.");
           setIsLoading(false);
           setHotelDetails(null);
      } else {
          // If we are here, it means we have a valid ID and the current `hotelDetails` state
          // either matches this ID (from initial params) or it's the first render with initial data.
          // So, we don't need to fetch immediately.
          console.log(`Using existing data (from params) for hotel ID: ${currentHotelId}`);
          setIsLoading(false); // Not loading if using initial data
          setError(null); // Clear any old error state
           // Set screen title based on the item data we have
          const itemToTitle = hotelDetails || initialItem || initialHotel;
          if (itemToTitle?.name) {
               navigation.setOptions({ title: itemToTitle.name });
          } else {
               navigation.setOptions({ title: 'Hotel Details' });
          }
      }

      // Cleanup function for the effect
      // This can be useful if you had subscriptions or event listeners initiated here
      return () => {
         // Any cleanup needed when dependencies change or component unmounts
         // console.log(`Cleaning up effect for hotel ID: ${currentHotelId}`);
      };

      // Added getHotelDetails to dependencies as it's called inside the effect
      // Added navigation because setOptions is called
      // Added item/hotel params and hotelDetails state as they influence fetch logic
  }, [currentHotelId, initialItem, initialHotel, navigation, hotelDetails, getHotelDetails]);


  // --- Effect to Update Saved Status ---
  // This effect runs when the displayed item data changes OR when the context's saved items list changes.
  useEffect(() => {
      // Get the item we are currently displaying (either fetched or initial)
      const itemForSavedCheck = hotelDetails || initialItem || initialHotel;
      if (itemForSavedCheck) {
          // Check if the current item is saved using the context's helper
          setIsSaved(isItemSaved(itemForSavedCheck, type));
      } else {
           // If no item data is available, it can't be saved
           setIsSaved(false);
      }
      // This effect should re-run whenever the item data changes or the context's savedItems list changes
  }, [savedItems, hotelDetails, initialItem, initialHotel, type, isItemSaved]);


  // --- Handle Save Button Press ---
  // This function uses the item data that is currently displayed (either fetched or initial).
  const handleToggleSave = useCallback(() => {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Save Button (Absolute positioned - sits over the scrollable content) */}
         <TouchableOpacity
           style={styles.saveButtonContainer}
           onPress={handleToggleSave}
           // Use name from hotelDetails for accessibility label
           accessibilityLabel={isSaved ? `Remove ${hotelDetails.name || 'this item'} from saved` : `Save ${hotelDetails.name || 'this item'}`}
         >
           <Ionicons
             name={isSaved ? 'bookmark' : 'bookmark-outline'} // Use bookmark icons
             size={26}
             color={isSaved ? colors.accent : 'white'} // Accent color when saved, white/iconColor when unsaved
             style={styles.saveIcon}
           />
        </TouchableOpacity>

        {/* Hotel Image or Fallback */}
        {hotelDetails.image ? (
            <Image source={{ uri: hotelDetails.image }} style={styles.hotelImageContainer} resizeMode="cover" />
        ) : (
             <View style={styles.hotelImageContainer}>
                 <Ionicons name="business-outline" size={60} color={styles.fallbackIcon.color} style={styles.fallbackIcon}/>
                 <Text style={styles.fallbackText}>Image Not Available</Text>
             </View>
        )}

        {/* --- START Main Content Wrapper --- */}
        {/* Wrap all content below the image in a single View */}
        <View style={styles.mainContentWrapper}> {/* <-- OPENING TAG FOR MAIN CONTENT WRAPPER */}

            {/* Content Block 1: Name, Rating, Price, Description */}
            {/* Use sectionCard for background/shadow/border/internal padding */}
            <View style={styles.sectionCard}>
                <Text style={styles.hotelName}>{hotelDetails?.name || 'Hotel Details'}</Text>

                {/* Show Actual Rating/Price if available, otherwise N/A */}
                <View style={styles.detailRow}>
                    <View style={styles.ratingContainer}>
                         {/* Use star icon color based on whether rating is available */}
                         <Ionicons name="star" size={20} color={hotelDetails?.rating ? colors.starColor : colors.secondaryText} style={{marginRight: SPACING * 0.5}} />
                        <Text style={styles.hotelRating}>{hotelDetails?.rating ? `${hotelDetails.rating} Stars` : 'Rating N/A'}</Text>
                    </View>
                    <Text style={styles.hotelPrice}>{hotelDetails?.price ? `${hotelDetails.price}/night` : 'Price N/A'}</Text>
                </View>

                {/* Display Description if available */}
                {hotelDetails?.description && (
                    <>
                        {/* Section title within the card */}
                        <Text style={[styles.sectionTitle, {marginTop: SPACING}]}>Description</Text> {/* Added specific top margin */}
                        <Text style={styles.secondaryText}>{hotelDetails.description}</Text>
                    </>
                )}
            </View> {/* <-- CLOSING TAG for sectionCard */}


            {/* Display Amenities if available */}
            {hotelDetails?.amenities && Array.isArray(hotelDetails.amenities) && hotelDetails.amenities.length > 0 && (
                 // Amenities View - Use sectionCard style
                 <View style={styles.sectionCard}> {/* Use the new sectionCard style */}
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesList}>
                        {hotelDetails.amenities.map((amenity, index) => (
                           <View key={index} style={styles.amenityItem}>
                                <Text style={styles.amenityText}>{amenity}</Text>
                           </View>
                        ))}
                    </View>
                </View>
            )}

             {/* Location Section - Use coordinates or address */}
             {(hotelDetails?.latitude || hotelDetails?.address) && (
                  // Location View - Use sectionCard style
                 <View style={styles.sectionCard}> {/* Use the new sectionCard style */}
                     <Text style={styles.sectionTitle}>Location</Text>
                     <TouchableOpacity style={styles.infoRow} onPress={() => {
                         const lat = hotelDetails.latitude;
                         const lng = hotelDetails.longitude;
                         const label = hotelDetails.name || 'Hotel Location';
                         // Prefer lat/lng for map link
                         const url = (lat && lng)
                             ? Platform.select({ ios: `maps:${lat},${lng}?q=${label}`, android: `geo:${lat},${lng}?q=${label}` })
                             : `geo:0,0?q=${encodeURIComponent(hotelDetails.address || label)}`; // Fallback to address query
                          Linking.openURL(url).catch(err => Alert.alert("Error", "Could not open map."));
                     }}>
                         <Ionicons name="location-outline" size={20} color={styles.infoIcon.color} style={styles.infoIcon} />
                         {/* Display address if available, otherwise coordinates */}
                         <Text style={styles.linkText}>{hotelDetails?.address || `${hotelDetails.latitude?.toFixed(5)}, ${hotelDetails.longitude?.toFixed(5)}`}</Text>
                         <Ionicons name="navigate-outline" size={20} color={colors.accent} />
                     </TouchableOpacity>
                 </View>
             )}

             {/* Contact Section - Show if phone or website exists */}
              {(hotelDetails?.phone || hotelDetails?.website) && (
                  // Contact View - Use sectionCard style
                 <View style={styles.sectionCard}> {/* Use the new sectionCard style */}
                     <Text style={styles.sectionTitle}>Contact</Text>
                     {hotelDetails?.phone && (
                        <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${hotelDetails.phone}`).catch(err => Alert.alert("Error", "Could not open dialer."))}>
                            <Ionicons name="call-outline" size={20} color={styles.infoIcon.color} style={styles.infoIcon} />
                            <Text style={styles.linkText}>{hotelDetails.phone}</Text>
                        </TouchableOpacity>
                     )}
                     {hotelDetails?.website && (
                          <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(hotelDetails.website.startsWith('http') ? hotelDetails.website : `https://${hotelDetails.website}`).catch(err => Alert.alert("Error", "Could not open website."))}>
                              <Ionicons name="globe-outline" size={20} color={styles.infoIcon.color} style={styles.infoIcon} />
                             <Text style={[styles.linkText, { flex: 1 }]} numberOfLines={1}>{hotelDetails.website}</Text>
                             <Ionicons name="open-outline" size={20} color={colors.accent} />
                         </TouchableOpacity>
                     )}
                 </View>
             )}

         {/* Keep placeholder sections if needed */}
         {/* Use sectionCard style */}
         {renderReviewsPlaceholder()}
         {renderPriceComparisonPlaceholder()}


          {/* Booking Button - Link to website if available */}
          {/* Place it directly inside mainContentWrapper */}
          <TouchableOpacity
                style={[styles.button, { backgroundColor: hotelDetails?.website ? colors.primaryGreen : colors.secondaryText }]}
                onPress={() => {
                    if (hotelDetails?.website) {
                        // Prepend https if needed and open link
                        const url = hotelDetails.website.startsWith('http://') || hotelDetails.website.startsWith('https://') ? hotelDetails.website : `https://${hotelDetails.website}`;
                        Linking.openURL(url).catch(err => Alert.alert("Error", "Could not open website.", [{ text: "OK" }]));
                    } else {
                        Alert.alert("Booking Info", "No website available for booking this hotel.", [{ text: "OK" }]);
                    }
                }}
                disabled={!hotelDetails?.website} // Disable if no website
            >
                <Text style={[styles.buttonText]}>{hotelDetails?.website ? 'Visit Website to Book' : 'Booking Info N/A'}</Text>
            </TouchableOpacity>


        {/* Footer Spacer */}
        {/* Place it directly inside mainContentWrapper */}
        <View style={styles.footerSpacer} />

        </View> {/* <-- CLOSING TAG FOR MAIN CONTENT WRAPPER */}


    </ScrollView>
  );
}

export default HotelDetailScreen;