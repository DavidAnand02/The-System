import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';

interface SoundContextType {
  playClick: () => void;
  playLevelUp: () => void;
  playSuccess: () => void;
  playError: () => void;
  playNotification: () => void;
  setVolume: (volume: number) => void;
  volume: number;
  isMuted: boolean;
  toggleMute: () => void;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
  triggerScreenShake: () => void;
  triggerGlowPulse: () => void;
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SOUNDS = {
  CLICK: 'https://zbjavsogrdsvhrhkndgc.supabase.co/storage/v1/object/public/sfx-audio/click.mp3',
  LEVEL_UP: 'https://zbjavsogrdsvhrhkndgc.supabase.co/storage/v1/object/public/sfx-audio/levelup.wav',
  SUCCESS: 'https://zbjavsogrdsvhrhkndgc.supabase.co/storage/v1/object/public/sfx-audio/success.wav',
  ERROR: 'https://zbjavsogrdsvhrhkndgc.supabase.co/storage/v1/object/public/sfx-audio/error.mp3',
  NOTIFICATION: 'https://zbjavsogrdsvhrhkndgc.supabase.co/storage/v1/object/public/sfx-audio/notification.mp3',
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('system_volume');
    return saved ? parseFloat(saved) : 0.5;
  });

  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('system_sfx_muted');
    return saved === 'true';
  });

  const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
    const saved = localStorage.getItem('system_music_playing');
    return saved === 'true';
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const triggerScreenShake = useCallback(() => {
    document.body.classList.remove('screen-shake');
    void document.body.offsetWidth; // trigger reflow
    document.body.classList.add('screen-shake');
    setTimeout(() => {
      document.body.classList.remove('screen-shake');
    }, 500);
  }, []);

  const triggerGlowPulse = useCallback(() => {
    const glow = document.createElement('div');
    glow.className = 'full-screen-glow';
    document.body.appendChild(glow);
    setTimeout(() => {
      document.body.removeChild(glow);
    }, 1000);
  }, []);

  const toggleMusic = useCallback(() => {
    setIsMusicPlaying(prev => {
      const next = !prev;
      localStorage.setItem('system_music_playing', next.toString());
      return next;
    });
  }, []);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const isUnlocked = useRef(false);

  const [isUnlockedState, setIsUnlockedState] = useState(false);

  useEffect(() => {
    // Preload sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = url;
      audio.preload = 'auto';
      audio.load();
      audioRefs.current[key] = audio;
    });

    // Audio unlocking for mobile/strict browsers
    const unlock = () => {
      if (isUnlocked.current) return;
      Object.values(audioRefs.current).forEach((audio: HTMLAudioElement) => {
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(() => {});
      });
      isUnlocked.current = true;
      setIsUnlockedState(true);
      console.log('Audio System Unlocked');
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    localStorage.setItem('system_volume', v.toString());
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('system_sfx_muted', next.toString());
      console.log('SFX Muted:', next);
      return next;
    });
  }, []);

  const playSound = useCallback((key: keyof typeof SOUNDS) => {
    if (isMuted) {
      console.log('SFX skipped (muted):', key);
      return;
    }
    
    console.log('Playing SFX:', key);
    const audio = audioRefs.current[key];
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(e => {
        console.warn('SFX play failed for ' + key + ':', e.message);
        // Fallback: try to create a new one if the preloaded one failed
        const fallback = new Audio();
        fallback.crossOrigin = 'anonymous';
        fallback.src = SOUNDS[key];
        fallback.volume = volume;
        fallback.play().catch(() => {});
      });
    } else {
      console.warn('SFX audio object not found for:', key);
      // Fallback
      const fallback = new Audio();
      fallback.crossOrigin = 'anonymous';
      fallback.src = SOUNDS[key];
      fallback.volume = volume;
      fallback.play().catch(() => {});
    }
  }, [volume, isMuted]);

  const lastClickTime = useRef(0);

  const playClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < 50) return;
    lastClickTime.current = now;
    playSound('CLICK');
  }, [playSound]);
  const playLevelUp = useCallback(() => {
    playSound('LEVEL_UP');
    triggerGlowPulse();
  }, [playSound, triggerGlowPulse]);

  const playSuccess = useCallback(() => {
    playSound('SUCCESS');
    triggerGlowPulse();
  }, [playSound, triggerGlowPulse]);

  const playError = useCallback(() => {
    playSound('ERROR');
  }, [playSound]);
  const playNotification = useCallback(() => playSound('NOTIFICATION'), [playSound]);

  // Global click listener
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Check if the clicked element or any of its parents have the opt-out attribute
      const target = e.target as HTMLElement;
      if (target.closest('[data-no-click-sound]')) {
        return;
      }
      
      playClick();
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, [playClick]);

  return (
    <SoundContext.Provider value={{ 
      playClick, 
      playLevelUp, 
      playSuccess, 
      playError, 
      playNotification,
      setVolume,
      volume,
      isMuted,
      toggleMute,
      isMusicPlaying,
      toggleMusic,
      triggerScreenShake,
      triggerGlowPulse,
      isSyncing,
      setIsSyncing
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
