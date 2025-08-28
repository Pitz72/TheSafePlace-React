/**
 * ItemPreview.tsx
 * 
 * Componente per l'anteprima dell'oggetto risultante da una ricetta.
 * Mostra statistiche, proprietà e confronti con oggetti simili.
 */

import React from 'react';
import type { ItemPreviewProps } from '../../types/crafting';
import { UI_CONFIG, UI_MESSAGES } from '../../config/craftingConfig';
import { useGameStore } from '../../stores/gameStore';

/**
 * Componente ItemPreview
 */
export const ItemPreview: React.FC<ItemPreviewProps> = ({
  resultItemId,
  resultQuantity,
  showComparison = false
}) => {
  const gameStore = useGameStore();

  // Ottieni l'oggetto dal database
  const item = gameStore.items[resultItemId];

  // ===== RENDER HELPERS =====

  /**
   * Renderizza lo stato vuoto quando nessun oggetto è selezionato
   */
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
      <div className="text-6xl mb-4">🎁</div>
      <div className="text-center">
        <div className="font-medium mb-2">Anteprima Oggetto</div>
        <div className="text-sm">
          Seleziona una ricetta per vedere l'anteprima dell'oggetto che creerai.
        </div>
      </div>
    </div>
  );

  /**
   * Renderizza l'header con nome e icona dell'oggetto
   */
  const renderItemHeader = () => {
    if (!item) return null;

    return (
      <div className="border-b border-gray-700 pb-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-phosphor-400">
            {item.name || 'Oggetto Sconosciuto'}
          </h3>
          {resultQuantity > 1 && (
            <span className="text-lg text-gray-400">
              x{resultQuantity}
            </span>
          )}
        </div>
        
        {item.description && (
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center gap-2">
          {item.type && (
            <span className="inline-block px-2 py-1 text-xs bg-blue-700 text-blue-300 rounded capitalize">
              {item.type}
            </span>
          )}
          {item.rarity && (
            <span className={`inline-block px-2 py-1 text-xs rounded capitalize ${getRarityClass(item.rarity)}`}>
              {item.rarity}
            </span>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renderizza le statistiche base dell'oggetto
   */
  const renderBaseStats = () => {
    if (!item) return null;

    const stats = [];

    // Peso
    if (item.weight !== undefined) {
      stats.push({
        label: 'Peso',
        value: `${item.weight} kg`,
        icon: '⚖️'
      });
    }

    // Valore
    if (item.value !== undefined) {
      stats.push({
        label: 'Valore',
        value: `${item.value} crediti`,
        icon: '💰'
      });
    }

    // Durabilità
    if (item.durability !== undefined) {
      stats.push({
        label: 'Durabilità',
        value: `${item.durability}/${item.maxDurability || item.durability}`,
        icon: '🔧'
      });
    }

    if (stats.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">
          Statistiche Base
        </h4>
        
        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <div className="flex items-center">
                <span className="mr-2">{stat.icon}</span>
                <span className="text-gray-300">{stat.label}</span>
              </div>
              <span className="text-phosphor-400 font-mono">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Renderizza le statistiche specifiche per armi
   */
  const renderWeaponStats = () => {
    if (!item || item.type !== 'weapon') return null;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">
          Statistiche Arma
        </h4>
        
        <div className="space-y-2">
          {item.damage && (
            <div className="flex items-center justify-between p-2 bg-red-900 bg-opacity-30 rounded">
              <div className="flex items-center">
                <span className="mr-2">⚔️</span>
                <span className="text-gray-300">Danno</span>
              </div>
              <span className="text-red-400 font-mono">{item.damage}</span>
            </div>
          )}
          
          {item.accuracy && (
            <div className="flex items-center justify-between p-2 bg-blue-900 bg-opacity-30 rounded">
              <div className="flex items-center">
                <span className="mr-2">🎯</span>
                <span className="text-gray-300">Precisione</span>
              </div>
              <span className="text-blue-400 font-mono">{item.accuracy}%</span>
            </div>
          )}
          
          {item.range && (
            <div className="flex items-center justify-between p-2 bg-green-900 bg-opacity-30 rounded">
              <div className="flex items-center">
                <span className="mr-2">📏</span>
                <span className="text-gray-300">Portata</span>
              </div>
              <span className="text-green-400 font-mono">{item.range}m</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renderizza le statistiche specifiche per armature
   */
  const renderArmorStats = () => {
    if (!item || item.type !== 'armor') return null;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">
          Statistiche Armatura
        </h4>
        
        <div className="space-y-2">
          {item.protection && (
            <div className="flex items-center justify-between p-2 bg-blue-900 bg-opacity-30 rounded">
              <div className="flex items-center">
                <span className="mr-2">🛡️</span>
                <span className="text-gray-300">Protezione</span>
              </div>
              <span className="text-blue-400 font-mono">{item.protection}</span>
            </div>
          )}
          
          {item.coverage && (
            <div className="flex items-center justify-between p-2 bg-green-900 bg-opacity-30 rounded">
              <div className="flex items-center">
                <span className="mr-2">📐</span>
                <span className="text-gray-300">Copertura</span>
              </div>
              <span className="text-green-400 font-mono">{item.coverage}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renderizza le statistiche specifiche per consumabili
   */
  const renderConsumableStats = () => {
    if (!item || item.type !== 'consumable') return null;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">
          Effetti Consumabile
        </h4>
        
        <div className="space-y-2">
          {item.healthRestore && (
            <div className="flex items-center justify-between p-2 bg-green-900 bg-opacity-30 rounded">
              <div className="flex items-center">
                <span className="mr-2">❤️</span>
                <span className="text-gray-300">Ripristina Salute</span>
              </div>
              <span className="text-green-400 font-mono">+{item.healthRestore}</span>
            </div>
          )}
          
          {item.staminaRestore && (
            <div className="flex items-center justify-between p-2 bg-yellow-900 bg-opacity-30 rounded">
              <div className="flex items-center">
                <span className="mr-2">⚡</span>
                <span className="text-gray-300">Ripristina Energia</span>
              </div>
              <span className="text-yellow-400 font-mono">+{item.staminaRestore}</span>
            </div>
          )}
          
          {item.hungerRestore && (
            <div className="flex items-center justify-between p-2 bg-orange-900 bg-opacity-30 rounded">
              <div className="flex items-center">
                <span className="mr-2">🍖</span>
                <span className="text-gray-300">Sazia Fame</span>
              </div>
              <span className="text-orange-400 font-mono">+{item.hungerRestore}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renderizza le proprietà speciali dell'oggetto
   */
  const renderSpecialProperties = () => {
    if (!item || !item.properties || item.properties.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">
          Proprietà Speciali
        </h4>
        
        <div className="space-y-2">
          {item.properties.map((property, index) => (
            <div key={index} className="p-2 bg-purple-900 bg-opacity-30 rounded">
              <div className="flex items-center">
                <span className="mr-2">✨</span>
                <span className="text-purple-300 font-medium">{property.name}</span>
              </div>
              {property.description && (
                <p className="text-gray-400 text-sm mt-1 ml-6">
                  {property.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Renderizza il confronto con oggetti simili (se abilitato)
   */
  const renderComparison = () => {
    if (!showComparison || !item) return null;

    // TODO: Implementare logica di confronto con oggetti simili nell'inventario
    // Per ora mostriamo un placeholder

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">
          Confronto
        </h4>
        
        <div className="p-3 bg-gray-800 rounded text-center text-gray-500">
          <div className="text-sm">
            Confronto con oggetti simili non ancora implementato
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderizza informazioni di utilizzo
   */
  const renderUsageInfo = () => {
    if (!item) return null;

    const usageInfo = [];

    if (item.stackable) {
      usageInfo.push('Impilabile');
    }

    if (item.consumable) {
      usageInfo.push('Consumabile');
    }

    if (item.equipable) {
      usageInfo.push('Equipaggiabile');
    }

    if (item.tradeable === false) {
      usageInfo.push('Non Commerciabile');
    }

    if (usageInfo.length === 0) return null;

    return (
      <div className="mt-auto pt-4 border-t border-gray-700">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">
          Informazioni Utilizzo
        </h4>
        
        <div className="flex flex-wrap gap-1">
          {usageInfo.map((info, index) => (
            <span 
              key={index}
              className="inline-block px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
            >
              {info}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ===== UTILITY FUNCTIONS =====

  /**
   * Ottiene la classe CSS per la rarità dell'oggetto
   */
  const getRarityClass = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'bg-gray-700 text-gray-300';
      case 'uncommon':
        return 'bg-green-700 text-green-300';
      case 'rare':
        return 'bg-blue-700 text-blue-300';
      case 'epic':
        return 'bg-purple-700 text-purple-300';
      case 'legendary':
        return 'bg-yellow-700 text-yellow-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // ===== MAIN RENDER =====

  if (!item) {
    return (
      <div 
        className="item-preview h-full flex flex-col bg-gray-900"
        style={{ width: UI_CONFIG.PREVIEW_WIDTH }}
      >
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div 
      className="item-preview h-full flex flex-col bg-gray-900 p-4 overflow-y-auto"
      style={{ width: UI_CONFIG.PREVIEW_WIDTH }}
    >
      {/* Header oggetto */}
      {renderItemHeader()}
      
      {/* Statistiche base */}
      {renderBaseStats()}
      
      {/* Statistiche specifiche per tipo */}
      {renderWeaponStats()}
      {renderArmorStats()}
      {renderConsumableStats()}
      
      {/* Proprietà speciali */}
      {renderSpecialProperties()}
      
      {/* Confronto (se abilitato) */}
      {renderComparison()}
      
      {/* Informazioni utilizzo */}
      {renderUsageInfo()}
    </div>
  );
};

// ===== ITEM PREVIEW CONTAINER =====

/**
 * Container che connette ItemPreview al store
 */
export const ItemPreviewContainer: React.FC = () => {
  // Qui dovremmo usare il crafting store per ottenere la ricetta selezionata
  // Per ora usiamo un placeholder
  const resultItemId = ''; // TODO: get from selected recipe
  const resultQuantity = 1; // TODO: get from selected recipe

  if (!resultItemId) {
    return (
      <div 
        className="item-preview h-full flex flex-col bg-gray-900"
        style={{ width: UI_CONFIG.PREVIEW_WIDTH }}
      >
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
          <div className="text-6xl mb-4">🎁</div>
          <div className="text-center">
            <div className="font-medium mb-2">Anteprima Oggetto</div>
            <div className="text-sm">
              Seleziona una ricetta per vedere l'anteprima dell'oggetto che creerai.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ItemPreview
      resultItemId={resultItemId}
      resultQuantity={resultQuantity}
      showComparison={false}
    />
  );
};

export default ItemPreviewContainer;