// screens/AttractionDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, SafeAreaView, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import the detail fetching function
import { getAttractionDetails } from '../services/dataService'; // <--- Import the specific detail fetch function


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
        contentContainer: { // Padding for ScrollView content
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
            height: 250, // Fixed height for detail image
            borderRadius: SPACING, // Match card border radius
            marginBottom: SPACING * 1.5,
            backgroundColor: colors.secondary, // Placeholder color
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: SPACING * 0.5,
        },
         description: {
             fontSize: 16,
             color: colors.secondary,
             marginBottom: SPACING * 1.5,
         },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginTop: SPACING,
            marginBottom: SPACING * 0.75,
             borderBottomWidth: 1,
             borderBottomColor: colors.border,
             paddingBottom: SPACING * 0.5,
        },
        infoRow: {
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
            flex: 1, // Allow text wrapping
        },
        secondaryText: {
            color: colors.secondary,
         }

    });
}


function AttractionDetailScreen() {
  const route = useRoute();
  const { attractionId } = route.params; // Get the ID from navigation params

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getThemedStyles(isDarkMode);

  const [attractionData, setAttractionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      const loadDetail = async () => {
          setIsLoading(true);
          setError(null);
          try {
              const data = await getAttractionDetails(attractionId); // <--- CALL THE IMPORTED DETAIL FETCH FUNCTION
               if (data) {
                 setAttractionData(data);
              } else {
                 setError("Attraction not found.");
                 setAttractionData(null);
              }
          } catch (err) {
              console.error(`Error loading attraction details for ID ${attractionId}:`, err);
              setError("Failed to load attraction details.");
              setAttractionData(null);
               Alert.alert("Error", "Failed to load attraction details data."); // Optionally show alert
          } finally {
              setIsLoading(false);
          }
      };

      if (attractionId) { // Only fetch if an ID is provided
         loadDetail();
      } else {
          setError("No Attraction ID provided.");
          setIsLoading(false);
      }

  }, [attractionId]); // Re-fetch if attractionId changes


    // Render loading, error, or not found state
   if (isLoading) {
       return (
            <View style={[styles.screenContainer, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={styles.loadingText.color} />
                <Text style={styles.loadingText}>Loading Attraction Details...</Text>
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

     if (!attractionData) {
         return (
              <View style={[styles.screenContainer, styles.errorContainer]}>
                 <Ionicons name="alert-circle-outline" size={60} color={styles.secondaryText.color} />
                <Text style={styles.errorText}>Attraction data not available.</Text>
            </View>
         );
    }

   // Render the actual detail UI
   return (
       <SafeAreaView style={styles.screenContainer}>
           <ScrollView contentContainerStyle={styles.contentContainer}>
                <Image
                    source={{ uri: attractionData.image || fallbackPlaceholderImage }}
                    style={styles.image}
                    resizeMode="cover"
                     onError={(e) => console.log("Image error:", e.nativeEvent.error)} // Add error handling for image
                />
               <Text style={styles.title}>{attractionData.name}</Text>
               {attractionData.description && <Text style={styles.description}>{attractionData.description}</Text>}


               {/* Example sections - Add more based on your attraction data fields */}
               {attractionData.address && (
                   <>
                       <Text style={styles.sectionTitle}>Location</Text>
                       <View style={styles.infoRow}>
                           <Ionicons name="location-outline" size={24} color={styles.secondaryText.color} style={styles.infoIcon} />
                           <Text style={styles.infoText}>{attractionData.address}</Text>
                       </View>
                   </>
               )}

                {attractionData.openingHours && (
                     <View style={styles.infoRow}>
                         <Ionicons name="time-outline" size={24} color={styles.secondaryText.color} style={styles.infoIcon} />
                         <Text style={styles.infoText}>Opening Hours: {attractionData.openingHours}</Text>
                     </View>
                )}

                {attractionData.entranceFee !== undefined && attractionData.entranceFee !== null && ( // Check for existence
                     <View style={styles.infoRow}>
                         <Ionicons name="pricetag-outline" size={24} color={styles.secondaryText.color} style={styles.infoIcon} />
                         <Text style={styles.infoText}>Entrance Fee: {attractionData.entranceFee === 'Free' ? 'Free' : `${attractionData.entranceFee}`}</Text>
                     </View>
                )}

               {/* Add other sections like photos gallery, related activities, etc. */}

           </ScrollView>
       </SafeAreaView>
   );
}


export default AttractionDetailScreen;