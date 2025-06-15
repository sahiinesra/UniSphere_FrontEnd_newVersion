import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Axios instance configuration
const api = axios.create({
  baseURL: 'http://10.200.0.7:8080/api/v1',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Retry logic
const retryRequest = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

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

// Interface for UserData
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  photoUri: string | null;
}

// Interface for Profile Modal Content props
interface ProfileModalContentProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  photoUri: string | null;
  handleUpdateProfile: () => void;
  handleUpdateProfilePhoto: () => void;
  handleDeleteProfilePhoto: () => void;
  onClose: () => void;
}

// Interface for Password Modal Content props
interface PasswordModalContentProps {
  resetEmail: string;
  setResetEmail: (value: string) => void;
  emailCode: string;
  setEmailCode: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  verificationSent: boolean;
  handleSendVerificationCode: () => void;
  handleChangePassword: () => void;
  onClose: () => void;
}

const getAccessToken = async () => {
  const token = await SecureStore.getItemAsync('accessToken');
  return token;
};

// Profile Update Modal Content
const ProfileModalContent: React.FC<ProfileModalContentProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  photoUri,
  handleUpdateProfile,
  handleUpdateProfilePhoto,
  handleDeleteProfilePhoto,
  onClose
}) => (
  <View style={styles.modalContent}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Update Profile</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={20}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          {/* Profile Photo Management */}
          <View style={styles.photoManagementContainer}>
            <View style={styles.profilePhotoContainer}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.profilePhotoEdit}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <View style={styles.placeholderPhotoEdit}>
                  <Ionicons name="person-outline" size={60} color={colors.text} />
                </View>
              )}
            </View>

            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity
                onPress={handleUpdateProfilePhoto}
                style={styles.photoButton}
              >
                <Ionicons name="create-outline" size={18} color={colors.text} />
                <Text style={styles.photoButtonText}>Edit Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteProfilePhoto}
                style={[styles.photoButton, styles.deleteButton]}
                disabled={!photoUri}
              >
                <Ionicons name="trash" size={18} color="#FF0000" />
                <Text style={styles.photoButtonText}>Delete Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Personal Information */}
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

          <TouchableOpacity
            onPress={handleUpdateProfile}
            style={styles.buttonBase}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
);

// Password Change Modal Content
const PasswordModalContent: React.FC<PasswordModalContentProps> = ({
  resetEmail,
  setResetEmail,
  emailCode,
  setEmailCode,
  newPassword,
  setNewPassword,
  verificationSent,
  handleSendVerificationCode,
  handleChangePassword,
  onClose
}) => (
  <View style={styles.modalContent}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Change Password</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={20}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholderTextColor="#999"
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {!verificationSent && (
            <TouchableOpacity
              onPress={handleSendVerificationCode}
              style={styles.buttonBase}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Send Verification Code</Text>
            </TouchableOpacity>
          )}

          {verificationSent && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="default"
                  value={emailCode}
                  onChangeText={setEmailCode}
                  placeholderTextColor="#999"
                  placeholder="Enter verification code"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholderTextColor="#999"
                  placeholder="Enter new password"
                />
              </View>

              <TouchableOpacity
                onPress={handleChangePassword}
                style={styles.buttonBase}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Change Password</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
);

const Profile = () => {
  // Profile update modal
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  // Password change modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  // Verification sent state
  const [verificationSent, setVerificationSent] = useState(false);
  // Email for password reset
  const [resetEmail, setResetEmail] = useState('');

  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    photoUri: null,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          console.warn('Token bulunamadı');
          return;
        }

        const profileResponse = await retryRequest(() => 
          api.get('/users/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        );

        const profileData = profileResponse.data.data;
        
        // Replace localhost URL with the correct server URL
        const photoUrl = profileData.profilePhotoUrl ? 
          profileData.profilePhotoUrl.replace('http://localhost:8080', 'http://10.200.0.7:8080') : 
          null;

        console.log('Adjusted photo URL:', photoUrl);

        setUserData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          photoUri: photoUrl
        });

      } catch (error: any) {
        console.error('Profil alınamadı:', error.response?.data || error);
        
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            Alert.alert(
              'Connection Timeout',
              'The server is taking too long to respond. Please check your internet connection and try again.'
            );
          } else if (!error.response) {
            Alert.alert(
              'Network Error',
              'Unable to connect to the server. Please check your internet connection.'
            );
          } else {
            Alert.alert('Error', error.response?.data?.message || 'Failed to load profile');
          }
        } else {
          Alert.alert('Error', 'An unexpected error occurred while loading profile');
        }
      }
    };

    fetchUserProfile();
  }, []);

  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [newPassword, setNewPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');

  // Update form state when userData changes
  useEffect(() => {
    setFirstName(userData.firstName);
    setLastName(userData.lastName);
    setResetEmail(userData.email); // Initialize reset email with user's email
  }, [userData]);

  // Determine role based on email
  const getRole = (email: string) => {
    return email.charAt(0).toLowerCase() === 's' ? 'Student' : 'Instructor';
  };

  const userRole = getRole(userData.email);

  const handleUpdateProfilePhoto = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedAsset = result.assets[0];
        
        const extension = selectedAsset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        
        if (!['jpg', 'jpeg', 'png'].includes(extension)) {
          Alert.alert('Invalid File', 'Please select a JPG, JPEG or PNG image.');
          return;
        }

        const mimeType = extension === 'jpg' ? 'jpeg' : extension;
        
        const formData = new FormData();
        formData.append('photo', {
          uri: Platform.OS === 'ios' ? selectedAsset.uri.replace('file://', '') : selectedAsset.uri,
          type: `image/${mimeType}`,
          name: `profile.${extension}`,
        } as any);

        console.log('Uploading photo with token:', token);

        const response = await axios.post(
          'http://10.200.0.7:8080/api/v1/users/profile/photo',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json'
            },
          }
        );

        console.log('Photo upload response:', response.data);

        // After successful upload, fetch updated profile data
        const profileResponse = await api.get('/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const profileData = profileResponse.data.data;
        
        // Replace localhost URL with the correct server URL
        const photoUrl = profileData.profilePhotoUrl ? 
          profileData.profilePhotoUrl.replace('http://localhost:8080', 'http://10.200.0.7:8080') : 
          null;

        console.log('Adjusted photo URL after upload:', photoUrl);
        
        // Update local state with the new profile data
        setUserData(prev => ({
          ...prev,
          photoUri: photoUrl
        }));

        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating profile photo:', error);
      if (axios.isAxiosError(error)) {
        console.log('Error response:', error.response?.data);
        console.log('Error status:', error.response?.status);
        Alert.alert('Error', error.response?.data?.message || `Failed to update profile photo: ${error.response?.status}`);
      } else {
        Alert.alert('Error', 'An unexpected error occurred while updating profile photo');
      }
    }
  };

  const handleDeleteProfilePhoto = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Delete photo from backend
      await axios.delete('http://10.200.0.7:8080/api/v1/users/profile/photo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        photoUri: null
      }));

      Alert.alert('Success', 'Profile photo deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting profile photo:', error.response?.data || error);
      if (axios.isAxiosError(error)) {
        console.log('Error response:', error.response?.data);
        console.log('Error status:', error.response?.status);
        Alert.alert('Error', error.response?.data?.message || `Failed to delete profile photo: ${error.response?.status}`);
      } else {
        Alert.alert('Error', 'An unexpected error occurred while deleting profile photo');
      }
    }
  };

  const handleUpdateProfile = async (
    firstName: string,
    lastName: string,
    onClose: () => void
  ) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        alert('Token bulunamadı, lütfen tekrar giriş yapınız.');
        return;
      }

      const payload = {
        firstName,
        lastName,
        password: "", // Backend zorunluysa boş gönder
      };

      const response = await api.put('/users/profile', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend doğru döndüyse local state'i güncelle
      setUserData((prev) => ({
        ...prev,
        firstName,
        lastName,
      }));

      alert('Profile updated successfully!');
      onClose(); // modal'ı kapat

    } catch (error: any) {
      console.error('Profil güncellenemedi:', error?.response?.data || error.message);
      alert('Profil güncellenirken hata oluştu.');
    }
  };

  const handleSendVerificationCode = async () => {
    if (!resetEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    try {
      // First send the verification code to email
      const response = await api.post('/auth/forgot-password', {
        email: resetEmail
      });

      console.log('Verification code response:', response.data);

      if (response.data?.data?.message) {
        setVerificationSent(true);
        alert(response.data.data.message || `Verification code sent to ${resetEmail}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Verification code error details:', {
        response: error?.response?.data,
        status: error?.response?.status,
        message: error?.message
      });
      
      setVerificationSent(false);
      if (error?.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error?.message) {
        alert(`Failed to send verification code: ${error.message}`);
      } else {
        alert('Failed to send verification code. Please try again.');
      }
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !emailCode.trim()) {
      alert("Please enter both verification code and new password");
      return;
    }

    try {
      console.log('Attempting to verify email with code:', emailCode);
      
      // First verify the email with the code
      const verifyResponse = await api.get(`/auth/verify-email?token=${emailCode}`);
      console.log('Email verification response:', verifyResponse.data);

      if (verifyResponse.data?.data?.message) {
        console.log('Attempting to reset password');
        
        // Then reset the password
        const resetResponse = await api.post('/auth/reset-password', {
          token: emailCode,
          newPassword: newPassword
        });

        console.log('Password reset response:', resetResponse.data);

        if (resetResponse.data?.data?.message) {
          setPasswordModalVisible(false);
          setVerificationSent(false);
          setNewPassword('');
          setEmailCode('');
          setResetEmail('');
          alert(resetResponse.data.data.message || "Password changed successfully");
        } else {
          throw new Error('Invalid response from password reset');
        }
      } else {
        throw new Error('Email verification failed');
      }
    } catch (error: any) {
      console.error('Password reset error details:', {
        response: error?.response?.data,
        status: error?.response?.status,
        message: error?.message
      });

      if (error?.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error?.message) {
        alert(`Failed to reset password: ${error.message}`);
      } else {
        alert('Failed to reset password. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all stored tokens
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      
      // Navigate back to login screen
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout properly. Please try again.');
    }
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
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Ionicons name="person-outline" size={60} color={colors.text} />
                </View>
              )}
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

          {/* Profile Update Button */}
          <TouchableOpacity
            onPress={() => setProfileModalVisible(true)}
            style={styles.buttonBase}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>

          {/* Change Password Button */}
          <TouchableOpacity
            onPress={() => {
              setPasswordModalVisible(true);
              setVerificationSent(false);
            }}
            style={[styles.buttonBase, { backgroundColor: colors.cardBackground }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Change Password</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.buttonBase, { backgroundColor: '#FF3B30' }]}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profile Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ProfileModalContent
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            photoUri={userData.photoUri}
            handleUpdateProfile={() => handleUpdateProfile(firstName, lastName, () => setProfileModalVisible(false))}
            handleUpdateProfilePhoto={handleUpdateProfilePhoto}
            handleDeleteProfilePhoto={handleDeleteProfilePhoto}
            onClose={() => setProfileModalVisible(false)}
          />
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => {
          setPasswordModalVisible(false);
          setVerificationSent(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <PasswordModalContent
            resetEmail={resetEmail}
            setResetEmail={setResetEmail}
            emailCode={emailCode}
            setEmailCode={setEmailCode}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            verificationSent={verificationSent}
            handleSendVerificationCode={handleSendVerificationCode}
            handleChangePassword={handleChangePassword}
            onClose={() => {
              setPasswordModalVisible(false);
              setVerificationSent(false);
            }}
          />
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
    maxHeight: '90%',
    flex: 1,
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
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
  },
  emailText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  sendCodeButton: {
    backgroundColor: colors.primaryButtonBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: colors.border,
  },
  sendCodeText: {
    color: colors.primaryButtonText,
    fontWeight: 'bold',
    fontSize: 14,
  },
  photoManagementContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  profilePhotoContainer: {
    marginBottom: 15,
  },
  profilePhotoEdit: {
    width: 120,
    height: 120,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
  },
  placeholderPhotoEdit: {
    width: 120,
    height: 120,
    borderRadius: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  photoButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#FFE0E0',
  },
  separator: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
});

export default Profile;
