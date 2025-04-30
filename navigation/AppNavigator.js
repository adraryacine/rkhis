// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  useColorScheme,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Platform
} from 'react-native';
// No need to import NavigationContainer here if it's in App.js


// Import the useAuth hook
import { useAuth } from '../contexts/AuthContext'; // Ensure this path is correct

// Import the new SavedItemsProvider context
import { SavedItemsProvider } from '../contexts/SavedItemsContext'; // Ensure this path is correct (Assuming named export)

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import HotelReservationScreen from '../screens/HotelReservationScreen'; // Assuming this is the list of Hotels
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
// Assuming these screens exist as defined in ProfileScreen listItemsData or linked elsewhere
import ChangePasswordScreen from '../screens/ChangePasswordScreen'; // Assuming ChangePassword screen exists
// REMOVED: import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
// REMOVED: import AppearanceSettingsScreen from '../screens/AppearanceSettingsScreen';
import AboutUsScreen from '../screens/AboutUsScreen'; // Added explicitly

// NEW: Import Activity Screens
import HikingScreen from '../screens/HikingScreen';
import SwimmingScreen from '../screens/SwimmingScreen';
import ParaglidingScreen from '../screens/ParaglidingScreen';

// NEW: List Screens (Ensure these imports are correct)
import DestinationsScreen from '../screens/DestinationsScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import AttractionsScreen from '../screens/AttractionsScreen';

// Existing/Placeholder Detail screens (Ensure these imports are correct)
import HotelDetailScreen from '../screens/HotelDetailScreen';
import AttractionDetailScreen from '../screens/AttractionDetailScreen';
// You might have one generic DetailScreen or specific ones
import DetailScreen from '../screens/DetailScreen'; // Assuming a generic one for others


// Define Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Helper function to get consistent themed colors (Keep this if it's not in a shared file)
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#000000' : '#F8F9FA', // Use pure black for dark mode background
    card: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    text: isDarkMode ? '#F2F2F7' : '#1A1A1A',
    secondaryText: isDarkMode ? '#AEAEB2' : '#6B7280', // Match ProfileScreen secondaryText
    accent: isDarkMode ? '#0A84FF' : '#007AFF', // Primary/Accent color
    border: isDarkMode ? '#38383A' : '#E5E7EB', // Match ProfileScreen separator/border
    headerBackground: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    headerText: isDarkMode ? '#F2F2F7' : '#1A1A1A',
    tabBackground: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    tabActiveTint: isDarkMode ? '#0A84FF' : '#007AFF',
    tabInactiveTint: isDarkMode ? '#8E8E93' : '#757575', // Match ProfileScreen default icon color
});


// Stack Navigator for the main app flow (after authentication)
// This Stack should be wrapped by SavedItemsProvider
function MainStack() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);

  return (
    // SavedItemsProvider is here, so all screens in MainStack have access
    <SavedItemsProvider>
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
          headerBackTitleVisible: false,
          cardStyle: {
              backgroundColor: colors.background,
          },
          headerShown: false, // Hide header by default for the tab navigator screen
        }}
      >
        {/* Main tab navigator is the entry point after auth */}
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

        {/* Activity Screens */}
        <Stack.Screen
          name="Hiking"
          component={HikingScreen}
          options={{ headerShown: true, title: 'Hiking' }}
        />
        <Stack.Screen
          name="Swimming"
          component={SwimmingScreen}
          options={{ headerShown: true, title: 'Swimming' }}
        />
        <Stack.Screen
          name="Parapente"
          component={ParaglidingScreen}
          options={{ headerShown: true, title: 'Parapente' }}
        />

        {/* Individual screens accessible from tabs or other parts of the app */}
        {/* NEW: Add the list screens */}
        <Stack.Screen
            name="Destinations"
            component={DestinationsScreen}
            options={{ headerShown: true, title: 'Explore Bejaia' }} // Show header
        />
        <Stack.Screen
            name="Restaurants"
            component={RestaurantsScreen}
            options={{ headerShown: true, title: 'Restaurants' }} // Show header
        />
        <Stack.Screen
            name="Attractions"
            component={AttractionsScreen}
            options={{ headerShown: true, title: 'Attractions' }} // Show header
        />
         <Stack.Screen
            name="Hotels" // List of hotels
            component={HotelReservationScreen}
            options={{ headerShown: true, title: 'Hotels' }}
        />
        <Stack.Screen
            name="HotelDetail" // View hotel details
            component={HotelDetailScreen}
            options={{ headerShown: true, title: 'Hotel Details' }}
        />
        <Stack.Screen
            name="BookHotel" // Booking/reservation screen
            component={HotelReservationScreen}
            options={{ headerShown: true, title: 'Book Hotel' }}
        />

        {/* Detail screens (Ensure these component names and imports are correct) */}
        {/* Use your specific detail screens if you have them, or the generic one */}
        <Stack.Screen name="DestinationDetail" component={DetailScreen} options={{ headerShown: true, title: 'Destination Details' }} />
        <Stack.Screen name="RestaurantDetail" component={DetailScreen} options={{ headerShown: true, title: 'Restaurant Details' }} />
        <Stack.Screen name="AttractionDetail" component={AttractionDetailScreen} options={{ headerShown: true, title: 'Attraction Details' }} />


        {/* Settings and Legal Screens - These were already here */}
        {/* Keeping SettingsScreen as it might be linked elsewhere */}
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: true, title: 'Terms of Service' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: true, title: 'Privacy Policy' }} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: true, title: 'Help Center' }} />
        <Stack.Screen name="AboutUs" component={AboutUsScreen} options={{ headerShown: true, title: 'About Us' }} />


        {/* Screens potentially linked from Profile or Settings */}
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: 'Change Password' }} />
        {/* REMOVED: NotificationSettingsScreen definition */}
        {/* <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: true, title: 'Notification Settings' }} /> */}
        {/* REMOVED: AppearanceSettingsScreen definition */}
        {/* <Stack.Screen name="AppearanceSettings" component={AppearanceSettingsScreen} options={{ headerShown: true, title: 'Appearance' }} /> */}


        {/* Placeholder Screens (commented out) */}
        {/* <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} /> */}
        {/* ... other commented out screens */}

      </Stack.Navigator>
    </SavedItemsProvider> // Close SavedItemsProvider
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
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
             iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName || 'alert-circle-outline'} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.tabActiveTint,
        tabBarInactiveTintColor: colors.tabInactiveTint,
        tabBarStyle: {
             backgroundColor: colors.tabBackground,
             borderTopWidth: 0,
             elevation: 8,
             shadowColor: '#000',
             shadowOffset: { width: 0, height: -2 },
             shadowOpacity: 0.1,
             shadowRadius: 4,
             height: Platform.OS === 'ios' ? 90 : 60,
             paddingBottom: Platform.OS === 'ios' ? 25 : 5,
             paddingTop: 5,
        },
        tabBarLabelStyle: {
            fontSize: 12,
             fontWeight: '600',
        },
        // Headers for screens within the tab navigator are often defined here
        // or individual screens can set headerShown: true/false
        headerShown: false, // Headers are handled by the MainStack or individual screens
      })}
    >
      {/* Screens shown in the bottom tab bar */}
      {/* headerShown is set to false here because the header is part of the MainStack */}
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
   const colors = getThemedColors(isDarkMode);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide header by default for auth flow screens
        cardStyle: {
            backgroundColor: colors.background,
        },
      }}
    >
      {/* Auth screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
       {/* Include legal screens here if they are accessible pre-login */}
       {/* Added headerShown: true for these legal screens in AuthStack */}
       <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: true, title: 'Terms of Service' }} />
       <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: true, title: 'Privacy Policy' }} />
       {/* Forgot Password screen could go here */}
       {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
    </Stack.Navigator>
  );
}

// Main App Navigator: Switches between Auth and Main flow based on authentication status
// This component does NOT contain NavigationContainer, it assumes it's wrapped by it in App.js
function AppNavigator() {
    // Use the useAuth hook to get the current authentication state
    // useAuth needs access to AuthContext, so AuthProvider must be higher up (in App.js)
    const { currentUser, isLoadingAuth } = useAuth();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const colors = getThemedColors(isDarkMode);


    // Show a loading screen while the auth state is being determined
    if (isLoadingAuth) {
         // Basic loading view (can be replaced with a dedicated SplashScreen component)
         // This view assumes it's inside NavigationContainer and AuthProvider
         return (
             <View style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
                 <ActivityIndicator size="large" color={colors.accent} />
                 <Text style={[styles.loadingText, {marginTop: 10, fontSize: 16, color: colors.secondaryText}]}>Loading app...</Text>
             </View>
        );
    }

  return (
      // This Stack decides between Auth and App flow
      // It assumes it is wrapped by NavigationContainer AND AuthProvider
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          {currentUser ? (
              // If logged in, show the Main app flow (including tabs and lists/details)
              <Stack.Screen name="App" component={MainStack} />
          ) : (
              // If not logged in, show the Authentication flow
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


// Export the main AppNavigator component
export default AppNavigator;