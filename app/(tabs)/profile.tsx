import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
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
import api from '../services/api';
import { storageService } from '../services/storage';

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
  firstName?: string;
  lastName?: string;
  email?: string;
  photoUri?: string | null;
  role?: string;
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
                  keyboardType="number-pad"
                  value={emailCode}
                  onChangeText={setEmailCode}
                  placeholderTextColor="#999"
                  placeholder="Enter verification code"
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
  const router = useRouter();
  // Profile update modal
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  // Password change modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  // Verification sent state
  const [verificationSent, setVerificationSent] = useState(false);
  // Email for password reset
  const [resetEmail, setResetEmail] = useState('');
  
  // Initialize userData first
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    photoUri: null,
    role: '',
  });
  
  // Use default values for dependent states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');

  // Store the access token when component mounts
  useEffect(() => {
    const storeAccessToken = async () => {
      try {
        // Store the token for profile API requests
        const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiczIwMDIwNDAzNkBhbmthcmFiaWxpbS5lZHUudHIiLCJyb2xlVHlwZSI6IlNUVURFTlQiLCJpc3MiOiJ1bmlzcGhlcmUuYXBwIiwic3ViIjoiMiIsImV4cCI6MTc0NzIzMzcyOCwibmJmIjoxNzQ3MjI2NTI4LCJpYXQiOjE3NDcyMjY1MjgsImp0aSI6IjgwMjlmZjJjLWRmYWYtNDdjZi1iMzJmLTU2MWJjMzAxMWZiMCJ9.Bu51V0zciDh7j8usAXFtYY87_qIL3oJTf9Bw_OYCn7w";
        await storageService.setAuthToken(accessToken);
        console.log('Access token stored successfully');
      } catch (error) {
        console.error('Error storing access token:', error);
      }
    };

    storeAccessToken();
  }, []);

  // Separate useEffect for loading saved photo first
  useEffect(() => {
    const loadSavedPhoto = async () => {
      try {
        const savedPhotoUrl = await AsyncStorage.getItem('userProfilePhotoUrl');
        if (savedPhotoUrl) {
          console.log('Loaded saved photo URL from AsyncStorage:', savedPhotoUrl);
          setUserData(prevData => ({
            ...prevData,
            photoUri: savedPhotoUrl
          }));
        }
      } catch (error) {
        console.error('Error loading saved photo URL:', error);
      }
    };
    
    loadSavedPhoto();
  }, []);

  // Add back the useEffect to fetch profile data
  useEffect(() => {
    // Fetch profile after a short delay to ensure token is stored and saved photo is loaded first
    setTimeout(() => {
      fetchUserProfile();
    }, 1000);
  }, []);

  // Modify fetchUserProfile to preserve existing photo if API doesn't provide one
  const fetchUserProfile = async () => {
    try {
      // Retrieve the token using the storage service
      const token = await storageService.getAuthToken();
      
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      console.log('Using token for profile request:', token.substring(0, 10) + '...');
      
      const response = await api.get('/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile response (full):', JSON.stringify(response.data));
      
      if (response.data && response.data.data) {
        // Handle the nested data structure from the API response
        const profileData = response.data.data;
        
        console.log('Profile data fields:', Object.keys(profileData));
        
        // Check for photo URL in various possible fields
        let photoUrl = null;
        
        // Try different possible field names for the photo URL
        const possiblePhotoFields = ['photoUrl', 'photoUri', 'avatarUrl', 'profilePhoto', 'imageUrl', 'photo'];
        
        for (const field of possiblePhotoFields) {
          if (profileData[field]) {
            photoUrl = profileData[field];
            console.log(`Found photo URL in field '${field}':`, photoUrl);
            break;
          }
        }
        
        // Check if we have a full URL or just a path
        if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('file:')) {
          // If it's a relative path, prepend the API base URL
          const apiBaseUrl = api.defaults.baseURL || 'http://localhost:8080/api/v1';
          const baseServerUrl = apiBaseUrl.replace('/api/v1', '');
          photoUrl = `${baseServerUrl}${photoUrl}`;
          console.log('Converted relative path to full URL:', photoUrl);
        }
        
        // If API didn't return a photo URL, try to use the saved one
        if (!photoUrl) {
          const savedPhotoUrl = await AsyncStorage.getItem('userProfilePhotoUrl');
          if (savedPhotoUrl) {
            console.log('Using saved photo URL from AsyncStorage:', savedPhotoUrl);
            photoUrl = savedPhotoUrl;
          }
        } else {
          // Store the photo URL in AsyncStorage for persistence
          await AsyncStorage.setItem('userProfilePhotoUrl', photoUrl);
          console.log('Saved photo URL to AsyncStorage:', photoUrl);
        }
        
        // Update user data but preserve existing photo if no new photo available
        setUserData(prevData => ({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          photoUri: photoUrl || prevData.photoUri, // Use existing photo if no new one
          role: profileData.role || '',
        }));
        
        console.log('User data updated with photo URL:', photoUrl);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Update dependent states when userData changes
  useEffect(() => {
    setFirstName(userData.firstName || '');
    setLastName(userData.lastName || '');
    setResetEmail(userData.email || '');
  }, [userData]);

  // Determine role based on email
  const getRole = (email: string) => {
    return email.charAt(0).toLowerCase() === 's' ? 'Student' : 'Instructor';
  };

  const userRole = getRole(userData.email || '');

  const handleUpdateProfilePhoto = async () => {
    try {
      // Request permission to access the photo library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert("Permission to access camera roll is required!");
        return;
      }
      
      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (result.canceled) {
        console.log('User cancelled image picker');
        return;
      }
      
      if (!result.assets || result.assets.length === 0) {
        console.log('No image selected');
        return;
      }
      
      const selectedImage = result.assets[0];
      console.log('Selected image:', selectedImage.uri);
      
      // Get the authentication token
      const token = await storageService.getAuthToken();
      
      if (!token) {
        console.error('No access token found');
        alert("Authentication error. Please log in again.");
        return;
      }
      
      // Create form data for the image upload
      const formData = new FormData();
      
      // Get file name from URI
      const uriParts = selectedImage.uri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      // Get file type
      const fileType = selectedImage.uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // Append the image to form data with proper configuration
      formData.append('photo', {
        uri: selectedImage.uri,
        name: fileName,
        type: fileType,
      } as any);
      
      console.log('FormData created with file:', fileName, fileType);
      console.log('Uploading image...');
      
      // Get API base URL
      const apiBaseUrl = api.defaults.baseURL || 'http://localhost:8080/api/v1';
      const uploadUrl = `${apiBaseUrl}/users/profile/photo`;
      
      console.log('Uploading image to:', uploadUrl);
      
      // Make API call to upload the photo
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Upload response (full):', JSON.stringify(responseData));
      
      // Extract photo URL from response with better error handling
      let photoUrl = selectedImage.uri; // Default to local URI
      
      if (responseData) {
        // Check if response has data property
        const dataObj = responseData.data || responseData;
        
        console.log('Response data fields:', Object.keys(dataObj));
        
        // Try different possible field names for the photo URL
        const possiblePhotoFields = ['photoUrl', 'photoUri', 'avatarUrl', 'profilePhoto', 'imageUrl', 'photo', 'url', 'path'];
        
        for (const field of possiblePhotoFields) {
          if (dataObj[field]) {
            photoUrl = dataObj[field];
            console.log(`Found photo URL in response field '${field}':`, photoUrl);
            break;
          }
        }
        
        // Check if we have a full URL or just a path
        if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('file:')) {
          // If it's a relative path, prepend the API base URL
          const baseServerUrl = apiBaseUrl.replace('/api/v1', '');
          photoUrl = `${baseServerUrl}${photoUrl}`;
          console.log('Converted relative path to full URL:', photoUrl);
        }
        
        // Store the photo URL in AsyncStorage for persistence
        await AsyncStorage.setItem('userProfilePhotoUrl', photoUrl);
        console.log('Saved photo URL to AsyncStorage:', photoUrl);
      }
      
      // Update local state with the new photo URI
      setUserData({
        ...userData,
        photoUri: photoUrl
      });
      
      alert("Profile photo updated successfully");
      console.log('Profile photo updated in state:', photoUrl);
    } catch (error) {
      console.error('Error updating profile photo:', error);
      alert("Failed to update profile photo. Please try again.");
    }
  };

  const handleDeleteProfilePhoto = async () => {
    try {
      // Get the authentication token
      const token = await storageService.getAuthToken();
      
      if (!token) {
        console.error('No access token found');
        alert("Authentication error. Please log in again.");
        return;
      }
      
      console.log('Deleting profile photo...');
      
      // Make API call to delete the photo using api.defaults.baseURL for the base URL
      const apiBaseUrl = api.defaults.baseURL || 'http://localhost:8080/api/v1';
      const deleteUrl = `${apiBaseUrl}/users/profile/photo`;

      console.log('Deleting profile photo from:', deleteUrl);

      // Make API call to delete the photo
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Delete response:', responseData);
      
      // Update local state to remove the photo URI
      setUserData({
        ...userData,
        photoUri: null
      });
      
      alert("Profile photo deleted successfully");
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      alert("Failed to delete profile photo. Please try again.");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Show loading indicator or disable button here if needed
      
      // Get the authentication token
      const token = await storageService.getAuthToken();
      
      if (!token) {
        console.error('No access token found');
        alert("Authentication error. Please log in again.");
        return;
      }
      
      console.log('Updating profile with:', { firstName, lastName });
      
      // Make API call to update profile
      const response = await api.put('/users/profile', 
        {
          firstName: firstName,
          lastName: lastName
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Profile update response:', response.data);
      
      // Update local state with the new values
      setUserData({
        ...userData,
        firstName,
        lastName
      });
      
      // Close the modal
      setProfileModalVisible(false);
      
      // Show success message
      alert("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleSendVerificationCode = () => {
    // Implementation for sending verification code
    // Will be connected to backend later
    if (!resetEmail.trim()) {
      alert("Please enter an email address");
      return;
    }
    
    setVerificationSent(true);
    alert(`Verification code sent to ${resetEmail}`);
  };

  const handleChangePassword = () => {
    // Implementation for changing password
    // Will be connected to backend later
    if (!newPassword.trim() || !emailCode.trim()) {
      alert("Please enter both verification code and new password");
      return;
    }
    
    setPasswordModalVisible(false);
    setVerificationSent(false);
    setNewPassword('');
    setEmailCode('');
    setResetEmail('');
    alert("Password changed successfully");
  };

  const handleLogout = () => {
    // Placeholder for any logout logic (clearing tokens, etc.)
    // For now, just navigate to the login page
    router.replace('/login');
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
            </View>
          </View>
          
          {/* User Info */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First Name</Text>
              <Text style={styles.infoValue}>{userData.firstName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Name</Text>
              <Text style={styles.infoValue}>{userData.lastName}</Text>
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
            photoUri={userData.photoUri || null}
            handleUpdateProfile={handleUpdateProfile}
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
