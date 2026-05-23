import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UsernameModal } from './modals/UsernameModal';
import { ImportConfirmModal } from './modals/ImportConfirmModal';
import { SupportModal } from './modals/SupportModal';
import { DeleteConfirmModal } from './modals/DeleteConfirmModal';
import { useSound } from '../contexts/SoundContext';

export interface GlobalModalsRef {
  openUsernameModal: () => void;
  closeUsernameModal: () => void;
  openSupportModal: () => void;
  openDeleteConfirm: () => void;
  openImportConfirm: (data: any) => void;
}

interface GlobalModalsProps {
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteAccount: () => Promise<void>;
  applyImportedData: (data: any) => void;
}

export const GlobalModals = forwardRef<GlobalModalsRef, GlobalModalsProps>(({
  importData,
  handleDeleteAccount,
  applyImportedData
}, ref) => {
  const { isSyncing } = useSound();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    openUsernameModal: () => {
      setShowUsernameModal(true);
    },
    closeUsernameModal: () => {
      setShowUsernameModal(false);
    },
    openSupportModal: () => setShowSupportModal(true),
    openDeleteConfirm: () => setShowDeleteConfirm(true),
    openImportConfirm: (data: any) => {
      setPendingImportData(data);
      setShowImportConfirm(true);
    }
  }));

  const onDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteAccount();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const onImportConfirm = () => {
    applyImportedData(pendingImportData);
    setShowImportConfirm(false);
    setPendingImportData(null);
  };

  const onImportCancel = () => {
    setShowImportConfirm(false);
    setPendingImportData(null);
  };

  return (
    <>
      {showUsernameModal && (
        <UsernameModal 
          onImportData={importData}
          onClose={() => setShowUsernameModal(false)}
        />
      )}
      {showSupportModal && (
        <SupportModal onClose={() => setShowSupportModal(false)} />
      )}
      {showDeleteConfirm && (
        <DeleteConfirmModal 
          isDeleting={isDeleting}
          onConfirm={onDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {showImportConfirm && (
        <ImportConfirmModal 
          onConfirm={onImportConfirm}
          onCancel={onImportCancel}
        />
      )}

      <AnimatePresence>
        {isSyncing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-system-bg-base/90 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <div className="relative w-64 h-1 bg-system-accent/20 overflow-hidden mb-4">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-system-accent shadow-[0_0_15px_var(--system-accent-glow)]"
              />
            </div>
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs font-orbitron text-system-accent uppercase tracking-[0.5em] animate-pulse"
            >
              Synchronizing Neural Data
            </motion.div>
            <div className="mt-8 grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    height: [4, 16, 4],
                    opacity: [0.2, 1, 0.2]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                  className="w-1 bg-system-accent"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
