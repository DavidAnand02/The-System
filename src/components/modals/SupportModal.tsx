import React from 'react';
import { Coffee, X } from 'lucide-react';

interface SupportModalProps {
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-500"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[380px] bg-system-bg-panel border-l border-system-accent/30 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col h-full animate-in slide-in-from-right duration-500 ease-out relative">
        {/* System Header */}
        <div className="p-4 border-b border-system-accent/20 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Coffee className="w-5 h-5 text-system-accent" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-system-accent rounded-full animate-pulse shadow-[0_0_8px_#00f2ff]"></div>
            </div>
            <div>
              <h2 className="text-[10px] font-orbitron text-white tracking-[0.3em] uppercase">Neural Support</h2>
              <p className="text-[7px] text-system-accent/50 font-mono uppercase tracking-widest">Protocol: AIS-CONTRIB-V1</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-system-accent/10 rounded-full text-system-text-muted hover:text-system-accent transition-all group hover-glitch"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        
        {/* Viewport for Ko-fi Widget - Precision Sized & Cropped */}
        <div className="flex-1 bg-white relative overflow-hidden">
          {/* Subtle inner shadow to blend the white iframe into the dark frame */}
          <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
          
          <iframe 
            id='kofiframe' 
            src='https://ko-fi.com/architect01/?hidefeed=true&widget=true&embed=true&preview=true' 
            style={{ 
              border: 'none', 
              width: '140%', 
              height: '100%',
              marginLeft: '-18%',
            }} 
            title='architect01'
            className="animate-in fade-in duration-700 delay-200"
          />
        </div>

        {/* System Footer */}
        <div className="p-4 bg-black/80 border-t border-system-accent/10">
          <p className="text-[8px] font-mono text-system-text-muted text-center tracking-widest uppercase">
            Contribution helps maintain the neural network infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
};
