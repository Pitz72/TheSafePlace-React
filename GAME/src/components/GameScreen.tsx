/**
 * GameScreen — main exploration screen, v3 "Diario del Sopravvissuto".
 *
 * Layout variante A del design handoff: mappa full-bleed con overlay
 * di carta flottanti (stato, diario, obiettivo) e action bar inferiore.
 *
 * La PaperMap è un placeholder visivo: la mappa SVG navigabile con
 * pan/zoom e POI cliccabili (GDD v3, Sistema 1) è uno step successivo.
 * Il movimento WASD resta cablato al motore a griglia esistente perché
 * tempo/risorse/eventi dipendono ancora da gameService.movePlayer.
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useInteractionStore } from '../store/interactionStore';
import { useTimeStore } from '../store/timeStore';
import { useQuestDatabaseStore } from '../data/questDatabase';
import { GameState, JournalEntryType, PlayerStatusCondition, WeatherType } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { gameService } from '../services/gameService';
import { PaperMap, StatMeter, JournalEntry, Tape } from './ui';
import { DebugPanel } from './DebugPanel';

type EntryTone = 'ink' | 'rust' | 'mint' | 'muted';

const JOURNAL_TONES: Record<JournalEntryType, EntryTone> = {
  [JournalEntryType.GAME_START]: 'mint',
  [JournalEntryType.SKILL_CHECK_SUCCESS]: 'mint',
  [JournalEntryType.SKILL_CHECK_FAILURE]: 'rust',
  [JournalEntryType.ACTION_FAILURE]: 'rust',
  [JournalEntryType.NARRATIVE]: 'ink',
  [JournalEntryType.ITEM_ACQUIRED]: 'mint',
  [JournalEntryType.SYSTEM_ERROR]: 'rust',
  [JournalEntryType.SYSTEM_WARNING]: 'muted',
  [JournalEntryType.SYSTEM_MESSAGE]: 'muted',
  [JournalEntryType.COMBAT]: 'rust',
  [JournalEntryType.XP_GAIN]: 'mint',
  [JournalEntryType.EVENT]: 'ink',
  [JournalEntryType.TROPHY_UNLOCKED]: 'mint',
};

const STATUS_LABELS: Record<PlayerStatusCondition, string> = {
  FERITO: 'ferito',
  MALATO: 'malato',
  AVVELENATO: 'avvelenato',
  IPOTERMIA: 'ipotermia',
  ESAUSTO: 'esausto',
  AFFAMATO: 'affamato',
  DISIDRATATO: 'disidratato',
  INFEZIONE: 'infezione',
};

function dayPhase(hour: number): string {
  if (hour >= 5 && hour < 8) return 'ALBA';
  if (hour >= 8 && hour < 18) return 'GIORNO';
  if (hour >= 18 && hour < 21) return 'TRAMONTO';
  return 'NOTTE';
}

function weatherEffectText(type: WeatherType): string | null {
  switch (type) {
    case WeatherType.PIOGGIA: return 'movimento rallentato';
    case WeatherType.TEMPESTA: return 'mov. rallentato · +consumo';
    case WeatherType.NEBBIA: return 'visibilità ridotta';
    default: return null;
  }
}

/** Top bar — identity, day/place/time, weather. */
const TopBar: React.FC = () => {
  const gameTime = useTimeStore((state) => state.gameTime);
  const weather = useTimeStore((state) => state.weather);
  const playerPos = useGameStore((state) => state.playerPos);
  const getTileInfo = useGameStore((state) => state.getTileInfo);

  const tileInfo = getTileInfo(playerPos.x, playerPos.y);
  const time = `${String(gameTime.hour).padStart(2, '0')}:${String(gameTime.minute).padStart(2, '0')}`;
  const effect = weatherEffectText(weather.type);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '18px 32px',
      background: 'linear-gradient(180deg, rgba(20,24,32,0.85), rgba(20,24,32,0.0))',
      color: 'var(--tsp-paper)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      pointerEvents: 'none', zIndex: 5,
    }}>
      <div>
        <div className="t-sans" style={{ fontSize: 9, letterSpacing: '0.4em', opacity: 0.55, marginBottom: 4 }}>SOPRAVVISSUTO</div>
        <div className="t-serif" style={{ fontSize: 22, lineHeight: 1, letterSpacing: '0.01em' }}>Ultimo</div>
        <div className="t-hand" style={{ fontSize: 14, color: 'var(--tsp-mint)', marginTop: 2, opacity: 0.85 }}>
          figlio del custode
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="t-sans" style={{ fontSize: 9, letterSpacing: '0.4em', opacity: 0.55, marginBottom: 4 }}>
          GIORNO {gameTime.day}
        </div>
        <div className="t-serif" style={{ fontSize: 22, letterSpacing: '0.04em' }}>{tileInfo.name}</div>
        <div className="t-sans" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--tsp-ice-glow)', marginTop: 2 }}>
          {time} · {dayPhase(gameTime.hour)}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="t-sans" style={{ fontSize: 9, letterSpacing: '0.4em', opacity: 0.55, marginBottom: 4 }}>METEO</div>
        <div className="t-hand" style={{ fontSize: 18, color: 'var(--tsp-ice-glow)' }}>{weather.type.toLowerCase()}</div>
        {effect && (
          <div className="t-sans" style={{ fontSize: 10, letterSpacing: '0.2em', opacity: 0.65, marginTop: 4 }}>
            {effect}
          </div>
        )}
      </div>
    </div>
  );
};

/** Left HUD — pinned paper card with vitals, conditions, level. */
const StatusCard: React.FC = () => {
  const hp = useCharacterStore((state) => state.hp);
  const satiety = useCharacterStore((state) => state.satiety);
  const hydration = useCharacterStore((state) => state.hydration);
  const fatigue = useCharacterStore((state) => state.fatigue);
  const status = useCharacterStore((state) => state.status);
  const level = useCharacterStore((state) => state.level);
  const xp = useCharacterStore((state) => state.xp);
  const levelUpPending = useCharacterStore((state) => state.levelUpPending);

  const totalWeight = useCharacterStore.getState().getTotalWeight();
  const maxCarryWeight = useCharacterStore.getState().getMaxCarryWeight();

  const conditions = Array.from(status).map((s) => STATUS_LABELS[s] ?? s.toLowerCase());
  if (totalWeight > maxCarryWeight) conditions.push('sovraccarico');

  return (
    <div style={{
      position: 'absolute', left: 24, top: 110, width: 240,
      background: 'var(--tsp-paper)',
      padding: '18px 18px 14px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3)',
      transform: 'rotate(-1.5deg)',
      zIndex: 4,
    }}>
      <Tape top={-10} left={80} w={80} h={20} rot={3} />
      <div className="t-label" style={{ marginBottom: 12 }}>STATO</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <StatMeter label="VITA"    value={Math.floor(hp.current)}        max={hp.max}        color="rust" />
        <StatMeter label="SAZIETÀ" value={Math.floor(satiety.current)}   max={satiety.max}   color="ink" />
        <StatMeter label="ACQUA"   value={Math.floor(hydration.current)} max={hydration.max} color="slate" />
        <StatMeter label="FATICA"  value={Math.floor(fatigue.current)}   max={fatigue.max}   color="ink" />
      </div>
      <hr className="ink-rule-dashed" style={{ margin: '12px 0' }} />
      <div className="t-label-sm" style={{ marginBottom: 4 }}>CONDIZIONI</div>
      {conditions.length > 0 ? (
        conditions.map((c) => (
          <div key={c} className="t-hand" style={{ fontSize: 15, color: 'var(--tsp-rust)' }}>· {c}</div>
        ))
      ) : (
        <div className="t-hand" style={{ fontSize: 15, color: 'var(--tsp-slate)' }}>· nessuna</div>
      )}
      <hr className="ink-rule-dashed" style={{ margin: '12px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="t-label-sm">LIVELLO</span>
        <span className="t-serif" style={{ fontSize: 18 }}>
          {level}{' '}
          <span className="t-sans" style={{ fontSize: 10, color: 'var(--tsp-slate-light)' }}>· {xp.current}/{xp.next} XP</span>
          {levelUpPending && <span className="t-sans" style={{ fontSize: 10, color: 'var(--tsp-rust)', marginLeft: 4 }}>[L]</span>}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
        <span className="t-label-sm">ZAINO</span>
        <span className="t-sans" style={{ fontSize: 11, color: totalWeight > maxCarryWeight ? 'var(--tsp-rust)' : 'var(--tsp-slate)' }}>
          {totalWeight.toFixed(1)} / {maxCarryWeight.toFixed(1)} kg
        </span>
      </div>
    </div>
  );
};

/** Right HUD — travel journal as flowing diary entries. */
const JournalCard: React.FC = () => {
  const journal = useGameStore((state) => state.journal);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [journal]);

  const entries = journal.slice(0, 9);

  return (
    <div style={{
      position: 'absolute', right: 24, top: 110, width: 320,
      background: 'var(--tsp-paper)',
      padding: '18px 20px 14px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3)',
      transform: 'rotate(1deg)',
      maxHeight: 'calc(100% - 220px)', overflow: 'hidden',
      zIndex: 4,
    }}>
      <Tape top={-10} right={70} w={80} h={20} rot={-4} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div className="t-label">DIARIO DI VIAGGIO</div>
        <div className="t-sans" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--tsp-slate-light)' }}>
          {journal.length} {journal.length === 1 ? 'VOCE' : 'VOCI'}
        </div>
      </div>
      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <JournalEntry
              key={`${entry.time.day}-${entry.time.hour}-${entry.time.minute}-${index}`}
              time={`${String(entry.time.hour).padStart(2, '0')}:${String(entry.time.minute).padStart(2, '0')}`}
              tone={JOURNAL_TONES[entry.type]}
            >
              {entry.text}
            </JournalEntry>
          ))
        ) : (
          <JournalEntry tone="muted" hand>— Il viaggio inizierà presto. Tutto verrà annotato qui.</JournalEntry>
        )}
      </div>
    </div>
  );
};

/** Center flag — active quest objective, pinned over the map. */
const ObjectiveFlag: React.FC = () => {
  const activeQuests = useCharacterStore((state) => state.activeQuests);
  const quests = useQuestDatabaseStore((state) => state.quests);

  const active = useMemo(() => {
    const ids = Object.keys(activeQuests);
    if (ids.length === 0) return null;
    const mainId = ids.find((id) => quests[id]?.type === 'MAIN');
    const id = mainId ?? ids[0];
    const quest = quests[id];
    if (!quest) return null;
    return { quest, stage: activeQuests[id] };
  }, [activeQuests, quests]);

  if (!active) return null;

  const stageInfo = active.quest.stages.find((s) => s.stage === active.stage);

  return (
    <div style={{
      position: 'absolute', left: '50%', top: 110, transform: 'translateX(-50%) rotate(-1deg)',
      background: 'rgba(216,210,194,0.94)',
      padding: '12px 22px 10px',
      boxShadow: '0 8px 22px rgba(0,0,0,0.5)',
      textAlign: 'center', maxWidth: 380,
      zIndex: 4,
    }}>
      <div className="t-label" style={{ color: 'var(--tsp-rust)', fontSize: 9 }}>OBIETTIVO ATTIVO</div>
      <div className="t-serif" style={{ fontSize: 16, marginTop: 4, fontStyle: 'italic' }}>
        "{stageInfo?.objective ?? active.quest.title}"
      </div>
      <div className="t-sans" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--tsp-slate)', marginTop: 4 }}>
        STAGE {active.stage} / {active.quest.stages.length} · {active.quest.type}
      </div>
    </div>
  );
};

/** Bottom action bar — clickable keyboard hints (mixed input). */
const ActionBar: React.FC<{ actions: Array<{ key: string; label: string; onClick: () => void }> }> = ({ actions }) => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: '16px 32px',
    background: 'linear-gradient(0deg, rgba(20,24,32,0.85), rgba(20,24,32,0.0))',
    color: 'var(--tsp-paper)',
    display: 'flex', justifyContent: 'center', gap: 28,
    zIndex: 5,
  }}>
    {actions.map(({ key, label, onClick }) => (
      <button
        key={key}
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        }}
      >
        <span className="t-sans" style={{
          fontSize: 11, fontWeight: 600,
          padding: '3px 8px 1px',
          border: '1px solid rgba(216,210,194,0.4)',
          color: 'var(--tsp-paper)',
          letterSpacing: '0.1em',
        }}>{key}</span>
        <span className="t-sans" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(216,210,194,0.6)' }}>
          {label.toUpperCase()}
        </span>
      </button>
    ))}
  </div>
);

const GameScreen: React.FC = () => {
  const { setGameState, performQuickRest, performActiveSearch, openLevelUpScreen } = useGameStore();
  const { isInventoryOpen, isInRefuge, toggleInventory } = useInteractionStore();
  const gameState = useGameStore((state) => state.gameState);
  const gameTime = useTimeStore((state) => state.gameTime);
  const weather = useTimeStore((state) => state.weather);

  const mapMood = useMemo(() => {
    if (weather.type === WeatherType.TEMPESTA) return 'storm' as const;
    if (gameTime.hour >= 21 || gameTime.hour < 5) return 'night' as const;
    if (gameTime.hour < 8) return 'dawn' as const;
    return 'day' as const;
  }, [weather.type, gameTime.hour]);

  const canAct = !isInventoryOpen && !isInRefuge;

  const handleOpenPauseMenu = useCallback(() => setGameState(GameState.PAUSE_MENU), [setGameState]);
  const handleMove = useCallback((dx: number, dy: number) => {
    if (canAct) gameService.movePlayer(dx, dy);
  }, [canAct]);
  const handleQuickRest = useCallback(() => { if (canAct) performQuickRest(); }, [canAct, performQuickRest]);
  const handleActiveSearch = useCallback(() => { if (canAct) performActiveSearch(); }, [canAct, performActiveSearch]);
  const handleOpenQuestLog = useCallback(() => { if (canAct) setGameState(GameState.QUEST_LOG); }, [canAct, setGameState]);

  const keyHandlerMap = useMemo(() => {
    // Active only in the main game state so input doesn't leak into
    // modal screens (combat, events, …).
    if (gameState !== GameState.IN_GAME) return {};

    const map: { [key: string]: () => void } = {
      i: toggleInventory, I: toggleInventory,
      j: handleOpenQuestLog, J: handleOpenQuestLog,
      r: handleQuickRest, R: handleQuickRest,
      f: handleActiveSearch, F: handleActiveSearch,
      l: openLevelUpScreen, L: openLevelUpScreen,
      ArrowUp: () => handleMove(0, -1),    w: () => handleMove(0, -1),
      ArrowDown: () => handleMove(0, 1),   s: () => handleMove(0, 1),
      ArrowLeft: () => handleMove(-1, 0),  a: () => handleMove(-1, 0),
      ArrowRight: () => handleMove(1, 0),  d: () => handleMove(1, 0),
    };
    if (canAct) map['Escape'] = handleOpenPauseMenu;
    return map;
  }, [gameState, toggleInventory, handleOpenQuestLog, handleQuickRest, handleActiveSearch, handleMove, canAct, handleOpenPauseMenu, openLevelUpScreen]);

  useKeyboardInput(keyHandlerMap);

  const actions = useMemo(() => [
    { key: 'WASD', label: 'muoviti', onClick: () => {} },
    { key: 'I', label: 'inventario', onClick: toggleInventory },
    { key: 'J', label: 'quest', onClick: handleOpenQuestLog },
    { key: 'F', label: 'cerca', onClick: handleActiveSearch },
    { key: 'R', label: 'riposa', onClick: handleQuickRest },
    { key: 'ESC', label: 'menu', onClick: handleOpenPauseMenu },
  ], [toggleInventory, handleOpenQuestLog, handleActiveSearch, handleQuickRest, handleOpenPauseMenu]);

  return (
    <>
      <DebugPanel />
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0e1115', overflow: 'hidden' }}>
        {/* full-bleed paper map (placeholder — real SVG map is a future step) */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <PaperMap mood={mapMood} showCompass={false} />
        </div>

        <TopBar />
        <StatusCard />
        <JournalCard />
        <ObjectiveFlag />
        <ActionBar actions={actions} />
      </div>
    </>
  );
};

export default GameScreen;
