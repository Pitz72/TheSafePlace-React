import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import { useEventStore } from '../store/eventStore';
import { useGameStore } from '../store/gameStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { DONOR_NAMES } from '../constants';

/** Random and location events: choices, then the resolution summary. */
const EventScreen: React.FC = () => {
    const { activeEvent, resolveEventChoice, eventResolutionText, dismissEventResolution, isChoiceVisible } = useEventStore();
    const inventory = useCharacterStore(state => state.inventory);
    const activeQuests = useCharacterStore(state => state.activeQuests);
    const gameFlags = useGameStore(state => state.gameFlags);
    const itemDatabase = useItemDatabaseStore(state => state.itemDatabase);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const descriptionBoxRef = useRef<HTMLDivElement>(null);
    const resolutionBoxRef = useRef<HTMLDivElement>(null);

    // A stable donor name for this event instance.
    const donorName = useMemo(
        () => DONOR_NAMES[Math.floor(Math.random() * DONOR_NAMES.length)],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeEvent?.id],
    );
    const fill = useCallback((text: string) => text.replace(/{RANDOM_DONOR}/g, donorName).replace(/\\n/g, '\n'), [donorName]);

    /** Choices the player can see, with their original index and requirement status. */
    const choices = useMemo(() => {
        if (!activeEvent) return [];
        return activeEvent.choices
            .map((choice, index) => ({ choice, index }))
            .filter(({ choice }) => isChoiceVisible(choice))
            .map(({ choice, index }) => {
                const missing = (choice.itemRequirements ?? []).filter(req =>
                    inventory.reduce((sum, item) => (item.itemId === req.itemId ? sum + item.quantity : sum), 0) < req.quantity);
                const requirement = missing.length > 0
                    ? ` (Richiede: ${missing.map(req => `${itemDatabase[req.itemId]?.name ?? req.itemId} x${req.quantity}`).join(', ')})`
                    : '';
                return { choice, index, met: missing.length === 0, requirement };
            });
        // activeQuests and gameFlags change what isChoiceVisible returns.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeEvent, inventory, itemDatabase, isChoiceVisible, activeQuests, gameFlags]);

    // Start on the first selectable choice of every new event.
    useEffect(() => {
        const first = choices.findIndex(c => c.met);
        setSelectedIndex(first === -1 ? 0 : first);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeEvent?.id]);

    const noSelectableChoice = !!activeEvent && choices.every(c => !c.met);

    const handleNavigate = useCallback((direction: number) => {
        if (eventResolutionText || choices.length === 0) return;
        setSelectedIndex(prev => {
            let next = prev;
            for (let attempts = 0; attempts < choices.length; attempts++) {
                next = (next + direction + choices.length) % choices.length;
                if (choices[next].met) return next;
            }
            return prev;
        });
        audioManager.playSound('navigate');
    }, [choices, eventResolutionText]);

    const handleConfirm = useCallback(() => {
        if (eventResolutionText) {
            audioManager.playSound('confirm');
            dismissEventResolution();
            return;
        }
        const selected = choices[selectedIndex];
        if (selected?.met) {
            audioManager.playSound('confirm');
            resolveEventChoice(selected.index);
        } else {
            audioManager.playSound('error');
        }
    }, [choices, selectedIndex, resolveEventChoice, eventResolutionText, dismissEventResolution]);

    const handleScroll = useCallback((direction: 'up' | 'down') => {
        const box = eventResolutionText ? resolutionBoxRef.current : descriptionBoxRef.current;
        box?.scrollBy({ top: direction === 'down' ? 100 : -100, behavior: 'smooth' });
    }, [eventResolutionText]);

    const handleEscape = useCallback(() => {
        if (eventResolutionText) {
            handleConfirm();
        } else if (noSelectableChoice) {
            // Never trap the player in an event they can't act on.
            audioManager.playSound('cancel');
            dismissEventResolution();
        }
    }, [eventResolutionText, noSelectableChoice, handleConfirm, dismissEventResolution]);

    const handlerMap = useMemo(() => (eventResolutionText
        ? {
            w: () => handleScroll('up'), ArrowUp: () => handleScroll('up'),
            s: () => handleScroll('down'), ArrowDown: () => handleScroll('down'),
            Enter: handleConfirm, Escape: handleEscape,
        }
        : {
            w: () => handleNavigate(-1), ArrowUp: () => handleNavigate(-1),
            s: () => handleNavigate(1), ArrowDown: () => handleNavigate(1),
            PageUp: () => handleScroll('up'), PageDown: () => handleScroll('down'),
            Enter: handleConfirm, Escape: handleEscape,
        }), [handleNavigate, handleConfirm, handleScroll, handleEscape, eventResolutionText]);

    useKeyboardInput(handlerMap);

    if (!activeEvent) return null;
    // Places change once the player has acted there (the camp is empty, the pump works...).
    const description = [...(activeEvent.variants ?? [])].reverse().find(v => gameFlags.has(v.requiresFlag))?.description ?? activeEvent.description;

    if (eventResolutionText) {
        return (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
                <div className="w-full max-w-6xl border-8 border-double border-green-400/50 flex flex-col p-8">
                    <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">
                        ═══ ESITO: {activeEvent.title} ═══
                    </h1>
                    <div ref={resolutionBoxRef} className="w-full h-96 border-2 border-green-400/30 p-4 overflow-y-auto mb-8 text-3xl" style={{ scrollbarWidth: 'none' }}>
                        <pre className="whitespace-pre-wrap leading-relaxed font-[inherit]">{fill(eventResolutionText)}</pre>
                    </div>
                    <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4 animate-pulse">
                        [W/S / ↑↓] Scorri | [INVIO] Continua
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full max-w-6xl border-8 border-double border-green-400/50 flex flex-col p-8">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ {activeEvent.title} ═══</h1>
                <div ref={descriptionBoxRef} className="w-full h-96 border-2 border-green-400/30 p-4 overflow-y-auto mb-8 text-3xl" style={{ scrollbarWidth: 'none' }}>
                    <pre className="whitespace-pre-wrap leading-relaxed font-[inherit]">{fill(description)}</pre>
                </div>
                <div className="w-full max-w-4xl mx-auto text-4xl space-y-4">
                    {choices.map(({ choice, met, requirement }, index) => {
                        const isSelected = index === selectedIndex && met;
                        return (
                            <div
                                key={`${activeEvent.id}-${index}`}
                                className={`pl-4 py-2 transition-colors duration-100 ${isSelected ? 'bg-green-400 text-black' : met ? 'bg-transparent' : 'text-gray-500'}`}
                            >
                                {isSelected && '> '}{choice.text}
                                {!met && <span className="text-red-500/80 italic">{requirement}</span>}
                            </div>
                        );
                    })}
                </div>
                <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4">
                    {noSelectableChoice ? '[ESC] Vai oltre' : '[W/S / ↑↓] Seleziona | [PAG↑↓] Scorri | [INVIO] Conferma'}
                </div>
            </div>
        </div>
    );
};

export default EventScreen;
