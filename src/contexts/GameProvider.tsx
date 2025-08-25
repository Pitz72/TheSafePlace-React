import React, { createContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { GameState } from '../interfaces/gameState';
import { useSaveSystem } from '../utils/saveSystem';
import { initializeGlobalErrorHandler } from '../utils/errorHandler';
import { createTestCharacter } from '../rules/characterGenerator';
import { MessageType } from '../data/MessageArchive';

// Il contesto esiste ancora per fornire un punto di accesso unificato,
// ma il suo valore sarà derivato principalmente dallo store Zustand.
export const GameContext = createContext<GameState | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

// Dev-only logger
const IS_DEV = import.meta.env.MODE === 'development';
const dbg = (...args: any[]) => {
  if (IS_DEV) console.debug('[GameProvider]', ...args);
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // Setup sistema gestione errori globale
  useEffect(() => {
    initializeGlobalErrorHandler();
  }, []);
  
  // Hook per sistema di salvataggio
  const saveSystem = useSaveSystem();
  
  // Estrai tutte le azioni e lo stato dallo store Zustand
  const store = useGameStore();

  // Inizializza il gioco al montaggio del componente
  useEffect(() => {
    dbg('Initializing game from provider...');
    store.initializeGame();
  }, [store.initializeGame]);
  
  // Collega le funzioni di salvataggio/caricamento allo store
  useEffect(() => {
    dbg('Setting save functions in store...');
    store.setSaveFunctions({
        saveCurrentGame: async (slot: string) => {
            const { characterSheet, survivalState, timeState, playerPosition, currentScreen, currentBiome, visitedShelters } = useGameStore.getState();
            return saveSystem.saveGame(characterSheet, survivalState, { timeState, playerPosition, currentScreen, currentBiome, visitedShelters, gameFlags: {} }, slot);
        },
        loadSavedGame: async (slot: string) => {
            const data = await saveSystem.loadGame(slot);
            if (data) {
                useGameStore.setState({
                    characterSheet: data.characterSheet,
                    survivalState: data.survivalState,
                    timeState: data.gameData.timeState,
                    playerPosition: data.gameData.playerPosition,
                    currentScreen: data.gameData.currentScreen,
                    currentBiome: data.gameData.currentBiome,
                    visitedShelters: data.gameData.visitedShelters || {},
                });
                return true;
            }
            return false;
        },
        handleQuickSave: async () => {
            const { characterSheet, survivalState, timeState, playerPosition, currentScreen, currentBiome, visitedShelters } = useGameStore.getState();
            const success = await saveSystem.autoSave(characterSheet, survivalState, { timeState, playerPosition, currentScreen, currentBiome, visitedShelters, gameFlags: {} });
            if(success) store.addLogEntry(MessageType.ACTION_SUCCESS, { action: 'Salvataggio rapido' });
            return success;
        },
        handleQuickLoad: async () => {
            const data = await saveSystem.loadGame('autosave');
            if (data) {
                useGameStore.setState({
                    characterSheet: data.characterSheet,
                    survivalState: data.survivalState,
                    timeState: data.gameData.timeState,
                    playerPosition: data.gameData.playerPosition,
                    currentScreen: data.gameData.currentScreen,
                    currentBiome: data.gameData.currentBiome,
                    visitedShelters: data.gameData.visitedShelters || {},
                });
                store.addLogEntry(MessageType.ACTION_SUCCESS, { action: 'Caricamento rapido' });
                return true;
            }
            return false;
        },
        getSaveSlots: saveSystem.getSaveSlots,
        deleteSave: saveSystem.deleteSave,
        exportSave: saveSystem.exportSave,
        importSave: saveSystem.importSave,
    });
  }, [saveSystem, store]);


  // Il valore del contesto è ora un insieme di stati e azioni presi direttamente
  // dallo store Zustand. Usiamo useMemo per evitare di ricreare questo oggetto
  // ad ogni render, a meno che una delle dipendenze non cambi.
  const contextValue = useMemo<GameState>(() => ({
    // Stato dallo store
    mapData: store.mapData,
    isMapLoading: store.isMapLoading,
    playerPosition: store.playerPosition,
    cameraPosition: store.cameraPosition,
    timeState: store.timeState,
    characterSheet: store.characterSheet,
    lastShortRestTime: store.lastShortRestTime,
    survivalState: store.survivalState,
    logEntries: store.logEntries,
    currentBiome: store.currentBiome,
    items: store.items,
    selectedInventoryIndex: store.selectedInventoryIndex,
    currentScreen: store.currentScreen,
    menuSelectedIndex: store.menuSelectedIndex,
    eventDatabase: store.eventDatabase,
    currentEvent: store.currentEvent,
    seenEventIds: store.seenEventIds,

    // Azioni dallo store
    setCurrentScreen: store.setCurrentScreen,
    goBack: store.goBack,
    setMenuSelectedIndex: store.setMenuSelectedIndex,
    initializeGame: store.initializeGame,
    updatePlayerPosition: store.updatePlayerPosition,
    advanceTime: store.advanceTime,
    updateHP: store.updateHP,
    addExperience: store.addExperience,
    addLogEntry: store.addLogEntry,
    updateCharacterSheet: store.updateCharacterSheet,
    setSelectedInventoryIndex: store.setSelectedInventoryIndex,
    getModifier: store.getModifier,
    performAbilityCheck: store.performAbilityCheck,
    shortRest: store.shortRest,
    handleNightConsumption: store.handleNightConsumption,
    updateBiome: store.updateBiome,
    useItem: store.useItem,
    addItem: store.addItem,
    removeItem: store.removeItem,
    equipItemFromInventory: store.equipItemFromInventory,
    dropItem: store.dropItem,
    triggerEvent: store.triggerEvent,
    resolveChoice: store.resolveChoice,

    // Funzioni di salvataggio (collegate allo store)
    saveCurrentGame: store.saveCurrentGame,
    loadSavedGame: store.loadSavedGame,
    handleQuickSave: store.handleQuickSave,
    handleQuickLoad: store.handleQuickLoad,
    getSaveSlots: saveSystem.getSaveSlots,
    deleteSave: saveSystem.deleteSave,
    exportSave: saveSystem.exportSave,
    importSave: saveSystem.importSave,

    // Funzioni che non sono nello store (o non ha senso metterle)
    updateCameraPosition: (viewportSize) => {
        // Questa logica può rimanere qui se dipende da elementi del DOM
        // o può essere spostata se diventa puramente basata su stato.
        // Per ora, la lasciamo come no-op per evitare errori.
    },
    consumeFood: (amount) => store.addLogEntry(MessageType.ACTION_FAIL, { reason: "Funzione deprecata" }),
    consumeDrink: (amount) => store.addLogEntry(MessageType.ACTION_FAIL, { reason: "Funzione deprecata" }),

    // Menu handlers - potrebbero essere spostati o semplificati
    handleNewGame: () => {
        useGameStore.setState({
            characterSheet: createTestCharacter(),
            survivalState: { hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } },
            timeState: { currentTime: 360, day: 1, isDay: true },
            visitedShelters: {},
            logEntries: [],
            currentScreen: 'characterCreation',
        });
    },
    handleLoadGame: () => store.setCurrentScreen('loadGame'),
    handleStory: () => store.setCurrentScreen('story'),
    handleInstructions: () => store.setCurrentScreen('instructions'),
    handleOptions: () => store.setCurrentScreen('options'),
    handleBackToMenu: () => store.setCurrentScreen('menu'),
    handleExit: () => { console.log("Exit action placeholder"); },

  }), [store, saveSystem]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};