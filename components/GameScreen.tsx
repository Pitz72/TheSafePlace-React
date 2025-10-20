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
 * SurvivalPanel component.
 * This component displays the player's survival stats (HP, satiety, hydration, and status).
 * @returns {JSX.Element} The rendered SurvivalPanel component.
 */
const SurvivalPanel: React.FC = () => {
    const hp = useCharacterStore((state) => state.hp);
    const satiety = useCharacterStore((state) => state.satiety);
    const hydration = useCharacterStore((state) => state.hydration);
    const fatigue = useCharacterStore((state) => state.fatigue);
    const status = useCharacterStore((state) => state.status);
    const inventory = useCharacterStore((state) => state.inventory);
    const attributes = useCharacterStore((state) => state.attributes);

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
 * InventoryPanel component.
 * This component displays the player's inventory.
 * @returns {JSX.Element} The rendered InventoryPanel component.
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
 * CommandsPanel component.
 * This component displays the available commands.
 * @returns {JSX.Element} The rendered CommandsPanel component.
 */
const CommandsPanel: React.FC = () => (
  <Panel title="COMANDI">
    <div className="space-y-0.5 text-xs">
      <div className="flex justify-between"><span>[WASD/↑↓←→]</span> <span>Movimento/Navigazione</span></div>
      <div className="flex justify-between"><span>[I]</span> <span>Inventario</span></div>
      <div className="flex justify-between"><span>[R]</span> <span>Riposo Breve</span></div>
      <div className="flex justify-between"><span>[F]</span> <span>Cerca Risorse</span></div>
      <div className="flex justify-between"><span>[L]</span> <span>Level Up</span></div>
      <div className="flex justify-between"><span>[ESC]</span> <span>Menu/Indietro</span></div>
    </div>
  </Panel>
);


// --- Right Column Panels ---

/**
 * InfoPanel component.
 * This component displays information about the player's current location, time, and weather.
 * @returns {JSX.Element} The rendered InfoPanel component.
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
 * EquipmentPanel component.
 * This component displays the player's equipped items.
 * @returns {JSX.Element} The rendered EquipmentPanel component.
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
 * StatsPanel component.
 * This component displays the player's stats.
 * @returns {JSX.Element} The rendered StatsPanel component.
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
 * TravelJournalPanel component.
 * This component displays the player's travel journal.
 * @returns {JSX.Element} The rendered TravelJournalPanel component.
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
 * GameScreen component.
 * This component renders the main game screen, including the map, panels, and journal.
 * @returns {JSX.Element} The rendered GameScreen component.
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

  const keyHandlerMap = useMemo(() => {
    // Questo gestore dovrebbe essere attivo solo nello stato di gioco principale
    // per evitare che gli input trapelino in modali come Combattimento, Eventi, ecc.
    if (gameState !== GameState.IN_GAME) {
      return {};
    }

    const map: { [key: string]: () => void } = {
      i: toggleInventory,
      I: toggleInventory,
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
  }, [gameState, toggleInventory, handleQuickRest, handleActiveSearch, handleMove, isInventoryOpen, isInRefuge, handleOpenPauseMenu, openLevelUpScreen]);
  
  useKeyboardInput(keyHandlerMap);


  return (
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
  );
};

export default GameScreen;