// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthProvider from './contexts/AuthContext';
import { SavedItemsProvider } from './contexts/SavedItemsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SearchProvider } from './contexts/SearchContext';
import AppNavigator from './navigation/AppNavigator';
import { LogBox } from 'react-native';
import SplashScreen from './components/SplashScreen';

// Ignore specific harmless warning related to timers often seen with Firebase in development
// Remove this in production or investigate further if it causes issues
LogBox.ignoreLogs(['Setting a timer']);

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  if (isSplashVisible) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <SavedItemsProvider>
            <SearchProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </SearchProvider>
          </SavedItemsProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}