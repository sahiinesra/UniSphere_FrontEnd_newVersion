import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ChatInputProps } from '../../types/chat';

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendFile, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (message.trim() === '' || disabled) return;
    
    await onSendMessage(message);
    setMessage('');
  };

  const handlePickFile = async () => {
    if (disabled || !onSendFile) return;

    try {
      Alert.alert(
        'Choose File Type',
        'What type of file would you like to send?',
        [
          {
            text: 'Image',
            onPress: handlePickImage
          },
          {
            text: 'PDF Document',
            onPress: handlePickPDF
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access media library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0] && onSendFile) {
        const selectedAsset = result.assets[0];
        await onSendFile({
          uri: selectedAsset.uri,
          type: 'image/jpeg',
          name: selectedAsset.fileName || 'image.jpg',
        }, message);
        setMessage('');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0] && onSendFile) {
        const selectedAsset = result.assets[0];
        await onSendFile({
          uri: selectedAsset.uri,
          type: 'application/pdf',
          name: selectedAsset.name || 'document.pdf',
        }, message);
        setMessage('');
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to pick PDF');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, disabled && styles.disabled]} 
        onPress={handlePickFile}
        disabled={disabled}
      >
        <Ionicons name="attach" size={24} color={disabled ? '#CCCCCC' : '#000000'} />
      </TouchableOpacity>
      
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder="Type a message..."
        value={message}
        onChangeText={setMessage}
        multiline
        editable={!disabled}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        blurOnSubmit={false}
      />
      
      <TouchableOpacity 
        style={[styles.button, disabled && styles.disabled]} 
        onPress={handleSend}
        disabled={disabled || message.trim() === ''}
      >
        {disabled ? (
          <ActivityIndicator size="small" color="#CCCCCC" />
        ) : (
          <Ionicons 
            name="send" 
            size={24} 
            color={message.trim() === '' ? '#CCCCCC' : '#000000'} 
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  inputDisabled: {
    backgroundColor: '#EEEEEE',
  },
  button: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ChatInput; 