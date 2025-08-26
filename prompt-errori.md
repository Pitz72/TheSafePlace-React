Prompt per IDE LLM - Refactoring (Fase 4): Correzione Tipi e Finalizzazione Migrazione Eventi

Obiettivo: Risolvere tutti gli errori di tipo TypeScript derivanti dalla migrazione della logica degli eventi, completando il refactoring di questo modulo.

Istruzioni Dettagliate:

Azione 1: Aggiorna l'interfaccia GameState

File: src/interfaces/gameState.ts
Azione: Aggiungi la proprietà seenEventIds all'interfaccia GameState per tenere traccia degli eventi già visti.
// All'interno dell'interfaccia GameState, aggiungi questa riga dopo currentEvent:
currentEvent: GameEvent | null;
seenEventIds: string[]; // <-- AGGIUNGI QUESTA
Azione 2: Completa e Correggi il gameStore.ts

File: src/stores/gameStore.ts
Azione: Sostituisci l'intero contenuto del file con questa versione completa e corretta. Include tutte le funzioni (reali e placeholder) necessarie per soddisfare l'interfaccia GameStore e risolve tutti gli errori di tipo.
import { create } from 'zustand';
import type { GameState, Screen, AbilityCheckResult } from '../interfaces/gameState';
import type { GameEvent, EventChoice } from '../interfaces/events';
import { createTestCharacter } from '../rules/characterGenerator';
import { MessageType } from '../data/MessageArchive';

interface GameStore extends GameState {}

export const useGameStore = create<GameStore>((set, get) => ({
  // --- STATE PROPERTIES ---
  mapData: [],
  isMapLoading: true,
  playerPosition: { x: -1, y: -1 },
  cameraPosition: { x: 0, y: 0 },
  timeState: { currentTime: 360, day: 1, isDay: true },
  characterSheet: createTestCharacter(),
  lastShortRestTime: null,
  survivalState: { hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } },
  logEntries: [],
  currentBiome: null,
  items: {},
  selectedInventoryIndex: 0,
  currentScreen: 'menu',
  menuSelectedIndex: 0,
  eventDatabase: {},
  currentEvent: null,
  seenEventIds: [],

  // --- ACTIONS ---

  // Funzione helper per mappare il carattere del bioma alla chiave del database
  getBiomeKeyFromChar: (char: string): string => {
    switch (char) {
      case 'C': return 'CITY';
      case 'F': return 'FOREST';
      case '.': return 'PLAINS';
      case 'R': return 'REST_STOP';
      case '~': return 'RIVER';
      case 'V': return 'VILLAGE';
      default: return '';
    }
  },

  triggerEvent: (biomeKey) => {
    const { eventDatabase, currentEvent, seenEventIds, navigateTo } = get();
    if (!eventDatabase[biomeKey] || currentEvent) return;
    const availableEvents = eventDatabase[biomeKey].filter(event => !seenEventIds.includes(event.id));
    if (availableEvents.length === 0) return;
    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    set({ currentEvent: event, seenEventIds: [...seenEventIds, event.id] });
    navigateTo('event');
  },

  updatePlayerPosition: (newPosition, newBiomeChar) => {
    const { currentBiome, triggerEvent, addLogEntry, getBiomeKeyFromChar } = get();
    if (newBiomeChar !== currentBiome) {
      addLogEntry(MessageType.BIOME_ENTER, { biome: newBiomeChar });
    }
    const EVENT_CHANCE = 0.50;
    const biomeKey = getBiomeKeyFromChar(newBiomeChar);
    if (biomeKey && Math.random() < EVENT_CHANCE) {
      setTimeout(() => triggerEvent(biomeKey), 150);
    }
    set({ playerPosition: newPosition, currentBiome: newBiomeChar });
    // La logica di fame/sete/tempo verrà migrata qui in seguito
  },

  resolveChoice: (choice) => {
    const { currentEvent, performAbilityCheck, addItem, addLogEntry, goBack } = get();
    if (!currentEvent) return;
    if (choice.skillCheck) {
      const checkResult = performAbilityCheck(choice.skillCheck.stat, choice.skillCheck.difficulty);
      if (checkResult.success) {
        addLogEntry(MessageType.EVENT_CHOICE, { text: choice.successText });
        if (choice.items_gained) choice.items_gained.forEach(reward => addItem(reward.id, reward.quantity));
      } else {
        addLogEntry(MessageType.EVENT_CHOICE, { text: choice.failureText });
      }
    } else {
      addLogEntry(MessageType.EVENT_CHOICE, { text: choice.resultText });
      if (choice.items_gained) choice.items_gained.forEach(reward => addItem(reward.id, reward.quantity));
    }
    set({ currentEvent: null });
    goBack();
  },

  navigateTo: (screen) => set({ currentScreen: screen }),

  // --- Funzioni Placeholder ---
  initializeGame: async () => console.warn('initializeGame not migrated yet'),
  updateCameraPosition: () => console.warn('updateCameraPosition not migrated yet'),
  goBack: () => console.warn('goBack not migrated yet'),
  advanceTime: () => console.warn('advanceTime not migrated yet'),
  updateHP: () => console.warn('updateHP not migrated yet'),
  performAbilityCheck: () => { console.warn('performAbilityCheck not migrated yet'); return ({ success: false, roll: 0, modifier: 0, total: 0, difficulty: 0 }); },
  getModifier: () => { console.warn('getModifier not migrated yet'); return 0; },
  shortRest: () => console.warn('shortRest not migrated yet'),
  addLogEntry: (type, context) => console.log(`LOG: ${type}`, context),
  updateBiome: () => console.warn('updateBiome not migrated yet'),
  setMenuSelectedIndex: () => console.warn('setMenuSelectedIndex not migrated yet'),
  handleNewGame: () => console.warn('handleNewGame not migrated yet'),
  handleLoadGame: () => console.warn('handleLoadGame not migrated yet'),
  handleStory: () => console.warn('handleStory not migrated yet'),
  handleInstructions: () => console.warn('handleInstructions not migrated yet'),
  handleOptions: () => console.warn('handleOptions not migrated yet'),
  handleBackToMenu: () => console.warn('handleBackToMenu not migrated yet'),
  handleExit: () => console.warn('handleExit not migrated yet'),
  setSelectedInventoryIndex: () => console.warn('setSelectedInventoryIndex not migrated yet'),
  useItem: () => console.warn('useItem not migrated yet'),
  equipItemFromInventory: () => console.warn('equipItemFromInventory not migrated yet'),
  dropItem: () => console.warn('dropItem not migrated yet'),
  updateCharacterSheet: () => console.warn('updateCharacterSheet not migrated yet'),
  addExperience: () => console.warn('addExperience not migrated yet'),
  handleNightConsumption: () => console.warn('handleNightConsumption not migrated yet'),
  consumeFood: () => console.warn('consumeFood not migrated yet'),
  consumeDrink: () => console.warn('consumeDrink not migrated yet'),
  addItem: () => { console.warn('addItem not migrated yet'); return false; },
  removeItem: () => { console.warn('removeItem not migrated yet'); return false; },
  saveCurrentGame: async () => { console.warn('saveCurrentGame not migrated yet'); return false; },
  loadSavedGame: async () => { console.warn('loadSavedGame not migrated yet'); return false; },
  handleQuickSave: async () => { console.warn('handleQuickSave not migrated yet'); return false; },
  handleQuickLoad: async () => { console.warn('handleQuickLoad not migrated yet'); return false; },
  getSaveSlots: () => { console.warn('getSaveSlots not migrated yet'); return []; },
  deleteSave: () => { console.warn('deleteSave not migrated yet'); return false; },
  exportSave: () => { console.warn('exportSave not migrated yet'); return null; },
  importSave: async () => { console.warn('importSave not migrated yet'); return false; },
}));
Azione 3: Pulisci il GameProvider.tsx

File: src/contexts/GameProvider.tsx

Azione: Rimuovi le definizioni di stato e le funzioni che ora vivono nel gameStore. Inoltre, dobbiamo correggere l'oggetto value per non includere più le funzioni migrate.

Rimuovi le seguenti righe di stato:
const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
Rimuovi l'intera funzione triggerEvent.
Rimuovi l'intera funzione resolveChoice.
Trova l'oggetto value alla fine del file e rimuovi da esso le seguenti proprietà: currentEvent, triggerEvent, resolveChoice.
Questo è un intervento massiccio ma necessario. Risolverà gli errori di tipo e ci metterà nella posizione corretta per continuare il refactoring in modo pulito. La prego di applicare queste modifiche. Se ci saranno solo warning minori, potremo ignorarli e procedere al test.
