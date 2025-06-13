import { ScrollView } from 'react-native';

// Chat message types
export interface ChatMessage {
  id: number;
  communityId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  senderId: number;
  senderName: string;
  messageType: 'TEXT' | 'FILE';
  fileId?: number;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
}

export interface ChatFile {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

export interface ChatSender {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChatMessageResponse {
  data: ChatMessage[];
  timestamp: string;
}

export interface SingleMessageResponse {
  data: ChatMessage & {
    file?: ChatFile;
    sender?: ChatSender;
  };
  timestamp: string;
}

export interface SendMessageRequest {
  content: string;
  messageType: 'TEXT';
}

export interface ErrorResponse {
  data: string;
  timestamp: string;
  error: {
    code: string;
    message: string;
    details?: string;
    field?: string;
    severity: string;
    debugInfo?: string;
  };
}

// Chat UI component props
export interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onSendFile?: (file: any, content?: string) => Promise<void>;
  disabled?: boolean;
}

export interface MessageListProps {
  messages: ChatMessage[];
  scrollViewRef: React.RefObject<ScrollView | null>;
  onDeleteMessage?: (messageId: number) => Promise<void>;
  currentUserId?: number;
  isLeader?: boolean;
}

export interface ChatHeaderProps {
  communityName: string;
  memberCount: number;
  onBackPress: () => void;
} 