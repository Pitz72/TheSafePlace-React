import { useEffect, useCallback, useState } from 'react';
import { useGameContext } from './useGameContext';
import { MessageType, JOURNAL_CONFIG } from '../data/MessageArchive';

interface MovementState {
  isExitingRiver: boolean;
}

// Dev-only logger
const IS_DEV = import.meta.env.MODE === 'development';
const dbg = (...args: any[]) => {
  if (IS_DEV) console.debug('[useKeyboardCommands]', ...args);
};

// Hook unificato per la gestione di tutti i comandi da tastiera
export const useKeyboardCommands = () => {
  const {
    // State
    currentScreen,
    playerPosition,
    mapData,
    menuSelectedIndex,

    // Actions
    setCurrentScreen,
    goBack,
    setMenuSelectedIndex,
    handleNewGame,
    handleLoadGame,
    handleStory,
    handleInstructions,
    handleOptions,
    handleExit,
    shortRest,
    setSelectedInventoryIndex,
    useItem,
    updatePlayerPosition,
    addLogEntry,
    updateBiome,
    performAbilityCheck,
    updateHP,
  } = useGameContext();

  const [movementState, setMovementState] = useState<MovementState>({
    isExitingRiver: false,
  });

  const isValidPosition = useCallback((x: number, y: number): boolean => {
    if (y < 0 || y >= mapData.length) return false;
    if (x < 0 || x >= mapData[y].length) return false;
    return true;
  }, [mapData]);

  const getTerrainAt = useCallback((x: number, y: number): string => {
    if (!isValidPosition(x, y)) return '';
    return mapData[y][x];
  }, [mapData, isValidPosition]);

  const handlePlayerMove = useCallback((deltaX: number, deltaY: number) => {
    if (mapData.length === 0) return;

    const { x: currentX, y: currentY } = playerPosition;
    const nextX = currentX + deltaX;
    const nextY = currentY + deltaY;

    const nextTerrain = getTerrainAt(nextX, nextY);
    dbg('move request', {
      from: { x: currentX, y: currentY },
      delta: { dx: deltaX, dy: deltaY },
      to: { x: nextX, y: nextY },
      nextTerrain,
      exitingRiverFlag: movementState.isExitingRiver,
    });

    if (nextTerrain === 'M') {
      dbg('blocked: mountain tile at target', { to: { x: nextX, y: nextY } });
      addLogEntry(MessageType.MOVEMENT_FAIL_MOUNTAIN);
      return;
    }

    if (!isValidPosition(nextX, nextY)) {
      dbg('blocked: invalid map position', { to: { x: nextX, y: nextY } });
      return;
    }

    const currentTerrain = getTerrainAt(currentX, currentY);
    if (currentTerrain === '~' && movementState.isExitingRiver) {
      dbg('river exit lock: skipping extra move from river tile', { currentTerrain });
      setMovementState({ isExitingRiver: false });
      return;
    }

    dbg('updatePlayerPosition ->', { x: nextX, y: nextY });
    updatePlayerPosition({ x: nextX, y: nextY });
    updateBiome(nextTerrain);

    if (nextTerrain === '~') {
      setMovementState({ isExitingRiver: true });
      
      // Messaggio di azione fiume (sempre mostrato)
      addLogEntry(MessageType.MOVEMENT_ACTION_RIVER);
      
      // Skill check Agilità per attraversamento
      const success = performAbilityCheck('agilita', 15, false); // Non aggiungere messaggio automatico
      dbg('river check', { success });
      
      if (success) {
        // Successo: messaggio specifico per fiume
        addLogEntry(MessageType.SKILL_CHECK_RIVER_SUCCESS);
      } else {
        // Fallimento: messaggio di fallimento + danno
        addLogEntry(MessageType.SKILL_CHECK_FAILURE);
        const damage = Math.floor(Math.random() * 4) + 1;
        dbg('river damage', { damage });
        updateHP(-damage);
        addLogEntry(MessageType.HP_DAMAGE, { damage });
      }
    } else {
      setMovementState({ isExitingRiver: false });
    }

    if (Math.random() < JOURNAL_CONFIG.AMBIANCE_PROBABILITY) {
      addLogEntry(MessageType.AMBIANCE_RANDOM);
    }
  }, [
    playerPosition, mapData, updatePlayerPosition, updateBiome, addLogEntry,
    performAbilityCheck, updateHP, getTerrainAt, isValidPosition, movementState,
  ]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    // Previeni solo per i tasti del gioco, non per DevTools (F12, Ctrl+Shift+I, etc.)
    const gameKeys = ['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 
                      'enter', 'escape', 'tab', 'i', 'r', 'b', 'space', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const key = event.key.toLowerCase();
    const isGameKey = gameKeys.includes(key) || gameKeys.includes(event.code.toLowerCase());
    
    if (!isGameKey) {
      return; // Lascia passare DevTools e altri comandi del browser
    }
    
    dbg('keydown', { key: event.key, code: event.code, currentScreen });
    event.preventDefault();

    switch (currentScreen) {
      case 'menu':
        const menuItems = [handleNewGame, handleLoadGame, handleInstructions, handleStory, handleOptions, handleExit];
        switch (event.key.toLowerCase()) {
          case 'w': case 'arrowup':
            setMenuSelectedIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
            break;
          case 's': case 'arrowdown':
            setMenuSelectedIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
            break;
          case 'enter':
            menuItems[menuSelectedIndex]();
            break;
        }
        break;

      case 'story':
      case 'instructions':
      case 'options':
      case 'characterSheet':
        if (event.key.toLowerCase() === 'escape' || event.key.toLowerCase() === 'b' || event.key.toLowerCase() === 'tab') {
          goBack();
        }
        break;

      case 'inventory':
        switch (event.key.toLowerCase()) {
          case 'i': case 'escape': goBack(); break;
          case 'w': case 'arrowup': setSelectedInventoryIndex(p => (p > 0 ? p - 1 : 9)); break;
          case 's': case 'arrowdown': setSelectedInventoryIndex(p => (p < 9 ? p + 1 : 0)); break;
          case '1': case '2': case '3': case '4': case '5':
          case '6': case '7': case '8': case '9': case '0':
            const slotIndex = event.key === '0' ? 9 : parseInt(event.key) - 1;
            useItem(slotIndex);
            break;
        }
        break;
          
      case 'levelUp':
        switch (event.key.toLowerCase()) {
          case 'l': case 'escape': goBack(); break;
        }
        break;

      case 'characterCreation':
        if (event.key.toLowerCase() === 'escape' || event.code === 'Space') {
          setCurrentScreen('game');
        }
        break;

      case 'game':
        switch (event.key.toLowerCase()) {
          case 'w': case 'arrowup': handlePlayerMove(0, -1); break;
          case 's': case 'arrowdown': handlePlayerMove(0, 1); break;
          case 'a': case 'arrowleft': handlePlayerMove(-1, 0); break;
          case 'd': case 'arrowright': handlePlayerMove(1, 0); break;
          case 'i': setCurrentScreen('inventory'); break;
          case 'l': setCurrentScreen('levelUp'); break;
          case 'r': shortRest(); break;
          case 'tab': setCurrentScreen('characterSheet'); break;
          case 'escape': setCurrentScreen('menu'); break;
        }
        break;
    }
  }, [
    currentScreen, menuSelectedIndex, handlePlayerMove, shortRest, setCurrentScreen, goBack,
    handleNewGame, handleLoadGame, handleInstructions, handleStory, handleOptions, handleExit,
    setSelectedInventoryIndex, useItem, setMenuSelectedIndex
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};