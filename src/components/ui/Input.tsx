import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-bold text-system-text-muted uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-system-text-muted group-focus-within:text-system-accent transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-system-bg-base border border-system-border rounded-lg py-2 px-3 
            ${icon ? 'pl-10' : ''}
            text-system-text placeholder:text-system-text-muted/50
            focus:outline-none focus:border-system-accent/50 focus:ring-1 focus:ring-system-accent/20
            transition-all duration-200
            ${error ? 'border-system-error/50 focus:border-system-error/50 focus:ring-system-error/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] text-system-error font-medium ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }> = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-bold text-system-text-muted uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-system-bg-base border border-system-border rounded-lg py-2 px-3 
          text-system-text placeholder:text-system-text-muted/50
          focus:outline-none focus:border-system-accent/50 focus:ring-1 focus:ring-system-accent/20
          transition-all duration-200 min-h-[80px] resize-none
          ${error ? 'border-system-error/50 focus:border-system-error/50 focus:ring-system-error/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-system-error font-medium ml-1">
          {error}
        </p>
      )}
    </div>
  );
};
