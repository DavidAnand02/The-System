
import React, { useState, useMemo, useCallback } from 'react';
import { Job, StatKey, PlayerData } from '../types';
import { MAX_SKILL_HOURS, getRankDetails } from '../constants';
import { Search, Trophy, Settings2, X, Plus, Activity, ChevronDown, ChevronUp, Sword, Sparkles, Trash2, Edit2, LayoutGrid, Zap, ChevronLeft, Briefcase } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useSound } from '../contexts/SoundContext';
import { SynergyModal } from './modals/SynergyModal';
import { EffectDetailModal } from './modals/EffectDetailModal';

const ICONS = {
  Search, Trophy, Settings2, X, Plus, Activity, ChevronDown, ChevronUp, Sword, Sparkles, Trash2, Edit2, LayoutGrid, Zap, ChevronLeft, Briefcase
};

const Select: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  className?: string;
}> = ({ value, onChange, options, className }) => (
  <select
    value={value}
    onChange={onChange}
    className={`bg-system-bg-panel-solid/80 border border-system-accent/20 rounded-lg px-2 py-1 text-system-accent outline-none focus:border-system-accent/50 font-orbitron ${className}`}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value} className="bg-system-bg-panel text-system-text">
        {opt.label}
      </option>
    ))}
  </select>
);

const COLORS = ['#00FF9D', '#00E5FF', '#7000FF', '#FF00E5', '#FF3D00', '#FFD700'];

interface JobsPageProps {
  onBack: () => void;
}

const getLevelInfo = (job: Job) => {
  const hours = Number.isNaN(job.hours) ? 0 : (job.hours || 0);
  const L = Math.max(1, Math.floor(Math.sqrt(hours)));
  const start = L === 1 ? 0 : L * L;
  const next = (L + 1) * (L + 1);
  const range = Math.max(1, next - start);
  const currentProgress = Math.max(0, hours - start);
  return { L, start, next, range, currentProgress };
};

// --- Sub-components ---

const JobCard: React.FC<{ 
  jobId: string; 
  isSelected: boolean; 
  onClick: () => void;
}> = React.memo(({ jobId, isSelected, onClick }) => {
  const job = usePlayerStore(useShallow(state => state.jobs.find(j => j.id === jobId)!));
  
  const info = useMemo(() => {
    const hours = Number.isNaN(job.hours) ? 0 : (job.hours || 0);
    const L = Math.max(1, Math.floor(Math.sqrt(hours)));
    const start = L === 1 ? 0 : L * L;
    const next = (L + 1) * (L + 1);
    const range = Math.max(1, next - start);
    const currentProgress = Math.max(0, hours - start);
    return { L, start, next, range, currentProgress };
  }, [job.hours]);

  const rank = getRankDetails(info.L);
  const progressPercent = (info.currentProgress / info.range) * 100;
  const isNearCompletion = progressPercent > 90;

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
        <ICONS.Briefcase size={120} />
      </div>

      <div className="mt-10 lg:mt-12 space-y-6 lg:space-y-8 relative z-10">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`font-orbitron text-base lg:text-lg uppercase tracking-tight break-words transition-colors line-clamp-2 ${isSelected ? 'text-system-accent' : 'text-system-text group-hover:text-system-accent'}`}>
              {job.title}
            </h3>
            <p className="text-[8px] lg:text-[9px] text-system-text-muted uppercase tracking-[0.2em] opacity-60 font-orbitron mt-1 break-words line-clamp-2">
              {job.description || 'No neural description initialized for this class.'}
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0 bg-system-accent/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-system-accent/10 min-w-[60px] sm:min-w-[80px]">
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className={`text-xl sm:text-2xl lg:text-4xl font-black font-orbitron ${rank.color} system-glow leading-none tracking-tighter`}>{info.L}</span>
              <span className="text-[7px] sm:text-[8px] lg:text-[10px] text-system-text-muted font-bold font-orbitron opacity-50">LV</span>
            </div>
            <div className="text-[7px] sm:text-[8px] lg:text-[9px] font-orbitron text-system-accent uppercase tracking-widest mt-0.5 sm:mt-1 opacity-70 whitespace-nowrap">
              {Math.floor(job.hours || 0)}H MASTERY
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between text-[8px] lg:text-[9px] font-orbitron uppercase tracking-[0.3em]">
            <span className="text-system-text-muted/60">Evolution Progress</span>
            <span className={`${rank.color} font-bold`}>{Math.floor(progressPercent)}%</span>
          </div>
          <div className="h-1.5 lg:h-2 bg-system-accent/5 rounded-full overflow-hidden border border-system-accent/10 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className={`h-full rounded-full ${rank.color.replace('text-', 'bg-')} ${isNearCompletion ? 'animate-pulse-glow' : ''} transition-all duration-1000 ease-out`}
              style={{ 
                boxShadow: isNearCompletion ? `0 0 20px ${rank.glowColor}` : 'none'
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const JobsPage: React.FC<JobsPageProps> = React.memo(({ onBack }) => {
  const jobs = usePlayerStore(state => state.jobs);
  const setJobs = usePlayerStore(state => state.setJobs);
  const player = usePlayerStore(state => state.player);
  const setPlayer = usePlayerStore(state => state.setPlayer);
  const { playSuccess, playLevelUp, playError } = useSound();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showRewardConfigId, setShowRewardConfigId] = useState<string | null>(null);
  const [expandedRewards, setExpandedRewards] = useState<Record<string, boolean>>({});
  const [expandedGrowth, setExpandedGrowth] = useState<Record<string, boolean>>({});
  const [expandedSynergy, setExpandedSynergy] = useState<Record<string, boolean>>({});
  const [isAnalyticsCollapsed, setIsAnalyticsCollapsed] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Effect Creator Modal state
  const [effectCreator, setEffectCreator] = useState<{ jobId: string } | null>(null);
  const [editingEffectIndex, setEditingEffectIndex] = useState<{ type: 'global' | 'job' | 'title' | 'belief' | 'skill'; index: number; sourceId?: string } | null>(null);

  const setHours = React.useCallback((id: string, value: number) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;

    const newHours = Math.min(MAX_SKILL_HOURS, Math.max(0, value));
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newHours)));
    
    // Handle Player Stats (Increase or Decrease)
    if (newLevel !== job.level) {
      if (newLevel > job.level) {
        playLevelUp();
      } else if (newLevel < job.level) {
        playError();
      }
      
      if (job.rewardConfig) {
      const levelDiff = newLevel - job.level;
      setPlayer(prev => {
        const newStats = { ...prev.stats };
        const newLastStatIncrease = { ...(prev.lastStatIncrease || {}) };
        job.rewardConfig!.stats.forEach(rs => {
          newStats[rs.stat] = Math.max(0, newStats[rs.stat] + (rs.points * levelDiff));
          if (levelDiff > 0) {
            newLastStatIncrease[rs.stat] = new Date().toISOString();
          }
        });
        return { ...prev, stats: newStats, lastStatIncrease: newLastStatIncrease };
      });
    }
    }

    setJobs(prev => prev.map(j => {
      if (j.id !== id) return j;
      
      const levelDiff = newLevel - j.level;
      let newTotals = { ...(j.totalPointsEarned || {}) };
      let newHistory = [...(j.growthHistory || [])];
      
      if (levelDiff > 0 && j.rewardConfig) {
        // Level Up
        j.rewardConfig.stats.forEach(rs => {
          newTotals[rs.stat] = (newTotals[rs.stat] || 0) + (rs.points * levelDiff);
        });
        
        for (let i = 1; i <= levelDiff; i++) {
          newHistory.push({
            level: j.level + i,
            timestamp: new Date().toISOString(),
            statsGained: j.rewardConfig.stats.map(rs => ({ stat: rs.stat, points: rs.points }))
          });
        }
      } else if (levelDiff < 0 && j.rewardConfig) {
        // Level Down
        j.rewardConfig.stats.forEach(rs => {
          newTotals[rs.stat] = Math.max(0, (newTotals[rs.stat] || 0) + (rs.points * levelDiff));
        });
        
        newHistory = newHistory.filter(h => h.level <= newLevel);
      }
      
      return { 
        ...j, 
        hours: newHours, 
        level: newLevel, 
        lastWorkedAt: new Date().toISOString(),
        totalPointsEarned: newTotals,
        growthHistory: newHistory.slice(-20) // Keep last 20 entries
      };
    }));
  }, [jobs, setPlayer, setJobs]);

  const addHours = React.useCallback((id: string, amount: number) => {
    const j = jobs.find(job => job.id === id);
    if (j) setHours(id, j.hours + amount);
  }, [jobs, setHours]);

  const handleUpdateJobField = React.useCallback((id: string, field: keyof Job, value: any) => {
    if (field === 'title') {
      const oldJob = jobs.find(j => j.id === id);
      if (oldJob) {
        setPlayer(prev => {
          const updates: Partial<PlayerData> = {};
          
          // Update deprecated single job class if it matches
          if (prev.jobClass === oldJob.title) {
            updates.jobClass = value;
          }

          // Update equippedJobs array if it contains the old title
          if (prev.equippedJobs?.includes(oldJob.title)) {
            updates.equippedJobs = prev.equippedJobs.map(j => j === oldJob.title ? value : j);
          }

          if (Object.keys(updates).length > 0) {
            return { ...prev, ...updates };
          }
          
          return prev;
        });
      }
    }
    setJobs(prev => prev.map(j => j.id === id ? { ...j, [field]: value } : j));
  }, [jobs, setPlayer, setJobs]);

  const handleAddJob = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newJob: Job = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDesc.trim() || 'A newly unlocked path for professional evolution.',
      hours: 0,
      level: 1,
      effects: [],
      rewardConfig: { stats: [{ stat: StatKey.Intelligence, points: 5 }] }
    };
    setJobs(prev => [newJob, ...prev]);
    playSuccess();
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  }, [newTitle, newDesc, setJobs]);



  const removeEffectFromJob = React.useCallback((jobId: string, effectIndex: number) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return { ...j, effects: (j.effects || []).filter((_, i) => i !== effectIndex) };
    }));
  }, [setJobs]);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return jobs
      .filter(j => 
        j.title.toLowerCase().includes(query) || 
        j.description.toLowerCase().includes(query) ||
        (j.effects || []).some(e => 
          e.name.toLowerCase().includes(query) || 
          (e.description || '').toLowerCase().includes(query)
        )
      )
      .sort((a, b) => {
        if (sortOrder === 'desc') {
          return (b.hours || 0) - (a.hours || 0);
        }
        return (a.hours || 0) - (b.hours || 0);
      });
  }, [jobs, searchQuery, sortOrder]);

  const jobAllocationData = useMemo(() => {
    return jobs
      .map(j => ({ name: j.title, value: j.hours || 0 }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [jobs]);

  const COLORS = ['var(--system-accent)', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  const updateRewardConfig = React.useCallback((jobId: string, config: { stat: StatKey, points: number }[]) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, rewardConfig: { stats: config } } : j));
  }, [setJobs]);

  const addStatToReward = React.useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const currentStats = job.rewardConfig?.stats || [];
    updateRewardConfig(jobId, [...currentStats, { stat: StatKey.Intelligence, points: 1 }]);
  }, [jobs, updateRewardConfig]);

  const removeStatFromReward = React.useCallback((jobId: string, index: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const currentStats = [...(job.rewardConfig?.stats || [])];
    currentStats.splice(index, 1);
    updateRewardConfig(jobId, currentStats);
  }, [jobs, updateRewardConfig]);

  return (
    <div className="w-full space-y-6 sm:space-y-10 animate-in slide-in-from-right duration-500 pb-20 px-4 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-12">
        <div className="flex items-center space-x-3 sm:space-x-8 min-w-0">
          <button onClick={onBack} className="p-3 sm:p-4 rounded-2xl bg-system-bg-panel-solid/90 backdrop-blur-2xl hover:bg-system-accent/10 transition-all duration-500 border border-white/10 hover:border-system-accent/50 group shadow-2xl hover:-translate-x-1 shrink-0">
            <ICONS.ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col space-y-1 sm:space-y-2 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-black font-orbitron text-system-accent tracking-[0.2em] sm:tracking-[0.5em] uppercase leading-none drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] truncate">Neural Classes</h1>
            <span className="text-[8px] sm:text-[11px] font-black text-system-accent/50 uppercase tracking-[0.2em] sm:tracking-[0.4em] font-orbitron opacity-70 leading-tight break-words">Class Log & Evolution Archive</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-system-bg-panel-solid/90 backdrop-blur-2xl p-2 rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="relative flex-1 lg:w-80 group" id="jobs-search">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-system-accent/40 group-focus-within:text-system-accent transition-colors duration-500" />
            <input 
              type="text" 
              placeholder="Filter neural paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-system-accent/5 border border-system-accent/10 rounded-xl sm:rounded-[1.5rem] pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 text-xs sm:text-sm text-system-text focus:border-system-accent/40 outline-none transition-all duration-500 font-orbitron placeholder:text-system-text-muted/30"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex-1 sm:flex-none p-3 sm:p-4 rounded-xl sm:rounded-[1.2rem] bg-system-accent/5 border border-system-accent/10 text-system-text-muted hover:text-system-accent transition-all duration-500 hover:bg-white/5 flex items-center justify-center"
              title={sortOrder === 'desc' ? "Sort Ascending" : "Sort Descending"}
            >
              {sortOrder === 'desc' ? <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <button 
              id="jobs-analytics"
              onClick={() => setIsAnalyticsCollapsed(!isAnalyticsCollapsed)}
              className={`flex-1 sm:flex-none p-3 sm:p-4 rounded-xl sm:rounded-[1.2rem] border transition-all duration-500 flex items-center justify-center ${!isAnalyticsCollapsed ? 'bg-system-accent text-black border-system-accent shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-system-accent/5 text-system-text-muted border-system-accent/10 hover:text-system-accent hover:bg-white/5'}`}
            >
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button 
              id="jobs-add-btn" 
              onClick={() => setShowAddForm(!showAddForm)} 
              className={`flex-1 sm:flex-none p-3 sm:p-4 rounded-xl sm:rounded-[1.2rem] transition-all duration-700 shadow-2xl flex items-center justify-center ${showAddForm ? 'bg-red-500 text-white shadow-red-500/40 rotate-90' : 'bg-system-accent text-black shadow-system-accent/30 hover:scale-110 active:scale-90'}`}
            >
              {showAddForm ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Plus className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Section (Collapsible) */}
      <AnimatePresence>
        {!isAnalyticsCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div className="lg:col-span-2 bg-system-bg-panel-solid/90 rounded-3xl sm:rounded-[2.5rem] border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-6 sm:mb-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-system-accent/10 border border-system-accent/20">
                      <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-system-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black font-orbitron text-system-text uppercase tracking-widest">Mastery Distribution</h2>
                      <p className="text-[8px] sm:text-[10px] text-system-text-muted font-bold uppercase tracking-widest opacity-60">Neural integration analysis</p>
                    </div>
                  </div>
                </div>
                <div className="h-64 sm:h-72 w-full">
                  {jobAllocationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={jobAllocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={10}
                          dataKey="value"
                        >
                          {jobAllocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '10px', fontFamily: 'Orbitron', backdropFilter: 'blur(20px)', padding: '1rem' }}
                          itemStyle={{ color: 'var(--system-accent)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        />
                        <Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" wrapperStyle={{ fontSize: '9px', fontFamily: 'Orbitron', paddingTop: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[10px] text-system-text-muted uppercase font-orbitron tracking-[0.4em] opacity-30">No Data Detected</div>
                  )}
                </div>
              </div>

              <div className="bg-system-bg-panel-solid/90 rounded-3xl sm:rounded-[2.5rem] border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl flex flex-col justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-system-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-system-accent/20 mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-xl sm:text-2xl font-black font-orbitron text-system-text uppercase tracking-widest mb-2 sm:mb-3">Evolution Efficiency</h3>
                <div className="text-4xl sm:text-6xl font-black font-orbitron text-system-accent mb-2 sm:mb-4 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  {(() => {
                    const totalHours = jobs.reduce((acc, j) => acc + (j.hours || 0), 0);
                    const totalStats = jobs.reduce((acc, j) => {
                      if (j.totalPointsEarned) {
                        Object.values(j.totalPointsEarned).forEach(v => {
                          if (typeof v === 'number') acc += v;
                        });
                      }
                      return acc;
                    }, 0);
                    return totalHours > 0 ? (totalStats / totalHours).toFixed(2) : '0.00';
                  })()}
                </div>
                <p className="text-[9px] sm:text-[11px] text-system-text-muted font-black font-orbitron uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60">Global Points Per Hour</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Job Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleAddJob} 
            className="bg-system-bg-panel-solid/95 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-system-accent/30 space-y-4 sm:space-y-6 shadow-2xl shadow-system-accent/5 backdrop-blur-xl mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-system-accent" />
              <h2 className="text-lg sm:text-xl font-orbitron text-system-accent uppercase tracking-[0.1em] sm:tracking-[0.2em]">Initialize Neural Path</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[9px] sm:text-[10px] font-orbitron text-system-text-muted uppercase tracking-widest ml-1">Class Designation</label>
                <textarea 
                  placeholder="e.g. Shadow Monarch, Void Weaver..."
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  className="w-full bg-system-accent/5 border border-system-accent/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm focus:border-system-accent/50 text-system-text outline-none font-orbitron transition-all resize-none overflow-hidden h-auto min-h-[3rem]"
                  required
                  rows={1}
                  onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[9px] sm:text-[10px] font-orbitron text-system-text-muted uppercase tracking-widest ml-1">Neural Signature</label>
                <textarea 
                  placeholder="Brief description of the evolution path..."
                  value={newDesc}
                  onChange={(e) => {
                    setNewDesc(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  className="w-full bg-system-accent/5 border border-system-accent/20 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm focus:border-system-accent/50 text-system-text outline-none font-orbitron transition-all resize-none overflow-hidden h-auto min-h-[3rem]"
                  rows={1}
                  onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              </div>
            </div>
            <button type="submit" className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-system-accent text-system-bg-base font-orbitron text-xs sm:text-sm hover:opacity-90 transition-all shadow-lg shadow-system-accent/20 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              Authorize Registration
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Jobs Grid */}
      <div id="jobs-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 h-fit">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <JobCard 
              key={job.id}
              jobId={job.id}
              isSelected={selectedJobId === job.id}
              onClick={() => setSelectedJobId(job.id)}
            />
          ))
        ) : (
          <div className="col-span-full p-20 text-center bg-system-bg-panel-solid/60 border-2 border-system-border border-dashed rounded-[3rem] backdrop-blur-sm">
            <Activity className="w-12 h-12 text-system-text-muted/20 mx-auto mb-4" />
            <p className="font-orbitron text-xs text-system-text-muted uppercase tracking-[0.4em]">No neural classes detected in current sector.</p>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJobId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJobId(null)}
              className="absolute inset-0 bg-system-bg-base/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-system-bg-panel-solid border border-system-accent/20 rounded-2xl sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,255,157,0.1)] custom-scrollbar p-4 sm:p-12 backdrop-blur-3xl"
            >
              <JobDetail 
                job={jobs.find(j => j.id === selectedJobId)!}
                setHours={setHours}
                addHours={addHours}
                handleUpdateJobField={handleUpdateJobField}
                setJobs={setJobs}
                expandedRewards={expandedRewards}
                setExpandedRewards={setExpandedRewards}
                showRewardConfigId={showRewardConfigId}
                setShowRewardConfigId={setShowRewardConfigId}
                addStatToReward={addStatToReward}
                updateRewardConfig={updateRewardConfig}
                removeStatFromReward={removeStatFromReward}
                expandedGrowth={expandedGrowth}
                setExpandedGrowth={setExpandedGrowth}
                expandedSynergy={expandedSynergy}
                setExpandedSynergy={setExpandedSynergy}
                setEffectCreator={setEffectCreator}
                setEditingEffectIndex={setEditingEffectIndex}
                removeEffectFromJob={removeEffectFromJob}
                onClose={() => setSelectedJobId(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SynergyModal 
        isOpen={!!effectCreator}
        onClose={() => setEffectCreator(null)}
        title="Add Class Effect"
        target={effectCreator ? { type: 'job', id: effectCreator.jobId } : null}
        submitLabel="AUTHORIZE EFFECT"
      />

      <EffectDetailModal 
        isOpen={editingEffectIndex !== null}
        onClose={() => setEditingEffectIndex(null)}
        target={editingEffectIndex}
      />
    </div>
  );
});

interface JobDetailProps {
  job: Job;
  setHours: (id: string, value: number) => void;
  addHours: (id: string, amount: number) => void;
  handleUpdateJobField: (id: string, field: keyof Job, value: any) => void;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  expandedRewards: Record<string, boolean>;
  setExpandedRewards: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  showRewardConfigId: string | null;
  setShowRewardConfigId: React.Dispatch<React.SetStateAction<string | null>>;
  addStatToReward: (jobId: string) => void;
  updateRewardConfig: (jobId: string, config: { stat: StatKey, points: number }[]) => void;
  removeStatFromReward: (jobId: string, index: number) => void;
  expandedGrowth: Record<string, boolean>;
  setExpandedGrowth: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedSynergy: Record<string, boolean>;
  setExpandedSynergy: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setEffectCreator: React.Dispatch<React.SetStateAction<{ jobId: string } | null>>;
  setEditingEffectIndex: React.Dispatch<React.SetStateAction<{ type: 'global' | 'job' | 'title' | 'belief' | 'skill'; index: number; sourceId?: string } | null>>;
  removeEffectFromJob: (jobId: string, effectIndex: number) => void;
  onClose: () => void;
}

const JobDetail: React.FC<JobDetailProps> = React.memo(({
  job,
  setHours,
  addHours,
  handleUpdateJobField,
  setJobs,
  expandedRewards,
  setExpandedRewards,
  showRewardConfigId,
  setShowRewardConfigId,
  addStatToReward,
  updateRewardConfig,
  removeStatFromReward,
  expandedGrowth,
  setExpandedGrowth,
  expandedSynergy,
  setExpandedSynergy,
  setEffectCreator,
  setEditingEffectIndex,
  removeEffectFromJob,
  onClose
}) => {
  const info = useMemo(() => {
    const hours = Number.isNaN(job.hours) ? 0 : (job.hours || 0);
    const L = Math.max(1, Math.floor(Math.sqrt(hours)));
    const start = L === 1 ? 0 : L * L;
    const next = (L + 1) * (L + 1);
    const range = Math.max(1, next - start);
    const currentProgress = Math.max(0, hours - start);
    return { L, start, next, range, currentProgress };
  }, [job.hours]);

  const rank = getRankDetails(info.L);
  const percent = Math.max(0, Math.min(100, (info.currentProgress / info.range) * 100));
  const totalPercent = Math.max(0, Math.min(100, (job.hours / MAX_SKILL_HOURS) * 100));

  return (
    <div className="space-y-8 sm:space-y-16 animate-in fade-in zoom-in-95 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-10">
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${rank.color} animate-pulse shadow-[0_0_15px_currentColor]`} />
            <span className={`text-[10px] sm:text-sm font-black font-orbitron font-bold tracking-[0.2em] sm:tracking-[0.4em] uppercase ${rank.color} opacity-80`}>
              RANK: {rank.label}
            </span>
          </div>
          <textarea 
            className="bg-transparent border-none text-3xl sm:text-6xl font-black font-orbitron text-system-text outline-none w-full border-b border-white/5 focus:border-system-accent/40 transition-all uppercase tracking-tighter pb-2 resize-none overflow-hidden h-auto min-h-[1.2em]"
            value={job.title ?? ''}
            onChange={(e) => {
              handleUpdateJobField(job.id, 'title', e.target.value);
              // Simple auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            rows={1}
            onFocus={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        </div>
        
        <div className="flex items-center justify-between sm:justify-end space-x-6 sm:space-x-10">
          <div className="text-right p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50`} />
            <div className={`relative z-10 text-4xl sm:text-7xl font-black font-orbitron leading-none ${rank.color} ${rank.glow}`}>
              {info.L}
            </div>
            <div className="relative z-10 text-[9px] sm:text-[11px] text-system-text-muted font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2 sm:mt-3 font-orbitron opacity-60">Class Level</div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 sm:p-6 bg-system-bg-panel-solid/95 border border-white/10 rounded-xl sm:rounded-[2rem] text-system-text-muted hover:text-system-accent hover:border-system-accent transition-all duration-500 group backdrop-blur-2xl shadow-2xl"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16">
        {/* Left Column: Core Metrics */}
        <div className="space-y-8 sm:space-y-12">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-3">
              <ICONS.Sparkles className="w-4 h-4 text-system-accent" />
              <h3 className="text-[10px] sm:text-[11px] font-black font-orbitron text-system-accent uppercase tracking-[0.2em] sm:tracking-[0.3em]">Neural Description</h3>
            </div>
            <textarea 
              className="w-full bg-system-accent/5 border border-system-accent/10 rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 text-sm sm:text-base text-system-text-muted font-medium italic leading-relaxed outline-none h-32 sm:h-40 resize-none focus:border-system-accent/40 transition-all duration-500 backdrop-blur-2xl shadow-inner"
              value={job.description ?? ''}
              onChange={(e) => handleUpdateJobField(job.id, 'description', e.target.value)}
              placeholder="Initialize class description..."
            />
          </div>

          <div className="space-y-6 sm:space-y-10 p-6 sm:p-10 bg-system-accent/5 rounded-2xl sm:rounded-[3rem] border border-system-accent/10 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center space-x-3 mb-2 sm:mb-4">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-system-accent" />
              <h3 className="text-[10px] sm:text-[11px] font-black font-orbitron text-system-accent uppercase tracking-[0.2em] sm:tracking-[0.3em]">Evolution Metrics</h3>
            </div>
            
            {/* Level Progress */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-black font-orbitron text-system-text uppercase tracking-[0.1em] sm:tracking-[0.2em]">Level Progress</span>
                  <span className="text-[8px] sm:text-[9px] text-system-text-muted font-bold uppercase tracking-widest opacity-60">Current Evolution Stage</span>
                </div>
                <span className="text-xl sm:text-3xl font-black font-orbitron text-system-accent drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">{Math.round(percent)}%</span>
              </div>
              <div className="relative h-3 sm:h-4 bg-system-accent/5 rounded-full border border-system-accent/10 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="absolute top-0 left-0 h-full bg-system-accent shadow-[0_0_25px_rgba(0,255,157,0.6)]"
                />
                <input 
                  type="range"
                  min="0"
                  max={info.range || 1}
                  step="1"
                  value={info.currentProgress || 0}
                  onChange={(e) => setHours(job.id, info.start + (parseInt(e.target.value) || 0))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
            </div>

            {/* Total Mastery */}
            <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-10 border-t border-white/10">
              <div className="flex justify-between items-end">
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-black font-orbitron text-system-text uppercase tracking-[0.1em] sm:tracking-[0.2em]">Mastery Accumulation</span>
                  <span className="text-[8px] sm:text-[9px] text-system-text-muted font-bold uppercase tracking-widest opacity-60">Total Neural Integration Time</span>
                </div>
                <span className="text-xl sm:text-3xl font-black font-orbitron text-system-accent drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">{Math.round(job.hours || 0)} <span className="text-[9px] sm:text-[11px] text-system-text-muted opacity-60">H</span></span>
              </div>
              <div className="relative h-3 sm:h-4 bg-system-accent/5 rounded-full border border-system-accent/10 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalPercent}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="absolute top-0 left-0 h-full bg-system-accent shadow-[0_0_25px_rgba(0,255,157,0.6)]"
                />
                <input 
                  type="range"
                  min="0"
                  max={MAX_SKILL_HOURS || 10000}
                  step="1"
                  value={job.hours || 0}
                  onChange={(e) => setHours(job.id, parseInt(e.target.value) || 0)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 pt-4 sm:pt-6">
              <button 
                onClick={() => addHours(job.id, 1)} 
                className="flex-1 py-4 sm:py-5 bg-system-accent text-black rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-[12px] font-black font-orbitron hover:bg-system-accent/80 transition-all duration-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-2xl shadow-system-accent/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Inject 1H Neural Data
              </button>
              <button 
                onClick={() => addHours(job.id, -1)} 
                className="p-4 sm:p-5 bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-[1.5rem] text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500 shadow-xl"
              >
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Rewards & Synergies */}
        <div className="space-y-10">
          {/* Rewards Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-system-accent/20 pb-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-orbitron text-sm uppercase tracking-[0.2em] text-system-text">Evolution Rewards</h3>
                  <span className="text-[8px] text-system-text-muted uppercase tracking-widest">Stat bonuses applied per level</span>
                </div>
              </div>
              <button 
                onClick={() => setShowRewardConfigId(showRewardConfigId === job.id ? null : job.id)}
                className={`p-2 rounded-lg transition-all ${showRewardConfigId === job.id ? 'bg-system-accent text-system-bg-base' : 'bg-system-bg-panel-solid/90 text-system-text-muted hover:text-system-accent'}`}
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.rewardConfig && job.rewardConfig.stats && job.rewardConfig.stats.length > 0 ? (
                job.rewardConfig.stats.map((reward, idx) => (
                  <div key={idx} className="p-4 bg-system-bg-panel-solid/80 border border-system-accent/10 rounded-2xl space-y-3 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-auto px-2 h-8 rounded-lg bg-system-accent/5 flex items-center justify-center text-system-accent font-orbitron text-[10px] uppercase">
                          {reward.stat}
                        </div>
                        <span className="text-xs font-orbitron text-system-text">+{reward.points}</span>
                      </div>
                      {showRewardConfigId === job.id && (
                        <button 
                          onClick={() => removeStatFromReward(job.id, idx)}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {showRewardConfigId === job.id && (
                      <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                        <Select 
                          value={reward.stat}
                          onChange={(e) => {
                            const newStats = [...(job.rewardConfig?.stats || [])];
                            newStats[idx].stat = e.target.value as StatKey;
                            updateRewardConfig(job.id, newStats);
                          }}
                          options={Object.values(StatKey).map(sk => ({ label: sk, value: sk }))}
                          className="text-[9px] h-7 flex-1"
                        />
                        <input 
                          type="number"
                          value={reward.points}
                          onChange={(e) => {
                            const newStats = [...(job.rewardConfig?.stats || [])];
                            newStats[idx].points = parseInt(e.target.value) || 0;
                            updateRewardConfig(job.id, newStats);
                          }}
                          className="w-12 bg-system-bg-panel-solid/80 border border-system-accent/20 rounded-lg px-2 py-1 text-[9px] text-system-accent outline-none focus:border-system-accent/50 text-center font-mono"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center border border-dashed border-system-accent/20 rounded-2xl">
                  <p className="text-[10px] text-system-text-muted uppercase tracking-widest font-orbitron">No rewards configured</p>
                </div>
              )}
              
              {showRewardConfigId === job.id && (
                <button 
                  onClick={() => addStatToReward(job.id)}
                  className="col-span-full py-3 border border-dashed border-system-accent/30 rounded-xl text-[10px] font-orbitron text-system-accent hover:bg-system-accent/5 transition-all uppercase tracking-widest"
                >
                  + Add Reward Parameter
                </button>
              )}
            </div>
          </div>

          {/* Growth Analysis */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-system-accent/20 pb-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-system-accent/10 text-system-accent">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-orbitron text-sm uppercase tracking-[0.2em] text-system-text">Growth Analysis</h3>
                  <span className="text-[8px] text-system-text-muted uppercase tracking-widest">Evolution efficiency metrics</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-system-bg-panel-solid/80 border border-system-accent/10 rounded-2xl">
                  <div className="text-[8px] text-system-text-muted uppercase font-orbitron mb-1">Efficiency</div>
                  <div className="text-xl font-orbitron text-system-accent">
                    {(() => {
                      let total = 0;
                      if (job.totalPointsEarned) {
                        Object.values(job.totalPointsEarned).forEach(v => {
                          if (typeof v === 'number') total += v;
                        });
                      }
                      return job.hours > 0 ? (total / job.hours).toFixed(2) : '0.00';
                    })()}
                  </div>
                  <div className="text-[8px] text-system-text-muted uppercase font-orbitron tracking-tighter">Points / Hour</div>
                </div>
                <div className="p-4 bg-system-bg-panel-solid/80 border border-system-accent/10 rounded-2xl">
                  <div className="text-[8px] text-system-text-muted uppercase font-orbitron mb-1">Last Evolution</div>
                  <div className="text-xs font-orbitron text-system-text">
                    {job.growthHistory?.length 
                      ? new Date(job.growthHistory[job.growthHistory.length - 1].timestamp).toLocaleDateString()
                      : 'No Data'}
                  </div>
                  <div className="text-[8px] text-system-text-muted uppercase font-orbitron tracking-tighter">Timeline Entry</div>
                </div>
              </div>

              {job.growthHistory && job.growthHistory.length > 1 && (
                <div className="h-40 w-full bg-system-accent/5 rounded-2xl border border-system-accent/10 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={job.growthHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis stroke="var(--system-text-muted)" fontSize={8} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--system-bg-panel)', border: '1px solid var(--system-border)', borderRadius: '8px', fontSize: '10px', fontFamily: 'Orbitron' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: any) => [`Level ${value}`, 'Evolution']}
                      />
                      <Line type="monotone" dataKey="level" stroke="var(--system-accent)" strokeWidth={2} dot={{ fill: 'var(--system-accent)', r: 2 }} activeDot={{ r: 4, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Synergies Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-system-accent/20 pb-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-system-accent/10 text-system-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-orbitron text-sm uppercase tracking-[0.2em] text-system-text">Class Synergies</h3>
                  <span className="text-[8px] text-system-text-muted uppercase tracking-widest">Embedded neural effects</span>
                </div>
              </div>
              <button 
                onClick={() => setEffectCreator({ jobId: job.id })}
                className="p-2 bg-system-accent/10 text-system-accent hover:bg-system-accent hover:text-system-bg-base rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {job.effects && job.effects.length > 0 ? (
                job.effects.map((effect, idx) => (
                  <div key={idx} className="p-4 sm:p-6 bg-system-bg-panel-solid/80 border border-system-accent/10 rounded-2xl sm:rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-system-accent opacity-40" />
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <h4 className="text-[10px] sm:text-xs font-orbitron text-system-accent uppercase tracking-widest">{effect.name}</h4>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button 
                          onClick={() => setEditingEffectIndex({ type: 'job', index: idx, sourceId: job.id })}
                          className="p-1.5 sm:p-2 text-system-accent hover:bg-system-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => removeEffectFromJob(job.id, idx)}
                          className="p-1.5 sm:p-2 text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-system-text-muted font-light italic leading-relaxed">{effect.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 sm:py-12 text-center border border-dashed border-system-accent/20 rounded-2xl sm:rounded-[2rem]">
                  <p className="text-[9px] sm:text-[10px] text-system-text-muted uppercase tracking-widest font-orbitron">No synergies embedded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-8 sm:pt-12 border-t border-red-500/20">
        <button 
          onClick={() => {
            setJobs(prev => prev.filter(j => j.id !== job.id));
            onClose();
          }}
          className="w-full py-4 sm:py-6 rounded-2xl sm:rounded-3xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center font-orbitron text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em]"
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
          Purge Neural Class Data
        </button>
      </div>
    </div>
  );
});

export default JobsPage;

