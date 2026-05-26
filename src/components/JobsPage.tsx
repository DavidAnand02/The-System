
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

const JobsAnalytics: React.FC = React.memo(() => {
  const jobs = usePlayerStore(state => state.jobs);

  const { totalHours, avgLevel, totalStatsGained, activeSynergiesCount, efficiency } = useMemo(() => {
    const hours = jobs.reduce((acc, j) => acc + (j.hours || 0), 0);
    const totalLevel = jobs.reduce((acc, j) => acc + (j.level || 1), 0);
    const stats = jobs.reduce((acc, j) => {
      if (j.totalPointsEarned) {
        Object.values(j.totalPointsEarned).forEach(v => {
          if (typeof v === 'number') acc += v;
        });
      }
      return acc;
    }, 0);
    const synergies = jobs.reduce((acc, j) => acc + (j.effects?.length || 0), 0);
    const eff = hours > 0 ? (stats / hours).toFixed(2) : '0.00';

    return {
      totalHours: hours,
      avgLevel: jobs.length > 0 ? (totalLevel / jobs.length).toFixed(1) : '1.0',
      totalStatsGained: stats,
      activeSynergiesCount: synergies,
      efficiency: eff,
    };
  }, [jobs]);

  const jobAllocationData = useMemo(() => {
    return jobs
      .map(j => ({ name: j.title, value: j.hours || 0 }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [jobs]);

  const gainedStatsData = useMemo(() => {
    const statSum: Record<string, number> = {};
    jobs.forEach(j => {
      if (j.totalPointsEarned) {
        Object.entries(j.totalPointsEarned).forEach(([stat, val]) => {
          if (typeof val === 'number' && val > 0) {
            const formatted = stat.charAt(0).toUpperCase() + stat.slice(1);
            statSum[formatted] = (statSum[formatted] || 0) + val;
          }
        });
      }
    });
    return Object.entries(statSum)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [jobs]);

  const COLORS = ['var(--system-accent)', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="h-full flex flex-col space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 mb-8 sm:mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left Column: Mastery Distribution */}
        <div className="lg:col-span-4 space-y-4 lg:space-y-6">
          {jobAllocationData.length > 0 ? (
            <div className="bg-system-bg-panel-solid/82 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-system-accent/15 backdrop-blur-2xl shadow-2xl h-full flex flex-col justify-between">
              <h4 className="text-[9px] lg:text-[10px] font-orbitron text-system-text-muted mb-4 lg:mb-6 text-center uppercase tracking-[0.3em] lg:tracking-[0.4em] opacity-60">Mastery Distribution</h4>
              <div className="h-48 lg:h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Pie
                      data={jobAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {jobAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid var(--system-accent)', borderRadius: '24px', fontSize: '10px', fontFamily: 'Orbitron', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', padding: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`${Math.floor(value)}h`, 'Mastery Time']}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'Orbitron', textTransform: 'uppercase', paddingTop: '10px', opacity: 0.8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-system-bg-panel-solid/82 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-system-accent/15 backdrop-blur-2xl shadow-2xl h-full flex flex-col items-center justify-center min-h-[250px]">
              <span className="text-[9px] font-orbitron text-system-text-muted uppercase tracking-[0.3em] opacity-40">No Mastery Data</span>
            </div>
          )}
        </div>

        {/* Middle Column: Gained Stats Allocation */}
        <div className="lg:col-span-4 space-y-4 lg:space-y-6">
          {gainedStatsData.length > 0 ? (
            <div className="bg-system-bg-panel-solid/82 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-system-accent/15 backdrop-blur-2xl shadow-2xl h-full flex flex-col justify-start">
              <h4 className="text-[9px] lg:text-[10px] font-orbitron text-system-text-muted mb-4 lg:mb-6 text-center uppercase tracking-[0.3em] lg:tracking-[0.4em] opacity-60 font-bold">Reward Stat Allocation</h4>
              <div className="space-y-3/2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1 flex flex-col justify-center grow">
                {gainedStatsData.map((stat, idx) => {
                  const maxVal = Math.max(...gainedStatsData.map(d => d.value), 1);
                  const pct = (stat.value / maxVal) * 100;
                  return (
                    <div key={stat.name} className="space-y-1 py-1">
                      <div className="flex justify-between items-center text-[9px] font-orbitron uppercase tracking-widest">
                        <span className="text-system-text font-bold">{stat.name}</span>
                        <span className="text-system-accent font-black">+{stat.value} PTS</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.03] rounded-full border border-white/5 overflow-hidden p-[0.5px]">
                        <div 
                          className="h-full rounded-full bg-system-accent shadow-[0_0_8px_var(--system-accent)] transition-all duration-1000"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-system-bg-panel-solid/82 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-system-accent/15 backdrop-blur-2xl shadow-2xl h-full flex flex-col items-center justify-center min-h-[250px]">
              <span className="text-[9px] font-orbitron text-system-text-muted uppercase tracking-[0.3em] opacity-40">No Reward Stats Gained</span>
            </div>
          )}
        </div>

        {/* Right Column: Mastery Metrics & Efficiency */}
        <div className="lg:col-span-4">
          <div className="bg-system-bg-panel-solid/82 border border-system-accent/15 rounded-2xl lg:rounded-3xl p-6 backdrop-blur-2xl h-full flex flex-col justify-center items-center text-center space-y-4 lg:space-y-5 shadow-2xl relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-system-accent rounded-full blur-[40px] lg:blur-[60px]" />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full relative z-10">
              <div className="space-y-1 bg-white/[0.01] border border-white/5 rounded-xl p-3">
                <span className="block text-[8px] text-system-text-muted uppercase font-orbitron tracking-[0.2em] opacity-60">Avg Level</span>
                <div className="text-xl lg:text-3xl font-black text-system-text tracking-tighter">{avgLevel}</div>
              </div>
              <div className="space-y-1 bg-white/[0.01] border border-white/5 rounded-xl p-3">
                <span className="block text-[8px] text-system-text-muted uppercase font-orbitron tracking-[0.2em] opacity-60">Stat Points</span>
                <div className="text-xl lg:text-3xl font-black text-system-accent tracking-tighter system-glow">+{totalStatsGained}</div>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-system-accent/20 to-transparent relative z-10" />

            <div className="grid grid-cols-2 gap-4 w-full relative z-10">
              <div className="space-y-1 bg-white/[0.01] border border-white/5 rounded-xl p-3">
                <span className="block text-[8px] text-system-text-muted uppercase font-orbitron tracking-[0.2em] opacity-60">Class Paths</span>
                <div className="text-lg lg:text-2xl font-bold text-system-text">{jobs.length}</div>
              </div>
              <div className="space-y-1 bg-white/[0.01] border border-white/5 rounded-xl p-3">
                <span className="block text-[8px] text-system-text-muted uppercase font-orbitron tracking-[0.2em] opacity-60">Active Synergies</span>
                <div className="text-lg lg:text-2xl font-bold text-system-accent">{activeSynergiesCount}</div>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-system-accent/20 to-transparent relative z-10" />

            <div className="space-y-1 relative z-10 w-full bg-system-accent/[0.02] border border-system-accent/10 rounded-xl p-4">
              <span className="block text-[8px] text-system-text-muted uppercase font-orbitron tracking-[0.2em] opacity-60">Class Leveling Efficiency</span>
              <div className="text-2xl lg:text-3xl font-black font-orbitron text-system-accent mt-1">{efficiency}</div>
              <span className="block text-[7px] text-system-text-muted uppercase tracking-widest mt-0.5">Points Earned Per Hour</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

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
      className={`group relative p-6 lg:p-8 rounded-2xl lg:rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-xl ${
        isSelected 
          ? 'bg-gradient-to-b from-[var(--glow-color)]/10 to-[var(--glow-color)]/0' 
          : 'bg-system-bg-panel-solid/82 hover:bg-gradient-to-b hover:from-white/[0.03] hover:to-transparent'
      }`}
      style={{ 
        '--glow-color': rank.glowColor,
        boxShadow: isSelected 
          ? `0 0 30px ${rank.glowColor}20, inset 0 0 15px ${rank.glowColor}10` 
          : '0 4px 20px rgba(0, 0, 0, 0.2)',
        borderColor: isSelected 
          ? `${rank.glowColor}70` 
          : 'rgba(255, 255, 255, 0.05)'
      } as any}
    >
      {/* Holographic Laser Scanner Sweep */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-[var(--glow-color)]/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none rounded-t-[inherit] overflow-hidden">
        <div className="w-full h-full animate-scan-line" />
      </div>

      {/* Cybernetic Dot Matrix Pattern */}
      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:12px_12px] z-0 text-[var(--glow-color)]" />

      {/* Tactile Corner Brackets */}
      <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/20 group-hover:border-[var(--glow-color)]/60 transition-colors duration-300 pointer-events-none z-10" />
      <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/20 group-hover:border-[var(--glow-color)]/60 transition-colors duration-300 pointer-events-none z-10" />
      <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-white/20 group-hover:border-[var(--glow-color)]/60 transition-colors duration-300 pointer-events-none z-10" />
      <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-white/20 group-hover:border-[var(--glow-color)]/60 transition-colors duration-300 pointer-events-none z-10" />

      {/* Rank Badge - Top Left Floating holographic chip */}
      <div 
        className="absolute top-0 left-0 px-3.5 py-1.5 rounded-br-2xl font-orbitron text-[8px] lg:text-[9px] font-bold tracking-[0.2em] z-20 border-r border-b border-white/10 bg-white/[0.03] flex items-center gap-1.5"
      >
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${rank.bgColor} animate-pulse`} style={{ boxShadow: `0 0 6px ${rank.glowColor}` }} />
        <span className="text-system-text-muted opacity-60">RANK</span>
        <span className={`${rank.color} font-black`}>{rank.label}</span>
      </div>



      <div className="mt-10 lg:mt-12 space-y-6 lg:space-y-8 relative z-10">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`font-orbitron text-base lg:text-lg lg:text-xl uppercase tracking-wider font-black break-words transition-colors line-clamp-2 ${isSelected ? 'text-system-accent' : 'text-system-text group-hover:text-system-accent'}`}>
              {job.title}
            </h3>
            <p className="text-[8px] lg:text-[9px] text-system-text-muted uppercase tracking-[0.2em] opacity-60 font-orbitron mt-1.5 break-words line-clamp-2">
              {job.description || 'No neural description initialized for this class.'}
            </p>
          </div>
          
          {/* Tactical Level HUD Capsule */}
          <div className="flex flex-col items-end shrink-0 bg-white/[0.01] pl-3.5 pr-2.5 py-1.5 rounded-r-xl border-y border-r border-white/5 border-l-2 border-l-[var(--glow-color)] min-w-[70px] sm:min-w-[90px] relative overflow-hidden transition-colors" style={{ boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02)` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--glow-color)]/[0.03] to-transparent pointer-events-none" />
            <div className="flex items-baseline gap-0.5 sm:gap-1 relative z-10">
              <span className={`text-xl sm:text-2xl lg:text-3xl font-black font-orbitron ${rank.color} leading-none tracking-tighter`} style={{ textShadow: `0 0 10px ${rank.glowColor}40` }}>{info.L}</span>
              <span className="text-[7px] sm:text-[8px] lg:text-[9px] text-system-text-muted font-bold font-orbitron opacity-50">LV</span>
            </div>
            <div className="text-[6px] sm:text-[7px] lg:text-[8px] font-orbitron text-system-accent uppercase tracking-widest mt-1 opacity-70 whitespace-nowrap relative z-10">
              {Math.floor(job.hours || 0)}H MST
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between text-[8px] lg:text-[9px] font-orbitron uppercase tracking-[0.3em]">
            <span className="text-system-text-muted/60">Level Progress</span>
            <span className={`${rank.color} font-bold`} style={{ textShadow: `0 0 5px ${rank.glowColor}30` }}>{Math.floor(progressPercent)}%</span>
          </div>
          
          {/* Segmented Progress Meter */}
          <div className="relative h-2 bg-white/[0.02] rounded-sm overflow-hidden border border-white/10 p-[1px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className={`h-full rounded-sm ${rank.bgColor} ${isNearCompletion ? 'animate-pulse' : ''} transition-all duration-1000 ease-out`}
              style={{ 
                boxShadow: `0 0 10px ${rank.glowColor}`
              }}
            />
            {/* Holographic segment block separators */}
            <div className="absolute inset-0 flex justify-between pointer-events-none">
              <div className="w-[1.5px] h-full bg-system-bg-base" />
              <div className="w-[1.5px] h-full bg-system-bg-base" />
              <div className="w-[1.5px] h-full bg-system-bg-base" />
              <div className="w-[1.5px] h-full bg-system-bg-base" />
              <div className="w-[1.5px] h-full bg-system-bg-base" />
              <div className="w-[1.5px] h-full bg-system-bg-base" />
              <div className="w-[1.5px] h-full bg-system-bg-base" />
              <div className="w-[1.5px] h-full bg-system-bg-base" />
              <div className="w-[1.5px] h-full bg-system-bg-base" />
            </div>
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

  React.useEffect(() => {
    const handleOpenDetail = () => {
      const currentJobs = usePlayerStore.getState().jobs;
      if (currentJobs.length > 0) {
        setSelectedJobId(currentJobs[0].id);
      }
    };
    const handleCloseDetail = () => {
      setSelectedJobId(null);
    };

    const handleOpenRewards = () => {
      const currentJobs = usePlayerStore.getState().jobs;
      if (currentJobs.length > 0) {
        setSelectedJobId(currentJobs[0].id);
        setShowRewardConfigId(currentJobs[0].id);
      }
    };
    const handleCloseRewards = () => {
      setShowRewardConfigId(null);
    };

    window.addEventListener('open-job-detail', handleOpenDetail);
    window.addEventListener('close-job-detail', handleCloseDetail);
    window.addEventListener('open-job-reward-config', handleOpenRewards);
    window.addEventListener('close-job-reward-config', handleCloseRewards);
    return () => {
      window.removeEventListener('open-job-detail', handleOpenDetail);
      window.removeEventListener('close-job-detail', handleCloseDetail);
      window.removeEventListener('open-job-reward-config', handleOpenRewards);
      window.removeEventListener('close-job-reward-config', handleCloseRewards);
    };
  }, []);

  React.useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (selectedJobId) {
      document.body.style.overflow = 'hidden';
      if (mainContent) mainContent.style.overflowY = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (mainContent) mainContent.style.overflowY = 'auto';
    }
    return () => {
      document.body.style.overflow = '';
      if (mainContent) mainContent.style.overflowY = 'auto';
    };
  }, [selectedJobId]);

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
          <button onClick={onBack} className="p-3 sm:p-4 rounded-2xl bg-system-bg-panel-solid/82 backdrop-blur-2xl hover:bg-system-accent/10 transition-all duration-500 border border-white/10 hover:border-system-accent/50 group shadow-2xl hover:-translate-x-1 shrink-0">
            <ICONS.ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col space-y-1 sm:space-y-2 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-black font-orbitron text-system-accent tracking-[0.2em] sm:tracking-[0.5em] uppercase leading-none drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] truncate">Classes</h1>
            <span className="text-[8px] sm:text-[11px] font-black text-system-accent/50 uppercase tracking-[0.2em] sm:tracking-[0.4em] font-orbitron opacity-70 leading-tight break-words">Class Log & Level Progress Archive</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-system-bg-panel-solid/82 backdrop-blur-2xl p-2 rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="relative flex-1 lg:w-80 group" id="jobs-search">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-system-accent/40 group-focus-within:text-system-accent transition-colors duration-500" />
            <input 
              type="text" 
              placeholder="Filter paths..."
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
              className={`px-3 sm:px-4 py-2.5 rounded-xl border transition-all duration-300 hover-glitch flex items-center justify-center gap-2 font-orbitron text-[9px] uppercase tracking-widest h-[42px] shrink-0 cursor-pointer ${
                !isAnalyticsCollapsed
                  ? 'bg-system-accent text-system-bg-base border-system-accent shadow-[0_0_15px_rgba(0,255,157,0.2)] font-bold'
                  : 'bg-system-bg-panel/40 border-system-accent/20 text-system-accent hover:bg-system-accent/10 hover:border-system-accent/40'
              }`}
              title="Job Analytics Report"
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Job Analytics Report</span>
              <span className="inline sm:hidden">Analytics</span>
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
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-system-bg-panel-solid/82 rounded-3xl border border-system-accent/15 backdrop-blur-md shadow-2xl p-5 sm:p-6"
          >
            <JobsAnalytics />
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
            className="bg-system-bg-panel-solid/82 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-system-accent/30 space-y-4 sm:space-y-6 shadow-2xl shadow-system-accent/5 backdrop-blur-xl mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-system-accent" />
              <h2 className="text-lg sm:text-xl font-orbitron text-system-accent uppercase tracking-[0.1em] sm:tracking-[0.2em]">Initialize Path</h2>
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
                  placeholder="Brief description of the leveling path..."
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
            <p className="font-orbitron text-xs text-system-text-muted uppercase tracking-[0.4em]">No classes detected in current sector.</p>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJobId && (
          <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJobId(null)}
              className="fixed inset-0 bg-system-bg-base/80 backdrop-blur-xl pointer-events-auto"
            />
            {/* Modal Scroll Container Wrapper */}
            <div className="relative min-h-screen flex flex-col items-center justify-start px-2 sm:px-4 md:px-6 lg:px-8 pt-0.5 sm:pt-1 lg:pt-1 pb-16 sm:pb-24 lg:pb-36 pointer-events-none">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-6xl bg-system-bg-panel border border-system-accent/30 rounded-2xl sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,255,157,0.1)] p-4 sm:py-8 sm:px-10 backdrop-blur-3xl pointer-events-auto"
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
              {/* Solid bottom spacer to prevent clipping on tall layouts */}
              <div className="h-24 sm:h-36 lg:h-48 w-full shrink-0 pointer-events-none" />
            </div>
          </div>
        )}
      </AnimatePresence>

      <SynergyModal 
        id="jobs-detail-add-synergy-modal"
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-700 w-full animate-in slide-in-from-right-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 sm:mb-5 px-1 sm:px-0 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-3 sm:mb-4">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${rank.color} animate-pulse shadow-[0_0_15px_currentColor]`} />
            <span className={`text-[10px] sm:text-xs font-black font-orbitron font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase ${rank.color} opacity-80`}>
              RANK: {rank.label}
            </span>
          </div>
          <textarea 
            className="bg-transparent border-none text-2xl sm:text-4xl lg:text-5xl font-black font-orbitron text-system-text outline-none w-full border-b border-white/5 focus:border-system-accent/40 transition-all uppercase tracking-tighter pb-2 resize-none overflow-hidden h-auto min-h-[1.2em]"
            value={job.title ?? ''}
            onChange={(e) => {
              handleUpdateJobField(job.id, 'title', e.target.value);
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
        
        <div className="flex items-center space-x-4 shrink-0 ml-4">
          <div className="text-right p-5 sm:p-7 bg-system-bg-panel-solid/82 border border-system-accent/10 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-system-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-system-accent/10 transition-colors" />
            <div className={`relative z-10 text-4xl sm:text-6xl font-black font-orbitron leading-none ${rank.color} ${rank.glow}`}>
              {info.L}
            </div>
            <div className="relative z-10 text-[7px] sm:text-[9px] text-system-text-muted font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-1.5 font-orbitron opacity-60">Level</div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-system-bg-panel/40 border border-system-accent/10 text-system-text-muted hover:text-system-accent hover:border-system-accent/40 transition-all shadow-2xl backdrop-blur-xl group shrink-0 ml-4"
          >
            <X size={18} className="sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Core Metrics */}
        <div className="col-span-12 lg:col-span-5 space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <ICONS.Sparkles className="w-4 h-4 text-system-accent" />
              <h3 className="text-[10px] sm:text-[11px] font-black font-orbitron text-system-accent uppercase tracking-[0.2em] sm:tracking-[0.3em]">Neural Description</h3>
            </div>
            <textarea 
              className="w-full bg-system-accent/5 border border-system-accent/10 rounded-2xl p-4 sm:p-6 text-xs sm:text-sm text-system-text-muted font-medium italic leading-relaxed outline-none h-24 sm:h-32 resize-none focus:border-system-accent/40 transition-all duration-500 backdrop-blur-2xl shadow-inner-strong"
              value={job.description ?? ''}
              onChange={(e) => handleUpdateJobField(job.id, 'description', e.target.value)}
              placeholder="Initialize class description..."
            />
          </div>

          <div className="space-y-5 sm:space-y-7 p-5 sm:p-7 bg-system-bg-panel-solid/82 border border-system-accent/10 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-system-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-system-accent/10 transition-colors" />
            <div className="flex items-center space-x-3 mb-2 relative z-10">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-system-accent" />
              <h3 className="text-[10px] sm:text-[11px] font-black font-orbitron text-system-accent uppercase tracking-[0.2em] sm:tracking-[0.3em]">Level Metrics</h3>
            </div>
            
            {/* Level Progress */}
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-end px-1">
                <div className="space-y-0.5 min-w-0">
                  <span className="block text-[7px] sm:text-[8px] font-orbitron text-system-accent uppercase tracking-[0.3em] opacity-60 truncate">Level Progress</span>
                  <span className="text-[9px] sm:text-[10px] font-black font-orbitron text-system-text uppercase tracking-[0.1em] truncate">Current Level Stage</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg sm:text-xl font-black font-orbitron text-system-accent system-glow leading-none">{Math.round(percent)}%</span>
                </div>
              </div>
              <div className="relative h-2.5 sm:h-3 bg-system-accent/5 rounded-full border border-system-accent/10 overflow-hidden p-0.5 shadow-inner group/bar animate-pulse-glow">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-system-accent/40 to-system-accent rounded-full shadow-[0_0_15px_var(--system-accent-glow)]"
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
            <div className="space-y-3 pt-5 sm:pt-7 border-t border-white/5 relative z-10">
              <div className="flex justify-between items-end px-1">
                <div className="space-y-0.5 min-w-0">
                  <span className="block text-[7px] sm:text-[8px] font-orbitron text-system-accent uppercase tracking-[0.3em] opacity-60 truncate">Mastery Accumulation</span>
                  <span className="text-[9px] sm:text-[10px] font-black font-orbitron text-system-text uppercase tracking-[0.1em] truncate">Total Neural Integration Time</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg sm:text-xl font-black font-orbitron text-system-accent system-glow leading-none">
                    {Math.round(job.hours || 0)}{' '}
                    <span className="text-[8px] sm:text-[10px] font-orbitron text-system-text-muted uppercase opacity-40">H</span>
                  </span>
                </div>
              </div>
              <div className="relative h-2.5 sm:h-3 bg-system-accent/5 rounded-full border border-system-accent/10 overflow-hidden p-0.5 shadow-inner group/bar">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalPercent}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-system-accent/40 to-system-accent rounded-full shadow-[0_0_15px_var(--system-accent-glow)]"
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

            <div id="jobs-detail-hours-panel" className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 mt-6 relative z-10 lg:max-w-[310px]">
              <button 
                onClick={() => addHours(job.id, 1)} 
                className="flex-1 relative overflow-hidden group px-2.5 sm:px-4 lg:px-2 py-2 sm:py-3.5 lg:py-2 rounded-xl sm:rounded-2xl bg-system-bg-panel-solid/40 border border-system-accent/20 hover:border-system-accent/50 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 sm:gap-3 lg:gap-2"
              >
                <div className="absolute inset-0 bg-system-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-1 sm:p-2 lg:p-1.5 rounded-lg bg-system-accent/10 border border-system-accent/20 group-hover:bg-system-accent/20 transition-colors shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-3.5 lg:h-3.5 text-system-accent group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col items-start min-w-0 font-orbitron">
                  <span className="text-sm sm:text-lg lg:text-xs xl:text-sm font-black text-system-text leading-none tracking-tighter opacity-95">+1H</span>
                  <span className="text-[6px] sm:text-[8px] text-system-accent uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 truncate w-full opacity-60 lg:hidden">Neural Log</span>
                </div>
              </button>
              <button 
                onClick={() => addHours(job.id, 5)} 
                className="flex-1 relative overflow-hidden group px-2.5 sm:px-4 lg:px-2 py-2 sm:py-3.5 lg:py-2 rounded-xl sm:rounded-2xl bg-system-bg-panel-solid/40 border border-system-accent/20 hover:border-system-accent/50 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 sm:gap-3 lg:gap-2"
              >
                <div className="absolute inset-0 bg-system-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-1 sm:p-2 lg:p-1.5 rounded-lg bg-system-accent/10 border border-system-accent/20 group-hover:bg-system-accent/20 transition-colors shrink-0">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-3.5 lg:h-3.5 text-system-accent group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col items-start min-w-0 font-orbitron">
                  <span className="text-sm sm:text-lg lg:text-xs xl:text-sm font-black text-system-text leading-none tracking-tighter opacity-95">+5H</span>
                  <span className="text-[6px] sm:text-[8px] text-system-accent uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 truncate w-full opacity-60 lg:hidden">Neural Log</span>
                </div>
              </button>
              <button 
                onClick={() => addHours(job.id, -1)} 
                className="flex-1 relative overflow-hidden group px-2.5 sm:px-4 lg:px-2 py-2 sm:py-3.5 lg:py-2 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-500 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 sm:gap-3 lg:gap-2"
              >
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-1 sm:p-2 lg:p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-3.5 lg:h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col items-start min-w-0 font-orbitron">
                  <span className="text-sm sm:text-lg lg:text-xs xl:text-sm font-black text-red-500 leading-none tracking-tighter opacity-95">-1H</span>
                  <span className="text-[6px] sm:text-[8px] text-red-500 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 truncate w-full opacity-60 font-medium lg:hidden">Subtract</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Rewards & Synergies */}
        <div className="col-span-12 lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Rewards Section */}
          <div id="jobs-detail-level-rewards" className="space-y-4">
            <div className="flex items-center justify-between border-b border-system-accent/20 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-orbitron text-xs sm:text-sm uppercase tracking-[0.2em] text-system-text leading-none">Level Rewards</h3>
                  <span className="text-[7px] sm:text-[8px] text-system-text-muted uppercase tracking-widest mt-0.5 block opacity-60">Stat bonuses applied per level</span>
                </div>
              </div>
              <button 
                id="jobs-detail-reward-config-toggle-btn"
                onClick={() => setShowRewardConfigId(showRewardConfigId === job.id ? null : job.id)}
                className={`p-1.5 rounded-lg transition-all ${showRewardConfigId === job.id ? 'bg-system-accent text-system-bg-base shadow-[0_0_8px_var(--system-accent-glow)]' : 'bg-system-bg-panel/40 text-system-text-muted hover:text-system-accent'}`}
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.rewardConfig && job.rewardConfig.stats && job.rewardConfig.stats.length > 0 ? (
                job.rewardConfig.stats.map((reward, idx) => (
                  <div key={idx} className="p-3 bg-system-bg-panel/40 border border-system-accent/10 rounded-2xl space-y-2 group backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-auto px-1.5 h-6 rounded-md bg-system-accent/5 flex items-center justify-center text-system-accent font-orbitron text-[8px] uppercase">
                          {reward.stat}
                        </div>
                        <span className="text-xs font-orbitron text-system-text">+{reward.points}</span>
                      </div>
                      {showRewardConfigId === job.id && (
                        <button 
                          onClick={() => removeStatFromReward(job.id, idx)}
                          className="p-1 text-red-400 hover:bg-red-400/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {showRewardConfigId === job.id && (
                      <div className="flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200">
                        <Select 
                          value={reward.stat}
                          onChange={(e) => {
                            const newStats = [...(job.rewardConfig?.stats || [])];
                            newStats[idx].stat = e.target.value as StatKey;
                            updateRewardConfig(job.id, newStats);
                          }}
                          options={Object.values(StatKey).map(sk => ({ label: sk, value: sk }))}
                          className="text-[8px] h-6 flex-1 px-1.5"
                        />
                        <input 
                          type="number"
                          value={reward.points}
                          onChange={(e) => {
                            const newStats = [...(job.rewardConfig?.stats || [])];
                            newStats[idx].points = parseInt(e.target.value) || 0;
                            updateRewardConfig(job.id, newStats);
                          }}
                          className="w-10 bg-system-bg-panel/40 border border-system-accent/20 rounded-md px-1.5 py-0.5 text-[8px] text-system-accent outline-none focus:border-system-accent/50 text-center font-mono h-6"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-6 text-center border border-dashed border-system-accent/10 rounded-2xl bg-system-bg-panel/10">
                  <p className="text-[8px] text-system-text-muted uppercase tracking-widest font-orbitron opacity-60">No rewards configured</p>
                </div>
              )}
              
              {showRewardConfigId === job.id && (
                <button 
                  id="jobs-detail-add-reward-btn"
                  onClick={() => addStatToReward(job.id)}
                  className="col-span-full py-2 border border-dashed border-system-accent/20 rounded-xl text-[8px] font-orbitron text-system-accent hover:bg-system-accent/5 transition-all uppercase tracking-widest"
                >
                  + Add Reward Parameter
                </button>
              )}
            </div>
          </div>

          {/* Growth Analysis */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-system-accent/20 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-system-accent/10 text-system-accent">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-orbitron text-xs sm:text-sm uppercase tracking-[0.2em] text-system-text leading-none">Growth Analysis</h3>
                  <span className="text-[7px] sm:text-[8px] text-system-text-muted uppercase tracking-widest mt-0.5 block opacity-60">Level progress metrics</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-system-bg-panel/40 border border-system-accent/10 rounded-2xl backdrop-blur-md">
                  <div className="text-[7px] sm:text-[8px] text-system-text-muted uppercase font-orbitron mb-0.5">Efficiency</div>
                  <div className="text-base sm:text-lg font-orbitron text-system-accent leading-tight">
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
                  <div className="text-[7px] sm:text-[8px] text-system-text-muted uppercase font-orbitron tracking-tighter opacity-60">Points / Hour</div>
                </div>
                <div className="p-3 bg-system-bg-panel/40 border border-system-accent/10 rounded-2xl backdrop-blur-md">
                  <div className="text-[7px] sm:text-[8px] text-system-text-muted uppercase font-orbitron mb-0.5">Last Level Up</div>
                  <div className="text-xs font-orbitron text-system-text leading-tight">
                    {job.growthHistory?.length 
                      ? new Date(job.growthHistory[job.growthHistory.length - 1].timestamp).toLocaleDateString()
                      : 'No Data'}
                  </div>
                  <div className="text-[7px] sm:text-[8px] text-system-text-muted uppercase font-orbitron tracking-tighter opacity-60">Timeline Entry</div>
                </div>
              </div>

              {job.growthHistory && job.growthHistory.length > 1 && (
                <div className="h-32 w-full bg-system-accent/5 rounded-2xl border border-system-accent/10 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={job.growthHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis stroke="var(--system-text-muted)" fontSize={8} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--system-bg-panel)', border: '1px solid var(--system-border)', borderRadius: '8px', fontSize: '10px', fontFamily: 'Orbitron' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: any) => [`Level ${value}`, 'Level Progress']}
                      />
                      <Line type="monotone" dataKey="level" stroke="var(--system-accent)" strokeWidth={2} dot={{ fill: 'var(--system-accent)', r: 1.5 }} activeDot={{ r: 3, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Synergies Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-system-accent/20 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-system-accent/10 text-system-accent">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-orbitron text-xs sm:text-sm uppercase tracking-[0.2em] text-system-text leading-none">Class Synergies</h3>
                  <span className="text-[7px] sm:text-[8px] text-system-text-muted uppercase tracking-widest mt-0.5 block opacity-60">Embedded neural effects</span>
                </div>
              </div>
              <button 
                id="jobs-detail-add-synergy-btn"
                onClick={() => setEffectCreator({ jobId: job.id })}
                className="p-1.5 bg-system-accent/10 text-system-accent hover:bg-system-accent hover:text-system-bg-base rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {job.effects && job.effects.length > 0 ? (
                job.effects.map((effect, idx) => (
                  <div key={idx} className="p-4 bg-system-bg-panel/40 border border-system-accent/10 rounded-2xl relative overflow-hidden group backdrop-blur-md">
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-system-accent opacity-40" />
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-[9px] sm:text-[10px] font-orbitron text-system-accent uppercase tracking-widest">{effect.name}</h4>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setEditingEffectIndex({ type: 'job', index: idx, sourceId: job.id })}
                          className="p-1 text-system-accent hover:bg-system-accent/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => removeEffectFromJob(job.id, idx)}
                          className="p-1 text-red-400 hover:bg-red-400/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[8px] sm:text-[9px] text-system-text-muted font-light italic leading-relaxed">{effect.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-6 sm:py-8 text-center border border-dashed border-system-accent/20 rounded-2xl bg-system-bg-panel/10">
                  <p className="text-[8px] sm:text-[9px] text-system-text-muted uppercase tracking-widest font-orbitron opacity-60">No synergies embedded</p>
                </div>
              )}
            </div>
          </div>

          {/* Neural Maintenance - Compact Purge Button */}
          <div className="flex justify-end pt-2">
            {!showDeleteConfirm ? (
              <button
                id="jobs-purge-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-fit px-5 py-2.5 flex items-center justify-center gap-2 rounded-xl border border-red-500/40 text-red-500 hover:text-red-400 hover:border-red-500/60 hover:bg-red-500/10 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)] transition-all duration-300 font-orbitron text-[9px] uppercase tracking-[0.2em] font-bold group cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-red-500" />
                <span>Purge Class</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-48 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setJobs(prev => prev.filter(j => j.id !== job.id));
                    onClose();
                  }}
                  className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all font-orbitron text-[9px] uppercase tracking-[0.2em] font-bold cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-1.5 bg-system-bg-panel border border-system-accent/20 text-system-text-muted hover:text-system-text rounded-xl transition-all font-orbitron text-[9px] uppercase tracking-[0.2em] cursor-pointer"
                >
                  Abort
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default JobsPage;

