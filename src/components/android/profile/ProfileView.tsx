import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  User,
  AtSign,
  Copy,
  Check,
  QrCode,
  Edit3,
  Camera,
  LogOut,
  Shield,
  Trash2,
  Sparkles,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, logout, deleteAccount, switchUser, allUsers } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [copiedId, setCopiedId] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!user) return null;

  const handleCopyPublicId = () => {
    navigator.clipboard.writeText(user.publicId);
    setCopiedId(true);
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateProfile({
      displayName,
      username,
      bio,
      photoURL,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update profile');
    } else {
      setSuccessMsg('Profile successfully updated');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleAvatarPreset = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    setPhotoURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">User Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => {
              setDisplayName(user.displayName);
              setUsername(user.username);
              setBio(user.bio);
              setPhotoURL(user.photoURL);
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-xl">
            {successMsg}
          </div>
        )}

        {/* Avatar & Online Card */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
              alt={user.displayName}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-purple-600/30 shadow-xl"
            />
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-3 ring-white dark:ring-slate-950" />
            )}
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
            {user.displayName}
          </h2>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-mono font-medium">
            @{user.username}
          </p>
        </div>

        {/* Identity Triad Showcase */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/40 border border-purple-800/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-purple-800/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>ConnectX Identity Triad</span>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
              Permanent Stable ID
            </span>
          </div>

          {/* 1. Public ID Code (CX-XXXXXXXX) */}
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-2xl">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">
                Automatic Public ID Code:
              </span>
              <span className="text-sm font-bold font-mono text-purple-300 tracking-wider">
                {user.publicId}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyPublicId}
                className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 transition-transform active:scale-95 shadow-sm"
              >
                {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="p-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800/60 transition-colors"
                title="Show QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Username handle */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-slate-400">Handle:</span>
            <span className="font-mono text-slate-200 font-semibold">@{user.username}</span>
          </div>

          {/* 3. Display Name */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-slate-400">Display Name:</span>
            <span className="text-slate-200 font-semibold">{user.displayName}</span>
          </div>
        </div>

        {/* Editing Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Edit Profile Info
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Username (@handle)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
                maxLength={20}
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Letters, numbers, underscores (3-20 characters)
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Bio / Status</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={160}
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Quick avatar seeds */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Choose Avatar Style</label>
              <div className="flex items-center gap-2">
                {['robot1', 'cyber_naim', 'gamer_x', 'pixel_pro', 'future_ai'].map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => handleAvatarPreset(seed)}
                    className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700 hover:ring-purple-500 transition-all hover:scale-105"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`}
                      alt={seed}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-600/30"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* Profile Details Cards */
          <div className="space-y-3">
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Bio</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5">{user.bio || 'No bio provided'}</p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Account Status</span>
                <span className="capitalize font-semibold text-emerald-500">{user.accountStatus}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Quick User Switcher for Local Multitesting */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Switch Test Profile (Multi-User Simulator)
          </span>
          <p className="text-[11px] text-slate-400 mb-3">
            Instantly switch accounts to test real-time chats, video calls, and permission rules:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {allUsers.map((u) => (
              <button
                key={u.uid}
                onClick={() => switchUser(u.uid)}
                className={`p-2 rounded-xl border text-left text-xs flex items-center gap-2 transition-all ${
                  u.uid === user.uid
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                }`}
              >
                <img
                  src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                  alt={u.displayName}
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <span className="truncate font-medium">{u.displayName.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout and Account Deletion Actions */}
        <div className="pt-2 space-y-2">
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete your ConnectX account? This action is irreversible.')) {
                deleteAccount();
              }
            }}
            className="w-full py-2 text-red-500 hover:text-red-600 text-xs text-center hover:underline"
          >
            Delete Account Permanently
          </button>
        </div>
      </div>

      {/* QR Code Modal for Public ID */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Your ConnectX QR Code</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated QR visual */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=cx://user/${user.publicId}`}
                alt="ConnectX Public ID QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <div className="text-center font-mono">
              <span className="text-xs text-slate-400 block">Share to connect instantly:</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{user.publicId}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
