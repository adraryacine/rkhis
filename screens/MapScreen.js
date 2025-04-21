// screens/MapScreen.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  TextInput,
  SafeAreaView,
  ScrollView,
  Linking,
  useColorScheme
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// --- Consistent Colors (Matching HomeScreen) ---
const Colors = {
  light: { text: '#111827', background: '#ffffff', tint: '#007AFF', secondary: '#6b7280', border: '#e5e7eb', cardBackground: '#ffffff', placeholder: '#9ca3af', success: '#10b981', danger: '#ef4444', black: '#000000', skeleton: '#e5e7eb', primaryBlue: '#2196F3' },
  dark: { text: '#ecf0f1', background: '#121212', tint: '#0A84FF', secondary: '#a1a1aa', border: '#374151', cardBackground: '#1e1e1e', placeholder: '#71717a', success: '#34d399', danger: '#f87171', black: '#000000', skeleton: '#374151', primaryBlue: '#2196F3' },
  white: '#ffffff',
};

// --- Constants ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const safeScreenHeight = screenHeight === 0 ? 1 : screenHeight;
const ASPECT_RATIO = screenWidth / safeScreenHeight;
const LATITUDE_DELTA = 0.0422; // *** USE THIS DEFINED CONSTANT ***
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_LATITUDE = 36.7559;
const INITIAL_LONGITUDE = 5.0842;
const SPACING = 15;
const CARD_SHADOW = { shadowColor: Colors.light.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 4 };

// --- Hardcoded Fallback Region (if dynamic calculation fails) ---
const FALLBACK_REGION = {
    latitude: INITIAL_LATITUDE,
    longitude: INITIAL_LONGITUDE,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};


// --- Inline Mock Data for Map (Items with Coordinates) ---
// (mapMockData remains the same)
const mapMockData = [
    { id: 'attr1', type: 'attraction', name: 'Gouraya National Park', description: 'Stunning nature, hiking trails & views.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%E1%B4%B0.jpg/800px-Parc_National_de_Gouraya_Bejaia_Alg%C3%A9rie_%E1%B4%B4%E1%B4%B0.jpg', latitude: 36.7600, longitude: 5.0900, tags: ['park', 'nature', 'hiking'] },
    { id: 'attr2', type: 'attraction', name: 'Cap Carbon Lighthouse', description: 'Iconic lighthouse with panoramic sea views.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Cap_Carbon_%28B%C3%A9ja%C3%AFa%29_-_Alg%C3%A9rie.jpg/800px-Cap_Carbon_%28B%C3%A9ja%C3%AFa%29_-_Alg%C3%A9rie.jpg', latitude: 36.785, longitude: 5.105, tags: ['landmark', 'view', 'history'] },
    { id: 'attr3', type: 'attraction', name: 'Place du 1er Novembre (Guidon)', description: 'Main city square, lively atmosphere.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Place_du_1er_Novembre_Bejaia.JPG/1024px-Place_du_1er_Novembre_Bejaia.JPG', latitude: 36.753, longitude: 5.083, tags: ['landmark', 'city', 'square'] },
    { id: 'attr4', type: 'attraction', name: 'Monkey Peak (Pic des Singes)', description: 'Hiking area in Gouraya, spot Barbary macaques.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Parc_National_Gouraya_Alg%C3%A9rie_-_ panoramique.jpg/1024px-Parc_National_Gouraya_Alg%C3%A9rie_-_ panoramique.jpg', latitude: 36.765, longitude: 5.095, tags: ['park', 'nature', 'hiking', 'wildlife'] },
    { id: 'attr5', type: 'attraction', name: 'Casbah of Bejaia', description: 'Wander the narrow streets of the ancient medina.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Casbah_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg/1024px-Casbah_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg', latitude: 36.7580, longitude: 5.0880, tags: ['history', 'culture', 'city'] },
    { id: 'attr6', type: 'attraction', name: 'Musée de Bordj Moussa', description: 'Museum housed in a historic fort.', image: 'https://picsum.photos/seed/bordj_moussa_museum/400/400', latitude: 36.759, longitude: 5.089, tags: ['museum', 'history', 'culture'] },
    { id: 'hotel1', type: 'hotel', name: 'Hotel Royal Bejaia', description: 'Rating: 4.7', image: 'https://picsum.photos/seed/hotel_exterior1/600/400', latitude: 36.7520, longitude: 5.0860, tags: ['hotel', 'stay', 'pool'] },
    { id: 'hotel2', type: 'hotel', name: 'Les Hammadites Hotel', description: 'Rating: 4.3', image: 'https://picsum.photos/seed/hotel_beach_access1/600/400', latitude: 36.7700, longitude: 5.1400, tags: ['hotel', 'stay', 'beach'] },
    { id: 'hotel3', type: 'hotel', name: 'Hotel Cristal Bejaia', description: 'Rating: 4.1', image: 'https://picsum.photos/seed/hotel_cristal/600/400', latitude: 36.754, longitude: 5.085, tags: ['hotel', 'stay', 'city'] },
    { id: 'beach1', type: 'beach', name: 'Les Aiguades Beach', description: 'Clear waters & cliffs.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Les_Aiguades_Bejaia_Algeria.jpg/1024px-Les_Aiguades_Bejaia_Algeria.jpg', latitude: 36.7700, longitude: 5.1400, tags: ['beach', 'nature', 'snorkeling'] },
    { id: 'beach2', type: 'beach', name: 'Sakamody Beach', description: 'Popular spot near the city.', image: 'https://picsum.photos/seed/sakamody_beach/600/400', latitude: 36.7505, longitude: 5.0600, tags: ['beach', 'city', 'restaurant'] },
    { id: 'rest1', type: 'restaurant', name: 'Le Dauphin Bleu', description: 'Seafood with sea views.', latitude: 36.751, longitude: 5.088, tags: ['restaurant', 'food', 'seafood'] }, // Example coordinates
    { id: 'rest2', type: 'restaurant', name: 'La Citadelle Restaurant', description: 'Algerian near Casbah.', latitude: 36.7575, longitude: 5.0875, tags: ['restaurant', 'food', 'algerian'] }, // Example coordinates
].filter(item => typeof item.latitude === 'number' && typeof item.longitude === 'number');


// --- Themed Styles Function ---
// (getThemedMapStyles remains the same)
const getThemedMapStyles = (isDarkMode = false) => {
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const dynamicCardShadow = { ...CARD_SHADOW, shadowColor: colors.black };
  const iconContainerSize = SPACING * 2.2;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    safeArea: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    loadingText: { marginTop: SPACING * 0.8, fontSize: 16, color: colors.secondary },
    map: { ...StyleSheet.absoluteFillObject },

    // Search Bar
    searchBarContainer: { position: 'absolute', top: SPACING, left: SPACING, right: SPACING, zIndex: 10 },
    searchBarInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground, borderRadius: SPACING * 2, paddingHorizontal: SPACING, height: SPACING * 3.5, borderWidth: 1, borderColor: colors.border, ...dynamicCardShadow },
    searchIcon: { marginRight: SPACING * 0.8, color: colors.secondary },
    searchTextInput: { flex: 1, height: '100%', fontSize: 16, color: colors.text },
    clearSearchButton: { padding: SPACING * 0.5, marginLeft: SPACING * 0.4 },

    // Map Control Buttons
    controlsContainer: { position: 'absolute', bottom: SPACING * 1.5, right: SPACING * 1.5, alignItems: 'flex-end' },
    controlButton: { backgroundColor: colors.cardBackground, padding: SPACING * 0.8, borderRadius: SPACING * 2, marginBottom: SPACING, ...dynamicCardShadow },
    mapTypeContainer: { flexDirection: 'row', backgroundColor: colors.cardBackground, borderRadius: SPACING * 0.5, padding: SPACING * 0.3, marginBottom: SPACING, ...dynamicCardShadow },
    mapTypeButton: { paddingVertical: SPACING * 0.4, paddingHorizontal: SPACING * 0.8, borderRadius: SPACING * 0.3 },
    mapTypeButtonActive: { backgroundColor: colors.tint },
    mapTypeButtonText: { color: colors.secondary, fontSize: 12, fontWeight: '600' },
    mapTypeButtonTextActive: { color: Colors.white },

    // Custom Marker Style (iOS only)
    markerIconContainer: { width: iconContainerSize, height: iconContainerSize, borderRadius: iconContainerSize / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint, borderWidth: 1.5, borderColor: Colors.white, overflow: 'hidden', ...dynamicCardShadow },
    markerIconContainerAttraction: { backgroundColor: Colors.light.danger },
    markerIconContainerHotel: { backgroundColor: Colors.light.primaryBlue },
    markerIconContainerBeach: { backgroundColor: Colors.light.tint },
    markerIconContainerRestaurant: { backgroundColor: Colors.light.success },

    // Callout Styles (Improved Layout)
    calloutView: { padding: SPACING, minWidth: 200, maxWidth: 260, backgroundColor: colors.cardBackground, borderRadius: SPACING * 0.8, borderColor: colors.border, borderWidth: 1, ...dynamicCardShadow },
    calloutHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING * 0.6 },
    calloutIcon: { marginRight: SPACING * 0.8, color: colors.secondary },
    calloutTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: colors.text },
    calloutDescription: { fontSize: 13, color: colors.secondary, marginBottom: SPACING * 0.6, marginLeft: SPACING * 0.8 + 18 },
    calloutType: { fontSize: 12, color: colors.secondary, fontStyle: 'italic', textTransform: 'capitalize', marginBottom: SPACING * 0.8, marginLeft: SPACING * 0.8 + 18 },
    calloutActions: { paddingTop: SPACING * 0.4, marginLeft: SPACING * 0.8 + 18 },
    calloutLink: { fontSize: 14, color: colors.tint, fontWeight: '600', paddingVertical: SPACING * 0.3 },
  });
};

// --- Map Screen Component ---
function MapScreen() {
  // Hooks
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = useMemo(() => getThemedMapStyles(isDarkMode), [isDarkMode]);
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  // State
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allMarkersData, setAllMarkersData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [mapType, setMapType] = useState('standard');
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [currentRegion, setCurrentRegion] = useState(null); // Initialize as null

  // --- Dynamic Region Calculation ---
  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    const safeHeight = height === 0 ? 1 : height;
    const aspectRatio = width / safeHeight;
    // *** FIX: Use LATITUDE_DELTA (defined constant) instead of TARGET_LATITUDE_DELTA ***
    const lonDelta = LATITUDE_DELTA * aspectRatio;

    console.log(`MapScreen Dimensions Updated: ${width}x${height}`);
    console.log(`MapScreen Aspect Ratio Updated: ${aspectRatio}`);
    console.log(`MapScreen Deltas Updated: Lat=${LATITUDE_DELTA}, Lon=${lonDelta}`); // Use LATITUDE_DELTA

    // *** FIX: Check LATITUDE_DELTA instead of TARGET_LATITUDE_DELTA ***
    if (isNaN(INITIAL_LATITUDE) || isNaN(INITIAL_LONGITUDE) || isNaN(LATITUDE_DELTA) || isNaN(lonDelta) || lonDelta <= 0) {
        console.warn("Dynamic initial region calculation resulted in invalid values. Using fallback.");
        setCurrentRegion(FALLBACK_REGION);
    } else {
        setCurrentRegion({
            latitude: INITIAL_LATITUDE,
            longitude: INITIAL_LONGITUDE,
            latitudeDelta: LATITUDE_DELTA, // *** FIX: Use LATITUDE_DELTA ***
            longitudeDelta: lonDelta,
        });
    }
  }, []); // Run once on mount


  // --- Data Fetching ---
  const fetchMapData = useCallback(() => {
      console.log("Loading mock map data...");
      setIsLoading(true);
      setTimeout(() => {
          try { setAllMarkersData(mapMockData); console.log(`Loaded ${mapMockData.length} markers.`); }
          catch (error) { console.error("Map data error:", error); Alert.alert("Error", "Could not load points."); setAllMarkersData([]); }
          finally { setIsLoading(false); }
      }, 300);
  }, []);

  // --- Location Permissions & Initial Load ---
  useEffect(() => {
    let isMounted = true;
    (async () => {
        console.log("Requesting location permissions...");
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;
        if (status !== 'granted') { setLocationPermissionGranted(false); Alert.alert('Permission Required', 'Location access needed.'); console.log("Location denied."); }
        else { setLocationPermissionGranted(true); console.log("Location granted.");
            try { console.log("Fetching user location...");
                let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeout: 8000 });
                if (isMounted) { setUserLocation(location.coords); console.log("User location fetched."); }
            } catch (error) { console.error("Location fetch error: ", error); if (isMounted) { Alert.alert('Location Error', 'Could not get current location.'); } }
        }
        fetchMapData();
    })();
    return () => { isMounted = false; };
  }, [fetchMapData]);


  // --- Map Interaction Callbacks ---
  const goToUserLocation = useCallback(() => {
      if (!isMapReady) { console.warn("Map not ready."); Alert.alert("Map Not Ready"); return; }
      if (userLocation && mapRef.current && currentRegion) {
          console.log("Animating to user location...");
          const { width, height } = Dimensions.get('window'); const safeHeight = height === 0 ? 1 : height; const aspectRatio = width / safeHeight;
          // Calculate target longitude delta based on desired latitude delta and current aspect ratio
          const targetLatitudeDelta = 0.01; // Zoom closer
          const targetLonDelta = targetLatitudeDelta * aspectRatio;

          const region = { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: targetLatitudeDelta, longitudeDelta: targetLonDelta };

          if (isNaN(region.latitude) || isNaN(region.longitude) || isNaN(region.latitudeDelta) || isNaN(region.longitudeDelta) || region.longitudeDelta <= 0) {
              console.error("Invalid region calculated for user location:", region); Alert.alert("Error", "Could not calculate region."); return;
          }
          mapRef.current.animateToRegion(region, 1000);
      } else if (!locationPermissionGranted) { Alert.alert('Permission Required', 'Enable location access.'); }
      else { Alert.alert('Location Unavailable', 'Waiting for location...'); }
  }, [userLocation, locationPermissionGranted, isMapReady, currentRegion]);

  const handleCalloutPress = useCallback((marker) => {
       console.log('Callout Details Tapped:', marker.name);
       let screenName = 'AttractionDetail'; let params = { attractionId: marker.id };
       if (marker.type === 'hotel') { screenName = 'HotelDetail'; params = { hotelId: marker.id }; }
       else if (marker.type === 'restaurant') { screenName = 'RestaurantDetail'; params = { restaurantId: marker.id }; }
       try { navigation.navigate(screenName, { ...params, itemData: marker }); }
       catch (e) { console.warn(`Nav Error: ${screenName}`, e); Alert.alert("Navigation Error", `Could not open details.`); }
   }, [navigation]);

  const getDirections = useCallback((marker) => {
        if (!marker.latitude || !marker.longitude) { Alert.alert("Location Unavailable"); return; }
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${marker.latitude},${marker.longitude}`;
        const label = encodeURIComponent(marker.name);
        const url = Platform.select({ ios: `${scheme}${label}@${latLng}`, android: `${scheme}${latLng}(${label})` });
        console.log("Opening directions URL:", url);
        Linking.openURL(url).catch(err => { console.error("Map Link Error:", err); Alert.alert('Error', 'Could not open map app.'); });
    }, []);

  // --- Marker Styling Logic ---
  const getMarkerIcon = (type = 'default') => { switch (type.toLowerCase()) { case 'attraction': return 'star'; case 'hotel': return 'bed'; case 'restaurant': return 'restaurant'; case 'beach': return 'water'; case 'landmark': return 'flag'; case 'history': return 'archive'; case 'park': return 'leaf'; default: return 'location'; } };
  const getMarkerStyle = (type = 'default') => { switch (type.toLowerCase()) { case 'attraction': return styles.markerIconContainerAttraction; case 'hotel': return styles.markerIconContainerHotel; case 'beach': return styles.markerIconContainerBeach; case 'restaurant': return styles.markerIconContainerRestaurant; default: return styles.markerIconContainer; } };
  const getPinColor = (type = 'default') => { switch (type.toLowerCase()) { case 'attraction': return Colors.light.danger; case 'hotel': return Colors.light.primaryBlue; case 'restaurant': return Colors.light.success; case 'beach': return Colors.light.tint; default: return Colors.light.secondary; } };


  // --- Filtering Logic ---
  const filteredMarkers = useMemo(() => {
      if (!mapSearchTerm) { return allMarkersData; }
      const lowerCaseTerm = mapSearchTerm.toLowerCase();
      return allMarkersData.filter(marker =>
          marker.name?.toLowerCase().includes(lowerCaseTerm) ||
          marker.description?.toLowerCase().includes(lowerCaseTerm) ||
          marker.type?.toLowerCase().includes(lowerCaseTerm) ||
          marker.tags?.some(tag => tag.toLowerCase().includes(lowerCaseTerm))
      );
  }, [allMarkersData, mapSearchTerm]);

  // Callback for when the map is actually ready
  const onMapReadyHandler = useCallback(() => { // Renamed to avoid conflict
      console.log("Map is ready.");
      setIsMapReady(true);
  }, []);

  // --- Render Logic ---
  const showLoadingIndicator = (isLoading && allMarkersData.length === 0) || !isMapReady || !currentRegion;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
            <View style={styles.searchBarInner}>
                <Ionicons name="search-outline" size={20} style={styles.searchIcon} />
                <TextInput ref={searchInputRef} style={styles.searchTextInput} placeholder={`Search Bejaia map...`} placeholderTextColor={styles.searchTextInput.color} value={mapSearchTerm} onChangeText={setMapSearchTerm} returnKeyType="search" />
                 {mapSearchTerm.length > 0 && ( <Animated.View entering={FadeIn} exiting={FadeOut}><TouchableOpacity onPress={() => setMapSearchTerm('')} style={styles.clearSearchButton}><Ionicons name="close-circle" size={20} color={styles.searchIcon.color} /></TouchableOpacity></Animated.View> )}
            </View>
        </View>

        {/* Map View - Render only when currentRegion is calculated */}
        {currentRegion ? (
            <MapView
                ref={mapRef}
                style={styles.map}
                mapType={mapType}
                initialRegion={currentRegion} // Use calculated or fallback region
                showsUserLocation={locationPermissionGranted}
                showsMyLocationButton={false}
                showsPointsOfInterest={false}
                showsCompass={true}
                onMapReady={onMapReadyHandler} // Use the handler
            >
                {/* Render filtered markers directly */}
                {filteredMarkers.map((marker) => (
                <Marker
                    key={marker.id}
                    coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                    pinColor={Platform.OS === 'android' ? getPinColor(marker.type) : undefined}
                    tracksViewChanges={false} // Keep false for performance
                >
                    {/* --- Custom Marker Icon for iOS --- */}
                    {Platform.OS === 'ios' && (
                        <View style={[styles.markerIconContainer, getMarkerStyle(marker.type)]}>
                            <Ionicons name={getMarkerIcon(marker.type)} size={18} color={Colors.white} />
                        </View>
                    )}
                    {/* --- Custom Callout (Common to both platforms) --- */}
                    <Callout tooltip={false} /* onPress removed */ >
                        <View style={styles.calloutView}>
                            <View style={styles.calloutHeader}>
                                <Ionicons name={getMarkerIcon(marker.type)} size={18} style={styles.calloutIcon} />
                                <Text style={styles.calloutTitle}>{marker.name}</Text>
                            </View>
                            {marker.description && <Text style={styles.calloutDescription} numberOfLines={2}>{marker.description}</Text>}
                            <Text style={styles.calloutType}>{marker.type}</Text>
                            <View style={styles.calloutActions}>
                                <TouchableOpacity onPress={() => handleCalloutPress(marker)}>
                                    <Text style={styles.calloutLink}>View Details</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => getDirections(marker)} style={{marginTop: SPACING * 0.5}}>
                                    <Text style={styles.calloutLink}>Get Directions</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Callout>
                </Marker>
                ))}
            </MapView>
        ) : (
             // Show loading or error if region calculation failed permanently (unlikely with fallback)
             <View style={styles.centered}><ActivityIndicator size="large" color={styles.loadingText.color} /><Text style={styles.loadingText}>Initializing map region...</Text></View>
        )}


        {/* Map Controls - Render only when map is ready */}
        {isMapReady && (
            <View style={styles.controlsContainer}>
                <View style={styles.mapTypeContainer}>
                    {['standard', 'satellite', 'hybrid'].map(type => { const isActive = mapType === type;
                        return ( <TouchableOpacity key={type} style={[styles.mapTypeButton, isActive && styles.mapTypeButtonActive]} onPress={() => setMapType(type)}>
                                <Text style={[styles.mapTypeButtonText, isActive && styles.mapTypeButtonTextActive]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                            </TouchableOpacity> )
                    })}
                </View>
                {locationPermissionGranted && (
                   <TouchableOpacity style={styles.controlButton} onPress={goToUserLocation} accessibilityLabel="Center map on my location">
                       <Ionicons name="locate-outline" size={26} color={styles.loadingText.color} />
                   </TouchableOpacity>
                )}
            </View>
        )}

        {/* Loading Indicator Overlay */}
        {showLoadingIndicator && (
             <View style={[StyleSheet.absoluteFill, styles.centered, {backgroundColor: 'rgba(0,0,0,0.3)'}]}>
                <ActivityIndicator size="large" color={Colors.white} />
                <Text style={[styles.loadingText, {color: Colors.white}]}>Loading...</Text>
            </View>
        )}

      </View>
    </SafeAreaView>
  );
}

export default MapScreen;
