import React from 'react';
import { useGameStore } from '../../core/store';
import { TimeManager } from '../../core/time/TimeManager';
import { events, GameEvents } from '../../core/events';

export const DialogueUI: React.FC = () => {
    const { isDialogueOpen, currentDialogueText, currentChoices, vitals, timeElapsed } = useGameStore();

    // Always show HUD for testing
    const hud = (
        <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', fontFamily: 'monospace', pointerEvents: 'none' }}>
            <div>HP: {vitals.hp} / {vitals.maxHp}</div>
            <div>{TimeManager.getFormattedTime(timeElapsed)}</div>
        </div>
    );

    if (!isDialogueOpen) return hud;

    return (
        <>
            {hud}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '20px',
                border: '2px solid white',
                fontFamily: 'monospace'
            }}>
                <p style={{ fontSize: '18px', marginBottom: '15px' }}>{currentDialogueText}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentChoices.map((choice) => (
                        <button
                            key={choice.index}
                            onClick={() => events.emit(GameEvents.CHOOSE_OPTION, choice.index)}
                            style={{
                                padding: '10px',
                                backgroundColor: '#333',
                                color: 'white',
                                border: '1px solid #666',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            {choice.index + 1}. {choice.text}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};
