import React from 'react';
import { Star, Shield, Search, X, Plus } from 'lucide-react';
import { PlayerData, Title, Belief } from '../../types';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Badge } from '../ui/Badge';

export interface TitleArchiveSectionProps {
  player: PlayerData;
  titles: Title[];
  titleSearchTerm: string;
  setTitleSearchTerm: (term: string) => void;
  setShowAddTitleForm: (show: boolean) => void;
  handleUpdateTitleField: (id: string, field: keyof Title, value: string) => void;
  setTitleEffectCreator: (creator: { titleId: string } | null) => void;
  filteredTitles: Title[];
}

export const TitleArchiveSection: React.FC<TitleArchiveSectionProps> = ({
  player,
  titles,
  titleSearchTerm,
  setTitleSearchTerm,
  setShowAddTitleForm,
  handleUpdateTitleField,
  setTitleEffectCreator,
  filteredTitles
}) => (
  <Card variant="glass" className="p-3 flex flex-col gap-3 h-full">
    <div className="flex flex-col gap-2 border-b border-white/10 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-orbitron text-slate-200 uppercase tracking-tight flex items-center gap-1.5">
            <Star className="w-3 h-3 text-system-accent" /> Titles
          </h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowAddTitleForm(true)}
            className="font-orbitron uppercase tracking-widest text-[8px] h-6 px-2"
            icon={Plus}
          >
            New
          </Button>
        </div>
        <div className="w-full relative">
            <Input 
              placeholder="SEARCH..."
              value={titleSearchTerm}
              onChange={(e) => setTitleSearchTerm(e.target.value)}
              icon={<Search className="w-3 h-3" />}
              className="font-orbitron text-[9px] h-7 w-full"
            />
        </div>
    </div>

    <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-[300px]">
      {filteredTitles.map(title => (
        <div key={title.id} className="bg-white/5 border border-white/10 rounded-lg p-2.5 hover:border-system-accent/30 transition-all group">
          <div className="flex justify-between items-start mb-1 gap-2">
            <input 
              type="text"
              value={title.name}
              onChange={(e) => handleUpdateTitleField(title.id, 'name', e.target.value)}
              className="bg-transparent border-none outline-none focus:ring-0 text-xs font-orbitron text-system-accent uppercase tracking-tight flex-1 min-w-0 p-0"
            />
            <div className="flex items-center shrink-0">
              {(player.equippedTitles || [player.title]).includes(title.name) && (
                <Badge variant="accent" className="text-[6px] px-1 py-0 h-3">EQUIPPED</Badge>
              )}
            </div>
          </div>
          <textarea 
            value={title.description}
            onChange={(e) => handleUpdateTitleField(title.id, 'description', e.target.value)}
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-[9px] text-slate-400 font-orbitron h-8 resize-none leading-relaxed p-0"
          />
          <div className="mt-1.5 pt-1.5 border-t border-white/10 flex justify-between items-center">
            <div className="text-[7px] font-orbitron text-slate-500 uppercase">
              Effects: <span className="text-system-accent">{(title.effects || []).length}</span>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setTitleEffectCreator({ titleId: title.id })}
              className="text-[7px] font-orbitron text-system-accent hover:text-system-accent/80 uppercase h-auto py-0.5 px-1.5"
              icon={Plus}
            >
              Add Effect
            </Button>
          </div>
        </div>
      ))}
      {filteredTitles.length === 0 && (
        <div className="col-span-full py-8 text-center border border-dashed border-system-border rounded-xl">
          <p className="text-[10px] text-system-text-muted font-orbitron uppercase tracking-widest">No titles found in the archive</p>
        </div>
      )}
    </div>
  </Card>
);

export interface BeliefArchiveSectionProps {
  player: PlayerData;
  beliefs: Belief[];
  beliefSearchTerm: string;
  setBeliefSearchTerm: (term: string) => void;
  setShowAddBeliefForm: (show: boolean) => void;
  handleUpdateBeliefField: (id: string, field: keyof Belief, value: string) => void;
  setBeliefEffectCreator: (creator: { beliefId: string } | null) => void;
  filteredBeliefs: Belief[];
}

export const BeliefArchiveSection: React.FC<BeliefArchiveSectionProps> = ({
  player,
  beliefs,
  beliefSearchTerm,
  setBeliefSearchTerm,
  setShowAddBeliefForm,
  handleUpdateBeliefField,
  setBeliefEffectCreator,
  filteredBeliefs
}) => (
  <Card variant="glass" className="p-3 flex flex-col gap-3 h-full">
    <div className="flex flex-col gap-2 border-b border-white/10 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-orbitron text-slate-200 uppercase tracking-tight flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-system-accent" /> Beliefs
          </h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowAddBeliefForm(true)}
            className="font-orbitron uppercase tracking-widest text-[8px] h-6 px-2"
            icon={Plus}
          >
            New
          </Button>
        </div>
        <div className="w-full relative">
            <Input 
              placeholder="SEARCH..."
              value={beliefSearchTerm}
              onChange={(e) => setBeliefSearchTerm(e.target.value)}
              icon={<Search className="w-3 h-3" />}
              className="font-orbitron text-[9px] h-7 w-full"
            />
        </div>
    </div>

    <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-[300px]">
      {filteredBeliefs.map(belief => (
        <div key={belief.id} className="bg-white/5 border border-white/10 rounded-lg p-2.5 hover:border-system-accent/30 transition-all group">
          <div className="flex justify-between items-start mb-1 gap-2">
            <input 
              type="text"
              value={belief.name}
              onChange={(e) => handleUpdateBeliefField(belief.id, 'name', e.target.value)}
              className="bg-transparent border-none outline-none focus:ring-0 text-xs font-orbitron text-system-accent uppercase tracking-tight flex-1 min-w-0 p-0"
            />
            <div className="flex items-center shrink-0">
              {(player.equippedBeliefs || [player.belief]).includes(belief.name) && (
                <Badge variant="accent" className="text-[6px] px-1 py-0 h-3">EQUIPPED</Badge>
              )}
            </div>
          </div>
          <textarea 
            value={belief.description}
            onChange={(e) => handleUpdateBeliefField(belief.id, 'description', e.target.value)}
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-[9px] text-slate-400 font-orbitron h-8 resize-none leading-relaxed p-0"
          />
          <div className="mt-1.5 pt-1.5 border-t border-white/10 flex justify-between items-center">
            <div className="text-[7px] font-orbitron text-slate-500 uppercase">
              Effects: <span className="text-system-accent">{(belief.effects || []).length}</span>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setBeliefEffectCreator({ beliefId: belief.id })}
              className="text-[7px] font-orbitron text-system-accent hover:text-system-accent/80 uppercase h-auto py-0.5 px-1.5"
              icon={Plus}
            >
              Add Effect
            </Button>
          </div>
        </div>
      ))}
      {filteredBeliefs.length === 0 && (
        <div className="col-span-full py-8 text-center border border-dashed border-system-border rounded-xl">
          <p className="text-[10px] text-system-text-muted font-orbitron uppercase tracking-widest">No beliefs found in the system</p>
        </div>
      )}
    </div>
  </Card>
);

interface ArchiveSystemProps {
  player: PlayerData;
  titles: Title[];
  beliefs: Belief[];
  titleSearchTerm: string;
  setTitleSearchTerm: (term: string) => void;
  beliefSearchTerm: string;
  setBeliefSearchTerm: (term: string) => void;
  setShowAddTitleForm: (show: boolean) => void;
  setShowAddBeliefForm: (show: boolean) => void;
  handleUpdateTitleField: (id: string, field: keyof Title, value: string) => void;
  handleUpdateBeliefField: (id: string, field: keyof Belief, value: string) => void;
  setTitleEffectCreator: (creator: { titleId: string } | null) => void;
  setBeliefEffectCreator: (creator: { beliefId: string } | null) => void;
  filteredTitles: Title[];
  filteredBeliefs: Belief[];
  className?: string;
}

const ArchiveSystem: React.FC<ArchiveSystemProps> = ({
  player,
  titles,
  beliefs,
  titleSearchTerm,
  setTitleSearchTerm,
  beliefSearchTerm,
  setBeliefSearchTerm,
  setShowAddTitleForm,
  setShowAddBeliefForm,
  handleUpdateTitleField,
  handleUpdateBeliefField,
  setTitleEffectCreator,
  setBeliefEffectCreator,
  filteredTitles,
  filteredBeliefs,
  className = "grid grid-cols-1 lg:grid-cols-2 gap-6"
}) => {
  return (
    <div className={className}>
      <TitleArchiveSection 
        player={player}
        titles={titles}
        titleSearchTerm={titleSearchTerm}
        setTitleSearchTerm={setTitleSearchTerm}
        setShowAddTitleForm={setShowAddTitleForm}
        handleUpdateTitleField={handleUpdateTitleField}
        setTitleEffectCreator={setTitleEffectCreator}
        filteredTitles={filteredTitles}
      />
      <BeliefArchiveSection 
        player={player}
        beliefs={beliefs}
        beliefSearchTerm={beliefSearchTerm}
        setBeliefSearchTerm={setBeliefSearchTerm}
        setShowAddBeliefForm={setShowAddBeliefForm}
        handleUpdateBeliefField={handleUpdateBeliefField}
        setBeliefEffectCreator={setBeliefEffectCreator}
        filteredBeliefs={filteredBeliefs}
      />
    </div>
  );
};

export default React.memo(ArchiveSystem);
