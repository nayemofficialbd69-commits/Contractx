/**
 * ConnectX Admin Context
 * Provides role-based administrative control, user moderation (suspend/restore),
 * feature flags, announcements, reports resolution, and audit logs.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/user';
import { FeatureConfig, UserReport, AdminAuditLog, SystemAnnouncement, DashboardMetrics } from '../types/admin';
import { StorageService } from '../services/storageService';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminUser: UserProfile | null;
  adminLogin: (accessKey: string) => boolean;
  adminLogout: () => void;
  config: FeatureConfig;
  updateFeatureConfig: (updates: Partial<FeatureConfig>) => void;
  users: UserProfile[];
  refreshUsers: () => void;
  suspendUser: (uid: string, reason: string) => void;
  restoreUser: (uid: string) => void;
  reports: UserReport[];
  resolveReport: (reportId: string, actionTaken: string) => void;
  announcements: SystemAnnouncement[];
  createAnnouncement: (title: string, content: string, severity: 'info' | 'warning' | 'critical') => void;
  auditLogs: AdminAuditLog[];
  metrics: DashboardMetrics;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
  const [config, setConfig] = useState<FeatureConfig>(StorageService.getFeatureConfig());
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  const refreshAll = useCallback(() => {
    setUsers(StorageService.getAllUsers());
    setConfig(StorageService.getFeatureConfig());
    setReports(StorageService.getReports());
    setAnnouncements(StorageService.getAnnouncements());
    setAuditLogs(StorageService.getAuditLogs());
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const adminLogin = (accessKey: string): boolean => {
    // Verified root admin key
    if (accessKey === 'ConnectX-Admin-2026' || accessKey === 'admin123') {
      const rootAdmin = StorageService.getUserById('user_admin_root');
      setAdminUser(rootAdmin);
      setIsAdminAuthenticated(true);

      StorageService.addAuditLog({
        id: `audit_${Date.now()}`,
        adminId: rootAdmin?.uid || 'user_admin_root',
        adminEmail: rootAdmin?.email || 'admin@connectx.local',
        action: 'user_suspend',
        targetResource: 'admin_session',
        details: 'Admin authenticated into ConnectX Management Console',
        timestamp: Date.now(),
      });
      refreshAll();
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
  };

  const updateFeatureConfig = (updates: Partial<FeatureConfig>) => {
    if (!adminUser) return;
    const newConfig = { ...config, ...updates };
    StorageService.updateFeatureConfig(newConfig, adminUser.uid, adminUser.email || 'admin@connectx.local');
    setConfig(newConfig);
    refreshAll();
  };

  const suspendUser = (uid: string, reason: string) => {
    if (!adminUser) return;
    const target = StorageService.getUserById(uid);
    if (!target) return;

    const updated: UserProfile = {
      ...target,
      accountStatus: 'suspended',
      suspensionReason: reason.trim() || 'Terms of Service violation',
      isOnline: false,
    };
    StorageService.saveUser(updated);

    StorageService.addAuditLog({
      id: `audit_${Date.now()}`,
      adminId: adminUser.uid,
      adminEmail: adminUser.email || 'admin@connectx.local',
      action: 'user_suspend',
      targetResource: 'users',
      targetId: uid,
      details: `Suspended user ${target.displayName} (@${target.username}, ${target.publicId}). Reason: ${reason}`,
      timestamp: Date.now(),
    });

    refreshAll();
  };

  const restoreUser = (uid: string) => {
    if (!adminUser) return;
    const target = StorageService.getUserById(uid);
    if (!target) return;

    const updated: UserProfile = {
      ...target,
      accountStatus: 'active',
      suspensionReason: undefined,
    };
    StorageService.saveUser(updated);

    StorageService.addAuditLog({
      id: `audit_${Date.now()}`,
      adminId: adminUser.uid,
      adminEmail: adminUser.email || 'admin@connectx.local',
      action: 'user_restore',
      targetResource: 'users',
      targetId: uid,
      details: `Restored user ${target.displayName} (@${target.username}, ${target.publicId}) to active state`,
      timestamp: Date.now(),
    });

    refreshAll();
  };

  const resolveReport = (reportId: string, actionTaken: string) => {
    if (!adminUser) return;
    StorageService.resolveReport(reportId, actionTaken, adminUser.uid, adminUser.email || 'admin@connectx.local');
    refreshAll();
  };

  const createAnnouncement = (title: string, content: string, severity: 'info' | 'warning' | 'critical') => {
    if (!adminUser) return;
    const newAnn: SystemAnnouncement = {
      id: `ann_${Date.now()}`,
      title,
      content,
      severity,
      isActive: true,
      createdAt: Date.now(),
    };
    StorageService.addAnnouncement(newAnn, adminUser.uid, adminUser.email || 'admin@connectx.local');
    refreshAll();
  };

  const metrics: DashboardMetrics = {
    totalUsers: users.length,
    activeToday: users.filter((u) => u.isOnline || Date.now() - u.lastSeen < 86400000).length,
    suspendedUsers: users.filter((u) => u.accountStatus === 'suspended').length,
    totalMessages: 48,
    totalConversations: 2,
    totalCalls: 3,
    storageUsageMB: 142.6,
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        adminUser,
        adminLogin,
        adminLogout,
        config,
        updateFeatureConfig,
        users,
        refreshUsers: refreshAll,
        suspendUser,
        restoreUser,
        reports,
        resolveReport,
        announcements,
        createAnnouncement,
        auditLogs,
        metrics,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
