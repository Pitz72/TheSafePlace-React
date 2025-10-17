import React, { useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState, DeathCause } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

const DEATH_MESSAGES: Record<DeathCause, string> = {
    COMBAT: "Sconfitto in combattimento. La tua guardia non era abbastanza alta.",
    STARVATION: "La fame ti ha consumato. Il tuo viaggio finisce con lo stomaco vuoto.",
    DEHYDRATION: "La sete ti ha prosciugato. Anche il più forte degli uomini non può vivere senz'acqua.",
    SICKNESS: "La malattia ha avuto la meglio. Il tuo corpo non ha più retto.",
    POISON: "Il veleno ha percorso le tue vene, mettendo fine alla tua lotta.",
    ENVIRONMENT: "Il mondo stesso ti ha reclamato. Una caduta, un passo falso... a volte basta poco.",
    UNKNOWN: "La tua avventura è giunta al termine."
};

const ASCII_SKULL = `
         █████████████████████████
      ███████████████████████████████
    ███████████████████████████████████
   █████████████████████████████████████
  ███████████████████████████████████████
 █████████████████████████████████████████
 ████████         █████████         ██████
 ███████           ███████           ██████
 ███████           ███████           ██████
 █████████████████████████████████████████
 █████████████████████████████████████████
 ███████████  █████████████  ████████████
  ██████████  █████████████  ███████████
   █████████████████████████████████████
    ███████████████████████████████████
      █████████████   ██████████████
        ███████████   ████████████
          █████           █████
`;

const GameOverScreen: React.FC = () => {
    const { deathCause, setGameState } = useGameStore();

    // Use useMemo to ensure the random check happens only once per render
    const isEasterEgg = useMemo(() => Math.random() < 0.1, []);

    const handleConfirm = useCallback(() => {
        setGameState(GameState.MAIN_MENU);
    }, [setGameState]);

    const handlerMap = useMemo(() => ({
        'Enter': handleConfirm,
        'Escape': handleConfirm,
    }), [handleConfirm]);

    useKeyboardInput(handlerMap);

    const message = isEasterEgg 
        ? "Sei morto di... MORTE!" 
        : DEATH_MESSAGES[deathCause || 'UNKNOWN'];

    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 text-red-500">
            <pre className="text-sm leading-none text-center" style={{ textShadow: '0 0 8px #ef4444' }}>
                {ASCII_SKULL}
            </pre>
            <h1 className="text-8xl text-center font-black tracking-widest uppercase mt-8" style={{ textShadow: '0 0 8px #ef4444' }}>
                GAME OVER
            </h1>
            <p className="text-3xl text-center mt-4 italic text-gray-300">
                {message}
            </p>
            <div className="flex-shrink-0 text-center text-3xl mt-12 pt-4 text-gray-300 animate-pulse">
                [INVIO per tornare al Menu Principale]
            </div>
        </div>
    );
};

export default GameOverScreen;