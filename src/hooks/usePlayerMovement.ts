import { useEffect, useState, useCallback } from 'react';
import { useGameContext } from './useGameContext';

import { MessageType, JOURNAL_CONFIG } from '../data/MessageArchive';

interface MovementState {
  isExitingRiver: boolean;
}

export const usePlayerMovement = () => {
  const { mapData, playerPosition, updatePlayerPosition, addLogEntry, updateBiome, performAbilityCheck, updateHP } = useGameContext();
  const [movementState, setMovementState] = useState<MovementState>({
    isExitingRiver: false
  });

  const isValidPosition = useCallback((x: number, y: number): boolean => {
    // Verifica confini
    if (y < 0 || y >= mapData.length) return false;
    if (x < 0 || x >= mapData[y].length) return false;
    return true;
  }, [mapData]);

  const getTerrainAt = useCallback((x: number, y: number): string => {
    if (y < 0 || y >= mapData.length || x < 0 || !mapData[y] || x >= mapData[y].length) {
      return '.'; // Ritorna un valore di default sicuro se fuori dai limiti
    }
    return mapData[y][x] || '.'; // Ritorna il terreno o un default se la casella è indefinita
  }, [mapData]);

  const canMoveToPosition = useCallback((x: number, y: number): boolean => {
    if (!isValidPosition(x, y)) {
      console.log(`🚫 Movimento bloccato: fuori dai confini (${x}, ${y})`);
      return false;
    }
    
    const terrain = getTerrainAt(x, y);
    
    // Terreno invalicabile: Montagne
    if (terrain === 'M') {
      console.log(`🏔️ Movimento bloccato: montagna a (${x}, ${y})`);
      // Aggiungi messaggio ironico per tentativo di attraversare montagna
      addLogEntry(MessageType.MOVEMENT_FAIL_MOUNTAIN);
      return false;
    }
    
    return true;
  }, [isValidPosition, getTerrainAt]);

  const handleMovement = useCallback((deltaX: number, deltaY: number) => {
    if (mapData.length === 0) return;
    
    const nextX = playerPosition.x + deltaX;
    const nextY = playerPosition.y + deltaY;
    
    if (!canMoveToPosition(nextX, nextY)) return;
    
    const nextTerrain = getTerrainAt(nextX, nextY);
    
    // La logica specifica per i fiumi rimane qui perché è un'azione di movimento speciale
    if (nextTerrain === '~') {
      setMovementState({ isExitingRiver: true });
      addLogEntry(MessageType.MOVEMENT_ACTION_RIVER);
      const success = performAbilityCheck('agilita', 15, true, MessageType.SKILL_CHECK_RIVER_SUCCESS);
      if (!success.success) {
        const damage = Math.floor(Math.random() * 4) + 1;
        updateHP(-damage);
      }
    } else {
      setMovementState({ isExitingRiver: false });
    }
    
    // Chiama la nuova funzione centralizzata
    updatePlayerPosition({ x: nextX, y: nextY }, nextTerrain);
    
    // Gestisce l'ingresso nei rifugi separatamente
    if (nextTerrain === 'R') {
      updateBiome('R');
    }
    
    // Messaggio atmosferico casuale
    if (Math.random() < JOURNAL_CONFIG.AMBIANCE_PROBABILITY) {
      addLogEntry(MessageType.AMBIANCE_RANDOM);
    }
    
  }, [mapData, playerPosition, canMoveToPosition, getTerrainAt, performAbilityCheck, updateHP, updatePlayerPosition, updateBiome, addLogEntry]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Previeni il comportamento di default per i tasti di movimento
    const movementKeys = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
    if (movementKeys.includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
    
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        handleMovement(0, -1); // Su
        break;
      case 's':
      case 'arrowdown':
        handleMovement(0, 1); // Giù
        break;
      case 'a':
      case 'arrowleft':
        handleMovement(-1, 0); // Sinistra
        break;
      case 'd':
      case 'arrowright':
        handleMovement(1, 0); // Destra
        break;
      default:
        // Ignora altri tasti
        break;
    }
  }, [handleMovement]);

  useEffect(() => {
    // Aggiungi listener per eventi tastiera
    window.addEventListener('keydown', handleKeyPress);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return {
    playerPosition,
    movementState,
    canMoveToPosition,
    getTerrainAt
  };
};