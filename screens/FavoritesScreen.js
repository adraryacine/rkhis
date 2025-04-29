// screens/FavoritesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView, // Ensure we are using SafeAreaView
    TouchableOpacity,
    Image,
    Pressable, // Using Pressable for potential richer feedback
    Platform, // Import Platform for conditional styling
    Linking, // Import Linking for potential sharing actions
    Share, // Import Share for native sharing dialog
    StatusBar, // Import StatusBar
} from 'react-native';
// REMOVE: import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- REMOVE THIS
// Import useNavigation to get the navigation object
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // <-- Import useNavigation
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
// Import Reanimated for animations
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated'; // <-- IMPORT ANIMATIONS


// IMPORT THE SAVED ITEMS CONTEXT HOOK
import { useSavedItems } from '../contexts/SavedItemsContext'; // <-- USE THE CONTEXT HOOK (Adjust path)


// REMOVE: const FAVORITES_STORAGE_KEY = '@touristApp_Favorites'; // <-- REMOVE THIS KEY

const SPACING = 16; // Base spacing unit

// Keep horizontal card margins for spacing the list items from the sides
const CARD_MARGIN_HORIZONTAL = SPACING; // Increased horizontal margin for list items
const CARD_MARGIN_VERTICAL = SPACING * 0.6; // Slightly increased vertical margin between list items

// Helper function to get consistent themed colors (Ensure consistent with rest of app)
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#121212' : '#F8F9FA', // Used app background (should be visibly different from card)
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF', // Used for cards, sections, amenity tags, top area background
    text: isDarkMode ? '#E0E0E0' : '#1A1A1A', // Primary text color (titles, item names)
    secondaryText: isDarkMode ? '#B0B0B0' : '#6B7280', // Secondary text (descriptions, labels, N/A, empty state)
    accent: isDarkMode ? '#0A84FF' : '#007AFF', // Accent color (links, interactive elements, Share button)
    primaryGreen: isDarkMode ? '#4CAF50' : '#00796B', // Positive actions
    primaryBlue: isDarkMode ? '#2196F3' : '#01579B', // Info/Action
    primaryOrange: isDarkMode ? '#FF9800' : '#BF360C', // Price color (maybe?)
    primaryRed: isDarkMode ? '#FF453A' : '#C62828', // Danger (Remove icon), also used for top accent
    border: isDarkMode ? '#333333' : '#E0E0E0', // Borders, separators, image placeholders
    // Add any other specific colors you use in your app's theme
});


// Helper function to get themed styles (Improved Design)
const getThemedFavoritesStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, // Use themed background
    },
     // Styles for the improved Top Area (Custom Header)
     topArea: {
        backgroundColor: colors.card, // Card background for the top area
        paddingHorizontal: SPACING, // Consistent horizontal padding
        // Adjust top padding to account for status bar if header is hidden by navigator
        paddingTop: Platform.OS === 'ios' ? SPACING * 3.5 : SPACING * 2.5, // Increased padding top slightly
        paddingBottom: SPACING * 1.5, // Increased space below content in the top area
        borderBottomLeftRadius: SPACING * 1.5, // Rounded bottom corners
        borderBottomRightRadius: SPACING * 1.5,
        // Add subtle shadow to match card style
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 3,
          },
        }),
     },
     topAreaTitle: { // Style for the screen title in the top area
         fontSize: 24, // Title font size
         fontWeight: 'bold', // Title font weight
         color: colors.text, // Themed text color
         marginBottom: SPACING * 0.5, // Space below title
     },
      topAreaAccentBar: { // Style for the red accent bar below the title
         height: 3, // Small height for the accent line
         width: SPACING * 4, // Fixed width for the accent line
         backgroundColor: colors.primaryRed, // Themed red color
         borderRadius: 2, // Slightly rounded ends
         // No margin bottom here, paddingBottom on topArea provides space
     },
     centered: { // Style for loading/empty state container
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING * 2,
         backgroundColor: colors.background, // Use themed background
    },
     emptyText: { // Style for empty state primary text
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondaryText,
        textAlign: 'center',
        marginBottom: SPACING * 0.5,
    },
    emptySubText: { // Style for empty state secondary text
        fontSize: 14,
        color: colors.secondaryText,
        textAlign: 'center',
    },
    listContainer: { // Wrapper for FlatList and the fixed bottom button
        flex: 1, // Allow list to take up available space
        // Add slight horizontal padding here to ensure list items don't touch screen edges
        // This is an alternative to marginHorizontal on itemContainer, can use either/both
        // paddingHorizontal: SPACING * 0.5, // Example: padding on the list container itself
    },
    listContentContainer: { // Style for the content padding inside the FlatList
        paddingVertical: SPACING * 0.5, // Add top/bottom padding to the list content
        paddingHorizontal: 0, // Set horizontal padding to 0 as card margins handle spacing
        // --- ADJUSTED PADDING BOTTOM ---
        // Add sufficient padding at the bottom to ensure the last items scroll above the fixed button.
        // This needs to be at least the height of the bottomButtonContainer area + its padding + safe area.
        // Calculation based on button height (~SPACING*2.2), buttonContainer paddingTop (SPACING),
        // and buttonContainer paddingBottom (SPACING or SPACING*2).
        // Safe estimate: ButtonContainer height + some extra space
        paddingBottom: SPACING * 6, // Increased to a larger value
        // --- END ADJUSTED PADDING BOTTOM ---
    },
    itemContainer: { // Style for each favorite item card
        flexDirection: 'row', // Layout children in a row
        alignItems: 'center', // Vertically center children
        backgroundColor: colors.card, // Themed card background (should be distinct from background)
        marginHorizontal: CARD_MARGIN_HORIZONTAL, // Apply increased horizontal card margin
        marginVertical: CARD_MARGIN_VERTICAL, // Apply vertical card margin
        borderRadius: SPACING * 0.8, // Rounded corners
        overflow: 'hidden', // Clip children to border radius
        ...Platform.select({ // Add subtle shadow
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 3,
          },
        }),
    },
    // Style for the tappable area within the item container (left side)
    itemPressableArea: {
        flexDirection: 'row', // Layout children in a row
        alignItems: 'center', // Vertically center children
        flex: 1, // Take up available space
        paddingVertical: SPACING * 1.2, // Internal vertical padding
        paddingHorizontal: SPACING * 1.2, // Internal horizontal padding (slightly reduced)
        // Add a visual separator - make it less prominent
        borderRightWidth: 1,
        borderRightColor: colors.border, // Themed border color
        // Make sure it doesn't overlap the remove button area
        paddingRight: SPACING * 0.8, // Adjust this if needed based on remove button size
    },
     itemImage: { // Style for the item thumbnail image
         width: SPACING * 4, // Slightly larger image
         height: SPACING * 4, // Slightly larger image
         borderRadius: SPACING * 0.5, // Slightly more rounded corners for image
         marginRight: SPACING, // Space between image and text
         backgroundColor: colors.border, // Placeholder background
         flexShrink: 0, // Prevent image from shrinking
     },
    itemTextContainer: { // Container for item name and type (right of image)
        flex: 1, // Take available space, pushing remove button to the right
    },
    itemName: { // Style for the item name text
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text, // Themed text color
    },
    itemType: { // Style for the item type text
        fontSize: 13,
        color: colors.secondaryText, // Themed secondary text color
        marginTop: SPACING * 0.2, // Small space above type text
        opacity: 0.8, // Make it slightly less prominent
    },
     removeButton: { // Style for the remove (trash) icon button
        width: 50, // Slightly larger touch target
        height: 50, // Slightly larger touch target
        borderRadius: 25, // Make it round
        backgroundColor: colors.primaryRed, // Themed red color for remove
        justifyContent: 'center', // Center icon horizontally
        alignItems: 'center', // Center icon vertically
        marginHorizontal: SPACING * 0.6, // Adjusted horizontal margin
         flexShrink: 0, // Prevent button from shrinking
     },
    loadingText: { // Style for loading text
        marginTop: SPACING,
        fontSize: 16,
        color: colors.secondaryText, // Themed secondary text
    },
     // Styles for the fixed bottom button container
     bottomButtonContainer: {
        position: 'absolute', // Position fixed at the bottom
        bottom: 0, // Align to the bottom edge
        left: 0, // Align to the left edge
        right: 0, // Align to the right edge
        paddingHorizontal: SPACING, // Apply horizontal padding to match list area
        paddingTop: SPACING, // Space above button from last list item
        paddingBottom: Platform.OS === 'ios' ? SPACING * 2 : SPACING, // Add extra bottom padding for iOS gesture bar
        backgroundColor: colors.background, // Match screen background for seamless look
         // Add a subtle top border or shadow if desired
         borderTopWidth: 1,
         borderTopColor: colors.border,
     },
    shareButton: { // Style for the Share button itself
        backgroundColor: colors.accent, // Use accent color for a primary action
        paddingVertical: SPACING, // Internal padding
        borderRadius: SPACING * 0.8, // Rounded corners
        alignItems: 'center', // Center text/icon horizontally
        justifyContent: 'center', // Center text/icon vertically
        flexDirection: 'row', // Layout icon and text in a row
         // Add a subtle shadow to the button itself
         ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 3,
          },
        }),
    },
    shareButtonText: { // Style for share button text
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF', // White text on colored button
         marginLeft: SPACING * 0.5, // Space between icon and text
    },
     // Optional: Add styles for empty state icons/text if they are distinct from centered styles
     emptyIcon: {
         marginBottom: SPACING,
     }
});


function FavoritesScreen() {
    const navigation = useNavigation(); // <-- Get navigation object
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const colors = getThemedColors(isDarkMode);
    const styles = getThemedFavoritesStyles(colors);

    // --- USE THE CONTEXT HOOK ---
    // Get the savedItems array, the toggle function, and the loading state from the context
    const { savedItems, toggleSaveItem, isLoadingSaved } = useSavedItems(); // <-- USE CONTEXT HOOK


    // The useFocusEffect is often not strictly needed here if the context state
    // is the single source of truth and is updated globally.
    useFocusEffect(
        useCallback(() => {
            console.log("Favorites screen focused. Saved items should be visible if added elsewhere.");
            // You could add logic here if you need to e.g., reset scroll position or apply filters
        }, [])
    );


    // --- Function to Remove a Favorite ---
    const handleRemoveFavorite = useCallback(async (itemToRemove) => {
        if (!itemToRemove || !itemToRemove._savedKey || !itemToRemove._savedType) {
            console.error("Cannot remove item without saved key or type:", itemToRemove);
            Alert.alert("Error", "Could not remove this item.");
            return;
        }

        Alert.alert(
            "Remove Favorite",
            `Are you sure you want to remove "${itemToRemove.name || itemToRemove.title || 'this item'}" from favorites?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => { // Changed to standard function, async not needed here
                         toggleSaveItem(itemToRemove, itemToRemove._savedType); // <-- USE CONTEXT TOGGLE
                    }
                }
            ]
        );
    }, [toggleSaveItem]); // Dependency is the context's toggleSaveItem function


    // --- Function to Handle Item Press (Navigation) ---
    const handleItemPress = useCallback((item) => {
         const itemType = item._savedType;
         const itemId = item.id || item.name; // Use original ID or name

         let navigateToScreen = null;
         // Pass the item ID and the item object itself, plus the type
         // This aligns with the detail screens expecting 'id', 'item', 'type' or specific IDs like 'hotelId'
         let params = { id: itemId, item: item, type: itemType };

         switch (itemType) {
             case 'destination': navigateToScreen = 'DestinationDetail'; params.destinationId = itemId; break;
             case 'hotel': navigateToScreen = 'HotelDetail'; params.hotelId = itemId; break;
             case 'restaurant': navigateToScreen = 'RestaurantDetail'; params.restaurantId = itemId; break;
             case 'attraction': navigateToScreen = 'AttractionDetail'; params.attractionId = itemId; break;
             // Add other types as needed (e.g., 'event', 'localCulture', 'historicalSite', 'beach')
             // You might need specific Detail screens for these or use a generic one.
             default:
                 navigateToScreen = null;
                 Alert.alert("Details Unavailable", `Could not find a specific detail screen for this ${itemType}.`);
                 console.warn(`No navigation mapping found for item type: ${itemType}`);
         }

         if (navigateToScreen) {
             navigation.navigate(navigateToScreen, params);
         }

    }, [navigation]); // Dependency is the navigation object


    // --- Function to Handle Share Button Press ---
    const handleShare = useCallback(async () => { // Make it async for Share API
        if (!savedItems || savedItems.length === 0) {
            Alert.alert("No Favorites", "Add some favorites before sharing!");
            return;
        }

        const shareMessage = `Check out these amazing places I saved in Bejaia:\n\n${savedItems.map(item => {
             const name = item.name || item.title || 'Unnamed Item';
             const type = item._savedType ? `(${item._savedType.charAt(0).toUpperCase() + item._savedType.slice(1)})` : '';
             // You could also try to include a link if your detail screens have shareable URLs
             // const url = `https://yourapp.com/${item._savedType}/${item.id}`; // Example deep link/web link
             return `- ${name} ${type}`; // Include URL if available: `- ${name} ${type}: ${url}`;
        }).join('\n')}\n\nDiscover more about Bejaia with [bgayet tourist]!`; // Add app name/link

        try {
            // Use the native Share API
            const result = await Share.share({
                message: shareMessage,
                // Optional: title for some platforms
                title: 'My Bejaia Favorites',
                // Optional: url for some platforms (e.g., iOS)
                // url: 'https://yourapp.com', // Link to your app or website
            });

            // You can optionally add logic here based on the result (shared, dismissed, error)
            if (result.action === Share.sharedAction) {
              if (result.activityType) {
                // shared with activity type of result.activityType
                console.log(`Shared with activity type: ${result.activityType}`);
              } else {
                // shared
                 console.log('Shared successfully.');
              }
            } else if (result.action === Share.dismissedAction) {
              // dismissed
               console.log('Share dismissed.');
            }
        } catch (error) {
            console.error('Error sharing:', error.message);
            Alert.alert('Sharing Failed', 'Could not share your favorites.');
        }

    }, [savedItems]); // Depend on savedItems so the message is always up-to-date


    // --- How to render each item in the list ---
    // Wrap item in Animated.View for entry animation
    const renderFavoriteItem = useCallback(({ item, index }) => (
        // Add FadeIn animation with a delay based on index
        <Animated.View
            entering={FadeIn.delay(index * 50).duration(400)} // Staggered fade-in animation
            style={styles.itemContainer} // Apply the card style here (handles marginHorizontal, marginVertical, borderRadius, shadow, background)
        >
            {/* Wrap the main content (image + text) in a Pressable for navigation */}
            <Pressable
                style={styles.itemPressableArea} // Style for the tappable area (handles internal padding)
                onPress={() => handleItemPress(item)} // Call the navigation handler
                android_ripple={{ color: 'rgba(0,0,0,0.1)' }} // Add ripple effect for Android
                // You can add other Pressable props for iOS feedback like style={({ pressed }) => [...]}
            >
                 {/* Display image if available. Fallback to placeholder if image property is missing or null */}
                 {item.image ? (
                     <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                 ) : (
                      // Optional: Placeholder icon or background if no image
                      <View style={[styles.itemImage, { justifyContent: 'center', alignItems: 'center' }]}>
                          <Ionicons name="image-outline" size={SPACING * 2} color={colors.secondaryText} />
                      </View>
                 )}
                <View style={styles.itemTextContainer}>
                    {/* Use item.name or item.title, whichever is available */}
                    <Text style={styles.itemName} numberOfLines={1}>{item.name || item.title || 'Unnamed Item'}</Text>
                    {/* Display the saved type (e.g., Destination, Hotel, Restaurant, Attraction) */}
                    {/* Check if item._savedType exists before trying to access it */}
                    {item._savedType && <Text style={styles.itemType} numberOfLines={1}>{item._savedType.charAt(0).toUpperCase() + item._savedType.slice(1)}</Text>} {/* Capitalize type */}
                    {/* Add other relevant details from the item object if available */}
                    {/* {item.rating && <Text style={styles.itemType}>Rating: {item.rating}</Text>} */}
                    {/* {item.cuisine && <Text style={styles.itemType}>Cuisine: {item.cuisine}</Text>} */}
                    {/* {item.priceRange && <Text style={styles.itemType}>Price: {item.priceRange}</Text>} */}
                </View>
             </Pressable>

             {/* Remove Button (Icon button) - Placed next to the Pressable area in the row */}
            <TouchableOpacity
                style={styles.removeButton} // Style for the icon button background/size (handles marginHorizontal)
                onPress={() => handleRemoveFavorite(item)} // Call the remove handler
                activeOpacity={0.7}
                accessibilityLabel={`Remove ${item.name || item.title || 'item'} from favorites`}
            >
                 {/* Trash/Bin Icon */}
                 <Ionicons name="trash-outline" size={24} color="#fff" /> {/* Icon color is white */}
            </TouchableOpacity>
        </Animated.View> // <-- Close Animated.View here
    ), [handleItemPress, handleRemoveFavorite, styles, colors]); // Dependencies: navigation handler, remove handler, styles, colors

    // --- Loading State ---
    // Use the loading state from the context
    if (isLoadingSaved) { // <-- USE CONTEXT LOADING STATE
        return (
            <SafeAreaView style={styles.centered}>
                 <StatusBar
                     barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                     backgroundColor={colors.background} // Status bar background color matching screen
                 />
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading Favorites...</Text>
            </SafeAreaView>
        );
    }

    // --- Empty State ---
    // Check the length of the savedItems array from the context
    if (!savedItems || savedItems.length === 0) { // <-- USE CONTEXT savedItems
        return (
            <SafeAreaView style={styles.centered}>
                 <StatusBar
                     barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                     backgroundColor={colors.background} // Status bar background color matching screen
                 />
                {/* Use themed secondaryText color for icon */}
                <Ionicons name="bookmark-outline" size={60} color={colors.secondaryText} style={styles.emptyIcon}/> {/* Changed icon to bookmark-outline */}
                <Text style={styles.emptyText}>You haven't added any favorites yet!</Text>
                <Text style={styles.emptySubText}>Find places you like and tap the bookmark icon.</Text>
                 {/* Optional: Add a button to navigate somewhere */}
                 {/* <TouchableOpacity style={{marginTop: SPACING * 1.5}} onPress={() => navigation.navigate('Home')}>
                     <Text style={[styles.linkText, {color: colors.accent}]}>Browse Places</Text>
                 </TouchableOpacity> */}
            </SafeAreaView>
        );
    }

    // --- Display the List ---
    return (
        // SafeAreaView ensures content is within safe bounds (below notch, above gesture bar, below status bar)
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={colors.card} // Status bar background color matching top area
            />

            {/* Top Area with Title and Red Accent */}
            <View style={styles.topArea}>
                 {/* Title */}
                <Text style={styles.topAreaTitle}>My Favorites</Text> {/* Title for the screen */}
                 {/* Red Accent Bar */}
                 <View style={styles.topAreaAccentBar} />
            </View>


            {/* Main Content Area (List + Button Container) */}
            {/* This View allows the FlatList to flex and pushes the bottom container down */}
            <View style={styles.listContainer}>
                <FlatList
                    data={savedItems} // <-- USE THE ARRAY OF ITEM OBJECTS FROM CONTEXT
                    renderItem={renderFavoriteItem} // Use the Animated render function
                    // Use the unique key we added when saving the item object in context
                    keyExtractor={(item) => item._savedKey} // <-- USE THE UNIQUE KEY FROM THE ITEM OBJECT
                    contentContainerStyle={styles.listContentContainer} // Apply padding here (especially paddingBottom)
                    showsVerticalScrollIndicator={false}
                />

                 {/* Share Button - Fixed at the bottom */}
                 {/* This container is positioned absolute within its parent (the listContainer) */}
                 {/* Only show share button if there are saved items */}
                 {savedItems.length > 0 && (
                    <View style={styles.bottomButtonContainer}>
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={handleShare} // Call the share handler
                            activeOpacity={0.8}
                            accessibilityLabel="Share my favorite items"
                        >
                             {/* Icon and Text inside the button */}
                            <Ionicons name="share-social-outline" size={20} color="#fff" /> {/* Icon color is white */}
                            <Text style={styles.shareButtonText}>Share My Favorites</Text>
                        </TouchableOpacity>
                    </View>
                 )}
            </View>

        </SafeAreaView>
    );
}

export default FavoritesScreen;