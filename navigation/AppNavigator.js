import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import HotelReservationScreen from '../screens/HotelReservationScreen';
import MapScreen from '../screens/MapScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons'; // Or any other icon library
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'; // Corrected names
          } else if (route.name === 'Hotels') {
            iconName = focused ? 'bed' : 'bed-outline';  // Corrected names
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline'; // Corrected names
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline'; // Corrected names
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'; // Corrected names
          } else if (route.name === 'Settings') { // Add settings here
            iconName = focused ? 'settings' : 'settings-outline'; // Corrected names
          } else if (route.name === 'Login') {
            iconName = focused ? 'log-in' : 'log-in-outline'; // Corrected names
          } else if (route.name === 'Register') {
             iconName = focused ? 'person-add' : 'person-add-outline'; // Corrected names
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Hotels" component={HotelReservationScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {/* <Tab.Screen name="Settings" component={SettingsScreen} /> Add Settings here conditionally on user login*/}
      {/* <Tab.Screen name="Login" component={LoginScreen} /> Add Login here conditionally on user not login*/}
      {/* <Tab.Screen name="Register" component={RegisterScreen} /> Add Register here conditionally on user not login*/}
    </Tab.Navigator>
  );
}

export default AppNavigator;