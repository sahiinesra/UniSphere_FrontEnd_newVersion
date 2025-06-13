import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChatMessage } from '../../types/chat';

interface MessageProps {
  message: ChatMessage;
  onDelete: () => void;
  canDelete: boolean;
}

const Message: React.FC<MessageProps> = ({ message, onDelete, canDelete }) => {
  return (
    <View style={styles.container}>
      <View style={styles.messageContent}>
        <Text style={styles.username}>{message.username}</Text>
        <Text style={styles.text}>{message.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </Text>
      </View>
      {canDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={20} color="#ff4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  messageContent: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
});

export default Message; 