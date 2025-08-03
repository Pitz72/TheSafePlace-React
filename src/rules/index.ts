// Rules System - Centralized Exports
// Parte del progetto "Rules are Rules" v0.2.0

// Types
export type {
  ICharacterStats,
  ICharacterSheet,
  ISkillCheckResult,
  AbilityType,
  IDamageResult
} from './types';

export { SkillDifficulty } from './types';

// Character Generation
export {
  rollStat,
  generateStats,
  calculateMaxHP,
  calculateBaseAC,
  calculateCarryCapacity,
  createCharacter,
  createTestCharacter
} from './characterGenerator';

// Game Mechanics
export {
  calculateModifier,
  rollD20,
  rollD4,
  performSkillCheck,
  performAbilityCheck,
  calculateRiverDamage,
  applyDamage,
  applyHealing,
  calculateShortRestHealing,
  isDead,
  isWounded,
  getHPPercentage
} from './mechanics';

// Movement Integration
export type {
  MovementResult,
  MovementContext
} from './movementIntegration';

export {
  checkMovementWithRules,
  applyMovementResults,
  getMovementJournalMessage,
  canCharacterMove,
  getMovementSpeedModifier
} from './movementIntegration';