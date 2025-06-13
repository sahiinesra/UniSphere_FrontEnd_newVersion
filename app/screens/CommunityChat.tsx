import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
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
const API_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://192.168.1.57:8080',
  default: 'http://192.168.1.57:8080'
});

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
  const [userMap, setUserMap] = useState<{ [id: number]: string }>({});
  const userMapRef = useRef(userMap);
  userMapRef.current = userMap;
  const scrollViewRef = useRef<ScrollView>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isSending, setIsSending] = useState(false);

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

      const fetchedMessages = response.data?.data;
      if (fetchedMessages && fetchedMessages.length > 0) {
        const sortedMessages = fetchedMessages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);

        // Populate user map from fetched messages
        const newUserMap = { ...userMap };
        sortedMessages.forEach((message) => {
          if (message.senderId && message.senderName && !newUserMap[message.senderId]) {
            newUserMap[message.senderId] = message.senderName;
          }
        });
        setUserMap(newUserMap);

      } else {
        setMessages([]);
      }
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

      const response = await axios.post(
        `${API_URL}/api/v1/communities/${communityId}/chat/text`,
        { content, messageType: 'TEXT' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Optimistic update removed to rely on WebSocket for message state
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

  // Get and set the current user ID
  useEffect(() => {
    const getUserId = async () => {
      const token = await getAccessToken();
      if (token) {
        try {
          const decodedToken: { sub: string } = jwtDecode(token);
          setCurrentUserId(parseInt(decodedToken.sub, 10));
        } catch (e) {
          console.error('Invalid token', e);
        }
      }
    };
    getUserId();
  }, []);

  // Initialize chat after user ID is set
  useEffect(() => {
    if (currentUserId === undefined) {
      return; // Wait for user ID to be set
    }

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = async () => {
      const token = await getAccessToken();
      if (!token) return;

      ws = new WebSocket(
        `ws://192.168.1.57:8080/api/v1/communities/${communityId}/chat/ws?token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket Connected');
      };

      ws.onmessage = (event) => {
        const receivedData = JSON.parse(event.data);
        const message: ChatMessage = {
          id: receivedData.id,
          communityId: receivedData.communityId,
          senderId: receivedData.senderId,
          content: receivedData.content,
          createdAt: receivedData.timestamp,
          updatedAt: receivedData.timestamp,
          messageType: receivedData.type?.toUpperCase() || 'TEXT',
          senderName: userMapRef.current[receivedData.senderId] || '...',
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          const updatedMessages = [...prev, message];
          return updatedMessages.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        scrollViewRef.current?.scrollToEnd({ animated: true });
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error!', error);
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected! Attempting to reconnect...');
        ws = null;
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    fetchMessages();
    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.onclose = null; // Prevent onclose from firing during manual close
        ws.close();
      }
      wsRef.current = null;
    };
  }, [communityId, currentUserId]);

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

export default CommunityChat;

