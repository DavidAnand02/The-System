import React, { useCallback } from 'react';
import { StatKey } from '../types';
import { ICONS } from '../constants';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Plus, Minus } from 'lucide-react';

interface StatBoostEditorProps {
  boosts: { stat: StatKey; amount: number }[];
  onChange: (newBoosts: { stat: StatKey; amount: number }[]) => void;
}

const StatBoostEditor: React.FC<StatBoostEditorProps> = React.memo(({ boosts, onChange }) => {
  const addBoost = useCallback(() => {
    onChange([...boosts, { stat: StatKey.Strength, amount: 1 }]);
  }, [boosts, onChange]);

  const removeBoost = useCallback((index: number) => {
    onChange(boosts.filter((_, i) => i !== index));
  }, [boosts, onChange]);

  const updateBoost = useCallback((index: number, updates: Partial<{ stat: StatKey; amount: number }>) => {
    const newBoosts = [...boosts];
    newBoosts[index] = { ...newBoosts[index], ...updates };
    onChange(newBoosts);
  }, [boosts, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-system-text-muted uppercase tracking-widest font-orbitron">Stat Boosts</label>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={addBoost}
          icon={Plus}
          className="text-[10px] font-orbitron uppercase text-system-accent hover:text-system-accent/80"
        >
          Add Boost
        </Button>
      </div>
      <div className="space-y-2">
        {boosts.map((boost, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
            <div className="flex-1">
              <Select
                value={boost.stat ?? StatKey.Strength}
                onChange={(e) => updateBoost(idx, { stat: e.target.value as StatKey })}
                options={Object.values(StatKey).map(k => ({ label: k, value: k }))}
                className="text-[10px] font-orbitron"
              />
            </div>
            <div className="w-20">
              <Input 
                type="number"
                value={boost.amount ?? 0}
                onChange={(e) => updateBoost(idx, { amount: parseInt(e.target.value) || 0 })}
                className="text-center font-mono text-xs"
              />
            </div>
            <Button 
              type="button" 
              variant="danger" 
              size="icon" 
              onClick={() => removeBoost(idx)}
              className="rounded-lg p-1.5"
            >
              <Minus size={14} />
            </Button>
          </div>
        ))}
        {boosts.length === 0 && (
          <div className="text-[10px] text-system-text-muted italic text-center py-4 border border-dashed border-white/10 rounded-xl bg-white/5">
            No active stat modifications
          </div>
        )}
      </div>
    </div>
  );
});

export default StatBoostEditor;
