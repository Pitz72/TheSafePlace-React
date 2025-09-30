import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useWorldStore } from '../stores/world/worldStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useNotificationStore } from '../stores/notifications/notificationStore';
import { useShelterStore } from '../stores/shelter/shelterStore';
import { checkForEncounter } from '../utils/encounterUtils';
import { createLogger } from '../services/loggerService';

import { MessageType, JOURNAL_CONFIG } from '../data/MessageArchive';

// Create logger instance for player movement operations
const logger = createLogger('WORLD');

interface MovementState {
  isExitingRiver: boolean;
  isInRiver: boolean;
  riverPosition: { x: number; y: number } | null;
}

interface UsePlayerMovementProps {
  setCurrentScreen: (screen: string) => void;
}

export const usePlayerMovement = ({ setCurrentScreen }: UsePlayerMovementProps) => {
  // World state from the correct source of truth
  const { mapData, playerPosition, updatePlayerPosition } = useWorldStore();
  // Character actions
  const { performAbilityCheck, updateHP } = useCharacterStore();
  // Game actions
  const { advanceTime } = useGameStore();
  // Notification system
  const { addLogEntry } = useNotificationStore();
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
      logger.debug(`Movimento bloccato: fuori dai confini`, { position: { x, y } });
      return false;
    }

    const terrain = getTerrainAt(x, y);

    // Terreno invalicabile: Montagne
    if (terrain === 'M') {
      logger.debug(`Movimento bloccato: montagna`, { position: { x, y }, terrain });
      // Gestisci il messaggio di movimento fallito tramite worldStore
      const { handleFailedMovement } = useWorldStore.getState();
      handleFailedMovement(x, y, terrain);
      return false;
    }

    return true;
  }, [isValidPosition, getTerrainAt, addLogEntry]);

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
        // Il messaggio sarà gestito da worldStore per evitare duplicati
        // Primo turno perso - avanza tempo ma non muovere ancora
        advanceTime(10);
        return; // Blocca il movimento, richiede seconda pressione
      } else {
        // Seconda pressione: completa attraversamento con skill check
        setMovementState({ isExitingRiver: true, isInRiver: false, riverPosition: null });
        const success = performAbilityCheck('agilita', 15);
        if (!success.success) {
          const damage = Math.floor(Math.random() * 4) + 1;
          updateHP(-damage);
        }
      }
    } else {
      // Reset stato fiume se ci si muove su terreno normale
      setMovementState({ isExitingRiver: false, isInRiver: false, riverPosition: null });
    }

    // Chiama la nuova funzione centralizzata, passando anche il bioma e contesto
    const movementContext = {
      isEnteringRiver: nextTerrain === '~' && !movementState.isInRiver
    };
    updatePlayerPosition({ x: nextX, y: nextY }, nextTerrain, movementContext);

    // Gestisce l'ingresso nei rifugi separatamente
    if (nextTerrain === 'R') {
      const { isShelterAccessible } = useShelterStore.getState();
      if (isShelterAccessible(nextX, nextY)) {
        setCurrentScreen('shelter');
        return; // Stop further processing, the shelter screen takes over
      } else {
        // Shelter not accessible - show message and don't move
        addLogEntry(MessageType.ACTION_FAIL, { reason: 'rifugio non accessibile di giorno' });
        return;
      }
    }

    // Messaggio atmosferico casuale
    if (Math.random() < JOURNAL_CONFIG.AMBIANCE_PROBABILITY) {
      addLogEntry(MessageType.AMBIANCE_RANDOM);
    }

    // Controlla se il movimento ha attivato un incontro
    checkForEncounter(nextX, nextY);

  }, [mapData, playerPosition, canMoveToPosition, getTerrainAt, performAbilityCheck, updateHP, updatePlayerPosition, addLogEntry, advanceTime, movementState]);

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