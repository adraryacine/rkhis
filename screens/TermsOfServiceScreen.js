// screens/TermsOfServiceScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Optional: for icons in support/download
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


function TermsOfServiceScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode); // Use the same color helper
  const styles = getThemedLegalStyles(colors);


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.content}>
        {/* Replace this with your actual Terms of Service text */}
        Welcome to Bejaia Tourism App! These terms and conditions outline the rules and regulations for the use of our mobile application. By accessing this app, we assume you accept these terms and conditions. Do not continue to use Bejaia Tourism App if you do not agree to take all of the terms and conditions stated on this page.
        {"\n\n"}
        **License:** Unless otherwise stated, Bejaia Tourism App and/or its licensors own the intellectual property rights for all material on Bejaia Tourism App. All intellectual property rights are reserved. You may access this from Bejaia Tourism App for your own personal use subject to restrictions set in these terms and conditions.
         {"\n\n"}
        You must not:
        {"\n"}- Republish material from Bejaia Tourism App
        {"\n"}- Sell, rent or sub-license material from Bejaia Tourism App
        {"\n"}- Reproduce, duplicate or copy material from Bejaia Tourism App
        {"\n"}- Redistribute content from Bejaia Tourism App
        {"\n\n"}
        This Agreement shall begin on the date hereof.
        {"\n\n"}
        Parts of this app offer an opportunity for users to post and exchange opinions and information in certain areas of the app. Bejaia Tourism App does not filter, edit, publish or review Comments prior to their presence on the app. Comments do not reflect the views and opinions of Bejaia Tourism App,its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions. To the extent permitted by applicable laws, Bejaia Tourism App shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this app.
         {"\n\n"}
        Bejaia Tourism App reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.
         {"\n\n"}
        **Your Privacy:** Please read our Privacy Policy.
        {"\n\n"}
        **Reservation of Rights:** We reserve the right to request that you remove all links or any particular link to our app. You approve to immediately remove all links to our app upon request. We also reserve the right to amen these terms and conditions and its linking policy at any time. By continuously linking to our app, you agree to be bound to and follow these linking terms and conditions.
        {"\n\n"}
        **Disclaimer:** To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our app and the use of this app. Nothing in this disclaimer will:
        {"\n"}- Limit or exclude our or your liability for death or personal injury;
        {"\n"}- Limit or exclude our or your liability for fraud or fraudulent misrepresentation;
        {"\n"}- Limit any of our or your liabilities in any way that is not permitted under applicable law; or
        {"\n"}- Exclude any of our or your liabilities that may not be excluded under applicable law.
         {"\n\n"}
        The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.
         {"\n\n"}
        As long as the app and the information and services on the app are provided free of charge, we will not be liable for any loss or damage of any nature.
      </Text>

       {/* Direct Support & Download Link Placeholders */}
       <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Need help or have questions?</Text>
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

export default TermsOfServiceScreen;