import React, { useCallback, useMemo } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useInteractionStore } from '../store/interactionStore';

/**
 * RefugeScreen component.
 * This component renders the refuge screen.
 * @returns {JSX.Element} The rendered RefugeScreen component.
 */
const RefugeScreen: React.FC = () => {
    const { refugeMenuState, navigateRefugeMenu, confirmRefugeMenuSelection, refugeActionMessage } = useInteractionStore();
    const { options, selectedIndex } = refugeMenuState;

    const keyHandler = useCallback((key: string) => {
        switch (key) {
            case 'w':
            case 'ArrowUp':
                navigateRefugeMenu(-1);
                break;
            case 's':
            case 'ArrowDown':
                navigateRefugeMenu(1);
                break;
            case 'Enter':
                confirmRefugeMenuSelection();
                break;
        }
    }, [navigateRefugeMenu, confirmRefugeMenuSelection]);

    const handlerMap = useMemo(() => ({
        'w': () => keyHandler('w'), 'ArrowUp': () => keyHandler('ArrowUp'),
        's': () => keyHandler('s'), 'ArrowDown': () => keyHandler('ArrowDown'),
        'Enter': () => keyHandler('Enter'),
    }), [keyHandler]);

    useKeyboardInput(handlerMap);

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl border-8 border-double border-green-400/50 flex flex-col p-6">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ RIFUGIO ═══</h1>
                
                {refugeActionMessage ? (
                    <div className="text-3xl text-center text-yellow-400 mb-8 p-4 border border-yellow-400/50 bg-yellow-400/10">
                        {refugeActionMessage}
                    </div>
                ) : (
                    <p className="text-3xl text-center text-green-400/80 mb-8">
                        Sei al sicuro. Il mondo esterno attende. Cosa vuoi fare?
                    </p>
                )}

                <div className="w-full max-w-lg mx-auto text-4xl space-y-3">
                    {options.map((option, index) => (
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

export default RefugeScreen;