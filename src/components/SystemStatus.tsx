import React from 'react';
import { Loader2, WifiOff, AlertTriangle } from 'lucide-react';

interface SystemStatusProps {
  isOffline: boolean;
  isDirty: boolean;
  syncStatus: string;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ isOffline, isDirty, syncStatus }) => {
  return (
    <div className="flex flex-row items-center gap-2 px-2.5 py-1 bg-system-bg-panel border border-system-accent/20 rounded-full backdrop-blur-xl pointer-events-auto transition-all hover:border-system-accent/40 group mb-0.5 w-max">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${isOffline ? 'bg-system-warning text-system-warning' : 'bg-system-accent text-system-accent'}`} />
        <span className="text-[9px] font-orbitron font-bold text-system-text uppercase tracking-widest">
          {isOffline ? 'OFFLINE' : 'ONLINE'}
        </span>
      </div>

      <div className="w-px h-3 bg-system-border/30" />

      {/* Data Status */}
      <div className="flex items-center gap-2">
        {syncStatus === 'syncing' && (
          <>
            <Loader2 className="w-2.5 h-2.5 text-system-accent animate-spin" />
            <span className="text-[9px] font-orbitron font-bold text-system-accent uppercase tracking-widest">SYNCING</span>
          </>
        )}
        {syncStatus === 'saved' && (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[9px] font-orbitron font-bold text-green-500 uppercase tracking-widest">SAVED</span>
          </>
        )}
        {syncStatus === 'error' && (
          <>
            <AlertTriangle className="w-2.5 h-2.5 text-system-error animate-pulse" />
            <span className="text-[9px] font-orbitron font-bold text-system-error uppercase tracking-widest">ERROR</span>
          </>
        )}
        {syncStatus === 'idle' && isDirty && !isOffline && (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-system-warning animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-[9px] font-orbitron font-bold text-system-warning uppercase tracking-widest">PENDING</span>
          </>
        )}
        {syncStatus === 'idle' && !isDirty && (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-[9px] font-orbitron font-bold text-slate-500 uppercase tracking-widest">IDLE</span>
          </>
        )}
      </div>
    </div>
  );
};
