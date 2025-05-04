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

const paraglidingSpots = [
  {
    id: '1',
    name: 'AOKAS YEMMATADRART',
    description: 'A popular takeoff point with stunning views of the city and sea.',
    image: 'https://pbs.twimg.com/media/EIEbTYUX4AIzGha.jpg:large',
    height: '360m',
    duration: '15-30 min',
    difficulty: 'Intermediate',
  },
  {
    id: '2',
    name: 'MELBOU ',
    description: 'Coastal flying site with thermals and sea breeze.',
    image: 'https://i.ytimg.com/vi/1iesa-eyk8c/hqdefault.jpg',
    height: '220m',
    duration: '10-20 min',
    difficulty: 'Beginner',
  },
  {
    id: '3',
    name: 'Toudja',
    description: 'Mountain site with strong thermals and long flights possible.',
    image: 'https://www.jeune-independant.net/wp-content/uploads/2020/08/arton15932.jpg',
    height: '800m',
    duration: '30-60 min',
    difficulty: 'Advanced',
  },
];

const ParaglidingSpotCard = ({ spot, colors }) => (
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
          <Ionicons name="trending-up-outline" size={20} color={colors.tint} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            Height: {spot.height}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={20} color={colors.tint} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            Flight Duration: {spot.duration}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={20} color={colors.tint} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            Level: {spot.difficulty}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

export default function ParaglidingScreen() {
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
        <Text style={[styles.title, { color: colors.text }]}>Parapente in Bejaia</Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          Experience the thrill of flying over Bejaia's beautiful landscapes
        </Text>
      </View>

      {paraglidingSpots.map((spot) => (
        <ParaglidingSpotCard key={spot.id} spot={spot} colors={colors} />
      ))}

      <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>Important Information</Text>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={20} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            All flights are conducted with certified instructors
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={20} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Weather conditions must be suitable for flying
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={20} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Minimum age requirement: 16 years
          </Text>
        </View>
      </View>

      <View style={[styles.safetyCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.safetyTitle, { color: colors.text }]}>Safety Requirements</Text>
        <View style={styles.safetyItem}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.safetyText, { color: colors.text }]}>
            Wear appropriate clothing and shoes
          </Text>
        </View>
        <View style={styles.safetyItem}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.safetyText, { color: colors.text }]}>
            Follow instructor's guidance at all times
          </Text>
        </View>
        <View style={styles.safetyItem}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.safetyText, { color: colors.text }]}>
            No alcohol or drugs before flying
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
  detailsContainer: {
    marginTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
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