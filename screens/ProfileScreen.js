// screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert, // Pour la confirmation de déconnexion
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native'; // Décommentez si besoin pour naviguer depuis ce screen

// --- ProfileScreen Component ---

function ProfileScreen({ navigation }) { // Récupère la prop navigation
  // --- State ---
  // Simule des données utilisateur (remplacez par vos vraies données/logique de fetch)
  const [userData] = useState({
    name: 'Salim Dev',
    email: 'salim.dev@example.com',
    joinDate: 'Joined August 2024',
    // Pas d'avatarUrl pour l'instant
  });

  // --- Fonctions ---
  const handleLogout = () => {
    Alert.alert(
      "Log Out", // Titre
      "Are you sure you want to log out?", // Message
      [
        {
          text: "Cancel",
          onPress: () => console.log("Logout cancelled"),
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: () => {
            console.log("User logged out");
            // --- AJOUTEZ VOTRE LOGIQUE DE DÉCONNEXION ICI ---
            // Par exemple: nettoyer le token d'authentification, vider le state global, etc.
            // Puis naviguer vers l'écran de connexion/authentification
            // Exemple : navigation.navigate('Auth'); // Assurez-vous que 'Auth' existe dans votre navigateur
          },
          style: "destructive" // Style rouge pour l'action destructive (iOS)
        }
      ]
    );
  };

  // Fonction générique pour naviguer (ou juste logger pour l'instant)
  const navigateToScreen = (screenName) => {
    console.log(`Attempting to navigate to: ${screenName}`);
    // navigation.navigate(screenName); // Décommentez et utilisez quand les écrans existent
    Alert.alert("Navigation", `Simulating navigation to ${screenName}`);
  };

  // --- Helper pour rendre les items de liste ---
  const renderProfileItem = (iconName, text, screenName = null, isDestructive = false) => (
    <TouchableOpacity
      style={styles.listItemContainer}
      onPress={screenName ? () => navigateToScreen(screenName) : null} // Navigue seulement si screenName est fourni
      activeOpacity={0.7}
    >
      <Ionicons
        name={iconName}
        size={24}
        color={isDestructive ? styles.destructiveColor.color : styles.iconColor.color}
        style={styles.listItemIcon}
      />
      <Text style={[styles.listItemText, isDestructive && styles.destructiveColor]}>{text}</Text>
      {screenName && ( // Affiche la flèche seulement si c'est navigable
        <Ionicons
          name="chevron-forward-outline"
          size={22}
          color="#B0BEC5" // Gris clair pour la flèche
        />
      )}
    </TouchableOpacity>
  );

  // --- Rendu Principal ---
  return (
    <View style={styles.screenContainer}>
      {/* Change la couleur de la status bar pour ce screen si besoin */}
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Section Informations Utilisateur --- */}
        <View style={styles.userInfoHeader}>
          <View style={styles.avatarPlaceholder}>
            {/* Placeholder pour l'avatar: Icône ou initiales */}
            <Ionicons name="person-outline" size={50} color="#004D40" />
            {/* Ou initiales: <Text style={styles.avatarInitials}>SD</Text> */}
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.userJoinDate}>{userData.joinDate}</Text>
        </View>

        {/* --- Section Paramètres du Compte --- */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        {renderProfileItem('person-outline', 'Edit Profile', 'EditProfile')}
        {renderProfileItem('lock-closed-outline', 'Change Password', 'ChangePassword')}
        {renderProfileItem('notifications-outline', 'Notification Settings', 'NotificationSettings')}
        {renderProfileItem('card-outline', 'Payment Methods', 'PaymentMethods')}

        {/* --- Section Aide & Légal --- */}
        <Text style={styles.sectionTitle}>Support & Legal</Text>
        {renderProfileItem('help-circle-outline', 'Help Center', 'HelpCenter')}
        {renderProfileItem('information-circle-outline', 'About Us', 'AboutUs')}
        {renderProfileItem('document-text-outline', 'Terms of Service', 'TermsOfService')}
        {renderProfileItem('shield-checkmark-outline', 'Privacy Policy', 'PrivacyPolicy')}

        {/* --- Bouton Déconnexion --- */}
        <TouchableOpacity
          style={styles.logoutButtonContainer}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color={styles.destructiveColor.color} style={styles.listItemIcon} />
          <Text style={[styles.listItemText, styles.destructiveColor]}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Un fond légèrement différent pour distinguer
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 50, // Espace en bas
  },
  // --- User Info Header ---
  userInfoHeader: {
    backgroundColor: '#FFFFFF', // Fond blanc
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center', // Centre les éléments
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20, // Espace avant la première section
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50, // Cercle parfait
    backgroundColor: '#E0F2F7', // Bleu très clair
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#B2EBF2' // Bordure un peu plus foncée
  },
  // Style pour les initiales si vous préférez à l'icône
  // avatarInitials: {
  //   fontSize: 40,
  //   fontWeight: 'bold',
  //   color: '#004D40',
  // },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263238', // Gris foncé
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#546E7A', // Gris moyen
    marginBottom: 8,
  },
  userJoinDate: {
    fontSize: 14,
    color: '#78909C', // Gris clair
  },
  // --- Sections & Items ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#455A64', // Gris/Bleu foncé
    marginHorizontal: 20,
    marginTop: 20, // Espace au-dessus du titre
    marginBottom: 10, // Espace en-dessous du titre
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1', // Séparateur très léger entre les items
  },
  listItemIcon: {
    marginRight: 20, // Espace entre icône et texte
  },
  listItemText: {
    flex: 1, // Pour que le texte prenne l'espace et pousse la flèche à droite
    fontSize: 17,
    color: '#37474F', // Couleur de texte standard
  },
  // --- Logout Button ---
  logoutButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0', // Fond rouge très pâle pour indiquer la déconnexion
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 30, // Espace au-dessus du bouton
    marginHorizontal: 20, // Marges latérales
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2', // Bordure rouge pâle
  },
  destructiveColor: {
    color: '#D32F2F', // Rouge standard pour actions destructives
  },
  iconColor: { // Couleur par défaut des icônes (peut être ajustée)
      color: '#546E7A',
  },
});

export default ProfileScreen;