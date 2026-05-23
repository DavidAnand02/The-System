import React from 'react';
import { Shield, Star, Zap } from 'lucide-react';
import { PlayerData, Job, Title, Belief } from '../../types';
import { Select } from '../ui/Select';

interface IdentityMatrixProps {
  player: PlayerData;
  jobs: Job[];
  titles: Title[];
  beliefs: Belief[];
  handleInfoChange: (field: keyof PlayerData, value: string, index?: number) => void;
  className?: string;
}

const IdentityMatrix: React.FC<IdentityMatrixProps> = ({
  player,
  jobs,
  titles,
  beliefs,
  handleInfoChange,
  className = "grid grid-cols-1 md:grid-cols-3 gap-4"
}) => {
  // Memoize options to prevent unnecessary re-renders and stale data issues
  const jobOptions = React.useMemo(() => [
    { value: '', label: '[ UNEQUIPPED ]' },
    { value: 'Novice', label: 'Novice' },
    ...jobs.map(j => ({ value: j.title, label: `${j.title} (LV ${j.level})` }))
  ], [jobs]);

  const titleOptions = React.useMemo(() => [
    { value: '', label: '[ UNEQUIPPED ]' },
    ...titles.map(t => ({ value: t.name, label: t.name }))
  ], [titles]);

  const beliefOptions = React.useMemo(() => [
    { value: '', label: '[ UNEQUIPPED ]' },
    ...beliefs.map(b => ({ value: b.name, label: b.name }))
  ], [beliefs]);

  const slotCount = player.level >= 60 ? 3 : player.level >= 30 ? 2 : 1;

  return (
    <div className={`${className} animate-in fade-in duration-500`}>
      {/* Jobs Section */}
      <div className="relative z-[30]">
        <IdentitySection 
          label="Job Classes" 
          icon={<Shield className="w-3.5 h-3.5 text-system-accent" />}
          slots={slotCount}
          equipped={(player.equippedJobs || [player.jobClass])}
          options={jobOptions}
          onChange={(val, i) => handleInfoChange('equippedJobs', val, i)}
        />
      </div>

      {/* Titles Section */}
      <div className="relative z-[20]">
        <IdentitySection 
          label="Active Titles" 
          icon={<Star className="w-3.5 h-3.5 text-amber-400" />}
          slots={slotCount}
          equipped={(player.equippedTitles || [player.title])}
          options={titleOptions}
          onChange={(val, i) => handleInfoChange('equippedTitles', val, i)}
        />
      </div>

      {/* Beliefs Section */}
      <div className="relative z-[10]">
        <IdentitySection 
          label="Core Beliefs" 
          icon={<Zap className="w-3.5 h-3.5 text-purple-400" />}
          slots={slotCount}
          equipped={(player.equippedBeliefs || [player.belief])}
          options={beliefOptions}
          onChange={(val, i) => handleInfoChange('equippedBeliefs', val, i)}
        />
      </div>
    </div>
  );
};

const IdentitySection: React.FC<{
  label: string;
  icon: React.ReactNode;
  slots: number;
  equipped: string[];
  options: { value: string; label: string }[];
  onChange: (value: string, index: number) => void;
}> = ({ label, icon, slots, equipped, options, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center space-x-2">
        <div className="p-1 rounded-md bg-system-bg-panel border border-white/5 shadow-inner">
          {icon}
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-system-text font-orbitron">{label}</h3>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: slots }).map((_, i) => (
          <div key={`dot-${i}`} className={`w-1 h-1 rounded-full ${equipped[i] ? 'bg-system-accent shadow-[0_0_5px_var(--system-accent-glow)]' : 'bg-white/10'}`} />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 gap-2">
      {Array.from({ length: slots }).map((_, i) => (
        <div 
          key={`${label}-slot-${i}`} 
          className="group relative"
          style={{ zIndex: slots - i }}
        >
          {/* GLOW EFFECT */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${label === 'Job Classes' ? 'from-system-accent/30' : label === 'Active Titles' ? 'from-amber-500/30' : 'from-purple-500/30'} to-transparent rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none`} />
          
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-lg hover:border-white/20 transition-all">
            <Select 
              value={equipped[i] || ''} 
              onChange={(e) => onChange(e.target.value, i)}
              className="w-full !bg-transparent !border-none font-orbitron text-[10px] py-2.5 px-3 focus:ring-0 text-system-text uppercase tracking-[0.1em] font-black"
              placeholder={`[ EMPTY SLOT ${i + 1} ]`}
              options={options}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default React.memo(IdentityMatrix);
