import { create } from 'zustand';
import type { LogEntry } from '@/data/MessageArchive';
import { MessageType, getRandomMessage } from '@/data/MessageArchive';
import { useWorldStore } from '@/stores/world/worldStore';
import { useTimeStore } from '@/stores/time/timeStore';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
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
  addNotification: (notification: { type: 'info' | 'warning' | 'error' | 'success'; title?: string; message: string; duration?: number }) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  resetNotificationState: () => void;
  resetNotifications: () => void;
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
          addNotification({ type: 'warning', message: `Hai subito ${context.damage} danni!`, duration: 3000 });
        }
        break;
      case MessageType.HP_RECOVERY:
        if (context?.healing > 5) {
          addNotification({ type: 'success', message: `Hai recuperato ${context.healing} HP!`, duration: 2000 });
        }
        break;
      case MessageType.LEVEL_UP:
        addNotification({ type: 'success', message: 'Hai raggiunto un nuovo livello!', duration: 5000 });
        break;
      case MessageType.ITEM_FOUND:
        addNotification({ type: 'info', message: `Hai trovato: ${context?.itemName || 'un oggetto'}`, duration: 2000 });
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

  addNotification: (notification: { type: 'info' | 'warning' | 'error' | 'success'; title?: string; message: string; duration?: number }) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    const duration = notification.duration ?? 3000;
    
    const newNotification = {
      id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp,
      duration
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
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

  /**
   * Alias per resetNotificationState per coerenza con gli altri store.
   * Resetta tutte le notifiche e i log entries allo stato iniziale.
   */
  resetNotifications: () => {
    get().resetNotificationState();
  },

  restoreState: (state) => {
    set({
      logEntries: state.logEntries,
      notifications: state.notifications
    });
  }
}));