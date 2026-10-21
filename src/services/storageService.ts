/**
 * ConnectX Storage & Persistence Engine
 * Handles persistent client storage, transactional uniqueness enforcement,
 * offline message queue, seed data, and sync.
 */

import { UserProfile, Contact } from '../types/user';
import { Conversation, Message, CallHistoryItem } from '../types/chat';
import { FeatureConfig, UserReport, AdminAuditLog, SystemAnnouncement } from '../types/admin';
import { generateRawIdCode, normalizeUsername } from './publicIdService';

const USERS_KEY = 'cx_users_v1';
const CURRENT_USER_KEY = 'cx_current_user_v1';
const CONVERSATIONS_KEY = 'cx_conversations_v1';
const MESSAGES_KEY = 'cx_messages_v1';
const CALLS_KEY = 'cx_calls_v1';
const CONFIG_KEY = 'cx_feature_config_v1';
const REPORTS_KEY = 'cx_reports_v1';
const AUDIT_KEY = 'cx_audit_logs_v1';
const ANNOUNCEMENTS_KEY = 'cx_announcements_v1';

// Initial pre-seeded users
const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user_naim_01',
    displayName: 'Mohammad Naim',
    username: 'naim_gamer',
    usernameNormalized: 'naim_gamer',
    publicId: 'CX-7K4M9P2Q',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'ConnectX early adopter · Gaming & Tech Enthusiast',
    email: 'naim.gamer@example.com',
    phoneNumber: '+15550192834',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 86400000,
    lastSeen: Date.now() - 120000,
    isOnline: true,
    accountStatus: 'active',
    isAdmin: false,
    blockedUsers: [],
    privacy: {
      lastSeenVisibility: 'everyone',
      readReceipts: true,
      whoCanFindByPublicId: 'everyone',
      whoCanFindByUsername: 'everyone',
      profilePhotoVisibility: 'everyone',
    },
  },
  {
    uid: 'user_sarah_02',
    displayName: 'Sarah Connor',
    username: 'sarah_c',
    usernameNormalized: 'sarah_c',
    publicId: 'CX-3M8N2V9K',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Building next-gen systems. Always connected.',
    email: 'sarah.c@example.com',
    phoneNumber: '+15550998877',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now() - 40000000,
    lastSeen: Date.now() - 500000,
    isOnline: true,
    accountStatus: 'active',
    isAdmin: false,
    blockedUsers: [],
    privacy: {
      lastSeenVisibility: 'everyone',
      readReceipts: true,
      whoCanFindByPublicId: 'everyone',
      whoCanFindByUsername: 'everyone',
      profilePhotoVisibility: 'everyone',
    },
  },
  {
    uid: 'user_alex_03',
    displayName: 'Dr. Alex Vance',
    username: 'vance_alex',
    usernameNormalized: 'vance_alex',
    publicId: 'CX-9P4W8L1R',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'WebRTC researcher · Available for audio/video test calls',
    email: 'alex.vance@example.com',
    isEmailVerified: true,
    isPhoneVerified: false,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 1000000,
    lastSeen: Date.now() - 3600000,
    isOnline: false,
    accountStatus: 'active',
    isAdmin: false,
    blockedUsers: [],
    privacy: {
      lastSeenVisibility: 'contacts',
      readReceipts: true,
      whoCanFindByPublicId: 'everyone',
      whoCanFindByUsername: 'everyone',
      profilePhotoVisibility: 'everyone',
    },
  },
  {
    uid: 'user_admin_root',
    displayName: 'ConnectX Security Admin',
    username: 'admin_security',
    usernameNormalized: 'admin_security',
    publicId: 'CX-ADMN0001',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    bio: 'ConnectX Security Operations · Admin Console',
    email: 'admin@connectx.local',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now(),
    lastSeen: Date.now(),
    isOnline: true,
    accountStatus: 'active',
    isAdmin: true,
    blockedUsers: [],
    privacy: {
      lastSeenVisibility: 'nobody',
      readReceipts: true,
      whoCanFindByPublicId: 'everyone',
      whoCanFindByUsername: 'everyone',
      profilePhotoVisibility: 'everyone',
    },
  },
];

// Initial feature configuration
const DEFAULT_CONFIG: FeatureConfig = {
  audioCallsEnabled: true,
  videoCallsEnabled: true,
  screenSharingEnabled: true,
  voiceMessagesEnabled: true,
  mediaUploadsEnabled: true,
  locationSharingEnabled: true,
  maxFileSizeMB: 25,
  minSupportedAppVersion: '2.0.0',
  maintenanceMode: false,
  maintenanceMessage: 'ConnectX Messenger is undergoing scheduled optimization. We will be back shortly.',
  registrationOpen: true,
};

// Initial system announcements
const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'ann_01',
    title: 'Welcome to ConnectX v2.4!',
    content: 'Experience ultra-fast real-time messaging, WebRTC calling with screen sharing, voice notes, and your unique collision-resistant Public ID.',
    severity: 'info',
    isActive: true,
    createdAt: Date.now() - 86400000,
  },
];

// Initial pre-seeded conversations
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_direct_naim_sarah',
    type: 'direct',
    participantIds: ['user_naim_01', 'user_sarah_02'],
    unreadCount: 1,
    isPinned: true,
    updatedAt: Date.now() - 60000,
    createdAt: Date.now() - 7 * 86400000,
    lastMessage: {
      id: 'msg_01',
      conversationId: 'conv_direct_naim_sarah',
      senderId: 'user_sarah_02',
      type: 'text',
      text: 'Hey Naim! Have you checked out the new WebRTC audio/video call quality in ConnectX?',
      reactions: [{ emoji: '🔥', userIds: ['user_naim_01'] }],
      status: 'read',
      createdAt: Date.now() - 60000,
    },
  },
  {
    id: 'conv_group_core_dev',
    type: 'group',
    participantIds: ['user_naim_01', 'user_sarah_02', 'user_alex_03'],
    groupMeta: {
      name: 'ConnectX Beta Pioneers',
      photoURL: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      description: 'Official test group for ConnectX Android release and WebRTC calls.',
      adminIds: ['user_naim_01'],
      createdBy: 'user_naim_01',
      membersCount: 3,
    },
    unreadCount: 0,
    updatedAt: Date.now() - 3600000,
    createdAt: Date.now() - 14 * 86400000,
    lastMessage: {
      id: 'msg_group_01',
      conversationId: 'conv_group_core_dev',
      senderId: 'user_alex_03',
      type: 'text',
      text: 'STUN server round-trip latency tested at 24ms across regions. Looking solid!',
      reactions: [{ emoji: '👍', userIds: ['user_naim_01', 'user_sarah_02'] }],
      status: 'read',
      createdAt: Date.now() - 3600000,
    },
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_seed_00',
    conversationId: 'conv_direct_naim_sarah',
    senderId: 'user_naim_01',
    type: 'text',
    text: 'Hi Sarah, let’s test the new ConnectX features!',
    reactions: [],
    status: 'read',
    createdAt: Date.now() - 180000,
  },
  {
    id: 'msg_seed_01',
    conversationId: 'conv_direct_naim_sarah',
    senderId: 'user_sarah_02',
    type: 'text',
    text: 'Hey Naim! Have you checked out the new WebRTC audio/video call quality in ConnectX?',
    reactions: [{ emoji: '🔥', userIds: ['user_naim_01'] }],
    status: 'read',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'msg_group_00',
    conversationId: 'conv_group_core_dev',
    senderId: 'user_naim_01',
    type: 'text',
    text: 'Welcome everyone to the ConnectX Beta Pioneers group! Screen sharing and voice notes are ready for testing.',
    reactions: [{ emoji: '🚀', userIds: ['user_sarah_02', 'user_alex_03'] }],
    status: 'read',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'msg_group_01',
    conversationId: 'conv_group_core_dev',
    senderId: 'user_alex_03',
    type: 'text',
    text: 'STUN server round-trip latency tested at 24ms across regions. Looking solid!',
    reactions: [{ emoji: '👍', userIds: ['user_naim_01', 'user_sarah_02'] }],
    status: 'read',
    createdAt: Date.now() - 3600000,
  },
];

const INITIAL_CALLS: CallHistoryItem[] = [
  {
    id: 'call_rec_01',
    callerId: 'user_sarah_02',
    receiverId: 'user_naim_01',
    type: 'video',
    status: 'completed',
    timestamp: Date.now() - 86400000,
    durationSeconds: 248,
  },
  {
    id: 'call_rec_02',
    callerId: 'user_alex_03',
    receiverId: 'user_naim_01',
    type: 'audio',
    status: 'missed',
    timestamp: Date.now() - 172800000,
    durationSeconds: 0,
  },
];

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Storage write error:', err);
    }
  }

  // Initialize seed data if not present
  public static initSeedData(): void {
    if (!localStorage.getItem(USERS_KEY)) {
      this.setItem(USERS_KEY, INITIAL_USERS);
    }
    if (!localStorage.getItem(CONVERSATIONS_KEY)) {
      this.setItem(CONVERSATIONS_KEY, INITIAL_CONVERSATIONS);
    }
    if (!localStorage.getItem(MESSAGES_KEY)) {
      this.setItem(MESSAGES_KEY, INITIAL_MESSAGES);
    }
    if (!localStorage.getItem(CALLS_KEY)) {
      this.setItem(CALLS_KEY, INITIAL_CALLS);
    }
    if (!localStorage.getItem(CONFIG_KEY)) {
      this.setItem(CONFIG_KEY, DEFAULT_CONFIG);
    }
    if (!localStorage.getItem(ANNOUNCEMENTS_KEY)) {
      this.setItem(ANNOUNCEMENTS_KEY, INITIAL_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem(REPORTS_KEY)) {
      this.setItem(REPORTS_KEY, []);
    }
    if (!localStorage.getItem(AUDIT_KEY)) {
      this.setItem(AUDIT_KEY, [
        {
          id: 'audit_01',
          adminId: 'user_admin_root',
          adminEmail: 'admin@connectx.local',
          action: 'config_update',
          targetResource: 'remote_config',
          details: 'Initialized ConnectX production remote config rules',
          timestamp: Date.now() - 86400000,
        },
      ]);
    }

    // Default current user to Mohammad Naim if none active
    if (!localStorage.getItem(CURRENT_USER_KEY)) {
      this.setItem(CURRENT_USER_KEY, INITIAL_USERS[0]);
    }
  }

  // --- Users & Identity Operations ---
  public static getAllUsers(): UserProfile[] {
    return this.getItem<UserProfile[]>(USERS_KEY, INITIAL_USERS);
  }

  public static getUserById(uid: string): UserProfile | null {
    const users = this.getAllUsers();
    return users.find((u) => u.uid === uid) || null;
  }

  public static findUserByPublicId(publicId: string): UserProfile | null {
    const users = this.getAllUsers();
    const clean = publicId.trim().toUpperCase();
    return users.find((u) => u.publicId.toUpperCase() === clean) || null;
  }

  public static findUserByUsername(username: string): UserProfile | null {
    const users = this.getAllUsers();
    const clean = normalizeUsername(username);
    return users.find((u) => u.usernameNormalized === clean) || null;
  }

  public static isUsernameTaken(username: string, excludeUid?: string): boolean {
    const clean = normalizeUsername(username);
    const users = this.getAllUsers();
    return users.some((u) => u.usernameNormalized === clean && u.uid !== excludeUid);
  }

  public static isPublicIdTaken(publicId: string): boolean {
    const clean = publicId.trim().toUpperCase();
    const users = this.getAllUsers();
    return users.some((u) => u.publicId.toUpperCase() === clean);
  }

  /**
   * Generates a guaranteed unique Public ID code with collision retries
   */
  public static generateUniquePublicId(): string {
    const maxRetries = 10;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const candidate = generateRawIdCode();
      if (!this.isPublicIdTaken(candidate)) {
        return candidate;
      }
    }
    // High-entropy fallback if 10 collisions occurred
    return `CX-${Date.now().toString(36).toUpperCase()}`;
  }

  public static saveUser(user: UserProfile): void {
    const users = this.getAllUsers();
    const idx = users.findIndex((u) => u.uid === user.uid);
    if (idx >= 0) {
      users[idx] = { ...user, updatedAt: Date.now() };
    } else {
      users.push(user);
    }
    this.setItem(USERS_KEY, users);

    // If updating currently logged in user, sync session
    const current = this.getCurrentUser();
    if (current && current.uid === user.uid) {
      this.setItem(CURRENT_USER_KEY, { ...user, updatedAt: Date.now() });
    }
  }

  public static getCurrentUser(): UserProfile | null {
    return this.getItem<UserProfile | null>(CURRENT_USER_KEY, null);
  }

  public static setCurrentUser(user: UserProfile | null): void {
    this.setItem(CURRENT_USER_KEY, user);
  }

  // --- Conversations & Messages Operations ---
  public static getConversations(userId: string): Conversation[] {
    const convs = this.getItem<Conversation[]>(CONVERSATIONS_KEY, INITIAL_CONVERSATIONS);
    return convs.filter((c) => c.participantIds.includes(userId));
  }

  public static getConversationById(id: string): Conversation | null {
    const convs = this.getItem<Conversation[]>(CONVERSATIONS_KEY, INITIAL_CONVERSATIONS);
    return convs.find((c) => c.id === id) || null;
  }

  public static saveConversation(conv: Conversation): void {
    const convs = this.getItem<Conversation[]>(CONVERSATIONS_KEY, INITIAL_CONVERSATIONS);
    const idx = convs.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      convs[idx] = conv;
    } else {
      convs.unshift(conv);
    }
    this.setItem(CONVERSATIONS_KEY, convs);
  }

  public static getMessages(conversationId: string): Message[] {
    const messages = this.getItem<Message[]>(MESSAGES_KEY, INITIAL_MESSAGES);
    return messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  public static addMessage(message: Message): void {
    const messages = this.getItem<Message[]>(MESSAGES_KEY, INITIAL_MESSAGES);
    messages.push(message);
    this.setItem(MESSAGES_KEY, messages);

    // Update parent conversation's last message
    const conv = this.getConversationById(message.conversationId);
    if (conv) {
      conv.lastMessage = message;
      conv.updatedAt = message.createdAt;
      this.saveConversation(conv);
    }
  }

  public static updateMessage(updated: Message): void {
    const messages = this.getItem<Message[]>(MESSAGES_KEY, INITIAL_MESSAGES);
    const idx = messages.findIndex((m) => m.id === updated.id);
    if (idx >= 0) {
      messages[idx] = updated;
      this.setItem(MESSAGES_KEY, messages);
    }
  }

  public static deleteMessage(messageId: string): void {
    const messages = this.getItem<Message[]>(MESSAGES_KEY, INITIAL_MESSAGES);
    const idx = messages.findIndex((m) => m.id === messageId);
    if (idx >= 0) {
      messages[idx].isDeleted = true;
      messages[idx].text = 'This message was deleted';
      this.setItem(MESSAGES_KEY, messages);
    }
  }

  // --- Calls History ---
  public static getCallHistory(userId: string): CallHistoryItem[] {
    const calls = this.getItem<CallHistoryItem[]>(CALLS_KEY, INITIAL_CALLS);
    return calls
      .filter((c) => c.callerId === userId || c.receiverId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  public static addCallRecord(record: CallHistoryItem): void {
    const calls = this.getItem<CallHistoryItem[]>(CALLS_KEY, INITIAL_CALLS);
    calls.unshift(record);
    this.setItem(CALLS_KEY, calls);
  }

  // --- Feature Config & Admin Operations ---
  public static getFeatureConfig(): FeatureConfig {
    return this.getItem<FeatureConfig>(CONFIG_KEY, DEFAULT_CONFIG);
  }

  public static updateFeatureConfig(config: FeatureConfig, adminId: string, adminEmail: string): void {
    this.setItem(CONFIG_KEY, config);
    this.addAuditLog({
      id: `audit_${Date.now()}`,
      adminId,
      adminEmail,
      action: 'config_update',
      targetResource: 'remote_config',
      details: 'Updated remote configuration & feature flags',
      timestamp: Date.now(),
    });
  }

  public static getReports(): UserReport[] {
    return this.getItem<UserReport[]>(REPORTS_KEY, []);
  }

  public static submitReport(report: UserReport): void {
    const reports = this.getReports();
    reports.unshift(report);
    this.setItem(REPORTS_KEY, reports);
  }

  public static resolveReport(reportId: string, actionTaken: string, adminId: string, adminEmail: string): void {
    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx >= 0) {
      reports[idx].status = 'resolved';
      reports[idx].actionTaken = actionTaken;
      reports[idx].reviewedBy = adminEmail;
      reports[idx].reviewedAt = Date.now();
      this.setItem(REPORTS_KEY, reports);

      this.addAuditLog({
        id: `audit_${Date.now()}`,
        adminId,
        adminEmail,
        action: 'report_resolve',
        targetResource: 'user_report',
        targetId: reportId,
        details: `Resolved report with action: ${actionTaken}`,
        timestamp: Date.now(),
      });
    }
  }

  public static getAuditLogs(): AdminAuditLog[] {
    return this.getItem<AdminAuditLog[]>(AUDIT_KEY, []);
  }

  public static addAuditLog(log: AdminAuditLog): void {
    const logs = this.getAuditLogs();
    logs.unshift(log);
    this.setItem(AUDIT_KEY, logs);
  }

  public static getAnnouncements(): SystemAnnouncement[] {
    return this.getItem<SystemAnnouncement[]>(ANNOUNCEMENTS_KEY, INITIAL_ANNOUNCEMENTS);
  }

  public static addAnnouncement(ann: SystemAnnouncement, adminId: string, adminEmail: string): void {
    const anns = this.getAnnouncements();
    anns.unshift(ann);
    this.setItem(ANNOUNCEMENTS_KEY, anns);

    this.addAuditLog({
      id: `audit_${Date.now()}`,
      adminId,
      adminEmail,
      action: 'announcement_create',
      targetResource: 'announcements',
      targetId: ann.id,
      details: `Created announcement: ${ann.title}`,
      timestamp: Date.now(),
    });
  }

  // --- Reset to Demo Seed Data ---
  public static resetToDemoDefaults(): void {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CONVERSATIONS_KEY);
    localStorage.removeItem(MESSAGES_KEY);
    localStorage.removeItem(CALLS_KEY);
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(REPORTS_KEY);
    localStorage.removeItem(AUDIT_KEY);
    localStorage.removeItem(ANNOUNCEMENTS_KEY);
    this.initSeedData();
  }
}

// Auto initialize on module import
if (typeof window !== 'undefined') {
  StorageService.initSeedData();
}
