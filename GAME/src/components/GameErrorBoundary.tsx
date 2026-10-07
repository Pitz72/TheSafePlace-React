import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useCombatStore } from '../store/combatStore';
import { useEventStore } from '../store/eventStore';
import { useNarrativeStore } from '../store/narrativeStore';
import { GameState } from '../types';
import { lastSaveSlot } from '../utils/saveFormat';

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
            <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="text-center max-w-3xl p-8 border-2 border-[var(--border-primary)] rounded-lg">
                    <h1 className="text-5xl mb-6 text-[var(--text-danger)] font-bold">ERRORE IMPREVISTO</h1>
                    <p className="text-2xl mb-4 text-[var(--text-primary)] leading-relaxed">
                        Qualcosa si è rotto mentre il gioco disegnava questa schermata.
                    </p>
                    <p className="text-xl mb-8 text-[var(--text-secondary)] opacity-70 break-words">{this.state.error.message}</p>
                    <p className="text-2xl text-[var(--text-primary)]">[INVIO] Torna al menu principale</p>
                    {canLoad && <p className="text-2xl mt-2 text-[var(--text-primary)]">[C] Carica l'ultimo salvataggio</p>}
                </div>
            </div>
        );
    }
}

export default GameErrorBoundary;
