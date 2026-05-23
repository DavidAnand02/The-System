import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'outline' | 'interactive';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  onClick 
}) => {
  const baseStyles = 'rounded-lg overflow-hidden transition-all duration-300 animate-slam-in scanline-overlay relative';
  
  const variants = {
    default: 'bg-system-bg-panel backdrop-blur-xl border border-system-border shadow-[0_0_20px_rgba(0,0,0,0.5)]',
    glass: 'bg-system-accent/5 backdrop-blur-2xl border border-system-accent/20 shadow-[0_0_30px_var(--system-accent-muted)]',
    outline: 'bg-transparent border-2 border-system-border-strong',
    interactive: 'bg-system-bg-panel backdrop-blur-xl border border-system-border hover:border-system-accent hover:shadow-[0_0_25px_var(--system-accent-muted)] cursor-pointer active:scale-[0.99]',
  };

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-system-border ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-system-border bg-system-bg-panel/40 ${className}`}>
    {children}
  </div>
);
