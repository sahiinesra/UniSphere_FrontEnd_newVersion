import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useMemo } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MessageListProps } from '../../types/chat';

const MessageList: React.FC<MessageListProps> = ({
  messages,
  scrollViewRef,
  onDeleteMessage,
  currentUserId,
  isLeader
}) => {
  const handleFilePress = async (fileUrl: string, fileType?: string) => {
    try {
      if (Platform.OS === 'web') {
        window.open(fileUrl, '_blank');
      } else {
        await Linking.openURL(fileUrl);
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Could not open file');
    }
  };

  const handleDeletePress = (messageId: number) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteMessage?.(messageId)
        }
      ]
    );
  };

  const renderFilePreview = (message: typeof messages[0]) => {
    if (!message.fileUrl) return null;

    const isImage = message.fileType?.startsWith('image/');
    const isPDF = message.fileType === 'application/pdf';

    return (
      <TouchableOpacity
        style={styles.fileContainer}
        onPress={() => handleFilePress(message.fileUrl!, message.fileType)}
      >
        {isImage ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: message.fileUrl }}
              style={styles.imageFile}
              resizeMode="cover"
            />
          </View>
        ) : isPDF ? (
          <View style={styles.fileInfo}>
            <Ionicons name="document-text" size={24} color="#000000" />
            <Text style={styles.fileName}>{message.fileName || 'PDF Document'}</Text>
          </View>
        ) : (
          <View style={styles.fileInfo}>
            <Ionicons name="document" size={24} color="#000000" />
            <Text style={styles.fileName}>{message.fileName || 'File'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Deduplicate messages based on content and file properties
  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter(message => {
      const key = message.id > 0 
        ? message.id.toString() 
        : `${message.messageType}-${message.fileName}-${message.content}`;
      
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [messages]);

  const renderMessage = (message: typeof messages[0], index: number) => {
    const isCurrentUser = message.senderId === currentUserId;
    const canDelete = isCurrentUser || isLeader;

    return (
      <View
        key={`${message.id}-${message.fileName || ''}-${index}`}
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.userMessageContainer : styles.otherMessageContainer
        ]}
      >
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={32} color="#FFD700" />
          </View>
        )}

        <View style={styles.messageContent}>
          {!isCurrentUser && (
            <Text style={styles.senderName}>{message.senderName}</Text>
          )}

          <View
            style={[
              styles.messageBubble,
              isCurrentUser ? styles.userBubble : styles.otherBubble
            ]}
          >
            {renderFilePreview(message)}
            {message.content && (
              <Text style={styles.messageText}>{message.content}</Text>
            )}
          </View>

          {canDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePress(message.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF0000" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.messagesWrapper}>
        {uniqueMessages.map((message, index) => renderMessage(message, index))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 10,
  },
  messagesWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  messageContent: {
    maxWidth: '70%',
  },
  senderName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000000',
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderTopRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  timestamp: {
    fontSize: 10,
    color: '#666666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  fileContainer: {
    marginBottom: 8,
  },
  imageWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000000',
  },
  imageFile: {
    width: 200,
    height: 200,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    alignSelf: 'flex-end',
  },
});

export default MessageList; 