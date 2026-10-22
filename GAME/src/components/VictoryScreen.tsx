import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import KeyArt from './art/KeyArt';
import Logo from './art/Logo';
import Modal from './ui/Modal';
import KeyHints from './ui/KeyHints';
import Icon, { IconName } from './ui/Icon';
import { TRAVELLER_FIGURE } from '../assets/art';

const ALIGNMENT_THRESHOLD = 5;

type EndingKey = 'lena' | 'elian' | 'balanced';

const EPILOGUES: Record<EndingKey, { title: string; text: string }> = {
    lena: {
        title: 'Quello che resta',
        text: `'Lo so, papà. Ho ricordato tutto.'

Elian non chiede cosa. Si guarda le mani, aperte sulle ginocchia, come se ci tenesse ancora quel peso.

'Me lo ha chiesto lei,' dice. 'Non me lo sono mai perdonato.'

'Lei lo ha chiesto a te. Io non ho niente da perdonarti.'

Gli metti in mano la borraccia ammaccata che ti ha accompagnato per tutta la strada. Lui la gira tra le dita, riconosce le tacche sul metallo, una per ogni giorno.

Quella notte dormite senza torce accese. Nel bunker c'è posto per due brande, e il buio, qui dentro, è soltanto buio.

Nei mesi che seguono il Safe Place smette di essere una destinazione. Coltivate. Riparate. Qualche viandante bussa, e voi aprite: è quello che avrebbe voluto lei.

Il viaggio ti ha insegnato a contare i passi. Adesso conti altro: i giorni, i raccolti, le voci nuove attorno al fuoco.`,
    },
    elian: {
        title: 'L\'aritmetica',
        text: `'Ho ricordato tutto,' dici. Niente di più.

Elian annuisce, piano. Aspettava questa frase da quindici anni.

'Avresti fatto lo stesso.' Non è una domanda.

Ci pensi. Ai bivi dove hai scelto tu: il cibo negato, la porta non aperta, i conti fatti in fretta tra il costo e il ritorno. La strada ti ha insegnato l'aritmetica di tuo padre.

'Sì,' rispondi. 'E lei lo sapeva prima di noi.'

Non vi abbracciate. Apparecchiate il tavolo, due piatti, e parlate di scorte, di filtri per l'acqua, del generatore che perde colpi. È la vostra lingua. È sempre stata questa.

Il Safe Place regge perché voi due sapete cosa costa tenerlo in piedi. Nessuno dei due nomina più quella notte. Non serve: cammina con voi, e ha smesso di pesare come una colpa.

È diventata quello che era. Una scelta.`,
    },
    balanced: {
        title: 'Lo spazio',
        text: `Dici la verità com'è, senza smussarla e senza affilarla.

Elian ascolta fino in fondo. Quando finisci, il silenzio tra voi non chiede niente.

'Non so se ti ho salvato o se ti ho condannato a questo mondo,' dice infine.

'Nemmeno io. Ma sono arrivato fin qui.'

È l'unica risposta onesta che possiedi, e a lui basta.

Restate. Il bunker è piccolo, i giorni si somigliano, e va bene così. Certe mattine lo sorprendi a guardarti mentre ripari una trappola, e sai che sta cercando lei nei tuoi gesti. Certe sere sei tu a cercarla nei suoi.

Non avete fatto pace con quella notte. Avete fatto spazio, perché ci stia anche lei.

Il viaggio è finito. Quello che hai portato fin qui, adesso, ha una casa.`,
    },
};

/** Closing line for the choice made on the hill (CS_POINT_OF_NO_RETURN). */
const HILL_CHOICE_LINES: Record<string, string> = {
    CHOSE_TRUTH: 'Sei sceso da quella collina per sapere. Adesso sai, e il sapere non ti ha spezzato.',
    CHOSE_FREEDOM: 'Su quella collina avevi deciso che il viaggio era tuo, non di tuo padre. Lo è stato fino all\'ultimo passo.',
};

const ALIGNMENT_LABELS: Record<EndingKey, string> = {
    lena: 'Compassionevole (Lena)',
    elian: 'Pragmatico (Elian)',
    balanced: 'In equilibrio',
};

/**
 * VictoryScreen component.
 * Shown when the player resolves the final main story chapter on the 'E' tile.
 * Phase 1: moral-compass epilogue. Phase 2: journey stats + THE END.
 */
const VictoryScreen: React.FC = () => {
    const { setGameState, totalSteps, totalCombatWins, gameFlags } = useGameStore();
    const { alignment, level, completedQuests } = useCharacterStore();
    const gameTime = useTimeStore((state) => state.gameTime);
    const textRef = useRef<HTMLDivElement>(null);

    const [phase, setPhase] = useState<'epilogue' | 'end'>('epilogue');

    const endingKey: EndingKey = useMemo(() => {
        const diff = alignment.lena - alignment.elian;
        if (diff > ALIGNMENT_THRESHOLD) return 'lena';
        if (diff < -ALIGNMENT_THRESHOLD) return 'elian';
        return 'balanced';
    }, [alignment]);

    const handleConfirm = useCallback(() => {
        if (phase === 'epilogue') {
            setPhase('end');
        } else {
            setGameState(GameState.MAIN_MENU);
        }
    }, [phase, setGameState]);

    const scroll = useCallback((delta: number) => textRef.current?.scrollBy({ top: delta, behavior: 'smooth' }), []);
    const handlerMap = useMemo(() => ({
        Enter: handleConfirm,
        Escape: handleConfirm,
        w: () => scroll(-120), ArrowUp: () => scroll(-120),
        s: () => scroll(120), ArrowDown: () => scroll(120),
    }), [handleConfirm, scroll]);

    useKeyboardInput(handlerMap);

    const epilogue = EPILOGUES[endingKey];
    const hillLine = Object.keys(HILL_CHOICE_LINES).find(flag => gameFlags.has(flag));

    const paragraphs = epilogue.text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    if (phase === 'epilogue') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-bg0">
                <KeyArt variant="dawn" shade="none" figure={TRAVELLER_FIGURE} />
                <Modal
                    backdrop="soft"
                    accent="gold"
                    icon="sun"
                    eyebrow="Epilogo"
                    title={epilogue.title}
                    size="lg"
                    hints={[{ keys: ['↑↓'], label: 'Scorri' }, { keys: ['INVIO'], label: 'Continua', active: true }]}
                >
                    <div ref={textRef} className="scroll-y fade-edges max-h-[620px] px-16 pb-10">
                        <div className="hairline mb-8" />
                        {paragraphs.map((paragraph, index) => (
                            <p
                                key={index}
                                className={`prose-story mb-6 text-[27px] anim-fade-up ${paragraph.startsWith("'") ? 'italic text-ember2' : ''}`}
                                style={{ animationDelay: `${Math.min(index, 10) * 180}ms` }}
                            >
                                {paragraph}
                            </p>
                        ))}
                        {hillLine && <p className="prose-story mt-10 border-t border-line pt-8 text-[25px] italic text-gold">{HILL_CHOICE_LINES[hillLine]}</p>}
                    </div>
                </Modal>
            </div>
        );
    }

    const stats: { icon: IconName; label: string; value: React.ReactNode }[] = [
        { icon: 'sun', label: 'Giorni di viaggio', value: gameTime.day },
        { icon: 'footsteps', label: 'Passi compiuti', value: totalSteps },
        { icon: 'attack', label: 'Combattimenti vinti', value: totalCombatWins },
        { icon: 'levelUp', label: 'Livello raggiunto', value: level },
        { icon: 'scroll', label: 'Missioni completate', value: completedQuests.length },
        { icon: 'compass', label: 'Bussola morale', value: <span className="text-[26px]">{ALIGNMENT_LABELS[endingKey]}</span> },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden bg-bg0">
            <KeyArt variant="dawn" shade="center" figure={TRAVELLER_FIGURE} />
            <div className="relative flex h-full flex-col items-center justify-center px-20">
                <Logo align="center" scale={0.95} className="anim-fade-up" />
                <div className="mt-14 grid w-[1180px] grid-cols-3 gap-4 anim-fade-up" style={{ animationDelay: '300ms' }}>
                    {stats.map(stat => (
                        <div key={stat.label} className="surface flex items-center gap-5 px-7 py-5">
                            <Icon name={stat.icon} size={30} className="text-gold" />
                            <div>
                                <div className="eyebrow">{stat.label}</div>
                                <div className="mt-1 text-[34px] font-semibold leading-tight text-ink tnum">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <h2 className="title-display mt-16 text-[64px] italic text-gold anim-fade-up" style={{ animationDelay: '700ms', fontWeight: 500 }}>Fine</h2>
                <div className="mt-10 anim-fade-in" style={{ animationDelay: '1200ms' }}>
                    <KeyHints hints={[{ keys: ['INVIO'], label: 'Torna al menu principale' }]} />
                </div>
            </div>
        </div>
    );
};

export default VictoryScreen;
