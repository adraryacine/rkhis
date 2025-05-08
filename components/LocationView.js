import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LocationView = ({ location, style, textStyle, iconColor }) => {
  if (!location) return null;

  const { latitude, longitude, address } = location;

  const handleOpenMaps = () => {
    if (!latitude || !longitude) return;
    
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q='
    });
    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(address || 'Location');
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url).catch(err => {
      console.error('Error opening maps:', err);
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handleOpenMaps}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="location-outline" 
        size={20} 
        color={iconColor || '#666'} 
        style={styles.icon}
      />
      <Text style={[styles.text, textStyle]} numberOfLines={2}>
        {address || `${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`}
      </Text>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={iconColor || '#666'} 
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default LocationView; 