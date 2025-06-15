import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    ListRenderItem,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define API URL based on platform
const API_URL = Platform.select({
  android: 'http://10.0.2.2:8087',  // Android Emulator
  ios: 'http://10.200.0.7:8087',     // iOS Simulator
  default: 'http://10.200.0.7:8087'  // Web/default
});

// API endpoint
const ASK_ENDPOINT = `http://10.200.0.7:8087/ask`;

// Define types for our data
interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

// Mock chat messages for AI assistant
const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'ai',
    message: 'Hello! I am your UniSphere assistant. How can I help you today?',
    timestamp: new Date().toISOString()
  }
];

const Assistant = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [chatMessages]);

  // Send message to AI assistant
  const sendMessage = async (): Promise<void> => {
    if (messageInput.trim() === '') return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: messageInput,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages([...chatMessages, userMessage]);
    setMessageInput('');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Make API call to backend
      console.log('Sending request to:', ASK_ENDPOINT);
      console.log('Request body:', { question: messageInput });
      
      const response = await axios.post(ASK_ENDPOINT, {
        question: messageInput
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response:', response.data);
      
      // Add AI response
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: response.data.answer,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      Alert.alert(
        'Error',
        `Failed to get response from AI. Error: ${error.response?.status || error.message}`
      );
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Render chat message
  const renderChatMessage: ListRenderItem<ChatMessage> = ({ item }) => (
    <View style={[
      styles.chatBubbleContainer,
      item.sender === 'user' ? styles.userBubbleContainer : styles.aiBubbleContainer
    ]}>
      {item.sender === 'ai' && (
        <View style={styles.avatarContainer}>
          <Ionicons name="school" size={24} color="#2196F3" />
        </View>
      )}
      <View style={[
        styles.chatBubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={styles.chatText}>{item.message}</Text>
      </View>
      {item.sender === 'user' && (
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={24} color="#FFD700" />
        </View>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ 
        title: 'AI',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      }} />
      
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={renderChatMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chatList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<View style={styles.listHeader} />}
          />
          
          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingAvatarContainer}>
                <Ionicons name="school" size={24} color="#2196F3" />
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#2196F3" />
              </View>
            </View>
          )}
        </View>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          style={styles.keyboardAvoid}
        >
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask your AI assistant..."
                value={messageInput}
                onChangeText={setMessageInput}
                multiline
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                blurOnSubmit={false}
                editable={!isTyping}
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  isTyping && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={isTyping || messageInput.trim() === ''}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color="#CCCCCC" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={24} 
                    color={messageInput.trim() === '' ? '#CCCCCC' : '#2196F3'} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  chatList: {
    padding: 15,
    paddingBottom: 15,
  },
  listHeader: {
    height: 60,
  },
  chatBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userBubbleContainer: {
    justifyContent: 'flex-end',
  },
  aiBubbleContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  chatBubble: {
    maxWidth: '70%',
    padding: 12,
    borderWidth: 2,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderColor: '#000000',
    borderTopRightRadius: 5,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderTopLeftRadius: 5,
  },
  chatText: {
    fontSize: 16,
    color: '#000000',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: 15,
    marginBottom: 15,
  },
  typingAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  typingBubble: {
    backgroundColor: '#EEEEEE',
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000000',
    borderTopLeftRadius: 5,
  },
  keyboardAvoid: {
    width: '100%',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#000000',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default Assistant;
