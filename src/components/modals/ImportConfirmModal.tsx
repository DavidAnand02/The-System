import React from 'react';
import { Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface ImportConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportConfirmModal: React.FC<ImportConfirmModalProps> = ({
  onConfirm,
  onCancel
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Data Overwrite"
      size="sm"
    >
      <div className="space-y-6 text-center p-2">
        <div className="p-3 bg-system-warning/10 rounded-full w-fit mx-auto text-system-warning">
          <Upload className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-system-text-muted font-light leading-relaxed">
            Importing this neural profile will <span className="text-system-warning font-bold">OVERWRITE</span> your current progress. This action cannot be undone.
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <button 
            onClick={onConfirm} 
            className="w-full py-3 bg-system-warning text-system-bg-base font-orbitron text-xs rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 hover-glitch"
          >
            CONFIRM OVERWRITE
          </button>
          <button 
            onClick={onCancel} 
            className="w-full py-3 bg-system-bg-panel text-system-text-muted font-orbitron text-xs rounded-xl border border-system-border hover:text-system-text transition-colors hover-glitch"
          >
            CANCEL IMPORT
          </button>
        </div>
      </div>
    </Modal>
  );
};
