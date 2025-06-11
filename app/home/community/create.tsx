import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CreateCommunity = () => {
  const router = useRouter();
  const [communityName, setCommunityName] = useState('');
  const [communityAbbreviation, setCommunityAbbreviation] = useState('');
  const [logoUri, setLogoUri] = useState('');
  const [loading, setLoading] = useState(false);

  const getAccessToken = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    return token;
  };

  const handleSelectLogo = async () => {
    try {
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
      });

      if (!result.canceled) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCreate = async () => {
    if (!communityName.trim()) {
      Alert.alert('Error', 'Please enter a community name');
      return;
    }
    if (!communityAbbreviation.trim()) {
      Alert.alert('Error', 'Please enter a community abbreviation');
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessToken();
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // First upload the logo if selected
      let profilePhotoFileId: number | undefined;
      if (logoUri) {
        const formData = new FormData();
        formData.append('file', {
          uri: logoUri,
          type: 'image/jpeg',
          name: 'community_logo.jpg',
        } as any);

        const fileResponse = await axios.post(
          'http://192.168.0.22:8080/api/v1/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        profilePhotoFileId = fileResponse.data.data.id;
      }

      // Create the community
      const response = await axios.post(
        'http://192.168.0.22:8080/api/v1/communities',
        {
          name: communityName.trim(),
          abbreviation: communityAbbreviation.trim(),
          profilePhotoFileId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const createdCommunity = response.data.data;
      
      // Navigate back and update the communities list
      router.back();
      router.setParams({ newCommunity: JSON.stringify(createdCommunity) });
      
      Alert.alert('Success', 'Community created successfully!');
    } catch (error: any) {
      console.error('Create community error:', error);
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Not authorized. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to create community. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Create Community',
      }} />
      
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Community Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter community name"
            value={communityName}
            onChangeText={setCommunityName}
            editable={!loading}
          />
          
          <Text style={styles.inputLabel}>Community Abbreviation (max 10 characters)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter abbreviation"
            value={communityAbbreviation}
            onChangeText={setCommunityAbbreviation}
            maxLength={10}
            editable={!loading}
          />

          <View style={styles.logoSection}>
            <TouchableOpacity 
              style={[styles.logoContainer, loading && styles.disabled]}
              onPress={handleSelectLogo}
              disabled={loading}
            >
              {logoUri ? (
                <Image
                  source={{ uri: logoUri }}
                  style={styles.logo}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.logoPlaceholder}>Select Community Logo</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.createButton, loading && styles.disabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Community'}
            </Text>
          </TouchableOpacity>
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
  form: {
    gap: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000000',
    fontSize: 16,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    textAlign: 'center',
    color: '#666666',
    padding: 10,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  disabled: {
    opacity: 0.7,
  },
});

export default CreateCommunity; 