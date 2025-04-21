// screens/AboutUsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native'; // For theming

const SPACING = 15;

// Helper function to get consistent themed colors
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    border: isDarkMode ? '#38383A' : '#E0E0E0',
});

// Helper function to get themed styles
const getThemedAboutUsStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Themed background
  },
  scrollContent: {
    padding: SPACING * 2,
    paddingBottom: SPACING * 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING * 1.5,
    color: colors.text, // Themed text color
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.secondaryText, // Themed secondary text
    marginBottom: SPACING * 2,
  },
   infoBox: {
       backgroundColor: colors.card, // Themed card background
       padding: SPACING * 1.5,
       borderRadius: SPACING,
       marginTop: SPACING * 2,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 3,
   },
   infoTitle: {
       fontSize: 18,
       fontWeight: 'bold',
       marginBottom: SPACING,
       color: colors.text,
   },
   infoButton: {
       flexDirection: 'row',
       alignItems: 'center',
       paddingVertical: SPACING,
       borderBottomWidth: 1,
       borderBottomColor: colors.border,
   },
    infoButtonText: {
        fontSize: 16,
        color: colors.accent, // Themed link color
        marginLeft: SPACING,
        flex: 1,
    },
     footerSpacer: {
        height: SPACING * 3,
     },
});


function AboutUsScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode); // Use the same color helper
  const styles = getThemedAboutUsStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>About Us</Text>
      <Text style={styles.content}>
        Welcome to Bejaia Tourism App, your ultimate guide to discovering the hidden gems and vibrant culture of Bejaia, Algeria. Our mission is to provide tourists with comprehensive, up-to-date information to make their visit unforgettable.
        {"\n\n"}
        Whether you're interested in historical sites, breathtaking natural landscapes, delicious local cuisine, or exciting events, our app is designed to help you explore Bejaia with ease. We aim to connect visitors with the best hotels, restaurants, attractions, and local experiences the city has to offer.
        {"\n\n"}
        We are a team passionate about promoting tourism in Bejaia and showcasing its unique beauty and rich heritage to the world. We continuously work to improve the app and add new features based on user feedback.
        {"\n\n"}
        Thank you for choosing Bejaia Tourism App as your travel companion!
      </Text>

      {/* Placeholder Contact Info */}
       <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Get in Touch</Text>
             <TouchableOpacity style={styles.infoButton} onPress={() => Alert.alert("Contact Us", "Email support coming soon!")}>
                 <Ionicons name="mail-outline" size={24} color={colors.accent} />
                 <Text style={styles.infoButtonText}>Email Us</Text>
                  <Ionicons name="chevron-forward-outline" size={24} color={colors.secondaryText} style={{opacity: 0.6}} />
             </TouchableOpacity>
              <TouchableOpacity style={[styles.infoButton, {borderBottomWidth: 0}]} onPress={() => Alert.alert("Contact Us", "Website link coming soon!")}>
                 <Ionicons name="globe-outline" size={24} color={colors.accent} />
                 <Text style={styles.infoButtonText}>Visit Our Website</Text>
                  <Ionicons name="chevron-forward-outline" size={24} color={colors.secondaryText} style={{opacity: 0.6}} />
             </TouchableOpacity>
       </View>

       <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

export default AboutUsScreen;