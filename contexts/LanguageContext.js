const React = require('react');
const AsyncStorage = require('@react-native-async-storage/async-storage');

const LanguageContext = React.createContext();

const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
  },
  fr: {
    code: 'fr',
    name: 'Français',
    direction: 'ltr',
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl',
  },
  zh: {
    code: 'zh',
    name: '中文',
    direction: 'ltr',
  },
};

const TRANSLATIONS = {
  en: {
    // Common
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    // Hotel
    bookNow: 'Book Now',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    rooms: 'Rooms',
    totalPrice: 'Total Price',
    confirmBooking: 'Confirm Booking',
    bookingConfirmed: 'Booking Confirmed',
    // Settings
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    help: 'Help',
    about: 'About',
    logout: 'Logout',
  },
  fr: {
    // Common
    cancel: 'Annuler',
    save: 'Enregistrer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    // Hotel
    bookNow: 'Réserver',
    checkIn: 'Arrivée',
    checkOut: 'Départ',
    guests: 'Invités',
    rooms: 'Chambres',
    totalPrice: 'Prix Total',
    confirmBooking: 'Confirmer la Réservation',
    bookingConfirmed: 'Réservation Confirmée',
    // Settings
    language: 'Langue',
    theme: 'Thème',
    notifications: 'Notifications',
    help: 'Aide',
    about: 'À propos',
    logout: 'Déconnexion',
  },
  ar: {
    // Common
    cancel: 'إلغاء',
    save: 'حفظ',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    // Hotel
    bookNow: 'احجز الآن',
    checkIn: 'تاريخ الوصول',
    checkOut: 'تاريخ المغادرة',
    guests: 'الضيوف',
    rooms: 'الغرف',
    totalPrice: 'السعر الإجمالي',
    confirmBooking: 'تأكيد الحجز',
    bookingConfirmed: 'تم تأكيد الحجز',
    // Settings
    language: 'اللغة',
    theme: 'المظهر',
    notifications: 'الإشعارات',
    help: 'المساعدة',
    about: 'حول',
    logout: 'تسجيل الخروج',
  },
  zh: {
    // Common
    cancel: '取消',
    save: '保存',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    // Hotel
    bookNow: '立即预订',
    checkIn: '入住日期',
    checkOut: '退房日期',
    guests: '客人',
    rooms: '房间',
    totalPrice: '总价',
    confirmBooking: '确认预订',
    bookingConfirmed: '预订已确认',
    // Settings
    language: '语言',
    theme: '主题',
    notifications: '通知',
    help: '帮助',
    about: '关于',
    logout: '退出登录',
  },
};

const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = React.useState(LANGUAGES.en);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@language');
      if (savedLanguage && LANGUAGES[savedLanguage]) {
        setCurrentLanguage(LANGUAGES[savedLanguage]);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      if (LANGUAGES[languageCode]) {
        await AsyncStorage.setItem('@language', languageCode);
        setCurrentLanguage(LANGUAGES[languageCode]);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const t = (key) => {
    return TRANSLATIONS[currentLanguage.code]?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        languages: Object.values(LANGUAGES),
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

module.exports = {
  LanguageProvider,
  useLanguage,
}; 