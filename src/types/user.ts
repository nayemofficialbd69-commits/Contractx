export type AccountStatus = 'active' | 'suspended' | 'pending_verification' | 'deactivated';

export interface PrivacySettings {
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  whoCanFindByPublicId: 'everyone' | 'contacts' | 'nobody';
  whoCanFindByUsername: 'everyone' | 'contacts' | 'nobody';
  profilePhotoVisibility: 'everyone' | 'contacts' | 'nobody';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  usernameNormalized: string;
  publicId: string; // Format: CX-7K4M9P2Q
  photoURL: string;
  bio: string;
  email?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: number;
  updatedAt: number;
  lastSeen: number;
  isOnline: boolean;
  accountStatus: AccountStatus;
  suspensionReason?: string;
  isAdmin: boolean;
  blockedUsers: string[]; // array of uids
  privacy: PrivacySettings;
}

export interface Contact {
  id: string;
  uid: string;
  alias?: string;
  addedAt: number;
  isFavorite?: boolean;
}
