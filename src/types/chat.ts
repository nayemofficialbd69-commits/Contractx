export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
export type MessageStatus = 'local_queued' | 'sent' | 'delivered' | 'read';

export interface LocationPayload {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  mediaUrl?: string;
  mediaDuration?: number; // For audio/video in seconds
  mediaSize?: number; // in bytes
  fileName?: string;
  location?: LocationPayload;
  replyToMessage?: {
    id: string;
    senderId: string;
    senderName: string;
    textSnippet: string;
  };
  reactions: MessageReaction[];
  status: MessageStatus;
  createdAt: number;
  updatedAt?: number;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface GroupMeta {
  name: string;
  photoURL?: string;
  description?: string;
  adminIds: string[];
  createdBy: string;
  membersCount: number;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participantIds: string[];
  groupMeta?: GroupMeta;
  lastMessage?: Message;
  unreadCount: number;
  isMuted?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  updatedAt: number;
  createdAt: number;
}

export type CallType = 'audio' | 'video';
export type CallStatus = 'calling' | 'ringing' | 'connected' | 'ended' | 'rejected' | 'missed';

export interface CallSession {
  id: string;
  callerId: string;
  receiverId?: string;
  conversationId?: string;
  type: CallType;
  status: CallStatus;
  startedAt?: number;
  connectedAt?: number;
  endedAt?: number;
  durationSeconds?: number;
  isScreenSharing?: boolean;
}

export interface CallHistoryItem {
  id: string;
  callerId: string;
  receiverId: string;
  type: CallType;
  status: 'completed' | 'missed' | 'rejected';
  timestamp: number;
  durationSeconds: number;
}
