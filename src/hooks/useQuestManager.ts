import { useCallback } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNotification } from '../contexts/NotificationContext';
import { Quest } from '../types';

export function useQuestManager() {
  const { notify } = useNotification();

  const handleQuestOutcome = useCallback((quest: Quest, outcome: 'completed' | 'failed') => {
    if (outcome === 'completed') {
      notify('success', 'Quest Completed', `Congratulations! You have successfully completed "${quest.title}".`);
    }

    const statToUpdate = outcome === 'completed' ? quest.rewardStat : quest.penaltyStat;
    const points = outcome === 'completed' ? quest.rewardPoints : quest.penaltyPoints;

    const newLogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      questId: quest.id,
      questTitle: quest.title,
      outcome,
      timestamp: new Date().toISOString(),
      rewardPoints: outcome === 'completed' ? quest.rewardPoints : undefined,
      rewardStat: outcome === 'completed' ? quest.rewardStat : undefined,
      penaltyPoints: outcome === 'failed' ? quest.penaltyPoints : undefined,
      penaltyStat: outcome === 'failed' ? quest.penaltyStat : undefined,
    };

    const store = usePlayerStore.getState();

    store.setPlayer(prev => {
      const nextStats = { ...prev.stats };
      if (statToUpdate && points) {
        nextStats[statToUpdate] = Math.max(1, prev.stats[statToUpdate] + (outcome === 'completed' ? points : -points));
      }

      return {
        ...prev,
        stats: nextStats,
        lastStatIncrease: outcome === 'completed' && statToUpdate ? {
          ...(prev.lastStatIncrease || {}),
          [statToUpdate]: new Date().toISOString()
        } : prev.lastStatIncrease,
      };
    });

    store.setQuestLog(prev => [newLogEntry, ...prev].slice(0, 100));
    store.setIsDirty(true);
  }, [notify]);

  return { handleQuestOutcome };
}
