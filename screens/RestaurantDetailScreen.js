import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getRestaurantDetails } from '../services/dataService';

const SPACING = 16;
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
    white: '#ffffff',
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
    white: '#ffffff',
  },
};

const fallbackPlaceholderImage = 'https://via.placeholder.com/600x400/8895a7/ffffff?text=Restaurant';

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
    imageGallery: {
      height: 250,
      marginBottom: SPACING,
    },
    galleryImage: {
      width: 300,
      height: 250,
      borderRadius: SPACING,
      marginRight: SPACING,
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
      flex: 1,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING,
    },
    ratingStars: {
      flexDirection: 'row',
      marginRight: SPACING / 2,
    },
    rating: {
      fontSize: 18,
      color: colors.success,
      fontWeight: '600',
    },
    priceContainer: {
      backgroundColor: colors.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginLeft: SPACING,
    },
    price: {
      color: colors.white,
      fontWeight: '600',
      fontSize: 16,
    },
    mapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.tint + '20',
      padding: SPACING,
      borderRadius: SPACING,
      marginTop: SPACING / 2,
    },
    mapButtonText: {
      color: colors.tint,
      marginLeft: SPACING / 2,
      fontWeight: '600',
    },
    websiteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.tint + '20',
      padding: SPACING,
      borderRadius: SPACING,
      marginTop: SPACING / 2,
    },
    websiteButtonText: {
      color: colors.tint,
      marginLeft: SPACING / 2,
      fontWeight: '600',
    },
  });
};

function RestaurantDetailScreen() {
  const route = useRoute();
  const { restaurantId, itemData } = route.params;

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getThemedStyles(isDarkMode);

  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (index) => {
    if (detailData.images && detailData.images[index]) {
      const updatedImages = [...detailData.images];
      updatedImages[index] = fallbackPlaceholderImage;
      setDetailData({ ...detailData, images: updatedImages });
    }
  };

  useEffect(() => {
    const loadRestaurant = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (itemData) {
          setDetailData(itemData);
        } else {
          const data = await getRestaurantDetails(restaurantId);
          if (data) {
            setDetailData(data);
          } else {
            setError("Restaurant not found");
            setDetailData(null);
          }
        }
      } catch (err) {
        console.error("Error loading restaurant details:", err);
        setError("Failed to load restaurant details");
        setDetailData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) {
      loadRestaurant();
    } else if (!itemData) {
      setError("No restaurant ID provided");
      setIsLoading(false);
    }
  }, [restaurantId, itemData]);

  if (isLoading) {
    return (
      <View style={[styles.screenContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={styles.loadingText.color} />
        <Text style={styles.loadingText}>Loading Restaurant Details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screenContainer, styles.errorContainer]}>
        <Ionicons name="warning-outline" size={60} color={styles.errorText.color} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!detailData) {
    return (
      <View style={[styles.screenContainer, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={60} color={styles.secondaryText.color} />
        <Text style={styles.errorText}>Restaurant data not available.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Image Gallery */}
        {detailData.images && detailData.images.length > 0 && (
          <View style={styles.imageGallery}>
            <FlatList
              data={detailData.images}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                  onError={() => handleImageError(index)}
                />
              )}
            />
          </View>
        )}

        <Text style={styles.title}>{detailData.name}</Text>
        {detailData.description && <Text style={styles.description}>{detailData.description}</Text>}

        {/* Rating and Price */}
        <View style={styles.ratingContainer}>
          <View style={styles.ratingStars}>
            {Array(Math.floor(detailData.rating)).fill(null).map((_, i) => (
              <Ionicons key={i} name="star" size={20} color={styles.rating.color} />
            ))}
          </View>
          <Text style={styles.rating}>{detailData.rating}</Text>
          {detailData.priceRange && (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{detailData.priceRange}</Text>
            </View>
          )}
        </View>

        {/* Cuisine */}
        {detailData.cuisine && (
          <>
            <Text style={styles.sectionTitle}>Cuisine</Text>
            <View style={styles.infoRow}>
              <Ionicons name="restaurant-outline" size={24} color={Colors.light.secondary} style={styles.infoIcon} />
              <Text style={styles.infoText}>{detailData.cuisine}</Text>
            </View>
          </>
        )}

        {/* Location */}
        {detailData.address && (
          <>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={24} color={Colors.light.secondary} style={styles.infoIcon} />
              <Text style={styles.infoText}>{detailData.address}</Text>
            </View>
            {detailData.coordinates && (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => {
                  const { latitude, longitude } = detailData.coordinates;
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
                }}
              >
                <Ionicons name="map-outline" size={20} color={Colors.light.tint} />
                <Text style={styles.mapButtonText}>View on Map</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Opening Hours */}
        {detailData.openingHours && (
          <>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={24} color={Colors.light.secondary} style={styles.infoIcon} />
              <Text style={styles.infoText}>{detailData.openingHours}</Text>
            </View>
          </>
        )}

        {/* Contact Information */}
        {detailData.contact && (
          <>
            <Text style={styles.sectionTitle}>Contact</Text>
            {detailData.contact.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={24} color={Colors.light.secondary} style={styles.infoIcon} />
                <Text style={styles.infoText}>{detailData.contact.phone}</Text>
              </View>
            )}
            {detailData.contact.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={24} color={Colors.light.secondary} style={styles.infoIcon} />
                <Text style={styles.infoText}>{detailData.contact.email}</Text>
              </View>
            )}
            {detailData.contact.website && (
              <TouchableOpacity
                style={styles.websiteButton}
                onPress={() => Linking.openURL(detailData.contact.website)}
              >
                <Ionicons name="globe-outline" size={20} color={Colors.light.tint} />
                <Text style={styles.websiteButtonText}>Visit Website</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default RestaurantDetailScreen; 