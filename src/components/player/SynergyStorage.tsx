import React from 'react';
import { Search, Plus, X, Settings, Zap } from 'lucide-react';
import { PlayerData, StatKey, StatBoost } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';

interface SynergyStorageProps {
  player: PlayerData;
  effectSearchTerm: string;
  setEffectSearchTerm: (term: string) => void;
  effectTypeFilter: 'all' | 'active' | 'passive';
  setEffectTypeFilter: (filter: 'all' | 'active' | 'passive') => void;
  setShowAddEffectForm: (show: boolean) => void;
  filteredEffects: any[];
  isEffectActive: (eff: any) => boolean;
  setEditingEffectIndex: (index: { type: 'global' | 'job' | 'title' | 'belief', index: number, sourceId?: string } | null) => void;
}

const SynergyStorage: React.FC<SynergyStorageProps> = ({
  player,
  effectSearchTerm,
  setEffectSearchTerm,
  effectTypeFilter,
  setEffectTypeFilter,
  setShowAddEffectForm,
  filteredEffects,
  isEffectActive,
  setEditingEffectIndex,
}) => {
  return (
    <Card variant="glass" className="p-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-2">
          <h2 className="text-xl font-orbitron text-slate-200 uppercase tracking-tight flex items-center gap-2">
            <Zap className="text-system-accent" /> Synergy Storage
          </h2>
          <div className="flex flex-1 max-w-sm relative">
              <Input 
                placeholder="SEARCH EFFECTS..."
                value={effectSearchTerm}
                onChange={(e) => setEffectSearchTerm(e.target.value)}
                icon={<Search className="w-3.5 h-3.5" />}
                className="font-orbitron text-xs"
              />
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={effectTypeFilter}
              onChange={(e) => setEffectTypeFilter(e.target.value as any)}
              className="font-orbitron text-[10px] h-8 py-0"
            >
              <option value="all">ALL TYPES</option>
              <option value="active">ACTIVE</option>
              <option value="passive">PASSIVE</option>
            </Select>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowAddEffectForm(true)}
              className="font-orbitron"
              icon={Plus}
            >
              New Protocol
            </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredEffects.map((eff, idx) => {
          const active = isEffectActive(eff);
          return (
            <div 
              key={`${eff.origin}-${eff.sourceId || 'global'}-${eff.index}`} 
              className={`bg-white/5 border rounded-xl p-4 transition-all group relative ${active ? 'border-system-accent/30 shadow-[0_0_15px_var(--system-accent-muted)]' : 'border-white/10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <h3 className={`text-sm font-orbitron uppercase tracking-tight ${active ? 'text-system-accent system-glow' : 'text-slate-400'}`}>
                    {eff.name}
                  </h3>
                  <span className="text-[8px] font-orbitron text-slate-500 uppercase opacity-50">
                    Origin: {eff.origin} {eff.sourceJob && `(${eff.sourceJob})`} {eff.sourceTitle && `(${eff.sourceTitle})`} {eff.sourceBelief && `(${eff.sourceBelief})`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={eff.type === 'active' ? 'accent' : 'outline'} className="text-[8px]">
                    {eff.type.toUpperCase()}
                  </Badge>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-9 md:w-9"
                    onClick={() => setEditingEffectIndex({ type: eff.origin, index: eff.index, sourceId: eff.sourceId })}
                  >
                    <Settings className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 transition-transform duration-300 group-hover:rotate-45" />
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-orbitron leading-relaxed line-clamp-2 mb-3">
                {eff.description}
              </p>
              {eff.statBoosts && eff.statBoosts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {eff.statBoosts.map((boost: any, bIdx: number) => (
                    <Badge key={bIdx} variant="outline" className="text-[8px] font-mono">
                      {boost.stat.substring(0, 3).toUpperCase()} +{boost.amount}
                    </Badge>
                  ))}
                </div>
              )}
              {active && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-system-accent rounded-full animate-pulse shadow-[0_0_8px_var(--system-accent-glow)]" />
              )}
            </div>
          );
        })}
        {filteredEffects.length === 0 && (
          <div className="col-span-full py-10 text-center border border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-slate-500 font-orbitron uppercase tracking-widest">No protocols found in storage</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default React.memo(SynergyStorage);
