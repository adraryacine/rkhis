// screens/ProfileScreen.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  useColorScheme,
  Image,
  LayoutAnimation,
  UIManager,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Import services
import { logout } from '../services/authService';
import { getUserProfile } from '../services/dataService';

// Import AuthContext
import { useAuth } from '../contexts/AuthContext';

// Import modal components
import EditProfileModal from '../components/EditProfileModal';
import LanguageModal from '../components/LanguageModal'; // Assuming you have this modal

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// --- Color Palette ---
const Colors = {
  light: {
    text: '#1A1A1A', // Darker text
    secondaryText: '#6B7280', // Slightly muted secondary
    background: '#F8F9FA', // Lighter background
    primary: '#007AFF',
    border: '#E5E7EB',
    cardBackground: '#FFFFFF', // Keep cards white
    danger: '#FF3B30',
    skeleton: '#E5E7EB',
    avatarGradient: ['#E0F2F7', '#B3E5FC'], // Lighter blue gradient
    headerGradient: ['#FFFFFF', '#F8F9FA'], // Subtle white/off-white gradient
    shadow: '#0000001A', // Lighter shadow
    separator: '#E5E7EB', // Separator color
    icon: '#8E8E93', // Default icon color
  },
  dark: {
    text: '#F2F2F7', // Brighter text
    secondaryText: '#AEAEB2', // Lighter secondary
    background: '#000000', // Pure black background
    primary: '#0A84FF',
    border: '#38383A',
    cardBackground: '#1C1C1E', // Dark grey card
    danger: '#FF453A',
    skeleton: '#3A3A3C',
    avatarGradient: ['#2C2C2E', '#1C1C1E'], // Darker grey gradient
    headerGradient: ['#1C1C1E', '#000000'], // Dark gradient
    shadow: '#0000004D',
    separator: '#38383A', // Separator color
    icon: '#8E8E93', // Default icon color
  },
};

// --- Constants ---
const SPACING = 16;
const AVATAR_SIZE = 100; // Slightly smaller avatar
const HEADER_MAX_HEIGHT = 250; // Max header height
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 110 : 90; // Min header height after collapse
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// --- Themed Styles ---
const getThemedStyles = (isDarkMode = false) => {
  const colors = isDarkMode ? Colors.dark : Colors.light;

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    scrollViewContent: {
      paddingTop: HEADER_MAX_HEIGHT, // Start content below max header height
      paddingBottom: SPACING * 4,
    },
    // --- Header ---
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.cardBackground, // Use card background for header base
      overflow: 'hidden',
      height: HEADER_MAX_HEIGHT,
      zIndex: 1, // Ensure header stays above scroll content during animation
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    headerContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_MAX_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight, // Adjust for status bar
      paddingHorizontal: SPACING,
    },
    avatarContainer: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      overflow: 'hidden',
      marginBottom: SPACING * 0.75,
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      backgroundColor: colors.skeleton, // Background for initials
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarInitials: {
      fontSize: 40,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      lineHeight: AVATAR_SIZE, // Center vertically
    },
    userName: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING * 0.25,
      textAlign: 'center',
    },
    userInfo: {
      fontSize: 15,
      color: colors.secondaryText,
      marginBottom: SPACING * 0.25,
      textAlign: 'center',
    },
    joinDate: {
      fontSize: 13,
      color: colors.secondaryText,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    headerErrorText: {
      fontSize: 14,
      color: colors.danger,
      marginTop: SPACING * 0.5,
      textAlign: 'center',
    },
    // --- Sections & Items ---
    sectionContainer: {
      marginTop: SPACING * 1.5, // Reduced top margin
      marginHorizontal: SPACING,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      overflow: 'hidden', // Clip items and separator
       elevation: 1, // Subtle elevation
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      paddingTop: SPACING * 1.5,
      paddingBottom: SPACING * 0.75,
      paddingHorizontal: SPACING * 1.5,
      // Removed margin bottom, incorporated into padding
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING * 1.2,
      paddingHorizontal: SPACING * 1.5,
      backgroundColor: 'transparent', // Items sit directly on section background
    },
    listItemIcon: {
      marginRight: SPACING * 1.5,
      width: 24, // Ensure consistent icon alignment
      textAlign: 'center',
    },
    listItemText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    listItemChevron: {
      opacity: 0.6,
      marginLeft: SPACING,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginLeft: SPACING * 1.5 + 24 + SPACING * 1.5, // Align with text start (padding + icon width + icon margin)
    },
    // --- Destructive Button ---
    destructiveButtonContainer: {
      marginTop: SPACING * 2,
      marginHorizontal: SPACING,
    },
    destructiveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center', // Center content
      paddingVertical: SPACING * 1.2,
      paddingHorizontal: SPACING * 1.5,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    destructiveText: {
      fontSize: 16,
      color: colors.danger,
      fontWeight: '500',
      marginLeft: SPACING, // Space between icon and text
    },
    // --- Loading / Error States ---
    centeredContainer: { // Used for Loading and Full Error
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: SPACING * 2,
    },
    loadingText: {
      marginTop: SPACING,
      fontSize: 16,
      color: colors.secondaryText,
    },
    errorText: {
      fontSize: 16,
      color: colors.danger,
      textAlign: 'center',
      marginBottom: SPACING,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingVertical: SPACING * 0.8,
      paddingHorizontal: SPACING * 1.5,
      borderRadius: 8,
      marginTop: SPACING,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 15,
    },
  });
};

// --- Simple Separator Component ---
const Separator = ({ style }) => {
  const colorScheme = useColorScheme();
  const styles = useMemo(() => getThemedStyles(colorScheme === 'dark'), [colorScheme]);
  return <View style={[styles.separator, style]} />;
};

// --- ProfileScreen Component ---
function ProfileScreen() {
  // Hooks
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { currentUser, isLoadingAuth } = useAuth();

  const colors = useMemo(() => (isDarkMode ? Colors.dark : Colors.light), [isDarkMode]);
  const styles = useMemo(() => getThemedStyles(isDarkMode), [isDarkMode]);

  // State
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Start loading initially
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const itemAnimValues = useRef(new Map()).current; // For staggered item entry

  // List items data
  const listItemsData = useMemo(
    () => [
      { key: 'editProfile', section: 'Account', icon: 'person-circle-outline', text: 'Edit Profile', action: 'editProfile' },
      // Assuming 'ChangePassword' screen exists in MainStack
      { key: 'changePassword', section: 'Account', icon: 'lock-closed-outline', text: 'Change Password', screen: 'ChangePassword' },
      { key: 'language', section: 'Preferences', icon: 'language-outline', text: 'Language', action: 'changeLanguage' },
      // REMOVED Appearance item
      // { key: 'appearance', section: 'Preferences', icon: 'contrast-outline', text: 'Appearance', screen: 'AppearanceSettings' },
      // REMOVED Notification Settings from this list
      // { key: 'notifications', section: 'Preferences', icon: 'notifications-outline', text: 'Notifications', screen: 'NotificationSettings' },

      // These items already have screen names defined in your original code
      // The fix is in the navigateToScreen function below
      { key: 'help', section: 'Support', icon: 'help-buoy-outline', text: 'Help Center', screen: 'HelpCenter' },
      { key: 'about', section: 'Support', icon: 'information-circle-outline', text: 'About App', screen: 'AboutUs' },
      { key: 'terms', section: 'Support', icon: 'document-text-outline', text: 'Terms of Service', screen: 'TermsOfService' },
      { key: 'privacy', section: 'Support', icon: 'shield-checkmark-outline', text: 'Privacy Policy', screen: 'PrivacyPolicy' },
    ],
    []
  );

  // Initialize animation values for items
  useEffect(() => {
    listItemsData.forEach((item) => {
      if (!itemAnimValues.has(item.key)) {
        itemAnimValues.set(item.key, {
          opacity: new Animated.Value(0),
          translateY: new Animated.Value(20), // Start slightly lower
        });
      }
    });
  }, [listItemsData, itemAnimValues]);

  // --- Helpers ---
  const getInitials = useCallback((name) => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (!parts.length) return '?';
    const firstInitial = parts[0][0]?.toUpperCase() || '';
    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0]?.toUpperCase() : '';
    return lastInitial ? `${firstInitial}${lastInitial}` : firstInitial;
  }, []);

  const getJoinedDateString = useCallback((timestamp) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    } catch {
      return null;
    }
  }, []);

  // --- Staggered Animation Trigger ---
  const runEntryAnimation = useCallback(() => {
    const animations = listItemsData.map(item => {
      const anims = itemAnimValues.get(item.key);
      if (!anims) return null;
      return Animated.parallel([
        Animated.timing(anims.opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(anims.translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
    }).filter(Boolean); // Filter out nulls if any key is missing

    Animated.stagger(60, animations).start(); // Stagger animation by 60ms
  }, [listItemsData, itemAnimValues]);

  // --- Data Fetching ---
  const fetchUserProfileData = useCallback(
    async (uid, isRefresh = false) => {
      if (!uid) {
          setIsLoadingProfile(false);
          setRefreshing(false);
          setError('User not identified.');
          return;
      };
      console.log(`Fetching profile for UID: ${uid} (Refresh: ${isRefresh})`);
      setError(null); // Clear previous errors specific to fetch
      if (!isRefresh) {
        setIsLoadingProfile(true);
        // Reset animations before fetching new data
        itemAnimValues.forEach(anim => {
            anim.opacity.setValue(0);
            anim.translateY.setValue(20);
        });
      } else {
        setRefreshing(true);
      }

      try {
        const data = await getUserProfile(uid);
        // Artificial delay to see loading/animation (optional)
        // await new Promise(resolve => setTimeout(resolve, 1000));

        if (data) {
          const joinDate = getJoinedDateString(currentUser?.metadata?.creationTime);
          setProfileData({
            uid,
            email: data.email || currentUser?.email || 'No Email',
            fullName: data.fullName || currentUser?.displayName || 'User',
            phoneNumber: data.phoneNumber, // Store as is, display logic handles '+213'
            profilePicUrl: data.profilePicUrl || currentUser?.photoURL || null,
            emailVerified: currentUser?.emailVerified || false,
            joinDate: joinDate, // Use formatted date or null
            preferences: data.preferences || {}, // Assuming preferences exist in data
          });
          setError(null); // Clear error on success
          // Run animation after data is set
          // Small delay before animation allows layout to settle
          setTimeout(runEntryAnimation, 50);
        } else {
          setError('Profile data not found.');
          setProfileData(null); // Ensure no stale data is shown
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError(`Failed to load profile. ${err.message || 'Please try again.'}`);
        setProfileData(null); // Clear data on error
      } finally {
        setIsLoadingProfile(false);
        setRefreshing(false);
        // Use LayoutAnimation for the transition *from* loading/error states
        // This helps make the UI change smoothly
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
    },
    [currentUser, getJoinedDateString, itemAnimValues, runEntryAnimation] // Include dependencies
  );

  // --- Auth Effect ---
  useEffect(() => {
    if (isLoadingAuth) {
      // While authentication status is being determined
      setIsLoadingProfile(true);
      setProfileData(null);
      setError(null);
      setRefreshing(false); // Not refreshing during initial auth loading
      return;
    }

    if (currentUser) {
       // User is logged in. Fetch profile data.
       // Fetch only if no profile data, or UID mismatch, or coming from an error state
       // This prevents unnecessary refetches on screen focus if data is already loaded
      if (!profileData || profileData.uid !== currentUser.uid || (error && !isLoadingProfile)) {
         fetchUserProfileData(currentUser.uid);
      } else {
          // If profile data exists and matches, ensure loading is false
          setIsLoadingProfile(false);
      }
    } else {
      // User is not logged in or logged out
      setProfileData(null);
      setIsLoadingProfile(false); // Not loading profile if not logged in
      setError(null); // No error message needed here, handled by render logic
      // Use LayoutAnimation to smoothly hide profile content
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [currentUser, isLoadingAuth, fetchUserProfileData, profileData, error, isLoadingProfile]); // Add dependencies

  // --- Pull-to-Refresh ---
  const onRefresh = useCallback(() => {
    if (currentUser && !isLoadingProfile) {
      // Only allow refresh if user is logged in and not already loading/refreshing
      fetchUserProfileData(currentUser.uid, true);
    } else {
      // If no user or already loading, stop refreshing immediately
      setRefreshing(false);
    }
  }, [currentUser, fetchUserProfileData, isLoadingProfile]);

  // --- Actions ---
   // MODIFIED: Simplified navigation logic
  const navigateToScreen = useCallback(
    (screenName) => {
      // Directly navigate to the screen name. React Navigation handles finding
      // the screen in the appropriate stack (MainStack in this case).
      if (screenName) {
         navigation.navigate(screenName);
      } else {
         // This case should ideally not happen if listItemsData is set up correctly
         console.warn('Attempted to navigate with an undefined screenName');
      }
       // Removed the previous check `navigation.getState().routeNames.includes(screenName)`
       // as it incorrectly checks only the current tab navigator.
    },
    [navigation] // Only dependency is the navigation object
  );


  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          // Optimistic UI update: Clear data immediately
          setProfileData(null);
          setError(null);
          setIsLoadingProfile(true); // Show loading briefly during logout process
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

          try {
            await logout();
            // AuthContext listener will handle navigation/state change (e.g., to AuthStack)
            // No need to call fetchUserProfileData here as currentUser will become null
          } catch (err) {
            Alert.alert('Logout Failed', err.message || 'An unexpected error occurred.');
            // If logout fails, try to refetch profile if user context still exists (unlikely but safe)
            // And stop the loading indicator
            if (currentUser) {
               fetchUserProfileData(currentUser.uid); // Attempt recovery
            } else {
               setError('Logout failed. Please try again.');
               setIsLoadingProfile(false); // Stop loading on error
            }
          }
          // The AuthContext listener will handle the final state (logged out) and navigation
          // so a finally block setting isLoadingProfile(false) might conflict.
        },
      },
    ]);
  }, [currentUser, fetchUserProfileData]); // Added fetchUserProfileData just in case of error recovery attempt

  // --- Render Helpers ---
  const renderProfileItem = (item, isLastInSection) => {
    const anims = itemAnimValues.get(item.key);
    if (!anims) return null; // Safety check

    const animationStyle = {
      opacity: anims.opacity,
      transform: [{ translateY: anims.translateY }],
    };

     // Determine the press handler based on item type
    const onPressHandler = item.screen
      ? () => navigateToScreen(item.screen) // Navigate if screen is defined
      : item.action === 'editProfile'
      ? () => setIsEditProfileModalVisible(true) // Open Edit Profile Modal
      : item.action === 'changeLanguage'
      ? () => setIsLanguageModalVisible(true) // Open Language Modal
      : null; // No action if neither screen nor defined action


    return (
      <Animated.View key={item.key} style={animationStyle}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={onPressHandler} // Use the determined handler
          disabled={isLoadingProfile || refreshing || !onPressHandler} // Disable if loading or no handler
          activeOpacity={onPressHandler ? 0.6 : 1} // Only active if there's a handler
        >
          <Ionicons name={item.icon} size={22} color={colors.icon} style={styles.listItemIcon} />
          <Text style={styles.listItemText}>{item.text}</Text>
          {onPressHandler && ( // Show chevron only if interactable
            <Ionicons name="chevron-forward-outline" size={20} color={colors.icon} style={styles.listItemChevron} />
          )}
        </TouchableOpacity>
        {!isLastInSection && <Separator />}
      </Animated.View>
    );
  };

  const groupedItems = useMemo(
    () =>
      listItemsData.reduce((acc, item) => {
        acc[item.section] = acc[item.section] || [];
        acc[item.section].push(item);
        return acc;
      }, {}),
    [listItemsData]
  );

  // --- Loading / Not Logged In / Error States ---
  if (isLoadingAuth || (isLoadingProfile && !refreshing && !profileData)) {
    // Show loading indicator only if we are truly loading initial data or auth state
    return (
      <SafeAreaView style={styles.safeArea}>
         <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>
         <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading Profile...</Text>
         </View>
      </SafeAreaView>
    );
  }

  if (!currentUser && !isLoadingAuth) {
     // Explicit state for not logged in
    return (
      <SafeAreaView style={styles.safeArea}>
         <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>
         <View style={styles.centeredContainer}>
            <Ionicons name="person-circle-outline" size={60} color={colors.secondaryText} />
            <Text style={styles.loadingText}>Not Logged In</Text>
            {/* Optional: Add a login/register button here */}
            {/* Example: <TouchableOpacity style={styles.retryButton} onPress={() => navigation.navigate('AuthStack', { screen: 'Login' })}>
                 <Text style={styles.retryButtonText}>Login or Register</Text>
             </TouchableOpacity> */}
         </View>
      </SafeAreaView>
    );
  }

  // Full screen error only if fetch failed AND we have no profile data to show
  if (error && !profileData && !isLoadingProfile && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
         <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>
         <View style={styles.centeredContainer}>
            <Ionicons name="cloud-offline-outline" size={60} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            {currentUser && ( // Show retry only if a user context exists
                 <TouchableOpacity style={styles.retryButton} onPress={() => fetchUserProfileData(currentUser.uid)}>
                 <Text style={styles.retryButtonText}>Retry</Text>
                 </TouchableOpacity>
            )}
         </View>
      </SafeAreaView>
    );
  }

  // --- Main Render (Profile Data Available) ---
  const initials = getInitials(profileData?.fullName || profileData?.email);
  const displayPhoneNumber = profileData?.phoneNumber && profileData.phoneNumber !== '+213' ? profileData.phoneNumber : null;
  const joinDate = profileData?.joinDate; // Already formatted or null

  // Header Animations
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-HEADER_MAX_HEIGHT, 0], // Scale up when pulling down
    outputRange: [1.5, 1],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0, -HEADER_SCROLL_DISTANCE / 3], // Move avatar slower
    extrapolate: 'clamp',
  });

   const avatarScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.6], // Shrink avatar
    extrapolate: 'clamp',
  });

  const textOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3], // Fade out text quicker
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

    const usernameTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, HEADER_SCROLL_DISTANCE / 2.5], // Move username down towards center as header collapses
    extrapolate: 'clamp',
  });


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Use background color for translucent status bar handling on Android */}
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? Colors.dark.background : Colors.light.background} />

      {/* --- Animated Header --- */}
      {/* Added pointerEvents="none" so scrollview touches go through header */}
      <Animated.View
        style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}
        pointerEvents="none"
      >
          <LinearGradient colors={colors.headerGradient} style={styles.headerGradient} />
          {/* Scale the entire content slightly on pull-down */}
          <Animated.View style={[styles.headerContent, { transform: [{ scale: headerScale }] }]}>
              {/* Apply avatar specific animations */}
              <Animated.View style={[styles.avatarContainer, { transform: [{ scale: avatarScale }, { translateY: avatarTranslateY }] }]}>
                  <LinearGradient
                  colors={colors.avatarGradient}
                  style={[StyleSheet.absoluteFill, { borderRadius: AVATAR_SIZE / 2 }]}
                  />
                  {profileData?.profilePicUrl ? (
                  <Image source={{ uri: profileData.profilePicUrl }} style={styles.avatarImage} resizeMode="cover"/>
                  ) : (
                  <Text style={styles.avatarInitials}>{initials}</Text>
                  )}
              </Animated.View>

               {/* Apply username specific animations */}
               <Animated.Text style={[styles.userName, { transform: [{ translateY: usernameTranslateY }] }]}>
                    {profileData?.fullName || 'User'}
                </Animated.Text>

                {/* Apply opacity animation to secondary text block */}
                <Animated.View style={{ opacity: textOpacity }}>
                  {profileData?.email && <Text style={styles.userInfo}>{profileData.email}</Text>}
                  {displayPhoneNumber && (
                      <Text style={styles.userInfo}>{displayPhoneNumber}</Text>
                  )}
                  {joinDate && <Text style={styles.joinDate}>Member since {joinDate}</Text>}
                  {/* Display non-blocking error inline if profile data is shown */}
                  {error && !isLoadingProfile && !refreshing && profileData && (
                      <Text style={styles.headerErrorText}>{error}</Text>
                  )}
                </Animated.View>
          </Animated.View>
      </Animated.View>

      {/* --- Scrollable Content --- */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true, // Crucial for performance
        })}
        scrollEventThrottle={16} // Optimize scroll events
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary} // iOS spinner color
            colors={[colors.primary]} // Android spinner color(s)
             // Position the spinner below the collapsed header height
            progressViewOffset={HEADER_MIN_HEIGHT} // Adjusted offset to be just below min header height
            enabled={!isLoadingProfile && !!currentUser} // Disable refresh if loading or logged out
          />
        }
      >

        {/* Sections */}
        {Object.entries(groupedItems).map(([section, items]) => (
          <View key={section} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section}</Text>
            {items.map((item, index) => renderProfileItem(item, index === items.length - 1))}
          </View>
        ))}

        {/* Actions - Logout Button */}
        <View style={styles.destructiveButtonContainer}>
           <TouchableOpacity
                style={styles.destructiveButton}
                onPress={handleLogout}
                disabled={isLoadingProfile || refreshing || !currentUser} // Ensure user exists before allowing logout
                activeOpacity={0.7}
            >
                <Ionicons name={'log-out-outline'} size={22} color={colors.danger} />
                <Text style={styles.destructiveText}>{'Log Out'}</Text>
            </TouchableOpacity>
        </View>

      </Animated.ScrollView>

      {/* Modals */}
      {/* Render modals only when needed and user/profile data exists */}
      {profileData && currentUser && (
        <>
          <EditProfileModal
            isVisible={isEditProfileModalVisible}
            onClose={() => setIsEditProfileModalVisible(false)}
            profileData={profileData}
            // Pass only necessary data if EditProfileModal doesn't need everything
            onProfileUpdated={() => {
                setIsEditProfileModalVisible(false); // Close modal first
                // Refetch immediately after update
                // Use setTimeout to allow modal to close visually first
                setTimeout(() => {
                  // Check if user is still logged in before refetching
                  if (currentUser?.uid) {
                     fetchUserProfileData(currentUser.uid);
                  }
                }, 50);
            }}
          />
          <LanguageModal
            isVisible={isLanguageModalVisible}
            onClose={() => setIsLanguageModalVisible(false)}
            currentLanguage={profileData?.preferences?.language || 'en'} // Example prop
            onLanguageChanged={(newLang) => {
                setIsLanguageModalVisible(false);
                 // Assume language change might require profile refetch or specific update logic
                 console.log('Language changed to:', newLang);
                 // Optionally refetch profile if language affects displayed data
                 // setTimeout(() => fetchUserProfileData(currentUser.uid), 50); // Might need to pass preferences update specifically
            }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

export default ProfileScreen;