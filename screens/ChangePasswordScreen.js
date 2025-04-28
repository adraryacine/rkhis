// screens/ChangePasswordScreen.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Use safe-area-context for better control
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // Good for forms
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

// Import Firebase Auth
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { app } from '../firebase'; // Ensure this path is correct and exports 'app'

const auth = getAuth(app); // Get the auth instance

const SPACING = 16; // Use the same spacing as ProfileScreen for consistency

// Helper function to get consistent themed colors (copy from AppNavigator or use a shared file)
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#000000' : '#F8F9FA', // Use pure black for dark mode background
    card: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    text: isDarkMode ? '#F2F2F7' : '#1A1A1A',
    secondaryText: isDarkMode ? '#AEAEB2' : '#6B7280', // Match ProfileScreen secondaryText
    accent: isDarkMode ? '#0A84FF' : '#007AFF', // Primary/Accent color
    border: isDarkMode ? '#38383A' : '#E5E7EB', // Match ProfileScreen separator/border
    inputBackground: isDarkMode ? '#2C2C2E' : '#F2F2F7', // Slightly different input background
    inputText: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    errorText: isDarkMode ? '#FF453A' : '#FF3B30', // Danger color
    buttonBackground: isDarkMode ? '#0A84FF' : '#007AFF', // Primary button color
    buttonText: '#FFFFFF', // White text on button
});

// Helper function to get themed styles
const getThemedStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: SPACING * 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SPACING * 2,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING * 1.5,
  },
  label: {
    fontSize: 15,
    color: colors.secondaryText,
    marginBottom: SPACING * 0.5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.inputBackground,
    color: colors.inputText,
    paddingVertical: Platform.OS === 'ios' ? SPACING * 1.2 : SPACING,
    paddingHorizontal: SPACING,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    fontSize: 14,
    color: colors.errorText,
    marginTop: SPACING,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.buttonBackground,
    paddingVertical: SPACING * 1.2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING * 2,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
      opacity: 0.5,
  },
});

function ChangePasswordScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = useMemo(() => getThemedColors(isDarkMode), [isDarkMode]);
  const styles = useMemo(() => getThemedStyles(colors), [colors]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = auth.currentUser; // Get the current logged-in user

  // Input validation
  const validateInputs = useCallback(() => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Please fill in all fields.');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return false;
    }
    if (newPassword.length < 6) { // Firebase minimum password length
        setError('New password must be at least 6 characters long.');
        return false;
    }
    setError(null); // Clear any previous errors
    return true;
  }, [currentPassword, newPassword, confirmNewPassword]);

  // Handle password change logic
  const handleChangePassword = useCallback(async () => {
    if (!user) {
        setError("No user is currently logged in.");
        return;
    }

    if (!validateInputs()) {
      return; // Stop if validation fails
    }

    setIsLoading(true);
    setError(null); // Clear error before starting

    try {
        // --- Step 1: Re-authenticate the user with their current password ---
        // This is required by Firebase for security reasons, especially if
        // the user signed in a while ago.
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        console.log("Re-authentication successful.");

        // --- Step 2: Update the password ---
        await updatePassword(user, newPassword);
        console.log("Password updated successfully.");

        // --- Success Feedback ---
        Alert.alert(
            'Success',
            'Your password has been changed successfully.',
            [{ text: 'OK', onPress: () => {
                // Clear fields on success
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                // Optionally navigate back after a short delay or on OK press
                navigation.goBack();
            }}]
        );

    } catch (err) {
        console.error('Error changing password:', err);
        // Handle specific Firebase errors
        let errorMessage = 'Failed to change password. Please try again.';
        switch (err.code) {
            case 'auth/invalid-credential': // Or auth/wrong-password depending on SDK version
            case 'auth/wrong-password':
                errorMessage = 'Incorrect current password.';
                break;
            case 'auth/requires-recent-login': // Although reauthenticate should handle this
                 errorMessage = 'Please log out and log back in to change your password.';
                 break;
            case 'auth/email-already-in-use': // Should not happen for password change
                 errorMessage = 'This email is already in use.';
                 break;
            case 'auth/weak-password':
                 errorMessage = 'New password is too weak. Choose a stronger one.';
                 break;
            default:
                errorMessage = err.message || 'An unexpected error occurred.';
        }
        setError(errorMessage);
    } finally {
        setIsLoading(false); // Always stop loading
    }
  }, [user, currentPassword, newPassword, validateInputs, navigation]); // Add navigation to deps

  // Render nothing or a message if user is null (shouldn't happen if accessed from authenticated flow)
  if (!user) {
       return (
           <SafeAreaView style={styles.safeArea}>
               <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>
               <View style={styles.container}>
                   <Text style={styles.title}>Change Password</Text>
                   <Text style={styles.errorText}>User not found. Please log in again.</Text>
               </View>
           </SafeAreaView>
       );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
        {/* Use background color for translucent status bar handling on Android */}
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        // Ensure scroll view works correctly when keyboard is open
        extraScrollHeight={Platform.select({ ios: 0, android: 20 })}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled" // Dismiss keyboard when tapping outside inputs
      >
        <Text style={styles.title}>Change Password</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor={colors.secondaryText}
            keyboardType="default"
            returnKeyType="next"
            autoCapitalize="none"
            textContentType="password" // iOS autofill
            autoCorrect={false}
            editable={!isLoading} // Disable input while loading
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password (min 6 characters)"
            placeholderTextColor={colors.secondaryText}
            keyboardType="default"
            returnKeyType="next"
            autoCapitalize="none"
            textContentType="newPassword" // iOS autofill
            autoCorrect={false}
            editable={!isLoading} // Disable input while loading
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            placeholder="Confirm new password"
            placeholderTextColor={colors.secondaryText}
            keyboardType="default"
            returnKeyType="done"
            autoCapitalize="none"
             textContentType="newPassword" // iOS autofill
            autoCorrect={false}
            editable={!isLoading} // Disable input while loading
            onSubmitEditing={handleChangePassword} // Trigger change on done key press
          />
        </View>

        {/* Display Error */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Change Password Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={isLoading} // Disable button while loading
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.buttonText} />
          ) : (
            <Text style={styles.buttonText}>Change Password</Text>
          )}
        </TouchableOpacity>

      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

export default ChangePasswordScreen;