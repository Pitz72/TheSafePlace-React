/**
 * Test per il componente CraftingActionBar
 * Verifica rendering, interazioni e gestione comandi tastiera
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { CraftingActionBar } from '../components/crafting/CraftingActionBar';

describe('CraftingActionBar Component', () => {
  const mockOnCraft = jest.fn();
  const mockOnExit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering base', () => {
    test('dovrebbe renderizzare i pulsanti principali', () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      expect(screen.getByRole('button', { name: /Crea Oggetto/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Esci/i })).toBeInTheDocument();
    });

    test('dovrebbe mostrare comandi tastiera', () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      expect(screen.getByText('Enter')).toBeInTheDocument();
      expect(screen.getByText('ESC')).toBeInTheDocument();
      expect(screen.getByText('Crea')).toBeInTheDocument();
      // Cerca il testo 'Esci' che non sia dentro un bottone
      const keyHint = screen.getAllByText('Esci').find(el => el.tagName.toLowerCase() !== 'button');
      expect(keyHint).toBeInTheDocument();
    });
  });

  describe('Stato craftabile', () => {
    test('dovrebbe mostrare stato pronto quando può craftare', () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('Pronto per Creare')).toBeInTheDocument();
    });

    test('dovrebbe abilitare pulsante craft quando può craftare', () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      expect(craftButton).not.toBeDisabled();
      expect(craftButton).toHaveClass('bg-green-600');
    });

    test('dovrebbe mostrare testo di aiuto quando può craftare', () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      expect(screen.getByText('Premi Invio per creare l\'oggetto o ESC per tornare al rifugio')).toBeInTheDocument();
    });
  });

  describe('Stato non craftabile', () => {
    test('dovrebbe mostrare stato non pronto quando non può craftare', () => {
      render(
        <CraftingActionBar
          canCraft={false}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(screen.getByText('Requisiti non soddisfatti')).toBeInTheDocument();
    });

    test('dovrebbe disabilitare pulsante craft quando non può craftare', () => {
      render(
        <CraftingActionBar
          canCraft={false}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      expect(craftButton).toBeDisabled();
      expect(craftButton).toHaveClass('bg-gray-700');
    });

    test('dovrebbe mostrare testo di aiuto per requisiti mancanti', () => {
      render(
        <CraftingActionBar
          canCraft={false}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      expect(screen.getByText('Raccogli i materiali necessari e soddisfa i requisiti di abilità per procedere')).toBeInTheDocument();
    });
  });

  describe('Interazioni mouse', () => {
    test('dovrebbe chiamare onCraft quando si clicca il pulsante craft', async () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      fireEvent.click(craftButton);

      await waitFor(() => {
        expect(mockOnCraft).toHaveBeenCalledTimes(1);
      });
    });

    test('non dovrebbe chiamare onCraft quando pulsante è disabilitato', () => {
      render(
        <CraftingActionBar
          canCraft={false}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      fireEvent.click(craftButton);

      expect(mockOnCraft).not.toHaveBeenCalled();
    });

    test('dovrebbe chiamare onExit quando si clicca il pulsante exit', () => {
      jest.useFakeTimers();
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      const exitButton = screen.getByRole('button', { name: /Esci/i });
      fireEvent.click(exitButton);

      // Avanza i timer per coprire il setTimeout nel componente
      jest.runAllTimers();

      expect(mockOnExit).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });
  });

  describe('Interazioni tastiera', () => {
    test('dovrebbe chiamare onCraft quando si preme Invio', async () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(mockOnCraft).toHaveBeenCalledTimes(1);
      });
    });

    test('dovrebbe chiamare onCraft quando si preme Spazio', async () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      fireEvent.keyDown(window, { key: ' ' });

      await waitFor(() => {
        expect(mockOnCraft).toHaveBeenCalledTimes(1);
      });
    });

    test('non dovrebbe chiamare onCraft con Invio quando non può craftare', () => {
      render(
        <CraftingActionBar
          canCraft={false}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      fireEvent.keyDown(window, { key: 'Enter' });

      expect(mockOnCraft).not.toHaveBeenCalled();
    });

    test('dovrebbe chiamare onExit quando si preme ESC', () => {
      jest.useFakeTimers();
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });

      // Avanza i timer
      jest.runAllTimers();

      expect(mockOnExit).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });
  });

  describe('Stato processing', () => {
    test('dovrebbe mostrare stato processing durante crafting', async () => {
      // Mock onCraft che simula delay
      const slowMockOnCraft = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={slowMockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      fireEvent.click(craftButton);

      // Dovrebbe mostrare stato processing
      await waitFor(() => {
        expect(screen.getByText('Creando...')).toBeInTheDocument();
        expect(screen.getByText('Elaborazione in corso...')).toBeInTheDocument();
      });
    });

    test('dovrebbe disabilitare azioni durante processing', async () => {
      const slowMockOnCraft = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={slowMockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      const exitButton = screen.getByRole('button', { name: /Esci/i });
      
      fireEvent.click(craftButton);

      await waitFor(() => {
        expect(exitButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      });

      // Tentativo di premere ESC durante processing
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnExit).not.toHaveBeenCalled();
    });

    test('dovrebbe prevenire doppio crafting durante processing', async () => {
      const slowMockOnCraft = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={slowMockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      
      // Primo click
      fireEvent.click(craftButton);
      
      // Secondo click immediato
      fireEvent.click(craftButton);

      await waitFor(() => {
        expect(slowMockOnCraft).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Feedback visivo', () => {
    test('dovrebbe applicare animazioni ai pulsanti', () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      expect(craftButton).toHaveClass('transition-all', 'duration-200');
    });

    test('dovrebbe mostrare spinner durante processing', async () => {
      const slowMockOnCraft = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={slowMockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      fireEvent.click(craftButton);

      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });

    test('dovrebbe applicare hover effects sui pulsanti abilitati', () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      expect(craftButton).toHaveClass('hover:bg-green-500');
    });
  });

  describe('Accessibilità', () => {
    test('dovrebbe avere aria-label sui pulsanti', () => {
      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      const exitButton = screen.getByRole('button', { name: /Esci/i });

      expect(craftButton).toHaveAttribute('aria-label', 'Crea Oggetto');
      expect(exitButton).toHaveAttribute('aria-label', 'Esci');
    });

    test('dovrebbe gestire correttamente lo stato disabled', () => {
      render(
        <CraftingActionBar
          canCraft={false}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      expect(craftButton).toBeDisabled();
      expect(craftButton).toHaveAttribute('disabled');
    });
  });

  describe('Gestione errori', () => {
    test('dovrebbe gestire errori durante crafting', async () => {
      const errorMockOnCraft = jest.fn().mockRejectedValue(new Error('Crafting failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={errorMockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      fireEvent.click(craftButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Crafting action failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    test('dovrebbe ripristinare stato dopo errore', async () => {
      const errorMockOnCraft = jest.fn().mockRejectedValue(new Error('Crafting failed'));

      render(
        <CraftingActionBar
          canCraft={true}
          onCraft={errorMockOnCraft}
          onExit={mockOnExit}
        />
      );

      const craftButton = screen.getByRole('button', { name: /Crea Oggetto/i });
      fireEvent.click(craftButton);

      // Aspetta che l'errore sia gestito e lo stato ripristinato
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Crea Oggetto/i })).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Edge cases', () => {
    test('dovrebbe gestire callback undefined', () => {
      expect(() => {
        render(
          <CraftingActionBar
            canCraft={true}
            onCraft={undefined as any}
            onExit={undefined as any}
          />
        );
      }).not.toThrow();
    });

    test('dovrebbe gestire rapidi cambi di stato canCraft', () => {
      const { rerender } = render(
        <CraftingActionBar
          canCraft={true}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      expect(screen.getByText('Pronto per Creare')).toBeInTheDocument();

      rerender(
        <CraftingActionBar
          canCraft={false}
          onCraft={mockOnCraft}
          onExit={mockOnExit}
        />
      );

      expect(screen.getByText('Requisiti non soddisfatti')).toBeInTheDocument();
    });
  });
});