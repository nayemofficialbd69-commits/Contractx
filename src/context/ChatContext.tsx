/**
 * ConnectX Chat & Calling Context
 * Handles real-time messaging, voice notes, media/location payloads,
 * offline synchronization queue, reactions, and WebRTC call sessions.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, Message, MessageType, CallSession, CallHistoryItem, LocationPayload } from '../types/chat';
import { StorageService } from '../services/storageService';
import { useAuth } from './AuthContext';
import { WebRtcService } from '../services/webrtcService';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  messages: Message[];
  unreadTotal: number;
  isOffline: boolean;
  toggleOfflineMode: () => void;
  pendingQueueCount: number;
  sendMessage: (
    type: MessageType,
    text?: string,
    mediaUrl?: string,
    mediaDuration?: number,
    location?: LocationPayload,
    fileName?: string,
    fileSize?: number
  ) => Promise<void>;
  editMessage: (messageId: string, newText: string) => void;
  deleteMessage: (messageId: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  replyToMessage: Message | null;
  setReplyToMessage: (msg: Message | null) => void;
  startDirectChat: (targetUserId: string) => Conversation;
  createGroupChat: (name: string, participantIds: string[], photoURL?: string, description?: string) => Conversation;
  // Calling state
  activeCall: CallSession | null;
  incomingCall: CallSession | null;
  startCall: (receiverId: string, type: 'audio' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleCallAudio: () => boolean;
  toggleCallVideo: () => boolean;
  toggleScreenShare: () => Promise<boolean>;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isSharingScreen: boolean;
  localMediaStream: MediaStream | null;
  remoteMediaStream: MediaStream | null;
  callHistory: CallHistoryItem[];
  // Typing simulation
  typingStatusText: string | null;
  triggerTyping: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingQueue, setPendingQueue] = useState<Message[]>([]);
  const [typingStatusText, setTypingStatusText] = useState<string | null>(null);

  // Calling states
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);

  const webRtcRef = useRef<WebRtcService | null>(null);
  const callTimerRef = useRef<number | null>(null);

  // Initialize WebRTC service
  useEffect(() => {
    webRtcRef.current = new WebRtcService({
      onLocalStream: (stream) => setLocalMediaStream(stream),
      onRemoteStream: (stream) => setRemoteMediaStream(stream),
      onConnectionStateChange: (state) => {
        console.log('WebRTC Connection state:', state);
      },
      onScreenShareStopped: () => setIsSharingScreen(false),
      onError: (err) => console.error('WebRTC error:', err),
    });

    return () => {
      webRtcRef.current?.endCall();
    };
  }, []);

  const refreshConversations = useCallback(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    const convs = StorageService.getConversations(user.uid);
    setConversations(convs);
  }, [user]);

  const refreshMessages = useCallback(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    const msgs = StorageService.getMessages(activeConversation.id);
    setMessages(msgs);
  }, [activeConversation]);

  const refreshCallHistory = useCallback(() => {
    if (!user) return;
    setCallHistory(StorageService.getCallHistory(user.uid));
  }, [user]);

  useEffect(() => {
    refreshConversations();
    refreshCallHistory();
  }, [user, refreshConversations, refreshCallHistory]);

  useEffect(() => {
    refreshMessages();
  }, [activeConversation, refreshMessages]);

  // Offline sync queue processor
  useEffect(() => {
    if (!isOffline && pendingQueue.length > 0) {
      // Reconnected: process queued messages
      pendingQueue.forEach((queued) => {
        const syncedMsg: Message = { ...queued, status: 'sent' };
        StorageService.updateMessage(syncedMsg);
      });
      setPendingQueue([]);
      refreshMessages();
      refreshConversations();
    }
  }, [isOffline, pendingQueue, refreshMessages, refreshConversations]);

  const toggleOfflineMode = () => {
    setIsOffline((prev) => !prev);
  };

  const triggerTyping = () => {
    // When user types, simulate peer responding after 3-5 seconds
    if (!activeConversation || activeConversation.type === 'group' || isOffline) return;
    const peerId = activeConversation.participantIds.find((id) => id !== user?.uid);
    if (!peerId) return;
    const peer = StorageService.getUserById(peerId);
    if (!peer || !peer.isOnline) return;

    // Simulate occasional auto reply from the other participant in demo mode
    setTimeout(() => {
      setTypingStatusText(`${peer.displayName} is typing...`);
      setTimeout(() => {
        setTypingStatusText(null);
      }, 2500);
    }, 1500);
  };

  const sendMessage = async (
    type: MessageType,
    text?: string,
    mediaUrl?: string,
    mediaDuration?: number,
    location?: LocationPayload,
    fileName?: string,
    fileSize?: number
  ) => {
    if (!user || !activeConversation) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: activeConversation.id,
      senderId: user.uid,
      type,
      text: text?.trim(),
      mediaUrl,
      mediaDuration,
      location,
      fileName,
      mediaSize: fileSize,
      replyToMessage: replyToMessage
        ? {
            id: replyToMessage.id,
            senderId: replyToMessage.senderId,
            senderName:
              replyToMessage.senderId === user.uid
                ? 'You'
                : StorageService.getUserById(replyToMessage.senderId)?.displayName || 'User',
            textSnippet: replyToMessage.text || replyToMessage.type,
          }
        : undefined,
      reactions: [],
      status: isOffline ? 'local_queued' : 'sent',
      createdAt: Date.now(),
    };

    if (isOffline) {
      setPendingQueue((prev) => [...prev, newMessage]);
    }

    StorageService.addMessage(newMessage);
    setReplyToMessage(null);
    refreshMessages();
    refreshConversations();

    // If online, simulate delivery and read receipt from receiver after brief delay
    if (!isOffline && activeConversation.type === 'direct') {
      setTimeout(() => {
        const deliveredMsg = { ...newMessage, status: 'delivered' as const };
        StorageService.updateMessage(deliveredMsg);
        refreshMessages();

        setTimeout(() => {
          const readMsg = { ...newMessage, status: 'read' as const };
          StorageService.updateMessage(readMsg);
          refreshMessages();
        }, 1200);
      }, 600);
    }
  };

  const editMessage = (messageId: string, newText: string) => {
    const target = messages.find((m) => m.id === messageId);
    if (!target || target.senderId !== user?.uid) return;

    const updated: Message = {
      ...target,
      text: newText.trim(),
      isEdited: true,
      updatedAt: Date.now(),
    };
    StorageService.updateMessage(updated);
    refreshMessages();
  };

  const deleteMessage = (messageId: string) => {
    StorageService.deleteMessage(messageId);
    refreshMessages();
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    if (!user) return;
    const target = messages.find((m) => m.id === messageId);
    if (!target) return;

    const reactions = [...target.reactions];
    const existingIndex = reactions.findIndex((r) => r.emoji === emoji);

    if (existingIndex >= 0) {
      const existing = reactions[existingIndex];
      const hasUserReacted = existing.userIds.includes(user.uid);
      if (hasUserReacted) {
        existing.userIds = existing.userIds.filter((id) => id !== user.uid);
        if (existing.userIds.length === 0) {
          reactions.splice(existingIndex, 1);
        }
      } else {
        existing.userIds.push(user.uid);
      }
    } else {
      reactions.push({ emoji, userIds: [user.uid] });
    }

    const updated = { ...target, reactions };
    StorageService.updateMessage(updated);
    refreshMessages();
  };

  const startDirectChat = (targetUserId: string): Conversation => {
    if (!user) throw new Error('Not authenticated');

    // Check if direct conversation already exists
    const existing = conversations.find(
      (c) => c.type === 'direct' && c.participantIds.includes(targetUserId) && c.participantIds.includes(user.uid)
    );

    if (existing) {
      setActiveConversation(existing);
      return existing;
    }

    const newConv: Conversation = {
      id: `conv_direct_${user.uid}_${targetUserId}`,
      type: 'direct',
      participantIds: [user.uid, targetUserId],
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    StorageService.saveConversation(newConv);
    refreshConversations();
    setActiveConversation(newConv);
    return newConv;
  };

  const createGroupChat = (
    name: string,
    participantIds: string[],
    photoURL?: string,
    description?: string
  ): Conversation => {
    if (!user) throw new Error('Not authenticated');
    const allParticipants = Array.from(new Set([user.uid, ...participantIds]));

    const newGroup: Conversation = {
      id: `conv_group_${Date.now()}`,
      type: 'group',
      participantIds: allParticipants,
      groupMeta: {
        name,
        photoURL: photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
        description,
        adminIds: [user.uid],
        createdBy: user.uid,
        membersCount: allParticipants.length,
      },
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    StorageService.saveConversation(newGroup);
    refreshConversations();
    setActiveConversation(newGroup);
    return newGroup;
  };

  // --- Calling Implementation ---
  const startCall = async (receiverId: string, type: 'audio' | 'video') => {
    if (!user || isOffline) return;

    const callSession: CallSession = {
      id: `call_${Date.now()}`,
      callerId: user.uid,
      receiverId,
      type,
      status: 'calling',
      startedAt: Date.now(),
    };

    setActiveCall(callSession);

    // Initialize WebRTC hardware
    if (webRtcRef.current) {
      await webRtcRef.current.initLocalMedia(type === 'video');
      webRtcRef.current.createPeerConnection();
    }

    // Auto simulate peer answering after 3 seconds for smooth demonstration
    callTimerRef.current = window.setTimeout(() => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected', connectedAt: Date.now() } : null));
    }, 2800);
  };

  const acceptCall = async () => {
    if (!incomingCall || !user) return;
    const connectedSession: CallSession = {
      ...incomingCall,
      status: 'connected',
      connectedAt: Date.now(),
    };
    setActiveCall(connectedSession);
    setIncomingCall(null);

    if (webRtcRef.current) {
      await webRtcRef.current.initLocalMedia(connectedSession.type === 'video');
      webRtcRef.current.createPeerConnection();
    }
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    const record: CallHistoryItem = {
      id: `call_rec_${Date.now()}`,
      callerId: incomingCall.callerId,
      receiverId: user?.uid || '',
      type: incomingCall.type,
      status: 'rejected',
      timestamp: Date.now(),
      durationSeconds: 0,
    };
    StorageService.addCallRecord(record);
    setIncomingCall(null);
    refreshCallHistory();
  };

  const endCall = () => {
    if (callTimerRef.current) {
      clearTimeout(callTimerRef.current);
      callTimerRef.current = null;
    }

    if (activeCall && user) {
      const duration = activeCall.connectedAt ? Math.round((Date.now() - activeCall.connectedAt) / 1000) : 0;
      const record: CallHistoryItem = {
        id: `call_rec_${Date.now()}`,
        callerId: activeCall.callerId,
        receiverId: activeCall.receiverId || '',
        type: activeCall.type,
        status: activeCall.connectedAt ? 'completed' : 'missed',
        timestamp: Date.now(),
        durationSeconds: duration,
      };
      StorageService.addCallRecord(record);
    }

    webRtcRef.current?.endCall();
    setActiveCall(null);
    setLocalMediaStream(null);
    setRemoteMediaStream(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsSharingScreen(false);
    refreshCallHistory();
  };

  const toggleCallAudio = (): boolean => {
    if (!webRtcRef.current) return false;
    const isUnmuted = webRtcRef.current.toggleAudio();
    setIsAudioMuted(!isUnmuted);
    return !isUnmuted;
  };

  const toggleCallVideo = (): boolean => {
    if (!webRtcRef.current) return false;
    const isUnmuted = webRtcRef.current.toggleVideo();
    setIsVideoMuted(!isUnmuted);
    return !isUnmuted;
  };

  const toggleScreenShare = async (): Promise<boolean> => {
    if (!webRtcRef.current) return false;
    if (isSharingScreen) {
      await webRtcRef.current.stopScreenShare();
      setIsSharingScreen(false);
      return false;
    } else {
      const stream = await webRtcRef.current.startScreenShare();
      const started = !!stream;
      setIsSharingScreen(started);
      return started;
    }
  };

  const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        unreadTotal,
        isOffline,
        toggleOfflineMode,
        pendingQueueCount: pendingQueue.length,
        sendMessage,
        editMessage,
        deleteMessage,
        reactToMessage,
        replyToMessage,
        setReplyToMessage,
        startDirectChat,
        createGroupChat,
        activeCall,
        incomingCall,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleCallAudio,
        toggleCallVideo,
        toggleScreenShare,
        isAudioMuted,
        isVideoMuted,
        isSharingScreen,
        localMediaStream,
        remoteMediaStream,
        callHistory,
        typingStatusText,
        triggerTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
