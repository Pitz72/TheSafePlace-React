import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { MessageType, getRandomMessage, JOURNAL_CONFIG, resetJournalState } from '../data/MessageArchive';
import { createTestCharacter } from '../rules/characterGenerator';
import { isDead } from '../rules/mechanics';
import { equipItem } from '../utils/equipmentManager';
import { useSaveSystem, type GameSaveData } from '../utils/saveSystem';
import { initializeGlobalErrorHandler } from '../utils/errorHandler';
import type { GameState, TimeState, Screen, AbilityCheckResult } from '../interfaces/gameState';
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
  // Setup sistema gestione errori globale
  useEffect(() => {
    initializeGlobalErrorHandler();
  }, []);
  
  // Hook per sistema di salvataggio
  const { saveGame, loadGame, getSaveSlots, deleteSave, exportSave, importSave, autoSave } = useSaveSystem();

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

  // Usiamo un ref per accedere a timeState senza creare dipendenze nei callback
  const timeStateRef = useRef(timeState);
  useEffect(() => {
    timeStateRef.current = timeState;
  }, [timeState]);

  const [characterSheet, setCharacterSheet] = useState<ICharacterSheet>(createTestCharacter());
  const [lastShortRestTime] = useState<{ day: number; time: number } | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [currentBiome, setCurrentBiome] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, IItem>>({});
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [menuSelectedIndex, setMenuSelectedIndex] = useState(0);
  
  // Sistema sopravvivenza
  const [survivalState, setSurvivalState] = useState({
    hunger: 100,
    thirst: 100,
    lastNightConsumption: { day: 0, consumed: false }
  });
  
  // Sistema rifugi visitati
  const [visitedShelters, setVisitedShelters] = useState<Record<string, boolean>>({});

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
    // Se getRandomMessage restituisce null (sistema anti-spam/cooldown), non aggiungere il messaggio
    if (!message) return;

    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      // Accede al tempo corrente tramite ref per non creare una dipendenza di rendering
      timestamp: formatTime(timeStateRef.current.currentTime),
      message,
      type,
      context,
    };
    setLogEntries(prev => [...prev, newEntry].slice(-JOURNAL_CONFIG.MAX_ENTRIES));
  }, [formatTime]);

  const initializeGame = useCallback(async () => {
    if (gameInitialized) return; // Previeni inizializzazioni multiple
    
    try {
      // Garantisce una tabula rasa per il diario
      setLogEntries([]);
      
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
      setGameInitialized(true);
      
      // Reset dello stato del journal per nuova partita
      resetJournalState();
      
      // Messaggio di benvenuto tramite sistema standard
      addLogEntry(MessageType.GAME_START);
    } catch (error) {
      console.error("Initialization failed:", error);
      setIsMapLoading(false);
    }
  }, [gameInitialized, addLogEntry]);

  useEffect(() => {
    initializeGame();
    setItems(itemDatabase);
  }, [initializeGame]);

  const advanceTime = useCallback((minutes: number = DEFAULT_TIME_ADVANCE) => {
    setTimeState(prev => {
      const newTotalMinutes = prev.currentTime + minutes;
      const newDay = prev.day + Math.floor(newTotalMinutes / MINUTES_PER_DAY);
      const normalizedTime = newTotalMinutes % MINUTES_PER_DAY;
      const newIsDay = normalizedTime >= DAWN_TIME && normalizedTime <= DUSK_TIME;
      
      // Controlla transizioni temporali per messaggi automatici (con prevenzione duplicati)
      const oldTime = prev.currentTime;
      
      // Alba (06:00)
      if (oldTime < DAWN_TIME && normalizedTime >= DAWN_TIME) {
        setTimeout(() => addLogEntry(MessageType.TIME_DAWN), 100);
      }
      
      // Tramonto (20:00) - Consumo automatico notturno
      if (oldTime < DUSK_TIME && normalizedTime >= DUSK_TIME) {
        setTimeout(() => {
          addLogEntry(MessageType.TIME_DUSK);
          // Consumo automatico di cibo e bevande al tramonto
          handleNightConsumption();
        }, 100);
      }
      
      // Mezzanotte (00:00)
      if (oldTime > 0 && normalizedTime === 0) {
        setTimeout(() => addLogEntry(MessageType.TIME_MIDNIGHT), 100);
      }
      
      return {
        currentTime: normalizedTime,
        day: newDay,
        isDay: newIsDay,
      };
    });
  }, [addLogEntry]);

  // Aggiorna HP del personaggio
  const updateHP = useCallback((amount: number) => {
    setCharacterSheet(prev => ({
      ...prev,
      currentHP: Math.max(0, Math.min(prev.maxHP, prev.currentHP + amount)),
    }));
  }, []);

  // Aggiunge esperienza al personaggio
  const addExperience = useCallback((xpGained: number) => {
    setCharacterSheet(prev => {
      const newXP = prev.experience.currentXP + xpGained;
      const canLevelUp = newXP >= prev.experience.xpForNextLevel && prev.level < 20;
      
      return {
        ...prev,
        experience: {
          ...prev.experience,
          currentXP: newXP,
          canLevelUp
        }
      };
    });
    
    // XP guadagnato silenziosamente - non mostrare messaggio per evitare spam nel journal
  }, [addLogEntry]);

  const updatePlayerPosition = useCallback((newPosition: { x: number; y: number }) => {
    dbg('setPlayerPosition', { from: playerPosition, to: newPosition });
    setPlayerPosition(newPosition);
    
    // Guadagna XP per esplorazione (1-2 XP per passo)
    const xpGained = Math.floor(Math.random() * 2) + 1;
    addExperience(xpGained);
    
    // Consuma fame e sete gradualmente
    setSurvivalState(prev => {
      const hungerLoss = Math.random() * 0.5 + 0.2; // 0.2-0.7 per passo
      const thirstLoss = Math.random() * 0.8 + 0.3; // 0.3-1.1 per passo
      
      const newHunger = Math.max(0, prev.hunger - hungerLoss);
      const newThirst = Math.max(0, prev.thirst - thirstLoss);
      
      // Danno da fame/sete se entrambi sono a 0
      if (newHunger === 0 && newThirst === 0) {
        // Ogni 5 passi con fame/sete a 0, perde 1 HP
        const stepsWithoutFood = Math.floor((100 - newHunger) / 0.5);
        const stepsWithoutWater = Math.floor((100 - newThirst) / 0.8);
        if (stepsWithoutFood % 5 === 0 || stepsWithoutWater % 5 === 0) {
          updateHP(-1);
          addLogEntry(MessageType.HP_DAMAGE, { damage: 1, reason: 'fame e sete' });
        }
      }
      
      return {
        ...prev,
        hunger: newHunger,
        thirst: newThirst
      };
    });
    
    advanceTime();
  }, [advanceTime, playerPosition, addExperience, updateHP, addLogEntry]);
  
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



  const getModifier = useCallback((ability: keyof ICharacterSheet['stats']): number => {
    return Math.floor((characterSheet.stats[ability] - 10) / 2);
  }, [characterSheet.stats]);

  const performAbilityCheck = useCallback((ability: keyof ICharacterSheet['stats'], difficulty: number, addToJournal = true, successMessageType?: MessageType): AbilityCheckResult => {
    const modifier = getModifier(ability);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    const success = total >= difficulty;
    
    if (success) {
      const xpGained = Math.floor(Math.random() * 6) + 5;
      addExperience(xpGained);
    } else {
      const xpGained = Math.floor(Math.random() * 3) + 1;
      addExperience(xpGained);
    }
    
    const result: AbilityCheckResult = { success, roll, modifier, total, difficulty };
    
    if (addToJournal) {
      addLogEntry(success ? (successMessageType || MessageType.SKILL_CHECK_SUCCESS) : MessageType.SKILL_CHECK_FAILURE, { ability, roll, modifier, total, difficulty });
    }
    return result;
  }, [getModifier, addLogEntry, addExperience]);

  const shortRest = useCallback(() => {
    if (isDead(characterSheet.currentHP)) {
      addLogEntry(MessageType.REST_BLOCKED, { reason: 'sei morto' });
      return;
    }
    
    // Riposo migliorato: recupera quasi tutti gli HP (80-95%)
    const maxRecovery = characterSheet.maxHP - characterSheet.currentHP;
    const recoveryPercentage = 0.8 + (Math.random() * 0.15); // 80-95%
    const healingAmount = Math.floor(maxRecovery * recoveryPercentage);
    
    updateHP(healingAmount);
    addLogEntry(MessageType.REST_SUCCESS, { healingAmount });
    
    // Il riposo consuma 2-4 ore
    const restTime = Math.floor(Math.random() * 120) + 120; // 120-240 minuti
    advanceTime(restTime);
  }, [characterSheet.currentHP, characterSheet.maxHP, updateHP, addLogEntry, advanceTime]);

  const updateBiome = useCallback((newBiome: string) => {
    if (newBiome !== currentBiome) {
      setCurrentBiome(newBiome);
      
      // Gestione speciale per i rifugi (tile 'R')
      if (newBiome === 'R') {
        const shelterKey = `${playerPosition.x},${playerPosition.y}`;
        
        // Controlla se il rifugio è già stato visitato
        if (visitedShelters[shelterKey]) {
          setTimeout(() => {
            addLogEntry(MessageType.DISCOVERY, { 
              discovery: 'rifugio già perquisito - non c\'è altro da trovare' 
            });
          }, 100);
          return;
        }
        
        // Marca il rifugio come visitato
        setVisitedShelters(prev => ({
          ...prev,
          [shelterKey]: true
        }));
        
        if (timeStateRef.current.isDay) {
          // Di giorno: apri schermata rifugio
          setTimeout(() => {
            navigateTo('shelter');
            addLogEntry(MessageType.DISCOVERY, { discovery: 'rifugio sicuro inesplorato' });
          }, 100);
        } else {
          // Di notte: passa automaticamente al giorno successivo
          setTimeout(() => {
            // Consuma cibo e bevande per la notte
            handleNightConsumption();
            
            // Passa al mattino successivo
            setTimeState(prev => ({
              currentTime: DAWN_TIME,
              day: prev.day + 1,
              isDay: true
            }));
            
            // Recupera 60% degli HP
            const maxRecovery = characterSheet.maxHP - characterSheet.currentHP;
            const nightHealing = Math.floor(maxRecovery * 0.6);
            updateHP(nightHealing);
            
            addLogEntry(MessageType.REST_SUCCESS, { 
              healingAmount: nightHealing,
              location: 'rifugio notturno',
              newDay: timeStateRef.current.day + 1
            });
          }, 100);
        }
      } else {
        // Messaggio automatico cambio bioma sincrono
        addLogEntry(MessageType.BIOME_ENTER, { biome: newBiome });
      }
    }
  }, [currentBiome, addLogEntry, navigateTo, characterSheet.maxHP, characterSheet.currentHP, updateHP]);

  const useItem = useCallback((slotIndex: number) => {
    const itemStack = characterSheet.inventory[slotIndex];
    if (!itemStack) {
      addLogEntry(MessageType.ACTION_FAIL, { action: 'usare un oggetto', reason: 'lo slot è vuoto' });
      return;
    }
    
    const item = items[itemStack.itemId];
    if (!item || !item.effect) {
      addLogEntry(MessageType.ACTION_FAIL, { action: 'usare un oggetto', reason: 'oggetto non valido o non utilizzabile' });
      return;
    }


    
    setCharacterSheet(prevSheet => {
      const newInventory = [...prevSheet.inventory];
      const currentStack = newInventory[slotIndex];
      if (!currentStack) return prevSheet;

      let effectApplied = 0;
      let messageContext: Record<string, any> = { item: item.name };

      if (item.portionsPerUnit && item.portionEffect) {
        let currentPortions = currentStack.portions ?? item.portionsPerUnit;
        
        currentPortions -= 1;
        effectApplied = item.portionEffect;
        
        if (currentPortions > 0) {
          currentStack.portions = currentPortions;
          messageContext.portion = item.portionSize || 'porzione';
          messageContext.remaining = currentPortions;
        } else {
          currentStack.quantity -= 1;
          if (currentStack.quantity > 0) {
            currentStack.portions = item.portionsPerUnit; // Ricarica le porzioni per la nuova unità
          } else {
            newInventory[slotIndex] = null; // Rimuovi lo stack
          }
          messageContext.portion = 'ultima porzione';
        }

      } else {
        // Logica per oggetti senza porzioni (consuma intera unità)
        effectApplied = Number(item.effectValue) || 0;
        currentStack.quantity -= 1;
        if (currentStack.quantity === 0) {
          newInventory[slotIndex] = null;
        }
      }

      // Applica effetti solo se c'è un effetto da applicare
      if (effectApplied > 0) {
        switch (item.effect) {
          case 'heal':
            updateHP(effectApplied);
            addLogEntry(MessageType.HP_RECOVERY, { healing: effectApplied });
            break;
          case 'satiety':
            setSurvivalState(prev => ({
              ...prev,
              hunger: Math.min(100, prev.hunger + effectApplied)
            }));
            break;
          case 'hydration':
            setSurvivalState(prev => ({
              ...prev,
              thirst: Math.min(100, prev.thirst + effectApplied)
            }));
            break;
        }
        addLogEntry(MessageType.ITEM_USED, messageContext);
      } else {
         addLogEntry(MessageType.ACTION_FAIL, { action: 'usare un oggetto', reason: 'effetto nullo o non applicabile' });
      }

      return { ...prevSheet, inventory: newInventory };
    });

  }, [characterSheet, items, addLogEntry, updateHP, setSurvivalState]);

  const addItem = useCallback((itemId: string, quantity: number = 1): boolean => {
    const item = items[itemId];
    if (!item) {
        addLogEntry(MessageType.ACTION_FAIL, { reason: `Oggetto ${itemId} non trovato nel database` });
        return false;
    }

    const newInventory = [...characterSheet.inventory];
    let itemAdded = false;

    // Cerca slot esistente per oggetti stackable
    if (item.stackable) {
        for (let i = 0; i < newInventory.length; i++) {
            const slot = newInventory[i];
            if (slot && slot.itemId === itemId) {
                slot.quantity += quantity;
                addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity: quantity, total: slot.quantity });
                itemAdded = true;
                break;
            }
        }
    }

    // Se non è stato impilato, cerca il primo slot vuoto
    if (!itemAdded) {
        for (let i = 0; i < newInventory.length; i++) {
            if (!newInventory[i]) {
                const newItem = {
                    itemId,
                    quantity,
                    portions: item.portionsPerUnit ? item.portionsPerUnit : undefined
                };
                newInventory[i] = newItem;
                addLogEntry(MessageType.ITEM_FOUND, { item: item.name, quantity: quantity });
                itemAdded = true;
                break;
            }
        }
    }
    
    if (itemAdded) {
        setCharacterSheet(prev => ({ ...prev, inventory: newInventory }));
        return true;
    } else {
        addLogEntry(MessageType.INVENTORY_FULL, { item: item.name });
        return false;
    }
}, [characterSheet.inventory, items, addLogEntry]);

  // Rimuove un oggetto dall'inventario
  const removeItem = useCallback((slotIndex: number, quantity: number = 1) => {
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) {
      addLogEntry(MessageType.ACTION_FAIL, { reason: 'Nessun oggetto in questo slot' });
      return false;
    }
    
    const item = items[slot.itemId];
    if (!item) {
      addLogEntry(MessageType.ACTION_FAIL, { reason: 'Oggetto non trovato nel database' });
      return false;
    }
    
    setCharacterSheet(prev => {
      const newInventory = [...prev.inventory];
      const currentSlot = newInventory[slotIndex];
      
      if (!currentSlot) return prev;
      
      if (currentSlot.quantity <= quantity) {
        // Rimuovi completamente l'oggetto
        newInventory[slotIndex] = null;
        addLogEntry(MessageType.ACTION_SUCCESS, { 
          action: `hai lasciato cadere ${item.name}` 
        });
      } else {
        // Decrementa quantità
        currentSlot.quantity -= quantity;
        addLogEntry(MessageType.ACTION_SUCCESS, { 
          action: `hai lasciato cadere ${quantity}x ${item.name}` 
        });
      }
      
      return { ...prev, inventory: newInventory };
    });
    
    return true;
  }, [characterSheet.inventory, items, addLogEntry]);

  // Equipaggia un oggetto dall'inventario
  const equipItemFromInventory = useCallback((slotIndex: number) => {
    const result = equipItem(characterSheet, items, slotIndex);
    
    if (result.success) {
      setCharacterSheet(result.updatedCharacterSheet);
      addLogEntry(MessageType.ACTION_SUCCESS, { action: result.message });
      
      if (result.unequippedItem) {
        addLogEntry(MessageType.INVENTORY_CHANGE, { 
          action: `${result.unequippedItem.item.name} aggiunto all'inventario` 
        });
      }
    } else {
      addLogEntry(MessageType.ACTION_FAIL, { reason: result.message });
    }
  }, [characterSheet, items, addLogEntry]);

  // Getta un oggetto dall'inventario
  const dropItem = useCallback((slotIndex: number) => {
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) {
      addLogEntry(MessageType.ACTION_FAIL, { reason: 'Nessun oggetto in questo slot.' });
      return;
    }
    
    const item = items[slot.itemId];
    if (!item) {
      addLogEntry(MessageType.ACTION_FAIL, { reason: 'Oggetto non trovato.' });
      return;
    }
    
    // Verifica se è un oggetto importante (quest item)
    const itemType = typeof item.type === 'string' ? item.type.toLowerCase() : item.type;
    if (itemType === 'quest') {
      addLogEntry(MessageType.ACTION_FAIL, { reason: `${item.name} è troppo importante per essere gettato.` });
      return;
    }
    
    // Rimuovi dall'inventario
    setCharacterSheet(prev => ({
      ...prev,
      inventory: prev.inventory.map((invSlot, index) => 
        index === slotIndex ? null : invSlot
      )
    }));
    
    addLogEntry(MessageType.INVENTORY_CHANGE, { action: `Hai gettato ${item.name}.` });
  }, [characterSheet.inventory, items, addLogEntry]);

  // Aggiorna il character sheet (per level up)
  const updateCharacterSheet = useCallback((newCharacterSheet: ICharacterSheet) => {
    setCharacterSheet(newCharacterSheet);
  }, []);



  // Gestisce il consumo notturno di cibo e bevande
  const handleNightConsumption = useCallback(() => {
    const currentDay = timeStateRef.current.day;
    
    setSurvivalState(prev => {
      // Evita doppio consumo nello stesso giorno
      if (prev.lastNightConsumption.day === currentDay && prev.lastNightConsumption.consumed) {
        return prev;
      }
      
      // Cerca cibo e bevande nell'inventario
      let foodConsumed = false;
      let drinkConsumed = false;
      
      setCharacterSheet(prevChar => {
        const newInventory = [...prevChar.inventory];
        
        // Cerca e consuma cibo
        for (let i = 0; i < newInventory.length && !foodConsumed; i++) {
          const slot = newInventory[i];
          if (slot && items[slot.itemId]) {
            const item = items[slot.itemId];
            if (item.effect === 'satiety' && slot.quantity > 0) {
              // Sistema di porzioni per consumo notturno
              if (item.portionsPerUnit && item.portionEffect) {
                let currentPortions = slot.portions ?? item.portionsPerUnit;
                currentPortions -= 1;
                
                if (currentPortions > 0) {
                  // Aggiorna solo le porzioni
                  slot.portions = currentPortions;
                } else {
                  // Le porzioni sono finite, consuma un'unità
                  slot.quantity -= 1;
                  if (slot.quantity > 0) {
                    // Resetta le porzioni per la prossima unità
                    slot.portions = item.portionsPerUnit;
                  } else {
                    // Rimuovi l'oggetto dall'inventario
                    newInventory[i] = null;
                  }
                }
              } else {
                // Logica esistente per oggetti senza porzioni
                if (slot.quantity > 1) {
                  slot.quantity -= 1;
                } else {
                  newInventory[i] = null;
                }
              }
              foodConsumed = true;
            }
          }
        }
        
        // Cerca e consuma bevande
        for (let i = 0; i < newInventory.length && !drinkConsumed; i++) {
          const slot = newInventory[i];
          if (slot && items[slot.itemId]) {
            const item = items[slot.itemId];
            if (item.effect === 'hydration' && slot.quantity > 0) {
              // Sistema di porzioni per consumo notturno
              if (item.portionsPerUnit && item.portionEffect) {
                let currentPortions = slot.portions ?? item.portionsPerUnit;
                currentPortions -= 1;
                
                if (currentPortions > 0) {
                  // Aggiorna solo le porzioni
                  slot.portions = currentPortions;
                } else {
                  // Le porzioni sono finite, consuma un'unità
                  slot.quantity -= 1;
                  if (slot.quantity > 0) {
                    // Resetta le porzioni per la prossima unità
                    slot.portions = item.portionsPerUnit;
                  } else {
                    // Rimuovi l'oggetto dall'inventario
                    newInventory[i] = null;
                  }
                }
              } else {
                // Logica esistente per oggetti senza porzioni
                if (slot.quantity > 1) {
                  slot.quantity -= 1;
                } else {
                  newInventory[i] = null;
                }
              }
              drinkConsumed = true;
            }
          }
        }
        
        return { ...prevChar, inventory: newInventory };
      });
      
      // Sempre mostra il messaggio di consumo notturno secondo GDD
      addLogEntry(MessageType.SURVIVAL_NIGHT_CONSUME);
      
      // Applica penalità se non ha consumato cibo/bevande
      if (!foodConsumed || !drinkConsumed) {
        const penalty = (!foodConsumed && !drinkConsumed) ? 3 : 1;
        updateHP(-penalty);
        
        // Messaggio di penalità secondo GDD
        addLogEntry(MessageType.SURVIVAL_PENALTY);
      }
      
      return {
        ...prev,
        lastNightConsumption: { day: currentDay, consumed: true }
      };
    });
  }, [items, updateHP, addLogEntry, setSurvivalState]);

  // === SISTEMA DI SALVATAGGIO === 
  // Real save system implementation with correct types
  
  // Salva lo stato del gioco corrente
  const saveCurrentGame = useCallback(async (slot: string): Promise<boolean> => {
    try {
      const gameData: GameSaveData = {
        timeState,
        playerPosition,
        currentScreen,
        currentBiome,
        visitedShelters,
        gameFlags: {} // for future use
      };
      
      const success = await saveGame(characterSheet, survivalState, gameData, slot);
      
      if (success) {
        addLogEntry(MessageType.ACTION_SUCCESS, { action: `Gioco salvato nello slot ${slot}` });
      } else {
        addLogEntry(MessageType.ACTION_FAIL, { action: 'salvataggio', reason: 'errore durante il salvataggio' });
      }
      
      return success;
    } catch (error) {
      console.error('Save failed:', error);
      addLogEntry(MessageType.ACTION_FAIL, { action: 'salvataggio', reason: 'errore imprevisto' });
      return false;
    }
  }, [characterSheet, survivalState, timeState, playerPosition, currentScreen, currentBiome, visitedShelters, saveGame, addLogEntry]);
  
  // Carica uno stato di gioco salvato
  const loadSavedGame = useCallback(async (slot: string): Promise<boolean> => {
    try {
      const saveData = await loadGame(slot);
      
      if (!saveData) {
        addLogEntry(MessageType.ACTION_FAIL, { action: 'caricamento', reason: 'salvataggio non trovato' });
        return false;
      }
      
      // Ripristina lo stato del personaggio
      setCharacterSheet(saveData.characterSheet);
      
      // Ripristina lo stato di sopravvivenza
      setSurvivalState(saveData.survivalState);
      
      // Ripristina lo stato del gioco
      setTimeState(saveData.gameData.timeState);
      setPlayerPosition(saveData.gameData.playerPosition);
      setCurrentScreen(saveData.gameData.currentScreen);
      setCurrentBiome(saveData.gameData.currentBiome);
      
      // Ripristina rifugi visitati se disponibili
      if (saveData.gameData.visitedShelters) {
        setVisitedShelters(saveData.gameData.visitedShelters);
      }
      
      addLogEntry(MessageType.ACTION_SUCCESS, { 
        action: `Gioco caricato dallo slot ${slot}`,
        player: saveData.characterSheet.name,
        level: saveData.characterSheet.level
      });
      
      return true;
    } catch (error) {
      console.error('Load failed:', error);
      addLogEntry(MessageType.ACTION_FAIL, { action: 'caricamento', reason: 'errore durante il caricamento' });
      return false;
    }
  }, [loadGame, addLogEntry]);
  
  // Auto-salvataggio automatico
  const performAutoSave = useCallback(async () => {
    try {
      const gameData: GameSaveData = {
        timeState,
        playerPosition,
        currentScreen,
        currentBiome,
        visitedShelters,
        gameFlags: {}
      };
      
      await autoSave(characterSheet, survivalState, gameData);
    } catch (error) {
      // Auto-save silenzioso - non mostrare errori all'utente
      console.warn('Auto-save failed:', error);
    }
  }, [characterSheet, survivalState, timeState, playerPosition, currentScreen, currentBiome, visitedShelters, autoSave]);
  
  // Auto-salvataggio ogni cambiamento significativo
  useEffect(() => {
    if (gameInitialized && characterSheet.name) {
      const timeoutId = setTimeout(performAutoSave, 2000); // Ritardo di 2 secondi
      return () => clearTimeout(timeoutId);
    }
  }, [gameInitialized, characterSheet, timeState, survivalState, performAutoSave]);

  // Real save system functions (replacing placeholders)
  const realGetSaveSlots = useCallback(() => {
    return getSaveSlots();
  }, [getSaveSlots]);
  
  const realDeleteSave = useCallback((slot: string): boolean => {
    return deleteSave(slot);
  }, [deleteSave]);
  
  const realExportSave = useCallback((slot: string): string | null => {
    return exportSave(slot);
  }, [exportSave]);
  
  const realImportSave = useCallback(async (content: string, slot: string): Promise<boolean> => {
    try {
      return await importSave(content, slot);
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }, [importSave]);

  // --- Menu Handlers -- -
  const handleNewGame = useCallback(() => {
    // Reset dello stato per nuovo gioco
    setCharacterSheet(createTestCharacter());
    setSurvivalState({ hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } });
    setTimeState({ currentTime: DAWN_TIME, day: 1, isDay: true });
    setVisitedShelters({});
    setLogEntries([]);
    navigateTo('characterCreation');
  }, [navigateTo]);
  
  const handleLoadGame = useCallback(() => {
    // TODO: Navigate to load game screen - for now just show available saves
    const slots = getSaveSlots();
    const availableSlots = slots.filter(slot => slot.exists && !slot.corrupted);
    console.log('Available save slots:', availableSlots.map(s => `${s.slot}: ${s.metadata?.playerName} Lv.${s.metadata?.playerLevel}`));
  }, [getSaveSlots]);
  
  // Real quick save/load functions
  const handleQuickSave = useCallback(async () => {
    const success = await saveCurrentGame('quicksave');
    return success;
  }, [saveCurrentGame]);
  
  const handleQuickLoad = useCallback(async () => {
    const success = await loadSavedGame('quicksave');
    return success;
  }, [loadSavedGame]);
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
    survivalState,
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
    equipItemFromInventory,
    dropItem,
    updateCharacterSheet,
    addExperience,
    handleNightConsumption,
    consumeFood: (amount: number) => {
      setSurvivalState(prev => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + amount)
      }));
    },
    consumeDrink: (amount: number) => {
      setSurvivalState(prev => ({
        ...prev,
        thirst: Math.min(100, prev.thirst + amount)
      }));
    },
    addItem,
    removeItem,
    // === FUNZIONI DI SALVATAGGIO (REAL IMPLEMENTATION) ===
    saveCurrentGame,
    loadSavedGame,
    handleQuickSave,
    handleQuickLoad,
    getSaveSlots: realGetSaveSlots,
    deleteSave: realDeleteSave,
    exportSave: realExportSave,
    importSave: realImportSave,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};