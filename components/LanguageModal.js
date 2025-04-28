// components/LanguageModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
// Assuming dataService.js is in the '../services/' directory relative to components
import { saveUserProfile } from '../services/dataService';


// Use the same color scheme logic
const getThemedColors = (isDarkMode) => ({
  text: isDarkMode ? '#E0E0E0' : '#1A1A1A',
  background: isDarkMode ? '#121212' : '#F0F2F5',
  cardBackground: isDarkMode ? '#1C1C1E' : '#FFFFFF',
  tint: isDarkMode ? '#0A84FF' : '#007AFF',
  secondaryText: isDarkMode ? '#A9A9A9' : '#616161',
  border: isDarkMode ? '#3A3A3A' : '#E0E0E0',
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
    backgroundColor: colors.cardBackground,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
     // Adjust spacing slightly to center better visually
    marginLeft: SPACING,
    marginRight: SPACING,
  },
  closeButton: {
    padding: SPACING / 2,
    // Give it a fixed small width to prevent title shift
    width: 28 + SPACING,
    alignItems: 'flex-start', // Align icon to the left
  },
    optionsContainer: {
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        margin: SPACING * 2, // Margin around the options block
        overflow: 'hidden', // Contain borders/separators
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING * 1.2,
        paddingHorizontal: SPACING * 1.5,
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
        backgroundColor: colors.cardBackground,
    },
    optionButtonLast: {
        borderBottomWidth: 0,
    },
    optionText: {
        flex: 1,
        fontSize: 17,
        color: colors.text,
    },
    selectedIcon: {
        marginLeft: SPACING,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject, // Cover the whole modal content area
        backgroundColor: colors.cardBackground, // Match card background
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1, // Ensure it's above other content
    },
     loadingText: {
         marginTop: SPACING,
         color: colors.secondaryText,
         fontSize: 16,
     }
});

// Define available languages
const availableLanguages = [
  { code: 'system', name: 'System Default' },
  { code: 'fr', name: 'Français (French)' },
  // Add more languages here later
];


const LanguageModal = ({ isVisible, onClose, profileData, onLanguageChanged }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedStyles(colors);

  // Use state to manage the currently selected language *within the modal*
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('system');
  const [isLoading, setIsLoading] = useState(false); // Loading state for saving

  // Set initial selected language when modal opens
  useEffect(() => {
    if (isVisible && profileData?.preferences?.language) {
      setSelectedLanguageCode(profileData.preferences.language);
    } else if (isVisible) {
        // Default to system if no preference is set when opening and no preference found
        setSelectedLanguageCode('system');
    }
    // Note: This doesn't need to re-run on profileData *updates* if the modal is closed,
    // but it's safe to include profileData if you expect it might update while the modal is open.
  }, [isVisible, profileData]);


  const handleSelectLanguage = async (code) => {
    // If the selected language is already the current one, just close the modal
    // or handle it as you prefer.
    // For simplicity, let's save only if it's different.
    if (selectedLanguageCode === code && profileData?.preferences?.language === code) {
        console.log("Language preference already set to:", code, "Closing modal.");
        onClose();
        return;
    }

    setIsLoading(true); // Start saving loading
    try {
      // Save the selected language code to Firestore under preferences
      await saveUserProfile(profileData.uid, {
         preferences: {
             ...(profileData.preferences || {}), // Copy existing preferences
             language: code, // Set the new language code
         }
      });
      console.log(`Language preference saved successfully: ${code}`);
      // Update local state immediately on success for visual feedback within the modal
      setSelectedLanguageCode(code);

      // Alert.alert('Success', `Language preference set to ${availableLanguages.find(lang => lang.code === code)?.name || code}.`);

      // Notify parent screen (ProfileScreen) that preference might have changed.
      // ProfileScreen can then re-fetch or update its state.
      if (onLanguageChanged) {
          onLanguageChanged(code); // Optionally pass the new code
      }

      // Close the modal after successful save
      onClose();

    } catch (error) {
      console.error('Error saving language preference:', error);
      Alert.alert('Save Failed', 'Could not save language preference. Please try again.');
    } finally {
      setIsLoading(false); // Stop saving loading
    }
  };


  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
       transparent={false}
    >
        <SafeAreaView style={styles.safeArea}>
             <View style={styles.header}>
                {/* Disable close button while saving */}
                <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isLoading}>
                    <Ionicons name="close" size={28} color={colors.secondaryText} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Language</Text>
                 {/* No save button needed in header if applying on tap */}
                 <View style={{ width: 28 + SPACING }} /> {/* Spacer for symmetry */}
             </View>

            {/* Show loading overlay while saving */}
            {isLoading && (
                 <View style={styles.loadingOverlay}>
                     <ActivityIndicator size="large" color={colors.tint} />
                     <Text style={styles.loadingText}>Saving preference...</Text>
                 </View>
            )}

            <View style={styles.optionsContainer}>
                {availableLanguages.map((lang, index) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.optionButton,
                            index === availableLanguages.length - 1 && styles.optionButtonLast,
                        ]}
                        onPress={() => handleSelectLanguage(lang.code)}
                        // Disable individual options while saving any change
                        disabled={isLoading}
                        activeOpacity={isLoading ? 1 : 0.7} // Reduce opacity when disabled
                    >
                        <Text style={styles.optionText}>{lang.name}</Text>
                        {selectedLanguageCode === lang.code && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.tint} style={styles.selectedIcon} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

        </SafeAreaView>
    </Modal>
  );
};

export default LanguageModal;