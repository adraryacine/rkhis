import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  StatusBar,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSavedItems } from '../contexts/SavedItemsContext';
import { getRecommendedHotels } from '../services/dataService';

const { width } = Dimensions.get('window');
const SPACING = 16;

const Colors = {
  light: {
    text: '#111827',
    background: '#ffffff',
    tint: '#007AFF',
    secondary: '#6b7280',
    cardBackground: '#ffffff',
    success: '#00C853',
    placeholder: '#9ca3af',
  },
  dark: {
    text: '#ecf0f1',
    background: '#121212',
    tint: '#0A84FF',
    secondary: '#a1a1aa',
    cardBackground: '#1e1e1e',
    success: '#00E676',
    placeholder: '#71717a',
  },
};

const getThemedStyles = (isDarkMode = false) => {
  const colors = isDarkMode ? Colors.dark : Colors.light;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      padding: SPACING,
      paddingTop: Platform.OS === 'ios' ? 50 : SPACING,
      backgroundColor: colors.background,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 25,
      padding: SPACING,
      marginHorizontal: 4,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    searchIcon: {
      marginRight: SPACING,
      opacity: 0.5,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    listContainer: {
      padding: SPACING,
    },
    hotelCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 25,
      marginBottom: SPACING,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    hotelImage: {
      width: '100%',
      height: 200,
      backgroundColor: '#8895a7',
    },
    infoContainer: {
      padding: SPACING,
      paddingTop: SPACING / 2,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    name: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    priceContainer: {
      backgroundColor: colors.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginLeft: SPACING,
    },
    price: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    ratingStars: {
      flexDirection: 'row',
      marginRight: 4,
    },
    rating: {
      fontSize: 18,
      color: colors.success,
      fontWeight: '600',
    },
    amenitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    amenityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 15,
      marginRight: 8,
      marginBottom: 8,
    },
    amenityText: {
      color: colors.secondary,
      fontSize: 14,
      marginLeft: 4,
    },
    saveButton: {
      position: 'absolute',
      top: SPACING,
      right: SPACING,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    address: {
      color: colors.secondary,
      fontSize: 14,
      marginTop: 4,
    },
  });
};

function HotelScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getThemedStyles(isDarkMode);
  const { isItemSaved, toggleSaveItem } = useSavedItems();

  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const data = await getRecommendedHotels();
        setHotels(data);
        setFilteredHotels(data);
      } catch (err) {
        console.error('Error loading hotels:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHotels();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHotels(hotels);
    } else {
      const filtered = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHotels(filtered);
    }
  }, [searchQuery, hotels]);

  const handleImageError = useCallback((itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  }, []);

  const getAmenityIcon = (amenity) => {
    const amenityIcons = {
      'Pool': 'water-outline',
      'Spa': 'flower-outline',
      'Restaurant': 'restaurant-outline',
      'Free WiFi': 'wifi-outline',
      'Beachfront': 'beach-outline',
      'Private Beach': 'umbrella-outline',
      'Tennis': 'tennisball-outline',
      'Business Center': 'business-outline',
      'City Center': 'location-outline',
      'Sea View': 'eye-outline',
    };
    return amenityIcons[amenity] || 'ellipse-outline';
  };

  const renderHotelItem = useCallback(({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100)}
      style={styles.hotelCard}
      >
        <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => navigation.navigate('HotelDetail', { 
          itemId: item.id,
          item: item,
          itemType: 'hotel'
        })}
      >
        <Image
          source={{ 
            uri: imageErrors[item.id] 
              ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
              : item.image 
          }}
          style={styles.hotelImage}
          resizeMode="cover"
          onError={() => handleImageError(item.id)}
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => toggleSaveItem(item, 'hotel')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isItemSaved(item, 'hotel') ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{item.price}</Text>
            </View>
              </View>
              <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {Array(Math.floor(parseFloat(item.rating || 0))).fill(null).map((_, i) => (
                <Ionicons key={i} name="star" size={16} color={Colors[isDarkMode ? 'dark' : 'light'].success} />
              ))}
            </View>
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.address}>{item.address}</Text>
          <View style={styles.amenitiesContainer}>
            {item.amenities?.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityBadge}>
                <Ionicons name={getAmenityIcon(amenity)} size={14} color={Colors[isDarkMode ? 'dark' : 'light'].secondary} />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
  ), [navigation, styles, isItemSaved, toggleSaveItem, isDarkMode, imageErrors, handleImageError]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors[isDarkMode ? 'dark' : 'light'].tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={22}
            color={Colors[isDarkMode ? 'dark' : 'light'].placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hotels..."
            placeholderTextColor={Colors[isDarkMode ? 'dark' : 'light'].placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <FlatList
        data={filteredHotels}
        renderItem={renderHotelItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default HotelScreen; 