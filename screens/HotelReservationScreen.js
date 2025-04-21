// screens/HotelReservationScreen.js
import React, { useState, useEffect } from 'react'; // Keep useState and useEffect
import { // Keep other imports
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator, // Added for loading
  Alert, // Added for errors
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native'; // useRoute to get params
import { useColorScheme } from 'react-native'; // For theming
import { getRecommendedHotels } from '../services/dataService'; // Import data service function


const { width: screenWidth } = Dimensions.get('window');
const SPACING = 15;

// Helper function to get consistent themed colors
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    primaryGreen: isDarkMode ? '#4CAF50' : '#00796B',
    primaryBlue: isDarkMode ? '#2196F3' : '#01579B',
    primaryOrange: isDarkMode ? '#FF9800' : '#BF360C',
    primaryRed: isDarkMode ? '#FF453A' : '#D32F2F',
    border: isDarkMode ? '#38383A' : '#E0E0E0',
});

// Helper function to get themed styles
const getThemedHotelReservationStyles = (colors) => StyleSheet.create({
  screenContainer: { // Style principal pour l'écran
    flex: 1,
    backgroundColor: colors.background, // Themed background
  },
  listContentContainer: { // Style pour le contenu de la FlatList
    paddingVertical: SPACING,
    paddingHorizontal: SPACING,
  },
  cardContainer: { // Style pour chaque carte d'hôtel
    backgroundColor: colors.card, // Themed card background
    borderRadius: SPACING,
    marginBottom: SPACING,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelImage: { // Style pour l'image de l'hôtel
    width: screenWidth * 0.3, // Responsive width
    height: '100%',
    minHeight: SPACING * 8, // Minimum height
  },
  infoContainer: { // Style pour la partie droite avec les infos
    flex: 1,
    paddingVertical: SPACING * 1.2,
    paddingHorizontal: SPACING * 1.2,
    justifyContent: 'center',
  },
  hotelName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text, // Themed text
    marginBottom: SPACING * 0.4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING * 0.6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
   iconSpacing: {
     marginRight: SPACING * 0.3,
   },
  hotelRating: {
    fontSize: 15,
    color: colors.secondaryText, // Themed secondary text
    fontWeight: '500',
  },
  hotelPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primaryGreen, // Themed price color
  },
  hotelAmenities: {
    fontSize: 13,
    color: colors.secondaryText, // Themed secondary text
    marginTop: SPACING * 0.3,
    opacity: 0.8,
  },
  centered: { // Style for loading/empty state
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
   loadingText: {
        marginTop: SPACING,
        fontSize: 16,
        color: colors.secondaryText,
   },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondaryText,
        textAlign: 'center',
        marginBottom: SPACING * 0.5,
    },
    emptySubText: {
        fontSize: 14,
        color: colors.secondaryText,
        textAlign: 'center',
    },
});

// Composant pour afficher une entrée d'hôtel dans la liste
// Tu peux le mettre ici ou l'importer s'il est dans un autre fichier
const HotelListItem = React.memo(({ item, onPress, colors, styles }) => (
  <TouchableOpacity
    style={styles.cardContainer}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityLabel={`View details for ${item.name}`}
  >
    <Image
      source={{ uri: item.image }} // Use URI from data
      style={styles.hotelImage}
      resizeMode="cover"
    />
    <View style={styles.infoContainer}>
      <Text style={styles.hotelName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.detailRow}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFC107" style={styles.iconSpacing}/>
          <Text style={styles.hotelRating}>{item.rating || 'N/A'}</Text>
        </View>
        {item.price && <Text style={styles.hotelPrice}>{item.price}/night</Text>}
      </View>
      {item.amenities && Array.isArray(item.amenities) && item.amenities.length > 0 && (
        <Text style={styles.hotelAmenities} numberOfLines={1}>
          {item.amenities.join(' • ')}
        </Text>
      )}
    </View>
  </TouchableOpacity>
));

function HotelReservationScreen() { // Keep the original function name
  const navigation = useNavigation();
  const route = useRoute(); // Use useRoute hook
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedHotelReservationStyles(colors);

  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get initial hotels data from route params if available
  const initialHotels = route.params?.hotels;

  useEffect(() => {
      const fetchHotels = async () => {
          setIsLoading(true);
          try {
              // If hotels data was passed via route params, use that directly
              if (initialHotels && Array.isArray(initialHotels)) {
                  console.log(`Using ${initialHotels.length} hotels from route params.`);
                  setHotels(initialHotels);
              } else {
                   // Otherwise, fetch from data service (which uses mock data)
                   console.log("No initial hotels in params, fetching from data service...");
                   const fetchedHotels = await getRecommendedHotels();
                   setHotels(fetchedHotels);
                   console.log(`Fetched ${fetchedHotels.length} hotels from data service.`);
              }
          } catch (error) {
              console.error("Failed to fetch hotels:", error);
              Alert.alert("Error", "Could not load hotels.");
              setHotels([]); // Clear list on error
          } finally {
              setIsLoading(false);
          }
      };

      fetchHotels();
  }, [initialHotels]); // Re-fetch if initialHotels param changes

  // Function to handle clicking on an hotel item
  const handleHotelPress = (hotel) => {
    console.log('Navigate to details for hotel:', hotel.name);
    // Navigate to the Hotel Detail screen, passing the hotel data
    navigation.navigate('HotelDetail', { hotelId: hotel.id, hotel: hotel });
  };

  const renderHotelItem = ({ item }) => (
    <HotelListItem
      item={item}
      onPress={() => handleHotelPress(item)}
      colors={colors} // Pass colors and styles to the list item
      styles={styles}
    />
  );

  // --- Loading State ---
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading Hotels...</Text>
      </View>
    );
  }

  // --- Empty State ---
  if (!hotels || hotels.length === 0) {
    return (
      <View style={styles.centered}>
         <Ionicons name="bed-outline" size={60} color={colors.secondaryText} style={{marginBottom: SPACING}}/>
        <Text style={styles.emptyText}>No hotels found.</Text>
         <Text style={styles.emptySubText}>Check back later or try a different search.</Text>
      </View>
    );
  }

  // --- Display the List ---
  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <FlatList
        data={hotels}
        renderItem={renderHotelItem}
        keyExtractor={(item) => item.id} // Use item.id as key
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default HotelReservationScreen; 