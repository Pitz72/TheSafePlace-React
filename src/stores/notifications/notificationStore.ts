import { create } from 'zustand';
import type { LogEntry } from '../../interfaces/gameState';
import { MessageType, getRandomMessage } from '../../data/MessageArchive';

export interface NotificationState {
  // State
  logEntries: LogEntry[];
  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: number;
    duration?: number;
  }>;
  
  // Actions
  addLogEntry: (type: MessageType, context?: any) => void;
  clearLog: () => void;
  getRecentEntries: (count?: number) => LogEntry[];
  addNotification: (type: 'info' | 'warning' | 'error' | 'success', message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  resetNotificationState: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // --- INITIAL STATE ---
  logEntries: [],
  notifications: [],

  // --- ACTIONS ---
  
  addLogEntry: (type: MessageType, context?: any) => {
    const timestamp = Date.now();
    const id = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Genera il messaggio usando getRandomMessage
    const message = getRandomMessage(type, context) || 'Un evento misterioso accade.';
    
    const newEntry: LogEntry = {
      id,
      type,
      timestamp: new Date(timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
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
      case MessageType.QUEST_COMPLETED:
        addNotification('success', 'Quest completata!', 4000);
        break;
      case MessageType.DEATH:
        addNotification('error', 'Sei morto!', 10000);
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
    set({
      logEntries: [],
      notifications: []
    });
  }
}));

// Helper functions per formattare i messaggi
export const formatLogMessage = (entry: LogEntry): string => {
  const { type, context } = entry;
  
  switch (type) {
    case MessageType.MOVEMENT:
      return `Ti sei spostato verso ${context.direction || 'una nuova area'}.`;
    
    case MessageType.HP_DAMAGE:
      return `Hai subito ${context.damage} danni${context.reason ? ` da ${context.reason}` : ''}.`;
    
    case MessageType.HP_RECOVERY:
      return `Hai recuperato ${context.healing} HP${context.reason ? ` grazie a ${context.reason}` : ''}.`;
    
    case MessageType.ITEM_FOUND:
      return `Hai trovato: ${context.itemName || 'un oggetto'}.`;
    
    case MessageType.ITEM_USED:
      return `Hai usato: ${context.itemName || 'un oggetto'}.`;
    
    case MessageType.ITEM_DROPPED:
      return `Hai lasciato: ${context.itemName || 'un oggetto'}.`;
    
    case MessageType.COMBAT_START:
      return `È iniziato un combattimento${context.enemyName ? ` contro ${context.enemyName}` : ''}!`;
    
    case MessageType.COMBAT_END:
      return context.victory ? 'Hai vinto il combattimento!' : 'Sei stato sconfitto...';
    
    case MessageType.LEVEL_UP:
      return `Hai raggiunto il livello ${context.newLevel || '?'}!`;
    
    case MessageType.QUEST_START:
      return `Nuova quest: ${context.questName || 'Quest sconosciuta'}`;
    
    case MessageType.QUEST_COMPLETED:
      return `Quest completata: ${context.questName || 'Quest sconosciuta'}`;
    
    case MessageType.REST:
      return `Hai riposato per un'ora. Fatica ridotta di ${context.fatigueReduction || 0}.`;
    
    case MessageType.NIGHT_CONSUMPTION:
      return 'Hai passato la notte. Le tue risorse sono state consumate.';
    
    case MessageType.WEATHER_CHANGE:
      return `Il tempo è cambiato: ${context.newWeather || 'condizioni sconosciute'}.`;
    
    case MessageType.BIOME_CHANGE:
      return `Sei entrato in un nuovo bioma: ${context.newBiome || 'area sconosciuta'}.`;
    
    case MessageType.EVENT_TRIGGER:
      return context.eventName || 'È successo qualcosa di interessante...';
    
    case MessageType.EVENT_CHOICE:
      return context.text || 'Hai fatto una scelta.';
    
    case MessageType.RIVER_CROSSING:
      return context.success 
        ? 'Hai attraversato il fiume con successo!' 
        : 'Il tentativo di attraversare il fiume è fallito.';
    
    case MessageType.AMBIANCE_RANDOM:
      return context.text || 'Qualcosa accade nell\'ambiente circostante.';
    
    case MessageType.DEATH:
      return 'Sei morto. Il tuo viaggio finisce qui.';
    
    default:
      return context.text || 'È successo qualcosa.';
  }
};

// Helper per ottenere l'icona del tipo di messaggio
export const getMessageIcon = (type: MessageType): string => {
  switch (type) {
    case MessageType.MOVEMENT: return '🚶';
    case MessageType.HP_DAMAGE: return '💔';
    case MessageType.HP_RECOVERY: return '💚';
    case MessageType.ITEM_FOUND: return '📦';
    case MessageType.ITEM_USED: return '🔧';
    case MessageType.ITEM_DROPPED: return '📤';
    case MessageType.COMBAT_START: return '⚔️';
    case MessageType.COMBAT_END: return '🏆';
    case MessageType.LEVEL_UP: return '⭐';
    case MessageType.QUEST_START: return '📋';
    case MessageType.QUEST_COMPLETED: return '✅';
    case MessageType.REST: return '😴';
    case MessageType.NIGHT_CONSUMPTION: return '🌙';
    case MessageType.WEATHER_CHANGE: return '🌤️';
    case MessageType.BIOME_CHANGE: return '🗺️';
    case MessageType.EVENT_TRIGGER: return '❗';
    case MessageType.EVENT_CHOICE: return '💭';
    case MessageType.RIVER_CROSSING: return '🌊';
    case MessageType.AMBIANCE_RANDOM: return '🌿';
    case MessageType.DEATH: return '💀';
    default: return 'ℹ️';
  }
};