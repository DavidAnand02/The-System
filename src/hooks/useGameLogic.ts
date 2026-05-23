import { useMemo } from 'react';
import { PlayerData, Skill, Job, StatKey } from '../types';
import { MAX_SKILL_HOURS } from '../constants';

export const useGameLogic = () => {
  const calculateLevel = (stats: Record<StatKey, number>) => {
    const totalPoints = Object.values(stats).reduce((sum, val) => sum + val, 0);
    return Math.max(1, Math.floor(totalPoints / 10));
  };

  const getSkillLevel = (hours: number) => {
    return Math.min(100, Math.floor((hours / MAX_SKILL_HOURS) * 100));
  };

  const getJobLevel = (hours: number) => {
    return Math.max(1, Math.floor(Math.sqrt(hours || 0)));
  };

  const getProgressToNextLevel = (hours: number) => {
    const L = getJobLevel(hours);
    const start = L === 1 ? 0 : L * L;
    const next = (L + 1) * (L + 1);
    const range = Math.max(1, next - start);
    const currentProgress = Math.max(0, hours - start);
    return (currentProgress / range) * 100;
  };

  return {
    calculateLevel,
    getSkillLevel,
    getJobLevel,
    getProgressToNextLevel,
  };
};
