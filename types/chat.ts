import { ScrollView } from 'react-native';

export interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'pdf' | 'file';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
  thumbnailUrl?: string;
}

export interface ChatInputProps {
  onSendMessage: (message: Message) => void;
}

export interface MessageListProps {
  messages: Message[];
  scrollViewRef: React.RefObject<ScrollView | null>;
}

export interface ChatHeaderProps {
  communityName: string;
  memberCount: number;
  onBackPress: () => void;
} 