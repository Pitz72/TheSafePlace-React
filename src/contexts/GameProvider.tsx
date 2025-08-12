import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { MessageType, getRandomMessage, JOURNAL_CONFIG } from '../data/MessageArchive';
import { createTestCharacter } from '../rules/characterGenerator';
import { calculateShortRestHealing, isDead } from '../rules/mechanics';
import type { GameState, TimeState, Screen } from '../interfaces/gameState';
import type { IItem } from '../interfaces/items';
import type { ICharacterSheet } from '../rules/types';
import type { LogEntry } from '../data/MessageArchive';
import { itemDatabase } from '../data/items/itemDatabase';

// Il contesto viene creato qui e tipizzato con GameState o undefined
export const GameContext = createContext<GameState | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

// Costanti
const CHAR_WIDTH = 25.6;
const CHAR_HEIGHT = 38.4;
const MINUTES_PER_DAY = 1440;
const DAWN_TIME = 360; // 06:00
const DUSK_TIME = 1200; // 20:00
const DEFAULT_TIME_ADVANCE = 30;

// Dev-only logger
const IS_DEV = import.meta.env.MODE === 'development';
const dbg = (...args: any[]) => {
  if (IS_DEV) console.debug('[GameProvider]', ...args);
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // Tutti gli stati sono definiti qui, seguendo l'interfaccia GameState
  const [mapData, setMapData] = useState<string[]>([]);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [playerPosition, setPlayerPosition] = useState({ x: -1, y: -1 });
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const [timeState, setTimeState] = useState<TimeState>({
    currentTime: DAWN_TIME,
    day: 1,
    isDay: true,
  });
  const [characterSheet, setCharacterSheet] = useState<ICharacterSheet>(createTestCharacter);
  const [lastShortRestTime] = useState<{ day: number; time: number } | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [currentBiome, setCurrentBiome] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, IItem>>({});
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [menuSelectedIndex, setMenuSelectedIndex] = useState(0);

  // --- Funzioni di Navigazione e Logica -- -

  const navigateTo = useCallback((screen: Screen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  }, [currentScreen]);

  const goBack = useCallback(() => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null); // Resetta per evitare loop
    } else {
      setCurrentScreen('menu'); // Fallback di sicurezza
    }
  }, [previousScreen]);


  const formatTime = useCallback((timeMinutes: number): string => {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, []);

  const addLogEntry = useCallback((type: MessageType, context?: Record<string, any>) => {
    const message = getRandomMessage(type, context);
    if (!message) return;

    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: formatTime(timeState.currentTime),
      message,
      type,
      context,
    };
    setLogEntries(prev => [...prev, newEntry].slice(-JOURNAL_CONFIG.MAX_ENTRIES));
  }, [formatTime, timeState.currentTime]);

  const initializeGame = useCallback(async () => {
    try {
      setIsMapLoading(true);
      const response = await fetch('/map.txt');
      if (!response.ok) throw new Error('Failed to load map');
      
      const mapText = await response.text();
      const lines = mapText.split('\n').filter(line => line);
      setMapData(lines);

      let startPos = { x: -1, y: -1 };
      lines.forEach((line, y) => {
        const x = line.indexOf('S');
        if (x !== -1) startPos = { x, y };
      });
      setPlayerPosition(startPos.x !== -1 ? startPos : { x: 75, y: 75 });
      
      setIsMapLoading(false);
      // Non mostrare più il popup, la navigazione gestirà la schermata
      addLogEntry(MessageType.GAME_START);
    } catch (error) {
      console.error("Initialization failed:", error);
      setIsMapLoading(false);
    }
  }, [addLogEntry]);

  useEffect(() => {
    initializeGame();
    setItems(itemDatabase);
  }, [initializeGame]);

  const advanceTime = useCallback((minutes: number = DEFAULT_TIME_ADVANCE) => {
    setTimeState(prev => {
      const newTotalMinutes = prev.currentTime + minutes;
      const newDay = prev.day + Math.floor(newTotalMinutes / MINUTES_PER_DAY);
      const normalizedTime = newTotalMinutes % MINUTES_PER_DAY;
      return {
        currentTime: normalizedTime,
        day: newDay,
        isDay: normalizedTime >= DAWN_TIME && normalizedTime <= DUSK_TIME,
      };
    });
  }, []);

  const updatePlayerPosition = useCallback((newPosition: { x: number; y: number }) => {
    dbg('setPlayerPosition', { from: playerPosition, to: newPosition });
    setPlayerPosition(newPosition);
    advanceTime();
  }, [advanceTime, playerPosition]);
  
  const calculateCameraPosition = useCallback((playerPos: { x: number; y: number }, viewportSize: { width: number; height: number }) => {
    // Arrotondamento stabile per evitare micro-variazioni
    const viewportWidth = Math.round(viewportSize.width);
    const viewportHeight = Math.round(viewportSize.height);
    
    const idealScrollX = (playerPos.x * CHAR_WIDTH) - (viewportWidth / 2);
    const idealScrollY = (playerPos.y * CHAR_HEIGHT) - (viewportHeight / 2);
    const mapWidth = mapData[0]?.length || 0;
    const mapHeight = mapData.length;
    const maxScrollX = Math.max(0, (mapWidth * CHAR_WIDTH) - viewportWidth);
    const maxScrollY = Math.max(0, (mapHeight * CHAR_HEIGHT) - viewportHeight);
    
    const next = {
      x: Math.round(Math.max(0, Math.min(idealScrollX, maxScrollX))),
      y: Math.round(Math.max(0, Math.min(idealScrollY, maxScrollY))),
    };
    dbg('calculateCameraPosition', { playerPos, viewportSize: { width: viewportWidth, height: viewportHeight }, ideal: { x: idealScrollX, y: idealScrollY }, clamped: next, map: { w: mapWidth, h: mapHeight } });
    // Arrotondamento finale per stabilità
    return next;
  }, [mapData]);

  const updateCameraPosition = useCallback((viewportSize: { width: number; height: number }) => {
    // Guard: evita aggiornamenti se dimensioni non cambiano significativamente
    const roundedWidth = Math.round(viewportSize.width);
    const roundedHeight = Math.round(viewportSize.height);
    
    const newCameraPos = calculateCameraPosition(playerPosition, { width: roundedWidth, height: roundedHeight });
    
    // Solo aggiorna se la posizione camera cambia effettivamente
    setCameraPosition(prev => {
      if (prev.x === newCameraPos.x && prev.y === newCameraPos.y) {
        dbg('camera unchanged (skip setState)', { prev });
        return prev; // Nessun cambio, evita re-render
      }
      dbg('setCameraPosition', { from: prev, to: newCameraPos });
      return newCameraPos;
    });
  }, [playerPosition, calculateCameraPosition]);

  const updateHP = useCallback((amount: number) => {
    setCharacterSheet(prev => ({
      ...prev,
      currentHP: Math.max(0, Math.min(prev.maxHP, prev.currentHP + amount)),
    }));
  }, []);

  const getModifier = useCallback((ability: keyof ICharacterSheet['stats']): number => {
    return Math.floor((characterSheet.stats[ability] - 10) / 2);
  }, [characterSheet.stats]);

  const performAbilityCheck = useCallback((ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal = true, successMessageType?: MessageType): boolean => {
    const modifier = getModifier(ability);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    const success = total >= difficulty;
    if (addToJournal) {
      addLogEntry(success ? (successMessageType || MessageType.SKILL_CHECK_SUCCESS) : MessageType.SKILL_CHECK_FAILURE, { ability, roll, modifier, total, difficulty });
    }
    return success;
  }, [getModifier, addLogEntry]);

  const shortRest = useCallback(() => {
    if (isDead(characterSheet.currentHP)) {
      addLogEntry(MessageType.REST_BLOCKED, { reason: 'sei morto' });
      return;
    }
    // Simple cooldown, can be improved later
    const healingAmount = calculateShortRestHealing();
    updateHP(healingAmount);
    addLogEntry(MessageType.HP_RECOVERY, { healingAmount });
    advanceTime(60);
  }, [characterSheet.currentHP, updateHP, addLogEntry, advanceTime]);

  const updateBiome = useCallback((newBiome: string) => {
    if (newBiome !== currentBiome) {
      setCurrentBiome(newBiome);
      addLogEntry(MessageType.BIOME_ENTER, { biome: newBiome });
    }
  }, [currentBiome, addLogEntry]);

  const useItem = useCallback((slotIndex: number) => {
    const itemStack = characterSheet.inventory[slotIndex];
    if (!itemStack) {
      addLogEntry(MessageType.ACTION_FAIL, { action: 'usare un oggetto', reason: 'lo slot è vuoto' });
      return;
    }
    const item = items[itemStack.itemId];
    if (item) {
      addLogEntry(MessageType.ACTION_SUCCESS, { action: `usa ${item.name}` });
      // Future logic for item effects goes here
    }
  }, [characterSheet.inventory, items, addLogEntry]);

  // --- Menu Handlers -- -
  const handleNewGame = useCallback(() => navigateTo('characterCreation'), [navigateTo]);
  const handleLoadGame = useCallback(() => navigateTo('game'), [navigateTo]); // Placeholder
  const handleStory = useCallback(() => navigateTo('story'), [navigateTo]);
  const handleInstructions = useCallback(() => navigateTo('instructions'), [navigateTo]);
  const handleOptions = useCallback(() => navigateTo('options'), [navigateTo]);
  const handleBackToMenu = useCallback(() => navigateTo('menu'), [navigateTo]);
  const handleExit = useCallback(() => console.log('Exit action placeholder'), []);


  // L'oggetto 'value' ora corrisponde esattamente all'interfaccia GameState
  const value: GameState = {
    mapData,
    isMapLoading,
    playerPosition,
    cameraPosition,
    timeState,
    characterSheet,
    lastShortRestTime,
    logEntries,
    currentBiome,
    items,
    selectedInventoryIndex,
    currentScreen,
    setCurrentScreen: navigateTo, // Espone la nuova funzione di navigazione
    goBack,
    menuSelectedIndex,
    setMenuSelectedIndex,
    handleNewGame,
    handleLoadGame,
    handleStory,
    handleInstructions,
    handleOptions,
    handleBackToMenu,
    handleExit,
    initializeGame,
    updatePlayerPosition,
    updateCameraPosition,
    advanceTime,
    updateHP,
    performAbilityCheck,
    getModifier,
    shortRest,
    addLogEntry,
    updateBiome,
    setSelectedInventoryIndex,
    useItem,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};