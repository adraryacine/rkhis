// screens/DestinationsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  StatusBar,
  useColorScheme,
  Dimensions,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Alert,
  Image // Import Image for fallback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Import ONLY the useSavedItems hook and your ACTUAL data fetching function
import { useSavedItems } from '../contexts/SavedItemsContext'; // Ensure this path is correct
import { getFeaturedDestinations } from '../services/dataService'; // <--- Import the specific fetch function


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
    // Style for cards that span most of the width (for Destinations list)
    fullWidthCard: {
        width: '100%',
        aspectRatio: 16 / 9, // Maintain aspect ratio
        backgroundColor: colors.border, // Placeholder color
         borderRadius: SPACING * 1.5, // Match base card border radius
         overflow: 'hidden', // Clip content
         ...dynamicCardShadow, // Apply shadow
         backgroundColor: colors.cardBackground, // Use card background color
    },
     listItemImage: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: colors.secondary,
     },
     listItemContent: {
         padding: SPACING,
     },
     listItemTitle: {
         fontSize: 18,
         fontWeight: '700',
         color: Colors.white,
         textShadowColor: 'rgba(0, 0, 0, 0.5)',
         textShadowOffset: { width: 1, height: 1 },
         textShadowRadius: 3,
     },
      listItemDescription: {
         fontSize: 14,
         color: Colors.white,
         opacity: 0.9,
         marginTop: SPACING * 0.25,
         textShadowColor: 'rgba(0, 0, 0, 0.5)',
         textShadowOffset: { width: 1, height: 1 },
         textShadowRadius: 3,
     },
    saveButtonList: { // Adjusted position for list view
        position: 'absolute',
        top: SPACING * 0.75,
        right: SPACING * 0.75,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 18,
        padding: SPACING * 0.3,
        zIndex: 5,
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


function DestinationsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getThemedStyles(isDarkMode);

  const { isItemSaved, toggleSaveItem } = useSavedItems();

  const [destinationsData, setDestinationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch data when the component mounts using your REAL Firebase fetch function
  useEffect(() => {
      const loadData = async () => {
          setIsLoading(true);
          setError(null);
          try {
              const data = await getFeaturedDestinations(); // <--- CALL THE IMPORTED FETCH FUNCTION
              setDestinationsData(data);
          } catch (err) {
              console.error("Error loading destinations:", err);
              setError("Failed to load destinations. Please try again later.");
              setDestinationsData([]);
              // Alert.alert("Error", "Failed to load destinations data.");
          } finally {
              setIsLoading(false);
          }
      };
      loadData();
  }, []);


  const renderDestinationItem = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)} style={styles.listItemContainer}>
      <AnimatedCard
        style={styles.fullWidthCard}
        onPress={() => navigation.navigate('DestinationDetail', { destinationId: item.id, item: item, itemType: 'destination' })}
        accessibilityLabel={`View details for ${item.name}`}
        isDarkMode={isDarkMode}
      >
        <ImageBackground
          source={{ uri: item.image || fallbackPlaceholderImage }}
          style={styles.listItemImage}
          resizeMode="cover"
        >
           <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={StyleSheet.absoluteFill}
            />
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.listItemDescription} numberOfLines={2}>{item.description}</Text>
          </View>
            <TouchableOpacity
                style={styles.saveButtonList}
                onPress={() => toggleSaveItem(item, 'destination')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel={isItemSaved(item, 'destination') ? `Remove ${item.name} from saved` : `Save ${item.name}`}
            >
                <Ionicons
                    name={isItemSaved(item, 'destination') ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={isItemSaved(item, 'destination') ? Colors.light.tint : Colors.white}
                />
            </TouchableOpacity>
        </ImageBackground>
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
               <Text style={styles.loadingText}>Loading Destinations...</Text>
           </View>
      ) : error ? (
           <View style={styles.emptyListContainer}>
                <Ionicons name="warning-outline" size={60} color={styles.secondaryText.color} />
               <Text style={styles.emptyListText}>{error}</Text>
           </View>
      ) : (
           <FlatList
             data={destinationsData}
             keyExtractor={(item) => `list-dest-${item.id}`}
             renderItem={renderDestinationItem}
             contentContainerStyle={styles.listContainer}
             showsVerticalScrollIndicator={false}
             ListEmptyComponent={() => (
                 destinationsData.length === 0 ? (
                     <View style={styles.emptyListContainer}>
                          <Ionicons name="planet-outline" size={60} color={styles.secondaryText.color} />
                         <Text style={styles.emptyListText}>No destinations found.</Text>
                     </View>
                 ) : null
             )}
           />
      )}
    </View>
  );
}


export default DestinationsScreen;