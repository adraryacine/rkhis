// screens/HelpCenterScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

const SPACING = 15;

// Helper function to get consistent themed colors
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    border: isDarkMode ? '#38383A' : '#E0E0E0',
    inputBorder: isDarkMode ? '#38383A' : '#E0E0E0',
    placeholder: isDarkMode ? '#636366' : '#B0BEC5',
});

// Helper function to get themed styles
const getThemedHelpCenterStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: SPACING * 2,
    paddingBottom: SPACING * 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING * 1.5,
    color: colors.text,
  },
   searchBarContainer: {
        marginBottom: SPACING * 2,
   },
   searchBarInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderColor: colors.inputBorder,
        borderWidth: 1,
        borderRadius: SPACING * 2,
        paddingLeft: SPACING * 1.2,
        paddingRight: SPACING * 0.8,
        height: SPACING * 3.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
   },
   searchIcon: {
        marginRight: SPACING,
   },
   searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
   },
   sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: SPACING * 1.5,
        marginBottom: SPACING,
        color: colors.text,
   },
   faqItem: {
        backgroundColor: colors.card,
        padding: SPACING * 1.2,
        borderRadius: SPACING * 0.8,
        marginBottom: SPACING * 0.8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
   },
   faqQuestion: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING * 0.5,
        color: colors.text,
   },
   faqAnswer: {
        fontSize: 15,
        color: colors.secondaryText,
        lineHeight: 22,
   },
    contactBox: {
       backgroundColor: colors.card,
       padding: SPACING * 1.5,
       borderRadius: SPACING,
       marginTop: SPACING * 2,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 3,
   },
   contactTitle: {
       fontSize: 18,
       fontWeight: 'bold',
       marginBottom: SPACING,
       color: colors.text,
   },
   contactButton: {
       flexDirection: 'row',
       alignItems: 'center',
       paddingVertical: SPACING,
       borderBottomWidth: 1,
       borderBottomColor: colors.border,
   },
    contactButtonText: {
        fontSize: 16,
        color: colors.accent,
        marginLeft: SPACING,
        flex: 1,
    },
     footerSpacer: {
        height: SPACING * 3,
     },
});

function HelpCenterScreen() {
   const colorScheme = useColorScheme();
   const isDarkMode = colorScheme === 'dark';
   const colors = getThemedColors(isDarkMode); // Use the same color helper
   const styles = getThemedHelpCenterStyles(colors);

   // Placeholder FAQ data
   const faqData = [
       { id: '1', question: 'How do I reset my password?', answer: 'You can reset your password from the login screen by tapping "Forgot Password?".' },
       { id: '2', question: 'How do I add a place to favorites?', answer: 'On any detail screen (Hotel, Attraction), look for the heart icon (♡) and tap it to add or remove from your favorites.' },
       { id: '3', question: 'How can I view hotels near me?', answer: 'Use the Map screen. Ensure location permissions are granted, and you will see your current location along with nearby hotels and attractions.' },
       { id: '4', question: 'Is offline access available?', answer: 'Currently, offline access is limited. Full offline map and data access is a feature we plan to add in the future.' },
        { id: '5', question: 'How do I contact support?', answer: 'You can contact support via the options listed in the "Contact Us" section below or through the Settings screen.' },
   ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Help Center</Text>

      {/* Placeholder Search Bar */}
      <View style={styles.searchBarContainer}>
            <View style={styles.searchBarInner}>
                <Ionicons name="search-outline" size={22} color={colors.secondaryText} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search help articles...`}
                    placeholderTextColor={colors.placeholder}
                     editable={false} // Placeholder, not functional search yet
                    onPressIn={() => Alert.alert("Coming Soon", "Help search functionality is not yet implemented.")}
                />
            </View>
        </View>

      {/* FAQ Section */}
       <Text style={styles.sectionTitle}>Popular Questions</Text>
       <View>
           {faqData.map(item => (
               <View key={item.id} style={styles.faqItem}>
                   <Text style={styles.faqQuestion}>{item.question}</Text>
                   <Text style={styles.faqAnswer}>{item.answer}</Text>
               </View>
           ))}
       </View>

        {/* Contact Support Section */}
       <View style={styles.contactBox}>
           <Text style={styles.contactTitle}>Get in Touch</Text>
            <TouchableOpacity style={styles.contactButton} onPress={() => Alert.alert("Contact Us", "Email support coming soon!")}>
                <Ionicons name="mail-outline" size={24} color={colors.accent} />
                <Text style={styles.contactButtonText}>Email Support</Text>
                 <Ionicons name="chevron-forward-outline" size={24} color={colors.secondaryText} style={{opacity: 0.6}} />
            </TouchableOpacity>
             <TouchableOpacity style={[styles.contactButton, {borderBottomWidth: 0}]} onPress={() => Alert.alert("Contact Us", "Phone support coming soon!")}>
                <Ionicons name="call-outline" size={24} color={colors.accent} />
                <Text style={styles.contactButtonText}>Call Us</Text>
                 <Ionicons name="chevron-forward-outline" size={24} color={colors.secondaryText} style={{opacity: 0.6}} />
            </TouchableOpacity>
            {/* Placeholder for Chatbot */}
             {/* <TouchableOpacity style={[styles.contactButton, {borderBottomWidth: 0}]} onPress={() => Alert.alert("Coming Soon", "Chatbot support coming soon!")}>
                <Ionicons name="chatbubbles-outline" size={24} color={colors.accent} />
                <Text style={styles.contactButtonText}>Chat with us</Text>
                 <Ionicons name="chevron-forward-outline" size={24} color={colors.secondaryText} style={{opacity: 0.6}} />
            </TouchableOpacity> */}
       </View>


      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

export default HelpCenterScreen;
