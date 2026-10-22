import React, { useCallback, useMemo, useState } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { GameState, JournalEntryType } from '../types';
import { narrativeService } from '../services/NarrativeService';
import { tradingService } from '../services/tradingService';
import { audioManager } from '../utils/audio';
import Modal from './ui/Modal';
import ChoiceList from './ui/ChoiceList';
import Icon, { IconName } from './ui/Icon';
import BiomeScene from './art/BiomeScene';

const REST_HOURS = 8;

const OPTIONS = [
    'Parla con Marcus (il mercante)',
    'Parla con Anya (la tecnica)',
    'Parla con Silas (il cacciatore)',
    'Commercia con Marcus',
    `Riposa in un luogo sicuro (${REST_HOURS} ore)`,
    "Lascia l'Avamposto",
] as const;

const OPTION_ICONS: IconName[] = ['chat', 'chat', 'chat', 'coins', 'bed', 'exit'];

/** "Il Crocevia": the outpost hub with its NPCs, trade and a safe place to sleep. */
const OutpostScreen: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const setGameState = useGameStore(state => state.setGameState);
    const gameTime = useTimeStore(state => state.gameTime);
    const weather = useTimeStore(state => state.weather);

    const navigate = useCallback((direction: number) => {
        setActionMessage(null);
        setSelectedIndex(prev => (prev + direction + OPTIONS.length) % OPTIONS.length);
        audioManager.playSound('navigate');
    }, []);

    const leave = useCallback(() => {
        useGameStore.getState().addJournalEntry({ text: "Lasci l'Avamposto e torni nel mondo ostile.", type: JournalEntryType.NARRATIVE });
        audioManager.playSound('cancel');
        setGameState(GameState.IN_GAME);
    }, [setGameState]);

    const rest = useCallback(() => {
        const { addJournalEntry } = useGameStore.getState();
        const minutes = REST_HOURS * 60;
        const before = useCharacterStore.getState();
        const { satietyCost, hydrationCost } = before.calculateSurvivalCost(minutes);
        const fed = before.satiety.current >= satietyCost && before.hydration.current >= hydrationCost;
        addJournalEntry({ text: "Ti sistemi in un angolo tranquillo dell'avamposto e ti addormenti...", type: JournalEntryType.NARRATIVE });
        useTimeStore.getState().advanceTime(minutes, true);
        const character = useCharacterStore.getState();
        if (character.hp.current <= 0) return;
        const healAmount = Math.floor(character.hp.max * (fed ? 0.75 : 0.3));
        character.heal(healAmount);
        character.rest(fed ? 50 : 25);
        const text = fed
            ? `Hai riposato per ${REST_HOURS} ore: +${healAmount} HP e molta meno stanchezza.`
            : `Hai dormito a stomaco vuoto: solo +${healAmount} HP. Mangia e bevi prima di riposare.`;
        setActionMessage(text);
        addJournalEntry({ text, type: fed ? JournalEntryType.SKILL_CHECK_SUCCESS : JournalEntryType.SYSTEM_WARNING });
    }, []);

    const confirm = useCallback(() => {
        audioManager.playSound('confirm');
        switch (selectedIndex) {
            case 0: narrativeService.startDialogue('marcus_main', GameState.OUTPOST); break;
            case 1: narrativeService.startDialogue('anya_main', GameState.OUTPOST); break;
            case 2: narrativeService.startDialogue('silas_main', GameState.OUTPOST); break;
            case 3: tradingService.startTradingSession('marcus', GameState.OUTPOST); break;
            case 4: rest(); break;
            case 5: leave(); break;
        }
    }, [selectedIndex, rest, leave]);

    const handlerMap = useMemo(() => ({
        w: () => navigate(-1), ArrowUp: () => navigate(-1),
        s: () => navigate(1), ArrowDown: () => navigate(1),
        Enter: confirm,
        Escape: leave,
    }), [navigate, confirm, leave]);

    useKeyboardInput(handlerMap);

    return (
        <Modal
            backdrop="blur"
            banner={<BiomeScene biome="A" variant="outpost" hour={gameTime.hour + gameTime.minute / 60} weather={weather.type} height={210} />}
            eyebrow="Avamposto"
            icon="signpost"
            title="Il Crocevia"
            size="md"
            hints={[{ keys: ['↑↓'], label: 'Scegli' }, { keys: ['INVIO'], label: 'Conferma' }, { keys: ['ESC'], label: 'Esci' }]}
        >
            <div className="px-12 pb-9">
                <p className="prose-story mb-6 text-[22px] text-ink2">
                    Non è molto: un pugno di container arrugginiti e tende rattoppate disposte in cerchio attorno a un fuoco
                    fumante. Eppure è il primo luogo da settimane che odora di umanità e non di decadenza.
                </p>
                {actionMessage && (
                    <div key={actionMessage} className="mb-5 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 text-[20px] leading-snug text-ink anim-fade-up">
                        <Icon name="info" size={22} className="mt-0.5 text-gold" />
                        <span>{actionMessage}</span>
                    </div>
                )}
                <ChoiceList
                    size="sm"
                    selected={selectedIndex}
                    items={OPTIONS.map((option, index) => ({ id: option, label: option, icon: OPTION_ICONS[index] }))}
                />
            </div>
        </Modal>
    );
};

export default OutpostScreen;
