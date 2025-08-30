import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCraftingStore } from '../stores/craftingStore';
import { useGameStore } from '../stores/gameStore';
import { canCraftRecipe, meetsSkillRequirement, getMaterialStatus } from '../utils/craftingUtils';
import type { Recipe } from '../types/crafting';
import type { IInventorySlot } from '../interfaces/items';

// Error Boundary per gestire errori gracefully
class CraftingErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CraftingScreen Error:', error, errorInfo);
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
          <h2 className="text-3xl font-bold mb-4 text-red-400">Errore Sistema Crafting</h2>
          <p className="text-xl mb-4">Si è verificato un errore nel sistema di crafting.</p>
          <p className="text-lg text-phosphor-400 mb-6">Premi ESC per tornare al rifugio.</p>
          <div className="text-sm text-gray-500 max-w-2xl">
            Errore: {this.state.error?.message || 'Errore sconosciuto'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface CraftingScreenRedesignedProps {
  onExit: () => void;
}

// Enum per lo status delle ricette
enum RecipeStatus {
  CRAFTABLE = 'craftable',
  MISSING_MATERIALS = 'missing_materials',
  INSUFFICIENT_LEVEL = 'insufficient_level'
}

// Sistema colori per ricette
const RECIPE_COLORS = {
  [RecipeStatus.CRAFTABLE]: 'text-green-400',
  [RecipeStatus.MISSING_MATERIALS]: 'text-red-400',
  [RecipeStatus.INSUFFICIENT_LEVEL]: 'text-gray-500'
};

// Sistema colori per materiali
const MATERIAL_COLORS = {
  sufficient: 'text-green-400',
  insufficient: 'text-red-400'
};

const CraftingScreenCore: React.FC<CraftingScreenRedesignedProps> = ({ onExit }) => {
  // State locale per navigazione
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // State per prevenire re-inizializzazioni
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  // State per feedback crafting
  const [craftingFeedback, setCraftingFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false
  });

  // Store hooks
  const craftingStore = useCraftingStore();
  const gameStore = useGameStore();

  // Computed values
  const allRecipes = craftingStore.allRecipes;
  const characterSheet = gameStore.characterSheet;
  const items = gameStore.items;
  const inventory: IInventorySlot[] = (characterSheet?.inventory || []).filter((item): item is IInventorySlot => item !== null);

  // Funzione per ottenere il nome tradotto di un oggetto
  const getTranslatedItemName = useCallback((itemId: string): string => {
    const item = items[itemId];
    return item?.name || itemId;
  }, [items]);

  // Funzione per determinare lo status di una ricetta
  const getRecipeStatus = useCallback((recipe: Recipe): RecipeStatus => {
    if (!characterSheet) return RecipeStatus.INSUFFICIENT_LEVEL;
    
    if (!meetsSkillRequirement(recipe, characterSheet)) {
      return RecipeStatus.INSUFFICIENT_LEVEL;
    }
    if (!canCraftRecipe(recipe, inventory, characterSheet)) {
      return RecipeStatus.MISSING_MATERIALS;
    }
    return RecipeStatus.CRAFTABLE;
  }, [characterSheet, inventory]);

  // Ricette disponibili con status (memoizzate per performance)
  const recipesWithStatus = useMemo(() => {
    if (!isInitialized || !characterSheet || allRecipes.length === 0) {
      return [];
    }
    
    return allRecipes.map(recipe => {
      const status = getRecipeStatus(recipe);
      return {
        recipe,
        status,
        canCraft: status === RecipeStatus.CRAFTABLE
      };
    });
  }, [allRecipes, characterSheet, inventory, isInitialized, getRecipeStatus]);

  // Ricetta selezionata
  const selectedRecipe = recipesWithStatus[selectedIndex]?.recipe || null;
  const selectedRecipeStatus = recipesWithStatus[selectedIndex]?.status || RecipeStatus.INSUFFICIENT_LEVEL;

  // Inizializzazione ricette sicura (una sola volta)
  useEffect(() => {
    let isMounted = true;
    
    const initializeOnce = async () => {
      if (isInitialized || craftingStore.isLoading) {
        return;
      }
      
      setIsInitialized(true);
      setInitializationError(null);
      
      try {
        // Inizializza ricette solo se non sono già caricate
        if (craftingStore.allRecipes.length === 0) {
          await craftingStore.initializeRecipes();
        }
        
        // Sblocca ricette starter se necessario
        if (isMounted && characterSheet) {
          craftingStore.unlockStarterRecipes();
          
          // Poi sblocca ricette per livello
          const currentLevel = Math.floor(characterSheet.experience.currentXP / 100) + 1;
          craftingStore.unlockRecipesByLevel(currentLevel);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('CraftingScreen: Failed to initialize recipes:', errorMessage);
          setInitializationError(errorMessage);
          setIsInitialized(false); // Permetti retry
        }
      }
    };
    
    initializeOnce();
    
    return () => {
      isMounted = false;
    };
  }, []); // Dipendenze vuote per eseguire solo al mount
  
  // Gestione separata per cambiamenti del character sheet
  useEffect(() => {
    if (isInitialized && characterSheet && craftingStore.allRecipes.length > 0) {
      const currentLevel = Math.floor(characterSheet.experience.currentXP / 100) + 1;
      craftingStore.unlockRecipesByLevel(currentLevel);
    }
  }, [characterSheet?.experience.currentXP, isInitialized]); // Solo quando cambia XP o inizializzazione completa

  // Gestione input da tastiera
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Non intercettare input se l'utente sta scrivendo
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          try {
            onExit();
          } catch (error) {
            console.error('Error during crafting screen exit:', error);
            // Fallback: prova a tornare alla schermata shelter direttamente
            window.history.back();
          }
          break;
        case 'w':
        case 'W':
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => Math.min(recipesWithStatus.length - 1, prev + 1));
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedRecipe && selectedRecipeStatus === RecipeStatus.CRAFTABLE) {
            // Mostra feedback "crafting in corso"
            setCraftingFeedback({
              message: 'Crafting in corso...',
              type: 'info',
              visible: true
            });
            
            craftingStore.craftItem(selectedRecipe.id).then(success => {
              if (success) {
                const itemName = getTranslatedItemName(selectedRecipe.resultItemId);
                setCraftingFeedback({
                  message: `✅ ${itemName} creato con successo!`,
                  type: 'success',
                  visible: true
                });
              } else {
                setCraftingFeedback({
                  message: '❌ Crafting fallito - controlla i requisiti',
                  type: 'error',
                  visible: true
                });
              }
              
              // Nascondi il messaggio dopo 3 secondi
              setTimeout(() => {
                setCraftingFeedback(prev => ({ ...prev, visible: false }));
              }, 3000);
            });
          } else {
            // Mostra messaggio di errore per ricetta non craftabile
            let errorMessage = '❌ Impossibile craftare questo oggetto';
            if (!selectedRecipe) {
              errorMessage = '❌ Nessuna ricetta selezionata';
            } else if (selectedRecipeStatus === RecipeStatus.MISSING_MATERIALS) {
              errorMessage = '❌ Materiali insufficienti';
            } else if (selectedRecipeStatus === RecipeStatus.INSUFFICIENT_LEVEL) {
              errorMessage = '❌ Livello insufficiente';
            }
            
            setCraftingFeedback({
              message: errorMessage,
              type: 'error',
              visible: true
            });
            
            // Nascondi dopo 2 secondi per errori
            setTimeout(() => {
              setCraftingFeedback(prev => ({ ...prev, visible: false }));
            }, 2000);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRecipe, selectedRecipeStatus, recipesWithStatus.length, onExit, craftingStore]);

  // Aggiusta l'indice se fuori range (con protezione)
  useEffect(() => {
    if (recipesWithStatus.length > 0 && selectedIndex >= recipesWithStatus.length) {
      setSelectedIndex(Math.max(0, recipesWithStatus.length - 1));
    } else if (recipesWithStatus.length === 0 && selectedIndex !== 0) {
      setSelectedIndex(0);
    }
  }, [recipesWithStatus.length, selectedIndex]);

  // Auto-scroll per mantenere la ricetta selezionata visibile
  useEffect(() => {
    const selectedElement = document.getElementById(`recipe-${selectedIndex}`);
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  // Status materiali per ricetta selezionata
  const materialStatus = useMemo(() => {
    if (!selectedRecipe || !characterSheet) return [];
    return getMaterialStatus(selectedRecipe, inventory, items);
  }, [selectedRecipe, characterSheet, inventory, items]);

  // Mostra errore di inizializzazione se presente
  if (initializationError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
        <h2 className="text-3xl font-bold mb-4 text-red-400">Errore Caricamento Ricette</h2>
        <p className="text-xl mb-4">Impossibile caricare il database delle ricette.</p>
        <p className="text-lg text-phosphor-400 mb-6">Premi ESC per tornare al rifugio.</p>
        <div className="text-sm text-gray-500 max-w-2xl">
          Errore: {initializationError}
        </div>
        <div className="text-2xl text-phosphor-400 font-mono tracking-wider text-center mt-8">
          [ESC] Torna al Rifugio
        </div>
      </div>
    );
  }

  // Mostra loading se sta inizializzando
  if (!isInitialized || craftingStore.isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
        <h2 className="text-3xl font-bold mb-4 glow-phosphor-bright">Caricamento Ricette...</h2>
        <div className="text-xl text-phosphor-400">Preparazione banco di lavoro in corso</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black text-phosphor-500 font-mono">
      {/* Header */}
      <h2 className="text-5xl font-bold mb-8 tracking-wider glow-phosphor-bright text-shadow-phosphor-bright">
        BANCO DI LAVORO
      </h2>
      
      {/* Status Info */}
      <div className="text-2xl text-phosphor-400 mb-6">
        {recipesWithStatus.length} ricett{recipesWithStatus.length === 1 ? 'a' : 'e'} disponibil{recipesWithStatus.length === 1 ? 'e' : 'i'}
      </div>

      {/* Main Layout - 2 Colonne */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Colonna Sinistra - Lista Ricette */}
        <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80">
          <h3 className="text-phosphor-400 font-bold mb-4 text-center text-3xl tracking-wider">
            RICETTE
          </h3>
          <div 
            className="space-y-2 text-2xl max-h-96 overflow-y-auto scrollbar-phosphor"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#00ff00 #1a1a1a'
            }}
          >
            {recipesWithStatus.length === 0 ? (
              <div className="text-center text-phosphor-700 italic">
                Nessuna ricetta disponibile
              </div>
            ) : (
              recipesWithStatus.map((recipeInfo, index) => {
                const isSelected = selectedIndex === index;
                const recipe = recipeInfo.recipe;
                const itemName = getTranslatedItemName(recipe.resultItemId);
                
                return (
                  <div
                    key={recipe.id}
                    id={`recipe-${index}`}
                    className={`p-3 rounded-lg transition-all duration-150 ${
                      isSelected 
                        ? 'bg-phosphor-400 text-black font-bold' 
                        : `${RECIPE_COLORS[recipeInfo.status]} bg-gray-800`
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>
                        {itemName}
                        {recipe.resultQuantity > 1 && ` (x${recipe.resultQuantity})`}
                      </span>
                      {recipeInfo.status === RecipeStatus.INSUFFICIENT_LEVEL && (
                        <span className="text-xs text-gray-400 ml-2">[LV]</span>
                      )}
                      {recipeInfo.status === RecipeStatus.MISSING_MATERIALS && (
                        <span className="text-xs text-red-400 ml-2">[MAT]</span>
                      )}
                      {recipeInfo.status === RecipeStatus.CRAFTABLE && (
                        <span className="text-xs text-green-400 ml-2">[OK]</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Colonna Destra - Dettagli Ricetta */}
        <div className="border border-phosphor-500 p-6 bg-gray-900 bg-opacity-80">
          <h3 className="text-phosphor-400 font-bold mb-4 text-center text-3xl tracking-wider">
            DETTAGLI
          </h3>
          
          {selectedRecipe ? (
            <div className="space-y-4 text-2xl">
              {/* Nome oggetto */}
              <div>
                <span className="text-phosphor-400 font-bold">Oggetto: </span>
                <span className={RECIPE_COLORS[selectedRecipeStatus]}>
                  {getTranslatedItemName(selectedRecipe.resultItemId)}
                </span>
                {selectedRecipe.resultQuantity > 1 && (
                  <span className="text-phosphor-400"> (x{selectedRecipe.resultQuantity})</span>
                )}
              </div>

              {/* Descrizione */}
              {items[selectedRecipe.resultItemId]?.description && (
                <div>
                  <span className="text-phosphor-400 font-bold">Descrizione: </span>
                  <span className="text-phosphor-500 italic">
                    {items[selectedRecipe.resultItemId].description}
                  </span>
                </div>
              )}

              {/* Requisiti livello */}
              {selectedRecipe.skillRequirement && (
                <div>
                  <span className="text-phosphor-400 font-bold">Requisiti: </span>
                  <span className={
                    meetsSkillRequirement(selectedRecipe, characterSheet!) 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }>
                    {selectedRecipe.skillRequirement.skill} Lv.{selectedRecipe.skillRequirement.level}
                  </span>
                </div>
              )}

              {/* Materiali richiesti */}
              <div>
                <div className="text-phosphor-400 font-bold mb-2">Materiali:</div>
                <div className="space-y-1 pl-4">
                  {materialStatus.map((material, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{getTranslatedItemName(material.itemId)}:</span>
                      <div className="flex items-center gap-2">
                        <span className={MATERIAL_COLORS[material.sufficient ? 'sufficient' : 'insufficient']}>
                          {material.owned}/{material.required}
                        </span>
                        {material.sufficient ? (
                          <span className="text-green-400 text-xs">✓</span>
                        ) : (
                          <span className="text-red-400 text-xs">✗</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status crafting */}
              <div className="pt-4 border-t border-phosphor-700">
                <span className="text-phosphor-400 font-bold">Status: </span>
                <span className={RECIPE_COLORS[selectedRecipeStatus]}>
                  {selectedRecipeStatus === RecipeStatus.CRAFTABLE && 'Pronto per il crafting'}
                  {selectedRecipeStatus === RecipeStatus.MISSING_MATERIALS && 'Materiali insufficienti'}
                  {selectedRecipeStatus === RecipeStatus.INSUFFICIENT_LEVEL && 'Livello insufficiente'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-phosphor-700 italic text-2xl">
              Seleziona una ricetta per vedere i dettagli
            </div>
          )}
        </div>
      </div>

      {/* Feedback Crafting */}
      {craftingFeedback.visible && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg border-2 font-mono text-2xl font-bold tracking-wider transition-all duration-300 ${
          craftingFeedback.type === 'success' 
            ? 'bg-green-900 border-green-400 text-green-400 glow-green' 
            : craftingFeedback.type === 'error'
            ? 'bg-red-900 border-red-400 text-red-400 glow-red'
            : 'bg-phosphor-900 border-phosphor-400 text-phosphor-400 glow-phosphor'
        }`}>
          {craftingFeedback.message}
        </div>
      )}

      {/* Footer - Comandi */}
      <div className="text-2xl text-phosphor-400 font-mono tracking-wider text-center">
        [↑↓] o [W/S] Naviga | [ENTER] Crafta | [ESC] Esci
      </div>
    </div>
  );
};

// Componente principale con Error Boundary
const CraftingScreenRedesigned: React.FC<CraftingScreenRedesignedProps> = ({ onExit }) => {
  const handleError = useCallback((error: Error) => {
    console.error('Critical crafting error, attempting to exit:', error);
    try {
      onExit();
    } catch (exitError) {
      console.error('Failed to exit crafting screen:', exitError);
    }
  }, [onExit]);

  return (
    <CraftingErrorBoundary onError={handleError}>
      <CraftingScreenCore onExit={onExit} />
    </CraftingErrorBoundary>
  );
};

export default CraftingScreenRedesigned;