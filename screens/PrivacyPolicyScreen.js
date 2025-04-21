import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native'; // For theming

const SPACING = 15;

// Helper function to get consistent themed colors (copy from TermsOfServiceScreen or use a shared file)
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    border: isDarkMode ? '#38383A' : '#E0E0E0',
});

const getThemedLegalStyles = (colors) => StyleSheet.create({
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


function PrivacyPolicyScreen() {
   const colorScheme = useColorScheme();
   const isDarkMode = colorScheme === 'dark';
   const colors = getThemedColors(isDarkMode); // Use the same color helper
   const styles = getThemedLegalStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.content}>
        {/* Replace this with your actual Privacy Policy text */}
        Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use the Bejaia Tourism App.
        {"\n\n"}
        **Information We Collect:** We may collect information you provide directly to us, such as when you create an account (email address) or contact support. We may also collect usage data and device information automatically. If you grant location permissions, we collect location data to provide map features.
        {"\n\n"}
        **How We Use Your Information:** We use the information we collect to operate, maintain, and improve the app, personalize your experience, provide customer support, and analyze usage. Location data is used to show your position and nearby points of interest on the map.
        {"\n\n"}
        **Information Sharing:** We do not share your personal information with third parties except as necessary to operate the app (e.g., using Firebase services for authentication and data storage) or when required by law. We do not sell your data.
        {"\n\n"}
        **Data Security:** We implement reasonable security measures to protect your information, but no method of transmission over the internet or electronic storage is 100% secure.
        {"\n\n"}
        **Your Choices:** You can update your profile information through the app settings. You can also control location permissions through your device settings. You may request account deletion via the profile screen (feature coming soon).
        {"\n\n"}
        **Changes to This Policy:** We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
        {"\n\n"}
        **Contact Us:** If you have any questions about this Privacy Policy, please contact us.
      </Text>

      {/* Direct Support & Download Link Placeholders */}
       <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Questions about your privacy?</Text>
             <TouchableOpacity style={styles.infoButton} onPress={() => Alert.alert("Direct Support", "Contact support options coming soon!")}>
                 <Ionicons name="mail-outline" size={24} color={colors.accent} />
                 <Text style={styles.infoButtonText}>Contact Support</Text>
                  <Ionicons name="chevron-forward-outline" size={24} color={colors.secondaryText} style={{opacity: 0.6}} />
             </TouchableOpacity>
              <TouchableOpacity style={[styles.infoButton, {borderBottomWidth: 0}]} onPress={() => Alert.alert("Download", "Downloadable PDF coming soon!")}>
                 <Ionicons name="download-outline" size={24} color={colors.accent} />
                 <Text style={styles.infoButtonText}>Download PDF</Text>
                  <Ionicons name="chevron-forward-outline" size={24} color={colors.secondaryText} style={{opacity: 0.6}} />
             </TouchableOpacity>
       </View>

       {/* Placeholder for Last Updated Date */}
       <Text style={[styles.content, {textAlign: 'right', fontSize: 14, color: colors.secondaryText, marginTop: SPACING * 2}]}>Last Updated: August 1, 2024</Text>

       <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

export default PrivacyPolicyScreen;