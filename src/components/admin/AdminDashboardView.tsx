import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { UserProfile } from '../../types/user';
import {
  Users,
  Shield,
  Sliders,
  Bell,
  Activity,
  Search,
  UserX,
  UserCheck,
  AlertTriangle,
  HardDrive,
  LogOut,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Video,
  Mic,
  Share2,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    adminUser,
    adminLogout,
    metrics,
    users,
    config,
    updateFeatureConfig,
    suspendUser,
    restoreUser,
    reports,
    resolveReport,
    announcements,
    createAnnouncement,
    auditLogs,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'features' | 'announcements' | 'audit'>('metrics');

  // User search & suspend states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [suspendingUser, setSuspendingUser] = useState<UserProfile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annSeverity, setAnnSeverity] = useState<'info' | 'warning' | 'critical'>('info');

  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.publicId.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const handleConfirmSuspend = () => {
    if (!suspendingUser || !suspensionReason.trim()) return;
    suspendUser(suspendingUser.uid, suspensionReason);
    setSuspendingUser(null);
    setSuspensionReason('');
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    createAnnouncement(annTitle.trim(), annContent.trim(), annSeverity);
    setAnnTitle('');
    setAnnContent('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)] overflow-hidden">
      {/* Admin Dashboard Sub-Header */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">ConnectX Security & Admin Console</h1>
            <p className="text-xs text-slate-400">Authenticated as {adminUser?.email || 'admin@connectx.local'}</p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'metrics' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'features' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Remote Config
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'announcements' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'audit' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>

        <button
          onClick={adminLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        {/* 1. METRICS OVERVIEW */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 block">Total Registered Users</span>
                <span className="text-3xl font-bold font-mono text-white mt-1 block tabular-nums">
                  {metrics.totalUsers}
                </span>
                <span className="text-[11px] text-emerald-400 mt-2 block">100% Unique Public IDs</span>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 block">Active Users Today</span>
                <span className="text-3xl font-bold font-mono text-white mt-1 block tabular-nums">
                  {metrics.activeToday}
                </span>
                <span className="text-[11px] text-blue-400 mt-2 block">Real-time WebSocket presence</span>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 block">Suspended Accounts</span>
                <span className="text-3xl font-bold font-mono text-red-400 mt-1 block tabular-nums">
                  {metrics.suspendedUsers}
                </span>
                <span className="text-[11px] text-slate-500 mt-2 block">Moderation enforcement</span>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 block">Storage Usage</span>
                <span className="text-3xl font-bold font-mono text-purple-400 mt-1 block tabular-nums">
                  {metrics.storageUsageMB} MB
                </span>
                <span className="text-[11px] text-slate-400 mt-2 block">Cloud Storage Bucket</span>
              </div>
            </div>

            {/* Service Health Card */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="font-semibold text-sm text-slate-200">System Health & Infrastructure</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span>Firebase Auth & Tokens</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span>Cloud Firestore (ABAC)</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span>WebRTC STUN / TURN</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 24ms Latency
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search by Public ID (CX-...), Username, or Email..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">User & Handle</th>
                    <th className="px-4 py-3">Public ID Code</th>
                    <th className="px-4 py-3">Email / Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                            alt={u.displayName}
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <span className="font-semibold block text-white">{u.displayName}</span>
                            <span className="text-[11px] text-purple-400 font-mono">@{u.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-300">
                        {u.publicId}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        <span>{u.email || u.phoneNumber || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.accountStatus === 'suspended' ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-semibold">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.accountStatus === 'suspended' ? (
                          <button
                            onClick={() => restoreUser(u.uid)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-colors"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendingUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600 hover:text-white transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. REMOTE CONFIG & FEATURE MANAGEMENT */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5">
              <div>
                <h3 className="font-bold text-base text-white">Firebase Remote Config & Feature Flags</h3>
                <p className="text-xs text-slate-400">
                  Control real-time client features dynamically without redeploying APK binary
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Audio Calls */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="font-semibold text-xs block">WebRTC Audio Calls</span>
                      <span className="text-[11px] text-slate-500">Enable peer-to-peer audio streams</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.audioCallsEnabled}
                    onChange={(e) => updateFeatureConfig({ audioCallsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>

                {/* Video Calls */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="font-semibold text-xs block">WebRTC Video Calls</span>
                      <span className="text-[11px] text-slate-500">Enable camera transmission</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.videoCallsEnabled}
                    onChange={(e) => updateFeatureConfig({ videoCallsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>

                {/* Screen Sharing */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="font-semibold text-xs block">MediaProjection Screen Share</span>
                      <span className="text-[11px] text-slate-500">Allow users to stream device display</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.screenSharingEnabled}
                    onChange={(e) => updateFeatureConfig({ screenSharingEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>

                {/* Voice Messages */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-xs block">Audio Voice Notes</span>
                      <span className="text-[11px] text-slate-500">Waveform recording & preview</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.voiceMessagesEnabled}
                    onChange={(e) => updateFeatureConfig({ voiceMessagesEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Maintenance Mode & Min Version */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Minimum Required Android Version
                  </label>
                  <input
                    type="text"
                    value={config.minSupportedAppVersion}
                    onChange={(e) => updateFeatureConfig({ minSupportedAppVersion: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-red-950/20 border border-red-900/40 rounded-xl">
                  <div>
                    <span className="font-semibold text-red-300 block">Maintenance Mode</span>
                    <span className="text-[10px] text-red-400">Lock non-admin client logins</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.maintenanceMode}
                    onChange={(e) => updateFeatureConfig({ maintenanceMode: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <form onSubmit={handlePostAnnouncement} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3.5">
              <h3 className="font-bold text-sm text-white">Broadcast Global System Announcement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Title</label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g., Scheduled Maintenance or New Feature"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Severity</label>
                  <select
                    value={annSeverity}
                    onChange={(e) => setAnnSeverity(e.target.value as 'info' | 'warning' | 'critical')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="critical">Critical (Red)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Announcement Body</label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  rows={2}
                  required
                  placeholder="Details to show in client notifications and banner"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Publish Announcement
              </button>
            </form>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Announcements ({announcements.length})
              </h4>
              {announcements.map((a) => (
                <div key={a.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{a.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{a.content}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Posted {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2.5 text-purple-400 whitespace-nowrap">{log.adminEmail}</td>
                    <td className="px-4 py-2.5 font-bold text-white whitespace-nowrap">{log.action}</td>
                    <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{log.targetResource}</td>
                    <td className="px-4 py-2.5 text-slate-400 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspend User Modal */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Suspend ConnectX Account</span>
            </div>

            <p className="text-xs text-slate-300">
              You are about to suspend <strong>{suspendingUser.displayName}</strong> (@{suspendingUser.username}, {suspendingUser.publicId}).
            </p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Reason for Suspension (Required)</label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g., Harassment, spamming uninvited messages, Terms violation"
                rows={3}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSuspendingUser(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                disabled={!suspensionReason.trim()}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
