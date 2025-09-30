import { create } from 'zustand';
import type { WeatherState } from '../../interfaces/gameState';
import { MessageType } from '../../data/MessageArchive';
import { useCharacterStore } from '../character/characterStore';
import { useTimeStore } from '../time/timeStore';
import { useInventoryStore } from '../inventory/inventoryStore';
import { useNotificationStore } from '../notifications/notificationStore';

export interface RiverCrossingState {
  // State
  crossingAttempts: number;
  lastCrossingTime: number;
  crossingHistory: Array<{
    timestamp: number;
    success: boolean;
    difficulty: number;
    modifiers: string[];
  }>;
  
  // Actions
  attemptRiverCrossing: () => void;
  calculateRiverDifficulty: (weather: WeatherState, timeOfDay: string) => number;
  getRiverCrossingModifierInfo: () => { modifiers: Array<{ name: string; value: number; description: string }>; total: number };
  calculateEquipmentModifierForRiver: () => number;
  getEquipmentModifierDescription: () => string[];
  resetRiverCrossingState: () => void;
  resetRiverCrossing: () => void;
}

export const useRiverCrossingStore = create<RiverCrossingState>((set, get) => ({
  // --- INITIAL STATE ---
  crossingAttempts: 0,
  lastCrossingTime: 0,
  crossingHistory: [],

  // --- ACTIONS ---
  
  attemptRiverCrossing: () => {
    const characterStore = useCharacterStore.getState();
    const timeStore = useTimeStore.getState();
    const inventoryStore = useInventoryStore.getState();
    const notificationStore = useNotificationStore.getState();
    const { calculateRiverDifficulty, getRiverCrossingModifierInfo } = get();
    
    // Calcola la difficoltà base
    const baseDifficulty = calculateRiverDifficulty(
      timeStore.weatherState,
      timeStore.timeState.timeOfDay
    );
    
    // Ottieni i modificatori
    const modifierInfo = getRiverCrossingModifierInfo();
    const finalDifficulty = Math.max(5, baseDifficulty + modifierInfo.total);
    
    // Esegui il controllo di abilità
    const result = characterStore.performAbilityCheck('athletics', finalDifficulty);
    
    const timestamp = Date.now();
    const modifierNames = modifierInfo.modifiers.map(m => m.name);
    
    // Registra il tentativo nella storia
    set(state => ({
      crossingAttempts: state.crossingAttempts + 1,
      lastCrossingTime: timestamp,
      crossingHistory: [...state.crossingHistory, {
        timestamp,
        success: result.success,
        difficulty: finalDifficulty,
        modifiers: modifierNames
      }]
    }));
    
    if (result.success) {
      // Successo - attraversamento riuscito
      notificationStore.addLogEntry(MessageType.RIVER_CROSSING, {
        success: true,
        difficulty: finalDifficulty,
        roll: result.roll,
        total: result.total,
        modifiers: modifierNames
      });
      
      // Avanza il tempo (attraversamento richiede tempo)
      timeStore.advanceTime(30);
      
      // Piccola perdita di energia
      const fatigueIncrease = Math.floor(Math.random() * 5) + 3;
      // Assumendo che ci sia un survival store
      // survivalStore.updateSurvival({ fatigue: survivalState.fatigue + fatigueIncrease });
      
    } else {
      // Fallimento - conseguenze negative
      notificationStore.addLogEntry(MessageType.RIVER_CROSSING, {
        success: false,
        difficulty: finalDifficulty,
        roll: result.roll,
        total: result.total,
        modifiers: modifierNames
      });
      
      // Determina le conseguenze del fallimento
      const failureMargin = finalDifficulty - result.total;
      
      if (failureMargin >= 10) {
        // Fallimento critico - danni gravi e perdita di oggetti
        const damage = Math.floor(characterStore.characterSheet.maxHP * 0.2);
        characterStore.updateHP(-damage);
        
        notificationStore.addLogEntry(MessageType.HP_DAMAGE, {
          damage,
          reason: 'attraversamento fiume fallito'
        });
        
        // Possibilità di perdere oggetti
        const items = inventoryStore.items;
        if (items.length > 0 && Math.random() < 0.3) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          inventoryStore.removeItem(randomItem.id);
          
          notificationStore.addLogEntry(MessageType.ITEM_DROPPED, {
            itemName: randomItem.name,
            reason: 'perso nel fiume'
          });
        }
        
      } else if (failureMargin >= 5) {
        // Fallimento moderato - danni medi
        const damage = Math.floor(characterStore.characterSheet.maxHP * 0.1);
        characterStore.updateHP(-damage);
        
        notificationStore.addLogEntry(MessageType.HP_DAMAGE, {
          damage,
          reason: 'attraversamento fiume difficoltoso'
        });
        
      } else {
        // Fallimento lieve - solo fatica extra
        notificationStore.addLogEntry(MessageType.AMBIANCE_RANDOM, {
          text: 'Hai avuto difficoltà ad attraversare il fiume, ma sei riuscito a farcela con qualche graffio.'
        });
      }
      
      // Avanza comunque il tempo (tentativo fallito richiede tempo)
      timeStore.advanceTime(45);
      
      // Maggiore perdita di energia per il fallimento
      const fatigueIncrease = Math.floor(Math.random() * 10) + 8;
      // survivalStore.updateSurvival({ fatigue: survivalState.fatigue + fatigueIncrease });
    }
  },

  calculateRiverDifficulty: (weather: WeatherState, timeOfDay: string) => {
    let difficulty = 12; // Difficoltà base
    
    // Modificatori meteo
    switch (weather.condition) {
      case 'storm':
      case 'heavy_rain':
        difficulty += 6;
        break;
      case 'rain':
        difficulty += 3;
        break;
      case 'fog':
        difficulty += 2;
        break;
      case 'clear':
      case 'sunny':
        difficulty -= 1;
        break;
    }
    
    // Modificatori tempo
    switch (timeOfDay) {
      case 'night':
        difficulty += 4;
        break;
      case 'dawn':
      case 'dusk':
        difficulty += 2;
        break;
      case 'morning':
      case 'afternoon':
        difficulty -= 1;
        break;
    }
    
    return Math.max(8, difficulty);
  },

  getRiverCrossingModifierInfo: () => {
    const characterStore = useCharacterStore.getState();
    const { calculateEquipmentModifierForRiver } = get();
    
    const modifiers: Array<{ name: string; value: number; description: string }> = [];
    
    // Modificatori delle statistiche del personaggio
    const athletics = characterStore.characterSheet.athletics || 0;
    if (athletics > 0) {
      modifiers.push({
        name: 'Atletica',
        value: -athletics,
        description: `Bonus atletica: -${athletics} alla difficoltà`
      });
    }
    
    // Modificatori di salute
    const hpPercentage = characterStore.characterSheet.currentHP / characterStore.characterSheet.maxHP;
    if (hpPercentage < 0.3) {
      modifiers.push({
        name: 'Ferite gravi',
        value: 4,
        description: 'Le tue ferite rendono l\'attraversamento più difficile'
      });
    } else if (hpPercentage < 0.6) {
      modifiers.push({
        name: 'Ferite moderate',
        value: 2,
        description: 'Le tue ferite ostacolano leggermente l\'attraversamento'
      });
    }
    
    // Modificatori equipaggiamento
    const equipmentModifier = calculateEquipmentModifierForRiver();
    if (equipmentModifier !== 0) {
      modifiers.push({
        name: 'Equipaggiamento',
        value: equipmentModifier,
        description: equipmentModifier < 0 
          ? 'Il tuo equipaggiamento ti aiuta nell\'attraversamento'
          : 'Il tuo equipaggiamento ostacola l\'attraversamento'
      });
    }
    
    const total = modifiers.reduce((sum, mod) => sum + mod.value, 0);
    
    return { modifiers, total };
  },

  calculateEquipmentModifierForRiver: () => {
    const inventoryStore = useInventoryStore.getState();
    let modifier = 0;
    
    // Controlla oggetti utili per l'attraversamento
    const hasRope = inventoryStore.items.some(item => 
      item.name.toLowerCase().includes('corda') || 
      item.name.toLowerCase().includes('rope')
    );
    
    const hasWaterproofGear = inventoryStore.items.some(item => 
      item.name.toLowerCase().includes('impermeabile') ||
      item.name.toLowerCase().includes('waterproof')
    );
    
    const hasHeavyArmor = inventoryStore.items.some(item => 
      (item.name.toLowerCase().includes('armatura') || item.name.toLowerCase().includes('armor')) &&
      (item.name.toLowerCase().includes('pesante') || item.name.toLowerCase().includes('heavy'))
    );
    
    const hasSwimmingGear = inventoryStore.items.some(item => 
      item.name.toLowerCase().includes('nuoto') ||
      item.name.toLowerCase().includes('swimming') ||
      item.name.toLowerCase().includes('pinne')
    );
    
    // Applica modificatori
    if (hasRope) modifier -= 2;
    if (hasWaterproofGear) modifier -= 1;
    if (hasSwimmingGear) modifier -= 3;
    if (hasHeavyArmor) modifier += 3;
    
    // Peso eccessivo
    const totalWeight = inventoryStore.items.reduce((sum, item) => sum + (item.weight || 0), 0);
    if (totalWeight > 50) {
      modifier += Math.floor((totalWeight - 50) / 10);
    }
    
    return modifier;
  },

  getEquipmentModifierDescription: () => {
    const inventoryStore = useInventoryStore.getState();
    const descriptions: string[] = [];
    
    const hasRope = inventoryStore.items.some(item => 
      item.name.toLowerCase().includes('corda') || 
      item.name.toLowerCase().includes('rope')
    );
    
    const hasWaterproofGear = inventoryStore.items.some(item => 
      item.name.toLowerCase().includes('impermeabile') ||
      item.name.toLowerCase().includes('waterproof')
    );
    
    const hasHeavyArmor = inventoryStore.items.some(item => 
      (item.name.toLowerCase().includes('armatura') || item.name.toLowerCase().includes('armor')) &&
      (item.name.toLowerCase().includes('pesante') || item.name.toLowerCase().includes('heavy'))
    );
    
    const hasSwimmingGear = inventoryStore.items.some(item => 
      item.name.toLowerCase().includes('nuoto') ||
      item.name.toLowerCase().includes('swimming') ||
      item.name.toLowerCase().includes('pinne')
    );
    
    if (hasRope) descriptions.push('La corda ti aiuterà a mantenere l\'equilibrio');
    if (hasWaterproofGear) descriptions.push('L\'equipaggiamento impermeabile ti proteggerà');
    if (hasSwimmingGear) descriptions.push('L\'attrezzatura da nuoto ti darà un grande vantaggio');
    if (hasHeavyArmor) descriptions.push('L\'armatura pesante ti appesantirà nell\'acqua');
    
    const totalWeight = inventoryStore.items.reduce((sum, item) => sum + (item.weight || 0), 0);
    if (totalWeight > 50) {
      descriptions.push('Il peso eccessivo dell\'equipaggiamento ti ostacolerà');
    }
    
    return descriptions;
  },

  resetRiverCrossingState: () => {
    set({
      crossingAttempts: 0,
      lastCrossingTime: 0,
      crossingHistory: []
    });
  },

  /**
   * Alias per resetRiverCrossingState per coerenza con gli altri store.
   * Resetta tutti i dati di attraversamento fiume allo stato iniziale.
   */
  resetRiverCrossing: () => {
    get().resetRiverCrossingState();
  }
}));