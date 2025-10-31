import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useInteractionStore } from '../store/interactionStore';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { GameState, JournalEntryType } from '../types';
import { dialogueService } from '../services/dialogueService';
import { tradingService } from '../services/tradingService';

/**
 * OutpostScreen component (v1.6.0).
 * Renders the Outpost "Il Crocevia" screen - the first social hub.
 * @returns {JSX.Element} The rendered OutpostScreen component.
 */
const OutpostScreen: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const { setGameState, addJournalEntry } = useGameStore();
    const { advanceTime } = useTimeStore();
    const { satiety, hydration, hp, heal, rest } = useCharacterStore();

    // Menu options (v1.8.3: Added Silas dialogue)
    const options = [
        'Parla con Marcus (il mercante)',
        'Parla con Anya (la tecnica)',
        'Parla con Silas (il cacciatore)',
        'Commercia',
        'Riposa in un luogo sicuro (8 ore)',
        'Lascia l\'Avamposto'
    ];

    const navigate = useCallback((direction: number) => {
        setActionMessage(null);
        setSelectedIndex(prev => {
            let newIndex = prev + direction;
            if (newIndex < 0) newIndex = options.length - 1;
            if (newIndex >= options.length) newIndex = 0;
            return newIndex;
        });
    }, [options.length]);

    const confirmSelection = useCallback(() => {
        const selectedOption = options[selectedIndex];
        
        // Marcus dialogue (v1.7.0: Now functional!)
        if (selectedOption.includes('Parla con Marcus')) {
            dialogueService.startDialogue('marcus_main');
            return;
        }

        // Anya dialogue (v1.8.1: NEW!)
        if (selectedOption.includes('Parla con Anya')) {
            dialogueService.startDialogue('anya_main');
            return;
        }

        // Silas dialogue (v1.8.3: NEW!)
        if (selectedOption.includes('Parla con Silas')) {
            dialogueService.startDialogue('silas_main');
            return;
        }

        // Trading (v1.7.0: Now functional!)
        if (selectedOption.includes('Commercia') && !selectedOption.includes('[Prossimamente]')) {
            tradingService.startTradingSession('marcus');
            return;
        }

        // Functional option: Rest
        if (selectedOption.includes('Riposa in un luogo sicuro')) {
            const restHours = 8;
            const restMinutes = restHours * 60;
            
            // Calculate resource costs
            const { satietyCost, hydrationCost } = useCharacterStore.getState().calculateSurvivalCost(restMinutes);
            
            // Check if player has enough resources
            if (satiety.current < satietyCost || hydration.current < hydrationCost) {
                setActionMessage(`Non hai abbastanza risorse per riposare. Necessari: ${satietyCost} cibo, ${hydrationCost} acqua.`);
                addJournalEntry({ 
                    text: 'Non hai abbastanza cibo o acqua per riposare in sicurezza.', 
                    type: JournalEntryType.ACTION_FAILURE 
                });
                return;
            }

            // Perform rest
            addJournalEntry({ 
                text: 'Ti sistemi in un angolo tranquillo dell\'avamposto e ti addormenti...', 
                type: JournalEntryType.NARRATIVE 
            });
            
            advanceTime(restMinutes, true);
            
            // Restore 75% HP and 50 fatigue
            const healAmount = Math.floor(hp.max * 0.75);
            heal(healAmount);
            rest(50);
            
            setActionMessage(`Hai riposato per ${restHours} ore. Recuperati ${healAmount} HP e ti senti molto meno stanco.`);
            addJournalEntry({ 
                text: `Ti svegli riposato. [+${healAmount} HP, -50 Fatica]`, 
                type: JournalEntryType.SKILL_CHECK_SUCCESS 
            });
            return;
        }

        // Functional option: Leave
        if (selectedOption.includes('Lascia')) {
            addJournalEntry({ 
                text: 'Lasci l\'Avamposto e torni nel mondo ostile.', 
                type: JournalEntryType.NARRATIVE 
            });
            setGameState(GameState.IN_GAME);
            return;
        }
    }, [selectedIndex, options, satiety, hydration, hp, heal, rest, advanceTime, addJournalEntry, setGameState]);

    const keyHandler = useCallback((key: string) => {
        switch (key) {
            case 'w':
            case 'ArrowUp':
                navigate(-1);
                break;
            case 's':
            case 'ArrowDown':
                navigate(1);
                break;
            case 'Enter':
                confirmSelection();
                break;
            case 'Escape':
                setGameState(GameState.IN_GAME);
                break;
        }
    }, [navigate, confirmSelection, setGameState]);

    const handlerMap = useMemo(() => ({
        'w': () => keyHandler('w'), 
        'ArrowUp': () => keyHandler('ArrowUp'),
        's': () => keyHandler('s'), 
        'ArrowDown': () => keyHandler('ArrowDown'),
        'Enter': () => keyHandler('Enter'),
        'Escape': () => keyHandler('Escape'),
    }), [keyHandler]);

    useKeyboardInput(handlerMap);

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl border-8 border-double border-amber-600/50 flex flex-col p-6">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6 text-amber-500">
                    ═══ IL CROCEVIA ═══
                </h1>
                
                <p className="text-2xl text-center text-amber-400/80 mb-6 px-4 leading-relaxed">
                    Sei arrivato al Crocevia. Non è molto: un pugno di container arrugginiti e tende 
                    rattoppate disposte in cerchio attorno a un fuoco fumante. Eppure, è il primo luogo 
                    da settimane che odora di umanità e non di decadenza. Alcuni sopravvissuti ti osservano 
                    con cautela mentre ti avvicini.
                </p>

                {actionMessage && (
                    <div className="text-3xl text-center text-yellow-400 mb-6 p-4 border border-yellow-400/50 bg-yellow-400/10">
                        {actionMessage}
                    </div>
                )}

                <div className="w-full max-w-2xl mx-auto text-3xl space-y-2 mb-6">
                    {options.map((option, index) => {
                        const isPlaceholder = option.includes('[Prossimamente]');
                        return (
                            <div
                                key={option}
                                className={`pl-4 py-1 transition-colors duration-100 ${
                                    index === selectedIndex 
                                        ? 'bg-amber-500 text-black' 
                                        : isPlaceholder 
                                            ? 'text-gray-600' 
                                            : 'bg-transparent text-amber-400'
                                }`}
                            >
                                {index === selectedIndex && '> '}{option}
                            </div>
                        );
                    })}
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-amber-600/50 pt-4">
                    [W/S / ↑↓] Seleziona | [INVIO] Conferma | [ESC] Esci
                </div>
            </div>
        </div>
    );
};

export default OutpostScreen;