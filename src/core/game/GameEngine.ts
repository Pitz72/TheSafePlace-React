/**
 * GameEngine - Motore di gioco principale che coordina tutti i domini
 * Punto centrale di orchestrazione per l'intera applicazione
 */

import { gameLoop } from './gameLoop';
import { timeSystem } from '../time/timeSystem';
import { eventBus } from '../events/eventBus';
import { getConfig } from '../config/gameConfig';

// Domain imports
import type { WorldState } from '../../domains/world/worldState';
import { createInitialWorldState } from '../../domains/world/worldState';
import { movementSystem } from '../../domains/world/movementSystem';

import type { CharacterState } from '../../domains/character/characterState';
import { createDefaultCharacter, updateCharacterStats } from '../../domains/character/characterState';

import type { InventoryState } from '../../domains/inventory/inventoryState';
import { createEmptyInventory } from '../../domains/inventory/inventoryState';

import type { SurvivalState } from '../../domains/survival/survivalState';
import { createInitialSurvivalState, updateSurvivalNeeds, getSurvivalStatus } from '../../domains/survival/survivalState';
import { weatherSystem } from '../../domains/survival/weatherSystem';

import type { NarrativeState } from '../../domains/narrative/narrativeState';
import { createInitialNarrativeState } from '../../domains/narrative/narrativeState';

export interface GameState {
  world: WorldState;
  character: CharacterState;
  inventory: InventoryState;
  survival: SurvivalState;
  narrative: NarrativeState;
  isInitialized: boolean;
  isPaused: boolean;
  gameTime: number;
}

export class GameEngine {
  private state: GameState;
  private isRunning: boolean = false;
  private lastUpdateTime: number = 0;

  constructor() {
    this.state = this.createInitialGameState();
    this.setupEventListeners();
  }

  /**
   * Crea lo stato iniziale del gioco
   */
  private createInitialGameState(): GameState {
    return {
      world: createInitialWorldState(),
      character: createDefaultCharacter(),
      inventory: createEmptyInventory(20, 50), // 20 slot, 50kg max
      survival: createInitialSurvivalState(),
      narrative: createInitialNarrativeState(),
      isInitialized: false,
      isPaused: false,
      gameTime: 0
    };
  }

  /**
   * Inizializza il motore di gioco
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing GameEngine...');

      // Carica configurazione
      const config = getConfig();
      console.log('⚙️ Configuration loaded:', config);

      // Inizializza sistemi core
      this.initializeCoreSystems();

      // Inizializza domini
      await this.initializeDomains();

      // Setup game loop
      this.setupGameLoop();

      this.state.isInitialized = true;
      console.log('✅ GameEngine initialized successfully');

      // Emetti evento di inizializzazione completata
      eventBus.emit('game:engineInitialized', { state: this.getGameState() });

    } catch (error) {
      console.error('❌ Failed to initialize GameEngine:', error);
      throw error;
    }
  }

  /**
   * Avvia il gioco
   */
  start(): void {
    if (!this.state.isInitialized) {
      throw new Error('GameEngine must be initialized before starting');
    }

    if (this.isRunning) return;

    console.log('🎮 Starting game...');
    this.isRunning = true;
    this.state.isPaused = false;

    // Avvia game loop
    gameLoop.start();

    eventBus.emit('game:started');
  }

  /**
   * Ferma il gioco
   */
  stop(): void {
    if (!this.isRunning) return;

    console.log('⏹️ Stopping game...');
    this.isRunning = false;
    this.state.isPaused = true;

    gameLoop.stop();

    eventBus.emit('game:stopped');
  }

  /**
   * Pausa/riprende il gioco
   */
  setPaused(paused: boolean): void {
    this.state.isPaused = paused;
    gameLoop.setPaused(paused);

    eventBus.emit(paused ? 'game:paused' : 'game:resumed');
  }

  /**
   * Ottiene lo stato corrente del gioco
   */
  getGameState(): GameState {
    return { ...this.state };
  }

  /**
   * Aggiorna lo stato del gioco
   */
  updateGameState(updates: Partial<GameState>): void {
    this.state = { ...this.state, ...updates };
    eventBus.emit('game:stateUpdated', { state: this.getGameState() });
  }

  /**
   * Esegue un movimento del giocatore
   */
  movePlayer(direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'): boolean {
    const result = movementSystem.movePlayer(direction, this.state.world);

    if (result.success) {
      // Aggiorna stato mondo
      this.state.world = { ...this.state.world };

      // Applica costi sopravvivenza
      this.state.survival = updateSurvivalNeeds(
        this.state.survival,
        result.timeCost,
        1.5 // Attività fisica intensa
      );

      // Controlla stato sopravvivenza
      const survivalStatus = getSurvivalStatus(this.state.survival);
      if (survivalStatus.overall === 'critical') {
        eventBus.emit('game:criticalSurvival', { status: survivalStatus });
      }

      return true;
    }

    return false;
  }

  /**
   * Salva il gioco
   */
  saveGame(slot: string = 'auto'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const saveData = {
          version: '0.9.9.0',
          timestamp: Date.now(),
          state: this.state
        };

        localStorage.setItem(`the-safe-place-save-${slot}`, JSON.stringify(saveData));
        console.log(`💾 Game saved to slot: ${slot}`);

        eventBus.emit('game:saved', { slot });
        resolve();
      } catch (error) {
        console.error('Failed to save game:', error);
        reject(error);
      }
    });
  }

  /**
   * Carica il gioco
   */
  loadGame(slot: string = 'auto'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const saveDataStr = localStorage.getItem(`the-safe-place-save-${slot}`);
        if (!saveDataStr) {
          reject(new Error(`Save slot '${slot}' not found`));
          return;
        }

        const saveData = JSON.parse(saveDataStr);

        // Version check
        if (saveData.version !== '0.9.9.0') {
          console.warn(`Save version mismatch: ${saveData.version} vs 0.9.9.0`);
        }

        // Ripristina stato
        this.state = saveData.state;
        this.state.isInitialized = true;

        console.log(`📂 Game loaded from slot: ${slot}`);
        eventBus.emit('game:loaded', { slot });

        resolve();
      } catch (error) {
        console.error('Failed to load game:', error);
        reject(error);
      }
    });
  }

  /**
   * Nuovo gioco
   */
  newGame(): void {
    console.log('🆕 Starting new game...');
    this.stop();
    this.state = this.createInitialGameState();
    this.state.isInitialized = true;
    this.start();
  }

  // Private methods

  private initializeCoreSystems(): void {
    // Setup time system
    timeSystem.onTimeUpdate((time) => {
      this.state.gameTime = time.totalMinutes;
      eventBus.emit('game:timeUpdated', { time });
    });

    // Setup weather system
    weatherSystem.update(0); // Initial update
  }

  private async initializeDomains(): Promise<void> {
    // I domini sono già inizializzati nei loro stati iniziali
    // Qui potremmo aggiungere logica di inizializzazione asincrona se necessaria
  }

  private setupGameLoop(): void {
    // Registra callback per update del game loop
    gameLoop.onUpdate((deltaTime) => {
      if (!this.state.isPaused) {
        this.update(deltaTime);
      }
    });

    // Registra callback per render
    gameLoop.onRender(() => {
      // Render logic qui se necessario
    });
  }

  private setupEventListeners(): void {
    // Ascolta eventi importanti
    eventBus.on('world:playerMoved', (data) => {
      // Logica aggiuntiva per movimento
    });

    eventBus.on('character:levelUp', (data) => {
      // Aggiorna statistiche personaggio
      this.state.character = updateCharacterStats(this.state.character);
    });

    eventBus.on('survival:needsCritical', (data) => {
      // Gestisci stati critici
    });
  }

  private update(deltaTime: number): void {
    // Aggiorna sistemi che necessitano update periodico
    weatherSystem.update(deltaTime);

    // Aggiorna sopravvivenza basata sul tempo
    // (Il time system già chiama updateSurvivalNeeds quando necessario)
  }
}

// Singleton instance
export const gameEngine = new GameEngine();