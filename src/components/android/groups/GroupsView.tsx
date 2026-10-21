import React, { useState } from 'react';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import { Conversation } from '../../../types/chat';
import { Layers, Plus, Users, ArrowRight, X, Shield, Sparkles } from 'lucide-react';

interface GroupsViewProps {
  onSelectGroup: (conv: Conversation) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({ onSelectGroup }) => {
  const { conversations, createGroupChat } = useChat();
  const { user, allUsers } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const groupConversations = conversations.filter((c) => c.type === 'group');
  const availableUsers = allUsers.filter((u) => u.uid !== user?.uid);

  const toggleSelectMember = (uid: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const newGroup = createGroupChat(
      groupName.trim(),
      selectedMemberIds,
      undefined,
      groupDescription.trim() || undefined
    );

    setShowCreateModal(false);
    setGroupName('');
    setGroupDescription('');
    setSelectedMemberIds([]);
    onSelectGroup(newGroup);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Communities & Groups</h1>
          <p className="text-xs text-slate-500">Encrypted multi-user group channels</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Group</span>
        </button>
      </div>

      {/* Groups List */}
      <div className="flex-1 p-4 space-y-3">
        {groupConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No active groups</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Create a group to chat, share media, and collaborate with your team.
            </p>
          </div>
        ) : (
          groupConversations.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className="p-3.5 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:border-purple-500/50 cursor-pointer transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    group.groupMeta?.photoURL ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${group.groupMeta?.name}`
                  }
                  alt={group.groupMeta?.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-1 ring-purple-500/30 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {group.groupMeta?.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {group.groupMeta?.description || `${group.participantIds.length} members`}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
                    <Users className="w-3 h-3" />
                    <span>{group.participantIds.length} members</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Create New Group</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="flex-1 flex flex-col overflow-hidden pt-3 space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Android Core Team"
                  required
                  className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Purpose of this group"
                  className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                <label className="text-xs text-slate-400 block mb-1.5">
                  Select Members ({selectedMemberIds.length})
                </label>
                <div className="space-y-1.5">
                  {availableUsers.map((u) => {
                    const isSelected = selectedMemberIds.includes(u.uid);
                    return (
                      <div
                        key={u.uid}
                        onClick={() => toggleSelectMember(u.uid)}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer border text-xs transition-colors ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300'
                            : 'bg-slate-100/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                            alt={u.displayName}
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-semibold block leading-tight">{u.displayName}</span>
                            <span className="text-[10px] opacity-75 font-mono">@{u.username}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-transform active:scale-98"
              >
                Create Group Channel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
