/**
 * index.ts
 * 
 * Barrel export per tutti i componenti del sistema di crafting.
 * Facilita l'importazione dei componenti da altre parti dell'applicazione.
 */

// ===== COMPONENTI PRINCIPALI =====

export { default as CraftingScreen, CraftingScreenContainer } from './CraftingScreen';
export { default as RecipeList, RecipeListContainer } from './RecipeList';
export { default as RecipeDetails, RecipeDetailsContainer } from './RecipeDetails';
export { default as ItemPreview, ItemPreviewContainer } from './ItemPreview';
export { default as CraftingActionBar, CraftingActionBarContainer } from './CraftingActionBar';

// ===== TIPI E INTERFACCE =====
export type {
  Recipe,
  RecipeComponent,
  MaterialStatus,
  CraftingState,
  CraftingResult,
  CraftingConfig,
  SkillRequirement,
  CraftingScreenProps,
  RecipeListProps,
  RecipeDetailsProps,
  ItemPreviewProps,
  CraftingActionBarProps
} from '../../types/crafting';

// ===== COSTANTI =====
export {
  CRAFTING_ERRORS,
  RECIPE_CATEGORIES,
  DEFAULT_CRAFTING_CONFIG
} from '../../types/crafting';

// ===== UTILITY FUNCTIONS =====
export {
  hasRequiredMaterials,
  meetsSkillRequirement,
  canCraftRecipe,
  knowsRecipe,
  getMaterialStatus,
  getOwnedQuantity,
  calculateCraftingXP,
  calculateCraftingTime,
  getAvailableRecipes,
  getCraftableRecipes,
  sortRecipesByAvailability,
  getRecipesWithMaterials,
  groupRecipesByAvailability,
  getRecipesUnlockedByLevel,
  getRecipesUnlockedByManual,
  createFailureResult,
  createSuccessResult,
  validateCraftingAttempt,
  debugLog,
  getRecipeDebugInfo
} from '../../utils/craftingUtils';

// ===== RECIPE LOADER FUNCTIONS =====
export {
  loadRecipes,
  reloadRecipes,
  invalidateRecipeCache,
  filterRecipesByCategory,
  filterRecipesByLevel,
  filterRecipesByManual,
  searchRecipes,
  getRecipeById,
  getRecipeStats,
  exportRecipes
} from '../../utils/recipeLoader';

// ===== CONFIGURAZIONI =====
export {
  CRAFTING_CONFIG,
  UI_CONFIG,
  GAMEPLAY_CONFIG,
  UI_MESSAGES,
  RECIPE_CATEGORIES as RECIPE_CATEGORY_DEFINITIONS,
  SKILL_MAPPINGS,
  ANIMATION_CONFIG,
  KEYBOARD_CONFIG,
  VALIDATION_RULES,
  COMPLETE_CRAFTING_CONFIG,
  getMessage,
  getUIConfig,
  isKeyMappedTo
} from '../../config/craftingConfig';

// ===== PLACEHOLDER PER STORE =====
// Questo sarà implementato nella prossima task
// export { useCraftingStore } from '../../stores/craftingStore';

// ===== VERSIONE E METADATA =====
export const CRAFTING_SYSTEM_VERSION = '1.0.0';
export const CRAFTING_SYSTEM_NAME = 'The Safe Place Crafting System';

/**
 * Informazioni sul sistema di crafting
 */
export const CRAFTING_SYSTEM_INFO = {
  version: CRAFTING_SYSTEM_VERSION,
  name: CRAFTING_SYSTEM_NAME,
  description: 'Sistema di crafting completo per The Safe Place',
  author: 'The Safe Place Development Team',
  features: [
    'Ricette dinamiche con requisiti materiali e abilità',
    'Sistema di sblocco progressivo',
    'Interfaccia completamente navigabile da tastiera',
    'Integrazione completa con sistemi esistenti',
    'Supporto per diverse categorie di oggetti',
    'Sistema di validazione robusto',
    'Configurazione flessibile e estendibile'
  ]
} as const;