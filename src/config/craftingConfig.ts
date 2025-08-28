/**
 * craftingConfig.ts
 * 
 * Configurazioni e costanti per il sistema di crafting di The Safe Place.
 * Centralizza tutte le impostazioni modificabili del sistema.
 */

import type { CraftingConfig } from '../types/crafting';

// ===== CONFIGURAZIONE PRINCIPALE =====

/**
 * Configurazione di default per il sistema di crafting
 */
export const CRAFTING_CONFIG: CraftingConfig = {
  baseXpPerCraft: 15,           // XP base per ogni crafting completato
  complexityXpMultiplier: 2.0,  // Moltiplicatore per ricette complesse
  minAnimationTime: 800,        // Tempo minimo animazioni (ms)
  enableDebugLogging: false     // Debug logging (solo sviluppo)
};

// ===== COSTANTI UI =====

/**
 * Configurazioni per l'interfaccia utente
 */
export const UI_CONFIG = {
  // Navigazione
  RECIPES_PER_PAGE: 10,         // Ricette visibili per pagina
  SCROLL_ANIMATION_TIME: 200,   // Tempo animazione scroll (ms)
  
  // Colori (classi CSS)
  AVAILABLE_COLOR: 'text-green-400',
  UNAVAILABLE_COLOR: 'text-gray-500',
  SELECTED_COLOR: 'text-phosphor-400',
  INSUFFICIENT_COLOR: 'text-red-400',
  SUFFICIENT_COLOR: 'text-green-400',
  
  // Layout
  RECIPE_LIST_WIDTH: '25%',     // Larghezza lista ricette
  DETAILS_WIDTH: '40%',         // Larghezza dettagli
  PREVIEW_WIDTH: '35%',         // Larghezza anteprima
  ACTION_BAR_HEIGHT: '60px'     // Altezza barra azioni
} as const;

// ===== COSTANTI GAMEPLAY =====

/**
 * Configurazioni per le meccaniche di gioco
 */
export const GAMEPLAY_CONFIG = {
  // XP e Progressione
  MIN_XP_PER_CRAFT: 5,          // XP minimo garantito
  MAX_XP_PER_CRAFT: 50,         // XP massimo possibile
  SKILL_BONUS_XP: 10,           // Bonus XP per ricette con requisiti abilità
  
  // Sblocco Ricette
  RECIPES_PER_LEVEL: 2,         // Ricette sbloccate per livello
  MANUAL_UNLOCK_CHANCE: 0.15,   // Probabilità di trovare manuali (15%)
  
  // Validazione
  MAX_COMPONENTS_PER_RECIPE: 8, // Massimo componenti per ricetta
  MAX_RESULT_QUANTITY: 10,      // Massima quantità producibile
  
  // Performance
  RECIPE_CACHE_SIZE: 100,       // Dimensione cache ricette
  MATERIAL_CHECK_DEBOUNCE: 300  // Debounce controllo materiali (ms)
} as const;

// ===== MESSAGGI LOCALIZZATI =====

/**
 * Messaggi per l'interfaccia utente
 */
export const UI_MESSAGES = {
  // Titoli
  CRAFTING_TITLE: 'BANCO DI LAVORO',
  RECIPE_LIST_TITLE: 'RICETTE CONOSCIUTE',
  RECIPE_DETAILS_TITLE: 'DETTAGLI RICETTA',
  ITEM_PREVIEW_TITLE: 'ANTEPRIMA OGGETTO',
  
  // Stati
  AVAILABLE: 'Disponibile',
  UNAVAILABLE: 'Non Disponibile',
  INSUFFICIENT_MATERIALS: 'Materiali Insufficienti',
  INSUFFICIENT_SKILL: 'Abilità Insufficiente',
  READY_TO_CRAFT: 'Pronto per Creare',
  
  // Azioni
  CRAFT_ITEM: 'Crea Oggetto',
  EXIT_CRAFTING: 'Esci',
  SELECT_RECIPE: 'Seleziona Ricetta',
  
  // Comandi
  NAVIGATION_HELP: '[W/S] Naviga  [Invio] Crea  [ESC] Esci',
  CRAFT_COMMAND: '[Invio] Crea Oggetto',
  EXIT_COMMAND: '[ESC] Torna al Rifugio',
  
  // Feedback
  CRAFTING_SUCCESS: 'Oggetto creato con successo!',
  CRAFTING_FAILED: 'Creazione fallita.',
  NO_RECIPES_KNOWN: 'Non conosci ancora nessuna ricetta.',
  RECIPE_UNLOCKED: 'Nuova ricetta sbloccata!'
} as const;

// ===== CATEGORIE RICETTE =====

/**
 * Definizioni delle categorie di ricette
 */
export const RECIPE_CATEGORIES = {
  WEAPONS: {
    id: 'weapons',
    name: 'Armi',
    description: 'Strumenti per la difesa e la caccia',
    icon: '⚔️'
  },
  ARMOR: {
    id: 'armor',
    name: 'Armature',
    description: 'Protezioni per il corpo',
    icon: '🛡️'
  },
  CONSUMABLES: {
    id: 'consumables',
    name: 'Consumabili',
    description: 'Oggetti utilizzabili per sopravvivenza',
    icon: '🧪'
  },
  TOOLS: {
    id: 'tools',
    name: 'Strumenti',
    description: 'Attrezzi per varie attività',
    icon: '🔧'
  },
  MATERIALS: {
    id: 'materials',
    name: 'Materiali',
    description: 'Componenti per altre ricette',
    icon: '📦'
  },
  MISC: {
    id: 'misc',
    name: 'Varie',
    description: 'Altri oggetti utili',
    icon: '🎒'
  }
} as const;

// ===== SKILL MAPPINGS =====

/**
 * Mappatura delle abilità per i requisiti delle ricette
 */
export const SKILL_MAPPINGS = {
  // Abilità principali
  CRAFTING: 'adattamento',      // Crafting generale usa Adattamento
  SMITHING: 'potenza',          // Forgia usa Potenza
  ALCHEMY: 'percezione',        // Alchimia usa Percezione
  ENGINEERING: 'adattamento',   // Ingegneria usa Adattamento
  
  // Divisori per convertire stats in livelli abilità
  STAT_TO_SKILL_DIVISOR: 2,     // Stat / 2 = livello abilità
  MIN_SKILL_LEVEL: 1,           // Livello minimo abilità
  MAX_SKILL_LEVEL: 20           // Livello massimo abilità
} as const;

// ===== ANIMATION SETTINGS =====

/**
 * Configurazioni per animazioni e transizioni
 */
export const ANIMATION_CONFIG = {
  // Transizioni base
  FADE_IN_TIME: 300,            // Tempo fade in (ms)
  FADE_OUT_TIME: 200,           // Tempo fade out (ms)
  SLIDE_TIME: 250,              // Tempo slide (ms)
  
  // Feedback visivo
  SUCCESS_FLASH_TIME: 500,      // Tempo flash successo (ms)
  ERROR_SHAKE_TIME: 400,        // Tempo shake errore (ms)
  HOVER_TRANSITION: 150,        // Tempo transizione hover (ms)
  
  // Crafting specifico
  CRAFTING_PROGRESS_TIME: 1500, // Tempo animazione crafting (ms)
  MATERIAL_CONSUME_TIME: 300,   // Tempo animazione consumo materiali (ms)
  RESULT_APPEAR_TIME: 600       // Tempo apparizione risultato (ms)
} as const;

// ===== KEYBOARD MAPPINGS =====

/**
 * Mappatura dei tasti per il crafting
 */
export const KEYBOARD_CONFIG = {
  // Navigazione
  MOVE_UP: ['w', 'W', 'ArrowUp'],
  MOVE_DOWN: ['s', 'S', 'ArrowDown'],
  
  // Azioni
  CRAFT_ITEM: ['Enter', ' '],   // Invio o Spazio
  EXIT_SCREEN: ['Escape'],
  
  // Scorciatoie future
  QUICK_CRAFT: ['c', 'C'],      // Crafting rapido
  FILTER_TOGGLE: ['f', 'F'],    // Toggle filtri
  HELP_TOGGLE: ['h', 'H']       // Toggle aiuto
} as const;

// ===== VALIDATION RULES =====

/**
 * Regole di validazione per il sistema
 */
export const VALIDATION_RULES = {
  // Ricette
  MIN_RECIPE_ID_LENGTH: 3,
  MAX_RECIPE_ID_LENGTH: 50,
  MIN_RECIPE_NAME_LENGTH: 1,
  MAX_RECIPE_NAME_LENGTH: 100,
  
  // Componenti
  MIN_COMPONENT_QUANTITY: 1,
  MAX_COMPONENT_QUANTITY: 999,
  
  // Risultati
  MIN_RESULT_QUANTITY: 1,
  MAX_RESULT_QUANTITY: 100,
  
  // Abilità
  MIN_SKILL_REQUIREMENT: 1,
  MAX_SKILL_REQUIREMENT: 20
} as const;

// ===== EXPORT AGGREGATO =====

/**
 * Configurazione completa del sistema di crafting
 */
export const COMPLETE_CRAFTING_CONFIG = {
  crafting: CRAFTING_CONFIG,
  ui: UI_CONFIG,
  gameplay: GAMEPLAY_CONFIG,
  messages: UI_MESSAGES,
  categories: RECIPE_CATEGORIES,
  skills: SKILL_MAPPINGS,
  animations: ANIMATION_CONFIG,
  keyboard: KEYBOARD_CONFIG,
  validation: VALIDATION_RULES
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Ottiene un messaggio localizzato
 */
export function getMessage(key: keyof typeof UI_MESSAGES): string {
  return UI_MESSAGES[key];
}

/**
 * Ottiene una configurazione UI
 */
export function getUIConfig<K extends keyof typeof UI_CONFIG>(key: K): typeof UI_CONFIG[K] {
  return UI_CONFIG[key];
}

/**
 * Verifica se un tasto è mappato per un'azione
 */
export function isKeyMappedTo(key: string, action: keyof typeof KEYBOARD_CONFIG): boolean {
  return KEYBOARD_CONFIG[action].includes(key);
}