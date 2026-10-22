/**
 * @fileoverview GameScreen - Main gameplay interface
 *
 * Layout (1920×1080):
 * - Left column: the traveller (level, XP, survival meters, conditions),
 *   equipment, attributes, moral compass.
 * - Center: the illustrated world map, under a header with place, hour and
 *   weather; the keyboard commands below it.
 * - Right column: the travel journal and the backpack.
 *
 * @module components/GameScreen
 */

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState, Stat, WeatherType, InventoryItem, IItem, JournalEntryType } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import WorldMap from './map/WorldMap';
import { useMapZoom } from './map/useMapZoom';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { WEATHER_DATA } from '../utils/weather';
import { JOURNAL_ENTRY_COLORS } from '../constants';
import AlignmentPanel from './AlignmentPanel';
import { useInteractionStore } from '../store/interactionStore';
import { useTimeStore } from '../store/timeStore';
import { DebugPanel } from './DebugPanel';
import { isNightHour, toAbsoluteMinutes } from '../utils/time';
import { gameService } from '../services/gameService';
import Icon, { IconName } from './ui/Icon';
import KeyHints from './ui/KeyHints';
import { Meter, StatMeter } from './ui/Meter';
import { Tone, harmonize, splitTag, toneColor } from '../utils/palette';

const STATUS_TONES: Record<string, Tone> = {
  FERITO: 'danger',
  MALATO: 'ember',
  AVVELENATO: 'violet',
  IPOTERMIA: 'teal',
  ESAUSTO: 'ink3',
  AFFAMATO: 'gold',
  DISIDRATATO: 'ember2',
  INFEZIONE: 'danger',
  SOVRACCARICO: 'gold',
};

/** Condition chips shown before collapsing the rest into "+N". */
const MAX_CONDITION_CHIPS = 4;

const BIOME_ICONS: Record<string, IconName> = {
  '.': 'plains', F: 'tree', '~': 'water', M: 'mountain', C: 'city', V: 'house', R: 'tent',
  S: 'flag', E: 'flag', A: 'signpost', N: 'flame', L: 'bolt', B: 'columns', H: 'leaf',
};

const WEATHER_ICONS: Record<WeatherType, IconName> = {
  [WeatherType.SERENO]: 'sun',
  [WeatherType.NUVOLOSO]: 'cloud',
  [WeatherType.PIOGGIA]: 'rain',
  [WeatherType.TEMPESTA]: 'storm',
  [WeatherType.NEBBIA]: 'fog',
};

const WEATHER_EFFECTS: Partial<Record<WeatherType, string>> = {
  [WeatherType.PIOGGIA]: 'Movimento rallentato, terreno scivoloso',
  [WeatherType.TEMPESTA]: 'Movimento rallentato, più sete, cadute',
  [WeatherType.NEBBIA]: 'Movimento rallentato',
};

const Card: React.FC<{ title?: string; icon?: IconName; aside?: React.ReactNode; className?: string; children: React.ReactNode }> = ({ title, icon, aside, className = '', children }) => (
  <section className={`surface flex flex-col px-6 py-4 ${className}`}>
    {title && (
      <header className="mb-3 flex items-center gap-2.5">
        {icon && <Icon name={icon} size={18} className="text-ink3" />}
        <h2 className="eyebrow flex-1">{title}</h2>
        {aside}
      </header>
    )}
    {children}
  </section>
);

// --- Left column -------------------------------------------------------------

const TravellerCard: React.FC = () => {
  const hp = useCharacterStore((state) => state.hp);
  const satiety = useCharacterStore((state) => state.satiety);
  const hydration = useCharacterStore((state) => state.hydration);
  const fatigue = useCharacterStore((state) => state.fatigue);
  const status = useCharacterStore((state) => state.status);
  const level = useCharacterStore((state) => state.level);
  const xp = useCharacterStore((state) => state.xp);
  const levelUpPending = useCharacterStore((state) => state.levelUpPending);
  const isOverEncumbered = useCharacterStore((state) => state.getTotalWeight() > state.getMaxCarryWeight());

  const isCritical = (stat: Stat) => stat.current / stat.max <= 0.25;
  const conditions: string[] = Array.from(status);
  if (isOverEncumbered) conditions.push('SOVRACCARICO');

  return (
    <section className="surface px-6 pb-5 pt-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Viaggiatore</div>
          <div className="title-display mt-1 text-[46px] text-ink">Ultimo</div>
        </div>
        <div className="text-right">
          <div className="eyebrow">Livello</div>
          <div className="title-display text-[46px] text-ember tnum">{level}</div>
        </div>
      </div>
      <div className="mt-3 flex h-7 items-center gap-3">
        <Meter value={xp.current} max={xp.next} tone={levelUpPending ? 'ember' : 'gold'} height={4} className="flex-1" />
        <span className={`tnum text-[16px] ${levelUpPending ? 'text-ember2' : 'text-ink3'}`}>{xp.current} / {xp.next} XP</span>
        {levelUpPending && (
          <span className="flex items-center gap-1.5 text-[16px] text-ember2 anim-breathe" title="Nuovo livello disponibile: premi L">
            <Icon name="levelUp" size={16} /> <kbd className="kbd !h-6 !min-w-[26px] !text-[14px]">L</kbd>
          </span>
        )}
      </div>

      <div className="hairline my-4" />

      <div className="flex flex-col gap-3">
        <StatMeter icon="heart" label="Salute" value={hp.current} max={hp.max} tone="sage" critical={isCritical(hp)} />
        <StatMeter icon="food" label="Sazietà" value={satiety.current} max={satiety.max} tone="ember" critical={isCritical(satiety)} />
        <StatMeter icon="drop" label="Idratazione" value={hydration.current} max={hydration.max} tone="teal" critical={isCritical(hydration)} />
        <StatMeter icon="fatigue" label="Stanchezza" value={fatigue.current} max={fatigue.max} tone={fatigue.current / fatigue.max >= 0.75 ? 'gold' : 'violet'} />
      </div>

      {/* Two rows at most: the column must never push the compass off screen. */}
      <div className="mt-4 flex max-h-[64px] min-h-[28px] flex-wrap gap-2 overflow-hidden" title={conditions.join(', ')}>
        {conditions.length > 0
          ? <>
            {conditions.slice(0, conditions.length > MAX_CONDITION_CHIPS ? MAX_CONDITION_CHIPS - 1 : MAX_CONDITION_CHIPS).map(condition => (
              <span key={condition} className="chip" style={{ color: toneColor(STATUS_TONES[condition] ?? 'gold') }}>{condition.toLowerCase()}</span>
            ))}
            {conditions.length > MAX_CONDITION_CHIPS && <span className="chip text-ink2">+{conditions.length - MAX_CONDITION_CHIPS + 1}</span>}
          </>
          : <span className="flex items-center gap-2 text-[17px] text-ink3"><Icon name="check" size={16} className="text-sage" /> Nessuna condizione</span>}
      </div>
    </section>
  );
};

const EquipmentCard: React.FC = () => {
  const inventory = useCharacterStore((state) => state.inventory);
  const equippedWeapon = useCharacterStore((state) => state.equippedWeapon);
  const equippedHead = useCharacterStore((state) => state.equippedHead);
  const equippedArmor = useCharacterStore((state) => state.equippedArmor);
  const equippedLegs = useCharacterStore((state) => state.equippedLegs);
  const itemDatabase = useItemDatabaseStore((state) => state.itemDatabase);

  const slots: { label: string; icon: IconName; index: number | null }[] = [
    { label: 'Arma', icon: 'weapon', index: equippedWeapon },
    { label: 'Testa', icon: 'helmet', index: equippedHead },
    { label: 'Torso', icon: 'torso', index: equippedArmor },
    { label: 'Gambe', icon: 'legs', index: equippedLegs },
  ];

  const describe = (item: InventoryItem | null, details: IItem | null) => {
    if (!item || !details) return null;
    return { name: details.name, durability: item.durability, broken: !!item.durability && item.durability.current <= 0 };
  };

  return (
    <Card title="Equipaggiamento" icon="shield" className="min-h-0 overflow-hidden">
      <div className="flex flex-col gap-2">
        {slots.map(slot => {
          const item = slot.index !== null ? inventory[slot.index] ?? null : null;
          const info = describe(item, item ? itemDatabase[item.itemId] ?? null : null);
          return (
            <div key={slot.label} className="flex items-center gap-3.5">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${info ? 'border-line2 bg-white/[0.04] text-ink2' : 'border-dashed border-line2 text-ink4'}`}>
                <Icon name={slot.icon} size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-cond text-[15px] font-semibold uppercase leading-none tracking-[0.18em] text-ink3">{slot.label}</div>
                <div className={`mt-0.5 truncate text-[19px] leading-tight ${info ? (info.broken ? 'text-danger' : 'text-ink') : 'text-ink4'}`}>
                  {info ? `${info.name}${info.broken ? ' · rotto' : ''}` : 'Nessuno'}
                </div>
              </div>
              {info?.durability && !info.broken && (
                <div className="w-14">
                  <Meter value={info.durability.current} max={info.durability.max} tone={info.durability.current / info.durability.max < 0.3 ? 'danger' : 'ink2'} height={4} />
                  <div className="mt-1 text-right text-[15px] text-ink3 tnum">{info.durability.current}/{info.durability.max}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const AttributesCard: React.FC = () => {
  const attributes = useCharacterStore((state) => state.attributes);
  const getAttributeModifier = useCharacterStore((state) => state.getAttributeModifier);
  const keys = ['for', 'des', 'cos', 'int', 'sag', 'car'] as const;
  return (
    <Card title="Attributi" icon="user">
      <div className="grid grid-cols-3 gap-2">
        {keys.map(key => {
          const mod = getAttributeModifier(key);
          return (
            <div key={key} className="flex items-baseline gap-2 rounded-xl border border-line bg-white/[0.025] px-3 py-1.5">
              <div className="font-cond text-[15px] font-semibold uppercase tracking-[0.2em] text-ink3">{key}</div>
              <div className="flex flex-1 items-baseline justify-between">
                <span className="tnum text-[24px] font-semibold text-ink">{attributes[key]}</span>
                <span className={`tnum text-[16px] ${mod > 0 ? 'text-sage' : mod < 0 ? 'text-danger' : 'text-ink3'}`}>{mod >= 0 ? '+' : ''}{mod}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// --- Map header --------------------------------------------------------------

const PlaceHeader: React.FC = () => {
  const playerPos = useGameStore((state) => state.playerPos);
  const getTileInfo = useGameStore((state) => state.getTileInfo);
  const lightUntil = useGameStore((state) => state.lightUntil);
  const repelUntil = useGameStore((state) => state.repelUntil);
  const gameTime = useTimeStore((state) => state.gameTime);
  const weather = useTimeStore((state) => state.weather);

  const tileInfo = getTileInfo(playerPos.x, playerPos.y);
  const time = `${String(gameTime.hour).padStart(2, '0')}:${String(gameTime.minute).padStart(2, '0')}`;
  const isNight = isNightHour(gameTime.hour);
  const now = toAbsoluteMinutes(gameTime);
  const lightHours = Math.ceil((lightUntil - now) / 60);
  const repelHours = Math.ceil((repelUntil - now) / 60);
  const effects = [
    lightHours > 0 ? { icon: 'flame' as IconName, text: `Luce ${lightHours}h`, tone: 'ember2' as Tone } : null,
    repelHours > 0 ? { icon: 'shield' as IconName, text: `Dissuasore ${repelHours}h`, tone: 'sage' as Tone } : null,
    isNight && lightHours <= 0 ? { icon: 'warning' as IconName, text: 'Buio: rischio di inciampare', tone: 'gold' as Tone } : null,
  ].filter((e): e is { icon: IconName; text: string; tone: Tone } => e !== null);
  const weatherEffect = WEATHER_EFFECTS[weather.type];

  return (
    <header className="flex h-[78px] flex-shrink-0 items-center gap-6 px-6">
      <div className="flex flex-shrink-0 items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-line2 bg-white/[0.04] text-ember2">
          <Icon name={BIOME_ICONS[tileInfo.char] ?? 'pin'} size={24} />
        </div>
        <div className="min-w-0">
          <div className="title-display whitespace-nowrap text-[34px] text-ink">{tileInfo.name}</div>
          <div className="tnum font-cond text-[15px] font-semibold tracking-[0.18em] text-ink3">{playerPos.x} · {playerPos.y}</div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-6">
        {effects.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {effects.map(effect => (
              <span key={effect.text} className="flex items-center gap-1.5 whitespace-nowrap text-[15px]" style={{ color: toneColor(effect.tone) }}>
                <Icon name={effect.icon} size={16} /> {effect.text}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <Icon name={WEATHER_ICONS[weather.type]} size={28} className="text-ink2" />
          <div>
            <div className="text-[20px] leading-tight text-ink">{WEATHER_DATA[weather.type].name}</div>
            <div className="text-[15px] leading-tight text-ink3">{weatherEffect ?? 'Nessun effetto'}</div>
          </div>
        </div>
        <div className="h-10 w-px bg-line2" />
        <div className="flex items-center gap-3">
          <Icon name={isNight ? 'moon' : 'clock'} size={26} className={isNight ? 'text-lena' : 'text-ink2'} />
          <div>
            <div className="tnum text-[24px] font-semibold leading-tight text-ink">{time}</div>
            <div className="text-[15px] leading-tight text-ink3">Giorno {gameTime.day}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Right column ------------------------------------------------------------

/**
 * Stable keys for journal entries: the store keeps old entries by reference,
 * so each object gets an id the first time it is drawn and new entries always
 * mount (and fade in), even when the journal is full at 100.
 */
const journalIds = new WeakMap<object, number>();
let nextJournalId = 0;
const journalKey = (entry: object) => {
  let id = journalIds.get(entry);
  if (id === undefined) {
    id = nextJournalId++;
    journalIds.set(entry, id);
  }
  return id;
};

const JournalCard: React.FC = () => {
  const journal = useGameStore((state) => state.journal);
  const journalRef = useRef<HTMLDivElement>(null);

  // The newest entry is on top.
  useEffect(() => {
    if (journalRef.current) journalRef.current.scrollTop = 0;
  }, [journal]);

  return (
    <Card title="Diario di viaggio" icon="book" className="min-h-0 flex-1 !pb-2">
      <div ref={journalRef} className="scroll-y fade-bottom -mx-2 min-h-0 flex-1 px-2">
        {journal.length > 0 ? (
          journal.map((entry, index) => {
            const { tag, body } = splitTag(entry.text);
            const color = entry.type === JournalEntryType.NARRATIVE && !entry.color
              ? toneColor('ink')
              : harmonize(entry.color || JOURNAL_ENTRY_COLORS[entry.type]);
            return (
              <div
                key={journalKey(entry)}
                className={`relative border-l pb-3.5 pl-4 ${index === 0 ? 'anim-fade-up' : ''}`}
                style={{ borderColor: 'var(--line-2)', opacity: Math.max(0.42, 1 - index * 0.045) }}
              >
                <span className="absolute -left-[4.5px] top-[9px] h-2 w-2 rounded-full" style={{ background: color }} />
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="tnum font-cond text-[15px] font-semibold tracking-[0.12em] text-ink3">
                    {String(entry.time.hour).padStart(2, '0')}:{String(entry.time.minute).padStart(2, '0')}
                  </span>
                  {tag && <span className="font-cond text-[14px] font-semibold uppercase tracking-[0.2em]" style={{ color }}>{tag}</span>}
                </div>
                <p className="font-serif text-[18.5px] leading-[1.5]" style={{ color }}>{body}</p>
              </div>
            );
          })
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="prose-story text-[24px] italic text-ink2">Il tuo viaggio inizierà presto...</p>
            <p className="mt-2 text-[17px] text-ink3">Le tue avventure saranno registrate qui</p>
          </div>
        )}
      </div>
    </Card>
  );
};

const BackpackCard: React.FC = () => {
  const inventory = useCharacterStore((state) => state.inventory);
  const equippedWeaponIndex = useCharacterStore((state) => state.equippedWeapon);
  const equippedHeadIndex = useCharacterStore((state) => state.equippedHead);
  const equippedArmorIndex = useCharacterStore((state) => state.equippedArmor);
  const equippedLegsIndex = useCharacterStore((state) => state.equippedLegs);
  const itemDatabase = useItemDatabaseStore((state) => state.itemDatabase);
  const isLoaded = useItemDatabaseStore((state) => state.isLoaded);
  const totalWeight = useCharacterStore((state) => state.getTotalWeight());
  const maxCarryWeight = useCharacterStore((state) => state.getMaxCarryWeight());
  const isOverEncumbered = totalWeight > maxCarryWeight;
  const equipped = new Set([equippedWeaponIndex, equippedHeadIndex, equippedArmorIndex, equippedLegsIndex]);

  return (
    <Card
      title="Zaino"
      icon="backpack"
      className="h-[360px] flex-shrink-0 !pb-3"
      aside={<span className={`tnum text-[16px] ${isOverEncumbered ? 'text-danger anim-breathe' : 'text-ink3'}`}>{totalWeight.toFixed(1)} / {maxCarryWeight.toFixed(1)} kg</span>}
    >
      <Meter value={totalWeight} max={maxCarryWeight} tone={isOverEncumbered ? 'danger' : totalWeight / maxCarryWeight >= 0.8 ? 'gold' : 'ink2'} height={3} className="-mt-1 mb-3" />
      <div className="scroll-y fade-bottom min-h-0 flex-1">
        {isLoaded && inventory.length > 0 ? (
          <ul className="flex flex-col">
            {inventory.map((invItem, index) => {
              const itemDetails = itemDatabase[invItem.itemId];
              if (!itemDetails) return null;
              const broken = !!invItem.durability && invItem.durability.current <= 0;
              return (
                <li key={index} className="flex items-center gap-3 py-[5px] text-[18px]">
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: harmonize(itemDetails.color) }} />
                  <span className={`min-w-0 flex-1 truncate ${broken ? 'text-danger' : 'text-ink2'}`}>{itemDetails.name}</span>
                  {equipped.has(index) && <span className="rounded border border-ember/50 px-1.5 font-cond text-[14px] font-semibold tracking-wider text-ember">E</span>}
                  {invItem.durability && <span className="tnum text-[15px] text-ink3">{broken ? 'rotto' : `${invItem.durability.current}/${invItem.durability.max}`}</span>}
                  {invItem.quantity > 1 && <span className="tnum text-[16px] text-ink3">×{invItem.quantity}</span>}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-8 text-center text-[18px] italic text-ink4">Lo zaino è vuoto</div>
        )}
      </div>
    </Card>
  );
};

/**
 * GameScreen - Main gameplay interface.
 *
 * Keyboard: WASD/arrows move, I backpack, J quest log, R quick rest,
 * F active search, L level up, + and - zoom the map, ESC pause.
 * Input is ignored while the inventory or the refuge menu is open.
 */
const GameScreen: React.FC = () => {
  const { setGameState, performQuickRest, performActiveSearch, openLevelUpScreen } = useGameStore();
  const { isInventoryOpen, isInRefuge, toggleInventory } = useInteractionStore();
  const gameState = useGameStore((state) => state.gameState);
  const levelUpPending = useCharacterStore((state) => state.levelUpPending);
  const mapZoom = useMapZoom();
  const changeZoom = mapZoom.change;

  const handleOpenPauseMenu = useCallback(() => {
    setGameState(GameState.PAUSE_MENU);
  }, [setGameState]);

  const handleMove = useCallback((dx: number, dy: number) => {
    if (!isInventoryOpen && !isInRefuge) {
      gameService.movePlayer(dx, dy);
    }
  }, [isInventoryOpen, isInRefuge]);

  const handleQuickRest = useCallback(() => {
    if (!isInventoryOpen && !isInRefuge) {
      performQuickRest();
    }
  }, [isInventoryOpen, isInRefuge, performQuickRest]);

  const handleActiveSearch = useCallback(() => {
    if (!isInventoryOpen && !isInRefuge) {
      performActiveSearch();
    }
  }, [isInventoryOpen, isInRefuge, performActiveSearch]);

  const handleOpenQuestLog = useCallback(() => {
    if (!isInventoryOpen && !isInRefuge) {
      setGameState(GameState.QUEST_LOG);
    }
  }, [isInventoryOpen, isInRefuge, setGameState]);

  const keyHandlerMap = useMemo(() => {
    // Questo gestore dovrebbe essere attivo solo nello stato di gioco principale
    // per evitare che gli input trapelino in modali come Combattimento, Eventi, ecc.
    if (gameState !== GameState.IN_GAME) {
      return {};
    }

    const map: Record<string, () => void> = {
      ArrowUp: () => handleMove(0, -1),
      w: () => handleMove(0, -1),
      ArrowDown: () => handleMove(0, 1),
      s: () => handleMove(0, 1),
      ArrowLeft: () => handleMove(-1, 0),
      a: () => handleMove(-1, 0),
      ArrowRight: () => handleMove(1, 0),
      d: () => handleMove(1, 0),
    };

    // v2.0.14: action keys are registered ONLY when no overlay is open.
    // With the inventory open, both GameScreen and InventoryScreen used to
    // handle 'I' on the same keydown: toggleInventory ran twice and the
    // inventory could never be closed with I (and L opened LevelUp from it).
    if (!isInventoryOpen && !isInRefuge) {
      map['i'] = toggleInventory;
      map['I'] = toggleInventory;
      map['j'] = handleOpenQuestLog;
      map['J'] = handleOpenQuestLog;
      map['r'] = handleQuickRest;
      map['R'] = handleQuickRest;
      map['f'] = handleActiveSearch;
      map['F'] = handleActiveSearch;
      map['l'] = openLevelUpScreen;
      map['L'] = openLevelUpScreen;
      map['Escape'] = handleOpenPauseMenu;
      // Map zoom: + closer, - further (with or without shift).
      map['+'] = () => changeZoom(-1);
      map['='] = () => changeZoom(-1);
      map['-'] = () => changeZoom(1);
      map['_'] = () => changeZoom(1);
    }
    return map;
  }, [gameState, toggleInventory, handleOpenQuestLog, handleQuickRest, handleActiveSearch, handleMove, isInventoryOpen, isInRefuge, handleOpenPauseMenu, openLevelUpScreen, changeZoom]);

  useKeyboardInput(keyHandlerMap);

  return (
    <>
      {import.meta.env.DEV && <DebugPanel />}
      <div className="hud flex h-full w-full gap-5 p-6 text-ink">
        {/* Left column: the traveller. */}
        <div className="flex min-h-0 w-[400px] flex-shrink-0 flex-col gap-3">
          <TravellerCard />
          <EquipmentCard />
          <AttributesCard />
          <AlignmentPanel />
        </div>

        {/* Center: the world. */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <section className="surface flex min-h-0 flex-1 flex-col overflow-hidden">
            <PlaceHeader />
            <div className="relative min-h-0 flex-1 border-t border-line">
              <WorldMap zoom={mapZoom.zoom} paused={gameState !== GameState.IN_GAME || isInventoryOpen || isInRefuge} />
            </div>
          </section>
          <div className="surface flex h-[64px] flex-shrink-0 items-center justify-between gap-4 px-6 !rounded-2xl">
            <KeyHints
              className="!gap-x-4"
              align="start"
              hints={[
                { keys: ['WASD'], label: 'Cammina' },
                { keys: ['I'], label: 'Zaino' },
                { keys: ['J'], label: 'Missioni' },
                { keys: ['R'], label: 'Riposo' },
                { keys: ['F'], label: 'Cerca' },
                { keys: ['L'], label: 'Livello', muted: !levelUpPending, active: levelUpPending },
                { keys: ['ESC'], label: 'Menu' },
              ]}
            />
            <div className="flex flex-shrink-0 items-center gap-1.5 text-ink2">
              <button type="button" tabIndex={-1} className="kbd hover:border-line3 disabled:opacity-35" onClick={() => changeZoom(1)} disabled={!mapZoom.canZoomOut} title="Allontana la mappa [-]">−</button>
              <Icon name="search" size={20} className="mx-1 text-ink3" />
              <button type="button" tabIndex={-1} className="kbd hover:border-line3 disabled:opacity-35" onClick={() => changeZoom(-1)} disabled={!mapZoom.canZoomIn} title="Avvicina la mappa [+]">+</button>
            </div>
          </div>
        </div>

        {/* Right column: what happened, what we carry. */}
        <div className="flex w-[440px] flex-shrink-0 flex-col gap-4">
          <JournalCard />
          <BackpackCard />
        </div>
      </div>
    </>
  );
};

export default GameScreen;
