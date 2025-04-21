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
  Alert // Import Alert
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location'; // Pour la localisation de l'utilisateur

// --- Données avec COORDONNÉES FICTIVES (À REMPLACER ABSOLUMENT !) ---
// Vous devrez obtenir les vraies latitudes/longitudes pour chaque lieu.
// Idéalement, ces données proviendraient de votre source de données principale (comme initialData mais enrichie)
const pointsOfInterest = [
  // Attractions
  { id: 'attr1', type: 'Attraction', name: 'Gouraya Park', latitude: 36.7600, longitude: 5.0900, description: 'Nature & Views' },
  { id: 'attr3', type: 'Attraction', name: 'Place 1er Novembre', latitude: 36.7550, longitude: 5.0850, description: 'City Heart' },
  { id: 'attr5', type: 'Attraction', name: 'Casbah', latitude: 36.7580, longitude: 5.0880, description: 'Old City Charm' },
  { id: 'attr6', type: 'Attraction', name: 'Cap Carbon', latitude: 36.7750, longitude: 5.0950, description: 'Lighthouse Views' },
  // Hôtels
  { id: 'hotel1', type: 'Hotel', name: 'Hotel Royal Bejaia', latitude: 36.7520, longitude: 5.0860, description: 'Rating: 4.7' },
  { id: 'hotel3', type: 'Hotel', name: 'Le Cristal Hotel', latitude: 36.7500, longitude: 5.0840, description: 'Rating: 4.5' },
  // Restaurants (exemple)
  { id: 'rest1', type: 'Restaurant', name: 'Le Dauphin Bleu', latitude: 36.7540, longitude: 5.0910, description: 'Seafood' },
];
// --- Fin des données fictives ---


const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0422; // Zoom initial (plus petit = plus zoomé)
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_LATITUDE = 36.7559; // Centre approximatif de Bejaia
const INITIAL_LONGITUDE = 5.0842; // Centre approximatif de Bejaia

function MapScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const mapRef = useRef(null); // Référence à la MapView

  // Demander la permission de localisation au montage
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la localisation est nécessaire pour afficher votre position sur la carte.',
          [{ text: 'OK' }]
        );
        setLocationPermissionGranted(false);
      } else {
        setLocationPermissionGranted(true);
        try {
          // Tenter d'obtenir la position actuelle (peut prendre du temps)
          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation(location.coords);
        } catch (error) {
          console.error("Erreur de localisation: ", error);
          Alert.alert('Erreur de localisation', 'Impossible de récupérer votre position actuelle.');
          // On continue sans la position user si elle échoue
        }
      }

      // Charger les points d'intérêt (ici depuis notre constante)
      setMarkers(pointsOfInterest);
      setIsLoading(false);
    })();
  }, []);

  // Fonction pour centrer sur la position de l'utilisateur
  const goToUserLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01, // Zoom plus proche sur l'utilisateur
        longitudeDelta: 0.01 * ASPECT_RATIO,
      }, 1000); // Animation sur 1 seconde
    } else if (!locationPermissionGranted) {
       Alert.alert('Permission requise', 'Veuillez activer la localisation dans les paramètres de votre appareil.');
    } else {
       Alert.alert('Localisation indisponible', 'Votre position actuelle n\'est pas encore disponible.');
    }
  }, [userLocation, locationPermissionGranted]);

  // Détermine la couleur du marqueur selon le type
  const getMarkerColor = (type) => {
    switch (type) {
      case 'Attraction': return 'red';
      case 'Hotel': return 'blue';
      case 'Restaurant': return 'green';
      default: return 'purple';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00796B" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE} // Important pour utiliser Google Maps sur Android
        initialRegion={{
          latitude: INITIAL_LATITUDE,
          longitude: INITIAL_LONGITUDE,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation={locationPermissionGranted} // Affiche le point bleu si permission accordée
        showsMyLocationButton={false} // On crée notre propre bouton
        mapType="standard" // "standard", "satellite", "hybrid"
        loadingEnabled={true} // Indicateur pendant le chargement des tuiles
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#eeeeee"
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            description={marker.description || marker.type} // Affiche la description ou le type
            pinColor={getMarkerColor(marker.type)}
            // Vous pourriez utiliser une image custom ici avec <Image> dedans
            // ou l'attribut `image={require('../assets/images/custom_marker.png')}`
            tracksViewChanges={false} // Améliore les performances une fois le marqueur affiché
          >
            <Callout tooltip={false} onPress={() => console.log('Callout Tapped:', marker.name)} >
              <View style={styles.calloutView}>
                <Text style={styles.calloutTitle}>{marker.name}</Text>
                {marker.description && <Text style={styles.calloutDescription}>{marker.description}</Text>}
                {/* On pourrait ajouter un bouton pour naviguer vers un écran de détail */}
                <Text style={styles.calloutLink}>Voir détails</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Bouton pour centrer sur l'utilisateur */}
      {locationPermissionGranted && (
         <TouchableOpacity style={styles.locationButton} onPress={goToUserLocation}>
             <Ionicons name="locate-outline" size={28} color="#00796B" />
         </TouchableOpacity>
      )}

       {/* Vous pourriez ajouter ici des filtres ou des options de type de carte */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Fait que la map prend tout l'espace
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Styles pour la bulle d'info (Callout)
  calloutView: {
    padding: 10,
    minWidth: 150, // Largeur minimale
    maxWidth: 250, // Largeur maximale
    backgroundColor: 'white',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 0.5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  calloutDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
   calloutLink: {
      fontSize: 14,
      color: '#00796B',
      marginTop: 5,
      fontWeight: 'bold',
  },
});

export default MapScreen;