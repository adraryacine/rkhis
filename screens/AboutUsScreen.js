import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function AboutUsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Us</Text>
      <Text>je suis accepter</Text>
      {/* Add your "About Us" content here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default AboutUsScreen;