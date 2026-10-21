import React, { useState } from 'react';
import {
  Shield,
  Users,
  Sliders,
  Bell,
  Search,
  AlertTriangle,
  Lock,
  LogOut,
  CheckCircle2,
  HardDrive,
  Phone,
  Video,
  Mic,
  Share2,
} from 'lucide-react';

interface MockUser {
  uid: string;
  displayName: string;
  username: string;
  publicId: string;
  email: string;
  status: 'active' | 'suspended';
  reason?: string;
  createdAt: string;
}

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'announcements'>('users');
  const [search, setSearch] = useState('');

  // Initial users
  const [users, setUsers] = useState<MockUser[]>([
    {
      uid: 'user_naim_01',
      displayName: 'Mohammad Naim',
      username: 'naim_gamer',
      publicId: 'CX-7K4M9P2Q',
      email: 'naim.gamer@example.com',
      status: 'active',
      createdAt: '2026-09-20',
    },
    {
      uid: 'user_sarah_02',
      displayName: 'Sarah Connor',
      username: 'sarah_c',
      publicId: 'CX-3M8N2V9K',
      email: 'sarah.c@example.com',
      status: 'active',
      createdAt: '2026-09-25',
    },
    {
      uid: 'user_alex_03',
      displayName: 'Dr. Alex Vance',
      username: 'vance_alex',
      publicId: 'CX-9P4W8L1R',
      email: 'alex.vance@example.com',
      status: 'active',
      createdAt: '2026-10-05',
    },
  ]);

  const [features, setFeatures] = useState({
    audioCalls: true,
    videoCalls: true,
    screenSharing: true,
    voiceNotes: true,
    maintenanceMode: false,
    minVersion: '2.0.0',
  });

  const [announcements, setAnnouncements] = useState([
    { id: '1', title: 'ConnectX v2.4 Release', content: 'WebRTC HD audio/video calls now active.' },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey === 'ConnectX-Admin-2026' || accessKey === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Security Credential');
    }
  };

  const toggleSuspend = (uid: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          return {
            ...u,
            status: newStatus,
            reason: newStatus === 'suspended' ? 'Policy violation' : undefined,
          };
        }
        return u;
      })
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-purple-900/40 border border-purple-700/60 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center">ConnectX Admin Console</h1>
          <p className="text-xs text-slate-400 text-center mt-1 mb-6">Enter server admin access key</p>

          {authError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Access Key</label>
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="ConnectX-Admin-2026"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-semibold hover:opacity-90"
            >
              Sign In to Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.publicId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-bold">
            CX
          </div>
          <div>
            <h1 className="font-bold text-base">ConnectX Admin Console</h1>
            <span className="text-[11px] text-purple-400">Authenticated: admin@connectx.local</span>
          </div>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit</span>
        </button>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Navigation tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${
              activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            User Moderation ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${
              activeTab === 'config' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Remote Feature Config
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${
              activeTab === 'announcements' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            System Announcements
          </button>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-md">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Public ID (CX-...), handle, or name..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Public ID</th>
                    <th className="p-3">Handle</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{u.displayName}</td>
                      <td className="p-3 font-mono font-bold text-purple-400">{u.publicId}</td>
                      <td className="p-3 font-mono text-slate-300">@{u.username}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleSuspend(u.uid)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            u.status === 'active'
                              ? 'bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white'
                              : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Feature Flags */}
        {activeTab === 'config' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 max-w-2xl">
            <h2 className="font-bold text-sm">Remote Feature Config (Firebase Remote Config)</h2>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span>Enable WebRTC Audio Calling</span>
                <input
                  type="checkbox"
                  checked={features.audioCalls}
                  onChange={(e) => setFeatures({ ...features, audioCalls: e.target.checked })}
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span>Enable WebRTC Video Calling</span>
                <input
                  type="checkbox"
                  checked={features.videoCalls}
                  onChange={(e) => setFeatures({ ...features, videoCalls: e.target.checked })}
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span>Enable Screen Sharing</span>
                <input
                  type="checkbox"
                  checked={features.screenSharing}
                  onChange={(e) => setFeatures({ ...features, screenSharing: e.target.checked })}
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span>Enable Voice Notes</span>
                <input
                  type="checkbox"
                  checked={features.voiceNotes}
                  onChange={(e) => setFeatures({ ...features, voiceNotes: e.target.checked })}
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Announcements */}
        {activeTab === 'announcements' && (
          <div className="space-y-4 max-w-2xl">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Post Announcement</h3>
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs"
              />
              <textarea
                placeholder="Message content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs resize-none"
              />
              <button
                onClick={() => {
                  if (newTitle && newContent) {
                    setAnnouncements([
                      ...announcements,
                      { id: Date.now().toString(), title: newTitle, content: newContent },
                    ]);
                    setNewTitle('');
                    setNewContent('');
                  }
                }}
                className="px-4 py-2 bg-purple-600 rounded-xl text-xs font-semibold hover:bg-purple-700"
              >
                Broadcast Notice
              </button>
            </div>

            <div className="space-y-2">
              {announcements.map((a) => (
                <div key={a.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <h4 className="font-bold text-sm text-white">{a.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
