import React, { useCallback, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

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

const ALIGNMENT_LABELS: Record<EndingKey, string> = {
    lena: 'COMPASSIONEVOLE (LENA)',
    elian: 'PRAGMATICO (ELIAN)',
    balanced: 'IN EQUILIBRIO',
};

/**
 * VictoryScreen component.
 * Shown when the player resolves the final main story chapter on the 'E' tile.
 * Phase 1: moral-compass epilogue. Phase 2: journey stats + THE END.
 */
const VictoryScreen: React.FC = () => {
    const { setGameState, totalSteps, totalCombatWins } = useGameStore();
    const { alignment, level } = useCharacterStore();
    const gameTime = useTimeStore((state) => state.gameTime);

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

    const handlerMap = useMemo(() => ({
        'Enter': handleConfirm,
        'Escape': handleConfirm,
    }), [handleConfirm]);

    useKeyboardInput(handlerMap);

    const epilogue = EPILOGUES[endingKey];

    if (phase === 'epilogue') {
        return (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
                <div className="w-full max-w-6xl border-8 border-double border-yellow-400/50 flex flex-col p-8">
                    <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6 text-yellow-300" style={{ textShadow: '0 0 8px #facc15' }}>
                        ═══ Epilogo: {epilogue.title} ═══
                    </h1>
                    <div
                        className="w-full h-96 border-2 border-green-400/30 p-4 overflow-y-auto mb-8 text-3xl"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        <pre className="whitespace-pre-wrap leading-relaxed">{epilogue.text}</pre>
                    </div>
                    <div className="flex-shrink-0 text-center text-3xl mt-4 border-t-4 border-double border-green-400/50 pt-4 animate-pulse">
                        [INVIO] Continua...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 text-green-400">
            <h1 className="text-8xl text-center font-black tracking-widest uppercase" style={{ textShadow: '0 0 8px #4ade80' }}>
                THE SAFE PLACE
            </h1>
            <p className="text-4xl text-center mt-4 italic text-yellow-300" style={{ textShadow: '0 0 8px #facc15' }}>
                The Echo of the Journey
            </p>

            <div className="mt-12 text-3xl text-gray-300 space-y-3 text-center">
                <p>Giorni di viaggio: <span className="text-green-400 font-bold">{gameTime.day}</span></p>
                <p>Passi compiuti: <span className="text-green-400 font-bold">{totalSteps}</span></p>
                <p>Combattimenti vinti: <span className="text-green-400 font-bold">{totalCombatWins}</span></p>
                <p>Livello raggiunto: <span className="text-green-400 font-bold">{level}</span></p>
                <p>Bussola morale: <span className="text-yellow-300 font-bold">{ALIGNMENT_LABELS[endingKey]}</span></p>
            </div>

            <h2 className="text-6xl text-center font-bold tracking-widest uppercase mt-16 text-yellow-300" style={{ textShadow: '0 0 8px #facc15' }}>
                ─ LA FINE ─
            </h2>

            <div className="flex-shrink-0 text-center text-3xl mt-12 pt-4 text-gray-300 animate-pulse">
                [INVIO per tornare al Menu Principale]
            </div>
        </div>
    );
};

export default VictoryScreen;
