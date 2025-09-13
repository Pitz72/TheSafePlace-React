import { create } from 'zustand';
import { saveSystem } from '../../utils/saveSystem';
import { downloadFile, readFileAsText, validateSaveFile, generateSaveFilename, createFileInput } from '../../utils/fileUtils';

import { useGameStore } from '../gameStore';
import { useCharacterStore } from '../character/characterStore';
import { useWorldStore } from '../world/worldStore';
import { useShelterStore } from '../shelter/shelterStore';
import { useSurvivalStore } from '../survival/survivalStore';
import { useNotificationStore } from '../notifications/notificationStore';

export interface SaveState {
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

export const useSaveStore = create<SaveState>((set, get) => ({
    saveCurrentGame: async (slot) => {
        const gameStore = useGameStore.getState();
        const characterStore = useCharacterStore.getState();
        const worldStore = useWorldStore.getState();
        const shelterStore = useShelterStore.getState();
        const survivalStore = useSurvivalStore.getState();
        const notificationStore = useNotificationStore.getState();
        try {
          notificationStore.addNotification({ type: 'info', title: 'Salvataggio', message: 'Salvataggio in corso...', duration: 1000 });

          const gameData = {
            timeState: worldStore.timeState,
            playerPosition: worldStore.playerPosition,
            currentScreen: gameStore.currentScreen,
            currentBiome: worldStore.currentBiome,
            shelterAccessState: shelterStore.shelterAccessState,
            seenEventIds: gameStore.seenEventIds,
            gameFlags: {}
          };

          const success = await saveSystem.saveGame(
            characterStore.characterSheet,
            survivalStore.survivalState,
            gameData,
            slot
          );

          if (success) {
            notificationStore.addNotification({ type: 'success', title: 'Salvataggio Completato', message: `Partita salvata nello slot ${slot}`, duration: 2000 });
          } else {
            notificationStore.addNotification({ type: 'error', title: 'Errore Salvataggio', message: 'Impossibile salvare la partita.', duration: 4000 });
          }
          return success;
        } catch (error) {
          console.error('Save error:', error);
          notificationStore.addNotification({ type: 'error', title: 'Errore Salvataggio', message: 'Errore durante il salvataggio.', duration: 4000 });
          return false;
        }
    },

    loadSavedGame: async (slot) => {
        const gameStore = useGameStore.getState();
        const characterStore = useCharacterStore.getState();
        const worldStore = useWorldStore.getState();
        const shelterStore = useShelterStore.getState();
        const survivalStore = useSurvivalStore.getState();
        const notificationStore = useNotificationStore.getState();
        try {
            notificationStore.addNotification({ type: 'info', title: 'Caricamento', message: 'Caricamento partita in corso...', duration: 1000 });

            const saveData = await saveSystem.loadGame(slot);

            if (saveData) {
                if (!saveData.characterSheet || !saveData.gameData) {
                    throw new Error('Dati di salvataggio corrotti');
                }

                characterStore.updateCharacterSheet(saveData.characterSheet);
                worldStore.setState({
                    playerPosition: saveData.gameData.playerPosition,
                    timeState: saveData.gameData.timeState,
                    currentBiome: saveData.gameData.currentBiome,
                });
                shelterStore.setState({ shelterAccessState: saveData.gameData.shelterAccessState || {} });
                gameStore.setState({ seenEventIds: saveData.gameData.seenEventIds || [] });

                survivalStore.setState({ survivalState: saveData.survivalState });
                gameStore.setState({ currentScreen: 'game' });
                notificationStore.setState({ logEntries: [], notifications: [] });

                shelterStore.resetShelterInvestigations();
                notificationStore.addNotification({ type: 'success', title: 'Caricamento Completato', message: `Partita caricata con successo.`, duration: 3000 });
                return true;
            } else {
                notificationStore.addNotification({ type: 'error', title: 'Errore Caricamento', message: 'Salvataggio non trovato.', duration: 4000 });
                return false;
            }
        } catch (error) {
            console.error('Load error:', error);
            notificationStore.addNotification({ type: 'error', title: 'Errore Caricamento', message: `Impossibile caricare la partita.`, duration: 5000 });
            return false;
        }
    },

    handleQuickSave: async () => get().saveCurrentGame('quicksave'),
    handleQuickLoad: async () => {
        const success = await get().loadSavedGame('quicksave');
        if (success) {
            useGameStore.getState().setCurrentScreen('game');
        }
        return success;
    },

    getSaveSlots: () => saveSystem.getSaveSlotInfo(),
    deleteSave: (slot) => saveSystem.deleteSave(slot),

    exportSave: async (slot) => {
        const notificationStore = useNotificationStore.getState();
        try {
            const saveContent = saveSystem.exportSave(slot);
            if (!saveContent) {
                notificationStore.addNotification({ type: 'error', title: 'Export Fallito', message: 'Salvataggio non trovato.', duration: 3000 });
                return null;
            }
            const saveData = JSON.parse(saveContent);
            const filename = generateSaveFilename(saveData.characterSheet?.name || 'Sconosciuto', saveData.characterSheet?.level || 1, slot);
            downloadFile({ filename, content: saveContent, mimeType: 'application/json' });
            notificationStore.addNotification({ type: 'success', title: 'Export Completato', message: `Salvataggio esportato.`, duration: 4000 });
            return saveContent;
        } catch (error) {
            console.error('Export error:', error);
            notificationStore.addNotification({ type: 'error', title: 'Errore Export', message: 'Errore durante l\'esportazione.', duration: 4000 });
            return null;
        }
    },

    importSave: async (slot) => {
        const notificationStore = useNotificationStore.getState();
        return new Promise<boolean>((resolve) => {
            const input = createFileInput(async (file) => {
                try {
                    const validation = validateSaveFile(file);
                    if (!validation.valid) {
                        notificationStore.addNotification({ type: 'error', title: 'File Non Valido', message: validation.error || 'File non supportato.', duration: 4000 });
                        return resolve(false);
                    }
                    const content = await readFileAsText(file);
                    const success = await saveSystem.importSave(content, slot);
                    if (success) {
                        notificationStore.addNotification({ type: 'success', title: 'Import Completato', message: `Salvataggio importato con successo.`, duration: 4000 });
                    } else {
                        notificationStore.addNotification({ type: 'error', title: 'Import Fallito', message: 'Salvataggio non valido o corrotto.', duration: 4000 });
                    }
                    resolve(success);
                } catch (error) {
                    console.error('Import error:', error);
                    notificationStore.addNotification({ type: 'error', title: 'Errore Import', message: 'Errore durante l\'importazione.', duration: 5000 });
                    resolve(false);
                }
            });
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        });
    },

    recoverSave: async (slot) => {
        const notificationStore = useNotificationStore.getState();
        try {
            const recoveredData = await saveSystem.recoverSave(slot);
            if (recoveredData) {
                notificationStore.addNotification({ type: 'success', title: 'Recupero Riuscito', message: 'Salvataggio recuperato con successo!', duration: 5000 });
                return true;
            } else {
                notificationStore.addNotification({ type: 'error', title: 'Recupero Fallito', message: 'Impossibile recuperare il salvataggio.', duration: 4000 });
                return false;
            }
        } catch (error) {
            notificationStore.addNotification({ type: 'error', title: 'Errore Recupero', message: 'Errore durante il recupero.', duration: 4000 });
            return false;
        }
    },
}));
