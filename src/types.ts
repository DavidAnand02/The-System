export enum StatKey {
  Strength = 'strength',
  Agility = 'agility',
  Dexterity = 'dexterity',
  Endurance = 'endurance',
  Intelligence = 'intelligence',
  Creativity = 'creativity',
  Perception = 'perception',
  Charisma = 'charisma',
  Willpower = 'willpower',
  Luck = 'luck'
}

export interface PlayerStats {
  [StatKey.Strength]: number;
  [StatKey.Agility]: number;
  [StatKey.Dexterity]: number;
  [StatKey.Endurance]: number;
  [StatKey.Intelligence]: number;
  [StatKey.Creativity]: number;
  [StatKey.Perception]: number;
  [StatKey.Charisma]: number;
  [StatKey.Willpower]: number;
  [StatKey.Luck]: number;
}

export interface GrowthEntry {
  level: number;
  timestamp: string;
  statsGained: { stat: StatKey; points: number }[];
}

export interface Skill {
  id: string;
  name: string;
  type: 'mental' | 'physical';
  hours: number;
  level: number;
  description: string;
  effects?: Effect[];
  folderId?: string;
  rewardConfig?: RewardConfig;
  lastWorkedAt?: string; // ISO string
  totalPointsEarned?: Partial<Record<StatKey, number>>;
  growthHistory?: GrowthEntry[];
}

export interface RewardConfig {
  stats: { stat: StatKey; points: number }[];
}

export interface Folder {
  id: string;
  name: string;
  type: 'mental' | 'physical';
}

export interface Job {
  id: string;
  title: string;
  description: string;
  hours: number;
  level: number;
  effects: Effect[];
  rewardConfig?: RewardConfig;
  lastWorkedAt?: string; // ISO string
  totalPointsEarned?: Partial<Record<StatKey, number>>;
  growthHistory?: GrowthEntry[];
}

export interface Title {
  id: string;
  name: string;
  description: string;
  effects: Effect[];
}

export interface Belief {
  id: string;
  name: string;
  description: string;
  effects: Effect[];
}

export interface StatBoost {
  stat: StatKey;
  amount: number;
}

export interface Effect {
  name: string;
  description: string;
  type: 'active' | 'passive';
  statBoosts?: StatBoost[];
}

export interface SubQuest {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  type: 'recurring' | 'one-off';
  title: string;
  description: string;
  reward: string;
  classTag: string;
  punishment: string;
  status: 'in-progress' | 'completed' | 'failed';
  deadline?: string; // HH:mm for recurring, ISO string for one-off
  streakCount: number;
  maxStreak: number;
  lastCompletedDate?: string;
  lastResetDate?: string;
  autoRefresh: boolean;
  refreshIntervalDays: number; // The value for the interval
  refreshUnit: 'minutes' | 'hours' | 'days';
  refreshTime: string; // HH:mm when the refresh happens (only relevant for 'days' unit)
  nextRefreshDate?: string; // ISO string calculated after completion/failure
  subQuests: SubQuest[];
  progress: number; // 0 to 100
  rewardStat?: StatKey;
  rewardPoints?: number;
  penaltyStat?: StatKey;
  penaltyPoints?: number;
}

export type TimelogTag = string;

export interface TagConfig {
  id: string;
  label: string;
  color: string;
  description: string;
}

export interface TimelogData {
  [dateKey: string]: {
    [hour: number]: TimelogTag; 
  };
}

export interface QuestLogEntry {
  id: string;
  questId: string;
  questTitle: string;
  outcome: 'completed' | 'failed';
  timestamp: string;
  rewardPoints?: number;
  rewardStat?: StatKey;
  penaltyPoints?: number;
  penaltyStat?: StatKey;
}

export interface PlayerData {
  level: number;
  jobClass: string; // Deprecated: use equippedJobs
  title: string;    // Deprecated: use equippedTitles
  belief: string;   // Deprecated: use equippedBeliefs
  equippedJobs?: string[];
  equippedTitles?: string[];
  equippedBeliefs?: string[];
  stats: PlayerStats;
  effects: Effect[];
  themeColor?: string;
  skillFolders?: Folder[];
  lastStatIncrease?: Partial<Record<StatKey, string>>; // StatKey -> ISO string
  username?: string;
}
