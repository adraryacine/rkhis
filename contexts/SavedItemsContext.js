// context/SavedItemsContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const SavedItemsContext = createContext(null);

export const SavedItemsProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState(new Set());
  const [isLoadingSaved, setIsLoadingSaved] = useState(true); // Add loading state for saved items

  // Load saved items on mount
  useEffect(() => {
    const loadSavedItems = async () => {
      try {
        const savedKeysString = await AsyncStorage.getItem('savedTripItems');
        if (savedKeysString) {
          setSavedItems(new Set(JSON.parse(savedKeysString)));
        }
      } catch (e) {
        console.error("Failed to load saved items:", e);
        // Optionally show an alert to the user
        // Alert.alert("Error", "Could not load your saved items.");
      } finally {
          setIsLoadingSaved(false);
      }
    };
    loadSavedItems();
  }, []); // Empty dependency array means this runs once on mount

  // Persist saved items whenever the state changes
  useEffect(() => {
    // Use a small delay to avoid writing too frequently if multiple changes happen quickly
    const handler = setTimeout(async () => {
      try {
         const savedKeysArray = Array.from(savedItems);
         await AsyncStorage.setItem('savedTripItems', JSON.stringify(savedKeysArray));
         console.log(`Saved items persisted: ${savedItems.size} items.`);
      } catch (e) {
        console.error("Failed to save trip items:", e);
        // Optionally show an alert to the user
        // Alert.alert("Error", "Could not save changes to your trip plan.");
      }
    }, 500); // Debounce for 500ms

    // Cleanup the timeout on unmount or if savedItems changes before timeout fires
    return () => clearTimeout(handler);

  }, [savedItems]); // Depend on savedItems state

  const toggleSaveItem = useCallback((item, type) => {
    // Use a combination of type and a unique ID from the item
    const itemId = item.id || item.name; // Use id if available, fallback to name
    if (!itemId) {
        console.error("Cannot save item without a unique ID or name:", item);
        Alert.alert("Error", "Could not save this item.");
        return;
    }
    const key = `${type}_${itemId}`;

    setSavedItems(prev => {
      const newSet = new Set(prev);
      let message = '';
      if (newSet.has(key)) {
        newSet.delete(key);
        message = `${item.name || item.title || 'Item'} removed from your trip plan.`;
      } else {
        newSet.add(key);
        message = `${item.name || item.title || 'Item'} added to your trip plan!`;
      }
      // Optionally show a toast or a small notification instead of Alert
      // Alert.alert(newSet.has(key) ? 'Saved' : 'Removed', message);
      console.log(message); // Log for confirmation
      return newSet;
    });
  }, []); // No external dependencies needed

  // Helper function to check if an item is saved
  const isItemSaved = useCallback((item, type) => {
      const itemId = item.id || item.name;
      if (!itemId) return false;
      const key = `${type}_${itemId}`;
      return savedItems.has(key);
  }, [savedItems]); // Depend on savedItems state

  return (
    <SavedItemsContext.Provider value={{ savedItems, toggleSaveItem, isItemSaved, isLoadingSaved }}>
      {children}
    </SavedItemsContext.Provider>
  );
};

export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
};