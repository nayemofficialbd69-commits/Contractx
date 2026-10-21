import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, ShieldAlert } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('09:41');
  const { isOffline } = useChat();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-7 px-6 flex items-center justify-between text-xs font-semibold select-none shrink-0 z-30 pt-1">
      <div className="flex items-center gap-1.5">
        <span className="tracking-tight">{time}</span>
        {isOffline && (
          <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1 py-0.2 rounded flex items-center gap-0.5">
            <ShieldAlert className="w-2.5 h-2.5" /> Offline
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-current opacity-80">
        <Volume2 className="w-3 h-3" />
        <span className="text-[10px] font-bold">5G</span>
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px]">98%</span>
          <Battery className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
