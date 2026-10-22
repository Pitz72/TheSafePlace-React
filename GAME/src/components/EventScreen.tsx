import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import { useEventStore } from '../store/eventStore';
import { useGameStore } from '../store/gameStore';
import { useTimeStore } from '../store/timeStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { DONOR_NAMES } from '../constants';
import Modal from './ui/Modal';
import ChoiceList from './ui/ChoiceList';
import BiomeScene from './art/BiomeScene';

/** Random and location events: choices, then the resolution summary. */
const EventScreen: React.FC = () => {
    const { activeEvent, resolveEventChoice, eventResolutionText, dismissEventResolution, isChoiceVisible } = useEventStore();
    const inventory = useCharacterStore(state => state.inventory);
    const activeQuests = useCharacterStore(state => state.activeQuests);
    const gameFlags = useGameStore(state => state.gameFlags);
    const playerPos = useGameStore(state => state.playerPos);
    const currentBiome = useGameStore(state => state.currentBiome);
    const getTileInfo = useGameStore(state => state.getTileInfo);
    const gameTime = useTimeStore(state => state.gameTime);
    const weather = useTimeStore(state => state.weather);
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
                    ? `Richiede: ${missing.map(req => `${itemDatabase[req.itemId]?.name ?? req.itemId} x${req.quantity}`).join(', ')}`
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
    const biome = getTileInfo(playerPos.x, playerPos.y).char || currentBiome;
    const banner = <BiomeScene biome={biome} hour={gameTime.hour + gameTime.minute / 60} weather={weather.type} height={210} />;

    if (eventResolutionText) {
        return (
            <Modal
                backdrop="blur"
                banner={banner}
                eyebrow="Esito"
                icon="check"
                title={activeEvent.title}
                size="lg"
                hints={[{ keys: ['↑↓'], label: 'Scorri' }, { keys: ['INVIO'], label: 'Continua' }]}
            >
                <div ref={resolutionBoxRef} className="scroll-y fade-bottom max-h-[460px] px-12 pb-10">
                    <div className="hairline mb-7" />
                    <p className="prose-story whitespace-pre-wrap text-[26px] anim-fade-up">{fill(eventResolutionText)}</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            backdrop="blur"
            banner={banner}
            eyebrow="Evento"
            icon="pin"
            title={activeEvent.title}
            size="lg"
            bodyClassName="flex flex-col"
            hints={noSelectableChoice
                ? [{ keys: ['ESC'], label: 'Vai oltre' }]
                : [{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['PAG SU', 'PAG GIÙ'], label: 'Scorri' }, { keys: ['INVIO'], label: 'Conferma' }]}
        >
            <div ref={descriptionBoxRef} className="scroll-y fade-bottom min-h-[90px] flex-shrink px-12">
                <div className="hairline mb-6" />
                <p className="prose-story whitespace-pre-wrap pb-4 text-[25px] anim-fade-up">{fill(description)}</p>
            </div>
            <div className="flex-shrink-0 px-12 pb-8 pt-3">
                <ChoiceList
                    selected={selectedIndex}
                    items={choices.map(({ choice, met, requirement }, index) => ({
                        id: `${activeEvent.id}-${index}`,
                        label: choice.text,
                        disabled: !met,
                        detail: !met ? requirement : undefined,
                    }))}
                />
            </div>
        </Modal>
    );
};

export default EventScreen;
