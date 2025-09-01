/**
 * Test per il componente CombatScreen
 * Verifica il corretto assemblaggio e il passaggio di dati.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { CombatScreen } from '../components/combat/CombatScreen';

// Mock dei componenti figli per isolare CombatScreen (corretti per default export)
jest.mock('../components/combat/SceneDescription', () => {
  return function DummySceneDescription({ description }: { description: string }) {
    return <div data-testid="scene-description">{description}</div>;
  };
});
jest.mock('../components/combat/CombatStatus', () => {
  return function DummyCombatStatus({ player, enemies }: any) {
    return <div data-testid="combat-status">Player: {player ? player.name : 'N/A'}, Enemies: {enemies.length}</div>;
  };
});
jest.mock('../components/combat/CombatLog', () => {
  return function DummyCombatLog({ entries }: any) {
    return <div data-testid="combat-log">Entries: {entries.length}</div>;
  };
});
jest.mock('../components/combat/ActionMenu', () => {
  return function DummyActionMenu({ availableActions }: any) {
    return <div data-testid="action-menu">Actions: {availableActions.length}</div>;
  };
});
jest.mock('../components/combat/TargetSelector', () => {
  return function DummyTargetSelector({ enemies }: any) {
    return <div data-testid="target-selector">Targets: {enemies.length}</div>;
  };
});

// Mock degli store
const mockCombatStoreState = {
  isInCombat: true,
  encounter: { id: 'enc1', description: 'Una battaglia epica!', enemies: ['bandit1'] },
  player: { id: 'player1', name: 'Eroe' },
  enemies: [{ id: 'bandit1', name: 'Bandito', hp: 10, maxHp: 10, ac: 12 }],
  log: [{ type: 'info', message: 'Il combattimento inizia!' }],
  availableActions: ['attack', 'defend'],
  selectedAction: 'attack',
  selectedTargetId: 'bandit1',
  selectAction: jest.fn(),
  selectTarget: jest.fn(),
  executePlayerAction: jest.fn(),
};

const mockGameStoreState = {
  characterSheet: { name: 'Eroe' }
};

jest.mock('../stores/combatStore', () => ({
  useCombatStore: jest.fn(),
}));

jest.mock('../stores/gameStore', () => ({
  useGameStore: jest.fn(),
}));

// Type assertion per i mock
const useCombatStoreMock = jest.requireMock('../stores/combatStore').useCombatStore;
const useGameStoreMock = jest.requireMock('../stores/gameStore').useGameStore;

describe('CombatScreen Component', () => {

  beforeEach(() => {
    useCombatStoreMock.mockReturnValue(mockCombatStoreState);
    // Mock l'implementazione per gestire il selettore
    useGameStoreMock.mockImplementation(selector => selector(mockGameStoreState));
    jest.clearAllMocks();
  });

  test('dovrebbe renderizzare tutti i componenti figli quando in combattimento', () => {
    render(<CombatScreen />);

    expect(screen.getByTestId('scene-description')).toBeInTheDocument();
    expect(screen.getByTestId('combat-status')).toBeInTheDocument();
    expect(screen.getByTestId('combat-log')).toBeInTheDocument();
    expect(screen.getByTestId('action-menu')).toBeInTheDocument();
    expect(screen.getByTestId('target-selector')).toBeInTheDocument();
  });

  test('dovrebbe passare le props corrette ai componenti figli', () => {
    // Non c'è bisogno di re-mockare gameStore se il beforeEach è corretto
    useCombatStoreMock.mockReturnValue(mockCombatStoreState);

    render(<CombatScreen />);

    // Il mock di CombatStatus si aspetta player.name
    // CombatScreen passa gameCharacter (che è characterSheet) come prop 'player'
    // Quindi il mock riceve player={name: 'Eroe'}
    expect(screen.getByTestId('scene-description')).toHaveTextContent('Una battaglia epica!');
    expect(screen.getByTestId('combat-status')).toHaveTextContent('Player: Eroe, Enemies: 1');
    expect(screen.getByTestId('combat-log')).toHaveTextContent('Entries: 1');
    expect(screen.getByTestId('action-menu')).toHaveTextContent('Actions: 2');
    expect(screen.getByTestId('target-selector')).toHaveTextContent('Targets: 1');
  });

  test('non dovrebbe renderizzare nulla se non in combattimento', () => {
    useCombatStoreMock.mockReturnValue({ ...mockCombatStoreState, isInCombat: false });

    const { container } = render(<CombatScreen />);

    expect(container).toBeEmptyDOMElement();
  });

  test('dovrebbe chiamare executePlayerAction quando si clicca il pulsante di conferma', () => {
    render(<CombatScreen />);

    const confirmButton = screen.getByText('CONFERMA AZIONE');
    fireEvent.click(confirmButton);

    expect(mockCombatStoreState.executePlayerAction).toHaveBeenCalledTimes(1);
  });
});
