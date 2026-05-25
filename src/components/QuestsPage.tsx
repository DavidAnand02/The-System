
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quest, SubQuest, StatKey, PlayerData, QuestLogEntry } from '../types';
import { ICONS } from '../constants';
import { Select } from './ui/Select';

import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useSound } from '../contexts/SoundContext';

interface QuestsPageProps {
  onBack: () => void;
  onQuestOutcome?: (quest: Quest, outcome: 'completed' | 'failed') => void;
}

type TabType = 'recurring' | 'one-off' | 'recent-history' | 'log';
type SortOption = 'deadline' | 'streak' | 'title';

const calculateNextRefresh = (interval: number, unit: 'minutes' | 'hours' | 'days', timeStr: string) => {
  const target = new Date();
  if (unit === 'days') {
    const [h, m] = timeStr.split(':').map(Number);
    target.setHours(h, m, 0, 0);
    while (target <= new Date()) {
      target.setDate(target.getDate() + interval);
    }
  } else if (unit === 'hours') {
    target.setHours(target.getHours() + interval);
  } else if (unit === 'minutes') {
    target.setMinutes(target.getMinutes() + interval);
  }
  return target.toISOString();
};

const QuestsPage: React.FC<QuestsPageProps> = React.memo(({ onBack, onQuestOutcome }) => {
  const { 
    setQuests, 
    questLog, 
    setQuestLog, 
    uiState, 
    setQuestsTab 
  } = usePlayerStore(useShallow(state => ({
    setQuests: state.setQuests,
    questLog: state.questLog,
    setQuestLog: state.setQuestLog,
    uiState: state.uiState,
    setQuestsTab: state.setQuestsTab
  })));

  const { playSuccess } = useSound();
  const activeTab = uiState.questsTab;
  const setActiveTab = setQuestsTab;
  const [showAddForm, setShowAddForm] = useState(false);
  const [now, setNow] = useState(new Date());

  // Search & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');

  // Manual Form State
  const [mType, setMType] = useState<'recurring' | 'one-off'>('recurring');
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mReward, setMReward] = useState('');
  const [mPenalty, setMPenalty] = useState('');
  const [mRewardStat, setMRewardStat] = useState<StatKey | ''>('');
  const [mRewardPoints, setMRewardPoints] = useState<number>(0);
  const [mPenaltyStat, setMPenaltyStat] = useState<StatKey | ''>('');
  const [mPenaltyPoints, setMPenaltyPoints] = useState<number>(0);
  const [mDeadline, setMDeadline] = useState('');
  const [mAutoRefresh, setMAutoRefresh] = useState(true);
  const [mRefreshDays, setMRefreshDays] = useState(1);
  const [mRefreshUnit, setMRefreshUnit] = useState<'minutes' | 'hours' | 'days'>('days');
  const [mRefreshTime, setMRefreshTime] = useState('00:00');
  
  // Editing State
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSubQuests, setEditSubQuests] = useState<SubQuest[]>([]);

  // Sub-Quest Form State
  const [subQuests, setSubQuests] = useState<Partial<SubQuest>[]>([]);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubDeadline, setNewSubDeadline] = useState('');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const todayStr = now.toISOString().split('T')[0];
    const outcomesToTrigger: { quest: Quest, type: 'completed' | 'failed' }[] = [];

    setQuests(prev => {
      let changed = false;
      const nextQuests: Quest[] = prev.map((q): Quest => {
        if (q.autoRefresh && q.nextRefreshDate && q.status !== 'in-progress') {
          if (now >= new Date(q.nextRefreshDate)) {
            changed = true;
            // Reset subquests on refresh
            const resetSubQuests = (q.subQuests || []).map(sq => ({ ...sq, completed: false }));
            return { ...q, status: 'in-progress', nextRefreshDate: undefined, subQuests: resetSubQuests, progress: 0 };
          }
        }
        if (q.status !== 'in-progress' || !q.deadline) return q;
        let isExpired = false;
        if (q.type === 'recurring') {
          if (q.refreshUnit !== 'days') return q; // Sub-day quests don't use daily deadlines
          const [hours, minutes] = q.deadline.split(':').map(Number);
          const deadlineDate = new Date(now);
          deadlineDate.setHours(hours, minutes, 0, 0);
          if (now > deadlineDate && q.lastCompletedDate !== todayStr && q.lastResetDate !== todayStr) {
            isExpired = true;
          }
        } else {
          if (now > new Date(q.deadline)) isExpired = true;
        }
        if (isExpired) {
          changed = true;
          const nextRef = q.autoRefresh ? calculateNextRefresh(q.refreshIntervalDays, q.refreshUnit || 'days', q.refreshTime) : undefined;
          outcomesToTrigger.push({ quest: q, type: 'failed' });
          return { ...q, status: 'failed', streakCount: 0, lastResetDate: todayStr, nextRefreshDate: nextRef };
        }
        return q;
      });
      return changed ? nextQuests : prev;
    });

    if (outcomesToTrigger.length > 0 && onQuestOutcome) {
      outcomesToTrigger.forEach(o => onQuestOutcome(o.quest, o.type));
    }
  }, [now.getMinutes()]);

  const addSubQuestToForm = useCallback(() => {
    if (!newSubTitle.trim()) return;
    setSubQuests(prev => [...prev, {
      id: Date.now().toString(),
      title: newSubTitle,
      description: newSubDesc,
      deadline: newSubDeadline,
      completed: false
    }]);
    setNewSubTitle('');
    setNewSubDesc('');
    setNewSubDeadline('');
  }, [newSubTitle, newSubDesc, newSubDeadline]);

  const removeSubQuestFromForm = useCallback((id: string) => {
    playSuccess();
    setSubQuests(prev => prev.filter(sq => sq.id !== id));
  }, [playSuccess]);

  const handleManualAdd = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const finalSubQuests = subQuests as SubQuest[];
    const newQuest: Quest = {
      id: Date.now().toString(),
      type: mType,
      title: mTitle || "Manual Quest",
      description: mDesc,
      reward: mReward || "Experience",
      classTag: "Manual",
      punishment: mPenalty || "Regret",
      status: 'in-progress',
      streakCount: 0,
      maxStreak: 0,
      deadline: mDeadline,
      autoRefresh: mType === 'recurring' ? mAutoRefresh : false,
      refreshIntervalDays: mRefreshDays,
      refreshUnit: mRefreshUnit,
      refreshTime: mRefreshTime,
      subQuests: finalSubQuests,
      progress: 0,
      rewardStat: mRewardStat || undefined,
      rewardPoints: mRewardPoints || undefined,
      penaltyStat: mPenaltyStat || undefined,
      penaltyPoints: mPenaltyPoints || undefined
    };
    setQuests(prev => [newQuest, ...prev]);
    playSuccess();
    setShowAddForm(false);
    setMTitle('');
    setMDesc('');
    setSubQuests([]);
  }, [subQuests, mType, mTitle, mDesc, mReward, mPenalty, mDeadline, mAutoRefresh, mRefreshDays, mRefreshUnit, mRefreshTime, mRewardStat, mRewardPoints, mPenaltyStat, mPenaltyPoints, setQuests]);

  const toggleSubQuest = useCallback((questId: string, subQuestId: string) => {
    let outcomeToTrigger: { quest: Quest, type: 'completed' | 'failed' } | null = null;

    setQuests(prev => prev.map(q => {
      if (q.id !== questId) return q;
      const newSubQuests = (q.subQuests || []).map(sq => 
        sq.id === subQuestId ? { ...sq, completed: !sq.completed } : sq
      );
      
      const completedCount = newSubQuests.filter(sq => sq.completed).length;
      const totalCount = newSubQuests.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      let newStatus = q.status;
      let newStreak = q.streakCount;
      let newMaxStreak = q.maxStreak || 0;
      const todayStr = new Date().toISOString().split('T')[0];
      let lastComp = q.lastCompletedDate;
      let nextRef = q.nextRefreshDate;

      if (totalCount > 0 && completedCount === totalCount && q.status === 'in-progress') {
        newStatus = 'completed';
        newStreak += 1;
        newMaxStreak = Math.max(newMaxStreak, newStreak);
        lastComp = todayStr;
        nextRef = q.autoRefresh ? calculateNextRefresh(q.refreshIntervalDays, q.refreshUnit || 'days', q.refreshTime) : undefined;
        outcomeToTrigger = { quest: q, type: 'completed' };
      }

      return { 
        ...q, 
        subQuests: newSubQuests, 
        progress: newProgress,
        status: newStatus,
        streakCount: newStreak,
        maxStreak: newMaxStreak,
        lastCompletedDate: lastComp,
        nextRefreshDate: nextRef
      };
    }));

    if (outcomeToTrigger && onQuestOutcome) {
      onQuestOutcome(outcomeToTrigger.quest, outcomeToTrigger.type);
    }
  }, [onQuestOutcome, setQuests]);

  const updateQuestStatus = useCallback((id: string, status: Quest['status']) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let outcomeToTrigger: { quest: Quest, type: 'completed' | 'failed' } | null = null;

    setQuests(prev => prev.map(q => {
      if (q.id !== id) return q;
      let newStreak = q.streakCount;
      let newMaxStreak = q.maxStreak || 0;
      if (status === 'completed') {
        newStreak += 1;
        newMaxStreak = Math.max(newMaxStreak, newStreak);
        outcomeToTrigger = { quest: q, type: 'completed' };
      }
      else if (status === 'failed') {
        newStreak = 0;
        outcomeToTrigger = { quest: q, type: 'failed' };
      }
      const nextRef = q.autoRefresh ? calculateNextRefresh(q.refreshIntervalDays, q.refreshUnit || 'days', q.refreshTime) : undefined;
      
      // If manually completing, mark all subquests as complete
      const newSubQuests = status === 'completed' 
        ? (q.subQuests || []).map(sq => ({ ...sq, completed: true }))
        : (q.subQuests || []);

      return { 
        ...q, 
        status, 
        streakCount: newStreak, 
        maxStreak: newMaxStreak,
        lastCompletedDate: status === 'completed' ? todayStr : q.lastCompletedDate,
        lastResetDate: status === 'failed' ? todayStr : q.lastResetDate,
        nextRefreshDate: nextRef,
        subQuests: newSubQuests,
        progress: status === 'completed' ? 100 : q.progress
      };
    }));

    if (outcomeToTrigger && onQuestOutcome) {
      onQuestOutcome(outcomeToTrigger.quest, outcomeToTrigger.type);
    }
  }, [onQuestOutcome, setQuests]);

  const refreshRecurring = useCallback((id: string) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'in-progress', nextRefreshDate: undefined } : q));
  }, [setQuests]);

  const startEditing = useCallback((q: Quest) => {
    setEditingQuestId(q.id);
    setEditTitle(q.title);
    setEditDesc(q.description);
    setEditSubQuests(q.subQuests || []);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingQuestId) return;
    setQuests(prev => prev.map(q => {
      if (q.id === editingQuestId) {
        const completedCount = editSubQuests.filter(sq => sq.completed).length;
        const totalCount = editSubQuests.length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        return { 
          ...q, 
          title: editTitle, 
          description: editDesc, 
          subQuests: editSubQuests,
          progress: newProgress
        };
      }
      return q;
    }));
    setEditingQuestId(null);
  }, [editingQuestId, editTitle, editDesc, editSubQuests, setQuests]);

  const deleteLogEntry = useCallback((logId: string) => {
    playSuccess();
    setQuestLog(prev => (prev || []).filter(entry => entry.id !== logId));
  }, [setQuestLog, playSuccess]);

  const startEditingLog = useCallback((entry: any) => {
    setEditingLogId(entry.id);
    setEditTitle(entry.questTitle);
  }, []);

  const saveEditLog = useCallback(() => {
    if (!editingLogId) return;
    setQuestLog(prev => (prev || []).map(e => e.id === editingLogId ? { ...e, questTitle: editTitle } : e));
    setEditingLogId(null);
  }, [editingLogId, editTitle, setQuestLog]);

  // Advanced Filtering and Sorting Logic
  const processedQuestIds = usePlayerStore(useShallow(state => {
    let result = [...state.quests];

    // 1. Filter by Tab
    if (activeTab === 'recent-history') {
      result = result.filter(q => q.status !== 'in-progress');
    } else {
      result = result.filter(q => q.type === activeTab && q.status === 'in-progress');
    }

    // 2. Filter by Search
    if (searchTerm.trim()) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(q => 
        q.title.toLowerCase().includes(lowSearch) || 
        q.description.toLowerCase().includes(lowSearch)
      );
    }

    // 3. Apply Sorting
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'streak') {
        return b.streakCount - a.streakCount;
      }
      if (sortBy === 'deadline') {
        // Compare urgency
        const getTimeValue = (q: Quest) => {
          if (!q.deadline) return Infinity;
          if (q.type === 'recurring') {
            const [h, m] = q.deadline.split(':').map(Number);
            const d = new Date(now); d.setHours(h, m, 0, 0);
            return d.getTime();
          }
          return new Date(q.deadline).getTime();
        };
        return getTimeValue(a) - getTimeValue(b);
      }
      return 0;
    });

    return result.map(q => q.id);
  }));

  return (
    <div className="w-full space-y-6 sm:space-y-10 animate-in slide-in-from-top duration-700 pb-20 px-4 sm:px-0 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-3 sm:space-x-8 min-w-0">
          <button onClick={onBack} className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-system-bg-panel-solid/82 backdrop-blur-2xl hover:bg-system-accent/10 transition-all duration-500 border border-white/10 hover:border-system-accent/50 group shadow-2xl hover:-translate-x-1 shrink-0">
            <ICONS.ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col space-y-0.5 sm:space-y-2 min-w-0">
            <h1 className="text-lg sm:text-4xl font-black font-orbitron text-system-accent tracking-[0.1em] sm:tracking-[0.5em] uppercase leading-none drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] truncate">Quest Nexus</h1>
            <span className="text-[6px] sm:text-[11px] font-black text-system-accent/50 uppercase tracking-[0.1em] sm:tracking-[0.4em] font-orbitron opacity-70 leading-tight break-words">Directive Authorization Interface</span>
          </div>
        </div>
        <button 
          id="quests-add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`w-full lg:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-[2rem] font-black font-orbitron text-[9px] sm:text-[12px] uppercase tracking-[0.2em] sm:tracking-[0.4em] transition-all duration-700 shadow-2xl ${showAddForm ? 'bg-red-500/20 text-red-500 border border-red-500/40 hover:bg-red-500/30' : 'bg-system-accent text-black shadow-system-accent/20 hover:scale-105 active:scale-95 hover:shadow-system-accent/40 hover:-translate-y-1'}`}
        >
          {showAddForm ? '[ ABORT REGISTRATION ]' : '[ INITIALIZE QUEST ]'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-system-bg-panel-solid/82 border border-system-accent/30 p-4 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] space-y-6 sm:space-y-8 animate-in zoom-in-95 backdrop-blur-2xl shadow-2xl shadow-system-accent/5">
          <div className="flex items-center space-x-4">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-system-accent/10 border border-system-accent/20">
              <ICONS.Plus className="w-5 h-5 sm:w-6 sm:h-6 text-system-accent" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-system-text tracking-tight uppercase font-orbitron truncate">Manual Quest Registration</h3>
              <p className="text-[8px] sm:text-[10px] text-system-text-muted font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em]">Define new system directive</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 p-1 sm:p-1.5 bg-black/40 rounded-xl sm:rounded-2xl border border-white/5">
            <button onClick={() => setMType('recurring')} className={`py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black font-orbitron tracking-[0.1em] sm:tracking-[0.2em] transition-all duration-500 ${mType === 'recurring' ? 'bg-system-accent text-black shadow-lg' : 'text-system-text-muted hover:text-system-text hover:bg-white/5'}`}>RECURRING</button>
            <button onClick={() => setMType('one-off')} className={`py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black font-orbitron tracking-[0.1em] sm:tracking-[0.2em] transition-all duration-500 ${mType === 'one-off' ? 'bg-system-accent text-black shadow-lg' : 'text-system-text-muted hover:text-system-text hover:bg-white/5'}`}>ONE-OFF</button>
          </div>

          {mType === 'recurring' && (
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-8 bg-black/30 rounded-2xl sm:rounded-3xl border border-white/5 animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] sm:text-[11px] font-black font-orbitron text-system-accent uppercase tracking-[0.2em] sm:tracking-[0.3em] block truncate">Auto Rejuvenation</span>
                    <p className="text-[8px] sm:text-[9px] text-system-text-muted font-bold uppercase tracking-widest leading-tight">System will reset quest state automatically</p>
                  </div>
                  <button onClick={() => setMAutoRefresh(!mAutoRefresh)} className={`w-12 sm:w-14 h-6 sm:h-7 rounded-full transition-all duration-500 relative p-1 shrink-0 ${mAutoRefresh ? 'bg-system-accent shadow-[0_0_15px_var(--system-accent-glow)]' : 'bg-black/60 border border-white/10'}`}>
                     <div className={`w-4 sm:w-5 h-4 sm:h-5 rounded-full transition-all duration-500 ${mAutoRefresh ? 'translate-x-6 sm:translate-x-7 bg-black' : 'translate-x-0 bg-white/40'}`} />
                  </button>
               </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-2 sm:pt-4">
                   <div className="space-y-2">
                     <label className="text-[9px] sm:text-[10px] font-black text-system-text-muted uppercase tracking-[0.2em] block">Interval Value</label>
                     <input 
                       type="number" 
                       min="1"
                       value={mRefreshDays} 
                       onChange={(e) => setMRefreshDays(Number(e.target.value))} 
                       className="w-full bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-system-accent outline-none focus:border-system-accent/50 transition-all font-orbitron"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] sm:text-[10px] font-black text-system-text-muted uppercase tracking-[0.2em] block">Interval Unit</label>
                     <Select 
                       value={mRefreshUnit} 
                       onChange={(e) => setMRefreshUnit(e.target.value as any)} 
                       className="w-full bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-system-accent outline-none focus:border-system-accent/50 transition-all font-orbitron"
                     >
                       <option value="minutes">Minutes</option>
                       <option value="hours">Hours</option>
                       <option value="days">Days</option>
                     </Select>
                   </div>
                   {mRefreshUnit === 'days' && (
                     <div className="space-y-2">
                       <label className="text-[9px] sm:text-[10px] font-black text-system-text-muted uppercase tracking-[0.2em] block">Daily Refresh Time</label>
                       <input type="time" value={mRefreshTime} onChange={(e) => setMRefreshTime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-system-accent outline-none focus:border-system-accent/50 transition-all font-orbitron [color-scheme:dark]" />
                     </div>
                   )}
                 </div>
            </div>
          )}

          <form onSubmit={handleManualAdd} className="space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-system-text-muted uppercase tracking-[0.2em] block">Quest Identification</label>
                <input type="text" placeholder="Enter Quest Title..." value={mTitle} onChange={(e) => setMTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg text-system-text focus:border-system-accent/50 outline-none transition-all font-orbitron tracking-tight" required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-system-text-muted uppercase tracking-[0.2em] block">Directive Description</label>
                <textarea placeholder="Describe the objectives and parameters..." value={mDesc} onChange={(e) => setMDesc(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-system-text focus:border-system-accent/50 outline-none h-24 sm:h-32 resize-none transition-all leading-relaxed" />
              </div>
            </div>
            
            {/* Sub-Quests Section */}
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-8 bg-black/30 rounded-2xl sm:rounded-3xl border border-white/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <ICONS.List className="w-3 h-3 sm:w-4 sm:h-4 text-system-accent shrink-0" />
                  <h4 className="text-[9px] sm:text-[11px] font-black font-orbitron text-system-accent uppercase tracking-[0.2em] sm:tracking-[0.3em] truncate">Sub-Quest Matrix</h4>
                </div>
                <span className="text-[8px] sm:text-[9px] text-system-text-muted font-bold uppercase tracking-widest shrink-0">{subQuests.length} Objectives</span>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {subQuests.map((sq) => (
                  <div key={sq.id} className="flex items-center justify-between bg-black/40 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/5 group/sub transition-all hover:border-system-accent/30">
                    <div className="flex flex-col space-y-1 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-system-text tracking-tight uppercase truncate">{sq.title}</span>
                      {sq.description && <span className="text-[9px] sm:text-[10px] text-system-text-muted italic font-medium truncate">{sq.description}</span>}
                      {sq.deadline && <span className="text-[8px] sm:text-[9px] text-system-accent/60 font-black uppercase tracking-widest">Deadline: {sq.deadline}</span>}
                    </div>
                    <button type="button" onClick={() => removeSubQuestFromForm(sq.id!)} data-no-click-sound className="text-red-500/40 hover:text-red-500 p-1.5 sm:p-2 transition-colors shrink-0">
                      <ICONS.Trash className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                ))}

                <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <input 
                      type="text" 
                      placeholder="Sub-Quest Title (Optional)" 
                      value={newSubTitle} 
                      onChange={(e) => setNewSubTitle(e.target.value)} 
                      className="w-full bg-black/60 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm text-system-text outline-none focus:border-system-accent/30 transition-all"
                    />
                    <input 
                      type="text" 
                      placeholder="Optional Deadline" 
                      value={newSubDeadline} 
                      onChange={(e) => setNewSubDeadline(e.target.value)} 
                      className="w-full bg-black/60 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm text-system-text outline-none focus:border-system-accent/30 transition-all"
                    />
                  </div>
                  <textarea 
                    placeholder="Optional Description" 
                    value={newSubDesc} 
                    onChange={(e) => setNewSubDesc(e.target.value)} 
                    className="w-full bg-black/60 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm text-system-text outline-none focus:border-system-accent/30 h-12 sm:h-20 resize-none transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={addSubQuestToForm}
                    className="w-full py-2 sm:py-3 bg-system-accent/10 text-system-accent border border-system-accent/20 rounded-lg sm:rounded-xl text-[8px] sm:text-[11px] font-black font-orbitron hover:bg-system-accent hover:text-black transition-all duration-500 uppercase tracking-[0.2em] sm:tracking-[0.3em]"
                  >
                    ADD OBJECTIVE
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-6 bg-black/20 rounded-2xl sm:rounded-3xl border border-white/5">
                <label className="text-[9px] sm:text-[10px] font-black text-system-text-muted uppercase tracking-[0.2em] block">Reward Configuration</label>
                <div className="space-y-3 sm:space-y-4">
                  <input type="text" placeholder="Reward Description" value={mReward} onChange={(e) => setMReward(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-system-text outline-none focus:border-system-accent/30 transition-all" />
                  <div className="flex gap-2 sm:gap-4">
                    <Select 
                      value={mRewardStat} 
                      onChange={(e) => setMRewardStat(e.target.value as StatKey)} 
                      className="flex-1 font-orbitron text-[8px] sm:text-[11px] uppercase tracking-widest"
                      placeholder="No Stat Reward"
                    >
                      <option value="">No Stat Reward</option>
                      {Object.values(StatKey).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </Select>
                    <input type="number" placeholder="Pts" value={mRewardPoints ?? 0} onChange={(e) => setMRewardPoints(Number(e.target.value) || 0)} className="w-16 sm:w-24 bg-black/40 border border-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 text-xs sm:text-sm text-system-accent outline-none focus:border-system-accent/30 transition-all font-orbitron" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-6 bg-black/20 rounded-2xl sm:rounded-3xl border border-white/5">
                <label className="text-[9px] sm:text-[10px] font-black text-system-text-muted uppercase tracking-[0.2em] block">Penalty Configuration</label>
                <div className="space-y-3 sm:space-y-4">
                  <input type="text" placeholder="Penalty Description" value={mPenalty} onChange={(e) => setMPenalty(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-system-text outline-none focus:border-red-500/30 transition-all" />
                  <div className="flex gap-2 sm:gap-4">
                    <Select 
                      value={mPenaltyStat} 
                      onChange={(e) => setMPenaltyStat(e.target.value as StatKey)} 
                      className="flex-1 font-orbitron text-[8px] sm:text-[11px] uppercase tracking-widest"
                      placeholder="No Stat Penalty"
                    >
                      <option value="">No Stat Penalty</option>
                      {Object.values(StatKey).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </Select>
                    <input type="number" placeholder="Pts" value={mPenaltyPoints ?? 0} onChange={(e) => setMPenaltyPoints(Number(e.target.value) || 0)} className="w-16 sm:w-24 bg-black/40 border border-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 text-xs sm:text-sm text-red-500 outline-none focus:border-red-500/30 transition-all font-orbitron" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 bg-black/40 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5">
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] sm:text-[11px] font-black font-orbitron text-system-text-muted uppercase tracking-[0.2em] sm:tracking-[0.3em] block truncate">
                  {mType === 'recurring' ? 'Daily Activation Window' : 'Final System Deadline'}
                </span>
                <p className="text-[8px] sm:text-[9px] text-system-text-muted font-bold uppercase tracking-widest leading-tight">Specify the temporal parameters for this quest</p>
              </div>
              <input 
                type={mType === 'recurring' ? 'time' : 'datetime-local'} 
                value={mDeadline} 
                onChange={(e) => setMDeadline(e.target.value)} 
                className="w-full sm:w-auto bg-black border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-system-accent outline-none focus:border-system-accent/50 transition-all font-orbitron [color-scheme:dark] shadow-xl" 
              />
            </div>
            <button type="submit" className="w-full py-3.5 sm:py-5 bg-system-accent text-black font-black font-orbitron text-xs sm:text-base rounded-xl sm:rounded-[2rem] hover:bg-system-accent/80 shadow-2xl shadow-system-accent/20 transition-all duration-500 uppercase tracking-[0.2em] sm:tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98]">REGISTER SYSTEM DIRECTIVE</button>
          </form>
        </div>
      )}

      {/* Search and Sort Interface */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
        <div className="relative flex-1 w-full group" id="quests-search">
          <input 
            type="text" 
            placeholder="Search Quest Data Matrix..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-system-bg-panel-solid/82 border border-white/5 rounded-xl sm:rounded-2xl pl-10 sm:pl-14 pr-4 sm:pr-6 py-2.5 sm:py-4 text-[10px] sm:text-sm text-system-text focus:border-system-accent/40 outline-none transition-all duration-500 backdrop-blur-xl shadow-xl font-orbitron"
          />
          <div className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 text-system-accent/40 group-focus-within:text-system-accent transition-colors duration-500">
            <ICONS.Search className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="flex items-center space-x-4 bg-system-bg-panel-solid/82 border border-white/5 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-xl shadow-xl shrink-0">
          <span className="text-[9px] sm:text-[10px] font-black font-orbitron text-system-text-muted uppercase tracking-[0.2em] sm:tracking-[0.3em]">Sort</span>
          <div className="h-4 w-[1px] bg-white/10" />
          <Select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="font-black font-orbitron text-[9px] sm:text-[10px] border-none bg-transparent py-0 h-auto min-w-[100px] sm:min-w-[120px] uppercase tracking-widest text-system-accent"
          >
            <option value="deadline">Deadline</option>
            <option value="streak">Streak</option>
            <option value="title">A-Z Title</option>
          </Select>
        </div>
      </div>

      <div id="quests-tabs" className="flex flex-wrap sm:flex-nowrap bg-black/40 p-1 sm:p-2.5 rounded-xl sm:rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl gap-1 sm:gap-0">
        <button onClick={() => setActiveTab('recurring')} className={`flex-1 min-w-[45%] sm:min-w-[120px] py-2.5 sm:py-5 rounded-lg sm:rounded-[2rem] text-[9px] sm:text-[12px] font-black font-orbitron uppercase tracking-[0.1em] sm:tracking-[0.3em] transition-all duration-700 ${activeTab === 'recurring' ? 'bg-system-accent text-black shadow-2xl shadow-system-accent/30 scale-[1.02]' : 'text-system-text-muted hover:text-system-text hover:bg-white/5'}`}>Active Recurring</button>
        <button onClick={() => setActiveTab('one-off')} className={`flex-1 min-w-[45%] sm:min-w-[120px] py-2.5 sm:py-5 rounded-lg sm:rounded-[2rem] text-[9px] sm:text-[12px] font-black font-orbitron uppercase tracking-[0.1em] sm:tracking-[0.3em] transition-all duration-700 ${activeTab === 'one-off' ? 'bg-system-accent text-black shadow-2xl shadow-system-accent/30 scale-[1.02]' : 'text-system-text-muted hover:text-system-text hover:bg-white/5'}`}>Active One-Off</button>
        <button onClick={() => setActiveTab('recent-history')} className={`flex-1 min-w-[45%] sm:min-w-[120px] py-2.5 sm:py-5 rounded-lg sm:rounded-[2rem] text-[9px] sm:text-[12px] font-black font-orbitron uppercase tracking-[0.1em] sm:tracking-[0.3em] transition-all duration-700 ${activeTab === 'recent-history' ? 'bg-system-accent text-black shadow-2xl shadow-system-accent/30 scale-[1.02]' : 'text-system-text-muted hover:text-system-text hover:bg-white/5'}`}>Recent History</button>
        <button 
          id="quests-log-tab"
          onClick={() => setActiveTab('log')} 
          className={`flex-1 min-w-[45%] sm:min-w-[120px] py-2.5 sm:py-5 rounded-lg sm:rounded-[2rem] text-[9px] sm:text-[12px] font-black font-orbitron uppercase tracking-[0.1em] sm:tracking-[0.3em] transition-all duration-700 ${activeTab === 'log' ? 'bg-system-accent text-black shadow-2xl shadow-system-accent/30 scale-[1.02]' : 'text-system-text-muted hover:text-system-text hover:bg-white/5'}`}
        >
          System Log
        </button>
      </div>

      {activeTab === 'log' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <span className="h-1.5 w-1.5 rounded-full bg-system-accent animate-pulse shadow-[0_0_8px_var(--system-accent-glow)]" />
              <h3 className="text-[11px] font-black font-orbitron text-system-accent uppercase tracking-[0.4em]">Permanent Directive History</h3>
            </div>
            <span className="text-[9px] text-system-text-muted font-bold uppercase tracking-widest">Last 100 Entries</span>
          </div>
          
          <div id="quests-log-container" className="bg-system-bg-panel-solid/82 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl h-fit">
            {questLog && questLog.length > 0 ? (
              <div className="divide-y divide-white/5">
                {questLog.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    id={index === 0 ? "quests-log-entry" : undefined}
                    className="p-4 sm:p-6 flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="flex flex-col gap-1 sm:gap-2 flex-1 mr-4 sm:mr-8">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${entry.outcome === 'completed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]'}`} />
                        {editingLogId === entry.id ? (
                          <div className="flex items-center gap-2 sm:gap-3 flex-1">
                            <input 
                              type="text" 
                              value={editTitle} 
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 bg-black/60 border border-system-accent/40 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-system-text outline-none focus:border-system-accent shadow-inner min-w-0"
                              autoFocus
                            />
                            <button onClick={saveEditLog} className="text-[8px] sm:text-[10px] font-black text-system-accent hover:text-white uppercase font-orbitron tracking-widest transition-colors shrink-0">Save</button>
                            <button onClick={() => setEditingLogId(null)} className="text-[8px] sm:text-[10px] font-black text-system-text-muted hover:text-white uppercase font-orbitron tracking-widest transition-colors shrink-0">Cancel</button>
                          </div>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-orbitron text-slate-200 truncate">{entry.questTitle}</span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-tighter">
                        {new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-[10px] font-orbitron uppercase ${entry.outcome === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.outcome}
                        </div>
                        {entry.outcome === 'completed' && entry.rewardStat && (
                          <div className="text-[8px] text-system-accent font-orbitron">+{entry.rewardPoints} {entry.rewardStat.toUpperCase()}</div>
                        )}
                        {entry.outcome === 'failed' && entry.penaltyStat && (
                          <div className="text-[8px] text-red-500 font-orbitron">-{entry.penaltyPoints} {entry.penaltyStat.toUpperCase()}</div>
                        )}
                      </div>
                      {!editingLogId && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => startEditingLog(entry)}
                            className="p-1.5 rounded-lg bg-slate-950/50 text-slate-500 border border-slate-800 hover:text-system-accent hover:border-system-accent/30 transition-all"
                            title="Edit Log Entry"
                          >
                            <ICONS.Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => deleteLogEntry(entry.id)}
                            data-no-click-sound
                            className="p-1.5 rounded-lg bg-slate-950/50 text-slate-500 border border-slate-800 hover:text-red-400 hover:border-red-400/30 transition-all"
                            title="Delete Log Entry"
                          >
                            <ICONS.Trash className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div id="quests-log-entry" className="p-12 text-center text-slate-600 font-orbitron text-[10px] uppercase tracking-widest italic">
                No permanent logs recorded in the matrix yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div id="quests-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedQuestIds.length > 0 ? (
            processedQuestIds.map(questId => (
              <QuestCard 
                key={questId} 
                questId={questId} 
                now={now}
                questLog={questLog}
                onComplete={() => updateQuestStatus(questId, 'completed')} 
                onFail={() => updateQuestStatus(questId, 'failed')}
                onRefresh={() => refreshRecurring(questId)}
                onDelete={() => { playSuccess(); setQuests(prev => prev.filter(q => q.id !== questId)); }}
                onToggleSubQuest={(sqId) => toggleSubQuest(questId, sqId)}
                onEdit={startEditing}
                isEditing={editingQuestId === questId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editDesc={editDesc}
                setEditDesc={setEditDesc}
                editSubQuests={editSubQuests}
                setEditSubQuests={setEditSubQuests}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingQuestId(null)}
              />
            ))
          ) : (
            <div className="col-span-full p-12 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl font-orbitron text-xs uppercase tracking-widest italic">
              {searchTerm ? 'No results found for your search.' : 'No active directives in this archive.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const QuestCard = React.memo<{ 
  questId: string; 
  now: Date;
  questLog: QuestLogEntry[];
  onComplete: () => void; 
  onFail: () => void; 
  onRefresh: () => void; 
  onDelete: () => void;
  onToggleSubQuest: (subQuestId: string) => void;
  onEdit: (quest: Quest) => void;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDesc: string;
  setEditDesc: (val: string) => void;
  editSubQuests: SubQuest[];
  setEditSubQuests: React.Dispatch<React.SetStateAction<SubQuest[]>>;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}>(({ 
  questId, now, questLog, onComplete, onFail, onRefresh, onDelete, onToggleSubQuest,
  onEdit, isEditing, editTitle, setEditTitle, editDesc, setEditDesc, 
  editSubQuests, setEditSubQuests, onSaveEdit, onCancelEdit
}) => {
  const quest = usePlayerStore(state => state.quests.find(q => q.id === questId));

  if (!quest) return null;

  const isExpired = quest.status === 'failed';
  const isDone = quest.status === 'completed';
  const [streakPage, setStreakPage] = useState(0);
  const [hasManuallyNavigated, setHasManuallyNavigated] = useState(false);

  // Get outcomes for this quest from the log
  const history = useMemo(() => {
    if (!questLog) return [];
    
    // Filter log for this quest
    const questEntries = questLog
      .filter(e => e.questId === quest.id); // [Newest, ..., Oldest]
      
    // Reverse to get [Oldest, ..., Newest]
    const allOutcomes = [...questEntries].reverse().map(e => e.outcome);
    
    return allOutcomes;
  }, [questLog, quest.id]);

  const maxPages = Math.floor(history.length / 7) + 1;

  // Automatically move to the last page when history changes (e.g. quest completed)
  // unless the user has manually navigated away.
  useEffect(() => {
    if (!hasManuallyNavigated) {
      setStreakPage(maxPages - 1);
    }
  }, [history.length, maxPages, hasManuallyNavigated]);

  // Paginated history for display (7 dots per page)
  // Page 0 is the first 7 items, Page 1 is the next 7, etc.
  const paginatedHistory = useMemo(() => {
    const pageSize = 7;
    const start = streakPage * pageSize;
    const end = start + pageSize;
    
    const pageItems = history.slice(start, end);
    
    // Fill with 'none' to always have 7 dots
    const results: ('completed' | 'failed' | 'none')[] = [...pageItems];
    while (results.length < 7) {
      results.push('none');
    }
    return results;
  }, [history, streakPage]);

  const streakColor = useMemo(() => {
    if (quest.streakCount >= 30) return 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]';
    if (quest.streakCount >= 14) return 'text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.6)]';
    if (quest.streakCount >= 7) return 'text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]';
    if (quest.streakCount >= 3) return 'text-system-accent';
    return 'text-slate-600';
  }, [quest.streakCount]);

  const cardGlow = useMemo(() => {
    if (quest.streakCount >= 30) return 'shadow-[0_0_20px_rgba(244,63,94,0.15)] border-rose-500/30';
    if (quest.streakCount >= 14) return 'shadow-[0_0_15px_rgba(249,115,22,0.1)] border-orange-500/20';
    if (quest.streakCount >= 7) return 'shadow-[0_0_10px_rgba(251,191,36,0.05)] border-amber-500/20';
    return '';
  }, [quest.streakCount]);

  const countdown = useMemo(() => {
    let targetDate: Date | null = null;
    
    if (quest.status === 'in-progress') {
       if (!quest.deadline || (quest.type === 'recurring' && quest.refreshUnit !== 'days')) return null;
       if (quest.type === 'recurring') {
         const [hours, minutes] = quest.deadline.split(':').map(Number);
         targetDate = new Date(now);
         targetDate.setHours(hours, minutes, 0, 0);
         if (now > targetDate) targetDate.setDate(targetDate.getDate() + 1);
       } else {
         targetDate = new Date(quest.deadline);
       }
    } else if (quest.nextRefreshDate) {
       targetDate = new Date(quest.nextRefreshDate);
     }

    if (!targetDate) return null;
    const diff = targetDate.getTime() - now.getTime();
    if (diff <= 0) return "00:00:00";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [now, quest.deadline, quest.status, quest.nextRefreshDate]);

  const isClose = useMemo(() => {
    if (quest.status !== 'in-progress' || !quest.deadline || (quest.type === 'recurring' && quest.refreshUnit !== 'days')) return false;
    let targetDate: Date;
    if (quest.type === 'recurring') {
      const [h, m] = quest.deadline.split(':').map(Number);
      targetDate = new Date(now); targetDate.setHours(h, m, 0, 0);
      if (now > targetDate) targetDate.setDate(targetDate.getDate() + 1);
    } else { targetDate = new Date(quest.deadline); }
    return targetDate.getTime() - now.getTime() < 3600000;
  }, [now, quest.deadline, quest.status]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border-l-4 sm:border-l-8 transition-all duration-500 relative group overflow-hidden bg-system-bg-panel-solid/82 backdrop-blur-2xl shadow-2xl hover:-translate-y-2 ${
        isDone 
          ? 'bg-green-500/5 border-green-500/40 grayscale-[0.3]' 
          : isExpired 
            ? 'bg-red-500/5 border-red-500/40 grayscale-[0.3]' 
            : `border-system-accent/40 hover:border-system-accent shadow-system-accent/5 hover:shadow-system-accent/20 ${cardGlow}`
      }`}
    >
      {/* System Message Corner Accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-system-accent/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-system-accent/20 pointer-events-none" />
      
      <div className="absolute top-0 right-0 p-2 sm:p-6 flex space-x-2 sm:space-x-3 z-10">
        {!isEditing && (
          <>
            <button onClick={() => onEdit(quest)} title="Edit Quest" className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-black/60 text-slate-400 border border-white/10 hover:text-system-accent hover:border-system-accent/50 transition-all opacity-0 group-hover:opacity-100 hover-glitch shadow-lg">
              <ICONS.Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {quest.type === 'recurring' && quest.status !== 'in-progress' && (
              <button onClick={onRefresh} title="Manual Refresh" className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-black/60 text-system-accent border border-system-accent/50 hover:bg-system-accent hover:text-black transition-all shadow-lg hover-glitch">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
              </button>
            )}
            <button onClick={onDelete} data-no-click-sound className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-black/60 text-slate-500 border border-white/10 hover:text-red-400 hover:border-red-400/50 transition-all opacity-0 group-hover:opacity-100 hover-glitch shadow-lg"><ICONS.Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
          </>
        )}
      </div>

      <div className="mb-6 relative">
        <div className="flex items-center flex-wrap gap-3 mb-4">
          <div className="flex items-center space-x-3 bg-system-accent/10 px-3 py-1 rounded-xl border border-system-accent/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <div className="w-2 h-2 rounded-full bg-system-accent animate-pulse shadow-[0_0_8px_var(--system-accent-glow)]" />
            <span className="text-[10px] font-black font-orbitron text-system-accent uppercase tracking-[0.3em]">{quest.classTag || 'SYSTEM DIRECTIVE'}</span>
          </div>
          
          {quest.type === 'recurring' && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border border-white/10 bg-black/20 transition-all ${streakColor}`}>
              <span className="text-[10px] font-black font-orbitron uppercase tracking-[0.2em]">STREAK: {quest.streakCount}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input 
                type="text" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-black/60 border border-system-accent/40 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-base sm:text-xl font-black font-orbitron text-system-text outline-none focus:border-system-accent shadow-inner"
              />
            ) : (
              <h3 className={`text-lg sm:text-2xl font-black font-orbitron tracking-tight leading-tight break-words ${isDone ? 'text-green-400/50 line-through' : isExpired ? 'text-red-400/70' : 'text-system-text drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]'}`}>
                {quest.title}
              </h3>
            )}
          </div>
          
          {!isEditing && quest.status === 'in-progress' && (
            <div className="text-left sm:text-right shrink-0 bg-black/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 shadow-inner w-fit sm:w-auto">
              <div className={`text-[7px] sm:text-[9px] font-black font-orbitron uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-0.5 sm:mb-1 ${isClose ? 'text-red-500 animate-pulse' : 'text-system-text-muted opacity-60'}`}>
                Time Remaining
              </div>
              <div className={`text-sm sm:text-xl font-black font-orbitron ${isClose ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-system-accent drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]'}`}>
                {countdown || '--:--:--'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative mb-8">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-system-accent/40 to-transparent rounded-full" />
        <div className="pl-6">
          {isEditing ? (
            <textarea 
              value={editDesc} 
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full bg-black/60 border border-system-accent/40 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-system-text-muted outline-none focus:border-system-accent min-h-[80px] sm:h-24 resize-none shadow-inner"
            />
          ) : (
            <p className="text-sm text-system-text-muted font-light leading-relaxed italic opacity-80">
              {quest.description || "No additional parameters provided for this mission."}
            </p>
          )}
        </div>
      </div>

      {/* Streak History */}
      {quest.type === 'recurring' && (
        <div className="mb-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-orbitron text-slate-600 uppercase tracking-tighter">Streak:</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => {
                  setStreakPage(p => Math.max(0, p - 1));
                  setHasManuallyNavigated(true);
                }}
                disabled={streakPage === 0}
                className="text-slate-600 hover:text-system-accent disabled:opacity-30 transition-colors hover-glitch"
                title="Previous Batch"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[10px] sm:h-[10px]"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <span className="text-[5px] sm:text-[6px] font-orbitron text-slate-700 uppercase">{streakPage + 1}/{maxPages}</span>
              <button 
                onClick={() => {
                  setStreakPage(p => Math.min(maxPages - 1, p + 1));
                  setHasManuallyNavigated(true);
                }}
                disabled={streakPage >= maxPages - 1}
                className="text-slate-600 hover:text-system-accent disabled:opacity-30 transition-colors hover-glitch"
                title="Next Batch"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[10px] sm:h-[10px]"><path d="m9 18 6-6-6-6"/></svg>
              </button>
              {hasManuallyNavigated && (
                <button 
                  onClick={() => {
                    setHasManuallyNavigated(false);
                    setStreakPage(maxPages - 1);
                  }}
                  className="text-[5px] sm:text-[6px] font-orbitron text-system-accent hover:underline uppercase ml-0.5 sm:ml-1 hover-glitch"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {paginatedHistory.map((status, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                  status === 'completed' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 
                  status === 'failed' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 
                  'bg-slate-800'
                }`}
                title={status === 'none' ? "Empty Slot" : status.toUpperCase()}
              />
            ))}
          </div>
        </div>
      )}

      {isEditing ? null : null}

      {isEditing && (
        <div className="space-y-4 mb-4">
          <div className="space-y-2 p-3 sm:p-4 bg-system-bg-panel/20 rounded-xl border border-system-accent/10">
            <h4 className="text-[9px] sm:text-[10px] font-orbitron text-system-accent uppercase tracking-widest mb-2">Edit Sub-Quests</h4>
            
            {editSubQuests.map((sq) => (
              <div key={sq.id} className="space-y-2 bg-system-bg-panel/40 p-2 sm:p-3 rounded-lg border border-slate-800">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={sq.title} 
                    onChange={(e) => setEditSubQuests(prev => prev.map(s => s.id === sq.id ? { ...s, title: e.target.value } : s))}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] sm:text-xs text-white outline-none focus:border-system-accent"
                    placeholder="Sub-Quest Title"
                  />
                  <button 
                    type="button" 
                    onClick={() => setEditSubQuests(prev => prev.filter(s => s.id !== sq.id))}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <ICONS.Trash className="w-3 h-3" />
                  </button>
                </div>
                <textarea 
                  value={sq.description || ''} 
                  onChange={(e) => setEditSubQuests(prev => prev.map(s => s.id === sq.id ? { ...s, description: e.target.value } : s))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[9px] sm:text-[10px] text-slate-300 outline-none focus:border-system-accent h-10 sm:h-12 resize-none"
                  placeholder="Optional Description"
                />
                <input 
                  type="text" 
                  value={sq.deadline || ''} 
                  onChange={(e) => setEditSubQuests(prev => prev.map(s => s.id === sq.id ? { ...s, deadline: e.target.value } : s))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[9px] sm:text-[10px] text-slate-400 outline-none focus:border-system-accent"
                  placeholder="Optional Deadline"
                />
              </div>
            ))}

            <button 
              type="button"
              onClick={() => setEditSubQuests(prev => [...prev, { id: Date.now().toString(), title: '', completed: false }])}
              className="w-full py-1.5 border border-dashed border-system-accent/30 rounded-lg text-[10px] font-orbitron text-system-accent hover:bg-system-accent/10 transition-all uppercase hover-glitch"
            >
              + Add Sub-Quest
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={onSaveEdit} className="flex-1 py-2 bg-system-accent text-slate-900 font-orbitron text-[10px] rounded-lg uppercase tracking-widest hover:bg-system-accent/80 transition-all hover-glitch">Save Changes</button>
            <button onClick={onCancelEdit} className="flex-1 py-2 bg-slate-800 text-slate-400 font-orbitron text-[10px] rounded-lg uppercase tracking-widest hover:text-white transition-all hover-glitch">Cancel</button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {!isEditing && (
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-orbitron uppercase tracking-widest text-slate-500">
            <span>Progress</span>
            <span className="text-system-accent font-bold">{Number.isNaN(quest.progress) ? 0 : quest.progress}%</span>
          </div>
          <div className="w-full h-1 sm:h-1.5 bg-system-bg-panel/40 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-system-accent transition-all duration-500 shadow-[0_0_10px_var(--system-accent-glow)]" 
              style={{ width: `${Number.isNaN(quest.progress) ? 0 : quest.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Sub-Quests List */}
      {!isEditing && (quest.subQuests || []).length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-[8px] sm:text-[9px] font-orbitron text-slate-500 uppercase tracking-widest">Sub-Objectives</h4>
          <div className="space-y-1.5">
            {(quest.subQuests || []).map((sq) => (
              <div 
                key={sq.id} 
                className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-lg border transition-all ${sq.completed ? 'bg-green-500/5 border-green-500/20 opacity-60' : 'bg-system-bg-panel/40 border-slate-800/50'}`}
              >
                <button 
                  onClick={() => onToggleSubQuest(sq.id)}
                  disabled={isDone || isExpired}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border flex items-center justify-center transition-all hover-glitch shrink-0 ${sq.completed ? 'bg-green-500 border-green-500' : 'border-slate-700 hover:border-system-accent'}`}
                >
                  {sq.completed && <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[10px] sm:h-[10px]"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-[9px] sm:text-[10px] truncate ${sq.completed ? 'text-green-400 line-through' : 'text-slate-300'}`}>{sq.title}</div>
                  {sq.description && <div className="text-[7px] sm:text-[8px] text-slate-500 italic mt-0.5 truncate">{sq.description}</div>}
                  {sq.deadline && <div className="text-[6px] sm:text-[7px] text-slate-500 uppercase">Deadline: {sq.deadline}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {countdown && (
        <div className={`mb-6 p-3 rounded-xl bg-system-bg-panel/40 border flex flex-col font-orbitron transition-all ${isClose ? 'border-red-500/50 animate-pulse bg-red-500/5' : (quest.status !== 'in-progress' ? 'border-indigo-500/30' : 'border-system-accent/10')}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[9px] uppercase tracking-widest ${quest.status !== 'in-progress' ? 'text-indigo-400' : 'text-slate-500'}`}>
              {quest.status === 'in-progress' ? 'System Window' : 'Next Rejuvenation'}
            </span>
            <span className={`text-xs font-bold ${isClose ? 'text-red-500' : (quest.status !== 'in-progress' ? 'text-indigo-400' : 'text-system-accent')}`}>{countdown}</span>
          </div>
          <div className="text-[8px] text-slate-600 mt-1 uppercase flex justify-between">
            <span>{quest.status === 'in-progress' ? `Target: ${quest.deadline}` : `Scheduled: ${new Date(quest.nextRefreshDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
            {quest.status !== 'in-progress' && (
              <span>
                {quest.refreshUnit === 'days' 
                  ? new Date(quest.nextRefreshDate!).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : 'Today'}
              </span>
            )}
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-2 bg-system-bg-panel/40 rounded-xl border border-slate-800/50 text-center">
            <div className="text-[8px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Reward</div>
            <div className="text-[10px] text-green-400 font-orbitron truncate px-1">{quest.reward}</div>
            {quest.rewardStat && quest.rewardPoints && (
              <div className="text-[8px] text-system-accent font-orbitron mt-1">+{quest.rewardPoints} {quest.rewardStat.toUpperCase()}</div>
            )}
          </div>
          <div className="p-2 bg-system-bg-panel/40 rounded-xl border border-slate-800/50 text-center">
            <div className="text-[8px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Penalty</div>
            <div className="text-[10px] text-red-400 font-orbitron truncate px-1">{quest.punishment}</div>
            {quest.penaltyStat && quest.penaltyPoints && (
              <div className="text-[8px] text-red-500 font-orbitron mt-1">-{quest.penaltyPoints} {quest.penaltyStat.toUpperCase()}</div>
            )}
          </div>
        </div>
      )}

      {!isEditing && (
        quest.status === 'in-progress' ? (
          <div className="flex space-x-3">
            <button 
              onClick={onComplete} 
              className="flex-1 py-3 bg-system-accent/10 border border-system-accent/40 text-system-accent text-[10px] font-orbitron rounded-sm hover:bg-system-accent hover:text-system-bg-base transition-all uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] group relative overflow-hidden hover-glitch"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              Complete Mission
            </button>
            <button 
              onClick={onFail} 
              className="px-6 py-3 bg-red-500/5 border border-red-500/20 text-red-500/60 text-[10px] font-orbitron rounded-sm hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest hover-glitch"
            >
              Fail
            </button>
          </div>
        ) : (
          <div className={`text-center py-3 rounded-sm border border-dashed font-orbitron text-[10px] uppercase tracking-[0.3em] ${isDone ? 'border-green-500/30 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
            {isDone ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
          </div>
        )
      )}
    </motion.div>
  );
});

export default QuestsPage;
