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
const API_URL = 'http://10.200.0.156:8080';

// Configure axios defaults
axios.defaults.timeout = 30000; // 30 seconds timeout

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
  const [currentUser, setCurrentUser] = useState<{firstName: string; lastName: string} | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await axios.get(
        `${API_URL}/api/v1/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000 // 30 seconds timeout
        }
      );

      const userData = response.data.data;
      setCurrentUser({
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      setCurrentUserId(userData.id);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Initialize WebSocket connection
  const initializeWebSocket = async () => {
    const token = await getAccessToken();
    if (!token) return;

    const ws = new WebSocket(
      `ws://10.200.0.156:8080/api/v1/communities/${communityId}/chat/ws?token=${token}`
    );

    console.log("WebSocket Connecting with token.");

    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => {
        if (!prev) return [message];
        
        // Check if message already exists or if there's a matching temporary message
        const messageExists = prev.some(existingMsg => 
          existingMsg.id === message.id || 
          (existingMsg.id < 0 && 
           existingMsg.messageType === message.messageType &&
           existingMsg.content === message.content &&
           (existingMsg.fileUrl?.includes(message.fileUrl || '') || 
            message.fileUrl?.includes(existingMsg.fileUrl || '')))
        );

        if (messageExists) {
          // Replace temporary message with real one
          return prev.map(msg => {
            if (msg.id < 0 && 
                msg.messageType === message.messageType &&
                msg.content === message.content &&
                (msg.fileUrl?.includes(message.fileUrl || '') || 
                 message.fileUrl?.includes(msg.fileUrl || ''))) {
              return message;
            }
            return msg;
          });
        }
        
        // Add new message and sort by date
        const newMessages = [...prev, message].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        // Scroll to bottom for new messages
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        return newMessages;
      });
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
          timeout: 30000 // 30 seconds timeout
        }
      );

      const fetchedMessages = response.data?.data?.length ? response.data.data : [];
      
      // Sort messages by date (oldest to newest)
      setMessages(fetchedMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));

      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
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
    let tempId: number;
    try {
      const token = await getAccessToken();
      if (!token) return;

      // Create a temporary message object with current timestamp as ID
      tempId = Date.now();
      const tempMessage: ChatMessage = {
        id: -tempId, // Using negative number for temporary messages
        communityId: Number(communityId),
        content,
        messageType: 'TEXT',
        senderId: currentUserId!,
        senderName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Me',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Immediately add the message to UI and sort by date
      setMessages(prev => {
        const newMessages = [...prev, tempMessage].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return newMessages;
      });

      // Scroll to bottom immediately
      scrollViewRef.current?.scrollToEnd({ animated: true });

      // Send the message to server
      const response = await axios.post(
        `${API_URL}/api/v1/communities/${communityId}/chat/text`,
        { content, messageType: 'TEXT' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If server responds with the real message, update it
      if (response.data?.data) {
        const serverMessage = response.data.data;
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => msg.id !== -tempId); // Match the negative ID
          return [...filteredMessages, serverMessage].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message!', error);
      Alert.alert('Error!', 'Failed to send message');
      
      // Remove the temporary message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== -tempId));
    } finally {
      setIsSending(false);
    }
  };

  // Send file message
  const handleSendFile = async (file: any, content?: string) => {
    setIsSending(true);
    let tempId: number;
    try {
      const token = await getAccessToken();
      if (!token) return;

      console.log('Preparing to send file:', file);

      // Create a temporary message object with current timestamp as ID
      tempId = Date.now();
      const tempMessage: ChatMessage = {
        id: -tempId,
        communityId: Number(communityId),
        content: content || '',
        messageType: 'FILE',
        senderId: currentUserId!,
        senderName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Me',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fileUrl: file.uri,
        fileName: file.name,
        fileType: file.type
      };

      // Immediately add the message to UI and sort by date
      setMessages(prev => {
        const newMessages = [...prev, tempMessage].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return newMessages;
      });

      // Scroll to bottom immediately
      scrollViewRef.current?.scrollToEnd({ animated: true });

      // Prepare FormData
      const formData = new FormData();
      
      // Add file to FormData with proper structure
      const fileToUpload = {
        uri: file.uri,
        type: file.type || 'application/pdf',
        name: file.name,
        size: file.size,
      };
      
      console.log('Uploading file:', fileToUpload);
      formData.append('file', fileToUpload as any);
      
      if (content) {
        formData.append('content', content);
      }

      // Send the file to server
      const response = await axios.post(
        `${API_URL}/api/v1/communities/${communityId}/chat/file`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          transformRequest: (data, headers) => {
            return formData;
          },
          timeout: 60000
        }
      );

      console.log('File upload response:', response.data);

      // Don't update messages here since WebSocket will handle it
      console.log('File sent successfully');
    } catch (error: any) {
      console.error('Failed to send file!', error);
      console.error('Error details:', error.response?.data);
      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Dosya gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
      
      // Remove the temporary message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== -tempId));
    } finally {
      setIsSending(false);
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