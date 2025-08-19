// Color Test - Test per verificare tutti i colori dei messaggi
// Strumento per testare la visualizzazione di tutti i MessageType

import { MessageType } from '../data/MessageArchive';

export interface ColorTestResult {
  messageType: MessageType;
  cssClass: string;
  color: string;
  description: string;
  category: string;
}

/**
 * Mappa tutti i MessageType alle loro classi CSS e colori
 */
export function getAllMessageColors(): ColorTestResult[] {
  const results: ColorTestResult[] = [
    // Sistema base
    {
      messageType: MessageType.GAME_START,
      cssClass: 'journal-welcome',
      color: '#FFD700',
      description: 'Messaggi di benvenuto e inizio gioco',
      category: 'Sistema Base'
    },
    {
      messageType: MessageType.BIOME_ENTER,
      cssClass: 'journal-standard',
      color: '#22c55e',
      description: 'Ingresso in nuovi biomi',
      category: 'Sistema Base'
    },
    {
      messageType: MessageType.AMBIANCE_RANDOM,
      cssClass: 'journal-ambiance',
      color: '#15803d',
      description: 'Messaggi atmosferici casuali',
      category: 'Sistema Base'
    },

    // Movimento e terreno
    {
      messageType: MessageType.MOVEMENT_FAIL_MOUNTAIN,
      cssClass: 'journal-warning',
      color: '#FFA500',
      description: 'Blocco movimento montagne',
      category: 'Movimento'
    },
    {
      messageType: MessageType.MOVEMENT_ACTION_RIVER,
      cssClass: 'journal-river',
      color: '#008888',
      description: 'Attraversamento fiumi',
      category: 'Movimento'
    },
    {
      messageType: MessageType.MOVEMENT_SUCCESS,
      cssClass: 'journal-success',
      color: '#00FF7F',
      description: 'Movimento riuscito',
      category: 'Movimento'
    },

    // Skill checks
    {
      messageType: MessageType.SKILL_CHECK_SUCCESS,
      cssClass: 'journal-success',
      color: '#00FF7F',
      description: 'Skill check riusciti',
      category: 'Skill Check'
    },
    {
      messageType: MessageType.SKILL_CHECK_FAILURE,
      cssClass: 'journal-failure',
      color: '#FF4444',
      description: 'Skill check falliti',
      category: 'Skill Check'
    },
    {
      messageType: MessageType.SKILL_CHECK_RIVER_SUCCESS,
      cssClass: 'journal-river',
      color: '#008888',
      description: 'Attraversamento fiume riuscito',
      category: 'Skill Check'
    },

    // Salute e riposo
    {
      messageType: MessageType.HP_RECOVERY,
      cssClass: 'journal-hp-recovery',
      color: '#32CD32',
      description: 'Recupero punti vita',
      category: 'Salute'
    },
    {
      messageType: MessageType.HP_DAMAGE,
      cssClass: 'journal-hp-damage',
      color: '#DC143C',
      description: 'Danni subiti',
      category: 'Salute'
    },
    {
      messageType: MessageType.REST_BLOCKED,
      cssClass: 'journal-warning',
      color: '#FFA500',
      description: 'Riposo bloccato',
      category: 'Salute'
    },
    {
      messageType: MessageType.REST_SUCCESS,
      cssClass: 'journal-rest',
      color: '#87CEEB',
      description: 'Riposo riuscito',
      category: 'Salute'
    },

    // Azioni generiche
    {
      messageType: MessageType.ACTION_SUCCESS,
      cssClass: 'journal-success',
      color: '#00FF7F',
      description: 'Azioni riuscite',
      category: 'Azioni'
    },
    {
      messageType: MessageType.ACTION_FAIL,
      cssClass: 'journal-failure',
      color: '#FF4444',
      description: 'Azioni fallite',
      category: 'Azioni'
    },

    // Sistema personaggio
    {
      messageType: MessageType.CHARACTER_CREATION,
      cssClass: 'journal-welcome',
      color: '#FFD700',
      description: 'Creazione personaggio',
      category: 'Personaggio'
    },
    {
      messageType: MessageType.LEVEL_UP,
      cssClass: 'journal-welcome',
      color: '#FFD700',
      description: 'Avanzamento livello',
      category: 'Personaggio'
    },

    // Inventario e oggetti
    {
      messageType: MessageType.ITEM_FOUND,
      cssClass: 'journal-item',
      color: '#FFD700',
      description: 'Oggetti trovati',
      category: 'Inventario'
    },
    {
      messageType: MessageType.ITEM_USED,
      cssClass: 'journal-item',
      color: '#FFD700',
      description: 'Oggetti utilizzati',
      category: 'Inventario'
    },
    {
      messageType: MessageType.INVENTORY_FULL,
      cssClass: 'journal-warning',
      color: '#FFA500',
      description: 'Inventario pieno',
      category: 'Inventario'
    },

    // Sistema tempo
    {
      messageType: MessageType.TIME_DAWN,
      cssClass: 'journal-time-dawn',
      color: '#FFA500',
      description: 'Alba',
      category: 'Tempo'
    },
    {
      messageType: MessageType.TIME_DUSK,
      cssClass: 'journal-time-dusk',
      color: '#4169E1',
      description: 'Tramonto',
      category: 'Tempo'
    },
    {
      messageType: MessageType.TIME_MIDNIGHT,
      cssClass: 'journal-time-night',
      color: '#191970',
      description: 'Mezzanotte',
      category: 'Tempo'
    },

    // Eventi speciali
    {
      messageType: MessageType.DISCOVERY,
      cssClass: 'journal-discovery',
      color: '#FF69B4',
      description: 'Scoperte',
      category: 'Eventi'
    },
    {
      messageType: MessageType.DANGER,
      cssClass: 'journal-danger',
      color: '#FF0000',
      description: 'Pericoli',
      category: 'Eventi'
    },
    {
      messageType: MessageType.MYSTERY,
      cssClass: 'journal-mystery',
      color: '#9370DB',
      description: 'Misteri',
      category: 'Eventi'
    }
  ];

  return results;
}

/**
 * Raggruppa i colori per categoria
 */
export function getColorsByCategory(): Record<string, ColorTestResult[]> {
  const colors = getAllMessageColors();
  const grouped: Record<string, ColorTestResult[]> = {};
  
  for (const color of colors) {
    if (!grouped[color.category]) {
      grouped[color.category] = [];
    }
    grouped[color.category].push(color);
  }
  
  return grouped;
}

/**
 * Stampa un report di tutti i colori implementati
 */
export function printColorReport(): void {
  const grouped = getColorsByCategory();
  
  console.log('=== REPORT COLORI MESSAGGI ===');
  console.log(`Totale MessageType: ${getAllMessageColors().length}`);
  console.log(`Categorie: ${Object.keys(grouped).length}`);
  console.log('');
  
  for (const [category, colors] of Object.entries(grouped)) {
    console.log(`📂 ${category.toUpperCase()}:`);
    for (const color of colors) {
      console.log(`  ✅ ${color.messageType}: ${color.cssClass} (${color.color})`);
      console.log(`     ${color.description}`);
    }
    console.log('');
  }
}

/**
 * Verifica che tutti i MessageType abbiano un colore assegnato
 */
export function validateAllColorsAssigned(): boolean {
  const allMessageTypes = Object.values(MessageType);
  const coloredMessageTypes = getAllMessageColors().map(c => c.messageType);
  
  const missing = allMessageTypes.filter(type => !coloredMessageTypes.includes(type));
  
  if (missing.length > 0) {
    console.error('❌ MessageType senza colore:', missing);
    return false;
  }
  
  console.log('✅ Tutti i MessageType hanno un colore assegnato');
  return true;
}