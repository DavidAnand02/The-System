import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { PlayerData, Skill, Job, Title, Quest, QuestLogEntry, TimelogData, TagConfig, Belief, StatKey } from '../types';
import { 
  INITIAL_PLAYER_DATA, 
  INITIAL_SKILLS, 
  INITIAL_JOBS, 
  INITIAL_TITLES,
  INITIAL_QUESTS,
  INITIAL_TAG_CONFIGS,
  INITIAL_BELIEFS
} from '../constants';
import { dbService, SyncStatus } from '../services/db';

export interface PlayerStore {
  player: PlayerData;
  setPlayer: (player: PlayerData | ((prev: PlayerData) => PlayerData)) => void;
  
  skills: Skill[];
  setSkills: (skills: Skill[] | ((prev: Skill[]) => Skill[])) => void;
  
  jobs: Job[];
  setJobs: (jobs: Job[] | ((prev: Job[]) => Job[])) => void;
  
  titles: Title[];
  setTitles: (titles: Title[] | ((prev: Title[]) => Title[])) => void;
  
  quests: Quest[];
  setQuests: (quests: Quest[] | ((prev: Quest[]) => Quest[])) => void;
  
  questLog: QuestLogEntry[];
  setQuestLog: (questLog: QuestLogEntry[] | ((prev: QuestLogEntry[]) => QuestLogEntry[])) => void;
  
  timelog: TimelogData;
  setTimelog: (timelog: TimelogData | ((prev: TimelogData) => TimelogData)) => void;
  
  tagConfigs: TagConfig[];
  setTagConfigs: (tagConfigs: TagConfig[] | ((prev: TagConfig[]) => TagConfig[])) => void;
  
  beliefs: Belief[];
  setBeliefs: (beliefs: Belief[] | ((prev: Belief[]) => Belief[])) => void;
  
  isDirty: boolean;
  setIsDirty: (isDirty: boolean | ((prev: boolean) => boolean)) => void;
  
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus | ((prev: SyncStatus) => SyncStatus)) => void;
  
  loading: boolean;
  setLoading: (loading: boolean | ((prev: boolean) => boolean)) => void;
  
  uiState: {
    questsTab: 'recurring' | 'one-off' | 'recent-history' | 'log';
    timelogViewMode: 'calendar' | 'flow';
  };
  setQuestsTab: (tab: 'recurring' | 'one-off' | 'recent-history' | 'log') => void;
  setTimelogViewMode: (mode: 'calendar' | 'flow') => void;

  loadData: (userId: string, isOffline: boolean) => Promise<any>;
  saveData: (userId: string, email?: string, partialData?: any) => Promise<void>;
  updateStat: (stat: StatKey, points: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  player: INITIAL_PLAYER_DATA as PlayerData,
  setPlayer: (updater) => set((state) => ({
    player: typeof updater === 'function' ? updater(state.player) : updater
  })),

  uiState: {
    questsTab: 'recurring',
    timelogViewMode: 'calendar'
  },
  setQuestsTab: (tab) => set((state) => ({
    uiState: { ...state.uiState, questsTab: tab }
  })),
  setTimelogViewMode: (mode) => set((state) => ({
    uiState: { ...state.uiState, timelogViewMode: mode }
  })),

  skills: INITIAL_SKILLS as Skill[],
  setSkills: (updater) => set((state) => ({
    skills: typeof updater === 'function' ? updater(state.skills) : updater
  })),

  jobs: INITIAL_JOBS as Job[],
  setJobs: (updater) => set((state) => ({
    jobs: typeof updater === 'function' ? updater(state.jobs) : updater
  })),

  titles: INITIAL_TITLES as Title[],
  setTitles: (updater) => set((state) => {
    const nextTitles = typeof updater === 'function' ? updater(state.titles) : updater;
    console.log('[DIAGNOSTIC] usePlayerStore: titles updating', {
      prevCount: state.titles.length,
      nextCount: (nextTitles as Title[]).length,
      newTitles: (nextTitles as Title[]).map(t => t.name)
    });
    return { titles: nextTitles };
  }),

  quests: INITIAL_QUESTS as Quest[],
  setQuests: (updater) => set((state) => ({
    quests: typeof updater === 'function' ? updater(state.quests) : updater
  })),

  questLog: [],
  setQuestLog: (updater) => set((state) => ({
    questLog: typeof updater === 'function' ? updater(state.questLog) : updater
  })),

  timelog: {},
  setTimelog: (updater) => set((state) => ({
    timelog: typeof updater === 'function' ? updater(state.timelog) : updater
  })),

  tagConfigs: INITIAL_TAG_CONFIGS as TagConfig[],
  setTagConfigs: (updater) => set((state) => ({
    tagConfigs: typeof updater === 'function' ? updater(state.tagConfigs) : updater
  })),

  beliefs: INITIAL_BELIEFS as Belief[],
  setBeliefs: (updater) => set((state) => ({
    beliefs: typeof updater === 'function' ? updater(state.beliefs) : updater
  })),

  isDirty: false,
  setIsDirty: (updater) => set((state) => ({
    isDirty: typeof updater === 'function' ? updater(state.isDirty) : updater
  })),

  syncStatus: 'idle',
  setSyncStatus: (updater) => set((state) => ({
    syncStatus: typeof updater === 'function' ? updater(state.syncStatus) : updater
  })),

  loading: true,
  setLoading: (updater) => set((state) => ({
    loading: typeof updater === 'function' ? updater(state.loading) : updater
  })),

  loadData: async (userId: string, isOffline: boolean) => {
    set({ loading: true });
    try {
      const data = await dbService.fetchData(userId, isOffline);
      if (data) {
        set((state) => ({
          player: data.player_data || state.player,
          skills: data.skills || state.skills,
          jobs: data.jobs || state.jobs,
          titles: data.titles || state.titles,
          beliefs: data.beliefs || state.beliefs,
          quests: data.quests || state.quests,
          questLog: data.quest_log || state.questLog,
          timelog: data.timelog || state.timelog,
          tagConfigs: data.tag_configs || state.tagConfigs,
        }));
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error loading data:', err);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  saveData: async (userId: string, email?: string, partialData?: any) => {
    if (!userId) return;
    set({ syncStatus: 'syncing' });
    try {
      const state = get();
      const dataToSave = partialData || {
        player_data: state.player,
        skills: state.skills,
        jobs: state.jobs,
        titles: state.titles,
        beliefs: state.beliefs,
        quests: state.quests,
        quest_log: state.questLog,
        timelog: state.timelog,
        tag_configs: state.tagConfigs,
      };

      await dbService.saveUserData(userId, dataToSave, email);
      set({ isDirty: false, syncStatus: 'saved' });
      
      // Reset to idle after a few seconds
      setTimeout(() => set({ syncStatus: 'idle' }), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      set({ syncStatus: 'error' });
    }
  },

  updateStat: (stat, points) => {
    set((state) => ({
      player: {
        ...state.player,
        stats: {
          ...state.player.stats,
          [stat]: state.player.stats[stat] + points
        },
        lastStatIncrease: {
          ...state.player.lastStatIncrease,
          [stat]: new Date().toISOString()
        }
      },
      isDirty: true
    }));
  },
}));

// --- Atomic Selectors ---

export const selectPlayerStats = (state: PlayerStore) => state.player.stats;

export const selectPlayerSkills = (state: PlayerStore) => state.skills;

export const selectPlayerQuests = (state: PlayerStore) => state.quests;

export const selectPlayerJobs = (state: PlayerStore) => state.jobs;

export const selectPlayerTitles = (state: PlayerStore) => state.titles;

export const selectPlayerBeliefs = (state: PlayerStore) => state.beliefs;

export const selectPlayerTimelog = (state: PlayerStore) => state.timelog;

export const selectPlayerConfig = (state: PlayerStore) => ({
  tagConfigs: state.tagConfigs,
  setTagConfigs: state.setTagConfigs
});

export const selectPlayerSync = (state: PlayerStore) => ({
  isDirty: state.isDirty,
  setIsDirty: state.setIsDirty,
  syncStatus: state.syncStatus,
  setSyncStatus: state.setSyncStatus,
  loading: state.loading,
  setLoading: state.setLoading,
  loadData: state.loadData,
  saveData: state.saveData
});

// A hook specifically for all the setter actions so components don't subscribe to state changes
export const selectPlayerActions = (state: PlayerStore) => ({
  setPlayer: state.setPlayer,
  setSkills: state.setSkills,
  setJobs: state.setJobs,
  setTitles: state.setTitles,
  setQuests: state.setQuests,
  setQuestLog: state.setQuestLog,
  setTimelog: state.setTimelog,
  setTagConfigs: state.setTagConfigs,
  setBeliefs: state.setBeliefs,
  updateStat: state.updateStat
});

