/**
 * Game Loop - Sistema centrale di gestione dello stato di gioco
 * Implementa ciclo update/render unificato con gestione FPS
 */

import { timeSystem } from '../time/timeSystem';
import { eventBus } from '../events/eventBus';

export interface GameLoopConfig {
  /** Target FPS */
  targetFPS: number;
  /** Massimo frame skip */
  maxFrameSkip: number;
  /** Abilita debug logging */
  debug: boolean;
}

export interface GameState {
  /** Il gioco è in esecuzione */
  isRunning: boolean;
  /** Il gioco è in pausa */
  isPaused: boolean;
  /** FPS corrente */
  currentFPS: number;
  /** Frame count totale */
  frameCount: number;
  /** Tempo di esecuzione */
  runTime: number;
}

export class GameLoop {
  private config: GameLoopConfig;
  private state: GameState;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private frameInterval: number;
  private accumulatedTime: number = 0;
  private fpsCounter: number[] = [];
  private fpsUpdateTime: number = 0;

  // Callbacks
  private updateCallbacks: Set<(deltaTime: number) => void> = new Set();
  private renderCallbacks: Set<() => void> = new Set();
  private fixedUpdateCallbacks: Set<() => void> = new Set();

  constructor(config: Partial<GameLoopConfig> = {}) {
    this.config = {
      targetFPS: 60,
      maxFrameSkip: 5,
      debug: false,
      ...config
    };

    this.frameInterval = 1000 / this.config.targetFPS;

    this.state = {
      isRunning: false,
      isPaused: false,
      currentFPS: 0,
      frameCount: 0,
      runTime: 0
    };
  }

  /**
   * Avvia il game loop
   */
  start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.lastFrameTime = performance.now();
    this.fpsUpdateTime = this.lastFrameTime;

    this.log('Game loop started');
    eventBus.emit('game:started');

    this.loop();
  }

  /**
   * Ferma il game loop
   */
  stop(): void {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    this.state.isPaused = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.log('Game loop stopped');
    eventBus.emit('game:stopped');
  }

  /**
   * Pausa/riprende il game loop
   */
  setPaused(paused: boolean): void {
    this.state.isPaused = paused;
    eventBus.emit(paused ? 'game:paused' : 'game:resumed');
  }

  /**
   * Registra callback per update (chiamato ogni frame)
   */
  onUpdate(callback: (deltaTime: number) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  /**
   * Registra callback per render (chiamato ogni frame dopo update)
   */
  onRender(callback: () => void): () => void {
    this.renderCallbacks.add(callback);
    return () => this.renderCallbacks.delete(callback);
  }

  /**
   * Registra callback per fixed update (chiamato a intervalli fissi)
   */
  onFixedUpdate(callback: () => void): () => void {
    this.fixedUpdateCallbacks.add(callback);
    return () => this.fixedUpdateCallbacks.delete(callback);
  }

  /**
   * Ottiene lo stato corrente del game loop
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Ottiene la configurazione
   */
  getConfig(): GameLoopConfig {
    return { ...this.config };
  }

  private loop = (): void => {
    if (!this.state.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    this.accumulatedTime += deltaTime;

    // Limita frame skip
    const maxAccumulated = this.frameInterval * this.config.maxFrameSkip;
    if (this.accumulatedTime > maxAccumulated) {
      this.accumulatedTime = maxAccumulated;
    }

    // Update fisso
    while (this.accumulatedTime >= this.frameInterval) {
      if (!this.state.isPaused) {
        this.update(this.frameInterval / 1000);
      }
      this.accumulatedTime -= this.frameInterval;
    }

    // Render
    if (!this.state.isPaused) {
      this.render();
    }

    // Aggiorna FPS
    this.updateFPS(currentTime);

    this.lastFrameTime = currentTime;
    this.state.frameCount++;
    this.state.runTime += deltaTime;

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number): void {
    // Aggiorna sistemi core
    timeSystem.update();

    // Chiama update callbacks
    this.updateCallbacks.forEach(callback => {
      try {
        callback(deltaTime);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });

    // Fixed updates (ogni secondo circa)
    if (this.state.frameCount % this.config.targetFPS === 0) {
      this.fixedUpdateCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in fixed update callback:', error);
        }
      });
    }
  }

  private render(): void {
    this.renderCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in render callback:', error);
      }
    });
  }

  private updateFPS(currentTime: number): void {
    this.fpsCounter.push(1000 / (currentTime - this.lastFrameTime));

    // Aggiorna FPS ogni secondo
    if (currentTime - this.fpsUpdateTime >= 1000) {
      const avgFPS = this.fpsCounter.reduce((a, b) => a + b, 0) / this.fpsCounter.length;
      this.state.currentFPS = Math.round(avgFPS);

      this.fpsCounter = [];
      this.fpsUpdateTime = currentTime;

      if (this.config.debug) {
        this.log(`FPS: ${this.state.currentFPS}`);
      }
    }
  }

  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[GameLoop] ${message}`);
    }
  }
}

// Singleton instance
export const gameLoop = new GameLoop();