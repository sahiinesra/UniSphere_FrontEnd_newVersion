import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Permission to access media library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedAsset = result.assets[0];
        await onSendFile({
          uri: selectedAsset.uri,
          type: selectedAsset.type || 'image/jpeg',
          name: selectedAsset.fileName || 'file.jpg',
        }, message);
        setMessage('');
      }
    } catch (error) {
      console.error('Error picking file:', error);
      alert('Failed to pick file');
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
    borderTopWidth: 2,
    borderColor: '#000000',
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    padding: 10,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000000',
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#EEEEEE',
    color: '#999999',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
});

export default ChatInput; 