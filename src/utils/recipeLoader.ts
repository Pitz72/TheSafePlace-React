/**
 * recipeLoader.ts
 * 
 * Utility per caricamento, validazione e gestione del database ricette.
 * Gestisce il caricamento asincrono e la cache delle ricette.
 */

import type { Recipe, RecipeComponent } from '../types/crafting';
import { isValidRecipe, isValidRecipeComponent } from '../types/crafting';
import { VALIDATION_RULES } from '../config/craftingConfig';
import { debugLog } from './craftingUtils';

// ===== TYPES =====

/**
 * Struttura del file JSON delle ricette
 */
interface RecipeDatabase {
  recipes: Recipe[];
  version?: string;
  lastUpdated?: string;
}

/**
 * Risultato del caricamento ricette
 */
interface RecipeLoadResult {
  success: boolean;
  recipes: Recipe[];
  errors: string[];
  warnings: string[];
}

/**
 * Cache delle ricette caricate
 */
interface RecipeCache {
  recipes: Recipe[];
  loadTime: number;
  version: string;
}

// ===== CACHE MANAGEMENT =====

let recipeCache: RecipeCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

/**
 * Verifica se la cache è ancora valida
 */
function isCacheValid(): boolean {
  if (!recipeCache) return false;
  
  const now = Date.now();
  const cacheAge = now - recipeCache.loadTime;
  
  return cacheAge < CACHE_DURATION;
}

/**
 * Invalida la cache delle ricette
 */
export function invalidateRecipeCache(): void {
  recipeCache = null;
  debugLog('Recipe cache invalidated');
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Valida un singolo componente ricetta
 */
function validateRecipeComponent(
  component: any, 
  recipeId: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isValidRecipeComponent(component)) {
    errors.push(`Recipe ${recipeId}: Invalid component structure`);
    return { valid: false, errors };
  }

  // Valida quantità
  if (component.quantity < VALIDATION_RULES.MIN_COMPONENT_QUANTITY) {
    errors.push(`Recipe ${recipeId}: Component quantity too low (${component.quantity})`);
  }

  if (component.quantity > VALIDATION_RULES.MAX_COMPONENT_QUANTITY) {
    errors.push(`Recipe ${recipeId}: Component quantity too high (${component.quantity})`);
  }

  // Valida ID oggetto
  if (!component.itemId || component.itemId.trim().length === 0) {
    errors.push(`Recipe ${recipeId}: Component missing itemId`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valida una singola ricetta
 */
function validateRecipe(recipe: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validazione struttura base
  if (!isValidRecipe(recipe)) {
    errors.push(`Recipe ${recipe?.id || 'unknown'}: Invalid recipe structure`);
    return { valid: false, errors, warnings };
  }

  const recipeId = recipe.id;

  // Valida ID ricetta
  if (recipeId.length < VALIDATION_RULES.MIN_RECIPE_ID_LENGTH) {
    errors.push(`Recipe ${recipeId}: ID too short`);
  }

  if (recipeId.length > VALIDATION_RULES.MAX_RECIPE_ID_LENGTH) {
    errors.push(`Recipe ${recipeId}: ID too long`);
  }

  // Valida quantità risultato
  if (recipe.resultQuantity < VALIDATION_RULES.MIN_RESULT_QUANTITY) {
    errors.push(`Recipe ${recipeId}: Result quantity too low`);
  }

  if (recipe.resultQuantity > VALIDATION_RULES.MAX_RESULT_QUANTITY) {
    errors.push(`Recipe ${recipeId}: Result quantity too high`);
  }

  // Valida componenti
  if (!Array.isArray(recipe.components) || recipe.components.length === 0) {
    errors.push(`Recipe ${recipeId}: No components defined`);
  } else {
    // Valida ogni componente
    recipe.components.forEach((component: any) => {
      const componentValidation = validateRecipeComponent(component, recipeId);
      errors.push(...componentValidation.errors);
    });

    // Verifica duplicati
    const componentIds = recipe.components.map((c: RecipeComponent) => c.itemId);
    const uniqueIds = new Set(componentIds);
    if (componentIds.length !== uniqueIds.size) {
      warnings.push(`Recipe ${recipeId}: Duplicate components detected`);
    }
  }

  // Valida requisiti abilità
  if (recipe.skillRequirement) {
    const { skill, level } = recipe.skillRequirement;
    
    if (!skill || skill.trim().length === 0) {
      errors.push(`Recipe ${recipeId}: Skill requirement missing skill name`);
    }

    if (level < VALIDATION_RULES.MIN_SKILL_REQUIREMENT) {
      errors.push(`Recipe ${recipeId}: Skill level too low`);
    }

    if (level > VALIDATION_RULES.MAX_SKILL_REQUIREMENT) {
      errors.push(`Recipe ${recipeId}: Skill level too high`);
    }
  }

  // Valida sblocco
  if (recipe.unlockedByLevel !== undefined) {
    if (recipe.unlockedByLevel < 1 || recipe.unlockedByLevel > 20) {
      warnings.push(`Recipe ${recipeId}: Unusual unlock level (${recipe.unlockedByLevel})`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Valida l'intero database ricette
 */
function validateRecipeDatabase(data: any): RecipeLoadResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validRecipes: Recipe[] = [];

  // Verifica struttura base
  if (!data || typeof data !== 'object') {
    errors.push('Invalid recipe database: not an object');
    return { success: false, recipes: [], errors, warnings };
  }

  if (!Array.isArray(data.recipes)) {
    errors.push('Invalid recipe database: recipes is not an array');
    return { success: false, recipes: [], errors, warnings };
  }

  // Valida ogni ricetta
  const recipeIds = new Set<string>();
  
  data.recipes.forEach((recipe: any) => {
    const validation = validateRecipe(recipe);
    
    if (validation.valid) {
      // Verifica ID duplicati
      if (recipeIds.has(recipe.id)) {
        errors.push(`Duplicate recipe ID: ${recipe.id}`);
      } else {
        recipeIds.add(recipe.id);
        validRecipes.push(recipe as Recipe);
      }
    }
    
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);
  });

  const success = errors.length === 0;
  
  debugLog(`Recipe validation completed: ${validRecipes.length} valid recipes, ${errors.length} errors, ${warnings.length} warnings`);

  return {
    success,
    recipes: validRecipes,
    errors,
    warnings
  };
}

// ===== LOADING FUNCTIONS =====

/**
 * Carica le ricette dal file JSON
 */
export async function loadRecipes(): Promise<RecipeLoadResult> {
  // Controlla cache
  if (isCacheValid() && recipeCache) {
    debugLog('Returning recipes from cache');
    return {
      success: true,
      recipes: [...recipeCache.recipes],
      errors: [],
      warnings: []
    };
  }

  try {
    debugLog('Loading recipes from file');
    
    // Carica il file JSON
    const response = await fetch('/recipes.json');
    debugLog(`[RECIPE LOADER DEBUG] Fetch response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load recipes: ${response.status} ${response.statusText}`);
    }

    const data: RecipeDatabase = await response.json();
    debugLog(`[RECIPE LOADER DEBUG] Raw data loaded, recipes count: ${data.recipes?.length || 0}`);
    debugLog(`[RECIPE LOADER DEBUG] First recipe ID: ${data.recipes?.[0]?.id || 'none'}`);
    
    // Valida i dati
    const result = validateRecipeDatabase(data);
    debugLog(`[RECIPE LOADER DEBUG] Validation result: success=${result.success}, recipes=${result.recipes?.length || 0}`);
    
    if (result.success) {
      // Aggiorna cache
      recipeCache = {
        recipes: result.recipes,
        loadTime: Date.now(),
        version: data.version || '1.0.0'
      };
      
      debugLog(`Successfully loaded ${result.recipes.length} recipes`);
    }

    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    debugLog(`Failed to load recipes: ${errorMessage}`);
    
    return {
      success: false,
      recipes: [],
      errors: [`Failed to load recipe database: ${errorMessage}`],
      warnings: []
    };
  }
}

/**
 * Ricarica forzatamente le ricette (ignora cache)
 */
export async function reloadRecipes(): Promise<RecipeLoadResult> {
  invalidateRecipeCache();
  return loadRecipes();
}

// ===== FILTERING FUNCTIONS =====

/**
 * Filtra ricette per categoria
 */
export function filterRecipesByCategory(recipes: Recipe[], category: string): Recipe[] {
  return recipes.filter(recipe => recipe.category === category);
}

/**
 * Filtra ricette per livello di sblocco
 */
export function filterRecipesByLevel(recipes: Recipe[], maxLevel: number): Recipe[] {
  return recipes.filter(recipe => 
    !recipe.unlockedByLevel || recipe.unlockedByLevel <= maxLevel
  );
}

/**
 * Filtra ricette per manuale
 */
export function filterRecipesByManual(recipes: Recipe[], manualId: string): Recipe[] {
  return recipes.filter(recipe => recipe.unlockedByManual === manualId);
}

/**
 * Cerca ricette per nome o descrizione
 */
export function searchRecipes(
  recipes: Recipe[], 
  query: string, 
  itemDatabase: Record<string, any>
): Recipe[] {
  const lowerQuery = query.toLowerCase();
  
  return recipes.filter(recipe => {
    // Cerca nell'ID ricetta
    if (recipe.id.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Cerca nella descrizione
    if (recipe.description?.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Cerca nel nome dell'oggetto risultante
    const resultItem = itemDatabase[recipe.resultItemId];
    if (resultItem?.name?.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    return false;
  });
}

/**
 * Filtra ricette per disponibilità materiali
 */
export function filterRecipesByAvailability(
  recipes: Recipe[],
  inventory: Array<{ itemId: string; quantity: number }>,
  availableOnly: boolean = true
): Recipe[] {
  return recipes.filter(recipe => {
    const hasAllMaterials = recipe.components.every(component => {
      const inventoryItem = inventory.find(item => item.itemId === component.itemId);
      return inventoryItem && inventoryItem.quantity >= component.quantity;
    });
    
    return availableOnly ? hasAllMaterials : !hasAllMaterials;
  });
}

/**
 * Filtra ricette per materiale specifico
 */
export function filterRecipesByMaterial(
  recipes: Recipe[],
  materialId: string
): Recipe[] {
  return recipes.filter(recipe => 
    recipe.components.some(component => component.itemId === materialId)
  );
}

/**
 * Filtra ricette per requisiti abilità soddisfatti
 */
export function filterRecipesBySkillRequirement(
  recipes: Recipe[],
  characterStats: Record<string, number>
): Recipe[] {
  return recipes.filter(recipe => {
    if (!recipe.skillRequirement) {
      return true; // Nessun requisito = sempre disponibile
    }
    
    const { skill, level } = recipe.skillRequirement;
    
    // Mappa le abilità alle statistiche del personaggio
    const skillMapping: Record<string, string> = {
      'crafting': 'adattamento',
      'smithing': 'potenza',
      'alchemy': 'percezione',
      'cooking': 'adattamento',
      'engineering': 'percezione',
      'tailoring': 'percezione'
    };
    
    const statName = skillMapping[skill.toLowerCase()];
    if (!statName || !characterStats[statName]) {
      return false;
    }
    
    return characterStats[statName] >= level;
  });
}

/**
 * Raggruppa ricette per disponibilità e craftabilità
 */
export function groupRecipesByStatus(
  recipes: Recipe[],
  inventory: Array<{ itemId: string; quantity: number }>,
  characterStats: Record<string, number>
): {
  craftable: Recipe[];
  missingMaterials: Recipe[];
  missingSkills: Recipe[];
  unavailable: Recipe[];
} {
  const result = {
    craftable: [] as Recipe[],
    missingMaterials: [] as Recipe[],
    missingSkills: [] as Recipe[],
    unavailable: [] as Recipe[]
  };
  
  recipes.forEach(recipe => {
    // Verifica materiali
    const hasAllMaterials = recipe.components.every(component => {
      const inventoryItem = inventory.find(item => item.itemId === component.itemId);
      return inventoryItem && inventoryItem.quantity >= component.quantity;
    });
    
    // Verifica abilità
    let hasRequiredSkill = true;
    if (recipe.skillRequirement) {
      const { skill, level } = recipe.skillRequirement;
      const skillMapping: Record<string, string> = {
        'crafting': 'adattamento',
        'smithing': 'potenza',
        'alchemy': 'percezione',
        'cooking': 'adattamento',
        'engineering': 'percezione',
        'tailoring': 'percezione'
      };
      
      const statName = skillMapping[skill.toLowerCase()];
      if (!statName || !characterStats[statName] || characterStats[statName] < level) {
        hasRequiredSkill = false;
      }
    }
    
    // Classifica ricetta
    if (hasAllMaterials && hasRequiredSkill) {
      result.craftable.push(recipe);
    } else if (!hasAllMaterials && hasRequiredSkill) {
      result.missingMaterials.push(recipe);
    } else if (hasAllMaterials && !hasRequiredSkill) {
      result.missingSkills.push(recipe);
    } else {
      result.unavailable.push(recipe);
    }
  });
  
  return result;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Ottiene una ricetta per ID
 */
export function getRecipeById(recipes: Recipe[], recipeId: string): Recipe | null {
  return recipes.find(recipe => recipe.id === recipeId) || null;
}

/**
 * Ottiene statistiche del database ricette
 */
export function getRecipeStats(recipes: Recipe[]): Record<string, any> {
  const stats = {
    totalRecipes: recipes.length,
    byCategory: {} as Record<string, number>,
    withSkillRequirements: 0,
    unlockedByLevel: 0,
    unlockedByManual: 0,
    averageComponents: 0,
    maxComponents: 0,
    minComponents: Infinity
  };

  recipes.forEach(recipe => {
    // Categoria
    const category = recipe.category || 'misc';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    
    // Requisiti abilità
    if (recipe.skillRequirement) {
      stats.withSkillRequirements++;
    }
    
    // Sblocco
    if (recipe.unlockedByLevel) {
      stats.unlockedByLevel++;
    }
    
    if (recipe.unlockedByManual) {
      stats.unlockedByManual++;
    }
    
    // Componenti
    const componentCount = recipe.components.length;
    stats.maxComponents = Math.max(stats.maxComponents, componentCount);
    stats.minComponents = Math.min(stats.minComponents, componentCount);
  });

  // Calcola media componenti
  const totalComponents = recipes.reduce((sum, recipe) => sum + recipe.components.length, 0);
  stats.averageComponents = recipes.length > 0 ? totalComponents / recipes.length : 0;
  
  if (stats.minComponents === Infinity) {
    stats.minComponents = 0;
  }

  return stats;
}

/**
 * Esporta ricette in formato JSON (per debug/backup)
 */
export function exportRecipes(recipes: Recipe[]): string {
  const exportData: RecipeDatabase = {
    recipes,
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
}