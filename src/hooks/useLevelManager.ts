import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useSound } from '../contexts/SoundContext';
import { getLevelFromStats } from '../constants';

export function useLevelManager() {
  const stats = usePlayerStore(state => state.player.stats);
  const { playLevelUp, playError } = useSound();

  useEffect(() => {
    const totalStats = (Object.values(stats) as number[]).reduce((a, b) => a + b, 0);
    const newLevel = getLevelFromStats(totalStats);
    
    const store = usePlayerStore.getState();
    const currentLevel = store.player.level;
    
    if (newLevel !== currentLevel) {
      const isLevelUp = newLevel > currentLevel;
      const isLevelDown = newLevel < currentLevel;
      
      store.setPlayer(prev => ({ ...prev, level: newLevel }));
      
      if (isLevelUp) {
        playLevelUp();
      } else if (isLevelDown) {
        playError();
      }
    }
  }, [stats, playLevelUp, playError]);
}
