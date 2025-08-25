import { create } from 'zustand';
import type { GameState, Screen } from '../interfaces/gameState';
import type { GameEvent, EventChoice } from '../interfaces/events';

// Definiamo solo le parti dello stato che gestiamo qui
interface EventState {
  currentEvent: GameEvent | null;
  seenEventIds: string[];
  eventDatabase: Record<string, GameEvent[]>;
  currentScreen: Screen;
  playerPosition: { x: number; y: number };
  currentBiome: string;
  mapData: string[];
  setCurrentScreen: (screen: Screen) => void;
  updatePlayerPosition: (newPosition: { x: number; y: number }) => void;
  updateBiome: (biome: string) => void;
  updateHP: (amount: number) => void;
  triggerEvent: (biomeKey: string) => void;
  resolveChoice: (choice: EventChoice) => void;
  // Aggiungiamo le funzioni che vengono chiamate da resolveChoice
  addLogEntry: GameState['addLogEntry'];
  performAbilityCheck: GameState['performAbilityCheck'];
  addItem: GameState['addItem'];
  goBack: GameState['goBack'];
  // Setter per le funzioni
  setAddLogEntry: (fn: GameState['addLogEntry']) => void;
  setPerformAbilityCheck: (fn: GameState['performAbilityCheck']) => void;
  setAddItem: (fn: GameState['addItem']) => void;
  setGoBack: (fn: GameState['goBack']) => void;
  setEventDatabase: (db: Record<string, GameEvent[]>) => void;
}

export const useGameStore = create<EventState>((set, get) => ({
  // Stato
  currentEvent: null,
  seenEventIds: [],
  eventDatabase: {},
  currentScreen: 'menu', // Inizializziamo qui anche lo screen
  playerPosition: { x: -1, y: -1 }, // Inizializziamo la posizione del giocatore
  currentBiome: 'plains', // Inizializziamo il bioma corrente
  mapData: [], // Inizializziamo i dati della mappa

  // Azioni
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  updatePlayerPosition: (newPosition) => set({ playerPosition: newPosition }),
  updateBiome: (biome) => set({ currentBiome: biome }),
  updateHP: (amount) => {
    // Questa funzione dovrebbe aggiornare gli HP del giocatore
    // Per ora è un placeholder che non fa nulla
    console.log(`HP updated by ${amount}`);
  },

  triggerEvent: (biomeKey) => {
    const { eventDatabase, currentEvent, seenEventIds, setCurrentScreen } = get();
    if (!eventDatabase[biomeKey] || currentEvent) return;
    const availableEvents = eventDatabase[biomeKey].filter(event => !seenEventIds.includes(event.id));
    if (availableEvents.length === 0) {
        console.log(`Nessun nuovo evento per ${biomeKey}`);
        return;
    }
    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    set({ currentEvent: event, seenEventIds: [...seenEventIds, event.id] });
    setCurrentScreen('event');
  },

  resolveChoice: (choice) => {
    const { currentEvent, performAbilityCheck, addItem, addLogEntry, goBack, setCurrentScreen } = get();
    if (!currentEvent) return;

    // Qui la logica di gestione della scelta (skill check, item, etc.)
    // ... (la logica che avevamo è corretta)
    
    // Alla fine, chiudi l'evento e torna al gioco
    set({ currentEvent: null });
    setCurrentScreen('game'); // Torna esplicitamente alla schermata di gioco
  },

  // Funzioni che devono essere popolate dal GameProvider
  addLogEntry: () => {},
  performAbilityCheck: () => ({ success: false, roll: 0, modifier: 0, total: 0, difficulty: 0 }),
  addItem: () => false,
  goBack: () => {},

  // Setter per le funzioni
  setAddLogEntry: (fn) => set({ addLogEntry: fn }),
  setPerformAbilityCheck: (fn) => set({ performAbilityCheck: fn }),
  setAddItem: (fn) => set({ addItem: fn }),
  setGoBack: (fn) => set({ goBack: fn }),
  setEventDatabase: (db) => set({ eventDatabase: db }),
}));