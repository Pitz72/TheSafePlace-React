#!/usr/bin/env node
/**
 * Game data validator.
 *
 * Checks public/data, the Ink story and the map against the TypeScript
 * contracts: schema basics, cross references (items, enemies, quests, POIs,
 * cutscenes, lore, trophies, recipes, Ink knots), quest completability
 * prerequisites (every quest can start, every signal is emitted somewhere,
 * every required item can be obtained) and map connectivity.
 *
 * Usage: node scripts/validate-data.mjs   (exit code 1 on errors)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'public', 'data');
const SRC = path.join(ROOT, 'src');

const errors = [];
const warnings = [];
const error = (where, message) => errors.push(`${where}: ${message}`);
const warn = (where, message) => warnings.push(`${where}: ${message}`);

const readText = file => fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const readJson = rel => JSON.parse(readText(path.join(DATA, rel)));
const src = rel => readText(path.join(SRC, rel));

// ─── Contracts read from the TypeScript sources ─────────────────────────────
const typesTs = src('types.ts');
/** String literals of a `export type Name = 'a' | 'b';` union. */
function unionOf(name) {
  const match = new RegExp(`export type ${name} =([^;]+);`).exec(typesTs);
  if (!match) throw new Error(`Type ${name} not found in types.ts`);
  return new Set([...match[1].matchAll(/'([^']+)'/g)].map(m => m[1]));
}
const RESULT_TYPES = unionOf('EventResultType');
const SPECIAL_EFFECTS = unionOf('SpecialEffectName');
const EFFECT_TYPES = unionOf('ItemEffectType');
const ITEM_TYPES = unionOf('ItemType');
const RARITIES = unionOf('Rarity');
const WEAPON_TYPES = unionOf('WeaponType');
const ARMOR_SLOTS = unionOf('ArmorSlot');
const QUEST_TRIGGERS = unionOf('QuestTriggerType');
const SKILLS = unionOf('SkillName');
const ATTRIBUTES = unionOf('AttributeName');
const STATUSES = new Set([...typesTs.matchAll(/\| '([A-Z]+)';?\s+\/\//g)].map(m => m[1]));
const CUTSCENE_CONSEQUENCES = new Set([...(/type: ('[^}]+?);/.exec(typesTs.slice(typesTs.indexOf('interface CutsceneConsequence')))?.[1] ?? '').matchAll(/'([^']+)'/g)].map(m => m[1]));
const SIGNAL_TRIGGERS = new Set(['talkToNPC', 'interactWithObject', 'completeEvent']);
const ELITE_ABILITIES = new Set(['pack_call', 'counterattack', 'pyromaniac_burst']);

const listFrom = (file, constName) => {
  const text = src(file);
  const match = new RegExp(`const ${constName}(?::[^=]+)? = \\[([\\s\\S]*?)\\]`).exec(text);
  if (!match) throw new Error(`${constName} not found in ${file}`);
  return [...match[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
};
const ITEM_FILES = listFrom('data/itemDatabase.ts', 'ITEM_FILES');
const BIOME_EVENT_FILES = listFrom('data/eventDatabase.ts', 'BIOME_FILES');
const OTHER_EVENT_FILES = ['encounters', 'lore', 'easter_eggs'];
const STARTING_RECIPES = new Set(listFrom('store/characterStore.ts', 'STARTING_RECIPES'));
const STARTING_PROFICIENCIES = listFrom('store/characterStore.ts', 'STARTING_PROFICIENCIES');
const STARTING_ITEMS = new Set([...(/inventory: \[\s*\n([\s\S]*?)\],/.exec(src('store/characterStore.ts'))?.[1] ?? '').matchAll(/itemId: '([^']+)'/g)].map(m => m[1]));

const biomeNamesMatch = /export const BIOME_NAMES[^{]*\{([^}]+)\}/.exec(src('constants.ts'));
const BIOME_NAMES = new Set([...biomeNamesMatch[1].matchAll(/: '([^']+)'/g)].map(m => m[1]));
const EVENT_BIOMES = new Set([...BIOME_NAMES, 'Global']);

// ─── Data ───────────────────────────────────────────────────────────────────
const items = new Map();
const itemFilesOnDisk = fs.readdirSync(path.join(DATA, 'items')).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
for (const file of itemFilesOnDisk) {
  if (!ITEM_FILES.includes(file)) error(`items/${file}.json`, 'file is not loaded by itemDatabase.ts (ITEM_FILES)');
}
for (const file of ITEM_FILES) {
  if (!itemFilesOnDisk.includes(file)) { error('itemDatabase.ts', `loads missing file items/${file}.json`); continue; }
  for (const item of readJson(`items/${file}.json`)) {
    if (items.has(item.id)) error(`items/${file}.json`, `duplicate item id ${item.id}`);
    items.set(item.id, { ...item, file });
  }
}

const eventFilesOnDisk = fs.readdirSync(path.join(DATA, 'events')).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
const loadedEventFiles = [...BIOME_EVENT_FILES, ...OTHER_EVENT_FILES];
for (const file of eventFilesOnDisk) {
  if (!loadedEventFiles.includes(file)) error(`events/${file}.json`, 'file is not loaded by eventDatabase.ts');
}
const events = new Map();
for (const file of loadedEventFiles) {
  if (!eventFilesOnDisk.includes(file)) { error('eventDatabase.ts', `loads missing file events/${file}.json`); continue; }
  for (const event of readJson(`events/${file}.json`)) {
    if (events.has(event.id)) error(`events/${file}.json`, `duplicate event id ${event.id}`);
    events.set(event.id, { ...event, file });
  }
}

const enemies = new Map(readJson('enemies.json').map(e => [e.id, e]));
const recipes = new Map(readJson('recipes.json').map(r => [r.id, r]));
const quests = new Map(readJson('quests.json').map(q => [q.id, q]));
const cutscenes = new Map(readJson('cutscenes.json').map(c => [c.id, c]));
const trophies = new Set(readJson('trophies.json').map(t => t.id));
const lore = new Map(readJson('lore_archive.json').map(l => [l.id, l]));
const talents = readJson('talents.json');
const traders = readJson('traders.json');
const mainStory = readJson('mainStory.json');
const pois = readJson('pois.json');
const lootTables = readJson('loot_tables.json');
const poiById = new Map(pois.map(p => [p.id, p]));

// ─── Map ────────────────────────────────────────────────────────────────────
const mapRows = (/MAP_STRING = `([^`]*)`/.exec(src('data/mapData.ts'))?.[1] ?? '').split('\n');
const WALKABLE = new Set(['.', 'R', 'C', 'V', 'F', 'S', 'E', '~', 'A', 'N', 'L', 'B', 'H']);
const tileAt = (x, y) => mapRows[y]?.[x];
{
  const width = mapRows[0]?.length;
  mapRows.forEach((row, y) => { if (row.length !== width) error('mapData.ts', `row ${y} is ${row.length} wide, expected ${width}`); });
  for (const tile of new Set(mapRows.join(''))) {
    if (!WALKABLE.has(tile) && tile !== 'M') error('mapData.ts', `unknown tile '${tile}'`);
  }
}
const findTile = tile => {
  for (let y = 0; y < mapRows.length; y++) { const x = mapRows[y].indexOf(tile); if (x !== -1) return { x, y }; }
  return null;
};
const start = findTile('S');
const end = findTile('E');
if (!start || !end) error('mapData.ts', 'start (S) or end (E) tile missing');
const reachable = new Set();
if (start) {
  const queue = [start];
  reachable.add(`${start.x},${start.y}`);
  while (queue.length) {
    const { x, y } = queue.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, key = `${nx},${ny}`;
      if (!reachable.has(key) && WALKABLE.has(tileAt(nx, ny))) { reachable.add(key); queue.push({ x: nx, y: ny }); }
    }
  }
  if (end && !reachable.has(`${end.x},${end.y}`)) error('mapData.ts', 'the end (E) is not reachable from the start (S)');
  for (const tile of ['A', 'N', 'L', 'B', 'H']) {
    const pos = findTile(tile);
    if (!pos) error('mapData.ts', `special tile ${tile} missing`);
    else if (!reachable.has(`${pos.x},${pos.y}`)) error('mapData.ts', `special tile ${tile} is not reachable`);
  }
}

// ─── Ink ────────────────────────────────────────────────────────────────────
const inkFiles = [];
const walkInk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) walkInk(full); else if (entry.name.endsWith('.ink')) inkFiles.push(full);
});
walkInk(path.join(SRC, 'assets', 'story'));
const inkSource = inkFiles.map(readText).join('\n');
const inkKnots = new Set([...inkSource.matchAll(/^===\s*(\w+)\s*===/gm)].map(m => m[1]));
const declaredExternals = new Set([...inkSource.matchAll(/^EXTERNAL\s+(\w+)\s*\(/gm)].map(m => m[1]));
const boundExternals = new Set([...src('services/NarrativeService.ts').matchAll(/BindExternalFunction\('(\w+)'/g)].map(m => m[1]));
for (const name of declaredExternals) if (!boundExternals.has(name)) error('NarrativeService.ts', `Ink EXTERNAL ${name} is not bound`);
for (const name of boundExternals) if (!declaredExternals.has(name)) error('common.ink', `${name} is bound in NarrativeService but not declared EXTERNAL (Ink would run its fallback)`);
{
  const compiled = readText(path.join(SRC, 'assets', 'story', 'main.json'));
  const inkMtime = Math.max(...inkFiles.map(f => fs.statSync(f).mtimeMs));
  if (fs.statSync(path.join(SRC, 'assets', 'story', 'main.json')).mtimeMs < inkMtime - 1000) warn('main.json', 'older than the .ink sources: run npm run compile:ink');
  for (const name of declaredExternals) {
    if (compiled.includes(`"f()":"${name}"`)) error('main.json', `${name} is compiled as an internal Ink function call instead of an EXTERNAL`);
  }
}
const inkCalls = (fn) => [...inkSource.matchAll(new RegExp(`\\b${fn}\\(\\s*"([^"]+)"`, 'g'))].map(m => m[1]);

// ─── Sources of items, signals, quests, flags ───────────────────────────────
const itemSources = new Map(); // itemId -> [where]
const addSource = (itemId, where) => { if (!itemSources.has(itemId)) itemSources.set(itemId, []); itemSources.get(itemId).push(where); };
STARTING_ITEMS.forEach(id => addSource(id, 'start'));
const signals = new Map(); // signal id -> [where]
const addSignal = (id, where) => { if (!signals.has(id)) signals.set(id, []); signals.get(id).push(where); };
const questStarts = new Map();
const addQuestStart = (id, where) => { if (!questStarts.has(id)) questStarts.set(id, []); questStarts.get(id).push(where); };
const learnableRecipes = new Set(STARTING_RECIPES);
const revealedPois = new Set(pois.filter(p => p.revealed).map(p => p.id));
const flagsSet = new Set();
const openedEvents = new Set();

// Code-level sources.
const codeFiles = [];
const walkCode = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) walkCode(full);
  else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')) codeFiles.push(full);
});
walkCode(SRC);
const code = codeFiles.map(readText).join('\n');
for (const m of code.matchAll(/startQuest\((?:'([^']+)'|MAIN_QUEST_ID)\)/g)) addQuestStart(m[1] ?? 'MQ_THE_ECHO_OF_THE_JOURNEY', 'code');
for (const m of code.matchAll(/setFlag\('([A-Z_0-9]+)'\)/g)) flagsSet.add(m[1]);
for (const m of code.matchAll(/openEvent\('([a-z_0-9]+)'\)/g)) openedEvents.add(m[1]);
for (const m of code.matchAll(/openOnce\('[A-Z_]+', '([a-z_0-9]+)'\)/g)) openedEvents.add(m[1]);
for (const m of code.matchAll(/(?:grant|addItem)\('([A-Za-z_0-9]+)'/g)) addSource(m[1], 'code');
for (const m of code.matchAll(/unlockTrophy\('([a-z_0-9]+)'\)/g)) if (!trophies.has(m[1])) error('code', `unknown trophy ${m[1]}`);
for (const m of code.matchAll(/(?:startCutscene|queueCutscene)\('([A-Z_0-9]+)'\)/g)) if (!cutscenes.has(m[1]) && m[1] !== 'CS_OPENING') error('code', `unknown cutscene ${m[1]}`);
for (const m of code.matchAll(/startDialogue\('([a-z_0-9]+)'/g)) if (!inkKnots.has(m[1])) error('code', `unknown Ink knot ${m[1]}`);

// Ink sources.
inkCalls('giveItem').forEach(id => addSource(id, 'ink'));
inkCalls('startQuest').forEach(id => addQuestStart(id, 'ink'));
inkCalls('questTrigger').forEach(id => addSignal(id, 'ink'));
inkCalls('learnRecipe').forEach(id => learnableRecipes.add(id));
inkCalls('revealPOI').forEach(id => revealedPois.add(id));
inkCalls('setGameFlag').forEach(id => flagsSet.add(id));
for (const fn of ['giveItem', 'takeItem', 'has_item', 'item_count']) {
  inkCalls(fn).forEach(id => { if (!items.has(id)) error('ink', `${fn}("${id}"): unknown item`); });
}
for (const fn of ['startQuest', 'completeQuest', 'advanceQuest', 'quest_active', 'quest_done']) {
  inkCalls(fn).forEach(id => { if (!quests.has(id)) error('ink', `${fn}("${id}"): unknown quest`); });
}
inkCalls('learnRecipe').forEach(id => { if (!recipes.has(id)) error('ink', `learnRecipe("${id}"): unknown recipe`); });
inkCalls('revealPOI').forEach(id => { if (!poiById.has(id)) error('ink', `revealPOI("${id}"): unknown POI`); });
for (const m of inkSource.matchAll(/checkSkill\("(\w+)"/g)) if (!SKILLS.has(m[1])) error('ink', `checkSkill("${m[1]}"): unknown skill`);
for (const m of inkSource.matchAll(/cureStatus\("(\w+)"/g)) if (!STATUSES.has(m[1])) error('ink', `cureStatus("${m[1]}"): unknown status`);

// ─── Items ──────────────────────────────────────────────────────────────────
for (const [id, item] of items) {
  const where = `items/${item.file}.json:${id}`;
  for (const key of ['id', 'name', 'description', 'type', 'rarity']) if (typeof item[key] !== 'string' || !item[key]) error(where, `missing ${key}`);
  if (!ITEM_TYPES.has(item.type)) error(where, `invalid type ${item.type}`);
  if (!RARITIES.has(item.rarity)) error(where, `invalid rarity ${item.rarity}`);
  if (typeof item.weight !== 'number' || item.weight < 0) error(where, 'invalid weight');
  if (typeof item.value !== 'number' || item.value < 0) error(where, 'invalid value');
  if (typeof item.stackable !== 'boolean') error(where, 'stackable must be a boolean');
  if ('price' in item) error(where, 'unused field price');
  if (item.type === 'weapon') {
    if (!WEAPON_TYPES.has(item.weaponType)) error(where, `invalid weaponType ${item.weaponType}`);
    if (typeof item.damage !== 'number' || item.damage <= 0) error(where, 'weapons need a positive damage');
    if (item.weaponType === 'ranged' && !item.ammoType) error(where, 'ranged weapons need an ammoType');
  }
  if (item.ammoType && !items.get(item.ammoType)?.stackable) error(where, `ammoType ${item.ammoType} must be a stackable item`);
  if (item.type === 'armor') {
    if (!ARMOR_SLOTS.has(item.slot)) error(where, `invalid armor slot ${item.slot}`);
    if (typeof item.defense !== 'number') error(where, 'armor needs a defense');
  }
  if ((item.type === 'weapon' && item.weaponType !== 'thrown') || item.type === 'armor') {
    if (typeof item.durability !== 'number' || item.durability <= 0) error(where, 'equipment needs a durability');
  }
  if (item.stackable && item.durability) error(where, 'stackable items cannot have durability');
  for (const effect of item.effects ?? []) {
    if (!EFFECT_TYPES.has(effect.type)) error(where, `invalid effect type ${effect.type}`);
    if (effect.type === 'cureStatus' && !STATUSES.has(effect.value)) error(where, `cureStatus ${effect.value} is not a status`);
    if (effect.type !== 'cureStatus' && typeof effect.value !== 'number') error(where, `effect ${effect.type} needs a numeric value`);
  }
  if (item.type === 'consumable' && !(item.effects ?? []).length) error(where, 'consumable without effects');
  if (item.consumes && !items.has(item.consumes.itemId)) error(where, `consumes unknown item ${item.consumes.itemId}`);
  const unlocks = item.unlocksRecipe ? [item.unlocksRecipe].flat() : [];
  for (const recipeId of unlocks) {
    if (!recipes.has(recipeId)) error(where, `unlocksRecipe ${recipeId} does not exist`);
    learnableRecipes.add(recipeId);
  }
  if (item.type === 'manual' && unlocks.length === 0) error(where, 'manual that teaches nothing');
}

// ─── Recipes ────────────────────────────────────────────────────────────────
for (const [id, recipe] of recipes) {
  const where = `recipes.json:${id}`;
  if (!SKILLS.has(recipe.skill)) error(where, `invalid skill ${recipe.skill}`);
  if (typeof recipe.dc !== 'number' || typeof recipe.timeCost !== 'number') error(where, 'dc and timeCost must be numbers');
  for (const ing of recipe.ingredients) if (!items.has(ing.itemId)) error(where, `unknown ingredient ${ing.itemId}`);
  for (const res of recipe.results) {
    if (!items.has(res.itemId)) error(where, `unknown result ${res.itemId}`);
    else addSource(res.itemId, `recipe:${id}`);
  }
}

// ─── Enemies ────────────────────────────────────────────────────────────────
for (const [id, enemy] of enemies) {
  const where = `enemies.json:${id}`;
  if (!['humanoid', 'beast'].includes(enemy.type)) error(where, `invalid type ${enemy.type}`);
  for (const biome of enemy.biomes) if (!EVENT_BIOMES.has(biome)) error(where, `unknown biome ${biome}`);
  if (enemy.randomEncounter !== false && !enemy.biomes.some(b => EVENT_BIOMES.has(b))) error(where, 'random enemy with no valid biome');
  for (const action of enemy.tactics?.actions ?? []) if (action.skillCheck && !SKILLS.has(action.skillCheck.skill)) error(where, `tactic skill ${action.skillCheck.skill} unknown`);
  if (enemy.specialAbility && !ELITE_ABILITIES.has(enemy.specialAbility.id)) error(where, `unknown elite ability ${enemy.specialAbility.id}`);
  for (const loot of enemy.guaranteedLoot ?? []) {
    if (!items.has(loot.itemId)) error(where, `guaranteed loot ${loot.itemId} unknown`);
    else addSource(loot.itemId, `enemy:${id}`);
  }
  if (enemy.defeatTrigger) addSignal(enemy.defeatTrigger, `enemy:${id}`);
  if (enemy.defeatFlag) flagsSet.add(enemy.defeatFlag);
}

// ─── Loot tables & traders ──────────────────────────────────────────────────
const checkTable = (table, where) => {
  if (!Array.isArray(table)) { error(where, 'loot table must be an array'); return; }
  for (const entry of table) {
    if (!items.has(entry.itemId)) error(where, `unknown item ${entry.itemId}`);
    else addSource(entry.itemId, where);
    if (!(entry.weight > 0) || !(entry.min >= 1) || !(entry.max >= entry.min)) error(where, `bad weight/min/max for ${entry.itemId}`);
  }
};
for (const [biome, table] of Object.entries(lootTables.activeSearch ?? {})) checkTable(table, `loot_tables.activeSearch.${biome}`);
checkTable(lootTables.refugeSearch, 'loot_tables.refugeSearch');
for (const tier of ['common', 'uncommon', 'rare']) checkTable(lootTables.combat?.[tier], `loot_tables.combat.${tier}`);
checkTable(lootTables.randomItem, 'loot_tables.randomItem');
checkTable(lootTables.fishing, 'loot_tables.fishing');
for (const trader of traders) {
  const where = `traders.json:${trader.id}`;
  if (typeof trader.baseMarkup !== 'number') error(where, 'baseMarkup must be a number');
  for (const entry of trader.inventory) {
    if ('price' in entry) error(where, `unused price on ${entry.itemId}`);
    const item = items.get(entry.itemId);
    if (!item) error(where, `unknown item ${entry.itemId}`);
    else if (item.type === 'quest') error(where, `sells quest item ${entry.itemId}`);
    else addSource(entry.itemId, where);
  }
}

// ─── POIs ───────────────────────────────────────────────────────────────────
for (const poi of pois) {
  const where = `pois.json:${poi.id}`;
  if (!WALKABLE.has(tileAt(poi.x, poi.y))) error(where, `(${poi.x},${poi.y}) is not walkable (${tileAt(poi.x, poi.y)})`);
  else if (!reachable.has(`${poi.x},${poi.y}`)) error(where, `(${poi.x},${poi.y}) is not reachable from the start`);
  if (['R', 'A', 'N', 'L', 'B', 'H', 'S', 'E'].includes(tileAt(poi.x, poi.y))) error(where, `sits on special tile ${tileAt(poi.x, poi.y)}`);
  if (poi.eventId) {
    const event = events.get(poi.eventId);
    if (!event) error(where, `unknown event ${poi.eventId}`);
    else {
      openedEvents.add(poi.eventId);
      if (!event.questOnly) error(where, `event ${poi.eventId} must be questOnly (it would also fire randomly)`);
    }
  }
}
if (new Set(pois.map(p => p.id)).size !== pois.length) error('pois.json', 'duplicate POI ids');
const occupied = new Map();
for (const poi of pois) {
  const key = `${poi.x},${poi.y}`;
  if (occupied.has(key)) error('pois.json', `${poi.id} and ${occupied.get(key)} share (${key})`);
  occupied.set(key, poi.id);
}

// ─── Events ─────────────────────────────────────────────────────────────────
const knownQuest = (id, where) => { if (!quests.has(id)) error(where, `unknown quest ${id}`); };
const itemRef = r => (typeof r.value === 'string' ? r.value : r.value?.itemId);
function checkSpecial(value, where, eventId) {
  const effect = value?.effect;
  if (!SPECIAL_EFFECTS.has(effect)) { error(where, `unknown special effect ${JSON.stringify(effect)}`); return; }
  switch (effect) {
    case 'startDialogue': if (!inkKnots.has(value.dialogueId)) error(where, `unknown Ink knot ${value.dialogueId}`); break;
    case 'startTrading': if (!traders.some(t => t.id === value.traderId)) error(where, `unknown trader ${value.traderId}`); break;
    case 'startCombat': if (!enemies.has(value.enemyId)) error(where, `unknown enemy ${value.enemyId}`); break;
    case 'startCutscene': if (!cutscenes.has(value.cutsceneId)) error(where, `unknown cutscene ${value.cutsceneId}`); break;
    case 'setFlag': if (typeof value.flag !== 'string') error(where, 'setFlag needs a flag'); else flagsSet.add(value.flag); break;
    case 'completeQuest': case 'failQuest': case 'advanceQuest': knownQuest(value.questId, where); break;
    case 'revealPOI':
      if (!poiById.has(value.poiId)) error(where, `unknown POI ${value.poiId}`);
      else revealedPois.add(value.poiId);
      break;
    case 'registerPOI':
      if (!value.poiId || !value.name) error(where, 'registerPOI needs poiId and name');
      if (value.eventId && !events.has(value.eventId)) error(where, `registerPOI event ${value.eventId} unknown`);
      if (value.eventId) openedEvents.add(value.eventId);
      registeredPois.set(value.poiId, eventId);
      break;
  }
}
const registeredPois = new Map();
function checkResult(result, where, eventId) {
  if (!RESULT_TYPES.has(result.type)) { error(where, `unknown result type ${result.type}`); return; }
  switch (result.type) {
    case 'addItem': {
      const id = itemRef(result);
      if (!items.has(id)) error(where, `addItem unknown item ${id}`); else addSource(id, `event:${eventId}`);
      break;
    }
    case 'removeItem': if (!items.has(itemRef(result))) error(where, `removeItem unknown item ${itemRef(result)}`); break;
    case 'statusChange': if (!STATUSES.has(result.value)) error(where, `statusChange ${result.value} is not a status`); break;
    case 'removeStatus': if (!STATUSES.has(result.value)) error(where, `removeStatus ${result.value} is not a status`); break;
    case 'statBoost': if (!ATTRIBUTES.has(result.value?.stat)) error(where, `statBoost on unknown attribute ${result.value?.stat}`); break;
    case 'alignmentChange': if (!['lena', 'elian'].includes(result.value?.type) || typeof result.value?.amount !== 'number') error(where, 'alignmentChange needs {type: lena|elian, amount}'); break;
    case 'startQuest': knownQuest(result.value, where); addQuestStart(result.value, `event:${eventId}`); break;
    case 'setFlag': if (typeof result.value !== 'string') error(where, 'setFlag needs a string'); else flagsSet.add(result.value); break;
    case 'unlockTrophy': if (!trophies.has(result.value)) error(where, `unknown trophy ${result.value}`); break;
    case 'learnRecipe': if (!recipes.has(result.value)) error(where, `unknown recipe ${result.value}`); else learnableRecipes.add(result.value); break;
    case 'addLore': if (!lore.has(result.value)) error(where, `unknown lore ${result.value}`); break;
    case 'questTrigger': addSignal(result.value, `event:${eventId}`); break;
    case 'revealMapPOI': if (typeof result.value?.x !== 'number') error(where, 'revealMapPOI needs coordinates'); break;
    case 'special': checkSpecial(result.value, where, eventId); break;
    case 'addXp': case 'takeDamage': case 'heal': case 'advanceTime': case 'hydration': case 'satiety':
      if (typeof result.value !== 'number') error(where, `${result.type} needs a number`); break;
    case 'journalEntry': if (!result.text && !result.value?.text) error(where, 'journalEntry without text'); break;
  }
}
for (const [id, event] of events) {
  const where = `events/${event.file}.json:${id}`;
  if (!event.title || !event.description) error(where, 'missing title or description');
  if (!Array.isArray(event.choices) || event.choices.length === 0) error(where, 'no choices');
  if (!event.questOnly) {
    if (!event.biomes?.length || !event.biomes.some(b => EVENT_BIOMES.has(b))) error(where, `random event with no reachable biome (${event.biomes})`);
  }
  for (const biome of event.biomes ?? []) if (!EVENT_BIOMES.has(biome)) error(where, `unknown biome ${biome}`);
  for (const key of ['requiresQuest', 'excludesQuest']) if (event[key]) knownQuest(event[key], where);
  (event.choices ?? []).forEach((choice, index) => {
    const at = `${where}#${index}`;
    if (!choice.text) error(at, 'choice without text');
    for (const req of choice.itemRequirements ?? []) if (!items.has(req.itemId)) error(at, `requires unknown item ${req.itemId}`);
    for (const key of ['requiresQuest', 'hideIfQuestKnown']) if (choice[key]) knownQuest(choice[key], at);
    if (!choice.outcomes?.length) error(at, 'choice without outcomes');
    for (const outcome of choice.outcomes ?? []) {
      if (!['direct', 'skillCheck', 'special'].includes(outcome.type)) error(at, `unknown outcome type ${outcome.type}`);
      if (outcome.type === 'skillCheck') {
        if (!SKILLS.has(outcome.skill)) error(at, `unknown skill ${outcome.skill}`);
        if (typeof outcome.dc !== 'number') error(at, 'skill check without dc');
      }
      if (outcome.type === 'special') checkSpecial(outcome.value, at, id);
      for (const list of [outcome.results, outcome.success, outcome.failure]) (list ?? []).forEach(r => checkResult(r, at, id));
    }
  });
}
for (const id of openedEvents) if (!events.has(id)) error('code/pois', `opens unknown event ${id}`);
for (const [id, event] of events) {
  if (event.questOnly && !openedEvents.has(id)) error(`events/${event.file}.json:${id}`, 'questOnly event that nothing opens');
}

// Flags read by events must be written somewhere.
const flagList = value => (value === undefined ? [] : Array.isArray(value) ? value : [value]);
for (const [id, event] of events) {
  const where = `events/${event.file}.json:${id}`;
  for (const flag of [...flagList(event.requiresFlag), ...(event.variants ?? []).map(v => v.requiresFlag)]) {
    if (!flagsSet.has(flag)) error(where, `flag ${flag} is never set`);
  }
  (event.choices ?? []).forEach((choice, index) => {
    for (const flag of flagList(choice.requiresFlag)) if (!flagsSet.has(flag)) error(`${where}#${index}`, `requires flag ${flag} that is never set`);
  });
}

// ─── Cutscenes ──────────────────────────────────────────────────────────────
for (const [id, cutscene] of cutscenes) {
  const where = `cutscenes.json:${id}`;
  cutscene.pages.forEach((page, index) => {
    for (const choice of page.choices ?? []) if (!cutscene.pages[choice.targetPage]) error(where, `page ${index} choice goes to missing page ${choice.targetPage}`);
    if (page.nextPage !== null && page.nextPage !== undefined && !cutscene.pages[page.nextPage]) error(where, `page ${index} nextPage ${page.nextPage} missing`);
    if (/^\s*\[\d\]/.test((page.choices ?? []).map(c => c.text).join(''))) error(where, `page ${index}: choice texts must not carry a [n] prefix (the UI adds it)`);
    for (const consequence of page.consequences ?? []) {
      if (!CUTSCENE_CONSEQUENCES.has(consequence.type)) error(where, `unknown consequence ${consequence.type}`);
      if (consequence.type === 'addItem') {
        if (!items.has(consequence.payload?.itemId)) error(where, `addItem unknown ${consequence.payload?.itemId}`);
        else addSource(consequence.payload.itemId, `cutscene:${id}`);
      }
      if (consequence.type === 'equipItem' && !items.has(consequence.payload)) error(where, `equipItem unknown ${consequence.payload}`);
      if (consequence.type === 'startQuest') { knownQuest(consequence.payload, where); addQuestStart(consequence.payload, `cutscene:${id}`); }
      if (consequence.type === 'setFlag') flagsSet.add(consequence.payload);
    }
  });
}

// ─── Main story ─────────────────────────────────────────────────────────────
mainStory.forEach((chapter, index) => {
  if (chapter.stage !== index + 1) error('mainStory.json', `chapter ${index} has stage ${chapter.stage}, expected ${index + 1}`);
  const type = chapter.trigger?.type;
  if (!['stepsTaken', 'daysSurvived', 'levelReached', 'combatWins', 'firstRefugeEntry', 'reachLocation', 'reachEnd', 'nearEnd'].includes(type)) error('mainStory.json', `chapter ${chapter.stage}: unknown trigger ${type}`);
});

// ─── Quests ─────────────────────────────────────────────────────────────────
const isProvided = id => itemSources.has(id);
for (const [id, quest] of quests) {
  const where = `quests.json:${id}`;
  if (!['MAIN', 'SUB'].includes(quest.type)) error(where, `invalid type ${quest.type}`);
  if (!questStarts.has(id)) error(where, 'nothing starts this quest');
  for (const poiId of quest.revealPOIs ?? []) { if (!poiById.has(poiId)) error(where, `revealPOIs: unknown POI ${poiId}`); else revealedPois.add(poiId); }
  quest.stages.forEach((stage, index) => {
    const at = `${where} stage ${stage.stage}`;
    if (stage.stage !== index + 1) error(at, `stage numbering broken (expected ${index + 1})`);
    const { type, value } = stage.trigger;
    if (!QUEST_TRIGGERS.has(type)) { error(at, `unknown trigger ${type}`); return; }
    if (stage.location && 'poi' in stage.location && !poiById.has(stage.location.poi) && !registeredPois.has(stage.location.poi)) error(at, `location POI ${stage.location.poi} unknown`);
    switch (type) {
      case 'getItem': if (!items.has(value)) error(at, `unknown item ${value}`); else if (!isProvided(value)) error(at, `item ${value} can never be obtained`); break;
      case 'hasItems':
        for (const req of value) {
          if (!items.has(req.itemId)) error(at, `unknown item ${req.itemId}`);
          else if (!isProvided(req.itemId)) error(at, `item ${req.itemId} can never be obtained`);
        }
        break;
      case 'craftItem': if (!items.has(value)) error(at, `unknown item ${value}`); break;
      case 'enemyDefeated':
        if (!enemies.has(value?.enemyId)) error(at, `unknown enemy ${value?.enemyId}`);
        else if (enemies.get(value.enemyId).randomEncounter === false) error(at, `enemy ${value.enemyId} never appears in random encounters`);
        break;
      case 'reachLocation': {
        const pos = value && 'poi' in value ? poiById.get(value.poi) : value;
        if (!pos) error(at, 'reachLocation target unknown');
        else if (!reachable.has(`${pos.x},${pos.y}`)) error(at, `reachLocation (${pos.x},${pos.y}) is not reachable`);
        break;
      }
      case 'hasFlags': for (const flag of value) if (!flagsSet.has(flag)) error(at, `flag ${flag} is never set`); break;
      case 'completeEvent': if (!events.has(value)) error(at, `unknown event ${value}`); break;
      case 'talkToNPC': case 'interactWithObject':
        if (!signals.has(value)) error(at, `signal ${value} is never emitted (Ink questTrigger, event questTrigger or enemy defeatTrigger)`);
        break;
    }
  });
  const reward = quest.finalReward ?? {};
  for (const item of reward.items ?? []) { if (!items.has(item.itemId)) error(where, `reward item ${item.itemId} unknown`); else addSource(item.itemId, `quest:${id}`); }
  if (reward.lore && !lore.has(reward.lore)) error(where, `reward lore ${reward.lore} unknown`);
  if (reward.statBoost && !ATTRIBUTES.has(reward.statBoost.stat)) error(where, `reward stat ${reward.statBoost.stat} unknown`);
  (reward.flags ?? []).forEach(flag => flagsSet.add(flag));
}
for (const [signal, where] of signals) {
  const used = [...quests.values()].some(q => q.stages.some(s => SIGNAL_TRIGGERS.has(s.trigger.type) && s.trigger.value === signal));
  if (!used) warn(where.join(','), `signal ${signal} matches no quest stage`);
}
// POIs used by quest stages must become visible at some point.
for (const [id, quest] of quests) {
  for (const stage of quest.stages) {
    const poiId = stage.location?.poi ?? stage.trigger.value?.poi;
    if (poiId && poiById.has(poiId) && !revealedPois.has(poiId)) warn(`quests.json:${id}`, `POI ${poiId} is never revealed before stage ${stage.stage}`);
  }
}

// ─── Recipes, talents, lore ─────────────────────────────────────────────────
for (const id of recipes.keys()) if (!learnableRecipes.has(id)) error(`recipes.json:${id}`, 'recipe that can never be learned');
for (const id of STARTING_RECIPES) if (!recipes.has(id)) error('characterStore.ts', `starting recipe ${id} unknown`);
for (const skill of STARTING_PROFICIENCIES) if (!SKILLS.has(skill)) error('characterStore.ts', `starting proficiency ${skill} unknown`);
for (const talent of talents) if (!SKILLS.has(talent.requiredSkill)) error(`talents.json:${talent.id}`, `unknown skill ${talent.requiredSkill}`);
for (const recipe of recipes.values()) for (const ing of recipe.ingredients) if (items.has(ing.itemId) && !isProvided(ing.itemId)) error(`recipes.json:${recipe.id}`, `ingredient ${ing.itemId} can never be obtained`);
for (const event of events.values()) for (const choice of event.choices ?? []) for (const req of choice.itemRequirements ?? []) {
  if (items.has(req.itemId) && !isProvided(req.itemId)) error(`events/${event.file}.json:${event.id}`, `required item ${req.itemId} can never be obtained`);
}
for (const [id, item] of items) {
  if (!isProvided(id)) warn(`items/${item.file}.json:${id}`, 'item that can never be obtained');
}

for (const fn of ['has_item', 'item_count']) {
  inkCalls(fn).forEach(id => { if (items.has(id) && !isProvided(id)) error('ink', `${fn}("${id}"): the item can never be obtained`); });
}
for (const [id, item] of items) {
  if (item.consumes && items.has(item.consumes.itemId) && !isProvided(item.consumes.itemId)) error(`items/${item.file}.json:${id}`, `consumes ${item.consumes.itemId} that can never be obtained`);
  if (item.ammoType && items.has(item.ammoType) && !isProvided(item.ammoType)) error(`items/${item.file}.json:${id}`, `ammo ${item.ammoType} can never be obtained`);
}

// ─── Report ─────────────────────────────────────────────────────────────────
const verbose = process.argv.includes('--verbose');
if (verbose || errors.length === 0) warnings.forEach(w => console.log(`warning  ${w}`));
errors.forEach(e => console.log(`ERROR    ${e}`));
console.log(`\n${items.size} items, ${events.size} events, ${quests.size} quests, ${recipes.size} recipes, ${enemies.size} enemies, ${pois.length} POIs`);
console.log(`${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length > 0 ? 1 : 0);
