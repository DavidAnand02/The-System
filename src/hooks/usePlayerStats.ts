import React, { useMemo } from 'react';
import { PlayerData, StatKey } from '../types';

export function usePlayerStats(
  player: PlayerData,
  setPlayer: React.Dispatch<React.SetStateAction<PlayerData>>
) {
  const actualTotalStats = useMemo(() => {
    return (Object.values(player.stats) as number[]).reduce((a, b) => (a || 0) + (b || 0), 0);
  }, [player.stats]);

  const updateStat = (key: StatKey, delta: number) => {
    setPlayer(prev => {
      const newStats = {
        ...prev.stats,
        [key]: Math.max(1, prev.stats[key] + delta)
      };
      const newLastStatIncrease = { ...(prev.lastStatIncrease || {}) };
      if (delta > 0) {
        newLastStatIncrease[key] = new Date().toISOString();
      }
      return { ...prev, stats: newStats, lastStatIncrease: newLastStatIncrease };
    });
  };

  const applyProjection = (simulatedTotal: number) => {
    const currentTotal = actualTotalStats;
    let delta = simulatedTotal - currentTotal;
    if (delta === 0) return;

    setPlayer(prev => {
      const newStats = { ...prev.stats };
      const newLastStatIncrease = { ...(prev.lastStatIncrease || {}) };
      const statKeys = Object.values(StatKey);
      const now = new Date().toISOString();

      const step = delta > 0 ? 1 : -1;
      let iterations = Math.abs(delta);
      let safeguard = 0;
      
      while (iterations > 0 && safeguard < 2000) {
        for (const key of statKeys) {
          if (iterations <= 0) break;
          if (step === -1 && newStats[key] <= 1) continue;
          
          newStats[key] += step;
          if (step > 0) {
            newLastStatIncrease[key] = now;
          }
          iterations -= 1;
        }
        safeguard++;
        if (step === -1 && statKeys.every(k => newStats[k] <= 1)) break;
      }

      return { ...prev, stats: newStats, lastStatIncrease: newLastStatIncrease };
    });
  };

  return {
    actualTotalStats,
    updateStat,
    applyProjection
  };
}
