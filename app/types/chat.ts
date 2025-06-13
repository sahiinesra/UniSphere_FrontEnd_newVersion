export interface ChatMessage {
  id: number;
  content: string;
  userId: number;
  username: string;
  messageType: 'TEXT' | 'FILE';
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageResponse {
  data: ChatMessage[];
  total: number;
  page: number;
  limit: number;
} 