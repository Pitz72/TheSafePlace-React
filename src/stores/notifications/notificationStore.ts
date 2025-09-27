import { create } from 'zustand';
import type { LogEntry } from '@/data/MessageArchive';
import { MessageType, getRandomMessage } from '@/data/MessageArchive';
import { useWorldStore } from '@/stores/world/worldStore';
import { useTimeStore } from '@/stores/time/timeStore';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: number;
  duration?: number;
}

interface NotificationState {
  logEntries: LogEntry[];
  notifications: Notification[];
}

interface NotificationActions {
  addLogEntry: (type: MessageType, context?: any) => void;
  clearLog: () => void;
  getRecentEntries: (count?: number) => LogEntry[];
  addNotification: (type: 'info' | 'warning' | 'error' | 'success', message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  resetNotificationState: () => void;
  restoreState: (state: NotificationState) => void;
}

export type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // --- INITIAL STATE ---
  logEntries: [],
  notifications: [],

  // --- ACTIONS ---
  
  addLogEntry: (type: MessageType, context?: any) => {
    const timeStore = useTimeStore.getState();
    const worldStore = useWorldStore.getState();
    
    // Safe access to currentTime with fallback
    const timeState = timeStore?.timeState;
    const gameTime = timeState?.currentTime || 0;
    
    const timestamp = Date.now();
    const id = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

    let message: string;
    // Gestione speciale per EVENT_CHOICE per usare direttamente il testo del risultato.
    if (type === MessageType.EVENT_CHOICE && context?.text) {
      message = context.text;
    } else {
      // Comportamento standard per tutti gli altri tipi di messaggio.
      message = getRandomMessage(type, context) || `Evento di tipo ${type} senza messaggio definito.`;
    }

    const newEntry: LogEntry = {
      id,
      type,
      timestamp: timeStore.getTimeString(),
      message,
      context: context || {}
    };
    
    set(state => ({
      logEntries: [...state.logEntries, newEntry]
    }));
    
    // Auto-genera notifiche per certi tipi di log
    const { addNotification } = get();

    switch (type) {
      case MessageType.HP_DAMAGE:
        if (context?.damage > 10) {
          addNotification('warning', `Hai subito ${context.damage} danni!`, 3000);
        }
        break;
      case MessageType.HP_RECOVERY:
        if (context?.healing > 5) {
          addNotification('success', `Hai recuperato ${context.healing} HP!`, 2000);
        }
        break;
      case MessageType.LEVEL_UP:
        addNotification('success', 'Hai raggiunto un nuovo livello!', 5000);
        break;
      case MessageType.ITEM_FOUND:
        addNotification('info', `Hai trovato: ${context?.itemName || 'un oggetto'}`, 2000);
        break;
    }
  },

  clearLog: () => {
    set({ logEntries: [] });
  },

  getRecentEntries: (count = 10) => {
    const { logEntries } = get();
    return logEntries.slice(-count);
  },

  addNotification: (type: 'info' | 'warning' | 'error' | 'success', message: string, duration = 3000) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    const notification = {
      id,
      type,
      message,
      timestamp,
      duration
    };
    
    set(state => ({
      notifications: [...state.notifications, notification]
    }));
    
    // Auto-rimuovi la notifica dopo la durata specificata
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
  },

  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(notif => notif.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  resetNotificationState: () => {
    set({ logEntries: [], notifications: [] });
  },

  restoreState: (state) => {
    set({
      logEntries: state.logEntries,
      notifications: state.notifications
    });
  }
}));