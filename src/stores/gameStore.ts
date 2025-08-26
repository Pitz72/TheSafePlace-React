import { create } from 'zustand';
import type { GameState, Screen, AbilityCheckResult, TimeState } from '../interfaces/gameState';
import type { GameEvent, EventChoice } from '../interfaces/events';
import { createTestCharacter } from '../rules/characterGenerator';
import { MessageType, getRandomMessage, JOURNAL_CONFIG, resetJournalState } from '../data/MessageArchive';
import { itemDatabase } from '../data/items/itemDatabase';
import type { IItem } from '../interfaces/items';
import type { ICharacterSheet } from '../rules/types';
import { equipItem } from '../utils/equipmentManager';
import { isDead } from '../rules/mechanics';

// L'interfaccia completa del nostro store.
// Omettiamo le funzioni che non restituiscono valori (void) o che sono gestite internamente
type StoreState = Omit<GameState,
  'setCurrentScreen' | 'goBack' | 'setMenuSelectedIndex' | 'handleNewGame' |
  'handleLoadGame' | 'handleStory' | 'handleInstructions' | 'handleOptions' |
  'handleBackToMenu' | 'handleExit' | 'initializeGame' | 'updatePlayerPosition' |
  'updateCameraPosition' | 'advanceTime' | 'updateHP' | 'performAbilityCheck' |
  'getModifier' | 'shortRest' | 'addLogEntry' | 'updateBiome' |
  'setSelectedInventoryIndex' | 'useItem' | 'equipItemFromInventory' | 'dropItem' |
  'updateCharacterSheet' | 'addExperience' | 'handleNightConsumption' | 'consumeFood' |
  'consumeDrink' | 'addItem' | 'removeItem' | 'saveCurrentGame' | 'loadSavedGame' |
  'handleQuickSave' | 'handleQuickLoad' | 'getSaveSlots' | 'deleteSave' |
  'exportSave' | 'importSave' | 'triggerEvent' | 'resolveChoice'
>;

interface StoreActions {
  // Azioni dirette sullo stato
  initializeGame: () => Promise<void>;
  setCurrentScreen: (screen: Screen) => void;
  goBack: () => void;
  updatePlayerPosition: (newPosition: { x: number; y: number }, newBiomeChar: string) => void;
  advanceTime: (minutes?: number) => void;
  updateHP: (amount: number) => void;
  addExperience: (xpGained: number) => void;
  addLogEntry: (type: MessageType, context?: Record<string, any>) => void;
  updateCharacterSheet: (newSheet: ICharacterSheet) => void;
  setSelectedInventoryIndex: (index: number) => void;
  setMenuSelectedIndex: (index: number) => void;

  // Logica di gioco complessa
  getModifier: (ability: keyof ICharacterSheet['stats']) => number;
  performAbilityCheck: (ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal?: boolean, successMessageType?: MessageType) => AbilityCheckResult;
  shortRest: () => void;
  handleNightConsumption: () => void;
  updateBiome: (newBiomeChar: string) => void;
  useItem: (slotIndex: number) => void;
  addItem: (itemId: string, quantity?: number) => boolean;
  removeItem: (slotIndex: number, quantity?: number) => boolean;
  equipItemFromInventory: (slotIndex: number) => void;
  dropItem: (slotIndex: number) => void;

  // Gestione Eventi
  triggerEvent: (biomeKey: string) => void;
  resolveChoice: (choice: EventChoice) => void;

  // Funzioni di utilità
  formatTime: (timeMinutes: number) => string;
  getBiomeKeyFromChar: (char: string) => string;

  // Placeholder per funzioni gestite da GameProvider (a causa degli hooks)
  setSaveFunctions: (functions: Partial<Pick<GameState, 'saveCurrentGame' | 'loadSavedGame' | 'handleQuickSave' | 'handleQuickLoad' | 'getSaveSlots' | 'deleteSave' | 'exportSave' | 'importSave'>>) => void;
  saveCurrentGame: (slot: string) => Promise<boolean>;
  loadSavedGame: (slot: string) => Promise<boolean>;
  handleQuickSave: () => Promise<boolean>;
  handleQuickLoad: () => Promise<boolean>;
}

const DAWN_TIME = 360; // 06:00
const DUSK_TIME = 1200; // 20:00

export const useGameStore = create<StoreState & StoreActions>((set, get) => ({
  // --- STATO INIZIALE ---
  mapData: [],
  isMapLoading: true,
  playerPosition: { x: -1, y: -1 },
  cameraPosition: { x: 0, y: 0 },
  timeState: { currentTime: DAWN_TIME, day: 1, isDay: true },
  characterSheet: createTestCharacter(),
  lastShortRestTime: null,
  survivalState: { hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } },
  logEntries: [],
  currentBiome: null,
  items: itemDatabase,
  selectedInventoryIndex: 0,
  currentScreen: 'menu',
  previousScreen: null,
  menuSelectedIndex: 0,
  visitedShelters: {},
  eventDatabase: {},
  currentEvent: null,
  seenEventIds: [],

  // --- AZIONI ---

  initializeGame: async () => {
    if (get().isMapLoading === false) return; // Evita reinizializzazione

    resetJournalState();
    set({ logEntries: [] });

    try {
      const response = await fetch('/map.txt');
      const mapText = await response.text();
      const lines = mapText.split('\n').filter(line => line);

      let startPos = { x: 75, y: 75 };
      lines.forEach((line, y) => {
        const x = line.indexOf('S');
        if (x !== -1) startPos = { x, y };
      });

      const eventFiles = ['city_events.json', 'forest_events.json', 'plains_events.json', 'rest_stop_events.json', 'river_events.json', 'unique_events.json', 'village_events.json'];
      const database: Record<string, GameEvent[]> = {};
      for (const file of eventFiles) {
        const res = await fetch(`/events/${file}`);
        const data = await res.json();
        const key = Object.keys(data)[0];
        database[key] = Object.values(data)[0] as GameEvent[];
      }

      set({
        mapData: lines,
        playerPosition: startPos,
        isMapLoading: false,
        eventDatabase: database,
        characterSheet: createTestCharacter(), // Resetta il personaggio
        survivalState: { hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } }, // Resetta sopravvivenza
        timeState: { currentTime: DAWN_TIME, day: 1, isDay: true }, // Resetta tempo
        visitedShelters: {}, // Resetta rifugi
        currentScreen: 'menu',
        currentBiome: get().getBiomeKeyFromChar(lines[startPos.y][startPos.x]),
      });
      get().addLogEntry(MessageType.GAME_START);

    } catch (error) {
      console.error("Initialization failed in store:", error);
      set({ isMapLoading: false });
    }
  },

  setCurrentScreen: (screen) => set(state => ({ currentScreen: screen, previousScreen: state.currentScreen })),

  goBack: () => set(state => {
    if (state.previousScreen) {
      return { currentScreen: state.previousScreen, previousScreen: null };
    }
    return { currentScreen: 'menu' }; // Fallback
  }),

  setMenuSelectedIndex: (index) => set({ menuSelectedIndex: index }),
  setSelectedInventoryIndex: (index) => set({ selectedInventoryIndex: index }),

  formatTime: (timeMinutes: number): string => {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  addLogEntry: (type, context) => {
    const message = getRandomMessage(type, context);
    if (!message) return;
    const newEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: get().formatTime(get().timeState.currentTime),
      message,
      type,
      context,
    };
    set(state => ({ logEntries: [...state.logEntries, newEntry].slice(-JOURNAL_CONFIG.MAX_ENTRIES) }));
  },

  advanceTime: (minutes = 30) => {
    const oldTimeState = get().timeState;
    const newTotalMinutes = oldTimeState.currentTime + minutes;
    const newDay = oldTimeState.day + Math.floor(newTotalMinutes / 1440);
    const normalizedTime = newTotalMinutes % 1440;
    const newIsDay = normalizedTime >= DAWN_TIME && normalizedTime <= DUSK_TIME;

    if (oldTimeState.currentTime < DAWN_TIME && normalizedTime >= DAWN_TIME) get().addLogEntry(MessageType.TIME_DAWN);
    if (oldTimeState.currentTime < DUSK_TIME && normalizedTime >= DUSK_TIME) {
        get().addLogEntry(MessageType.TIME_DUSK);
        get().handleNightConsumption();
    }
    if (oldTimeState.currentTime > 0 && normalizedTime === 0) get().addLogEntry(MessageType.TIME_MIDNIGHT);

    set({ timeState: { currentTime: normalizedTime, day: newDay, isDay: newIsDay } });
  },

  updatePlayerPosition: (newPosition, newBiomeChar) => {
    const oldBiome = get().currentBiome;
    const newBiomeKey = get().getBiomeKeyFromChar(newBiomeChar);

    if (newBiomeKey !== oldBiome) {
      get().addLogEntry(MessageType.BIOME_ENTER, { biome: newBiomeKey });
      get().updateBiome(newBiomeChar); // Gestisce logica rifugi etc.
    }

    set({ playerPosition: newPosition, currentBiome: newBiomeKey });

    // Consumo e XP
    get().addExperience(Math.floor(Math.random() * 2) + 1);
    set(state => ({
      survivalState: {
        ...state.survivalState,
        hunger: Math.max(0, state.survivalState.hunger - 0.2),
        thirst: Math.max(0, state.survivalState.thirst - 0.3),
      }
    }));
    if (get().survivalState.hunger <= 0 || get().survivalState.thirst <= 0) {
      get().updateHP(-1);
      get().addLogEntry(MessageType.HP_DAMAGE, { damage: 1, reason: 'fame e sete' });
    }

    // Trigger Evento
    const EVENT_CHANCE = 0.25;
    if (newBiomeKey && Math.random() < EVENT_CHANCE) {
      setTimeout(() => get().triggerEvent(newBiomeKey), 150);
    }

    get().advanceTime(10); // Avanzamento tempo per movimento
  },

  getBiomeKeyFromChar: (char) => {
    const map: Record<string, string> = {
      'C': 'CITY', 'F': 'FOREST', '.': 'PLAINS', '~': 'RIVER',
      'V': 'VILLAGE', 'S': 'SETTLEMENT', 'R': 'REST_STOP',
    };
    return map[char] || 'UNKNOWN';
  },

  triggerEvent: (biomeKey) => {
    if (get().currentEvent) return; // Evita di sovrascrivere eventi
    const { eventDatabase, seenEventIds } = get();
    const availableEvents = (eventDatabase[biomeKey] || []).filter(event => !seenEventIds.includes(event.id));
    if (availableEvents.length === 0) return;

    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    set(state => ({ currentEvent: event, seenEventIds: [...state.seenEventIds, event.id] }));
    get().setCurrentScreen('event');
  },

  resolveChoice: (choice) => {
    if (!get().currentEvent) return;
    const { addLogEntry, performAbilityCheck, addItem } = get();

    if (choice.skillCheck) {
      const checkResult = performAbilityCheck(choice.skillCheck.stat, choice.skillCheck.difficulty, false);
      const resultText = checkResult.success ? choice.successText : choice.failureText;
      addLogEntry(MessageType.EVENT_CHOICE, { text: `[Prova: ${checkResult.total} vs ${choice.skillCheck.difficulty}] ${resultText}` });
      if (checkResult.success && choice.items_gained) {
        choice.items_gained.forEach(reward => addItem(reward.id, reward.quantity));
      }
    } else {
      if (choice.resultText) addLogEntry(MessageType.EVENT_CHOICE, { text: choice.resultText });
      if (choice.items_gained) {
        choice.items_gained.forEach(reward => addItem(reward.id, reward.quantity));
      }
    }
    set({ currentEvent: null });
    get().goBack();
  },

  updateHP: (amount) => set(state => ({
    characterSheet: {
      ...state.characterSheet,
      currentHP: Math.max(0, Math.min(state.characterSheet.maxHP, state.characterSheet.currentHP + amount)),
    }
  })),

  addExperience: (xpGained) => set(state => {
    const newXP = state.characterSheet.experience.currentXP + xpGained;
    return {
      characterSheet: {
        ...state.characterSheet,
        experience: {
          ...state.characterSheet.experience,
          currentXP: newXP,
          canLevelUp: newXP >= state.characterSheet.experience.xpForNextLevel && state.characterSheet.level < 20,
        }
      }
    }
  }),

  updateCharacterSheet: (newSheet) => set({ characterSheet: newSheet }),

  getModifier: (ability) => Math.floor((get().characterSheet.stats[ability] - 10) / 2),

  performAbilityCheck: (ability, difficulty, addToJournal = true, successMessageType) => {
    const { getModifier, addLogEntry, addExperience } = get();
    const modifier = getModifier(ability);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    const success = total >= difficulty;

    addExperience(success ? 5 : 1);

    const result: AbilityCheckResult = { success, roll, modifier, total, difficulty };

    if (addToJournal) {
      addLogEntry(success ? (successMessageType || MessageType.SKILL_CHECK_SUCCESS) : MessageType.SKILL_CHECK_FAILURE, { ability, roll, modifier, total, difficulty });
    }
    return result;
  },

  shortRest: () => {
    const { characterSheet, addLogEntry, updateHP, advanceTime } = get();
    if (isDead(characterSheet.currentHP)) {
      addLogEntry(MessageType.REST_BLOCKED, { reason: 'sei morto' });
      return;
    }
    const maxRecovery = characterSheet.maxHP - characterSheet.currentHP;
    const recoveryPercentage = 0.8 + (Math.random() * 0.15); // 80-95%
    const healingAmount = Math.floor(maxRecovery * recoveryPercentage);

    updateHP(healingAmount);
    addLogEntry(MessageType.REST_SUCCESS, { healingAmount });

    const restTime = Math.floor(Math.random() * 120) + 120; // 120-240 minuti
    advanceTime(restTime);
  },

  handleNightConsumption: () => {
    const { timeState, characterSheet, items, addLogEntry, updateHP } = get();
    const currentDay = timeState.day;

    let foodConsumed = false;
    let drinkConsumed = false;
    const newInventory = [...characterSheet.inventory];

    // Cerca e consuma cibo
    const foodIndex = newInventory.findIndex(slot => slot && items[slot.itemId]?.effect === 'satiety' && slot.quantity > 0);
    if (foodIndex !== -1) {
      const slot = newInventory[foodIndex]!;
      slot.quantity -= 1;
      if (slot.quantity === 0) newInventory[foodIndex] = null;
      foodConsumed = true;
    }

    // Cerca e consuma bevande
    const drinkIndex = newInventory.findIndex(slot => slot && items[slot.itemId]?.effect === 'hydration' && slot.quantity > 0);
    if (drinkIndex !== -1) {
        const slot = newInventory[drinkIndex]!;
        slot.quantity -= 1;
        if (slot.quantity === 0) newInventory[drinkIndex] = null;
        drinkConsumed = true;
    }

    addLogEntry(MessageType.SURVIVAL_NIGHT_CONSUME);
    if (!foodConsumed || !drinkConsumed) {
        const penalty = (!foodConsumed && !drinkConsumed) ? 3 : 1;
        updateHP(-penalty);
        addLogEntry(MessageType.SURVIVAL_PENALTY);
    }

    set(state => ({
        characterSheet: { ...state.characterSheet, inventory: newInventory },
        survivalState: { ...state.survivalState, lastNightConsumption: { day: currentDay, consumed: true } }
    }));
  },

  updateBiome: (newBiomeChar) => {
    if (newBiomeChar === 'R') {
      const { playerPosition, visitedShelters, addLogEntry, setCurrentScreen, handleNightConsumption, advanceTime, characterSheet, updateHP } = get();
      const shelterKey = `${playerPosition.x},${playerPosition.y}`;
      if (visitedShelters[shelterKey]) {
        addLogEntry(MessageType.DISCOVERY, { discovery: 'rifugio già perquisito' });
        return;
      }
      set(state => ({ visitedShelters: { ...state.visitedShelters, [shelterKey]: true } }));

      if (get().timeState.isDay) {
        setCurrentScreen('shelter');
        addLogEntry(MessageType.DISCOVERY, { discovery: 'rifugio sicuro inesplorato' });
      } else {
        handleNightConsumption();
        const maxRecovery = characterSheet.maxHP - characterSheet.currentHP;
        const nightHealing = Math.floor(maxRecovery * 0.6);
        updateHP(nightHealing);
        addLogEntry(MessageType.REST_SUCCESS, { healingAmount: nightHealing, location: 'rifugio notturno' });
        // Avanza fino all'alba del giorno dopo
        const minutesToDawn = (1440 - get().timeState.currentTime + DAWN_TIME) % 1440;
        advanceTime(minutesToDawn);
      }
    }
  },

  useItem: (slotIndex) => {
    const { characterSheet, items, addLogEntry, updateHP } = get();
    const itemStack = characterSheet.inventory[slotIndex];
    if (!itemStack) return;
    const item = items[itemStack.itemId];
    if (!item || !item.effect) return;

    let effectApplied = 0;
    let messageContext: Record<string, any> = { item: item.name };
    const newInventory = [...characterSheet.inventory];
    const currentStack = newInventory[slotIndex];
    if (!currentStack) return;

    if (item.portionsPerUnit && item.portionEffect) {
      let currentPortions = currentStack.portions ?? item.portionsPerUnit;
      currentPortions -= 1;
      effectApplied = item.portionEffect;
      if (currentPortions > 0) {
        currentStack.portions = currentPortions;
      } else {
        currentStack.quantity -= 1;
        if (currentStack.quantity > 0) currentStack.portions = item.portionsPerUnit;
        else newInventory[slotIndex] = null;
      }
    } else {
      effectApplied = Number(item.effectValue) || 0;
      currentStack.quantity -= 1;
      if (currentStack.quantity === 0) newInventory[slotIndex] = null;
    }

    if (effectApplied > 0) {
      switch (item.effect) {
        case 'heal': updateHP(effectApplied); addLogEntry(MessageType.HP_RECOVERY, { healing: effectApplied }); break;
        case 'satiety': set(s => ({ survivalState: { ...s.survivalState, hunger: Math.min(100, s.survivalState.hunger + effectApplied) }})); break;
        case 'hydration': set(s => ({ survivalState: { ...s.survivalState, thirst: Math.min(100, s.survivalState.thirst + effectApplied) }})); break;
      }
      addLogEntry(MessageType.ITEM_USED, messageContext);
    }
    set(state => ({ characterSheet: { ...state.characterSheet, inventory: newInventory } }));
  },

  addItem: (itemId, quantity = 1) => {
    const { items, characterSheet, addLogEntry } = get();
    const item = items[itemId];
    if (!item) return false;
    const newInventory = [...characterSheet.inventory];
    let added = false;
    if (item.stackable) {
      const slot = newInventory.find(s => s?.itemId === itemId);
      if (slot) { slot.quantity += quantity; added = true; }
    }
    if (!added) {
      const emptyIdx = newInventory.findIndex(s => !s);
      if (emptyIdx !== -1) {
        newInventory[emptyIdx] = { itemId, quantity, portions: item.portionsPerUnit };
        added = true;
      }
    }
    if (added) {
      set({ characterSheet: { ...characterSheet, inventory: newInventory } });
      addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity });
      return true;
    }
    addLogEntry(MessageType.INVENTORY_FULL, { item: item.name });
    return false;
  },

  removeItem: (slotIndex, quantity = 1) => {
    const { characterSheet, items, addLogEntry } = get();
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) return false;
    const newInventory = [...characterSheet.inventory];
    const currentSlot = newInventory[slotIndex]!;
    if (currentSlot.quantity <= quantity) {
      newInventory[slotIndex] = null;
    } else {
      currentSlot.quantity -= quantity;
    }
    set({ characterSheet: { ...characterSheet, inventory: newInventory } });
    return true;
  },

  equipItemFromInventory: (slotIndex) => {
    const { characterSheet, items, addLogEntry } = get();
    const result = equipItem(characterSheet, items, slotIndex);
    if (result.success) {
      set({ characterSheet: result.updatedCharacterSheet });
      addLogEntry(MessageType.ACTION_SUCCESS, { action: result.message });
    } else {
      addLogEntry(MessageType.ACTION_FAIL, { reason: result.message });
    }
  },

  dropItem: (slotIndex) => {
    const { characterSheet, items, addLogEntry } = get();
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) return;
    const item = items[slot.itemId];
    if (item?.type === 'quest') {
        addLogEntry(MessageType.ACTION_FAIL, { reason: `${item.name} è troppo importante.` });
        return;
    }
    get().removeItem(slotIndex, slot.quantity);
    addLogEntry(MessageType.INVENTORY_CHANGE, { action: `Hai gettato ${item.name}.` });
  },

  // --- SAVE/LOAD PLACEHOLDERS ---
  setSaveFunctions: (functions) => set(functions),
  saveCurrentGame: async () => { console.warn("saveCurrentGame not implemented in store"); return false; },
  loadSavedGame: async () => { console.warn("loadSavedGame not implemented in store"); return false; },
  handleQuickSave: async () => { console.warn("handleQuickSave not implemented in store"); return false; },
  handleQuickLoad: async () => { console.warn("handleQuickLoad not implemented in store"); return false; },
}));