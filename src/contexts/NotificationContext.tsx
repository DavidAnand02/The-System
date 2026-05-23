import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useSound } from './SoundContext';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
}

interface NotificationContextType {
  notify: (type: NotificationType, message: string, description?: string) => void;
  remove: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { playNotification, playSuccess, playError } = useSound();

  const remove = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((type: NotificationType, message: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, type, message, description }]);
    
    // Play sound based on notification type
    if (type === 'success') {
      playSuccess();
    } else if (type === 'error') {
      playError();
    } else {
      playNotification();
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => remove(id), 5000);
  }, [remove, playNotification, playSuccess, playError]);

  return (
    <NotificationContext.Provider value={{ notify, remove }}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-[200] flex flex-col gap-2 md:gap-3 w-auto md:w-full md:max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map(n => (
            <NotificationItem key={n.id} notification={n} onRemove={remove} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

const NotificationItem: React.FC<{ notification: Notification; onRemove: (id: string) => void }> = ({ 
  notification, 
  onRemove 
}) => {
  const icons = {
    success: <CheckCircle2 className="text-system-success" size={18} />,
    error: <AlertCircle className="text-system-error" size={18} />,
    info: <Info className="text-system-info" size={18} />,
    warning: <AlertTriangle className="text-system-warning" size={18} />,
  };

  const bgColors = {
    success: 'bg-system-success/10 border-system-success/20',
    error: 'bg-system-error/10 border-system-error/20',
    info: 'bg-system-info/10 border-system-info/20',
    warning: 'bg-system-warning/10 border-system-warning/20',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={`
        pointer-events-auto flex items-start gap-2.5 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-xl border backdrop-blur-md shadow-2xl
        ${bgColors[notification.type]}
      `}
    >
      <div className="mt-0.5 flex-shrink-0">{icons[notification.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[11px] md:text-sm font-bold text-white leading-tight">
          {notification.message}
        </h4>
        {notification.description && (
          <p className="text-[10px] md:text-xs text-slate-400 mt-1 leading-relaxed">
            {notification.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
