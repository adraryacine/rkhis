import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 200;
const SPACING = 16;
const ITEM_HEIGHT = CARD_HEIGHT + SPACING;

const HotelScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'luxury', name: 'Luxury' },
    { id: 'budget', name: 'Budget' },
    { id: 'resort', name: 'Resort' },
    { id: 'boutique', name: 'Boutique' },
  ];

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!db) {
        throw new Error('Database not initialized');
      }

      // Get a reference to the hotels collection
      const hotelsCollection = collection(db, 'hotels');
      
      if (!hotelsCollection) {
        throw new Error('Hotels collection not found');
      }

      let q = query(hotelsCollection);

      // Apply filters
      if (selectedCategory !== 'all') {
        q = query(q, where('category', '==', selectedCategory));
      }

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          try {
            const hotelsData = [];
            querySnapshot.forEach((doc) => {
              if (doc.exists()) {
                hotelsData.push({
                  id: doc.id,
                  ...doc.data()
                });
              }
            });

            // Apply search filter
            const filteredHotels = hotelsData.filter(hotel =>
              hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              hotel.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            setHotels(hotelsData);
            setFilteredHotels(filteredHotels);
            setLoading(false);
          } catch (error) {
            console.error('Error processing hotel data:', error);
            setError('Error processing hotel data');
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error fetching hotels:', error);
          setError('Failed to load hotels. Please try again.');
          setLoading(false);
          Alert.alert('Error', 'Failed to load hotels. Please try again.');
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in fetchHotels:', error);
      setError(error.message || 'An unexpected error occurred');
      setLoading(false);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    let unsubscribe;
    
    const setupHotels = async () => {
      try {
        unsubscribe = await fetchHotels();
      } catch (error) {
        console.error('Error setting up hotels:', error);
        setError('Failed to setup hotels');
      }
    };

    setupHotels();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [searchQuery, selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHotels().then(() => setRefreshing(false));
  };

  const renderCategoryItem = ({ item }) => {
    const isSelected = item.id === selectedCategory;
    return (
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: isSelected ? 1.1 : 1 }}
        transition={{ type: 'timing', duration: 200 }}
      >
        <TouchableOpacity
          style={[
            styles.categoryItem,
            {
              backgroundColor: isSelected ? colors.primary : colors.card,
            },
          ]}
          onPress={() => setSelectedCategory(item.id)}
        >
          <Text
            style={[
              styles.categoryText,
              { color: isSelected ? colors.white : colors.text },
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </MotiView>
    );
  };

  const renderHotelCard = ({ item, index }) => {
    const inputRange = [
      -1,
      0,
      ITEM_HEIGHT * index,
      ITEM_HEIGHT * (index + 2),
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0],
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0],
    });

    return (
      <Animated.View
        style={[
          styles.hotelCard,
          {
            transform: [{ scale }],
            opacity,
            backgroundColor: colors.card,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('HotelDetail', {
              hotelId: item.id,
              hotelName: item.name,
              hotelImage: item.images[0],
              hotelPrice: item.price,
            })
          }
        >
          <Image
            source={{ uri: item.images[0] }}
            style={styles.hotelImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          >
            <View style={styles.hotelInfo}>
              <View>
                <Text style={[styles.hotelName, { color: colors.white }]}>
                  {item.name}
                </Text>
                <Text style={[styles.hotelLocation, { color: colors.white }]}>
                  {item.location}
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={[styles.rating, { color: colors.white }]}>
                  {item.rating}
                </Text>
              </View>
            </View>
          </LinearGradient>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.primary }]}>
              ${item.price}
            </Text>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              /night
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading hotels...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchHotels}
        >
          <Text style={[styles.retryButtonText, { color: colors.white }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <BlurView intensity={80} style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search hotels..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </BlurView>

      <Animated.FlatList
        data={filteredHotels}
        renderItem={renderHotelCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <Animated.FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hotels found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    paddingHorizontal: SPACING,
    paddingBottom: SPACING,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: SPACING,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  categoriesContainer: {
    paddingHorizontal: SPACING,
    paddingVertical: SPACING,
  },
  categoryItem: {
    paddingHorizontal: SPACING,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: Platform.OS === 'ios' ? 120 : 90,
    paddingBottom: SPACING,
  },
  hotelCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 15,
    marginHorizontal: SPACING,
    marginBottom: SPACING,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  hotelImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  hotelInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    position: 'absolute',
    top: SPACING,
    right: SPACING,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 12,
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING * 2,
  },
  emptyText: {
    fontSize: 16,
    marginTop: SPACING,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HotelScreen; 