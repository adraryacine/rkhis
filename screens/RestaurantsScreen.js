// screens/RestaurantsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  StatusBar,
  useColorScheme,
  Dimensions,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSavedItems } from '../contexts/SavedItemsContext';
import { getTopRatedRestaurants } from '../services/dataService';

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
    restaurantCard: {
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
    restaurantImage: {
        width: '100%',
      height: 180,
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
    cuisineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING / 2,
    },
    cuisine: {
      fontSize: 14,
      color: colors.secondary,
      marginLeft: SPACING / 2,
    },
    hoursContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING / 2,
    },
    hours: {
      fontSize: 14,
      color: colors.secondary,
      marginLeft: SPACING / 2,
    },
  });
};

function RestaurantsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getThemedStyles(isDarkMode);
  const { isItemSaved, toggleSaveItem } = useSavedItems();

  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await getTopRatedRestaurants();
        console.log('Fetched restaurants:', data);
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        console.error('Error loading restaurants:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants]);

  const handleImageError = useCallback((itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  }, []);

  const renderRestaurantItem = useCallback(({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100)}
      style={styles.restaurantCard}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => navigation.navigate('RestaurantDetail', { 
          restaurantId: item.id,
          itemData: item
        })}
      >
        <Image
          source={{ 
            uri: imageErrors[item.id] 
              ? 'https://via.placeholder.com/600x400/8895a7/ffffff?text=Restaurant'
              : item.images?.[0] || item.image || 'https://via.placeholder.com/600x400/8895a7/ffffff?text=Restaurant'
          }}
          style={styles.restaurantImage}
          resizeMode="cover"
          onError={() => handleImageError(item.id)}
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => toggleSaveItem(item, 'restaurant')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isItemSaved(item, 'restaurant') ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{item.priceRange}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {Array(Math.floor(item.rating)).fill(null).map((_, i) => (
                <Ionicons key={i} name="star" size={16} color={Colors[isDarkMode ? 'dark' : 'light'].success} />
              ))}
            </View>
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          {item.cuisine && (
            <View style={styles.cuisineContainer}>
              <Ionicons name="restaurant-outline" size={16} color={Colors[isDarkMode ? 'dark' : 'light'].secondary} />
              <Text style={styles.cuisine}>{item.cuisine}</Text>
            </View>
          )}
          {item.openingHours && (
            <View style={styles.hoursContainer}>
              <Ionicons name="time-outline" size={16} color={Colors[isDarkMode ? 'dark' : 'light'].secondary} />
              <Text style={styles.hours}>{item.openingHours}</Text>
            </View>
          )}
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
            placeholder="Search restaurants..."
            placeholderTextColor={Colors[isDarkMode ? 'dark' : 'light'].placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
           </View>
           </View>
           <FlatList
        data={filteredRestaurants}
             renderItem={renderRestaurantItem}
        keyExtractor={item => item.id}
             contentContainerStyle={styles.listContainer}
             showsVerticalScrollIndicator={false}
           />
    </View>
  );
}

export default RestaurantsScreen;
