import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CombatScreen } from '../components/combat/CombatScreen';
import { useCombatStore } from '../stores/combatStore';
import { useGameStore } from '../stores/gameStore';

// --- Mocks ---

// Mock child components robustly to prevent test failures from undefined props.
jest.mock('../components/combat/SceneDescription', () => ({ description }: { description: string }) => <div data-testid="scene-description">{description}</div>);
jest.mock('../components/combat/CombatStatus', () => ({ combatState }: any) => <div data-testid="combat-status">Player: {combatState?.player?.name}, Enemies: {combatState?.enemies?.length}</div>);
jest.mock('../components/combat/CombatLog', () => ({ logEntries }: any) => <div data-testid="combat-log">Entries: {logEntries?.length}</div>);
jest.mock('../components/combat/TargetSelector', () => ({ enemies }: any) => <div data-testid="target-selector">Targets: {enemies?.length}</div>);
// The screen itself has a main confirmation button, so the ActionMenu mock should be simple.
jest.mock('../components/combat/ActionMenu', () => () => <div data-testid="action-menu" />);
jest.mock('../components/combat/PostCombatScreen', () => () => <div data-testid="post-combat-screen">Post Combat</div>);

// Mock the stores themselves.
jest.mock('../stores/combatStore');
jest.mock('../stores/gameStore');

const mockedUseCombatStore = useCombatStore as jest.Mock;
const mockedUseGameStore = useGameStore as jest.Mock;

// --- Test Data ---
const mockCombatState = {
  encounter: { description: 'Una battaglia epica!' },
  player: { name: 'Eroe' },
  enemies: [{ id: 'bandit1', status: 'alive' }],
  log: [{ type: 'info', message: 'Il combattimento inizia!' }],
};

const mockFullCombatStoreState = {
  isActive: true,
  currentState: mockCombatState,
  combatResult: null,
  selectedAction: 'attack', // This is crucial for TargetSelector to appear
  selectedTarget: 0,
  executePlayerAction: jest.fn(),
  selectTarget: jest.fn(),
};

const mockCharacterSheet = {
  name: 'Eroe',
};

describe('CombatScreen Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseCombatStore.mockReturnValue(mockFullCombatStoreState);
    mockedUseGameStore.mockReturnValue({ characterSheet: mockCharacterSheet });
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
    render(<CombatScreen />);
    expect(screen.getByTestId('scene-description')).toHaveTextContent('Una battaglia epica!');
    expect(screen.getByTestId('combat-status')).toHaveTextContent('Player: Eroe, Enemies: 1');
    expect(screen.getByTestId('combat-log')).toHaveTextContent('Entries: 1');
    expect(screen.getByTestId('target-selector')).toHaveTextContent('Targets: 1');
  });

  test('non dovrebbe renderizzare nulla se non in combattimento', () => {
    mockedUseCombatStore.mockReturnValue({ ...mockFullCombatStoreState, isActive: false });
    const { container } = render(<CombatScreen />);
    expect(container).toBeEmptyDOMElement();
  });

  test('dovrebbe renderizzare PostCombatScreen quando il combattimento è finito', () => {
    mockedUseCombatStore.mockReturnValue({ ...mockFullCombatStoreState, isActive: false, combatResult: { type: 'victory' } });
    render(<CombatScreen />);
    expect(screen.getByTestId('post-combat-screen')).toBeInTheDocument();
  });

  test('dovrebbe chiamare executePlayerAction quando si clicca il pulsante di conferma', () => {
    render(<CombatScreen />);
    // The component has its own confirmation button, so we query for that one.
    const confirmButton = screen.getByRole('button', { name: /conferma azione/i });
    fireEvent.click(confirmButton);
    expect(mockFullCombatStoreState.executePlayerAction).toHaveBeenCalledTimes(1);
  });
});