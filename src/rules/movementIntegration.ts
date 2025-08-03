// Movement Integration - Rules System Integration
// Integrazione tra sistema rules e movimento esistente
// Parte del progetto "Rules are Rules" v0.2.0

import type { 
  ICharacterSheet, 
  ISkillCheckResult, 
  IDamageResult 
} from './types';
import { SkillDifficulty } from './types';
import { 
  performAbilityCheck, 
  calculateRiverDamage, 
  applyDamage 
} from './mechanics';
import { MessageType } from '../data/MessageArchive';

// Interfaccia per risultati movimento con rules
export interface MovementResult {
  canMove: boolean;
  damageResult?: IDamageResult;
  skillCheckResult?: ISkillCheckResult;
  messageType?: MessageType;
  consumesTurn: boolean;
}

// Interfaccia per contesto movimento
export interface MovementContext {
  fromTerrain: string;
  toTerrain: string;
  character: ICharacterSheet;
  isExitingRiver: boolean;
}

/**
 * Verifica se un movimento è possibile applicando le regole D&D
 * @param context Contesto del movimento
 * @returns Risultato del movimento con eventuali skill check e danni
 */
export function checkMovementWithRules(context: MovementContext): MovementResult {
  const { fromTerrain, toTerrain, character, isExitingRiver } = context;
  
  // MONTAGNE: Sempre impassabili (regola ferrea)
  if (toTerrain === 'M') {
    return {
      canMove: false,
      messageType: MessageType.MOVEMENT_FAIL_MOUNTAIN,
      consumesTurn: false
    };
  }
  
  // FIUMI: Skill check Agilità + possibile danno
  if (toTerrain === '~') {
    return handleRiverCrossing(character);
  }
  
  // USCITA DA FIUME: Secondo turno consumato
  if (fromTerrain === '~' && isExitingRiver) {
    return {
      canMove: false, // Non si muove fisicamente
      messageType: MessageType.SKILL_CHECK_RIVER_SUCCESS,
      consumesTurn: true // Ma consuma il turno
    };
  }
  
  // MOVIMENTO NORMALE: Sempre permesso
  return {
    canMove: true,
    consumesTurn: true
  };
}

/**
 * Gestisce l'attraversamento di un fiume con skill check Agilità
 * @param character Scheda del personaggio
 * @returns Risultato dell'attraversamento
 */
function handleRiverCrossing(character: ICharacterSheet): MovementResult {
  // Skill check Agilità vs Difficoltà Media (15)
  const skillCheck = performAbilityCheck(
    character.stats.agilita,
    SkillDifficulty.MEDIO
  );
  
  if (skillCheck.success) {
    // Successo: attraversamento riuscito
    return {
      canMove: true,
      skillCheckResult: skillCheck,
      messageType: MessageType.SKILL_CHECK_SUCCESS,
      consumesTurn: true
    };
  } else {
    // Fallimento: attraversamento con danno
    const damage = calculateRiverDamage();
    applyDamage(character, damage.damage);
    
    return {
      canMove: true, // Si muove comunque
      skillCheckResult: skillCheck,
      damageResult: damage,
      messageType: MessageType.SKILL_CHECK_FAILURE,
      consumesTurn: true
    };
  }
}

/**
 * Applica i risultati del movimento al personaggio
 * @param character Scheda del personaggio
 * @param result Risultato del movimento
 * @returns Personaggio aggiornato
 */
export function applyMovementResults(
  character: ICharacterSheet, 
  result: MovementResult
): ICharacterSheet {
  let updatedCharacter = { ...character };
  
  // Applica danno se presente
  if (result.damageResult) {
    updatedCharacter = applyDamage(updatedCharacter, result.damageResult.damage);
  }
  
  return updatedCharacter;
}

/**
 * Ottiene il messaggio appropriato per il journal basato sul risultato
 * @param result Risultato del movimento
 * @returns Tipo di messaggio per il journal
 */
export function getMovementJournalMessage(result: MovementResult): MessageType | null {
  if (result.messageType) {
    return result.messageType;
  }
  
  // Messaggi di default basati sui risultati
  if (result.skillCheckResult) {
    return result.skillCheckResult.success 
      ? MessageType.SKILL_CHECK_SUCCESS 
      : MessageType.SKILL_CHECK_FAILURE;
  }
  
  return null;
}

/**
 * Verifica se il personaggio può ancora muoversi (non è morto)
 * @param character Scheda del personaggio
 * @returns true se può muoversi
 */
export function canCharacterMove(character: ICharacterSheet): boolean {
  return character.currentHP > 0;
}

/**
 * Calcola il modificatore di movimento basato sullo stato del personaggio
 * @param character Scheda del personaggio
 * @returns Modificatore di velocità (1.0 = normale)
 */
export function getMovementSpeedModifier(character: ICharacterSheet): number {
  const hpPercentage = character.currentHP / character.maxHP;
  
  // Penalità di velocità se ferito gravemente
  if (hpPercentage <= 0.25) {
    return 0.5; // 50% velocità se HP <= 25%
  } else if (hpPercentage <= 0.5) {
    return 0.75; // 75% velocità se HP <= 50%
  }
  
  return 1.0; // Velocità normale
}