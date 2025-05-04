import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

// Theme colors
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
};

const hikingSpots = [
  {
    id: '1',
    name: 'SIDI JABER AOKAS',
    description: 'A beautiful park with stunning views of the Mediterranean Sea and diverse wildlife. Perfect for nature lovers and photographers.',
    image: 'https://s1.wklcdn.com/image_152/4587390/43990129/28898524.jpg',
    difficulty: 'Moderate',
    duration: '3-4 hours',
    distance: '12.5 km',
    elevation: '1200m',
    bestTime: 'Spring and Autumn',
    coordinates: {
      latitude: 36.7600,
      longitude: 5.0900,
    },
    tips: [
      'Wear comfortable hiking shoes',
      'Bring enough water and snacks',
      'Use sunscreen and wear a hat',
      'Check weather conditions before starting',
      'Stay on marked trails',
    ],
    contact: '+213 123 456 789',
    website: 'https://www.gouraya-park.dz',
  },
  {
    id: '2',
    name: 'MONT ISSEK AOKAS',
    description: 'Known for its wild monkeys and panoramic views of Bejaia. A challenging but rewarding hike with amazing photo opportunities.',
    image: 'https://pbs.twimg.com/media/B9_X6OXIMAAzrvQ.jpg',
    difficulty: 'Challenging',
    duration: '4-5 hours',
    distance: '16 km',
    elevation: '1400m',
    bestTime: 'Spring and Autumn',
    coordinates: {
      latitude: 36.765,
      longitude: 5.095,
    },
    tips: [
      'Start early in the morning',
      'Bring trekking poles for steep sections',
      'Pack a first aid kit',
      'Respect wildlife and keep distance',
      'Bring a camera for amazing views',
    ],
    contact: '+213 123 456 789',
    website: 'https://www.bejaia-tourism.dz',
  },
  {
    id: '3',
    name: 'TIKEJDA LAC AGUELMIM',
    description: 'A coastal trail with breathtaking views of the sea and lighthouse. Perfect for a shorter hike with stunning scenery.',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrXItmB3N1Lhh0X3mnKUgJaR144xSrAK71hkg0exfGKThSfwIwBJqthpFVBo164VVLO8bW3ZfpB-rSnex6IOoN_7yEpupkmm8F2J5Sx3rxumtSxP-iH-YWOEABc019by7TcwMsL=s680-w680-h510-rw',
    difficulty: 'Easy',
    duration: '5-6 hours',
    distance: '24 km',
    elevation: '220m',
    bestTime: 'All year round ,WINTER',
    coordinates: {
      latitude: 36.785,
      longitude: 5.105,
    },
    tips: [
      'Great for beginners',
      'Perfect for sunset views',
      'Bring a windbreaker',
      'Watch for slippery rocks',
      'Visit the lighthouse',
    ],
    contact: '+213 123 456 789',
    website: 'https://www.bejaia-tourism.dz',
  },
];

const HikingSpotCard = ({ spot, colors, onShare }) => (
  <View style={[styles.spotCard, { backgroundColor: colors.cardBackground }]}>
    <Image
      source={{ uri: spot.image }}
      style={styles.spotImage}
    />
    <View style={styles.spotContent}>
      <Text style={[styles.spotTitle, { color: colors.text }]}>{spot.name}</Text>
      <Text style={[styles.spotDescription, { color: colors.secondary }]}>
        {spot.description}
      </Text>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={20} color={colors.tint} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {spot.difficulty}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={20} color={colors.tint} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {spot.duration}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="trending-up-outline" size={20} color={colors.tint} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {spot.distance} • {spot.elevation}
          </Text>
        </View>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: spot.coordinates.latitude,
            longitude: spot.coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={spot.coordinates}
            title={spot.name}
          />
        </MapView>
      </View>
      <View style={styles.tipsContainer}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>Tips</Text>
        {spot.tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.tint }]}
          onPress={() => Linking.openURL(`tel:${spot.contact}`)}
        >
          <Ionicons name="call-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.tint }]}
          onPress={() => Linking.openURL(spot.website)}
        >
          <Ionicons name="globe-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Website</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.tint }]}
          onPress={() => onShare(spot)}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function HikingScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const handleShare = async (spot) => {
    try {
      await Share.share({
        message: `Check out this amazing hiking spot in Bejaia: ${spot.name}\n\n${spot.description}\n\nWebsite: ${spot.website}`,
        title: spot.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Hiking in Bejaia</Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          Discover the best hiking trails and enjoy the natural beauty of Bejaia
        </Text>
      </View>

      {hikingSpots.map((spot) => (
        <HikingSpotCard
          key={spot.id}
          spot={spot}
          colors={colors}
          onShare={handleShare}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  spotCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  spotImage: {
    width: '100%',
    height: 200,
  },
  spotContent: {
    padding: 16,
  },
  spotTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  spotDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  tipsContainer: {
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
}); 