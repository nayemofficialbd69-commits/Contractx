import React, { useState } from 'react';
import { Maximize2, Minimize2, Smartphone } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const { theme } = useTheme();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 min-h-[calc(100vh-65px)] bg-slate-950">
      {/* Frame toolbar control */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Smartphone className="w-3.5 h-3.5 text-purple-400" />
          <span>ConnectX Android Client (Pixel 9 Pro · Jetpack Compose M3)</span>
        </span>
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title={isPhoneFrame ? 'Switch to Full Screen View' : 'Switch to Phone Mockup'}
        >
          {isPhoneFrame ? (
            <>
              <Maximize2 className="w-3 h-3" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3 h-3" />
              <span>Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Device wrapper */}
      <div
        className={`relative transition-all duration-300 flex flex-col overflow-hidden ${
          isPhoneFrame
            ? 'w-full max-w-[420px] h-[850px] max-h-[92vh] rounded-[44px] ring-8 ring-slate-800/80 shadow-2xl shadow-purple-950/40 border border-slate-700/50'
            : 'w-full max-w-4xl h-[88vh] rounded-2xl border border-slate-800 shadow-xl'
        } ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
      >
        {/* Android Punch Hole & Speaker (only in phone frame mode) */}
        {isPhoneFrame && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-black ring-1 ring-slate-800" />
            <div className="w-12 h-1 rounded-full bg-slate-800" />
          </div>
        )}

        {/* Content viewport */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Android Gesture Bar */}
        {isPhoneFrame && (
          <div className="h-4 flex items-center justify-center shrink-0 bg-transparent pb-1">
            <div className="w-32 h-1 rounded-full bg-slate-400/40" />
          </div>
        )}
      </div>
    </div>
  );
};
