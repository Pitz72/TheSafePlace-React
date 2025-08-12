// Definizione della struttura dati per gli oggetti di gioco

/**
 * Enum per la rarità degli oggetti.
 * Standardizza i valori di rarità in tutto il gioco.
 */
export enum Rarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}

export enum ItemType {
  POTION = 'Potion',
  CONSUMABLE = 'Consumable',
  WEAPON = 'Weapon',
  ARMOR = 'Armor',
  QUEST = 'Quest',
  CRAFTING = 'Crafting',
  UNIQUE = 'Unique',
}

export enum ItemEffect {
  HEAL = 'Heal',
  DAMAGE = 'Damage',
  BUFF = 'Buff',
  DEBUFF = 'Debuff',
}



/**
 * Interfaccia di base per ogni oggetto nel gioco.
 * Questa è la "scheda di identità" canonica per tutti gli oggetti.
 *
 * Nota: i database JSON utilizzano stringhe liberamente (es. type: "weapon", effect: "satiety").
 * Per compatibilità, consentiamo sia i valori dell'enum sia stringhe generiche.
 */
export interface IItem {
  id: string;
  name: string;
  description: string;
  type: ItemType | string; // Compatibilità con JSON (es. "weapon", "unique")
  rarity?: Rarity; // Opzionale, non tutti gli oggetti hanno una rarità definita
  weight?: number; // Opzionale
  value?: number; // Opzionale
  stackable?: boolean; // Opzionale, di default è false
  quantity?: number; // Aggiunto per gestire le quantità direttamente nell'oggetto

  // Campi specifici per tipo
  effect?: ItemEffect | string; // Compatibilità con JSON (es. "satiety", "hydration")
  effectValue?: string | number; // Alcuni JSON usano numeri
  durability?: number;
  damage?: string;
  armor?: number;
  slot?: string;
}

/**
 * Interfaccia per uno slot dell'inventario.
 * Rappresenta un singolo spazio nell'inventario del giocatore.
 */
export interface IInventorySlot {
  itemId: string;      // ID dell'oggetto nello slot
  quantity: number;    // Quantità dell'oggetto
  portions?: number;   // Numero di porzioni (per consumabili)
}