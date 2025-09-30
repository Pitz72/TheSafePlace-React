import { create } from 'zustand';
import type { SurvivalState as SurvivalStateType } from '@/interfaces/gameState';
import { MessageType } from '@/data/MessageArchive';
import { useCharacterStore } from '@/stores/character/characterStore';
import { useTimeStore } from '@/stores/time/timeStore';
import { useInventoryStore } from '@/stores/inventory/inventoryStore';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { calculateRestResults, calculateNightConsumption, getSurvivalStatus, applySurvivalPenalties } from '@/utils/survivalUtils';
import { handleStoreError, executeWithRetry, GameErrorCategory } from '@/services/errorService';

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
    return executeWithRetry({
      operation: () => {
        set(state => ({
          survivalState: { ...state.survivalState, ...updates }
        }));
        return { success: true };
      },
      category: GameErrorCategory.SURVIVAL,
      context: 'Errore durante l\'aggiornamento dello stato di sopravvivenza',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.SURVIVAL, 'Errore durante l\'aggiornamento dello stato di sopravvivenza'),
      onFallback: () => ({ success: false })
    });
  },

  shortRest: (addLogEntry: (type: MessageType, context?: any) => void) => {
    return executeWithRetry({
      operation: () => {
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
        
        return { success: true };
      },
      category: GameErrorCategory.SURVIVAL,
      context: 'Errore durante il riposo breve',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.SURVIVAL, 'Errore durante il riposo breve'),
      onFallback: () => {
        addLogEntry(MessageType.AMBIANCE_RANDOM, {
          text: 'Non sei riuscito a riposare adeguatamente.'
        });
        return { success: false };
      }
    });
  },

  handleNightConsumption: (addLogEntry: (type: MessageType, context?: any) => void) => {
    return executeWithRetry({
      operation: () => {
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
        
        return { success: true };
      },
      category: GameErrorCategory.SURVIVAL,
      context: 'Errore durante il consumo notturno',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.SURVIVAL, 'Errore durante il consumo notturno'),
      onFallback: () => {
        addLogEntry(MessageType.AMBIANCE_RANDOM, {
          text: 'La notte è stata difficile e non hai recuperato come speravi.'
        });
        return { success: false };
      }
    });
  },

  checkSurvivalStatus: () => {
    return executeWithRetry({
      operation: () => {
        const { survivalState } = get();
        return getSurvivalStatus(survivalState);
      },
      category: GameErrorCategory.SURVIVAL,
      context: 'Errore durante il controllo dello stato di sopravvivenza',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.SURVIVAL, 'Errore durante il controllo dello stato di sopravvivenza'),
      onFallback: () => ({ hunger: 'sconosciuto', thirst: 'sconosciuto', fatigue: 'sconosciuto' })
    });
  },

  applySurvivalEffects: (addLogEntry: (type: MessageType, context?: any) => void) => {
    return executeWithRetry({
      operation: () => {
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
        
        return { success: true };
      },
      category: GameErrorCategory.SURVIVAL,
      context: 'Errore durante l\'applicazione degli effetti di sopravvivenza',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.SURVIVAL, 'Errore durante l\'applicazione degli effetti di sopravvivenza'),
      onFallback: () => ({ success: false })
    });
  },

  applyMovementSurvivalCost: (weatherEffects) => {
    return executeWithRetry({
      operation: () => {
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
        
        return { success: true };
      },
      category: GameErrorCategory.SURVIVAL,
      context: 'Errore durante l\'applicazione del costo di movimento',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.SURVIVAL, 'Errore durante l\'applicazione del costo di movimento'),
      onFallback: () => ({ success: false })
    });
  },

  resetSurvivalState: () => {
    return executeWithRetry({
      operation: () => {
        set({ survivalState: INITIAL_SURVIVAL_STATE });
        return { success: true };
      },
      category: GameErrorCategory.SURVIVAL,
      context: 'Errore durante il reset dello stato di sopravvivenza',
      onFailure: (error) => handleStoreError(error, GameErrorCategory.SURVIVAL, 'Errore durante il reset dello stato di sopravvivenza'),
      onFallback: () => ({ success: false })
    });
  }
}));