import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export function useDataSync(session: any, isOffline: boolean) {
  const isDirty = usePlayerStore(state => state.isDirty);
  const saveData = usePlayerStore(state => state.saveData);

  const saveTimeoutRef = useRef<any>(null);

  const saveUserData = useCallback(async (userId: string, partialData?: any) => {
    await saveData(userId, session?.user?.email, partialData);
  }, [saveData, session?.user?.email]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (!isOffline && isDirty && session) {
      saveUserData(session.user.id);
    }
  }, [isOffline, isDirty, session, saveUserData]);

  // Handle tab close / navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const state = usePlayerStore.getState();
      if (state.isDirty && session) {
        // Trigger an immediate save attempt. 
        // Note: Modern browsers may not wait for the async save to finish,
        // but this is the best effort we can make.
        saveUserData(session.user.id);
        
        // Standard warning for unsaved changes
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session, saveUserData]);

  // Sync to Supabase on changes with debounce
  useEffect(() => {
    const unsubscribe = usePlayerStore.subscribe((state, prevState) => {
      const dataChanged = 
        state.player !== prevState.player ||
        state.skills !== prevState.skills ||
        state.jobs !== prevState.jobs ||
        state.titles !== prevState.titles ||
        state.beliefs !== prevState.beliefs ||
        state.quests !== prevState.quests ||
        state.questLog !== prevState.questLog ||
        state.timelog !== prevState.timelog ||
        state.tagConfigs !== prevState.tagConfigs;

      if (dataChanged && session && !state.loading) {
        state.setIsDirty(true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        saveTimeoutRef.current = setTimeout(() => {
          saveUserData(session.user.id);
        }, 2000); // 2 second debounce for general changes
      }
    });

    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [session, saveUserData]);

  return { saveUserData };
}
