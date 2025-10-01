import { create } from 'zustand';
import type { WeatherState } from '../../interfaces/gameState';
import { MessageType } from '../../data/MessageArchive';
import { useCharacterStore } from '../character/characterStore';
import { useTimeStore } from '../time/timeStore';
import { useItemStore } from '../item/itemStore'; // <-- Cambiato
import { useGameStore } from '../gameStore'; // <-- Aggiunto
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
    const notificationStore = useNotificationStore.getState();
    const gameStore = useGameStore.getState();
    const itemStore = useItemStore.getState();
    const { calculateRiverDifficulty, getRiverCrossingModifierInfo } = get();
    
    const baseDifficulty = calculateRiverDifficulty(
      timeStore.weatherState,
      timeStore.timeState.timeOfDay
    );
    
    const modifierInfo = getRiverCrossingModifierInfo();
    const finalDifficulty = Math.max(5, baseDifficulty + modifierInfo.total);
    
    const result = characterStore.performAbilityCheck('athletics', finalDifficulty);
    
    const timestamp = Date.now();
    const modifierNames = modifierInfo.modifiers.map(m => m.name);
    
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
      notificationStore.addLogEntry(MessageType.RIVER_CROSSING, {
        success: true,
        difficulty: finalDifficulty,
        roll: result.roll,
        total: result.total,
        modifiers: modifierNames
      });
      timeStore.advanceTime(30);
    } else {
      notificationStore.addLogEntry(MessageType.RIVER_CROSSING, {
        success: false,
        difficulty: finalDifficulty,
        roll: result.roll,
        total: result.total,
        modifiers: modifierNames
      });
      
      const failureMargin = finalDifficulty - result.total;
      
      if (failureMargin >= 10) {
        const damage = Math.floor(characterStore.characterSheet.maxHP * 0.2);
        characterStore.takeDamage(damage);
        notificationStore.addLogEntry(MessageType.HP_DAMAGE, { damage, reason: 'attraversamento fiume fallito' });
        
        const playerInventory = characterStore.characterSheet.inventory.filter(s => s !== null);
        if (playerInventory.length > 0 && Math.random() < 0.3) {
          const randomSlot = playerInventory[Math.floor(Math.random() * playerInventory.length)];
          if(randomSlot) {
            const itemDetails = itemStore.getItemById(randomSlot.itemId);
            if (itemDetails) {
              gameStore.removeItems(randomSlot.itemId, 1);
              notificationStore.addLogEntry(MessageType.ITEM_DROPPED, { itemName: itemDetails.name, reason: 'perso nel fiume' });
            }
          }
        }
      } else if (failureMargin >= 5) {
        const damage = Math.floor(characterStore.characterSheet.maxHP * 0.1);
        characterStore.takeDamage(damage);
        notificationStore.addLogEntry(MessageType.HP_DAMAGE, { damage, reason: 'attraversamento fiume difficoltoso' });
      } else {
        notificationStore.addLogEntry(MessageType.AMBIANCE_RANDOM, { text: 'Hai avuto difficoltà ad attraversare il fiume, ma sei riuscito a farcela con qualche graffio.' });
      }
      timeStore.advanceTime(45);
    }
  },

  calculateRiverDifficulty: (weather: WeatherState, timeOfDay: string) => {
    let difficulty = 12;
    if (weather.condition === 'storm' || weather.condition === 'heavy_rain') difficulty += 6;
    else if (weather.condition === 'rain') difficulty += 3;
    else if (weather.condition === 'fog') difficulty += 2;
    else if (weather.condition === 'clear' || weather.condition === 'sunny') difficulty -= 1;
    if (timeOfDay === 'night') difficulty += 4;
    else if (timeOfDay === 'dawn' || timeOfDay === 'dusk') difficulty += 2;
    else if (timeOfDay === 'morning' || timeOfDay === 'afternoon') difficulty -= 1;
    return Math.max(8, difficulty);
  },

  getRiverCrossingModifierInfo: () => {
    const characterStore = useCharacterStore.getState();
    const { calculateEquipmentModifierForRiver } = get();
    const modifiers: Array<{ name: string; value: number; description: string }> = [];
    
    const athletics = characterStore.characterSheet.skills.atletica || 0;
    if (athletics > 0) {
      modifiers.push({ name: 'Atletica', value: -athletics, description: `Bonus atletica: -${athletics} alla difficoltà` });
    }
    
    const hpPercentage = characterStore.characterSheet.currentHP / characterStore.characterSheet.maxHP;
    if (hpPercentage < 0.3) {
      modifiers.push({ name: 'Ferite gravi', value: 4, description: 'Le tue ferite rendono l\'attraversamento più difficile' });
    } else if (hpPercentage < 0.6) {
      modifiers.push({ name: 'Ferite moderate', value: 2, description: 'Le tue ferite ostacolano leggermente l\'attraversamento' });
    }
    
    const equipmentModifier = calculateEquipmentModifierForRiver();
    if (equipmentModifier !== 0) {
      modifiers.push({ name: 'Equipaggiamento', value: equipmentModifier, description: equipmentModifier < 0 ? 'Il tuo equipaggiamento ti aiuta' : 'Il tuo equipaggiamento ti ostacola' });
    }
    
    const total = modifiers.reduce((sum, mod) => sum + mod.value, 0);
    return { modifiers, total };
  },

  calculateEquipmentModifierForRiver: () => {
    const inventory = useCharacterStore.getState().characterSheet.inventory;
    const itemStore = useItemStore.getState();
    let modifier = 0;
    
    const playerItems = inventory.map(slot => slot ? itemStore.getItemById(slot.itemId) : null).filter((item): item is NonNullable<typeof item> => item !== null);

    if (playerItems.some(item => item.id.includes('rope'))) modifier -= 2;
    if (playerItems.some(item => item.id.includes('waterproof'))) modifier -= 1;
    if (playerItems.some(item => item.id.includes('swimming'))) modifier -= 3;
    if (playerItems.some(item => item.id.includes('heavy_armor'))) modifier += 3;
    
    const totalWeight = playerItems.reduce((sum, item) => sum + (item.weight || 0), 0);
    if (totalWeight > 50) {
      modifier += Math.floor((totalWeight - 50) / 10);
    }
    return modifier;
  },

  getEquipmentModifierDescription: () => {
    const inventory = useCharacterStore.getState().characterSheet.inventory;
    const itemStore = useItemStore.getState();
    const descriptions: string[] = [];
    const playerItems = inventory.map(slot => slot ? itemStore.getItemById(slot.itemId) : null).filter((item): item is NonNullable<typeof item> => item !== null);
    
    if (playerItems.some(item => item.id.includes('rope'))) descriptions.push('La corda ti aiuterà a mantenere l\'equilibrio');
    if (playerItems.some(item => item.id.includes('waterproof'))) descriptions.push('L\'equipaggiamento impermeabile ti proteggerà');
    if (playerItems.some(item => item.id.includes('swimming'))) descriptions.push('L\'attrezzatura da nuoto ti darà un grande vantaggio');
    if (playerItems.some(item => item.id.includes('heavy_armor'))) descriptions.push('L\'armatura pesante ti appesantirà nell\'acqua');
    
    const totalWeight = playerItems.reduce((sum, item) => sum + (item.weight || 0), 0);
    if (totalWeight > 50) {
      descriptions.push('Il peso eccessivo dell\'equipaggiamento ti ostacolerà');
    }
    return descriptions;
  },

  resetRiverCrossingState: () => set({ crossingAttempts: 0, lastCrossingTime: 0, crossingHistory: [] }),
  resetRiverCrossing: () => get().resetRiverCrossingState(),
}));