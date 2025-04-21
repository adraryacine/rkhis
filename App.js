// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import {LogBox} from 'react-native';
// --- Change this import to a default import ---
import AuthProvider from './contexts/AuthContext'; // Import the AuthProvider (no curly braces)

// Ignore specific harmless warning related to timers often seen with Firebase in development
// Remove this in production or investigate further if it causes issues
LogBox.ignoreLogs(['Setting a timer']);

export default function App() {
  return (
    // Wrap the entire app with AuthProvider to make auth state available everywhere
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}