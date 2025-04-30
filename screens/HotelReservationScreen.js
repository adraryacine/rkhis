// screens/HotelReservationScreen.js
const React = require('react');
const {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Animated,
  Modal,
  FlatList,
} = require('react-native');
const { Ionicons } = require('@expo/vector-icons');
const { useNavigation, useRoute } = require('@react-navigation/native');
const { LinearGradient } = require('expo-linear-gradient');
const { addDoc, collection, serverTimestamp, doc, getDoc } = require('firebase/firestore');
const { db } = require('../firebase');
const { useLanguage } = require('../contexts/LanguageContext');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const SPACING = 16;
const CARD_MARGIN_HORIZONTAL = SPACING;
const CARD_MARGIN_VERTICAL = SPACING * 0.6;

// Helper function to get consistent themed colors
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
    modalBackground: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
});

// Helper function to get themed styles
const getThemedReservationStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 250,
        width: SCREEN_WIDTH,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 150,
    },
    headerContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING,
    },
    hotelName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: SPACING / 2,
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    hotelLocation: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: SPACING / 2,
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    content: {
        padding: SPACING,
        paddingTop: SPACING * 2,
    },
    sectionCard: {
        backgroundColor: colors.card,
        borderRadius: SPACING,
        padding: SPACING,
        marginBottom: SPACING,
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: SPACING,
    },
    bookingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING,
        backgroundColor: colors.background,
        borderRadius: SPACING,
        marginBottom: SPACING,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bookingOptionText: {
        fontSize: 16,
        color: colors.text,
    },
    bookingOptionValue: {
        fontSize: 16,
        color: colors.accent,
        fontWeight: '600',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING * 2,
        paddingTop: SPACING,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalLabel: {
        fontSize: 18,
        color: colors.text,
        fontWeight: '600',
    },
    totalPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.accent,
    },
    confirmButton: {
        backgroundColor: colors.accent,
        paddingVertical: SPACING,
        borderRadius: SPACING * 2,
        alignItems: 'center',
        marginTop: SPACING * 2,
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
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingVertical: SPACING,
        alignItems: 'center',
        marginTop: SPACING,
    },
    cancelButtonText: {
        color: colors.secondaryText,
        fontSize: 16,
    },
    datePickerContainer: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: SPACING,
        padding: SPACING,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING,
    },
    datePickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    datePickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    datePickerDay: {
        width: '14.28%',
        textAlign: 'center',
        paddingVertical: SPACING / 2,
        fontSize: 14,
        fontWeight: '500',
        color: colors.secondaryText,
    },
    datePickerCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: SPACING / 2,
        marginVertical: SPACING / 4,
    },
    datePickerCellText: {
        fontSize: 16,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.modalBackground,
    },
    modalContent: {
        backgroundColor: colors.card,
        padding: SPACING,
        borderRadius: SPACING,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: SPACING,
    },
    modalOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING,
    },
    modalOption: {
        width: '30%',
        padding: SPACING,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: SPACING,
        marginBottom: SPACING,
        backgroundColor: colors.background,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
    },
    modalCloseButton: {
        backgroundColor: colors.accent,
        padding: SPACING,
        borderRadius: SPACING,
        alignItems: 'center',
        marginTop: SPACING,
    },
    modalCloseButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING,
    },
    modalButton: {
        flex: 1,
        padding: SPACING,
        borderRadius: SPACING,
        marginHorizontal: SPACING / 2,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    hotelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    hotelImage: {
        width: 80,
        height: 80,
        borderRadius: 4,
        marginRight: SPACING,
    },
    hotelInfo: {
        flex: 1,
    },
    listContent: {
        padding: SPACING,
    },
});

function HotelReservationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = getThemedColors(isDarkMode);
  const { t } = useLanguage();
  const styles = getThemedReservationStyles(colors);

  // Check if we're in booking mode (have hotel details from route)
  const isBookingMode = route.params?.hotelId != null;
  
  // If in booking mode, use the hotel details from route params
  const hotelDetails = isBookingMode ? route.params : null;

  // State for booking
  const [checkInDate, setCheckInDate] = React.useState(null);
  const [checkOutDate, setCheckOutDate] = React.useState(null);
  const [guests, setGuests] = React.useState(1);
  const [rooms, setRooms] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [datePickerType, setDatePickerType] = React.useState('checkIn');
  const [showGuestRoomPicker, setShowGuestRoomPicker] = React.useState(false);
  const [guestRoomPickerType, setGuestRoomPickerType] = React.useState('guests');

  // If not in booking mode, render the hotel list view
  if (!isBookingMode) {
    return (
      <View style={styles.container}>
        <FlatList
          data={hotels}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.hotelCard}
              onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id })}
            >
              <Image source={{ uri: item.image }} style={styles.hotelImage} />
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{item.name}</Text>
                <Text style={styles.hotelLocation}>{item.location}</Text>
                <Text style={styles.hotelPrice}>{`$${item.price}/night`}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }

  // Booking mode UI and logic below
  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate || !hotelDetails?.price) return 0;
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    return nights * hotelDetails.price * rooms;
  };

  const handleConfirmBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      Alert.alert('Error', 'Please select check-in and check-out dates');
      return;
    }

    try {
      const bookingData = {
        hotelId: hotelDetails.id,
        hotelName: hotelDetails.name,
        hotelImage: hotelDetails.image,
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
        guests: guests.toString(),
        rooms: rooms.toString(),
        totalPrice: calculateTotalPrice(),
        timestamp: serverTimestamp(),
        status: 'pending',
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      Alert.alert('Success', 'Your booking has been confirmed!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    }
  };

  const handleDateSelect = (type) => {
    setDatePickerType(type);
    setCheckInDate(new Date());
    setShowDatePicker(true);
  };

  const handleDateChange = (date) => {
    setCheckInDate(date);
  };

  const handleDateConfirm = () => {
    const formattedDate = checkInDate.toISOString().split('T')[0];
    setCheckInDate(new Date(formattedDate));
    setShowDatePicker(false);
  };

  const handleGuestRoomSelect = (type) => {
    setGuestRoomPickerType(type);
    setShowGuestRoomPicker(true);
  };

  const handleGuestRoomChange = (value) => {
    setShowGuestRoomPicker(false);
    if (value) {
      setGuests(value);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <View style={styles.header}>
        <Image
          source={{ uri: hotelDetails?.image }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.headerGradient}
        />
        <View style={styles.headerContent}>
          <Text style={styles.hotelName}>{hotelDetails?.name}</Text>
          <Text style={styles.hotelLocation}>{hotelDetails?.location}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${hotelDetails?.price}</Text>
            <Text style={styles.perNight}>/night</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <TouchableOpacity
            style={styles.bookingOption}
            onPress={() => handleDateSelect('checkIn')}
          >
            <Text style={styles.bookingOptionText}>Check-in Date</Text>
            <Text style={styles.bookingOptionValue}>
              {checkInDate ? checkInDate.toLocaleDateString() : 'Select date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookingOption}
            onPress={() => handleDateSelect('checkOut')}
          >
            <Text style={styles.bookingOptionText}>Check-out Date</Text>
            <Text style={styles.bookingOptionValue}>
              {checkOutDate ? checkOutDate.toLocaleDateString() : 'Select date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookingOption}
            onPress={() => handleGuestRoomSelect('guests')}
          >
            <Text style={styles.bookingOptionText}>Number of Guests</Text>
            <Text style={styles.bookingOptionValue}>
              {guests} {guests === 1 ? 'Guest' : 'Guests'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookingOption}
            onPress={() => handleGuestRoomSelect('rooms')}
          >
            <Text style={styles.bookingOptionText}>Number of Rooms</Text>
            <Text style={styles.bookingOptionValue}>
              {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
            </Text>
          </TouchableOpacity>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Price:</Text>
            <Text style={styles.totalPrice}>${calculateTotalPrice()}</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Select {datePickerType === 'checkIn' ? 'Check-in' : 'Check-out'} Date
              </Text>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <Text style={styles.datePickerTitle}>
                    {checkInDate?.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.datePickerGrid}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Text key={day} style={styles.datePickerDay}>
                      {day}
                    </Text>
                  ))}
                  
                  {Array.from({ length: 42 }, (_, i) => {
                    const date = new Date(checkInDate);
                    date.setDate(1);
                    date.setDate(i - date.getDay() + 1);
                    
                    const isCurrentMonth = date.getMonth() === checkInDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === new Date(checkInDate).toDateString();
                    
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.datePickerCell,
                          isCurrentMonth && { backgroundColor: colors.background },
                          isToday && { borderColor: colors.accent, borderWidth: 1 },
                          isSelected && { backgroundColor: colors.accent }
                        ]}
                        onPress={() => handleDateChange(date)}
                        disabled={!isCurrentMonth || date < new Date()}
                      >
                        <Text style={[
                          styles.datePickerCellText,
                          { color: isCurrentMonth ? colors.text : colors.secondaryText },
                          isSelected && { color: '#FFFFFF' }
                        ]}>
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.accent }]}
                  onPress={handleDateConfirm}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showGuestRoomPicker && (
        <Modal
          visible={showGuestRoomPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGuestRoomPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Select Number of {guestRoomPickerType === 'guests' ? 'Guests' : 'Rooms'}
              </Text>
              <View style={styles.modalOptions}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.modalOption,
                      { backgroundColor: colors.background }
                    ]}
                    onPress={() => handleGuestRoomChange(value)}
                  >
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowGuestRoomPicker(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

module.exports = HotelReservationScreen; 