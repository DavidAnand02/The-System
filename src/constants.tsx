import React from 'react';
import { StatKey, PlayerStats, TimelogTag } from './types';

export const COLORS = {
  primary: '#06b6d4', // Cyan 500
  secondary: '#3b82f6', // Blue 500
  background: '#0f172a', // Slate 900
  card: '#1e293b', // Slate 800
};

export const TIMELOG_TAGS: Record<Exclude<TimelogTag, ''>, { label: string, color: string, description: string }> = {
  study: { label: 'Study', color: 'bg-cyan-500', description: 'Deep Learning & Absorption' },
  build: { label: 'Build', color: 'bg-emerald-500', description: 'Active Creation & Progress' },
  admin: { label: 'Admin', color: 'bg-violet-500', description: 'Maintenance & Logistics' },
  chaos: { label: 'Chaos', color: 'bg-rose-500', description: 'High Intensity & Unplanned' }
};

export const INITIAL_STATS: PlayerStats = {
  [StatKey.Strength]: 1,
  [StatKey.Agility]: 1,
  [StatKey.Dexterity]: 1,
  [StatKey.Endurance]: 1,
  [StatKey.Intelligence]: 1,
  [StatKey.Creativity]: 1,
  [StatKey.Perception]: 1,
  [StatKey.Charisma]: 1,
  [StatKey.Willpower]: 1,
  [StatKey.Luck]: 1,
};

export const INITIAL_PLAYER_DATA = {
  level: 1,
  username: 'Player',
  jobClass: 'Novice',
  title: 'Player',
  belief: 'Growth Mindset',
  stats: INITIAL_STATS,
  effects: [
    { name: 'System Access: Level 1', description: 'Basic authorization to the system interface.', type: 'passive' },
    { name: 'Persistent Will', description: 'Mental fortitude remains steady under pressure.', type: 'passive' },
    { name: 'Growth Mindset', description: 'Belief that abilities can be developed through dedication.', type: 'passive' }
  ],
  skillFolders: [],
  lastStatIncrease: {},
  equippedJobs: ['Novice'],
  equippedTitles: ['Player'],
  equippedBeliefs: ['Growth Mindset']
};

export const INITIAL_SKILLS = [
  { 
    id: 's1', 
    name: 'Critical Thinking', 
    type: 'mental', 
    hours: 0, 
    level: 1, 
    description: 'Objective analysis and evaluation of an issue.', 
    rewardConfig: { stats: [{ stat: StatKey.Intelligence, points: 2 }] },
    totalPointsEarned: { [StatKey.Intelligence]: 0 },
    growthHistory: [{ level: 1, timestamp: new Date().toISOString(), statsGained: [] }]
  },
  { 
    id: 's2', 
    name: 'Super Learning', 
    type: 'mental', 
    hours: 0, 
    level: 1, 
    description: 'Accelerated neural pathway formation.', 
    rewardConfig: { stats: [{ stat: StatKey.Intelligence, points: 2 }] },
    totalPointsEarned: { [StatKey.Intelligence]: 0 },
    growthHistory: [{ level: 1, timestamp: new Date().toISOString(), statsGained: [] }]
  },
  { 
    id: 's3', 
    name: 'Pull Ups', 
    type: 'physical', 
    hours: 0, 
    level: 1, 
    description: 'Standard upper body pulling strength.', 
    rewardConfig: { stats: [{ stat: StatKey.Strength, points: 2 }] },
    totalPointsEarned: { [StatKey.Strength]: 0 },
    growthHistory: [{ level: 1, timestamp: new Date().toISOString(), statsGained: [] }]
  },
  { 
    id: 's4', 
    name: 'Push Ups', 
    type: 'physical', 
    hours: 0, 
    level: 1, 
    description: 'Standard upper body pushing strength.', 
    rewardConfig: { stats: [{ stat: StatKey.Strength, points: 2 }] },
    totalPointsEarned: { [StatKey.Strength]: 0 },
    growthHistory: [{ level: 1, timestamp: new Date().toISOString(), statsGained: [] }]
  }
];

export const INITIAL_JOBS = [
  { 
    id: 'j1', 
    title: 'Data Analyst', 
    description: 'Master of Information.', 
    hours: 0, 
    level: 1,
    effects: [
      { name: 'Analytical Mind', description: 'Grants 1.5x efficiency when processing information.', type: 'passive' },
      { name: 'Pattern Recognition', description: 'Automatically identifies hidden structures in chaotic data.', type: 'passive' }
    ],
    rewardConfig: { stats: [{ stat: StatKey.Intelligence, points: 5 }] },
    totalPointsEarned: { [StatKey.Intelligence]: 0 },
    growthHistory: [{ level: 1, timestamp: new Date().toISOString(), statsGained: [] }]
  },
  { 
    id: 'j2', 
    title: 'Calisthenics Athlete', 
    description: 'Master of Bodyweight Control.', 
    hours: 0, 
    level: 1,
    effects: [
      { name: 'Bodyweight Mastery', description: 'Increases efficiency of physical training by 20%.', type: 'passive' },
      { name: 'Explosive Power', description: 'Briefly increases strength for high-intensity movements.', type: 'active' }
    ],
    rewardConfig: { stats: [{ stat: StatKey.Strength, points: 5 }] },
    totalPointsEarned: { [StatKey.Strength]: 0 },
    growthHistory: [{ level: 1, timestamp: new Date().toISOString(), statsGained: [] }]
  }
];

export const INITIAL_TITLES = [
  {
    id: 't1',
    name: 'Player',
    description: 'Awarded to those who have just unlocked the System.',
    effects: [
      { name: 'Newcomer Luck', description: 'Slightly increases the chance of minor successes.', type: 'passive' }
    ]
  },
  {
    id: 't2',
    name: 'The Chosen One',
    description: 'A title for those destined for greatness.',
    effects: [
      { name: 'Destiny\'s Call', description: 'Increases all stat gains by 5%.', type: 'passive' },
      { name: 'Heroic Resolve', description: 'Prevents stat loss from failed quests once per day.', type: 'active' }
    ]
  }
];

export const INITIAL_BELIEFS = [
  {
    id: 'b1',
    name: 'Growth Mindset',
    description: 'The belief that abilities can be developed through dedication and hard work.',
    effects: [
      { name: 'Adaptive Learning', description: 'Increases skill hours gain by 10%.', type: 'passive' }
    ]
  },
  {
    id: 'b2',
    name: 'Karma',
    description: 'The belief that what goes around comes around.',
    effects: [
      { name: 'Universal Balance', description: 'Increases Luck stat based on completed quests.', type: 'passive' },
      { name: 'Retribution', description: 'Increases penalty for failed quests but doubles rewards for completed ones.', type: 'active' }
    ]
  }
];

export const INITIAL_QUESTS = [
  {
    id: 'q1',
    type: 'recurring',
    title: 'Physical Conditioning',
    description: 'Perform a calisthenics workout session.',
    reward: 'Strength & Endurance',
    classTag: 'Physical',
    punishment: 'Muscle Atrophy',
    status: 'in-progress',
    streakCount: 0,
    autoRefresh: true,
    refreshIntervalDays: 1,
    refreshTime: '08:00',
    subQuests: [
      { id: 'sq1', title: 'Warmup', completed: false },
      { id: 'sq2', title: 'Main Workout', completed: false },
      { id: 'sq3', title: 'Cooldown', completed: false }
    ],
    progress: 0,
    rewardStat: StatKey.Strength,
    rewardPoints: 2,
    penaltyStat: StatKey.Strength,
    penaltyPoints: 1
  },
  {
    id: 'q2',
    type: 'one-off',
    title: 'Deep Study Session',
    description: 'Complete a focused study session on a complex topic.',
    reward: 'Intelligence Boost',
    classTag: 'Mental',
    punishment: 'Mental Fog',
    status: 'in-progress',
    streakCount: 0,
    autoRefresh: false,
    refreshIntervalDays: 1,
    refreshTime: '00:00',
    subQuests: [
      { id: 'sq4', title: 'Research', completed: false },
      { id: 'sq5', title: 'Synthesis', completed: false }
    ],
    progress: 0,
    rewardStat: StatKey.Intelligence,
    rewardPoints: 5,
    penaltyStat: StatKey.Intelligence,
    penaltyPoints: 2
  }
];

export const INITIAL_TAG_CONFIGS = [
  { id: 'study', label: 'Study', color: '#06b6d4', description: 'Deep Learning & Absorption' },
  { id: 'build', label: 'Build', color: '#10b981', description: 'Active Creation & Progress' },
  { id: 'admin', label: 'Admin', color: '#8b5cf6', description: 'Maintenance & Logistics' },
  { id: 'chaos', label: 'Chaos', color: '#f43f5e', description: 'High Intensity & Unplanned' }
];

export const STAT_DESCRIPTIONS: Record<StatKey, string> = {
  [StatKey.Strength]: "Raw physical power; the force your body can exert.",
  [StatKey.Agility]: "Speed, balance, and fluidity of movement.",
  [StatKey.Dexterity]: "Precision, hand–eye coordination, and fine motor control.",
  [StatKey.Endurance]: "Ability to sustain physical effort over time.",
  [StatKey.Intelligence]: "Problem-solving, learning, and reasoning ability.",
  [StatKey.Creativity]: "Novel idea generation, synthesis, and lateral thinking.",
  [StatKey.Perception]: "Awareness, pattern recognition, and attention to detail.",
  [StatKey.Charisma]: "Social influence, communication, and presence.",
  [StatKey.Willpower]: "Moment-to-moment self-control and impulse resistance.",
  [StatKey.Luck]: "Taking actions that increase the probability of beneficial outcomes."
};

export const MAX_SKILL_HOURS = 10000;
export const MAX_LEVEL = 100;

export const getLevelThreshold = (level: number) => {
  if (level <= 1) return 10;
  if (level >= 100) return 10000;
  // Threshold for level L is the stats needed to REACH level L.
  // Level 1 starts at 10. Level 2 starts at 11.
  return Math.floor(9990 * Math.pow((level - 1) / 99, 2) + 10);
};

export const getLevelFromStats = (totalStats: number) => {
  let level = 1;
  for (let l = 1; l <= 100; l++) {
    if (totalStats >= getLevelThreshold(l)) {
      level = l;
    } else {
      break;
    }
  }
  return level;
};

export const INSPIRATIONAL_QUOTES = [
  "The System tracks actions, not intentions. Focus and execute.",
  "Consistency forms the foundation of all leveling paths.",
  "Your stats are an objective reflection of your daily habits.",
  "Quests are self-assigned directives. Honor your word.",
  "Time logged represents life invested. Choose your skills wisely.",
  "No shortcuts exist in the source code of self-improvement.",
  "Accept the training penalty. Calibrate, restart, and continue.",
  "Status limits are mental constructs. Break them.",
  "Even 15 minutes of training builds progress towards the next rank.",
  "The best time to log a skill hour was yesterday. The second best starts now."
];

export const getRankDetails = (level: number) => {
  if (level >= 95) return { label: 'S', color: 'text-amber-400', bgColor: 'bg-amber-400', glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.65)]', glowColor: '#fbbf24' };
  if (level >= 85) return { label: 'A', color: 'text-red-500', bgColor: 'bg-red-500', glow: 'drop-shadow-[0_0_7px_rgba(239,68,68,0.6)]', glowColor: '#ef4444' };
  if (level >= 75) return { label: 'B', color: 'text-purple-500', bgColor: 'bg-purple-500', glow: 'drop-shadow-[0_0_6px_rgba(168,85,247,0.55)]', glowColor: '#a855f7' };
  if (level >= 60) return { label: 'C', color: 'text-blue-600', bgColor: 'bg-blue-600', glow: 'drop-shadow-[0_0_6px_rgba(37,99,235,0.52)]', glowColor: '#2563eb' };
  if (level >= 40) return { label: 'D', color: 'text-emerald-500', bgColor: 'bg-emerald-500', glow: 'drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]', glowColor: '#10b981' };
  if (level >= 20) return { label: 'E', color: 'text-cyan-400', bgColor: 'bg-cyan-400', glow: 'drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]', glowColor: '#22d3ee' };
  return { label: 'F', color: 'text-white', bgColor: 'bg-white', glow: 'drop-shadow-[0_0_5px_rgba(255,255,255,0.48)]', glowColor: '#ffffff' };
};

export const RANK_UP_MESSAGES: Record<string, { title: string, message: string }> = {
  'E': { title: 'Rank E Reached', message: 'First milestone cleared. You have exceeded the common baseline. Continue logging progress.' },
  'D': { title: 'Rank D Reached', message: 'Rank D unlocked. Your skill block is solidifying. The tracking matrix acknowledges your training.' },
  'C': { title: 'Rank C Reached', message: 'Competence class verified. You are now steadily above standard limits. Hone your main skills.' },
  'B': { title: 'Rank B Reached', message: 'Elite level approaching. Very few players maintain the habit loops required for Rank B.' },
  'A': { title: 'Rank A Reached', message: 'Peak state active. Your consistency metrics place you in the top tier of active profiles.' },
  'S': { title: 'Rank S Reached', message: 'Absolute limit-break status. The system confirms complete mastery of your designated class.' }
};

export const RecalibrateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export const ICONS = {
  ChevronLeft: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
  ),
  ChevronRight: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
  ),
  Plus: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  ),
  Minus: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/></svg>
  ),
  Info: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  ),
  Brain: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/></svg>
  ),
  Dumbbell: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6.5 6.5 4 9"/><path d="m21 21-2.5-2.5"/><path d="m6.5 17.5-2.5-2.5"/><path d="m21 3-2.5 2.5"/><path d="m18 7 3 3"/><path d="m3 14 3 3"/><path d="m14 18 3 3"/><path d="m3 7 3-3"/><path d="m7.5 13.5 3 3"/><path d="m13.5 7.5 3 3"/><path d="m6.2 6.2 11.6 11.6"/><path d="m6.2 17.8 11.6-11.6"/></svg>
  ),
  Sword: (props: any) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="20" y2="20"/></svg>
  ),
  Calendar: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  Star: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  Trash: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  ),
  List: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
  ),
  Edit: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Settings: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  AlertTriangle: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  ),
  Activity: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  ),
  User: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Clock: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Shield: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Coffee: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
  ),
  Search: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  X: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  ),
  Zap: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.71 13.44 4l-1.31 9.29H20L10.56 20l1.31-9.29H4Z"/></svg>
  )
};
