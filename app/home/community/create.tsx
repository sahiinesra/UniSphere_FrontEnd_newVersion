import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Community } from '../communities';

const CreateCommunity = () => {
  const router = useRouter();
  const [communityName, setCommunityName] = useState('');
  const [communityAbbreviation, setCommunityAbbreviation] = useState('');
  const [logoUri, setLogoUri] = useState('');

  const handleSelectLogo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
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
      alert('Failed to pick image');
    }
  };

  const handleCreate = () => {
    if (!communityName.trim()) {
      alert('Please enter a community name');
      return;
    }
    if (!communityAbbreviation.trim()) {
      alert('Please enter a community abbreviation');
      return;
    }

    // Create new community object
    const newCommunity: Community = {
      id: Date.now().toString(), // Temporary ID generation
      name: communityName.trim(),
      abbreviation: communityAbbreviation.trim(),
      category: 'General', // Default category
      memberCount: 1, // Start with 1 member (creator)
      logoUri: logoUri || undefined,
    };

    // TODO: Send the new community data to the backend
    
    // Navigate back to communities page
    router.back();
    
    // Update the communities list in the main page
    router.setParams({ newCommunity: JSON.stringify(newCommunity) });
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Create Community',
      }} />
      
      <View style={styles.container}>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Community Name"
            value={communityName}
            onChangeText={setCommunityName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Community Abbreviation"
            value={communityAbbreviation}
            onChangeText={setCommunityAbbreviation}
            maxLength={10}
          />

          <View style={styles.logoSection}>
            <TouchableOpacity 
              style={styles.logoContainer}
              onPress={handleSelectLogo}
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
            style={styles.createButton}
            onPress={handleCreate}
          >
            <Text style={styles.buttonText}>Create Community</Text>
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
});

export default CreateCommunity; 