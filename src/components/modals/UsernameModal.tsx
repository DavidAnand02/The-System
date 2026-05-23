import React, { useState } from 'react';
import { Settings, Upload } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useSound } from '../../contexts/SoundContext';
import { Modal } from '../ui/Modal';

interface UsernameModalProps {
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({
  onImportData,
  onClose
}) => {
  const setPlayer = usePlayerStore(state => state.setPlayer);
  const { playSuccess } = useSound();
  const [tempUsername, setTempUsername] = useState('');

  const handleSetUsername = () => {
    if (tempUsername.trim()) {
      setPlayer(prev => ({ ...prev, username: tempUsername.trim() }));
      playSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {}} // Identity initialization is mandatory
      title="Identity Initialization"
      size="sm"
      showCloseButton={false}
    >
      <div className="space-y-6 text-center p-2">
        <div className="p-3 bg-system-accent/10 rounded-full w-fit mx-auto text-system-accent">
          <Settings className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-system-text-muted font-light leading-relaxed">
            The System requires a unique identifier to synchronize your neural profile. Enter your chosen alias.
          </p>
        </div>
        <div className="space-y-4">
          <input 
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="ENTER ALIAS..."
            className="w-full bg-system-bg-panel/50 border border-system-border rounded-xl px-4 py-3 text-center font-orbitron text-sm text-system-accent focus:border-system-accent outline-none transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSetUsername()}
            autoFocus
          />
          <button 
            onClick={handleSetUsername}
            disabled={!tempUsername.trim()}
            className="w-full py-3 bg-system-accent text-system-bg-base font-orbitron text-xs rounded-xl hover:bg-system-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-system-accent/20 hover-glitch"
          >
            INITIALIZE LINK
          </button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-system-border"></div></div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em]"><span className="bg-system-bg-panel px-2 text-system-text-muted">OR</span></div>
          </div>

          <label className="w-full py-3 bg-system-bg-panel border border-system-border text-system-text-muted font-orbitron text-[10px] rounded-xl hover:bg-system-accent/5 hover:text-system-accent transition-all cursor-pointer flex items-center justify-center gap-2 hover-glitch">
            <Upload className="w-3 h-3" />
            IMPORT NEURAL DATA (.JSON)
            <input type="file" accept=".json" onChange={onImportData} className="hidden" />
          </label>
        </div>
      </div>
    </Modal>
  );
};
