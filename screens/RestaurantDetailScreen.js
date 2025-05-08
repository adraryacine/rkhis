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
import { useLanguage } from '../contexts/LanguageContext';
import LocationView from '../components/LocationView';

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
    quickInfoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: SPACING,
      gap: SPACING,
    },
    quickInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      paddingHorizontal: SPACING,
      paddingVertical: SPACING * 0.5,
      borderRadius: SPACING,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickInfoText: {
      marginLeft: SPACING * 0.5,
      color: colors.text,
      fontSize: 14,
    },
    contactContainer: {
      marginTop: SPACING,
      gap: SPACING * 0.5,
    },
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      padding: SPACING,
      borderRadius: SPACING,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contactButtonText: {
      marginLeft: SPACING * 0.5,
      color: colors.tint,
      fontSize: 14,
      fontWeight: '600',
    },
    locationContainer: {
      marginTop: SPACING,
    },
    locationText: {
      color: Colors.light.tint,
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
          // Ensure images is always an array
          let images = [];
          if (Array.isArray(itemData.images) && itemData.images.length > 0) {
            images = itemData.images;
          } else if (itemData.image) {
            images = [itemData.image];
          }
          setDetailData({ ...itemData, images });
        } else {
          const data = await getRestaurantDetails(restaurantId);
          if (data) {
            // Ensure images is always an array
            let images = [];
            if (Array.isArray(data.images) && data.images.length > 0) {
              images = data.images;
            } else if (data.image) {
              images = [data.image];
            }
            setDetailData({ ...data, images });
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
            {detailData.rating && typeof detailData.rating === 'number' && !isNaN(detailData.rating) && 
              Array(Math.floor(Math.min(Math.max(detailData.rating, 0), 5))).fill(null).map((_, i) => (
                <Ionicons key={i} name="star" size={20} color={styles.rating.color} />
              ))
            }
          </View>
          {detailData.rating && typeof detailData.rating === 'number' && !isNaN(detailData.rating) && (
            <Text style={styles.rating}>{detailData.rating.toFixed(1)}</Text>
          )}
          {detailData.priceRange && (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{detailData.priceRange}</Text>
            </View>
          )}
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfoContainer}>
          {detailData.cuisine && (
            <View style={styles.quickInfoItem}>
              <Ionicons name="restaurant-outline" size={20} color={Colors.light.secondary} />
              <Text style={styles.quickInfoText}>{detailData.cuisine}</Text>
            </View>
          )}
          {detailData.openingHours && (
            <View style={styles.quickInfoItem}>
              <Ionicons name="time-outline" size={20} color={Colors.light.secondary} />
              <Text style={styles.quickInfoText}>{detailData.openingHours}</Text>
            </View>
          )}
        </View>

        {/* Location */}
        {detailData.location && (
          <LocationView
            location={detailData.location.address || detailData.address || ''}
            style={styles.locationContainer}
            textStyle={styles.locationText}
            iconColor={Colors.light.tint}
          />
        )}

        {/* Contact */}
        {detailData.contact && (
          <View style={styles.contactContainer}>
            {detailData.contact.phone && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => Linking.openURL(`tel:${detailData.contact.phone}`)}
              >
                <Ionicons name="call-outline" size={20} color={Colors.light.tint} />
                <Text style={styles.contactButtonText}>{detailData.contact.phone}</Text>
              </TouchableOpacity>
            )}
            {detailData.contact.website && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => Linking.openURL(detailData.contact.website)}
              >
                <Ionicons name="globe-outline" size={20} color={Colors.light.tint} />
                <Text style={styles.contactButtonText}>Visit Website</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default RestaurantDetailScreen; 