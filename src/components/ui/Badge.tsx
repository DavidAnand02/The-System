import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'purple' | 'outline' | 'accent';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-full uppercase tracking-wider';
  
  const variants = {
    default: 'bg-system-bg-panel/60 text-system-text-muted border border-system-border backdrop-blur-sm',
    cyan: 'bg-system-accent/20 text-system-accent border border-system-accent/40 shadow-[0_0_12px_var(--system-accent-muted)] backdrop-blur-md',
    emerald: 'bg-system-success/20 text-system-success border border-system-success/40 shadow-[0_0_12px_rgba(52,211,153,0.3)] backdrop-blur-md',
    rose: 'bg-system-error/20 text-system-error border border-system-error/40 shadow-[0_0_12px_rgba(251,113,133,0.3)] backdrop-blur-md',
    amber: 'bg-system-warning/20 text-system-warning border border-system-warning/40 shadow-[0_0_12px_rgba(251,191,36,0.3)] backdrop-blur-md',
    purple: 'bg-system-info/20 text-system-info border border-system-info/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] backdrop-blur-md',
    outline: 'bg-transparent border border-system-border-strong text-system-text-muted',
    accent: 'bg-system-accent/20 text-system-accent border border-system-accent/40 shadow-[0_0_15px_var(--system-accent-glow)] backdrop-blur-md',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[9px] tracking-tighter',
    sm: 'px-2.5 py-0.5 text-[10px] tracking-widest',
    md: 'px-3.5 py-1 text-[11px] tracking-[0.15em]',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
