import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';
import { StorageService } from '../../../services/storageService';
import { UserProfile } from '../../../types/user';
import { Search, UserPlus, MessageSquare, Copy, Check, Shield, UserX, Sparkles } from 'lucide-react';

interface ContactsViewProps {
  onStartChatWithUser: (targetUser: UserProfile) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onStartChatWithUser }) => {
  const { user, allUsers } = useAuth();
  const { startDirectChat } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Suggested contacts (excluding current user)
  const contactsList = allUsers.filter((u) => u.uid !== user?.uid && u.accountStatus !== 'suspended');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResult(null);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const query = searchQuery.trim();

    // Check if searching by Public ID Code (CX-XXXXXXXX)
    if (query.toUpperCase().startsWith('CX-') || query.length === 11) {
      const found = StorageService.findUserByPublicId(query);
      setSearchResult(found);
    } else {
      // Searching by Username (@username)
      const found = StorageService.findUserByUsername(query);
      setSearchResult(found);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartChat = (target: UserProfile) => {
    startDirectChat(target.uid);
    onStartChatWithUser(target);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 pb-2 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <h1 className="text-xl font-bold tracking-tight mb-3">Contacts & Discovery</h1>

        {/* Discovery Search Form */}
        <form onSubmit={handleSearch} className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by @username or CX-ID (e.g. CX-7K4M9P2Q)..."
            className="w-full pl-9 pr-20 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Find
          </button>
        </form>

        {/* User's own Public ID quick badge */}
        {user && (
          <div className="p-2.5 rounded-xl bg-purple-100/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Your ConnectX Public ID:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300 tracking-wider">
                  {user.publicId}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleCopyId(user.publicId)}
              className="p-1.5 text-purple-600 dark:text-purple-300 hover:bg-purple-200/50 dark:hover:bg-purple-900/50 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
              title="Copy your Public ID"
            >
              {copiedId === user.publicId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === user.publicId ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Result Spotlight (if search executed) */}
      {hasSearched && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-950/20">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2">
            Search Result
          </h2>
          {searchResult ? (
            <div className="p-3 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800/60 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={searchResult.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${searchResult.username}`}
                  alt={searchResult.displayName}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-purple-500"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {searchResult.displayName}
                  </h3>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                    @{searchResult.username}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <span>{searchResult.publicId}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartChat(searchResult)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-transform active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              No ConnectX user found with public ID or username "{searchQuery}".
            </div>
          )}
        </div>
      )}

      {/* Directory of Suggested Contacts */}
      <div className="p-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Network Directory ({contactsList.length})
        </h2>

        <div className="space-y-2.5">
          {contactsList.map((contact) => (
            <div
              key={contact.uid}
              className="p-3 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:border-purple-500/50 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img
                    src={contact.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${contact.username}`}
                    alt={contact.displayName}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  {contact.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate text-slate-900 dark:text-white">
                      {contact.displayName}
                    </span>
                    {contact.isAdmin && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className="text-purple-600 dark:text-purple-400">@{contact.username}</span>
                    <span>·</span>
                    <span className="truncate">{contact.publicId}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  onClick={() => handleCopyId(contact.publicId)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="Copy Public ID"
                >
                  {copiedId === contact.publicId ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleStartChat(contact)}
                  className="p-2 bg-purple-600/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white rounded-xl transition-colors"
                  title="Send Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
