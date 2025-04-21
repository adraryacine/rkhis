// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  Image, // <-- Import Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
// Corrected path based on your file structure: '../authService' not '../services/authService'
import { login, resetPassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useColorScheme } from 'react-native';

const { width } = Dimensions.get('window');
const SPACING = 15;

// Helper function to get consistent themed colors
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#000000' : '#E0F7FA', // Match AuthStack background
    card: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    inputBorder: isDarkMode ? '#38383A' : '#E0E0E0',
    placeholder: isDarkMode ? '#636366' : '#B0BEC5',
    buttonText: isDarkMode ? '#FFFFFF' : '#FFFFFF', // Button text is usually white for contrast
    socialIcon: isDarkMode ? '#FFFFFF' : '#555', // Social icon color
});

// Helper function to get themed styles
const getThemedLoginStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SPACING * 4,
      paddingHorizontal: SPACING * 2,
  },
  authContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  authLogo: {
    width: SPACING * 10,
    height: SPACING * 10,
    marginBottom: SPACING * 3,
  },
  authTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SPACING * 1.5,
  },
  authSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: SPACING * 4,
  },
  formContainer: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: SPACING * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING,
    marginBottom: SPACING * 1.5,
    height: 55,
  },
  inputIcon: {
    marginRight: SPACING,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text, // Color applied dynamically
  },
  passwordToggle: {
      padding: SPACING / 2,
      marginLeft: SPACING,
  },
   optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING * 2,
   },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: SPACING / 2,
        color: colors.secondaryText, // Color applied dynamically
    },
    linkText: {
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
  button: {
    paddingVertical: SPACING * 1.5,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING * 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttonText, // Color applied dynamically
  },
   orText: {
        textAlign: 'center',
        fontSize: 14,
        marginBottom: SPACING * 2,
        opacity: 0.8,
        color: colors.secondaryText, // Color applied dynamically
   },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING * 2.5,
        gap: SPACING * 2, // Space between buttons
    },
    socialButton: {
        flex: 1,
        paddingVertical: SPACING,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: colors.background, // Use background color for social buttons
        borderColor: colors.inputBorder, // BorderColor applied dynamically
    },
   registerLinkContainer: {
       flexDirection: 'row',
       justifyContent: 'center',
       marginTop: SPACING * 2,
   }
});


function LoginScreen() {
  const navigation = useNavigation();
  // Use AuthContext to determine if already logged in
  const { currentUser, isLoadingAuth } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedLoginStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state for login action
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // State for "Remember Me"

  // Navigate away if already logged in (This useEffect will run when currentUser changes)
  React.useEffect(() => {
    // Check isLoadingAuth to ensure the initial auth check is complete
    if (!isLoadingAuth && currentUser) {
      console.log("LoginScreen: User already logged in, navigating to MainTabs.");
      // User is already logged in, navigate to Home
      navigation.replace('MainTabs'); // Use replace to prevent going back to login
    }
  }, [currentUser, isLoadingAuth, navigation]); // Dependencies: Re-run effect if these values change

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true); // Start loading for the login action
    try {
      await login(email, password);
      // The onAuthStateChanged listener in AuthContext will detect the user state change
      // and the AppNavigator will automatically switch to the MainStack.
      // No explicit navigation.navigate('MainTabs') needed here on success.
      console.log("Login attempt successful. AuthContext will handle navigation.");

      // TODO: If "Remember Me" is checked, implement persistence logic here
      // await auth.setPersistence(rememberMe ? browserLocalPersistence : browserSessionPersistence); // For web
      // AsyncStorage logic or other native persistence might be needed for RN

    } catch (error) {
      // Handle Firebase Auth errors
      let errorMessage = 'Login failed. Please try again.';
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This user account has been disabled.';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password': // Combined wrong password and user not found for security
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/too-many-requests':
             errorMessage = 'Too many failed login attempts. Try again later.';
             break;
          default:
            errorMessage = `An unexpected error occurred: ${error.message}`;
            break;
        }
      }
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleForgotPassword = async () => {
      if (!email) {
          Alert.alert('Password Reset', 'Please enter your email to receive a password reset link.');
          return;
      }
      setIsLoading(true); // Optional: Show loading for reset action
      try {
          await resetPassword(email);
          Alert.alert('Password Reset', 'A password reset link has been sent to your email address.');
      } catch (error) {
           let errorMessage = 'Failed to send password reset email.';
            if (error.code === 'auth/invalid-email') {
                 errorMessage = 'Invalid email format.';
             } else if (error.code === 'auth/user-not-found') {
                 errorMessage = 'No user found with this email address.';
             } else {
                errorMessage = `An error occurred: ${error.message}`;
             }
           Alert.alert('Password Reset Error', errorMessage);
      } finally {
          setIsLoading(false); // Optional: Stop loading
      }
  };

  // Show a loading indicator if AuthContext is still checking auth state
  // or if the login action is in progress.
  // We specifically check !currentUser during the isLoading check to avoid
  // showing a loading screen *after* a successful login, right before navigation.
  if (isLoadingAuth || (isLoading && !currentUser)) {
       return (
           <SafeAreaView style={[styles.container, styles.centered]}>
               <ActivityIndicator size="large" color={colors.accent} />
               <Text style={[styles.loadingText, { marginTop: SPACING, color: colors.secondaryText }]}>
                   {isLoadingAuth ? 'Checking session...' : 'Logging in...'}
               </Text>
           </SafeAreaView>
       );
   }

   // If currentUser exists and isLoadingAuth is false, the useEffect above
   // should have already triggered navigation. If we somehow land here,
   // we render null or a simple view as a safeguard.
   if (currentUser) {
       return null;
   }


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust offset if needed
    >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.authContent}>
                {/* Replace with your app logo */}
                <Image
                    source={require('../assets/images/icon.png')} // Corrected path to use your app icon
                    style={styles.authLogo}
                    resizeMode="contain"
                />
                <Text style={styles.authTitle}>Welcome Back!</Text>
                <Text style={styles.authSubtitle}>Sign in to continue exploring Bejaia</Text>

                <View style={styles.formContainer}>
                    <View style={[styles.inputContainer, { borderColor: colors.inputBorder }]}>
                        <Ionicons name="mail-outline" size={22} color={colors.secondaryText} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Email"
                            placeholderTextColor={colors.placeholder}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={setEmail}
                            value={email}
                            editable={!isLoading} // Disable input while loading
                        />
                    </View>
                    <View style={[styles.inputContainer, { borderColor: colors.inputBorder }]}>
                        <Ionicons name="lock-closed-outline" size={22} color={colors.secondaryText} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Password"
                            placeholderTextColor={colors.placeholder}
                            secureTextEntry={!showPassword}
                            onChangeText={setPassword}
                            value={password}
                            editable={!isLoading} // Disable input while loading
                        />
                         <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle} disabled={isLoading}>
                             <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.secondaryText} />
                         </TouchableOpacity>
                    </View>

                     <View style={styles.optionsRow}>
                         <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxContainer} disabled={isLoading}>
                             <Ionicons
                                 name={rememberMe ? "checkbox-outline" : "square-outline"}
                                 size={20}
                                 color={rememberMe ? colors.accent : colors.secondaryText}
                             />
                             <Text style={[styles.optionText, { color: colors.secondaryText }]}>Remember me</Text>
                         </TouchableOpacity>
                         <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                             <Text style={[styles.optionText, styles.linkText, { color: colors.accent }]}>Forgot Password?</Text>
                         </TouchableOpacity>
                     </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.accent }]}
                        onPress={handleLogin}
                        disabled={isLoading} // Disable button while loading
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.buttonText} />
                        ) : (
                            <Text style={[styles.buttonText, { color: colors.buttonText }]}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={[styles.orText, { color: colors.secondaryText }]}>Or continue with</Text>

                    <View style={styles.socialButtonsContainer}>
                         {/* Placeholder Social Buttons */}
                         <TouchableOpacity style={[styles.socialButton, { borderColor: colors.inputBorder }]} onPress={() => Alert.alert("Coming Soon", "Social login not yet implemented.")} disabled={isLoading}>
                             <FontAwesome name="google" size={28} color={colors.socialIcon} />
                         </TouchableOpacity>
                         <TouchableOpacity style={[styles.socialButton, { borderColor: colors.inputBorder }]} onPress={() => Alert.alert("Coming Soon", "Social login not yet implemented.")} disabled={isLoading}>
                             <FontAwesome name="facebook" size={28} color={colors.socialIcon} />
                         </TouchableOpacity>
                          {/* Add more social providers as needed */}
                     </View>
                </View>

                 <View style={styles.registerLinkContainer}>
                     <Text style={[styles.optionText, { color: colors.secondaryText }]}>Don't have an account?</Text>
                     <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
                         <Text style={[styles.optionText, styles.linkText, { color: colors.accent, marginLeft: 5 }]}>Sign Up</Text>
                     </TouchableOpacity>
                 </View>

            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;