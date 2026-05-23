import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface DeleteConfirmModalProps {
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isDeleting,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Critical Action"
      size="sm"
    >
      <div className="space-y-6 text-center p-2">
        <div className="p-3 bg-system-error/10 rounded-full w-fit mx-auto text-system-error">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-system-text-muted font-light leading-relaxed">
            You are about to initiate a full system purge. All progress, stats, and logs will be permanently erased from the matrix.
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <button 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="w-full py-3 bg-system-error text-white font-orbitron text-xs rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 hover-glitch"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                PURGING...
              </>
            ) : (
              'CONFIRM SYSTEM PURGE'
            )}
          </button>
          <button 
            onClick={onCancel} 
            disabled={isDeleting}
            className="w-full py-3 bg-system-bg-panel text-system-text-muted font-orbitron text-xs rounded-xl border border-system-border hover:text-system-text transition-colors hover-glitch"
          >
            ABORT MISSION
          </button>
        </div>
      </div>
    </Modal>
  );
};
