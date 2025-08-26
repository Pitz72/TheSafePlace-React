import React, { useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // in milliseconds, default 3000
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  useEffect(() => {
    notifications.forEach(notification => {
      const duration = notification.duration || 3000;
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, duration);

      return () => clearTimeout(timer);
    });
  }, [notifications, onRemove]);

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-600 bg-green-900 bg-opacity-20 text-green-400';
      case 'error':
        return 'border-red-600 bg-red-900 bg-opacity-20 text-red-400';
      case 'warning':
        return 'border-yellow-600 bg-yellow-900 bg-opacity-20 text-yellow-400';
      case 'info':
        return 'border-phosphor-600 bg-phosphor-900 bg-opacity-20 text-phosphor-400';
      default:
        return 'border-phosphor-600 bg-phosphor-900 bg-opacity-20 text-phosphor-400';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            border p-4 font-mono animate-slide-in-right
            ${getNotificationStyles(notification.type)}
          `}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm mb-1">
                {notification.title}
              </div>
              <div className="text-xs opacity-90">
                {notification.message}
              </div>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-xs opacity-60 hover:opacity-100 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;