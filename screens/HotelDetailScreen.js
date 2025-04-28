// screens/HotelDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator,
  Alert, Linking, Platform, TouchableOpacity, useColorScheme
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// No need to import apiService here if we rely on passed params

const SPACING = 15;

// --- getThemedColors and getThemedHotelDetailStyles (Keep as is) ---
const getThemedColors = (isDarkMode) => ({ /* Your Colors Object */
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA', card: isDarkMode ? '#2C2C2E' : '#FFFFFF', text: isDarkMode ? '#FFFFFF' : '#1A1A1A', secondaryText: isDarkMode ? '#8E8E93' : '#757575', accent: isDarkMode ? '#0A84FF' : '#007AFF', primaryGreen: isDarkMode ? '#4CAF50' : '#00796B', primaryBlue: isDarkMode ? '#2196F3' : '#01579B', primaryOrange: isDarkMode ? '#FF9800' : '#BF360C', primaryRed: isDarkMode ? '#FF453A' : '#C62828', border: isDarkMode ? '#38383A' : '#E0E0E0',
});
const getThemedHotelDetailStyles = (colors) => StyleSheet.create({ /* Your Styles Object */
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    scrollContent: { paddingBottom: SPACING * 4 },
    loadingText: { marginTop: SPACING, fontSize: 16, color: colors.secondaryText },
    hotelImageContainer: { // Container for the image/fallback
        width: '100%',
        height: 250,
        backgroundColor: colors.border, // Background for fallback
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackIcon: { // Style for fallback icon
         marginBottom: SPACING * 0.5,
    },
    fallbackText: { // Style for fallback text
        fontSize: 14,
        color: colors.secondaryText,
    },
    card: { marginHorizontal: SPACING, marginTop: SPACING, padding: SPACING * 1.5, borderRadius: SPACING, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, backgroundColor: colors.card },
    hotelName: { fontSize: 24, fontWeight: 'bold', marginBottom: SPACING, color: colors.text },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING * 1.5 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center' },
    hotelRating: { fontSize: 18, fontWeight: '600', marginLeft: SPACING * 0.5, color: colors.secondaryText }, // Use secondary color for N/A
    hotelPrice: { fontSize: 18, fontWeight: 'bold', color: colors.secondaryText }, // Use secondary color for N/A
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SPACING * 0.8, color: colors.text },
    secondaryText: { fontSize: 15, lineHeight: 22, color: colors.secondaryText },
    amenitiesContainer: { marginTop: SPACING, paddingTop: SPACING * 1.5, borderTopWidth: 1, borderTopColor: colors.border },
    amenitiesList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING * 0.8 },
    amenityItem: { paddingVertical: SPACING * 0.5, paddingHorizontal: SPACING, borderRadius: SPACING * 1.5, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
    infoSection: { marginTop: SPACING * 1.5, paddingTop: SPACING * 1.5, borderTopWidth: 1, borderTopColor: colors.border },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING * 0.8, paddingVertical: SPACING * 0.5 },
    buttonPlaceholder: { paddingVertical: SPACING, borderRadius: SPACING * 0.8, alignItems: 'center', borderWidth: 1 },
    linkText: { fontSize: 16, fontWeight: '600' },
    button: { paddingVertical: SPACING * 1.2, borderRadius: SPACING, alignItems: 'center', marginTop: SPACING * 2, marginBottom: SPACING * 2 },
    buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    footerSpacer: { height: SPACING * 4 }
});


function HotelDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedHotelDetailStyles(colors);

  // Get hotel data directly from route params (passed from HomeScreen)
  const { hotel } = route.params || {};

  // No separate loading state needed if data is passed directly
  const isLoading = false; // Assuming data is always passed

  useEffect(() => {
    // Set screen title
    if (hotel?.name) {
      navigation.setOptions({ title: hotel.name });
    }
    // Handle case where hotel data might be missing (e.g., deep link without data)
    if (!hotel) {
        console.error("HotelDetailScreen: Hotel data missing in route params!");
        Alert.alert("Error", "Hotel information is missing.", [{ text: "OK", onPress: () => navigation.goBack() }]);
        // Optionally, you could try fetching here using hotelId if it's passed
        // const { hotelId } = route.params || {};
        // if (hotelId) { fetchHotelById(hotelId).then(setHotelDataState); }
    }
  }, [hotel, navigation]);


  // --- Feature Placeholders (Keep as is) ---
   const renderReviewsPlaceholder = () => ( /* ... same ... */
       <View style={[styles.card]}><Text style={styles.sectionTitle}>Reviews & Ratings</Text><Text style={styles.secondaryText}>User reviews not available via OSM.</Text></View>
   );
   const renderPriceComparisonPlaceholder = () => ( /* ... same ... */
        <View style={[styles.card]}><Text style={styles.sectionTitle}>Price Comparison</Text><Text style={styles.secondaryText}>Price comparison not available.</Text></View>
   );

  // --- Render Logic ---
  if (!hotel) {
    // Show loading or error if hotel data is truly missing after check
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText]}>Loading details...</Text>
      </View>
    );
  }

  // --- Main Render ---
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Fallback View instead of Image */}
        <View style={styles.hotelImageContainer}>
            <Ionicons name="business-outline" size={60} color={colors.secondaryText} style={styles.fallbackIcon}/>
            <Text style={styles.fallbackText}>Hotel Image N/A</Text>
        </View>

        <View style={styles.card}>
            <Text style={styles.hotelName}>{hotel?.name || 'Hotel Details'}</Text>

            {/* Show N/A for rating and price */}
            <View style={styles.detailRow}>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star-outline" size={20} color={styles.hotelRating.color} />
                    <Text style={styles.hotelRating}>Rating N/A</Text>
                </View>
                <Text style={styles.hotelPrice}>Price N/A</Text>
            </View>

            {/* Display Amenities if found in OSM tags */}
            {hotel?.amenities && Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
                <View style={styles.amenitiesContainer}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesList}>
                        {hotel.amenities.map((amenity, index) => ( <View key={index} style={styles.amenityItem}><Text style={styles.secondaryText}>{amenity}</Text></View> ))}
                    </View>
                </View>
            )}

            {/* Location Section - Use coordinates or address */}
            {(hotel?.latitude || hotel?.address) && (
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <TouchableOpacity style={styles.infoRow} onPress={() => {
                        const lat = hotel.latitude;
                        const lng = hotel.longitude;
                        const label = hotel.name || 'Hotel Location';
                        // Prefer lat/lng for map link
                        const url = (lat && lng)
                            ? Platform.select({ ios: `maps:${lat},${lng}?q=${label}`, android: `geo:${lat},${lng}?q=${label}` })
                            : `geo:0,0?q=${encodeURIComponent(hotel.address || label)}`; // Fallback to address query
                         Linking.openURL(url).catch(err => Alert.alert("Error", "Could not open map."));
                    }}>
                        <Ionicons name="location-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                        <Text style={[styles.secondaryText, { flex: 1 }]}>{hotel?.address || `${hotel.latitude?.toFixed(5)}, ${hotel.longitude?.toFixed(5)}`}</Text>
                        <Ionicons name="navigate-outline" size={20} color={colors.accent} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Contact Section - Show if phone or website exists */}
             {(hotel?.phone || hotel?.website) && (
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    {hotel?.phone && (
                       <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${hotel.phone}`).catch(err => Alert.alert("Error", "Could not open dialer."))}>
                           <Ionicons name="call-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                           <Text style={styles.secondaryText}>{hotel.phone}</Text>
                           {/* Optional: Add chevron */}
                       </TouchableOpacity>
                    )}
                    {hotel?.website && (
                       <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`).catch(err => Alert.alert("Error", "Could not open website."))}>
                           <Ionicons name="globe-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                           <Text style={[styles.secondaryText, { flex: 1 }]} numberOfLines={1}>{hotel.website}</Text>
                           <Ionicons name="open-outline" size={20} color={colors.accent} />
                       </TouchableOpacity>
                    )}
                </View>
            )}
        </View>

        {renderReviewsPlaceholder()}
        {renderPriceComparisonPlaceholder()}

         {/* Adjust Booking Button - Maybe link to website if available? */}
         <TouchableOpacity
               style={[styles.button, { backgroundColor: hotel?.website ? colors.primaryGreen : colors.secondaryText, marginHorizontal: SPACING}]}
               onPress={() => {
                   if (hotel?.website) {
                       Linking.openURL(hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`).catch(err => Alert.alert("Error", "Could not open website."));
                   } else {
                       Alert.alert("Booking", "No website available for booking.");
                   }
               }}
               disabled={!hotel?.website} // Disable if no website
           >
               <Text style={[styles.buttonText, { color: '#FFFFFF'}]}>{hotel?.website ? 'Visit Website' : 'Booking N/A'}</Text>
           </TouchableOpacity>


        <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

export default HotelDetailScreen;