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
  Image,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSavedItems } from '../contexts/SavedItemsContext';
import { getFeaturedDestinations } from '../services/destinationService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SPACING = 16;
const CARD_HEIGHT = 220;

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
    screenContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContainer: {
        padding: SPACING,
        paddingTop: SPACING * 2,
    },
    listItemContainer: {
      marginBottom: SPACING * 1.5,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
      elevation: 4,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    cardBase: {
      height: CARD_HEIGHT,
      borderRadius: 16,
        overflow: 'hidden',
    },
    imageContainer: {
      flex: 1,
      backgroundColor: colors.border,
    },
     listItemImage: {
      width: '100%',
      height: '100%',
    },
    gradientOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: CARD_HEIGHT,
          justifyContent: 'flex-end',
         padding: SPACING,
     },
    contentContainer: {
      marginTop: 'auto',
    },
     listItemTitle: {
      fontSize: 24,
         fontWeight: '700',
         color: Colors.white,
      marginBottom: 4,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
     },
      listItemDescription: {
      fontSize: 16,
         color: Colors.white,
         opacity: 0.9,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
     },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    tag: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 4,
    },
    tagText: {
      color: Colors.white,
      fontSize: 12,
      fontWeight: '600',
    },
    saveButton: {
      position: 'absolute',
      top: SPACING,
      right: SPACING,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 24,
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    ratingContainer: {
        position: 'absolute',
      top: SPACING,
      left: SPACING,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    ratingText: {
      color: Colors.white,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING * 2,
    },
    emptyText: {
      fontSize: 18,
        color: colors.secondary,
        textAlign: 'center',
      marginTop: SPACING,
     },
     loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
     },
      loadingText: {
         marginTop: SPACING,
         fontSize: 16,
         color: colors.tint,
         fontWeight: '600',
      },
  });
};

const AnimatedCard = React.memo(({ children, onPress, isDarkMode }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(0.9, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  return (
        <Pressable
            onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
            style={{ flex: 1 }}
        >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                 {children}
            </Animated.View>
        </Pressable>
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
          setIsLoading(true);
    }
          setError(null);

          try {
      const data = await getFeaturedDestinations();
      if (data && data.length > 0) {
              setDestinationsData(data);
      } else {
        setError("No destinations available at the moment.");
        setDestinationsData([]);
      }
          } catch (err) {
              console.error("Error loading destinations:", err);
      setError("Unable to load destinations. Please try again.");
              setDestinationsData([]);
          } finally {
              setIsLoading(false);
      setIsRefreshing(false);
          }
      };

  useEffect(() => {
      loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const renderDestinationItem = useCallback(({ item, index }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 100).springify()} 
      style={styles.listItemContainer}
    >
      <AnimatedCard
        onPress={() => navigation.navigate('DestinationDetail', { 
          destinationId: item.id, 
          item: item,
          itemType: 'destination' 
        })}
        isDarkMode={isDarkMode}
      >
        <View style={styles.cardBase}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
          style={styles.listItemImage}
          resizeMode="cover"
            />
          </View>
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.listItemTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.listItemDescription} numberOfLines={2}>
                {item.description}
              </Text>
              
              {item.tags && (
                <View style={styles.tagsContainer}>
                  {item.tags.slice(0, 3).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </LinearGradient>

            <TouchableOpacity
            style={styles.saveButton}
                onPress={() => toggleSaveItem(item, 'destination')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name={isItemSaved(item, 'destination') ? 'bookmark' : 'bookmark-outline'}
                    size={24}
              color={Colors.white}
                />
            </TouchableOpacity>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </AnimatedCard>
    </Animated.View>
  ), [navigation, styles, isDarkMode, isItemSaved, toggleSaveItem]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDarkMode ? Colors.dark.tint : Colors.light.tint} />
        <Text style={styles.loadingText}>Discovering amazing places...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={styles.screenContainer.backgroundColor}
      />
      
           <FlatList
             data={destinationsData}
             renderItem={renderDestinationItem}
        keyExtractor={(item) => `destination-${item.id}`}
             contentContainerStyle={styles.listContainer}
             showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? Colors.dark.tint : Colors.light.tint}
            colors={[isDarkMode ? Colors.dark.tint : Colors.light.tint]}
          />
        }
             ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={error ? "alert-circle-outline" : "compass-outline"} 
              size={64} 
              color={isDarkMode ? Colors.dark.secondary : Colors.light.secondary} 
            />
            <Text style={styles.emptyText}>
              {error || "No destinations found"}
            </Text>
                     </View>
             )}
           />
    </View>
  );
}

export default DestinationsScreen;