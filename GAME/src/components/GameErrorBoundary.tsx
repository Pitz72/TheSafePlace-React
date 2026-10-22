import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useCombatStore } from '../store/combatStore';
import { useEventStore } from '../store/eventStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { GameState } from '../types';
import { lastSaveSlot } from '../utils/saveFormat';
import Icon from './ui/Icon';
import KeyHints from './ui/KeyHints';

interface GameErrorBoundaryState {
    error: Error | null;
}

/**
 * Last line of defence: an exception while drawing a screen shows this panel
 * instead of a black window. ENTER goes back to the main menu, C reloads the
 * last save.
 */
class GameErrorBoundary extends React.Component<{ children: React.ReactNode }, GameErrorBoundaryState> {
    state: GameErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): GameErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Errore durante il disegno della schermata:', error, info.componentStack);
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleKey);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKey);
    }

    private handleKey = (event: KeyboardEvent) => {
        if (!this.state.error) return;
        if (event.key === 'Enter') this.recover(false);
        else if ((event.key === 'c' || event.key === 'C') && lastSaveSlot() !== null) this.recover(true);
    };

    private recover(loadLastSave: boolean) {
        // Close whatever was open when the screen broke.
        useCombatStore.getState().reset();
        useEventStore.setState({ activeEvent: null, eventResolutionText: null, pendingCombatEnemyId: null });
        useNarrativeStore.getState().reset();
        const slot = lastSaveSlot();
        const loaded = loadLastSave && slot !== null && useGameStore.getState().loadGame(slot);
        if (!loaded) useGameStore.getState().setGameState(GameState.MAIN_MENU);
        this.setState({ error: null });
    }

    render() {
        if (!this.state.error) return this.props.children;
        const canLoad = lastSaveSlot() !== null;
        return (
            <div className="flex h-full w-full items-center justify-center bg-bg0 p-10">
                <div className="surface w-full max-w-[820px] px-12 py-10 text-center">
                    <Icon name="warning" size={44} className="mx-auto text-danger" />
                    <h1 className="eyebrow mt-5 text-danger">ERRORE IMPREVISTO</h1>
                    <p className="title-display mt-4 text-[40px] text-ink">
                        Qualcosa si è rotto mentre il gioco disegnava questa schermata.
                    </p>
                    <p className="mt-4 break-words text-[18px] text-ink3">{this.state.error.message}</p>
                    <div className="mt-9">
                        <KeyHints
                            hints={[
                                { keys: ['INVIO'], label: 'Torna al menu principale' },
                                ...(canLoad ? [{ keys: ['C'], label: "Carica l'ultimo salvataggio" }] : []),
                            ]}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default GameErrorBoundary;
