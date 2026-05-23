import React from 'react';
import { 
  Loader2, 
  LogOut, 
  Download, 
  Upload, 
  WifiOff, 
  Coffee, 
  AlertTriangle,
  Info,
  Play,
  Palette,
  Volume2,
  VolumeX,
  Music,
  ChevronDown,
  Settings,
  LayoutDashboard,
  User,
  Zap,
  Briefcase,
  Sword,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { useSound } from '../contexts/SoundContext';
import { usePlayerStore } from '../store/usePlayerStore';
import { motion, AnimatePresence } from 'motion/react';
import { SystemStatus } from './SystemStatus';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: any) => void;
  isOffline: boolean;
  isDirty: boolean;
  syncStatus: string;
  onSupport: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  onLogout: () => void;
  onStartWalkthrough: () => void;
  navigateTo: (page: any) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'SYSTEM', icon: LayoutDashboard },
  { id: 'status', label: 'STATUS', icon: User },
  { id: 'skills', label: 'SKILLS', icon: Zap },
  { id: 'jobs', label: 'JOBS', icon: Briefcase },
  { id: 'quests', label: 'QUESTS', icon: Sword },
  { id: 'timelog', label: 'LOGS', icon: Clock },
];

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  setCurrentPage,
  isOffline,
  isDirty,
  syncStatus,
  onSupport,
  onExport,
  onImport,
  onDelete,
  onLogout,
  onStartWalkthrough,
  navigateTo
}) => {
  const { 
    volume, 
    setVolume, 
    isMuted, 
    toggleMute, 
    isMusicPlaying, 
    toggleMusic 
  } = useSound();
  
  const themeColor = usePlayerStore(state => state.player.themeColor);
  const setPlayer = usePlayerStore(state => state.setPlayer);
  const [showSystemMenu, setShowSystemMenu] = React.useState(false);
  const [showThemePanel, setShowThemePanel] = React.useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);

  const handleThemeChange = React.useCallback((themeId: string) => {
    setPlayer(prev => ({ ...prev, themeColor: themeId === 'cyan' ? undefined : themeId }));
  }, [setPlayer]);

  React.useEffect(() => {
    const handleOpenMenu = () => setShowSystemMenu(true);
    const handleCloseMenu = () => setShowSystemMenu(false);
    
    window.addEventListener('open-system-menu', handleOpenMenu);
    window.addEventListener('close-system-menu', handleCloseMenu);
    
    return () => {
      window.removeEventListener('open-system-menu', handleOpenMenu);
      window.removeEventListener('close-system-menu', handleCloseMenu);
    };
  }, []);

  const handleNavClick = (id: string) => {
    navigateTo(id);
    setShowSystemMenu(false);
  };

  return (
    <>
      {/* DESKTOP SIDE HUD (Left) */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 z-50 flex-col items-center pt-4 pb-8 border-r border-system-accent/20 bg-system-bg-base/40 backdrop-blur-xl pointer-events-auto overflow-y-auto custom-scrollbar">
        <div className="mb-2 flex-shrink-0">
          <div className="w-12 h-12 border-2 border-system-accent rounded-lg flex items-center justify-center system-border-glow animate-pulse">
            <span className="font-orbitron font-bold text-system-accent text-xl">S</span>
          </div>
        </div>

        <nav id="desktop-nav" className="flex-1 flex flex-col gap-2 pt-0 pb-4">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`group relative flex flex-col items-center justify-center h-20 transition-all duration-300 hover-glitch ${isActive ? 'text-system-accent' : 'text-system-text-muted hover:text-system-accent/70'}`}
              >
                <item.icon className={`w-6 h-6 mb-2 ${isActive ? 'drop-shadow-[0_0_8px_var(--system-accent-glow)]' : ''}`} />
                <span className="font-orbitron text-[9px] font-bold tracking-[0.2em] uppercase">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-system-accent shadow-[0_0_10px_var(--system-accent-glow)] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 flex-shrink-0 flex flex-col gap-4">
          <button 
            id="nav-settings"
            onClick={() => setShowSystemMenu(!showSystemMenu)}
            className={`p-3 rounded-xl border transition-all ${showSystemMenu ? 'bg-system-accent/20 border-system-accent text-system-accent' : 'bg-system-bg-panel border-system-border text-system-text-muted hover:text-system-accent'}`}
          >
            <Settings className={`w-5 h-5 ${showSystemMenu ? 'rotate-90' : ''} transition-transform duration-500`} />
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM HUD */}
      <div id="mobile-nav" className="lg:hidden fixed bottom-0 left-0 right-0 h-16 z-50 bg-system-bg-panel-solid/95 backdrop-blur-2xl border-t border-system-accent/20 flex items-center justify-around px-2 pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-mobile-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 hover-glitch flex-1 min-w-0 ${isActive ? 'text-system-accent' : 'text-system-text-muted'}`}
            >
              <item.icon className={`w-4 h-4 xs:w-5 xs:h-5 ${isActive ? 'drop-shadow-[0_0_8px_var(--system-accent-glow)]' : ''}`} />
              <span className="font-orbitron text-[6px] xs:text-[7px] font-bold tracking-wider uppercase truncate w-full text-center">
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-nav-indicator-mobile"
                  className="absolute bottom-0 w-6 xs:w-8 h-0.5 bg-system-accent shadow-[0_0_10px_var(--system-accent-glow)]"
                />
              )}
            </button>
          );
        })}
        <button 
          id="nav-mobile-settings"
          onClick={() => setShowSystemMenu(!showSystemMenu)}
          className={`flex flex-col items-center gap-1 transition-all hover-glitch flex-1 min-w-0 ${showSystemMenu ? 'text-system-accent' : 'text-system-text-muted'}`}
        >
          <Menu className="w-4 h-4 xs:w-5 xs:h-5" />
          <span className="font-orbitron text-[6px] xs:text-[7px] font-bold tracking-wider uppercase truncate w-full text-center">SYSTEM</span>
        </button>
      </div>

      {/* TOP STATUS HUD (Universal) */}
      <div className="fixed top-0 left-0 right-0 lg:left-24 z-40 h-16 flex items-center justify-between px-4 sm:px-8 pointer-events-none bg-system-bg-base/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-end gap-3">
            <div className="hidden sm:flex flex-col">
              <span className="font-orbitron text-[10px] font-bold text-system-accent tracking-widest uppercase opacity-50 mb-0.5">System Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-system-error animate-pulse' : 'bg-system-success shadow-[0_0_8px_var(--system-success)]'}`} />
                <span className="font-mono text-[10px] text-system-text-muted">{isOffline ? 'OFFLINE' : 'SYNCHRONIZED'}</span>
              </div>
            </div>
            
            <SystemStatus isOffline={isOffline} isDirty={isDirty} syncStatus={syncStatus} />
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-system-bg-panel-solid/95 border border-system-border rounded-lg text-[10px] font-orbitron text-system-text-muted hover:text-system-accent hover:border-system-accent/30 transition-all uppercase tracking-widest backdrop-blur-md hover-glitch"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        </div>
      </div>

      {/* SYSTEM MENU MODAL/OVERLAY */}
      <AnimatePresence>
        {showSystemMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="fixed inset-0 z-[60] overflow-y-auto custom-scrollbar bg-system-bg-base/80 backdrop-blur-xl pointer-events-auto"
          >
            <div className="min-h-full flex items-center justify-center p-4 sm:p-8">
              <div className="w-full max-w-2xl bg-system-bg-panel border-2 border-system-accent/30 rounded-2xl p-6 sm:p-8 system-border-glow scanline-overlay relative">
                <button 
                  onClick={() => setShowSystemMenu(false)}
                  className="absolute top-4 right-4 p-2 text-system-text-muted hover:text-system-accent transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

              <div className="mb-8">
                <h2 className="font-orbitron text-2xl font-bold text-system-accent system-glow tracking-widest uppercase">System Protocols</h2>
                <p className="text-system-text-muted text-xs font-mono mt-1 opacity-70">Core Interface Configuration & Neural Sync</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Interface */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-bold text-system-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5" />
                      Visual Matrix
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cyan', color: 'bg-[#06b6d4]', label: 'CYAN' },
                        { id: 'emerald', color: 'bg-[#34d399]', label: 'EMERALD' },
                        { id: 'amber', color: 'bg-[#fbbf24]', label: 'AMBER' },
                        { id: 'rose', color: 'bg-[#fb7185]', label: 'ROSE' },
                        { id: 'violet', color: 'bg-[#a78bfa]', label: 'VIOLET' },
                        { id: 'blue', color: 'bg-[#60a5fa]', label: 'BLUE' },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${themeColor === theme.id || (!themeColor && theme.id === 'cyan') ? 'border-system-accent bg-system-accent/10 shadow-[0_0_10px_var(--system-accent-muted)]' : 'border-system-border hover:border-system-accent/40 bg-system-bg-panel-solid/95'}`}
                        >
                          <div className={`w-4 h-4 rounded-full ${theme.color} shadow-[0_0_8px_currentColor]`} />
                          <span className="text-[8px] font-orbitron font-bold tracking-widest">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-bold text-system-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5" />
                      Audio Feedback
                    </h3>
                    <div className="bg-system-bg-panel-solid/95 border border-system-border rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={toggleMute}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${isMuted ? 'border-system-error text-system-error bg-system-error/5' : 'border-system-accent/30 text-system-text hover:bg-system-accent/10'}`}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          <span className="text-[10px] font-orbitron font-bold tracking-widest">{isMuted ? 'SFX OFF' : 'SFX ON'}</span>
                        </button>
                        <button 
                          onClick={toggleMusic}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${isMusicPlaying ? 'border-system-accent text-system-accent bg-system-accent/10' : 'border-system-border text-system-text-muted hover:text-system-accent'}`}
                        >
                          <Music className={`w-4 h-4 ${isMusicPlaying ? 'animate-pulse' : ''}`} />
                          <span className="text-[10px] font-orbitron font-bold tracking-widest">{isMusicPlaying ? 'MUSIC ON' : 'MUSIC OFF'}</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-bold text-system-text-muted uppercase tracking-widest">
                          <span>Master Gain</span>
                          <span className="text-system-accent">{Math.round(volume * 100)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01" value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-full h-1 accent-system-accent bg-system-bg-base rounded-full cursor-pointer appearance-none"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Data & System */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-bold text-system-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Neural Data Management
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { onExport(); }}
                        className="flex flex-col items-center gap-2 p-4 bg-system-bg-panel-solid/95 border border-system-border rounded-xl hover:border-system-accent/50 hover:bg-system-accent/5 transition-all group"
                      >
                        <Download className="w-5 h-5 text-system-text-muted group-hover:text-system-accent" />
                        <span className="text-[9px] font-orbitron font-bold tracking-widest text-system-text-muted group-hover:text-system-text">EXPORT PROFILE</span>
                      </button>
                      <label className="flex flex-col items-center gap-2 p-4 bg-system-bg-panel-solid/95 border border-system-border rounded-xl hover:border-system-accent/50 hover:bg-system-accent/5 transition-all group cursor-pointer">
                        <Upload className="w-5 h-5 text-system-text-muted group-hover:text-system-accent" />
                        <span className="text-[9px] font-orbitron font-bold tracking-widest text-system-text-muted group-hover:text-system-text">IMPORT PROFILE</span>
                        <input type="file" accept=".json" onChange={onImport} className="hidden" />
                      </label>
                      <button 
                        onClick={() => { onSupport(); }}
                        className="flex flex-col items-center gap-2 p-4 bg-system-accent/5 border border-system-accent/20 rounded-xl hover:bg-system-accent/10 hover:border-system-accent/40 transition-all group"
                      >
                        <Coffee className="w-5 h-5 text-system-accent" />
                        <span className="text-[9px] font-orbitron font-bold tracking-widest text-system-accent">SUPPORT DEV</span>
                      </button>
                      <button 
                        onClick={() => { onDelete(); }}
                        className="flex flex-col items-center gap-2 p-4 bg-system-error/5 border border-system-error/20 rounded-xl hover:bg-system-error/10 hover:border-system-error/40 transition-all group"
                      >
                        <AlertTriangle className="w-5 h-5 text-system-error" />
                        <span className="text-[9px] font-orbitron font-bold tracking-widest text-system-error">PURGE ACCOUNT</span>
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-bold text-system-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" />
                      System Protocols
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        id="system-menu-manual-btn"
                        onClick={() => { navigateTo('instructions'); setShowSystemMenu(false); }}
                        className="flex items-center gap-3 p-3 bg-system-bg-panel-solid/95 border border-system-border rounded-xl hover:border-system-accent/50 transition-all group"
                      >
                        <Info className="w-4 h-4 text-system-text-muted group-hover:text-system-accent" />
                        <span className="text-[9px] font-orbitron font-bold tracking-widest text-system-text-muted group-hover:text-system-text">MANUAL</span>
                      </button>
                      <button 
                        id="system-menu-guide-btn"
                        onClick={() => { onStartWalkthrough(); setShowSystemMenu(false); }}
                        className="flex items-center gap-3 p-3 bg-system-bg-panel-solid/95 border border-system-border rounded-xl hover:border-system-accent/50 transition-all group"
                      >
                        <Play className="w-4 h-4 text-system-text-muted group-hover:text-system-accent" />
                        <span className="text-[9px] font-orbitron font-bold tracking-widest text-system-text-muted group-hover:text-system-text">GUIDE</span>
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
