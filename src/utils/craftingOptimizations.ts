/**
 * craftingOptimizations.ts
 * 
 * Ottimizzazioni performance per il sistema di crafting
 */

import { useMemo } from 'react';
import type { Recipe } from '../types/crafting';

/**
 * Hook per memoizzare le ricette disponibili
 */
export const useMemoizedAvailableRecipes = (
  allRecipes: Recipe[],
  knownRecipeIds: string[]
): Recipe[] => {
  return useMemo(() => {
    return allRecipes.filter(recipe => 
      knownRecipeIds.includes(recipe.id)
    );
  }, [allRecipes, knownRecipeIds]);
};

/**
 * Pulisce tutte le cache
 */
export const clearAllCaches = (): void => {
  // Implementazione placeholder
};

/**
 * Ottiene statistiche delle cache
 */
export const getCacheStats = () => {
  return {
    recipe: { size: 0, hitRate: 0 },
    material: { size: 0, hitRate: 0 },
    craftability: { size: 0, hitRate: 0 }
  };
};