import React from 'react';
import { MessageSquare, Users, PhoneCall, Layers, User, Settings } from 'lucide-react';
import { useChat } from '../../../context/ChatContext';

export type AndroidTab = 'chats' | 'contacts' | 'calls' | 'groups' | 'profile' | 'settings';

interface BottomNavigationProps {
  activeTab: AndroidTab;
  onTabChange: (tab: AndroidTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const { unreadTotal } = useChat();

  const tabs: { id: AndroidTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'calls', label: 'Calls', icon: PhoneCall },
    { id: 'groups', label: 'Groups', icon: Layers },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="h-16 px-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-around shrink-0 z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
              isActive
                ? 'text-purple-600 dark:text-purple-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {/* Material 3 active pill background */}
              {isActive && (
                <div className="absolute inset-0 -mx-3 -my-0.5 bg-purple-100 dark:bg-purple-950/60 rounded-full -z-10" />
              )}
              <Icon className="w-5 h-5 transition-transform" />

              {/* Unread badge for chats tab */}
              {tab.id === 'chats' && unreadTotal > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {unreadTotal}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1 whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
