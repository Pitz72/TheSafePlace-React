import { useWeatherStore } from '../stores/weather/weatherStore';
import { useCharacterStore } from '../stores/character/characterStore';
import { useSurvivalStore } from '../stores/survival/survivalStore';
import { useEventStore } from '../stores/events/eventStore';
import { useWorldStore } from '../stores/world/worldStore';
import { narrativeIntegration } from './narrativeIntegration';

import { MessageType } from '../data/MessageArchive';
import { useNotificationStore } from '../stores/notifications/notificationStore';

class PlayerMovementService {
  public handleMovementEffects(newBiomeKey: string): void {
    const weatherStore = useWeatherStore.getState();
    const characterStore = useCharacterStore.getState();
    const survivalStore = useSurvivalStore.getState();
    const eventStore = useEventStore.getState();
    const worldStore = useWorldStore.getState();
    const notificationStore = useNotificationStore.getState();

    // 1. Update weather and get its effects
    weatherStore.updateWeather();
    const weatherEffects = weatherStore.getWeatherEffects();

    // 2. Grant movement XP
    characterStore.gainMovementXP();

    // 3. Apply survival cost for moving
    survivalStore.applyMovementSurvivalCost(weatherEffects);

    // 4. Check for random events
    eventStore.checkForRandomEvent(newBiomeKey, weatherEffects);

    // 5. TEMPORANEAMENTE DISATTIVATO: Check for narrative events (movimento e bioma)
    // Disattivato per concentrarsi sui biome events casuali
    /*
    console.log('🚶 MOVEMENT SERVICE DEBUG - Calling narrativeIntegration for movement:', {
      biome: newBiomeKey,
      weather: weatherStore.currentWeather
    });
    narrativeIntegration.checkForNarrativeEvents?.('movement', { 
      biome: newBiomeKey, 
      weather: weatherStore.currentWeather 
    });
    console.log('🚶 MOVEMENT SERVICE DEBUG - narrativeIntegration called for movement');
    */
    
    // DEBUG: Log per verificare che gli eventi per bioma funzionino
    console.log('🎲 BIOME EVENTS DEBUG - Movement triggered for biome:', newBiomeKey);
    console.log('🎲 BIOME EVENTS DEBUG - Weather effects:', weatherEffects);
    
    // Attiva eventi casuali per bioma tramite eventStore
    console.log('🎲 BIOME EVENTS DEBUG - Calling eventStore.checkForRandomEvent()');
    eventStore.checkForRandomEvent(newBiomeKey, weatherEffects);

    // 6. Calculate movement time and advance game time
    const baseMovementTime = 10;
    const adjustedMovementTime = Math.ceil(baseMovementTime / weatherEffects.movementModifier);

    if (weatherEffects.movementModifier < 1.0) {
        const extraTime = adjustedMovementTime - baseMovementTime;
        notificationStore.addLogEntry(MessageType.AMBIANCE_RANDOM, {
            text: `Il ${weatherStore.getWeatherDescription(weatherStore.currentWeather).toLowerCase()} rallenta il tuo movimento (+${extraTime} min).`
        });
    }

    worldStore.advanceTime(adjustedMovementTime);
  }
}

export const playerMovementService = new PlayerMovementService();
