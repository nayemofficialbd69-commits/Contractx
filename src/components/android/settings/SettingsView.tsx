import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useChat } from '../../../context/ChatContext';
import { StorageService } from '../../../services/storageService';
import {
  Moon,
  Sun,
  Shield,
  Bell,
  Wifi,
  Radio,
  DownloadCloud,
  CheckCircle2,
  Trash2,
  Info,
  Smartphone,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOffline, toggleOfflineMode, pendingQueueCount } = useChat();

  const [readReceipts, setReadReceipts] = useState(user?.privacy.readReceipts ?? true);
  const [lastSeenVis, setLastSeenVis] = useState(user?.privacy.lastSeenVisibility ?? 'everyone');
  const [whoCanFind, setWhoCanFind] = useState(user?.privacy.whoCanFindByPublicId ?? 'everyone');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleToggleReadReceipts = async () => {
    const updated = !readReceipts;
    setReadReceipts(updated);
    if (user) {
      await updateProfile({
        privacy: { ...user.privacy, readReceipts: updated },
      });
    }
  };

  const handleChangeLastSeen = async (val: 'everyone' | 'contacts' | 'nobody') => {
    setLastSeenVis(val);
    if (user) {
      await updateProfile({
        privacy: { ...user.privacy, lastSeenVisibility: val },
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500">Preferences, privacy & offline options</p>
      </div>

      <div className="p-4 space-y-4">
        {/* 1. Theme Configuration */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-purple-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <span className="font-semibold text-sm block">Dark Theme</span>
                <span className="text-[11px] text-slate-500">Material 3 adaptive design</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                theme === 'dark' ? 'bg-purple-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Privacy & Security */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Shield className="w-4 h-4" />
            <span>Privacy Controls</span>
          </div>

          {/* Read Receipts */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-xs block">Read Receipts</span>
              <span className="text-[10px] text-slate-500">
                Show double blue/purple ticks when messages are read
              </span>
            </div>
            <button
              onClick={handleToggleReadReceipts}
              className={`w-11 h-5 rounded-full transition-colors p-0.5 ${
                readReceipts ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                  readReceipts ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Last Seen Visibility */}
          <div>
            <span className="font-medium text-xs block mb-1">Who Can See My Last Seen</span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(['everyone', 'contacts', 'nobody'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChangeLastSeen(opt)}
                  className={`py-1.5 rounded-xl capitalize font-medium transition-colors ${
                    lastSeenVis === opt
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Offline Support & Nearby Messaging */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Radio className="w-4 h-4" />
            <span>Offline & Nearby P2P Engine</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-xs block">Offline Simulation Mode</span>
              <span className="text-[10px] text-slate-500">
                Queue outgoing messages locally with clock icon
              </span>
            </div>
            <button
              onClick={toggleOfflineMode}
              className={`w-11 h-5 rounded-full transition-colors p-0.5 ${
                isOffline ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                  isOffline ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {pendingQueueCount > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <span>{pendingQueueCount} messages queued offline</span>
              <span className="text-[10px] font-mono">Will auto-sync on reconnect</span>
            </div>
          )}

          <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200 block">
              Nearby Bluetooth / Wi-Fi Direct Architecture:
            </span>
            <p>
              When disconnected from cellular/internet, ConnectX Android leverages Android Wi-Fi Aware
              (NAN) and Bluetooth Low Energy (BLE) peripheral advertising to form an ad-hoc local mesh.
            </p>
          </div>
        </div>

        {/* 4. App Updates & Version */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                ConnectX Version
              </span>
              <span className="text-[11px] text-slate-500 font-mono">v2.4.0 (Build 24)</span>
            </div>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="px-3 py-1 bg-purple-600/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-medium transition-colors"
            >
              Check Updates
            </button>
          </div>
        </div>

        {/* Reset Demo Data */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm('Reset all chats, users, and settings to original demo state?')) {
                StorageService.resetToDemoDefaults();
                window.location.reload();
              }
            }}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium"
          >
            Reset Application to Initial Seed State
          </button>
        </div>
      </div>

      {/* App Update Dialog */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Up to Date</h3>
            <p className="text-xs text-slate-500">
              ConnectX Messenger v2.4.0 is running the latest production build with WebRTC Opus audio and STUN signaling.
            </p>
            <button
              onClick={() => setShowUpdateModal(false)}
              className="w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
