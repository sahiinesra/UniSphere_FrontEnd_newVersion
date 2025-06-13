import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChatMessage } from '../../types/chat';
import Message from './Message';

interface MessageListProps {
  messages: ChatMessage[] | null;
  scrollViewRef: React.RefObject<ScrollView>;
  onDeleteMessage: (messageId: number) => void;
  currentUserId?: number;
  isLeader: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  scrollViewRef,
  onDeleteMessage,
  currentUserId,
  isLeader,
}) => {
  if (!messages) {
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome to our community! 👋</Text>
        <Text style={styles.welcomeSubText}>Start a conversation by sending a message.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onDelete={() => onDeleteMessage(message.id)}
          canDelete={message.userId === currentUserId || isLeader}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 10,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});

export default MessageList; 