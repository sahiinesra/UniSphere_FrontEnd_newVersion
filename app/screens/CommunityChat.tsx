import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { ChatMessage, ChatMessageResponse } from '../../types/chat';

// Define API URL based on platform
const API_URL = 'http://10.200.0.7:8080';

// Get access token
const getAccessToken = async () => {
  return await SecureStore.getItemAsync('accessToken');
};

const CommunityChat = () => {
  const { communityId, communityName, memberCount } = useLocalSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
  const [isLeader, setIsLeader] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Initialize WebSocket connection
  const initializeWebSocket = async () => {
    const token = await getAccessToken();
    if (!token) return;

    // <- GÜNCEL
    const ws = new WebSocket(
      `ws://10.200.0.7:8080/api/v1/communities/${communityId}/chat/ws?token=${token}`
    );

    console.log("WebSocket Connecting with token.");

    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => {
        if (!prev) return [message];
        
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(existingMsg => existingMsg.id === message.id);
        if (messageExists) {
          return prev;
        }
        
        // Add new message at the beginning
        return [message, ...prev];
      });
      // Scroll to bottom for new messages
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error!', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket Disconnected!', event);
      setTimeout(initializeWebSocket, 3000);
    };

    wsRef.current = ws;
  };

  // Fetch chat messages
  const fetchMessages = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await axios.get<ChatMessageResponse>(
        `${API_URL}/api/v1/communities/${communityId}/chat`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { limit: 50 },
        }
      );

      const fetchedMessages = response.data?.data?.length ? response.data.data : [];
      
      // Deduplicate messages by ID when setting initial messages
      setMessages((prev) => {
        if (!prev || prev.length === 0) {
          return fetchedMessages.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        
        // Merge and deduplicate messages
        const allMessages = [...prev, ...fetchedMessages];
        const uniqueMessages = allMessages.filter((message, index, array) => 
          array.findIndex(m => m.id === message.id) === index
        );
        
        // Sort by creation date to maintain chronological order (oldest to newest)
        return uniqueMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    } catch (error) {
      console.error('Failed to fetch messages!', error);
      Alert.alert('Error!', 'Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };

  // Send text message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsSending(true);
    try {
      const token = await getAccessToken();
      if (!token) return;

      await axios.post(
        `${API_URL}/api/v1/communities/${communityId}/chat/text`,
        { content, messageType: 'TEXT' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Message sent');
    } catch (error) {
      console.error('Failed to send message!', error);
      Alert.alert('Error!', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Send file message
  const handleSendFile = async (file: any, content?: string) => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const formData = new FormData();
      formData.append('file', file);
      if (content) {
        formData.append('content', content);
      }

      await axios.post(
        `${API_URL}/api/v1/communities/${communityId}/chat/file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('File sent');
    } catch (error) {
      console.error('Failed to send file!', error);
      Alert.alert('Error!', 'Failed to send file');
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: number) => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      await axios.delete(
        `${API_URL}/api/v1/communities/${communityId}/chat/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );

      setMessages((prev) =>
        prev ? prev.filter((msg) => msg.id !== messageId) : []
      );
    } catch (error) {
      console.error('Failed to delete message!', error);
      Alert.alert('Error!', 'Failed to delete message');
    }
  };

  // Initialize chat
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchMessages(), initializeWebSocket()]);
    };
    initialize();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [communityId]);

  // Handle back press
  const handleBackPress = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ChatHeader
          communityName={communityName as string}
          memberCount={Number(memberCount)}
          onBackPress={handleBackPress}
        />
        <MessageList
          messages={messages}
          scrollViewRef={scrollViewRef}
          onDeleteMessage={handleDeleteMessage}
          currentUserId={currentUserId}
          isLeader={isLeader}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          disabled={isSending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Export
export default CommunityChat;