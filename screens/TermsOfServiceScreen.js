import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.content}>
        {/* Replace this with your actual Terms of Service text */}
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. ... (Your Terms of Service text here)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default TermsOfServiceScreen;