import React, { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import { useInteractionStore } from '../store/interactionStore';
import Modal from './ui/Modal';
import ChoiceList from './ui/ChoiceList';

/**
 * AshLullabyChoiceScreen component.
 * This component renders a screen where the player can choose to open the music box or ignore it.
 * @returns {JSX.Element} The rendered AshLullabyChoiceScreen component.
 */
const AshLullabyChoiceScreen: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const setGameState = useGameStore(state => state.setGameState);
    const startCutscene = useGameStore(state => state.startCutscene);
    
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
        if (selectedIndex === 0) {
            // The music box plays only once per game.
            useGameStore.getState().setFlag('ASH_LULLABY_PLAYED');
            audioManager.playSound('ash_lullaby');
            startCutscene('CS_ASH_LULLABY');
        } else {
            // Back to the refuge and on with the rest the player asked for
            // (the choice is not offered again during this stay).
            setGameState(GameState.IN_GAME);
            useInteractionStore.getState().confirmRefugeMenuSelection();
        }
    }, [selectedIndex, setGameState, startCutscene]);
    
    const handlerMap = useMemo(() => ({
        'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
        's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
        'Enter': handleConfirm,
    }), [handleNavigate, handleConfirm]);

    useKeyboardInput(handlerMap);

    return (
        <Modal
            backdrop="blur"
            accent="violet"
            eyebrow="Il carillon"
            icon="music"
            title="Un ricordo pesante"
            size="md"
            hints={[{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['INVIO'], label: 'Conferma' }]}
        >
            <div className="px-12 pb-9">
                <div className="hairline mb-6" />
                <p className="prose-story mb-5 text-[25px]">
                    Mentre ti prepari a riposare, la tua mano sfiora qualcosa di freddo e spigoloso nella tasca. Il carillon annerito. L'avvertimento di tuo padre ti risuona in testa: <span className="italic text-violet">"Non aprirlo mai. Il suo suono... attira i ricordi sbagliati"</span>.
                </p>
                <p className="prose-story mb-8 text-[25px] text-ink2">
                    Eppure, qui, nel silenzio del rifugio, senti un'attrazione inspiegabile. Una curiosità dolorosa.
                </p>
                <ChoiceList
                    selected={selectedIndex}
                    items={choices.map((option, index) => ({ id: option, label: option, icon: index === 0 ? 'music' : 'bed' }))}
                />
            </div>
        </Modal>
    );
};

export default AshLullabyChoiceScreen;