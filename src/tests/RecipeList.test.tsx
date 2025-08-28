/**
 * Test per il componente RecipeList
 * Verifica rendering, navigazione e interazioni
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { RecipeList } from '../components/crafting/RecipeList';
import type { Recipe } from '../types/crafting';

// Mock delle dipendenze
jest.mock('../stores/craftingStore', () => ({
  useCraftingStore: () => ({
    knownRecipeIds: ['test_knife', 'test_bandages']
  })
}));

jest.mock('../stores/gameStore', () => ({
  useGameStore: () => ({
    characterSheet: {
      inventory: [
        { itemId: 'knife_dull', quantity: 1 },
        { itemId: 'whetstone', quantity: 1 }
      ],
      stats: { adattamento: 10, potenza: 8, percezione: 12 }
    },
    items: {
      'knife_sharp': { name: 'Coltello Affilato' },
      'bandages_clean': { name: 'Bende Pulite' }
    }
  })
}));

jest.mock('../utils/craftingUtils', () => ({
  canCraftRecipe: jest.fn((recipe: any) => {
    // Mock: coltello è craftabile, bende no
    return recipe.id === 'test_knife';
  }),
  getMaterialStatus: jest.fn()
}));

// Ricette di test
const testRecipes: Recipe[] = [
  {
    id: 'test_knife',
    resultItemId: 'knife_sharp',
    resultQuantity: 1,
    components: [
      { itemId: 'knife_dull', quantity: 1 },
      { itemId: 'whetstone', quantity: 1 }
    ],
    category: 'weapons',
    description: 'Test knife recipe'
  },
  {
    id: 'test_bandages',
    resultItemId: 'bandages_clean',
    resultQuantity: 2,
    components: [
      { itemId: 'bandages_dirty', quantity: 2 },
      { itemId: 'alcohol', quantity: 1 }
    ],
    category: 'consumables',
    description: 'Test bandages recipe',
    skillRequirement: {
      skill: 'crafting',
      level: 2
    }
  }
];

describe('RecipeList Component', () => {
  const mockOnSelectionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('dovrebbe renderizzare la lista delle ricette', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText('RICETTE CONOSCIUTE')).toBeInTheDocument();
      expect(screen.getByText('Coltello Affilato')).toBeInTheDocument();
      expect(screen.getByText('Bende Pulite')).toBeInTheDocument();
      expect(screen.getByText('2 ricette conosciute')).toBeInTheDocument();
    });

    test('dovrebbe mostrare stato vuoto quando non ci sono ricette', () => {
      render(
        <RecipeList
          recipes={[]}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText('Non conosci ancora nessuna ricetta.')).toBeInTheDocument();
      expect(screen.getByText('0 ricette conosciute')).toBeInTheDocument();
    });

    test('dovrebbe evidenziare la ricetta selezionata', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={1}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const selectedItem = screen.getByText('Bende Pulite').closest('.recipe-item');
      expect(selectedItem).toHaveClass('bg-phosphor-900');
    });

    test('dovrebbe mostrare indicatori di disponibilità', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText('Disponibile')).toBeInTheDocument();
      expect(screen.getByText('Non Disponibile')).toBeInTheDocument();
    });

    test('dovrebbe mostrare quantità quando maggiore di 1', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText('x2')).toBeInTheDocument(); // Per le bende
    });

    test('dovrebbe mostrare categoria delle ricette', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText('weapons')).toBeInTheDocument();
      expect(screen.getByText('consumables')).toBeInTheDocument();
    });

    test('dovrebbe mostrare requisiti di abilità quando presenti', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText('Richiede: crafting Lv.2')).toBeInTheDocument();
    });
  });

  describe('Interazioni Mouse', () => {
    test('dovrebbe chiamare onSelectionChange quando si clicca su una ricetta', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const secondRecipe = screen.getByText('Bende Pulite').closest('.recipe-item');
      fireEvent.click(secondRecipe!);

      expect(mockOnSelectionChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Navigazione Tastiera', () => {
    test('dovrebbe navigare in su con tasto W', async () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={1}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      fireEvent.keyDown(window, { key: 'w' });

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith(0);
      });
    });

    test('dovrebbe navigare in giù con tasto S', async () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      fireEvent.keyDown(window, { key: 's' });

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith(1);
      });
    });

    test('dovrebbe navigare con frecce direzionali', async () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      fireEvent.keyDown(window, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith(1);
      });

      fireEvent.keyDown(window, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith(0);
      });
    });

    test('dovrebbe fare wrap around alla fine della lista', async () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={1} // Ultima ricetta
          onSelectionChange={mockOnSelectionChange}
        />
      );

      fireEvent.keyDown(window, { key: 's' });

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith(0); // Torna alla prima
      });
    });

    test('dovrebbe fare wrap around all\'inizio della lista', async () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0} // Prima ricetta
          onSelectionChange={mockOnSelectionChange}
        />
      );

      fireEvent.keyDown(window, { key: 'w' });

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith(1); // Va all'ultima
      });
    });

    test('non dovrebbe navigare se non ci sono ricette', async () => {
      render(
        <RecipeList
          recipes={[]}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      fireEvent.keyDown(window, { key: 'w' });
      fireEvent.keyDown(window, { key: 's' });

      await waitFor(() => {
        expect(mockOnSelectionChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibilità', () => {
    test('dovrebbe avere attributi ARIA corretti', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'RICETTE CONOSCIUTE');

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
      expect(options[1]).toHaveAttribute('aria-selected', 'false');
    });

    test('dovrebbe gestire correttamente il tabindex', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('tabIndex', '0'); // Selezionato
      expect(options[1]).toHaveAttribute('tabIndex', '-1'); // Non selezionato
    });
  });

  describe('Styling e CSS', () => {
    test('dovrebbe applicare classi CSS corrette per disponibilità', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const availableRecipe = screen.getByText('Coltello Affilato').closest('.recipe-item');
      const unavailableRecipe = screen.getByText('Bende Pulite').closest('.recipe-item');

      expect(availableRecipe).toHaveClass('text-green-400');
      expect(unavailableRecipe).toHaveClass('text-gray-500');
    });

    test('dovrebbe mostrare badge di stato colorati', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const availableBadge = screen.getByText('Disponibile');
      const unavailableBadge = screen.getByText('Non Disponibile');

      expect(availableBadge).toHaveClass('bg-green-900', 'text-green-300');
      expect(unavailableBadge).toHaveClass('bg-gray-700', 'text-gray-400');
    });
  });

  describe('Performance', () => {
    test('dovrebbe gestire liste lunghe senza problemi', () => {
      const manyRecipes = Array.from({ length: 100 }, (_, i) => ({
        ...testRecipes[0],
        id: `recipe_${i}`,
        resultItemId: `item_${i}`
      }));

      const { container } = render(
        <RecipeList
          recipes={manyRecipes}
          selectedIndex={50}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(container.querySelectorAll('.recipe-item')).toHaveLength(100);
    });
  });

  describe('Edge Cases', () => {
    test('dovrebbe gestire ricette senza nome oggetto', () => {
      const recipeWithoutItem: Recipe = {
        id: 'unknown_recipe',
        resultItemId: 'unknown_item',
        resultQuantity: 1,
        components: [],
        description: 'Unknown recipe'
      };

      render(
        <RecipeList
          recipes={[recipeWithoutItem]}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText('Oggetto Sconosciuto')).toBeInTheDocument();
    });

    test('dovrebbe gestire indici di selezione fuori range', () => {
      render(
        <RecipeList
          recipes={testRecipes}
          selectedIndex={999} // Indice troppo alto
          onSelectionChange={mockOnSelectionChange}
        />
      );

      // Non dovrebbe crashare e dovrebbe renderizzare normalmente
      expect(screen.getByText('RICETTE CONOSCIUTE')).toBeInTheDocument();
    });

    test('dovrebbe gestire ricette senza categoria', () => {
      const recipeWithoutCategory: Recipe = {
        id: 'no_category',
        resultItemId: 'knife_sharp',
        resultQuantity: 1,
        components: [],
        description: 'No category recipe'
      };

      render(
        <RecipeList
          recipes={[recipeWithoutCategory]}
          selectedIndex={0}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      // Dovrebbe renderizzare senza categoria
      expect(screen.getByText('Coltello Affilato')).toBeInTheDocument();
    });
  });
});