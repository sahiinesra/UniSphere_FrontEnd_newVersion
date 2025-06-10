import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatInput from '../../components/chat/ChatInput';
import MessageList from '../../components/chat/MessageList';
import { Message } from '../../types/chat';

// Define theme colors to match neo-brutalism style
const colors = {
  background: '#FFD700', // Gold yellow background
  cardBackground: '#FFFFFF',
  primary: '#007AFF',
  border: '#000000',
  text: '#000000',
  secondaryText: '#666666',
};

const CommunityChat = () => {
  const { communityId, communityName, memberCount } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = (message: Message) => {
    // Here you would typically send the message to your backend
    // For now, we'll just add it to the local state
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleBackPress = () => {
    router.back();
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ChatHeader
          communityName={communityName as string}
          memberCount={Number(memberCount)}
          onBackPress={handleBackPress}
        />
        <View style={styles.messageListContainer}>
          <MessageList
            messages={messages}
            scrollViewRef={scrollViewRef}
          />
        </View>
        <ChatInput onSendMessage={handleSendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageListContainer: {
    flex: 1,
  },
});

export default CommunityChat; 