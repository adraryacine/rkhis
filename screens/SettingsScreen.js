// screens/SettingsScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch, // For toggles
  Appearance, // For checking device theme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // For navigation to Help Center etc.
import { useColorScheme } from 'react-native'; // For theming

const SPACING = 15;

// Helper function to get consistent themed colors
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    border: isDarkMode ? '#38383A' : '#E0E0E0',
    toggleActive: isDarkMode ? '#0A84FF' : '#00796B', // Themed toggle colors
    toggleInactive: isDarkMode ? '#545458' : '#B0BEC5',
});

// Helper function to get themed styles
const getThemedSettingsStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingVertical: SPACING,
    paddingBottom: SPACING * 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: SPACING * 1.5,
    marginTop: SPACING * 2,
    marginBottom: SPACING,
  },
  sectionCard: {
      marginHorizontal: SPACING * 1.5,
      borderRadius: SPACING,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      backgroundColor: colors.card,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING * 1.2,
    paddingHorizontal: SPACING * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemIcon: {
    marginRight: SPACING * 1.2,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
   listItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SPACING,
   },
    arrowIcon: {
        opacity: 0.6,
    },
    smallText: {
       fontSize: 14,
       color: colors.secondaryText,
       marginRight: SPACING * 0.5,
    },
    footerSpacer: {
        height: SPACING * 3,
    }
});


function SettingsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const styles = getThemedSettingsStyles(colors);

   // State for local settings toggles (example)
   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
   const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(false); // Example privacy setting

   // --- Feature Placeholders ---
   const navigateToScreen = useCallback((screenName) => {
       console.log(`Attempting to navigate to: ${screenName}`);
       // Check if the screen exists in the navigator (MainStack in AppNavigator)
        const state = navigation.dangerouslyGetState();
        const allRouteNames = state.routeNames.concat(
            // If inside a tab, check parent stack too
             navigation.getParent()?.dangerouslyGetState().routeNames || []
        );

        if (allRouteNames.includes(screenName)) {
            navigation.navigate(screenName);
        } else {
            Alert.alert("Coming Soon", `The '${screenName}' screen is not yet implemented or linked.`);
        }
   }, [navigation]);

   const renderSettingItem = useCallback((iconName, text, screenName = null, isToggle = false, toggleValue = false, onToggleChange = () => {}, trailingText = null, isLastItem = false) => ( // Added isLastItem
       <TouchableOpacity
         key={text} // Use text as key
         style={[styles.listItemContainer, isLastItem && { borderBottomWidth: 0 }]} // Remove border for last item
         onPress={screenName ? () => navigateToScreen(screenName) : (isToggle ? () => onToggleChange(!toggleValue) : null)} // Toggle press logic
         activeOpacity={screenName || isToggle ? 0.7 : 1} // Only active if navigable or toggleable
       >
         <Ionicons
           name={iconName}
           size={24}
           color={colors.accent}
           style={styles.listItemIcon}
         />
         <Text style={styles.listItemText}>{text}</Text>
         <View style={styles.listItemRight}>
             {trailingText && <Text style={styles.smallText}>{trailingText}</Text>}
             {isToggle && (
                 <Switch
                     value={toggleValue}
                     onValueChange={onToggleChange}
                     trackColor={{ false: colors.toggleInactive, true: colors.toggleActive }}
                     thumbColor={colors.card} // Thumb color can be consistent or themed differently
                 />
             )}
             {!isToggle && screenName && (
                  <Ionicons
                    name="chevron-forward-outline"
                    size={22}
                    color={colors.secondaryText}
                    style={styles.arrowIcon}
                  />
             )}
         </View>
       </TouchableOpacity>
   ), [navigateToScreen, colors, styles, notificationsEnabled, locationTrackingEnabled]); // Include toggle states if they are used directly

    // Get app version (placeholder)
    const appVersion = '1.0.0'; // Or read from package.json/expo-constants if needed

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* --- General Settings --- */}
      <Text style={[styles.sectionTitle, {color: colors.text}]}>General</Text>
      <View style={[styles.sectionCard, {backgroundColor: colors.card}]}>
        {renderSettingItem('language-outline', 'Language', 'LanguageSettings')} {/* Placeholder */}
        {renderSettingItem('cash-outline', 'Currency', 'CurrencySettings')} {/* Placeholder */}
         {renderSettingItem('color-palette-outline', 'App Theme', 'ThemeSettings', false, false, null, colorScheme === 'dark' ? 'Dark' : 'Light')} {/* Placeholder, shows current */}
         {renderSettingItem('calendar-outline', 'Date & Time Format', 'DateTimeSettings', null, null, null, null)} {/* Placeholder */}
         {renderSettingItem('information-circle-outline', 'App Version', null, null, null, null, appVersion, true)} {/* Display version, last item */}
      </View>

      {/* --- Notifications --- */}
      <Text style={[styles.sectionTitle, {color: colors.text}]}>Notifications</Text>
       <View style={[styles.sectionCard, {backgroundColor: colors.card}]}>
           {renderSettingItem('notifications-outline', 'Enable Notifications', null, true, notificationsEnabled, setNotificationsEnabled)}
            {renderSettingItem('volume-high-outline', 'Notification Sound', 'NotificationSoundSettings', null, null, null, null, true)} {/* Placeholder, last item */}
       </View>


      {/* --- Privacy --- */}
      <Text style={[styles.sectionTitle, {color: colors.text}]}>Privacy</Text>
       <View style={[styles.sectionCard, {backgroundColor: colors.card}]}>
            {renderSettingItem('eye-outline', 'Profile Visibility', 'ProfileVisibilitySettings', null, null, null, null)} {/* Placeholder */}
            {renderSettingItem('location-outline', 'Location Tracking', null, true, locationTrackingEnabled, setLocationTrackingEnabled)}
            {renderSettingItem('bar-chart-outline', 'Data Sharing & Analytics', 'DataAnalyticsSettings', null, null, null, null, true)} {/* Placeholder, last item */}
       </View>

        {/* --- Data & Storage --- */}
       <Text style={[styles.sectionTitle, {color: colors.text}]}>Data & Storage</Text>
       <View style={[styles.sectionCard, {backgroundColor: colors.card}]}>
            {renderSettingItem('trash-outline', 'Clear Cache', 'ClearCacheSettings')} {/* Placeholder */}
            {renderSettingItem('cloud-download-outline', 'Data Usage', 'DataUsageSettings')} {/* Placeholder */}
             {renderSettingItem('download-outline', 'Data Export', 'DataExportSettings', null, null, null, null, true)} {/* Placeholder (can link to Profile screen or new screen), last item */}
       </View>


      {/* --- Help & Support --- */}
      <Text style={[styles.sectionTitle, {color: colors.text}]}>Help & Support</Text>
       <View style={[styles.sectionCard, {backgroundColor: colors.card}]}>
            {renderSettingItem('help-circle-outline', 'Help Center', 'HelpCenter')}
            {renderSettingItem('mail-outline', 'Contact Us', 'ContactUsSettings')} {/* Placeholder */}
            {renderSettingItem('document-text-outline', 'Terms of Service', 'TermsOfService')}
            {renderSettingItem('shield-checkmark-outline', 'Privacy Policy', 'PrivacyPolicy')}
            {renderSettingItem('information-circle-outline', 'About Us', 'AboutUs', null, null, null, null, true)} {/* Last item */}
       </View>


      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}


export default SettingsScreen;