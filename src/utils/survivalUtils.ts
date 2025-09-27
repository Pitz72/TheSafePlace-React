import { SurvivalState } from '@/interfaces/gameState';
import { CharacterSheet } from '@/interfaces/character';

export const calculateRestResults = (survivalState: SurvivalState) => {
  let fatigueReduction = 15;
  if (survivalState.shelter) fatigueReduction += 5;
  if (survivalState.fire) fatigueReduction += 5;

  const hungerLoss = 5;
  const thirstLoss = 8;

  const newFatigue = Math.max(0, survivalState.fatigue - fatigueReduction);
  const newHunger = Math.max(0, survivalState.hunger - hungerLoss);
  const newThirst = Math.max(0, survivalState.thirst - thirstLoss);

  return { newFatigue, newHunger, newThirst, fatigueReduction, hungerLoss, thirstLoss };
};

export const calculateNightConsumption = (survivalState: SurvivalState) => {
  let hungerLoss = 15;
  let thirstLoss = 10;
  let fatigueReduction = 30;

  if (survivalState.shelter) {
    hungerLoss -= 3;
    thirstLoss -= 2;
    fatigueReduction += 10;
  }

  if (survivalState.fire) {
    hungerLoss -= 2;
    fatigueReduction += 5;
  }

  if (survivalState.waterSource) {
    thirstLoss = Math.max(0, thirstLoss - 5);
  }

  const newHunger = Math.max(0, survivalState.hunger - hungerLoss);
  const newThirst = Math.max(0, survivalState.thirst - thirstLoss);
  const newFatigue = Math.max(0, survivalState.fatigue - fatigueReduction);

  return { newHunger, newThirst, newFatigue, hungerLoss, thirstLoss, fatigueReduction };
};

export const getSurvivalStatus = (survivalState: SurvivalState) => {
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
    fatigue: getFatigueStatus(survivalState.fatigue),
  };
};

export const applySurvivalPenalties = (survivalState: SurvivalState, characterSheet: CharacterSheet) => {
  const penalties = {
    damage: 0,
    messages: [],
  };

  if (survivalState.hunger <= 10) {
    const damage = Math.floor(characterSheet.maxHP * 0.05);
    penalties.damage += damage;
    penalties.messages.push({ reason: 'fame estrema', damage });
  }

  if (survivalState.thirst <= 10) {
    const damage = Math.floor(characterSheet.maxHP * 0.08);
    penalties.damage += damage;
    penalties.messages.push({ reason: 'sete estrema', damage });
  }

  return penalties;
};