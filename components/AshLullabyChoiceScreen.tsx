import React, { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';

const AshLullabyChoiceScreen: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const setGameState = useGameStore(state => state.setGameState);
    const startCutscene = useGameStore(state => state.startCutscene);
    const setGameFlags = useGameStore(state => state.gameFlags);
    
    const choices = [
        "Apri il carillon.",
        "Ignoralo e riposa."
    ];

    const handleNavigate = useCallback((direction: number) => {
        setSelectedIndex(prev => (prev + direction + choices.length) % choices.length);
        audioManager.playSound('navigate');
    }, [choices.length]);

    const handleConfirm = useCallback(() => {
        audioManager.playSound('confirm');
        if (selectedIndex === 0) { // Apri
            // Set the permanent flag to prevent this event from ever happening again
            // FIX: Changed `useGameStore.getState().set` to `useGameStore.setState`.
            // `getState()` returns only the state, while `setState` is the correct method
            // on the store hook to update the state from outside the store definition.
            useGameStore.setState(state => ({ 
                gameFlags: new Set(state.gameFlags).add('ASH_LULLABY_PLAYED') 
            }));
            audioManager.playSound('ash_lullaby');
            startCutscene('CS_ASH_LULLABY');
        } else { // Ignora
            // Just return to the game (the refuge screen will be there)
            setGameState(GameState.IN_GAME);
        }
    }, [selectedIndex, setGameState, startCutscene]);
    
    const handlerMap = useMemo(() => ({
        'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
        's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
        'Enter': handleConfirm,
    }), [handleNavigate, handleConfirm]);

    useKeyboardInput(handlerMap);

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl border-8 border-double border-green-400/50 flex flex-col p-6">
                <h1 className="text-5xl text-center font-bold tracking-widest uppercase mb-6">═══ UN RICORDO PESANTE ═══</h1>
                
                <p className="text-3xl text-center text-green-400/80 mb-8 leading-relaxed">
                    Mentre ti prepari a riposare, la tua mano sfiora qualcosa di freddo e spigoloso nella tasca. Il carillon annerito. L'avvertimento di tuo padre ti risuona in testa: "Non aprirlo mai. Il suo suono... attira i ricordi sbagliati".<br/><br/>
                    Eppure, qui, nel silenzio del rifugio, senti un'attrazione inspiegabile. Una curiosità dolorosa.
                </p>

                <div className="w-full max-w-2xl mx-auto text-4xl space-y-3 mt-4">
                    {choices.map((option, index) => (
                        <div
                            key={option}
                            className={`pl-4 py-1 transition-colors duration-100 ${
                                index === selectedIndex ? 'bg-green-400 text-black' : 'bg-transparent'
                            }`}
                        >
                            {index === selectedIndex && '> '}{option}
                        </div>
                    ))}
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4">
                    [W/S / ↑↓] Seleziona | [INVIO] Conferma
                </div>
            </div>
        </div>
    );
};

export default AshLullabyChoiceScreen;