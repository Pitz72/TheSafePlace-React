// Game Mechanics - D&D Style Rules Implementation
// Parte del progetto "Rules are Rules" v0.2.0

import type { ICharacterSheet, ISkillCheckResult, IDamageResult } from './types';
import type { IItem } from '../interfaces/items';

/**
 * Calcola il modificatore D&D per una statistica
 * Formula: Math.floor((stat - 10) / 2)
 * @param stat Valore della statistica (3-18)
 * @returns Modificatore (-4 a +4)
 */
export function calculateModifier(stat: number): number {
  return Math.floor((stat - 10) / 2);
}

/**
 * Tira un dado a 20 facce
 * @returns Valore del dado (1-20)
 */
export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Tira un dado a 4 facce
 * @returns Valore del dado (1-4)
 */
export function rollD4(): number {
  return Math.floor(Math.random() * 4) + 1;
}

/**
 * Esegue un skill check D&D
 * Formula: 1d20 + modificatore >= difficoltà
 * @param stat Valore della statistica da testare
 * @param difficulty Difficoltà del check
 * @returns Risultato completo del skill check
 */
export function performSkillCheck(stat: number, difficulty: number): ISkillCheckResult {
  const roll = rollD20();
  const modifier = calculateModifier(stat);
  const total = roll + modifier;
  const success = total >= difficulty;
  
  return {
    success,
    roll,
    modifier,
    total,
    difficulty
  };
}

/**
 * Esegue un skill check su una specifica abilità del personaggio
 * @param statValue Valore della statistica da testare
 * @param difficulty Difficoltà del check
 * @returns Risultato del skill check
 */
export function performAbilityCheck(
  statValue: number, 
  difficulty: number
): ISkillCheckResult {
  return performSkillCheck(statValue, difficulty);
}

/**
 * Calcola il danno per fallimento attraversamento fiume
 * @returns Risultato del danno (1d4)
 */
export function calculateRiverDamage(): IDamageResult {
  const damage = rollD4();
  return {
    damage,
    type: 'river',
    description: `La corrente del fiume ti ha trascinato! Subisci ${damage} danni.`
  };
}

/**
 * Applica danno al personaggio
 * @param character Scheda del personaggio
 * @param damage Danno da applicare
 * @returns Personaggio aggiornato
 */
export function applyDamage(character: ICharacterSheet, damage: number): ICharacterSheet {
  const newHP = Math.max(0, character.currentHP - damage);
  return {
    ...character,
    currentHP: newHP
  };
}

/**
 * Applica guarigione al personaggio
 * @param character Scheda del personaggio
 * @param healing Guarigione da applicare
 * @returns Personaggio aggiornato
 */
export function applyHealing(character: ICharacterSheet, healing: number): ICharacterSheet {
  const newHP = Math.min(character.maxHP, character.currentHP + healing);
  return {
    ...character,
    currentHP: newHP
  };
}

/**
 * Calcola guarigione da riposo breve (1d4)
 * @returns Punti vita recuperati
 */
export function calculateShortRestHealing(): number {
  return rollD4();
}

/**
 * Verifica se il personaggio è morto
 * @param currentHP HP attuali
 * @returns True se il personaggio è morto
 */
export function isDead(currentHP: number): boolean {
  return currentHP <= 0;
}

/**
 * Verifica se il personaggio è ferito
 * @param currentHP HP attuali
 * @param maxHP HP massimi
 * @returns True se il personaggio è ferito
 */
export function isWounded(currentHP: number, maxHP: number): boolean {
  return currentHP < maxHP;
}

/**
 * Calcola i punti vita massimi basati su Vigore
 * @param vigore Valore di Vigore del personaggio
 * @returns Punti vita massimi
 */
export function calculateMaxHP(vigore: number): number {
  const modifier = calculateModifier(vigore);
  return Math.max(1, 10 + modifier); // Minimo 1 HP
}

/**
 * Calcola la Classe Armatura base
 * @param agilita Valore di Agilità del personaggio
 * @returns Classe Armatura base
 */
export function calculateBaseAC(agilita: number): number {
  const modifier = calculateModifier(agilita);
  return 10 + modifier;
}

/**
 * Calcola la capacità di carico
 * @param potenza Valore di Potenza del personaggio
 * @returns Capacità di carico in kg
 */
export function calculateCarryCapacity(potenza: number): number {
  return potenza * 10;
}

/**
 * Calcola la percentuale di HP rimanenti
 * @param currentHP HP attuali
 * @param maxHP HP massimi
 * @returns Percentuale (0-100)
 */
export function getHPPercentage(currentHP: number, maxHP: number): number {
  if (maxHP === 0) return 0;
  return Math.round((currentHP / maxHP) * 100);
}

/**
 * Aggiunge un oggetto all'inventario del personaggio.
 * @param character Scheda del personaggio
 * @param itemId ID dell'oggetto da aggiungere
 * @param quantity Quantità da aggiungere
 * @param items Database di tutti gli oggetti di gioco
 * @returns Scheda personaggio aggiornata o la stessa se l'inventario è pieno.
 */
export function addItem(
  character: ICharacterSheet,
  itemId: string,
  quantity: number,
  items: Record<string, IItem>
): ICharacterSheet {
  const itemToAdd = items[itemId];
  if (!itemToAdd) {
    console.error(`[addItem] Oggetto con ID ${itemId} non trovato.`);
    return character; // Ritorna lo stato originale se l'oggetto non esiste
  }

  const newInventory = [...character.inventory];

  // 1. Se l'oggetto è impilabile, cerca uno slot esistente
  if (itemToAdd.stackable) {
    const existingSlotIndex = newInventory.findIndex(
      (slot) => slot?.itemId === itemId
    );

    if (existingSlotIndex !== -1) {
      const existingSlot = newInventory[existingSlotIndex]!;
      newInventory[existingSlotIndex] = {
        ...existingSlot,
        quantity: existingSlot.quantity + quantity,
      };
      return { ...character, inventory: newInventory };
    }
  }

  // 2. Se non è impilabile o non c'è uno slot, cerca uno slot vuoto
  const emptySlotIndex = newInventory.findIndex((slot) => slot === null);

  if (emptySlotIndex !== -1) {
    newInventory[emptySlotIndex] = {
      itemId,
      quantity,
    };
    return { ...character, inventory: newInventory };
  }

  // 3. Inventario pieno
  console.warn(`[addItem] Inventario pieno. Impossibile aggiungere ${itemToAdd.name}.`);
  return character; // Ritorna lo stato originale
}

/**
 * Rimuove un oggetto dall'inventario del personaggio.
 * @param character Scheda del personaggio
 * @param slotIndex Indice dello slot da cui rimuovere
 * @param quantity Quantità da rimuovere
 * @returns Scheda personaggio aggiornata.
 */
export function removeItem(
  character: ICharacterSheet,
  slotIndex: number,
  quantity: number
): ICharacterSheet {
  const newInventory = [...character.inventory];
  const slot = newInventory[slotIndex];

  if (!slot) {
    console.error(`[removeItem] Tentativo di rimuovere da uno slot vuoto (indice: ${slotIndex}).`);
    return character;
  }

  const newQuantity = slot.quantity - quantity;

  if (newQuantity > 0) {
    // Riduci la quantità
    newInventory[slotIndex] = { ...slot, quantity: newQuantity };
  } else {
    // Rimuovi l'oggetto (imposta a null)
    newInventory[slotIndex] = null;
  }

  return { ...character, inventory: newInventory };
}