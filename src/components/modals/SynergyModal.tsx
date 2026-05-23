import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import StatBoostEditor from '../StatBoostEditor';
import { StatBoost, Effect } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useSound } from '../../contexts/SoundContext';

interface SynergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  target: { type: 'title' | 'belief' | 'general' | 'job' | 'skill'; id?: string } | null;
  submitLabel?: string;
}

export const SynergyModal: React.FC<SynergyModalProps> = ({
  isOpen,
  onClose,
  title,
  target,
  submitLabel = "INSCRIBE"
}) => {
  const { setTitles, setBeliefs, setPlayer, setJobs, setSkills } = usePlayerStore(
    useShallow(state => ({
      setTitles: state.setTitles,
      setBeliefs: state.setBeliefs,
      setPlayer: state.setPlayer,
      setJobs: state.setJobs,
      setSkills: state.setSkills
    }))
  );
  const { playSuccess } = useSound();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'passive' | 'active'>('passive');
  const [statBoosts, setStatBoosts] = useState<StatBoost[]>([]);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setType('passive');
      setStatBoosts([]);
    }
  }, [isOpen, target]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target) return;

    const newEffect: Effect = {
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      type,
      statBoosts: statBoosts.length > 0 ? statBoosts : undefined
    };

    if (target.type === 'title' && target.id) {
      setTitles(prev => prev.map(t => t.id === target.id ? { ...t, effects: [...(t.effects || []), newEffect] } : t));
    } else if (target.type === 'belief' && target.id) {
      setBeliefs(prev => prev.map(b => b.id === target.id ? { ...b, effects: [...(b.effects || []), newEffect] } : b));
    } else if (target.type === 'job' && target.id) {
      setJobs(prev => prev.map(j => j.id === target.id ? { ...j, effects: [...(j.effects || []), newEffect] } : j));
    } else if (target.type === 'skill' && target.id) {
      setSkills(prev => prev.map(s => s.id === target.id ? { ...s, effects: [...(s.effects || []), newEffect] } : s));
    } else if (target.type === 'general') {
      setPlayer(prev => ({ ...prev, effects: [...prev.effects, newEffect] }));
    }

    playSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-system-text-muted uppercase tracking-widest font-orbitron">Effect Type</label>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button 
                type="button" 
                onClick={() => setType('passive')} 
                className={`flex-1 py-2 rounded-lg text-[10px] font-orbitron uppercase transition-all ${type === 'passive' ? 'bg-system-accent text-system-bg-base' : 'text-system-text-muted hover:text-system-text'}`}
              >
                Passive Trait
              </button>
              <button 
                type="button" 
                onClick={() => setType('active')} 
                className={`flex-1 py-2 rounded-lg text-[10px] font-orbitron uppercase transition-all ${type === 'active' ? 'bg-system-accent text-system-bg-base' : 'text-system-text-muted hover:text-system-text'}`}
              >
                Active Skill
              </button>
            </div>
          </div>
          <Input 
            label="Effect Name"
            placeholder="e.g. Void Step" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <TextArea 
            label="Effect Logic"
            placeholder="Describe the synergy..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="h-24"
          />
          <StatBoostEditor boosts={statBoosts} onChange={setStatBoosts} />
        </div>
        <div className="flex space-x-3 pt-4 border-t border-white/10">
          <Button type="submit" className="flex-1">{submitLabel}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>ABORT</Button>
        </div>
      </form>
    </Modal>
  );
};
