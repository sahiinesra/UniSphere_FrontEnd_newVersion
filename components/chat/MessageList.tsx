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
    const fileName = message.fileName || (isImage ? 'Image' : 'Document');

    return (
      <View style={styles.fileContainer}>
        {isImage ? (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => handleFilePress(message.fileUrl!, message.fileType)}
          >
            <Image
              source={{ uri: message.fileUrl }}
              style={styles.imageFile}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageFileName} numberOfLines={1}>
                {fileName}
              </Text>
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => handleFilePress(message.fileUrl!, message.fileType)}
              >
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : isPDF ? (
          <TouchableOpacity
            style={styles.documentContainer}
            onPress={() => handleFilePress(message.fileUrl!, message.fileType)}
          >
            <View style={styles.documentIconContainer}>
              <Ionicons name="document-text" size={32} color="#FF4444" />
              <Text style={styles.documentType}>PDF</Text>
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentFileName} numberOfLines={2}>
                {fileName}
              </Text>
              <View style={styles.documentActions}>
                <Text style={styles.tapToOpen}>Tap to open</Text>
                <Ionicons name="open-outline" size={20} color="#666666" />
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.documentContainer}
            onPress={() => handleFilePress(message.fileUrl!, message.fileType)}
          >
            <View style={styles.documentIconContainer}>
              <Ionicons name="document" size={32} color="#4444FF" />
              <Text style={styles.documentType}>File</Text>
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentFileName} numberOfLines={2}>
                {fileName}
              </Text>
              <View style={styles.documentActions}>
                <Text style={styles.tapToOpen}>Tap to open</Text>
                <Ionicons name="open-outline" size={20} color="#666666" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
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
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderTopRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#666666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  fileContainer: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  imageFile: {
    width: 250,
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    justifyContent: 'space-between',
  },
  imageFileName: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  downloadButton: {
    padding: 4,
  },
  documentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    maxWidth: 280,
  },
  documentIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentType: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  documentInfo: {
    flex: 1,
  },
  documentFileName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 4,
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tapToOpen: {
    fontSize: 12,
    color: '#666666',
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    alignSelf: 'flex-end',
  },
});

export default MessageList; 