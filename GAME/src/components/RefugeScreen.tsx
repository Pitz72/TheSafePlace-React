import React, { useCallback, useMemo } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { REFUGE_ACTION, useInteractionStore } from '../store/interactionStore';
import { useTimeStore } from '../store/timeStore';
import Modal from './ui/Modal';
import ChoiceList from './ui/ChoiceList';
import Icon, { IconName } from './ui/Icon';
import BiomeScene from './art/BiomeScene';

const OPTION_ICONS: Record<string, IconName> = {
    [REFUGE_ACTION.WAIT]: 'hourglass',
    [REFUGE_ACTION.SLEEP]: 'bed',
    [REFUGE_ACTION.SEARCH]: 'search',
    [REFUGE_ACTION.WORKBENCH]: 'hammer',
    [REFUGE_ACTION.INVENTORY]: 'backpack',
    [REFUGE_ACTION.LEAVE]: 'exit',
};

/** The refuge menu: rest, search, workbench, inventory, leave. */
const RefugeScreen: React.FC = () => {
    const { refugeMenuState, navigateRefugeMenu, confirmRefugeMenuSelection, refugeActionMessage } = useInteractionStore();
    const { options, selectedIndex } = refugeMenuState;
    const gameTime = useTimeStore(state => state.gameTime);
    const weather = useTimeStore(state => state.weather);

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
        <Modal
            banner={<BiomeScene biome="R" variant="shelter" hour={gameTime.hour + gameTime.minute / 60} weather={weather.type} height={200} />}
            eyebrow="Rifugio"
            icon="campfire"
            title="Un riparo, per ora"
            subtitle="Sei al sicuro. Il mondo esterno attende. Cosa vuoi fare?"
            size="md"
            hints={[{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['INVIO'], label: 'Conferma' }]}
        >
            <div className="px-12 pb-9">
                {refugeActionMessage && (
                    <div key={refugeActionMessage} className="mb-5 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 text-[20px] leading-snug text-ink anim-fade-up">
                        <Icon name="info" size={22} className="mt-0.5 text-gold" />
                        <span>{refugeActionMessage}</span>
                    </div>
                )}
                <ChoiceList
                    selected={selectedIndex}
                    items={options.map(option => ({ id: option, label: option, icon: OPTION_ICONS[option] ?? 'chevronRight' }))}
                />
            </div>
        </Modal>
    );
};

export default RefugeScreen;
