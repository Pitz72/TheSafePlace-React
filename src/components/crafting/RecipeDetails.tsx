/**
 * RecipeDetails.tsx
 * 
 * Componente per la visualizzazione dei dettagli di una ricetta selezionata.
 * Mostra materiali richiesti, requisiti abilità e descrizione.
 */

import React from 'react';
import type { RecipeDetailsProps } from '../../types/crafting';
import { UI_CONFIG, UI_MESSAGES } from '../../config/craftingConfig';
import { useGameStore } from '../../stores/gameStore';

/**
 * Componente RecipeDetails
 */
export const RecipeDetails: React.FC<RecipeDetailsProps> = ({
  recipe,
  materialStatus,
  meetsSkillRequirement
}) => {
  const gameStore = useGameStore();

  // ===== RENDER HELPERS =====

  /**
   * Renderizza lo stato vuoto quando nessuna ricetta è selezionata
   */
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
      <div className="text-6xl mb-4">🔧</div>
      <div className="text-center">
        <div className="font-medium mb-2">Seleziona una ricetta</div>
        <div className="text-sm">
          Scegli una ricetta dalla lista per vedere i dettagli e i materiali richiesti.
        </div>
      </div>
    </div>
  );

  /**
   * Renderizza l'header con nome e descrizione della ricetta
   */
  const renderRecipeHeader = () => {
    if (!recipe) return null;

    const resultItem = gameStore.items[recipe.resultItemId];
    const itemName = resultItem?.name || 'Oggetto Sconosciuto';

    return (
      <div className="border-b border-gray-700 pb-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-phosphor-400">
            {itemName}
          </h3>
          {recipe.resultQuantity > 1 && (
            <span className="text-lg text-gray-400">
              x{recipe.resultQuantity}
            </span>
          )}
        </div>
        
        {recipe.description && (
          <p className="text-gray-300 text-sm leading-relaxed">
            {recipe.description}
          </p>
        )}
        
        {recipe.category && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded capitalize">
              {recipe.category}
            </span>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renderizza la sezione materiali richiesti
   */
  const renderMaterialsSection = () => {
    if (!recipe || !materialStatus.length) return null;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">
          Materiali Richiesti
        </h4>
        
        <div className="space-y-2">
          {materialStatus.map((material, index) => (
            <div 
              key={material.itemId}
              className="flex items-center justify-between p-3 bg-gray-800 rounded border-l-4"
              style={{
                borderLeftColor: material.sufficient ? '#10b981' : '#ef4444'
              }}
            >
              <div className="flex-1">
                <div className={`font-medium ${
                  material.sufficient ? UI_CONFIG.SUFFICIENT_COLOR : UI_CONFIG.INSUFFICIENT_COLOR
                }`}>
                  {material.itemName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {material.itemId}
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-mono text-sm ${
                  material.sufficient ? UI_CONFIG.SUFFICIENT_COLOR : UI_CONFIG.INSUFFICIENT_COLOR
                }`}>
                  {material.owned} / {material.required}
                </div>
                <div className="text-xs text-gray-500">
                  {material.sufficient ? 'Sufficiente' : 'Insufficiente'}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Riepilogo materiali */}
        <div className="mt-3 p-2 bg-gray-900 rounded text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Materiali disponibili:</span>
            <span>
              {materialStatus.filter(m => m.sufficient).length} / {materialStatus.length}
            </span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderizza la sezione requisiti abilità
   */
  const renderSkillRequirementSection = () => {
    if (!recipe?.skillRequirement) return null;

    const { skill, level } = recipe.skillRequirement;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">
          Requisiti Abilità
        </h4>
        
        <div className={`p-3 rounded border-l-4 ${
          meetsSkillRequirement ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-medium ${
                meetsSkillRequirement ? 'text-green-300' : 'text-red-300'
              }`}>
                {skill.charAt(0).toUpperCase() + skill.slice(1)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Abilità richiesta
              </div>
            </div>
            
            <div className="text-right">
              <div className={`font-mono text-sm ${
                meetsSkillRequirement ? 'text-green-300' : 'text-red-300'
              }`}>
                Livello {level}
              </div>
              <div className="text-xs text-gray-400">
                {meetsSkillRequirement ? 'Soddisfatto' : 'Non soddisfatto'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderizza informazioni aggiuntive sulla ricetta
   */
  const renderAdditionalInfo = () => {
    if (!recipe) return null;

    const hasUnlockInfo = recipe.unlockedByLevel || recipe.unlockedByManual;
    if (!hasUnlockInfo) return null;

    return (
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">
          Informazioni Sblocco
        </h4>
        
        <div className="p-3 bg-gray-800 rounded">
          {recipe.unlockedByLevel && (
            <div className="flex items-center text-sm text-gray-300 mb-2">
              <span className="text-blue-400 mr-2">📊</span>
              <span>Sbloccata al livello {recipe.unlockedByLevel}</span>
            </div>
          )}
          
          {recipe.unlockedByManual && (
            <div className="flex items-center text-sm text-gray-300">
              <span className="text-purple-400 mr-2">📖</span>
              <span>Sbloccata dal manuale: {recipe.unlockedByManual}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renderizza lo stato di craftabilità
   */
  const renderCraftabilityStatus = () => {
    if (!recipe) return null;

    const allMaterialsAvailable = materialStatus.every(m => m.sufficient);
    const canCraft = allMaterialsAvailable && meetsSkillRequirement;

    return (
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className={`p-3 rounded text-center font-medium ${
          canCraft 
            ? 'bg-green-900 text-green-300 border border-green-600' 
            : 'bg-red-900 text-red-300 border border-red-600'
        }`}>
          {canCraft ? (
            <>
              <div className="text-lg mb-1">✅ {UI_MESSAGES.READY_TO_CRAFT}</div>
              <div className="text-xs opacity-75">
                Tutti i requisiti sono soddisfatti
              </div>
            </>
          ) : (
            <>
              <div className="text-lg mb-1">
                ❌ {!allMaterialsAvailable ? UI_MESSAGES.INSUFFICIENT_MATERIALS : UI_MESSAGES.INSUFFICIENT_SKILL}
              </div>
              <div className="text-xs opacity-75">
                {!allMaterialsAvailable 
                  ? 'Raccogli i materiali mancanti'
                  : 'Migliora le tue abilità'
                }
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  if (!recipe) {
    return (
      <div 
        className="recipe-details h-full flex flex-col bg-gray-900"
        style={{ width: UI_CONFIG.DETAILS_WIDTH }}
      >
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div 
      className="recipe-details h-full flex flex-col bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto"
      style={{ width: UI_CONFIG.DETAILS_WIDTH }}
    >
      {/* Header ricetta */}
      {renderRecipeHeader()}
      
      {/* Sezione materiali */}
      {renderMaterialsSection()}
      
      {/* Sezione requisiti abilità */}
      {renderSkillRequirementSection()}
      
      {/* Informazioni aggiuntive */}
      {renderAdditionalInfo()}
      
      {/* Stato craftabilità */}
      {renderCraftabilityStatus()}
    </div>
  );
};

// ===== RECIPE DETAILS CONTAINER =====

/**
 * Container che connette RecipeDetails al store
 */
export const RecipeDetailsContainer: React.FC = () => {
  const gameStore = useGameStore();
  
  // Qui dovremmo usare il crafting store per ottenere la ricetta selezionata
  // Per ora usiamo un placeholder
  const selectedRecipe = null; // TODO: get from crafting store
  const materialStatus = []; // TODO: get from crafting store
  const meetsSkillRequirement = true; // TODO: calculate from character sheet

  return (
    <RecipeDetails
      recipe={selectedRecipe}
      materialStatus={materialStatus}
      meetsSkillRequirement={meetsSkillRequirement}
    />
  );
};

export default RecipeDetailsContainer;