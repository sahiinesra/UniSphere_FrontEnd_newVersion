import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// API configuration
const API_URL = 'http://10.22.123.129:8080';

interface CommunityDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  abbreviation: string;
  profilePhotoUrl?: string;
  leadId?: string;
}

const CommunityDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [hasProfilePhoto, setHasProfilePhoto] = useState(false);
  const [communityData, setCommunityData] = useState<CommunityDetails | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const getAccessToken = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    return token;
  };

  // Fetch user profile to get user id
  const fetchUserProfile = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return null;

      const response = await axios.get(
        'http://10.22.123.129:8080/api/v1/users/profile',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('User Profile Response:', response.data);
      const userData = response.data.data;
      
      if (!userData || userData.id === undefined) {
        console.error('User data or id is missing:', userData);
        return null;
      }

      const idStr = userData.id.toString();
      console.log('Setting user id to:', idStr);
      setCurrentUserId(idStr);
      return idStr;
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error.response?.data || error);
      return null;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const userIdResult = await fetchUserProfile();
        if (!userIdResult) {
          console.error('Failed to get user ID');
          Alert.alert('Error', 'Failed to load user data');
          return;
        }

        await Promise.all([
          fetchCommunityDetails(),
          checkMembership()
        ]);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [id]); // Only re-run when community ID changes

  // Re-check membership when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      checkMembership();
    }
  }, [currentUserId]);

  // Fetch community details
  const fetchCommunityDetails = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/v1/communities/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data.data;
      console.log('Community details:', data);

      setCommunityData({
        ...data,
        memberCount: data.participantCount || 0
      });
      setHasProfilePhoto(!!data.profilePhotoUrl);
    } catch (error: any) {
      console.error('Failed to fetch community details:', error.response?.data || error);
      Alert.alert('Error', 'Failed to load community details');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is a member of the community
  const checkMembership = async () => {
    try {
      if (!currentUserId || !id) {
        console.log('Membership Check - Missing Data:', { currentUserId, communityId: id });
        return;
      }

      const token = await getAccessToken();
      if (!token) return;

      console.log('Checking membership for:', {
        userId: currentUserId,
        communityId: id
      });

      const response = await axios.get(
        `${API_URL}/api/v1/communities/${id}/participants/check?userId=${currentUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Membership check response:', response.data);
      const isMemberResult = response.data.data.isParticipant === true;
      console.log('Is member result:', isMemberResult);
      setIsMember(isMemberResult);
    } catch (error: any) {
      console.error('Failed to check membership:', error.response?.data || error);
      setIsMember(false);
    }
  };

  // Handle joining/leaving the community
  const handleMembershipAction = async () => {
    try {
      if (!currentUserId || !id) {
        console.log('Missing user id or community id for membership action');
        return;
      }

      const token = await getAccessToken();
      if (!token) return;

      setLoading(true);

      if (isMember) {
        // Leave community
        console.log('Attempting to leave community:', {
          communityId: id,
          userId: currentUserId
        });

        await axios.delete(
          `${API_URL}/api/v1/communities/${id}/participants`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Successfully left the community');
        setIsMember(false);
        
        // Refresh community details to update member count
        await fetchCommunityDetails();
        
        Alert.alert('Success', 'You have left the community');
      } else {
        // Join community
        console.log('Attempting to join community:', {
          communityId: id,
          userId: currentUserId
        });

        await axios.post(
          `${API_URL}/api/v1/communities/${id}/participants`,
          { userId: currentUserId },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Successfully joined the community');
        setIsMember(true);
        
        // Refresh community details to update member count
        await fetchCommunityDetails();
        
        Alert.alert('Success', 'You have joined the community');
      }
    } catch (error: any) {
      console.error('Failed to handle membership action:', error.response?.data || error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error?.message
        || (isMember 
          ? 'Failed to leave the community. Please try again.'
          : 'Failed to join the community. Please try again.');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = () => {
    if (!communityData) return;
    
    router.push({
      pathname: '/screens/CommunityChat',
      params: { 
        communityId: id,
        communityName: communityData.name,
        memberCount: communityData.memberCount
      }
    });
  };

  const handleUpdatePhoto = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedAsset = result.assets[0];
        const extension = selectedAsset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        
        const formData = new FormData();
        formData.append('profilePhoto', {
          uri: selectedAsset.uri,
          type: `image/${extension}`,
          name: `profile.${extension}`,
        } as any);

        await axios.post(
          `${API_URL}/api/v1/communities/${id}/photo`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        // Refresh community details to get the new photo URL
        await fetchCommunityDetails();
        Alert.alert('Success', 'Community photo updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating photo:', error);
      Alert.alert('Error', 'Failed to update community photo');
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      await axios.delete(
        `${API_URL}/api/v1/communities/${id}/photo`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setHasProfilePhoto(false);
      // Refresh community details
      await fetchCommunityDetails();
      Alert.alert('Success', 'Community photo deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'Failed to delete community photo');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!communityData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load community details</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ 
        title: communityData.name,
      }} />
      
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.logoContainer}>
            {hasProfilePhoto && communityData.profilePhotoUrl ? (
              <Image
                source={{ uri: communityData.profilePhotoUrl }}
                style={styles.logo}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.logoContainer, styles.noLogo]}>
                <Text style={styles.noLogoText}>{communityData.abbreviation}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.photoButtons}>
            <TouchableOpacity 
              style={[styles.photoButton, styles.updateButton]} 
              onPress={handleUpdatePhoto}
            >
              <Text style={styles.buttonText}>Update Logo</Text>
            </TouchableOpacity>
            
            {hasProfilePhoto && (
              <TouchableOpacity 
                style={[styles.photoButton, styles.deleteButton]} 
                onPress={handleDeletePhoto}
              >
                <Text style={styles.buttonText}>Delete Logo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>{communityData.name}</Text>
          <Text style={styles.subtitle}>{communityData.category} • {communityData.memberCount} Members</Text>
          <Text style={styles.description}>{communityData.description}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.button, 
              isMember ? styles.leaveButton : styles.joinButton,
              loading && styles.disabled
            ]} 
            onPress={handleMembershipAction}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {isMember 
                ? "Leave from Community" 
                : "Join Community"
              }
            </Text>
          </TouchableOpacity>
          
          {isMember && (
            <TouchableOpacity 
              style={[styles.button, styles.chatButton]} 
              onPress={handleChatPress}
            >
              <Text style={styles.buttonText}>Open Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFD700',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  noLogo: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLogoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  photoButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    maxWidth: 150,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  actionButtons: {
    width: '100%',
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    marginBottom: 10,
    width: '100%'
  },
  joinButton: {
    backgroundColor: '#4CAF50',
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  chatButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: '#CCCCCC',
  }
});

export default CommunityDetails; 