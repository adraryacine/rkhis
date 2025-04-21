import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.content}>
        {/* Replace this with your actual Privacy Policy text */}
        Your privacy is important to us. This policy explains how we collect, use, and protect your information. ... (Your Privacy Policy text here)
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

export default PrivacyPolicyScreen;