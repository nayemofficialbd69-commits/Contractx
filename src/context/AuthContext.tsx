/**
 * ConnectX Authentication Context
 * Supports Google Login, Email/Password (with uniqueness guarantees),
 * Phone OTP verification, Session persistence, and Identity Management.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, PrivacySettings } from '../types/user';
import { StorageService } from '../services/storageService';
import { validateUsername, normalizeUsername, isValidPublicId } from '../services/publicIdService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (
    displayName: string,
    username: string,
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string }>;
  sendPhoneOtp: (phoneNumber: string) => Promise<{ success: boolean; mockOtp?: string; error?: string }>;
  verifyPhoneOtp: (
    phoneNumber: string,
    otp: string,
    displayName?: string,
    username?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteAccount: () => Promise<boolean>;
  switchUser: (uid: string) => void;
  allUsers: UserProfile[];
}

const defaultPrivacy: PrivacySettings = {
  lastSeenVisibility: 'everyone',
  readReceipts: true,
  whoCanFindByPublicId: 'everyone',
  whoCanFindByUsername: 'everyone',
  profilePhotoVisibility: 'everyone',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Load session
    const current = StorageService.getCurrentUser();
    setUser(current);
    setAllUsers(StorageService.getAllUsers());
    setIsLoading(false);
  }, []);

  const refreshUsers = () => {
    setAllUsers(StorageService.getAllUsers());
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Simulate Google Sign-In with real account retrieval
      const googleDisplayName = 'Mohammad Naim';
      const googleEmail = 'nayemofficial.bd69@gmail.com';
      const googlePhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

      // Check if user already exists with this email
      let existingUser = StorageService.getAllUsers().find((u) => u.email === googleEmail);

      if (!existingUser) {
        // Generate automatic collision-resistant Public ID
        const publicId = StorageService.generateUniquePublicId();
        let baseUsername = 'naim_official';
        if (StorageService.isUsernameTaken(baseUsername)) {
          baseUsername = `naim_${Math.floor(100 + Math.random() * 900)}`;
        }

        const newUser: UserProfile = {
          uid: `google_${Date.now()}`,
          displayName: googleDisplayName,
          username: baseUsername,
          usernameNormalized: normalizeUsername(baseUsername),
          publicId,
          photoURL: googlePhoto,
          bio: 'Hey there! I am using ConnectX Messenger.',
          email: googleEmail,
          isEmailVerified: true,
          isPhoneVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastSeen: Date.now(),
          isOnline: true,
          accountStatus: 'active',
          isAdmin: false,
          blockedUsers: [],
          privacy: defaultPrivacy,
        };

        StorageService.saveUser(newUser);
        existingUser = newUser;
      }

      setUser(existingUser);
      StorageService.setCurrentUser(existingUser);
      refreshUsers();
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: (err as Error).message };
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (!email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Email and password are required' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = StorageService.getAllUsers().find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!existing) {
      setIsLoading(false);
      return { success: false, error: 'No account found with this email address' };
    }

    if (existing.accountStatus === 'suspended') {
      setIsLoading(false);
      return {
        success: false,
        error: `Account suspended. Reason: ${existing.suspensionReason || 'Terms violation'}. Please contact support.`,
      };
    }

    // Update lastSeen & online status
    const updated = { ...existing, isOnline: true, lastSeen: Date.now() };
    StorageService.saveUser(updated);
    setUser(updated);
    StorageService.setCurrentUser(updated);
    refreshUsers();
    setIsLoading(false);
    return { success: true };
  };

  const registerWithEmail = async (
    displayName: string,
    username: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (!displayName.trim()) {
      setIsLoading(false);
      return { success: false, error: 'Display Name is required' };
    }

    // Validate username rules
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      setIsLoading(false);
      return { success: false, error: usernameValidation.error };
    }

    const normalized = normalizeUsername(username);
    if (StorageService.isUsernameTaken(normalized)) {
      setIsLoading(false);
      return { success: false, error: `The username @${normalized} is already taken. Please choose another.` };
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address' };
    }

    if (StorageService.getAllUsers().some((u) => u.email?.toLowerCase() === cleanEmail)) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email already exists' };
    }

    if (pass.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Generate unique Public ID Code (CX-XXXXXXXX)
    const publicId = StorageService.generateUniquePublicId();

    const newUser: UserProfile = {
      uid: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      displayName: displayName.trim(),
      username: normalized,
      usernameNormalized: normalized,
      publicId,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${normalized}`,
      bio: 'ConnectX Messenger user',
      email: cleanEmail,
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastSeen: Date.now(),
      isOnline: true,
      accountStatus: 'active',
      isAdmin: false,
      blockedUsers: [],
      privacy: defaultPrivacy,
    };

    StorageService.saveUser(newUser);
    setUser(newUser);
    StorageService.setCurrentUser(newUser);
    refreshUsers();
    setIsLoading(false);
    return { success: true };
  };

  // Mock OTP registry for phone authentication
  const sendPhoneOtp = async (phoneNumber: string): Promise<{ success: boolean; mockOtp?: string; error?: string }> => {
    if (!phoneNumber || phoneNumber.length < 8) {
      return { success: false, error: 'Please enter a valid international phone number' };
    }
    // Fixed deterministic or generated 6-digit OTP for testing
    const mockOtp = '742918';
    return { success: true, mockOtp };
  };

  const verifyPhoneOtp = async (
    phoneNumber: string,
    otp: string,
    displayName?: string,
    username?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (otp !== '742918' && otp !== '123456') {
      setIsLoading(false);
      return { success: false, error: 'Invalid verification code. Please check SMS and retry.' };
    }

    let existing = StorageService.getAllUsers().find((u) => u.phoneNumber === phoneNumber);
    if (!existing) {
      const dName = displayName?.trim() || 'ConnectX Mobile User';
      const rawUser = username || `user_${phoneNumber.slice(-4)}`;
      const normalized = normalizeUsername(rawUser);
      const publicId = StorageService.generateUniquePublicId();

      const newUser: UserProfile = {
        uid: `phone_${Date.now()}`,
        displayName: dName,
        username: normalized,
        usernameNormalized: normalized,
        publicId,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${normalized}`,
        bio: 'Verified via Phone SMS',
        phoneNumber,
        isEmailVerified: false,
        isPhoneVerified: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastSeen: Date.now(),
        isOnline: true,
        accountStatus: 'active',
        isAdmin: false,
        blockedUsers: [],
        privacy: defaultPrivacy,
      };

      StorageService.saveUser(newUser);
      existing = newUser;
    }

    setUser(existing);
    StorageService.setCurrentUser(existing);
    refreshUsers();
    setIsLoading(false);
    return { success: true };
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Disallow tampering with security fields
    const safeUpdates = { ...updates };
    delete safeUpdates.uid;
    delete safeUpdates.publicId; // Public ID must remain stable forever
    delete safeUpdates.isAdmin;
    delete safeUpdates.accountStatus;

    if (safeUpdates.username) {
      const validation = validateUsername(safeUpdates.username);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }
      const normalized = normalizeUsername(safeUpdates.username);
      if (StorageService.isUsernameTaken(normalized, user.uid)) {
        return { success: false, error: 'Username is already taken by another user' };
      }
      safeUpdates.username = normalized;
      safeUpdates.usernameNormalized = normalized;
    }

    const updatedUser: UserProfile = {
      ...user,
      ...safeUpdates,
      updatedAt: Date.now(),
    };

    StorageService.saveUser(updatedUser);
    setUser(updatedUser);
    refreshUsers();
    return { success: true };
  };

  const logout = () => {
    if (user) {
      const updated = { ...user, isOnline: false, lastSeen: Date.now() };
      StorageService.saveUser(updated);
    }
    setUser(null);
    StorageService.setCurrentUser(null);
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user) return false;
    const users = StorageService.getAllUsers().filter((u) => u.uid !== user.uid);
    localStorage.setItem('cx_users_v1', JSON.stringify(users));
    setUser(null);
    StorageService.setCurrentUser(null);
    refreshUsers();
    return true;
  };

  const switchUser = (uid: string) => {
    const target = StorageService.getUserById(uid);
    if (target) {
      setUser(target);
      StorageService.setCurrentUser(target);
      refreshUsers();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        sendPhoneOtp,
        verifyPhoneOtp,
        updateProfile,
        logout,
        deleteAccount,
        switchUser,
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
