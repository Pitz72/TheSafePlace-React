import { create } from 'zustand';
import type { GameState, AbilityCheckResult, TimeState, ShelterAccessInfo, WeatherState, WeatherEffects } from '../interfaces/gameState';
import { WeatherType } from '../interfaces/gameState';

import { MessageType, getRandomMessage, JOURNAL_CONFIG, resetJournalState } from '../data/MessageArchive';
import { itemDatabase } from '../data/items/itemDatabase';
import { isDead } from '../rules/mechanics';
import { saveSystem } from '../utils/saveSystem';
import type { GameEvent, EventChoice, Penalty } from '../interfaces/events';
import { useCharacterStore } from './character/characterStore';
import { useWorldStore } from './world/worldStore';
import { useInventoryStore } from './inventory/inventoryStore';
import { useShelterStore } from './shelter/shelterStore';
import { useWeatherStore } from './weather/weatherStore';
import { useCombatStore } from './combatStore';

export const useGameStore = create<GameState>((set, get) => ({
  // --- STATO INIZIALE ---
  survivalState: { hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } },
  logEntries: [],
  items: itemDatabase,
  selectedInventoryIndex: 0,
  currentScreen: 'menu',
  previousScreen: null,
  menuSelectedIndex: 0,
  eventDatabase: {},
  currentEvent: null,
  seenEventIds: [],
  completedEncounters: [],
  notifications: [],
  unlockRecipesCallback: undefined,

  // --- FACADE PROPERTIES ---
  get characterSheet() {
    return useCharacterStore.getState().characterSheet;
  },

  get playerPosition() {
    return useWorldStore.getState().playerPosition;
  },

  get mapData() {
    return useWorldStore.getState().mapData;
  },

  get isMapLoading() {
    return useWorldStore.getState().isMapLoading;
  },

  get cameraPosition() {
    return useWorldStore.getState().cameraPosition;
  },

  get weatherState() {
    return useWeatherStore.getState();
  },

  get currentWeather() {
    return useWeatherStore.getState().currentWeather;
  },

  // --- AZIONI ---

  updateCameraPosition: (viewportSize: { width: number; height: number }) => {
    useWorldStore.getState().updateCameraPosition(viewportSize);
  },

  initializeGame: async () => {
    const worldStore = useWorldStore.getState();
    
    resetJournalState();
    set({ logEntries: [] });
    useCharacterStore.getState().resetCharacter();
    worldStore.resetWorld();

    await worldStore.loadMap();

    try {
      const eventFiles = ['city_events.json', 'forest_events.json', 'plains_events.json', 'rest_stop_events.json', 'river_events.json', 'unique_events.json', 'village_events.json'];
      const database: Record<string, GameEvent[]> = {};
      for (const file of eventFiles) {
        const res = await fetch(`/events/${file}`);
        const data = await res.json();
        const key = Object.keys(data)[0];
        database[key] = Object.values(data)[0] as GameEvent[];
      }

      useShelterStore.getState().resetShelters();
      set({
        eventDatabase: database,
        survivalState: { hunger: 100, thirst: 100, lastNightConsumption: { day: 0, consumed: false } }, // Resetta sopravvivenza
        currentScreen: 'menu',
      });
      get().addLogEntry(MessageType.GAME_START);

    } catch (error) {
      console.error("Initialization failed in store:", error);
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

  // --- UI Navigation Actions ---
  handleNewGame: () => get().setCurrentScreen('characterCreation'),
  handleLoadGame: () => get().setCurrentScreen('loadGame'),
  handleStory: () => get().setCurrentScreen('story'),
  handleInstructions: () => get().setCurrentScreen('instructions'),
  handleOptions: () => get().setCurrentScreen('options'),
  handleBackToMenu: () => get().setCurrentScreen('menu'),
  handleExit: () => {
    // In a real browser environment, you might want to show a confirmation
    // For now, we can just log it or go back to the menu.
    console.log("Exit action triggered");
    get().setCurrentScreen('menu');
  },

  addLogEntry: (type, context) => {
    const message = getRandomMessage(type, context);
    if (!message) return;
    const { formatTime, timeState } = useWorldStore.getState();
    const newEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: formatTime(timeState.currentTime),
      message,
      type,
      context,
    };
    set(state => ({ logEntries: [...state.logEntries, newEntry].slice(-JOURNAL_CONFIG.MAX_ENTRIES) }));
  },


  // --- FUNZIONI HELPER PER ATTRAVERSAMENTO FIUMI ---

  getRiverCrossingWeatherDescription: (): string => {
    const { currentWeather } = useWeatherStore.getState();
    const { timeState } = useWorldStore.getState();
    const timePrefix = timeState.isDay ? '' : 'Nell\'oscurità della notte, ';

    switch (currentWeather) {
      case WeatherType.CLEAR:
        return `${timePrefix}La corrente sembra gestibile e la visibilità è buona.`;
      case WeatherType.LIGHT_RAIN:
        return `${timePrefix}La pioggia leggera rende le rocce scivolose. La corrente appare più forte del normale.`;
      case WeatherType.HEAVY_RAIN:
        return `${timePrefix}La pioggia battente gonfia il fiume e riduce drasticamente la visibilità. L'acqua è torbida e minacciosa.`;
      case WeatherType.STORM:
        return `${timePrefix}La tempesta rende l'attraversamento estremamente pericoloso. Il fiume è in piena e i detriti vengono trascinati dalla corrente.`;
      case WeatherType.FOG:
        return `${timePrefix}La nebbia densa impedisce di valutare correttamente la profondità e la forza della corrente.`;
      case WeatherType.WIND:
        return `${timePrefix}Il vento forte crea onde sulla superficie e minaccia di destabilizzarti durante l'attraversamento.`;
      default:
        return `${timePrefix}La corrente sembra forte...`;
    }
  },

  getRiverCrossingSuccessDescription: (): string => {
    const { currentWeather } = useWeatherStore.getState();

    switch (currentWeather) {
      case WeatherType.CLEAR:
        return 'Con movimenti sicuri e calcolati, attraversi il fiume senza difficoltà. La buona visibilità ti ha permesso di scegliere il percorso migliore.';
      case WeatherType.LIGHT_RAIN:
        return 'Nonostante le rocce scivolose, mantieni l\'equilibrio e raggiungi l\'altra sponda. La pioggia leggera non è riuscita a fermarti.';
      case WeatherType.HEAVY_RAIN:
        return 'Lottando contro la pioggia battente e la corrente gonfia, riesci comunque ad attraversare con determinazione e abilità.';
      case WeatherType.STORM:
        return 'In una dimostrazione di coraggio e agilità straordinari, superi la furia della tempesta e raggiungi l\'altra sponda sano e salvo.';
      case WeatherType.FOG:
        return 'Procedendo con estrema cautela nella nebbia, riesci a trovare il percorso sicuro e completi l\'attraversamento.';
      case WeatherType.WIND:
        return 'Resistendo alle raffiche di vento che minacciano di farti perdere l\'equilibrio, completi l\'attraversamento con successo.';
      default:
        return 'Con agilità e determinazione, riesci ad attraversare il fiume senza problemi.';
    }
  },

  getRiverCrossingFailureDescription: (totalDamage: number, hasWeatherDamage: boolean): string => {
    const { currentWeather } = useWeatherStore.getState();

    let baseDescription = '';
    let weatherExtra = '';

    // Descrizione base del fallimento
    if (totalDamage <= 2) {
      baseDescription = 'Scivoli e cadi nell\'acqua, ma riesci a raggiungere l\'altra sponda con solo qualche graffio.';
    } else if (totalDamage <= 4) {
      baseDescription = 'La corrente ti trascina e ti sbatte contro le rocce. Raggiungi l\'altra sponda dolorante e bagnato.';
    } else {
      baseDescription = 'L\'attraversamento si trasforma in una lotta per la sopravvivenza. Vieni trascinato dalla corrente e subisci gravi contusioni.';
    }

    // Descrizione extra per danni meteo
    if (hasWeatherDamage) {
      switch (currentWeather) {
        case WeatherType.STORM:
          weatherExtra = ' La tempesta rende tutto più pericoloso: detriti ti colpiscono e il vento ti destabilizza ulteriormente.';
          break;
        case WeatherType.HEAVY_RAIN:
          weatherExtra = ' La pioggia torrenziale ti acceca e rende impossibile valutare i pericoli nascosti.';
          break;
        case WeatherType.FOG:
          weatherExtra = ' La nebbia ti fa perdere l\'orientamento, finendo in una zona più pericolosa del fiume.';
          break;
      }
    }

    return baseDescription + weatherExtra;
  },

  getRiverCrossingModifierInfo: (finalDifficulty: number): string | null => {
    const { survivalState } = get();
    const { characterSheet } = useCharacterStore.getState();
    const { timeState } = useWorldStore.getState();
    const weatherStore = useWeatherStore.getState();
    const baseDifficulty = 12;
    const totalModifier = finalDifficulty - baseDifficulty;

    if (totalModifier === 0) return null;

    const modifiers: string[] = [];

    // Analizza i modificatori principali
    if (weatherStore.currentWeather !== WeatherType.CLEAR) {
      const weatherName = weatherStore.getWeatherDescription(weatherStore.currentWeather).split('.')[0];
      modifiers.push(`condizioni meteo (${weatherName.toLowerCase()})`);
    }

    if (!timeState.isDay) {
      modifiers.push('oscurità notturna');
    }

    const healthPercentage = characterSheet.currentHP / characterSheet.maxHP;
    if (healthPercentage < 0.5) {
      modifiers.push('ferite');
    }

    if (survivalState.hunger < 50 || survivalState.thirst < 50) {
      modifiers.push('fame/sete');
    }

    // Modificatori equipaggiamento
    const equipmentDescriptions = get().getEquipmentModifierDescription();
    if (equipmentDescriptions.length > 0) {
      modifiers.push(`equipaggiamento (${equipmentDescriptions.join(', ')})`);
    }

    if (modifiers.length === 0) return null;

    const difficultyText = totalModifier > 0 ? 'più difficile' : 'più facile';
    const modifierText = modifiers.join(', ');

    return `L'attraversamento sarà ${difficultyText} del normale a causa di: ${modifierText}.`;
  },

  calculateEquipmentModifierForRiver: (): number => {
    const { characterSheet } = useCharacterStore.getState();
    const { items } = get();
    let modifier = 0;

    // Analizza equipaggiamento indossato
    const equipment = characterSheet.equipment;

    // Armatura - più pesante = più difficile attraversare
    if (equipment.armor.itemId) {
      const armor = items[equipment.armor.itemId];
      if (armor) {
        // Armature pesanti rendono l'attraversamento più difficile
        if (armor.name.toLowerCase().includes('pesante') ||
          armor.name.toLowerCase().includes('piastre') ||
          armor.name.toLowerCase().includes('maglia')) {
          modifier += 2; // Penalità per armature pesanti
        } else if (armor.name.toLowerCase().includes('leggera') ||
          armor.name.toLowerCase().includes('cuoio')) {
          modifier += 0; // Armature leggere neutrali
        }
      }
    }

    // Armi - armi pesanti a due mani rendono più difficile l'equilibrio
    if (equipment.weapon.itemId) {
      const weapon = items[equipment.weapon.itemId];
      if (weapon) {
        if (weapon.name.toLowerCase().includes('due mani') ||
          weapon.name.toLowerCase().includes('martello') ||
          weapon.name.toLowerCase().includes('ascia grande')) {
          modifier += 1; // Penalità per armi pesanti
        }
      }
    }

    // Oggetti utili nell'inventario
    const inventory = characterSheet.inventory;
    for (const slot of inventory) {
      if (slot) {
        const item = items[slot.itemId];
        if (item) {
          // Corda - aiuta nell'attraversamento
          if (item.name.toLowerCase().includes('corda')) {
            modifier -= 2; // Bonus significativo
          }
          // Stivali impermeabili o simili
          else if (item.name.toLowerCase().includes('stivali') &&
            (item.name.toLowerCase().includes('impermeabili') ||
              item.name.toLowerCase().includes('gomma'))) {
            modifier -= 1; // Bonus per stivali adatti
          }
          // Zaino pesante
          else if (item.name.toLowerCase().includes('zaino') &&
            item.name.toLowerCase().includes('grande')) {
            modifier += 1; // Penalità per peso extra
          }
        }
      }
    }

    return modifier;
  },

  getEquipmentModifierDescription: (): string[] => {
    const { characterSheet } = useCharacterStore.getState();
    const { items } = get();
    const descriptions: string[] = [];

    // Analizza equipaggiamento per descrizioni
    const equipment = characterSheet.equipment;

    if (equipment.armor.itemId) {
      const armor = items[equipment.armor.itemId];
      if (armor && (armor.name.toLowerCase().includes('pesante') ||
        armor.name.toLowerCase().includes('piastre'))) {
        descriptions.push('armatura pesante');
      }
    }

    if (equipment.weapon.itemId) {
      const weapon = items[equipment.weapon.itemId];
      if (weapon && (weapon.name.toLowerCase().includes('due mani') ||
        weapon.name.toLowerCase().includes('martello'))) {
        descriptions.push('arma ingombrante');
      }
    }

    // Oggetti utili
    const inventory = characterSheet.inventory;
    for (const slot of inventory) {
      if (slot) {
        const item = items[slot.itemId];
        if (item) {
          if (item.name.toLowerCase().includes('corda')) {
            descriptions.push('corda (aiuto)');
          } else if (item.name.toLowerCase().includes('stivali') &&
            item.name.toLowerCase().includes('impermeabili')) {
            descriptions.push('stivali impermeabili (aiuto)');
          }
        }
      }
    }

    return descriptions;
  },

  createClearWeather: (): WeatherState => ({
    currentWeather: WeatherType.CLEAR,
    intensity: 50,
    duration: 240,
    nextWeatherChange: Date.now() + (240 * 60 * 1000),
    effects: {
      movementModifier: 1.0,
      survivalModifier: 1.0,
      skillCheckModifier: 0,
      eventProbabilityModifier: 1.0
    }
  }),

  getWeatherDescription: (weather: WeatherType): string => {
    const descriptions = {
      [WeatherType.CLEAR]: 'Il cielo si schiarisce, rivelando un sole pallido che filtra attraverso l\'aria polverosa. La visibilità migliora notevolmente.',
      [WeatherType.LIGHT_RAIN]: 'Gocce sottili iniziano a cadere dal cielo grigio, creando piccole pozze sul terreno arido. L\'aria si fa più umida.',
      [WeatherType.HEAVY_RAIN]: 'La pioggia battente trasforma il paesaggio in un mare di fango. Ogni passo diventa una lotta contro gli elementi.',
      [WeatherType.STORM]: 'Una tempesta furiosa scuote la terra desolata. Lampi illuminano brevemente l\'orizzonte mentre il vento ulula tra le rovine.',
      [WeatherType.FOG]: 'Una nebbia spettrale avvolge tutto in un manto grigio. Il mondo oltre pochi metri scompare in un\'inquietante foschia.',
      [WeatherType.WIND]: 'Raffiche violente sollevano nuvole di polvere e detriti, rendendo difficile tenere gli occhi aperti. Il vento porta con sé echi del passato.'
    };
    return descriptions[weather] || 'Il tempo cambia in modi che sfidano ogni comprensione, come se la natura stessa fosse stata corrotta.';
  },

  getRandomWeatherMessage: (weather: WeatherType): string => {
    const weatherMessages = {
      [WeatherType.CLEAR]: [
        'I raggi del sole filtrano attraverso l\'aria, riscaldando leggermente il tuo volto.',
        'Il cielo sereno offre una tregua dalla desolazione circostante.',
        'Una brezza leggera porta con sé il profumo di terre lontane.',
        'La luce del sole rivela dettagli nascosti nel paesaggio.'
      ],
      [WeatherType.LIGHT_RAIN]: [
        'Le gocce di pioggia tamburellano dolcemente sulle superfici metalliche abbandonate.',
        'L\'umidità nell\'aria porta un senso di rinnovamento in questo mondo arido.',
        'La pioggia leggera crea riflessi argentei sulle pozzanghere.',
        'Il suono della pioggia maschera i tuoi passi.'
      ],
      [WeatherType.HEAVY_RAIN]: [
        'La pioggia torrenziale rende il terreno scivoloso e traditore.',
        'L\'acqua scorre in rivoli lungo i detriti, creando nuovi percorsi.',
        'Il martellare della pioggia è assordante, coprendo ogni altro suono.',
        'Ti rifugi momentaneamente sotto una lamiera arrugginita.'
      ],
      [WeatherType.STORM]: [
        'Un fulmine illumina il paesaggio desolato per un istante accecante.',
        'Il tuono rimbomba tra le rovine come il grido di un gigante ferito.',
        'Il vento della tempesta minaccia di trascinarti via.',
        'La furia degli elementi ti ricorda quanto sei piccolo in questo mondo.'
      ],
      [WeatherType.FOG]: [
        'Forme indistinte emergono e scompaiono nella nebbia come fantasmi.',
        'Il mondo si riduce a pochi metri di visibilità inquietante.',
        'La nebbia sembra sussurrare segreti che non riesci a comprendere.',
        'Ogni passo nella foschia è un salto nel vuoto.'
      ],
      [WeatherType.WIND]: [
        'Il vento porta con sé frammenti di carta e foglie secche del passato.',
        'Le raffiche fanno gemere le strutture metalliche abbandonate.',
        'Il vento ulula una melodia malinconica tra i rottami.',
        'Devi lottare contro le raffiche per mantenere l\'equilibrio.'
      ]
    };

    const messages = weatherMessages[weather];
    return messages ? messages[Math.floor(Math.random() * messages.length)] : 'Il tempo si comporta in modo strano.';
  },

  // --- SISTEMA ATTRAVERSAMENTO FIUMI v0.6.1 ---

  attemptRiverCrossing: (): boolean => {
    const { addLogEntry, performAbilityCheck, calculateRiverDifficulty } = get();
    const characterStore = useCharacterStore.getState();
    const weatherStore = useWeatherStore.getState();

    // Calcola difficoltà basata su meteo e condizioni
    const difficulty = calculateRiverDifficulty();

    // Messaggio iniziale con descrizione delle condizioni
    const weatherDescription = get().getRiverCrossingWeatherDescription();
    addLogEntry(MessageType.AMBIANCE_RANDOM, {
      text: `Ti avvicini alla riva del fiume. ${weatherDescription}`
    });

    // Messaggio informativo sui modificatori applicati
    const modifierInfo = get().getRiverCrossingModifierInfo(difficulty);
    if (modifierInfo) {
      addLogEntry(MessageType.AMBIANCE_RANDOM, {
        text: modifierInfo
      });
    }

    // Esegui skill check Agilità
    const result = performAbilityCheck('agilita', difficulty, false);

    if (result.success) {
      // Successo - attraversamento riuscito
      const successDescription = get().getRiverCrossingSuccessDescription();
      addLogEntry(MessageType.SKILL_CHECK_SUCCESS, {
        action: 'attraversamento fiume',
        roll: result.roll,
        modifier: result.modifier,
        total: result.total,
        difficulty: difficulty,
        description: successDescription
      });
      return true;
    } else {
      // Fallimento - subisci danni variabili basati su meteo
      let baseDamage = Math.floor(Math.random() * 3) + 1; // 1-3 danni base

      // Danni extra per condizioni meteo severe
      let weatherDamage = 0;
      switch (weatherStore.currentWeather) {
        case WeatherType.STORM:
          weatherDamage = Math.floor(Math.random() * 2) + 1; // +1-2 danni extra
          break;
        case WeatherType.HEAVY_RAIN:
          weatherDamage = Math.floor(Math.random() * 2); // +0-1 danni extra
          break;
        case WeatherType.FOG:
          // Nebbia può causare danni da disorientamento
          if (Math.random() < 0.3) weatherDamage = 1;
          break;
      }

      const totalDamage = baseDamage + weatherDamage;
      characterStore.updateHP(-totalDamage);

      addLogEntry(MessageType.SKILL_CHECK_FAILURE, {
        action: 'attraversamento fiume',
        roll: result.roll,
        modifier: result.modifier,
        total: result.total,
        difficulty: difficulty
      });

      const failureDescription = get().getRiverCrossingFailureDescription(totalDamage, weatherDamage > 0);
      addLogEntry(MessageType.HP_DAMAGE, {
        damage: totalDamage,
        reason: 'attraversamento fiume fallito',
        description: failureDescription
      });

      return true; // Attraversamento riuscito ma con danni
    }
  },

  calculateRiverDifficulty: (): number => {
    const { characterSheet } = useCharacterStore.getState();
    const { timeState } = useWorldStore.getState();
    const weatherStore = useWeatherStore.getState();
    let baseDifficulty = 12; // Difficoltà base moderata

    // Modificatori meteo avanzati - v0.6.1
    switch (weatherStore.currentWeather) {
      case WeatherType.CLEAR:
        // Tempo sereno - nessuna penalità, possibile bonus leggero
        baseDifficulty -= 1;
        break;
      case WeatherType.LIGHT_RAIN:
        // Pioggia leggera - terreno scivoloso
        baseDifficulty += 2;
        break;
      case WeatherType.HEAVY_RAIN:
        // Pioggia intensa - corrente più forte, visibilità ridotta
        baseDifficulty += 4;
        break;
      case WeatherType.STORM:
        // Tempesta - condizioni estremamente pericolose
        baseDifficulty += 7;
        break;
      case WeatherType.FOG:
        // Nebbia - visibilità molto ridotta, difficile valutare la corrente
        baseDifficulty += 3;
        break;
      case WeatherType.WIND:
        // Vento forte - può destabilizzare durante l'attraversamento
        baseDifficulty += 2;
        break;
    }

    // Modificatori intensità meteo
    const intensityModifier = Math.floor((weatherStore.intensity - 50) / 20); // -2 a +2
    baseDifficulty += intensityModifier;

    // Modificatori temporali - l'attraversamento notturno è più pericoloso
    if (!timeState.isDay) {
      baseDifficulty += 3; // Penalità notturna significativa
    }

    // Modificatori salute
    const healthPercentage = characterSheet.currentHP / characterSheet.maxHP;
    if (healthPercentage < 0.25) {
      baseDifficulty += 4; // Molto ferito - penalità aumentata
    } else if (healthPercentage < 0.5) {
      baseDifficulty += 2; // Ferito - penalità moderata
    } else if (healthPercentage < 0.75) {
      baseDifficulty += 1; // Leggermente ferito
    }

    // Modificatori sopravvivenza - fame e sete influenzano l'agilità
    const { survivalState } = get();
    if (survivalState.hunger < 25 || survivalState.thirst < 25) {
      baseDifficulty += 3; // Fame/sete critica
    } else if (survivalState.hunger < 50 || survivalState.thirst < 50) {
      baseDifficulty += 1; // Fame/sete moderata
    }

    // Modificatori equipaggiamento - v0.6.1
    const equipmentModifier = get().calculateEquipmentModifierForRiver();
    baseDifficulty += equipmentModifier;

    return Math.min(25, Math.max(6, baseDifficulty)); // Clamp tra 6 e 25
  },

  triggerEvent: (event) => {
    if (get().currentEvent) return; // Evita di sovrascrivere eventi

    // Se l'evento ha un ID, segna come visto
    if (event.id) {
      set(state => ({
        seenEventIds: state.seenEventIds.includes(event.id)
          ? state.seenEventIds
          : [...state.seenEventIds, event.id]
      }));
    }

    set({ currentEvent: event });
    get().setCurrentScreen('event');
  },

  resolveChoice: (choice) => {
    const { currentEvent } = get();
    if (!currentEvent) return;

    const { addLogEntry, performAbilityCheck, advanceTime } = get();
    const characterStore = useCharacterStore.getState();
    const combatStore = useCombatStore.getState();

    const handleOutcome = (outcome) => {
      addLogEntry(MessageType.EVENT_CHOICE, { text: outcome.text });

      outcome.actions?.forEach(action => {
        switch (action.type) {
          case 'start_combat':
            combatStore.initiateCombat(action.payload.encounterId);
            break;
          case 'advance_time':
            advanceTime(action.payload.minutes);
            break;
          case 'log':
            addLogEntry(MessageType.AMBIANCE_RANDOM, { text: action.payload.message });
            break;
          // Altri tipi di azioni possono essere aggiunti qui
        }
      });
    };

    if (choice.skillCheck) {
      const result = performAbilityCheck(choice.skillCheck.stat, choice.skillCheck.difficulty);
      if (result.success) {
        handleOutcome(choice.successText);
      } else {
        handleOutcome(choice.failureText);
      }
    } else {
      // Azione immediata
      handleOutcome(choice.resultText);
    }

    // Marca l'incontro come completato se è unico
    if (currentEvent.isUnique) {
      set(state => ({
        completedEncounters: [...state.completedEncounters, currentEvent.id]
      }));
    }

    set({ currentEvent: null });
    // Non torna indietro automaticamente, l'azione (es. start_combat) gestirà la transizione
    if (!get().currentEvent) { // Se non è iniziato un combattimento
      get().goBack();
    }
  },

  performAbilityCheck: (ability, difficulty, addToJournal = true, successMessageType) => {
    const { addLogEntry, getWeatherEffects } = get();
    const characterStore = useCharacterStore.getState();

    // Get base modifier from character store
    const baseModifier = characterStore.getModifier(ability);

    // Get weather effects from game store
    const weatherEffects = getWeatherEffects();
    const weatherModifier = weatherEffects.skillCheckModifier;
    const totalModifier = baseModifier + weatherModifier;

    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + totalModifier;
    const success = total >= difficulty;

    characterStore.addExperience(success ? 5 : 1);

    const result: AbilityCheckResult = { success, roll, modifier: totalModifier, total, difficulty };

    if (addToJournal) {
      const context = {
        ability,
        roll,
        modifier: totalModifier,
        baseModifier,
        weatherModifier,
        total,
        difficulty
      };
      addLogEntry(success ? (successMessageType || MessageType.SKILL_CHECK_SUCCESS) : MessageType.SKILL_CHECK_FAILURE, context);
    }
    return result;
  },

  shortRest: () => {
    const { addLogEntry, advanceTime, eventDatabase } = get();
    const characterStore = useCharacterStore.getState();
    const { characterSheet } = characterStore;

    if (isDead(characterSheet.currentHP)) {
      addLogEntry(MessageType.REST_BLOCKED, { reason: 'sei morto' });
      return;
    }

    // 30% possibilità di evento rest stop durante il riposo
    const restStopEvents = eventDatabase['REST_STOP'] || [];
    if (restStopEvents.length > 0 && Math.random() < 0.30) {
      // Attiva evento rest stop casuale
      const event = restStopEvents[Math.floor(Math.random() * restStopEvents.length)];
      set({ currentEvent: event });
      get().setCurrentScreen('event');
      return; // L'evento gestirà il riposo
    }

    // Riposo normale senza eventi
    const maxRecovery = characterSheet.maxHP - characterSheet.currentHP;
    const recoveryPercentage = 0.8 + (Math.random() * 0.15); // 80-95%
    const healingAmount = Math.floor(maxRecovery * recoveryPercentage);

    characterStore.updateHP(healingAmount);
    addLogEntry(MessageType.REST_SUCCESS, { healingAmount });

    const restTime = Math.floor(Math.random() * 120) + 120; // 120-240 minuti
    advanceTime(restTime);
  },

  handleNightConsumption: () => {
    const { timeState, items, addLogEntry } = get();
    const characterStore = useCharacterStore.getState();
    const { characterSheet } = characterStore;
    const currentDay = timeState.day;

    let foodConsumed = false;
    let drinkConsumed = false;
    const newInventory = [...characterSheet.inventory];

    const foodIndex = newInventory.findIndex(slot => slot && items[slot.itemId]?.effect === 'satiety' && slot.quantity > 0);
    if (foodIndex !== -1) {
      const slot = newInventory[foodIndex]!;
      slot.quantity -= 1;
      if (slot.quantity === 0) newInventory[foodIndex] = null;
      foodConsumed = true;
    }

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
      characterStore.updateHP(-penalty);
      addLogEntry(MessageType.SURVIVAL_PENALTY);
    }

    characterStore.updateCharacterSheet({ ...characterSheet, inventory: newInventory });
    set(state => ({
      survivalState: { ...state.survivalState, lastNightConsumption: { day: currentDay, consumed: true } }
    }));
  },

  consumeFood: () => { /* Placeholder */ },
  consumeDrink: () => { /* Placeholder */ },

  updateBiome: (newBiomeChar) => {
    const characterStore = useCharacterStore.getState();
    const shelterStore = useShelterStore.getState();
    const worldStore = useWorldStore.getState();

    // Sistema attraversamento fiumi
    if (newBiomeChar === '~') {
      get().attemptRiverCrossing();
      return;
    }

    if (newBiomeChar === 'R') {
      const { playerPosition, timeState, advanceTime } = worldStore;
      const { addLogEntry, setCurrentScreen, handleNightConsumption } = get();
      const { characterSheet } = characterStore;
      const { getShelterInfo, createShelterInfo, updateShelterAccess, isShelterAccessible } = shelterStore;

      const { x, y } = playerPosition;
      let shelterInfo = getShelterInfo(x, y);

      if (!shelterInfo) {
        shelterInfo = createShelterInfo(x, y);
        shelterStore.updateShelterAccess(x, y, shelterInfo);
      }

      if (!isShelterAccessible(x, y)) {
        addLogEntry(MessageType.DISCOVERY, {
          discovery: 'rifugio già visitato durante il giorno - ora è sigillato. Torna di notte per riposare.'
        });
        return;
      }

      if (timeState.isDay) {
        updateShelterAccess(x, y, {
          isAccessible: false,
          dayVisited: timeState.day,
          timeVisited: timeState.currentTime
        });
        setCurrentScreen('shelter');
        addLogEntry(MessageType.DISCOVERY, { discovery: 'rifugio sicuro trovato - puoi riposare e investigare. Ricorda: ogni rifugio può essere visitato solo una volta di giorno!' });
      } else {
        handleNightConsumption();
        const maxRecovery = characterSheet.maxHP - characterSheet.currentHP;
        const nightHealing = Math.floor(maxRecovery * 0.6);
        characterStore.updateHP(nightHealing);
        addLogEntry(MessageType.REST_SUCCESS, {
          healingAmount: nightHealing,
          location: 'rifugio notturno'
        });
        const DAWN_TIME = 360;
        const minutesToDawn = (1440 - timeState.currentTime + DAWN_TIME) % 1440;
        advanceTime(minutesToDawn);
      }
    }
  },

  useItem: (slotIndex) => {
    const { items, addLogEntry } = get();
    const characterStore = useCharacterStore.getState();
    const { characterSheet } = characterStore;
    const itemStack = characterSheet.inventory[slotIndex];

    if (!itemStack) return false;
    const item = items[itemStack.itemId];
    if (!item || !item.effect) return false;

    let effectApplied = 0;
    let messageContext: Record<string, any> = { item: item.name };
    const newInventory = [...characterSheet.inventory];
    const currentStack = newInventory[slotIndex];
    if (!currentStack) return false;

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

    // Gestione effetti speciali per manuali di crafting
    if (item.effect === 'unlock_recipes') {
      const manualId = item.effectValue as string;

      // Chiama la funzione di callback per sbloccare ricette
      const callback = get().unlockRecipesCallback;
      if (callback && typeof callback === 'function') {
        callback(manualId);
      }

      addLogEntry(MessageType.DISCOVERY, {
        discovery: `Hai studiato il ${item.name} e imparato nuove ricette!`
      });

      // Rimuovi il manuale dall'inventario (non stackable, quindi rimuovi 1)
      useInventoryStore.getState().removeItem(slotIndex, 1);
      return true;

    } else if (effectApplied > 0) {
      switch (item.effect) {
        case 'heal': characterStore.updateHP(effectApplied); addLogEntry(MessageType.HP_RECOVERY, { healing: effectApplied }); break;
        case 'satiety': set(s => ({ survivalState: { ...s.survivalState, hunger: Math.min(100, s.survivalState.hunger + effectApplied) } })); break;
        case 'hydration': set(s => ({ survivalState: { ...s.survivalState, thirst: Math.min(100, s.survivalState.thirst + effectApplied) } })); break;
      }
      addLogEntry(MessageType.ITEM_USED, messageContext);
      characterStore.updateCharacterSheet({ ...characterSheet, inventory: newInventory });
      return true;
    }

    return false;
  },

  dropItem: (slotIndex) => {
    const characterStore = useCharacterStore.getState();
    const { characterSheet } = characterStore;
    const { items, addLogEntry } = get();
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) return;
    const item = items[slot.itemId];
    if (item?.type === 'quest') {
      addLogEntry(MessageType.ACTION_FAIL, { reason: `${item.name} è troppo importante.` });
      return;
    }
    useInventoryStore.getState().removeItem(slotIndex, slot.quantity);
    addLogEntry(MessageType.INVENTORY_CHANGE, { action: `Hai gettato ${item.name}.` });
  },

  consumeItem: (slotIndex) => {
    const { items, addLogEntry, survivalState } = get();
    const characterStore = useCharacterStore.getState();
    const { characterSheet } = characterStore;
    const slot = characterSheet.inventory[slotIndex];
    if (!slot) return false;

    const item = items[slot.itemId];
    if (!item || (item.type !== 'consumable' && item.type !== 'Consumable')) {
      addLogEntry(MessageType.ACTION_FAIL, { reason: 'Questo oggetto non è consumabile.' });
      return false;
    }

    // Applica effetto dell'oggetto
    let effectApplied = false;
    const effectValue = typeof item.effectValue === 'number' ? item.effectValue : parseInt(item.effectValue as string) || 0;

    switch (item.effect) {
      case 'heal':
        const healAmount = effectValue;
        const oldHP = characterSheet.currentHP;
        const newHP = Math.min(characterSheet.maxHP, oldHP + healAmount);
        const actualHeal = newHP - oldHP;

        if (actualHeal > 0) {
          characterStore.updateHP(actualHeal);
          addLogEntry(MessageType.HP_RECOVERY, {
            healing: actualHeal,
            item: item.name
          });
          effectApplied = true;
        } else {
          addLogEntry(MessageType.ACTION_FAIL, {
            reason: 'Sei già in piena salute.'
          });
          return false;
        }
        break;

      case 'satiety':
        const hungerRestore = effectValue;
        const newHunger = Math.min(100, survivalState.hunger + hungerRestore);
        const actualHungerRestore = newHunger - survivalState.hunger;

        if (actualHungerRestore > 0) {
          set(state => ({
            survivalState: {
              ...state.survivalState,
              hunger: newHunger
            }
          }));
          addLogEntry(MessageType.ACTION_SUCCESS, {
            action: `Hai consumato ${item.name}. Sazietà ripristinata: +${actualHungerRestore}`
          });
          effectApplied = true;
        } else {
          addLogEntry(MessageType.ACTION_FAIL, {
            reason: 'Non hai fame al momento.'
          });
          return false;
        }
        break;

      case 'hydration':
        const thirstRestore = effectValue;
        const newThirst = Math.min(100, survivalState.thirst + thirstRestore);
        const actualThirstRestore = newThirst - survivalState.thirst;

        if (actualThirstRestore > 0) {
          set(state => ({
            survivalState: {
              ...state.survivalState,
              thirst: newThirst
            }
          }));
          addLogEntry(MessageType.ACTION_SUCCESS, {
            action: `Hai bevuto ${item.name}. Sete ripristinata: +${actualThirstRestore}`
          });
          effectApplied = true;
        } else {
          addLogEntry(MessageType.ACTION_FAIL, {
            reason: 'Non hai sete al momento.'
          });
          return false;
        }
        break;

      default:
        addLogEntry(MessageType.ACTION_FAIL, {
          reason: `Effetto sconosciuto: ${item.effect}`
        });
        return false;
    }

    // Se l'effetto è stato applicato, rimuovi l'oggetto
    if (effectApplied) {
      useInventoryStore.getState().removeItem(slotIndex, 1);
      return true;
    }

    return false;
  },


  // --- NOTIFICATION SYSTEM ---
  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    set(state => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Callback system for avoiding circular dependencies
  setUnlockRecipesCallback: (callback: (manualId: string) => void) => {
    set({ unlockRecipesCallback: callback });
  },

  // --- FACADE METHODS FOR DELEGATING TO SPECIALIZED STORES ---
  
  // Character-related facade methods
  performAbilityCheck: (ability, difficulty, addToJournal = true, successMessageType) => {
    const characterStore = useCharacterStore.getState();
    const result = characterStore.performAbilityCheck(ability, difficulty);
    return {
      success: result.success,
      roll: result.roll,
      modifier: result.modifier,
      total: result.total,
      difficulty: difficulty
    };
  },

  shortRest: () => {
    useCharacterStore.getState().shortRest();
  },

  // Shelter system facade methods
  createShelterKey: (x, y) => {
    return useShelterStore.getState().createShelterKey(x, y);
  },

  getShelterInfo: (x, y) => {
    return useShelterStore.getState().getShelterInfo(x, y);
  },

  createShelterInfo: (x, y) => {
    return useShelterStore.getState().createShelterInfo(x, y);
  },

  updateShelterAccess: (x, y, updates) => {
    useShelterStore.getState().updateShelterAccess(x, y, updates);
  },

  isShelterAccessible: (x, y) => {
    return useShelterStore.getState().isShelterAccessible(x, y);
  },

  canInvestigateShelter: (x, y) => {
    return useShelterStore.getState().canInvestigateShelter(x, y);
  },

  resetShelterInvestigations: () => {
    useShelterStore.getState().resetShelterInvestigations();
  },

  // Weather system facade methods
  updateWeather: () => {
    useWeatherStore.getState().updateWeather();
  },

  getWeatherEffects: () => {
    return useWeatherStore.getState().getWeatherEffects();
  },

  generateWeatherChange: () => {
    return useWeatherStore.getState().generateWeatherChange();
  },

  applyWeatherEffects: (baseValue, effectType) => {
    return useWeatherStore.getState().applyWeatherEffects(baseValue, effectType);
  },

  createClearWeather: () => {
    return useWeatherStore.getState().createClearWeather();
  },

  getWeatherDescription: (weather) => {
    return useWeatherStore.getState().getWeatherDescription(weather);
  },

  getRandomWeatherMessage: (weather) => {
    return useWeatherStore.getState().getRandomWeatherMessage(weather);
  },

  getWeatherPatterns: () => {
    return useWeatherStore.getState().getWeatherPatterns();
  },

  getTimeBasedWeatherModifiers: (timeState) => {
    return useWeatherStore.getState().getTimeBasedWeatherModifiers(timeState);
  },

  selectWeatherWithModifiers: (possibleTransitions, timeModifier) => {
    return useWeatherStore.getState().selectWeatherWithModifiers(possibleTransitions, timeModifier);
  },


}));