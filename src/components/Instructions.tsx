
import React from 'react';
import { ICONS } from '../constants';

const Instructions: React.FC<{ onBack: () => void, onSupport: () => void }> = ({ onBack, onSupport }) => (
  <div className="max-w-4xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
    <div className="flex items-center space-x-4">
      <button id="instructions-back-btn" onClick={onBack} className="p-2 rounded-lg bg-system-bg-panel hover:bg-system-accent/10 transition-colors group">
        <ICONS.ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
      </button>
      <h1 className="text-3xl font-orbitron system-glow text-system-accent uppercase tracking-tighter">System Manual</h1>
    </div>

    <div id="instructions-content" className="bg-system-bg-panel p-8 rounded-3xl border border-system-accent/20 space-y-12 text-sm leading-relaxed text-system-text-muted font-light backdrop-blur-md">
      
      {/* Introduction */}
      <section className="border-b border-white/5 pb-8">
        <h2 className="text-system-accent font-orbitron uppercase text-xl mb-4 tracking-widest">System Overview</h2>
        <p className="italic text-system-text-muted/70 mb-6 text-base">"This tracker is designed to help you plan your routine, log work hours, and build daily consistency."</p>
        <p className="text-system-text leading-relaxed">
          The System provides a direct, game-like dashboard to organize your productivity. By tracking your learning hour allocations, defining daily habit quests, and inspecting attribute points, you can objectively monitor your schedule. Everyday logs, finished quests, and earned stats feed directly into your player profile.
        </p>
      </section>

      {/* 01. Command Center (Dashboard) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Settings className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">01. Control Panel</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-system-bg-base/40 p-5 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-system-text font-orbitron text-xs uppercase tracking-widest">Cloud Sync</h3>
            <p className="text-xs text-system-text-muted">The System stores progress in a secure database to keep data synced across devices. The <span className="text-emerald-400">ONLINE</span> light indicates real-time syncing. If your connection drops, the app caches changes locally and syncs automatically when Wi-Fi is restored.</p>
          </div>
          <div className="bg-system-bg-base/40 p-5 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-system-text font-orbitron text-xs uppercase tracking-widest">Focus Audio</h3>
            <p className="text-xs text-system-text-muted">Toggle background audio using the speaker icon inside the menu. You can drag the slider to change volume or pick a track. The music list is selected to help keep your attention focused while studying or coding.</p>
          </div>
          <div className="bg-system-bg-base/40 p-5 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-system-text font-orbitron text-xs uppercase tracking-widest">Theme Customization</h3>
            <p className="text-xs text-system-text-muted">Adjust your main theme using the palette color picker. This adapts the overall active color, glows, borders, and button borders across the dashboard to suit your preferred UI style.</p>
          </div>
          <div className="bg-system-bg-base/40 p-5 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-system-text font-orbitron text-xs uppercase tracking-widest">Quick Navigation</h3>
            <p className="text-xs text-system-text-muted">The bottom menu bar lets you transition seamlessly between core workspaces. The main profile circle displays your active Level, Rank, and absolute totals at a glance.</p>
          </div>
        </div>
      </section>

      {/* 02. Core Attributes (Player Status) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.User className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">02. Profile Attributes</h2>
        </div>
        <div className="bg-system-bg-base/40 p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-system-text font-bold uppercase text-xs">The 8 Stats</h3>
              <p className="text-xs text-system-text-muted">Your activities are mapped across 8 main stats: <span className="text-system-text">STR</span> (Strength), <span className="text-system-text">AGI</span> (Agility), <span className="text-system-text">VIT</span> (Vitality), <span className="text-system-text">INT</span> (Intelligence), <span className="text-system-text">PER</span> (Perception), <span className="text-system-text">WIS</span> (Wisdom), <span className="text-system-text">CHA</span> (Charisma), and <span className="text-system-text">LUK</span> (Luck).</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-system-text font-bold uppercase text-xs">Level Ups</h3>
              <p className="text-xs text-system-text-muted">Earning <span className="text-system-accent font-bold">10 stat points</span> across any combination of attributes triggers a <span className="text-system-accent">Player Level Up</span>, signaling a milestone in your routine consistency.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-system-text font-bold uppercase text-xs mb-3">Customizing Profile</h3>
            <ul className="space-y-3 text-xs text-system-text-muted">
              <li>• <span className="text-system-text font-semibold uppercase">Titles:</span> Unlocked by completing targets. Equip them in status details to customize your subtitle label.</li>
              <li>• <span className="text-system-text font-semibold uppercase">Beliefs:</span> Philosophical mindsets. Equip beliefs to set passive buffs on your learning rate or Luck caps.</li>
              <li>• <span className="text-system-text font-semibold uppercase">Passive Traits:</span> Displays special characteristics in your daily log blocks (e.g. "Bilingual," "Early Riser").</li>
              <li>• <span className="text-system-text font-semibold uppercase">Audit Log:</span> A calendar-style history tracking every level up, completed quest, and earned stat point.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 03. Skills & Career Tracks (Skills & Jobs) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Brain className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">03. Skills & Careers</h2>
        </div>
        <div className="bg-system-bg-panel/20 p-6 rounded-2xl border border-system-accent/10 space-y-6">
          <div className="space-y-4">
            <p className="text-system-text">Both <span className="text-system-text font-semibold">Skills</span> and <span className="text-system-text font-semibold">Jobs</span> calculate levels using logged hours:</p>
            <div className="bg-system-bg-panel/40 p-4 rounded-xl text-center font-orbitron text-system-accent text-2xl border border-system-accent/20 system-border-glow">
              Level = √ (Total Clocked Hours)
            </div>
            <p className="text-xs text-system-text-muted">This logarithmic scaling means early progress is swift, but reaching master ranks requires steady, long-term practice.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <h3 className="text-system-text font-bold uppercase text-xs">Skills</h3>
              <p className="text-xs text-system-text-muted">Create filters for discrete fields (e.g., Programming, Guitar, Workouts). Logs automatically count toward corresponding stat points.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-system-text font-bold uppercase text-xs">Jobs</h3>
              <p className="text-xs text-system-text-muted">Represent broader structural roles (e.g., Software Dev, Athlete). Equip up to 3 jobs concurrently to track high-level time usage.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-system-text font-bold uppercase text-xs">Rank Tiers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="p-2 bg-system-bg-base/50 rounded border border-white/5 text-system-text-muted">F: 01-19 (Common)</div>
              <div className="p-2 bg-system-bg-base/70 rounded border border-white/5 text-system-text">E: 20-39 (Advanced)</div>
              <div className="p-2 bg-cyan-900/30 rounded border border-cyan-500/20 text-cyan-300">D: 40-59 (Specialist)</div>
              <div className="p-2 bg-blue-900/30 rounded border border-blue-500/20 text-blue-400">C: 60-74 (Elite)</div>
              <div className="p-2 bg-purple-900/30 rounded border border-purple-500/20 text-purple-400">B: 75-84 (Master)</div>
              <div className="p-2 bg-amber-900/30 rounded border border-amber-500/20 text-amber-500">A: 85-94 (Legendary)</div>
              <div className="p-2 bg-system-accent/10 rounded border border-system-accent/30 text-system-accent col-span-2 text-center font-bold">S: 95-100 (Peak Mastery)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Habit Directives (Quests) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Plus className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">04. Quest Objectives</h2>
        </div>
        <div className="bg-system-bg-base/40 p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-system-text font-bold uppercase text-xs">Quest Templates</h3>
              <p className="text-xs text-system-text-muted">Define a title, text note, and difficulty rating. Split large tasks into <span className="text-system-text">Sub-Quests</span>. The progress meter adjusts automatically as you complete each task block.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-system-text font-bold uppercase text-xs">Rewards & Penalties</h3>
              <p className="text-xs text-system-text-muted">Assign statistical points for finish or miss. Successful quests add points directly to chosen stats; misses subtract them to keep stakes focused.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-system-text font-bold uppercase text-xs mb-2">Recurring Streaks</h3>
            <p className="text-xs text-system-text-muted">Set target tasks to renew daily or weekly. Completing tasks in series builds active streak multipliers. If tasks expire unfinished, a <span className="text-system-error font-bold">FAILURE</span> is logged and the streak resets.</p>
          </div>
        </div>
      </section>

      {/* 05. Time Auditing (Timelog) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Clock className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">05. Time Log Audits</h2>
        </div>
        <div className="bg-system-bg-base/40 p-6 rounded-2xl border border-white/5 space-y-4">
          <p className="text-xs text-system-text-muted">The Timelog is your primary tool for inspecting exactly how your hours are distributed across various activities.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-orbitron text-system-accent uppercase mb-2">Logging Guidelines</h4>
              <p className="text-[11px] text-system-text-muted">Select an activity tag and log active minutes. Log blocks populate your daily calendar timeline automatically.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-orbitron text-system-accent uppercase mb-2">Tag Settings</h4>
              <p className="text-[11px] text-system-text-muted">Edit names and pick distinct tag colors in settings to quickly audit visual trends inside flow charts.</p>
            </div>
          </div>
          <p className="text-[11px] text-system-text-muted/50 italic">Note: The Timelog maps minutes to standard charts, showing high-activity hours to review daily routine peaks.</p>
        </div>
      </section>

      {/* 06. Data Backups & Cache */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Shield className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">06. Data Handling</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
            <h3 className="text-emerald-400 font-orbitron text-[10px] uppercase tracking-widest">Guest & Cache</h3>
            <p className="text-[11px] text-system-text-muted">Create entries inside your browser even if you do not have an account. Data stays local until you decide to link a profile. Local cache acts as emergency storage during temporary network disruptions.</p>
          </div>
          <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-2">
            <h3 className="text-blue-400 font-orbitron text-[10px] uppercase tracking-widest">Export & Import</h3>
            <p className="text-[11px] text-system-text-muted">Download complete data sheets in `.json` format using settings. Upload that local JSON backup on other browsers or devices to restore your complete profile history.</p>
          </div>
          <div className="p-5 bg-system-error/5 border border-system-error/20 rounded-2xl space-y-2">
            <h3 className="text-system-error font-orbitron text-[10px] uppercase tracking-widest">Purge Profile</h3>
            <p className="text-[11px] text-system-text-muted">Permanently delete active cloud profiles and offline logs. This completely resets all levels, stats, and files. This action is irreversible.</p>
          </div>
        </div>
      </section>

      {/* System Rules */}
      <section className="border-t border-white/5 pt-10">
        <h2 className="text-system-error font-orbitron uppercase text-xl mb-6 tracking-[0.3em] text-center underline decoration-system-error/30 underline-offset-8">User Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-system-error/5 border border-system-error/20 rounded-2xl space-y-3">
            <h3 className="text-system-error font-orbitron text-sm font-bold uppercase tracking-widest">I. Honesty</h3>
            <p className="text-xs text-system-text-muted leading-relaxed">The System relies entirely on your input. Logging inaccurate hours or false quest checkmarks results in inflated digital values that do not correspond to real-world capability. The System can map metrics; you must execute the habits.</p>
          </div>
          <div className="p-6 bg-system-accent/5 border border-system-accent/20 rounded-2xl space-y-3">
            <h3 className="text-system-accent font-orbitron text-sm font-bold uppercase tracking-widest">II. Continuity</h3>
            <p className="text-xs text-system-text-muted leading-relaxed">Failing tasks or letting streaks lapse is expected. Use failed logs as objective data points to fine-tune future quest difficulties and study hour caps.</p>
          </div>
        </div>
      </section>

      {/* Support the Developer */}
      <section className="border-t border-white/5 pt-10">
        <div className="bg-system-accent/5 border border-system-accent/20 rounded-3xl p-8 text-center space-y-6">
          <div className="p-3 bg-system-accent/10 rounded-full w-fit mx-auto text-system-accent">
            <ICONS.Coffee className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-orbitron text-system-text uppercase tracking-widest">Support the Creator</h2>
            <p className="text-xs text-system-text-muted max-w-md mx-auto leading-relaxed">
              If this dashboard has helped clarify your daily focus and track schedule milestones, consider showing support for its continuous improvement.
            </p>
          </div>
          <button 
            onClick={onSupport}
            className="px-8 py-3 bg-system-accent text-system-bg-base font-orbitron text-xs rounded-xl hover:bg-system-accent/80 transition-all shadow-lg shadow-system-accent/20 uppercase tracking-widest"
          >
            Show Support
          </button>
        </div>
      </section>

      <div className="pt-8 text-center">
        <div className="inline-block px-6 py-2 border-x border-system-accent/30">
          <p className="text-[10px] text-system-text-muted uppercase tracking-[0.6em] font-orbitron animate-pulse">
            - END OF FILE -
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Instructions;
