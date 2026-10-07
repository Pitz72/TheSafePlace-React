/**
 * Item use outside combat: the actions offered in the inventory and what each
 * item effect does.
 *
 * Consumption rules:
 * - 'consumable' items lose one unit per use;
 * - 'tool' items are kept; a tool with durability loses one point per use
 *   (worn out at 0, repairable like any equipment);
 * - `consumes` names another item that every use burns (batteries, firewood).
 */
import { IItem, ItemEffect, JournalEntryType, PlayerStatusCondition, Position } from '../types';
import { useCharacterStore, isProtectedItem } from '../store/characterStore';
import { useGameStore } from '../store/gameStore';
import { useTimeStore } from '../store/timeStore';
import { useCombatStore } from '../store/combatStore';
import { pickAmbushEnemy } from '../store/eventStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useLootTableStore, rollLoot } from '../data/lootTableDatabase';
import { isNightHour, minutesUntilDawn, toAbsoluteMinutes } from '../utils/time';

export const ACTION = {
    USE: 'Usa',
    REPAIR: 'Ripara un oggetto',
    EQUIP: 'Equipaggia',
    UNEQUIP: 'Togli',
    READ: 'Leggi',
    STUDY: 'Studia',
    SALVAGE: 'Recupera Materiali',
    EXAMINE: 'Esamina',
    DISCARD: 'Scarta',
    CANCEL: 'Annulla',
} as const;

/** Effects that do something when used from the inventory. */
const FIELD_EFFECTS = new Set<ItemEffect['type']>([
    'heal', 'satiety', 'hydration', 'fatigue', 'cureStatus', 'light', 'vision', 'shelter',
    'random', 'fishing', 'fire', 'communication', 'repel', 'spoiled',
]);
/** Effects that only work in combat. */
export const COMBAT_ONLY_EFFECTS = new Set<ItemEffect['type']>(['trap', 'smoke']);

/** Points of interest the Delta station can point the player to, in order. */
const RADIO_POIS = ['military_bunker', 'water_plant', 'police_station', 'asylum'];
const RADIO_MESSAGES = [
    "«...qui Stazione Delta. Se qualcuno ascolta: l'acqua del fiume va bollita, sempre. Ripeto, sempre...»",
    "«...Delta a chiunque sia in cammino verso est: le colonne di fumo segnano i campi dei predoni. Girate al largo...»",
    "«...Stazione Delta. Abbiamo contato tre sopravvissuti, questa settimana. Tre. Continuate a camminare...»",
    "«...qui Delta. Gli Angeli della Cenere evitano i rumori acuti. Chi ha costruito un dissuasore, lo tenga carico...»",
];

const journal = (text: string, type: JournalEntryType = JournalEntryType.NARRATIVE, color?: string) =>
    useGameStore.getState().addJournalEntry({ text, type, color });

const itemDb = () => useItemDatabaseStore.getState().itemDatabase;
const now = () => toAbsoluteMinutes(useTimeStore.getState().gameTime);
const distance = (a: Position, b: Position) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
const numeric = (effect: ItemEffect) => (typeof effect.value === 'number' ? effect.value : Number(effect.value) || 0);

const compass = (from: Position, to: Position): string => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const vertical = dy < -Math.abs(dx) / 2 ? 'nord' : dy > Math.abs(dx) / 2 ? 'sud' : '';
    const horizontal = dx > Math.abs(dy) / 2 ? 'est' : dx < -Math.abs(dy) / 2 ? 'ovest' : '';
    if (vertical && horizontal) return `${vertical}-${horizontal}`;
    return vertical || horizontal || 'qui vicino';
};

export const isBroken = (index: number): boolean => {
    const item = useCharacterStore.getState().inventory[index];
    return !!item?.durability && item.durability.current <= 0;
};

const hasFieldUse = (details: IItem) => details.effects?.some(e => FIELD_EFFECTS.has(e.type)) ?? false;
const repairValue = (details: IItem) => {
    const effect = details.effects?.find(e => e.type === 'repair');
    return effect ? numeric(effect) : 0;
};
const recipesOf = (details: IItem): string[] =>
    !details.unlocksRecipe ? [] : Array.isArray(details.unlocksRecipe) ? details.unlocksRecipe : [details.unlocksRecipe];

/** Inventory indices of damaged equipment that `toolIndex` could repair. */
export function getRepairTargets(toolIndex: number): number[] {
    const { inventory } = useCharacterStore.getState();
    return inventory
        .map((item, index) => ({ item, index }))
        .filter(({ item, index }) => index !== toolIndex && item.durability && item.durability.current < item.durability.max)
        .map(({ index }) => index);
}

/** Actions offered by the inventory menu for one slot. */
export function getItemActions(index: number): string[] {
    const character = useCharacterStore.getState();
    const invItem = character.inventory[index];
    const details = invItem ? itemDb()[invItem.itemId] : undefined;
    if (!invItem || !details) return [ACTION.CANCEL];

    const actions: string[] = [];
    const broken = isBroken(index);
    if (details.type === 'weapon' || details.type === 'armor') {
        if (character.getEquippedSlot(index)) actions.push(ACTION.UNEQUIP);
        else if (!broken) actions.push(ACTION.EQUIP);
    }
    if (!broken) {
        if (hasFieldUse(details)) actions.push(ACTION.USE);
        if (repairValue(details) > 0) actions.push(ACTION.REPAIR);
        if (recipesOf(details).length > 0) actions.push(details.type === 'manual' ? ACTION.READ : ACTION.STUDY);
    }
    if (broken && details.type !== 'quest') actions.push(ACTION.SALVAGE);
    actions.push(ACTION.EXAMINE);
    if (!isProtectedItem(invItem.itemId)) actions.push(ACTION.DISCARD);
    actions.push(ACTION.CANCEL);
    return actions;
}

/** One use of the item at `index`. Call after the effect, since it may remove the slot. */
function consumeUse(index: number) {
    const character = useCharacterStore.getState();
    const invItem = character.inventory[index];
    const details = invItem ? itemDb()[invItem.itemId] : undefined;
    if (!invItem || !details) return;
    if (details.consumes) character.removeItem(details.consumes.itemId, details.consumes.quantity);
    if (details.type === 'tool') {
        if (!invItem.durability) return;
        const inventory = [...useCharacterStore.getState().inventory];
        const current = Math.max(0, invItem.durability.current - 1);
        inventory[index] = { ...invItem, durability: { ...invItem.durability, current } };
        useCharacterStore.setState({ inventory });
        if (current === 0) journal(`${details.name} è consumato: andrà riparato prima di poterlo usare ancora.`, JournalEntryType.SYSTEM_WARNING);
        return;
    }
    // removeItem/discardItem keep equipped indices consistent.
    character.discardItem(index, 1);
}

/** Missing `consumes` requirement, as a message (null when satisfied). */
function missingRequirement(details: IItem): string | null {
    if (!details.consumes) return null;
    const { itemId, quantity } = details.consumes;
    if (useCharacterStore.getState().getItemCount(itemId) >= quantity) return null;
    return `Per usare ${details.name} ti serve: ${itemDb()[itemId]?.name ?? itemId} x${quantity}.`;
}

/** Applies a field-usable item. Returns false when nothing happened (nothing consumed). */
export function applyItemUse(index: number): boolean {
    const character = useCharacterStore.getState();
    const invItem = character.inventory[index];
    const details = invItem ? itemDb()[invItem.itemId] : undefined;
    if (!invItem || !details || isBroken(index) || !hasFieldUse(details)) return false;

    const missing = missingRequirement(details);
    if (missing) {
        journal(missing, JournalEntryType.ACTION_FAILURE);
        return false;
    }

    const effects = details.effects ?? [];
    // Effects that need a context are checked before anything is applied.
    for (const effect of effects) {
        const blocker = checkPrecondition(effect, details);
        if (blocker) {
            journal(blocker, JournalEntryType.ACTION_FAILURE);
            return false;
        }
    }

    const messages: string[] = [];
    let ateOrDrank = false;
    for (const effect of effects) {
        const result = applyEffect(effect, details);
        if (result.message) messages.push(result.message);
        if (effect.type === 'satiety' || effect.type === 'hydration') ateOrDrank = true;
    }
    if (ateOrDrank) {
        useCharacterStore.getState().rest(10);
        messages.push('Ti senti meno stanco.');
    }
    if (messages.length > 0) journal(`Hai usato: ${details.name}. ${messages.join(' ')}`);
    consumeUse(index);
    useCharacterStore.getState().checkCharacterTrophies();
    return true;
}

function checkPrecondition(effect: ItemEffect, details: IItem): string | null {
    const game = useGameStore.getState();
    const { gameTime } = useTimeStore.getState();
    const { playerPos, map } = game;
    switch (effect.type) {
        case 'shelter': {
            if (!isNightHour(gameTime.hour)) return `Puoi accamparti con ${details.name} solo di notte (dalle 20:00).`;
            if (map[playerPos.y]?.[playerPos.x] === '~') return "Non puoi accamparti in mezzo al fiume.";
            if (game.lastShelterDay === nightId()) return "Hai già dormito all'aperto stanotte.";
            return null;
        }
        case 'fishing':
            return isNearWater() ? null : "Ti serve un corso d'acqua vicino per pescare.";
        case 'communication':
            return game.lastRadioDay === gameTime.day ? "Hai già ascoltato la radio oggi: le batterie vanno risparmiate." : null;
        default:
            return null;
    }
}

/** The night a timestamp belongs to: 20:00-05:59 counts as the evening's day. */
const nightId = () => {
    const { day, hour } = useTimeStore.getState().gameTime;
    return hour < 6 ? day - 1 : day;
};

const isNearWater = () => {
    const { map, playerPos } = useGameStore.getState();
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (map[playerPos.y + dy]?.[playerPos.x + dx] === '~') return true;
        }
    }
    return false;
};

function applyEffect(effect: ItemEffect, details: IItem): { message?: string } {
    const character = useCharacterStore.getState();
    const game = useGameStore.getState();
    const { advanceTime } = useTimeStore.getState();
    const value = numeric(effect);

    switch (effect.type) {
        case 'heal': {
            const amount = Math.floor(value * character.getHealingMultiplier());
            character.heal(amount);
            return { message: `Recuperi ${amount} HP.${amount > value ? ' [Talento]' : ''}` };
        }
        case 'spoiled': {
            character.unlockTrophy('trophy_misc_eat_rotten_food');
            if (Math.random() * 100 >= value) return { message: 'Aveva un sapore orribile, ma il tuo stomaco regge.' };
            character.addStatus('MALATO');
            return { message: 'Poco dopo i crampi ti piegano in due: sei MALATO.' };
        }
        case 'satiety':
            character.restoreSatiety(value);
            return { message: value >= 0 ? `Sazietà +${value}.` : `Sazietà ${value}.` };
        case 'hydration':
            character.restoreHydration(value);
            return { message: value >= 0 ? `Idratazione +${value}.` : `Idratazione ${value}: ti secca la gola.` };
        case 'fatigue':
            character.rest(value);
            return { message: `Stanchezza -${value}.` };
        case 'cureStatus': {
            const status = String(effect.value) as PlayerStatusCondition;
            if (!useCharacterStore.getState().status.has(status)) return {};
            character.removeStatus(status);
            return { message: `Lo stato ${status} è svanito.` };
        }
        case 'light': {
            const until = Math.max(now(), game.lightUntil) + value * 60;
            useGameStore.setState({ lightUntil: until });
            return { message: `La luce ti accompagnerà per circa ${value} ore: niente più passi falsi nel buio.` };
        }
        case 'repel': {
            const until = Math.max(now(), game.repelUntil) + value * 60;
            useGameStore.setState({ repelUntil: until });
            return { message: `Un ronzio acuto riempie l'aria. Per ${value} ore le creature ti staranno alla larga.` };
        }
        case 'random': {
            const loot = rollLoot(useLootTableStore.getState().tables.randomItem);
            if (!loot) return { message: "Dentro non c'è niente di utile." };
            character.addItem(loot.itemId, loot.quantity);
            return { message: `Dentro trovi: ${itemDb()[loot.itemId]?.name ?? loot.itemId} x${loot.quantity}.` };
        }
        case 'vision':
            advanceTime(10, true);
            return { message: scanHorizon(value) };
        case 'shelter':
            return { message: sleepOutdoors(value, details) };
        case 'fishing': {
            advanceTime(60, true);
            const dc = Math.max(5, 12 - Math.floor(value / 5));
            const check = character.performSkillCheck('sopravvivenza', dc);
            const roll = `[Sopravvivenza ${check.total} vs CD ${dc}]`;
            if (!check.success) return { message: `Un'ora di attesa, ma non abbocca nulla. ${roll}` };
            const loot = rollLoot(useLootTableStore.getState().tables.fishing);
            if (!loot) return { message: `Qualcosa abbocca, ma si libera. ${roll}` };
            character.addItem(loot.itemId, loot.quantity);
            return { message: `Dopo un'ora di pazienza prendi: ${itemDb()[loot.itemId]?.name ?? loot.itemId} x${loot.quantity}. ${roll}` };
        }
        case 'fire': {
            advanceTime(30, true);
            const cured = useCharacterStore.getState().status.has('IPOTERMIA');
            if (cured) character.removeStatus('IPOTERMIA');
            character.heal(5);
            character.rest(10);
            return { message: `Accendi un piccolo fuoco e ti scaldi le mani.${cured ? " Il gelo dell'IPOTERMIA ti abbandona." : ''} (+5 HP)` };
        }
        case 'communication':
            useGameStore.setState({ lastRadioDay: useTimeStore.getState().gameTime.day });
            advanceTime(15, true);
            return { message: tuneRadio() };
        default:
            return {};
    }
}

function scanHorizon(power: number): string {
    const game = useGameStore.getState();
    const radius = Math.max(8, power * 8);
    const found = game.pois.filter(p => !p.revealed && distance(p, game.playerPos) <= radius);
    found.forEach(p => game.revealPOI(p.id));

    let refugeHint = '';
    let best: { pos: Position; d: number } | null = null;
    for (let y = 0; y < game.map.length; y++) {
        for (let x = 0; x < game.map[y].length; x++) {
            if (game.map[y][x] !== 'R' || game.visitedRefuges.some(r => r.x === x && r.y === y)) continue;
            const d = distance({ x, y }, game.playerPos);
            if (d > 0 && d <= radius * 2 && (!best || d < best.d)) best = { pos: { x, y }, d };
        }
    }
    if (best) refugeHint = ` Un rifugio intatto si scorge a ${compass(game.playerPos, best.pos)}, a circa ${Math.round(best.d)} passi.`;
    if (found.length === 0) return `Scruti l'orizzonte: nessun luogo nuovo in vista.${refugeHint}`;
    return `Scruti l'orizzonte e individui: ${found.map(p => p.name).join(', ')}.${refugeHint}`;
}

function sleepOutdoors(quality: number, details: IItem): string {
    const character = useCharacterStore.getState();
    const { gameTime, advanceTime } = useTimeStore.getState();
    const minutes = minutesUntilDawn(gameTime);
    const { satietyCost, hydrationCost } = character.calculateSurvivalCost(minutes);
    const fed = character.satiety.current >= satietyCost && character.hydration.current >= hydrationCost;

    useGameStore.setState({ lastShelterDay: nightId() });
    advanceTime(minutes, true);
    const after = useCharacterStore.getState();
    if (after.hp.current <= 0) return '';

    const healPercent = fed ? quality * 5 : quality * 2;
    after.heal(Math.floor(after.hp.max * healPercent / 100));
    after.rest(fed ? quality * 5 : quality * 2);

    // A thin shelter is no wall: something may find you at dawn.
    const ambushChance = Math.max(0.05, (10 - quality) * 0.05);
    const enemyId = Math.random() < ambushChance ? pickAmbushEnemy() : null;
    if (enemyId) {
        journal(`Dormi sotto ${details.name.toLowerCase()} fino all'alba... finché un rumore ti sveglia di soprassalto!`, JournalEntryType.SYSTEM_WARNING);
        useCombatStore.getState().startCombat(enemyId);
        return '';
    }
    return fed
        ? `Monti ${details.name.toLowerCase()} e dormi fino all'alba. Ti svegli riposato. (+${healPercent}% HP)`
        : `Dormi a fatica, con lo stomaco vuoto. (+${healPercent}% HP)`;
}

function tuneRadio(): string {
    const game = useGameStore.getState();
    if (!game.hasFlag('RADIO_TOWER_REPAIRED')) {
        return "Giri la manopola: solo statico, e per un attimo una voce lontana. Serve un'antenna più potente.";
    }
    const message = RADIO_MESSAGES[Math.floor(Math.random() * RADIO_MESSAGES.length)];
    const target = RADIO_POIS.map(id => game.getPOI(id)).find(p => p && !p.revealed);
    if (target) {
        game.revealPOI(target.id);
        return `${message} La trasmissione indica anche le coordinate di: ${target.name}.`;
    }
    return message;
}

/** Repairs `targetIndex` with the repair item at `toolIndex`. */
export function repairWith(toolIndex: number, targetIndex: number): boolean {
    const character = useCharacterStore.getState();
    const tool = character.inventory[toolIndex];
    const target = character.inventory[targetIndex];
    const toolDetails = tool ? itemDb()[tool.itemId] : undefined;
    const targetDetails = target ? itemDb()[target.itemId] : undefined;
    const amount = toolDetails ? repairValue(toolDetails) : 0;
    if (!toolDetails || !targetDetails || !target.durability || amount <= 0 || isBroken(toolIndex)) return false;

    const before = target.durability.current;
    character.repairItem(targetIndex, amount);
    const after = useCharacterStore.getState().inventory[targetIndex]?.durability?.current ?? before;
    journal(`Con ${toolDetails.name} ripari ${targetDetails.name}: ${before} → ${after}/${target.durability.max}.`, JournalEntryType.SKILL_CHECK_SUCCESS);
    consumeUse(toolIndex);
    return true;
}

/** Learns the recipes taught by an item. Manuals are used up, other items are kept. */
export function studyItem(index: number): boolean {
    const character = useCharacterStore.getState();
    const invItem = character.inventory[index];
    const details = invItem ? itemDb()[invItem.itemId] : undefined;
    if (!invItem || !details) return false;
    const unknown = recipesOf(details).filter(id => !character.knownRecipes.includes(id));
    if (unknown.length === 0) {
        journal(`Hai già imparato tutto ciò che ${details.name} può insegnarti.`, JournalEntryType.SYSTEM_WARNING);
        return false;
    }
    useTimeStore.getState().advanceTime(30, true);
    unknown.forEach(id => useCharacterStore.getState().learnRecipe(id));
    if (details.type === 'manual') {
        useCharacterStore.getState().discardItem(index, 1);
        journal(`Hai letto ${details.name} da cima a fondo. Ormai lo conosci a memoria: lo lasci andare.`);
    }
    return true;
}

/** Text for 'Esamina': description plus what the item is for. */
export function describeItem(index: number): string {
    const invItem = useCharacterStore.getState().inventory[index];
    const details = invItem ? itemDb()[invItem.itemId] : undefined;
    if (!details) return '';
    const notes: string[] = [];
    for (const effect of details.effects ?? []) {
        if (effect.type === 'container') notes.push(`Aumenta la capacità di carico di ${effect.value} kg finché lo porti con te.`);
        if (effect.type === 'power') notes.push('Alimenta torce elettriche e apparecchi.');
        if (COMBAT_ONLY_EFFECTS.has(effect.type)) notes.push('Si usa in combattimento.');
    }
    if (details.weaponType === 'thrown') notes.push('Si lancia in combattimento.');
    if (details.type === 'valuable') notes.push('Non serve a nulla, ma i mercanti lo pagano bene.');
    return `${details.name}: ${details.description}${notes.length ? ` ${notes.join(' ')}` : ''}`;
}
