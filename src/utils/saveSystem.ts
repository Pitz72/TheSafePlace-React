import type { ICharacterSheet } from '../rules/types';
import type { TimeState, SurvivalState, Screen } from '../interfaces/gameState';

// Save system constants
export const SAVE_SLOTS = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5'] as const;
export const CURRENT_SAVE_VERSION = '0.5.0';
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
  visitedShelters: Record<string, boolean>;
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
      throw new Error('Missing save version');
    }
    
    if (!saveData.characterSheet || !saveData.gameData) {
      throw new Error('Missing required save data');
    }
    
    if (!saveData.characterSheet.name || saveData.characterSheet.name.length === 0) {
      throw new Error('Invalid character name');
    }
    
    if (saveData.characterSheet.level < 1 || saveData.characterSheet.level > 20) {
      throw new Error('Invalid character level');
    }
    
    // Validate stats are in valid range (3-18 for D&D style)
    const stats = saveData.characterSheet.stats;
    Object.values(stats).forEach(stat => {
      if (stat < 3 || stat > 18) {
        throw new Error('Invalid stat value');
      }
    });
    
    // Validate time state
    const time = saveData.gameData.timeState;
    if (time.day < 1 || time.currentTime < 0 || time.currentTime >= 1440) {
      throw new Error('Invalid time state');
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