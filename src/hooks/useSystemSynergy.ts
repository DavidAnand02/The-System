import { useMemo } from 'react';
import { PlayerData, StatKey, Job, Title, Belief, Effect, PlayerStats, Skill } from '../types';

export function useSystemSynergy(
  player: PlayerData,
  jobs: Job[],
  titles: Title[],
  beliefs: Belief[],
  skills: Skill[]
) {
  const allEffects = useMemo(() => {
    const global = player.effects.map((e, i) => ({ ...e, origin: 'global' as const, index: i }));
    const jobBased = jobs.flatMap(j => 
      (j.effects || []).map((e, i) => ({ ...e, origin: 'job' as const, index: i, sourceJob: j.title, sourceId: j.id }))
    );
    const titleBased = titles.flatMap(t => 
      (t.effects || []).map((e, i) => ({ ...e, origin: 'title' as const, index: i, sourceTitle: t.name, sourceId: t.id }))
    );
    const beliefBased = beliefs.flatMap(b => 
      (b.effects || []).map((e, i) => ({ ...e, origin: 'belief' as const, index: i, sourceBelief: b.name, sourceId: b.id }))
    );
    const skillBased = skills.flatMap(s => 
      (s.effects || []).map((e, i) => ({ ...e, origin: 'skill' as const, index: i, sourceSkill: s.name, sourceId: s.id }))
    );
    return [...global, ...jobBased, ...titleBased, ...beliefBased, ...skillBased];
  }, [player.effects, jobs, titles, beliefs, skills]);

  const effectiveStats = useMemo(() => {
    const stats = { ...player.stats };
    const equippedJobs = (player.equippedJobs || [player.jobClass]).map(j => j.toLowerCase());
    const equippedTitles = (player.equippedTitles || [player.title]).map(t => t.toLowerCase());
    const equippedBeliefs = (player.equippedBeliefs || [player.belief]).map(b => b.toLowerCase());

    allEffects.forEach(eff => {
      const isJobEff = eff.origin === 'job' && equippedJobs.includes((eff.sourceJob || '').toLowerCase());
      const isTitleEff = eff.origin === 'title' && equippedTitles.includes((eff.sourceTitle || '').toLowerCase());
      const isBeliefEff = eff.origin === 'belief' && equippedBeliefs.includes((eff.sourceBelief || '').toLowerCase());
      const isSkillEff = eff.origin === 'skill'; // Skill effects are always active if they exist
      const isGlobalEff = eff.origin === 'global';

      if (isJobEff || isTitleEff || isBeliefEff || isSkillEff || isGlobalEff) {
        if (eff.statBoosts) {
          eff.statBoosts.forEach(boost => {
            stats[boost.stat] = (stats[boost.stat] || 0) + boost.amount;
          });
        }
      }
    });

    return stats;
  }, [player.stats, player.equippedJobs, player.jobClass, player.equippedTitles, player.title, player.equippedBeliefs, player.belief, allEffects]);

  const actualTotalStats = useMemo(() => {
    return (Object.values(player.stats) as number[]).reduce((a, b) => (a || 0) + (b || 0), 0);
  }, [player.stats]);

  const effectiveTotalStats = useMemo(() => {
    return (Object.values(effectiveStats) as number[]).reduce((a, b) => (a || 0) + (b || 0), 0);
  }, [effectiveStats]);

  const isEffectActive = (effect: Effect, sourceTitleName?: string, sourceJobTitle?: string, sourceBeliefName?: string, sourceSkillName?: string) => {
    const equippedJobs = (player.equippedJobs || [player.jobClass]).map(j => j.toLowerCase());
    const equippedTitles = (player.equippedTitles || [player.title]).map(t => t.toLowerCase());
    const equippedBeliefs = (player.equippedBeliefs || [player.belief]).map(b => b.toLowerCase());
    
    if (sourceJobTitle && equippedJobs.includes(sourceJobTitle.toLowerCase())) return true;
    if (sourceTitleName && equippedTitles.includes(sourceTitleName.toLowerCase())) return true;
    if (sourceBeliefName && equippedBeliefs.includes(sourceBeliefName.toLowerCase())) return true;
    if (sourceSkillName) return true; // Skill effects are always active

    const effectNameLower = effect.name.toLowerCase();
    const effectDescLower = (effect.description || '').toLowerCase();

    return (
      equippedJobs.some(j => j !== '' && (effectNameLower.includes(j) || effectDescLower.includes(j))) ||
      equippedTitles.some(t => t !== '' && (effectNameLower.includes(t) || effectDescLower.includes(t))) ||
      equippedBeliefs.some(b => b !== '' && (effectNameLower.includes(b) || effectDescLower.includes(b)))
    );
  };

  return {
    allEffects,
    effectiveStats,
    actualTotalStats,
    effectiveTotalStats,
    isEffectActive
  };
}
