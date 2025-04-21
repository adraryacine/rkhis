import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function AttractionCard({ attraction }) {
  return (
    <View style={styles.card}>
      <Text>{attraction.name}</Text>
      {/* Add other attraction information here */}
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

export default AttractionCard;