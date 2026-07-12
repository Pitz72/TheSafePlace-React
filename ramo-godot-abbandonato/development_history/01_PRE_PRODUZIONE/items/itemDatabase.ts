
import type { IItem } from '../../interfaces/items';
import weapons from './weapons.json';
import ammo from './ammo.json';
import armor from './armor.json';
import consumables from './consumables.json';
import craftingMaterials from './crafting_materials.json';
import questItems from './quest_items.json';
import uniqueItems from './unique_items.json';

export const itemDatabase: Record<string, IItem> = {
  ...weapons,
  ...ammo,
  ...armor,
  ...consumables,
  ...craftingMaterials,
  ...questItems,
  ...uniqueItems,
};
