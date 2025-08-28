/**
 * CraftingActionBar.tsx
 * 
 * Componente per la barra delle azioni del sistema di crafting.
 * Gestisce comandi, feedback visivo e stato delle azioni disponibili.
 */

import React, { useEffect, useCallback, useState } from 'react';
import type { CraftingActionBarProps } from '../../types/crafting';
import { UI_CONFIG, KEYBOARD_CONFIG, UI_MESSAGES } from '../../config/craftingConfig';

/**
 * Componente CraftingActionBar
 */
export const CraftingActionBar: React.FC<CraftingActionBarProps> = ({
  canCraft,
  onCraft,
  onExit
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<'craft' | 'exit' | null>(null);

  // ===== KEYBOARD HANDLING =====

  const handleKeyPress = useCallback(async (event: KeyboardEvent) => {
    // Previeni azioni multiple durante il processing
    if (isProcessing) return;

    if (KEYBOARD_CONFIG.CRAFT_ITEM.includes(event.key as any)) {
      event.preventDefault();
      if (canCraft) {
        await handleCraftAction();
      }
    } else if (KEYBOARD_CONFIG.EXIT_SCREEN.includes(event.key as any)) {
      event.preventDefault();
      handleExitAction();
    }
  }, [canCraft, isProcessing]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // ===== ACTION HANDLERS =====

  /**
   * Gestisce l'azione di crafting
   */
  const handleCraftAction = useCallback(async () => {
    if (!canCraft || isProcessing) return;

    setIsProcessing(true);
    setLastAction('craft');

    try {
      await onCraft();
    } catch (error) {
      console.error('Crafting action failed:', error);
    } finally {
      // Delay per feedback visivo
      setTimeout(() => {
        setIsProcessing(false);
        setLastAction(null);
      }, 500);
    }
  }, [canCraft, isProcessing, onCraft]);

  /**
   * Gestisce l'azione di uscita
   */
  const handleExitAction = useCallback(() => {
    if (isProcessing) return;

    setLastAction('exit');
    
    // Delay per feedback visivo
    setTimeout(() => {
      onExit();
    }, 150);
  }, [isProcessing, onExit]);

  // ===== RENDER HELPERS =====

  /**
   * Renderizza il pulsante di crafting
   */
  const renderCraftButton = () => {
    const isActive = canCraft && !isProcessing;
    const isCurrentAction = lastAction === 'craft';

    return (
      <button
        onClick={handleCraftAction}
        disabled={!canCraft || isProcessing}
        className={`
          flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200
          flex items-center justify-center gap-2
          ${isActive 
            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-xl' 
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }
          ${isCurrentAction ? 'scale-95 bg-green-700' : ''}
          ${isProcessing && isCurrentAction ? 'animate-pulse' : ''}
        `}
        aria-label={UI_MESSAGES.CRAFT_ITEM}
      >
        {isProcessing && isCurrentAction ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creando...</span>
          </>
        ) : (
          <>
            <span className="text-lg">🔨</span>
            <span>{UI_MESSAGES.CRAFT_ITEM}</span>
          </>
        )}
      </button>
    );
  };

  /**
   * Renderizza il pulsante di uscita
   */
  const renderExitButton = () => {
    const isCurrentAction = lastAction === 'exit';

    return (
      <button
        onClick={handleExitAction}
        disabled={isProcessing}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          flex items-center justify-center gap-2
          bg-gray-600 hover:bg-gray-500 text-white
          ${isCurrentAction ? 'scale-95 bg-gray-700' : ''}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label={UI_MESSAGES.EXIT_CRAFTING}
      >
        <span className="text-lg">🚪</span>
        <span>{UI_MESSAGES.EXIT_CRAFTING}</span>
      </button>
    );
  };

  /**
   * Renderizza i comandi da tastiera
   */
  const renderKeyboardHints = () => (
    <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
      <div className="flex items-center gap-2">
        <kbd className="px-2 py-1 bg-gray-800 rounded text-xs font-mono">
          {KEYBOARD_CONFIG.CRAFT_ITEM[0]}
        </kbd>
        <span>Crea</span>
      </div>
      
      <div className="flex items-center gap-2">
        <kbd className="px-2 py-1 bg-gray-800 rounded text-xs font-mono">
          ESC
        </kbd>
        <span>Esci</span>
      </div>
    </div>
  );

  /**
   * Renderizza lo stato di disponibilità
   */
  const renderAvailabilityStatus = () => {
    if (isProcessing) {
      return (
        <div className="text-center text-yellow-400 text-sm">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span>Elaborazione in corso...</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`text-center text-sm ${canCraft ? 'text-green-400' : 'text-red-400'}`}>
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">
            {canCraft ? '✅' : '❌'}
          </span>
          <span>
            {canCraft 
              ? UI_MESSAGES.READY_TO_CRAFT 
              : 'Requisiti non soddisfatti'
            }
          </span>
        </div>
      </div>
    );
  };

  /**
   * Renderizza suggerimenti per l'utente
   */
  const renderHelpText = () => {
    if (isProcessing) return null;

    if (!canCraft) {
      return (
        <div className="text-center text-xs text-gray-500">
          Raccogli i materiali necessari e soddisfa i requisiti di abilità per procedere
        </div>
      );
    }

    return (
      <div className="text-center text-xs text-gray-500">
        Premi Invio per creare l'oggetto o ESC per tornare al rifugio
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div 
      className="crafting-action-bar bg-gray-900 border-t border-gray-700 p-4"
      style={{ height: UI_CONFIG.ACTION_BAR_HEIGHT }}
    >
      <div className="h-full flex flex-col justify-between">
        {/* Stato disponibilità */}
        <div className="mb-2">
          {renderAvailabilityStatus()}
        </div>

        {/* Pulsanti azione */}
        <div className="flex items-center gap-4 mb-2">
          {renderCraftButton()}
          {renderExitButton()}
        </div>

        {/* Comandi tastiera */}
        <div className="mb-1">
          {renderKeyboardHints()}
        </div>

        {/* Testo di aiuto */}
        <div>
          {renderHelpText()}
        </div>
      </div>
    </div>
  );
};

// ===== CRAFTING ACTION BAR CONTAINER =====

/**
 * Container che connette CraftingActionBar al store
 */
export const CraftingActionBarContainer: React.FC = () => {
  // Qui dovremmo usare il crafting store per ottenere lo stato
  // Per ora usiamo placeholder
  const canCraft = false; // TODO: get from crafting store
  
  const handleCraft = async () => {
    // TODO: implement crafting logic from store
    console.log('Crafting action triggered');
  };

  const handleExit = () => {
    // TODO: implement exit logic from store
    console.log('Exit action triggered');
  };

  return (
    <CraftingActionBar
      canCraft={canCraft}
      onCraft={handleCraft}
      onExit={handleExit}
    />
  );
};

export default CraftingActionBarContainer;