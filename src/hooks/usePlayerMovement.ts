import { useEffect, useState, useCallback } from 'react';
import { useWorldStore } from '../stores/world/worldStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useGameStore } from '../stores/gameStore'; // Keep for addLogEntry and updateBiome for now
import { checkForEncounter } from '../utils/encounterUtils';

import { MessageType, JOURNAL_CONFIG } from '../data/MessageArchive';

interface MovementState {
  isExitingRiver: boolean;
  isInRiver: boolean;
  riverPosition: { x: number; y: number } | null;
}

export const usePlayerMovement = () => {
  // State from specialized stores using atomic selectors
  const mapData = useWorldStore(state => state.mapData);
  const playerPosition = useWorldStore(state => state.playerPosition);
  const updatePlayerPosition = useWorldStore(state => state.updatePlayerPosition);
  const advanceTime = useWorldStore(state => state.advanceTime);

  const performAbilityCheck = useCharacterStore(state => state.performAbilityCheck);
  const updateHP = useCharacterStore(state => state.updateHP);

  // Actions that are still in gameStore (candidates for future refactoring)
  const addLogEntry = useGameStore(state => state.addLogEntry);
  const updateBiome = useGameStore(state => state.updateBiome);

  const [movementState, setMovementState] = useState<MovementState>({
    isExitingRiver: false,
    isInRiver: false,
    riverPosition: null
  });

  const isValidPosition = useCallback((x: number, y: number): boolean => {
    // Verifica confini
    if (y < 0 || y >= mapData.length) return false;
    if (x < 0 || x >= mapData[y].length) return false;
    return true;
  }, [mapData]);

  const getTerrainAt = useCallback((x: number, y: number): string => {
    // Controlla prima la validità della riga Y e che la riga esista
    if (y < 0 || y >= mapData.length || !mapData[y]) {
      return '.'; // Se la riga è fuori dai limiti o non definita, è una pianura.
    }
    // Ora che sappiamo che la riga è valida, controlliamo la colonna X
    if (x < 0 || x >= mapData[y].length) {
      return '.'; // Se la colonna è fuori dai limiti, è una pianura.
    }
    // Se tutto è valido, restituisci il carattere, o '.' come fallback finale.
    return mapData[y][x] || '.';
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

    // Gestione doppio movimento per fiumi
    if (nextTerrain === '~') {
      if (!movementState.isInRiver) {
        // Prima pressione: entra nel fiume (stato intermedio)
        setMovementState({
          isExitingRiver: false,
          isInRiver: true,
          riverPosition: { x: nextX, y: nextY }
        });
        addLogEntry(MessageType.MOVEMENT_ACTION_RIVER);
        // Primo turno perso - avanza tempo ma non muovere ancora
        advanceTime(10);
        return; // Blocca il movimento, richiede seconda pressione
      } else {
        // Seconda pressione: completa attraversamento con skill check
        setMovementState({ isExitingRiver: true, isInRiver: false, riverPosition: null });
        const success = performAbilityCheck('agilita', 15, true, MessageType.SKILL_CHECK_RIVER_SUCCESS);
        if (!success.success) {
          const damage = Math.floor(Math.random() * 4) + 1;
          updateHP(-damage);
        }
      }
    } else {
      // Reset stato fiume se ci si muove su terreno normale
      setMovementState({ isExitingRiver: false, isInRiver: false, riverPosition: null });
    }

    // Chiama la nuova funzione centralizzata, passando anche il bioma
    updatePlayerPosition({ x: nextX, y: nextY }, nextTerrain);

    // Gestisce l'ingresso nei rifugi separatamente
    if (nextTerrain === 'R') {
      updateBiome('R');
    }

    // Messaggio atmosferico casuale
    if (Math.random() < JOURNAL_CONFIG.AMBIANCE_PROBABILITY) {
      addLogEntry(MessageType.AMBIANCE_RANDOM);
    }

    // Controlla se il movimento ha attivato un incontro
    checkForEncounter(nextX, nextY);

  }, [mapData, playerPosition, canMoveToPosition, getTerrainAt, performAbilityCheck, updateHP, updatePlayerPosition, updateBiome, addLogEntry, advanceTime, movementState]);

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