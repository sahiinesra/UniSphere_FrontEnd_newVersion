import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Neo-Brutalism Color Palette (Matching index.tsx)
const colors = {
  background: '#FFD700', // Gold yellow (matching AI page)
  text: '#000000',       // Text is Black for contrast
  border: '#000000',     // Borders are Black
  cardBackground: '#FFFFFF', // Card interiors are White
  primaryButtonBackground: '#1E90FF', // Buttons are Blue
  primaryButtonText: '#FFFFFF', // Button text is White
  inputBackground: '#FFFFFF', // Input background is White
};

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  photoUri: string | null;
}

const Profile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: 'Esra',
    lastName: 'Sahin',
    email: 's200101@ankarabilim.edu.tr', // Email from the index page
    photoUri: null
  });
  
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [newPassword, setNewPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');

  // Update form state when userData changes
  useEffect(() => {
    setFirstName(userData.firstName);
    setLastName(userData.lastName);
  }, [userData]);

  // Determine role based on email
  const getRole = (email: string) => {
    return email.charAt(0).toLowerCase() === 's' ? 'Student' : 'Instructor';
  };

  const userRole = getRole(userData.email);

  const handleUpdateProfilePhoto = () => {
    // Implementation for uploading new profile photo
    // Will be connected to backend later
    alert("Update profile photo functionality will be implemented");
  };

  const handleDeleteProfilePhoto = () => {
    // Implementation for deleting profile photo
    // Will be connected to backend later
    setUserData({
      ...userData,
      photoUri: null
    });
    alert("Profile photo deleted");
  };

  const handleUpdateProfile = () => {
    // Save the updated profile data
    setUserData({
      ...userData,
      firstName,
      lastName
    });
    setModalVisible(false);
    alert("Profile updated successfully");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.container}>
          {/* Profile Photo */}
          <View style={styles.photoContainer}>
            <View style={styles.photoWrapper}>
              {userData.photoUri ? (
                <Image
                  source={{ uri: userData.photoUri }}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Ionicons name="person-outline" size={60} color={colors.text} />
                </View>
              )}
              
              <View style={styles.photoActions}>
                <TouchableOpacity 
                  onPress={handleUpdateProfilePhoto}
                  style={styles.updatePhotoButton}
                >
                  <Ionicons name="camera" size={20} color={colors.text} />
                </TouchableOpacity>
                
                {userData.photoUri && (
                  <TouchableOpacity 
                    onPress={handleDeleteProfilePhoto}
                    style={styles.deletePhotoButton}
                  >
                    <Ionicons name="trash" size={20} color={colors.text} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          
          {/* User Info */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{userData.firstName} {userData.lastName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleText}>{userRole}</Text>
              </View>
            </View>
          </View>
          
          {/* Update Profile Button */}
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            style={styles.buttonBase}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Update Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Update Section */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholderTextColor="#999"
                  />
                </View>
                
                {/* Save button for Profile section */}
                <TouchableOpacity 
                  onPress={handleUpdateProfile}
                  style={styles.buttonBase}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Save Profile Changes</Text>
                </TouchableOpacity>
              </View>
              
              {/* Password Change Section - separate section with its own save button */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Change Password</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Verification Code</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={emailCode}
                    onChangeText={setEmailCode}
                    placeholderTextColor="#999"
                  />
                </View>
                
                {/* Save button for Password section */}
                <TouchableOpacity 
                  onPress={() => alert("Password change functionality will be implemented")}
                  style={styles.buttonBase}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Change Password</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoWrapper: {
    position: 'relative',
  },
  profilePhoto: {
    width: 140,
    height: 140,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
  },
  placeholderPhoto: {
    width: 140,
    height: 140,
    borderRadius: 0,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  photoActions: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    flexDirection: 'row',
  },
  updatePhotoButton: {
    backgroundColor: colors.cardBackground,
    padding: 10,
    borderRadius: 0,
    marginRight: 10,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  deletePhotoButton: {
    backgroundColor: colors.cardBackground,
    padding: 10,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 0,
    padding: 24,
    marginBottom: 30,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 4,
  },
  infoLabel: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoValue: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.text,
  },
  roleTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  buttonBase: {
    backgroundColor: colors.primaryButtonBackground,
    paddingVertical: 15,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 16,
  },
  buttonText: {
    color: colors.primaryButtonText,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.border,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: colors.text,
  },
  formSection: {
    marginBottom: 30,
    backgroundColor: colors.cardBackground,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 20,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.text,
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: colors.inputBackground,
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textTransform: 'uppercase',
    color: colors.text,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
    paddingBottom: 5,
  },
});

export default Profile;
