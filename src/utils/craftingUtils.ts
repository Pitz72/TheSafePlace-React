/**
 * craftingUtils.ts
 * 
 * Utility functions per il sistema di crafting di The Safe Place.
 * Include validazioni, calcoli e helper functions.
 */

import type { 
  Recipe, 
  RecipeComponent, 
  MaterialStatus, 
  CraftingResult,
  CraftingConfig,
  SkillRequirement
} from '../types/crafting';
import { CRAFTING_ERRORS, DEFAULT_CRAFTING_CONFIG } from '../types/crafting';
import type { IInventorySlot } from '../interfaces/items';
import type { ICharacterSheet } from '../rules/types';
import { createLogger } from '../services/loggerService';

// ===== CONFIGURATION =====

// Create logger instance for crafting operations
const logger = createLogger('CRAFTING');

let craftingConfig: CraftingConfig = { ...DEFAULT_CRAFTING_CONFIG };

/**
 * Aggiorna la configurazione del crafting
 */
export function setCraftingConfig(config: Partial<CraftingConfig>): void {
  craftingConfig = { ...craftingConfig, ...config };
}

/**
 * Ottiene la configurazione corrente del crafting
 */
export function getCraftingConfig(): CraftingConfig {
  return { ...craftingConfig };
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Verifica se il giocatore ha abbastanza materiali per una ricetta
 */
export function hasRequiredMaterials(
  recipe: Recipe, 
  inventory: IInventorySlot[]
): boolean {
  return recipe.components.every(component => {
    const ownedQuantity = getOwnedQuantity(component.itemId, inventory);
    return ownedQuantity >= component.quantity;
  });
}

/**
 * Verifica se il giocatore soddisfa i requisiti di abilità
 */
export function meetsSkillRequirement(
  recipe: Recipe,
  characterSheet: ICharacterSheet
): boolean {
  if (!recipe.skillRequirement) {
    return true; // Nessun requisito = sempre soddisfatto
  }

  const { skill, level } = recipe.skillRequirement;
  const playerSkillLevel = getPlayerSkillLevel(skill, characterSheet);
  
  return playerSkillLevel >= level;
}

/**
 * Verifica se una ricetta può essere craftata
 */
export function canCraftRecipe(
  recipe: Recipe,
  inventory: IInventorySlot[],
  characterSheet: ICharacterSheet
): boolean {
  return hasRequiredMaterials(recipe, inventory) && 
         meetsSkillRequirement(recipe, characterSheet);
}

/**
 * Verifica se il giocatore conosce una ricetta
 */
export function knowsRecipe(recipeId: string, knownRecipeIds: string[]): boolean {
  return knownRecipeIds.includes(recipeId);
}

// ===== MATERIAL STATUS FUNCTIONS =====

/**
 * Calcola lo stato dei materiali per una ricetta
 */
export function getMaterialStatus(
  recipe: Recipe,
  inventory: IInventorySlot[],
  itemDatabase: Record<string, any>
): MaterialStatus[] {
  return recipe.components.map(component => {
    const owned = getOwnedQuantity(component.itemId, inventory);
    const item = itemDatabase[component.itemId];
    
    return {
      itemId: component.itemId,
      itemName: item?.name || 'Oggetto Sconosciuto',
      owned,
      required: component.quantity,
      sufficient: owned >= component.quantity
    };
  });
}

/**
 * Ottiene la quantità posseduta di un oggetto
 */
export function getOwnedQuantity(itemId: string, inventory: IInventorySlot[]): number {
  const item = inventory.find(slot => slot?.itemId === itemId);
  return item?.quantity || 0;
}

// ===== CRAFTING CALCULATION FUNCTIONS =====

/**
 * Calcola l'XP guadagnato per una ricetta
 */
export function calculateCraftingXP(recipe: Recipe): number {
  let baseXP = craftingConfig.baseXpPerCraft;
  
  // Bonus per complessità (numero di componenti)
  const complexityBonus = Math.floor(recipe.components.length * craftingConfig.complexityXpMultiplier);
  
  // Bonus per requisiti di abilità
  const skillBonus = recipe.skillRequirement ? 5 : 0;
  
  // Bonus per quantità prodotta
  const quantityBonus = Math.floor(recipe.resultQuantity * 0.5);
  
  return baseXP + complexityBonus + skillBonus + quantityBonus;
}

/**
 * Calcola il tempo stimato per il crafting (per future animazioni)
 */
export function calculateCraftingTime(recipe: Recipe): number {
  const baseTime = craftingConfig.minAnimationTime;
  const complexityTime = recipe.components.length * 100;
  
  return Math.max(baseTime, complexityTime);
}

// ===== RECIPE FILTERING FUNCTIONS =====

/**
 * Filtra le ricette disponibili per il giocatore
 */
export function getAvailableRecipes(
  allRecipes: Recipe[],
  knownRecipeIds: string[]
): Recipe[] {
  return allRecipes.filter(recipe => knowsRecipe(recipe.id, knownRecipeIds));
}

/**
 * Filtra le ricette per disponibilità materiali
 */
export function getRecipesWithMaterials(
  recipes: Recipe[],
  inventory: IInventorySlot[]
): { available: Recipe[]; unavailable: Recipe[] } {
  const available: Recipe[] = [];
  const unavailable: Recipe[] = [];
  
  recipes.forEach(recipe => {
    if (hasRequiredMaterials(recipe, inventory)) {
      available.push(recipe);
    } else {
      unavailable.push(recipe);
    }
  });
  
  return { available, unavailable };
}

/**
 * Ottiene ricette raggruppate per stato di disponibilità
 */
export function groupRecipesByAvailability(
  recipes: Recipe[],
  inventory: IInventorySlot[],
  characterSheet: ICharacterSheet
): {
  craftable: Recipe[];
  missingMaterials: Recipe[];
  missingSkills: Recipe[];
  unavailable: Recipe[];
} {
  const craftable: Recipe[] = [];
  const missingMaterials: Recipe[] = [];
  const missingSkills: Recipe[] = [];
  const unavailable: Recipe[] = [];
  
  recipes.forEach(recipe => {
    const hasMaterials = hasRequiredMaterials(recipe, inventory);
    const hasSkills = meetsSkillRequirement(recipe, characterSheet);
    
    if (hasMaterials && hasSkills) {
      craftable.push(recipe);
    } else if (!hasMaterials && hasSkills) {
      missingMaterials.push(recipe);
    } else if (hasMaterials && !hasSkills) {
      missingSkills.push(recipe);
    } else {
      unavailable.push(recipe);
    }
  });
  
  return { craftable, missingMaterials, missingSkills, unavailable };
}

/**
 * Filtra le ricette craftabili
 */
export function getCraftableRecipes(
  recipes: Recipe[],
  inventory: IInventorySlot[],
  characterSheet: ICharacterSheet
): Recipe[] {
  return recipes.filter(recipe => canCraftRecipe(recipe, inventory, characterSheet));
}

/**
 * Ordina le ricette per disponibilità (craftabili prima)
 */
export function sortRecipesByAvailability(
  recipes: Recipe[],
  inventory: IInventorySlot[],
  characterSheet: ICharacterSheet
): Recipe[] {
  return [...recipes].sort((a, b) => {
    const aCanCraft = canCraftRecipe(a, inventory, characterSheet);
    const bCanCraft = canCraftRecipe(b, inventory, characterSheet);
    
    if (aCanCraft && !bCanCraft) return -1;
    if (!aCanCraft && bCanCraft) return 1;
    return 0;
  });
}

// ===== RECIPE UNLOCKING FUNCTIONS =====

/**
 * Ottiene le ricette che dovrebbero essere sbloccate per un livello
 */
export function getRecipesUnlockedByLevel(
  allRecipes: Recipe[],
  level: number
): Recipe[] {
  return allRecipes.filter(recipe => 
    recipe.unlockedByLevel !== undefined && 
    recipe.unlockedByLevel <= level
  );
}

/**
 * Ottiene le ricette sbloccate da un manuale
 */
export function getRecipesUnlockedByManual(
  allRecipes: Recipe[],
  manualId: string
): Recipe[] {
  return allRecipes.filter(recipe => recipe.unlockedByManual === manualId);
}

// ===== SKILL SYSTEM INTEGRATION =====

/**
 * Ottiene il livello di abilità del giocatore basato sulle statistiche del personaggio
 * Utilizza le statistiche base come proxy per le diverse abilità di crafting
 */
function getPlayerSkillLevel(skill: string, characterSheet: ICharacterSheet): number {
  // Per ora, usiamo le statistiche base come proxy per le abilità
  switch (skill.toLowerCase()) {
    case 'crafting':
    case 'artigianato':
      return Math.floor(characterSheet.stats.adattamento / 2); // Adattamento come base crafting
    case 'smithing':
    case 'forgia':
      return Math.floor(characterSheet.stats.potenza / 3); // Potenza per lavori di forgia
    case 'alchemy':
    case 'alchimia':
      return Math.floor(characterSheet.stats.percezione / 2); // Percezione per alchimia
    default:
      return 1; // Livello base per abilità sconosciute
  }
}

// ===== ERROR HANDLING =====

/**
 * Crea un risultato di crafting fallito
 */
export function createFailureResult(error: string): CraftingResult {
  return {
    success: false,
    error
  };
}

/**
 * Crea un risultato di crafting riuscito
 */
export function createSuccessResult(
  itemName: string,
  quantity: number,
  xpGained: number
): CraftingResult {
  return {
    success: true,
    itemCreated: itemName,
    quantityCreated: quantity,
    xpGained
  };
}

/**
 * Valida una ricetta prima del crafting
 */
export function validateCraftingAttempt(
  recipe: Recipe,
  inventory: IInventorySlot[],
  characterSheet: ICharacterSheet,
  knownRecipeIds: string[]
): string | null {
  // Verifica se la ricetta è conosciuta
  if (!knowsRecipe(recipe.id, knownRecipeIds)) {
    return CRAFTING_ERRORS.RECIPE_NOT_KNOWN;
  }

  // Verifica materiali
  if (!hasRequiredMaterials(recipe, inventory)) {
    return CRAFTING_ERRORS.INSUFFICIENT_MATERIALS;
  }

  // Verifica abilità
  if (!meetsSkillRequirement(recipe, characterSheet)) {
    return CRAFTING_ERRORS.INSUFFICIENT_SKILL;
  }

  return null; // Nessun errore
}

// ===== GAME STORE INTEGRATION =====

/**
 * Esegue il processo completo di crafting con integrazione game store
 */
export async function executeCrafting(
  recipe: Recipe,
  gameStore: any,
  knownRecipeIds: string[]
): Promise<CraftingResult> {
  const { characterSheet } = gameStore;
  
  if (!characterSheet) {
    return createFailureResult(CRAFTING_ERRORS.UNKNOWN_ERROR);
  }

  const inventory = characterSheet.inventory || [];
  
  // Validazione completa
  const validationError = validateCraftingAttempt(recipe, inventory, characterSheet, knownRecipeIds);
  if (validationError) {
    return createFailureResult(validationError);
  }

  try {
    // Rimuovi materiali dall'inventario
    for (const component of recipe.components) {
      let remainingToRemove = component.quantity;
      
      for (let i = 0; i < inventory.length && remainingToRemove > 0; i++) {
        const slot = inventory[i];
        if (slot && slot.itemId === component.itemId) {
          const toRemove = Math.min(slot.quantity, remainingToRemove);
          gameStore.removeItem(i, toRemove);
          remainingToRemove -= toRemove;
        }
      }
      
      if (remainingToRemove > 0) {
        throw new Error(`Insufficient materials: ${component.itemId}`);
      }
    }

    // Aggiungi oggetto risultante
    const addSuccess = gameStore.addItem(recipe.resultItemId, recipe.resultQuantity);
    if (!addSuccess) {
      throw new Error('Failed to add crafted item to inventory');
    }

    // Calcola e assegna XP
    const xpGained = calculateCraftingXP(recipe);
    gameStore.addExperience(xpGained);

    // Ottieni nome oggetto per il risultato
    const resultItem = gameStore.items[recipe.resultItemId];
    const itemName = resultItem?.name || 'Oggetto Sconosciuto';

    logger.info(`Crafting successful: ${itemName} x${recipe.resultQuantity}, XP gained: ${xpGained}`, {
      itemName,
      quantity: recipe.resultQuantity,
      xpGained,
      recipeId: recipe.id
    });

    return createSuccessResult(itemName, recipe.resultQuantity, xpGained);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown crafting error';
    logger.error(`Crafting failed: ${errorMessage}`, {
      errorMessage,
      recipeId: recipe.id,
      error: error instanceof Error ? error : undefined
    });

    if (errorMessage === 'Failed to add crafted item to inventory') {
      return createFailureResult(CRAFTING_ERRORS.INVENTORY_FULL);
    }

    return createFailureResult(CRAFTING_ERRORS.UNKNOWN_ERROR);
  }
}

/**
 * Verifica se l'inventario ha spazio per l'oggetto risultante
 */
export function hasInventorySpace(
  inventory: IInventorySlot[],
  resultItemId: string,
  resultQuantity: number,
  maxSlots: number = 20
): boolean {
  // Cerca slot esistenti con lo stesso oggetto (se impilabile)
  const existingSlot = inventory.find(slot => 
    slot && slot.itemId === resultItemId && slot.quantity < 99 // Assumiamo stack max 99
  );
  
  if (existingSlot) {
    const availableSpace = 99 - existingSlot.quantity;
    if (availableSpace >= resultQuantity) {
      return true;
    }
  }

  // Conta slot vuoti
  const emptySlots = inventory.filter(slot => !slot).length;
  const usedSlots = inventory.filter(slot => slot).length;
  const totalSlots = Math.max(maxSlots, usedSlots);
  
  return (totalSlots - usedSlots) > 0;
}

/**
 * Simula il crafting senza eseguirlo (per preview)
 */
export function simulateCrafting(
  recipe: Recipe,
  inventory: IInventorySlot[],
  characterSheet: ICharacterSheet,
  knownRecipeIds: string[]
): {
  canCraft: boolean;
  errors: string[];
  warnings: string[];
  xpGain: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validazione ricetta conosciuta
  if (!knowsRecipe(recipe.id, knownRecipeIds)) {
    errors.push(CRAFTING_ERRORS.RECIPE_NOT_KNOWN);
  }

  // Validazione materiali
  if (!hasRequiredMaterials(recipe, inventory)) {
    errors.push(CRAFTING_ERRORS.INSUFFICIENT_MATERIALS);
  }

  // Validazione abilità
  if (!meetsSkillRequirement(recipe, characterSheet)) {
    errors.push(CRAFTING_ERRORS.INSUFFICIENT_SKILL);
  }

  // Validazione spazio inventario
  if (!hasInventorySpace(inventory, recipe.resultItemId, recipe.resultQuantity)) {
    errors.push(CRAFTING_ERRORS.INVENTORY_FULL);
  }

  // Avvisi per materiali scarsi
  recipe.components.forEach(component => {
    const owned = getOwnedQuantity(component.itemId, inventory);
    if (owned === component.quantity) {
      warnings.push(`Ultimo ${component.itemId} disponibile`);
    }
  });

  const xpGain = calculateCraftingXP(recipe);
  const canCraft = errors.length === 0;

  return { canCraft, errors, warnings, xpGain };
}

// ===== DEBUG UTILITIES =====

/**
 * Funzione di debug per il logging del crafting
 */
export function debugLog(message: string, data?: any): void {
  if (craftingConfig.enableDebugLogging) {
    logger.debug(message, data);
  }
}

/**
 * Ottiene informazioni di debug per una ricetta
 */
export function getRecipeDebugInfo(
  recipe: Recipe,
  inventory: IInventorySlot[],
  characterSheet: ICharacterSheet
): Record<string, any> {
  const debugInfo = {
    recipeId: recipe.id,
    canCraft: canCraftRecipe(recipe, inventory, characterSheet),
    hasMaterials: hasRequiredMaterials(recipe, inventory),
    meetsSkills: meetsSkillRequirement(recipe, characterSheet),
    materialStatus: getMaterialStatus(recipe, inventory, {}),
    estimatedXP: calculateCraftingXP(recipe),
    estimatedTime: calculateCraftingTime(recipe)
  };

  debugLog('Recipe debug info generated', debugInfo);
  return debugInfo;
}