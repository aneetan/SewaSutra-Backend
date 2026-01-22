export interface ChatMessage {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  isEdited: boolean;
  isDeleted: boolean;
  attachments: string[];
  readBy: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatParticipant {
  id: number;
  name: string;
  email: string;
  role: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface ChatData {
  id: number;
  participant1Id: number;
  participant2Id: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  lastMessage?: ChatMessage;
  participant1: ChatParticipant;
  participant2: ChatParticipant;
  unreadCount?: number;
}

export interface SendMessageDto {
  content: string;
  receiverId: number;
  attachments?: { url: string; name: string }[];
}

export interface MarkAsReadDto {
  messageIds: number[];
  chatId: number;
}

export interface TypingIndicatorDto {
  chatId: number;
  userId: number;
  isTyping: boolean;
}

export interface PresenceUpdateDto {
  userId: number;
  isOnline: boolean;
  socketId?: string;
}