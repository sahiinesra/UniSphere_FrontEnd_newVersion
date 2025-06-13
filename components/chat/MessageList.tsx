import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React from 'react';
import {
  Alert,
  Image,
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
  const handleFilePress = async (fileUrl: string) => {
    try {
      await Linking.openURL(fileUrl);
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

  const renderMessage = (message: typeof messages[0]) => {
    const isCurrentUser = message.senderId === currentUserId;
    const canDelete = isCurrentUser || isLeader;

    return (
      <View
        key={message.id}
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
            {message.messageType === 'FILE' && message.fileUrl && (
              <TouchableOpacity
                style={styles.fileContainer}
                onPress={() => handleFilePress(message.fileUrl!)}
              >
                {message.fileType?.startsWith('image/') ? (
                  <Image
                    source={{ uri: message.fileUrl }}
                    style={styles.imageFile}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.fileInfo}>
                    <Ionicons name="document" size={24} color="#000000" />
                    <Text style={styles.fileName}>{message.fileName}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {message.content && (
              <Text style={styles.messageText}>{message.content}</Text>
            )}

            <Text style={styles.timestamp}>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {canDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePress(message.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {messages.map(renderMessage)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  contentContainer: {
    padding: 10,
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
  imageFile: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000000',
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
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default MessageList; 