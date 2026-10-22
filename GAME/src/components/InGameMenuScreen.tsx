import React, { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTimeStore } from '../store/timeStore';
import { GameState } from '../types';
import { useKeyboardInput, KeyHandlerMap } from '../hooks/useKeyboardInput';
import { audioManager } from '../utils/audio';
import Modal from './ui/Modal';
import ChoiceList from './ui/ChoiceList';
import Icon, { IconName } from './ui/Icon';

const MENU_ITEMS = ['Continua', 'Salva Partita', 'Carica Partita', 'Opzioni', 'Menu Principale'] as const;

const MENU_ICONS: Record<(typeof MENU_ITEMS)[number], IconName> = {
    'Continua': 'play',
    'Salva Partita': 'save',
    'Carica Partita': 'load',
    'Opzioni': 'sliders',
    'Menu Principale': 'exit',
};

const InGameMenuScreen: React.FC = () => {
    const gameState = useGameStore(state => state.gameState);
    const setGameState = useGameStore(state => state.setGameState);
    const gameTime = useTimeStore(state => state.gameTime);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [confirmQuit, setConfirmQuit] = useState(false);

    const navigate = useCallback((direction: number) => {
        setSelectedIndex(prev => (prev + direction + MENU_ITEMS.length) % MENU_ITEMS.length);
        audioManager.playSound('navigate');
    }, []);

    const confirm = useCallback(() => {
        audioManager.playSound('confirm');
        switch (MENU_ITEMS[selectedIndex]) {
            case 'Continua': setGameState(GameState.IN_GAME); break;
            case 'Salva Partita': setGameState(GameState.SAVE_GAME); break;
            case 'Carica Partita': setGameState(GameState.LOAD_GAME); break;
            case 'Opzioni': setGameState(GameState.OPTIONS_SCREEN); break;
            case 'Menu Principale': setConfirmQuit(true); break;
        }
    }, [selectedIndex, setGameState]);

    const handlerMap = useMemo((): KeyHandlerMap => {
        if (gameState !== GameState.PAUSE_MENU) return {};
        if (confirmQuit) {
            return {
                Enter: () => setGameState(GameState.MAIN_MENU),
                Escape: () => { setConfirmQuit(false); audioManager.playSound('cancel'); },
            };
        }
        return {
            w: () => navigate(-1), ArrowUp: () => navigate(-1),
            s: () => navigate(1), ArrowDown: () => navigate(1),
            Enter: confirm,
            Escape: () => { audioManager.playSound('cancel'); setGameState(GameState.IN_GAME); },
        };
    }, [gameState, confirmQuit, navigate, confirm, setGameState]);

    useKeyboardInput(handlerMap);

    const time = `${String(gameTime.hour).padStart(2, '0')}:${String(gameTime.minute).padStart(2, '0')}`;

    if (confirmQuit) {
        return (
            <Modal
                accent="danger"
                eyebrow="Pausa"
                icon="warning"
                title="Tornare al menu principale?"
                size="sm"
                hints={[{ keys: ['INVIO'], label: 'Sì, esci' }, { keys: ['ESC'], label: 'No, resta' }]}
            >
                <div className="flex items-start gap-4 px-12 pb-10">
                    <Icon name="warning" size={26} className="mt-1 text-danger" />
                    <p className="text-[22px] leading-snug text-ink2">I progressi non salvati andranno persi.</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            eyebrow="Pausa"
            icon="hourglass"
            title="Il viaggio si ferma"
            subtitle={`Giorno ${gameTime.day} · ${time}`}
            size="sm"
            hints={[{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['INVIO'], label: 'Conferma' }, { keys: ['ESC'], label: 'Continua' }]}
        >
            <div className="px-12 pb-9">
                <ChoiceList
                    selected={selectedIndex}
                    items={MENU_ITEMS.map(option => ({ id: option, label: option, icon: MENU_ICONS[option] }))}
                />
            </div>
        </Modal>
    );
};

export default InGameMenuScreen;
