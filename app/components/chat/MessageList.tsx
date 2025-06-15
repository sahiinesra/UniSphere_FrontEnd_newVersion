import React, { useEffect } from 'react';
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
  // Scroll to bottom when messages change or component mounts
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }
  }, [messages]);

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
      contentContainerStyle={[
        styles.contentContainer,
        { flexDirection: 'column-reverse' }
      ]}
      onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
    >
      {messages.map((message, index) => (
        <Message
          key={message.id || `msg-${index}`}
          message={message}
          onDelete={() => onDeleteMessage(message.id)}
          canDelete={message.userId === currentUserId || isLeader}
          currentUserId={currentUserId}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEAE2', // WhatsApp benzeri arka plan rengi
  },
  contentContainer: {
    paddingVertical: 16,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEAE2',
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#075E54', // WhatsApp yeşili
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  }
});

export default MessageList; 