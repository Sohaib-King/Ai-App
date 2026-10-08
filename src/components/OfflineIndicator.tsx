import React, { useEffect, useState } from 'react';
import { WifiOff, Zap } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 text-slate-950 px-3 py-1.5 text-xs font-semibold shadow-xl border border-amber-400 backdrop-blur animate-fade-in">
      <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
      <WifiOff className="w-3.5 h-3.5" />
      <span>Device Offline — Aura Local 0ms Engine Active</span>
    </div>
  );
};
