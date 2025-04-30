// screens/FavoritesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Pressable,
    Platform,
    Linking,
    Share,
    StatusBar,
    TextInput,
    RefreshControl,
    Modal,
    ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import Animated, { 
    FadeIn, 
    SlideInLeft,
    FadeInUp,
    Layout,
    SlideInRight,
    ZoomIn,
} from 'react-native-reanimated';
import { useSavedItems } from '../contexts/SavedItemsContext';

const SPACING = 16;
const CARD_MARGIN_HORIZONTAL = SPACING;
const CARD_MARGIN_VERTICAL = SPACING * 0.6;

const getThemedColors = (isDarkMode) => ({
    background: isDarkMode ? '#121212' : '#F8F9FA',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#E0E0E0' : '#1A1A1A',
    secondaryText: isDarkMode ? '#B0B0B0' : '#6B7280',
    accent: isDarkMode ? '#0A84FF' : '#007AFF',
    primaryGreen: isDarkMode ? '#4CAF50' : '#00796B',
    primaryBlue: isDarkMode ? '#2196F3' : '#01579B',
    primaryOrange: isDarkMode ? '#FF9800' : '#BF360C',
    primaryRed: isDarkMode ? '#FF453A' : '#C62828',
    border: isDarkMode ? '#333333' : '#E0E0E0',
    searchBackground: isDarkMode ? '#2A2A2A' : '#F0F0F0',
    modalBackground: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
});

const getThemedFavoritesStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    topArea: {
        backgroundColor: colors.card,
        paddingHorizontal: SPACING,
        paddingTop: Platform.OS === 'ios' ? SPACING * 3.5 : SPACING * 2.5,
        paddingBottom: SPACING * 1.5,
        borderBottomLeftRadius: SPACING * 1.5,
        borderBottomRightRadius: SPACING * 1.5,
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
    topAreaTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: SPACING * 0.5,
    },
    topAreaAccentBar: {
        height: 3,
        width: SPACING * 4,
        backgroundColor: colors.primaryRed,
        borderRadius: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.searchBackground,
        borderRadius: SPACING,
        paddingHorizontal: SPACING,
        marginTop: SPACING,
        marginBottom: SPACING * 0.5,
    },
    searchInput: {
        flex: 1,
        paddingVertical: SPACING * 0.8,
        color: colors.text,
        fontSize: 16,
    },
    filterButton: {
        padding: SPACING * 0.5,
        marginLeft: SPACING * 0.5,
    },
    viewToggleButton: {
        padding: SPACING * 0.5,
    },
    listContainer: {
        flex: 1,
    },
    listContentContainer: {
        paddingVertical: SPACING,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        marginHorizontal: CARD_MARGIN_HORIZONTAL,
        marginVertical: CARD_MARGIN_VERTICAL,
        borderRadius: SPACING * 0.8,
        overflow: 'hidden',
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
    gridItemContainer: {
        width: '45%',
        aspectRatio: 1,
        backgroundColor: colors.card,
        margin: SPACING * 0.5,
        borderRadius: SPACING * 0.8,
        overflow: 'hidden',
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
    itemPressableArea: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingVertical: SPACING * 1.2,
        paddingHorizontal: SPACING * 1.2,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        paddingRight: SPACING * 0.8,
    },
    itemImage: {
        width: SPACING * 4,
        height: SPACING * 4,
        borderRadius: SPACING * 0.5,
        marginRight: SPACING,
        backgroundColor: colors.border,
        flexShrink: 0,
    },
    gridItemImage: {
        width: '100%',
        height: '60%',
        backgroundColor: colors.border,
    },
    itemTextContainer: {
        flex: 1,
    },
    gridItemTextContainer: {
        padding: SPACING * 0.8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    itemType: {
        fontSize: 13,
        color: colors.secondaryText,
        marginTop: SPACING * 0.2,
        opacity: 0.8,
    },
    removeButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primaryRed,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: SPACING * 0.6,
        flexShrink: 0,
    },
    loadingText: {
        marginTop: SPACING,
        fontSize: 16,
        color: colors.secondaryText,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    emptyIcon: {
        marginBottom: SPACING,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: SPACING * 0.5,
    },
    emptySubText: {
        fontSize: 14,
        color: colors.secondaryText,
        textAlign: 'center',
        marginBottom: SPACING,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: SPACING * 2,
        left: SPACING,
        right: SPACING,
        alignItems: 'center',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent,
        paddingVertical: SPACING,
        paddingHorizontal: SPACING * 2,
        borderRadius: SPACING * 2,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: SPACING * 0.5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.modalBackground,
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: SPACING,
        padding: SPACING * 2,
        width: '80%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: SPACING,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterOptionText: {
        fontSize: 16,
        color: colors.text,
        marginLeft: SPACING,
    },
    selectedFilter: {
        color: colors.accent,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: SPACING,
    },
    tag: {
        backgroundColor: colors.accent,
        paddingHorizontal: SPACING,
        paddingVertical: SPACING * 0.5,
        borderRadius: SPACING * 2,
        marginRight: SPACING * 0.5,
        marginBottom: SPACING * 0.5,
    },
    tagText: {
        color: '#fff',
        fontSize: 12,
    },
});

function FavoritesScreen() {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const colors = getThemedColors(isDarkMode);
    const styles = getThemedFavoritesStyles(colors);

    const { savedItems, toggleSaveItem, isLoadingSaved } = useSavedItems();
    
    // New state variables
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGridView, setIsGridView] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedTags, setSelectedTags] = useState([]);

    // Filter and sort options
    const filterOptions = [
        { id: 'all', label: 'All Items' },
        { id: 'destination', label: 'Destinations' },
        { id: 'hotel', label: 'Hotels' },
        { id: 'restaurant', label: 'Restaurants' },
        { id: 'attraction', label: 'Attractions' },
    ];

    // Available tags
    const availableTags = ['Popular', 'Nearby', 'Luxury', 'Budget', 'Family', 'Romantic'];

    // Filtered and sorted items
    const filteredItems = savedItems.filter(item => {
        const matchesSearch = (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || item._savedType === selectedFilter;
        const matchesTags = selectedTags.length === 0 || 
            (item.tags && selectedTags.some(tag => item.tags.includes(tag)));
        return matchesSearch && matchesFilter && matchesTags;
    });

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate refresh delay
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

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
                    onPress: () => {
                        toggleSaveItem(itemToRemove, itemToRemove._savedType);
                    }
                }
            ]
        );
    }, [toggleSaveItem]);

    const handleItemPress = useCallback((item) => {
        const itemType = item._savedType;
        const itemId = item.id || item.name;

        let navigateToScreen = null;
        let params = {};

        switch (itemType) {
            case 'destination': 
                navigateToScreen = 'DestinationDetail'; 
                params = { id: itemId, item: item, type: itemType, destinationId: itemId }; 
                break;
            case 'hotel': 
                navigateToScreen = 'HotelDetail'; 
                params = { id: itemId, item: item, type: itemType, hotelId: itemId }; 
                break;
            case 'restaurant': 
                navigateToScreen = 'RestaurantDetail'; 
                params = { 
                    itemId: itemId,
                    item: item,
                    itemType: 'restaurant'
                }; 
                break;
            case 'attraction': 
                navigateToScreen = 'AttractionDetail'; 
                params = { id: itemId, item: item, type: itemType, attractionId: itemId }; 
                break;
            default:
                navigateToScreen = null;
                Alert.alert("Details Unavailable", `Could not find a specific detail screen for this ${itemType}.`);
        }

        if (navigateToScreen) {
            navigation.navigate(navigateToScreen, params);
        }
    }, [navigation]);

    const handleShare = useCallback(async () => {
        if (!savedItems || savedItems.length === 0) {
            Alert.alert("No Favorites", "Add some favorites before sharing!");
            return;
        }

        const shareMessage = `Check out these amazing places I saved in Bejaia:\n\n${savedItems.map(item => {
            const name = item.name || item.title || 'Unnamed Item';
            const type = item._savedType ? `(${item._savedType.charAt(0).toUpperCase() + item._savedType.slice(1)})` : '';
            return `- ${name} ${type}`;
        }).join('\n')}\n\nDiscover more about Bejaia with [bgayet tourist]!`;

        try {
            const result = await Share.share({
                message: shareMessage,
                title: 'My Bejaia Favorites',
            });

            if (result.action === Share.sharedAction) {
                console.log('Shared successfully.');
            }
        } catch (error) {
            console.error('Error sharing:', error.message);
            Alert.alert('Sharing Failed', 'Could not share your favorites.');
        }
    }, [savedItems]);

    const toggleTag = useCallback((tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    const renderFavoriteItem = useCallback(({ item, index }) => (
        <Animated.View
            entering={FadeIn.delay(index * 50).duration(400)}
            layout={Layout.springify()}
            style={isGridView ? styles.gridItemContainer : styles.itemContainer}
        >
            <Pressable
                style={isGridView ? styles.gridItemTextContainer : styles.itemPressableArea}
                onPress={() => handleItemPress(item)}
                android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            >
                {isGridView ? (
                    <>
                        <Image 
                            source={{ uri: item.image }} 
                            style={styles.gridItemImage} 
                            resizeMode="cover"
                        />
                        <View style={styles.gridItemTextContainer}>
                            <Text style={styles.itemName} numberOfLines={1}>
                                {item.name || item.title || 'Unnamed Item'}
                            </Text>
                            <Text style={styles.itemType} numberOfLines={1}>
                                {item._savedType?.charAt(0).toUpperCase() + item._savedType?.slice(1)}
                            </Text>
                        </View>
                    </>
                ) : (
                    <>
                        <Image 
                            source={{ uri: item.image }} 
                            style={styles.itemImage} 
                            resizeMode="cover"
                        />
                        <View style={styles.itemTextContainer}>
                            <Text style={styles.itemName} numberOfLines={1}>
                                {item.name || item.title || 'Unnamed Item'}
                            </Text>
                            <Text style={styles.itemType} numberOfLines={1}>
                                {item._savedType?.charAt(0).toUpperCase() + item._savedType?.slice(1)}
                            </Text>
                        </View>
                    </>
                )}
            </Pressable>
            {!isGridView && (
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFavorite(item)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
            )}
        </Animated.View>
    ), [handleItemPress, handleRemoveFavorite, styles, isGridView]);

    if (isLoadingSaved) {
        return (
            <SafeAreaView style={styles.centered}>
                <StatusBar
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                />
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading Favorites...</Text>
            </SafeAreaView>
        );
    }

    if (!savedItems || savedItems.length === 0) {
        return (
            <SafeAreaView style={styles.centered}>
                <StatusBar
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                />
                <Ionicons name="bookmark-outline" size={60} color={colors.secondaryText} style={styles.emptyIcon}/>
                <Text style={styles.emptyText}>You haven't added any favorites yet!</Text>
                <Text style={styles.emptySubText}>Find places you like and tap the bookmark icon.</Text>
                <TouchableOpacity 
                    style={[styles.shareButton, { marginTop: SPACING }]} 
                    onPress={() => navigation.navigate('Home')}
                >
                    <Ionicons name="compass-outline" size={20} color="#fff" />
                    <Text style={styles.shareButtonText}>Explore Bejaia</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={colors.card}
            />

            <View style={styles.topArea}>
                <Text style={styles.topAreaTitle}>My Favorites</Text>
                <View style={styles.topAreaAccentBar} />
                
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color={colors.secondaryText} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search favorites..."
                        placeholderTextColor={colors.secondaryText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity 
                        style={styles.filterButton}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Ionicons name="filter-outline" size={24} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.viewToggleButton}
                        onPress={() => setIsGridView(!isGridView)}
                    >
                        <Ionicons 
                            name={isGridView ? "list-outline" : "grid-outline"} 
                            size={24} 
                            color={colors.accent} 
                        />
                    </TouchableOpacity>
                </View>

                {selectedTags.length > 0 && (
                    <View style={styles.tagContainer}>
                        {selectedTags.map(tag => (
                            <TouchableOpacity
                                key={tag}
                                style={styles.tag}
                                onPress={() => toggleTag(tag)}
                            >
                                <Text style={styles.tagText}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.listContainer}>
                <FlatList
                    data={filteredItems}
                    renderItem={renderFavoriteItem}
                    keyExtractor={(item) => item._savedKey}
                    contentContainerStyle={[
                        styles.listContentContainer,
                        isGridView && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.accent}
                            title="Refreshing..."
                            titleColor={colors.secondaryText}
                        />
                    }
                />

                {filteredItems.length > 0 && (
                    <View style={styles.bottomButtonContainer}>
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={handleShare}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="share-social-outline" size={20} color="#fff" />
                            <Text style={styles.shareButtonText}>Share My Favorites</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Modal
                visible={showFilterModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <Pressable 
                    style={styles.modalContainer}
                    onPress={() => setShowFilterModal(false)}
                >
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filter Options</Text>
                        <ScrollView>
                            {filterOptions.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={styles.filterOption}
                                    onPress={() => {
                                        setSelectedFilter(option.id);
                                        setShowFilterModal(false);
                                    }}
                                >
                                    <Ionicons 
                                        name={selectedFilter === option.id ? "radio-button-on" : "radio-button-off"} 
                                        size={20} 
                                        color={selectedFilter === option.id ? colors.accent : colors.secondaryText} 
                                    />
                                    <Text style={[
                                        styles.filterOptionText,
                                        selectedFilter === option.id && styles.selectedFilter
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            
                            <Text style={[styles.modalTitle, { marginTop: SPACING * 2 }]}>Tags</Text>
                            <View style={styles.tagContainer}>
                                {availableTags.map(tag => (
                                    <TouchableOpacity
                                        key={tag}
                                        style={[
                                            styles.tag,
                                            !selectedTags.includes(tag) && { backgroundColor: colors.border }
                                        ]}
                                        onPress={() => toggleTag(tag)}
                                    >
                                        <Text style={[
                                            styles.tagText,
                                            !selectedTags.includes(tag) && { color: colors.text }
                                        ]}>
                                            {tag}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

export default FavoritesScreen;