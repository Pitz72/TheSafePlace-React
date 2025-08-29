/**
 * TerminalCraftingScreen.tsx - Backup del file originale
 * Interfaccia crafting redesignata in stile terminale anni '80 autentico.
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useCraftingStore } from '../../stores/craftingStore';
import { useGameStore } from '../../stores/gameStore';
import { meetsSkillRequirement } from '../../utils/craftingUtils';
import type { Recipe } from '../../types/crafting';

// ===== CONSTANTS =====
const TERMINAL_LAYOUT = {
  SCREEN_WIDTH: 78,
  BORDER_CHARS: {
    TOP_LEFT: '╔',
    TOP_RIGHT: '╗',
    BOTTOM_LEFT: '╚',
    BOTTOM_RIGHT: '╝',
    HORIZONTAL: '═',
    VERTICAL: '║',
  }
} as const;

interface TerminalCraftingScreenProps {
  onExit: () => void;
}

interface RecipeListItem {
  index: number;
  name: string;
  status: 'DISPONIBILE' | 'MANCANTI MAT.' | 'ABILITA\' INSUF.' | 'NON DISPONIBILE';
  isSelected: boolean;
}

const TerminalCraftingScreen: React.FC<TerminalCraftingScreenProps> = ({ onExit }) => {
  // ===== STATE =====
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available'>('all');
  const [showHelp, setShowHelp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  // ===== STORES =====
  const craftingStore = useCraftingStore();
  const gameStore = useGameStore();

  // ===== DERIVED STATE =====
  const allRecipes = craftingStore.getAvailableRecipes();
  
  const getRecipeStatus = useCallback((recipe: Recipe): RecipeListItem['status'] => {
    if (!gameStore.characterSheet) return 'NON DISPONIBILE';
    
    const hasMaterials = craftingStore.canCraftRecipe(recipe.id);
    const hasSkills = meetsSkillRequirement(recipe, gameStore.characterSheet);
    
    if (hasMaterials && hasSkills) return 'DISPONIBILE';
    if (!hasSkills) return 'ABILITA\' INSUF.';
    if (!hasMaterials) return 'MANCANTI MAT.';
    return 'NON DISPONIBILE';
  }, [gameStore.characterSheet, craftingStore]);

  const filteredRecipes = useMemo(() => {
    let recipes = [...allRecipes];
    
    if (filterStatus === 'available') {
      recipes = recipes.filter(recipe => getRecipeStatus(recipe) === 'DISPONIBILE');
    }
    
    return recipes;
  }, [allRecipes, filterStatus, getRecipeStatus]);

  const selectedRecipe = filteredRecipes[selectedIndex] || null;
  const totalRecipes = filteredRecipes.length;

  // ===== HANDLERS =====
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (isProcessing) return;

    const key = event.key.toLowerCase();

    switch (key) {
      case 'w':
      case 'arrowup':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
        break;
      case 's':
      case 'arrowdown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(totalRecipes - 1, prev + 1));
        break;
      case 'enter':
        event.preventDefault();
        if (selectedRecipe && craftingStore.canCraftRecipe(selectedRecipe.id)) {
          handleCrafting();
        }
        break;
      case 'escape':
        event.preventDefault();
        onExit();
        break;
      case 'f':
        event.preventDefault();
        setFilterStatus(prev => prev === 'all' ? 'available' : 'all');
        setSelectedIndex(0);
        break;
      case 'h':
        event.preventDefault();
        setShowHelp(prev => !prev);
        break;
    }
  }, [isProcessing, totalRecipes, selectedRecipe, craftingStore, onExit]);

  const handleCrafting = useCallback(async () => {
    if (!selectedRecipe) return;
    
    setIsProcessing(true);
    setLastMessage('Crafting in corso...');
    
    try {
      const success = await craftingStore.craftItem(selectedRecipe.id);
      if (success) {
        setLastMessage(`✓ SUCCESSO: ${selectedRecipe.resultItemId} creato!`);
      } else {
        setLastMessage('✗ ERRORE: Crafting fallito');
      }
    } catch (error) {
      setLastMessage('✗ ERRORE: Problema durante il crafting');
    }
    
    setTimeout(() => {
      setLastMessage(null);
      setIsProcessing(false);
    }, 2000);
  }, [selectedRecipe, craftingStore]);

  // ===== EFFECTS =====
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // ===== RENDER HELPERS =====
  const renderBorder = (type: 'top' | 'bottom' | 'separator') => {
    const { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, HORIZONTAL } = TERMINAL_LAYOUT.BORDER_CHARS;
    
    switch (type) {
      case 'top':
        return TOP_LEFT + HORIZONTAL.repeat(TERMINAL_LAYOUT.SCREEN_WIDTH - 2) + TOP_RIGHT;
      case 'bottom':
        return BOTTOM_LEFT + HORIZONTAL.repeat(TERMINAL_LAYOUT.SCREEN_WIDTH - 2) + BOTTOM_RIGHT;
      case 'separator':
        return '├' + '─'.repeat(TERMINAL_LAYOUT.SCREEN_WIDTH - 2) + '┤';
    }
  };

  const renderPaddedLine = (content: string) => {
    const maxContent = TERMINAL_LAYOUT.SCREEN_WIDTH - 4;
    const truncated = content.length > maxContent ? content.substring(0, maxContent - 3) + '...' : content;
    const padding = Math.max(0, maxContent - truncated.length);
    return `║ ${truncated}${' '.repeat(padding)} ║`;
  };

  // ===== MAIN RENDER =====
  const renderTerminalScreen = () => {
    const lines: string[] = [];
    
    // Header
    lines.push(renderBorder('top'));
    lines.push(renderPaddedLine('BANCO DI LAVORO - TERMINAL INTERFACE v0.8.1'));
    lines.push(renderBorder('separator'));
    
    // Recipe List
    lines.push(renderPaddedLine('RICETTE DISPONIBILI:'));
    
    if (totalRecipes === 0) {
      lines.push(renderPaddedLine(''));
      lines.push(renderPaddedLine('Nessuna ricetta disponibile'));
      lines.push(renderPaddedLine(''));
    } else {
      const startIndex = Math.max(0, selectedIndex - 2);
      const endIndex = Math.min(totalRecipes, startIndex + 5);
      
      for (let i = startIndex; i < endIndex; i++) {
        const recipe = filteredRecipes[i];
        const status = getRecipeStatus(recipe);
        const isSelected = i === selectedIndex;
        const prefix = isSelected ? '>>> ' : '    ';
        const statusIcon = status === 'DISPONIBILE' ? '●' : '○';
        
        lines.push(renderPaddedLine(`${prefix}${i + 1}. ${statusIcon} ${recipe.resultItemId}`));
      }
    }
    
    lines.push(renderBorder('separator'));
    
    // Recipe Details
    if (selectedRecipe) {
      lines.push(renderPaddedLine(`DETTAGLI: ${selectedRecipe.resultItemId}`));
      lines.push(renderPaddedLine(`Tipo: ${selectedRecipe.type?.toUpperCase() || 'CREATION'}`));
      
      if (selectedRecipe.description) {
        lines.push(renderPaddedLine(`Desc: ${selectedRecipe.description}`));
      }
      
      lines.push(renderPaddedLine('MATERIALI RICHIESTI:'));
      selectedRecipe.components.forEach(component => {
        const item = gameStore.items[component.itemId];
        const itemName = item?.name || component.itemId;
        lines.push(renderPaddedLine(`• ${itemName} x${component.quantity}`));
      });
    } else {
      lines.push(renderPaddedLine('Seleziona una ricetta per vedere i dettagli'));
    }
    
    lines.push(renderBorder('separator'));
    
    // Commands
    lines.push(renderPaddedLine('[W/S] Naviga [ENTER] Crafta [ESC] Esci [F] Filtri [H] Aiuto'));
    
    // Status/Message
    if (lastMessage) {
      lines.push(renderPaddedLine(lastMessage));
    } else if (isProcessing) {
      lines.push(renderPaddedLine('PROCESSING...'));
    } else {
      lines.push(renderPaddedLine(`Ricette: ${totalRecipes} | Filtro: ${filterStatus}`));
    }
    
    lines.push(renderBorder('bottom'));
    
    return lines;
  };

  // ===== COMPONENT RENDER =====
  return (
    <div className="bg-black text-green-400 p-4 min-h-screen font-mono">
      <div className="text-center">
        <div className="inline-block text-left">
          {renderTerminalScreen().map((line, index) => (
            <div key={index} className="text-sm leading-none whitespace-pre">
              {line}
            </div>
          ))}
        </div>
      </div>
      
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-black border-2 border-green-400 p-4 max-w-md">
            <h3 className="text-green-400 mb-2">AIUTO COMANDI</h3>
            <div className="text-sm space-y-1">
              <div>W/S o ↑/↓: Naviga ricette</div>
              <div>ENTER: Crafta oggetto selezionato</div>
              <div>ESC: Esci dall'interfaccia</div>
              <div>F: Toggle filtri disponibilità</div>
              <div>H: Mostra/nascondi questo aiuto</div>
            </div>
            <div className="mt-4 text-center">
              <button 
                onClick={() => setShowHelp(false)}
                className="text-green-400 border border-green-400 px-2 py-1"
              >
                [CHIUDI]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalCraftingScreen;