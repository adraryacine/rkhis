// screens/FavoritesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Button,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity, // More customizable than Button
    Image, // Potentially show thumbnail
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native'; // For theming

const FAVORITES_STORAGE_KEY = '@touristApp_Favorites'; // Key for AsyncStorage
const SPACING = 15;

// Helper function to get consistent themed colors
const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#1C1C1E' : '#F8F9FA',
    card: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    secondaryText: isDarkMode ? '#8E8E93' : '#757575',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    primaryGreen: isDarkMode ? '#4CAF50' : '#00796B',
    primaryBlue: isDarkMode ? '#2196F3' : '#01579B',
    primaryOrange: isDarkMode ? '#FF9800' : '#BF360C',
    primaryRed: isDarkMode ? '#FF453A' : '#D32F2F',
    border: isDarkMode ? '#38383A' : '#E0E0E0',
    // Add any other specific colors
});

// Helper function to get themed styles
const getThemedFavoritesStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, // Light background
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING * 2,
         backgroundColor: colors.background,
    },
     emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondaryText,
        textAlign: 'center',
        marginBottom: SPACING * 0.5,
    },
    emptySubText: {
        fontSize: 14,
        color: colors.secondaryText,
        textAlign: 'center',
    },
    listContentContainer: {
        paddingVertical: SPACING, // Add some padding top/bottom inside the list
        paddingHorizontal: SPACING * 0.5, // Add some padding sides
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING * 1.2,
        paddingHorizontal: SPACING * 1.5,
        backgroundColor: colors.card, // Themed card background
        borderBottomWidth: 1,
        borderBottomColor: colors.border, // Themed separator line
        marginHorizontal: SPACING * 0.5, // Add horizontal margin
        marginVertical: SPACING * 0.4, // Add vertical margin/spacing between items
        borderRadius: SPACING * 0.8, // Rounded corners
        elevation: 1, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, // Lighter shadow
        shadowRadius: 2,
    },
     itemImage: {
         width: SPACING * 3, // Small thumbnail
         height: SPACING * 3,
         borderRadius: SPACING * 0.4,
         marginRight: SPACING,
     },
    itemTextContainer: {
        flex: 1, // Take available space
        marginRight: SPACING * 0.8, // Space before the button
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text, // Themed text color
    },
    itemType: {
        fontSize: 13,
        color: colors.secondaryText, // Themed secondary text
        marginTop: SPACING * 0.2,
        opacity: 0.8,
    },
     removeButton: {
        backgroundColor: colors.primaryRed, // Themed red color
        paddingHorizontal: SPACING * 0.8,
        paddingVertical: SPACING * 0.5,
        borderRadius: SPACING * 0.5,
     },
    removeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loadingText: {
        marginTop: SPACING,
        fontSize: 16,
        color: colors.secondaryText,
    },
     // Styles for placeholder filter/sort bar
     filterSortBar: {
         flexDirection: 'row',
         justifyContent: 'space-around',
         paddingVertical: SPACING,
         backgroundColor: colors.card,
         borderBottomWidth: 1,
         borderBottomColor: colors.border,
         marginBottom: SPACING * 0.5,
         elevation: 2,
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.05,
         shadowRadius: 2,
     },
     filterSortButton: {
         flexDirection: 'row',
         alignItems: 'center',
         paddingHorizontal: SPACING * 0.8,
         paddingVertical: SPACING * 0.5,
          borderRadius: SPACING * 0.5,
          backgroundColor: colors.background, // Use background for button within card
          borderWidth: 1,
          borderColor: colors.border,
     },
     filterSortText: {
         fontSize: 14,
         color: colors.text,
         marginLeft: SPACING * 0.3,
     },
});


function FavoritesScreen() { // <-- Corrected component name
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const colors = getThemedColors(isDarkMode); // Use a helper to get colors based on theme
    const styles = getThemedFavoritesStyles(colors);


    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- Function to Load Favorites ---
    const loadFavorites = async () => {
        setIsLoading(true);
        try {
            console.log("Loading favorites from AsyncStorage...");
            const jsonValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
            const storedFavorites = jsonValue != null ? JSON.parse(jsonValue) : [];
            // Ensure it's always an array and log the loaded data
            const finalFavorites = Array.isArray(storedFavorites) ? storedFavorites : [];
            setFavorites(finalFavorites);
            console.log(`Loaded ${finalFavorites.length} favorites.`);
        } catch (e) {
            console.error("Failed to load favorites.", e);
            Alert.alert("Error", "Could not load your favorites.");
            setFavorites([]); // Reset to empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    // --- Save favorites (helper function) ---
    const saveFavorites = async (updatedFavorites) => {
        try {
            const jsonValue = JSON.stringify(updatedFavorites);
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, jsonValue);
            console.log(`Saved ${updatedFavorites.length} favorites to AsyncStorage.`);
        } catch (e) {
             console.error("Failed to save favorites.", e);
            Alert.alert("Error", "Could not save changes to favorites.");
        }
    };


    // --- Load favorites when the screen comes into focus ---
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
            // Optional: Add a listener for changes if favorites can be added/removed from other screens
            // E.g., EventBus.on('favorite-changed', loadFavorites);
            // return () => { /* EventBus.off('favorite-changed', loadFavorites); */ };
        }, []) // Empty dependency array means it runs on mount and every time the screen is focused
    );


    // --- Function to Remove a Favorite ---
    const handleRemoveFavorite = async (itemToRemove) => {
        // Optional: Confirmation dialog
        Alert.alert(
            "Remove Favorite",
            `Are you sure you want to remove "${itemToRemove.name || 'this item'}" from favorites?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                         // Filter out the item
                        const updatedFavorites = favorites.filter(item => item.id !== itemToRemove.id);

                        // Update state immediately for responsive UI
                        setFavorites(updatedFavorites);

                        // Save the updated list
                        await saveFavorites(updatedFavorites);

                        console.log(`Removed ${itemToRemove.name || 'item'} from favorites.`);
                    }
                }
            ]
        );
    };

    // --- How to render each item in the list ---
    const renderFavoriteItem = useCallback(({ item }) => (
        <View style={styles.itemContainer}>
             {/* Add image if your favorite item structure includes it */}
             {item.image && <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />}
            <View style={styles.itemTextContainer}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name || 'Unnamed Item'}</Text>
                {/* Add more details if available */}
                {item.type && <Text style={styles.itemType}>{item.type}</Text>}
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item)}
                activeOpacity={0.7}
            >
                 <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    ), [favorites, styles]); // Include favorites and styles as dependencies


    // --- Loading State ---
    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading Favorites...</Text>
            </SafeAreaView>
        );
    }

    // --- Empty State ---
    if (!favorites || favorites.length === 0) {
        return (
            <SafeAreaView style={styles.centered}>
                <Ionicons name="heart-dislike-outline" size={60} color={colors.secondaryText} style={{marginBottom: SPACING}}/>
                <Text style={styles.emptyText}>You haven't added any favorites yet!</Text>
                <Text style={styles.emptySubText}>Find places you like and tap the ♡ icon.</Text>
                 {/* Optional: Add a button to navigate somewhere */}
                 {/* <TouchableOpacity style={{marginTop: SPACING * 1.5}} onPress={() => navigation.navigate('Home')}>
                     <Text style={[styles.linkText, {color: colors.accent}]}>Browse Places</Text>
                 </TouchableOpacity> */}
            </SafeAreaView>
        );
    }

    // --- Display the List ---
    return (
        <SafeAreaView style={styles.container}>
            {/* Placeholder for Filter/Sort/Share Bar */}
            <View style={styles.filterSortBar}>
                 <TouchableOpacity style={styles.filterSortButton} onPress={() => Alert.alert("Filter", "Filter favorites coming soon!")}>
                     <Ionicons name="filter-outline" size={20} color={colors.text} />
                     <Text style={styles.filterSortText}>Filter</Text>
                 </TouchableOpacity>
                  <TouchableOpacity style={styles.filterSortButton} onPress={() => Alert.alert("Sort", "Sort favorites coming soon!")}>
                     <Ionicons name="swap-vertical-outline" size={20} color={colors.text} />
                     <Text style={styles.filterSortText}>Sort</Text>
                 </TouchableOpacity>
                  <TouchableOpacity style={styles.filterSortButton} onPress={() => Alert.alert("Share", "Share favorites coming soon!")}>
                     <Ionicons name="share-social-outline" size={20} color={colors.text} />
                     <Text style={styles.filterSortText}>Share</Text>
                 </TouchableOpacity>
            </View>
            <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContentContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

export default FavoritesScreen; // <-- Export the component with the correct name