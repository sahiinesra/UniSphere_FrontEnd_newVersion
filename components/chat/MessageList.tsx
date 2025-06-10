import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Attachment, Message, MessageListProps } from '../../types/chat';

const colors = {
  background: '#FFD700',
  cardBackground: '#FFFFFF',
  primary: '#4CAF50',
  secondary: '#FF9800',
  border: '#000000',
  text: '#000000',
  secondaryText: '#666666',
};

const MessageBubble: React.FC<{ message: Message; isCurrentUser: boolean }> = ({
  message,
  isCurrentUser,
}) => {
  const renderAttachment = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <TouchableOpacity key={attachment.id} style={styles.imageContainer}>
            <Image
              source={{ uri: attachment.url }}
              style={styles.attachmentImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );
      case 'pdf':
        return (
          <TouchableOpacity
            key={attachment.id}
            style={[styles.fileAttachmentContainer, isCurrentUser ? styles.currentUserFile : styles.otherUserFile]}
          >
            <Ionicons name="document-text" size={24} color={colors.text} />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {attachment.name}
              </Text>
              <Text style={styles.fileSize}>
                {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(1)} MB` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            key={attachment.id}
            style={[styles.fileAttachmentContainer, isCurrentUser ? styles.currentUserFile : styles.otherUserFile]}
          >
            <Ionicons name="document" size={24} color={colors.text} />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {attachment.name}
              </Text>
              <Text style={styles.fileSize}>
                {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(1)} MB` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={[
      styles.messageContainer,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      {!isCurrentUser && (
        <Text style={styles.senderName}>{message.sender.name}</Text>
      )}
      <View style={[
        styles.messageBubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        {message.text && <Text style={styles.messageText}>{message.text}</Text>}
        {message.attachments?.map((attachment) => renderAttachment(attachment))}
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};

const MessageList: React.FC<MessageListProps> = ({ messages, scrollViewRef }) => {
  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets={true}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCurrentUser={message.sender.id === 'current-user-id'} // Replace with actual user ID
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    maxWidth: '85%',
    marginVertical: 4,
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 12,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  currentUserBubble: {
    backgroundColor: colors.primary,
  },
  otherUserBubble: {
    backgroundColor: colors.cardBackground,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    color: colors.secondaryText,
    alignSelf: 'flex-end',
    marginTop: 4,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  attachmentImage: {
    width: Dimensions.get('window').width * 0.6,
    height: Dimensions.get('window').width * 0.6,
    backgroundColor: colors.cardBackground,
  },
  fileAttachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  currentUserFile: {
    backgroundColor: colors.secondary,
  },
  otherUserFile: {
    backgroundColor: colors.cardBackground,
  },
  fileInfo: {
    marginLeft: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
  },
  fileSize: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
    fontWeight: '600',
  },
});

export default MessageList; 