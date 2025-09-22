/**
 * Time System - Sistema tempo unificato per il gioco
 * Gestisce tempo di gioco, calcolo movimento, eventi temporizzati
 */

export interface GameTime {
  /** Tempo totale di gioco in minuti */
  totalMinutes: number;
  /** Giorno corrente */
  day: number;
  /** Ora del giorno (0-23) */
  hour: number;
  /** Minuto dell'ora (0-59) */
  minute: number;
  /** Fase del giorno */
  phase: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';
  /** È giorno? */
  isDay: boolean;
  /** Velocità del tempo (moltiplicatore) */
  speed: number;
}

export interface TimeConfig {
  /** Minuti reali per minuto di gioco */
  realMinutesPerGameMinute: number;
  /** Ore per giorno di gioco */
  hoursPerDay: number;
  /** Minuti per ora di gioco */
  minutesPerHour: number;
}

export class TimeSystem {
  private currentTime: GameTime;
  private config: TimeConfig;
  private lastUpdate: number = Date.now();
  private isPaused: boolean = false;
  private listeners: Set<(time: GameTime) => void> = new Set();

  constructor(config: TimeConfig = {
    realMinutesPerGameMinute: 1,
    hoursPerDay: 24,
    minutesPerHour: 60
  }) {
    this.config = config;
    this.currentTime = {
      totalMinutes: 0,
      day: 1,
      hour: 8, // Inizia alle 8:00
      minute: 0,
      phase: 'morning',
      isDay: true,
      speed: 1
    };
  }

  /**
   * Aggiorna il tempo di gioco
   */
  update(): void {
    if (this.isPaused) return;

    const now = Date.now();
    const deltaMs = now - this.lastUpdate;
    this.lastUpdate = now;

    // Calcola minuti di gioco passati
    const gameMinutesPassed = (deltaMs / 1000 / 60) * this.currentTime.speed;

    if (gameMinutesPassed > 0) {
      this.advanceTime(gameMinutesPassed);
    }
  }

  /**
   * Avanza il tempo di un numero specifico di minuti
   */
  advanceTime(minutes: number): void {
    this.currentTime.totalMinutes += minutes;

    // Calcola giorno, ora, minuto
    const totalMinutesInDay = this.config.hoursPerDay * this.config.minutesPerHour;
    const totalDays = Math.floor(this.currentTime.totalMinutes / totalMinutesInDay);

    this.currentTime.day = totalDays + 1;

    const minutesInCurrentDay = this.currentTime.totalMinutes % totalMinutesInDay;
    this.currentTime.hour = Math.floor(minutesInCurrentDay / this.config.minutesPerHour);
    this.currentTime.minute = Math.floor(minutesInCurrentDay % this.config.minutesPerHour);

    // Determina fase del giorno
    this.updateDayPhase();

    // Notifica listeners
    this.notifyListeners();
  }

  /**
   * Imposta la velocità del tempo
   */
  setSpeed(speed: number): void {
    this.currentTime.speed = Math.max(0, speed);
  }

  /**
   * Pausa/riprende il tempo
   */
  setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (!paused) {
      this.lastUpdate = Date.now();
    }
  }

  /**
   * Ottiene il tempo corrente
   */
  getCurrentTime(): GameTime {
    return { ...this.currentTime };
  }

  /**
   * Registra un listener per aggiornamenti del tempo
   */
  onTimeUpdate(listener: (time: GameTime) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Converte minuti di gioco in tempo reale
   */
  gameMinutesToRealMs(minutes: number): number {
    return minutes * this.config.realMinutesPerGameMinute * 60 * 1000;
  }

  /**
   * Converte tempo reale in minuti di gioco
   */
  realMsToGameMinutes(ms: number): number {
    return (ms / 1000 / 60) / this.config.realMinutesPerGameMinute;
  }

  /**
   * Calcola costo movimento in minuti di gioco
   */
  calculateMovementCost(distance: number, terrainModifier: number = 1): number {
    // Base: 1 minuto per unità di distanza
    return distance * terrainModifier;
  }

  private updateDayPhase(): void {
    const hour = this.currentTime.hour;

    if (hour >= 5 && hour < 7) {
      this.currentTime.phase = 'dawn';
      this.currentTime.isDay = true;
    } else if (hour >= 7 && hour < 12) {
      this.currentTime.phase = 'morning';
      this.currentTime.isDay = true;
    } else if (hour >= 12 && hour < 14) {
      this.currentTime.phase = 'noon';
      this.currentTime.isDay = true;
    } else if (hour >= 14 && hour < 18) {
      this.currentTime.phase = 'afternoon';
      this.currentTime.isDay = true;
    } else if (hour >= 18 && hour < 20) {
      this.currentTime.phase = 'dusk';
      this.currentTime.isDay = false;
    } else {
      this.currentTime.phase = 'night';
      this.currentTime.isDay = false;
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getCurrentTime());
      } catch (error) {
        console.error('Error in time listener:', error);
      }
    });
  }
}

// Singleton instance
export const timeSystem = new TimeSystem();