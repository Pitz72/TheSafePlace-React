import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useGameStore } from '../store/gameStore';
import { useQuestDatabaseStore } from '../data/questDatabase';
import { useLoreArchiveDatabaseStore } from '../data/loreArchiveDatabase';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { GameState, Quest, QuestType } from '../types';
import { getStageProgress, resolveQuestLocation } from '../services/questService';
import { audioManager } from '../utils/audio';
import Modal from './ui/Modal';
import Icon, { IconName } from './ui/Icon';
import { Tone, toneColor } from '../utils/palette';

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
        const tone: Tone = quest.type === 'MAIN' ? 'ember' : 'gold';
        const stageNumber = activeQuests[quest.id];
        return (
            <article key={quest.id} className="surface-flat mb-3 px-6 py-5">
                <div className="flex items-start gap-3">
                    <Icon name={quest.type === 'MAIN' ? 'star' : 'alert'} size={22} className="mt-1.5 flex-shrink-0" style={{ color: toneColor(tone) }} />
                    <h3 className="title-display text-[32px] text-ink">{quest.title}</h3>
                </div>
                <p className="prose-story mt-3 text-[21px] text-ink2">{stage?.objective ?? 'Obiettivo in corso...'}</p>
                {progress && (
                    <div className="mt-3 flex items-center gap-2 text-[18px] text-teal">
                        <Icon name="check" size={17} strokeWidth={2.2} /> Progresso: <span className="tnum">{progress}</span>
                    </div>
                )}
                {location && distance !== null && (
                    <div className="mt-2 flex items-center gap-2 text-[18px] text-ember2">
                        <Icon name="pin" size={17} />
                        {distance === 0 ? 'Sei sul posto.' : `Segnato sulla mappa: ${distance} passi a ${directionTo(location.x - playerPos.x, location.y - playerPos.y)}.`}
                    </div>
                )}
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex flex-1 gap-1">
                        {quest.stages.map((s, i) => (
                            <span key={s.stage} className="h-1 flex-1 rounded-full" style={{ background: i + 1 < stageNumber ? toneColor(tone, 0.7) : i + 1 === stageNumber ? toneColor(tone) : 'rgb(var(--c-ink4) / 0.35)' }} />
                        ))}
                    </div>
                    <span className="tnum text-[16px] text-ink4">Fase {stageNumber} di {quest.stages.length}</span>
                </div>
            </article>
        );
    };

    const renderClosed = (list: Quest[], label: string, done: boolean) => list.length > 0 && (
        <div className="mt-6">
            <h4 className="eyebrow mb-3">{label}</h4>
            {list.map(q => (
                <div key={q.id} className="mb-2 flex items-center gap-3 text-[20px]">
                    <Icon name={done ? 'check' : 'close'} size={17} strokeWidth={2.2} className={done ? 'text-sage' : 'text-danger'} />
                    <span className={done ? 'text-ink3' : 'text-ink4 line-through'}>{q.title}</span>
                </div>
            ))}
        </div>
    );

    const column = (index: number, title: string, icon: IconName, count: number, body: React.ReactNode) => {
        const active = focused === index;
        return (
            <section
                className="surface-flat flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300"
                style={active ? { borderColor: 'rgb(var(--accent) / 0.5)', boxShadow: '0 0 0 1px rgb(var(--accent) / 0.12), 0 24px 60px -36px rgb(var(--accent) / 0.7)' } : undefined}
            >
                <header className="flex flex-shrink-0 items-center gap-3 border-b border-line px-6 py-4">
                    <Icon name={icon} size={20} className={active ? 'text-accent' : 'text-ink3'} />
                    <h2 className={`eyebrow flex-1 ${active ? '!text-ink' : ''}`}>{title}</h2>
                    <span className="tnum text-[16px] text-ink4">{count}</span>
                </header>
                <div ref={columns[index]} className="scroll-y fade-edges min-h-0 flex-1 px-4 py-4">
                    {body}
                </div>
            </section>
        );
    };

    const empty = (text: string) => <p className="prose-story px-2 py-6 text-[20px] italic text-ink4">{text}</p>;

    const questColumn = (type: QuestType) => {
        const active = byType(activeIds, type);
        return (
            <>
                {active.length > 0 ? active.map(renderActive) : empty('Nessuna missione attiva.')}
                <div className="px-2">
                    {renderClosed(byType(completedQuests, type), 'Completate', true)}
                    {renderClosed(byType(failedQuests, type), 'Fallite', false)}
                </div>
            </>
        );
    };

    return (
        <Modal
            eyebrow="Diario"
            icon="scroll"
            title="Missioni e memorie"
            size="full"
            hints={[{ keys: ['←→'], label: 'Colonna' }, { keys: ['↑↓'], label: 'Scorri' }, { keys: ['ESC', 'J'], label: 'Chiudi' }]}
        >
            <div className="flex h-full gap-5 px-10 pb-7">
                {column(0, 'Principali', 'star', byType(activeIds, 'MAIN').length, questColumn('MAIN'))}
                {column(1, 'Secondarie', 'alert', byType(activeIds, 'SUB').length, questColumn('SUB'))}
                {column(2, 'Archivio lore', 'book', loreArchive.length, loreArchive.length > 0
                    ? loreArchive.map(id => loreEntries[id] && (
                        <article key={id} className="mb-6 border-l-2 border-violet/50 pl-5 pr-2">
                            <h3 className="title-display text-[30px] text-violet">{loreEntries[id].title}</h3>
                            <p className="prose-story mt-2 whitespace-pre-wrap text-[19px] text-ink2">{loreEntries[id].text}</p>
                        </article>
                    ))
                    : empty('Nessuna scoperta ancora.'))}
            </div>
        </Modal>
    );
};

export default QuestScreen;
