import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../../context/ChatContext';
import { StorageService } from '../../../services/storageService';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const ActiveCallModal: React.FC = () => {
  const {
    activeCall,
    endCall,
    toggleCallAudio,
    toggleCallVideo,
    toggleScreenShare,
    isAudioMuted,
    isVideoMuted,
    isSharingScreen,
    localMediaStream,
    remoteMediaStream,
  } = useChat();

  const [callDuration, setCallDuration] = useState<number>(0);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const peerId = activeCall?.receiverId;
  const peerUser = peerId ? StorageService.getUserById(peerId) : null;

  // Call timer
  useEffect(() => {
    let interval: number | null = null;
    if (activeCall?.status === 'connected') {
      interval = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall?.status]);

  // Bind local media stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localMediaStream) {
      localVideoRef.current.srcObject = localMediaStream;
    }
  }, [localMediaStream, isSharingScreen]);

  // Bind remote stream or simulate remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteMediaStream) {
      remoteVideoRef.current.srcObject = remoteMediaStream;
    }
  }, [remoteMediaStream]);

  if (!activeCall) return null;

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Background or Remote Video view */}
      <div className="absolute inset-0 bg-slate-900 -z-10 flex items-center justify-center">
        {activeCall.type === 'video' && remoteMediaStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-purple-500/40 shadow-2xl mb-4 relative">
              <img
                src={peerUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${peerUser?.username}`}
                alt={peerUser?.displayName}
                className="w-full h-full object-cover"
              />
              {activeCall.status === 'calling' && (
                <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              {peerUser?.displayName || 'Peer User'}
            </h2>
            <p className="text-xs text-purple-300 font-mono mb-2">
              @{peerUser?.username} · {peerUser?.publicId}
            </p>

            <span className="text-sm font-semibold tracking-wide uppercase text-slate-300">
              {activeCall.status === 'calling'
                ? 'Ringing...'
                : activeCall.status === 'connected'
                ? formatDuration(callDuration)
                : 'Connecting WebRTC...'}
            </span>
          </div>
        )}
      </div>

      {/* Top Bar Status */}
      <div className="p-4 pt-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent text-white">
        <div className="flex items-center gap-2 text-xs bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>WebRTC P2P (STUN Secured)</span>
        </div>

        {isSharingScreen && (
          <div className="flex items-center gap-1.5 text-xs bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            <ScreenShare className="w-3.5 h-3.5" />
            <span>Sharing Screen</span>
          </div>
        )}
      </div>

      {/* Picture-in-Picture Local Camera or Screen stream */}
      {activeCall.type === 'video' && (
        <div className="absolute top-20 right-4 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden ring-2 ring-purple-500/80 shadow-2xl bg-black z-30">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isSharingScreen ? '' : '-scale-x-100'}`}
          />
          {isVideoMuted && !isSharingScreen && (
            <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center text-xs text-slate-400">
              Camera Off
            </div>
          )}
          <span className="absolute bottom-1 left-2 text-[10px] text-white/80 bg-black/50 px-1 rounded">
            {isSharingScreen ? 'Your Screen' : 'You'}
          </span>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="p-6 pb-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col items-center gap-4 z-20">
        <div className="flex items-center gap-4">
          {/* Mute Mic button */}
          <button
            onClick={() => toggleCallAudio()}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
              isAudioMuted
                ? 'bg-red-500 text-white'
                : 'bg-slate-800/90 text-white hover:bg-slate-700'
            }`}
            title={isAudioMuted ? 'Unmute' : 'Mute'}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video Camera button (if video call) */}
          {activeCall.type === 'video' && (
            <button
              onClick={() => toggleCallVideo()}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                isVideoMuted
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-800/90 text-white hover:bg-slate-700'
              }`}
              title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Screen Share button */}
          {activeCall.type === 'video' && (
            <button
              onClick={() => toggleScreenShare()}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                isSharingScreen
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800/90 text-white hover:bg-slate-700'
              }`}
              title={isSharingScreen ? 'Stop Sharing' : 'Share Screen'}
            >
              {isSharingScreen ? (
                <ScreenShareOff className="w-5 h-5" />
              ) : (
                <ScreenShare className="w-5 h-5" />
              )}
            </button>
          )}

          {/* End Call button */}
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-transform active:scale-90"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {activeCall.type === 'video' ? 'WebRTC High-Definition Video' : 'WebRTC Opus HD Audio'}
        </span>
      </div>
    </div>
  );
};
