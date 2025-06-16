import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChatMessage } from '../../types/chat';

interface MessageProps {
  message: ChatMessage;
  onDelete: () => void;
  canDelete: boolean;
  currentUserId?: number;
}

const Message: React.FC<MessageProps> = ({ message, onDelete, canDelete, currentUserId }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      // Format time as HH:mm
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // If the message is from today, just show time
      if (date >= today) {
        return time;
      }
      
      // If it's from yesterday, show "Yesterday, HH:mm"
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date >= yesterday) {
        return `Yesterday, ${time}`;
      }
      
      // For older messages, show date and time
      return date.toLocaleDateString([], { 
        year: '2-digit',
        month: 'numeric',
        day: 'numeric'
      }) + ', ' + time;
      
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const isOwnMessage = message.senderId === currentUserId;

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownContainer : styles.otherContainer
    ]}>
      <View style={[
        styles.bubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble
      ]}>
        {!isOwnMessage && (
          <Text style={styles.username}>{message.username}</Text>
        )}
        <Text style={styles.messageText}>{message.content}</Text>
        <View style={styles.bottomRow}>
          <Text style={[
            styles.time,
            isOwnMessage ? styles.ownTime : styles.otherTime
          ]}>{formatDate(message.createdAt)}</Text>
          {canDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <MaterialIcons name="delete-outline" size={16} color="#888888" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 8,
    flexDirection: 'row',
    width: '100%',
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    minWidth: '30%',
    padding: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  ownBubble: {
    backgroundColor: '#E7FFDB',
    borderTopRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
  },
  username: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B5B5B',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: '#000000',
    marginRight: 4,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    marginRight: 4,
    fontWeight: '400',
  },
  ownTime: {
    color: '#4A6741',
  },
  otherTime: {
    color: '#666666',
  },
  deleteButton: {
    padding: 2,
    marginLeft: 4,
  },
});

export default Message; 