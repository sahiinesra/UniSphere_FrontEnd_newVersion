export interface ChatMessage {
  id: number;
  content: string;
  messageType: 'TEXT' | 'FILE';
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  senderId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePhotoUrl?: string | null;
}

export interface ChatMessageResponse {
  data: ChatMessage[];
  total: number;
  page: number;
  limit: number;
} 