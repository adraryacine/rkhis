import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList, // Besoin de FlatList
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Pour l'icône étoile
import { useNavigation } from '@react-navigation/native'; // Utile si tu veux naviguer depuis un item

const { width: screenWidth } = Dimensions.get('window');

// Composant pour afficher une entrée d'hôtel dans la liste
// Tu peux le mettre ici ou l'importer s'il est dans un autre fichier
const HotelListItem = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.cardContainer}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityLabel={`View details for ${item.name}`}
  >
    <Image
      source={item.image} // Utilise directement l'image passée
      style={styles.hotelImage}
      resizeMode="cover"
    />
    <View style={styles.infoContainer}>
      <Text style={styles.hotelName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.detailRow}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFC107" style={styles.iconSpacing}/>
          <Text style={styles.hotelRating}>{item.rating}</Text>
        </View>
        <Text style={styles.hotelPrice}>{item.price}/night</Text>
      </View>
      {item.amenities && (
        <Text style={styles.hotelAmenities} numberOfLines={1}>
          {item.amenities.join(' • ')}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

// Garde le nom de ta fonction/composant principal
function HotelReservationScreen({ route }) { // Important : Ajouter { route } pour recevoir les données
  const navigation = useNavigation();

  // Récupérer les données des hôtels passées depuis HomeScreen
  console.log("HotelReservationScreen: route.params:", route.params); // Log pour vérifier
  const params = route.params || {}; // Sécurité
  const { hotels } = params; // Extrait 'hotels' (doit correspondre à ce que HomeScreen envoie)
  console.log("HotelReservationScreen: Données extraites (hotels):", hotels); // Log pour vérifier

  // Fonction pour gérer le clic sur un hôtel (pour une future page de détail)
  const handleHotelPress = (hotel) => {
    console.log('Navigate to details for:', hotel.name);
    // Potentiellement, naviguer vers un VRAI écran de réservation/détail plus tard
    // navigation.navigate('HotelDetail', { hotelId: hotel.id });
  };

  const renderHotelItem = ({ item }) => (
    <HotelListItem
      item={item}
      onPress={() => handleHotelPress(item)}
    />
  );

  // Vérifie si 'hotels' est un tableau valide
  if (!Array.isArray(hotels) || hotels.length === 0) {
    console.log("HotelReservationScreen: Affichage 'No hotels found'.");
    return (
      <View style={styles.centered}>
        <Text>No hotels found.</Text>
        {/* Messages de débogage utiles */}
        {!route.params && <Text style={{marginTop: 5, color: 'grey'}}>(Params non reçus)</Text>}
        {route.params && (!Array.isArray(hotels) || hotels.length === 0) && <Text style={{marginTop: 5, color: 'grey'}}>(Liste d'hôtels vide ou invalide)</Text>}
      </View>
    );
  }

  // Si on arrive ici, on a des hôtels à afficher
  console.log(`HotelReservationScreen: Rendu de la FlatList avec ${hotels.length} hôtels.`);
  return (
    // Remplace l'ancienne View par celle-ci qui contient la FlatList
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={hotels}
        renderItem={renderHotelItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Garde les styles nécessaires (ceux de l'exemple précédent pour la liste)
const styles = StyleSheet.create({
  screenContainer: { // Style principal pour l'écran
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContentContainer: { // Style pour le contenu de la FlatList
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  cardContainer: { // Style pour chaque carte d'hôtel
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#546E7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hotelImage: { // Style pour l'image de l'hôtel
    width: 110,
    height: '100%',
    minHeight: 110,
  },
  infoContainer: { // Style pour la partie droite avec les infos
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  hotelName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
   iconSpacing: {
     marginRight: 4,
   },
  hotelRating: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  hotelPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00796B',
  },
  hotelAmenities: {
    fontSize: 13,
    color: '#607D8B',
    marginTop: 4,
  },
  centered: { // Garde ce style pour le cas "No hotels found"
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Garde l'export de ton composant
export default HotelReservationScreen;