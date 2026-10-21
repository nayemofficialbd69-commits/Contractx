/**
 * ConnectX Voice Message Recorder Service
 * Uses HTML5 MediaRecorder and Web Audio API for recording,
 * waveform analysis, preview, and playback.
 */

export interface VoiceRecordingResult {
  blob: Blob;
  audioUrl: string;
  durationSeconds: number;
  waveform: number[];
}

export class AudioRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private waveformData: number[] = [];
  private intervalId: number | null = null;

  public async startRecording(onTick?: (seconds: number, currentLevel: number) => void): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.waveformData = [];

      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.mediaStream);

      // Web Audio API for real-time waveform inspection
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      this.startTime = Date.now();

      if (onTick) {
        this.intervalId = window.setInterval(() => {
          if (this.analyser) {
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength / 255;
            this.waveformData.push(Math.max(0.1, average));
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            onTick(elapsed, average);
          }
        }, 100);
      }

      return true;
    } catch (err) {
      console.error('Failed to access microphone:', err);
      return false;
    }
  }

  public stopRecording(): Promise<VoiceRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

        // Downsample waveform data to 30 sample bars for clean rendering
        const sampledWaveform = this.sampleWaveform(this.waveformData, 30);

        this.cleanup();
        resolve({
          blob: audioBlob,
          audioUrl,
          durationSeconds,
          waveform: sampledWaveform,
        });
      };

      this.mediaRecorder.stop();
    });
  }

  public cancelRecording(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private sampleWaveform(raw: number[], targetCount: number): number[] {
    if (raw.length === 0) {
      return Array(targetCount).fill(0.3);
    }
    if (raw.length <= targetCount) {
      return raw.concat(Array(targetCount - raw.length).fill(0.2));
    }
    const step = raw.length / targetCount;
    const result: number[] = [];
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.floor(i * step);
      result.push(Number(raw[idx].toFixed(2)));
    }
    return result;
  }
}
