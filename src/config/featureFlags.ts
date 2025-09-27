/**
 * FEATURE FLAGS SYSTEM - FASE 1 STABILIZZAZIONE
 * 
 * Sistema centralizzato per disabilitare temporaneamente funzionalità problematiche
 * durante la fase di stabilizzazione del core del gioco.
 * 
 * IMPORTANTE: Questo è un sistema temporaneo per la stabilizzazione.
 * Le funzionalità disabilitate verranno riattivate gradualmente dopo i test.
 */

export interface FeatureFlags {
  // === CORE FEATURES (SEMPRE ATTIVE) ===
  BOOT_SEQUENCE: boolean;
  MENU_SYSTEM: boolean;
  CHARACTER_CREATION: boolean;
  GAME_SCREEN: boolean;
  SAVE_LOAD_SYSTEM: boolean;
  INVENTORY_BASIC: boolean;
  SURVIVAL_SYSTEM: boolean;

  // === FUNZIONALITÀ DA STABILIZZARE GRADUALMENTE ===
  CRAFTING_SYSTEM: boolean;
  CRAFTING_ADVANCED: boolean;
  COMBAT_SYSTEM: boolean;
  COMBAT_ADVANCED: boolean;
  EVENT_SYSTEM: boolean;
  EVENT_COMPLEX: boolean;
  WEATHER_SYSTEM: boolean;
  NARRATIVE_SYSTEM: boolean;
  NARRATIVE_ADVANCED: boolean;

  // === FUNZIONALITÀ TEMPORANEAMENTE DISABILITATE ===
  DEBUG_TOOLS: boolean;
  ACCESSIBILITY_ADVANCED: boolean;
  PERFORMANCE_MONITORING: boolean;
  ANALYTICS: boolean;
  EXPERIMENTAL_FEATURES: boolean;

  // === SISTEMI DI SUPPORTO ===
  ERROR_BOUNDARIES: boolean;
  LOADING_STATES: boolean;
  NOTIFICATIONS: boolean;
  KEYBOARD_SHORTCUTS: boolean;
}

/**
 * CONFIGURAZIONE FEATURE FLAGS - FASE 1
 * 
 * STRATEGIA: Disabilitare tutto tranne il core essenziale
 * per stabilizzare il gioco base, poi riattivare gradualmente.
 */
export const FEATURE_FLAGS: FeatureFlags = {
  // === CORE FEATURES (ATTIVE) ===
  BOOT_SEQUENCE: true,
  MENU_SYSTEM: true,
  CHARACTER_CREATION: true,
  GAME_SCREEN: true,
  SAVE_LOAD_SYSTEM: true,
  INVENTORY_BASIC: true,
  SURVIVAL_SYSTEM: true,

  // === FUNZIONALITÀ GRADUALMENTE RIATTIVABILI ===
  CRAFTING_SYSTEM: true,         // RIATTIVATO - sistema base stabile
  CRAFTING_ADVANCED: false,      // DISABILITATO - funzionalità avanzate
  COMBAT_SYSTEM: true,           // ATTIVO - necessario per gameplay base
  COMBAT_ADVANCED: false,        // DISABILITATO - funzionalità avanzate
  EVENT_SYSTEM: true,            // ATTIVO - eventi base necessari
  EVENT_COMPLEX: false,          // DISABILITATO - eventi complessi problematici
  WEATHER_SYSTEM: true,          // ATTIVO - parte dell'atmosfera base
  NARRATIVE_SYSTEM: true,        // ATTIVO - necessario per il gioco
  NARRATIVE_ADVANCED: false,     // DISABILITATO - funzionalità avanzate

  // === TEMPORANEAMENTE DISABILITATE ===
  DEBUG_TOOLS: false,            // DISABILITATO - non necessario per utenti finali
  ACCESSIBILITY_ADVANCED: false, // DISABILITATO - da implementare dopo stabilizzazione
  PERFORMANCE_MONITORING: false, // DISABILITATO - può causare overhead
  ANALYTICS: false,              // DISABILITATO - non critico
  EXPERIMENTAL_FEATURES: false,  // DISABILITATO - potenzialmente instabili

  // === SISTEMI DI SUPPORTO (ATTIVI) ===
  ERROR_BOUNDARIES: true,        // ATTIVO - essenziale per stabilità
  LOADING_STATES: true,          // ATTIVO - migliora UX
  NOTIFICATIONS: true,           // ATTIVO - feedback utente importante
  KEYBOARD_SHORTCUTS: true,      // ATTIVO - parte del core gameplay
};

/**
 * Hook per accedere ai feature flags in modo type-safe
 */
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return FEATURE_FLAGS[flag];
};

/**
 * Utility per verificare se una funzionalità è abilitata
 */
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return FEATURE_FLAGS[flag];
};

/**
 * Utility per verificare se il sistema è in modalità stabilizzazione
 */
export const isStabilizationMode = (): boolean => {
  return !FEATURE_FLAGS.CRAFTING_ADVANCED && 
         !FEATURE_FLAGS.EVENT_COMPLEX && 
         !FEATURE_FLAGS.DEBUG_TOOLS;
};

/**
 * Configurazioni per fasi successive
 */
export const PHASE_CONFIGS = {
  // Fase 1: Solo core essenziale
  PHASE_1_CORE_ONLY: {
    ...FEATURE_FLAGS,
    CRAFTING_SYSTEM: true,  // Riattivato per test
    EVENT_SYSTEM: true,     // Già funzionante
    COMBAT_SYSTEM: true,    // Minimo necessario
  },

  // Fase 2: Aggiunta funzionalità base
  PHASE_2_BASIC_FEATURES: {
    ...FEATURE_FLAGS,
    CRAFTING_SYSTEM: true,
    EVENT_SYSTEM: true,
    WEATHER_SYSTEM: true,
  },

  // Fase 3: Funzionalità complete
  PHASE_3_FULL_FEATURES: {
    ...FEATURE_FLAGS,
    CRAFTING_ADVANCED: true,
    COMBAT_ADVANCED: true,
    EVENT_COMPLEX: true,
    NARRATIVE_ADVANCED: true,
  },
};

/**
 * Utility per cambiare fase durante lo sviluppo
 */
export const setPhase = (phase: keyof typeof PHASE_CONFIGS) => {
  Object.assign(FEATURE_FLAGS, PHASE_CONFIGS[phase]);
};

/**
 * Log delle feature flags per debugging
 */
export const logFeatureFlags = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚩 Feature Flags Status');
    Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
      console.log(`${key}: ${value ? '✅' : '❌'}`);
    });
    console.groupEnd();
  }
};