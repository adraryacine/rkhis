import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function HotelCard({ hotel }) {
  return (
    <View style={styles.card}>
      <Text>{hotel.name}</Text>
      {/* Add other hotel information here */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default HotelCard;