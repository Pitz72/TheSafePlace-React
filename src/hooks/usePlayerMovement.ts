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
    if (!isValidPosition(x, y)) return '';
    return mapData[y][x];
  }, [mapData, isValidPosition]);

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
    if (mapData.length === 0) {
      console.log('⚠️ Movimento ignorato: mappa non caricata');
      return;
    }
    
    const currentX = playerPosition.x;
    const currentY = playerPosition.y;
    const nextX = currentX + deltaX;
    const nextY = currentY + deltaY;
    
    console.log(`🎮 Tentativo movimento: (${currentX}, ${currentY}) → (${nextX}, ${nextY})`);
    
    // Verifica se il giocatore è attualmente su un fiume
    const currentTerrain = getTerrainAt(currentX, currentY);
    const isOnRiver = currentTerrain === '~';
    
    // Gestione logica "a due turni" per i fiumi
    if (isOnRiver && movementState.isExitingRiver) {
      console.log('🌊 Secondo turno su fiume: movimento consumato per uscire');
      setMovementState({ isExitingRiver: false });
      return; // Movimento consumato, non aggiornare posizione
    }
    
    // Verifica se può muoversi alla nuova posizione
    if (!canMoveToPosition(nextX, nextY)) {
      return; // Movimento bloccato
    }
    
    // Movimento valido - aggiorna posizione
    updatePlayerPosition({ x: nextX, y: nextY });
    
    // Camera si aggiorna automaticamente tramite useEffect in MapViewport
    
    // Controlla se il giocatore entra in un fiume
    const nextTerrain = getTerrainAt(nextX, nextY);
    if (nextTerrain === '~') {
      console.log('🌊 Giocatore entra in un fiume: eseguendo skill check Agilità');
      setMovementState({ isExitingRiver: true });
      
      // Skill check Agilità vs Difficoltà Media (15) con messaggio azzurro per successo
      const success = performAbilityCheck('agilita', 15, true, MessageType.SKILL_CHECK_RIVER_SUCCESS);
      
      if (!success) {
        // Fallimento: subisci 1d4 danni
        const damage = Math.floor(Math.random() * 4) + 1; // 1d4
        console.log(`💔 Skill check fallito: subisci ${damage} danni dalla corrente`);
        updateHP(-damage);
      }
    } else {
      setMovementState({ isExitingRiver: false });
    }
    
    // Aggiorna bioma per messaggi di ingresso
    updateBiome(nextTerrain);
    
    // Messaggio atmosferico casuale (2% probabilità)
    if (Math.random() < JOURNAL_CONFIG.AMBIANCE_PROBABILITY) {
      addLogEntry(MessageType.AMBIANCE_RANDOM);
    }
    
  }, [mapData, playerPosition, updatePlayerPosition, movementState, canMoveToPosition, getTerrainAt, addLogEntry, updateBiome]);

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