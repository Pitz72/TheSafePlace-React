/**
 * Survival Domain - Stato del sistema di sopravvivenza
 * Gestisce fame, sete, stanchezza e condizioni ambientali
 */

export interface SurvivalNeeds {
  /** Fame (0-100, 0 = morto di fame, 100 = completamente sazio) */
  hunger: number;
  /** Sete (0-100, 0 = disidratato, 100 = idratato) */
  thirst: number;
  /** Stanchezza (0-100, 0 = riposato, 100 = esausto) */
  fatigue: number;
  /** Temperatura corporea (36-42°C, valori normali 36.5-37.5) */
  bodyTemperature: number;
}

export interface EnvironmentalConditions {
  /** Temperatura ambiente (°C) */
  temperature: number;
  /** Umidità (0-100%) */
  humidity: number;
  /** Precipitazioni (0-100, intensità) */
  precipitation: number;
  /** Vento (km/h) */
  windSpeed: number;
  /** Tipo di precipitazione */
  precipitationType: 'none' | 'rain' | 'snow' | 'hail';
}

export interface SurvivalState {
  /** Bisogni base del personaggio */
  needs: SurvivalNeeds;
  /** Condizioni ambientali correnti */
  environment: EnvironmentalConditions;
  /** Stato del rifugio (se presente) */
  shelter?: {
    type: 'tent' | 'building' | 'cave' | 'underground';
    quality: number; // 0-100
    protection: {
      cold: number; // % protezione dal freddo
      heat: number; // % protezione dal caldo
      rain: number; // % protezione dalla pioggia
      wind: number; // % protezione dal vento
    };
  };
  /** Malattie/condizioni mediche */
  conditions: {
    hasInfection: boolean;
    hasFrostbite: boolean;
    hasHeatstroke: boolean;
    hasDehydration: boolean;
    hasStarvation: boolean;
    hasExhaustion: boolean;
  };
  /** Tempo dall'ultimo pasto/acqua/riposo (in minuti) */
  timeSince: {
    lastMeal: number;
    lastDrink: number;
    lastRest: number;
  };
}

export function createInitialSurvivalState(): SurvivalState {
  return {
    needs: {
      hunger: 80, // Inizia discretamente affamato
      thirst: 70, // Leggermente assetato
      fatigue: 20, // Abbastanza riposato
      bodyTemperature: 37.0 // Temperatura normale
    },
    environment: {
      temperature: 20, // Temperatura ambiente piacevole
      humidity: 50,
      precipitation: 0,
      windSpeed: 5,
      precipitationType: 'none'
    },
    conditions: {
      hasInfection: false,
      hasFrostbite: false,
      hasHeatstroke: false,
      hasDehydration: false,
      hasStarvation: false,
      hasExhaustion: false
    },
    timeSince: {
      lastMeal: 120, // 2 ore dall'ultimo pasto
      lastDrink: 60,  // 1 ora dall'ultimo drink
      lastRest: 480   // 8 ore dall'ultimo riposo
    }
  };
}

export function updateSurvivalNeeds(
  state: SurvivalState,
  timePassed: number, // minuti passati
  activityLevel: number = 1.0 // 0.5 = riposo, 1.0 = normale, 2.0 = attività intensa
): SurvivalState {
  const newState = { ...state };

  // Calcola decadimento bisogni basato sul tempo e attività
  const hungerDecay = 0.1 * timePassed * activityLevel;
  const thirstDecay = 0.15 * timePassed * activityLevel;
  const fatigueIncrease = 0.05 * timePassed * activityLevel;

  newState.needs.hunger = Math.max(0, newState.needs.hunger - hungerDecay);
  newState.needs.thirst = Math.max(0, newState.needs.thirst - thirstDecay);
  newState.needs.fatigue = Math.min(100, newState.needs.fatigue + fatigueIncrease);

  // Aggiorna tempo trascorso
  newState.timeSince.lastMeal += timePassed;
  newState.timeSince.lastDrink += timePassed;
  newState.timeSince.lastRest += timePassed;

  // Calcola effetti ambientali sulla temperatura corporea
  updateBodyTemperature(newState);

  // Controlla condizioni critiche
  updateConditions(newState);

  return newState;
}

export function consumeFood(state: SurvivalState, nutritionValue: number): SurvivalState {
  const newState = { ...state };

  // Aumenta fame (nutrition value è 0-100)
  newState.needs.hunger = Math.min(100, newState.needs.hunger + nutritionValue);
  newState.timeSince.lastMeal = 0;

  // Riduce leggermente stanchezza se cibo nutriente
  if (nutritionValue > 50) {
    newState.needs.fatigue = Math.max(0, newState.needs.fatigue - 10);
  }

  return newState;
}

export function consumeWater(state: SurvivalState, hydrationValue: number): SurvivalState {
  const newState = { ...state };

  // Aumenta sete
  newState.needs.thirst = Math.min(100, newState.needs.thirst + hydrationValue);
  newState.timeSince.lastDrink = 0;

  // Riduce temperatura corporea se acqua fredda
  if (state.environment.temperature < 15) {
    newState.needs.bodyTemperature = Math.max(35, newState.needs.bodyTemperature - 0.2);
  }

  return newState;
}

export function rest(state: SurvivalState, restDuration: number): SurvivalState {
  const newState = { ...state };

  // Riduce stanchezza
  const fatigueReduction = restDuration * 0.5; // 30 minuti di riposo = 15 punti stanchezza
  newState.needs.fatigue = Math.max(0, newState.needs.fatigue - fatigueReduction);
  newState.timeSince.lastRest = 0;

  // Recupero parziale fame e sete durante il riposo
  const recoveryRate = restDuration * 0.02;
  newState.needs.hunger = Math.min(100, newState.needs.hunger + recoveryRate);
  newState.needs.thirst = Math.min(100, newState.needs.thirst + recoveryRate);

  return newState;
}

export function applyEnvironmentalEffects(
  state: SurvivalState,
  environment: EnvironmentalConditions
): SurvivalState {
  const newState = { ...state, environment: { ...environment } };

  // Effetti del freddo
  if (environment.temperature < 0) {
    const coldExposure = Math.abs(environment.temperature) * 0.01;
    newState.needs.bodyTemperature -= coldExposure;

    // Possibilità di congelamento
    if (newState.needs.bodyTemperature < 35 && Math.random() < 0.1) {
      newState.conditions.hasFrostbite = true;
    }
  }

  // Effetti del caldo
  if (environment.temperature > 35) {
    const heatExposure = (environment.temperature - 35) * 0.01;
    newState.needs.bodyTemperature += heatExposure;

    // Possibilità di colpo di calore
    if (newState.needs.bodyTemperature > 40 && Math.random() < 0.1) {
      newState.conditions.hasHeatstroke = true;
    }
  }

  // Effetti della pioggia
  if (environment.precipitation > 50) {
    // Aumenta rischio di malattie se esposto
    if (!newState.shelter && Math.random() < 0.05) {
      newState.conditions.hasInfection = true;
    }
  }

  return newState;
}

function updateBodyTemperature(state: SurvivalState): void {
  const { environment, needs } = state;

  // Tendenza alla temperatura ambiente
  const tempDiff = environment.temperature - needs.bodyTemperature;
  const adjustment = tempDiff * 0.001; // Molto graduale

  needs.bodyTemperature += adjustment;

  // Limiti fisiologici
  needs.bodyTemperature = Math.max(30, Math.min(45, needs.bodyTemperature));
}

function updateConditions(state: SurvivalState): void {
  const { needs, conditions } = state;

  // Condizioni critiche
  conditions.hasStarvation = needs.hunger < 10;
  conditions.hasDehydration = needs.thirst < 10;
  conditions.hasExhaustion = needs.fatigue > 90;

  // Effetti delle condizioni sulla temperatura
  if (conditions.hasStarvation) {
    needs.bodyTemperature -= 0.01; // Corpo più freddo quando affamato
  }

  if (conditions.hasDehydration) {
    needs.bodyTemperature += 0.01; // Corpo più caldo quando disidratato
  }

  if (conditions.hasExhaustion) {
    needs.bodyTemperature += 0.005; // Corpo più caldo quando esausto
  }
}

export function getSurvivalStatus(state: SurvivalState): {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  warnings: string[];
} {
  const warnings: string[] = [];
  let overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'excellent';

  // Valuta bisogni
  if (state.needs.hunger < 20) warnings.push('Fame');
  if (state.needs.thirst < 20) warnings.push('Sete');
  if (state.needs.fatigue > 80) warnings.push('Stanchezza');

  // Valuta condizioni
  if (state.conditions.hasStarvation) warnings.push('Inedia');
  if (state.conditions.hasDehydration) warnings.push('Disidratazione');
  if (state.conditions.hasExhaustion) warnings.push('Esaustione');
  if (state.conditions.hasInfection) warnings.push('Infezione');
  if (state.conditions.hasFrostbite) warnings.push('Congelamento');
  if (state.conditions.hasHeatstroke) warnings.push('Colpo di calore');

  // Determina stato generale
  const criticalConditions = warnings.length;
  if (criticalConditions >= 3) overall = 'critical';
  else if (criticalConditions >= 2) overall = 'poor';
  else if (criticalConditions >= 1) overall = 'fair';
  else if (state.needs.hunger < 50 || state.needs.thirst < 50 || state.needs.fatigue > 50) overall = 'good';
  else overall = 'excellent';

  return { overall, warnings };
}