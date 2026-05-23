import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { retryWithBackoff } from '../lib/retry';
import { PlayerData, Skill, Job, Title, Belief, Quest, TimelogData, TagConfig, QuestLogEntry } from '../types';
import { 
  INITIAL_PLAYER_DATA, 
  INITIAL_SKILLS, 
  INITIAL_JOBS, 
  INITIAL_TITLES, 
  INITIAL_BELIEFS, 
  INITIAL_QUESTS, 
  INITIAL_TAG_CONFIGS 
} from '../constants';

export interface SystemData {
  player_data: PlayerData;
  skills: Skill[];
  jobs: Job[];
  titles: Title[];
  beliefs: Belief[];
  quests: Quest[];
  quest_log: QuestLogEntry[];
  timelog: TimelogData;
  tag_configs: TagConfig[];
  version: number;
  updated_at: string;
  email?: string;
}

export const CURRENT_SYSTEM_VERSION = 1;

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

export const dbService = {
  validateData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    // Basic check for player_data which is the most critical
    return 'player_data' in data;
  },

  migrateData(data: any): SystemData {
    // Ensure all required fields exist
    const migrated: SystemData = {
      player_data: data.player_data || INITIAL_PLAYER_DATA,
      skills: (data.skills && data.skills.length > 0) ? data.skills : INITIAL_SKILLS,
      jobs: (data.jobs && data.jobs.length > 0) ? data.jobs : INITIAL_JOBS,
      titles: (data.titles && data.titles.length > 0) ? data.titles : INITIAL_TITLES,
      beliefs: (data.beliefs && data.beliefs.length > 0) ? data.beliefs : (data.player_data?.beliefArchive || INITIAL_BELIEFS),
      quests: (data.quests && data.quests.length > 0) ? data.quests : INITIAL_QUESTS,
      quest_log: (data.quest_log && data.quest_log.length > 0) ? data.quest_log : (data.player_data?.questLog || []),
      timelog: data.timelog || {},
      tag_configs: (data.tag_configs && data.tag_configs.length > 0) ? data.tag_configs : INITIAL_TAG_CONFIGS,
      version: data.version || 0,
      updated_at: data.updated_at || new Date().toISOString(),
      email: data.email,
    };

    // Remove legacy nested beliefArchive if it exists
    if (migrated.player_data && (migrated.player_data as any).beliefArchive) {
      const { beliefArchive, ...rest } = migrated.player_data as any;
      migrated.player_data = rest;
    }

    // Remove legacy nested questLog if it exists
    if (migrated.player_data && (migrated.player_data as any).questLog) {
      const { questLog, ...rest } = migrated.player_data as any;
      migrated.player_data = rest;
    }

    return migrated;
  },

  async fetchData(userId: string, isOffline: boolean): Promise<SystemData | null> {
    try {
      // Check local storage first for immediate load if offline
      const localData = localStorage.getItem(`system_backup_${userId}`);
      let result: SystemData | null = null;
      
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (this.validateData(parsed)) {
            result = this.migrateData(parsed);
          }
        } catch (e) {
          console.error('Error parsing local data:', e);
        }
      }

      // Skip Supabase if offline or guest
      if (!isOffline && userId !== 'guest_user' && isSupabaseConfigured) {
        const { data, error } = await retryWithBackoff(async () => {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (result.error && result.error.code !== 'PGRST116') {
            throw result.error;
          }
          return result;
        });

        if (data && this.validateData(data)) {
          result = this.migrateData(data);
        }
      }
      
      return result;
    } catch (err) {
      console.error('Error fetching data:', err);
      return null;
    }
  },

  async saveUserData(userId: string, data: Partial<Omit<SystemData, 'updated_at' | 'version'>>, email?: string): Promise<void> {
    if (!userId) return;
    
    const now = new Date().toISOString();
    
    // 1. Update Local Storage (Merge with existing for complete backup)
    const localData = localStorage.getItem(`system_backup_${userId}`);
    let fullPayload: SystemData;
    
    if (localData) {
      const parsed = JSON.parse(localData);
      fullPayload = {
        ...parsed,
        ...data,
        version: CURRENT_SYSTEM_VERSION,
        updated_at: now,
        email: email || data.email || parsed.email,
      };
    } else {
      // Fallback if no local data exists (shouldn't happen often)
      fullPayload = {
        player_data: INITIAL_PLAYER_DATA,
        skills: INITIAL_SKILLS,
        jobs: INITIAL_JOBS,
        titles: INITIAL_TITLES,
        beliefs: INITIAL_BELIEFS,
        quests: INITIAL_QUESTS,
        quest_log: [],
        timelog: {},
        tag_configs: INITIAL_TAG_CONFIGS,
        ...data,
        version: CURRENT_SYSTEM_VERSION,
        updated_at: now,
        email: email || data.email,
      } as SystemData;
    }

    localStorage.setItem(`system_backup_${userId}`, JSON.stringify(fullPayload));

    // 2. Update Supabase (Partial update with retry logic)
    if (userId === 'guest_user' || !isSupabaseConfigured) {
      return;
    }

    try {
      await retryWithBackoff(async () => {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            ...data,
            version: CURRENT_SYSTEM_VERSION,
            updated_at: now,
            ...(email ? { email } : {})
          });

        if (error) throw error;
      });
    } catch (err) {
      console.error('Error saving data to Supabase after retries:', err);
      throw err; // Re-throw to handle in UI
    }
  },

  async deleteAccount(userId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    
    await retryWithBackoff(async () => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      await supabase.auth.signOut();
    });

    localStorage.removeItem(`system_backup_${userId}`);
  }
};
