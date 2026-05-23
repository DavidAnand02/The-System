import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useSound } from '../../contexts/SoundContext';
import { Title } from '../../types';

interface TitleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TitleModal: React.FC<TitleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const setTitles = usePlayerStore(state => state.setTitles);
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
      const newTitle: Title = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim() || 'A title earned through unknown deeds.',
        effects: []
      };
      console.log('[DIAGNOSTIC] TitleModal: Submitting new title', newTitle);
      setTitles(prev => {
        const next = [...prev, newTitle];
        console.log('[DIAGNOSTIC] TitleModal: setTitles updater called', { prevCount: prev.length, nextCount: next.length });
        return next;
      });
      playSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Protocol: Title"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input 
            label="Title Designation"
            placeholder="e.g. Shadow Weaver" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <TextArea 
            label="Narrative"
            placeholder="How was this title earned?" 
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
