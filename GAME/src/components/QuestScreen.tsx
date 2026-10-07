import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useGameStore } from '../store/gameStore';
import { useQuestDatabaseStore } from '../data/questDatabase';
import { useLoreArchiveDatabaseStore } from '../data/loreArchiveDatabase';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { GameState, Quest, QuestType } from '../types';
import { getStageProgress, resolveQuestLocation } from '../services/questService';
import { audioManager } from '../utils/audio';

const directionTo = (dx: number, dy: number): string => {
    const vertical = dy < -Math.abs(dx) / 2 ? 'nord' : dy > Math.abs(dx) / 2 ? 'sud' : '';
    const horizontal = dx > Math.abs(dy) / 2 ? 'est' : dx < -Math.abs(dy) / 2 ? 'ovest' : '';
    return vertical && horizontal ? `${vertical}-${horizontal}` : vertical || horizontal || 'qui';
};

/** Quest log: main quests, side quests and the lore archive (keyboard scrollable). */
const QuestScreen: React.FC = () => {
    const { completedQuests, failedQuests, loreArchive, activeQuests } = useCharacterStore();
    const quests = useQuestDatabaseStore(state => state.quests);
    const loreEntries = useLoreArchiveDatabaseStore(state => state.loreEntries);
    const setGameState = useGameStore(state => state.setGameState);
    const playerPos = useGameStore(state => state.playerPos);
    // Re-render when POIs are revealed (quest locations resolve through them).
    useGameStore(state => state.pois);

    const [focused, setFocused] = useState(0);
    const columns = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

    const close = useCallback(() => setGameState(GameState.IN_GAME), [setGameState]);
    const scroll = useCallback((delta: number) => {
        columns[focused].current?.scrollBy({ top: delta, behavior: 'smooth' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focused]);
    const switchColumn = useCallback((delta: number) => {
        setFocused(prev => (prev + delta + 3) % 3);
        audioManager.playSound('navigate');
    }, []);

    const handlerMap = useMemo(() => ({
        Escape: close, j: close, J: close,
        ArrowUp: () => scroll(-120), w: () => scroll(-120),
        ArrowDown: () => scroll(120), s: () => scroll(120),
        ArrowLeft: () => switchColumn(-1), a: () => switchColumn(-1),
        ArrowRight: () => switchColumn(1), d: () => switchColumn(1),
    }), [close, scroll, switchColumn]);
    useKeyboardInput(handlerMap);

    const byType = (ids: string[], type: QuestType) => ids.map(id => quests[id]).filter((q): q is Quest => !!q && q.type === type);
    const activeIds = Object.keys(activeQuests);

    const renderActive = (quest: Quest) => {
        const stage = quest.stages.find(s => s.stage === activeQuests[quest.id]);
        const progress = getStageProgress(quest.id);
        const location = resolveQuestLocation(stage?.location ?? (stage?.trigger.type === 'reachLocation' ? stage.trigger.value : null));
        const distance = location ? Math.round(Math.hypot(location.x - playerPos.x, location.y - playerPos.y)) : null;
        return (
            <div key={quest.id} className="mb-4 pb-4 border-b border-green-400/20">
                <div className="text-4xl font-bold mb-2" style={{ color: quest.type === 'MAIN' ? '#ef4444' : '#facc15' }}>{quest.title}</div>
                <div className="text-3xl text-green-400/80 pl-4">• {stage?.objective ?? 'Obiettivo in corso...'}</div>
                {progress && <div className="text-2xl text-cyan-300 pl-8">Progresso: {progress}</div>}
                {location && distance !== null && (
                    <div className="text-2xl text-amber-300/80 pl-8">
                        {distance === 0 ? 'Sei sul posto.' : `Segnato sulla mappa: ${distance} passi a ${directionTo(location.x - playerPos.x, location.y - playerPos.y)}.`}
                    </div>
                )}
                <div className="text-xl text-green-400/50 pl-4 mt-1">Fase {activeQuests[quest.id]} di {quest.stages.length}</div>
            </div>
        );
    };

    const renderClosed = (list: Quest[], label: string, className: string) => list.length > 0 && (
        <div className="mt-6 pt-4 border-t-2 border-green-400/20">
            <h3 className="text-3xl font-bold mb-3 text-green-400/60">{label}</h3>
            {list.map(q => <div key={q.id} className={`mb-2 text-3xl ${className}`}>{q.title}</div>)}
        </div>
    );

    const column = (index: number, title: string, body: React.ReactNode) => (
        <div
            ref={columns[index]}
            className={`w-1/3 h-full border-2 p-4 overflow-y-auto ${focused === index ? 'border-yellow-400/70' : 'border-green-400/30'}`}
            style={{ scrollbarWidth: 'none' }}
        >
            <h2 className="text-5xl font-bold mb-4 pb-2 border-b-2 border-green-400/30">{title}</h2>
            {body}
        </div>
    );

    const questColumn = (type: QuestType) => {
        const active = byType(activeIds, type);
        return (
            <>
                {active.length > 0
                    ? active.map(renderActive)
                    : <div className="text-green-400/50 text-3xl mb-6">-- Nessuna missione attiva --</div>}
                {renderClosed(byType(completedQuests, type), 'COMPLETATE', 'text-green-400/40 line-through')}
                {renderClosed(byType(failedQuests, type), 'FALLITE', 'text-red-400/60 line-through')}
            </>
        );
    };

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full border-8 border-double border-green-400/50 flex flex-col p-6">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ DIARIO MISSIONI ═══</h1>
                <div className="flex-grow flex space-x-4 overflow-hidden">
                    {column(0, 'PRINCIPALI', questColumn('MAIN'))}
                    {column(1, 'SECONDARIE', questColumn('SUB'))}
                    {column(2, `ARCHIVIO LORE (${loreArchive.length})`, loreArchive.length > 0
                        ? loreArchive.map(id => loreEntries[id] && (
                            <div key={id} className="mb-6 pb-4 border-b border-green-400/20">
                                <div className="text-4xl font-bold mb-3" style={{ color: '#a78bfa' }}>{loreEntries[id].title}</div>
                                <div className="text-2xl text-green-400/70 leading-relaxed whitespace-pre-wrap">{loreEntries[id].text}</div>
                            </div>
                        ))
                        : <div className="text-green-400/50 text-3xl">-- Nessuna scoperta ancora --</div>)}
                </div>
                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-green-400/50 pt-3">
                    [←→] Colonna | [↑↓] Scorri | [ESC/J] Chiudi
                </div>
            </div>
        </div>
    );
};

export default QuestScreen;
