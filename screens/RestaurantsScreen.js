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
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Import ONLY the useSavedItems hook and your ACTUAL data fetching function
import { useSavedItems } from '../contexts/SavedItemsContext'; // Ensure this path is correct
import { getTopRatedRestaurants } from '../services/dataService'; // <--- Import the specific fetch function


// --- LOCAL Re-definition of ALL Constants and Styles needed for THIS screen ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SPACING = 16;
// Include any other constants specific to THIS screen's layout or appearance
// const SOME_OTHER_CONSTANT = 10;

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

const CARD_SHADOW = {
  shadowColor: Colors.light.black,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 4,
};

const fallbackPlaceholderImage = 'https://via.placeholder.com/300x200/cccccc/969696?text=Image+Error';

// --- LOCAL Definition of getThemedStyles including ALL styles for THIS screen ---
const getThemedStyles = (isDarkMode = false) => {
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const dynamicCardShadow = {
    ...CARD_SHADOW,
    shadowColor: colors.black,
  };

  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContainer: {
        padding: SPACING,
        paddingTop: SPACING * 2,
        paddingBottom: SPACING,
    },
    listItemContainer: {
         marginBottom: SPACING,
    },
     // Reusable Card Base style needed by AnimatedCard (Define it here)
    cardBase: {
        backgroundColor: colors.cardBackground,
        borderRadius: SPACING * 1.5,
        ...dynamicCardShadow,
        overflow: 'hidden',
    },
    // Styles for Restaurants List (Horizontal Card Layout)
     restaurantListItemCard: {
        width: '100%',
        aspectRatio: undefined,
        height: 120, // Fixed height for horizontal item
        borderRadius: SPACING * 1.5,
        overflow: 'hidden',
        backgroundColor: colors.border, // Placeholder color
        ...dynamicCardShadow,
        backgroundColor: colors.cardBackground, // Use card background color
        flexDirection: 'row', // Arrange image and content horizontally
        alignItems: 'center', // Vertically center items in the row
    },
    restaurantListItemImage: {
         width: '35%', // Image takes 35% of card width
         height: '100%', // Image takes full height of card
         backgroundColor: colors.secondary, // Placeholder
    },
    restaurantListItemContent: { // Container for text content and save button in horizontal list
        flex: 1, // Takes remaining width
        padding: SPACING,
        justifyContent: 'center', // Vertically center content
        position: 'relative',
    },
     restaurantListItemTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
     },
     restaurantListItemDetails: {
        fontSize: 14,
        color: colors.secondary,
     },
     saveButtonListRight: {
       position: 'absolute',
       top: SPACING * 0.5,
       right: SPACING * 0.5,
       backgroundColor: 'rgba(0, 0, 0, 0.2)',
       borderRadius: 15,
       padding: SPACING * 0.4,
       zIndex: 5,
    },
     ratingContainer: {
       flexDirection: 'row',
       alignItems: 'center',
       marginBottom: 4,
     },
     hotelRating: { // Reusing this text style for consistency
       fontSize: 14,
       color: colors.secondary,
       marginLeft: SPACING * 0.5,
     },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING * 2,
        minHeight: Dimensions.get('window').height * 0.5,
    },
     emptyListText: {
        marginTop: SPACING,
        fontSize: 16,
        color: colors.secondary,
        textAlign: 'center',
     },
     secondaryText: {
        color: colors.secondary,
     },
     loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING * 2,
         minHeight: Dimensions.get('window').height * 0.5,
     },
      loadingText: {
         marginTop: SPACING,
         fontSize: 16,
         color: colors.tint,
         fontWeight: '600',
      },
  });
};

// --- LOCAL Re-definition of AnimatedCard component ---
const AnimatedCard = React.memo(({ children, style, onPress, accessibilityLabel, isDarkMode }) => {
  const scale = useSharedValue(1);
  const styles = getThemedStyles(isDarkMode); // Call getThemedStyles inside the component

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 150 }) }],
  }));

  return (
    <Animated.View style={[styles.cardBase, style]}> // Use local base card style
        <Pressable
            onPress={onPress}
            onPressIn={() => (scale.value = 0.96)}
            onPressOut={() => (scale.value = 1)}
            accessibilityLabel={accessibilityLabel}
            style={{ flex: 1 }}
        >
            <Animated.View style={[{flex: 1}, animatedStyle]}>
                 {children}
            </Animated.View>
        </Pressable>
    </Animated.View>
  );
});


function RestaurantsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getThemedStyles(isDarkMode);

  const { isItemSaved, toggleSaveItem } = useSavedItems();

  const [restaurantsData, setRestaurantsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch data when the component mounts
  useEffect(() => {
      const loadData = async () => {
          setIsLoading(true);
          setError(null);
          try {
              const data = await getTopRatedRestaurants(); // <--- CALL THE IMPORTED FETCH FUNCTION
              setRestaurantsData(data);
          } catch (err) {
              console.error("Error loading restaurants:", err);
              setError("Failed to load restaurants. Please try again later.");
              setRestaurantsData([]);
              // Alert.alert("Error", "Failed to load restaurants data.");
          } finally {
              setIsLoading(false);
          }
      };
      loadData();
  }, []);


  const renderRestaurantItem = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)} style={styles.listItemContainer}>
      <AnimatedCard
        style={styles.restaurantListItemCard} // Use specific restaurant list card style
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id, item: item, itemType: 'restaurant' })}
        accessibilityLabel={`View details for ${item.name}, Rating ${item.rating}`}
        isDarkMode={isDarkMode}
      >
         <Image
             source={{ uri: item.image || fallbackPlaceholderImage }}
             style={styles.restaurantListItemImage} // Use specific restaurant list image style
             resizeMode="cover"
         />
          <View style={styles.restaurantListItemContent}> // Use specific restaurant list content style
            <View> {/* Wrapper for name, rating, details */}
                <Text style={styles.restaurantListItemTitle} numberOfLines={1}>{item.name}</Text>
                 <View style={styles.ratingContainer}>
                   {/* Check if rating exists before showing stars */}
                   {item.rating && item.rating > 0 ? (
                       <>
                            {/* Render stars based on rating (simple representation) */}
                            {Array(Math.round(item.rating)).fill(null).map((_, i) => (
                                <Ionicons key={i} name="star" size={16} color={Colors.light.success} />
                            ))}
                            <Text style={styles.hotelRating}>{item.rating} Stars</Text>
                       </>
                   ) : (
                        <Text style={styles.hotelRating}>No Rating</Text>
                   )}
                 </View>
                <Text style={styles.restaurantListItemDetails}>{item.cuisine} • {item.priceRange}</Text>
            </View>
             {/* Save Button */}
            <TouchableOpacity
                style={styles.saveButtonListRight} // Use specific restaurant list save button style
                onPress={() => toggleSaveItem(item, 'restaurant')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel={isItemSaved(item, 'restaurant') ? `Remove ${item.name} from saved` : `Save ${item.name}`}
            >
                <Ionicons
                    name={isItemSaved(item, 'restaurant') ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={isItemSaved(item, 'restaurant') ? Colors.light.tint : (isDarkMode ? Colors.dark.secondary : Colors.light.secondary)} // Use themed secondary when not saved
                />
            </TouchableOpacity>
          </View>
      </AnimatedCard>
    </Animated.View>
  ), [navigation, styles, isDarkMode, isItemSaved, toggleSaveItem]);


  return (
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={styles.screenContainer.backgroundColor}
      />
      {isLoading ? (
           <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color={styles.loadingText.color} />
               <Text style={styles.loadingText}>Loading Restaurants...</Text>
           </View>
      ) : error ? (
           <View style={styles.emptyListContainer}>
                <Ionicons name="warning-outline" size={60} color={styles.secondaryText.color} />
               <Text style={styles.emptyListText}>{error}</Text>
           </View>
      ) : (
           <FlatList
             data={restaurantsData}
             keyExtractor={(item) => `list-rest-${item.id}`}
             renderItem={renderRestaurantItem}
             contentContainerStyle={styles.listContainer}
             showsVerticalScrollIndicator={false}
             ListEmptyComponent={() => (
                 restaurantsData.length === 0 ? (
                     <View style={styles.emptyListContainer}>
                          <Ionicons name="restaurant-outline" size={60} color={styles.secondaryText.color} />
                         <Text style={styles.emptyListText}>No restaurants found.</Text>
                     </View>
                 ) : null
             )}
           />
      )}
    </View>
  );
}


export default RestaurantsScreen;