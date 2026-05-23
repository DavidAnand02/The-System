import React, { useState, useMemo, useEffect } from 'react';
import { 
  PlayerData, 
  Title, 
  Belief, 
  Effect, 
  StatBoost,
  Job,
  Skill
} from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { usePlayerStats } from './usePlayerStats';
import { useSystemSynergy } from './useSystemSynergy';
import { useNotification } from '../contexts/NotificationContext';

export function usePlayerStatusLogic() {
  const player = usePlayerStore(state => state.player);
  const setPlayer = usePlayerStore(state => state.setPlayer);
  const jobs = usePlayerStore(state => state.jobs);
  const setJobs = usePlayerStore(state => state.setJobs);
  const skills = usePlayerStore(state => state.skills);
  const setSkills = usePlayerStore(state => state.setSkills);
  const titles = usePlayerStore(state => state.titles);
  const setTitles = usePlayerStore(state => state.setTitles);
  const beliefs = usePlayerStore(state => state.beliefs);
  const setBeliefs = usePlayerStore(state => state.setBeliefs);
  const { notify } = useNotification();

  // Core Stats Logic
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

  // Archive Search State
  const [titleSearchTerm, setTitleSearchTerm] = useState('');
  const [beliefSearchTerm, setBeliefSearchTerm] = useState('');
  const [effectSearchTerm, setEffectSearchTerm] = useState('');
  const [effectTypeFilter, setEffectTypeFilter] = useState<'all' | 'passive' | 'active'>('all');

  // Form States
  const [showAddTitleForm, setShowAddTitleForm] = useState(false);
  const [newTitleName, setNewTitleName] = useState('');
  const [newTitleDesc, setNewTitleDesc] = useState('');

  const [showAddBeliefForm, setShowAddBeliefForm] = useState(false);
  const [newBeliefName, setNewBeliefName] = useState('');
  const [newBeliefDesc, setNewBeliefDesc] = useState('');

  const [showAddEffectForm, setShowAddEffectForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'passive' | 'active'>('passive');
  const [newStatBoosts, setNewStatBoosts] = useState<StatBoost[]>([]);

  // Effect Creator States
  const [titleEffectCreator, setTitleEffectCreator] = useState<{ titleId: string } | null>(null);
  const [teName, setTeName] = useState('');
  const [teDesc, setTeDesc] = useState('');
  const [teType, setTeType] = useState<'passive' | 'active'>('passive');
  const [teStatBoosts, setTeStatBoosts] = useState<StatBoost[]>([]);

  const [beliefEffectCreator, setBeliefEffectCreator] = useState<{ beliefId: string } | null>(null);
  const [beName, setBeName] = useState('');
  const [beDesc, setBeDesc] = useState('');
  const [beType, setBeType] = useState<'passive' | 'active'>('passive');
  const [beStatBoosts, setBeStatBoosts] = useState<StatBoost[]>([]);

  // Editing States
  const [editingEffectIndex, setEditingEffectIndex] = useState<{ type: 'global' | 'job' | 'title' | 'belief' | 'skill'; index: number; sourceId?: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState<'passive' | 'active'>('passive');
  const [editStatBoosts, setEditStatBoosts] = useState<StatBoost[]>([]);

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
      const aActive = isEffectActive(a, a.sourceTitle, a.sourceJob, a.sourceBelief, a.sourceSkill);
      const bActive = isEffectActive(b, b.sourceTitle, b.sourceJob, b.sourceBelief, b.sourceSkill);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return 0;
    });
  }, [allEffects, effectSearchTerm, effectTypeFilter, isEffectActive]);

  // Handlers
  const handleApplyProjection = () => {
    applyProjection(simulatedTotal);
    setIsProjecting(false);
    setShowSyncConfirm(false);
    notify('success', 'System synchronized successfully');
  };

  const handleSliderChange = (val: number) => {
    setSimulatedTotal(val);
    setIsProjecting(true);
  };

  const handleInfoChange = (field: keyof PlayerData, value: string, index: number = 0) => {
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
  };

  const handleUpdateTitleField = (id: string, field: keyof Title, value: string) => {
    if (field === 'name') {
      const oldTitle = titles.find(t => t.id === id);
      if (oldTitle && player.title === oldTitle.name) {
        setPlayer(prev => ({ ...prev, title: value }));
      }
    }
    setTitles(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleUpdateBeliefField = (id: string, field: keyof Belief, value: string) => {
    if (field === 'name') {
      const oldBelief = beliefs.find(b => b.id === id);
      if (oldBelief && player.belief === oldBelief.name) {
        setPlayer(prev => ({ ...prev, belief: value }));
      }
    }
    setBeliefs(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const addTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitleName.trim()) {
      const newTitle: Title = {
        id: Date.now().toString(),
        name: newTitleName.trim(),
        description: newTitleDesc.trim() || 'A title earned through unknown deeds.',
        effects: []
      };
      setTitles(prev => [...prev, newTitle]);
      setNewTitleName('');
      setNewTitleDesc('');
      setShowAddTitleForm(false);
      notify('success', `Title "${newTitle.name}" registered`);
    }
  };

  const addBelief = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBeliefName.trim()) {
      const newBelief: Belief = {
        id: Date.now().toString(),
        name: newBeliefName.trim(),
        description: newBeliefDesc.trim() || 'A core belief that shapes the player\'s reality.',
        effects: []
      };
      setBeliefs(prev => [...prev, newBelief]);
      setNewBeliefName('');
      setNewBeliefDesc('');
      setShowAddBeliefForm(false);
      notify('success', `Belief "${newBelief.name}" registered`);
    }
  };

  const addGeneralEffect = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      setPlayer(prev => ({
        ...prev,
        effects: [...prev.effects, { 
          name: newName.trim(), 
          description: newDesc.trim() || 'No description provided.', 
          type: newType,
          statBoosts: newStatBoosts.length > 0 ? newStatBoosts : undefined
        }]
      }));
      setNewName('');
      setNewDesc('');
      setNewStatBoosts([]);
      setShowAddEffectForm(false);
      notify('success', 'General effect added');
    }
  };

  const addEffectToTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (teName.trim() && titleEffectCreator) {
      setTitles(prev => prev.map(t => {
        if (t.id !== titleEffectCreator.titleId) return t;
        return {
          ...t,
          effects: [...(t.effects || []), { 
            name: teName.trim(), 
            description: teDesc.trim() || 'No description provided.', 
            type: teType,
            statBoosts: teStatBoosts.length > 0 ? teStatBoosts : undefined
          }]
        };
      }));
      setTeName('');
      setTeDesc('');
      setTeStatBoosts([]);
      setTitleEffectCreator(null);
      notify('success', 'Effect added to title');
    }
  };

  const addEffectToBelief = (e: React.FormEvent) => {
    e.preventDefault();
    if (beName.trim() && beliefEffectCreator) {
      setBeliefs(prev => prev.map(b => {
        if (b.id !== beliefEffectCreator.beliefId) return b;
        return {
          ...b,
          effects: [...(b.effects || []), { 
            name: beName.trim(), 
            description: beDesc.trim() || 'No description provided.', 
            type: beType,
            statBoosts: beStatBoosts.length > 0 ? beStatBoosts : undefined
          }]
        };
      }));
      setBeName('');
      setBeDesc('');
      setBeStatBoosts([]);
      setBeliefEffectCreator(null);
      notify('success', 'Effect added to belief');
    }
  };

  const removeEffect = (type: 'global' | 'job' | 'title' | 'belief' | 'skill', index: number, sourceId?: string) => {
    if (type === 'global') {
      setPlayer(prev => ({
        ...prev,
        effects: prev.effects.filter((_, i) => i !== index)
      }));
    } else if (type === 'title' && sourceId) {
      setTitles(prev => prev.map(t => t.id === sourceId ? { ...t, effects: t.effects.filter((_, i) => i !== index) } : t));
    } else if (type === 'belief' && sourceId) {
      setBeliefs(prev => prev.map(b => b.id === sourceId ? { ...b, effects: b.effects.filter((_, i) => i !== index) } : b));
    } else if (type === 'job' && sourceId) {
      setJobs(prev => prev.map(j => j.id === sourceId ? { ...j, effects: (j.effects || []).filter((_, i) => i !== index) } : j));
    } else if (type === 'skill' && sourceId) {
      setSkills(prev => prev.map(s => s.id === sourceId ? { ...s, effects: (s.effects || []).filter((_, i) => i !== index) } : s));
    }
    setEditingEffectIndex(null);
    notify('info', 'Effect removed');
  };

  const updateEffectDetail = (index: number, updates: Partial<Effect>) => {
    if (!editingEffectIndex) return;
    const { type, sourceId } = editingEffectIndex;
    if (type === 'global') {
      setPlayer(prev => ({
        ...prev,
        effects: prev.effects.map((e, i) => (i === index ? { ...e, ...updates } : e))
      }));
    } else if (type === 'title' && sourceId) {
      setTitles(prev => prev.map(t => (t.id === sourceId ? {
        ...t,
        effects: t.effects.map((e, i) => (i === index ? { ...e, ...updates } : e))
      } : t)));
    } else if (type === 'belief' && sourceId) {
      setBeliefs(prev => prev.map(b => (b.id === sourceId ? {
        ...b,
        effects: b.effects.map((e, i) => (i === index ? { ...e, ...updates } : e))
      } : b)));
    } else if (type === 'job' && sourceId) {
      setJobs(prev => prev.map(j => (j.id === sourceId ? {
        ...j,
        effects: (j.effects || []).map((e, i) => (i === index ? { ...e, ...updates } : e))
      } : j)));
    } else if (type === 'skill' && sourceId) {
      setSkills(prev => prev.map(s => (s.id === sourceId ? {
        ...s,
        effects: (s.effects || []).map((e, i) => (i === index ? { ...e, ...updates } : e))
      } : s)));
    }
  };

  const isEffectActiveWrapper = (eff: any) => {
    return isEffectActive(eff, eff.sourceTitle, eff.sourceJob, eff.sourceBelief, eff.sourceSkill);
  };

  // Load editing data
  useEffect(() => {
    if (editingEffectIndex) {
      let eff: Effect | undefined;
      if (editingEffectIndex.type === 'global') {
        eff = player.effects[editingEffectIndex.index];
      } else if (editingEffectIndex.type === 'title') {
        eff = titles.find(t => t.id === editingEffectIndex.sourceId)?.effects?.[editingEffectIndex.index];
      } else if (editingEffectIndex.type === 'belief') {
        eff = beliefs.find(b => b.id === editingEffectIndex.sourceId)?.effects?.[editingEffectIndex.index];
      } else if (editingEffectIndex.type === 'job') {
        eff = jobs.find(j => j.id === editingEffectIndex.sourceId)?.effects?.[editingEffectIndex.index];
      } else if (editingEffectIndex.type === 'skill') {
        eff = skills.find(s => s.id === editingEffectIndex.sourceId)?.effects?.[editingEffectIndex.index];
      }

      if (eff) {
        setEditName(eff.name);
        setEditDesc(eff.description);
        setEditType(eff.type);
        setEditStatBoosts(eff.statBoosts || []);
      }
    }
  }, [editingEffectIndex, player.effects, titles, beliefs, jobs, skills]);

  return {
    player,
    jobs,
    titles,
    beliefs,
    actualTotalStats,
    effectiveStats,
    effectiveTotalStats,
    allEffects,
    isEffectActive: isEffectActiveWrapper,
    isIdentificationCollapsed,
    setIsIdentificationCollapsed,
    isIdentityMatrixCollapsed,
    setIsIdentityMatrixCollapsed,
    showSyncConfirm,
    setShowSyncConfirm,
    isProjecting,
    setIsProjecting,
    simulatedTotal,
    setSimulatedTotal,
    titleSearchTerm,
    setTitleSearchTerm,
    beliefSearchTerm,
    setBeliefSearchTerm,
    effectSearchTerm,
    setEffectSearchTerm,
    effectTypeFilter,
    setEffectTypeFilter,
    showAddTitleForm,
    setShowAddTitleForm,
    newTitleName,
    setNewTitleName,
    newTitleDesc,
    setNewTitleDesc,
    showAddBeliefForm,
    setShowAddBeliefForm,
    newBeliefName,
    setNewBeliefName,
    newBeliefDesc,
    setNewBeliefDesc,
    showAddEffectForm,
    setShowAddEffectForm,
    newName,
    setNewName,
    newDesc,
    setNewDesc,
    newType,
    setNewType,
    newStatBoosts,
    setNewStatBoosts,
    titleEffectCreator,
    setTitleEffectCreator,
    teName,
    setTeName,
    teDesc,
    setTeDesc,
    teType,
    setTeType,
    teStatBoosts,
    setTeStatBoosts,
    beliefEffectCreator,
    setBeliefEffectCreator,
    beName,
    setBeName,
    beDesc,
    setBeDesc,
    beType,
    setBeType,
    beStatBoosts,
    setBeStatBoosts,
    editingEffectIndex,
    setEditingEffectIndex,
    editName,
    setEditName,
    editDesc,
    setEditDesc,
    editType,
    setEditType,
    editStatBoosts,
    setEditStatBoosts,
    filteredTitles,
    filteredBeliefs,
    filteredEffects,
    handleApplyProjection,
    handleSliderChange,
    handleInfoChange,
    handleUpdateTitleField,
    handleUpdateBeliefField,
    addTitle,
    addBelief,
    addGeneralEffect,
    addEffectToTitle,
    addEffectToBelief,
    removeEffect,
    updateEffectDetail,
    updateStat
  };
}
