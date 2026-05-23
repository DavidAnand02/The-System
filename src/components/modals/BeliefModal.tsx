import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useSound } from '../../contexts/SoundContext';
import { Belief } from '../../types';

interface BeliefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeliefModal: React.FC<BeliefModalProps> = ({
  isOpen,
  onClose,
}) => {
  const setBeliefs = usePlayerStore(state => state.setBeliefs);
  const { playSuccess } = useSound();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const newBelief: Belief = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim() || 'A core belief that shapes the player\'s reality.',
        effects: []
      };
      setBeliefs(prev => [...prev, newBelief]);
      playSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Protocol: Belief"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input 
            label="Belief Designation"
            placeholder="e.g. Absolute Justice" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <TextArea 
            label="Core Tenet"
            placeholder="What is the essence of this belief?" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="h-32"
          />
        </div>
        <div className="flex space-x-3">
          <Button type="submit" className="flex-1">AUTHORIZE</Button>
          <Button type="button" variant="secondary" onClick={onClose}>CANCEL</Button>
        </div>
      </form>
    </Modal>
  );
};
