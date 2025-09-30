import { create } from 'zustand';
import { saveSystem } from '@/utils/saveSystem';
import { downloadFile, readFileAsText, validateSaveFile, generateSaveFilename, createFileInput } from '@/utils/fileUtils';
import { handleStoreError, executeWithRetry, GameErrorCategory } from '@/services/errorService';

import { useGameStore } from '@/stores/gameStore';
import { useCharacterStore } from '@/stores/character/characterStore';
import { useWorldStore } from '@/stores/world/worldStore';
import { useTimeStore } from '@/stores/time/timeStore';
import { useShelterStore } from '@/stores/shelter/shelterStore';
import { useSurvivalStore } from '@/stores/survival/survivalStore';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { useEventStore } from '@/stores/events/eventStore';

export interface SaveState {}

export interface SaveActions {
  saveCurrentGame: (slot: string) => Promise<boolean>;
  loadSavedGame: (slot: string) => Promise<boolean>;
  handleQuickSave: () => Promise<boolean>;
  handleQuickLoad: () => Promise<boolean>;
  getSaveSlots: () => any[];
  deleteSave: (slot: string) => boolean;
  exportSave: (slot: string) => Promise<string | null>;
  importSave: (slot: string) => Promise<boolean>;
  recoverSave: (slot: string) => Promise<boolean>;
}

export type SaveStore = SaveState & SaveActions;

export const useSaveStore = create<SaveStore>((set, get) => ({
    saveCurrentGame: async (filename?: string) => {
        return executeWithRetry({
            operation: async () => {
                const gameStore = useGameStore.getState();
                const characterStore = useCharacterStore.getState();
                const worldStore = useWorldStore.getState();
                const timeStore = useTimeStore.getState();
                const shelterStore = useShelterStore.getState();
                const survivalStore = useSurvivalStore.getState();
                const eventStore = useEventStore.getState();

                const gameData = {
                    game: {
                        isGameStarted: gameStore.isGameStarted,
                        currentLocation: gameStore.currentLocation,
                        gameMode: gameStore.gameMode,
                        difficulty: gameStore.difficulty,
                        gameStats: gameStore.gameStats,
                        isGamePaused: gameStore.isGamePaused,
                        lastSaveTime: Date.now()
                    },
                    character: {
                        name: characterStore.name,
                        status: characterStore.status,
                        stats: characterStore.stats,
                        skills: characterStore.skills,
                        inventory: characterStore.inventory,
                        equipment: characterStore.equipment,
                        conditions: characterStore.conditions,
                        level: characterStore.level,
                        experience: characterStore.experience
                    },
                    world: {
                        playerPosition: worldStore.playerPosition,
                        currentBiome: worldStore.currentBiome
                    },
                    time: {
                        currentTime: timeStore.currentTime,
                        day: timeStore.day,
                        hour: timeStore.hour,
                        minute: timeStore.minute,
                        timeOfDay: timeStore.timeOfDay
                    },
                    shelter: {
                        currentShelter: shelterStore.currentShelter,
                        shelterInventory: shelterStore.shelterInventory,
                        shelterUpgrades: shelterStore.shelterUpgrades,
                        isInShelter: shelterStore.isInShelter
                    },
                    survival: {
                        hunger: survivalStore.hunger,
                        thirst: survivalStore.thirst,
                        fatigue: survivalStore.fatigue,
                        health: survivalStore.health,
                        temperature: survivalStore.temperature,
                        mood: survivalStore.mood,
                        lastRestTime: survivalStore.lastRestTime,
                        restQuality: survivalStore.restQuality
                    },
                    events: {
                        seenEventIds: eventStore.seenEventIds,
                        completedEncounters: eventStore.completedEncounters
                    }
                };

                const saveData = saveSystem.createSaveData(gameData);
                const saveFilename = filename || generateSaveFilename();
                
                await saveSystem.saveToFile(saveData, saveFilename);
                
                set({ 
                    lastSaveTime: Date.now(),
                    currentSaveFile: saveFilename
                });

                useNotificationStore.getState().addNotification({
                    id: `save-${Date.now()}`,
                    type: 'success',
                    message: `Gioco salvato come ${saveFilename}`,
                    duration: 3000
                });

                return saveFilename;
            },
            maxRetries: 3,
            category: GameErrorCategory.SAVE_LOAD,
            onFallback: () => {
                useNotificationStore.getState().addNotification({
                    id: `save-error-${Date.now()}`,
                    type: 'error',
                    message: 'Impossibile salvare il gioco. Riprova più tardi.',
                    duration: 5000
                });
                throw new Error('Save operation failed after retries');
            }
        });
    },

    loadSavedGame: async (slot) => {
        const gameStore = useGameStore.getState();
        const characterStore = useCharacterStore.getState();
        const worldStore = useWorldStore.getState();
        const shelterStore = useShelterStore.getState();
        const survivalStore = useSurvivalStore.getState();
        const notificationStore = useNotificationStore.getState();
        
        return executeWithRetry({
            operation: async () => {
                notificationStore.addNotification({ 
                    type: 'info', 
                    title: 'Caricamento', 
                    message: 'Caricamento partita in corso...', 
                    duration: 1000 
                });

                const saveData = await saveSystem.loadGame(slot);

                if (!saveData) {
                    throw new Error('Salvataggio non trovato');
                }

                if (!saveData.characterSheet || !saveData.gameData) {
                    throw new Error('Dati di salvataggio corrotti');
                }

                // Restore all game state
                characterStore.updateCharacterSheet(saveData.characterSheet);
                worldStore.restoreState({
                    playerPosition: saveData.gameData.playerPosition,
                    currentBiome: saveData.gameData.currentBiome,
                });
                
                // Restore time state separately
                if (saveData.gameData.timeState) {
                    const timeStore = useTimeStore.getState();
                    timeStore.setTime(
                        saveData.gameData.timeState.day,
                        saveData.gameData.timeState.hour,
                        saveData.gameData.timeState.minute
                    );
                }
                
                shelterStore.restoreState({ 
                    shelterAccessState: saveData.gameData.shelterAccessState || {} 
                });
                
                const eventStore = useEventStore.getState();
                eventStore.restoreState({ 
                    seenEventIds: saveData.gameData.seenEventIds || [],
                    completedEncounters: saveData.gameData.completedEncounters || []
                });

                survivalStore.updateSurvival(saveData.survivalState);
                gameStore.enterGame();
                notificationStore.restoreState({ 
                    logEntries: saveData.logEntries || [], 
                    notifications: [] 
                });

                shelterStore.resetShelterInvestigations();
                notificationStore.addNotification({ 
                    type: 'success', 
                    title: 'Caricamento Completato', 
                    message: `Partita caricata con successo.`, 
                    duration: 3000 
                });
                
                return true;
            },
            category: GameErrorCategory.SAVE_LOAD,
            context: {
                operation: 'loadSavedGame',
                slot,
                context: 'Caricamento partita'
            },
            onSuccess: () => {
                // Già gestito nel try block
            },
            onFailure: (error) => {
                handleStoreError(error, GameErrorCategory.SAVE_LOAD, {
                    operation: 'loadSavedGame',
                    slot,
                    context: 'Caricamento partita'
                });
            },
            onFallback: () => {
                notificationStore.addNotification({ 
                    type: 'error', 
                    title: 'Errore Caricamento', 
                    message: 'Impossibile caricare la partita. Verifica l\'integrità del salvataggio.', 
                    duration: 5000 
                });
                return false;
            }
        });
    },

    handleQuickSave: async () => get().saveCurrentGame('quicksave'),
    
    handleQuickLoad: async () => {
        const success = await get().loadSavedGame('quicksave');
        if (success) {
            useGameStore.getState().enterGame();
        }
        return success;
    },

    getSaveSlots: () => {
        try {
            return saveSystem.getSaveSlotInfo();
        } catch (error) {
            handleStoreError(error, GameErrorCategory.SAVE_LOAD, {
                operation: 'getSaveSlots',
                context: 'Recupero informazioni slot di salvataggio'
            });
            return [];
        }
    },
    
    deleteSave: (slot) => {
        try {
            return saveSystem.deleteSave(slot);
        } catch (error) {
            handleStoreError(error, GameErrorCategory.SAVE_LOAD, {
                operation: 'deleteSave',
                slot,
                context: 'Eliminazione salvataggio'
            });
            return false;
        }
    },

    exportSave: async (slot) => {
        const notificationStore = useNotificationStore.getState();
        
        return executeWithRetry({
            operation: async () => {
                const saveContent = saveSystem.exportSave(slot);
                if (!saveContent) {
                    throw new Error('Salvataggio non trovato per l\'export');
                }
                
                const saveData = JSON.parse(saveContent);
                const filename = generateSaveFilename(
                    saveData.characterSheet?.name || 'Sconosciuto', 
                    saveData.characterSheet?.level || 1, 
                    slot
                );
                
                downloadFile({ 
                    filename, 
                    content: saveContent, 
                    mimeType: 'application/json' 
                });
                
                notificationStore.addNotification({ 
                    type: 'success', 
                    title: 'Export Completato', 
                    message: `Salvataggio esportato come ${filename}`, 
                    duration: 4000 
                });
                
                return saveContent;
            },
            category: GameErrorCategory.SAVE_LOAD,
            context: {
                operation: 'exportSave',
                slot,
                context: 'Esportazione salvataggio'
            },
            onSuccess: () => {
                // Già gestito nel try block
            },
            onFailure: (error) => {
                handleStoreError(error, GameErrorCategory.SAVE_LOAD, {
                    operation: 'exportSave',
                    slot,
                    context: 'Esportazione salvataggio'
                });
            },
            onFallback: () => {
                notificationStore.addNotification({ 
                    type: 'error', 
                    title: 'Errore Export', 
                    message: 'Impossibile esportare il salvataggio. Riprova più tardi.', 
                    duration: 4000 
                });
                return null;
            }
        });
    },

    importSave: async (slot) => {
        const notificationStore = useNotificationStore.getState();
        
        return new Promise<boolean>((resolve) => {
            const input = createFileInput(async (file) => {
                const result = await executeWithRetry({
                    operation: async () => {
                        const validation = validateSaveFile(file);
                        if (!validation.valid) {
                            throw new Error(validation.error || 'File non supportato');
                        }
                        
                        const content = await readFileAsText(file);
                        const success = await saveSystem.importSave(content, slot);
                        
                        if (!success) {
                            throw new Error('Import fallito - salvataggio non valido');
                        }
                        
                        notificationStore.addNotification({ 
                            type: 'success', 
                            title: 'Import Completato', 
                            message: `Salvataggio importato con successo nello slot ${slot}`, 
                            duration: 4000 
                        });
                        
                        return true;
                    },
                    category: GameErrorCategory.SAVE_LOAD,
                    context: {
                        operation: 'importSave',
                        slot,
                        fileName: file.name,
                        context: 'Importazione salvataggio'
                    },
                    onSuccess: () => {
                        // Già gestito nel try block
                    },
                    onFailure: (error) => {
                        handleStoreError(error, GameErrorCategory.SAVE_LOAD, {
                            operation: 'importSave',
                            slot,
                            fileName: file.name,
                            context: 'Importazione salvataggio'
                        });
                    },
                    onFallback: () => {
                        notificationStore.addNotification({ 
                            type: 'error', 
                            title: 'Errore Import', 
                            message: 'Impossibile importare il salvataggio. Verifica che il file sia valido.', 
                            duration: 5000 
                        });
                        return false;
                    }
                });
                
                resolve(result);
            });
            
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        });
    },

    recoverSave: async (slot) => {
        const notificationStore = useNotificationStore.getState();
        
        return executeWithRetry({
            operation: async () => {
                const recoveredData = await saveSystem.recoverSave(slot);
                if (!recoveredData) {
                    throw new Error('Impossibile recuperare il salvataggio');
                }
                
                notificationStore.addNotification({ 
                    type: 'success', 
                    title: 'Recupero Riuscito', 
                    message: 'Salvataggio recuperato con successo!', 
                    duration: 5000 
                });
                
                return true;
            },
            category: GameErrorCategory.SAVE_LOAD,
            context: {
                operation: 'recoverSave',
                slot,
                context: 'Recupero salvataggio corrotto'
            },
            onSuccess: () => {
                // Già gestito nel try block
            },
            onFailure: (error) => {
                handleStoreError(error, GameErrorCategory.SAVE_LOAD, {
                    operation: 'recoverSave',
                    slot,
                    context: 'Recupero salvataggio corrotto'
                });
            },
            onFallback: () => {
                notificationStore.addNotification({ 
                    type: 'error', 
                    title: 'Recupero Fallito', 
                    message: 'Impossibile recuperare il salvataggio. Il file potrebbe essere troppo danneggiato.', 
                    duration: 4000 
                });
                return false;
            }
        });
    },
}));
