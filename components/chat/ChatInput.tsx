import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Attachment, ChatInputProps, Message } from '../../types/chat';

const colors = {
  background: '#FFD700',
  cardBackground: '#FFFFFF',
  primary: '#4CAF50',
  secondary: '#FF9800',
  border: '#000000',
  text: '#000000',
  secondaryText: '#666666',
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: {
          id: 'current-user-id', // Replace with actual user ID
          name: 'Current User', // Replace with actual user name
        },
        timestamp: new Date(),
        attachments: attachments,
      };

      onSendMessage(newMessage);
      setMessage('');
      setAttachments([]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        type: 'image',
        url: result.assets[0].uri,
        name: 'Image',
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', '*/*'],
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          type: asset.mimeType?.includes('pdf') ? 'pdf' : 'file',
          url: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType,
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickDocument} style={styles.button}>
          <Ionicons name="attach" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={pickImage} style={styles.button}>
          <Ionicons name="image" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.secondaryText}
          multiline
          maxLength={1000}
          textAlignVertical="center"
        />
        
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.button,
            styles.sendButton,
            (message.trim() || attachments.length > 0) && styles.sendButtonActive,
          ]}
          disabled={!message.trim() && attachments.length === 0}
        >
          <Ionicons
            name="send"
            size={24}
            color={message.trim() || attachments.length > 0 ? colors.text : colors.secondaryText}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderTopWidth: 3,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 8,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  sendButton: {
    backgroundColor: colors.cardBackground,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});

export default ChatInput; 