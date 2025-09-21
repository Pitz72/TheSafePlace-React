// Character Generator - D&D Style "4d6 drop lowest" method
// Parte del progetto "Rules are Rules" v0.2.0

import type { ICharacterStats, ICharacterSheet } from './types';
import { calculateMaxHP, calculateBaseAC, calculateCarryCapacity } from './mechanics';
import type { IInventorySlot } from '../interfaces/items';
import { initializePortions } from '../utils/portionSystem';
import { itemDatabase } from '../data/items/itemDatabase';

/**
 * Definizione del kit di sopravvivenza iniziale per il crafting
 */
interface StarterKit {
  knownRecipes: string[];
  materials: { itemId: string; quantity: number }[];
  description: string;
}

/**
 * Kit di sopravvivenza di base per nuovi personaggi
 */
const SURVIVOR_STARTER_KIT: StarterKit = {
  knownRecipes: [
    'improvised_knife',    // Coltello improvvisato
    'basic_bandage',       // Benda di fortuna  
    'makeshift_torch',     // Torcia improvvisata
    'simple_trap'          // Trappola semplice
  ],
  materials: [
    { itemId: 'CRAFT_METAL_SCRAP', quantity: 3 },  // Rottami metallici
    { itemId: 'CRAFT_CLOTH', quantity: 5 },        // Stracci di tessuto
    { itemId: 'CRAFT_WOOD', quantity: 4 },         // Legno di recupero
    { itemId: 'CRAFT_ROPE', quantity: 2 }          // Corda logora
  ],
  description: 'Kit di sopravvivenza di base con materiali e conoscenze essenziali per iniziare l\'avventura'
};

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
 * Applica lo starter kit di crafting a un personaggio
 * @param character Scheda personaggio da modificare
 * @param starterKit Kit da applicare (opzionale, usa quello di default)
 * @returns Scheda personaggio modificata
 */
export function applyStarterKit(character: ICharacterSheet, starterKit: StarterKit = SURVIVOR_STARTER_KIT): ICharacterSheet {
  // Clona il personaggio per evitare mutazioni
  const updatedCharacter = { ...character };

  // Applica le ricette conosciute
  updatedCharacter.knownRecipes = [...starterKit.knownRecipes];

  // Rimosso: Non aggiungere più materiali di crafting all'inventario iniziale
  // Erano solo per testare il sistema di crafting

  return updatedCharacter;
}

/**
 * Crea un personaggio completo "Ultimo" con statistiche generate e starter kit
 * @returns Scheda personaggio completa con kit di sopravvivenza
 */
export function createCharacter(): ICharacterSheet {
  const stats = generateStats();
  const maxHP = calculateMaxHP(stats.vigore);

  const baseCharacter: ICharacterSheet = {
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
    knownRecipes: [] // Sarà popolato dallo starter kit
  };
  
  // Applica lo starter kit di crafting
  return applyStarterKit(baseCharacter);
}

/**
 * Genera statistiche per debug/test con valori specifici
 * @param values Valori specifici per le statistiche (opzionale)
 * @param includeStarterKit Se includere lo starter kit di crafting (default: true)
 * @returns Statistiche con valori specificati o casuali
 */
export function createTestCharacter(values?: Partial<ICharacterStats>, includeStarterKit: boolean = true): ICharacterSheet {
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
    { itemId: 'quest_music_box', quantity: 1 } // 1x Carillon Annerito (oggetto chiave)
  ];

  let currentSlot = 0;
  startingItems.forEach((itemData) => {
    if (currentSlot < startingInventory.length) {
      const item = itemDatabase[itemData.itemId];
      if (item) {
        startingInventory[currentSlot] = initializePortions(item, itemData.quantity);
        currentSlot++;
      }
    }
  });

  const baseCharacter: ICharacterSheet = {
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
    knownRecipes: [] // Sarà popolato dallo starter kit se richiesto
  };
  
  // Applica lo starter kit se richiesto
  if (includeStarterKit) {
    return applyStarterKit(baseCharacter);
  }
  
  return baseCharacter;
}

/**
 * Verifica se un personaggio ha già ricevuto lo starter kit
 * @param character Scheda personaggio da verificare
 * @returns True se ha già lo starter kit
 */
export function hasStarterKit(character: ICharacterSheet): boolean {
  // Verifica se ha almeno una ricetta starter
  const starterRecipes = SURVIVOR_STARTER_KIT.knownRecipes;
  return starterRecipes.some(recipe => character.knownRecipes?.includes(recipe));
}

/**
 * Applica lo starter kit solo se il personaggio non lo ha già
 * @param character Scheda personaggio
 * @returns Scheda personaggio con starter kit se necessario
 */
export function ensureStarterKit(character: ICharacterSheet): ICharacterSheet {
  if (hasStarterKit(character)) {
    return character; // Già ha lo starter kit
  }
  
  return applyStarterKit(character);
}

/**
 * Esporta il kit di sopravvivenza per uso esterno
 */
export { SURVIVOR_STARTER_KIT };