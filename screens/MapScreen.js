// screens/MapScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  TextInput, // Added for search bar
  SafeAreaView, // Added for layout
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native'; // For navigation to detail screens
import { useColorScheme } from 'react-native'; // For theming

// Import data fetching functions
import { getPopularAttractions, getRecommendedHotels } from '../services/dataService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ASPECT_RATIO = screenWidth / screenHeight;
const LATITUDE_DELTA = 0.0422; // Initial zoom level (smaller = more zoomed in)
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_LATITUDE = 36.7559; // Approximate center of Bejaia
const INITIAL_LONGITUDE = 5.0842; // Approximate center of Bejaia
const SPACING = 15;

// Helper function to get consistent themed colors
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    primaryGreen: isDarkMode ? '#4CAF50' : '#00796B', // Themed green
    primaryBlue: isDarkMode ? '#2196F3' : '#01579B', // Themed blue
    primaryOrange: isDarkMode ? '#FF9800' : '#BF360C', // Themed orange
    primaryRed: isDarkMode ? '#FF453A' : '#D32F2F', // Themed red
    border: isDarkMode ? '#38383A' : '#E0E0E0',
    calloutBackground: isDarkMode ? '#3A3A3C' : '#FFFFFF',
    calloutBorder: isDarkMode ? '#5A5A5C' : '#CCCCCC',
    calloutText: isDarkMode ? '#FFFFFF' : '#333333',
    calloutLink: isDarkMode ? '#0A84FF' : '#00796B',
    searchBarBackground: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    searchBarBorder: isDarkMode ? '#38383A' : '#E0E0E0',
    searchIcon: isDarkMode ? '#8E8E93' : '#555555',
    searchPlaceholder: isDarkMode ? '#636366' : '#777777',
});

// Helper function to get themed styles
const getThemedMapStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: SPACING * 0.8,
    fontSize: 16,
    color: colors.secondaryText,
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map fill the entire container
  },
  locationButton: {
    position: 'absolute',
    bottom: SPACING * 2,
    right: SPACING * 1.5,
    backgroundColor: colors.card, // Themed background
    padding: SPACING * 0.8,
    borderRadius: SPACING * 2, // Circle button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
   // --- Search Bar Styles ---
   searchBarContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? SPACING * 5 : SPACING, // Adjust for status bar on iOS
        left: 0,
        right: 0,
        paddingHorizontal: SPACING * 1.5,
        zIndex: 10, // Ensure it's above the map
   },
   searchBarInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.searchBarBackground,
        borderColor: colors.searchBarBorder,
        borderWidth: 1,
        borderRadius: SPACING * 2,
        paddingLeft: SPACING * 1.2,
        paddingRight: SPACING * 0.8,
        height: SPACING * 3.5, // Height of the search bar
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
   },
   searchIcon: {
        marginRight: SPACING,
   },
   searchTextInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: colors.text,
   },
    searchFilterButton: {
        padding: SPACING * 0.5,
        marginLeft: SPACING * 0.4,
    },
  // Styles for the info bubble (Callout)
  calloutView: {
    padding: SPACING * 0.8,
    minWidth: 150, // Minimum width
    maxWidth: 250, // Maximum width
    backgroundColor: colors.calloutBackground, // Themed background
    borderRadius: SPACING * 0.6,
    borderColor: colors.calloutBorder, // Themed border
    borderWidth: 0.5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING * 0.3,
    color: colors.calloutText, // Themed text
  },
  calloutDescription: {
    fontSize: 13,
    color: colors.secondaryText, // Themed secondary text
    marginBottom: SPACING * 0.5,
  },
   calloutLink: {
      fontSize: 14,
      color: colors.calloutLink, // Themed link color
      marginTop: SPACING * 0.3,
      fontWeight: 'bold',
  },
});

function MapScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedMapStyles(colors);

  const [isLoading, setIsLoading] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const mapRef = useRef(null); // Reference to the MapView

  // Combine data from dataService for map markers
  const fetchMapData = useCallback(async () => {
      setIsLoading(true);
      try {
          const attractions = await getPopularAttractions();
          const hotels = await getRecommendedHotels();
           // Combine and format data for markers
           const allMarkers = [
               ...(attractions || []).map(item => ({
                   id: `attr-${item.id}`,
                   type: 'Attraction',
                   name: item.name,
                   description: item.description,
                   latitude: item.latitude,
                   longitude: item.longitude,
                   data: item, // Store original data for detail screens
               })),
               ...(hotels || []).map(item => ({
                   id: `hotel-${item.id}`,
                   type: 'Hotel',
                   name: item.name,
                   description: item.rating ? `Rating: ${item.rating}` : 'Hotel',
                   latitude: item.latitude,
                   longitude: item.longitude,
                    data: item, // Store original data
               })),
               // Add other types like Restaurants if they have coordinates
           ].filter(marker => marker.latitude && marker.longitude); // Filter out items without coordinates

          setMarkers(allMarkers);
      } catch (error) {
          console.error("Failed to fetch map data:", error);
          Alert.alert("Error", "Could not load points of interest.");
          setMarkers([]); // Clear markers on error
      } finally {
          setIsLoading(false);
      }
  }, []);


  // Request location permission and fetch data on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location access is needed to show your position on the map.',
          [{ text: 'OK' }]
        );
        setLocationPermissionGranted(false);
      } else {
        setLocationPermissionGranted(true);
        try {
          // Attempt to get current position (can take time)
          console.log("Fetching user location...");
          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeout: 10000 }); // Added timeout
          setUserLocation(location.coords);
           console.log("User location fetched:", location.coords);
        } catch (error) {
          console.error("Error fetching user location: ", error);
          Alert.alert('Location Error', 'Unable to retrieve your current location.');
          // Continue without user location if it fails
        }
      }

      // Fetch points of interest data
      fetchMapData();

    })();
  }, [fetchMapData]); // Depend on fetchMapData callback


  // Function to center on the user's location
  const goToUserLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01, // Closer zoom on the user
        longitudeDelta: 0.01 * ASPECT_RATIO,
      }, 1000); // Animation duration
    } else if (!locationPermissionGranted) {
       Alert.alert('Permission Required', 'Please enable location access in your device settings.');
    } else {
       Alert.alert('Location Unavailable', 'Your current location is not yet available.');
    }
  }, [userLocation, locationPermissionGranted]);

  // Determine marker color based on type (can be extended)
  const getMarkerColor = (type) => {
    switch (type) {
      case 'Attraction': return 'red';
      case 'Hotel': return 'blue';
      case 'Restaurant': return 'green';
      default: return 'purple';
    }
  };

   // Handle callout press to navigate to detail screen
   const handleCalloutPress = useCallback((markerData) => {
       console.log('Callout Tapped:', markerData.name, markerData.type, markerData.id);
       if (markerData.type === 'Attraction') {
           navigation.navigate('AttractionDetail', { attractionId: markerData.data.id, attraction: markerData.data });
       } else if (markerData.type === 'Hotel') {
            navigation.navigate('HotelDetail', { hotelId: markerData.data.id, hotel: markerData.data });
       }
        // Add cases for other types if needed
   }, [navigation]);

   // Placeholder for getting directions
    const getDirections = useCallback((markerData) => {
        if (!markerData.latitude || !markerData.longitude) {
            Alert.alert("Location Unavailable", "Cannot get directions for this location.");
            return;
        }
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${markerData.latitude},${markerData.longitude}`;
        const label = markerData.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        Linking.openURL(url).catch(err => Alert.alert('Error', 'Could not open map application.'));

    }, []);


  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading map and data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        {/* Placeholder Search Bar */}
        <View style={styles.searchBarContainer}>
            <View style={styles.searchBarInner}>
                <Ionicons name="search-outline" size={22} color={colors.searchIcon} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchTextInput}
                    placeholder={`Search on map...`}
                    placeholderTextColor={colors.searchPlaceholder}
                     editable={false} // Placeholder, not functional search yet
                    onPressIn={() => Alert.alert("Search", "Map search coming soon!")}
                />
                 <TouchableOpacity
                    style={styles.searchFilterButton}
                    accessibilityLabel="Filter map markers"
                    onPress={() => Alert.alert("Filter", "Map filters coming soon!")} // Example action
                 >
                     <Ionicons name="options-outline" size={24} color={colors.primaryGreen} />
                </TouchableOpacity>
            </View>
        </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE} // Use Google Maps on Android
        initialRegion={{
          latitude: INITIAL_LATITUDE,
          longitude: INITIAL_LONGITUDE,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation={locationPermissionGranted} // Show blue dot if permission is granted
        showsMyLocationButton={false} // Hide default button, we use our own
        mapType="standard"
        loadingEnabled={true}
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#eeeeee"
        // onRegionChangeComplete={handleRegionChange} // Optional: fetch data based on map region
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            description={marker.description}
            pinColor={getMarkerColor(marker.type)} // Themed color based on type
            tracksViewChanges={false} // Improve performance for static markers
          >
            <Callout tooltip={false} onPress={() => handleCalloutPress(marker)} >
              <View style={styles.calloutView}>
                <Text style={styles.calloutTitle}>{marker.name}</Text>
                {marker.description && <Text style={styles.calloutDescription}>{marker.description}</Text>}
                {/* Action links within the callout */}
                <TouchableOpacity onPress={() => handleCalloutPress(marker)}>
                    <Text style={styles.calloutLink}>View Details</Text>
                </TouchableOpacity>
                 <TouchableOpacity onPress={() => getDirections(marker)} style={{marginTop: SPACING * 0.3}}>
                    <Text style={styles.calloutLink}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Button to center on the user's location */}
      {locationPermissionGranted && (
         <TouchableOpacity style={styles.locationButton} onPress={goToUserLocation}>
             <Ionicons name="locate-outline" size={28} color={colors.primaryGreen} />
         </TouchableOpacity>
      )}

       {/* You could add here filters or map type options */}
    </SafeAreaView>
  );
}

export default MapScreen;