import React, { useCallback, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState, DeathCause } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { handleLoadGame } from '../services/saveGameService';
import { lastSaveSlot } from '../utils/saveFormat';
import KeyArt from './art/KeyArt';
import KeyHints from './ui/KeyHints';

const DEATH_MESSAGES: Record<DeathCause, string> = {
    COMBAT: "Sconfitto in combattimento. La tua guardia non era abbastanza alta.",
    STARVATION: "La fame ti ha consumato. Il tuo viaggio finisce con lo stomaco vuoto.",
    DEHYDRATION: "La sete ti ha prosciugato. Anche il più forte degli uomini non può vivere senz'acqua.",
    SICKNESS: "La malattia ha avuto la meglio. Il tuo corpo non ha più retto.",
    POISON: "Il veleno ha percorso le tue vene, mettendo fine alla tua lotta.",
    ENVIRONMENT: "Il mondo stesso ti ha reclamato. Una caduta, un passo falso... a volte basta poco.",
    UNKNOWN: "La tua avventura è giunta al termine."
};

/** The journey ends: an empty road at night, the cause, and a way back. */
const GameOverScreen: React.FC = () => {
    const { deathCause, setGameState } = useGameStore();

    // Use useMemo to ensure the random check happens only once per render
    const isEasterEgg = useMemo(() => Math.random() < 0.1, []);

    const [lastSlot] = useState(lastSaveSlot);
    const [loadError, setLoadError] = useState(false);

    const handleConfirm = useCallback(() => {
        setGameState(GameState.MAIN_MENU);
    }, [setGameState]);

    const loadLast = useCallback(() => {
        if (lastSlot && !handleLoadGame(lastSlot)) setLoadError(true);
    }, [lastSlot]);

    const handlerMap = useMemo(() => ({
        Enter: handleConfirm,
        Escape: handleConfirm,
        c: loadLast, C: loadLast,
    }), [handleConfirm, loadLast]);

    useKeyboardInput(handlerMap);

    const message = isEasterEgg
        ? "Sei morto di... MORTE!"
        : DEATH_MESSAGES[deathCause || 'UNKNOWN'];

    return (
        <div className="absolute inset-0 overflow-hidden bg-bg0">
            <KeyArt variant="night" shade="none" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 45%, rgba(10,6,8,0.55), rgba(5,4,6,0.92))' }} />
            <div className="relative flex h-full flex-col items-center justify-center px-20 text-center">
                <div className="eyebrow text-danger anim-fade-in" style={{ letterSpacing: '0.5em' }}>Game over</div>
                <h1 className="title-display mt-6 text-[120px] italic text-ink anim-fade-up" style={{ fontWeight: 500 }}>
                    Il viaggio finisce qui
                </h1>
                <div className="my-10 h-px w-40 bg-danger/60 anim-fade-in" />
                <p className="prose-story max-w-[1000px] text-[30px] italic text-ink2 anim-fade-up" style={{ animationDelay: '400ms' }}>
                    {message}
                </p>
                <div className="mt-16 anim-fade-in" style={{ animationDelay: '900ms' }}>
                    <KeyHints
                        hints={[
                            { keys: ['INVIO'], label: 'Menu principale' },
                            ...(lastSlot ? [{ keys: ['C'], label: `Carica l'ultimo salvataggio (slot ${lastSlot})`, active: true }] : []),
                        ]}
                    />
                    {loadError && <p className="mt-4 text-[20px] text-danger">Impossibile caricare il salvataggio.</p>}
                </div>
            </div>
        </div>
    );
};

export default GameOverScreen;
