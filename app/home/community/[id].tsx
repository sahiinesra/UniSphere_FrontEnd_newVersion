import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CommunityDetails = () => {
  const { id } = useLocalSearchParams();
  const [isJoined, setIsJoined] = useState(false);
  const [hasProfilePhoto, setHasProfilePhoto] = useState(true);
  const [logoUri, setLogoUri] = useState('https://placeholder.com/150');

  const handleJoinLeave = () => {
    setIsJoined(!isJoined);
    // TODO: Implement actual join/leave functionality with backend
  };

  const handleUpdatePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setLogoUri(result.assets[0].uri);
        setHasProfilePhoto(true);
        // TODO: Upload the image to backend
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  const handleDeletePhoto = () => {
    setHasProfilePhoto(false);
    setLogoUri('https://placeholder.com/150');
    // TODO: Implement photo deletion functionality with backend
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Community Details',
      }} />
      
      <View style={styles.container}>
        <View style={styles.profileSection}>
          {hasProfilePhoto ? (
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: logoUri }}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={[styles.logoContainer, styles.noLogo]}>
              <Text>No Logo</Text>
            </View>
          )}
          
          <View style={styles.photoButtons}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleUpdatePhoto}
            >
              <Text style={styles.buttonText}>Update Logo</Text>
            </TouchableOpacity>
            
            {hasProfilePhoto && (
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={handleDeletePhoto}
              >
                <Text style={styles.buttonText}>Delete Logo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>Community Name</Text>
          <Text style={styles.description}>
            This is the community description. It provides information about the
            community's purpose, activities, and other relevant details.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, isJoined ? styles.leaveButton : styles.joinButton]} 
          onPress={handleJoinLeave}
        >
          <Text style={styles.buttonText}>
            {isJoined ? 'Leave Community' : 'Join Community'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 10,
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
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
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
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CommunityDetails; 