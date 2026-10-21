/**
 * ConnectX WebRTC Call Service
 * Manages RTCPeerConnection, STUN configuration, Camera/Microphone streams,
 * Screen Sharing (getDisplayMedia), and call signaling lifecycle.
 */

export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export interface WebRtcCallbacks {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: Error) => void;
  onScreenShareStopped?: () => void;
}

export class WebRtcService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private isAudioMuted: boolean = false;
  private isVideoMuted: boolean = false;
  private isSharingScreen: boolean = false;
  private callbacks: WebRtcCallbacks = {};

  constructor(callbacks: WebRtcCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: WebRtcCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Initializes local media stream (Audio and optional Video)
   */
  public async initLocalMedia(video: boolean = true): Promise<MediaStream | null> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
      });

      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.localStream);
      }
      return this.localStream;
    } catch (err) {
      console.error('Failed to get media devices:', err);
      // Fallback: If camera was blocked/unavailable, attempt audio only
      if (video) {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (this.callbacks.onLocalStream) {
            this.callbacks.onLocalStream(this.localStream);
          }
          return this.localStream;
        } catch (audioErr) {
          if (this.callbacks.onError) {
            this.callbacks.onError(audioErr as Error);
          }
          return null;
        }
      }
      if (this.callbacks.onError) {
        this.callbacks.onError(err as Error);
      }
      return null;
    }
  }

  /**
   * Creates an RTCPeerConnection with STUN servers
   */
  public createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      this.cleanupPeerConnection();
    }

    const pc = new RTCPeerConnection({
      iceServers: DEFAULT_ICE_SERVERS,
    });

    pc.onconnectionstatechange = () => {
      if (this.callbacks.onConnectionStateChange) {
        this.callbacks.onConnectionStateChange(pc.connectionState);
      }
    };

    pc.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
      });
      if (this.callbacks.onRemoteStream && this.remoteStream) {
        this.callbacks.onRemoteStream(this.remoteStream);
      }
    };

    // Add local tracks if available
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    this.peerConnection = pc;
    return pc;
  }

  /**
   * Toggle local microphone mute
   */
  public toggleAudio(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isAudioMuted = !audioTrack.enabled;
      return !this.isAudioMuted;
    }
    return false;
  }

  /**
   * Toggle local camera stream
   */
  public toggleVideo(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.isVideoMuted = !videoTrack.enabled;
      return !this.isVideoMuted;
    }
    return false;
  }

  /**
   * Start Screen Sharing using getDisplayMedia
   */
  public async startScreenShare(): Promise<MediaStream | null> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const screenTrack = this.screenStream.getVideoTracks()[0];
      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      // Replace local video track with screen track if in active RTCPeerConnection
      if (this.peerConnection) {
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        }
      }

      this.isSharingScreen = true;
      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.screenStream);
      }
      return this.screenStream;
    } catch (err) {
      console.warn('Screen share canceled or failed:', err);
      return null;
    }
  }

  /**
   * Stop Screen Sharing and revert back to camera stream
   */
  public async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }
    this.isSharingScreen = false;

    // Restore camera video track
    if (this.localStream && this.peerConnection) {
      const cameraTrack = this.localStream.getVideoTracks()[0];
      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find((s) => s.track?.kind === 'video');
      if (videoSender && cameraTrack) {
        await videoSender.replaceTrack(cameraTrack);
      }
      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.localStream);
      }
    }

    if (this.callbacks.onScreenShareStopped) {
      this.callbacks.onScreenShareStopped();
    }
  }

  public getAudioMuted(): boolean {
    return this.isAudioMuted;
  }

  public getVideoMuted(): boolean {
    return this.isVideoMuted;
  }

  public getIsSharingScreen(): boolean {
    return this.isSharingScreen;
  }

  public endCall(): void {
    this.stopScreenShare();
    this.cleanupPeerConnection();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }
    this.isAudioMuted = false;
    this.isVideoMuted = false;
  }

  private cleanupPeerConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
