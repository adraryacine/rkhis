// screens/DetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, SafeAreaView, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import ALL relevant detail fetching functions from dataService
import {
    getFeaturedDestinations, // If you need to fetch Destination details
    getTopRatedRestaurants,  // If you need to fetch Restaurant details
    getAttractionDetails,    // Already used in AttractionDetailScreen, but included for completeness
    getHotelDetails,         // Already used in HotelDetailScreen, but included for completeness
} from '../services/dataService'; // <--- Import all detail fetch functions needed here


// --- LOCAL Re-definition of ALL Constants and Styles needed for THIS screen ---
const SPACING = 16;
// Include any other constants specific to THIS screen
const Colors = {
  light: {
    text: '#111827',
    background: '#ffffff',
    tint: '#007AFF',
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
    tint: '#0A84FF',
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
const fallbackPlaceholderImage = 'https://via.placeholder.com/600x400/cccccc/969696?text=Image+Error'; // Larger placeholder


// --- LOCAL Definition of getThemedStyles including ALL styles for THIS screen ---
const getThemedStyles = (isDarkMode = false) => {
    const colors = isDarkMode ? Colors.dark : Colors.light;
    return StyleSheet.create({
        screenContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        contentContainer: {
             padding: SPACING,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SPACING * 2,
        },
        loadingText: {
            marginTop: SPACING,
            fontSize: 16,
            color: colors.tint,
            fontWeight: '600',
        },
        errorContainer: {
             flex: 1,
             justifyContent: 'center',
             alignItems: 'center',
             padding: SPACING * 2,
        },
        errorText: {
            marginTop: SPACING,
            fontSize: 16,
            color: colors.secondary,
            textAlign: 'center',
        },
        image: {
            width: '100%',
            height: 250,
            borderRadius: SPACING,
            marginBottom: SPACING * 1.5,
            backgroundColor: colors.secondary,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: SPACING * 0.5,
        },
         description: { // For descriptions
             fontSize: 16,
             color: colors.secondary,
             marginBottom: SPACING * 1.5,
         },
         ratingContainer: { // Reuse rating style
           flexDirection: 'row',
           alignItems: 'center',
           marginBottom: SPACING * 0.5,
         },
         ratingText: { // Reuse text style for rating
           fontSize: 16,
           color: colors.secondary,
           marginLeft: SPACING * 0.5,
         },
        priceText: { // For prices
            fontSize: 18,
            fontWeight: '700',
            color: colors.success,
            marginBottom: SPACING * 1.5,
        },
        sectionTitle: { // Reuse section title
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginTop: SPACING,
            marginBottom: SPACING * 0.75,
             borderBottomWidth: 1,
             borderBottomColor: colors.border,
             paddingBottom: SPACING * 0.5,
        },
        infoRow: { // Generic info row for icon + text
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING * 0.75,
        },
        infoIcon: {
             marginRight: SPACING,
        },
        infoText: {
            fontSize: 16,
            color: colors.secondary,
            flex: 1,
        },
         infoBulletText: { // For list items like amenities
             fontSize: 16,
             color: colors.secondary,
             marginBottom: SPACING * 0.5,
         },
        secondaryText: {
            color: colors.secondary,
        }

    });
}


function DetailScreen() {
  const route = useRoute();
  // Extract the ID and type from the navigation params
  const { itemId, itemType, item: passedItem } = route.params || {}; // Use 'passedItem' to avoid naming conflict

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getThemedStyles(isDarkMode);

  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      const loadDetail = async () => {
          setIsLoading(true);
          setError(null);
          let data = null;

          // Choose the correct fetching function based on itemType
          try {
              switch (itemType) {
                  case 'destination':
                      // Note: getFeaturedDestinations fetches LIST data. You might need
                      // a separate getDestinationDetails function if details are different.
                      // For now, we'll use the passed item or try to find it in the fetched list (less efficient)
                      // Or, you can fetch ALL destinations here and find the one matching the ID.
                      // A dedicated getDestinationDetails would be better.
                      // Assuming getFeaturedDestinations might return enough info for detail for now, or you have getDestinationDetails
                      // If you *only* passed the `item` from the list, you might not need a fetch here
                      // data = passedItem || await getDestinationDetails(itemId); // If getDestinationDetails exists
                      // For this example, let's assume getFeaturedDestinations might have the data, or we use the passed item
                      // If using the passed item only:
                       data = passedItem; // Use the item passed from the list screen
                       // If you MUST fetch here, implement getDestinationDetails in dataService
                       // data = await getDestinationDetails(itemId); // <--- Need to implement this
                      break;
                  case 'restaurant':
                       // Similar note as destinations. getTopRatedRestaurants fetches list data.
                       // Need getRestaurantDetails if details are different or not passed.
                       // data = passedItem || await getRestaurantDetails(itemId); // If getRestaurantDetails exists
                        data = await getTopRatedRestaurants(); // Fetch list
                        data = data.find(item => item.id === itemId) || passedItem; // Find item or use passed one
                        // data = await getRestaurantDetails(itemId); // <--- Need to implement this
                      break;
                  case 'attraction':
                       // If using this generic screen for attractions, use the specific fetch
                       data = await getAttractionDetails(itemId); // <--- Already implemented in dataService
                      break;
                   case 'hotel':
                       // If using this generic screen for hotels, use the specific fetch
                       data = await getHotelDetails(itemId); // <--- Already implemented in dataService
                      break;
                  default:
                      setError("Unknown item type.");
                      setIsLoading(false); // Stop loading for unknown type
                      return; // Exit function
              }

              if (data) {
                 setDetailData(data);
              } else {
                 setError(`${itemType || 'Item'} not found.`);
              }
          } catch (err) {
              console.error(`Error loading ${itemType || 'item'} details for ID ${itemId}:`, err);
              setError(`Failed to load ${itemType || 'item'} details.`);
              setDetailData(null);
               Alert.alert("Error", `Failed to load ${itemType || 'item'} details data.`); // Optionally show alert
          } finally {
              setIsLoading(false);
          }
      };

      // Only fetch if ID and type are provided
      if (itemId && itemType) {
         loadDetail();
      } else {
          setError("No item ID or type provided.");
          setIsLoading(false);
      }

  }, [itemId, itemType, passedItem]); // Depend on ID, type, and potentially the passed item

   // Render loading, error, or not found state
   if (isLoading) {
       return (
            <View style={[styles.screenContainer, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={styles.loadingText.color} />
                <Text style={styles.loadingText}>Loading Details...</Text>
            </View>
       );
   }

    if (error) {
        return (
            <View style={[styles.screenContainer, styles.errorContainer]}>
                 <Ionicons name="warning-outline" size={60} color={styles.secondaryText.color} />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

     if (!detailData) {
         return (
              <View style={[styles.screenContainer, styles.errorContainer]}>
                 <Ionicons name="alert-circle-outline" size={60} color={styles.secondaryText.color} />
                <Text style={styles.errorText}>Data not available for this item.</Text>
            </View>
         );
    }

   // --- Render the actual detail UI based on itemType and detailData ---
   // This part needs customization based on the structure of your data for each type
   // Here's a basic example, you'll need to expand this significantly
   return (
       <SafeAreaView style={styles.screenContainer}>
           <ScrollView contentContainerStyle={styles.contentContainer}>
                <Image
                    source={{ uri: detailData.image || fallbackPlaceholderImage }}
                    style={styles.image}
                    resizeMode="cover"
                     onError={(e) => console.log("Image error:", e.nativeEvent.error)}
                />
               <Text style={styles.title}>{detailData.name || detailData.title || 'Unknown Item'}</Text>

                {/* Render sections based on itemType and available data */}
                {itemType === 'destination' && detailData.description && (
                     <Text style={styles.description}>{detailData.description}</Text>
                )}

                {itemType === 'restaurant' && (
                    <>
                         {detailData.rating && (
                            <View style={styles.ratingContainer}>
                                {/* Render stars */}
                                {Array(Math.round(detailData.rating)).fill(null).map((_, i) => (
                                    <Ionicons key={i} name="star" size={18} color={Colors.light.success} />
                                ))}
                                <Text style={styles.ratingText}>{detailData.rating} Stars</Text>
                            </View>
                        )}
                        {detailData.cuisine && detailData.priceRange && (
                             <Text style={styles.description}>{detailData.cuisine} • {detailData.priceRange}</Text>
                        )}
                        {/* Add restaurant specific info */}
                    </>
                )}

                 {itemType === 'attraction' && (
                     <>
                         {detailData.description && <Text style={styles.description}>{detailData.description}</Text>}
                         {/* Add attraction specific info like opening hours, fee etc. */}
                          {detailData.openingHours && (
                             <View style={styles.infoRow}>
                                 <Ionicons name="time-outline" size={24} color={styles.secondaryText.color} style={styles.infoIcon} />
                                 <Text style={styles.infoText}>Hours: {detailData.openingHours}</Text>
                             </View>
                         )}
                         {detailData.entranceFee !== undefined && detailData.entranceFee !== null && (
                              <View style={styles.infoRow}>
                                  <Ionicons name="pricetag-outline" size={24} color={styles.secondaryText.color} style={styles.infoIcon} />
                                  <Text style={styles.infoText}>Fee: {detailData.entranceFee === 'Free' ? 'Free' : `${detailData.entranceFee}`}</Text>
                              </View>
                         )}
                          {/* Location can be generic */}
                           {detailData.address && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="location-outline" size={24} color={styles.secondaryText.color} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>{detailData.address}</Text>
                                </View>
                            )}
                     </>
                 )}

                {itemType === 'hotel' && (
                    <>
                         {detailData.rating && (
                            <View style={styles.ratingContainer}>
                                {/* Render stars */}
                                {Array(Math.round(detailData.rating)).fill(null).map((_, i) => (
                                    <Ionicons key={i} name="star" size={18} color={Colors.light.success} />
                                ))}
                                <Text style={styles.ratingText}>{detailData.rating} Stars</Text>
                            </View>
                        )}
                         {detailData.price && <Text style={styles.priceText}>{detailData.price} / night</Text>}
                         {/* Add hotel specific info */}
                          {detailData.address && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="location-outline" size={24} color={styles.secondaryText.color} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>{detailData.address}</Text>
                                </View>
                            )}
                           {detailData.phone && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="call-outline" size={24} color={styles.secondaryText.color} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>{detailData.phone}</Text>
                                </View>
                           )}
                            {detailData.website && (
                                 <View style={styles.infoRow}>
                                     <Ionicons name="globe-outline" size={24} color={styles.secondaryText.color} style={styles.infoIcon} />
                                     <Text style={styles.infoText}>{detailData.website}</Text>
                                 </View>
                            )}
                            {detailData.amenities?.length > 0 && (
                                <>
                                    <Text style={styles.sectionTitle}>Amenities</Text>
                                    {detailData.amenities.map((amenity, index) => (
                                        <Text key={index} style={styles.infoBulletText}>• {amenity}</Text>
                                    ))}
                                </>
                            )}
                    </>
                )}


               {/* Add a section for generic info if it exists for any type */}
               {/* Example: if detailData.description exists but wasn't shown above */}
                {detailData.description && itemType !== 'destination' && itemType !== 'attraction' && (
                     <>
                          <Text style={styles.sectionTitle}>Description</Text>
                          <Text style={styles.infoText}>{detailData.description}</Text>
                     </>
                )}


               {/* Add other generic sections like photos gallery, etc. */}

           </ScrollView>
       </SafeAreaView>
   );
}


export default DetailScreen;