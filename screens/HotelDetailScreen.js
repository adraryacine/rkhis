// screens/HotelDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Linking, // For phone/website links
  Platform,
  TouchableOpacity, // For links/buttons
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getHotelDetails } from '../services/dataService'; // Assuming this function exists
import { useColorScheme } from 'react-native';

const SPACING = 15; // Consistent spacing unit

// Helper function to get consistent themed colors
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF', // General accent
    primaryGreen: isDarkMode ? '#4CAF50' : '#00796B', // Themed green
    primaryBlue: isDarkMode ? '#2196F3' : '#01579B', // Themed blue
    primaryOrange: isDarkMode ? '#FF9800' : '#BF360C', // Themed orange
    primaryRed: isDarkMode ? '#FF453A' : '#C62828', // Themed red
    border: isDarkMode ? '#38383A' : '#E0E0E0',
});

// Helper function to get themed styles
const getThemedHotelDetailStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
  },
    scrollContent: {
        paddingBottom: SPACING * 4,
    },
  loadingText: {
      marginTop: SPACING,
      fontSize: 16,
      color: colors.secondaryText,
  },
  hotelImage: {
      width: '100%',
      height: 250, // Fixed height for image
  },
   card: {
       marginHorizontal: SPACING,
       marginTop: SPACING,
       padding: SPACING * 1.5,
       borderRadius: SPACING,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 3,
       backgroundColor: colors.card,
   },
  hotelName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: SPACING,
      color: colors.text,
  },
  detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING * 1.5,
  },
  ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
   hotelRating: {
       fontSize: 18,
       fontWeight: '600',
       marginLeft: SPACING * 0.5,
       color: colors.text,
   },
    hotelPrice: {
       fontSize: 18,
       fontWeight: 'bold',
       color: colors.primaryGreen,
   },
   sectionTitle: {
       fontSize: 18,
       fontWeight: 'bold',
       marginBottom: SPACING * 0.8,
       color: colors.text,
   },
    secondaryText: {
       fontSize: 15,
       lineHeight: 22,
       color: colors.secondaryText,
   },
    amenitiesContainer: {
        marginTop: SPACING,
        paddingTop: SPACING * 1.5,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    amenitiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING * 0.8, // Space between amenity items
    },
     amenityItem: {
         paddingVertical: SPACING * 0.5,
         paddingHorizontal: SPACING,
         borderRadius: SPACING * 1.5,
         borderWidth: 1,
         borderColor: colors.border,
         backgroundColor: colors.background, // Use background for amenity item
     },
     infoSection: {
         marginTop: SPACING * 1.5,
         paddingTop: SPACING * 1.5,
         borderTopWidth: 1,
         borderTopColor: colors.border,
     },
     infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING * 0.8,
        paddingVertical: SPACING * 0.5,
     },
     buttonPlaceholder: {
        paddingVertical: SPACING,
        borderRadius: SPACING * 0.8,
        alignItems: 'center',
         borderWidth: 1,
         // Background and Border applied dynamically
     },
     linkText: {
         fontSize: 16,
         fontWeight: '600',
         // Color applied dynamically
     },
      button: {
        paddingVertical: SPACING * 1.2,
        borderRadius: SPACING,
        alignItems: 'center',
        marginTop: SPACING * 2,
        marginBottom: SPACING * 2,
      },
      buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text, // Button text color
      },
     footerSpacer: {
        height: SPACING * 4,
     }
});


function HotelDetailScreen() {
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedHotelDetailStyles(colors);

  const [hotel, setHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hotelId, hotel: initialHotelData } = route.params || {}; // Get hotelId and potentially initial data from route params

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        // Prefer initial data if passed (e.g., from list screen)
        if (initialHotelData) {
            console.log("Using initial hotel data from params.");
            setHotel(initialHotelData);
        } else if (hotelId) {
             // If only ID is passed, fetch full details from data service
             console.log(`Fetching hotel details for ID: ${hotelId}`);
             const fetchedHotel = await getHotelDetails(hotelId);
             if (fetchedHotel) {
                 setHotel(fetchedHotel);
                 console.log("Fetched hotel details:", fetchedHotel);
             } else {
                 Alert.alert("Error", "Hotel details not found.");
                 console.warn(`Hotel details not found for ID: ${hotelId}`);
             }
        } else {
            Alert.alert("Error", "No hotel ID or data provided.");
            console.error("HotelDetailScreen: No hotel ID or data in route params.");
        }
      } catch (error) {
        console.error("Failed to fetch hotel details:", error);
        Alert.alert("Error", "Failed to load hotel details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [hotelId, initialHotelData]); // Depend on route params


  // --- Feature Placeholders ---
  const renderReviewsPlaceholder = () => (
      <View style={[styles.card, {backgroundColor: colors.card}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Reviews & Ratings</Text>
           <Text style={[styles.secondaryText, {color: colors.secondaryText, marginBottom: SPACING}]}>User reviews and ratings will appear here.</Text>
           {/* Placeholder for Add Review Button */}
           <TouchableOpacity
              style={[styles.buttonPlaceholder, {backgroundColor: colors.accent + '20', borderColor: colors.accent}]}
               onPress={() => Alert.alert("Coming Soon", "Submitting reviews is not yet available.")}
           >
               <Text style={[styles.linkText, {color: colors.accent}]}>Write a Review</Text>
           </TouchableOpacity>
      </View>
  );

  const renderPriceComparisonPlaceholder = () => (
      <View style={[styles.card, {backgroundColor: colors.card}]}>
           <Text style={[styles.sectionTitle, {color: colors.text}]}>Price Comparison</Text>
           <Text style={[styles.secondaryText, {color: colors.secondaryText, marginBottom: SPACING}]}>Compare prices from different booking platforms.</Text>
            {/* Placeholder for comparison button/links */}
           <TouchableOpacity
               style={[styles.buttonPlaceholder, {backgroundColor: colors.accent + '20', borderColor: colors.accent}]}
               onPress={() => Alert.alert("Coming Soon", "Price comparison is not yet integrated.")}
            >
               <Text style={[styles.linkText, {color: colors.accent}]}>Compare Prices</Text>
           </TouchableOpacity>
      </View>
  );
   // --- End Feature Placeholders ---


  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]} contentContainerStyle={styles.scrollContent}>
        {/* Hotel Image */}
        {hotel?.image && ( // Use optional chaining
             <Image source={{ uri: hotel.image }} style={styles.hotelImage} resizeMode="cover" />
         )}

        {/* Hotel Info Card */}
        <View style={[styles.card, {backgroundColor: colors.card}]}>
            <Text style={[styles.hotelName, {color: colors.text}]}>{hotel?.name || 'Hotel Details'}</Text> {/* Use optional chaining */}
            {/* Only show detail row if rating or price is available */}
            {(hotel?.rating || hotel?.price) && (
              <View style={styles.detailRow}>
                  {hotel?.rating && (
                      <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={20} color="#FFC107" />
                          <Text style={[styles.hotelRating, {color: colors.text}]}>{hotel.rating}</Text>
                      </View>
                  )}
                   {hotel?.price && <Text style={[styles.hotelPrice, {color: colors.primaryGreen}]}>{hotel.price}/night</Text>}
              </View>
            )}


            {hotel?.amenities && Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
                <View style={styles.amenitiesContainer}>
                    <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: SPACING}]}>Amenities</Text>
                     <View style={styles.amenitiesList}>
                         {hotel.amenities.map((amenity, index) => (
                             <View key={index} style={[styles.amenityItem, {borderColor: colors.border, backgroundColor: colors.background}]}>
                                 {/* You could add icons here based on amenity name */}
                                 <Text style={[styles.secondaryText, {color: colors.secondaryText}]}>{amenity}</Text>
                             </View>
                         ))}
                     </View>
                </View>
            )}

             {/* Placeholder for Hotel Address/Location */}
            <View style={styles.infoSection}>
                 <Text style={[styles.sectionTitle, {color: colors.text}]}>Location</Text>
                  <TouchableOpacity
                      style={styles.infoRow}
                      onPress={() => {
                          // Example: Open location in Google Maps (replace with actual lat/lng if available)
                          const address = hotel?.address || (hotel?.name ? hotel.name + ', Bejaia, Algeria' : 'Bejaia, Algeria'); // Use address if available, fallback
                          const latLng = hotel?.latitude && hotel?.longitude ? `${hotel.latitude},${hotel.longitude}` : null;
                          const mapUrl = latLng ? `geo:${latLng}?q=${encodeURIComponent(hotel?.name || '')}` : `geo:0,0?q=${encodeURIComponent(address)}`;
                           Linking.openURL(mapUrl).catch(err => Alert.alert("Error", "Could not open map application."));
                      }}
                   >
                     <Ionicons name="location-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                     <Text style={[styles.secondaryText, {color: colors.secondaryText, flex: 1}]}>
                         {hotel?.address || (hotel?.latitude && hotel?.longitude ? 'Tap to open in map.' : 'Location information not available. Tap to open map.')}
                     </Text>
                     {(hotel?.address || (hotel?.latitude && hotel?.longitude)) && <Ionicons name="open-outline" size={20} color={colors.accent} />}
                  </TouchableOpacity>
            </View>

             {/* Placeholder for Contact Info */}
             <View style={styles.infoSection}>
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>Contact</Text>
                   {hotel?.phone && ( // Use optional chaining
                       <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${hotel.phone}`).catch(err => Alert.alert("Error", "Could not open dialer."))}>
                           <Ionicons name="call-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                           <Text style={[styles.secondaryText, {color: colors.secondaryText}]}>{hotel.phone}</Text>
                            <Ionicons name="chevron-forward-outline" size={20} color={colors.secondaryText} style={{ opacity: 0.6 }} />
                       </TouchableOpacity>
                   )}
                    {hotel?.website && ( // Use optional chaining
                       <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(hotel.website).catch(err => Alert.alert("Error", "Could not open website."))}>
                           <Ionicons name="globe-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                           <Text style={[styles.secondaryText, {color: colors.secondaryText}]}>{hotel.website}</Text>
                            <Ionicons name="open-outline" size={20} color={colors.accent} />
                       </TouchableOpacity>
                   )}
                    {(!hotel?.phone && !hotel?.website) && ( // Use optional chaining for check
                        <Text style={[styles.secondaryText, {color: colors.secondaryText}]}>Contact information not available.</Text>
                    )}
             </View>

        </View>

        {/* Feature Placeholder Sections */}
        {renderReviewsPlaceholder()}
        {renderPriceComparisonPlaceholder()}

         {/* Placeholder for Booking/Booking Link */}
         <TouchableOpacity
               style={[styles.button, { backgroundColor: colors.primaryGreen, marginHorizontal: SPACING}]}
               onPress={() => Alert.alert("Booking", "Hotel booking integration coming soon!")}
           >
               <Text style={[styles.buttonText, { color: colors.text}]}>Book Now</Text>
           </TouchableOpacity>


        <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

export default HotelDetailScreen;