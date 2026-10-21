export interface FeatureConfig {
  audioCallsEnabled: boolean;
  videoCallsEnabled: boolean;
  screenSharingEnabled: boolean;
  voiceMessagesEnabled: boolean;
  mediaUploadsEnabled: boolean;
  locationSharingEnabled: boolean;
  maxFileSizeMB: number;
  minSupportedAppVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationOpen: boolean;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: 'spam' | 'harassment' | 'impersonation' | 'inappropriate_content' | 'other';
  details: string;
  createdAt: number;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: string;
  reviewedBy?: string;
  reviewedAt?: number;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: 'user_suspend' | 'user_restore' | 'config_update' | 'report_resolve' | 'announcement_create' | 'maintenance_toggle';
  targetResource: string;
  targetId?: string;
  details: string;
  timestamp: number;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'critical';
  isActive: boolean;
  createdAt: number;
  expiresAt?: number;
}

export interface DashboardMetrics {
  totalUsers: number;
  activeToday: number;
  suspendedUsers: number;
  totalMessages: number;
  totalConversations: number;
  totalCalls: number;
  storageUsageMB: number;
}
