import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { communityService } from '../services/communityService';
import { getAccessToken } from '../utils/auth';

// Define colors to match the application theme
const colors = {
  background: '#FFD700', // Gold yellow (matching AI page)
  text: '#000000',       // Text is Black for contrast
  border: '#000000',     // Borders are Black
  cardBackground: '#FFFFFF', // Card interiors are White
  primary: '#4CAF50',
  danger: '#f44336',
};

export type Community = {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  abbreviation: string;
  logoUri?: string;
  description?: string;
  leadId?: string;
};

export default function Communities() {
  const router = useRouter();
  const { newCommunity } = useLocalSearchParams();
  const [showMyCommunities, setShowMyCommunities] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    abbreviation: '',
  });

  // Fetch user profile to get role
  const fetchUserProfile = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await axios.get(
        'http://192.168.1.57:8080/api/v1/users/profile',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('User Profile Response:', response.data);
      const userData = response.data.data;
      setUserRole(userData.role);
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (newCommunity) {
      try {
        const parsedCommunity = JSON.parse(newCommunity as string) as Community;
        setCommunities(prev => [...prev, parsedCommunity]);
      } catch (error) {
        console.error('Error parsing new community data:', error);
      }
    }
  }, [newCommunity]);

  const loadCommunities = async () => {
    try {
      console.log('Loading communities, showMyCommunities:', showMyCommunities);
      let response;
      if (showMyCommunities) {
        console.log('Fetching my communities...');
        response = await communityService.getMyCommunities();
        console.log('My communities response:', response);
        const myCommunities = response.data.map((community: any) => ({
          id: community.id.toString(),
          name: community.name,
          abbreviation: community.abbreviation,
          memberCount: community.participantCount,
          leadId: community.leadId.toString(),
          logoUri: community.profilePhotoUrl,
          createdAt: community.createdAt,
          updatedAt: community.updatedAt
        }));
        console.log('Processed my communities:', myCommunities);
        setCommunities(myCommunities);
      } else {
        console.log('Fetching all communities...');
        response = await communityService.getAllCommunities();
        console.log('All communities response:', response);
        const allCommunities = response.data.communities.map((community: any) => ({
          ...community,
          memberCount: community.participantCount || 0
        }));
        console.log('Processed all communities:', allCommunities);
        setCommunities(allCommunities);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      Alert.alert('Error', 'Failed to retrieve communities.');
    }
  };

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, refreshing communities...');
      loadCommunities();
    }, [showMyCommunities])
  );

  const handleCommunityPress = (communityId: string) => {
    router.push(`/home/community/${communityId}`);
  };

  const handleUpdateCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setUpdateFormData({
      name: community.name,
      abbreviation: community.abbreviation,
    });
    setUpdateModalVisible(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedCommunity) return;

    try {
      await communityService.updateCommunity(selectedCommunity.id, {
        name: updateFormData.name.trim(),
        abbreviation: updateFormData.abbreviation.trim(),
        description: selectedCommunity.description || 'Community Description',
        category: selectedCommunity.category || 'ACADEMIC',
        leadId: selectedCommunity.leadId || '1'
      });

      setCommunities(prevCommunities =>
        prevCommunities.map(community =>
          community.id === selectedCommunity.id
            ? { 
                ...community, 
                name: updateFormData.name, 
                abbreviation: updateFormData.abbreviation 
              }
            : community
        )
      );

      setUpdateModalVisible(false);
      Alert.alert('Success', 'Community updated successfully!');
    } catch (error: any) {
      console.error('Failed to update community:', error.response?.data || error);
      Alert.alert('Error', 'Failed to update community. Please try again.');
    }
  };

  const handleDeleteCommunity = async (communityId: string) => {
    try {
      await communityService.deleteCommunity(communityId);
      setCommunities(prev => prev.filter(c => c.id !== communityId));
      Alert.alert('Success', 'Community deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete community:', error.response?.data || error);
      Alert.alert('Error', 'Failed to delete community. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Communities',
      }} />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.tabButton, !showMyCommunities && styles.activeTab]}
            onPress={() => setShowMyCommunities(false)}
          >
            <Text style={styles.tabButtonText}>All Communities</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, showMyCommunities && styles.activeTab]}
            onPress={() => setShowMyCommunities(true)}
          >
            <Text style={styles.tabButtonText}>My Communities</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/home/community/create' as any)}
        >
          <Text style={styles.buttonText}>Create New Community</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          {communities.map((community) => (
            <View key={community.id} style={styles.card}>
              <TouchableOpacity 
                onPress={() => handleCommunityPress(community.id)}
                style={styles.communityHeader}
              >
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.memberCount}>
                  Members: {community.memberCount}
                </Text>
              </TouchableOpacity>
              
              {userRole === 'INSTRUCTOR' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.updateButton]}
                    onPress={() => handleUpdateCommunity(community)}
                  >
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteCommunity(community.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Update Community Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={updateModalVisible}
          onRequestClose={() => setUpdateModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Community</Text>
                <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Community Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={updateFormData.name}
                  onChangeText={(text) => setUpdateFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter community name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Abbreviation</Text>
                <TextInput
                  style={styles.modalInput}
                  value={updateFormData.abbreviation}
                  onChangeText={(text) => setUpdateFormData(prev => ({ ...prev, abbreviation: text }))}
                  placeholder="Enter abbreviation"
                  maxLength={10}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setUpdateModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateSubmit}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.background,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  createButton: {
    margin: 10,
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  communityHeader: {
    marginBottom: 10,
  },
  communityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  memberCount: {
    fontSize: 14,
    color: colors.text,
    marginTop: 5,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
  },
  joinButton: {
    backgroundColor: '#007AFF', // iOS blue color for join
  },
  updateButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.cardBackground,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    margin: 20,
    borderRadius: 8,
    padding: 20,
    borderWidth: 3,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.text,
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: colors.cardBackground,
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 