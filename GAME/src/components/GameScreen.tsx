/**
 * @fileoverview GameScreen - Main gameplay interface
 *
 * @description The primary gameplay screen that displays:
 * - Canvas-based world map with player position
 * - Survival stats panel (HP, satiety, hydration, fatigue, status)
 * - Inventory panel with weight tracking
 * - Equipment panel (weapon, head, chest, legs)
 * - Stats panel (level, XP, attributes)
 * - Alignment panel (Lena/Elian moral compass)
 * - Travel journal (chronological log with color coding)
 * - Commands panel (keyboard shortcuts)
 *
 * Layout:
 * - Left Column (25%): Survival, Inventory, Commands
 * - Center (50%): World Map (Canvas)
 * - Right Column (25%): Info, Equipment, Stats, Alignment
 * - Bottom (25%): Travel Journal
 *
 * @module components/GameScreen
 */

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState, Stat, PlayerStatusCondition, WeatherType, InventoryItem, IItem } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import CanvasMap from './CanvasMap';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { WEATHER_DATA } from '../utils/weather';
import { JOURNAL_ENTRY_COLORS } from '../constants';
import Panel from './Panel';
import AlignmentPanel from './AlignmentPanel';
import { useInteractionStore } from '../store/interactionStore';
import { useTimeStore } from '../store/timeStore';
import { DebugPanel } from './DebugPanel';
import { CompassRose } from './CompassRose';

/**
 * Color mapping for player status conditions.
 * Used to visually distinguish different negative effects.
 * @constant
 */
const STATUS_COLORS: Record<PlayerStatusCondition, string> = {
  'FERITO': '#ef4444', // red-500
  'MALATO': '#f97316', // orange-500
  'AVVELENATO': '#a855f7', // purple-500
  'IPOTERMIA': '#06b6d4', // cyan-500
  'ESAUSTO': '#78716c', // stone-500
  'AFFAMATO': '#eab308', // yellow-500
  'DISIDRATATO': '#f59e0b', // amber-500
  'INFEZIONE': '#dc2626', // red-600
};

// --- Left Column Panels ---

/**
 * SurvivalPanel - Displays critical survival statistics
 *
 * @component
 * @description Shows HP, satiety, hydration, fatigue, and active status conditions.
 * Provides visual warnings for critical values and encumbrance.
 *
 * Visual Feedback:
 * - Critical stats (≤25%): Red text + pulse animation
 * - High fatigue (≥75%): Yellow text
 * - Status conditions: Color-coded by severity
 * - Encumbrance: Added as pseudo-status "SOVRACCARICO"
 *
 * Critical Thresholds:
 * - HP ≤25%: Death risk, pulse warning
 * - Satiety ≤25%: Starvation risk
 * - Hydration ≤25%: Dehydration risk
 * - Fatigue ≥75%: ESAUSTO status imminent
 *
 * @returns {JSX.Element} Survival stats panel
 */
const SurvivalPanel: React.FC = () => {
  const hp = useCharacterStore((state) => state.hp);
  const satiety = useCharacterStore((state) => state.satiety);
  const hydration = useCharacterStore((state) => state.hydration);
  const fatigue = useCharacterStore((state) => state.fatigue);
  const status = useCharacterStore((state) => state.status);

  const isCritical = (stat: Stat) => stat.current / stat.max <= 0.25;
  const isHigh = (stat: Stat) => stat.current / stat.max >= 0.75;

  const totalWeight = useCharacterStore.getState().getTotalWeight();
  const maxCarryWeight = useCharacterStore.getState().getMaxCarryWeight();
  const isOverEncumbered = totalWeight > maxCarryWeight;

  const allStatuses = Array.from(status);
  if (isOverEncumbered) {
    allStatuses.push('SOVRACCARICO' as PlayerStatusCondition);
  }

  return (
    <Panel title="SOPRAVVIVENZA">
      <div className="space-y-0.5 text-sm">
        <div className={isCritical(hp) ? 'text-[var(--text-danger)] animate-pulse' : ''}>HP: {Math.floor(hp.current)}/{hp.max}</div>
        <div className={isCritical(satiety) ? 'text-[var(--text-danger)] animate-pulse' : ''}>Sazietà: {Math.floor(satiety.current)}/{satiety.max}</div>
        <div className={isCritical(hydration) ? 'text-[var(--text-danger)] animate-pulse' : ''}>Idratazione: {Math.floor(hydration.current)}/{hydration.max}</div>
        <div className={isHigh(fatigue) ? 'text-[var(--text-accent)]' : ''}>Stanchezza: {Math.floor(fatigue.current)}/{fatigue.max}</div>
        <div>
          Status:
          {allStatuses.length > 0 ? (
            allStatuses.map((s: PlayerStatusCondition, index) => (
              <React.Fragment key={s}>
                <span style={{ color: STATUS_COLORS[s] || '#f59e0b' }}>
                  {` ${s}`}
                </span>
                {index < allStatuses.length - 1 ? ',' : ''}
              </React.Fragment>
            ))
          ) : (
            ' Normale'
          )}
        </div>
      </div>
    </Panel>
  );
};

/**
 * InventoryPanel - Compact inventory display with weight tracking
 *
 * @component
 * @description Shows all inventory items with durability, quantity, and equipped status.
 * Displays weight with color-coded warnings for encumbrance.
 *
 * Item Display Format:
 * - Name + durability (if applicable): "Knife (45/50)"
 * - Quantity (if >1): "x3"
 * - Equipped marker: "(E)"
 * - Broken items: "[ROTTO]"
 * - Color: Item rarity color from itemDatabase
 *
 * Weight Display:
 * - Normal: White text
 * - Overencumbered: Red text + pulse animation
 * - Format: "15.3 / 19.0 kg"
 *
 * @remarks
 * - Scrollable with hidden scrollbar
 * - Updates in real-time with inventory changes
 * - Click [I] to open full inventory screen
 *
 * @returns {JSX.Element} Inventory panel with weight indicator
 */
const InventoryPanel: React.FC = () => {
  const inventory = useCharacterStore((state) => state.inventory);
  const equippedWeaponIndex = useCharacterStore((state) => state.equippedWeapon);
  const equippedHeadIndex = useCharacterStore((state) => state.equippedHead);
  const equippedArmorIndex = useCharacterStore((state) => state.equippedArmor);
  const equippedLegsIndex = useCharacterStore((state) => state.equippedLegs);
  const itemDatabase = useItemDatabaseStore((state) => state.itemDatabase);
  const isLoaded = useItemDatabaseStore((state) => state.isLoaded);

  const totalWeight = useCharacterStore.getState().getTotalWeight();
  const maxCarryWeight = useCharacterStore.getState().getMaxCarryWeight();
  const isOverEncumbered = totalWeight > maxCarryWeight;

  return (
    <Panel title="INVENTARIO" className="flex-grow">
      <div className={`flex justify-between text-sm mb-0.5 px-1 ${isOverEncumbered ? 'text-[var(--text-danger)] animate-pulse' : ''}`}>
        <span>Peso: {totalWeight.toFixed(1)} / {maxCarryWeight.toFixed(1)}</span>
      </div>
      <div className="border border-[var(--border-primary)] p-1 h-full overflow-y-auto text-sm" style={{ scrollbarWidth: 'none' }}>
        {isLoaded && inventory.length > 0 ? (
          <ul className="space-y-0.5">
            {inventory.map((invItem, index) => {
              const itemDetails = itemDatabase[invItem.itemId];
              if (!itemDetails) return null;

              const isEquipped = index === equippedWeaponIndex ||
                index === equippedHeadIndex ||
                index === equippedArmorIndex ||
                index === equippedLegsIndex;
              let displayName = itemDetails.name;

              if (invItem.durability) {
                if (invItem.durability.current <= 0) {
                  displayName += ' [ROTTO]';
                } else {
                  displayName += ` (${invItem.durability.current}/${invItem.durability.max})`;
                }
              }
              if (invItem.quantity > 1) {
                displayName += ` x${invItem.quantity}`;
              }
              if (isEquipped) {
                displayName += ' (E)';
              }

              return (
                <li key={`${invItem.itemId}-${index}`} style={{ color: itemDetails.color }}>
                  {displayName}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-[var(--text-primary)]/50">-- Vuoto --</div>
        )}
      </div>
    </Panel>
  );
};

/**
 * CommandsPanel - Keyboard shortcut reference
 *
 * @component
 * @description Displays all available keyboard commands for quick reference.
 *
 * Commands Listed:
 * - [WASD/Arrows]: Movement/Navigation
 * - [I]: Inventory (full screen)
 * - [J]: Missioni (quest log)
 * - [R]: Riposo Breve (quick rest, 24h cooldown)
 * - [F]: Cerca Risorse (active search, 30min)
 * - [L]: Level Up (when available)
 * - [ESC]: Menu/Back
 *
 * @remarks
 * - Always visible during gameplay
 * - Commands context-sensitive (some disabled in menus)
 * - Compact layout (2 columns)
 *
 * @returns {JSX.Element} Commands reference panel
 */
const CommandsPanel: React.FC = () => (
  <Panel title="COMANDI">
    <div className="space-y-0.5 text-xs">
      <div className="flex justify-between"><span>[WASD/↑↓←→]</span> <span>Movimento/Navigazione</span></div>
      <div className="flex justify-between"><span>[I]</span> <span>Inventario</span></div>
      <div className="flex justify-between"><span>[J]</span> <span>Missioni</span></div>
      <div className="flex justify-between"><span>[R]</span> <span>Riposo Breve</span></div>
      <div className="flex justify-between"><span>[F]</span> <span>Cerca Risorse</span></div>
      <div className="flex justify-between"><span>[L]</span> <span>Level Up</span></div>
      <div className="flex justify-between"><span>[ESC]</span> <span>Menu/Indietro</span></div>
    </div>
  </Panel>
);


// --- Right Column Panels ---

/**
 * InfoPanel - Location, time, and weather information
 *
 * @component
 * @description Displays current position, biome, time, day, and weather with effects.
 *
 * Information Shown:
 * - Position: (x, y) coordinates
 * - Luogo: Biome name (Pianura, Foresta, etc.)
 * - Time: HH:MM format with day number
 * - Weather: Current condition with color
 * - Effects: Weather impact on gameplay
 *
 * Weather Effects:
 * - Pioggia: Movement slowed
 * - Tempesta: Movement slowed + increased consumption
 * - Nebbia: Reduced visibility
 * - Sereno/Nuvoloso: No effects
 *
 * Visual Indicators:
 * - Night time (20:00-6:00): Cyan text
 * - Weather: Color-coded by severity
 *
 * @remarks
 * - Updates every game tick
 * - Weather changes dynamically
 * - Night indicator helps plan refuge stops
 *
 * @returns {JSX.Element} Info panel with location/time/weather
 */
const InfoPanel: React.FC = () => {
  const playerPos = useGameStore((state) => state.playerPos);
  const gameTime = useTimeStore((state) => state.gameTime);
  const weather = useTimeStore((state) => state.weather);
  const getTileInfo = useGameStore((state) => state.getTileInfo);

  const tileInfo = getTileInfo(playerPos.x, playerPos.y);
  const formattedTime = `${String(gameTime.hour).padStart(2, '0')}:${String(gameTime.minute).padStart(2, '0')}`;
  const weatherInfo = WEATHER_DATA[weather.type];
  const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

  const getWeatherEffects = () => {
    switch (weather.type) {
      case WeatherType.PIOGGIA:
        return { text: "Movimento rallentato", color: 'var(--text-accent)' };
      case WeatherType.TEMPESTA:
        return { text: "Mov. rallentato, +consumo", color: 'var(--text-danger)' };
      case WeatherType.NEBBIA:
        return { text: "Visibilità ridotta", color: 'var(--text-secondary)' };
      default:
        return { text: "Nessun effetto", color: 'var(--text-primary)' };
    }
  };
  const weatherEffects = getWeatherEffects();

  return (
    <Panel title="INFORMAZIONI">
      <div className="space-y-1 text-sm">
        <div>
          <div className="flex justify-between">
            <span>Posizione:</span>
            <span>({playerPos.x}, {playerPos.y})</span>
          </div>
          <div className="flex justify-between">
            <span>Luogo:</span>
            <span>{tileInfo.name}</span>
          </div>
          <div className={`flex justify-between ${isNight ? 'text-cyan-400' : ''}`}>
            <span>{formattedTime}</span>
            <span>Giorno {gameTime.day}</span>
          </div>
          <div className="border-t border-[var(--border-primary)] my-0.5"></div>
          <div className="flex justify-between items-center">
            <span className={weatherInfo.color}>* {weatherInfo.name}</span>
            <div className="text-right">
            </div>
          </div>
          <div style={{ color: weatherEffects.color }}>Effetti: {weatherEffects.text}</div>
        </div>
      </div>
    </Panel>
  );
};

/**
 * EquipmentPanel - Currently equipped items display
 *
 * @component
 * @description Shows all 4 equipment slots with durability status.
 *
 * Equipment Slots:
 * - ARMA: Weapon (melee/ranged)
 * - TESTA: Head armor (helmet)
 * - TORSO: Chest armor (body)
 * - GAMBE: Leg armor (pants/boots)
 *
 * Display Format:
 * - Item name + durability: "Combat Knife (45/50)"
 * - Broken items: "[ROTTO]" suffix
 * - Empty slots: "Nessuna"
 *
 * @remarks
 * - Durability shown for all equipment
 * - Broken items (0 durability) cannot be equipped
 * - Equipment affects AC and combat effectiveness
 * - Manage via Inventory screen [I]
 *
 * @returns {JSX.Element} Equipment panel with 4 slots
 */
const EquipmentPanel: React.FC = () => {
  const inventory = useCharacterStore((state) => state.inventory);
  const equippedWeaponIndex = useCharacterStore((state) => state.equippedWeapon);
  const equippedHeadIndex = useCharacterStore((state) => state.equippedHead);
  const equippedArmorIndex = useCharacterStore((state) => state.equippedArmor);
  const equippedLegsIndex = useCharacterStore((state) => state.equippedLegs);
  const itemDatabase = useItemDatabaseStore((state) => state.itemDatabase);

  const weaponItem = equippedWeaponIndex !== null ? inventory[equippedWeaponIndex] : null;
  const headItem = equippedHeadIndex !== null ? inventory[equippedHeadIndex] : null;
  const chestItem = equippedArmorIndex !== null ? inventory[equippedArmorIndex] : null;
  const legsItem = equippedLegsIndex !== null ? inventory[equippedLegsIndex] : null;

  const weaponDetails = weaponItem ? itemDatabase[weaponItem.itemId] : null;
  const headDetails = headItem ? itemDatabase[headItem.itemId] : null;
  const chestDetails = chestItem ? itemDatabase[chestItem.itemId] : null;
  const legsDetails = legsItem ? itemDatabase[legsItem.itemId] : null;

  const getDisplayName = (item: InventoryItem | null, details: IItem | null): string => {
    if (!item || !details) return 'Nessuna';
    let name = details.name;
    if (item.durability) {
      if (item.durability.current <= 0) {
        name += ' [ROTTO]';
      } else {
        name += ` (${item.durability.current}/${item.durability.max})`;
      }
    }
    return name;
  };

  return (
    <Panel title="EQUIPAGGIAMENTO">
      <div className="space-y-0.5 text-sm">
        <div>ARMA: {getDisplayName(weaponItem, weaponDetails)}</div>
        <div className="border-t border-[var(--border-primary)] my-0.5"></div>
        <div>TESTA: {getDisplayName(headItem, headDetails)}</div>
        <div>TORSO: {getDisplayName(chestItem, chestDetails)}</div>
        <div>GAMBE: {getDisplayName(legsItem, legsDetails)}</div>
      </div>
    </Panel>
  );
};

/**
 * StatsPanel - Character level and attributes
 *
 * @component
 * @description Displays level, XP progress, and all 6 D&D-style attributes with modifiers.
 *
 * Stats Shown:
 * - Level: Current character level (1-20)
 * - XP: Current/Next with level up indicator (*)
 * - Attributes: FOR, DES, COS, INT, SAG, CAR
 * - Modifiers: Calculated as floor((value - 10) / 2)
 *
 * Attribute Display Format:
 * - "FOR: 14 (+2)" - Value + modifier
 * - Grid layout (2 columns, 3 rows)
 *
 * Level Up Indicator:
 * - Yellow asterisk (*) when levelUpPending
 * - Pulse animation to attract attention
 * - Press [L] to open level up screen
 *
 * @remarks
 * - Modifiers affect all skill checks
 * - CON modifier affects max HP
 * - DEX modifier affects AC
 * - Attributes increase on level up
 *
 * @returns {JSX.Element} Stats panel with attributes
 */
const StatsPanel: React.FC = () => {
  const level = useCharacterStore((state) => state.level);
  const xp = useCharacterStore((state) => state.xp);
  const attributes = useCharacterStore((state) => state.attributes);
  const getAttributeModifier = useCharacterStore((state) => state.getAttributeModifier);
  const levelUpPending = useCharacterStore((state) => state.levelUpPending);

  const renderModifier = (attr: 'for' | 'des' | 'cos' | 'int' | 'sag' | 'car') => {
    const mod = getAttributeModifier(attr);
    return `(${mod >= 0 ? '+' : ''}${mod})`;
  };

  return (
    <Panel title="STATISTICHE">
      <div className="space-y-1 text-sm">
        <div>Livello: {level}</div>
        <div>
          XP: {xp.current} / {xp.next}
          {levelUpPending && <span className="text-[var(--text-accent)] animate-yellow-flash ml-2">*</span>}
        </div>
        <div className="border-t border-[var(--border-primary)] my-0.5"></div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <div className="flex justify-between"><span>FOR:</span><span>{attributes.for} {renderModifier('for')}</span></div>
          <div className="flex justify-between"><span>DES:</span><span>{attributes.des} {renderModifier('des')}</span></div>
          <div className="flex justify-between"><span>COS:</span><span>{attributes.cos} {renderModifier('cos')}</span></div>
          <div className="flex justify-between"><span>INT:</span><span>{attributes.int} {renderModifier('int')}</span></div>
          <div className="flex justify-between"><span>SAG:</span><span>{attributes.sag} {renderModifier('sag')}</span></div>
          <div className="flex justify-between"><span>CAR:</span><span>{attributes.car} {renderModifier('car')}</span></div>
        </div>
      </div>
    </Panel>
  );
};


// --- Bottom Panel ---

/**
 * TravelJournalPanel - Chronological event log
 *
 * @component
 * @description Displays the last 100 journal entries with timestamps and color coding.
 *
 * Journal Entry Types (12):
 * - GAME_START: Green (#00ff00)
 * - SKILL_CHECK_SUCCESS: Green (#60BF77)
 * - SKILL_CHECK_FAILURE: Orange (#ff8c00)
 * - ACTION_FAILURE: Yellow (#ffff00)
 * - NARRATIVE: Gray (#d1d5db)
 * - ITEM_ACQUIRED: Cyan (#38bdf8)
 * - SYSTEM_ERROR: Red (#ff0000)
 * - SYSTEM_WARNING: Amber (#fbbf24)
 * - SYSTEM_MESSAGE: Neutral (#a3a3a3)
 * - COMBAT: Red (#ef4444)
 * - XP_GAIN: Gold (#f59e0b)
 * - EVENT: Violet (#a78bfa)
 * - TROPHY_UNLOCKED: Yellow (#eab308)
 *
 * Features:
 * - Auto-scroll to top (latest entry)
 * - Timestamp format: [HH:MM]
 * - Color-coded by entry type
 * - Max 100 entries (FIFO)
 * - Hidden scrollbar for clean look
 *
 * @remarks
 * - Critical for understanding game state
 * - All actions logged with context
 * - Skill checks show full calculation
 * - Combat shows damage/hit/miss details
 *
 * @returns {JSX.Element} Travel journal panel
 */
const TravelJournalPanel: React.FC = () => {
  const journal = useGameStore((state) => state.journal);
  const journalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the top (to show the latest message)
  useEffect(() => {
    if (journalRef.current) {
      journalRef.current.scrollTop = 0;
    }
  }, [journal]);

  return (
    <Panel title="DIARIO DI VIAGGIO" className="h-full">
      <div ref={journalRef} className="h-full overflow-y-auto space-y-0.5 text-sm text-[var(--text-secondary)]" style={{ scrollbarWidth: 'none' }}>
        {journal.length > 0 ? (
          journal.map((entry, index) => (
            <div key={index}>
              <span className="text-[var(--text-primary)]/60 mr-1 text-xs">
                [{String(entry.time.hour).padStart(2, '0')}:{String(entry.time.minute).padStart(2, '0')}]
              </span>
              <span style={{ color: entry.color || JOURNAL_ENTRY_COLORS[entry.type] }}>
                {entry.text}
              </span>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-primary)]/60 text-center">
            <p className="text-2xl">Il tuo viaggio inizierà presto...</p>
            <p className="text-base">Le tue avventure saranno registrate qui</p>
          </div>
        )}
      </div>
    </Panel>
  );
};

/**
 * GameScreen - Main gameplay interface
 *
 * @component
 * @description The core gameplay screen that orchestrates all UI panels and handles player input.
 *
 * Layout Structure:
 * ```
 * ┌─────────────┬──────────────────────┬─────────────┐
 * │  Survival   │                      │    Info     │
 * │             │                      │             │
 * │  Inventory  │     World Map        │  Equipment  │
 * │             │     (Canvas)         │             │
 * │  Commands   │                      │    Stats    │
 * │             │                      │  Alignment  │
 * ├─────────────┴──────────────────────┴─────────────┤
 * │              Travel Journal (Log)                │
 * └──────────────────────────────────────────────────┘
 * ```
 *
 * Keyboard Controls:
 * - [WASD/Arrows]: Move player on map
 * - [I]: Toggle inventory (full screen)
 * - [J]: Open quest log
 * - [R]: Quick rest (heal 20 HP, -15 fatigue, 24h cooldown)
 * - [F]: Active search (find resources, 30min, Survival DC 10)
 * - [L]: Level up (when XP threshold reached)
 * - [ESC]: Pause menu
 *
 * State Management:
 * - Delegates to gameService for complex logic
 * - Reads from multiple stores (game, character, time, interaction)
 * - Input disabled when inventory/refuge open
 *
 * @remarks
 * - Only active when gameState === IN_GAME
 * - Overlays (inventory, refuge, crafting) rendered on top
 * - All panels update reactively via Zustand
 * - Canvas map uses requestAnimationFrame for smooth rendering
 *
 * @see gameService.movePlayer for movement logic
 * @see InventoryScreen for full inventory interface
 * @see RefugeScreen for refuge menu
 *
 * @returns {JSX.Element} Complete gameplay interface
 */

import { gameService } from '../services/gameService';

const GameScreen: React.FC = () => {
  const { setGameState, performQuickRest, performActiveSearch, openLevelUpScreen } = useGameStore();
  const { isInventoryOpen, isInRefuge, toggleInventory } = useInteractionStore();
  const gameState = useGameStore((state) => state.gameState);

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

    const map: { [key: string]: () => void } = {
      i: toggleInventory,
      I: toggleInventory,
      j: handleOpenQuestLog,
      J: handleOpenQuestLog,
      r: handleQuickRest,
      R: handleQuickRest,
      f: handleActiveSearch,
      F: handleActiveSearch,
      l: openLevelUpScreen,
      L: openLevelUpScreen,
      ArrowUp: () => handleMove(0, -1),
      w: () => handleMove(0, -1),
      ArrowDown: () => handleMove(0, 1),
      s: () => handleMove(0, 1),
      ArrowLeft: () => handleMove(-1, 0),
      a: () => handleMove(-1, 0),
      ArrowRight: () => handleMove(1, 0),
      d: () => handleMove(1, 0),
    };

    if (!isInventoryOpen && !isInRefuge) {
      map['Escape'] = handleOpenPauseMenu;
    }
    return map;
  }, [gameState, toggleInventory, handleOpenQuestLog, handleQuickRest, handleActiveSearch, handleMove, isInventoryOpen, isInRefuge, handleOpenPauseMenu, openLevelUpScreen]);

  useKeyboardInput(keyHandlerMap);


  return (
    <>
      <DebugPanel />
      <div className="game-screen-container w-full h-full flex p-2 space-x-2 text-[var(--text-primary)]">
        {/* Left Column (25%) */}
        <div className="w-1/4 h-full flex flex-col space-y-1">
          <SurvivalPanel />
          <InventoryPanel />
          <CommandsPanel />
        </div>

        {/* Main Content Area (Center + Right Columns & Journal) (75%) */}
        <div className="w-3/4 h-full flex flex-col space-y-1">
          {/* Top part of Main Content (Map + Right Panels) */}
          <div className="flex-grow flex space-x-2 overflow-hidden">
            {/* Center Column (50% of total width) */}
            <div className="w-2/3 h-full flex flex-col border border-[var(--border-primary)] bg-black/20">
              <h2 className="text-center bg-[var(--text-primary)]/10 py-0.5 font-bold tracking-widest uppercase text-base flex-shrink-0">MAPPA DEL MONDO</h2>
              <div className="flex-grow relative">
                <CanvasMap />
                <CompassRose />
              </div>
            </div>

            {/* Right Column (25% of total width) */}
            <div className="w-1/3 h-full flex flex-col space-y-1">
              <InfoPanel />
              <EquipmentPanel />
              <StatsPanel />
              <AlignmentPanel />
            </div>
          </div>

          {/* Bottom part of Main Content (Journal) */}
          <div className="h-1/4 flex-shrink-0">
            <TravelJournalPanel />
          </div>
        </div>
      </div>
    </>
  );
};

export default GameScreen;