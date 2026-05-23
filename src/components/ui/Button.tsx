import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none hover-glitch';
  
  const variants = {
    primary: 'bg-system-accent/20 text-system-accent hover:bg-system-accent/30 border border-system-accent/50 shadow-[0_0_15px_var(--system-accent-glow)] backdrop-blur-md',
    secondary: 'bg-system-bg-panel-solid/40 text-system-text hover:bg-system-accent/10 border border-system-border backdrop-blur-md',
    outline: 'bg-transparent border-2 border-system-accent/40 text-system-accent hover:bg-system-accent/10 hover:border-system-accent shadow-[inset_0_0_10px_var(--system-accent-muted)]',
    ghost: 'bg-transparent text-system-text-muted hover:text-system-text hover:bg-system-accent/10',
    danger: 'bg-system-error/10 text-system-error border border-system-error/40 hover:bg-system-error/20 backdrop-blur-sm',
    success: 'bg-system-success/10 text-system-success border border-system-success/40 hover:bg-system-success/20 backdrop-blur-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] uppercase tracking-wider gap-1.5',
    md: 'px-5 py-2.5 text-xs uppercase tracking-widest gap-2',
    lg: 'px-8 py-4 text-sm uppercase tracking-[0.2em] gap-3',
    icon: 'p-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : 18} />
      )}
      {children}
    </button>
  );
};
