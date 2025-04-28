// screens/AttractionsScreen.js
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
  FadeIn, // Use FadeIn for grid items
  FadeInUp, // Keep FadeInUp for potential other animations
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Import ONLY the useSavedItems hook and your ACTUAL data fetching function
import { useSavedItems } from '../contexts/SavedItemsContext'; // Ensure this path is correct
import { getPopularAttractions } from '../services/dataService'; // <--- Import the specific fetch function


// --- LOCAL Re-definition of ALL Constants and Styles needed for THIS screen ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SPACING = 16;
// Include any other constants specific to THIS screen's layout or appearance

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
    // Reusable Card Base style needed by AnimatedCard (Define it here)
    cardBase: {
        backgroundColor: colors.cardBackground,
        borderRadius: SPACING * 1.5,
        ...dynamicCardShadow,
        overflow: 'hidden',
    },
    // Styles for Attractions List (Grid Layout)
    attractionListItemContainer: {
         width: (screenWidth - SPACING * 3) / 2, // Adjust width calculation for list padding
         marginBottom: SPACING, // Space between rows
         marginHorizontal: SPACING * 0.5, // Space between columns
     },
     attractionListCard: {
         flex: 1,
         borderRadius: SPACING * 1.5,
         overflow: 'hidden',
         backgroundColor: colors.border, // Placeholder color
         ...dynamicCardShadow,
         backgroundColor: colors.cardBackground, // Use card background color
     },
     attractionListImage: {
          width: '100%',
          height: screenHeight * 0.15,
          backgroundColor: colors.secondary, // Placeholder
     },
     attractionListName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        paddingHorizontal: SPACING,
        paddingVertical: SPACING * 0.75,
     },
     attractionsListContentContainer: {
        paddingHorizontal: SPACING * 0.5, // Match column wrapper margin
        paddingTop: SPACING * 2,
        paddingBottom: SPACING,
     },
      attractionsColumnWrapper: {
         justifyContent: 'space-between',
     },
     saveButtonList: { // Reuse save button list style
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


function AttractionsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = getThemedStyles(isDarkMode);

  const { isItemSaved, toggleSaveItem } = useSavedItems();

  const [attractionsData, setAttractionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch data when the component mounts
  useEffect(() => {
      const loadData = async () => {
          setIsLoading(true);
          setError(null);
          try {
              const data = await getPopularAttractions(); // <--- CALL THE IMPORTED FETCH FUNCTION
              setAttractionsData(data);
          } catch (err) {
              console.error("Error loading attractions:", err);
              setError("Failed to load attractions. Please try again later.");
              setAttractionsData([]);
              // Alert.alert("Error", "Failed to load attractions data.");
          } finally {
              setIsLoading(false);
          }
      };
      loadData();
  }, []);


  const renderAttractionItem = useCallback(({ item, index }) => (
      <Animated.View
          style={styles.attractionListItemContainer}
          entering={FadeIn.delay(index * 75).duration(500)}
      >
          <AnimatedCard
              style={styles.attractionListCard} // Use specific attraction list card style
              onPress={() => navigation.navigate('AttractionDetail', { attractionId: item.id, item: item, itemType: 'attraction' })}
              accessibilityLabel={`View details for ${item.name}`}
              isDarkMode={isDarkMode}
          >
              <Image
                 source={{ uri: item.image || fallbackPlaceholderImage }}
                 style={styles.attractionListImage} // Use specific attraction list image style
                 resizeMode="cover"
               />
              <Text style={styles.attractionListName} numberOfLines={1}>{item.name}</Text>
               <TouchableOpacity
                    style={styles.saveButtonList} // Reuse save button list style
                    onPress={() => toggleSaveItem(item, 'attraction')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={isItemSaved(item, 'attraction') ? `Remove ${item.name} from saved` : `Save ${item.name}`}
                >
                    <Ionicons
                        name={isItemSaved(item, 'attraction') ? 'bookmark' : 'bookmark-outline'}
                        size={24}
                        color={isItemSaved(item, 'attraction') ? Colors.light.tint : Colors.white}
                    />
                </TouchableOpacity>
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
               <Text style={styles.loadingText}>Loading Attractions...</Text>
           </View>
      ) : error ? (
           <View style={styles.emptyListContainer}>
                <Ionicons name="warning-outline" size={60} color={styles.secondaryText.color} />
               <Text style={styles.emptyListText}>{error}</Text>
           </View>
      ) : (
           <FlatList
             data={attractionsData}
             keyExtractor={(item) => `list-attr-${item.id}`}
             renderItem={renderAttractionItem}
             numColumns={2}
             columnWrapperStyle={styles.attractionsColumnWrapper}
             contentContainerStyle={styles.attractionsListContentContainer}
             showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                  attractionsData.length === 0 ? (
                     <View style={styles.emptyListContainer}>
                          <Ionicons name="images-outline" size={60} color={styles.secondaryText.color} />
                         <Text style={styles.emptyListText}>No attractions found.</Text>
                     </View>
                  ) : null
             )}
           />
      )}
    </View>
  );
}


export default AttractionsScreen;