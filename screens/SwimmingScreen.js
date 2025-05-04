import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

const swimmingSpots = [
  {
    id: '1',
    name: 'Les Aiguades Beach',
    description: 'A popular beach with crystal clear waters and golden sand.',
    image: 'https://media.safarway.com/content/a5ab6cc3-cd76-4ad9-926a-d80fd9f881ed_lg.jpg',
    features: ['Lifeguards', 'Restaurants', 'Showers'],
    waterTemp: '22-25°C',
  },
  {
    id: '2',
    name: 'LES HAMMADITES',
    description: 'A peaceful beach perfect for families and relaxation.',
    image: 'https://www.liberte-algerie.com/storage/images/article/d_df4c0ea8fef2d2c0de997bc243a6e840.jpg',
    features: ['Family-friendly', 'Calm waters', 'Parking'],
    waterTemp: '21-24°C',
  },
  {
    id: '3',
    name: 'MELBOU LA CORNICHE',
    description: 'Known for its turquoise waters and water sports activities.',
    image: 'https://pbs.twimg.com/media/CJ8j3q0WEAAZKjt.jpg',
    features: ['Water sports', 'Beach bars', 'Umbrella rentals'],
    waterTemp: '23-26°C',
  },
];

const SwimmingSpotCard = ({ spot, colors }) => (
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
      <View style={styles.featuresContainer}>
        {spot.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
          </View>
        ))}
      </View>
      <View style={styles.temperatureContainer}>
        <Ionicons name="thermometer-outline" size={20} color={colors.tint} />
        <Text style={[styles.temperatureText, { color: colors.text }]}>
          Water Temperature: {spot.waterTemp}
        </Text>
      </View>
    </View>
  </View>
);

export default function SwimmingScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = isDarkMode ? Colors.dark : Colors.light;

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
        <Text style={[styles.title, { color: colors.text }]}>Swimming in Bejaia</Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          Discover the best beaches and swimming spots in Bejaia
        </Text>
      </View>

      {swimmingSpots.map((spot) => (
        <SwimmingSpotCard key={spot.id} spot={spot} colors={colors} />
      ))}

      <View style={[styles.safetyCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.safetyTitle, { color: colors.text }]}>Safety Tips</Text>
        <View style={styles.safetyItem}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.safetyText, { color: colors.text }]}>
            Always swim between the flags
          </Text>
        </View>
        <View style={styles.safetyItem}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.safetyText, { color: colors.text }]}>
            Watch out for strong currents
          </Text>
        </View>
        <View style={styles.safetyItem}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.safetyText, { color: colors.text }]}>
            Keep hydrated and use sunscreen
          </Text>
        </View>
      </View>
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
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 4,
    fontSize: 14,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperatureText: {
    marginLeft: 8,
    fontSize: 14,
  },
  safetyCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  safetyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyText: {
    marginLeft: 12,
    fontSize: 14,
  },
}); 