import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import { Conversation, Message, MessageType } from '../../../types/chat';
import { StorageService } from '../../../services/storageService';
import { VoiceRecordBar } from './VoiceRecordBar';
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  Mic,
  Paperclip,
  Smile,
  MapPin,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Clock,
  MoreVertical,
  Reply,
  Edit2,
  Trash2,
  X,
  Play,
  Pause,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface ChatConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
}

export const ChatConversationView: React.FC<ChatConversationViewProps> = ({ conversation, onBack }) => {
  const {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    replyToMessage,
    setReplyToMessage,
    startCall,
    typingStatusText,
    triggerTyping,
    isOffline,
  } = useChat();
  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Audio playback state for voice notes
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const peerId = conversation.participantIds.find((id) => id !== user?.uid);
  const peerUser = peerId ? StorageService.getUserById(peerId) : null;

  const title =
    conversation.type === 'group'
      ? conversation.groupMeta?.name || 'Group Chat'
      : peerUser?.displayName || 'User';

  const avatar =
    conversation.type === 'group'
      ? conversation.groupMeta?.photoURL || 'https://api.dicebear.com/7.x/identicon/svg?seed=group'
      : peerUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${peerUser?.username}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingStatusText]);

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    await sendMessage('text', textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    triggerTyping();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleSaveEdit = (msgId: string) => {
    if (!editText.trim()) return;
    editMessage(msgId, editText);
    setEditingMessageId(null);
    setEditText('');
  };

  // Location sharing with HTML5 Geolocation
  const handleShareCurrentLocation = () => {
    setShowAttachMenu(false);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        sendMessage(
          'location',
          `Shared live GPS pin: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          undefined,
          undefined,
          {
            latitude,
            longitude,
            name: 'Current Location',
            address: `Lat ${latitude.toFixed(4)}, Long ${longitude.toFixed(4)}`,
          }
        );
      },
      () => {
        // Fallback demo coordinates (Googleplex)
        sendMessage(
          'location',
          'Shared location pin: Mountain View, CA',
          undefined,
          undefined,
          {
            latitude: 37.422,
            longitude: -122.0841,
            name: 'Googleplex HQ',
            address: '1600 Amphitheatre Pkwy, Mountain View, CA',
          }
        );
      }
    );
  };

  // File upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      if (isImage) {
        sendMessage('image', file.name, resultUrl);
      } else {
        sendMessage(
          'file',
          file.name,
          resultUrl,
          undefined,
          undefined,
          file.name,
          file.size
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Voice note playback handler
  const handleToggleVoicePlayback = (msgId: string, audioUrl?: string) => {
    if (!audioUrl) return;

    if (playingAudioId === msgId) {
      audioElementRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setPlayingAudioId(null);
      audio.play();
      setPlayingAudioId(msgId);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,application/pdf,text/*"
      />

      {/* Top Header */}
      <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
            title="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative shrink-0">
            <img
              src={avatar}
              alt={title}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            {peerUser?.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate text-slate-900 dark:text-white leading-tight">
              {title}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {conversation.type === 'group'
                ? `${conversation.participantIds.length} members`
                : peerUser?.isOnline
                ? 'Online'
                : 'Last seen recently'}
            </p>
          </div>
        </div>

        {/* Action icons: Audio & Video calls */}
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
          {peerId && (
            <>
              <button
                onClick={() => startCall(peerId, 'audio')}
                disabled={isOffline}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-40"
                title="Start Audio Call (WebRTC)"
              >
                <Phone className="w-4 h-4 text-blue-500" />
              </button>
              <button
                onClick={() => startCall(peerId, 'video')}
                disabled={isOffline}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-40"
                title="Start Video Call & Screen Share (WebRTC)"
              >
                <Video className="w-4 h-4 text-purple-500" />
              </button>
            </>
          )}
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.uid;
          const isEditing = editingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group relative ${isMine ? 'items-end' : 'items-start'}`}
            >
              {/* Quoted reply message snippet */}
              {msg.replyToMessage && (
                <div
                  className={`text-[11px] px-3 py-1 mb-1 rounded-lg border-l-2 border-purple-500 bg-slate-200/70 dark:bg-slate-800/60 max-w-[80%] truncate ${
                    isMine ? 'mr-1 text-slate-300' : 'ml-1 text-slate-400'
                  }`}
                >
                  <span className="font-semibold block text-[10px] text-purple-400">
                    {msg.replyToMessage.senderName}
                  </span>
                  <span className="truncate">{msg.replyToMessage.textSnippet}</span>
                </div>
              )}

              {/* Message Bubble Container */}
              <div className="relative max-w-[85%] sm:max-w-[75%]">
                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm shadow-sm transition-all ${
                    isMine
                      ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  {/* Text Edit Mode */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-2 py-1 bg-black/20 rounded text-white text-xs border border-white/20 focus:outline-none"
                      />
                      <div className="flex justify-end gap-2 text-[10px]">
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-2 py-0.5 bg-black/30 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          className="px-2 py-0.5 bg-white text-purple-900 font-bold rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 1. Voice Message */}
                      {msg.type === 'audio' && (
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <button
                            onClick={() => handleToggleVoicePlayback(msg.id, msg.mediaUrl)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                              isMine ? 'bg-white text-purple-700' : 'bg-purple-600 text-white'
                            } shadow-md`}
                          >
                            {playingAudioId === msg.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1 flex flex-col gap-1">
                            {/* Waveform bars */}
                            <div className="flex items-center gap-0.5 h-6">
                              {[30, 60, 90, 45, 75, 100, 50, 80, 40, 65, 35, 70, 85, 45, 95].map(
                                (h, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 rounded-full ${
                                      isMine ? 'bg-white/80' : 'bg-purple-500'
                                    } ${playingAudioId === msg.id ? 'animate-pulse' : ''}`}
                                    style={{ height: `${h * 0.22}px` }}
                                  />
                                )
                              )}
                            </div>
                            <span className="text-[10px] opacity-75 font-mono">
                              {msg.mediaDuration ? `00:${msg.mediaDuration.toString().padStart(2, '0')}` : 'Voice Note'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 2. Image Attachment */}
                      {msg.type === 'image' && msg.mediaUrl && (
                        <div className="space-y-1">
                          <img
                            src={msg.mediaUrl}
                            alt="Shared media"
                            className="rounded-xl max-h-64 object-cover w-full"
                          />
                          {msg.text && <p className="mt-1">{msg.text}</p>}
                        </div>
                      )}

                      {/* 3. Document / File */}
                      {msg.type === 'file' && (
                        <div className="flex items-center gap-3 p-2 bg-black/10 rounded-xl">
                          <Paperclip className="w-5 h-5 shrink-0 opacity-80" />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold block truncate">{msg.fileName || 'Document'}</span>
                            <span className="text-[10px] opacity-70">
                              {msg.mediaSize ? `${Math.round(msg.mediaSize / 1024)} KB` : 'Attachment'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 4. Location Pin */}
                      {msg.type === 'location' && msg.location && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-semibold">
                            <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{msg.location.name || 'Shared Location'}</span>
                          </div>
                          <p className="text-[11px] opacity-80">{msg.location.address}</p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${msg.location.latitude},${msg.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                              isMine ? 'bg-white text-purple-900' : 'bg-purple-600 text-white'
                            }`}
                          >
                            <span>Open in Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* 5. Standard Text */}
                      {msg.type === 'text' && (
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                      )}
                    </>
                  )}

                  {/* Metadata: timestamp, edited mark, delivery checks */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMine ? 'text-purple-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.isEdited && <span className="italic mr-1">(edited)</span>}
                    <span className="font-mono tabular-nums">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMine && (
                      <span className="ml-0.5">
                        {msg.status === 'local_queued' && <Clock className="w-3 h-3 text-amber-300" />}
                        {msg.status === 'sent' && <Check className="w-3 h-3 text-purple-200" />}
                        {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-purple-200" />}
                        {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-sky-300" />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reaction Badges on Bubble */}
                {msg.reactions.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {msg.reactions.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => reactToMessage(msg.id, r.emoji)}
                        className={`px-1.5 py-0.5 rounded-full text-[11px] border flex items-center gap-1 transition-transform active:scale-90 ${
                          r.userIds.includes(user?.uid || '')
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                            : 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        {r.userIds.length > 1 && (
                          <span className="text-[10px] font-bold">{r.userIds.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Hover / Long-press Context Actions */}
                <div
                  className={`absolute top-0 ${
                    isMine ? '-left-20' : '-right-20'
                  } opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-md transition-opacity z-10`}
                >
                  <button
                    onClick={() => reactToMessage(msg.id, '❤️')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                    title="React Heart"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => reactToMessage(msg.id, '👍')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                    title="React Thumbs Up"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setReplyToMessage(msg)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                  {isMine && msg.type === 'text' && (
                    <button
                      onClick={() => {
                        setEditingMessageId(msg.id);
                        setEditText(msg.text || '');
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isMine && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time Typing indicator banner */}
        {typingStatusText && (
          <div className="flex items-center gap-2 text-xs text-purple-400 italic py-1 animate-pulse">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>{typingStatusText}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner preview if user is replying */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-slate-200/90 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-4 h-4 text-purple-500 shrink-0" />
            <div className="truncate">
              <span className="font-semibold block text-[10px] text-purple-400">
                Replying to {replyToMessage.senderId === user?.uid ? 'yourself' : title}
              </span>
              <span className="text-slate-600 dark:text-slate-300 truncate block">
                {replyToMessage.text || replyToMessage.type}
              </span>
            </div>
          </div>
          <button
            onClick={() => setReplyToMessage(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Recorder Overlay Bar */}
      {isRecordingVoice ? (
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <VoiceRecordBar
            onSendVoiceMessage={(result) => {
              setIsRecordingVoice(false);
              sendMessage('audio', 'Voice message', result.audioUrl, result.durationSeconds);
            }}
            onCancel={() => setIsRecordingVoice(false)}
          />
        </div>
      ) : (
        /* Normal Message Input Bar */
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative">
          {/* Attachment tray menu */}
          {showAttachMenu && (
            <div className="absolute bottom-16 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-30 animate-in fade-in slide-in-from-bottom-2 min-w-44">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowAttachMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-left"
              >
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>Photos & Videos</span>
              </button>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowAttachMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-left"
              >
                <Paperclip className="w-4 h-4 text-indigo-500" />
                <span>Document / File</span>
              </button>
              <button
                onClick={handleShareCurrentLocation}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Current GPS Location</span>
              </button>
            </div>
          )}

          {/* Quick emoji drawer */}
          {showEmojiTray && (
            <div className="absolute bottom-16 left-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 shadow-2xl flex items-center gap-2 z-30 animate-in fade-in slide-in-from-bottom-2 text-lg">
              {['😀', '😂', '🔥', '❤️', '👍', '🎉', '🚀', '✨', '👋'].map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    setInputText((prev) => prev + em);
                    setShowEmojiTray(false);
                  }}
                  className="hover:scale-125 transition-transform"
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl transition-colors"
              title="Add attachment"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowEmojiTray(!showEmojiTray)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl transition-colors hidden sm:block"
              title="Pick emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {inputText.trim() ? (
              <button
                onClick={handleSendText}
                className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md shadow-purple-600/30 transition-transform active:scale-95"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsRecordingVoice(true)}
                className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30 transition-transform active:scale-95"
                title="Record voice message"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
