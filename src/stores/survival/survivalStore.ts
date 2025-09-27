import { create } from 'zustand';
import type { SurvivalState as SurvivalStateType } from '@/interfaces/gameState';
import { MessageType } from '@/data/MessageArchive';
import { useCharacterStore } from '@/stores/character/characterStore';
import { useTimeStore } from '@/stores/time/timeStore';
import { useInventoryStore } from '@/stores/inventory/inventoryStore';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { calculateRestResults, calculateNightConsumption, getSurvivalStatus, applySurvivalPenalties } from '@/utils/survivalUtils';

// Minimal interface to avoid direct dependency on weatherStore shape
interface WeatherEffects {
  survivalModifier: number;
}

interface SurvivalState {
  survivalState: SurvivalStateType;
}

interface SurvivalActions {
  updateSurvival: (updates: Partial<SurvivalStateType>) => void;
  shortRest: (addLogEntry: (type: MessageType, context?: any) => void) => void;
  handleNightConsumption: (addLogEntry: (type: MessageType, context?: any) => void) => void;
  checkSurvivalStatus: () => { hunger: string; thirst: string; fatigue: string };
  applySurvivalEffects: (addLogEntry: (type: MessageType, context?: any) => void) => void;
  applyMovementSurvivalCost: (weatherEffects: WeatherEffects) => void;
  resetSurvivalState: () => void;
}

export type SurvivalStore = SurvivalState & SurvivalActions;

const INITIAL_SURVIVAL_STATE: SurvivalStateType = {
  hunger: 100,
  thirst: 100,
  fatigue: 0,
  shelter: false,
  fire: false,
  waterSource: false
};

export const useSurvivalStore = create<SurvivalStore>((set, get) => ({
  // --- INITIAL STATE ---
  survivalState: INITIAL_SURVIVAL_STATE,

  // --- ACTIONS ---
  
  updateSurvival: (updates: Partial<SurvivalStateType>) => {
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
    
    const { newFatigue, newHunger, newThirst, fatigueReduction, hungerLoss, thirstLoss } = calculateRestResults(survivalState);

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

    const { newHunger, newThirst, newFatigue, hungerLoss, thirstLoss, fatigueReduction } = calculateNightConsumption(survivalState);

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
    return getSurvivalStatus(survivalState);
  },

  applySurvivalEffects: (addLogEntry: (type: MessageType, context?: any) => void) => {
    const { survivalState } = get();
    const characterStore = useCharacterStore.getState();

    const penalties = applySurvivalPenalties(survivalState, characterStore.characterSheet);

    if (penalties.damage > 0) {
      characterStore.updateHP(-penalties.damage);
      penalties.messages.forEach(msg => {
        addLogEntry(MessageType.HP_DAMAGE, { damage: msg.damage, reason: msg.reason });
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