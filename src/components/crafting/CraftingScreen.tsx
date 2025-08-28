/**
 * CraftingScreen.tsx
 * 
 * Componente principale del sistema di crafting.
 * Coordina tutti i sotto-componenti e gestisce il layout a 4 sezioni.
 */

import React, { useEffect, useCallback, useState } from 'react';
import type { CraftingScreenProps } from '../../types/crafting';
import { UI_CONFIG, UI_MESSAGES, KEYBOARD_CONFIG } from '../../config/craftingConfig';
import { useCraftingStore } from '../../stores/craftingStore';
import { useGameStore } from '../../stores/gameStore';
import { RecipeListContainer } from './RecipeList';
import { RecipeDetails } from './RecipeDetails';
import { ItemPreview } from './ItemPreview';
import { CraftingActionBar } from './CraftingActionBar';
import { getMaterialStatus, meetsSkillRequirement } from '../../utils/craftingUtils';

/**
 * Componente CraftingScreen principale
 */
export const CraftingScreen: React.FC<CraftingScreenProps> = ({
  onExit
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store hooks
  const craftingStore = useCraftingStore();
  const gameStore = useGameStore();

  // Stato derivato
  const selectedRecipe = craftingStore.getSelectedRecipe();
  const availableRecipes = craftingStore.getAvailableRecipes();
  const canCraft = selectedRecipe ? craftingStore.canCraftRecipe(selectedRecipe.id) : false;

  // ===== INITIALIZATION =====

  useEffect(() => {
    const initializeCrafting = async () => {
      try {
        setError(null);
        
        // Inizializza le ricette se non già fatto
        if (craftingStore.allRecipes.length === 0) {
          await craftingStore.initializeRecipes();
        }

        // Sincronizza con il game store
        craftingStore.syncWithGameStore();

        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
        setError(`Errore inizializzazione crafting: ${errorMessage}`);
        console.error('Crafting initialization failed:', err);
      }
    };

    initializeCrafting();
  }, []);

  // ===== KEYBOARD HANDLING =====

  const handleGlobalKeyPress = useCallback((event: KeyboardEvent) => {
    // ESC per uscire (gestito globalmente)
    if (KEYBOARD_CONFIG.EXIT_SCREEN.includes(event.key as any)) {
      event.preventDefault();
      handleExit();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, [handleGlobalKeyPress]);

  // ===== ACTION HANDLERS =====

  /**
   * Gestisce l'uscita dalla schermata di crafting
   */
  const handleExit = useCallback(() => {
    craftingStore.closeCrafting();
    onExit();
  }, [onExit]);

  /**
   * Gestisce l'azione di crafting
   */
  const handleCraft = useCallback(async () => {
    if (!selectedRecipe || !canCraft) return;

    try {
      const success = await craftingStore.craftItem(selectedRecipe.id);
      
      if (success) {
        // Aggiorna la selezione se necessario
        const updatedRecipes = craftingStore.getAvailableRecipes();
        if (craftingStore.selectedRecipeIndex >= updatedRecipes.length) {
          craftingStore.setSelectedRecipe(Math.max(0, updatedRecipes.length - 1));
        }
      }
    } catch (error) {
      console.error('Crafting failed:', error);
      // L'errore è già gestito nel store
    }
  }, [selectedRecipe, canCraft]);

  // ===== DERIVED DATA =====

  /**
   * Calcola lo stato dei materiali per la ricetta selezionata
   */
  const materialStatus = selectedRecipe && gameStore.characterSheet 
    ? getMaterialStatus(selectedRecipe, gameStore.characterSheet.inventory || [], gameStore.items)
    : [];

  /**
   * Verifica se i requisiti di abilità sono soddisfatti
   */
  const meetsSkills = selectedRecipe && gameStore.characterSheet
    ? meetsSkillRequirement(selectedRecipe, gameStore.characterSheet)
    : true;

  // ===== RENDER HELPERS =====

  /**
   * Renderizza lo stato di caricamento
   */
  const renderLoadingState = () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-phosphor-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-phosphor-400 text-lg font-medium mb-2">
          Caricamento Sistema di Crafting
        </div>
        <div className="text-gray-400 text-sm">
          Inizializzazione ricette e configurazioni...
        </div>
      </div>
    </div>
  );

  /**
   * Renderizza lo stato di errore
   */
  const renderErrorState = () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="text-red-400 text-lg font-medium mb-2">
          Errore Sistema di Crafting
        </div>
        <div className="text-gray-400 text-sm mb-4">
          {error}
        </div>
        <button
          onClick={handleExit}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
        >
          Torna al Rifugio
        </button>
      </div>
    </div>
  );

  /**
   * Renderizza l'header della schermata
   */
  const renderHeader = () => (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-phosphor-400">
            {UI_MESSAGES.CRAFTING_TITLE}
          </h1>
          <div className="text-sm text-gray-400 mt-1">
            {availableRecipes.length} ricett{availableRecipes.length === 1 ? 'a' : 'e'} disponibil{availableRecipes.length === 1 ? 'e' : 'i'}
            {selectedRecipe && (
              <span className="ml-4">
                • Selezionata: <span className="text-phosphor-400">{gameStore.items[selectedRecipe.resultItemId]?.name || 'Oggetto Sconosciuto'}</span>
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">
            [ESC] Esci dal Banco di Lavoro
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Renderizza il layout principale a 4 sezioni
   */
  const renderMainLayout = () => (
    <div className="flex-1 flex overflow-hidden">
      {/* Sezione 1: Lista Ricette (25%) */}
      <div className="flex-shrink-0" style={{ width: UI_CONFIG.RECIPE_LIST_WIDTH }}>
        <RecipeListContainer />
      </div>

      {/* Sezione 2: Dettagli Ricetta (40%) */}
      <div className="flex-shrink-0" style={{ width: UI_CONFIG.DETAILS_WIDTH }}>
        <RecipeDetails 
          recipe={selectedRecipe}
          materialStatus={materialStatus}
          meetsSkillRequirement={meetsSkills}
        />
      </div>

      {/* Sezione 3: Anteprima Oggetto (35%) */}
      <div className="flex-shrink-0" style={{ width: UI_CONFIG.PREVIEW_WIDTH }}>
        <ItemPreview 
          resultItemId={selectedRecipe?.resultItemId || ''}
          resultQuantity={selectedRecipe?.resultQuantity || 1}
          showComparison={false}
        />
      </div>
    </div>
  );

  /**
   * Renderizza la barra delle azioni
   */
  const renderActionBar = () => (
    <div className="flex-shrink-0">
      <CraftingActionBar 
        canCraft={canCraft}
        onCraft={handleCraft}
        onExit={handleExit}
      />
    </div>
  );

  // ===== MAIN RENDER =====

  // Stato di caricamento
  if (!isInitialized && !error) {
    return renderLoadingState();
  }

  // Stato di errore
  if (error) {
    return renderErrorState();
  }

  return (
    <div className="crafting-screen h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      {renderHeader()}

      {/* Layout principale */}
      {renderMainLayout()}

      {/* Barra azioni */}
      {renderActionBar()}
    </div>
  );
};

// ===== CRAFTING SCREEN CONTAINER =====

/**
 * Container che gestisce l'integrazione con i store
 */
export const CraftingScreenContainer: React.FC<CraftingScreenProps> = ({
  onExit
}) => {
  const craftingStore = useCraftingStore();

  // Apri il crafting quando il componente viene montato
  useEffect(() => {
    craftingStore.openCrafting();
    
    return () => {
      // Cleanup quando il componente viene smontato
      craftingStore.closeCrafting();
    };
  }, []);

  return <CraftingScreen onExit={onExit} />;
};

// ===== CONNECTED COMPONENTS =====





export default CraftingScreenContainer;