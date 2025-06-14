import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// API configuration
const API_URL = 'http://192.168.1.136:8080';

export default function CreateCommunity() {
  const router = useRouter();
  const [communityName, setCommunityName] = useState('');
  const [communityAbbreviation, setCommunityAbbreviation] = useState('');
  const [category, setCategory] = useState('ACADEMIC');
  const [logoUri, setLogoUri] = useState('');
  const [loading, setLoading] = useState(false);

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
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedAsset = result.assets[0];
        console.log('Selected image:', selectedAsset);
        setLogoUri(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCreate = async () => {
    // Validate inputs
    if (!communityName.trim()) {
      Alert.alert('Error', 'Please enter a community name');
      return;
    }
    if (!communityAbbreviation.trim()) {
      Alert.alert('Error', 'Please enter a community abbreviation');
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const formData = new FormData();
      formData.append('name', communityName.trim());
      formData.append('abbreviation', communityAbbreviation.trim());
      formData.append('category', category);

      if (logoUri) {
        // Get file extension from URI
        const extension = logoUri.split('.').pop() || 'jpg';
        
        formData.append('profilePhoto', {
          uri: logoUri,
          type: `image/${extension}`,
          name: `profile.${extension}`,
        } as any);

        console.log('Uploading photo:', {
          uri: logoUri,
          type: `image/${extension}`,
          name: `profile.${extension}`
        });
      }

      console.log('Creating community with data:', {
        name: communityName,
        abbreviation: communityAbbreviation,
        category,
        hasPhoto: !!logoUri
      });

      const response = await axios.post(
        `${API_URL}/api/v1/communities`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
        }
      );

      console.log('Community created:', response.data);
      Alert.alert(
        'Success', 
        'Community created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error: any) {
      console.error('Failed to create community:', error.response?.data || error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error?.message
        || 'Failed to create community. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{
        title: 'Create Community',
      }} />
      
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Community Name</Text>
          <TextInput
            style={styles.input}
            value={communityName}
            onChangeText={setCommunityName}
            editable={!loading}
          />
          
          <Text style={styles.inputLabel}>Community Abbreviation (max 10 characters)</Text>
          <TextInput
            style={styles.input}
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  form: {
    gap: 20,
    padding: 20,
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