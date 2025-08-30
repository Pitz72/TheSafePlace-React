// Character Generator - D&D Style "4d6 drop lowest" method
// Parte del progetto "Rules are Rules" v0.2.0

import type { ICharacterStats, ICharacterSheet } from './types';
import { calculateMaxHP, calculateBaseAC, calculateCarryCapacity } from './mechanics';
import type { IInventorySlot } from '../interfaces/items';
import { initializePortions } from '../utils/portionSystem';
import { itemDatabase } from '../data/items/itemDatabase';

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
    inventory: Array<IInventorySlot | null>(10).fill(null),
    equipment: {
      weapon: { itemId: null, slotType: 'weapon' },
      armor: { itemId: null, slotType: 'armor' },
      accessory: { itemId: null, slotType: 'accessory' }
    },
    experience: {
      currentXP: 0,
      xpForNextLevel: 100, // XP necessari per livello 2
      canLevelUp: false
    },
    knownRecipes: [] // Inizia senza ricette conosciute
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

  // Popolamento inventario con oggetti di partenza usando sistema porzioni
  const startingItems = [
    { itemId: 'CONS_002', quantity: 2 }, // 2x Acqua
    { itemId: 'CONS_001', quantity: 2 }, // 2x Cibo
    { itemId: 'CONS_003', quantity: 2 }, // 2x Bende
    { itemId: 'WEAP_001', quantity: 1 }, // 1x Coltello
    { itemId: 'ARMOR_001', quantity: 1 }, // 1x Giubbotto di pelle
    { itemId: 'CRAFT_001', quantity: 10 } // 10x Pezzi di metallo per test crafting
  ];
  
  startingItems.forEach((itemData, index) => {
    const item = itemDatabase[itemData.itemId];
    if (item) {
      startingInventory[index] = initializePortions(item, itemData.quantity);
    }
  });
  
  return {
    name: "Ultimo",
    stats,
    level: 1, // Inizia al livello 1
    maxHP,
    currentHP: maxHP,
    baseAC: calculateBaseAC(stats.agilita),
    carryCapacity: calculateCarryCapacity(stats.potenza),
    inventory: startingInventory,
    equipment: {
      weapon: { itemId: null, slotType: 'weapon' },
      armor: { itemId: null, slotType: 'armor' },
      accessory: { itemId: null, slotType: 'accessory' }
    },
    experience: {
      currentXP: 0,
      xpForNextLevel: 100, // XP necessari per livello 2
      canLevelUp: false
    },
    knownRecipes: [] // Inizia senza ricette conosciute
  };
}