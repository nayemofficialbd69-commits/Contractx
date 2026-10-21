import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Send, Mic, Play, Pause } from 'lucide-react';
import { AudioRecorderService, VoiceRecordingResult } from '../../../services/audioRecorderService';

interface VoiceRecordBarProps {
  onSendVoiceMessage: (result: VoiceRecordingResult) => void;
  onCancel: () => void;
}

export const VoiceRecordBar: React.FC<VoiceRecordBarProps> = ({ onSendVoiceMessage, onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0.2);
  const [isRecording, setIsRecording] = useState(true);
  const [recordedResult, setRecordedResult] = useState<VoiceRecordingResult | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const recorderRef = useRef<AudioRecorderService | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    recorderRef.current = new AudioRecorderService();
    recorderRef.current.startRecording((sec, level) => {
      setSeconds(sec);
      setCurrentLevel(level);
    });

    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancelRecording();
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const handleStopAndPreview = async () => {
    if (!recorderRef.current) return;
    try {
      const result = await recorderRef.current.stopRecording();
      setIsRecording(false);
      setRecordedResult(result);
    } catch (err) {
      console.error(err);
      onCancel();
    }
  };

  const handleSend = async () => {
    if (isRecording && recorderRef.current) {
      try {
        const result = await recorderRef.current.stopRecording();
        onSendVoiceMessage(result);
      } catch (err) {
        console.error(err);
        onCancel();
      }
    } else if (recordedResult) {
      onSendVoiceMessage(recordedResult);
    }
  };

  const handleTogglePreviewPlay = () => {
    if (!recordedResult) return;
    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(recordedResult.audioUrl);
      audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-purple-950/80 dark:bg-purple-950 border border-purple-800/60 rounded-2xl text-purple-200 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
      {/* Cancel button */}
      <button
        onClick={() => {
          recorderRef.current?.cancelRecording();
          onCancel();
        }}
        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
        title="Discard voice recording"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Recording status & Live waveform animation */}
      <div className="flex-1 flex items-center gap-3 px-2">
        {isRecording ? (
          <>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
              <span>{formatTime(seconds)}</span>
            </div>

            {/* Visualizer bars */}
            <div className="flex-1 flex items-center justify-center gap-1 h-6 overflow-hidden">
              {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35, 85].map((height, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, height * currentLevel * 1.5)}px`,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-3">
            <button
              onClick={handleTogglePreviewPlay}
              className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex-1 h-1.5 bg-purple-900 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-purple-400 rounded-full" />
            </div>
            <span className="text-xs font-mono">{formatTime(recordedResult?.durationSeconds || 0)}</span>
          </div>
        )}
      </div>

      {/* Action: stop & preview or send immediately */}
      <div className="flex items-center gap-1.5">
        {isRecording && (
          <button
            onClick={handleStopAndPreview}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-purple-800/80 hover:bg-purple-700 text-purple-200 transition-colors"
          >
            Review
          </button>
        )}
        <button
          onClick={handleSend}
          className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-95 shadow-md shadow-purple-600/30 transition-transform active:scale-95"
          title="Send voice message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
