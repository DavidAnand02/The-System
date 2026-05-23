import React, { useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Info, Trash2 } from 'lucide-react';
import StatBoostEditor from '../StatBoostEditor';
import { Effect } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';

interface EffectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: { type: 'global' | 'job' | 'title' | 'belief' | 'skill'; index: number; sourceId?: string } | null;
}

export const EffectDetailModal: React.FC<EffectDetailModalProps> = ({
  isOpen,
  onClose,
  target,
}) => {
  const { player, jobs, titles, beliefs, skills, setPlayer, setJobs, setTitles, setBeliefs, setSkills } = usePlayerStore(
    useShallow(state => ({
      player: state.player,
      jobs: state.jobs,
      titles: state.titles,
      beliefs: state.beliefs,
      skills: state.skills,
      setPlayer: state.setPlayer,
      setJobs: state.setJobs,
      setTitles: state.setTitles,
      setBeliefs: state.setBeliefs,
      setSkills: state.setSkills
    }))
  );

  const effect = useMemo(() => {
    if (!target) return null;
    if (target.type === 'global') return player.effects[target.index];
    if (target.type === 'job') return jobs.find(j => j.id === target.sourceId)?.effects?.[target.index];
    if (target.type === 'title') return titles.find(t => t.id === target.sourceId)?.effects?.[target.index];
    if (target.type === 'belief') return beliefs.find(b => b.id === target.sourceId)?.effects?.[target.index];
    if (target.type === 'skill') return skills.find(s => s.id === target.sourceId)?.effects?.[target.index];
    return null;
  }, [target, player.effects, jobs, titles, beliefs, skills]);

  const sourceLabel = useMemo(() => {
    if (!target) return '';
    if (target.type === 'global') return 'General Protocol';
    if (target.type === 'job') return `[Class] ${jobs.find(j => j.id === target.sourceId)?.title}`;
    if (target.type === 'title') return `[Title] ${titles.find(t => t.id === target.sourceId)?.name}`;
    if (target.type === 'belief') return `[Belief] ${beliefs.find(b => b.id === target.sourceId)?.name}`;
    if (target.type === 'skill') return `[Skill] ${skills.find(s => s.id === target.sourceId)?.name}`;
    return '';
  }, [target, jobs, titles, beliefs, skills]);

  const onUpdate = (updates: Partial<Effect>) => {
    if (!target) return;
    if (target.type === 'global') {
      setPlayer(prev => ({ ...prev, effects: prev.effects.map((e, i) => i === target.index ? { ...e, ...updates } : e) }));
    } else if (target.type === 'job' && target.sourceId) {
      setJobs(prev => prev.map(j => j.id === target.sourceId ? { ...j, effects: (j.effects || []).map((e, i) => i === target.index ? { ...e, ...updates } : e) } : j));
    } else if (target.type === 'title' && target.sourceId) {
      setTitles(prev => prev.map(t => t.id === target.sourceId ? { ...t, effects: (t.effects || []).map((e, i) => i === target.index ? { ...e, ...updates } : e) } : t));
    } else if (target.type === 'belief' && target.sourceId) {
      setBeliefs(prev => prev.map(b => b.id === target.sourceId ? { ...b, effects: (b.effects || []).map((e, i) => i === target.index ? { ...e, ...updates } : e) } : b));
    } else if (target.type === 'skill' && target.sourceId) {
      setSkills(prev => prev.map(s => s.id === target.sourceId ? { ...s, effects: (s.effects || []).map((e, i) => i === target.index ? { ...e, ...updates } : e) } : s));
    }
  };

  const onRemove = () => {
    if (!target) return;
    if (target.type === 'global') {
      setPlayer(prev => ({ ...prev, effects: prev.effects.filter((_, i) => i !== target.index) }));
    } else if (target.type === 'job' && target.sourceId) {
      setJobs(prev => prev.map(j => j.id === target.sourceId ? { ...j, effects: (j.effects || []).filter((_, i) => i !== target.index) } : j));
    } else if (target.type === 'title' && target.sourceId) {
      setTitles(prev => prev.map(t => t.id === target.sourceId ? { ...t, effects: (t.effects || []).filter((_, i) => i !== target.index) } : t));
    } else if (target.type === 'belief' && target.sourceId) {
      setBeliefs(prev => prev.map(b => b.id === target.sourceId ? { ...b, effects: (b.effects || []).filter((_, i) => i !== target.index) } : b));
    } else if (target.type === 'skill' && target.sourceId) {
      setSkills(prev => prev.map(s => s.id === target.sourceId ? { ...s, effects: (s.effects || []).filter((_, i) => i !== target.index) } : s));
    }
    onClose();
  };

  if (!effect) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Effect Overview"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 bg-system-accent/5 border border-system-accent/10 rounded-xl">
          <Info className="text-system-accent shrink-0" size={18} />
          <div>
            <label className="text-[8px] text-system-text-muted uppercase tracking-widest block font-orbitron">Origin Source</label>
            <span className="text-xs text-system-accent font-orbitron font-bold">{sourceLabel}</span>
          </div>
        </div>

        <div className="space-y-4">
          <Input 
            label="Effect Name"
            value={effect.name ?? ''}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="font-orbitron"
          />
          <TextArea 
            label="Effect Description"
            value={effect.description ?? ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="h-32"
          />
          
          <StatBoostEditor 
            boosts={effect.statBoosts || []} 
            onChange={(newBoosts) => onUpdate({ statBoosts: newBoosts.length > 0 ? newBoosts : undefined })} 
          />

          <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-[10px] text-system-text-muted uppercase font-orbitron">Protocol Type</span>
            <Badge variant={effect.type === 'active' ? 'accent' : 'outline'} className="font-orbitron">
              {effect.type === 'active' ? 'Active Skill' : 'Passive Trait'}
            </Badge>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-white/10">
          <Button variant="secondary" onClick={onClose} className="flex-1">DISMISS</Button>
          <Button 
            variant="danger"
            onClick={onRemove} 
            icon={Trash2}
          >
            TERMINATE
          </Button>
        </div>
      </div>
    </Modal>
  );
};
