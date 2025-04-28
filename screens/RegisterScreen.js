// screens/RegisterScreen.js
import React, { useState, useEffect } from 'react'; // Import useEffect
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
  ProgressBarAndroid, // Android specific for password strength
  ProgressViewIOS, // iOS specific for password strength
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// Corrected path based on your file structure: '../authService'
// import { register } from '../services/authService'; // We will modify this import below
import { useColorScheme } from 'react-native';

// Import the specific register function from authService
// Make sure authService is set up to accept fullName and phoneNumber
import { register as authRegister } from '../services/authService';


const { width } = Dimensions.get('window');
const SPACING = 15; // Consistent spacing unit

// Helper function to get consistent themed colors (copied from your original)
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#000000' : '#E0F7FA', // Match AuthStack background
    card: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    inputBorder: isDarkMode ? '#38383A' : '#E0E0E0',
    placeholder: isDarkMode ? '#636366' : '#B0BEC5',
    buttonText: isDarkMode ? '#FFFFFF' : '#FFFFFF', // Button text color
    success: isDarkMode ? '#30D158' : '#34C759', // Green for strong password
    warning: isDarkMode ? '#FF9F0A' : '#FFCC00', // Yellow for moderate password
    danger: isDarkMode ? '#FF453A' : '#FF3B30', // Red for weak password
});

// Helper function to get themed styles (copied from your original, adjusted for new fields)
const getThemedRegisterStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
      flexGrow: 1, // Allow content to grow if needed
      justifyContent: 'center', // Center content vertically
      alignItems: 'center',
      paddingVertical: SPACING * 4,
      paddingHorizontal: SPACING * 2,
  },
  authContent: {
    width: '100%',
    maxWidth: 400, // Max width for larger screens
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
    backgroundColor: colors.card, // Ensure input background matches card
  },
  inputIcon: {
    marginRight: SPACING,
  },
   phonePrefix: {
        fontSize: 16,
        color: colors.text,
        marginRight: 4, // Small space between prefix and input
   },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text, // Color applied dynamically
    paddingVertical: 0, // Remove default padding
    paddingHorizontal: 0, // Remove default padding
  },
  passwordToggle: {
      padding: SPACING / 2,
      marginLeft: SPACING,
  },
    strengthMeterContainer: {
        width: '100%',
        marginBottom: SPACING * 1.5,
        // Align with input padding - no horizontal padding needed here as it's inside formContainer
    },
    strengthFeedbackText: {
        fontSize: 12,
        marginTop: SPACING * 0.5,
        textAlign: 'right',
        fontWeight: '500',
        // Color applied dynamically based on strength
    },
    termsContainer: {
         marginBottom: SPACING * 2.5,
         paddingHorizontal: SPACING, // Add horizontal padding to align text
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: SPACING * 0.5, // Indent checkbox text slightly
        // Color applied dynamically
    },
    linkText: {
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
  button: {
    paddingVertical: SPACING * 1.5,
    borderRadius: 12,
    alignItems: 'center',
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
        // Color applied dynamically
   },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING * 2.5,
        gap: SPACING * 2,
    },
    socialButton: {
        flex: 1,
        paddingVertical: SPACING,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: colors.background, // Use background color for social buttons
        // BorderColor applied dynamically
    },
   loginLinkContainer: {
       flexDirection: 'row',
       justifyContent: 'center',
       marginTop: SPACING * 2,
   }
});


function RegisterScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedRegisterStyles(colors);

  // Add new state variables for full name and phone number
   const [fullName, setFullName] = useState('');
   const [email, setEmail] = useState('');
   const [phoneNumber, setPhoneNumber] = useState('+213'); // Initialize with prefix
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const [passwordStrength, setPasswordStrength] = useState(0);
   const [passwordFeedback, setPasswordFeedback] = useState('');

   // Simple password strength check (can be improved)
   const checkPasswordStrength = (pwd) => {
       let strength = 0;
       let feedback = '';

       if (pwd.length >= 8) strength += 0.25;
       if (/[A-Z]/.test(pwd)) strength += 0.25;
       if (/[a-z]/.test(pwd)) strength += 0.25;
       if (/[0-9]/.test(pwd)) strength += 0.25;
       if (/[^A-Za-z0-9]/.test(pwd)) strength += 0.25; // Bonus for special characters

       // Cap strength at 1 (100%)
       strength = Math.min(strength, 1);

       if (pwd.length === 0) {
           feedback = ''; // No feedback when empty
       } else if (pwd.length < 8) {
           feedback = 'Too short (min 8 characters)';
       } else if (strength < 0.4) { // Adjusted thresholds slightly for feedback text
            feedback = 'Weak password';
       } else if (strength < 0.7) {
            feedback = 'Moderate password';
       } else {
           feedback = 'Strong password';
       }

       setPasswordStrength(strength);
       setPasswordFeedback(feedback);
   };

   // Recalculate password strength when the password input changes
   useEffect(() => { // Use useEffect here
       checkPasswordStrength(password);
   }, [password]);

   // Handle phone number input change, enforcing the +213 prefix
   const handlePhoneNumberChange = (text) => {
       if (text.startsWith('+213') || text === '') {
           setPhoneNumber(text);
       } else {
           // If user somehow bypasses and enters text not starting with +213,
           // either reset or try to prepend. Resetting is simpler.
           setPhoneNumber('+213');
           Alert.alert('Invalid Input', 'Phone number must start with +213.');
       }
   };


  const handleRegister = async () => {
    // Add checks for new fields
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
     if (password.length < 8) {
         Alert.alert('Error', 'Password must be at least 8 characters long.');
         return;
     }
     if (password !== confirmPassword) {
         Alert.alert('Error', 'Passwords do not match.');
         return;
     }
     // Add basic phone number validation
     // Assumes +213 followed by at least 8 digits (common format in Algeria)
     if (!phoneNumber.startsWith('+213') || phoneNumber.length < 11) { // +213 plus minimum 8 digits
         Alert.alert('Error', 'Please enter a valid phone number starting with +213.');
         return;
     }


    setIsLoading(true); // Start loading for the registration action
    try {
        // Call the register function from authService with the new data
        // Make sure your authService.register function accepts these parameters
        const user = await authRegister(email, password, fullName, phoneNumber);

        console.log("User registered and profile saved (via authService). UID:", user.uid);

        Alert.alert('Success', 'Account created successfully! Please log in.');
        navigation.navigate('Login'); // Go back to login after successful registration
    } catch (error) {
      // Handle errors from authService (Firebase Auth errors or profile save errors)
      let errorMessage = 'Registration failed. Please try again.';
       if (error.code) { // Check for Firebase Auth error codes
           switch (error.code) {
               case 'auth/invalid-email':
                   errorMessage = 'Invalid email format.';
                   break;
               case 'auth/email-already-in-use':
                   errorMessage = 'This email address is already in use.';
                   break;
               case 'auth/operation-not-allowed':
                    errorMessage = 'Email/Password accounts are not enabled. Please contact support.';
                    break;
               case 'auth/weak-password':
                   errorMessage = 'Password is too weak. Please choose a stronger password.';
                   break;
               default:
                 errorMessage = `An unexpected error occurred: ${error.message}`;
                 break;
           }
       } else if (error.message.includes("profile save failed")) { // Check for specific error message from authService if you implemented one
            errorMessage = 'Account created but profile save failed. Please contact support.';
       }
       else {
           // Generic error message for other errors
            errorMessage = `An unexpected error occurred: ${error.message}`;
       }
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Function to get strength bar color
  const getStrengthColor = (strength) => {
      if (password.length === 0) return colors.secondaryText; // Grey when empty
      if (strength < 0.4) return colors.danger;
      if (strength < 0.7) return colors.warning;
      return colors.success;
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
                     source={require('../assets/images/icon.png')} // Use your app icon
                     style={styles.authLogo}
                     resizeMode="contain"
                 />
                 <Text style={styles.authTitle}>Join Bejaia Tourism</Text>
                 <Text style={styles.authSubtitle}>Create your account to discover the best of Bejaia</Text>

                 <View style={styles.formContainer}>

                     {/* Full Name Input */}
                     <View style={[styles.inputContainer, { borderColor: colors.inputBorder }]}>
                         <Ionicons name="person-outline" size={22} color={colors.secondaryText} style={styles.inputIcon} />
                         <TextInput
                             style={[styles.input, { color: colors.text }]}
                             placeholder="Full Name"
                             placeholderTextColor={colors.placeholder}
                             autoCapitalize="words"
                             onChangeText={setFullName}
                             value={fullName}
                              editable={!isLoading}
                         />
                     </View>

                     {/* Email Input */}
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
                              editable={!isLoading}
                         />
                     </View>

                     {/* Phone Number Input */}
                     <View style={[styles.inputContainer, { borderColor: colors.inputBorder }]}>
                         <Ionicons name="call-outline" size={22} color={colors.secondaryText} style={styles.inputIcon} />
                         <Text style={[styles.phonePrefix, { color: colors.text }]}>+213</Text> {/* Display the prefix */}
                         <TextInput
                             style={[styles.input, { color: colors.text }]}
                             placeholder="Phone Number (e.g., 555123456)" // Hint for local part
                             placeholderTextColor={colors.placeholder}
                             keyboardType="phone-pad"
                             autoCapitalize="none"
                             // We handle the prefix logic in the onChangeText handler
                             onChangeText={(text) => handlePhoneNumberChange('+213' + text.replace('+213', ''))} // Only update if it starts with +213 or becomes empty
                             value={phoneNumber.replace('+213', '')} // Display without the prefix for easier input
                             editable={!isLoading}
                             maxLength={11} // +213 (4 chars) + max 9 digits = 13 total, input displays 9, so max length is 9 for the part after +213
                         />
                     </View>


                      {/* Password Input */}
                      <View style={[styles.inputContainer, { borderColor: colors.inputBorder }]}>
                         <Ionicons name="lock-closed-outline" size={22} color={colors.secondaryText} style={styles.inputIcon} />
                         <TextInput
                             style={[styles.input, { color: colors.text }]}
                             placeholder="Password"
                             placeholderTextColor={colors.placeholder}
                             secureTextEntry={!showPassword}
                             onChangeText={setPassword}
                             value={password}
                              editable={!isLoading}
                         />
                          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle} disabled={isLoading}>
                              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.secondaryText} />
                          </TouchableOpacity>
                     </View>

                     {/* Password Strength Meter */}
                     {/* Only show meter if password has content */}
                     {password.length > 0 && (
                         <View style={styles.strengthMeterContainer}>
                             {Platform.OS === 'android' ? (
                                 <ProgressBarAndroid
                                     styleAttr="Horizontal"
                                     indeterminate={false}
                                     progress={passwordStrength}
                                     style={{ width: '100%', height: 5 }}
                                     color={getStrengthColor(passwordStrength)}
                                 />
                             ) : (
                                 <ProgressViewIOS
                                     progress={passwordStrength}
                                     progressTintColor={getStrengthColor(passwordStrength)}
                                 />
                             )}
                             <Text style={[styles.strengthFeedbackText, { color: getStrengthColor(passwordStrength) }]}>
                                 {passwordFeedback}
                             </Text>
                         </View>
                     )}


                     {/* Confirm Password Input */}
                     <View style={[styles.inputContainer, { borderColor: colors.inputBorder, marginBottom: SPACING * 2.5 }]}>
                         <Ionicons name="lock-closed-outline" size={22} color={colors.secondaryText} style={styles.inputIcon} />
                         <TextInput
                             style={[styles.input, { color: colors.text }]}
                             placeholder="Confirm Password"
                             placeholderTextColor={colors.placeholder}
                             secureTextEntry={!showPassword} // Match visibility with password
                             onChangeText={setConfirmPassword}
                             value={confirmPassword}
                              editable={!isLoading}
                         />
                          {/* No separate toggle for confirm password */}
                     </View>


                     {/* Terms and Privacy Links */}
                     <View style={styles.termsContainer}>
                         <Text style={[styles.optionText, { color: colors.secondaryText, textAlign: 'center', marginLeft: 0 }]}>
                             By signing up, you agree to our{' '}
                             <Text
                                 style={[styles.linkText, { color: colors.accent }]}
                                 onPress={() => navigation.navigate('TermsOfService')} // Make sure you have these routes
                             >
                                 Terms of Service
                             </Text>{' '}
                             and{' '}
                             <Text
                                 style={[styles.linkText, { color: colors.accent }]}
                                 onPress={() => navigation.navigate('PrivacyPolicy')} // Make sure you have these routes
                             >
                                 Privacy Policy
                             </Text>.
                         </Text>
                     </View>


                     <TouchableOpacity
                         style={[styles.button, { backgroundColor: colors.accent }]}
                         onPress={handleRegister}
                         disabled={isLoading} // Disable button while loading
                     >
                         {isLoading ? (
                             <ActivityIndicator color={colors.buttonText} />
                         ) : (
                             <Text style={[styles.buttonText, { color: colors.buttonText }]}>Sign Up</Text>
                         )}
                     </TouchableOpacity>

                      {/* Social login is often on register too, placeholder */}
                      {/* <Text style={[styles.orText, { color: colors.secondaryText }]}>Or sign up with</Text>
                       <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity style={[styles.socialButton, { borderColor: colors.inputBorder }]}>
                                <FontAwesome name="google" size={28} color={colors.socialIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialButton, { borderColor: colors.inputBorder }]}>
                                <FontAwesome name="facebook" size={28} color={colors.socialIcon} />
                            </TouchableOpacity>
                       </View> */}

                 </View>

                  <View style={styles.loginLinkContainer}>
                      <Text style={[styles.optionText, { color: colors.secondaryText, marginLeft: 0 }]}>Already have an account?</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                          <Text style={[styles.optionText, styles.linkText, { color: colors.accent, marginLeft: 5 }]}>Log In</Text>
                      </TouchableOpacity>
                  </View>

             </View>
         </ScrollView>
     </KeyboardAvoidingView>
  );
}

export default RegisterScreen;