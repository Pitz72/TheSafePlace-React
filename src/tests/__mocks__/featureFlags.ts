/**
 * Mock di featureFlags per Jest
 * Evita problemi con import.meta.env
 */

export interface FeatureFlags {
  // Core Systems
  BOOT_SEQUENCE: boolean;
  MENU_SYSTEM: boolean;
  CHARACTER_CREATION: boolean;
  GAME_SCREEN: boolean;
  SAVE_LOAD_SYSTEM: boolean;
  INVENTORY_BASIC: boolean;
  SURVIVAL_SYSTEM: boolean;
  CRAFTING_SYSTEM: boolean;
  CRAFTING_ADVANCED: boolean;
  COMBAT_SYSTEM: boolean;
  COMBAT_ADVANCED: boolean;
  EVENT_SYSTEM: boolean;
  EVENT_COMPLEX: boolean;
  WEATHER_SYSTEM: boolean;
  NARRATIVE_SYSTEM: boolean;
  NARRATIVE_ADVANCED: boolean;
  DEBUG_TOOLS: boolean;
  ACCESSIBILITY_ADVANCED: boolean;
  PERFORMANCE_MONITORING: boolean;
  ANALYTICS: boolean;
  EXPERIMENTAL_FEATURES: boolean;
  ERROR_BOUNDARIES: boolean;
  LOADING_STATES: boolean;
  NOTIFICATIONS: boolean;
  KEYBOARD_SHORTCUTS: boolean;
  DEBUG_LOGGING_ENABLED: boolean;
  CRAFTING_DEBUG_LOGS: boolean;
  NARRATIVE_DEBUG_LOGS: boolean;
  WORLD_DEBUG_LOGS: boolean;
  EVENT_DEBUG_LOGS: boolean;
  PERFORMANCE_DEBUG_LOGS: boolean;
}

// Mock feature flags for testing - all core systems enabled
export const FEATURE_FLAGS: FeatureFlags = {
  BOOT_SEQUENCE: true,
  MENU_SYSTEM: true,
  CHARACTER_CREATION: true,
  GAME_SCREEN: true,
  SAVE_LOAD_SYSTEM: true,
  INVENTORY_BASIC: true,
  SURVIVAL_SYSTEM: true,
  CRAFTING_SYSTEM: true,
  CRAFTING_ADVANCED: false,
  COMBAT_SYSTEM: true,
  COMBAT_ADVANCED: false,
  EVENT_SYSTEM: true,
  EVENT_COMPLEX: false,
  WEATHER_SYSTEM: true,
  NARRATIVE_SYSTEM: true,
  NARRATIVE_ADVANCED: false,
  DEBUG_TOOLS: false,
  ACCESSIBILITY_ADVANCED: false,
  PERFORMANCE_MONITORING: false,
  ANALYTICS: false,
  EXPERIMENTAL_FEATURES: false,
  ERROR_BOUNDARIES: true,
  LOADING_STATES: true,
  NOTIFICATIONS: true,
  KEYBOARD_SHORTCUTS: true,
  DEBUG_LOGGING_ENABLED: false,
  CRAFTING_DEBUG_LOGS: false,
  NARRATIVE_DEBUG_LOGS: false,
  WORLD_DEBUG_LOGS: false,
  EVENT_DEBUG_LOGS: false,
  PERFORMANCE_DEBUG_LOGS: false,
};

export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return FEATURE_FLAGS[feature] === true;
};

export const logFeatureFlags = (): void => {
  // No-op in tests
};

export const isDebugLoggingEnabled = (category?: string): boolean => {
  return false; // Disabled in tests
};