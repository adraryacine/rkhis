import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function HelpCenterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help Center</Text>
      <Text>This is the Help Center screen.</Text>
      {/* Add more help content here */}
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

export default HelpCenterScreen;