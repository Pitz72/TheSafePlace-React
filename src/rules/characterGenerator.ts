// Character Generator - D&D Style "4d6 drop lowest" method
// Parte del progetto "Rules are Rules" v0.2.0

import type { ICharacterStats, ICharacterSheet } from './types';
import { calculateMaxHP, calculateBaseAC, calculateCarryCapacity } from './mechanics';
import type { IInventorySlot } from '../interfaces/items';

/**
 * Genera una singola statistica usando il metodo "4d6 drop lowest"
 * @returns Valore della statistica (3-18)
 */
export function rollStat(): number {
  // Tira 4d6
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  
  // Ordina in ordine decrescente e prendi i primi 3 (drop lowest)
  rolls.sort((a, b) => b - a);
  const total = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
  
  return total;
}

/**
 * Genera tutte le statistiche del personaggio
 * @returns Oggetto con tutte le statistiche
 */
export function generateStats(): ICharacterStats {
  return {
    potenza: rollStat(),
    agilita: rollStat(),
    vigore: rollStat(),
    percezione: rollStat(),
    adattamento: rollStat(),
    carisma: rollStat()
  };
}

/**
 * Crea un personaggio completo "Ultimo" con statistiche generate
 * @returns Scheda personaggio completa
 */
export function createCharacter(): ICharacterSheet {
  const stats = generateStats();
  const maxHP = calculateMaxHP(stats.vigore);
  
  return {
    name: "Ultimo",
    stats,
    level: 1, // Inizia al livello 1
    maxHP,
    currentHP: maxHP, // Inizia con HP pieni
    baseAC: calculateBaseAC(stats.agilita),
    carryCapacity: calculateCarryCapacity(stats.potenza),
    inventory: Array<IInventorySlot | null>(10).fill(null)
  };
}

/**
 * Genera statistiche per debug/test con valori specifici
 * @param values Valori specifici per le statistiche (opzionale)
 * @returns Statistiche con valori specificati o casuali
 */
export function createTestCharacter(values?: Partial<ICharacterStats>): ICharacterSheet {
  const defaultStats = generateStats();
  const stats = { ...defaultStats, ...values };
  const maxHP = calculateMaxHP(stats.vigore);

  const startingInventory: (IInventorySlot | null)[] = Array(10).fill(null);

  // Popolamento inventario con oggetti di partenza corretti
  startingInventory[0] = { itemId: 'CONS_002', quantity: 2 }; // 2x Acqua
  startingInventory[1] = { itemId: 'CONS_001', quantity: 2 }; // 2x Cibo
  startingInventory[2] = { itemId: 'CONS_003', quantity: 2 }; // 2x Bende
  startingInventory[3] = { itemId: 'WEAP_001', quantity: 1 }; // 1x Coltello
  startingInventory[4] = { itemId: 'ARMOR_001', quantity: 1 }; // 1x Giubbotto di pelle
  
  return {
    name: "Ultimo",
    stats,
    level: 1, // Inizia al livello 1
    maxHP,
    currentHP: maxHP,
    baseAC: calculateBaseAC(stats.agilita),
    carryCapacity: calculateCarryCapacity(stats.potenza),
    inventory: startingInventory
  };
}