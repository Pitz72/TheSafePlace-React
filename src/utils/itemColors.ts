// Item Colors - Sistema colori per oggetti inventario
// Determina il colore appropriato per ogni oggetto basato su tipo e rarità

import type { IItem } from '../interfaces/items';
import { ItemType, Rarity } from '../interfaces/items';

/**
 * Determina la classe CSS per il colore di un oggetto
 * Priorità: Rarità > Tipo > Default
 */
export function getItemColorClass(item: IItem): string {
  // Priorità 1: Colore basato su rarità (se presente)
  if (item.rarity) {
    const rarity = typeof item.rarity === 'string' ? item.rarity.toLowerCase() : item.rarity;
    switch (rarity) {
      case Rarity.LEGENDARY:
      case 'legendary':
        return 'item-legendary';
      case Rarity.EPIC:
      case 'epic':
        return 'item-epic';
      case Rarity.RARE:
      case 'rare':
        return 'item-rare';
      case Rarity.UNCOMMON:
      case 'uncommon':
        return 'item-uncommon';
      case Rarity.COMMON:
      case 'common':
        return 'item-common';
    }
  }
  
  // Priorità 2: Colore basato su tipo
  const itemType = typeof item.type === 'string' ? item.type.toLowerCase() : item.type;
  
  switch (itemType) {
    case 'weapon':
    case ItemType.WEAPON:
      return 'item-weapon';
      
    case 'armor':
    case ItemType.ARMOR:
      return 'item-armor';
      
    case 'consumable':
    case ItemType.CONSUMABLE:
      return 'item-consumable';
      
    case 'potion':
    case ItemType.POTION:
      return 'item-potion';
      
    case 'quest':
    case ItemType.QUEST:
      return 'item-quest';
      
    case 'crafting':
    case ItemType.CRAFTING:
      return 'item-crafting';
      
    case 'unique':
    case ItemType.UNIQUE:
      return 'item-unique';
      
    default:
      // Fallback: colore comune
      return 'item-common';
  }
}

/**
 * Ottiene il colore CSS diretto per un oggetto (per uso programmatico)
 */
export function getItemColor(item: IItem): string {
  const colorClass = getItemColorClass(item);
  
  const colorMap: Record<string, string> = {
    'item-weapon': '#FF4444',
    'item-armor': '#4169E1',
    'item-consumable': '#32CD32',
    'item-quest': '#FFD700',
    'item-crafting': '#DDA0DD',
    'item-unique': '#FF69B4',
    'item-potion': '#00CED1',
    'item-common': '#C0C0C0',
    'item-uncommon': '#90EE90',
    'item-rare': '#4169E1',
    'item-epic': '#9370DB',
    'item-legendary': '#FFD700'
  };
  
  return colorMap[colorClass] || '#C0C0C0';
}

/**
 * Ottiene una descrizione del colore per un oggetto
 */
export function getItemColorDescription(item: IItem): string {
  const colorClass = getItemColorClass(item);
  
  const descriptionMap: Record<string, string> = {
    'item-weapon': 'Rosso (Arma)',
    'item-armor': 'Blu (Armatura)',
    'item-consumable': 'Verde (Consumabile)',
    'item-quest': 'Oro (Quest)',
    'item-crafting': 'Viola chiaro (Crafting)',
    'item-unique': 'Rosa (Unico)',
    'item-potion': 'Turchese (Pozione)',
    'item-common': 'Argento (Comune)',
    'item-uncommon': 'Verde chiaro (Non comune)',
    'item-rare': 'Blu (Raro)',
    'item-epic': 'Viola (Epico)',
    'item-legendary': 'Oro (Leggendario)'
  };
  
  return descriptionMap[colorClass] || 'Argento (Comune)';
}

/**
 * Test per verificare tutti i colori degli oggetti
 */
export function testItemColors(items: Record<string, IItem>): void {
  console.log('=== TEST COLORI OGGETTI INVENTARIO ===');
  console.log('');
  
  const colorStats: Record<string, number> = {};
  const typeStats: Record<string, number> = {};
  
  for (const [itemId, item] of Object.entries(items)) {
    const colorClass = getItemColorClass(item);
    const color = getItemColor(item);
    const description = getItemColorDescription(item);
    
    colorStats[colorClass] = (colorStats[colorClass] || 0) + 1;
    typeStats[item.type as string] = (typeStats[item.type as string] || 0) + 1;
    
    console.log(`${itemId}: ${item.name}`);
    console.log(`  Tipo: ${item.type}, Rarità: ${item.rarity || 'N/A'}`);
    console.log(`  Colore: ${description} (${color})`);
    console.log(`  Classe CSS: ${colorClass}`);
    console.log('');
  }
  
  console.log('📊 STATISTICHE COLORI:');
  for (const [colorClass, count] of Object.entries(colorStats)) {
    console.log(`  ${colorClass}: ${count} oggetti`);
  }
  
  console.log('');
  console.log('📊 STATISTICHE TIPI:');
  for (const [type, count] of Object.entries(typeStats)) {
    console.log(`  ${type}: ${count} oggetti`);
  }
  
  console.log('');
  console.log(`✅ Test completato: ${Object.keys(items).length} oggetti analizzati`);
}