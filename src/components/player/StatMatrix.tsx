import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp, Activity, Sword } from 'lucide-react';
import { PlayerData, StatKey, PlayerStats } from '../../types';
import { STAT_DESCRIPTIONS } from '../../constants';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { CollapsibleCard } from '../ui/CollapsibleCard';

interface StatMatrixProps {
  player: PlayerData;
  effectiveStats: PlayerStats;
  actualTotalStats: number;
  updateStat: (key: StatKey, delta: number) => void;
}

const STAT_ABBREVIATIONS: Record<StatKey, string> = {
  [StatKey.Strength]: 'STR',
  [StatKey.Agility]: 'AGI',
  [StatKey.Dexterity]: 'DEX',
  [StatKey.Endurance]: 'END',
  [StatKey.Intelligence]: 'INT',
  [StatKey.Creativity]: 'CRT',
  [StatKey.Perception]: 'PER',
  [StatKey.Charisma]: 'CHR',
  [StatKey.Willpower]: 'WILL',
  [StatKey.Luck]: 'LK',
};

const StatMatrix: React.FC<StatMatrixProps> = ({
  player,
  effectiveStats,
  actualTotalStats,
  updateStat
}) => {
  const radarData = useMemo(() => {
    return Object.values(StatKey).map(key => ({
      subject: STAT_ABBREVIATIONS[key as StatKey],
      fullSubject: key.charAt(0).toUpperCase() + key.slice(1),
      value: effectiveStats[key as StatKey],
    }));
  }, [effectiveStats]);

  return (
    <div className="space-y-8">
      {/* RADAR CHART PANEL */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-system-accent/20 to-transparent rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-system-bg-panel/40 backdrop-blur-md rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-system-accent shadow-[0_0_10px_var(--system-accent-glow)]"></div>
              <h2 className="text-sm font-black font-orbitron text-system-text uppercase tracking-[0.2em]">Attribute Matrix</h2>
            </div>
            <div className="text-[10px] font-black font-orbitron text-system-accent/60 uppercase tracking-widest">
              Live Synchronization
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900, fontFamily: 'Orbitron' }}
                />
                <Radar
                  name="Stats"
                  dataKey="value"
                  stroke="var(--system-accent)"
                  strokeWidth={2}
                  fill="var(--system-accent)"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* STAT LIST PANEL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-system-accent" />
            <span className="text-[10px] font-black font-orbitron text-system-text-muted uppercase tracking-[0.2em]">Core Attributes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black font-orbitron text-system-text-muted uppercase tracking-widest">Total Mastery:</span>
            <span className="text-xs font-black font-orbitron text-system-accent">{actualTotalStats}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(StatKey).map(key => {
            const baseValue = player.stats[key as StatKey];
            const effectiveValue = effectiveStats[key as StatKey];
            const boost = effectiveValue - baseValue;
            
            return (
              <div key={key} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-system-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                <div className="relative flex items-center justify-between bg-white/[0.02] border border-white/5 px-2.5 py-2 rounded-lg hover:border-system-accent/30 transition-all">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-11 sm:w-12 shrink-0 text-sm font-black font-orbitron text-system-accent/80 group-hover:text-system-accent transition-colors tracking-widest">
                      {STAT_ABBREVIATIONS[key as StatKey]}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-black font-orbitron text-system-text leading-none tracking-tight">
                        {effectiveValue}
                      </span>
                      {boost > 0 && (
                        <span className="text-[10px] font-black font-orbitron text-system-success">
                          +{boost}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0 ml-1.5">
                    <button 
                      onClick={() => updateStat(key as StatKey, -1)} 
                      className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-white/5 border border-white/10 text-system-text-muted hover:text-system-error hover:border-system-error/30 transition-all"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button 
                      onClick={() => updateStat(key as StatKey, 1)} 
                      className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-white/5 border border-white/10 text-system-text-muted hover:text-system-accent hover:border-system-accent/30 transition-all"
                    >
                      <ChevronUp size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatMatrix);
