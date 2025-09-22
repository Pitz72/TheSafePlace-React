/**
 * Movement System - Sistema di movimento per il dominio World
 * Gestisce il movimento del giocatore e il calcolo dei costi temporali
 */

import type { Position, WorldState } from './worldState';
import { positionToKey, getBiomeAtPosition, getDistance } from './worldState';
import { timeSystem } from '../../core/time/timeSystem';
import { getConfig } from '../../core/config/gameConfig';
import { eventBus } from '../../core/events/eventBus';

export interface MovementResult {
  success: boolean;
  newPosition: Position;
  timeCost: number;
  reason?: string;
}

export interface MovementValidation {
  canMove: boolean;
  timeCost: number;
  reason?: string;
}

export class MovementSystem {
  /**
   * Valida se un movimento è possibile
   */
  validateMovement(
    from: Position,
    to: Position,
    worldState: WorldState
  ): MovementValidation {
    const distance = getDistance(from, to);

    // Movimento limitato a posizioni adiacenti (4 direzioni + diagonali)
    if (distance > Math.sqrt(2)) {
      return {
        canMove: false,
        timeCost: 0,
        reason: 'Posizione troppo distante'
      };
    }

    // Movimento limitato a passi interi (griglia)
    if (!Number.isInteger(to.x) || !Number.isInteger(to.y)) {
      return {
        canMove: false,
        timeCost: 0,
        reason: 'Movimento non valido sulla griglia'
      };
    }

    const biome = getBiomeAtPosition(worldState.biomes, to);
    const config = getConfig();

    // Calcola costo movimento basato su terreno
    const baseTimeCost = config.movement.baseSpeed;
    const terrainModifier = config.movement.terrainModifiers[biome.id] || 1.0;
    const timeCost = baseTimeCost * terrainModifier;

    return {
      canMove: true,
      timeCost,
      reason: `Movimento in ${biome.name}`
    };
  }

  /**
   * Esegue il movimento del giocatore
   */
  movePlayer(
    direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest',
    worldState: WorldState
  ): MovementResult {
    const currentPos = worldState.playerPosition;
    let newPos: Position;

    // Calcola nuova posizione basata sulla direzione
    switch (direction) {
      case 'north':
        newPos = { x: currentPos.x, y: currentPos.y - 1 };
        break;
      case 'south':
        newPos = { x: currentPos.x, y: currentPos.y + 1 };
        break;
      case 'east':
        newPos = { x: currentPos.x + 1, y: currentPos.y };
        break;
      case 'west':
        newPos = { x: currentPos.x - 1, y: currentPos.y };
        break;
      case 'northeast':
        newPos = { x: currentPos.x + 1, y: currentPos.y - 1 };
        break;
      case 'northwest':
        newPos = { x: currentPos.x - 1, y: currentPos.y - 1 };
        break;
      case 'southeast':
        newPos = { x: currentPos.x + 1, y: currentPos.y + 1 };
        break;
      case 'southwest':
        newPos = { x: currentPos.x - 1, y: currentPos.y + 1 };
        break;
      default:
        return {
          success: false,
          newPosition: currentPos,
          timeCost: 0,
          reason: 'Direzione non valida'
        };
    }

    // Valida movimento
    const validation = this.validateMovement(currentPos, newPos, worldState);
    if (!validation.canMove) {
      return {
        success: false,
        newPosition: currentPos,
        timeCost: 0,
        reason: validation.reason
      };
    }

    // Esegui movimento
    worldState.playerPosition = newPos;
    worldState.visitedPositions.add(positionToKey(newPos));

    // Aggiorna esplorazione
    this.updateExploration(newPos, worldState);

    // Avanza tempo
    timeSystem.advanceTime(validation.timeCost);

    // Emetti evento
    eventBus.emit('world:playerMoved', {
      from: currentPos,
      to: newPos,
      timeCost: validation.timeCost,
      biome: getBiomeAtPosition(worldState.biomes, newPos)
    });

    return {
      success: true,
      newPosition: newPos,
      timeCost: validation.timeCost,
      reason: validation.reason
    };
  }

  /**
   * Calcola posizioni esplorabili attorno al giocatore
   */
  getExplorablePositions(worldState: WorldState): Position[] {
    const { playerPosition, explorationRadius } = worldState;
    const explorable: Position[] = [];

    for (let dx = -explorationRadius; dx <= explorationRadius; dx++) {
      for (let dy = -explorationRadius; dy <= explorationRadius; dy++) {
        const pos = {
          x: playerPosition.x + dx,
          y: playerPosition.y + dy
        };

        const distance = getDistance(playerPosition, pos);
        if (distance <= explorationRadius) {
          explorable.push(pos);
        }
      }
    }

    return explorable;
  }

  /**
   * Ottiene posizioni visitate entro un raggio
   */
  getVisitedPositionsInRadius(worldState: WorldState, radius: number): Position[] {
    const { playerPosition, visitedPositions } = worldState;
    const visited: Position[] = [];

    for (const key of visitedPositions) {
      const pos = this.keyToPosition(key);
      if (getDistance(playerPosition, pos) <= radius) {
        visited.push(pos);
      }
    }

    return visited;
  }

  /**
   * Teletrasporta il giocatore a una posizione (per debug o eventi speciali)
   */
  teleportPlayer(to: Position, worldState: WorldState): void {
    const from = worldState.playerPosition;
    worldState.playerPosition = to;
    worldState.visitedPositions.add(positionToKey(to));

    // Aggiorna esplorazione
    this.updateExploration(to, worldState);

    eventBus.emit('world:playerTeleported', {
      from,
      to,
      biome: getBiomeAtPosition(worldState.biomes, to)
    });
  }

  private updateExploration(position: Position, worldState: WorldState): void {
    const explorablePositions = this.getExplorablePositions(worldState);

    for (const pos of explorablePositions) {
      const key = positionToKey(pos);
      if (!worldState.knownLocations.has(key)) {
        const biome = getBiomeAtPosition(worldState.biomes, pos);
        worldState.knownLocations.set(key, {
          position: pos,
          biome,
          discovered: true,
          visited: worldState.visitedPositions.has(key),
          landmarks: [],
          resources: {}
        });
      }
    }
  }

  private keyToPosition(key: string): Position {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  }
}

// Singleton instance
export const movementSystem = new MovementSystem();