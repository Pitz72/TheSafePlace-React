/**
 * enemyAI.ts
 *
 * Contiene la logica per le decisioni e le azioni dei nemici in combattimento.
 */

import type { EnemyCombatState, PlayerCombatState, CombatAction } from '../types/combat';

/**
 * Determina la prossima azione per un nemico.
 * Per ora, l'IA è molto semplice: attacca sempre il giocatore.
 *
 * @param enemy Lo stato del nemico che sta agendo.
 * @param player Lo stato del giocatore.
 * @param allies La lista degli altri nemici.
 * @returns Un'azione di combattimento da eseguire.
 */
export const determineEnemyAction = (
  enemy: EnemyCombatState,
  player: PlayerCombatState,
  allies: EnemyCombatState[]
): Omit<CombatAction, 'result' | 'rolls'> => {
  // Logica futura più complessa potrebbe andare qui:
  // - Controllare se il nemico ha poca vita e potrebbe usare un'abilità difensiva.
  // - Scegliere l'attacco migliore tra più opzioni.
  // - Scegliere un bersaglio (se ci fossero più giocatori).

  // Per ora, l'unica azione è attaccare il giocatore.
  return {
    type: 'attack',
    actor: { type: 'enemy', id: enemy.id },
    target: { type: 'player', id: 'player' } // ID placeholder per il giocatore
  };
};
