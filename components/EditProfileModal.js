// components/EditProfileModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
// Assuming dataService.js is in the '../services/' directory relative to components
import { saveUserProfile } from '../services/dataService';


// Use the same color scheme logic as ProfileScreen for consistency
const getThemedColors = (isDarkMode) => ({
  text: isDarkMode ? '#E0E0E0' : '#1A1A1A',
  background: isDarkMode ? '#121212' : '#F0F2F5',
  cardBackground: isDarkMode ? '#1C1C1E' : '#FFFFFF',
  tint: isDarkMode ? '#0A84FF' : '#007AFF',
  secondaryText: isDarkMode ? '#A9A9A9' : '#616161',
  border: isDarkMode ? '#3A3A3A' : '#E0E0E0',
  placeholder: isDarkMode ? '#636366' : '#B0BEC5',
  danger: isDarkMode ? '#FF453A' : '#FF3B30',
  separator: isDarkMode ? '#2C2C2E' : '#EEEEEE',
});

const SPACING = 16;

const getThemedStyles = (colors) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    backgroundColor: colors.cardBackground, // Header background
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: SPACING / 2,
  },
  scrollViewContent: {
    padding: SPACING * 2,
  },
  formSection: {
    marginBottom: SPACING * 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondaryText,
    marginBottom: SPACING * 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: SPACING,
    height: 50,
    marginBottom: SPACING * 1.5, // Add margin between inputs
  },
   phonePrefix: {
        fontSize: 16,
        color: colors.text,
        marginRight: 4, // Small space between prefix and input
   },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  },
  saveButton: {
    backgroundColor: colors.tint,
    paddingVertical: SPACING * 1.2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING,
  },
  saveButtonText: {
    color: '#FFFFFF', // White text for button
    fontSize: 17,
    fontWeight: 'bold',
  },
});

// profileData passed from ProfileScreen should have uid, fullName, phoneNumber
const EditProfileModal = ({ isVisible, onClose, profileData, onProfileUpdated }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedStyles(colors);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data when the modal becomes visible or profileData changes
  useEffect(() => {
    if (isVisible && profileData) {
      // Ensure we handle potential null/undefined values from profileData
      setFullName(profileData.fullName || '');
      // Initialize phoneNumber with the value from profileData or just the prefix if none exists
      setPhoneNumber(profileData.phoneNumber || '+213');
    }
  }, [isVisible, profileData]);

  // Handle phone number input change, ensuring it starts with +213
   const handlePhoneNumberChange = (text) => {
       // If the user clears the input, reset to just the prefix
       if (text === '' || text === '+') {
           setPhoneNumber('+213');
       }
       // If the input starts with +213, update the state directly
       else if (text.startsWith('+213')) {
           setPhoneNumber(text);
       }
       // If the input doesn't start with +213, but isn't empty, prepend the prefix
       // This handles cases where user might paste a number without the prefix
       else {
           setPhoneNumber('+213' + text);
       }
   };

  const handleSave = async () => {
    // Basic validation
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Full name is required.');
      return;
    }
     // Validate phone number format
     const phoneRegex = /^\+213\d{8,9}$/; // Regex for +213 followed by 8 or 9 digits
     // Note: This regex is a basic example. You might need a more robust solution
     // depending on the specific valid formats in Algeria (e.g., starting digit).
     if (!phoneNumber.trim() || !phoneRegex.test(phoneNumber.trim())) {
          Alert.alert('Validation', 'Please enter a valid phone number starting with +213 followed by 8 or 9 digits.');
          return;
     }


    setIsLoading(true);
    try {
      // Call the saveUserProfile function from dataService
      // Pass the user's UID from profileData and the new fields
      await saveUserProfile(profileData.uid, {
        fullName: fullName.trim(), // Trim whitespace
        phoneNumber: phoneNumber.trim(), // Trim whitespace
        // Add other fields here if they become editable in the future
      });
      console.log("Profile saved successfully in Firestore.");
      // Alert.alert('Success', 'Profile updated successfully.'); // Maybe avoid alert if re-fetch is quick

      // Notify the parent screen to re-fetch or update state
      if (onProfileUpdated) {
          onProfileUpdated();
      }
      onClose(); // Close the modal

    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Save Failed', 'Could not save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to extract digits part of phone number for input value display
   const getPhoneNumberDigitsForInput = (fullNumber) => {
       if (!fullNumber || typeof fullNumber !== 'string') return '';
       // Return the part after +213 if the string starts with it, otherwise return the whole string
       return fullNumber.startsWith('+213') ? fullNumber.substring('+213'.length) : fullNumber;
   };


  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false} // Ensure it's not transparent
    >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
             style={styles.modalContainer}
             keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
             <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isLoading}>
                    <Ionicons name="close" size={28} color={colors.secondaryText} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 28 + SPACING / 2 }} /> {/* Spacer */}
             </View>

             <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.formSection}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                         <Ionicons name="person-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                         <TextInput
                             style={styles.input}
                             placeholder="Enter your full name"
                             placeholderTextColor={colors.placeholder}
                             value={fullName}
                             onChangeText={setFullName}
                             autoCapitalize="words"
                             returnKeyType="next"
                             editable={!isLoading}
                         />
                    </View>

                    <Text style={styles.label}>Phone Number</Text>
                     <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                         <Ionicons name="call-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                         {/* Display prefix as text */}
                         <Text style={styles.phonePrefix}>+213</Text>
                         <TextInput
                             style={styles.input}
                             placeholder="Digits after +213" // Hint for local part
                             placeholderTextColor={colors.placeholder}
                             value={getPhoneNumberDigitsForInput(phoneNumber)} // Display only digits after prefix
                             onChangeText={handlePhoneNumberChange} // Update the full number state
                             keyboardType="phone-pad"
                             autoCapitalize="none"
                             returnKeyType="done"
                             editable={!isLoading}
                             // Max length is for the digits part (e.g., 9 or 10)
                             maxLength={10} // Set a reasonable max length for digits
                         />
                     </View>

                     {/* You can add more fields here following the same pattern */}
                     {/* For example, a field for username or a short bio */}


                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={isLoading || !fullName.trim() || !phoneNumber.trim()} // Disable if loading or fields are empty
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>

             </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
    </Modal>
  );
};

export default EditProfileModal;