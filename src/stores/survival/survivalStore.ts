import { create } from 'zustand';
import type { SurvivalState } from '../../interfaces/gameState';
import { MessageType } from '../../data/MessageArchive';
import { useCharacterStore } from '../character/characterStore';
import { useTimeStore } from '../time/timeStore';
import { useInventoryStore } from '../inventory/inventoryStore';
import { useNotificationStore } from '../notifications/notificationStore';

// Minimal interface to avoid direct dependency on weatherStore shape
interface WeatherEffects {
  survivalModifier: number;
}

export interface SurvivalStoreState {
  // State
  survivalState: SurvivalState;
  
  // Actions
  updateSurvival: (updates: Partial<SurvivalState>) => void;
  shortRest: (addLogEntry: (type: MessageType, context?: any) => void) => void;
  handleNightConsumption: (addLogEntry: (type: MessageType, context?: any) => void) => void;
  checkSurvivalStatus: () => { hunger: string; thirst: string; fatigue: string };
  applySurvivalEffects: (addLogEntry: (type: MessageType, context?: any) => void) => void;
  applyMovementSurvivalCost: (weatherEffects: WeatherEffects) => void;
  resetSurvivalState: () => void;
}

const INITIAL_SURVIVAL_STATE: SurvivalState = {
  hunger: 100,
  thirst: 100,
  fatigue: 0,
  shelter: false,
  fire: false,
  waterSource: false
};

export const useSurvivalStore = create<SurvivalStoreState>((set, get) => ({
  // --- INITIAL STATE ---
  survivalState: INITIAL_SURVIVAL_STATE,

  // --- ACTIONS ---
  
  updateSurvival: (updates: Partial<SurvivalState>) => {
    set(state => ({
      survivalState: { ...state.survivalState, ...updates }
    }));
  },

  shortRest: (addLogEntry: (type: MessageType, context?: any) => void) => {
    const timeStore = useTimeStore.getState();
    const characterStore = useCharacterStore.getState();
    const inventoryStore = useInventoryStore.getState();
    const { survivalState, updateSurvival } = get();
    
    // Avanza il tempo di 1 ora
    timeStore.advanceTime(60);
    
    // Calcola il recupero di fatica
    let fatigueReduction = 15;
    if (survivalState.shelter) fatigueReduction += 5;
    if (survivalState.fire) fatigueReduction += 5;
    
    const newFatigue = Math.max(0, survivalState.fatigue - fatigueReduction);
    
    // Calcola il consumo di risorse
    const hungerLoss = 5;
    const thirstLoss = 8;
    
    const newHunger = Math.max(0, survivalState.hunger - hungerLoss);
    const newThirst = Math.max(0, survivalState.thirst - thirstLoss);
    
    // Aggiorna lo stato
    updateSurvival({
      hunger: newHunger,
      thirst: newThirst,
      fatigue: newFatigue
    });
    
    // Recupero HP se le condizioni sono buone
    if (newHunger > 50 && newThirst > 50 && newFatigue < 50) {
      const hpRecovery = Math.floor(characterStore.characterSheet.maxHP * 0.1);
      characterStore.updateHP(hpRecovery);
      addLogEntry(MessageType.HP_RECOVERY, {
        healing: hpRecovery,
        reason: 'riposo'
      });
    }
    
    addLogEntry(MessageType.REST, {
      fatigueReduction,
      hungerLoss,
      thirstLoss,
      shelter: survivalState.shelter,
      fire: survivalState.fire
    });
    
    // Controlla gli effetti della sopravvivenza
    get().applySurvivalEffects(addLogEntry);
  },

  handleNightConsumption: (addLogEntry: (type: MessageType, context?: any) => void) => {
    const { survivalState, updateSurvival } = get();
    const characterStore = useCharacterStore.getState();
    
    // Consumo notturno base
    let hungerLoss = 15;
    let thirstLoss = 10;
    let fatigueReduction = 30;
    
    // Modificatori per shelter e fire
    if (survivalState.shelter) {
      hungerLoss -= 3;
      thirstLoss -= 2;
      fatigueReduction += 10;
    }
    
    if (survivalState.fire) {
      hungerLoss -= 2;
      fatigueReduction += 5;
    }
    
    // Accesso all'acqua riduce la sete
    if (survivalState.waterSource) {
      thirstLoss = Math.max(0, thirstLoss - 5);
    }
    
    const newHunger = Math.max(0, survivalState.hunger - hungerLoss);
    const newThirst = Math.max(0, survivalState.thirst - thirstLoss);
    const newFatigue = Math.max(0, survivalState.fatigue - fatigueReduction);
    
    updateSurvival({
      hunger: newHunger,
      thirst: newThirst,
      fatigue: newFatigue
    });
    
    // Recupero HP notturno se le condizioni sono buone
    if (newHunger > 30 && newThirst > 30) {
      const baseRecovery = Math.floor(characterStore.characterSheet.maxHP * 0.2);
      let totalRecovery = baseRecovery;
      
      if (survivalState.shelter) totalRecovery += Math.floor(baseRecovery * 0.5);
      if (survivalState.fire) totalRecovery += Math.floor(baseRecovery * 0.3);
      
      characterStore.updateHP(totalRecovery);
      addLogEntry(MessageType.HP_RECOVERY, {
        healing: totalRecovery,
        reason: 'riposo notturno'
      });
    }
    
    addLogEntry(MessageType.NIGHT_CONSUMPTION, {
      hungerLoss,
      thirstLoss,
      fatigueReduction,
      shelter: survivalState.shelter,
      fire: survivalState.fire,
      waterSource: survivalState.waterSource
    });
    
    // Controlla gli effetti della sopravvivenza
    get().applySurvivalEffects(addLogEntry);
  },

  checkSurvivalStatus: () => {
    const { survivalState } = get();
    
    const getHungerStatus = (hunger: number) => {
      if (hunger > 75) return 'Sazio';
      if (hunger > 50) return 'Leggermente affamato';
      if (hunger > 25) return 'Affamato';
      if (hunger > 10) return 'Molto affamato';
      return 'Morendo di fame';
    };
    
    const getThirstStatus = (thirst: number) => {
      if (thirst > 75) return 'Idratato';
      if (thirst > 50) return 'Leggermente assetato';
      if (thirst > 25) return 'Assetato';
      if (thirst > 10) return 'Molto assetato';
      return 'Morendo di sete';
    };
    
    const getFatigueStatus = (fatigue: number) => {
      if (fatigue < 25) return 'Riposato';
      if (fatigue < 50) return 'Leggermente stanco';
      if (fatigue < 75) return 'Stanco';
      if (fatigue < 90) return 'Molto stanco';
      return 'Esausto';
    };
    
    return {
      hunger: getHungerStatus(survivalState.hunger),
      thirst: getThirstStatus(survivalState.thirst),
      fatigue: getFatigueStatus(survivalState.fatigue)
    };
  },

  applySurvivalEffects: (addLogEntry: (type: MessageType, context?: any) => void) => {
    const { survivalState } = get();
    const characterStore = useCharacterStore.getState();
    
    // Effetti della fame estrema
    if (survivalState.hunger <= 10) {
      const damage = Math.floor(characterStore.characterSheet.maxHP * 0.05);
      characterStore.updateHP(-damage);
      addLogEntry(MessageType.HP_DAMAGE, {
        damage,
        reason: 'fame estrema'
      });
    }
    
    // Effetti della sete estrema
    if (survivalState.thirst <= 10) {
      const damage = Math.floor(characterStore.characterSheet.maxHP * 0.08);
      characterStore.updateHP(-damage);
      addLogEntry(MessageType.HP_DAMAGE, {
        damage,
        reason: 'sete estrema'
      });
    }
    
    // Effetti della fatica estrema
    if (survivalState.fatigue >= 90) {
      addLogEntry(MessageType.AMBIANCE_RANDOM, {
        text: 'Sei troppo stanco per concentrarti. Le tue azioni potrebbero essere meno efficaci.'
      });
    }
  },

  applyMovementSurvivalCost: (weatherEffects) => {
    const { survivalState, updateSurvival } = get();
    const characterStore = useCharacterStore.getState();
    const notificationStore = useNotificationStore.getState();

    const newSurvivalState = {
      ...survivalState,
      hunger: survivalState.hunger + (-0.2 * weatherEffects.survivalModifier),
      thirst: survivalState.thirst + (-0.3 * weatherEffects.survivalModifier)
    };

    updateSurvival(newSurvivalState);

    if (newSurvivalState.hunger <= 0 || newSurvivalState.thirst <= 0) {
      characterStore.updateHP(-1);
      notificationStore.addLogEntry(MessageType.HP_DAMAGE, { damage: 1, reason: 'fame e sete' });
    }
  },

  resetSurvivalState: () => {
    set({ survivalState: INITIAL_SURVIVAL_STATE });
  }
}));