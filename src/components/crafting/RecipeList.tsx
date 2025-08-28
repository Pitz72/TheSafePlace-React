/**
 * RecipeList.tsx
 * 
 * Componente per la visualizzazione e navigazione della lista ricette.
 * Gestisce la selezione con tastiera e gli indicatori di disponibilità.
 */

import React, { useEffect, useCallback } from 'react';
import type { RecipeListProps } from '../../types/crafting';
import { useCraftingStore } from '../../stores/craftingStore';
import { useGameStore } from '../../stores/gameStore';
import { UI_CONFIG, KEYBOARD_CONFIG, UI_MESSAGES } from '../../config/craftingConfig';
import { canCraftRecipe } from '../../utils/craftingUtils';

/**
 * Componente RecipeList
 */
export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  selectedIndex,
  onSelectionChange
}) => {
  const gameStore = useGameStore();
  // const { knownRecipeIds } = useCraftingStore();

  // ===== KEYBOARD NAVIGATION =====

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Solo se questo componente è attivo
    if (!recipes.length) return;

    if (KEYBOARD_CONFIG.MOVE_UP.includes(event.key as any)) {
      event.preventDefault();
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : recipes.length - 1;
      onSelectionChange(newIndex);
    } else if (KEYBOARD_CONFIG.MOVE_DOWN.includes(event.key as any)) {
      event.preventDefault();
      const newIndex = selectedIndex < recipes.length - 1 ? selectedIndex + 1 : 0;
      onSelectionChange(newIndex);
    }
  }, [recipes.length, selectedIndex, onSelectionChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // ===== RECIPE STATUS HELPERS =====

  /**
   * Determina se una ricetta è craftabile
   */
  const isRecipeCraftable = useCallback((recipeId: string): boolean => {
    if (!gameStore.characterSheet) return false;
    
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return false;

    const inventory = gameStore.characterSheet.inventory || [];
    return canCraftRecipe(recipe, inventory, gameStore.characterSheet);
  }, [recipes, gameStore.characterSheet]);

  /**
   * Ottiene la classe CSS per lo stato della ricetta
   */
  const getRecipeStatusClass = useCallback((recipeId: string, index: number): string => {
    const baseClasses = 'recipe-item px-3 py-2 cursor-pointer transition-colors duration-150';
    
    // Classe per selezione
    const selectedClass = index === selectedIndex ? 'bg-phosphor-900 border-l-4 border-phosphor-400' : 'hover:bg-gray-800';
    
    // Classe per disponibilità
    const availabilityClass = isRecipeCraftable(recipeId) 
      ? UI_CONFIG.AVAILABLE_COLOR 
      : UI_CONFIG.UNAVAILABLE_COLOR;

    return `${baseClasses} ${selectedClass} ${availabilityClass}`;
  }, [selectedIndex, isRecipeCraftable]);

  /**
   * Ottiene il testo dello stato della ricetta
   */
  const getRecipeStatusText = useCallback((recipeId: string): string => {
    return isRecipeCraftable(recipeId) 
      ? UI_MESSAGES.AVAILABLE 
      : UI_MESSAGES.UNAVAILABLE;
  }, [isRecipeCraftable]);

  /**
   * Ottiene il nome dell'oggetto risultante
   */
  const getResultItemName = useCallback((resultItemId: string): string => {
    const item = gameStore.items[resultItemId];
    return item?.name || 'Oggetto Sconosciuto';
  }, [gameStore.items]);

  // ===== RENDER HELPERS =====

  /**
   * Renderizza una singola ricetta nella lista
   */
  const renderRecipeItem = useCallback((recipe: any, index: number) => {
    const resultItemName = getResultItemName(recipe.resultItemId);
    const statusText = getRecipeStatusText(recipe.id);
    const statusClass = getRecipeStatusClass(recipe.id, index);

    return (
      <div
        key={recipe.id}
        className={statusClass}
        onClick={() => onSelectionChange(index)}
        role="option"
        aria-selected={index === selectedIndex}
        tabIndex={index === selectedIndex ? 0 : -1}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {resultItemName}
              {recipe.resultQuantity > 1 && (
                <span className="text-gray-400 ml-1">x{recipe.resultQuantity}</span>
              )}
            </div>
            {recipe.category && (
              <div className="text-xs text-gray-500 capitalize">
                {recipe.category}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 ml-2">
            <span className={`text-xs px-2 py-1 rounded ${
              isRecipeCraftable(recipe.id) 
                ? 'bg-green-900 text-green-300' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {statusText}
            </span>
          </div>
        </div>
        
        {/* Indicatore skill requirement */}
        {recipe.skillRequirement && (
          <div className="text-xs text-blue-400 mt-1">
            Richiede: {recipe.skillRequirement.skill} Lv.{recipe.skillRequirement.level}
          </div>
        )}
        
        {/* Indicatore selezione */}
        {index === selectedIndex && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-phosphor-400" />
        )}
      </div>
    );
  }, [selectedIndex, onSelectionChange, getResultItemName, getRecipeStatusText, getRecipeStatusClass, isRecipeCraftable]);

  /**
   * Renderizza il messaggio quando non ci sono ricette
   */
  const renderEmptyState = useCallback(() => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
      <div className="text-4xl mb-4">📜</div>
      <div className="text-center">
        <div className="font-medium mb-2">{UI_MESSAGES.NO_RECIPES_KNOWN}</div>
        <div className="text-sm">
          Esplora il mondo per trovare manuali o raggiungi nuovi livelli per sbloccare ricette.
        </div>
      </div>
    </div>
  ), []);

  /**
   * Renderizza l'header della lista
   */
  const renderHeader = useCallback(() => (
    <div className="border-b border-gray-700 pb-2 mb-3">
      <h3 className="text-lg font-bold text-phosphor-400">
        {UI_MESSAGES.RECIPE_LIST_TITLE}
      </h3>
      <div className="text-sm text-gray-400 mt-1">
        {recipes.length} ricett{recipes.length === 1 ? 'a' : 'e'} conosciut{recipes.length === 1 ? 'a' : 'e'}
      </div>
    </div>
  ), [recipes.length]);

  /**
   * Renderizza i controlli di navigazione
   */
  const renderNavigationHint = useCallback(() => (
    <div className="border-t border-gray-700 pt-2 mt-3">
      <div className="text-xs text-gray-500 text-center">
        [W/S] Naviga ricette
      </div>
    </div>
  ), []);

  // ===== MAIN RENDER =====

  return (
    <div 
      className="recipe-list h-full flex flex-col bg-gray-900 border-r border-gray-700"
      style={{ width: UI_CONFIG.RECIPE_LIST_WIDTH }}
      role="listbox"
      aria-label={UI_MESSAGES.RECIPE_LIST_TITLE}
    >
      {/* Header */}
      {renderHeader()}

      {/* Lista ricette o stato vuoto */}
      <div className="flex-1 overflow-y-auto">
        {recipes.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-1 relative">
            {recipes.map((recipe, index) => renderRecipeItem(recipe, index))}
          </div>
        )}
      </div>

      {/* Hint navigazione */}
      {recipes.length > 0 && renderNavigationHint()}
    </div>
  );
};

// ===== RECIPE LIST CONTAINER =====

/**
 * Container che connette RecipeList al store
 */
export const RecipeListContainer: React.FC = () => {
  const { 
    getAvailableRecipes, 
    selectedRecipeIndex, 
    setSelectedRecipe 
  } = useCraftingStore();

  const availableRecipes = getAvailableRecipes();

  return (
    <RecipeList
      recipes={availableRecipes}
      selectedIndex={selectedRecipeIndex}
      onSelectionChange={setSelectedRecipe}
    />
  );
};

export default RecipeListContainer;