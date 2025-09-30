import type { ICharacterSheet } from '../rules/types';
import type { TimeState, SurvivalState, Screen } from '../interfaces/gameState';

// Save system constants
export const SAVE_SLOTS = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5'] as const;
export const CURRENT_SAVE_VERSION = '0.6.2';
export const AUTO_SAVE_SLOT = 'autosave';
export const QUICK_SAVE_SLOT = 'quicksave';

// Save data interfaces using correct project types
export interface SaveMetadata {
  playtime: number; // in minutes
  saveCount: number;
  lastModified: number; // timestamp
  location: string; // current biome or screen
  playerName: string;
  playerLevel: number;
  version: string;
}

export interface GameSaveData {
  timeState: TimeState;
  playerPosition: { x: number; y: number };
  currentScreen: Screen;
  currentBiome: string | null;
  shelterAccessState?: Record<string, any>; // v0.6.1 - sistema rifugi
  weatherState?: any; // v0.6.1 - sistema meteo
  seenEventIds?: string[]; // eventi già visti
  completedEncounters?: string[]; // incontri completati
  gameFlags: Record<string, any>; // for future quest/event tracking
}

export interface SaveData {
  version: string;
  timestamp: number;
  characterSheet: ICharacterSheet;
  survivalState: SurvivalState;
  gameData: GameSaveData;
  metadata: SaveMetadata;
}

export interface SaveSlotInfo {
  slot: string;
  exists: boolean;
  metadata?: SaveMetadata;
  corrupted: boolean;
  saveData?: SaveData; // for preview purposes
}

// Error types
export class SaveSystemError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'SaveSystemError';
  }
}

// Save system implementation
export class SaveSystem {
  private static instance: SaveSystem;
  
  public static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem();
    }
    return SaveSystem.instance;
  }
  
  /**
   * Save complete game state to specified slot
   */
  public async saveGame(
    characterSheet: ICharacterSheet,
    survivalState: SurvivalState,
    gameData: GameSaveData,
    slot: string,
    additionalMetadata: Partial<SaveMetadata> = {}
  ): Promise<boolean> {
    try {
      // Calculate playtime from game data
      const totalMinutes = (gameData.timeState.day - 1) * 1440 + gameData.timeState.currentTime;
      
      const metadata: SaveMetadata = {
        playtime: totalMinutes,
        saveCount: (additionalMetadata.saveCount || 0) + 1,
        lastModified: Date.now(),
        location: gameData.currentBiome || gameData.currentScreen || 'unknown',
        playerName: characterSheet.name,
        playerLevel: characterSheet.level,
        version: CURRENT_SAVE_VERSION,
        ...additionalMetadata
      };
      
      const saveData: SaveData = {
        version: CURRENT_SAVE_VERSION,
        timestamp: Date.now(),
        characterSheet: this.sanitizeCharacterSheet(characterSheet),
        survivalState: this.sanitizeSurvivalState(survivalState),
        gameData: this.sanitizeGameData(gameData),
        metadata
      };
      
      // Validate save data before saving
      this.validateSaveData(saveData);
      
      // Save to localStorage
      const saveKey = this.getSaveKey(slot);
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      
      console.log(`Game saved to slot ${slot}:`, {
        player: saveData.characterSheet.name,
        level: saveData.characterSheet.level,
        location: saveData.metadata.location,
        playtime: Math.floor(saveData.metadata.playtime / 60) + 'h ' + (saveData.metadata.playtime % 60) + 'm'
      });
      
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new SaveSystemError(
        `Failed to save to slot ${slot}: ${errorMessage}`,
        'SAVE_FAILED'
      );
    }
  }
  
  /**
   * Load game state from specified slot
   */
  public async loadGame(slot: string): Promise<SaveData | null> {
    try {
      const saveKey = this.getSaveKey(slot);
      const saveString = localStorage.getItem(saveKey);
      
      if (!saveString) {
        return null;
      }
      
      const saveData = JSON.parse(saveString) as SaveData;
      
      // Validate loaded data
      this.validateSaveData(saveData);
      
      // Migrate if necessary
      const migratedData = this.migrateSaveData(saveData);
      
      console.log(`Game loaded from slot ${slot}:`, {
        player: migratedData.characterSheet.name,
        level: migratedData.characterSheet.level,
        location: migratedData.metadata.location
      });
      
      return migratedData;
    } catch (error) {
      console.error('Load failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new SaveSystemError(
        `Failed to load from slot ${slot}: ${errorMessage}`,
        'LOAD_FAILED'
      );
    }
  }
  
  /**
   * Get information about all save slots
   */
  public getSaveSlotInfo(): SaveSlotInfo[] {
    const allSlots = [...SAVE_SLOTS, AUTO_SAVE_SLOT, QUICK_SAVE_SLOT];
    
    return allSlots.map(slot => {
      try {
        const saveKey = this.getSaveKey(slot);
        const saveString = localStorage.getItem(saveKey);
        
        if (!saveString) {
          return {
            slot,
            exists: false,
            corrupted: false
          };
        }
        
        const saveData = JSON.parse(saveString) as SaveData;
        this.validateSaveData(saveData);
        
        return {
          slot,
          exists: true,
          metadata: saveData.metadata,
          corrupted: false,
          saveData // include for preview
        };
      } catch (error) {
        console.warn(`Corrupted save in slot ${slot}:`, error);
        return {
          slot,
          exists: true,
          corrupted: true
        };
      }
    });
  }
  
  /**
   * Delete save from specified slot
   */
  public deleteSave(slot: string): boolean {
    try {
      const saveKey = this.getSaveKey(slot);
      localStorage.removeItem(saveKey);
      console.log(`Save deleted from slot: ${slot}`);
      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  }
  
  /**
   * Export save data as downloadable JSON string
   */
  public exportSave(slot: string): string | null {
    try {
      const saveData = this.loadGame(slot);
      if (!saveData) return null;
      
      return JSON.stringify(saveData, null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }
  
  /**
   * Import save data from JSON string
   */
  public async importSave(saveContent: string, slot: string): Promise<boolean> {
    try {
      const saveData = JSON.parse(saveContent) as SaveData;
      this.validateSaveData(saveData);
      
      const saveKey = this.getSaveKey(slot);
      localStorage.setItem(saveKey, saveContent);
      
      console.log(`Save imported to slot ${slot}`);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new SaveSystemError(
        `Failed to import save: ${errorMessage}`,
        'IMPORT_FAILED'
      );
    }
  }
  
  /**
   * Attempt to recover a corrupted save by applying fixes
   */
  public async recoverSave(slot: string): Promise<SaveData | null> {
    try {
      const saveKey = this.getSaveKey(slot);
      const saveString = localStorage.getItem(saveKey);
      
      if (!saveString) {
        return null;
      }
      
      const rawData = JSON.parse(saveString);
      
      // Attempt to fix common corruption issues
      const recoveredData = this.attemptSaveRecovery(rawData);
      
      if (recoveredData) {
        // Validate the recovered data
        this.validateSaveData(recoveredData);
        
        // Save the recovered version
        localStorage.setItem(saveKey, JSON.stringify(recoveredData));
        
        console.log(`Save recovered for slot ${slot}`);
        return recoveredData;
      }
      
      return null;
    } catch (error) {
      console.error('Recovery failed:', error);
      return null;
    }
  }
  
  /**
   * Attempt to fix common save corruption issues
   */
  private attemptSaveRecovery(rawData: any): SaveData | null {
    try {
      // Ensure basic structure exists
      if (!rawData.characterSheet || !rawData.gameData) {
        return null;
      }
      
      // Fix missing version
      if (!rawData.version) {
        rawData.version = '0.5.0';
      }
      
      // Fix missing timestamp
      if (!rawData.timestamp) {
        rawData.timestamp = Date.now();
      }
      
      // Fix character sheet issues
      const char = rawData.characterSheet;
      if (char) {
        // Fix missing or invalid HP
        if (typeof char.currentHP !== 'number' || char.currentHP < 0) {
          char.currentHP = Math.max(1, char.maxHP || 10);
        }
        if (typeof char.maxHP !== 'number' || char.maxHP < 1) {
          char.maxHP = Math.max(char.currentHP || 10, 10);
        }
        
        // Fix missing stats
        const defaultStats = { potenza: 10, agilita: 10, vigore: 10, percezione: 10, adattamento: 10, carisma: 10 };
        if (!char.stats) {
          char.stats = defaultStats;
        } else {
          Object.keys(defaultStats).forEach(stat => {
            if (typeof (char.stats as any)[stat] !== 'number') {
              (char.stats as any)[stat] = (defaultStats as any)[stat];
            }
          });
        }
        
        // Fix missing level
        if (typeof char.level !== 'number' || char.level < 1) {
          char.level = 1;
        }
        
        // Fix missing name
        if (!char.name || typeof char.name !== 'string') {
          char.name = 'Sopravvissuto';
        }
      }
      
      // Fix game data issues
      const gameData = rawData.gameData;
      if (gameData) {
        // Fix missing time state
        if (!gameData.timeState) {
          gameData.timeState = { currentTime: 360, day: 1, isDay: true };
        } else {
          if (typeof gameData.timeState.day !== 'number' || gameData.timeState.day < 1) {
            gameData.timeState.day = 1;
          }
          if (typeof gameData.timeState.currentTime !== 'number') {
            gameData.timeState.currentTime = 360;
          }
          if (typeof gameData.timeState.isDay !== 'boolean') {
            gameData.timeState.isDay = gameData.timeState.currentTime >= 360 && gameData.timeState.currentTime < 1200;
          }
        }
        
        // Fix missing position
        if (!gameData.playerPosition) {
          gameData.playerPosition = { x: 0, y: 0 };
        }
        
        // Fix missing shelter access state
        if (!gameData.shelterAccessState) {
          gameData.shelterAccessState = {};
        }
      }
      
      // Fix missing survival state
      if (!rawData.survivalState) {
        rawData.survivalState = {
          hunger: 100,
          thirst: 100,
          lastNightConsumption: { day: 0, consumed: false }
        };
      } else {
        const survival = rawData.survivalState;
        if (typeof survival.hunger !== 'number') survival.hunger = 100;
        if (typeof survival.thirst !== 'number') survival.thirst = 100;
        if (!survival.lastNightConsumption) {
          survival.lastNightConsumption = { day: 0, consumed: false };
        }
      }
      
      // Fix missing metadata
      if (!rawData.metadata) {
        rawData.metadata = {
          playtime: 0,
          saveCount: 1,
          lastModified: Date.now(),
          location: rawData.gameData?.currentBiome || 'unknown',
          playerName: rawData.characterSheet?.name || 'Sconosciuto',
          playerLevel: rawData.characterSheet?.level || 1,
          version: rawData.version || '0.5.0'
        };
      }
      
      return rawData as SaveData;
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      return null;
    }
  }
  
  /**
   * Auto-save current game state (doesn't throw on failure)
   */
  public async autoSave(
    characterSheet: ICharacterSheet,
    survivalState: SurvivalState,
    gameData: GameSaveData
  ): Promise<void> {
    try {
      // Get existing auto-save for playtime tracking
      const existingAutoSave = await this.loadGame(AUTO_SAVE_SLOT);
      const existingPlaytime = existingAutoSave?.metadata.playtime || 0;
      
      await this.saveGame(characterSheet, survivalState, gameData, AUTO_SAVE_SLOT, {
        playtime: existingPlaytime + 1 // increment by 1 minute
      });
    } catch (error) {
      // Auto-save failures should not break the game
      console.warn('Auto-save failed:', error);
    }
  }
  
  // Private helper methods
  private getSaveKey(slot: string): string {
    return `thesafeplace_save_${slot}`;
  }
  
  private sanitizeCharacterSheet(characterSheet: ICharacterSheet): ICharacterSheet {
    return {
      ...characterSheet,
      currentHP: Math.max(0, Math.min(characterSheet.maxHP, Math.floor(characterSheet.currentHP))),
      level: Math.max(1, Math.min(20, Math.floor(characterSheet.level))),
      experience: {
        ...characterSheet.experience,
        currentXP: Math.max(0, Math.floor(characterSheet.experience.currentXP))
      },
      stats: {
        potenza: Math.max(3, Math.min(18, Math.floor(characterSheet.stats.potenza))),
        agilita: Math.max(3, Math.min(18, Math.floor(characterSheet.stats.agilita))),
        vigore: Math.max(3, Math.min(18, Math.floor(characterSheet.stats.vigore))),
        percezione: Math.max(3, Math.min(18, Math.floor(characterSheet.stats.percezione))),
        adattamento: Math.max(3, Math.min(18, Math.floor(characterSheet.stats.adattamento))),
        carisma: Math.max(3, Math.min(18, Math.floor(characterSheet.stats.carisma)))
      }
    };
  }
  
  private sanitizeSurvivalState(survivalState: SurvivalState): SurvivalState {
    return {
      ...survivalState,
      hunger: Math.max(0, Math.min(100, Math.floor(survivalState.hunger))),
      thirst: Math.max(0, Math.min(100, Math.floor(survivalState.thirst)))
    };
  }
  
  private sanitizeGameData(gameData: GameSaveData): GameSaveData {
    return {
      ...gameData,
      timeState: {
        ...gameData.timeState,
        day: Math.max(1, Math.floor(gameData.timeState.day)),
        currentTime: Math.max(0, Math.min(1439, Math.floor(gameData.timeState.currentTime)))
      },
      playerPosition: {
        x: Math.floor(gameData.playerPosition.x),
        y: Math.floor(gameData.playerPosition.y)
      }
    };
  }
  
  private validateSaveData(saveData: SaveData): void {
    if (!saveData.version) {
      throw new Error('Versione salvataggio mancante');
    }
    
    if (!saveData.characterSheet || !saveData.gameData) {
      throw new Error('Dati di salvataggio incompleti');
    }
    
    if (!saveData.characterSheet.name || saveData.characterSheet.name.length === 0) {
      throw new Error('Nome personaggio non valido');
    }
    
    if (saveData.characterSheet.level < 1 || saveData.characterSheet.level > 20) {
      throw new Error('Livello personaggio non valido');
    }
    
    // Validate HP
    if (saveData.characterSheet.currentHP < 0 || saveData.characterSheet.currentHP > saveData.characterSheet.maxHP) {
      throw new Error('Punti vita non validi');
    }
    
    // Validate stats are in valid range (3-18 for D&D style)
    const stats = saveData.characterSheet.stats;
    const statNames = ['potenza', 'agilita', 'vigore', 'percezione', 'adattamento', 'carisma'];
    
    statNames.forEach(statName => {
      const stat = (stats as any)[statName];
      if (typeof stat !== 'number' || stat < 3 || stat > 18) {
        throw new Error(`Statistica ${statName} non valida: ${stat}`);
      }
    });
    
    // Validate time state
    const time = saveData.gameData.timeState;
    if (time.day < 1 || time.currentTime < 0 || time.currentTime >= 1440) {
      throw new Error('Stato temporale non valido');
    }
    
    // Validate survival state
    if (saveData.survivalState) {
      if (saveData.survivalState.hunger < 0 || saveData.survivalState.hunger > 100) {
        throw new Error('Stato fame non valido');
      }
      if (saveData.survivalState.thirst < 0 || saveData.survivalState.thirst > 100) {
        throw new Error('Stato sete non valido');
      }
    }
    
    // Validate position
    const pos = saveData.gameData.playerPosition;
    if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      throw new Error('Posizione giocatore non valida');
    }
  }
  
  private migrateSaveData(saveData: SaveData): SaveData {
    // Handle version migrations
    switch (saveData.version) {
      case '0.4.4':
        return this.migrateFrom044(saveData);
      case '0.5.0':
        return saveData; // Current version
      default:
        console.warn(`Unknown save version: ${saveData.version}`);
        return saveData;
    }
  }
  
  private migrateFrom044(saveData: SaveData): SaveData {
    // Migration logic for v0.4.4 to v0.5.0
    const newMetadata: SaveMetadata = {
      playtime: saveData.metadata?.playtime || 0,
      saveCount: saveData.metadata?.saveCount || 1,
      lastModified: Date.now(),
      location: saveData.gameData.currentBiome || saveData.gameData.currentScreen || 'unknown',
      playerName: saveData.characterSheet.name,
      playerLevel: saveData.characterSheet.level,
      version: CURRENT_SAVE_VERSION
    };
    
    return {
      ...saveData,
      version: CURRENT_SAVE_VERSION,
      metadata: newMetadata
    };
  }
}

// Export singleton instance
export const saveSystem = SaveSystem.getInstance();

// React hook for easy integration with the GameProvider
export const useSaveSystem = () => {
  const saveGame = async (
    characterSheet: ICharacterSheet,
    survivalState: SurvivalState,
    gameData: GameSaveData,
    slot: string,
    additionalMetadata?: Partial<SaveMetadata>
  ): Promise<boolean> => {
    try {
      return await saveSystem.saveGame(characterSheet, survivalState, gameData, slot, additionalMetadata);
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  };
  
  const loadGame = async (slot: string): Promise<SaveData | null> => {
    try {
      return await saveSystem.loadGame(slot);
    } catch (error) {
      console.error('Load error:', error);
      return null;
    }
  };
  
  const getSaveSlots = (): SaveSlotInfo[] => {
    return saveSystem.getSaveSlotInfo();
  };
  
  const deleteSave = (slot: string): boolean => {
    return saveSystem.deleteSave(slot);
  };
  
  const exportSave = (slot: string): string | null => {
    return saveSystem.exportSave(slot);
  };
  
  const importSave = async (content: string, slot: string): Promise<boolean> => {
    try {
      return await saveSystem.importSave(content, slot);
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  };
  
  const autoSave = async (
    characterSheet: ICharacterSheet,
    survivalState: SurvivalState,
    gameData: GameSaveData
  ): Promise<void> => {
    await saveSystem.autoSave(characterSheet, survivalState, gameData);
  };
  
  return {
    saveGame,
    loadGame,
    getSaveSlots,
    deleteSave,
    exportSave,
    importSave,
    autoSave
  };
};