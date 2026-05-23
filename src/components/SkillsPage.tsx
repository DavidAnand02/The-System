import React, { useState, useMemo, useCallback } from 'react';
import { Skill, PlayerData, StatKey, Folder } from '../types';
import { ICONS, MAX_SKILL_HOURS, getRankDetails } from '../constants';
import { Select } from './ui/Select';
import { Search, Folder as FolderIcon, LayoutList, LayoutGrid, ChevronRight, ChevronDown, ChevronUp, Trophy, Settings2, Plus, X, Activity, Edit2, Check, Trash2, Zap, Edit, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useSound } from '../contexts/SoundContext';
import { Badge } from './ui/Badge';
import { SynergyModal } from './modals/SynergyModal';
import { EffectDetailModal } from './modals/EffectDetailModal';

// --- Helper Functions ---


const getLevelInfo = (hours: number = 0) => {
  const level = Math.floor(Math.sqrt(hours));
  const nextLevelHours = Math.pow(level + 1, 2);
  const currentLevelHours = Math.pow(level, 2);
  const progress = ((hours - currentLevelHours) / (nextLevelHours - currentLevelHours)) * 100;
  return { level, progress, nextLevelHours };
};

// --- Sub-components ---

const SkillCard: React.FC<{ skillId: string; isSelected: boolean; onClick: () => void }> = React.memo(({ skillId, isSelected, onClick }) => {
  const skill = usePlayerStore(state => state.skills.find(s => s.id === skillId));
  if (!skill) return null;

  const { level, progress } = getLevelInfo(skill.hours);
  const rank = getRankDetails(level);
  const isNearCompletion = progress > 90;

  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`group relative p-6 lg:p-8 rounded-2xl lg:rounded-3xl border transition-all cursor-pointer overflow-hidden backdrop-blur-xl ${
        isSelected 
          ? 'bg-system-accent/15 border-system-accent shadow-[0_0_40px_rgba(0,255,157,0.15)]' 
          : 'bg-system-bg-panel-solid/95 border-system-accent/10 hover:border-system-accent/30 hover:bg-system-accent/5 shadow-lg'
      }`}
      style={{ '--glow-color': rank.glowColor } as any}
    >
      {/* Rank Badge - Top Left */}
      <div className={`absolute top-0 left-0 px-4 py-1.5 lg:px-5 lg:py-2 rounded-br-2xl font-orbitron text-[9px] lg:text-[10px] font-bold ${rank.color} bg-system-accent/10 border-r border-b border-system-accent/20 z-20 tracking-[0.2em]`}>
        RANK {rank.label}
      </div>

      {/* Icon Background */}
      <div className={`absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity ${rank.color} pointer-events-none`}>
        {skill.type === 'mental' ? <ICONS.Brain size={120} /> : <ICONS.Dumbbell size={120} />}
      </div>

      <div className="mt-10 lg:mt-12 space-y-6 lg:space-y-8 relative z-10">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`font-orbitron text-base lg:text-lg uppercase tracking-tight break-words transition-colors line-clamp-2 ${isSelected ? 'text-system-accent' : 'text-system-text group-hover:text-system-accent'}`}>
              {skill.name}
            </h3>
            <p className="text-[8px] lg:text-[9px] text-system-text-muted uppercase tracking-[0.2em] opacity-60 font-orbitron mt-1 break-words line-clamp-2">
              {skill.description || 'Neural Pathway Active'}
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0 bg-system-accent/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-system-accent/10 min-w-[60px] sm:min-w-[80px]">
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className={`text-xl sm:text-2xl lg:text-4xl font-black font-orbitron ${rank.color} system-glow leading-none tracking-tighter`}>{level}</span>
              <span className="text-[7px] sm:text-[8px] lg:text-[10px] text-system-text-muted font-bold font-orbitron opacity-50">LV</span>
            </div>
            <div className="text-[7px] sm:text-[8px] lg:text-[9px] font-orbitron text-system-accent uppercase tracking-widest mt-0.5 sm:mt-1 opacity-70 whitespace-nowrap">
              {Math.floor(skill.hours)}H MASTERY
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between text-[8px] lg:text-[9px] font-orbitron uppercase tracking-[0.3em]">
            <span className="text-system-text-muted/60">Evolution Protocol</span>
            <span className={`${rank.color} font-bold`}>{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 lg:h-2 bg-system-accent/5 rounded-full overflow-hidden border border-system-accent/10 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full rounded-full ${rank.color.replace('text-', 'bg-')} ${isNearCompletion ? 'animate-pulse-glow' : ''} transition-all duration-1000 ease-out`}
              style={{ 
                boxShadow: isNearCompletion ? `0 0 20px ${rank.glowColor}` : 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Collapsible Details */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-system-accent/10 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-system-accent/5 border border-system-accent/10">
                <div className="text-[8px] text-system-text-muted uppercase font-orbitron mb-1">Total Time</div>
                <div className="text-xs font-orbitron text-system-text">{Math.floor(skill.hours)}H</div>
              </div>
              <div className="p-2.5 rounded-xl bg-system-accent/5 border border-system-accent/10">
                <div className="text-[8px] text-system-text-muted uppercase font-orbitron mb-1">Type</div>
                <div className="text-xs font-orbitron text-system-accent uppercase">{skill.type}</div>
              </div>
            </div>
            
            {skill.rewardConfig?.stats && skill.rewardConfig.stats.length > 0 && (
              <div className="p-3 rounded-xl bg-system-accent/5 border border-system-accent/10">
                <div className="text-[8px] text-system-text-muted uppercase font-orbitron mb-2">Neural Rewards</div>
                <div className="flex flex-wrap gap-2">
                  {skill.rewardConfig.stats.map((rs, i) => (
                    <div key={i} className="px-2 py-1 rounded bg-system-accent/10 border border-system-accent/20 text-[10px] font-orbitron text-system-accent">
                      +{rs.points} {rs.stat}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="flex-1 py-3 bg-system-accent text-system-bg-base hover:brightness-110 rounded-xl text-[10px] font-orbitron font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(var(--system-accent-rgb),0.3)] flex items-center justify-center gap-2"
              >
                <Zap size={12} />
                Deep Interface
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const FolderSkillList: React.FC<{ folderId: string | null; activeTab: string; selectedSkillId: string | null; onSelect: (id: string | null) => void }> = React.memo(({ folderId, activeTab, selectedSkillId, onSelect }) => {
  const skillIds = usePlayerStore(useShallow(state => 
    state.skills.filter(s => (s.folderId || null) === folderId && s.type === activeTab).map(s => s.id)
  ));
  
  if (skillIds.length === 0) {
    return <div className="py-12 text-center text-[11px] text-system-text-muted italic font-orbitron uppercase tracking-[0.3em] border border-dashed border-system-accent/20 rounded-3xl bg-system-accent/5">No neural data in this sector.</div>;
  }
  
  return (
    <>
      {skillIds.map(id => (
        <SkillCard 
          key={id} 
          skillId={id} 
          isSelected={selectedSkillId === id} 
          onClick={() => onSelect(selectedSkillId === id ? null : id)} 
        />
      ))}
    </>
  );
});

const SkillsAnalytics: React.FC = React.memo(() => {
  const skills = usePlayerStore(state => state.skills);
  const folders = usePlayerStore(useShallow(state => state.player.skillFolders || []));

  const { totalPoints, avgMastery } = useMemo(() => {
    let total = 0;
    let totalProgress = 0;
    skills.forEach(s => {
      const { progress } = getLevelInfo(s.hours);
      totalProgress += progress;
      if (s.totalPointsEarned) {
        Object.values(s.totalPointsEarned).forEach(v => {
          if (typeof v === 'number') total += v;
        });
      }
    });
    return {
      totalPoints: total,
      avgMastery: skills.length > 0 ? Math.round(totalProgress / skills.length) : 0
    };
  }, [skills]);

  const timeAllocationData = useMemo(() => {
    const mentalHours = skills.filter(s => s.type === 'mental').reduce((acc, s) => acc + (s.hours || 0), 0);
    const physicalHours = skills.filter(s => s.type === 'physical').reduce((acc, s) => acc + (s.hours || 0), 0);
    
    return [
      { name: 'Mental', value: mentalHours, color: 'var(--system-accent)' },
      { name: 'Physical', value: physicalHours, color: '#f59e0b' }
    ].filter(d => d.value > 0);
  }, [skills]);

  const folderAllocationData = useMemo(() => {
    const folderMap: Record<string, number> = {};
    const uncategorized = skills.filter(s => !s.folderId).reduce((acc, s) => acc + (s.hours || 0), 0);
    
    skills.forEach(s => {
      if (s.folderId) {
        const folder = folders.find(f => f.id === s.folderId);
        const folderName = folder ? folder.name : 'Unknown';
        folderMap[folderName] = (folderMap[folderName] || 0) + (s.hours || 0);
      }
    });

    const data = Object.entries(folderMap).map(([name, value]) => ({ name, value }));
    if (uncategorized > 0) {
      data.push({ name: 'Uncategorized', value: uncategorized });
    }
    return data.sort((a, b) => b.value - a.value);
  }, [skills, folders]);

  const COLORS = ['var(--system-accent)', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="h-full flex flex-col space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4 mb-1 lg:mb-2">
        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-system-accent/10 flex items-center justify-center border border-system-accent/20 shadow-[0_0_40px_rgba(0,255,157,0.1)] backdrop-blur-2xl">
          <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-system-accent system-glow" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl lg:text-4xl font-orbitron text-system-accent uppercase tracking-tighter system-glow">Neural Analytics</h3>
          <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] lg:tracking-[0.3em] font-orbitron text-system-text-muted max-w-xl mx-auto opacity-70 leading-relaxed px-4">Review training distribution and focus areas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left Column: Training Distribution & Focus Areas */}
        <div className="lg:col-span-4 space-y-4 lg:space-y-6">
          {timeAllocationData.length > 0 && (
            <div className="bg-system-bg-panel-solid/95 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-system-accent/10 backdrop-blur-2xl shadow-2xl">
              <h4 className="text-[9px] lg:text-[10px] font-orbitron text-system-text-muted mb-4 lg:mb-6 text-center uppercase tracking-[0.3em] lg:tracking-[0.4em] opacity-60">Training Distribution</h4>
              <div className="h-40 lg:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {timeAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid var(--system-accent)', borderRadius: '24px', fontSize: '12px', fontFamily: 'Orbitron', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`${Math.floor(value)}h`, 'Time']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Orbitron', textTransform: 'uppercase', paddingTop: '30px', opacity: 0.8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {folderAllocationData.length > 0 && (
            <div className="bg-system-bg-panel-solid/95 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-system-accent/10 backdrop-blur-2xl shadow-2xl">
              <h4 className="text-[9px] lg:text-[10px] font-orbitron text-system-text-muted mb-4 lg:mb-6 text-center uppercase tracking-[0.3em] lg:tracking-[0.4em] opacity-60">Focus Areas</h4>
              <div className="h-40 lg:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={folderAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {folderAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid var(--system-accent)', borderRadius: '24px', fontSize: '12px', fontFamily: 'Orbitron', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`${Math.floor(value)}h`, 'Time']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mastery Pulse (Placeholder or Summary Stats) */}
        <div className="lg:col-span-8">
          <div className="bg-system-bg-panel-solid/95 border border-system-accent/10 rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-10 backdrop-blur-2xl h-full flex flex-col justify-center items-center text-center space-y-6 lg:space-y-10 shadow-2xl relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] lg:w-[400px] h-[250px] lg:h-[400px] bg-system-accent rounded-full blur-[50px] lg:blur-[80px]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-12 w-full max-w-2xl relative z-10">
              <div className="space-y-1">
                <span className="text-[9px] lg:text-[10px] text-system-text-muted uppercase font-orbitron tracking-[0.3em] lg:tracking-[0.4em] opacity-60">Avg Mastery</span>
                <div className="text-3xl lg:text-6xl font-black text-system-text tracking-tighter">{avgMastery}%</div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] lg:text-[10px] text-system-text-muted uppercase font-orbitron tracking-[0.3em] lg:tracking-[0.4em] opacity-60">Total Points</span>
                <div className="text-3xl lg:text-6xl font-black text-system-accent tracking-tighter system-glow">{totalPoints}</div>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-system-accent/30 to-transparent max-w-2xl relative z-10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-12 w-full max-w-2xl relative z-10">
              <div className="space-y-1">
                <span className="text-[9px] lg:text-[10px] text-system-text-muted uppercase font-orbitron tracking-[0.3em] lg:tracking-[0.4em] opacity-60">Active Skills</span>
                <div className="text-2xl lg:text-4xl font-bold text-system-text">{skills.length}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] lg:text-[10px] text-system-text-muted uppercase font-orbitron tracking-[0.3em] lg:tracking-[0.4em] opacity-60">Neural Folders</span>
                <div className="text-2xl lg:text-4xl font-bold text-system-accent">{folders.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const SkillDetail: React.FC<{ skillId: string; onClose: () => void }> = React.memo(({ skillId, onClose }) => {
  const skill = usePlayerStore(state => state.skills.find(s => s.id === skillId));
  const setSkills = usePlayerStore(state => state.setSkills);
  const setPlayer = usePlayerStore(state => state.setPlayer);
  const setIsDirty = usePlayerStore(state => state.setIsDirty);
  const folders = usePlayerStore(useShallow(state => state.player.skillFolders || []));
  const { playSuccess, playLevelUp, playError } = useSound();

  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [editSkillName, setEditSkillName] = useState('');
  const [editSkillDesc, setEditSkillDesc] = useState('');
  const [showAddEffectForm, setShowAddEffectForm] = useState(false);
  const [editingEffectIndex, setEditingEffectIndex] = useState<{ type: 'skill'; index: number; sourceId: string } | null>(null);
  const [expandedGrowth, setExpandedGrowth] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!skill) return null;

  const { level, progress, nextLevelHours } = getLevelInfo(skill.hours);
  const rank = getRankDetails(level);
  const totalPercent = Math.min((skill.hours / MAX_SKILL_HOURS) * 100, 100);

  const startEditingSkill = () => {
    setEditSkillName(skill.name);
    setEditSkillDesc(skill.description);
    setIsEditingSkill(true);
  };

  const saveSkillEdit = () => {
    if (!editSkillName.trim()) return;
    setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, name: editSkillName.trim(), description: editSkillDesc.trim() } : s));
    setIsDirty(true);
    setIsEditingSkill(false);
    playSuccess();
  };

  const deleteSkill = () => {
    setSkills(prev => prev.filter(s => s.id !== skill.id));
    setIsDirty(true);
    onClose();
    playSuccess();
  };

  const setHours = (newHours: number) => {
    const clampedHours = Math.max(0, Math.min(newHours, MAX_SKILL_HOURS));
    const oldLevel = getLevelInfo(skill.hours || 0).level;
    const newLevel = getLevelInfo(clampedHours).level;

    if (newLevel !== oldLevel) {
      if (newLevel > oldLevel) {
        playLevelUp();
      } else {
        playError();
      }

      // Handle Player Stats
      if (skill.rewardConfig) {
        const levelDiff = newLevel - oldLevel;
        setPlayer(prev => {
          const newStats = { ...prev.stats };
          const newLastStatIncrease = { ...(prev.lastStatIncrease || {}) };
          skill.rewardConfig!.stats.forEach(rs => {
            newStats[rs.stat] = Math.max(0, newStats[rs.stat] + (rs.points * levelDiff));
            if (levelDiff > 0) {
              newLastStatIncrease[rs.stat] = new Date().toISOString();
            }
          });
          return { ...prev, stats: newStats, lastStatIncrease: newLastStatIncrease };
        });
      }
    } else {
      playSuccess();
    }

    setSkills(prev => prev.map(s => {
      if (s.id !== skill.id) return s;

      const levelDiff = newLevel - oldLevel;
      let newTotals = { ...(s.totalPointsEarned || {}) };
      let newHistory = [...(s.growthHistory || [])];

      if (levelDiff > 0 && s.rewardConfig) {
        // Level Up
        s.rewardConfig.stats.forEach(rs => {
          newTotals[rs.stat] = (newTotals[rs.stat] || 0) + (rs.points * levelDiff);
        });

        for (let i = 1; i <= levelDiff; i++) {
          newHistory.push({
            level: oldLevel + i,
            timestamp: new Date().toISOString(),
            statsGained: s.rewardConfig.stats.map(rs => ({ stat: rs.stat, points: rs.points }))
          });
        }
      } else if (levelDiff < 0 && s.rewardConfig) {
        // Level Down
        s.rewardConfig.stats.forEach(rs => {
          newTotals[rs.stat] = Math.max(0, (newTotals[rs.stat] || 0) + (rs.points * levelDiff));
        });

        newHistory = newHistory.filter(h => h.level <= newLevel);
      }

      return {
        ...s,
        hours: clampedHours,
        level: newLevel,
        lastWorkedAt: new Date().toISOString(),
        totalPointsEarned: newTotals,
        growthHistory: newHistory.slice(-20) // Keep last 20 entries
      };
    }));
    setIsDirty(true);
  };

  const trainSkill = (hoursToAdd: number) => {
    setHours((skill.hours || 0) + hoursToAdd);
  };

  const updateRewardConfig = (updates: Partial<Skill['rewardConfig']>) => {
    setSkills(prev => prev.map(s => {
      if (s.id === skill.id) {
        return {
          ...s,
          rewardConfig: {
            ...s.rewardConfig,
            ...updates
          }
        };
      }
      return s;
    }));
    setIsDirty(true);
    playSuccess();
  };

  const addStatToReward = (stat: StatKey) => {
    const currentStats = skill.rewardConfig?.stats || [];
    if (currentStats.some(s => s.stat === stat)) return;
    updateRewardConfig({ stats: [...currentStats, { stat, points: 1 }] });
  };

  const removeStatFromReward = (stat: StatKey) => {
    const currentStats = skill.rewardConfig?.stats || [];
    updateRewardConfig({ stats: currentStats.filter(s => s.stat !== stat) });
  };

  const updateStatPoints = (stat: StatKey, points: number) => {
    const currentStats = skill.rewardConfig?.stats || [];
    updateRewardConfig({ stats: currentStats.map(s => s.stat === stat ? { ...s, points } : s) });
  };

  const moveSkillToFolder = (folderId: string | null) => {
    setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, folderId: folderId || undefined } : s));
    playSuccess();
  };

  return (
    <>
      <div className="animate-in slide-in-from-right-8 duration-500 h-full flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 sm:mb-8 px-1 sm:px-0 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="px-2.5 sm:px-4 py-1 rounded-full bg-system-accent/10 border border-system-accent/20 text-[7px] sm:text-[9px] font-orbitron text-system-accent uppercase tracking-[0.2em] sm:tracking-[0.3em] backdrop-blur-md whitespace-nowrap">
              {skill.type} PROTOCOL
            </div>
            <Badge variant="outline" className="text-[7px] sm:text-[9px] font-orbitron px-2.5 sm:px-3 py-1 rounded-full border-system-accent/20 text-system-text-muted uppercase tracking-[0.1em] sm:tracking-[0.2em] whitespace-nowrap">
              ID: {skill.id.slice(0, 8)}
            </Badge>
          </div>
          
          {isEditingSkill ? (
            <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4 max-w-2xl">
              <textarea
                value={editSkillName}
                onChange={e => {
                  setEditSkillName(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                className="w-full bg-system-bg-panel-solid/95 border border-system-accent/20 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-2 sm:py-3 text-system-text focus:outline-none focus:border-system-accent font-orbitron text-base sm:text-lg shadow-lg backdrop-blur-xl resize-none overflow-hidden h-auto min-h-[3rem]"
                placeholder="Skill Name"
                rows={1}
                onFocus={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              <textarea
                value={editSkillDesc}
                onChange={e => setEditSkillDesc(e.target.value)}
                className="w-full bg-system-bg-panel-solid/95 border border-system-accent/20 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-system-text focus:outline-none focus:border-system-accent h-24 sm:h-32 resize-none text-xs sm:text-sm leading-relaxed shadow-lg backdrop-blur-xl"
                placeholder="Skill Description"
              />
              <div className="flex gap-2 sm:space-x-3">
                <button onClick={saveSkillEdit} className="flex-1 py-2 sm:py-3 bg-system-accent text-system-bg-base rounded-lg sm:rounded-xl hover:opacity-90 transition-all flex items-center justify-center font-orbitron text-[10px] sm:text-xs tracking-widest shadow-lg">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-2" /> AUTHORIZE
                </button>
                <button onClick={() => setIsEditingSkill(false)} className="flex-1 py-2 sm:py-3 bg-system-bg-panel border border-system-accent/20 text-system-text-muted rounded-lg sm:rounded-xl hover:text-system-text transition-all flex items-center justify-center font-orbitron text-[10px] sm:text-xs tracking-widest shadow-lg">
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-2" /> ABORT
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-orbitron text-system-text uppercase tracking-tighter leading-none system-glow flex items-center group break-words">
                    {skill.name}
                    <button onClick={startEditingSkill} className="ml-2 sm:ml-4 p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 bg-system-bg-panel/40 border border-system-accent/10 rounded-lg sm:rounded-xl transition-all text-system-text-muted hover:text-system-accent shadow-lg">
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </h2>
                </div>
                <div className={`text-base sm:text-xl lg:text-2xl font-black font-orbitron tracking-[0.2em] sm:tracking-[0.3em] ${rank.color} ${rank.glow} shrink-0`}>
                  RANK: {rank.label}
                </div>
              </div>
              <p className="text-xs sm:text-base text-system-text-muted italic font-light leading-relaxed whitespace-pre-wrap max-w-4xl opacity-80 border-l-2 border-system-accent/20 pl-4">{skill.description || 'Neural Pathway Active'}</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={onClose}
          className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-system-bg-panel/40 border border-system-accent/10 text-system-text-muted hover:text-system-accent hover:border-system-accent/40 transition-all shadow-2xl backdrop-blur-xl group shrink-0 ml-4"
        >
          <X size={18} className="sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-1 sm:px-6 custom-scrollbar space-y-4 sm:space-y-6 pb-12">
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Progress & Folder */}
          <div className="col-span-12 lg:col-span-5 space-y-6 sm:space-y-8">
            {/* Progress Section */}
            <div className="bg-system-bg-panel-solid/95 rounded-3xl p-5 sm:p-7 border border-system-accent/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-system-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-system-accent/10 transition-colors" />
              
              <div className="grid grid-cols-2 gap-4 mb-8 relative">
                <div className="p-3 sm:p-4 rounded-2xl bg-system-accent/5 border border-system-accent/10 flex flex-col justify-center min-w-0">
                  <div className="text-[7px] sm:text-[8px] font-orbitron text-system-accent uppercase tracking-[0.3em] opacity-60 mb-1.5 truncate">Current Phase</div>
                  <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-[10px] sm:text-xs font-orbitron text-system-text-muted opacity-40 shrink-0">LV</span>
                    <span className="text-2xl sm:text-4xl font-black font-orbitron text-system-text tracking-tighter leading-none system-glow truncate">{level}</span>
                  </div>
                  <div className={`mt-2 text-[7px] sm:text-[8px] font-orbitron uppercase tracking-[0.2em] ${rank.color} truncate`}>
                    Rank {rank.label}
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 rounded-2xl bg-system-accent/5 border border-system-accent/10 flex flex-col justify-center items-end text-right min-w-0">
                  <div className="text-[7px] sm:text-[8px] font-orbitron text-system-accent uppercase tracking-[0.3em] opacity-60 mb-1.5 truncate">Total Mastery</div>
                  <div className="flex items-baseline gap-1 sm:gap-1.5 min-w-0">
                    <span className="text-2xl sm:text-4xl font-black font-orbitron text-system-text tracking-tighter leading-none truncate">
                      {Math.floor(skill.hours || 0)}
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-orbitron text-system-text-muted uppercase tracking-[0.1em] opacity-40 shrink-0">H</span>
                  </div>
                  <div className="mt-2 text-[7px] sm:text-[8px] font-orbitron text-system-text-muted uppercase tracking-[0.1em] opacity-40 truncate">
                    / {MAX_SKILL_HOURS}H MAX
                  </div>
                </div>
              </div>

              <div className="space-y-6 relative">
                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[7px] sm:text-[8px] font-orbitron text-system-accent uppercase tracking-[0.3em] opacity-60 truncate">Evolution Protocol</div>
                      <div className="text-[9px] sm:text-[10px] font-black font-orbitron text-system-text uppercase tracking-[0.1em] truncate">To Level {level + 1}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg sm:text-xl font-black font-orbitron text-system-accent system-glow leading-none">{Math.floor(progress)}%</div>
                    </div>
                  </div>
                  <div className="relative h-2.5 sm:h-3 bg-system-accent/5 rounded-full border border-system-accent/10 overflow-hidden p-0.5 shadow-inner group/bar">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-system-accent/40 to-system-accent rounded-full shadow-[0_0_10px_rgba(var(--system-accent-rgb),0.5)]"
                    />
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={progress}
                      onChange={(e) => {
                        const newProgress = parseInt(e.target.value) || 0;
                        const currentLevelBaseHours = Math.pow(level, 2);
                        const nextLevelBaseHours = Math.pow(level + 1, 2);
                        const newHours = currentLevelBaseHours + (newProgress / 100) * (nextLevelBaseHours - currentLevelBaseHours);
                        setHours(newHours);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[7px] sm:text-[8px] font-orbitron text-system-accent uppercase tracking-[0.3em] opacity-60 truncate">Neural Stabilization</div>
                      <div className="text-[9px] sm:text-[10px] font-black font-orbitron text-system-text uppercase tracking-[0.1em] truncate">Overall Mastery</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg sm:text-xl font-black font-orbitron text-system-accent system-glow leading-none">{Math.floor(totalPercent)}%</div>
                    </div>
                  </div>
                  <div className="relative h-2.5 sm:h-3 bg-system-accent/5 rounded-full border border-system-accent/10 overflow-hidden p-0.5 shadow-inner group/bar">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${totalPercent}%` }}
                      className="h-full bg-gradient-to-r from-system-accent/40 to-system-accent rounded-full shadow-[0_0_10px_rgba(var(--system-accent-rgb),0.5)]"
                    />
                    <input 
                      type="range"
                      min="0"
                      max={MAX_SKILL_HOURS}
                      step="1"
                      value={skill.hours || 0}
                      onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 relative">
                <button 
                  onClick={() => trainSkill(1)}
                  className="flex-1 relative overflow-hidden group p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-system-bg-panel-solid/40 border border-system-accent/20 hover:border-system-accent/50 transition-all duration-300 shadow-xl flex items-center gap-4"
                >
                  <div className="absolute inset-0 bg-system-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-2 sm:p-3 rounded-lg bg-system-accent/10 border border-system-accent/20 group-hover:bg-system-accent/20 transition-colors">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-system-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-orbitron text-lg sm:text-2xl font-black text-system-text leading-none tracking-tighter">+1H</span>
                    <span className="font-orbitron text-[7px] sm:text-[8px] text-system-accent uppercase tracking-[0.3em] mt-1 truncate w-full opacity-60">Neural Log</span>
                  </div>
                </button>
                <button 
                  onClick={() => trainSkill(5)}
                  className="flex-1 relative overflow-hidden group p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-system-bg-panel-solid/40 border border-system-accent/20 hover:border-system-accent/50 transition-all duration-300 shadow-xl flex items-center gap-4"
                >
                  <div className="absolute inset-0 bg-system-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-2 sm:p-3 rounded-lg bg-system-accent/10 border border-system-accent/20 group-hover:bg-system-accent/20 transition-colors">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-system-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-orbitron text-lg sm:text-2xl font-black text-system-text leading-none tracking-tighter">+5H</span>
                    <span className="font-orbitron text-[7px] sm:text-[8px] text-system-accent uppercase tracking-[0.3em] mt-1 truncate w-full opacity-60">Neural Log</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Folder Assignment */}
            <div className="bg-system-bg-panel-solid/95 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-system-accent/10 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6 text-system-accent" />
                <h3 className="text-xs sm:text-sm font-orbitron text-system-text uppercase tracking-[0.2em] sm:tracking-[0.3em]">Directory Assignment</h3>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <Select
                  value={skill.folderId || "none"}
                  onChange={(e) => moveSkillToFolder(e.target.value === "none" ? null : e.target.value)}
                  className="w-full font-orbitron text-[10px] sm:text-xs bg-system-bg-panel/40 border-system-accent/20 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 focus:border-system-accent transition-all"
                >
                  <option value="none">UNASSIGNED</option>
                  {folders.filter(f => f.type === skill.type).map(f => (
                    <option key={f.id} value={f.id}>{f.name.toUpperCase()}</option>
                  ))}
                </Select>
                <p className="text-[9px] sm:text-[10px] text-system-text-muted uppercase tracking-[0.1em] sm:tracking-[0.2em] font-light italic opacity-60 px-2">
                  Organize this skill into a specific functional directory for better system management.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Rewards & History */}
          <div className="col-span-12 lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Evolution Rewards */}
            <div className="bg-system-bg-panel-solid/95 rounded-2xl p-5 sm:p-7 border border-system-accent/10 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-[10px] sm:text-xs font-orbitron text-system-text uppercase tracking-[0.2em] sm:tracking-[0.3em]">Evolution Rewards</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {skill.rewardConfig?.stats?.map(s => (
                    <div key={s.stat} className="flex items-center justify-between bg-system-accent/5 px-4 py-2.5 rounded-xl border border-system-accent/10 group hover:border-system-accent/30 transition-all">
                      <span className="capitalize font-orbitron text-[8px] sm:text-[9px] text-system-accent tracking-[0.1em] truncate mr-2">{s.stat}</span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={s.points}
                          onChange={(e) => updateStatPoints(s.stat, parseInt(e.target.value) || 1)}
                          className="w-10 bg-system-bg-panel/40 border border-system-accent/20 rounded-lg px-2 py-0.5 text-system-text focus:outline-none focus:border-system-accent font-orbitron text-[10px] text-right shadow-inner"
                        />
                        <button onClick={() => removeStatFromReward(s.stat)} className="text-system-text-muted hover:text-red-400 transition-colors p-1">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {(!skill.rewardConfig?.stats || skill.rewardConfig.stats.length === 0) && (
                  <div className="text-center py-6 text-[8px] sm:text-[9px] text-system-text-muted italic uppercase tracking-[0.2em] border border-dashed border-system-accent/10 rounded-xl opacity-40">No rewards configured</div>
                )}
                
                <Select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addStatToReward(e.target.value as StatKey);
                  }}
                  className="w-full font-orbitron text-[8px] sm:text-[9px] bg-system-bg-panel/40 border-system-accent/20 rounded-xl py-2.5 px-4 focus:border-system-accent transition-all"
                >
                  <option value="" disabled>ADD STAT AMPLIFICATION...</option>
                  {Object.values(StatKey).map(stat => (
                    <option key={stat} value={stat} disabled={skill.rewardConfig?.stats?.some(s => s.stat === stat)}>
                      {stat.toUpperCase()}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Growth History */}
            <div className="bg-system-bg-panel-solid/95 rounded-2xl p-5 sm:p-7 border border-system-accent/10 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-system-accent" />
                  <h3 className="text-[10px] sm:text-xs font-orbitron text-system-text uppercase tracking-[0.2em] sm:tracking-[0.3em]">Growth History</h3>
                </div>
                <button 
                  onClick={() => setExpandedGrowth(!expandedGrowth)}
                  className="p-1.5 rounded-lg bg-system-accent/10 border border-system-accent/20 text-system-accent hover:bg-system-accent/20 transition-all"
                >
                  {expandedGrowth ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              <AnimatePresence>
                {expandedGrowth && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2.5 overflow-hidden"
                  >
                    {(!skill.growthHistory || skill.growthHistory.length === 0) ? (
                      <div className="text-center py-6 text-[8px] text-system-text-muted italic uppercase tracking-[0.2em] border border-dashed border-system-accent/10 rounded-xl opacity-40">No historical data recorded</div>
                    ) : (
                      skill.growthHistory.slice().reverse().map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-system-accent/5 rounded-xl border border-system-accent/10 group hover:border-system-accent/30 transition-all">
                          <div className="min-w-0">
                            <div className="text-[7px] font-orbitron text-system-accent uppercase tracking-[0.1em] mb-0.5 truncate">Evolution Reached</div>
                            <div className="text-base font-orbitron text-system-text">LV.{entry.level}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[7px] font-orbitron text-system-text-muted uppercase tracking-[0.1em] mb-1">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </div>
                            <div className="flex gap-1 justify-end flex-wrap max-w-[100px]">
                              {entry.statsGained.map((sg, sidx) => (
                                <span key={sidx} className="px-1 py-0.5 rounded bg-emerald-500/10 text-[6px] font-orbitron text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">+{sg.points}{sg.stat[0].toUpperCase()}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Growth Analysis Section */}
          <div className="col-span-12 lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="bg-system-bg-panel-solid/95 rounded-3xl p-5 sm:p-8 border border-system-accent/10 backdrop-blur-2xl shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-system-accent" />
                  <h3 className="text-xs sm:text-sm font-orbitron text-system-text uppercase tracking-[0.2em] sm:tracking-[0.3em]">Growth Analysis</h3>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <div className="text-[7px] font-orbitron text-system-accent uppercase tracking-[0.2em] mb-0.5 opacity-60">Efficiency</div>
                    <div className="text-base sm:text-lg font-orbitron text-system-text">
                      {(() => {
                        let total = 0;
                        if (skill.totalPointsEarned) {
                          Object.values(skill.totalPointsEarned).forEach(v => {
                            if (typeof v === 'number') total += v;
                          });
                        }
                        return skill.hours > 0 ? (total / skill.hours).toFixed(2) : '0.00';
                      })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[7px] font-orbitron text-system-accent uppercase tracking-[0.2em] mb-0.5 opacity-60">Last Evolution</div>
                    <div className="text-base sm:text-lg font-orbitron text-system-text">
                      {skill.growthHistory?.length 
                        ? new Date(skill.growthHistory[skill.growthHistory.length - 1].timestamp).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-32 sm:h-48 w-full bg-system-bg-panel-solid/95 rounded-xl p-2 border border-system-accent/5 shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skill.growthHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--system-accent-rgb), 0.05)" vertical={false} />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis stroke="rgba(var(--system-accent-rgb), 0.3)" fontSize={6} fontFamily="Orbitron" tickFormatter={(val) => `LV.${val}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 10, 10, 0.9)', 
                        border: '1px solid rgba(var(--system-accent-rgb), 0.2)',
                        borderRadius: '0.5rem',
                        fontFamily: 'Orbitron',
                        fontSize: '7px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Line type="monotone" dataKey="level" stroke="rgb(var(--system-accent-rgb))" strokeWidth={2} dot={{ fill: 'rgb(var(--system-accent-rgb))', r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Synergy Storage */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-system-bg-panel/40 rounded-3xl p-5 sm:p-8 border border-system-accent/10 backdrop-blur-2xl shadow-2xl h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-system-accent" />
                  <h3 className="text-[10px] sm:text-xs font-orbitron text-system-text uppercase tracking-[0.2em]">Synergy Storage</h3>
                </div>
                <button 
                  onClick={() => setShowAddEffectForm(true)}
                  className="p-1.5 rounded-lg bg-system-accent/10 border border-system-accent/20 text-system-accent hover:bg-system-accent/20 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {(!skill.effects || skill.effects.length === 0) ? (
                  <div className="text-center py-8 border border-dashed border-system-accent/10 rounded-xl opacity-40">
                    <p className="text-[8px] text-system-text-muted uppercase tracking-[0.2em] font-orbitron italic">No Synergies</p>
                  </div>
                ) : (
                  skill.effects.map((eff, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setEditingEffectIndex({ type: 'skill', index: idx, sourceId: skill.id })}
                      className="group p-4 bg-system-bg-panel/40 border border-system-accent/10 rounded-xl hover:border-system-accent/40 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-system-accent opacity-40 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-[10px] font-orbitron text-system-accent uppercase tracking-widest truncate mr-2">{eff.name}</h4>
                        <Badge variant={eff.type === 'active' ? 'accent' : 'outline'} className="text-[6px] font-orbitron px-1.5 py-0.5 shrink-0">
                          {eff.type === 'active' ? 'ACT' : 'PAS'}
                        </Badge>
                      </div>
                      <p className="text-[9px] text-system-text-muted line-clamp-1 font-light italic">{eff.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Neural Maintenance */}
          <div className="col-span-12 mt-12 pt-10 border-t border-red-500/10">
            <div className="space-y-8">
              <div className="text-center max-w-md mx-auto">
                <h3 className="text-system-text font-orbitron text-sm sm:text-base uppercase tracking-[0.3em] mb-2 sm:mb-3">Neural Maintenance</h3>
                <p className="text-[9px] sm:text-[11px] text-system-text-muted uppercase tracking-[0.2em] opacity-60 leading-relaxed">
                  Critical system actions and data management. Purging skill data will permanently erase all neural pathways and mastery history. This action is irreversible.
                </p>
              </div>

              <div className="w-full">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-3 py-5 sm:py-6 rounded-2xl sm:rounded-3xl border border-red-500/30 text-red-500/70 hover:text-red-500 hover:border-red-500 hover:bg-red-500/5 transition-all duration-500 font-orbitron text-[10px] sm:text-[13px] uppercase tracking-[0.4em] font-black group shadow-[0_0_30px_rgba(239,68,68,0.02)]"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    <span>PURGE SKILL DATA</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-300">
                    <button
                      onClick={deleteSkill}
                      className="flex-1 w-full py-5 sm:py-6 bg-red-500 text-white rounded-2xl sm:rounded-3xl hover:bg-red-600 transition-all font-orbitron text-[10px] sm:text-[13px] uppercase tracking-[0.4em] font-black shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                    >
                      CONFIRM PURGE
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 w-full py-5 sm:py-6 bg-system-bg-panel border border-system-accent/20 text-system-text-muted rounded-2xl sm:rounded-3xl hover:text-system-text transition-all font-orbitron text-[10px] sm:text-[13px] uppercase tracking-[0.4em]"
                    >
                      ABORT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <SynergyModal 
        isOpen={showAddEffectForm}
        onClose={() => setShowAddEffectForm(false)}
        title="Embed Skill Synergy"
        target={{ type: 'skill', id: skill.id }}
      />

      <EffectDetailModal 
        isOpen={editingEffectIndex !== null}
        onClose={() => setEditingEffectIndex(null)}
        target={editingEffectIndex}
      />
    </>
  );
});

// --- Main Page Component ---

const SkillsPage: React.FC<{ onBack: () => void }> = React.memo(({ onBack }) => {
  const setSkills = usePlayerStore(state => state.setSkills);
  const setPlayer = usePlayerStore(state => state.setPlayer);
  const setIsDirty = usePlayerStore(state => state.setIsDirty);
  const { playSuccess, playError } = useSound();
  
  const [activeTab, setActiveTab] = useState<'mental' | 'physical'>('mental');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'folder'>('list');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [isAnalyticsCollapsed, setIsAnalyticsCollapsed] = useState(true);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const confirmPurgeAllSkills = () => {
    setSkills([]);
    setIsDirty(true);
    setShowPurgeConfirm(false);
    playSuccess();
  };

  const filteredSkillIds = usePlayerStore(useShallow(state => {
    return state.skills.filter(s => 
      s.type === activeTab && 
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ).map(s => s.id);
  }));

  const folders = usePlayerStore(useShallow(state => 
    (state.player.skillFolders || []).filter(f => f.type === activeTab)
  ));

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSkill: Skill = {
      id: Date.now().toString(),
      name: newName.trim(),
      description: newDesc.trim(),
      type: activeTab,
      hours: 0,
      level: 1,
      rewardConfig: {
        stats: []
      }
    };

    setSkills(prev => [...prev, newSkill]);
    setNewName('');
    setNewDesc('');
    setShowAddForm(false);
    playSuccess();
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name: newFolderName.trim(),
      type: activeTab
    };

    setPlayer(prev => ({
      ...prev,
      skillFolders: [...(prev.skillFolders || []), newFolder]
    }));
    
    setNewFolderName('');
    setShowFolderForm(false);
    setExpandedFolders(prev => ({ ...prev, [newFolder.id]: true }));
    playSuccess();
  };

  const handleRenameFolder = (folderId: string) => {
    if (!editingFolderName.trim()) {
      setEditingFolderId(null);
      return;
    }

    setPlayer(prev => ({
      ...prev,
      skillFolders: (prev.skillFolders || []).map(f => 
        f.id === folderId ? { ...f, name: editingFolderName.trim() } : f
      )
    }));
    setEditingFolderId(null);
    playSuccess();
  };

  const confirmDeleteFolder = () => {
    if (!folderToDelete) return;

    setPlayer(prev => ({
      ...prev,
      skillFolders: (prev.skillFolders || []).filter(f => f.id !== folderToDelete.id)
    }));

    setSkills(prev => prev.map(s => 
      s.folderId === folderToDelete.id ? { ...s, folderId: undefined } : s
    ));

    setFolderToDelete(null);
    playSuccess();
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-4 lg:space-y-6 animate-in slide-in-from-top duration-500 pb-10 px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 lg:space-x-6 min-w-0">
          <button onClick={onBack} className="p-2.5 hover:bg-system-accent/10 rounded-xl transition-all text-system-text-muted hover:text-system-accent border border-transparent hover:border-system-accent/20 hover-glitch shrink-0">
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 rotate-180" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-4xl font-orbitron system-glow text-system-accent uppercase tracking-tighter truncate">Neural Skill Tree</h1>
            <p className="text-[7px] lg:text-[10px] text-system-text-muted uppercase tracking-[0.1em] lg:tracking-[0.3em] font-orbitron opacity-70 leading-tight break-words">
              Develop your mental and physical capabilities.
            </p>
          </div>
        </div>
        <button 
          id="skills-add-btn"
          onClick={() => setShowAddForm(true)}
          className="w-full lg:w-auto px-6 py-3 bg-system-accent text-system-bg-base hover:opacity-90 rounded-xl transition-all flex items-center justify-center font-orbitron text-[10px] lg:text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,157,0.3)] hover-glitch"
        >
          <Plus className="w-4 h-4 mr-2" />
          Initialize Skill
        </button>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-system-bg-panel/40 p-2 rounded-2xl border border-system-accent/10 backdrop-blur-md">
        <div className="flex space-x-2 w-full sm:w-auto">
          {(['mental', 'physical'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedSkillId(null); }}
              className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-orbitron text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border hover-glitch ${
                activeTab === tab 
                  ? 'bg-system-accent text-system-bg-base border-system-accent shadow-[0_0_15px_rgba(0,255,157,0.2)]' 
                  : 'text-system-text-muted hover:text-system-text hover:bg-system-accent/5 border-transparent'
              }`}
            >
              <div className="flex items-center justify-center">
                {tab === 'mental' ? <ICONS.Brain className="w-4 h-4 mr-2" /> : <ICONS.Dumbbell className="w-4 h-4 mr-2" />}
                <span>{tab}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72" id="skills-search">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-system-accent/40" />
            <input
              type="text"
              placeholder="SEARCH NEURAL DATABASE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-system-bg-panel/40 border border-system-accent/20 rounded-xl pl-11 pr-4 py-2.5 text-[10px] font-orbitron text-system-text placeholder:text-system-text-muted/40 focus:outline-none focus:border-system-accent transition-all uppercase tracking-widest"
            />
          </div>
          <div className="flex bg-system-bg-panel/40 rounded-xl border border-system-accent/20 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all hover-glitch ${viewMode === 'list' ? 'bg-system-accent text-system-bg-base' : 'text-system-text-muted hover:text-system-accent'}`}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              id="skills-folder-btn"
              onClick={() => setViewMode('folder')}
              className={`p-2 rounded-lg transition-all hover-glitch ${viewMode === 'folder' ? 'bg-system-accent text-system-bg-base' : 'text-system-text-muted hover:text-system-accent'}`}
              title="Folder View"
            >
              <FolderIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Analytics Section */}
        <div className="bg-system-bg-panel-solid/90 rounded-3xl border border-system-accent/10 overflow-hidden backdrop-blur-md">
          <button 
            id="skills-analytics"
            onClick={() => setIsAnalyticsCollapsed(!isAnalyticsCollapsed)}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-system-accent/5 transition-all group hover-glitch"
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-lg bg-system-accent/10 text-system-accent group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block font-orbitron text-[10px] sm:text-xs uppercase tracking-[0.2em] text-system-text">Neural Analytics Report</span>
                <span className="block text-[7px] text-system-text-muted uppercase tracking-widest mt-0.5">Review training distribution and focus areas</span>
              </div>
            </div>
            {isAnalyticsCollapsed ? <ChevronDown className="w-4 h-4 text-system-accent/50" /> : <ChevronUp className="w-4 h-4 text-system-accent" />}
          </button>
          
          <AnimatePresence>
            {!isAnalyticsCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 sm:p-6 border-t border-system-accent/10">
                  <SkillsAnalytics />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Skill Grid */}
        <div className="space-y-6">
          {viewMode === 'list' ? (
            <div id="skills-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 h-fit">
              {filteredSkillIds.length > 0 ? (
                filteredSkillIds.map(id => (
                  <SkillCard 
                    key={id} 
                    skillId={id} 
                    isSelected={selectedSkillId === id} 
                    onClick={() => setSelectedSkillId(selectedSkillId === id ? null : id)} 
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-system-bg-panel/40 rounded-3xl border border-system-accent/10 border-dashed">
                  <div className="w-16 h-16 bg-system-accent/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-system-accent/20" />
                  </div>
                  <p className="font-orbitron text-[10px] text-system-text-muted uppercase tracking-widest">No neural data found in current sector.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {/* Folders */}
              {folders.map(folder => (
                <div key={folder.id} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-system-accent/20 pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-system-accent/10 text-system-accent">
                        <FolderIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-orbitron text-sm uppercase tracking-[0.2em] text-system-text">{folder.name}</h2>
                        <span className="text-[8px] text-system-text-muted uppercase tracking-widest">Neural Cluster</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setEditingFolderId(folder.id);
                          setEditingFolderName(folder.name);
                        }}
                        className="p-2 text-system-text-muted hover:text-system-accent hover:bg-system-accent/10 rounded-lg transition-all hover-glitch"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setFolderToDelete(folder)}
                        className="p-2 text-system-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all hover-glitch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                    <FolderSkillList folderId={folder.id} activeTab={activeTab} selectedSkillId={selectedSkillId} onSelect={setSelectedSkillId} />
                  </div>
                </div>
              ))}

              {/* Uncategorized */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 border-b border-system-accent/20 pb-4">
                  <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-orbitron text-sm uppercase tracking-[0.2em] text-system-text-muted">Uncategorized Data</h2>
                    <span className="text-[8px] text-system-text-muted uppercase tracking-widest">Miscellaneous Neural Pathways</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  <FolderSkillList folderId={null} activeTab={activeTab} selectedSkillId={selectedSkillId} onSelect={setSelectedSkillId} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSkillId && (
          <div className="fixed inset-0 bg-system-bg-base/80 backdrop-blur-xl flex items-center justify-center z-[60] p-2 sm:p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-system-bg-panel border border-system-accent/30 rounded-[1.5rem] sm:rounded-[2.5rem] p-3 sm:p-8 max-w-6xl w-full h-[94vh] sm:h-[90vh] max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(0,255,157,0.1)] relative overflow-hidden"
            >
              <SkillDetail skillId={selectedSkillId} onClose={() => setSelectedSkillId(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showAddForm && (
        <div className="fixed inset-0 bg-system-bg-base/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-system-bg-panel border border-system-accent/30 rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,255,157,0.1)]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-orbitron text-system-accent uppercase tracking-tighter system-glow">Initialize Neural Skill</h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-system-accent/10 rounded-xl transition-all text-system-text-muted hover:text-system-accent hover-glitch">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="space-y-6">
              <div>
                <label className="block text-[10px] font-orbitron text-system-text-muted mb-2 uppercase tracking-widest">Skill Designation</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-system-bg-panel/40 border border-system-accent/20 rounded-xl px-4 py-3 text-system-text focus:outline-none focus:border-system-accent transition-all font-orbitron text-sm placeholder:text-system-text-muted/20"
                  placeholder="E.G., QUANTUM COMPUTING"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-orbitron text-system-text-muted mb-2 uppercase tracking-widest">Neural Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-system-bg-panel/40 border border-system-accent/20 rounded-xl px-4 py-3 text-system-text focus:outline-none focus:border-system-accent transition-all h-28 resize-none text-sm placeholder:text-system-text-muted/20"
                  placeholder="DESCRIBE THE NEURAL PATHWAY..."
                />
              </div>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full py-4 bg-system-accent text-system-bg-base font-orbitron text-xs uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(0,255,157,0.2)] hover-glitch"
              >
                Authorize Initialization
              </button>
            </form>
          </div>
        </div>
      )}

      {showFolderForm && (
        <div className="fixed inset-0 bg-system-bg-base/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-system-bg-panel border border-system-accent/30 rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,255,157,0.1)]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-orbitron text-system-accent uppercase tracking-tighter system-glow">Create Neural Folder</h2>
              <button onClick={() => setShowFolderForm(false)} className="p-2 hover:bg-system-accent/10 rounded-xl transition-all text-system-text-muted hover:text-system-accent hover-glitch">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddFolder} className="space-y-6">
              <div>
                <label className="block text-[10px] font-orbitron text-system-text-muted mb-2 uppercase tracking-widest">Folder Designation</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full bg-system-bg-panel/40 border border-system-accent/20 rounded-xl px-4 py-3 text-system-text focus:outline-none focus:border-system-accent transition-all font-orbitron text-sm placeholder:text-system-text-muted/20"
                  placeholder="E.G., PROGRAMMING LANGUAGES"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!newFolderName.trim()}
                className="w-full py-4 bg-system-accent text-system-bg-base font-orbitron text-xs uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(0,255,157,0.2)] hover-glitch"
              >
                Authorize Creation
              </button>
            </form>
          </div>
        </div>
      )}

      {folderToDelete && (
        <div className="fixed inset-0 bg-system-bg-base/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-system-bg-panel border border-red-500/30 rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <h2 className="text-2xl font-orbitron text-red-400 uppercase tracking-tighter mb-4">Purge Folder?</h2>
            <p className="text-sm text-system-text-muted mb-8 leading-relaxed">
              Are you sure you want to purge <span className="text-system-text font-bold">"{folderToDelete.name}"</span>? 
              Neural data inside this folder will remain intact but will be moved to the Uncategorized sector.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setFolderToDelete(null)}
                className="flex-1 py-4 bg-system-bg-panel border border-system-accent/20 text-system-text-muted hover:text-system-text rounded-xl transition-all font-orbitron text-xs uppercase tracking-widest hover-glitch"
              >
                Abort
              </button>
              <button
                onClick={confirmDeleteFolder}
                className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all font-orbitron text-xs uppercase tracking-widest hover-glitch"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {showPurgeConfirm && (
        <div className="fixed inset-0 bg-system-bg-base/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="bg-system-bg-panel border border-red-500/50 rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 duration-300 shadow-[0_0_100px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-4 mb-6 text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-2xl font-orbitron uppercase tracking-tighter">Critical Purge</h2>
            </div>
            <p className="text-sm text-system-text-muted mb-8 leading-relaxed">
              You are about to initiate a <span className="text-red-400 font-bold uppercase">Full Neural Purge</span>. 
              This will permanently delete all skill data and progress. This action cannot be reversed.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmPurgeAllSkills}
                className="w-full py-4 bg-red-500 text-white rounded-xl transition-all font-orbitron text-xs uppercase tracking-[0.2em] font-black shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:brightness-110"
              >
                Confirm Full Purge
              </button>
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="w-full py-4 bg-system-bg-panel border border-system-accent/20 text-system-text-muted hover:text-system-text rounded-xl transition-all font-orbitron text-xs uppercase tracking-widest"
              >
                Abort Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 pt-12 border-t border-system-accent/10">
        <button 
          id="skills-purge-btn"
          onClick={() => setShowPurgeConfirm(true)}
          className="w-full py-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl text-red-400 font-orbitron text-xs uppercase tracking-[0.4em] transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] flex items-center justify-center gap-3 group"
        >
          <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Purge Skill Data
        </button>
      </div>
    </div>
  );
});

export default SkillsPage;
