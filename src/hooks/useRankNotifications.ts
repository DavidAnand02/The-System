import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNotification } from '../contexts/NotificationContext';
import { getRankDetails, RANK_UP_MESSAGES } from '../constants';

export function useRankNotifications() {
  const level = usePlayerStore(state => state.player.level);
  const skills = usePlayerStore(state => state.skills);
  const jobs = usePlayerStore(state => state.jobs);
  const loading = usePlayerStore(state => state.loading);
  const { notify } = useNotification();

  const prevPlayerRankRef = useRef<string | null>(null);
  const prevSkillsRankRef = useRef<Record<string, string>>({});
  const prevJobsRankRef = useRef<Record<string, string>>({});
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (loading) return;

    const playerRank = getRankDetails(level).label;

    if (!isInitialLoadRef.current && prevPlayerRankRef.current && prevPlayerRankRef.current !== playerRank) {
      const ranks = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
      const prevIdx = ranks.indexOf(prevPlayerRankRef.current);
      const currIdx = ranks.indexOf(playerRank);

      if (currIdx > prevIdx && RANK_UP_MESSAGES[playerRank]) {
        const msg = RANK_UP_MESSAGES[playerRank];
        notify('success', `Player ${msg.title}`, msg.message);
      }
    }
    prevPlayerRankRef.current = playerRank;
  }, [level, notify, loading]);

  useEffect(() => {
    if (loading) return;

    const currentSkillsRank: Record<string, string> = {};
    skills.forEach(skill => {
      const rank = getRankDetails(skill.level).label;
      currentSkillsRank[skill.id] = rank;

      const prevRank = prevSkillsRankRef.current[skill.id];
      if (!isInitialLoadRef.current && prevRank && prevRank !== rank) {
        const ranks = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
        const prevIdx = ranks.indexOf(prevRank);
        const currIdx = ranks.indexOf(rank);

        if (currIdx > prevIdx && RANK_UP_MESSAGES[rank]) {
          const msg = RANK_UP_MESSAGES[rank];
          notify('success', `Skill: ${skill.name} - ${msg.title}`, msg.message);
        }
      }
    });
    prevSkillsRankRef.current = currentSkillsRank;
  }, [skills, notify, loading]);

  useEffect(() => {
    if (loading) return;

    const currentJobsRank: Record<string, string> = {};
    jobs.forEach(job => {
      const rank = getRankDetails(job.level).label;
      currentJobsRank[job.id] = rank;

      const prevRank = prevJobsRankRef.current[job.id];
      if (!isInitialLoadRef.current && prevRank && prevRank !== rank) {
        const ranks = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
        const prevIdx = ranks.indexOf(prevRank);
        const currIdx = ranks.indexOf(rank);

        if (currIdx > prevIdx && RANK_UP_MESSAGES[rank]) {
          const msg = RANK_UP_MESSAGES[rank];
          notify('success', `Job: ${job.title} - ${msg.title}`, msg.message);
        }
      }
    });
    prevJobsRankRef.current = currentJobsRank;
  }, [jobs, notify, loading]);

  // Set initial load to false after loading finished, reset to true when loading starts
  useEffect(() => {
    if (loading) {
      isInitialLoadRef.current = true;
    } else {
      // Small delay to ensure all refs are populated from the first run of the effects above
      const timer = setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);
}
