import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  PlayerData, 
  Skill, 
  Job, 
  Title,
  Belief,
  Quest, 
  TimelogData,
  TagConfig,
  StatKey
} from './types';
import { 
  INITIAL_STATS, 
  INITIAL_PLAYER_DATA,
  INITIAL_SKILLS,
  INITIAL_JOBS,
  INITIAL_TITLES,
  INITIAL_BELIEFS,
  INITIAL_QUESTS,
  INITIAL_TAG_CONFIGS,
  MAX_SKILL_HOURS
} from './constants';
import { dbService } from './services/db';
import { supabase, isSupabaseConfigured, setSupabaseConfig } from './lib/supabase';
import { usePlayerStore } from './store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useRankNotifications } from './hooks/useRankNotifications';
import { useThemeManager } from './hooks/useThemeManager';
import { useLevelManager } from './hooks/useLevelManager';
import { useAnalytics } from './hooks/useAnalytics';
import { useDataSync } from './hooks/useDataSync';
import { useAuthSession } from './hooks/useAuthSession';
import { useQuestManager } from './hooks/useQuestManager';
import Background from './components/Background';
import BackgroundAudio from './components/BackgroundAudio';
import Auth from './components/Auth';
import Walkthrough from './components/Walkthrough';
import { GlobalModals, GlobalModalsRef } from './components/GlobalModals';
import { Navigation } from './components/Navigation';
import { PageRouter, Page } from './components/PageRouter';
import { 
  ExternalLink, 
  Settings, 
  Loader2
} from 'lucide-react';
import { trackEvent } from './lib/analytics';

import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { SoundProvider } from './contexts/SoundContext';

const App: React.FC = () => {
  return (
    <SoundProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </SoundProvider>
  );
};

const AppContent: React.FC = () => {
  useRankNotifications();
  useThemeManager();
  useLevelManager();
  const { notify } = useNotification();

  const player = usePlayerStore(state => state.player);
  const skills = usePlayerStore(state => state.skills);
  const quests = usePlayerStore(state => state.quests);
  const loading = usePlayerStore(state => state.loading);
  const loadData = usePlayerStore(state => state.loadData);
  const isDirty = usePlayerStore(state => state.isDirty);
  const syncStatus = usePlayerStore(state => state.syncStatus);

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [prevPage, setPrevPage] = useState<Page | null>(null);
  
  useAnalytics(currentPage);

  const modalsRef = useRef<GlobalModalsRef>(null);

  const { session, isOffline } = useAuthSession((userId) => {
    fetchData(userId);
  });
  
  const { saveUserData } = useDataSync(session, isOffline);
  const { handleQuestOutcome } = useQuestManager();

  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrlInput && supabaseKeyInput) {
      setSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    }
  };

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(() => {
    return localStorage.getItem('has_seen_walkthrough') === 'true';
  });

  useEffect(() => {
    if (session && !hasSeenWalkthrough && !loading) {
      // Check if user is new (e.g., level 1 and no custom data)
      if (player.level === 1 && skills.length <= 4 && quests.length <= 2) {
        setShowWalkthrough(true);
      }
    }
  }, [session, hasSeenWalkthrough, loading]);

  const handleCloseWalkthrough = React.useCallback(() => {
    setShowWalkthrough(false);
    setHasSeenWalkthrough(true);
    localStorage.setItem('has_seen_walkthrough', 'true');
  }, []);

  const handleRestartWalkthrough = React.useCallback(() => {
    setShowWalkthrough(true);
  }, []);

  const fetchData = async (userId: string) => {
    const data = await loadData(userId, isOffline);
    const username = data?.player_data?.username || player.username;
    if (!username || username === 'Player') {
      modalsRef.current?.openUsernameModal();
    }
  };

  const navigateTo = React.useCallback((page: Page) => {
    setCurrentPage(prev => {
      setPrevPage(prev);
      return page;
    });
  }, []);

  const goBack = React.useCallback(() => {
    setPrevPage(prev => {
      if (prev) {
        setCurrentPage(prev);
        return null;
      } else {
        setCurrentPage('landing');
        return null;
      }
    });
  }, []);

  const handleLogout = React.useCallback(async () => {
    trackEvent('Auth', 'Logout');
    await supabase.auth.signOut();
    setCurrentPage('landing');
  }, []);

  const handleDeleteAccount = React.useCallback(async () => {
    if (!session) return;
    trackEvent('Auth', 'Delete Account');
    try {
      await dbService.deleteAccount(session.user.id);
      setCurrentPage('landing');
    } catch (err) {
      console.error('Error deleting account:', err);
      throw err;
    }
  }, [session]);



  if (!isSupabaseConfigured) {
    return (
      <div className="relative w-full h-screen overflow-hidden text-system-text selection:bg-system-accent/30">
        <Background />
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-system-bg-panel/80 backdrop-blur-xl border border-system-warning/30 rounded-2xl p-8 system-border-glow">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-system-warning/10 rounded-full flex items-center justify-center mb-4 border border-system-warning/20">
                <Settings className="w-8 h-8 text-system-warning" />
              </div>
              <h2 className="text-2xl font-orbitron font-bold text-system-warning system-glow">CONFIGURATION REQUIRED</h2>
              <p className="text-system-text-muted text-sm mt-2 text-center">
                The System requires Supabase credentials to synchronize your neural data.
              </p>
            </div>
            
            <form onSubmit={handleConfigSubmit} className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-orbitron text-system-text-muted uppercase tracking-widest">Supabase URL</label>
                <input 
                  type="text" 
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-black/40 border border-system-accent/20 rounded-xl px-4 py-2 text-xs text-system-text font-mono focus:border-system-accent/50 transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-orbitron text-system-text-muted uppercase tracking-widest">Anon Key</label>
                <input 
                  type="password" 
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="your-anon-key"
                  className="w-full bg-black/40 border border-system-accent/20 rounded-xl px-4 py-2 text-xs text-system-text font-mono focus:border-system-accent/50 transition-all outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-system-accent text-system-bg-base font-orbitron py-3 rounded-xl transition-all hover:bg-system-accent/80 font-bold text-sm tracking-widest"
              >
                INITIALIZE CONNECTION
              </button>
            </form>

            <div className="space-y-4 bg-system-bg-panel/50 p-4 rounded-lg border border-system-border mb-6">
              <p className="text-xs text-system-text-muted leading-relaxed">
                Alternatively, set these environment variables in your project settings:
              </p>
              <ul className="text-[10px] font-mono text-system-accent space-y-1">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-system-bg-panel hover:bg-system-bg-panel/80 text-white font-orbitron py-3 rounded-lg transition-all border border-system-border flex items-center justify-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                GET SUPABASE KEYS
              </a>
            </div>
            
            <p className="mt-4 text-[10px] text-system-text-muted text-center uppercase tracking-widest">
              System Status: Offline / Awaiting Link
            </p>
          </div>
        </div>
      </div>
    );
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.player) throw new Error("Invalid data format");
        
        // If user is already logged in and has some data, show warning
        const hasExistingData = 
          (player.username && player.username !== 'Player') || 
          player.level > 1 || 
          skills.some(s => s.hours > 0) || 
          quests.some(q => q.streakCount > 0);
        
        if (hasExistingData) {
          modalsRef.current?.openImportConfirm(data);
        } else {
          applyImportedData(data);
        }
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to parse neural data. File may be corrupted.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const applyImportedData = (data: any) => {
    const store = usePlayerStore.getState();
    if (data.player) store.setPlayer(data.player);
    if (data.skills) store.setSkills(data.skills);
    if (data.jobs) store.setJobs(data.jobs);
    if (data.titles) store.setTitles(data.titles);
    if (data.beliefs) store.setBeliefs(data.beliefs);
    if (data.quests) store.setQuests(data.quests);
    if (data.timelog) store.setTimelog(data.timelog);
    if (data.tagConfigs) store.setTagConfigs(data.tagConfigs);
    
    modalsRef.current?.closeUsernameModal();
    store.setIsDirty(true);
    
    // If we have a session, save immediately
    if (session) {
      saveUserData(session.user.id);
    }
    
    alert('Neural Profile Synchronized Successfully.');
  };

  const exportData = () => {
    trackEvent('Data', 'Export');
    const store = usePlayerStore.getState();
    const data = {
      player: store.player,
      skills: store.skills,
      jobs: store.jobs,
      titles: store.titles,
      beliefs: store.beliefs,
      quests: store.quests,
      timelog: store.timelog,
      tagConfigs: store.tagConfigs,
      exportDate: new Date().toISOString(),
      version: '2.5'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural_profile_${store.player.username || 'player'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[10000] bg-system-bg-base flex flex-col items-center justify-center p-6">
        <div className="relative w-64 h-1 bg-system-accent/20 overflow-hidden mb-4">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-system-accent shadow-[0_0_15px_var(--system-accent-glow)]"
          />
        </div>
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xs font-orbitron text-system-accent uppercase tracking-[0.5em] animate-pulse"
        >
          Synchronizing Neural Data
        </motion.div>
        <div className="mt-8 grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <motion.div 
              key={i}
              animate={{ 
                height: [4, 16, 4],
                opacity: [0.2, 1, 0.2]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-1 bg-system-accent"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative w-full h-screen overflow-hidden text-system-text selection:bg-system-accent/30">
        <Background themeColor={player.themeColor} />
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
          <Auth 
            onSuccess={() => {}} 
            onImport={importData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden text-system-text selection:bg-system-accent/30">
      <Background themeColor={player.themeColor} />
      <BackgroundAudio />
      
      {/* Walkthrough Overlay */}
      {showWalkthrough && (
        <Walkthrough 
          onClose={handleCloseWalkthrough} 
          onNavigate={(page) => navigateTo(page as Page)} 
        />
      )}

      {/* Top Bar with Logout & Delete */}
      <Navigation 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOffline={isOffline}
        isDirty={isDirty}
        syncStatus={syncStatus}
        onSupport={() => modalsRef.current?.openSupportModal()}
        onExport={exportData}
        onImport={importData}
        onDelete={() => modalsRef.current?.openDeleteConfirm()}
        onLogout={handleLogout}
        onStartWalkthrough={handleRestartWalkthrough}
        navigateTo={navigateTo}
      />

      <div id="main-content" className="relative z-10 w-full h-full flex flex-col items-center lg:pl-32 lg:pr-8 pb-20 lg:pb-8 p-4 pt-20 md:p-8 md:pt-24 overflow-y-auto custom-scrollbar">
        <div className="w-full mx-auto">
          <PageRouter 
            currentPage={currentPage}
            goBack={goBack}
            handleQuestOutcome={handleQuestOutcome}
            onSupport={() => modalsRef.current?.openSupportModal()}
            navigateTo={navigateTo}
            handleRestartWalkthrough={handleRestartWalkthrough}
          />
        </div>
      </div>

      <GlobalModals 
        ref={modalsRef}
        importData={importData}
        handleDeleteAccount={handleDeleteAccount}
        applyImportedData={applyImportedData}
      />
    </div>
  );
};

export default App;
