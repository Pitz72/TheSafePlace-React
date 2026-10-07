import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameErrorBoundary from '../components/GameErrorBoundary';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';

let broken = true;
const Screen: React.FC = () => {
    if (broken) throw new Error('schermata rotta');
    return <p>schermata funzionante</p>;
};

describe('error boundary', () => {
    it('a screen that crashes shows a way out instead of a black window', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        useGameStore.setState({ gameState: GameState.IN_GAME });
        render(<GameErrorBoundary><Screen /></GameErrorBoundary>);
        expect(screen.getByText('ERRORE IMPREVISTO')).toBeInTheDocument();
        expect(screen.getByText('schermata rotta')).toBeInTheDocument();

        broken = false;
        fireEvent.keyDown(window, { key: 'Enter' });
        expect(useGameStore.getState().gameState).toBe(GameState.MAIN_MENU);
        expect(screen.getByText('schermata funzionante')).toBeInTheDocument();
    });
});
