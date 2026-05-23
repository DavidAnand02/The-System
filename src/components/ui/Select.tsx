import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SelectProps {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string;
  placeholder?: string;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  options = [], 
  value,
  onChange,
  className = '', 
  placeholder = 'Select option...',
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse children if options are not provided
  const parsedOptions = options.length > 0 ? options : React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === 'option') {
      return {
        value: child.props.value,
        label: child.props.children
      };
    }
    return null;
  })?.filter(Boolean) as { value: string; label: string }[] || [];

  const selectedOption = parsedOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    if (onChange) {
      onChange({ target: { value: val } });
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5 w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-system-text-muted uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className={`relative ${isOpen ? 'z-[60]' : ''}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full bg-system-bg-base border border-system-border rounded-lg py-2 px-3 pr-10
            text-system-text text-left transition-all duration-200
            focus:outline-none focus:border-system-accent/50 focus:ring-1 focus:ring-system-accent/20
            ${isOpen ? 'border-system-accent/50 ring-1 ring-system-accent/20' : ''}
            ${error ? 'border-system-error/50 focus:border-system-error/50 focus:ring-system-error/20' : ''}
            ${className}
          `}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-system-text-muted pointer-events-none transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-system-accent' : ''}`} />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-system-bg-panel-solid border border-system-border-strong rounded-lg shadow-xl overflow-hidden backdrop-blur-md"
            >
              <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
                {parsedOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-xs font-orbitron transition-colors
                      ${opt.value === value 
                        ? 'bg-system-accent text-system-bg-base' 
                        : 'text-system-text hover:bg-system-accent/10 hover:text-system-accent'}
                    `}
                  >
                    <span className="truncate">{opt.label}</span>
                    {opt.value === value && <Check className="w-3 h-3 ml-2 shrink-0" />}
                  </button>
                ))}
                {parsedOptions.length === 0 && (
                  <div className="px-3 py-2 text-xs text-system-text-muted italic">
                    No options available
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <p className="text-[10px] text-system-error font-medium ml-1">
          {error}
        </p>
      )}
    </div>
  );
};
