import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import { useEventStore } from '../store/eventStore';
import { useNarrativeStore } from '../store/narrativeStore'; // Ink store
import { narrativeService } from '../services/NarrativeService';
import { DONOR_NAMES } from '../constants';

/**
 * EventScreen component (v2.0.3).
 * This component renders the event screen.
 * 
 * @description
 * - Handles Legacy Events (random encounters, etc.) via useEventStore.
 * - Handles Ink Cutscenes via useNarrativeStore (when isStoryActive is true).
 * 
 * @returns {JSX.Element | null} The rendered EventScreen component or null.
 */
const EventScreen: React.FC = () => {
    // Legacy Event State
    const { activeEvent, resolveEventChoice, eventResolutionText, dismissEventResolution } = useEventStore();

    // Ink Narrative State
    const { isStoryActive, currentText, currentChoices, currentTags } = useNarrativeStore();

    const inventory = useCharacterStore(state => state.inventory);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const descriptionBoxRef = useRef<HTMLDivElement>(null);
    const resolutionBoxRef = useRef<HTMLDivElement>(null);

    // --- INK CUTSCENE LOGIC ---
    // If Ink story is active, we prioritize showing that.
    const isInkMode = isStoryActive;

    // Reset selection when choices change (for Ink)
    useEffect(() => {
        if (isInkMode) {
            setSelectedIndex(0);
        }
    }, [currentChoices, isInkMode]);

    // --- LEGACY LOGIC ---
    // Generate a stable random donor name for this event instance
    const randomDonorName = useMemo(() => {
        return DONOR_NAMES[Math.floor(Math.random() * DONOR_NAMES.length)];
    }, [activeEvent]);

    const processedDescription = useMemo(() => {
        if (isInkMode) return currentText; // Ink text
        if (!activeEvent) return '';
        return activeEvent.description.replace(/{RANDOM_DONOR}/g, randomDonorName).replace(/\\n/g, '\n');
    }, [activeEvent, randomDonorName, isInkMode, currentText]);

    const processedResolutionText = useMemo(() => {
        if (!eventResolutionText) return '';
        return eventResolutionText.replace(/{RANDOM_DONOR}/g, randomDonorName).replace(/\\n/g, '\n');
    }, [eventResolutionText, randomDonorName]);

    const choiceStatus = useMemo(() => {
        if (isInkMode) {
            // Ink choices are always available unless filtered by Ink logic itself
            return currentChoices.map(() => ({ met: true, text: '' }));
        }

        if (!activeEvent) return [];
        return activeEvent.choices.map(choice => {
            if (!choice.itemRequirements) return { met: true, text: '' };

            for (const req of choice.itemRequirements) {
                const playerItem = inventory.find(item => item.itemId === req.itemId);
                if (!playerItem || playerItem.quantity < req.quantity) {
                    return { met: false, text: ` (Richiede: ${req.itemId} x${req.quantity})` };
                }
            }
            return { met: true, text: '' };
        });
    }, [activeEvent, inventory, isInkMode, currentChoices]);

    const handleNavigate = useCallback((direction: number) => {
        if (eventResolutionText) return;

        const choices = isInkMode ? currentChoices : (activeEvent?.choices || []);
        const numChoices = choices.length;
        if (numChoices === 0) return;

        setSelectedIndex(prev => {
            let newIndex = (prev + direction + numChoices) % numChoices;

            // For legacy events, skip disabled choices
            if (!isInkMode) {
                let attempts = 0;
                while (!choiceStatus[newIndex]?.met && attempts < numChoices) {
                    newIndex = (newIndex + direction + numChoices) % numChoices;
                    attempts++;
                }
            }
            return newIndex;
        });
        audioManager.playSound('navigate');
    }, [activeEvent, choiceStatus, eventResolutionText, isInkMode, currentChoices]);

    const handleConfirm = useCallback(() => {
        if (eventResolutionText) {
            dismissEventResolution();
            audioManager.playSound('confirm');
            return;
        }

        if (isInkMode) {
            if (currentChoices.length > 0) {
                narrativeService.chooseChoiceIndex(currentChoices[selectedIndex].index);
                audioManager.playSound('confirm');
            } else {
                // If no choices, maybe continue?
                // narrativeService.continue(); 
            }
            return;
        }

        // Legacy confirm
        if (activeEvent && choiceStatus[selectedIndex]?.met) {
            resolveEventChoice(selectedIndex);
            audioManager.playSound('confirm');
        } else {
            audioManager.playSound('error');
        }
    }, [activeEvent, selectedIndex, resolveEventChoice, choiceStatus, eventResolutionText, dismissEventResolution, isInkMode, currentChoices]);

    const handleScrollDescription = useCallback((direction: 'up' | 'down') => {
        const box = eventResolutionText ? resolutionBoxRef.current : descriptionBoxRef.current;
        if (box) {
            box.scrollBy({ top: direction === 'down' ? 100 : -100, behavior: 'smooth' });
            audioManager.playSound('navigate');
        }
    }, [eventResolutionText]);

    const handlerMap = useMemo(() => {
        if (eventResolutionText) {
            // In resolution screen: W/S scroll, Enter confirm
            return {
                'w': () => handleScrollDescription('up'),
                'ArrowUp': () => handleScrollDescription('up'),
                's': () => handleScrollDescription('down'),
                'ArrowDown': () => handleScrollDescription('down'),
                'Enter': handleConfirm,
            };
        } else {
            // In choice screen: W/S navigate choices, Enter confirm
            return {
                'w': () => handleNavigate(-1),
                'ArrowUp': () => handleNavigate(-1),
                's': () => handleNavigate(1),
                'ArrowDown': () => handleNavigate(1),
                'Enter': handleConfirm,
            };
        }
    }, [handleNavigate, handleConfirm, handleScrollDescription, eventResolutionText]);

    useKeyboardInput(handlerMap);

    // If neither legacy event nor Ink story is active, don't render
    if (!activeEvent && !isInkMode) {
        return null;
    }

    // Render Resolution Screen (Legacy only for now)
    if (eventResolutionText) {
        return (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
                <div className="w-full max-w-6xl border-8 border-double border-green-400/50 flex flex-col p-8">
                    <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">
                        ═══ ESITO: {activeEvent?.title} ═══
                    </h1>

                    <div
                        ref={resolutionBoxRef}
                        className="w-full h-96 border-2 border-green-400/30 p-4 overflow-y-auto mb-8 text-3xl"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        <pre className="whitespace-pre-wrap leading-relaxed">{processedResolutionText}</pre>
                    </div>

                    <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4 animate-pulse">
                        [W/S / ↑↓] Scorri | [INVIO] Continua
                    </div>
                </div>
            </div>
        );
    }

    // Render Main Event/Cutscene Screen
    const title = isInkMode ? (currentTags.find(t => t.startsWith('title:'))?.split(':')[1] || 'EVENTO') : activeEvent?.title;
    const choices = isInkMode ? currentChoices : (activeEvent?.choices || []);

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full max-w-6xl border-8 border-double border-green-400/50 flex flex-col p-8">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">
                    ═══ {title} ═══
                </h1>

                <div
                    ref={descriptionBoxRef}
                    className="w-full h-96 border-2 border-green-400/30 p-4 overflow-y-auto mb-8 text-3xl"
                    style={{ scrollbarWidth: 'none' }}
                >
                    <pre className="whitespace-pre-wrap leading-relaxed">{processedDescription}</pre>
                </div>

                <div className="w-full max-w-4xl mx-auto text-4xl space-y-4">
                    {choices.map((choice, index) => {
                        const isSelected = index === selectedIndex;
                        const isMet = choiceStatus[index]?.met;
                        const requirementText = choiceStatus[index]?.text;

                        return (
                            <div
                                key={index}
                                className={`pl-4 py-2 transition-colors duration-100 ${isSelected && isMet ? 'bg-green-400 text-black'
                                    : isMet ? 'bg-transparent' : 'text-gray-500'
                                    }`}
                            >
                                {isSelected && isMet && '> '}{choice.text}
                                {!isMet && <span className="text-red-500/80 italic">{requirementText}</span>}
                            </div>
                        )
                    })}
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4">
                    [W/S / ↑↓] Seleziona | [INVIO] Conferma la Scelta
                </div>
            </div>
        </div>
    );
};

export default EventScreen;