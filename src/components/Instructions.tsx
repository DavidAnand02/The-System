
import React from 'react';
import { ICONS } from '../constants';

const Instructions: React.FC<{ onBack: () => void, onSupport: () => void }> = ({ onBack, onSupport }) => (
  <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
    <div className="flex items-center space-x-4">
      <button id="instructions-back-btn" onClick={onBack} className="p-2 rounded-lg bg-system-bg-panel hover:bg-system-accent/10 transition-colors group">
        <ICONS.ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
      </button>
      <h1 className="text-3xl font-orbitron system-glow text-system-accent uppercase tracking-tighter">System Manual v3.0</h1>
    </div>

    <div id="instructions-content" className="bg-system-bg-panel p-8 rounded-3xl border border-system-accent/20 space-y-12 text-sm leading-relaxed text-system-text-muted font-light backdrop-blur-md">
      
      {/* Introduction */}
      <section className="border-b border-white/5 pb-8">
        <h2 className="text-system-accent font-orbitron uppercase text-xl mb-4 tracking-widest">Neural Initialization</h2>
        <p className="italic text-system-text-muted/70 mb-6 text-base">"You have been chosen to transcend the limits of common humanity. The System is your guide, your judge, and your path to evolution."</p>
        <p className="text-system-text leading-relaxed">
          The System is a high-fidelity gamification framework designed to quantify your existence. By mapping your real-world efforts into digital parameters, you gain an objective perspective on your growth trajectory. Every hour logged, every quest completed, and every stat increased contributes to your overall <span className="text-system-accent font-bold">Neural Signature</span>.
        </p>
      </section>

      {/* 01. Command Center (Dashboard) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Settings className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">01. Command Center</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-system-bg-base/40 p-5 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-system-text font-orbitron text-xs uppercase tracking-widest">Neural Sync (Supabase)</h3>
            <p className="text-xs text-system-text-muted">The System uses a cloud-based database to ensure your data persists across all terminals. When the <span className="text-emerald-400">ONLINE</span> indicator is active, your progress is synchronized in real-time. If offline, the system switches to <span className="text-amber-400">LOCAL CACHE</span> mode.</p>
          </div>
          <div className="bg-system-bg-base/40 p-5 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-system-text font-orbitron text-xs uppercase tracking-widest">Atmospheric Audio</h3>
            <p className="text-xs text-system-text-muted">Control the ambient neural-link audio via the speaker icon. You can adjust the volume slider or toggle the track entirely. The music is designed to induce a state of "Deep Flow" during your daily operations.</p>
          </div>
          <div className="bg-system-bg-base/40 p-5 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-system-text font-orbitron text-xs uppercase tracking-widest">Neural Aura (Customization)</h3>
            <p className="text-xs text-system-text-muted">Modify your visual interface via the color picker. This updates your <span className="text-system-accent">Neural Aura</span>, affecting the glow, borders, and accents across the entire OS to match your current psychological state.</p>
          </div>
          <div className="bg-system-bg-base/40 p-5 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-system-text font-orbitron text-xs uppercase tracking-widest">Quick Navigation</h3>
            <p className="text-xs text-system-text-muted">The Dashboard provides instantaneous access to all core modules. The central "Neural Signature" display shows your current Level, Rank, and most recent Quest activity at a glance.</p>
          </div>
        </div>
      </section>

      {/* 02. The Core Matrix (Player Status) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.User className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">02. The Core Matrix</h2>
        </div>
        <div className="bg-system-bg-base/40 p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-system-text font-bold uppercase text-xs">The 8 Attributes</h3>
              <p className="text-xs text-system-text-muted">Your capacity is divided into 8 stats: <span className="text-system-text">STR</span> (Strength), <span className="text-system-text">AGI</span> (Agility), <span className="text-system-text">VIT</span> (Vitality), <span className="text-system-text">INT</span> (Intelligence), <span className="text-system-text">PER</span> (Perception), <span className="text-system-text">WIS</span> (Wisdom), <span className="text-system-text">CHA</span> (Charisma), and <span className="text-system-text">LUK</span> (Luck).</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-system-text font-bold uppercase text-xs">Player Leveling</h3>
              <p className="text-xs text-system-text-muted">Every <span className="text-system-accent font-bold">10 total points</span> added across your stats triggers a <span className="text-system-accent">Player Level Up</span>. This represents your overall evolution and increases your standing in the global hierarchy.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-system-text font-bold uppercase text-xs mb-3">Neural Equipment & Identity</h3>
            <ul className="space-y-3 text-xs text-system-text-muted">
              <li>• <span className="text-system-text font-semibold uppercase">Titles:</span> Earned through milestones. Equip them in the Status menu to change your public designation.</li>
              <li>• <span className="text-system-text font-semibold uppercase">Beliefs:</span> Your core philosophy. Equip beliefs to define your current psychological framework. You can archive and swap these as your mindset evolves.</li>
              <li>• <span className="text-system-text font-semibold uppercase">Passive Effects:</span> Permanent traits (e.g., "Bilingual", "Early Riser"). These represent innate or hard-won advantages that don't fit into standard stats.</li>
              <li>• <span className="text-system-text font-semibold uppercase">Neural Log:</span> A chronological history of every stat increase and quest outcome, providing a complete audit trail of your growth.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 03. Neural Adaptations (Skills & Jobs) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Brain className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">03. Neural Adaptations</h2>
        </div>
        <div className="bg-system-bg-panel/20 p-6 rounded-2xl border border-system-accent/10 space-y-6">
          <div className="space-y-4">
            <p className="text-system-text">Both <span className="text-system-text font-semibold">Skills</span> and <span className="text-system-text font-semibold">Jobs (Classes)</span> use the <span className="text-system-accent font-orbitron">Square Root Formula</span> to determine level:</p>
            <div className="bg-system-bg-panel/40 p-4 rounded-xl text-center font-orbitron text-system-accent text-2xl border border-system-accent/20 system-border-glow">
              Level = √ (Total Hours)
            </div>
            <p className="text-xs text-system-text-muted">This logarithmic scale means early mastery is swift, but true expertise requires thousands of hours of dedication.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <h3 className="text-system-text font-bold uppercase text-xs">Skills</h3>
              <p className="text-xs text-system-text-muted">Track specific abilities (e.g., Coding, Guitar, Cooking). Log time spent practicing to increase their level and rank.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-system-text font-bold uppercase text-xs">Jobs</h3>
              <p className="text-xs text-system-text-muted">Track professional or lifestyle roles (e.g., Developer, Athlete). You can equip up to 3 jobs simultaneously to focus your growth.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-system-text font-bold uppercase text-xs">Rank Progression Scale</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="p-2 bg-system-bg-base/50 rounded border border-white/5 text-system-text-muted">F: 01-19 (Common)</div>
              <div className="p-2 bg-system-bg-base/70 rounded border border-white/5 text-system-text">E: 20-39 (Advanced)</div>
              <div className="p-2 bg-cyan-900/30 rounded border border-cyan-500/20 text-cyan-300">D: 40-59 (Specialist)</div>
              <div className="p-2 bg-blue-900/30 rounded border border-blue-500/20 text-blue-400">C: 60-74 (Elite)</div>
              <div className="p-2 bg-purple-900/30 rounded border border-purple-500/20 text-purple-400">B: 75-84 (Master)</div>
              <div className="p-2 bg-amber-900/30 rounded border border-amber-500/20 text-amber-500">A: 85-94 (Legendary)</div>
              <div className="p-2 bg-system-accent/10 rounded border border-system-accent/30 text-system-accent col-span-2 text-center font-bold">S: 95-100 (Transcendent)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Strategic Directives (Quests) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Plus className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">04. Strategic Directives</h2>
        </div>
        <div className="bg-system-bg-base/40 p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-system-text font-bold uppercase text-xs">Quest Structure</h3>
              <p className="text-xs text-system-text-muted">Define a title, description, and difficulty. Break complex goals into <span className="text-system-text">Sub-Quests</span>. The main progress bar will calculate completion based on these sub-tasks.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-system-text font-bold uppercase text-xs">Rewards & Penalties</h3>
              <p className="text-xs text-system-text-muted">Assign a stat reward for success and a penalty for failure. Completing a quest grants points to the chosen attribute; failing subtracts them.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-system-text font-bold uppercase text-xs mb-2">Recurring Missions (Streaks)</h3>
            <p className="text-xs text-system-text-muted">Set quests to refresh daily or weekly. Maintaining a streak builds momentum. If you fail to complete a recurring quest before its refresh period, the system logs a <span className="text-system-error font-bold">FAILURE</span> and resets your streak.</p>
          </div>
        </div>
      </section>

      {/* 05. Temporal Analysis (Timelog) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Clock className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">05. Temporal Analysis</h2>
        </div>
        <div className="bg-system-bg-base/40 p-6 rounded-2xl border border-white/5 space-y-4">
          <p className="text-xs text-system-text-muted">The Timelog is your primary tool for auditing your most precious resource: <span className="text-system-text">Time</span>.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-orbitron text-system-accent uppercase mb-2">Logging Protocol</h4>
              <p className="text-[11px] text-system-text-muted">Record blocks of time with specific tags. Use the "Add Entry" interface to specify duration and category.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-orbitron text-system-accent uppercase mb-2">Tag Configuration</h4>
              <p className="text-[11px] text-system-text-muted">Customize your tags with unique colors. This allows for instant visual recognition of how your day is distributed.</p>
            </div>
          </div>
          <p className="text-[11px] text-system-text-muted/50 italic">Note: Timelog data is visualized in a chronological feed, allowing you to review your daily efficiency.</p>
        </div>
      </section>

      {/* 06. Data Integrity & Guest Protocols */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-system-accent/10 rounded-lg border border-system-accent/20">
            <ICONS.Shield className="w-5 h-5 text-system-accent" />
          </div>
          <h2 className="text-system-accent font-orbitron uppercase text-lg tracking-widest">06. Data Integrity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
            <h3 className="text-emerald-400 font-orbitron text-[10px] uppercase tracking-widest">Guest & Offline Mode</h3>
            <p className="text-[11px] text-system-text-muted">Operate without a neural-link account or while disconnected. Data is stored locally in your browser. <span className="text-emerald-300">Auto-Sync:</span> If you lose Wi-Fi, continue using the app normally; the System will automatically synchronize your progress to the cloud once the connection is restored.</p>
          </div>
          <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-2">
            <h3 className="text-blue-400 font-orbitron text-[10px] uppercase tracking-widest">Neural Backups</h3>
            <p className="text-[11px] text-system-text-muted">Use the <span className="text-blue-300">Export</span> feature to download a `.json` data sheet of your profile. Use <span className="text-blue-300">Import</span> to restore your progress on any terminal.</p>
          </div>
          <div className="p-5 bg-system-error/5 border border-system-error/20 rounded-2xl space-y-2">
            <h3 className="text-system-error font-orbitron text-[10px] uppercase tracking-widest">Neural Purge</h3>
            <p className="text-[11px] text-system-text-muted">Accessible via the Settings menu. This permanently deletes your cloud profile and neural signature. This action is irreversible.</p>
          </div>
        </div>
      </section>

      {/* System Rules */}
      <section className="border-t border-white/5 pt-10">
        <h2 className="text-system-error font-orbitron uppercase text-xl mb-6 tracking-[0.3em] text-center underline decoration-system-error/30 underline-offset-8">The Prime Directives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-system-error/5 border border-system-error/20 rounded-2xl space-y-3">
            <h3 className="text-system-error font-orbitron text-sm font-bold uppercase tracking-widest">I. Absolute Integrity</h3>
            <p className="text-xs text-system-text-muted leading-relaxed">The System relies on your honesty. Falsifying data results in "Phantom Growth"—you will look strong in the UI but remain weak in reality. The System only tracks; you must do the work.</p>
          </div>
          <div className="p-6 bg-system-accent/5 border border-system-accent/20 rounded-2xl space-y-3">
            <h3 className="text-system-accent font-orbitron text-sm font-bold uppercase tracking-widest">II. Persistent Will</h3>
            <p className="text-xs text-system-text-muted leading-relaxed">Failure is not the end; it is a data point. If a quest is failed or a streak is broken, accept the penalty, analyze the cause, and initialize a new directive immediately.</p>
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
            <h2 className="text-xl font-orbitron text-system-text uppercase tracking-widest">Support the Architect</h2>
            <p className="text-xs text-system-text-muted max-w-md mx-auto leading-relaxed">
              The System is a labor of passion and persistent will. If it has helped you quantify your growth, consider contributing to its ongoing evolution.
            </p>
          </div>
          <button 
            onClick={onSupport}
            className="px-8 py-3 bg-system-accent text-system-bg-base font-orbitron text-xs rounded-xl hover:bg-system-accent/80 transition-all shadow-lg shadow-system-accent/20 uppercase tracking-widest"
          >
            Initialize Contribution
          </button>
        </div>
      </section>

      <div className="pt-8 text-center">
        <div className="inline-block px-6 py-2 border-x border-system-accent/30">
          <p className="text-[10px] text-system-text-muted uppercase tracking-[0.6em] font-orbitron animate-pulse">
            - END OF TRANSMISSION -
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Instructions;
