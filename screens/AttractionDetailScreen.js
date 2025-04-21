// screens/AttractionDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Linking, // For map/website links
  Platform,
  TouchableOpacity, // For links/buttons
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAttractionDetails } from '../services/dataService'; // Assuming this function exists
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
const getThemedAttractionDetailStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Background color applied dynamically
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
  attractionImage: {
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
  attractionName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: SPACING * 0.8,
      color: colors.text,
  },
   attractionDescription: {
       fontSize: 16,
       lineHeight: 24,
       marginBottom: SPACING * 1.5,
       color: colors.secondaryText,
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
     footerSpacer: {
        height: SPACING * 4,
     }
});


function AttractionDetailScreen() {
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedAttractionDetailStyles(colors);

  const [attraction, setAttraction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { attractionId, attraction: initialAttractionData } = route.params || {}; // Get attractionId and potentially initial data

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        // Prefer initial data if passed
         if (initialAttractionData) {
             console.log("Using initial attraction data from params.");
             setAttraction(initialAttractionData);
         } else if (attractionId) {
              // If only ID is passed, fetch full details from data service
              console.log(`Fetching attraction details for ID: ${attractionId}`);
              const fetchedAttraction = await getAttractionDetails(attractionId);
              if (fetchedAttraction) {
                  setAttraction(fetchedAttraction);
                  console.log("Fetched attraction details:", fetchedAttraction);
              } else {
                  Alert.alert("Error", "Attraction details not found.");
                   console.warn(`Attraction details not found for ID: ${attractionId}`);
              }
         } else {
             Alert.alert("Error", "No attraction ID or data provided.");
              console.error("AttractionDetailScreen: No attraction ID or data in route params.");
         }
      } catch (error) {
        console.error("Failed to fetch attraction details:", error);
        Alert.alert("Error", "Failed to load attraction details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [attractionId, initialAttractionData]); // Depend on route params

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, {color: colors.secondaryText}]}>Loading attraction details...</Text>
      </View>
    );
  }

  if (!attraction) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.loadingText, {color: colors.secondaryText}]}>Attraction not found.</Text>
      </View>
    );
  }

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

  // --- End Feature Placeholders ---

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]} contentContainerStyle={styles.scrollContent}>
        {/* Attraction Image */}
        {attraction?.image && ( // Use optional chaining
             <Image source={{ uri: attraction.image }} style={styles.attractionImage} resizeMode="cover" />
         )}

        {/* Attraction Info Card */}
        <View style={[styles.card, {backgroundColor: colors.card}]}>
            <Text style={[styles.attractionName, {color: colors.text}]}>{attraction?.name || 'Attraction Details'}</Text> {/* Use optional chaining */}
            {attraction?.description && <Text style={[styles.attractionDescription, {color: colors.secondaryText}]}>{attraction.description}</Text>} {/* Use optional chaining */}

            {/* Placeholder for Location */}
             <View style={styles.infoSection}>
                 <Text style={[styles.sectionTitle, {color: colors.text}]}>Location</Text>
                  <TouchableOpacity
                      style={styles.infoRow}
                       onPress={() => {
                          // Example: Open location in Google Maps (replace with actual lat/lng if available)
                          const address = attraction?.address || (attraction?.name ? attraction.name + ', Bejaia, Algeria' : 'Bejaia, Algeria'); // Use address if available, fallback
                          const latLng = attraction?.latitude && attraction?.longitude ? `${attraction.latitude},${attraction.longitude}` : null;
                           const mapUrl = latLng ? `geo:${latLng}?q=${encodeURIComponent(attraction?.name || '')}` : `geo:0,0?q=${encodeURIComponent(address)}`;
                           Linking.openURL(mapUrl).catch(err => Alert.alert("Error", "Could not open map application."));
                      }}
                   >
                     <Ionicons name="location-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                     <Text style={[styles.secondaryText, {color: colors.secondaryText, flex: 1}]}>
                         {attraction?.address || (attraction?.latitude && attraction?.longitude ? 'Tap to open in map.' : 'Location information not available. Tap to open map.')}
                     </Text>
                     {(attraction?.address || (attraction?.latitude && attraction?.longitude)) && <Ionicons name="open-outline" size={20} color={colors.accent} />}
                  </TouchableOpacity>
            </View>


            {/* Opening Hours */}
             <View style={styles.infoSection}>
                 <Text style={[styles.sectionTitle, {color: colors.text}]}>Opening Hours</Text>
                 <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                     <Text style={[styles.secondaryText, {color: colors.secondaryText}]}>{attraction?.openingHours || 'Information not available'}</Text>
                 </View>
             </View>

             {/* Entrance Fee */}
             <View style={styles.infoSection}>
                 <Text style={[styles.sectionTitle, {color: colors.text}]}>Entrance Fee</Text>
                  <View style={styles.infoRow}>
                       <Ionicons name="wallet-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                      <Text style={[styles.secondaryText, {color: colors.secondaryText}]}>{attraction?.entranceFee || 'Information not available'}</Text>
                  </View>
             </View>


            {/* Placeholder for Website Link (if exists) */}
             {attraction?.website && ( // Use optional chaining
                <View style={styles.infoSection}>
                     <Text style={[styles.sectionTitle, {color: colors.text}]}>Website</Text>
                      <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(attraction.website).catch(err => Alert.alert("Error", "Could not open website."))}>
                          <Ionicons name="globe-outline" size={20} color={colors.secondaryText} style={{ marginRight: SPACING }} />
                          <Text style={[styles.secondaryText, {color: colors.secondaryText}]}>{attraction.website}</Text>
                           <Ionicons name="open-outline" size={20} color={colors.accent} />
                      </TouchableOpacity>
                 </View>
             )}

        </View>

        {/* Feature Placeholder Sections */}
        {renderReviewsPlaceholder()}

        <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

export default AttractionDetailScreen;