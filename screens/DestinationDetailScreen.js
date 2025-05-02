import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Platform,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  FlatList,
  Animated,
  Share
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDestinationDetails } from '../services/destinationService';
import { useSavedItems } from '../contexts/SavedItemsContext';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.5;
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

const getThemedStyles = (isDarkMode = false) => {
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      height: HEADER_HEIGHT,
      backgroundColor: colors.border,
    },
    headerImage: {
      width: SCREEN_WIDTH,
      height: HEADER_HEIGHT,
    },
    headerGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: HEADER_HEIGHT,
      justifyContent: 'flex-end',
      padding: SPACING,
    },
    headerContent: {
      marginBottom: SPACING * 2,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: Colors.white,
      marginBottom: SPACING,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    headerSubtitle: {
      fontSize: 18,
      color: Colors.white,
      opacity: 0.9,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    content: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -24,
      paddingTop: SPACING,
    },
    contentInner: {
      padding: SPACING,
    },
    section: {
      marginBottom: SPACING * 2,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SPACING,
    },
    description: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: SPACING,
    },
    tag: {
      backgroundColor: colors.tint,
      paddingHorizontal: SPACING,
      paddingVertical: SPACING * 0.5,
      borderRadius: 20,
      marginRight: SPACING * 0.5,
      marginBottom: SPACING * 0.5,
    },
    tagText: {
      color: Colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    amenityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING,
      backgroundColor: colors.cardBackground,
      padding: SPACING,
      borderRadius: 12,
      elevation: 2,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    amenityText: {
      marginLeft: SPACING,
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    imageGallery: {
      marginTop: SPACING,
    },
    galleryImage: {
      width: SCREEN_WIDTH * 0.8,
      height: SCREEN_WIDTH * 0.6,
      borderRadius: 16,
      marginRight: SPACING,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING,
    },
    ratingText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: SPACING * 0.5,
    },
    reviewCount: {
      fontSize: 16,
      color: colors.secondary,
      marginLeft: SPACING,
    },
    actionButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    backButton: {
      left: SPACING,
    },
    saveButton: {
      right: SPACING * 3.5,
    },
    shareButton: {
      right: SPACING,
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
      color: colors.secondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING * 2,
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: 16,
      color: colors.danger,
      textAlign: 'center',
      marginTop: SPACING,
    },
  });
};

function DestinationDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getThemedStyles(isDarkMode);
  const scrollY = new Animated.Value(0);

  const { destinationId, item: initialItem } = route.params;
  const { isItemSaved, toggleSaveItem } = useSavedItems();

  const [destination, setDestination] = useState(initialItem);
  const [isLoading, setIsLoading] = useState(!initialItem);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDestination = async () => {
      if (initialItem) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await getDestinationDetails(destinationId);
        if (data) {
          setDestination(data);
        } else {
          setError("Destination not found");
        }
      } catch (err) {
        console.error("Error loading destination:", err);
        setError("Failed to load destination details");
      } finally {
        setIsLoading(false);
      }
    };

    loadDestination();
  }, [destinationId, initialItem]);

  const handleSavePress = () => {
    if (destination) {
      toggleSaveItem(destination, 'destination');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${destination.name} in Bejaia!\n\n${destination.description}`,
        title: destination.name,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDarkMode ? Colors.dark.tint : Colors.light.tint} />
        <Text style={styles.loadingText}>Loading destination details...</Text>
      </View>
    );
  }

  if (error || !destination) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={50} color={styles.errorText.color} />
        <Text style={styles.errorText}>{error || "Destination not found"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          }
        ]}
      >
        <Image
          source={{ uri: destination.image }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {destination.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.ratingText}>
                {typeof destination.rating === 'number' ? destination.rating.toFixed(1) : '0.0'}
              </Text>
              <Text style={styles.reviewCount}>
                ({destination.reviews || 0} reviews)
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <TouchableOpacity
        style={[styles.actionButton, styles.backButton]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color={Colors.white} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.saveButton]}
        onPress={handleSavePress}
      >
        <Ionicons
          name={isItemSaved(destination, 'destination') ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={Colors.white}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.shareButton]}
        onPress={handleShare}
      >
        <Ionicons name="share-outline" size={24} color={Colors.white} />
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.contentInner}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{destination.description}</Text>
          </View>

          {destination.tags && destination.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.tagContainer}>
                {destination.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {destination.amenities && destination.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              {destination.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={styles.tag.backgroundColor} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          )}

          {destination.images && destination.images.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <FlatList
                data={destination.images}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                )}
                keyExtractor={(item, index) => `gallery-${index}`}
                contentContainerStyle={styles.imageGallery}
              />
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

export default DestinationDetailScreen; 