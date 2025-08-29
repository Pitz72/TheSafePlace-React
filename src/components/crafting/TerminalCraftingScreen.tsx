/**
 * TerminalCraftingScreen.tsx
 * 
 * Interfaccia terminale minimale per il sistema di crafting.
 * Implementazione semplificata per evitare problemi di complessità.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCraftingStore } from '../../stores/craftingStore';
import { useGameStore } from '../../stores/gameStore';
import { canCraftRecipe, meetsSkillRequirement } from '../../utils/craftingUtils';
import type { Recipe } from '../../types/crafting';
import type { IInventorySlot } from '../../interfaces/items';

interface TerminalCraftingScreenProps {
  onExit: () => void;
}

// Costanti per il layout terminale
const TERMINAL_CONFIG = {
  SCREEN_WIDTH: 78,
  BORDER_CHARS: {
    HORIZONTAL: '═',
    VERTICAL: '║',
    TOP_LEFT: '╔',
    TOP_RIGHT: '╗',
    BOTTOM_LEFT: '╚',
    BOTTOM_RIGHT: '╝',
    CROSS: '╬'
  }
};

const TerminalCraftingScreen: React.FC<TerminalCraftingScreenProps> = ({ onExit }) => {
  // State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterAvailable, setFilterAvailable] = useState(false);

  // Stores
  const craftingStore = useCraftingStore();
  const gameStore = useGameStore();

  // Computed values
  const allRecipes = craftingStore.allRecipes;
  
  const filteredRecipes = useMemo(() => {
    if (!filterAvailable) return allRecipes;
    const inventory: IInventorySlot[] = (gameStore.characterSheet?.inventory || []).filter((item): item is IInventorySlot => item !== null);
    return allRecipes.filter(recipe => 
      canCraftRecipe(recipe, inventory, gameStore.characterSheet)
    );
  }, [allRecipes, filterAvailable, gameStore.characterSheet]);

  const selectedRecipe = filteredRecipes[selectedIndex] || null;

  // Handlers
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'escape':
        onExit();
        break;
      case 'w':
      case 'arrowup':
        setSelectedIndex(prev => Math.max(0, prev - 1));
        break;
      case 's':
      case 'arrowdown':
        setSelectedIndex(prev => Math.min(filteredRecipes.length - 1, prev + 1));
        break;
      case 'enter':
        const inventory: IInventorySlot[] = (gameStore.characterSheet?.inventory || []).filter((item): item is IInventorySlot => item !== null);
        if (selectedRecipe && canCraftRecipe(selectedRecipe, inventory, gameStore.characterSheet)) {
          craftingStore.craftItem(selectedRecipe.id);
        }
        break;
      case 'f':
        setFilterAvailable(prev => !prev);
        setSelectedIndex(0);
        break;
    }
  }, [selectedRecipe, filteredRecipes.length, onExit, craftingStore, gameStore.items, gameStore.characterSheet]);

  // Effects
  useEffect(() => {
    // Inizializza le ricette se non sono già caricate
    if (craftingStore.allRecipes.length === 0) {
      craftingStore.initializeRecipes();
    }
  }, [craftingStore]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (selectedIndex >= filteredRecipes.length && filteredRecipes.length > 0) {
      setSelectedIndex(filteredRecipes.length - 1);
    }
  }, [filteredRecipes.length, selectedIndex]);

  // Render helpers
  const renderBorder = (type: 'top' | 'bottom' | 'separator') => {
    const { HORIZONTAL, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, CROSS } = TERMINAL_CONFIG.BORDER_CHARS;
    const width = TERMINAL_CONFIG.SCREEN_WIDTH - 2;
    
    switch (type) {
      case 'top':
        return TOP_LEFT + HORIZONTAL.repeat(width) + TOP_RIGHT;
      case 'bottom':
        return BOTTOM_LEFT + HORIZONTAL.repeat(width) + BOTTOM_RIGHT;
      case 'separator':
        return CROSS + HORIZONTAL.repeat(width) + CROSS;
      default:
        return '';
    }
  };

  const renderRecipeStatus = (recipe: Recipe): string => {
    const inventory: IInventorySlot[] = (gameStore.characterSheet?.inventory || []).filter((item): item is IInventorySlot => item !== null);
    const canCraft = canCraftRecipe(recipe, inventory, gameStore.characterSheet);
    const hasSkills = meetsSkillRequirement(recipe, gameStore.characterSheet);
    
    if (canCraft) return '[DISPONIBILE]';
    if (!hasSkills) return '[ABILITA\' INSUF.]';
    return '[MANCANTI MAT.]';
  };

  const renderRecipeList = () => {
    const lines: string[] = [];
    const maxVisible = 8;
    const startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
    const endIndex = Math.min(filteredRecipes.length, startIndex + maxVisible);

    lines.push('RICETTE DISPONIBILI'.padEnd(35));
    lines.push('─'.repeat(35));

    for (let i = startIndex; i < endIndex; i++) {
      const recipe = filteredRecipes[i];
      const isSelected = i === selectedIndex;
      const status = renderRecipeStatus(recipe);
      const prefix = isSelected ? '>>> ' : '    ';
      const line = `${prefix}${status} ${recipe.resultItemId}`;
      lines.push(line.substring(0, 35));
    }

    // Riempi righe vuote
    while (lines.length < maxVisible + 2) {
      lines.push(''.padEnd(35));
    }

    return lines;
  };

  const renderRecipeDetails = () => {
    const lines: string[] = [];
    
    if (!selectedRecipe) {
      lines.push('NESSUNA RICETTA SELEZIONATA'.padEnd(40));
      while (lines.length < 10) {
        lines.push(''.padEnd(40));
      }
      return lines;
    }

    lines.push(`RICETTA: ${selectedRecipe.resultItemId.toUpperCase()}`.padEnd(40));
    lines.push('─'.repeat(40));
    lines.push(`Tipo: ${selectedRecipe.type || 'creation'}`.padEnd(40));
    lines.push(`Categoria: ${selectedRecipe.category}`.padEnd(40));
    lines.push(''.padEnd(40));
    lines.push('MATERIALI RICHIESTI:'.padEnd(40));
    
    selectedRecipe.components.forEach(component => {
      const inventory: IInventorySlot[] = (gameStore.characterSheet?.inventory || []).filter((item): item is IInventorySlot => item !== null);
      const available = inventory.find(item => item.itemId === component.itemId)?.quantity || 0;
      const status = available >= component.quantity ? '✓' : '✗';
      lines.push(`${status} ${component.itemId} x${component.quantity}`.padEnd(40));
    });

    while (lines.length < 10) {
      lines.push(''.padEnd(40));
    }

    return lines;
  };

  const renderScreen = () => {
    const recipeList = renderRecipeList();
    const recipeDetails = renderRecipeDetails();
    const lines: string[] = [];

    // Header
    lines.push(renderBorder('top'));
    lines.push(`║${'BANCO DI LAVORO TERMINALE'.padStart(39).padEnd(76)}║`);
    lines.push(renderBorder('separator'));

    // Content area
    for (let i = 0; i < Math.max(recipeList.length, recipeDetails.length); i++) {
      const leftPart = (recipeList[i] || '').padEnd(35);
      const rightPart = (recipeDetails[i] || '').padEnd(40);
      lines.push(`║ ${leftPart} │ ${rightPart} ║`);
    }

    // Footer
    lines.push(renderBorder('separator'));
    const commands = '[W/S] Naviga [ENTER] Crafta [F] Filtro [ESC] Esci';
    lines.push(`║${commands.padStart(39).padEnd(76)}║`);
    lines.push(renderBorder('bottom'));

    return lines.join('\n');
  };

  return (
    <div className="fixed inset-0 bg-black text-phosphor-500 font-mono text-lg flex items-center justify-center">
      <div className="bg-black p-6 border-2 border-phosphor-500 rounded-lg shadow-lg shadow-phosphor-500/20">
        <pre className="whitespace-pre leading-relaxed tracking-wide">
          {renderScreen()}
        </pre>
      </div>
    </div>
  );
};

export default TerminalCraftingScreen;