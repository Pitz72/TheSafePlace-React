import { LogEntry, MessageType } from '@/data/MessageArchive';

// Helper functions per formattare i messaggi
export const formatLogMessage = (entry: LogEntry): string => {
  const { type, context } = entry;

  switch (type) {
    case MessageType.MOVEMENT:
      return `Ti sei spostato verso ${context?.direction || 'una nuova area'}.`;

    case MessageType.HP_DAMAGE:
      return `Hai subito ${context?.damage || 0} danni${context?.reason ? ` da ${context.reason}` : ''}.`;

    case MessageType.HP_RECOVERY:
      return `Hai recuperato ${context?.healing || 0} HP${context?.reason ? ` grazie a ${context.reason}` : ''}.`;

    case MessageType.ITEM_FOUND:
      return `Hai trovato: ${context?.itemName || 'un oggetto'}.`;

    case MessageType.ITEM_USED:
      return `Hai usato: ${context?.itemName || 'un oggetto'}.`;

    case MessageType.LEVEL_UP:
      return `Hai raggiunto il livello ${context?.newLevel || '?'}!`;

    case MessageType.EVENT_CHOICE:
      return context?.text || 'Hai fatto una scelta.';

    case MessageType.AMBIANCE_RANDOM:
      return context?.text || 'Qualcosa accade nell\'ambiente circostante.';

    default:
      return context?.text || 'È successo qualcosa.';
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
    case MessageType.LEVEL_UP: return '⭐';
    case MessageType.EVENT_CHOICE: return '💭';
    case MessageType.AMBIANCE_RANDOM: return '🌿';
    default: return 'ℹ️';
  }
};