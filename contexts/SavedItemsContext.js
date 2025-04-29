// context/SavedItemsContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
// Optional: If you are using a toast library like 'react-native-toast-message'
// import Toast from 'react-native-toast-message';

// Define a constant for the AsyncStorage key
const SAVED_ITEMS_STORAGE_KEY = 'savedTripItems';

const SavedItemsContext = createContext(null);

export const SavedItemsProvider = ({ children }) => {
  // State to hold the array of saved item objects
  const [savedItems, setSavedItems] = useState([]);
  // Loading state for the initial load from AsyncStorage
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  // --- Effect to Load Saved Items on Mount ---
  useEffect(() => {
    const loadSavedItems = async () => {
      console.log(`Attempting to load saved items from key "${SAVED_ITEMS_STORAGE_KEY}"...`);
      setIsLoadingSaved(true); // Start loading
      try {
        const jsonValue = await AsyncStorage.getItem(SAVED_ITEMS_STORAGE_KEY);
        // Parse the stored string back into a JavaScript array
        const storedItems = jsonValue != null ? JSON.parse(jsonValue) : [];

        // Ensure the loaded data is an array, default to empty array if not
        const finalItems = Array.isArray(storedItems) ? storedItems : [];

        setSavedItems(finalItems); // Update state with loaded items
        console.log(`Loaded ${finalItems.length} favorites from "${SAVED_ITEMS_STORAGE_KEY}".`);

      } catch (e) {
        console.error(`Failed to load saved items from "${SAVED_ITEMS_STORAGE_KEY}".`, e);
        // Optionally show an alert to the user, but console.error is usually enough here
        // Alert.alert("Error", "Could not load your saved items.");
        setSavedItems([]); // Ensure state is empty on error
      } finally {
          setIsLoadingSaved(false); // Finish loading
      }
    };

    loadSavedItems(); // Call the load function immediately when the provider mounts
  }, []); // Empty dependency array means this runs only once on mount

  // --- Effect to Persist Saved Items Whenever State Changes ---
  useEffect(() => {
    // Use a small debounce delay to avoid excessive writes if items are added/removed rapidly
    const handler = setTimeout(async () => {
      try {
         // Stringify the current array of saved item objects
         const jsonValue = JSON.stringify(savedItems);
         await AsyncStorage.setItem(SAVED_ITEMS_STORAGE_KEY, jsonValue);
         console.log(`Saved ${savedItems.length} items to "${SAVED_ITEMS_STORAGE_KEY}".`);
      } catch (e) {
        console.error(`Failed to save trip items to "${SAVED_ITEMS_STORAGE_KEY}".`, e);
        // Optionally show an alert
        // Alert.alert("Error", "Could not save changes to your trip plan.");
      }
    }, 300); // Debounce for 300ms - adjust if needed

    // Cleanup the timeout if savedItems changes again before the timeout fires
    // or when the component unmounts
    return () => clearTimeout(handler);

  }, [savedItems]); // This effect runs every time 'savedItems' state changes

  // --- Function to Add or Remove an Item ---
  const toggleSaveItem = useCallback((item, type) => {
    // Use a combination of type and a unique ID from the item (id is preferred, fallback to name)
    const itemId = item.id || item.name;
    if (!itemId) {
        console.error("Cannot save item without a unique ID or name:", item);
        // Alert.alert("Error", "Could not save this item."); // Avoid too many alerts
        return; // Prevent saving items without an ID
    }
    // Create a composite unique key for identification across different types
    const uniqueKey = `${type}_${itemId}`;

    setSavedItems(prevItems => {
      // Check if an item with this unique key already exists in the array
      const existingItemIndex = prevItems.findIndex(savedItem => savedItem._savedKey === uniqueKey);

      let newItems;
      let message = '';

      if (existingItemIndex > -1) {
        // Item is already saved, remove it by filtering the array
        newItems = prevItems.filter(savedItem => savedItem._savedKey !== uniqueKey);
        message = `${item.name || item.title || 'Item'} removed from your trip plan.`;
      } else {
        // Item is not saved, add it to the array
        // Create a new object to save. Include the original item data,
        // and add internal properties '_savedType' and '_savedKey' for context use.
        const newItemToSave = { ...item, _savedType: type, _savedKey: uniqueKey };
        newItems = [...prevItems, newItemToSave]; // Add the new item object to the array
        message = `${item.name || item.title || 'Item'} added to your trip plan!`;
      }

      console.log(message); // Log the action for debugging
      // Optional: Show a small toast or notification to the user
      // Toast.show({ type: 'success', text1: message, position: 'bottom' });

      return newItems; // Return the new array to update state, triggering the persistence effect
    });
  }, []); // No external dependencies needed for this function

  // --- Helper Function to Check if an Item is Saved ---
  // This function is used by components (like HomeScreen) to show the correct icon status
  const isItemSaved = useCallback((item, type) => {
      const itemId = item.id || item.name;
      if (!itemId) return false; // Cannot check if item has no ID
      const uniqueKey = `${type}_${itemId}`;
      // Check if the 'savedItems' array contains any item with this unique key
      return savedItems.some(savedItem => savedItem._savedKey === uniqueKey);
  }, [savedItems]); // This depends on the 'savedItems' state array

  // --- Provide the context value ---
  // Use React.useMemo to prevent unnecessary re-renders of consumers
  const contextValue = React.useMemo(() => ({
      savedItems, // The array of saved item objects from state
      toggleSaveItem, // Function to save/unsave items (updates state and triggers persistence)
      isItemSaved, // Helper to check if an item is currently saved
      isLoadingSaved, // Loading state of the initial load
  }), [savedItems, toggleSaveItem, isItemSaved, isLoadingSaved]); // Dependencies for memoization

  return (
    <SavedItemsContext.Provider value={contextValue}>
      {children}
    </SavedItemsContext.Provider>
  );
};

// --- Hook to use the SavedItemsContext ---
// This hook makes it easy for any component to access the context value
export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    // This error helps developers know they forgot to wrap their app/component tree
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
};