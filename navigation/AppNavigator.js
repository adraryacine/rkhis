// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  useColorScheme, // Using React Native's hook for basic theme detection
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Platform
} from 'react-native';


// Import the useAuth hook from our context
import { useAuth } from '../contexts/AuthContext';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import HotelReservationScreen from '../screens/HotelReservationScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';

// NEW: Detail screens
import HotelDetailScreen from '../screens/HotelDetailScreen';
import AttractionDetailScreen from '../screens/AttractionDetailScreen';

// Define Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Helper function to get consistent themed colors (Moved here or to a shared file)
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    border: isDarkMode ? '#38383A' : '#E0E0E0',
    // Add any other specific colors used in navigation headers/tabs
    headerBackground: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    headerText: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    tabBackground: isDarkMode ? '#1C1C1E' : '#FFFFFF', // Use background for tab bar background
    tabActiveTint: isDarkMode ? '#0A84FF' : '#007AFF',
    tabInactiveTint: isDarkMode ? '#8E8E93' : '#757575',
});


// Stack Navigator for the main app flow (after authentication)
function MainStack() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.headerBackground,
          borderBottomWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: colors.headerText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false, // Often preferred on iOS
        cardStyle: {
            backgroundColor: colors.background,
        },
        headerShown: false, // Hide header by default, let individual screens manage
      }}
    >
      {/* Main tab navigator is the entry point after auth */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* Individual screens accessible from tabs or other parts of the app */}
      {/* Ensure these components are correctly imported and exported as default */}
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} options={{ headerShown: true, title: 'Hotel Details' }} />
      <Stack.Screen name="AttractionDetail" component={AttractionDetailScreen} options={{ headerShown: true, title: 'Attraction Details' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: true, title: 'Terms of Service' }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: true, title: 'Privacy Policy' }} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: true, title: 'Help Center' }} />
      <Stack.Screen name="Hotels" component={HotelReservationScreen} options={{ headerShown: true, title: 'Hotels' }} />

      {/* Placeholder Screens (currently commented out) - Ensure they are also correctly imported/exported as default if uncommented */}
      {/* <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} /> */}
      {/* <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: 'Change Password' }} /> */}
      {/* <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: true, title: 'Notification Settings' }} /> */}
      {/* <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ headerShown: true, title: 'Payment Methods' }} /> */}
      {/* <Stack.Screen name="AboutUs" component={AboutUsScreen} options={{ headerShown: true, title: 'About Us' }} /> */}
      {/* <Stack.Screen name="DataExport" component={DataExportScreen} options={{ headerShown: true, title: 'Data Export' }} /> */}
      {/* <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ headerShown: true, title: 'Delete Account' }} /> */}
      {/* <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} options={{ headerShown: true, title: 'Language' }} /> */}
      {/* <Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} options={{ headerShown: true, title: 'Currency' }} /> */}
      {/* <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} options={{ headerShown: true, title: 'Theme' }} /> */}
      {/* <Stack.Screen name="DateTimeSettings" component={DateTimeSettingsScreen} options={{ headerShown: true, title: 'Date & Time' }} /> */}
      {/* <Stack.Screen name="ClearCacheSettings" component={ClearCacheSettingsScreen} options={{ headerShown: true, title: 'Clear Cache' }} /> */}
      {/* <Stack.Screen name="DataUsageSettings" component={DataUsageSettingsScreen} options={{ headerShown: true, title: 'Data Usage' }} /> */}
      {/* <Stack.Screen name="ProfileVisibilitySettings" component={ProfileVisibilitySettingsScreen} options={{ headerShown: true, title: 'Profile Visibility' }} /> */}
      {/* <Stack.Screen name="LocationTrackingSettings" component={LocationTrackingSettingsScreen} options={{ headerShown: true, title: 'Location Tracking' }} /> */}
      {/* <Stack.Screen name="DataAnalyticsSettings" component={DataAnalyticsSettingsScreen} options={{ headerShown: true, title: 'Data Analytics' }} /> */}
      {/* <Stack.Screen name="ContactUsSettings" component={ContactUsSettingsScreen} options={{ headerShown: true, title: 'Contact Us' }} /> */}

    </Stack.Navigator>
  );
}

// Bottom Tab Navigator (Authenticated)
function BottomTabNavigator() {
   const colorScheme = useColorScheme();
   const isDarkMode = colorScheme === 'dark';
   const colors = getThemedColors(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          // Map route names to Ionicons names
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
             iconName = focused ? 'person' : 'person-outline';
          }

          // You can return any component here as the icon
          return <Ionicons name={iconName || 'alert-circle-outline'} size={size} color={color} />; // Default icon if name not matched
        },
        tabBarActiveTintColor: colors.tabActiveTint, // Themed active color
        tabBarInactiveTintColor: colors.tabInactiveTint, // Themed inactive color
        tabBarStyle: {
             backgroundColor: colors.tabBackground, // Themed tab bar background
             borderTopWidth: 0, // Remove top border
             elevation: 8, // Android shadow
             shadowColor: '#000', // iOS shadow
             shadowOffset: { width: 0, height: -2 },
             shadowOpacity: 0.1,
             shadowRadius: 4,
             height: Platform.OS === 'ios' ? 90 : 60, // Adjust height for iOS SafeArea
             paddingBottom: Platform.OS === 'ios' ? 25 : 5, // Adjust padding for iOS SafeArea
             paddingTop: 5,
        },
        tabBarLabelStyle: {
            fontSize: 12,
             fontWeight: '600',
        },
        headerShown: false, // Hide header for screens inside the tab navigator; Stack Navigator handles the overall header if needed
      })}
    >
      {/* Screens shown in the bottom tab bar */}
      {/* Ensure these components are correctly imported and exported as default */}
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorites' }} />
       <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}


// Authentication Stack Navigator
function AuthStack() {
   const colorScheme = useColorScheme();
   const isDarkMode = colorScheme === 'dark';
   const colors = getThemedColors(isDarkMode); // Use the same color helper

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide header for auth screens
        cardStyle: {
            backgroundColor: colors.background, // Themed background for auth screens
        },
      }}
    >
      {/* Ensure these components are correctly imported and exported as default */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
       {/* Include legal screens within AuthStack so they can be accessed pre-login */}
       <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
       <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
       {/* Forgot Password screen could go here */}
       {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
    </Stack.Navigator>
  );
}

// Main App Navigator: Switches between Auth and Main flow based on authentication status
function AppNavigator() {
    // Use the useAuth hook to get the current authentication state
    const { currentUser, isLoadingAuth } = useAuth();
    const colorScheme = useColorScheme(); // Needed here for themed loading screen
    const isDarkMode = colorScheme === 'dark';
    const colors = getThemedColors(isDarkMode);


    // Show a loading screen while the auth state is being determined
    if (isLoadingAuth) {
         // Basic loading view (can be replaced with a dedicated SplashScreen component)
        return (
            <View style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, {marginTop: 10, fontSize: 16, color: colors.secondaryText}]}>Loading app...</Text>
            </View>
        );
    }

  return (
      // If currentUser exists (user is logged in), render the MainStack.
      // Otherwise, render the AuthStack.
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
            <Stack.Screen name="App" component={MainStack} />
        ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
        )}
    </Stack.Navigator>
  );
}

// Add styles for the loading view
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
     loadingText: {
         // Style applied inline above
     }
});


export default AppNavigator;