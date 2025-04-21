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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { Ionicons } from '@expo/vector-icons';
// --- Mock Data Structure ---
// Assume your favorite items look something like this:
// { id: '1', name: 'Eiffel Tower', type: 'Landmark' }
// { id: '2', name: 'Louvre Museum', type: 'Museum' }
// ---

const FAVORITES_STORAGE_KEY = '@touristApp_Favorites'; // Key for AsyncStorage

function FavoriteScreen() {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- Function to Load Favorites ---
    const loadFavorites = async () => {
        setIsLoading(true);
        try {
            const jsonValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
            const storedFavorites = jsonValue != null ? JSON.parse(jsonValue) : [];
            // Ensure it's always an array
            setFavorites(Array.isArray(storedFavorites) ? storedFavorites : []);
        } catch (e) {
            console.error("Failed to load favorites.", e);
            Alert.alert("Error", "Could not load your favorites.");
            setFavorites([]); // Reset to empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    // --- Load favorites when the screen comes into focus ---
    // useFocusEffect is better than useEffect for screens in a navigator,
    // as it re-runs when you navigate *back* to the screen.
    useFocusEffect(
        useCallback(() => {
            console.log("Favorite Screen focused, loading favorites...");
            loadFavorites();

            // Optional: Return a cleanup function if needed, though not typical for load
            // return () => console.log("Favorite Screen unfocused");
        }, []) // Empty dependency array means it runs on mount/focus
    );


    // --- Function to Remove a Favorite ---
    const handleRemoveFavorite = async (itemToRemove) => {
        try {
            // Filter out the item
            const updatedFavorites = favorites.filter(item => item.id !== itemToRemove.id);

            // Update state immediately for responsive UI
            setFavorites(updatedFavorites);

            // Save the updated list to AsyncStorage
            const jsonValue = JSON.stringify(updatedFavorites);
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, jsonValue);

            console.log(`Removed ${itemToRemove.name} from favorites.`);
           // Alert.alert("Removed", `${itemToRemove.name} removed from favorites.`); // Optional feedback

        } catch (e) {
            console.error("Failed to remove favorite.", e);
            Alert.alert("Error", "Could not remove the item from favorites.");
            // Optional: Reload favorites to revert state if save failed
            // loadFavorites();
        }
    };

    // --- How to render each item in the list ---
    const renderFavoriteItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemTextContainer}>
                <Text style={styles.itemName}>{item.name || 'Unnamed Item'}</Text>
                {/* Add more details if available */}
                {item.type && <Text style={styles.itemType}>{item.type}</Text>}
            </View>
            {/* Use TouchableOpacity for better styling */}
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item)}
                activeOpacity={0.7} // Visual feedback on press
            >
                 <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
            {/* Or use a standard Button */}
            {/* <Button
                title="Remove"
                onPress={() => handleRemoveFavorite(item)}
                color="#FF6347" // Example color
            /> */}
        </View>
    );

    // --- Loading State ---
    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading Favorites...</Text>
            </SafeAreaView>
        );
    }

    // --- Empty State ---
    if (!favorites || favorites.length === 0) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.emptyText}>You haven't added any favorites yet!</Text>
                <Text style={styles.emptySubText}>Find places you like and tap the ♡ icon.</Text>
                 {/* Optional: Add a button to navigate somewhere */}
                 {/* <Button title="Browse Places" onPress={() => navigation.navigate('Explore')} /> */}
            </SafeAreaView>
        );
    }

    // --- Display the List ---
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item.id.toString()} // Important: Use a unique string ID
                contentContainerStyle={styles.listContentContainer} // Optional: style list container
            />
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5', // Light background
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
         backgroundColor: '#f5f5f5',
    },
     emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptySubText: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
    },
    listContentContainer: {
        paddingVertical: 10, // Add some padding top/bottom inside the list
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff', // White background for items
        borderBottomWidth: 1,
        borderBottomColor: '#eee', // Separator line
        marginHorizontal: 10, // Add horizontal margin
        marginVertical: 5, // Add vertical margin/spacing between items
        borderRadius: 8, // Rounded corners
        elevation: 1, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemTextContainer: {
        flex: 1, // Take available space
        marginRight: 10, // Space before the button
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    itemType: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
     removeButton: {
        backgroundColor: '#FF6347', // Tomato color
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default FavoriteScreen;