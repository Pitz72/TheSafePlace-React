/**
 * Test per il componente PostCombatScreen.
 * Verifica il rendering corretto per vittoria e sconfitta.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { PostCombatScreen } from '../components/combat/PostCombatScreen';
import type { CombatResult, LootItem } from '../types/combat';

describe('PostCombatScreen Component', () => {
  const mockOnContinue = jest.fn();
  const mockOnLoadGame = jest.fn();
  const mockOnMainMenu = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schermata di Vittoria', () => {
    const victoryResult: CombatResult = { type: 'victory' };
    const loot: LootItem[] = [
      { id: 'scrap', name: 'Metallo Ruggine', quantity: 2 },
      { id: 'cloth', name: 'Stoffa', quantity: 1 },
    ];

    test('dovrebbe renderizzare il messaggio di vittoria e le ricompense', () => {
      render(
        <PostCombatScreen
          result={victoryResult}
          xpGained={75}
          loot={loot}
          onContinue={mockOnContinue}
          onLoadGame={mockOnLoadGame}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('VITTORIA')).toBeInTheDocument();
      expect(screen.getByText('Hai sconfitto tutti i nemici.')).toBeInTheDocument();
      expect(screen.getByText(/Esperienza Guadagnata:/)).toHaveTextContent('75 XP');
      expect(screen.getByText('Metallo Ruggine x2')).toBeInTheDocument();
      expect(screen.getByText('Stoffa x1')).toBeInTheDocument();
    });

    test('dovrebbe mostrare un messaggio se non c\'è loot', () => {
      render(
        <PostCombatScreen
          result={victoryResult}
          xpGained={75}
          loot={[]}
          onContinue={mockOnContinue}
          onLoadGame={mockOnLoadGame}
          onMainMenu={mockOnMainMenu}
        />
      );
      expect(screen.getByText('Nessun oggetto recuperato.')).toBeInTheDocument();
    });

    test('dovrebbe chiamare onContinue quando si clicca il pulsante', () => {
      render(
        <PostCombatScreen
          result={victoryResult}
          xpGained={75}
          loot={loot}
          onContinue={mockOnContinue}
          onLoadGame={mockOnLoadGame}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Continua'));
      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Schermata di Sconfitta', () => {
    const defeatResult: CombatResult = { type: 'defeat' };

    test('dovrebbe renderizzare il messaggio di sconfitta e le opzioni', () => {
      render(
        <PostCombatScreen
          result={defeatResult}
          xpGained={0}
          loot={[]}
          onContinue={mockOnContinue}
          onLoadGame={mockOnLoadGame}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('SCONFITTA')).toBeInTheDocument();
      expect(screen.getByText('Sei stato sopraffatto e hai perso conoscenza.')).toBeInTheDocument();
      expect(screen.getByText('Carica Ultimo Salvataggio')).toBeInTheDocument();
      expect(screen.getByText('Torna al Menu Principale')).toBeInTheDocument();
    });

    test('dovrebbe chiamare le funzioni corrette quando si cliccano i pulsanti', () => {
      render(
        <PostCombatScreen
          result={defeatResult}
          xpGained={0}
          loot={[]}
          onContinue={mockOnContinue}
          onLoadGame={mockOnLoadGame}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Carica Ultimo Salvataggio'));
      expect(mockOnLoadGame).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('Torna al Menu Principale'));
      expect(mockOnMainMenu).toHaveBeenCalledTimes(1);
    });
  });
});
