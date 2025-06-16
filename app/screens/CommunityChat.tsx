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
    try {
      const token = await getAccessToken();
      if (!token) {
        console.error('No token available for WebSocket connection');
        return;
      }

      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(
        `ws://10.200.0.156:8080/api/v1/communities/${communityId}/chat/ws?token=${encodeURIComponent(token)}`
      );

      console.log("WebSocket Connecting with token...");

      ws.onopen = () => {
        console.log('WebSocket Connected Successfully');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);
          
          // Fix file URL if it's a file message
          if (message.messageType === 'FILE' && message.fileUrl) {
            message.fileUrl = message.fileUrl.replace('localhost', '10.200.0.156');
          }
          
          setMessages((prev) => {
            if (!prev) return [message];
            
            // Enhanced duplicate detection for all message types
            const messageExists = prev.some(existingMsg => {
              // Check by ID
              if (existingMsg.id === message.id) return true;
              
              // Check temporary messages
              if (existingMsg.id < 0) {
                // For file messages, check file properties
                if (message.messageType === 'FILE' && existingMsg.messageType === 'FILE') {
                  return existingMsg.fileName === message.fileName && 
                         existingMsg.fileType === message.fileType;
                }
                // For text messages, check content
                return existingMsg.content === message.content;
              }
              
              return false;
            });
            
            if (messageExists) {
              return prev;
            }
            
            // For file messages, don't add them here since we handle them in the upload response
            if (message.messageType === 'FILE') {
              return prev;
            }
            
            // Add new message and sort by date (oldest to newest)
            const newMessages = [...prev, message].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            
            // Scroll to bottom for new messages
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);

            return newMessages;
          });
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        Alert.alert('Connection Error', 'Failed to connect to chat. Please try again.');
      };

      ws.onclose = (event) => {
        console.log('WebSocket Disconnected:', event);
        
        // Only attempt to reconnect if the component is still mounted
        if (wsRef.current) {
          setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            initializeWebSocket();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      Alert.alert('Connection Error', 'Failed to initialize chat connection. Please try again.');
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        console.log('Cleaning up WebSocket connection');
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

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
          timeout: 30000
        }
      );

      const fetchedMessages = response.data?.data?.length ? response.data.data : [];
      
      // Fix file URLs in fetched messages
      const messagesWithFixedUrls = fetchedMessages.map(message => {
        if (message.messageType === 'FILE' && message.fileUrl) {
          return {
            ...message,
            fileUrl: message.fileUrl.replace('localhost', '10.200.0.156')
          };
        }
        return message;
      });
      
      // Sort messages by date (oldest to newest)
      setMessages(messagesWithFixedUrls.sort((a, b) => 
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

      // Create a temporary message object
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
        fileType: file.type,
        fileName: file.name,
      };

      // Add temporary message to UI
      setMessages(prev => {
        // Check if this file is already being uploaded
        const isDuplicate = prev.some(msg => 
          msg.messageType === 'FILE' && 
          msg.fileName === file.name && 
          msg.fileType === file.type
        );

        if (isDuplicate) {
          console.log('Duplicate file upload prevented:', file.name);
          return prev;
        }

        const newMessages = [...prev, tempMessage].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return newMessages;
      });

      // Scroll to bottom immediately
      scrollViewRef.current?.scrollToEnd({ animated: true });

      // Prepare form data
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        type: file.type,
        name: file.name,
      } as any);

      if (content) {
        formData.append('content', content);
      }

      // Send file to server
      const response = await axios.post(
        `${API_URL}/api/v1/communities/${communityId}/chat/file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update message with server response
      if (response.data?.data) {
        const serverMessage = response.data.data;
        // Fix file URL in server response
        if (serverMessage.fileUrl) {
          serverMessage.fileUrl = serverMessage.fileUrl.replace('localhost', '10.200.0.156');
        }
        
        setMessages(prev => {
          // Remove any duplicate messages and the temporary message
          const filteredMessages = prev.filter(msg => 
            msg.id !== -tempId && 
            !(msg.messageType === 'FILE' && 
              msg.fileName === serverMessage.fileName && 
              msg.fileType === serverMessage.fileType)
          );
          
          return [...filteredMessages, serverMessage].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }

      console.log('File sent successfully');
    } catch (error) {
      console.error('Failed to send file!', error);
      Alert.alert('Error', 'Failed to send file');
      
      // Remove temporary message if sending failed
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