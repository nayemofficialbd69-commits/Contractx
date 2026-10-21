import React from 'react';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import { StorageService } from '../../../services/storageService';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';

export const CallsView: React.FC = () => {
  const { callHistory, startCall, isOffline } = useChat();
  const { user } = useAuth();

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Missed';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Calls</h1>
          <p className="text-xs text-slate-500">End-to-end encrypted WebRTC audio & video</p>
        </div>
      </div>

      {/* Call History List */}
      <div className="flex-1 p-4 divide-y divide-slate-100 dark:divide-slate-800/40">
        {callHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <Phone className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No call history</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Tap the phone or video icon in any chat to start a WebRTC call.
            </p>
          </div>
        ) : (
          callHistory.map((call) => {
            const isOutgoing = call.callerId === user?.uid;
            const peerId = isOutgoing ? call.receiverId : call.callerId;
            const peer = StorageService.getUserById(peerId);

            return (
              <div key={call.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={peer?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${peer?.username || 'user'}`}
                    alt={peer?.displayName}
                    className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                      {peer?.displayName || 'Unknown Peer'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                      {call.status === 'missed' ? (
                        <PhoneMissed className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      ) : isOutgoing ? (
                        <PhoneOutgoing className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      ) : (
                        <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                      <span>{formatDuration(call.durationSeconds)}</span>
                      <span>·</span>
                      <span>{new Date(call.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => peer && startCall(peer.uid, 'audio')}
                    disabled={isOffline}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors disabled:opacity-40"
                    title="Call again"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => peer && startCall(peer.uid, 'video')}
                    disabled={isOffline}
                    className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors disabled:opacity-40"
                    title="Video call again"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
