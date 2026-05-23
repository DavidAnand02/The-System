import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from './Card';

interface CollapsibleCardProps {
  title: string;
  icon?: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  extraInfo?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  icon,
  isCollapsed,
  onToggle,
  extraInfo,
  children,
  className = '',
  contentClassName = '',
  headerClassName = ''
}) => {
  return (
    <Card variant="glass" className={`overflow-hidden ${className}`}>
      <div 
        className={`flex justify-between items-center border-b border-system-border p-6 pb-2 cursor-pointer hover:bg-system-accent/5 transition-colors ${headerClassName}`}
        onClick={onToggle}
      >
        <h2 className="text-xl font-orbitron text-system-text flex items-center gap-2">
          {icon && <span className="text-system-accent">{icon}</span>}
          {title}
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-system-text-muted" />
          ) : (
            <ChevronUp className="w-4 h-4 text-system-text-muted" />
          )}
        </h2>
        {extraInfo && (
          <div className="text-[10px] font-orbitron text-system-text-muted uppercase tracking-widest">
            {extraInfo}
          </div>
        )}
      </div>
      {!isCollapsed && (
        <CardContent className={`p-6 pt-2 animate-in slide-in-from-top-2 duration-200 ${contentClassName}`}>
          {children}
        </CardContent>
      )}
    </Card>
  );
};
