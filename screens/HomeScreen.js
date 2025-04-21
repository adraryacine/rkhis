// screens/HomeScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  Linking,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  ScrollView, // Import ScrollView if using Animated.ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = screenHeight * 0.38;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 115 : 105;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// --- Image URLs (URLs mises à jour pour Bejaia City et Place Nov) ---
// Gardez à l'esprit que la meilleure solution est d'avoir les images localement !
const headerImageUrl = 'https://images.unsplash.com/photo-1593468663047-3a188a3bc489?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
// *** URL MISE À JOUR - Bejaia Port ***
const bejaiaCityImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg/1280px-Port_de_B%C3%A9ja%C3%AFa_-_Alg%C3%A9rie.jpg';
const aokasBeachImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Plage_d%27Aokas.jpg/1280px-Plage_d%27Aokas.jpg';
const tichyCornicheImageUrl = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/29/25/63/hotel-les-hammadites.jpg?w=1200&h=-1&s=1';
const capCarbonImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Phare_du_Cap_Carbon.jpg/1024px-Phare_du_Cap_Carbon.jpg';
const gourayaImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Parc_National_de_Gouraya_Bejaia_Algerie_%E1%B4%B4%E1%B4%B0.jpg/1024px-Parc_National_de_Gouraya_Bejaia_Algerie_%E1%B4%B4%E1%B4%B0.jpg';
const monkeyPeakImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Barbary_macaque_on_Monkey_Mountain.jpg/1024px-Barbary_macaque_on_Monkey_Mountain.jpg';
// *** URL MISE À JOUR - Place du 1er Novembre ***
const placeNovImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Place_du_1er_Novembre_Bejaia.jpg/1024px-Place_du_1er_Novembre_Bejaia.jpg';
const briseDeMerImageUrl = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/92/d5/83/plage-de-boulimat.jpg?w=1200&h=-1&s=1';
const casbahImageUrl = 'https://live.staticflickr.com/65535/51260998338_a1974185c1_b.jpg';
const restaurant1ImageUrl = 'https://media-cdn.tripadvisor.com/media/photo-s/0f/3c/93/48/le-dauphin-bleu.jpg';
const restaurant2ImageUrl = 'https://media-cdn.tripadvisor.com/media/photo-s/0a/01/9e/8a/restaurant-el-djenina.jpg';
const restaurant3ImageUrl = 'https://media-cdn.tripadvisor.com/media/photo-s/13/6c/a4/95/la-voile-d-or.jpg';
const restaurant4ImageUrl = 'https://media-cdn.tripadvisor.com/media/photo-f/05/e3/7e/5a/pizzeria-venezia.jpg';
const hotel1ImageUrl = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/1a/9b/0d/hotel-exterior.jpg?w=1200&h=-1&s=1';
const hotel2ImageUrl = 'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/296065364.jpg?k=f8b5c3e0b2a2a625f1a6d6a17907c6a1e2c4c4a5a4f3a1c6f9e7b8d0a6b1c3d4&o=';
const hotel3ImageUrl = 'https://le-cristal-hotel-bejaia.booked.net/data/Photos/OriginalPhoto/11874/1187419/1187419507/Le-Cristal-Hotel-Bejaia-Exterior.JPEG';
// Les placeholders sont moins fiables mais gardés car fournis initialement
const event1ImageUrl = 'https://via.placeholder.com/160x110/8A2BE2/FFFFFF?text=Theatre+Fest';
const event2ImageUrl = 'https://via.placeholder.com/160x110/DEB887/FFFFFF?text=Artisan+Fair';
const event3ImageUrl = 'https://via.placeholder.com/160x110/5F9EA0/FFFFFF?text=Music+Night';
const event4ImageUrl = 'https://via.placeholder.com/160x110/228B22/FFFFFF?text=Olive+Harvest';

// --- Placeholder Data (Structure sans les sections supprimées) ---
const initialData = {
  featuredDestinations: [
    { id: 'dest1', name: 'Bejaia City Exploration', image: bejaiaCityImageUrl, description: 'Historic port & vibrant center' },
    { id: 'dest2', name: 'Aokas Golden Sands', image: aokasBeachImageUrl, description: 'Relax on the stunning coastline' },
    { id: 'dest3', name: 'Tichy Seaside Promenade', image: tichyCornicheImageUrl, description: 'Enjoy cafes and sea views' },
    { id: 'dest4', name: 'Majestic Cap Carbon', image: capCarbonImageUrl, description: 'Iconic lighthouse & panoramas' },
  ],
  upcomingEvents: [
    { id: 'event1', name: 'Festival International de Théâtre', date: 'Oct 2024', location: 'Theatre Regional', image: event1ImageUrl },
    { id: 'event2', name: 'Artisan Fair - Aokas', date: 'Sept 15-17, 2024', location: 'Aokas Corniche', image: event2ImageUrl },
    { id: 'event3', name: 'Andalusian Music Evening', date: 'Sept 22, 2024', location: 'Maison de la Culture', image: event3ImageUrl },
    { id: 'event4', name: 'Olive Harvest Celebration', date: 'Nov 2024', location: 'Nearby Villages', image: event4ImageUrl },
  ],
  topRatedRestaurants: [
    { id: 'rest1', name: 'Le Dauphin Bleu', rating: 4.8, cuisine: 'Seafood, Mediterranean', image: restaurant1ImageUrl, priceRange: '$$$' },
    { id: 'rest2', name: 'Restaurant El Djenina', rating: 4.6, cuisine: 'Algerian, Grills', image: restaurant2ImageUrl, priceRange: '$$' },
    { id: 'rest3', name: 'La Voile d\'Or', rating: 4.5, cuisine: 'Italian, Pizza', image: restaurant3ImageUrl, priceRange: '$$' },
    { id: 'rest4', name: 'Pizzeria Venezia', rating: 4.4, cuisine: 'Pizza, Fast Food', image: restaurant4ImageUrl, priceRange: '$' },
  ],
  recommendedHotels: [
    { id: 'hotel1', name: 'Hotel Royal Bejaia', price: '~$140', rating: 4.7, image: hotel1ImageUrl, amenities: ['Pool', 'Spa', 'Restaurant'] },
    { id: 'hotel2', name: 'Hotel Zedek', price: '~$110', rating: 4.3, image: hotel2ImageUrl, amenities: ['Restaurant', 'Free WiFi'] },
    { id: 'hotel3', name: 'Le Cristal Hotel', price: '~$130', rating: 4.5, image: hotel3ImageUrl, amenities: ['Beachfront', 'Restaurant'] },
    { id: 'hotel4', name: 'Hotel Les Hammadites (Tichy)', price: '~$160', rating: 4.6, image: tichyCornicheImageUrl, amenities: ['Private Beach', 'Pool', 'Tennis'] },
  ],
  popularAttractions: [
    { id: 'attr1', name: 'Gouraya Park', description: 'Nature & Views', image: gourayaImageUrl },
    { id: 'attr2', name: 'Monkey Peak', description: 'Wildlife Encounter', image: monkeyPeakImageUrl },
    { id: 'attr3', name: '1er Novembre Sq.', description: 'City Heart', image: placeNovImageUrl }, // Utilise URL mise à jour
    { id: 'attr4', name: 'Brise de Mer', description: 'City Beach', image: briseDeMerImageUrl },
    { id: 'attr5', name: 'Casbah', description: 'Old City Charm', image: casbahImageUrl },
    { id: 'attr6', name: 'Cap Carbon', description: 'Lighthouse Views', image: capCarbonImageUrl },
  ],
  // newArrivals: [ ... ] // SUPPRIMÉ
  localCulture: [
    { id: 'cult1', title: 'Kabyle Heritage', description: 'Explore the unique Berber traditions, language (Taqbaylit), and vibrant music of the region.' },
    { id: 'cult2', title: 'Andalusian Influence', description: 'Discover the historical connection reflected in architecture, music, and cuisine.' },
    { id: 'cult3', title: 'Local Festivals & Moussems', description: 'Experience vibrant seasonal celebrations and traditional gatherings.' },
  ],
  historicalSites: [
    { id: 'hist1', name: 'Casbah of Bejaia', description: 'Wander the narrow streets of the ancient fortified city.' },
    { id: 'hist2', name: 'Bab El Bahr (Sea Gate)', description: 'Historic gate offering sea views and photo opportunities.' },
    { id: 'hist3', name: 'Fort Gouraya', description: 'Remnants of a Spanish fort with breathtaking city panoramas.' },
    { id: 'hist4', name: 'Fibonacci Plaque', description: 'Commemorating Leonardo Fibonacci\'s influential time in Bejaia.' },
  ],
  beachesCoastal: [
    { id: 'beach1', name: 'Les Aiguades', description: 'Known for clear turquoise water, dramatic cliffs, and snorkeling.' },
    { id: 'beach2', name: 'Sakamody Beach', description: 'A more secluded cove ideal for relaxation and quiet swims.' },
    { id: 'beach3', name: 'Boulimat Beach', description: 'Popular family-friendly beach west of Bejaia with amenities.' },
  ],
  outdoorActivities: [
    { id: 'out1', name: 'Hiking', icon: 'walk-outline' },
    { id: 'out2', name: 'Swimming', icon: 'water-outline' },
    { id: 'out3', name: 'Snorkeling', icon: 'glasses-outline' },
    { id: 'out4', name: 'Photography', icon: 'camera-outline' },
    { id: 'out5', name: 'Bird Watching', icon: 'search-circle-outline'},
  ],
  // localCuisine: [ ... ] // SUPPRIMÉ
  // shoppingSouvenirs: [ ... ] // SUPPRIMÉ
  transportationInfo: [
    { id: 'trans1', type: 'City Buses (ETUB)', details: 'Affordable network, check routes beforehand.', icon: 'bus-outline' },
    { id: 'trans2', type: 'Taxis (Petit & Grand)', details: 'Plentiful, agree on fares, especially for longer trips.', icon: 'car-sport-outline' },
    { id: 'trans3', type: 'Airport (BJA)', details: 'Soummam–Abane Ramdane Airport, taxis available.', icon: 'airplane-outline' },
    { id: 'trans4', name: 'Port Connections', details: 'Check ferry schedules for national/international routes.', icon: 'boat-outline' },
  ],
  emergencyContacts: [
    { id: 'police', name: 'Police', number: '17', icon: 'shield-checkmark-outline' },
    { id: 'ambulance', name: 'SAMU', number: '14', icon: 'pulse-outline' },
    { id: 'fire', name: 'Protection Civile', number: '14', icon: 'flame-outline' },
    { id: 'hospital', name: 'CHU Bejaia', number: '03411XXXX', icon: 'git-network-outline' }, // Remplacer par le vrai numéro
  ],
};


// --- Helper Components (Complets) ---
const SectionHeader = ({ title, style, animatedStyle, rightActionLabel, onRightActionPress }) => (
  <Animated.View style={[styles.sectionHeaderContainer, animatedStyle]}>
    <Text style={[styles.sectionTitle, style]}>{title}</Text>
    {rightActionLabel && onRightActionPress && (
        <TouchableOpacity onPress={onRightActionPress} style={styles.sectionHeaderAction}>
            <Text style={styles.sectionHeaderActionText}>{rightActionLabel}</Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#00796B" />
        </TouchableOpacity>
    )}
  </Animated.View>
);

const StyledCard = ({ children, style, onPress, animatedStyle, accessibilityLabel }) => {
    const scale = useSharedValue(1);
    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    const handlePressIn = () => { scale.value = withTiming(0.97, { duration: 120 }); };
    const handlePressOut = () => { scale.value = withTiming(1, { duration: 180 }); };

    return (
        <Animated.View style={[styles.cardBase, style, animatedStyle, cardAnimatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                accessibilityLabel={accessibilityLabel}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};

const AnimatedListItem = ({ children, index, delayMultiplier = 60, initialOffset = 40, duration = 500, rotate = false }) => {
    const translateY = useSharedValue(initialOffset);
    const opacity = useSharedValue(0);
    const rotation = useSharedValue(rotate ? -5 : 0);
    useEffect(() => {
        translateY.value = withDelay(index * delayMultiplier, withTiming(0, { duration }));
        opacity.value = withDelay(index * delayMultiplier, withTiming(1, { duration }));
        if (rotate) {
            rotation.value = withDelay(index * delayMultiplier, withTiming(0, { duration }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const animatedStyle = useAnimatedStyle(() => {
        const transform = [{ translateY: translateY.value }];
        if (rotate) {
            transform.push({ rotate: `${rotation.value}deg` });
        }
        return {
            opacity: opacity.value,
            transform: transform,
        };
    });
    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const LoadingIndicator = ({ size = 'large', color = '#00796B' }) => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size={size} color={color} />
        <Text style={styles.loadingText}>Loading Bejaia's Best...</Text>
    </View>
);


// --- HomeScreen Component (Complet avec Hooks et Logique) ---
function HomeScreen({ navigation }) {
  // --- State & Hooks (Tous définis au top level) ---
  const scrollY = useSharedValue(0);
  const [appData, setAppData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation] = useState('Bejaia');
  const [greeting, setGreeting] = useState('Welcome!');
  const [weather, setWeather] = useState('Weather...'); // Placeholder

  // --- Effects ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning!');
    else if (hour < 18) setGreeting('Good Afternoon!');
    else setGreeting('Good Evening!');
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      // Simule un temps de chargement - remplacez par vos appels API réels
      await new Promise(resolve => setTimeout(resolve, 1500));
      setWeather('28°C, Clear Skies'); // Mettez à jour avec de vraies données si possible
      setAppData(initialData); // Charge les données complètes (sans les sections supprimées)
      setIsLoading(false);
    };
    fetchAllData();
  }, []);

  // --- Animations (Définies au top level) ---
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE], [0, -HEADER_SCROLL_DISTANCE], Extrapolate.CLAMP);
    return { transform: [{ translateY }] };
  });

  const headerContentAnimatedStyle = useAnimatedStyle(() => {
       const opacity = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE * 0.6], [1, 0], Extrapolate.CLAMP);
       const translateY = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE * 0.5], [0, 30], Extrapolate.CLAMP);
       return { opacity, transform: [{ translateY }] };
  });

  const headerImageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-HEADER_MAX_HEIGHT, 0], [1.6, 1], Extrapolate.CLAMP); // Effet Parallax/Zoom
    const translateY = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE],[0, HEADER_SCROLL_DISTANCE * 0.6], Extrapolate.CLAMP); // Effet Parallax vertical
    return { transform: [{ translateY }, { scale }] };
  });

  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const targetY = -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) + (Platform.OS === 'ios' ? 50 : 40);
    const translateY = interpolate( scrollY.value, [HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE], [0, targetY], Extrapolate.CLAMP);
    const finalTranslateY = scrollY.value >= HEADER_SCROLL_DISTANCE ? targetY : translateY;
    const zIndex = scrollY.value >= HEADER_SCROLL_DISTANCE ? 15 : 5; // Pour passer au-dessus du header
    return { transform: [{ translateY: finalTranslateY }], zIndex };
  });

  const firstSectionHeaderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 50], [0, 1], Extrapolate.CLAMP) // Fade-in simple
  }));

  // --- Render Helper Functions (useCallback pour optimisation potentielle) ---
  const renderDestinationCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={90} rotate={true}>
        <StyledCard style={styles.destinationCard} onPress={() => console.log('Navigate to Destination:', item.name)} accessibilityLabel={`View details for ${item.name}`}>
            {/* Utilise item.image qui vient de initialData (avec URLs mises à jour) */}
            <ImageBackground source={{ uri: item.image }} style={styles.destinationImage} resizeMode="cover">
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']} style={styles.destinationGradient} />
                <View style={styles.destinationTextContainer}>
                    <Text style={styles.destinationName}>{item.name}</Text>
                    <Text style={styles.destinationDescription}>{item.description}</Text>
                </View>
            </ImageBackground>
        </StyledCard>
    </AnimatedListItem>
  ), []);

  const renderHotelCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={70}>
      <StyledCard style={styles.hotelCard} onPress={() => console.log('Navigate to Hotel:', item.name)} accessibilityLabel={`View details for ${item.name}`}>
        <Image source={{ uri: item.image }} style={styles.hotelImage} resizeMode="cover" />
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={15} color="#FFC107" />
            <Text style={styles.hotelRating}>{item.rating}</Text>
          </View>
          <Text style={styles.hotelPrice}>{item.price}/night</Text>
          {item.amenities && <Text style={styles.hotelAmenities} numberOfLines={1}>{item.amenities.join(' • ')}</Text>}
        </View>
      </StyledCard>
    </AnimatedListItem>
  ), []);

  const renderEventCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={75}>
      <StyledCard style={styles.eventCard} onPress={() => console.log('Navigate to Event:', item.name)} accessibilityLabel={`View event details for ${item.name}`}>
        <Image source={{ uri: item.image }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.eventDateLocation}>{item.date}</Text>
          <View style={styles.eventLocationContainer}><Ionicons name="location-outline" size={12} color="#666" /><Text style={styles.eventDateLocation}> {item.location}</Text></View>
        </View>
      </StyledCard>
    </AnimatedListItem>
  ), []);

  const renderRestaurantCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={80} rotate={true}>
      <StyledCard style={styles.restaurantCard} onPress={() => console.log('Navigate to Restaurant:', item.name)} accessibilityLabel={`View details for ${item.name}`}>
        <ImageBackground source={{ uri: item.image }} style={styles.restaurantImage} resizeMode="cover">
          <LinearGradient colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.6)']} style={styles.restaurantGradient} />
        </ImageBackground>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.restaurantCuisine}>{item.cuisine} • {item.priceRange}</Text>
          <View style={styles.ratingContainer}><Ionicons name="star" size={16} color="#FFC107" /><Text style={styles.restaurantRating}>{item.rating}</Text></View>
        </View>
      </StyledCard>
    </AnimatedListItem>
  ), []);

 const renderAttractionCard = useCallback(({ item, index }) => (
    <AnimatedListItem index={index} delayMultiplier={50}>
        <StyledCard style={styles.attractionCard} onPress={() => console.log('Navigate to Attraction:', item.name)} accessibilityLabel={`View details for ${item.name}`}>
            <Image source={{ uri: item.image }} style={styles.attractionImage} />
            <Text style={styles.attractionName}>{item.name}</Text>
            <Text style={styles.attractionDescription} numberOfLines={1}>{item.description}</Text>
        </StyledCard>
    </AnimatedListItem>
), []);

 // renderNewArrivalCard // SUPPRIMÉ

 // renderCuisineCard // SUPPRIMÉ

 const renderOutdoorActivity = useCallback((item, index) => (
    <AnimatedListItem key={item.id} index={index} delayMultiplier={60}>
        <TouchableOpacity style={styles.outdoorActivityButton} onPress={() => console.log('Explore:', item.name)} activeOpacity={0.7} accessibilityLabel={`Explore ${item.name} activities`}>
            {/* Utilise item.icon qui vient de initialData (icônes corrigées) */}
            <Ionicons name={item.icon} size={34} color="#00796B" />
            <Text style={styles.outdoorActivityName}>{item.name}</Text>
        </TouchableOpacity>
    </AnimatedListItem>
), []);

 // renderShoppingItem // SUPPRIMÉ

const renderTransportInfo = useCallback((item, index) => (
    <AnimatedListItem key={item.id} index={index} delayMultiplier={50}>
        <View style={styles.transportItem}>
            <Ionicons name={item.icon} size={28} color="#1565C0" style={styles.transportIcon} />
            <View style={styles.transportTextContainer}>
                 <Text style={styles.transportType}>{item.type}</Text>
                 <Text style={styles.transportDetails}>{item.details}</Text>
            </View>
        </View>
    </AnimatedListItem>
), []);

  const renderEmergencyContact = useCallback((item, index) => (
    <AnimatedListItem key={item.id} index={index} delayMultiplier={50}>
      <TouchableOpacity style={styles.emergencyContactButton} onPress={() => Linking.openURL(`tel:${item.number}`)} activeOpacity={0.7} accessibilityLabel={`Call ${item.name} at ${item.number}`}>
        <Ionicons name={item.icon} size={32} color="#C62828" />
        <View style={styles.emergencyContactInfo}>
          <Text style={styles.emergencyContactName}>{item.name}</Text>
          <Text style={styles.emergencyContactNumber}>{item.number}</Text>
        </View>
         <Ionicons name="call-outline" size={24} color="#C62828" />
      </TouchableOpacity>
    </AnimatedListItem>
  ), []);

  // --- Main Return JSX (Complet) ---
  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (!appData) {
      return <View style={styles.loadingContainer}><Text>Failed to load data.</Text></View>;
  }

  return (
    <View style={styles.screenContainer}>
       <StatusBar barStyle="light-content" />

      {/* --- Animated Header Background --- */}
      <Animated.View style={[styles.headerBackgroundContainer, headerAnimatedStyle]}>
        <ImageBackground source={{ uri: headerImageUrl }} style={styles.headerImageBackground} resizeMode="cover">
            {/* L'overlay est animé avec l'image */}
            <Animated.View style={[styles.headerImageOverlay, headerImageAnimatedStyle]} />
            {/* Le contenu textuel est animé séparément */}
            <Animated.View style={[styles.headerTextContent, headerContentAnimatedStyle]}>
                <Text style={styles.greetingText}>{greeting}</Text>
                <Text style={styles.locationText}>{userLocation}</Text>
                <Text style={styles.weatherText}>{weather}</Text>
            </Animated.View>
        </ImageBackground>
      </Animated.View>

       {/* --- Animated Search Bar --- */}
        <Animated.View style={[styles.searchBarOuterContainer, searchBarAnimatedStyle]}>
            <View style={styles.searchBarInnerContainer}>
                <Ionicons name="search-outline" size={22} color="#555" style={styles.searchIcon} />
                <TextInput style={styles.searchBar} placeholder={`Explore ${userLocation}...`} placeholderTextColor="#777" />
                <TouchableOpacity style={styles.searchFilterButton} accessibilityLabel="Filter search results">
                     <Ionicons name="options-outline" size={24} color="#00796B" />
                </TouchableOpacity>
            </View>
        </Animated.View>

      {/* --- Scrollable Content --- */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16} // Important pour la fluidité des animations au scroll
      >
        {/* Spacer pour compenser la hauteur du header */}
        <View style={{ height: HEADER_MAX_HEIGHT }} />

        {/* --- Sections Rendered Using appData --- */}

        {/* Section "Highlights & What's New" SUPPRIMÉE */}
        {/* <SectionHeader title="Highlights & What's New" animatedStyle={firstSectionHeaderAnimatedStyle} /> */}
        {/* <FlatList data={appData.newArrivals} ... /> */}

        {/* La première section visible commence ici */}
        <SectionHeader title="Iconic Locations" rightActionLabel="See All" onRightActionPress={() => console.log("Navigate to All Destinations")} animatedStyle={firstSectionHeaderAnimatedStyle} />
        <FlatList data={appData.featuredDestinations} keyExtractor={(item) => item.id} renderItem={renderDestinationCard} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListPadding} snapToInterval={screenWidth * 0.88 + 20} decelerationRate="fast" />

        <SectionHeader title="Comfortable Stays" rightActionLabel="View Hotels" onRightActionPress={() => navigation.navigate('Hotels')} />
        <FlatList data={appData.recommendedHotels} keyExtractor={(item) => item.id} renderItem={renderHotelCard} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListPadding} />

        <SectionHeader title="Upcoming Events" rightActionLabel="Calendar" onRightActionPress={() => console.log("Navigate to Events Calendar")} />
         <FlatList data={appData.upcomingEvents} keyExtractor={(item) => item.id} renderItem={renderEventCard} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListPadding} />

        <SectionHeader title="Top Rated Eats" rightActionLabel="Find Food" onRightActionPress={() => console.log("Navigate to Restaurants")} />
        <FlatList data={appData.topRatedRestaurants} keyExtractor={(item) => item.id} renderItem={renderRestaurantCard} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListPadding} />

        <SectionHeader title="Must-See Attractions" />
        <FlatList data={appData.popularAttractions} keyExtractor={(item) => item.id} renderItem={renderAttractionCard} horizontal={false} numColumns={2} showsVerticalScrollIndicator={false} scrollEnabled={false} columnWrapperStyle={styles.attractionGridColumn} contentContainerStyle={styles.attractionGridContainer} />

        {/* Section "Taste Local Specialties" SUPPRIMÉE */}
        {/* <SectionHeader title="Taste Local Specialties" /> */}
        {/* <FlatList data={appData.localCuisine} ... /> */}

        <SectionHeader title="Get Active Outdoors" />
        <View style={styles.outdoorActivitiesRow}>{appData.outdoorActivities.map((item, index) => renderOutdoorActivity(item, index))}</View>

         {/* --- Info Sections Card --- */}
         <AnimatedListItem index={0} delayMultiplier={100} initialOffset={50}>
            <StyledCard style={styles.infoSectionCard} accessibilityLabel="Information about local culture, history, and beaches">
                <View style={styles.infoSubSection}>
                    <View style={styles.infoIconTitle}><Ionicons name="earth-outline" size={26} color="#004D40" /><Text style={[styles.infoCardTitle, {color: '#004D40'}]}>Culture & Traditions</Text></View>
                     {appData.localCulture.map((item) => <Text key={item.id} style={styles.infoCardText}> • {item.description}</Text>)}
                </View>
                 <View style={styles.infoSubSection}>
                     <View style={styles.infoIconTitle}><Ionicons name="hourglass-outline" size={26} color="#BF360C" /><Text style={[styles.infoCardTitle, {color: '#BF360C'}]}>Historical Sites</Text></View>
                     {appData.historicalSites.map((item) => <Text key={item.id} style={styles.infoCardText}> • {item.name}</Text>)}
                 </View>
                  <View style={styles.infoSubSectionNoBorder}>
                     <View style={styles.infoIconTitle}><Ionicons name="water-outline" size={26} color="#01579B" /><Text style={[styles.infoCardTitle, {color: '#01579B'}]}>Beaches & Coastline</Text></View>
                     {appData.beachesCoastal.map((item) => <Text key={item.id} style={styles.infoCardText}> • {item.name}</Text>)}
                 </View>
            </StyledCard>
         </AnimatedListItem>

        {/* Section "Shopping & Souvenirs" SUPPRIMÉE */}
        {/* <SectionHeader title="Shopping & Souvenirs" /> */}
        {/* <View style={styles.shoppingContainer}>{appData.shoppingSouvenirs.map(...)}</View> */}

        <SectionHeader title="Getting Around Bejaia" />
        <View style={styles.transportContainer}>{appData.transportationInfo.map((item, index) => renderTransportInfo(item, index))}</View>

        <SectionHeader title="Important Contacts" />
        <View style={styles.emergencyContactsContainer}>{appData.emergencyContacts.map((item, index) => renderEmergencyContact(item, index))}</View>

        {/* Espaceur final pour éviter que le dernier élément colle au TabNavigator */}
        <View style={styles.footerSpacer} />

      </Animated.ScrollView>
    </View>
  );
}

// --- Styles (Sans les styles des sections supprimées) ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
   scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    paddingBottom: 80,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E0F7FA',
  },
  loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: '#00796B',
      fontWeight: '500',
  },
  // --- Header Styles ---
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#B2EBF2',
    zIndex: 1,
  },
  headerImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  headerImageOverlay: {
       ...StyleSheet.absoluteFillObject,
       backgroundColor: 'rgba(0, 47, 75, 0.45)',
   },
  headerTextContent: {
      paddingHorizontal: 25,
      paddingBottom: 30,
      zIndex: 3,
  },
  greetingText: {
      fontSize: 34,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
      marginBottom: 5,
  },
  locationText: {
       fontSize: 19,
       fontWeight: '500',
       color: '#E1F5FE',
       textShadowColor: 'rgba(0, 0, 0, 0.4)',
       textShadowOffset: { width: 1, height: 1 },
       textShadowRadius: 3,
       marginBottom: 8,
  },
   weatherText: {
      fontSize: 17,
      fontWeight: '500',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
  },
   // --- Search Bar Styles ---
   searchBarOuterContainer: {
        position: 'absolute',
        top: HEADER_MAX_HEIGHT - 45,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        // zIndex géré par animation
   },
   searchBarInnerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingLeft: 18,
        paddingRight: 10,
        height: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 6,
   },
   searchIcon: {
        marginRight: 14,
   },
   searchBar: {
        flex: 1,
        height: '100%',
        fontSize: 17,
        color: '#1a1a1a',
   },
    searchFilterButton: {
        padding: 10,
        marginLeft: 6,
    },
   // --- General Section Styles ---
  sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 40,
      marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003D33',
  },
  sectionHeaderAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
  },
  sectionHeaderActionText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#00796B',
      marginRight: 4,
  },
  horizontalListPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 5,
  },
  verticalListContainer: {
      marginHorizontal: 0,
      paddingTop: 5,
      marginBottom: 15,
  },
   // --- Card Base Styles ---
    cardBase: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#546E7A',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    },
  // --- Destination Card Styles ---
  destinationCard: {
    width: screenWidth * 0.88,
    height: 260,
    marginRight: 20,
  },
  destinationImage: {
      flex: 1,
      borderRadius: 20,
      justifyContent: 'flex-end',
      overflow: 'hidden',
  },
  destinationGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '65%',
  },
  destinationTextContainer: {
      padding: 22,
      zIndex: 1,
  },
  destinationName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 5,
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
  },
  destinationDescription: {
      fontSize: 15,
      color: '#F5F5F5',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
  },
  // --- Hotel Card Styles ---
  hotelCard: {
      width: 280,
      marginRight: 20,
  },
  hotelImage: {
      width: '100%',
      height: 165,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
  },
  hotelInfo: {
      padding: 18,
  },
  hotelName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginBottom: 6,
  },
  ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
  },
  hotelRating: {
      fontSize: 15,
      color: '#555',
      marginLeft: 5,
      fontWeight: '500',
  },
  hotelPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#00796B',
      marginBottom: 8,
  },
  hotelAmenities: {
      fontSize: 13,
      color: '#607D8B',
  },
  // --- Event Card Styles ---
  eventCard: {
      width: 220,
      marginRight: 20,
   },
  eventImage: {
      width: '100%',
      height: 120,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
  },
  eventInfo: {
      padding: 14,
  },
  eventName: {
      fontSize: 17,
      fontWeight: '600',
      color: '#333',
      lineHeight: 22,
      marginBottom: 6,
      minHeight: 44,
  },
  eventDateLocation: {
      fontSize: 14,
      color: '#555',
      marginBottom: 4,
  },
  eventLocationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
  },
  // --- Restaurant Card Styles ---
  restaurantCard: {
      width: screenWidth * 0.8,
      marginRight: 20,
  },
  restaurantImage: {
      width: '100%',
      height: 180,
      justifyContent: 'flex-end',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
  },
  restaurantGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '50%',
  },
  restaurantInfo: {
      padding: 18,
  },
  restaurantName: {
      fontSize: 20,
      fontWeight: '600',
      color: '#333',
      marginBottom: 6,
  },
  restaurantCuisine: {
      fontSize: 15,
      color: '#555',
      marginBottom: 8,
  },
 // --- Attraction Card Styles (Grid) ---
  attractionGridContainer: {
      paddingHorizontal: 18,
      paddingTop: 10,
  },
  attractionGridColumn: {
      justifyContent: 'space-between',
      marginBottom: 20,
  },
  attractionCard: {
     width: (screenWidth - 56) / 2,
  },
  attractionImage: {
      height: 130,
      width: '100%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
  },
  attractionName: {
      fontSize: 17,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 5,
      marginHorizontal: 12,
      color: '#333',
  },
  attractionDescription: {
      fontSize: 13,
      color: '#666',
      paddingHorizontal: 12,
      paddingBottom: 12,
  },
   // --- New Arrival Card Styles --- SUPPRIMÉS
   // --- Cuisine Card Styles --- SUPPRIMÉS
   // --- Outdoor Activities Styles ---
  outdoorActivitiesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginHorizontal: 18,
      marginBottom: 35,
      marginTop: 15,
  },
  outdoorActivityButton: {
      alignItems: 'center',
      paddingVertical: 18,
      paddingHorizontal: 12,
      minWidth: 95,
      marginBottom: 15,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: '#B2DFDB',
      backgroundColor: '#FFFFFF',
      shadowColor: '#546E7A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  outdoorActivityName: {
      fontSize: 14,
      fontWeight: '500',
      color: '#00796B',
      marginTop: 10,
      textAlign: 'center',
  },
 // --- Info Section Styles ---
  infoSectionCard: {
      marginHorizontal: 20,
      marginBottom: 35,
      padding: 25,
      borderRadius: 22,
  },
  infoSubSection: {
      marginBottom: 22,
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: '#ECEFF1',
  },
  infoSubSectionNoBorder: {
      marginBottom: 0,
      paddingBottom: 0,
  },
  infoIconTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  infoCardTitle: {
      fontSize: 19,
      fontWeight: 'bold',
      marginLeft: 12,
      // La couleur est maintenant appliquée inline dans le JSX pour correspondre à l'icône
  },
  infoCardText: {
      fontSize: 16,
      lineHeight: 24,
      color: '#455A64',
      marginLeft: 8,
      marginBottom: 6,
  },
  // --- Shopping & Souvenirs Styles --- SUPPRIMÉS
  // --- Transportation Styles ---
  transportContainer: {
      marginHorizontal: 20,
      marginBottom: 25,
      backgroundColor: '#E3F2FD',
      padding: 20,
      paddingTop: 15,
      borderRadius: 16,
      shadowColor: '#1565C0',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  transportItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 18,
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: '#BBDEFB',
      // Pour enlever la bordure du dernier item, il faudrait une logique dans le map ou styler le container
  },
  transportIcon: {
      marginRight: 18,
      marginTop: 3,
  },
  transportTextContainer: {
      flex: 1,
  },
  transportType: {
      fontSize: 17,
      fontWeight: '600',
      color: '#0D47A1',
      marginBottom: 5,
  },
  transportDetails: {
      fontSize: 15,
      color: '#1976D2',
      lineHeight: 21,
  },
  // --- Emergency Contacts Styles ---
  emergencyContactsContainer: {
      marginHorizontal: 20,
      marginBottom: 40,
  },
  emergencyContactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFEBEE',
      padding: 18,
      borderRadius: 16,
      marginBottom: 15,
      borderWidth: 1.5,
      borderColor: '#EF9A9A',
      shadowColor: '#C62828',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  emergencyContactInfo: {
      flex: 1,
      marginLeft: 18,
      marginRight: 12,
  },
  emergencyContactName: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#B71C1C',
  },
  emergencyContactNumber: {
      fontSize: 16,
      color: '#C62828',
      marginTop: 4,
  },
  // --- Footer Spacer ---
  footerSpacer: {
      height: 40, // Espace pour ne pas coller au bas de l'écran/tab bar
  },
});

export default HomeScreen;