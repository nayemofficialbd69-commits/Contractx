import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { Smartphone, Shield, Code2, BookOpen, Sun, Moon, Wifi, WifiOff } from 'lucide-react';

export type AppViewMode = 'app' | 'admin' | 'code' | 'docs';

interface TopBarProps {
  currentView: AppViewMode;
  onSelectView: (view: AppViewMode) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentView, onSelectView }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOffline, toggleOfflineMode } = useChat();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 font-bold text-white text-base">
          CX
        </div>
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
          ConnectX <span className="text-purple-400 font-semibold text-sm">Messenger</span>
        </span>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onSelectView('app')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'app'
              ? 'text-purple-400 font-semibold border-b-2 border-purple-500'
              : 'hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Android App</span>
        </button>

        <button
          onClick={() => onSelectView('admin')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'admin'
              ? 'text-purple-400 font-semibold border-b-2 border-purple-500'
              : 'hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Admin Panel</span>
        </button>

        <button
          onClick={() => onSelectView('code')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'code'
              ? 'text-purple-400 font-semibold border-b-2 border-purple-500'
              : 'hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Android Source</span>
        </button>

        <button
          onClick={() => onSelectView('docs')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'docs'
              ? 'text-purple-400 font-semibold border-b-2 border-purple-500'
              : 'hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Architecture & WebRTC</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action cluster */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Offline Simulation Toggle */}
        <button
          onClick={toggleOfflineMode}
          title={isOffline ? 'Offline Mode Active (Queued messages)' : 'Online Mode Active'}
          className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
            isOffline
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isOffline ? 'Offline Queue' : 'Online'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Download Project ZIP button */}
        <a
          href="/connectx_messenger_full_project.zip"
          download="connectx_messenger_full_project.zip"
          title="Download Complete Android & Admin Project (.ZIP)"
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all active:scale-95 whitespace-nowrap shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="hidden sm:inline">Download ZIP</span>
        </a>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
              alt={user.displayName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-500"
            />
            <span className="text-xs font-medium text-slate-300 hidden sm:inline">{user.displayName}</span>
          </div>
        )}
      </div>
    </header>
  );
};
