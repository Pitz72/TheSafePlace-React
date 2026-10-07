import { create } from 'zustand';
import {
  CharacterState, Attributes, SkillName, WeatherType, InventoryItem, Skill,
  Alignment, JournalEntryType, PlayerStatusCondition, DeathCause, LevelUpChoices,
} from '../types';
import { SKILLS, XP_PER_LEVEL, ATTRIBUTES } from '../constants';
import { useItemDatabaseStore, isQuestItem } from '../data/itemDatabase';
import { useGameStore } from './gameStore';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { useTrophyDatabaseStore } from '../data/trophyDatabase';
import { audioManager } from '../utils/audio';
import { addGlobalTrophy, loadGlobalTrophies, mergeWithGlobalTrophies } from '../services/globalTrophyService';
import { questService } from '../services/questService';

const BASE_STAT_VALUE = 100;
const ALIGNMENT_THRESHOLD = 5;
/** "Massimo allineamento" trophies: this far from the other philosophy. */
const ALIGNMENT_MAX = 15;
const VALID_STATUSES: ReadonlySet<string> = new Set([
  'FERITO', 'MALATO', 'AVVELENATO', 'IPOTERMIA', 'ESAUSTO', 'AFFAMATO', 'DISIDRATATO', 'INFEZIONE',
]);
const PHYSICAL_SKILLS: SkillName[] = ['atletica', 'acrobazia', 'furtivita', 'rapiditaDiMano'];
const PERCEPTION_SKILLS: SkillName[] = ['percezione', 'intuizione', 'medicina', 'sopravvivenza', 'addestrareAnimali'];
const INTELLIGENCE_SKILLS: SkillName[] = ['arcanismo', 'storia', 'investigare', 'natura', 'religione'];

const initialAttributes: Attributes = { for: 10, des: 10, cos: 10, int: 10, sag: 10, car: 10 };
const initialAlignment: Alignment = { lena: 0, elian: 0 };
const makeSkills = (proficient: SkillName[] = []): Record<SkillName, Skill> =>
  (Object.keys(SKILLS) as SkillName[]).reduce((acc, skill) => {
    acc[skill] = { proficient: proficient.includes(skill) };
    return acc;
  }, {} as Record<SkillName, Skill>);

const STARTING_PROFICIENCIES: SkillName[] = ['sopravvivenza', 'medicina', 'furtivita'];
const STARTING_RECIPES = [
  'recipe_purify_water', 'recipe_makeshift_bandage', 'recipe_collect_water', 'recipe_makeshift_knife',
  'recipe_repair_kit_basic', 'recipe_arrows', 'recipe_wooden_spear',
];

/**
 * Fractional survival damage accumulator: HP stay integer, the sub-1 remainder
 * of hunger/thirst/afflictions carries over between short time steps.
 */
let survivalDamageDebt = 0;

/** XP needed to go from `level` to `level + 1` (XP_PER_LEVEL is cumulative). */
const xpToNextLevel = (level: number): number => {
  const next = XP_PER_LEVEL[level + 1];
  const current = XP_PER_LEVEL[level];
  if (next === undefined || current === undefined) return (XP_PER_LEVEL[XP_PER_LEVEL.length - 1] - XP_PER_LEVEL[XP_PER_LEVEL.length - 2]);
  return next - current;
};

type SlotKey = 'equippedWeapon' | 'equippedArmor' | 'equippedHead' | 'equippedLegs';
const SLOT_KEYS: SlotKey[] = ['equippedWeapon', 'equippedArmor', 'equippedHead', 'equippedLegs'];

/** Shifts equipped indices after inventory entries at `removed` (original indices) disappear. */
function reindexEquipment(state: Pick<CharacterState, SlotKey>, removed: number[]) {
  const result = {} as Record<SlotKey, number | null>;
  for (const key of SLOT_KEYS) {
    const index = state[key];
    if (index === null) { result[key] = null; continue; }
    if (removed.includes(index)) { result[key] = null; continue; }
    result[key] = index - removed.filter(r => r < index).length;
  }
  return result;
}

const journal = (text: string, type: JournalEntryType, color?: string) =>
  useGameStore.getState().addJournalEntry({ text, type, color });

/**
 * Inventory read from a save: entries that are malformed or name items that no
 * longer exist are dropped, and the equipped slots follow the surviving entries.
 */
function sanitizeInventory(raw: unknown): { inventory: InventoryItem[]; equippedAt: (index: unknown) => number | null } {
  const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
  const checkIds = Object.keys(itemDatabase).length > 0;
  const inventory: InventoryItem[] = [];
  const newIndex = new Map<number, number>();
  (Array.isArray(raw) ? raw : []).forEach((entry, index) => {
    if (!entry || typeof entry.itemId !== 'string' || (checkIds && !itemDatabase[entry.itemId])) {
      console.warn(`[SAVE] Oggetto non valido scartato dal salvataggio: ${JSON.stringify(entry)}`);
      return;
    }
    const quantity = Number.isFinite(entry.quantity) && entry.quantity >= 1 ? Math.floor(entry.quantity) : 1;
    newIndex.set(index, inventory.length);
    inventory.push({ ...entry, quantity });
  });
  const equippedAt = (index: unknown) => (typeof index === 'number' ? newIndex.get(index) ?? null : null);
  return { inventory, equippedAt };
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  level: 1,
  xp: { current: 0, next: XP_PER_LEVEL[2] },
  hp: { current: 100, max: 100 },
  satiety: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
  hydration: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
  fatigue: { current: 0, max: 100 },
  attributes: { ...initialAttributes },
  skills: makeSkills(),
  inventory: [],
  equippedWeapon: null,
  equippedArmor: null,
  equippedHead: null,
  equippedLegs: null,
  alignment: { ...initialAlignment },
  status: new Set<PlayerStatusCondition>(),
  levelUpPending: false,
  knownRecipes: [],
  craftedRecipes: [],
  unlockedTalents: [],
  unlockedTrophies: new Set<string>(),
  activeQuests: {},
  completedQuests: [],
  failedQuests: [],
  loreArchive: [],
  questKillCounts: {},
  questFlags: {},
  wasOverEncumbered: false,

  initCharacter: () => {
    survivalDamageDebt = 0;
    set({
      level: 1,
      xp: { current: 0, next: XP_PER_LEVEL[2] },
      attributes: { ...initialAttributes },
      hp: { current: 100, max: 100 },
      satiety: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
      hydration: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
      fatigue: { current: 0, max: 100 },
      skills: makeSkills(STARTING_PROFICIENCIES),
      alignment: { ...initialAlignment },
      status: new Set<PlayerStatusCondition>(),
      levelUpPending: false,
      inventory: [
        { itemId: 'carillon_annerito', quantity: 1 },
        { itemId: 'CONS_001', quantity: 2 },
        { itemId: 'CONS_002', quantity: 2 },
        { itemId: 'MED_BANDAGE_BASIC', quantity: 3 },
        { itemId: 'scrap_metal', quantity: 3 },
        { itemId: 'clean_cloth', quantity: 3 },
        { itemId: 'bottle_empty', quantity: 2 },
      ],
      equippedWeapon: null,
      equippedArmor: null,
      equippedHead: null,
      equippedLegs: null,
      knownRecipes: [...STARTING_RECIPES],
      craftedRecipes: [],
      unlockedTalents: [],
      unlockedTrophies: loadGlobalTrophies(),
      activeQuests: {},
      completedQuests: [],
      failedQuests: [],
      loreArchive: [],
      questKillCounts: {},
      questFlags: {},
      wasOverEncumbered: false,
    });
  },

  /** Character creation: HP follow Constitution (100 at COS 10, ±10 per modifier point). */
  setAttributes: (newAttributes) => {
    const maxHp = 100 + Math.floor((newAttributes.cos - 10) / 2) * 10;
    set({ attributes: newAttributes, hp: { max: maxHp, current: maxHp } });
    get().checkCharacterTrophies();
  },

  getAttributeModifier: (attribute) => Math.floor((get().attributes[attribute] - 10) / 2),

  getSkillBonus: (skill) => {
    const skillDef = SKILLS[skill];
    if (!skillDef) return 0;
    const { alignment, level, skills, status, fatigue } = get();
    let bonus = get().getAttributeModifier(skillDef.attribute);
    if (skills[skill]?.proficient) bonus += Math.floor((level - 1) / 4) + 2;

    if (fatigue.current > 75) bonus -= 2;
    else if (fatigue.current > 50) bonus -= 1;

    const diff = alignment.lena - alignment.elian;
    if (diff > ALIGNMENT_THRESHOLD && (skill === 'persuasione' || skill === 'intuizione')) bonus += 2;
    if (diff < -ALIGNMENT_THRESHOLD && (skill === 'sopravvivenza' || skill === 'intimidire')) bonus += 2;

    if (get().getTotalWeight() > get().getMaxCarryWeight() && ['atletica', 'acrobazia', 'furtivita'].includes(skill)) bonus -= 2;

    if (status.has('FERITO') && PHYSICAL_SKILLS.includes(skill)) bonus -= 2;
    if (status.has('IPOTERMIA')) bonus -= 3;
    if (status.has('ESAUSTO') && PHYSICAL_SKILLS.includes(skill)) bonus -= 2;
    if (status.has('AFFAMATO')) bonus -= 1;
    if (status.has('DISIDRATATO') && (PERCEPTION_SKILLS.includes(skill) || INTELLIGENCE_SKILLS.includes(skill))) bonus -= 2;
    if (status.has('INFEZIONE')) bonus -= 2;

    if (skill === 'percezione' && get().hasTalent('hawks_eye')) bonus += 2;
    if (skill === 'medicina' && useGameStore.getState().gameFlags.has('KNOWS_DISEASE_SYMPTOMS')) bonus += 1;
    return bonus;
  },

  performSkillCheck: (skill, dc) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const bonus = get().getSkillBonus(skill);
    const total = roll + bonus;
    return { skill, roll, bonus, total, dc, success: total >= dc };
  },

  hasTalent: (talentId) => get().unlockedTalents.includes(talentId),

  /** Medico da Campo +25%, Sopravvissuto Veterano +50% on healing items. */
  getHealingMultiplier: () =>
    1 + (get().hasTalent('field_medic') ? 0.25 : 0) + (get().hasTalent('veteran_survivor') ? 0.5 : 0),

  gainExplorationXp: () => get().addXp(3),

  addXp: (amount) => {
    set(state => {
      const current = state.xp.current + amount;
      return { xp: { ...state.xp, current }, levelUpPending: state.levelUpPending || current >= state.xp.next };
    });
  },

  /** Level up: +1 attribute, HP, full heal, and a talent or (when none is available) a new proficiency. */
  applyLevelUp: (choices: LevelUpChoices) => {
    const state = get();
    if (!state.levelUpPending) return;
    const newLevel = state.level + 1;
    const nextRequirement = xpToNextLevel(newLevel);
    const remainingXp = state.xp.current - state.xp.next;
    const hpIncrease = Math.max(1, 5 + state.getAttributeModifier('cos'));
    const newMaxHp = state.hp.max + hpIncrease;
    const attributes = { ...state.attributes, [choices.attribute]: state.attributes[choices.attribute] + 1 };
    const unlockedTalents = choices.talentId && !state.unlockedTalents.includes(choices.talentId)
      ? [...state.unlockedTalents, choices.talentId]
      : state.unlockedTalents;
    const skills = choices.proficiency
      ? { ...state.skills, [choices.proficiency]: { proficient: true } }
      : state.skills;

    set({
      level: newLevel,
      xp: { current: remainingXp, next: nextRequirement },
      hp: { max: newMaxHp, current: newMaxHp },
      attributes,
      unlockedTalents,
      skills,
      levelUpPending: remainingXp >= nextRequirement,
    });

    audioManager.playSound('level_up');
    journal(`Sei salito al livello ${newLevel}! Le tue abilità migliorano.`, JournalEntryType.XP_GAIN);
    get().unlockTrophy('trophy_char_level_up');
    if (choices.talentId) get().unlockTrophy('trophy_char_talent');
    get().checkCharacterTrophies();

    if (newLevel === 5 && !useGameStore.getState().hasFlag('STRANGERS_REFLECTION_PLAYED')) {
      useGameStore.getState().setFlag('STRANGERS_REFLECTION_PLAYED');
      useGameStore.getState().queueCutscene('CS_STRANGERS_REFLECTION');
    }
  },

  getItemCount: (itemId) => get().inventory.reduce((sum, item) => (item.itemId === itemId ? sum + item.quantity : sum), 0),

  addItem: (itemId, quantity = 1) => {
    if (quantity <= 0) return;
    const details = useItemDatabaseStore.getState().itemDatabase[itemId];
    if (!details) {
      console.warn(`[INVENTORY] Unknown item ${itemId}`);
      return;
    }
    set(state => {
      const inventory = [...state.inventory];
      if (details.stackable) {
        const index = inventory.findIndex(i => i.itemId === itemId);
        if (index > -1) inventory[index] = { ...inventory[index], quantity: inventory[index].quantity + quantity };
        else inventory.push({ itemId, quantity });
      } else {
        for (let i = 0; i < quantity; i++) {
          const item: InventoryItem = { itemId, quantity: 1 };
          if (details.durability) item.durability = { current: details.durability, max: details.durability };
          inventory.push(item);
        }
      }
      return { inventory };
    });
    get().checkCharacterTrophies();
    questService.checkQuestTriggers({ source: 'item', itemId });
  },

  /**
   * Removes `quantity` units of an item. Non-stackable copies go first from the
   * ones that are not equipped, then the most worn ones.
   */
  removeItem: (itemId, quantity = 1) => {
    if (quantity <= 0) return;
    set(state => {
      const inventory = [...state.inventory];
      let remaining = quantity;
      const equipped = new Set(SLOT_KEYS.map(k => state[k]).filter((i): i is number => i !== null));
      const candidates = inventory
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.itemId === itemId)
        .sort((a, b) => {
          const eq = Number(equipped.has(a.index)) - Number(equipped.has(b.index));
          if (eq !== 0) return eq;
          return (a.item.durability?.current ?? 0) - (b.item.durability?.current ?? 0);
        });
      const removed: number[] = [];
      for (const { item, index } of candidates) {
        if (remaining <= 0) break;
        if (item.quantity > remaining) {
          inventory[index] = { ...item, quantity: item.quantity - remaining };
          remaining = 0;
        } else {
          remaining -= item.quantity;
          removed.push(index);
        }
      }
      if (removed.length === 0 && remaining === quantity) return {};
      const nextInventory = inventory.filter((_, index) => !removed.includes(index));
      return { inventory: nextInventory, ...reindexEquipment(state, removed) };
    });
  },

  /** Removes `quantity` units from one exact inventory slot. */
  discardItem: (inventoryIndex: number, quantity = 1) => {
    set(state => {
      const item = state.inventory[inventoryIndex];
      if (!item || quantity <= 0) return {};
      if (item.quantity > quantity) {
        const inventory = [...state.inventory];
        inventory[inventoryIndex] = { ...item, quantity: item.quantity - quantity };
        return { inventory };
      }
      return {
        inventory: state.inventory.filter((_, i) => i !== inventoryIndex),
        ...reindexEquipment(state, [inventoryIndex]),
      };
    });
  },

  equipItem: (inventoryIndexOrId) => {
    const state = get();
    const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
    let index: number;
    if (typeof inventoryIndexOrId === 'string') {
      index = state.inventory.findIndex(i => i.itemId === inventoryIndexOrId && (!i.durability || i.durability.current > 0));
      if (index === -1) return;
    } else {
      index = inventoryIndexOrId;
    }
    const item = state.inventory[index];
    const details = item ? itemDatabase[item.itemId] : null;
    if (!item || !details) return;
    if (item.durability && item.durability.current <= 0) {
      journal(`${details.name} è rotto e non può essere equipaggiato.`, JournalEntryType.ACTION_FAILURE);
      return;
    }
    if (details.type === 'weapon') set({ equippedWeapon: index });
    else if (details.type === 'armor') {
      if (details.slot === 'head') set({ equippedHead: index });
      else if (details.slot === 'legs') set({ equippedLegs: index });
      else set({ equippedArmor: index });
    }
  },

  unequipItem: (slot) => {
    if (slot === 'weapon') set({ equippedWeapon: null });
    else if (slot === 'armor' || slot === 'chest') set({ equippedArmor: null });
    else if (slot === 'head') set({ equippedHead: null });
    else if (slot === 'legs') set({ equippedLegs: null });
  },

  getEquippedSlot: (inventoryIndex) => {
    const s = get();
    if (s.equippedWeapon === inventoryIndex) return 'weapon';
    if (s.equippedArmor === inventoryIndex) return 'chest';
    if (s.equippedHead === inventoryIndex) return 'head';
    if (s.equippedLegs === inventoryIndex) return 'legs';
    return null;
  },

  /** Wears down an equipped piece; broken pieces are unequipped. */
  damageEquippedItem: (slot, amount) => {
    const state = get();
    const key: SlotKey = slot === 'weapon' ? 'equippedWeapon' : slot === 'head' ? 'equippedHead' : slot === 'legs' ? 'equippedLegs' : 'equippedArmor';
    const index = state[key];
    if (index === null) return;
    const item = state.inventory[index];
    if (!item?.durability) return;
    // Maestro di Combattimento: weapons wear half as fast.
    if (slot === 'weapon' && state.hasTalent('combat_master') && Math.random() < 0.5) return;

    const current = Math.max(0, item.durability.current - amount);
    const inventory = [...state.inventory];
    inventory[index] = { ...item, durability: { ...item.durability, current } };
    if (current <= 0) {
      const name = useItemDatabaseStore.getState().itemDatabase[item.itemId]?.name ?? item.itemId;
      set({ inventory, [key]: null });
      journal(`Il tuo ${name} si è rotto!`, JournalEntryType.SYSTEM_ERROR);
      audioManager.playSound('error');
    } else {
      set({ inventory });
    }
  },

  repairItem: (inventoryIndex, amount) => {
    const item = get().inventory[inventoryIndex];
    if (!item?.durability) return;
    const inventory = [...get().inventory];
    inventory[inventoryIndex] = {
      ...item,
      durability: { ...item.durability, current: Math.min(item.durability.max, item.durability.current + amount) },
    };
    set({ inventory });
    get().unlockTrophy('trophy_craft_repair');
  },

  /** Dismantles a broken piece of equipment for scrap. */
  salvageItem: (inventoryIndex) => {
    const item = get().inventory[inventoryIndex];
    if (!item?.durability || item.durability.current > 0) return;
    const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
    const details = itemDatabase[item.itemId];
    if (!details) return;
    const materialId = details.rarity === 'rare' || details.rarity === 'epic' ? 'scrap_metal_high_quality' : 'scrap_metal';
    get().discardItem(inventoryIndex, 1);
    get().addItem(materialId, 1);
    journal(`Hai smontato ${details.name} e recuperato ${itemDatabase[materialId]?.name ?? materialId}.`, JournalEntryType.NARRATIVE);
    get().unlockTrophy('trophy_craft_salvage');
  },

  takeDamage: (amount, cause: DeathCause = 'UNKNOWN') => {
    const damage = Math.max(0, Math.floor(amount));
    if (damage === 0) return;
    const state = get();
    if (state.hp.current <= 0) return;
    const newHp = Math.max(0, state.hp.current - damage);
    const game = useGameStore.getState();

    if (newHp > 0 && newHp / state.hp.max < 0.1 && !game.hasFlag('THE_BRINK_TRIGGERED')) {
      // One-time reward for surviving on the brink: +25% to every attribute.
      game.setFlag('THE_BRINK_TRIGGERED');
      const attributes = { ...state.attributes };
      ATTRIBUTES.forEach(attr => { attributes[attr] += Math.ceil(attributes[attr] * 0.25); });
      set({ hp: { ...state.hp, current: newHp }, attributes });
      journal("[SOPRAVVISSUTO ALL'ORLO] La tua determinazione ti ha reso più forte! +25% a tutti gli attributi!", JournalEntryType.XP_GAIN);
      game.queueCutscene('CS_THE_BRINK');
      game.triggerDamageFlash();
      get().checkCharacterTrophies();
      return;
    }

    set({ hp: { ...state.hp, current: newHp } });
    game.triggerDamageFlash();
    if (newHp <= 0) game.setGameOver(cause);
  },

  /** Satiety/hydration cost of resting for `minutes` (used to warn before sleeping). */
  calculateSurvivalCost: (minutes) => {
    const factor = get().hasTalent('veteran_survivor') ? 0.75 : 1;
    return { satietyCost: (minutes / 60) * 3.0 * factor, hydrationCost: (minutes / 60) * 4.5 * factor };
  },

  updateSurvivalStats: (minutes, weather) => {
    const current = get();
    if (current.hp.current <= 0) return;
    const factor = current.hasTalent('veteran_survivor') ? 0.75 : 1;
    const satietyLoss = (minutes / 60) * 3.0 * factor;
    const hydrationLoss = (minutes / 60) * 4.5 * factor * (weather === WeatherType.TEMPESTA ? 1.5 : 1);
    const newSatiety = Math.max(0, current.satiety.current - satietyLoss);
    const newHydration = Math.max(0, current.hydration.current - hydrationLoss);

    let hpLoss = 0;
    let deathCause: DeathCause | null = null;
    const messages: string[] = [];
    if (current.status.has('AVVELENATO')) { hpLoss += (minutes / 60) * 2; deathCause = 'POISON'; messages.push('Il veleno ti consuma...'); }
    if (current.status.has('MALATO')) { hpLoss += (minutes / 60) * 0.5; deathCause = deathCause ?? 'SICKNESS'; messages.push('La malattia ti indebolisce...'); }
    if (current.status.has('IPOTERMIA')) { hpLoss += (minutes / 60) * 1; deathCause = deathCause ?? 'ENVIRONMENT'; messages.push("L'ipotermia ti gela le ossa..."); }
    if (current.status.has('INFEZIONE')) { hpLoss += (minutes / 60) * 1; deathCause = deathCause ?? 'SICKNESS'; messages.push("L'infezione si diffonde nel tuo corpo..."); }
    if (newSatiety === 0) { hpLoss += (minutes / 60) * 2; deathCause = deathCause ?? 'STARVATION'; }
    if (newHydration === 0) { hpLoss += (minutes / 60) * 3; deathCause = deathCause ?? 'DEHYDRATION'; }

    survivalDamageDebt += hpLoss;
    const totalHpLoss = Math.floor(survivalDamageDebt);
    survivalDamageDebt -= totalHpLoss;
    const newHp = Math.max(0, current.hp.current - totalHpLoss);
    if (totalHpLoss > 0) messages.forEach(text => journal(`${text} (-HP)`, JournalEntryType.COMBAT));

    // Encumbrance doubles fatigue; tell the player when the state changes.
    const isOverEncumbered = current.getTotalWeight() > current.getMaxCarryWeight();
    if (isOverEncumbered !== current.wasOverEncumbered) {
      journal(
        isOverEncumbered
          ? `[SISTEMA] Sei SOVRACCARICO (${current.getTotalWeight().toFixed(1)}/${current.getMaxCarryWeight().toFixed(1)} kg). Ti stanchi il doppio.`
          : `[SISTEMA] Non sei più sovraccarico.`,
        isOverEncumbered ? JournalEntryType.SYSTEM_WARNING : JournalEntryType.NARRATIVE,
      );
    }
    const fatigueGain = (minutes / 60) * (isOverEncumbered ? 2 : 1) * (current.hasTalent('wasteland_runner') ? 0.75 : 1);
    const newFatigue = Math.min(current.fatigue.max, current.fatigue.current + fatigueGain);

    const status = new Set(current.status);
    if (newFatigue >= 85 && !status.has('ESAUSTO')) { status.add('ESAUSTO'); journal('Sei completamente ESAUSTO. La fatica ti opprime e rallenta ogni tuo movimento.', JournalEntryType.SYSTEM_WARNING); }
    else if (newFatigue < 70 && status.has('ESAUSTO')) { status.delete('ESAUSTO'); journal('Ti senti meno esausto. Lo stato ESAUSTO è svanito.', JournalEntryType.NARRATIVE); }
    if (newSatiety < 20 && !status.has('AFFAMATO')) { status.add('AFFAMATO'); journal('La fame ti consuma. Sei AFFAMATO.', JournalEntryType.SYSTEM_WARNING); }
    else if (newSatiety >= 40 && status.has('AFFAMATO')) { status.delete('AFFAMATO'); journal('La fame si attenua. Lo stato AFFAMATO è svanito.', JournalEntryType.NARRATIVE); }
    if (newHydration < 20 && !status.has('DISIDRATATO')) { status.add('DISIDRATATO'); journal('La sete ti tormenta. Sei DISIDRATATO.', JournalEntryType.SYSTEM_WARNING); }
    else if (newHydration >= 40 && status.has('DISIDRATATO')) { status.delete('DISIDRATATO'); journal('La sete si placa. Lo stato DISIDRATATO è svanito.', JournalEntryType.NARRATIVE); }

    set({
      satiety: { ...current.satiety, current: newSatiety },
      hydration: { ...current.hydration, current: newHydration },
      hp: { ...current.hp, current: newHp },
      fatigue: { ...current.fatigue, current: newFatigue },
      status,
      wasOverEncumbered: isOverEncumbered,
    });
    if (newHp <= 0) useGameStore.getState().setGameOver(deathCause ?? 'UNKNOWN');
  },

  /** Restores HP (callers write their own journal line). */
  heal: (amount) => {
    const healAmount = Math.ceil(amount);
    if (healAmount <= 0) return;
    set(state => ({ hp: { ...state.hp, current: Math.min(state.hp.max, state.hp.current + healAmount) } }));
  },

  restoreSatiety: (amount) => {
    set(state => ({ satiety: { ...state.satiety, current: Math.max(0, Math.min(state.satiety.max, state.satiety.current + amount)) } }));
  },

  restoreHydration: (amount) => {
    set(state => ({ hydration: { ...state.hydration, current: Math.max(0, Math.min(state.hydration.max, state.hydration.current + amount)) } }));
  },

  updateFatigue: (amount) => {
    set(state => ({ fatigue: { ...state.fatigue, current: Math.min(state.fatigue.max, state.fatigue.current + amount) } }));
  },

  rest: (amount) => {
    set(state => ({ fatigue: { ...state.fatigue, current: Math.max(0, state.fatigue.current - amount) } }));
  },

  changeAlignment: (type, amount) => {
    const before = get().alignment;
    const oldDiff = before.lena - before.elian;
    const alignment = { ...before, [type]: before[type] + amount };
    set({ alignment });
    const newDiff = alignment.lena - alignment.elian;

    const game = useGameStore.getState();
    if (Math.abs(amount) >= 3 && !game.hasFlag('WEIGHT_OF_CHOICE_PLAYED')) {
      game.setFlag('WEIGHT_OF_CHOICE_PLAYED');
      game.queueCutscene('CS_THE_WEIGHT_OF_CHOICE');
    }
    if (oldDiff <= ALIGNMENT_THRESHOLD && newDiff > ALIGNMENT_THRESHOLD) {
      journal('La tua compassione ti guida. Ottieni un bonus a Persuasione e Intuizione.', JournalEntryType.XP_GAIN);
    } else if (oldDiff >= -ALIGNMENT_THRESHOLD && newDiff < -ALIGNMENT_THRESHOLD) {
      journal('Il tuo pragmatismo ti tempra. Ottieni un bonus a Sopravvivenza e Intimidire.', JournalEntryType.XP_GAIN);
    } else if ((oldDiff > ALIGNMENT_THRESHOLD && newDiff <= ALIGNMENT_THRESHOLD) || (oldDiff < -ALIGNMENT_THRESHOLD && newDiff >= -ALIGNMENT_THRESHOLD)) {
      journal('Il tuo percorso è ora più equilibrato. I bonus di allineamento sono svaniti.', JournalEntryType.SYSTEM_WARNING);
    }
    get().checkCharacterTrophies();
  },

  addStatus: (newStatus) => {
    if (!VALID_STATUSES.has(newStatus)) return;
    set(state => ({ status: new Set(state.status).add(newStatus) }));
  },

  removeStatus: (statusToRemove) => set(state => {
    const status = new Set(state.status);
    status.delete(statusToRemove);
    return { status };
  }),

  boostAttribute: (attribute, amount) => {
    set(state => ({ attributes: { ...state.attributes, [attribute]: state.attributes[attribute] + amount } }));
    get().checkCharacterTrophies();
  },

  learnRecipe: (recipeId) => {
    if (get().knownRecipes.includes(recipeId)) {
      journal('Conosci già questo schema.', JournalEntryType.SYSTEM_WARNING);
      return;
    }
    const recipe = useRecipeDatabaseStore.getState().recipes.find(r => r.id === recipeId);
    if (!recipe) {
      console.warn(`[CRAFTING] Unknown recipe ${recipeId}`);
      return;
    }
    set(state => ({ knownRecipes: [...state.knownRecipes, recipeId] }));
    journal(`Hai imparato una nuova ricetta: ${recipe.name}!`, JournalEntryType.XP_GAIN);
  },

  /** 10 + DES modifier + defense of every intact equipped piece (with Anya's upgrades). */
  getPlayerAC: () => {
    const state = get();
    const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
    let armor = 0;
    for (const key of ['equippedArmor', 'equippedHead', 'equippedLegs'] as const) {
      const index = state[key];
      const item = index !== null ? state.inventory[index] : null;
      if (!item || (item.durability && item.durability.current <= 0)) continue;
      armor += (itemDatabase[item.itemId]?.defense ?? 0) + (item.upgradeBonus ?? 0);
    }
    return 10 + state.getAttributeModifier('des') + armor;
  },

  unlockTrophy: (trophyId) => {
    if (get().unlockedTrophies.has(trophyId)) return;
    const trophy = useTrophyDatabaseStore.getState().trophies.find(t => t.id === trophyId);
    set(state => ({ unlockedTrophies: new Set(state.unlockedTrophies).add(trophyId) }));
    addGlobalTrophy(trophyId);
    if (trophy) {
      audioManager.playSound('level_up');
      journal(`Trofeo sbloccato: ${trophy.name}!`, JournalEntryType.TROPHY_UNLOCKED);
    }
  },

  checkCharacterTrophies: () => {
    const state = get();
    if (state.level >= 10) state.unlockTrophy('trophy_char_level_10');
    for (const attr of ATTRIBUTES) {
      if (state.attributes[attr] >= 20) state.unlockTrophy(`trophy_char_max_${attr}`);
    }
    const diff = state.alignment.lena - state.alignment.elian;
    if (diff >= ALIGNMENT_MAX) state.unlockTrophy('trophy_align_max_lena');
    if (diff <= -ALIGNMENT_MAX) state.unlockTrophy('trophy_align_max_elian');
    if (state.inventory.length > 0 && state.getTotalWeight() >= state.getMaxCarryWeight()) {
      state.unlockTrophy('trophy_misc_full_inventory');
    }
  },

  toJSON: () => {
    const s = get();
    return {
      level: s.level,
      xp: s.xp,
      hp: s.hp,
      satiety: s.satiety,
      hydration: s.hydration,
      fatigue: s.fatigue,
      attributes: s.attributes,
      skills: s.skills,
      inventory: s.inventory,
      equippedWeapon: s.equippedWeapon,
      equippedArmor: s.equippedArmor,
      equippedHead: s.equippedHead,
      equippedLegs: s.equippedLegs,
      alignment: s.alignment,
      status: Array.from(s.status),
      levelUpPending: s.levelUpPending,
      knownRecipes: s.knownRecipes,
      craftedRecipes: s.craftedRecipes,
      unlockedTalents: s.unlockedTalents,
      unlockedTrophies: Array.from(s.unlockedTrophies),
      activeQuests: s.activeQuests,
      completedQuests: s.completedQuests,
      failedQuests: s.failedQuests,
      loreArchive: s.loreArchive,
      questKillCounts: s.questKillCounts,
      questFlags: s.questFlags,
      wasOverEncumbered: s.wasOverEncumbered,
    };
  },

  fromJSON: (json) => {
    survivalDamageDebt = 0;
    const questFlags: Record<string, boolean> = { ...(json.questFlags ?? {}) };
    // Saves before 2.1 tracked purified water with a dedicated flag.
    if (questFlags.hasCraftedWater) questFlags.crafted_CONS_002 = true;
    const { inventory, equippedAt } = sanitizeInventory(json.inventory);
    set({
      level: json.level ?? 1,
      xp: json.xp ?? { current: 0, next: XP_PER_LEVEL[2] },
      hp: json.hp ?? { current: 100, max: 100 },
      satiety: json.satiety ?? { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
      hydration: json.hydration ?? { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
      fatigue: json.fatigue ?? { current: 0, max: 100 },
      attributes: { ...initialAttributes, ...(json.attributes ?? {}) },
      skills: { ...makeSkills(), ...(json.skills ?? {}) },
      inventory,
      equippedWeapon: equippedAt(json.equippedWeapon),
      equippedArmor: equippedAt(json.equippedArmor),
      equippedHead: equippedAt(json.equippedHead),
      equippedLegs: equippedAt(json.equippedLegs),
      alignment: json.alignment ?? { ...initialAlignment },
      status: new Set<PlayerStatusCondition>((Array.isArray(json.status) ? json.status : []).filter((s: string) => VALID_STATUSES.has(s))),
      levelUpPending: Boolean(json.levelUpPending),
      knownRecipes: Array.isArray(json.knownRecipes) ? json.knownRecipes : [...STARTING_RECIPES],
      craftedRecipes: Array.isArray(json.craftedRecipes) ? json.craftedRecipes : [],
      unlockedTalents: Array.isArray(json.unlockedTalents) ? json.unlockedTalents : [],
      unlockedTrophies: mergeWithGlobalTrophies(new Set<string>(json.unlockedTrophies ?? [])),
      activeQuests: json.activeQuests ?? {},
      completedQuests: Array.isArray(json.completedQuests) ? json.completedQuests : [],
      failedQuests: Array.isArray(json.failedQuests) ? json.failedQuests : [],
      loreArchive: Array.isArray(json.loreArchive) ? json.loreArchive : [],
      questKillCounts: json.questKillCounts ?? {},
      questFlags,
      wasOverEncumbered: Boolean(json.wasOverEncumbered),
    });
  },

  setQuestFlag: (flagName, value) => {
    set(state => ({ questFlags: { ...state.questFlags, [flagName]: value } }));
  },

  getQuestFlag: (flagName) => get().questFlags[flagName] || false,

  getTotalWeight: () => {
    const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
    return get().inventory.reduce((total, item) => total + (itemDatabase[item.itemId]?.weight ?? 0) * item.quantity, 0);
  },

  /** 15 kg + 2 per Strength modifier point, plus the best backpack carried. */
  getMaxCarryWeight: () => {
    const { attributes, inventory } = get();
    const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
    const backpack = inventory.reduce((best, item) => {
      const bonus = itemDatabase[item.itemId]?.effects?.find(e => e.type === 'container')?.value;
      return typeof bonus === 'number' && bonus > best ? bonus : best;
    }, 0);
    return 15 + Math.floor((attributes.for - 10) / 2) * 2 + backpack;
  },

  addLoreEntry: (entryId) => {
    if (get().loreArchive.includes(entryId)) return;
    set(state => ({ loreArchive: [...state.loreArchive, entryId] }));
    journal('[ARCHIVIO LORE] Nuova scoperta sbloccata! Consultabile nel Diario Missioni.', JournalEntryType.XP_GAIN, '#a78bfa');
  },

  /** Anya's upgrades: +defense on the equipped piece itself, durability restored. */
  upgradeEquippedArmor: (slot, defenseBonus) => {
    const state = get();
    const index = slot === 'chest' ? state.equippedArmor : slot === 'head' ? state.equippedHead : state.equippedLegs;
    const item = index !== null ? state.inventory[index] : null;
    const details = item ? useItemDatabaseStore.getState().itemDatabase[item.itemId] : null;
    if (index === null || !item || details?.type !== 'armor') {
      journal(`Non hai un'armatura equipaggiata in quello slot.`, JournalEntryType.ACTION_FAILURE);
      return false;
    }
    const inventory = [...state.inventory];
    inventory[index] = {
      ...item,
      upgradeBonus: (item.upgradeBonus ?? 0) + defenseBonus,
      durability: item.durability ? { ...item.durability, current: item.durability.max } : undefined,
    };
    set({ inventory });
    journal(`[POTENZIAMENTO] ${details.name} migliorato! (+${defenseBonus} Difesa, durabilità ripristinata)`, JournalEntryType.XP_GAIN, '#a855f7');
    return true;
  },
}));

/** True when the item can't be dropped, sold or dismantled. */
export const isProtectedItem = (itemId: string): boolean =>
  isQuestItem(useItemDatabaseStore.getState().itemDatabase[itemId]);
