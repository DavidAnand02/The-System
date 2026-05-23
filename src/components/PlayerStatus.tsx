import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2,
  Save,
  RefreshCw,
  Star,
  Shield,
  Zap,
  Activity,
  ChevronLeft,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  PlayerData, 
  StatKey, 
  Job, 
  Title, 
  Belief, 
  Effect, 
  StatBoost
} from '../types';
import { 
  ICONS, 
  STAT_DESCRIPTIONS, 
  getLevelThreshold, 
  getLevelFromStats, 
  getRankDetails, 
  RecalibrateIcon 
} from '../constants';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useSystemSynergy } from '../hooks/useSystemSynergy';
import StatMatrix from './player/StatMatrix';
import IdentityMatrix from './player/IdentityMatrix';
import ArchiveSystem from './player/ArchiveSystem';
import SynergyStorage from './player/SynergyStorage';
import StatBoostEditor from './StatBoostEditor';

import { 
  usePlayerStore,
  selectPlayerActions,
  selectPlayerJobs,
  selectPlayerTitles,
  selectPlayerBeliefs
} from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useSound } from '../contexts/SoundContext';
import { Modal } from './ui/Modal';
import { CollapsibleCard } from './ui/CollapsibleCard';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { TitleModal } from './modals/TitleModal';
import { BeliefModal } from './modals/BeliefModal';
import { SynergyModal } from './modals/SynergyModal';
import { EffectDetailModal } from './modals/EffectDetailModal';
import { motion } from 'motion/react';

import { useNotification } from '../contexts/NotificationContext';

interface PlayerStatusProps {
  onBack: () => void;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = React.memo(({ 
  onBack
}) => {
  const player = usePlayerStore(state => state.player);
  const jobs = usePlayerStore(selectPlayerJobs);
  const titles = usePlayerStore(selectPlayerTitles);
  const beliefs = usePlayerStore(selectPlayerBeliefs);
  const skills = usePlayerStore(state => state.skills);
  
  const { 
    setPlayer, 
    setJobs, 
    setTitles, 
    setBeliefs,
    setSkills
  } = usePlayerStore(useShallow(selectPlayerActions));

  const { playSuccess, setIsSyncing } = useSound();
  const { notify } = useNotification();
  
  // DIAGNOSTIC LOG
  useEffect(() => {
    console.log('[DIAGNOSTIC] PlayerStatus: titles updated', {
      count: titles.length,
      titles: titles.map(t => t.name)
    });
  }, [titles]);

  // Hooks
  const { 
    actualTotalStats, 
    updateStat, 
    applyProjection 
  } = usePlayerStats(player, setPlayer);

  const { 
    effectiveStats, 
    effectiveTotalStats,
    allEffects, 
    isEffectActive 
  } = useSystemSynergy(player, jobs, titles, beliefs, skills);

  // UI State
  const [isIdentificationCollapsed, setIsIdentificationCollapsed] = useState(false);
  const [isIdentityMatrixCollapsed, setIsIdentityMatrixCollapsed] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [isProjecting, setIsProjecting] = useState(false);
  const [simulatedTotal, setSimulatedTotal] = useState(actualTotalStats);

  // Sync simulated total with actual total when not projecting
  useEffect(() => {
    if (!isProjecting) {
      setSimulatedTotal(actualTotalStats);
    }
  }, [actualTotalStats, isProjecting]);

  // Archive Search State
  const [titleSearchTerm, setTitleSearchTerm] = useState('');
  const [beliefSearchTerm, setBeliefSearchTerm] = useState('');
  const [effectSearchTerm, setEffectSearchTerm] = useState('');
  const [effectTypeFilter, setEffectTypeFilter] = useState<'all' | 'passive' | 'active'>('all');

  // Form States
  const [showAddTitleForm, setShowAddTitleForm] = useState(false);
  const [showAddBeliefForm, setShowAddBeliefForm] = useState(false);
  const [showAddEffectForm, setShowAddEffectForm] = useState(false);

  // Effect Creator States
  const [titleEffectCreator, setTitleEffectCreator] = useState<{ titleId: string } | null>(null);
  const [beliefEffectCreator, setBeliefEffectCreator] = useState<{ beliefId: string } | null>(null);

  // Editing States
  const [editingEffectIndex, setEditingEffectIndex] = useState<{ type: 'global' | 'job' | 'title' | 'belief'; index: number; sourceId?: string } | null>(null);

  // Filtering Logic
  const filteredTitles = useMemo(() => {
    if (!titleSearchTerm.trim()) return titles;
    const lowSearch = titleSearchTerm.toLowerCase();
    return titles.filter(t => (t.name || '').toLowerCase().includes(lowSearch) || (t.description || '').toLowerCase().includes(lowSearch));
  }, [titles, titleSearchTerm]);

  const filteredBeliefs = useMemo(() => {
    if (!beliefSearchTerm.trim()) return beliefs;
    const lowSearch = beliefSearchTerm.toLowerCase();
    return beliefs.filter(b => (b.name || '').toLowerCase().includes(lowSearch) || (b.description || '').toLowerCase().includes(lowSearch));
  }, [beliefs, beliefSearchTerm]);

  const filteredEffects = useMemo(() => {
    const filtered = allEffects.filter(eff => {
      const matchesSearch = !effectSearchTerm.trim() || 
        (eff.name || '').toLowerCase().includes(effectSearchTerm.toLowerCase()) || 
        (eff.description || '').toLowerCase().includes(effectSearchTerm.toLowerCase());
      const matchesType = effectTypeFilter === 'all' || eff.type === effectTypeFilter;
      return matchesSearch && matchesType;
    });

    return [...filtered].sort((a, b) => {
      const aActive = isEffectActive(a, a.sourceTitle, a.sourceJob, a.sourceBelief);
      const bActive = isEffectActive(b, b.sourceTitle, b.sourceJob, b.sourceBelief);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return 0;
    });
  }, [allEffects, effectSearchTerm, effectTypeFilter, isEffectActive]);

  // Handlers
  const handleApplyProjection = React.useCallback(async () => {
    setIsSyncing(true);
    try {
      // Add a small delay to show the sync animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      applyProjection(simulatedTotal);
      setIsProjecting(false);
      setShowSyncConfirm(false);
      playSuccess();
      notify('success', 'Neural Sync Complete', 'Mastery projection has been integrated into your core matrix.');
    } catch (error) {
      console.error('Projection sync failed:', error);
      notify('error', 'Sync Failed', 'Failed to synchronize neural data.');
    } finally {
      setIsSyncing(false);
    }
  }, [applyProjection, simulatedTotal, setIsSyncing, playSuccess, notify]);

  const handleSliderChange = React.useCallback((val: number) => {
    setSimulatedTotal(val);
    setIsProjecting(true);
  }, []);

  const handleAbortProjection = React.useCallback(() => {
    setIsProjecting(false);
    setShowSyncConfirm(false);
  }, []);

  const handleInfoChange = React.useCallback((field: keyof PlayerData, value: string, index: number = 0) => {
    if (field === 'equippedJobs' || field === 'equippedTitles' || field === 'equippedBeliefs') {
      setPlayer(prev => {
        // Determine the base array to work with
        let currentArray: string[] = [];
        if (prev[field]) {
          currentArray = [...(prev[field] as string[])];
        } else {
          // Fallback to deprecated fields if array doesn't exist yet
          if (field === 'equippedJobs') currentArray = [prev.jobClass];
          else if (field === 'equippedTitles') currentArray = [prev.title];
          else if (field === 'equippedBeliefs') currentArray = [prev.belief];
        }

        // Check for duplicates
        if (value !== '' && currentArray.some((val, i) => i !== index && val === value)) {
          notify('error', 'Equip Failed', `This ${field.replace('equipped', '').slice(0, -1).toLowerCase()} is already equipped in another slot.`);
          return prev;
        }

        const newArray = [...currentArray];
        // Ensure array is long enough
        while (newArray.length <= index) {
          newArray.push('');
        }
        newArray[index] = value;
        
        // Also update the deprecated field for backward compatibility if it's the first slot
        const updates: Partial<PlayerData> = { [field]: newArray };
        if (index === 0) {
          if (field === 'equippedJobs') updates.jobClass = value;
          else if (field === 'equippedTitles') updates.title = value;
          else if (field === 'equippedBeliefs') updates.belief = value;
        }

        return { ...prev, ...updates };
      });
    } else {
      setPlayer(prev => ({ ...prev, [field]: value }));
    }
  }, [setPlayer, notify]);

  const handleUpdateTitleField = React.useCallback((id: string, field: keyof Title, value: string) => {
    setTitles(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    
    if (field === 'name') {
      setPlayer(prev => {
        const oldTitle = titles.find(t => t.id === id);
        if (!oldTitle) return prev;

        const updates: Partial<PlayerData> = {};
        
        // Update deprecated single title if it matches
        if (prev.title === oldTitle.name) {
          updates.title = value;
        }

        // Update equippedTitles array if it contains the old name
        if (prev.equippedTitles?.includes(oldTitle.name)) {
          updates.equippedTitles = prev.equippedTitles.map(t => t === oldTitle.name ? value : t);
        }

        if (Object.keys(updates).length > 0) {
          return { ...prev, ...updates };
        }
        
        return prev;
      });
    }
  }, [titles, setPlayer, setTitles]);

  const handleUpdateBeliefField = React.useCallback((id: string, field: keyof Belief, value: string) => {
    setBeliefs(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    
    if (field === 'name') {
      setPlayer(prev => {
        const oldBelief = beliefs.find(b => b.id === id);
        if (!oldBelief) return prev;

        const updates: Partial<PlayerData> = {};

        // Update deprecated single belief if it matches
        if (prev.belief === oldBelief.name) {
          updates.belief = value;
        }

        // Update equippedBeliefs array if it contains the old name
        if (prev.equippedBeliefs?.includes(oldBelief.name)) {
          updates.equippedBeliefs = prev.equippedBeliefs.map(b => b === oldBelief.name ? value : b);
        }

        if (Object.keys(updates).length > 0) {
          return { ...prev, ...updates };
        }

        return prev;
      });
    }
  }, [beliefs, setPlayer, setBeliefs]);


  const isEffectActiveWrapper = React.useCallback((eff: any) => {
    return isEffectActive(eff, eff.sourceTitle, eff.sourceJob, eff.sourceBelief, eff.sourceSkill);
  }, [isEffectActive]);

  const currentDisplayTotal = Number.isNaN(isProjecting ? simulatedTotal : effectiveTotalStats) ? 0 : (isProjecting ? simulatedTotal : effectiveTotalStats);
  const L = getLevelFromStats(currentDisplayTotal);
  const start = getLevelThreshold(L);
  const next = getLevelThreshold(L + 1);
  const range = Math.max(1, next - start);
  const currentProgress = Math.max(0, currentDisplayTotal - start);
  const currentDisplayLevel = L;
  const progressPercent = L >= 100 ? 100 : Math.min(100, (currentProgress / range) * 100);
  const rank = getRankDetails(currentDisplayLevel);



  return (
    <div className="w-full space-y-8 animate-in slide-in-from-bottom duration-700 pb-20">
      <div className="flex items-center space-x-6">
        <button onClick={onBack} className="p-3 rounded-xl bg-system-bg-panel-solid/95 backdrop-blur-2xl hover:bg-system-accent/10 transition-all duration-500 border border-white/10 hover:border-system-accent/50 group shadow-2xl hover:-translate-x-1">
          <ICONS.ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="space-y-1">
          <h1 className="text-2xl font-black font-orbitron text-system-text tracking-[0.4em] uppercase leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">Status Protocol</h1>
          <p className="text-[10px] text-system-text-muted font-black uppercase tracking-[0.2em] opacity-70">System Identification & Attribute Matrix</p>
        </div>
      </div>

      {/* TOP ROW: IDENTITY HEADER (FULL WIDTH) */}
      <header className="relative group mb-8">
        <div className="absolute -left-4 top-0 w-1 h-full bg-system-accent shadow-[0_0_20px_var(--system-accent-glow)] rounded-full" />
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-system-accent/70 font-orbitron">Identification</span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-system-accent/40 via-system-accent/10 to-transparent" />
          </div>
          <div className="flex flex-col space-y-1">
            <input 
              type="text"
              id="status-username-input"
              value={player.username}
              onChange={(e) => handleInfoChange('username', e.target.value)}
              placeholder="PLAYER"
              className="w-full text-4xl md:text-6xl font-black text-system-text bg-transparent border-none outline-none focus:ring-0 p-0 uppercase tracking-tighter font-orbitron drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:text-system-accent transition-colors duration-500"
            />
            <div className="flex items-center space-x-3 mt-1">
              <div className="p-1 rounded-lg bg-system-accent/10 border border-system-accent/20">
                <ICONS.Star className="w-3.5 h-3.5 text-system-accent" />
              </div>
              <span id="status-title-display" className="text-base font-black text-system-accent/90 uppercase tracking-[0.15em] font-orbitron drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                {player.equippedTitles?.[0] || player.title || 'NO TITLE'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID: TETRIS-LIKE PACKING */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.8fr_1.2fr] gap-8 items-start relative z-20">
        {/* TABLET 2-COLUMN WRAPPER */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:contents">
          {/* COLUMN 1: RANK & IDENTITY */}
          <div className="space-y-8 flex flex-col">
          {/* RANK DISPLAY - ISOLATED & HOLOGRAPHIC */}
          <div id="status-rank-card" className="relative group/rank flex flex-col items-center justify-center shrink-0 p-8 bg-system-bg-panel-solid/95 backdrop-blur-sm border border-white/5 rounded-2xl min-h-[320px] overflow-hidden">
            {/* Primary Glow */}
            <motion.div 
              key={`primary-${rank.label}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: rank.label === 'C' ? 0.05 : 0.15 }}
              className={`absolute -inset-20 rounded-full blur-[6rem] ${rank.color.replace('text-', 'bg-')}`} 
              transition={{ duration: 1.5 }}
            />
            {/* Secondary Core Glow */}
            <motion.div 
              key={`secondary-${rank.label}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: rank.label === 'C' ? 0.08 : 0.25 }}
              className={`absolute inset-0 rounded-full blur-[3rem] ${rank.color.replace('text-', 'bg-')}`}
              transition={{ duration: 1 }}
            />
            
            {/* Label - Top Left */}
            <div className="absolute top-8 left-8 flex flex-col z-20">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-system-text-muted font-orbitron opacity-50 leading-tight">Current</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-system-text-muted font-orbitron opacity-50 leading-tight">Rank</span>
            </div>

            <div className="relative flex-1 flex items-center justify-center w-full">
              <motion.div 
                key={rank.label}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`text-[11rem] md:text-[13rem] font-black font-orbitron leading-none ${rank.color} ${rank.glow} cursor-default tracking-[-0.05em] select-none`}
              >
                {rank.label}
              </motion.div>
            </div>
          </div>

          {/* IDENTITY MATRIX (VERTICAL STACK) */}
          <div id="status-equipped" className="flex flex-col w-full relative">
            <IdentityMatrix 
              player={player}
              jobs={jobs}
              titles={titles}
              beliefs={beliefs}
              handleInfoChange={handleInfoChange}
              className="grid grid-cols-1 gap-4"
            />
          </div>

          {/* STAT MATRIX (TABLET ONLY - slots under identity to fill gap) */}
          <div className="hidden md:block lg:hidden w-full">
            <div id="status-radar-tablet" className="flex flex-col w-full relative">
              <StatMatrix 
                player={player}
                effectiveStats={effectiveStats}
                actualTotalStats={actualTotalStats}
                updateStat={updateStat}
              />
            </div>
          </div>
        </div>

        {/* COLUMN 2: LEVEL & SIMULATION */}
        <div className="space-y-8 flex flex-col">
          {/* LEVEL & SIMULATION PANEL - RE-CONTAINED */}
          <div id="status-level-panel" className="flex-1 flex flex-col gap-8 bg-system-bg-panel-solid/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-system-accent/20" />
            
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-system-text-muted font-orbitron opacity-70">System Level</span>
                <div className="text-6xl font-black font-orbitron text-system-text tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  {currentDisplayLevel}
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-system-text-muted font-orbitron opacity-70">Mastery Points</span>
                <div className="text-2xl font-black font-orbitron text-system-accent leading-none drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  {currentDisplayTotal.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.8, ease: "circOut" }}
                  className="absolute top-0.5 left-0.5 h-[calc(100%-4px)] bg-gradient-to-r from-system-accent/40 to-system-accent rounded-full shadow-[0_0_25px_var(--system-accent-glow)]"
                />
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-system-text-muted font-orbitron">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-system-accent animate-pulse shadow-[0_0_8px_var(--system-accent-glow)]" />
                  EXP PROGRESS
                </span>
                <span className="text-system-accent drop-shadow-[0_0_5px_rgba(6,182,212,0.4)]">{Math.floor(progressPercent)}%</span>
              </div>
            </div>

            {/* SIMULATION SLIDER */}
            <div className="pt-4 space-y-3 bg-black/30 rounded-xl p-5 border border-white/10 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/90 font-orbitron flex items-center gap-3">
                  <RecalibrateIcon className="w-3.5 h-3.5" /> Mastery Simulation
                </span>
                {isProjecting && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setShowSyncConfirm(true)}
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 hover:text-amber-400 transition-all bg-amber-500/10 px-4 py-1.5 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 shadow-lg shadow-amber-500/5"
                  >
                    [ AUTHORIZE SYNC ]
                  </motion.button>
                )}
              </div>
              <div className="relative h-2 bg-black/50 rounded-full group shadow-inner border border-white/5">
                <div 
                  className="absolute top-0 left-0 h-full bg-amber-500/40 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  style={{ width: `${Math.min(100, Math.max(0, ((currentDisplayLevel + (currentProgress / range) - 1) / 99) * 100))}%` }}
                />
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={Math.min(100, Math.max(0, ((currentDisplayLevel + (currentProgress / range) - 1) / 99) * 100))}
                  onChange={(e) => {
                    const pos = parseFloat(e.target.value);
                    const levelFloat = 1 + (pos / 100) * 99;
                    const level = Math.floor(levelFloat);
                    const progress = levelFloat - level;
                    const startThreshold = getLevelThreshold(level);
                    const nextThreshold = getLevelThreshold(level + 1);
                    const val = startThreshold + progress * (nextThreshold - startThreshold);
                    handleSliderChange(Math.round(val));
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
              <p className="text-[10px] text-amber-500/50 font-black uppercase tracking-[0.3em] text-center italic">
                Projecting potential system evolution...
              </p>
            </div>
          </div>

          {/* ARCHIVE SYSTEM - MOVED HERE TO FILL GAP */}
          <div id="status-archive-system" className="relative z-10 flex flex-col w-full">
            <ArchiveSystem 
              player={player}
              titles={titles}
              beliefs={beliefs}
              titleSearchTerm={titleSearchTerm}
              setTitleSearchTerm={setTitleSearchTerm}
              beliefSearchTerm={beliefSearchTerm}
              setBeliefSearchTerm={setBeliefSearchTerm}
              setShowAddTitleForm={setShowAddTitleForm}
              setShowAddBeliefForm={setShowAddBeliefForm}
              handleUpdateTitleField={handleUpdateTitleField}
              handleUpdateBeliefField={handleUpdateBeliefField}
              setTitleEffectCreator={setTitleEffectCreator}
              setBeliefEffectCreator={setBeliefEffectCreator}
              filteredTitles={filteredTitles}
              filteredBeliefs={filteredBeliefs}
              className="grid grid-cols-1 xl:grid-cols-2 gap-4"
            />
          </div>
        </div>
        </div>
        {/* END TABLET WRAPPER */}

        {/* COLUMN 3: STAT MATRIX (DESKTOP ONLY) */}
        <div className="hidden lg:block lg:sticky lg:top-24">
          <div id="status-radar" className="flex flex-col w-full relative">
            <StatMatrix 
              player={player}
              effectiveStats={effectiveStats}
              actualTotalStats={actualTotalStats}
              updateStat={updateStat}
            />
          </div>
        </div>

        {/* STAT MATRIX (MOBILE ONLY) */}
        <div className="block md:hidden w-full">
          <div id="status-radar-mobile" className="flex flex-col w-full relative">
            <StatMatrix 
              player={player}
              effectiveStats={effectiveStats}
              actualTotalStats={actualTotalStats}
              updateStat={updateStat}
            />
          </div>
        </div>
      </div>

      <div id="status-synergy-storage" className="flex flex-col w-full relative">
        <SynergyStorage 
          player={player}
          effectSearchTerm={effectSearchTerm}
          setEffectSearchTerm={setEffectSearchTerm}
          effectTypeFilter={effectTypeFilter}
          setEffectTypeFilter={setEffectTypeFilter}
          setShowAddEffectForm={setShowAddEffectForm}
          filteredEffects={filteredEffects}
          isEffectActive={isEffectActiveWrapper}
          setEditingEffectIndex={setEditingEffectIndex}
        />
      </div>


      {/* Sync Confirmation Modal */}
      <Modal
        isOpen={showSyncConfirm}
        onClose={handleAbortProjection}
        title="System Directive"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle className="text-amber-500 shrink-0" size={24} />
            <p className="text-xs text-system-text-muted leading-relaxed font-light uppercase tracking-tighter">
              <span className="text-amber-500 font-bold">Warning:</span> Synchronizing your mastery projection will redistribute all attribute points across the core matrix.
            </p>
          </div>
          
          <div className="bg-system-bg-panel-solid p-4 rounded-xl border border-system-border text-center">
            <div className="text-[10px] text-system-text-muted uppercase font-orbitron mb-1">Projected Total Mastery</div>
            <div className="text-3xl font-orbitron text-system-accent">{simulatedTotal} <span className="text-xs text-system-text-muted">pts</span></div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleApplyProjection} 
              className="w-full py-4"
            >
              AUTHORIZE SYNC
            </Button>
            <Button 
              variant="secondary"
              onClick={handleAbortProjection} 
              className="w-full py-3 text-xs"
            >
              ABORT PROTOCOL
            </Button>
          </div>
        </div>
      </Modal>

      {/* Title Creator Modal */}
      <TitleModal 
        isOpen={showAddTitleForm}
        onClose={() => setShowAddTitleForm(false)}
      />

      {/* Title Effect Modal */}
      <SynergyModal 
        isOpen={!!titleEffectCreator}
        onClose={() => setTitleEffectCreator(null)}
        title="Embed Title Synergy"
        target={titleEffectCreator ? { type: 'title', id: titleEffectCreator.titleId } : null}
      />

      {/* Belief Creator Modal */}
      <BeliefModal 
        isOpen={showAddBeliefForm}
        onClose={() => setShowAddBeliefForm(false)}
      />

      {/* Belief Effect Modal */}
      <SynergyModal 
        isOpen={!!beliefEffectCreator}
        onClose={() => setBeliefEffectCreator(null)}
        title="Embed Belief Synergy"
        target={beliefEffectCreator ? { type: 'belief', id: beliefEffectCreator.beliefId } : null}
      />

      {/* Effect Detail Overlay */}
      <EffectDetailModal 
        isOpen={editingEffectIndex !== null}
        onClose={() => setEditingEffectIndex(null)}
        target={editingEffectIndex}
      />

      {/* General Effect Modal */}
      <SynergyModal 
        isOpen={showAddEffectForm}
        onClose={() => setShowAddEffectForm(false)}
        title="Register Protocol"
        target={{ type: 'general' }}
        submitLabel="AUTHORIZE"
      />
    </div>
  );
});

export default PlayerStatus;
