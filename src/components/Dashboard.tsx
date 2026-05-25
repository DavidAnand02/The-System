
import React, { useState, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ICONS, INSPIRATIONAL_QUOTES, STAT_DESCRIPTIONS, getRankDetails } from '../constants';
import { usePlayerStore, selectPlayerStats, selectPlayerSkills, selectPlayerQuests } from '../store/usePlayerStore';
import { Card, CardContent } from './ui/Card';
import { motion } from 'motion/react';
import { StatKey } from '../types';
import { Briefcase } from 'lucide-react';

interface DashboardProps {
  navigateTo: (page: any) => void;
  onStartWalkthrough: () => void;
}

const Dashboard: React.FC<DashboardProps> = React.memo(({ 
  navigateTo, 
}) => {
  const { level, username, stats, skills, quests, jobs } = usePlayerStore(useShallow(state => ({
    level: state.player.level,
    username: state.player.username,
    stats: state.player.stats,
    skills: state.skills,
    quests: state.quests,
    jobs: state.jobs
  })));

  const [advice, setAdvice] = useState<string>("");

  useEffect(() => {
    const randomQuote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
    setAdvice(randomQuote);
  }, [level]);

  const activeQuests = useMemo(() => 
    quests.filter(q => q.status === 'in-progress').slice(0, 3), 
  [quests]);

  const topSkills = useMemo(() => 
    [...skills].sort((a, b) => b.level - a.level).slice(0, 4), 
  [skills]);

  const topJobs = useMemo(() => 
    [...jobs].sort((a, b) => b.level - a.level).slice(0, 4), 
  [jobs]);

  const rank = getRankDetails(level);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* --- SYSTEM NOTIFICATION HEADER --- */}
      <header id="dashboard-header" className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] border border-system-accent/30 bg-system-accent/5 backdrop-blur-2xl p-5 sm:p-8 group shadow-2xl shadow-system-accent/10 transition-all duration-700 hover:shadow-system-accent/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 relative z-10">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="flex h-1.5 w-1.5 rounded-full bg-system-accent animate-pulse shadow-[0_0_12px_var(--system-accent-glow)]" />
              <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-system-accent/70 font-orbitron">
                System Notification
              </h2>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-system-text tracking-tighter uppercase font-orbitron leading-none">
              WELCOME, <span className="text-system-accent drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">{username || 'PLAYER'}</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-12 pr-0 md:pr-4">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6">
              <p className="text-[9px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.4em] text-system-text-muted font-black">Rank</p>
              <div className="relative group">
                <div className={`absolute inset-0 blur-2xl opacity-50 ${rank.bgColor} transition-opacity duration-500 group-hover:opacity-80`} />
                <p className={`relative text-3xl sm:text-6xl md:text-8xl font-black font-orbitron ${rank.color} ${rank.glow} leading-none tracking-tighter drop-shadow-[0_0_15px_currentColor]`}>
                  {rank.label}
                </p>
              </div>
            </div>
            <div className="h-10 md:h-20 w-[1px] md:w-[2px] bg-white/10 rounded-full" />
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6">
              <p className="text-[9px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.4em] text-system-text-muted font-black">Level</p>
              <div className="relative group">
                <div className="absolute inset-0 blur-2xl opacity-30 bg-white transition-opacity duration-500 group-hover:opacity-60" />
                <p className="relative text-3xl sm:text-6xl md:text-8xl font-black font-orbitron text-system-text leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                  {level}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10">
          <p id="dashboard-advice" className="text-sm text-system-text-muted italic font-light leading-relaxed max-w-3xl opacity-80 group-hover:opacity-100 transition-opacity">
            "{advice}"
          </p>
        </div>
      </header>

      {/* --- BENTO GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        
        {/* STATS PANEL */}
        <section className="min-w-0 self-start">
          <div id="dashboard-stats" className="space-y-4 sm:space-y-6 h-fit">
            <PanelHeader title="Ability Scores" icon={<ICONS.Star className="w-4 h-4" />} />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(stats).map(([key, value]) => (
                <StatMiniCard key={key} stat={key as StatKey} value={value} />
              ))}
            </div>
          </div>
        </section>

        {/* ACTIVE QUESTS PANEL */}
        <section className="min-w-0 self-start">
          <div id="dashboard-quests" className="flex flex-col gap-4 sm:gap-6 w-full relative">
            <PanelHeader title="Active Quests" icon={<ICONS.Plus className="w-4 h-4" />} />
            <div className="flex flex-col gap-3 sm:gap-4">
              {activeQuests.length > 0 ? (
                activeQuests.map(quest => (
                  <QuestMiniCard key={quest.id} quest={quest} onClick={() => navigateTo('quests')} />
                ))
              ) : (
                <EmptyState message="No active quests. Visit the quest board." />
              )}
            </div>
            <button 
              onClick={() => navigateTo('quests')}
              className="w-full py-3 text-[10px] uppercase tracking-[0.3em] text-system-accent/50 hover:text-system-accent transition-all duration-300 font-bold border border-dashed border-system-accent/10 rounded-xl hover:border-system-accent/40 hover:bg-system-accent/5 hover-glitch"
            >
              View All Quests
            </button>
          </div>
        </section>

        {/* SKILLS PANEL */}
        <section className="min-w-0 self-start">
          <div id="dashboard-skills" className="flex flex-col gap-4 sm:gap-6 w-full relative">
            <PanelHeader title="Top Skills" icon={<ICONS.Brain className="w-4 h-4" />} />
            <div className="flex flex-col gap-3 sm:gap-4">
              {topSkills.length > 0 ? (
                topSkills.map(skill => (
                  <SkillMiniCard key={skill.id} skill={skill} onClick={() => navigateTo('skills')} />
                ))
              ) : (
                <EmptyState message="No skills developed yet." />
              )}
              <button 
                onClick={() => navigateTo('skills')}
                className="w-full py-3 text-[10px] uppercase tracking-[0.3em] text-system-accent/50 hover:text-system-accent transition-all duration-300 font-bold border border-dashed border-system-accent/10 rounded-xl hover:border-system-accent/40 hover:bg-system-accent/5 hover-glitch"
              >
                Skill Repository
              </button>
            </div>
          </div>
        </section>

        {/* ACTIVE JOBS / CLASSES PANEL */}
        <section className="min-w-0 self-start">
          <div id="dashboard-jobs" className="flex flex-col gap-4 sm:gap-6 w-full relative">
            <PanelHeader title="Active Classes" icon={<Briefcase className="w-4 h-4" />} />
            <div className="flex flex-col gap-3 sm:gap-4">
              {topJobs.length > 0 ? (
                topJobs.map(job => (
                  <JobMiniCard key={job.id} job={job} onClick={() => navigateTo('jobs')} />
                ))
              ) : (
                <EmptyState message="No active classes registered." />
              )}
              <button 
                onClick={() => navigateTo('jobs')}
                className="w-full py-3 text-[10px] uppercase tracking-[0.3em] text-system-accent/50 hover:text-system-accent transition-all duration-300 font-bold border border-dashed border-system-accent/10 rounded-xl hover:border-system-accent/40 hover:bg-system-accent/5 hover-glitch"
              >
                Career Class Board
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});

// --- SUB-COMPONENTS ---

const PanelHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center justify-between px-2">
    <div className="flex items-center space-x-4">
      <span className="text-system-accent drop-shadow-[0_0_8px_var(--system-accent-glow)] scale-110">{icon}</span>
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-system-text/90 font-orbitron">{title}</h3>
    </div>
    <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-system-accent/50 via-system-accent/10 to-transparent" />
  </div>
);

const StatMiniCard: React.FC<{ stat: StatKey; value: number }> = ({ stat, value }) => (
  <div className="bg-system-bg-panel-solid/82 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-system-accent/50 transition-all duration-500 group hover-glitch cursor-pointer shadow-xl hover:shadow-system-accent/10 hover:-translate-y-1">
    <p className="text-[11px] uppercase tracking-[0.25em] text-system-text-muted font-black group-hover:text-system-accent transition-colors mb-2">{stat}</p>
    <p className="text-3xl font-black font-orbitron text-system-text leading-none tracking-tighter">{value}</p>
  </div>
);

const QuestMiniCard: React.FC<{ quest: any; onClick?: () => void }> = ({ quest, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-system-bg-panel-solid/82 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-system-accent/50 transition-all duration-500 group relative overflow-hidden hover-glitch cursor-pointer shadow-xl hover:shadow-system-accent/10 hover:-translate-y-1"
  >
    <div className="absolute top-0 left-0 w-2 h-full bg-system-accent/10 group-hover:bg-system-accent transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
    <div className="flex justify-between items-start mb-5">
      <h4 className="text-base font-black text-system-text uppercase tracking-tight truncate pr-4 group-hover:text-system-accent transition-colors font-orbitron">{quest.title}</h4>
      <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-system-accent/10 text-system-accent border border-system-accent/30 uppercase tracking-[0.2em] font-orbitron">
        {quest.classTag}
      </span>
    </div>
    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10 p-0.5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${quest.progress}%` }}
        transition={{ duration: 1.2, ease: "circOut" }}
        className="h-full bg-system-accent rounded-full shadow-[0_0_15px_rgba(6,182,212,0.7)]"
      />
    </div>
  </div>
);

const SkillMiniCard: React.FC<{ skill: any; onClick?: () => void }> = ({ skill, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between bg-system-bg-panel-solid/82 backdrop-blur-xl border border-white/10 rounded-3xl p-5 hover:border-system-accent/50 transition-all duration-500 hover-glitch cursor-pointer shadow-xl hover:shadow-system-accent/10 hover:-translate-y-1 group"
  >
    <div className="flex flex-col space-y-1.5">
      <span className="text-sm font-black text-system-text uppercase tracking-tight group-hover:text-system-accent transition-colors font-orbitron">{skill.name}</span>
      <span className="text-[10px] text-system-text-muted uppercase font-black tracking-[0.2em]">LVL {skill.level}</span>
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-sm font-black text-system-accent font-orbitron tracking-tighter group-hover:scale-110 transition-transform">{skill.hours}H</p>
      </div>
      <div className="w-1.5 h-10 bg-system-accent/10 rounded-full group-hover:bg-system-accent/30 transition-colors" />
    </div>
  </div>
);

const JobMiniCard: React.FC<{ job: any; onClick?: () => void }> = ({ job, onClick }) => {
  const rank = getRankDetails(job.level || 1);
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between bg-system-bg-panel-solid/82 backdrop-blur-xl border border-white/10 rounded-3xl p-5 hover:border-system-accent/50 transition-all duration-500 hover-glitch cursor-pointer shadow-xl hover:shadow-system-accent/10 hover:-translate-y-1 group"
    >
      <div className="flex flex-col space-y-1.5">
        <span className="text-sm font-black text-system-text uppercase tracking-tight group-hover:text-system-accent transition-colors font-orbitron">{job.title}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-system-text-muted uppercase font-black tracking-[0.2em]">LVL {job.level || 1}</span>
          <span className={`text-[8px] font-orbitron font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-system-accent/10 ${rank.color}`}>
            {rank.label}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-black text-system-accent font-orbitron tracking-tighter group-hover:scale-110 transition-transform">{job.hours || 0}H</p>
        </div>
        <div className="w-1.5 h-10 bg-system-accent/10 rounded-full group-hover:bg-system-accent/30 transition-colors" />
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="py-16 text-center border border-dashed border-white/20 rounded-[2rem] bg-black/20 backdrop-blur-md">
    <p className="text-sm text-system-text-muted font-medium italic tracking-widest opacity-60">{message}</p>
  </div>
);

const MenuButton: React.FC<{ label: string; onClick: () => void; icon: React.ReactNode }> = React.memo(({ label, onClick, icon }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center space-y-4 bg-system-bg-panel-solid/82 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] text-system-text-muted hover:text-system-accent hover:border-system-accent/50 hover:bg-system-accent/10 transition-all duration-500 group hover-glitch shadow-2xl hover:shadow-system-accent/15 hover:-translate-y-2"
  >
    <span className="scale-125 group-hover:scale-150 group-hover:rotate-6 transition-all duration-700 text-system-text-muted group-hover:text-system-accent drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">{icon}</span>
    <span className="text-[12px] font-black uppercase tracking-[0.4em] font-orbitron">{label}</span>
  </button>
));

export default Dashboard;
