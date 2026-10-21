import React, { useState } from 'react';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import { Conversation } from '../../../types/chat';
import { StorageService } from '../../../services/storageService';
import { Search, Plus, Pin, Check, CheckCheck, Clock, ShieldAlert } from 'lucide-react';

interface ChatListViewProps {
  onSelectConversation: (conv: Conversation) => void;
  onOpenNewChatModal: () => void;
}

export const ChatListView: React.FC<ChatListViewProps> = ({ onSelectConversation, onOpenNewChatModal }) => {
  const { conversations } = useChat();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'direct' | 'groups'>('all');

  const filteredConversations = conversations.filter((conv) => {
    if (filterTab === 'direct' && conv.type !== 'direct') return false;
    if (filterTab === 'groups' && conv.type !== 'group') return false;

    if (!searchQuery.trim()) return true;

    if (conv.type === 'group') {
      return conv.groupMeta?.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const peerId = conv.participantIds.find((id) => id !== user?.uid);
      const peer = peerId ? StorageService.getUserById(peerId) : null;
      return (
        peer?.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer?.publicId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.text?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  });

  const getConversationDetails = (conv: Conversation) => {
    if (conv.type === 'group') {
      return {
        title: conv.groupMeta?.name || 'Group Chat',
        avatar: conv.groupMeta?.photoURL || 'https://api.dicebear.com/7.x/identicon/svg?seed=group',
        isOnline: false,
        subtitle: conv.lastMessage?.text || 'Group created',
        time: conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      };
    } else {
      const peerId = conv.participantIds.find((id) => id !== user?.uid);
      const peer = peerId ? StorageService.getUserById(peerId) : null;
      return {
        title: peer?.displayName || 'ConnectX User',
        handle: peer?.username ? `@${peer.username}` : '',
        avatar: peer?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${peer?.username || 'user'}`,
        isOnline: !!peer?.isOnline,
        subtitle: conv.lastMessage?.text || (conv.lastMessage?.type === 'audio' ? '🎤 Voice message' : 'Started conversation'),
        time: conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Top Header */}
      <div className="p-4 pb-2 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Chats</h1>
          <div className="flex items-center gap-2">
            {user?.accountStatus === 'suspended' && (
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Suspended
              </span>
            )}
            <button
              onClick={onOpenNewChatModal}
              className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-purple-600/30"
              title="Start New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats, @username, CX-ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilterTab('all')}
            className={`flex-1 py-1 px-2 rounded-lg transition-all ${
              filterTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTab('direct')}
            className={`flex-1 py-1 px-2 rounded-lg transition-all ${
              filterTab === 'direct'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setFilterTab('groups')}
            className={`flex-1 py-1 px-2 rounded-lg transition-all ${
              filterTab === 'groups'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No conversations yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Tap the button below to search contacts by @username or CX-ID.
            </p>
            <button
              onClick={onOpenNewChatModal}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 shadow-md transition-all"
            >
              Start a Conversation
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const details = getConversationDetails(conv);
            const isLastMsgMine = conv.lastMessage?.senderId === user?.uid;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className="flex items-center gap-3 p-3.5 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 cursor-pointer transition-colors active:bg-slate-200/50 dark:active:bg-slate-800/50"
              >
                {/* Avatar with Online presence dot */}
                <div className="relative shrink-0">
                  <img
                    src={details.avatar}
                    alt={details.title}
                    className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700/50"
                  />
                  {details.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
                  )}
                </div>

                {/* Conversation Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                        {details.title}
                      </span>
                      {conv.isPinned && <Pin className="w-3 h-3 text-purple-500 shrink-0 rotate-45" />}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2 font-mono tabular-nums">
                      {details.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                      {isLastMsgMine && (
                        <span className="shrink-0">
                          {conv.lastMessage?.status === 'local_queued' && (
                            <Clock className="w-3 h-3 text-amber-400 inline" />
                          )}
                          {conv.lastMessage?.status === 'sent' && (
                            <Check className="w-3 h-3 text-slate-400 inline" />
                          )}
                          {conv.lastMessage?.status === 'delivered' && (
                            <CheckCheck className="w-3.5 h-3.5 text-slate-400 inline" />
                          )}
                          {conv.lastMessage?.status === 'read' && (
                            <CheckCheck className="w-3.5 h-3.5 text-purple-400 inline" />
                          )}
                        </span>
                      )}
                      <span className="truncate">{details.subtitle}</span>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-4 text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
