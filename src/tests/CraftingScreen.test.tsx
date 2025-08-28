/**
 * Test per il componente CraftingScreen
 * Verifica integrazione componenti, layout e coordinamento
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { CraftingScreen } from '../components/crafting/CraftingScreen';

// Mock dei sotto-componenti
jest.mock('../components/crafting/RecipeList', () => ({
  RecipeListContainer: () => <div data-testid="recipe-list">Recipe List</div>
}));

jest.mock('../components/crafting/RecipeDetails', () => ({
  RecipeDetailsContainer: ({ recipe, materialStatus, meetsSkillRequirement }: any) => (
    <div data-testid="recipe-details">
      Recipe Details - {recipe?.id || 'none'} - Materials: {materialStatus.length} - Skills: {meetsSkillRequirement.toString()}
    </div>
  )
}));

jest.mock('../components/crafting/ItemPreview', () => ({
  ItemPreviewContainer: ({ resultItemId, resultQuantity }: any) => (
    <div data-testid="item-preview">
      Item Preview - {resultItemId} x{resultQuantity}
    </div>
  )
}));

jest.mock('../components/crafting/CraftingActionBar', () => ({
  CraftingActionBarContainer: ({ canCraft, onCraft, onExit }: any) => (
    <div data-testid="action-bar">
      <button onClick={onCraft} disabled={!canCraft}>
        Craft {canCraft ? 'Enabled' : 'Disabled'}
      </button>
      <button onClick={onExit}>Exit</button>
    </div>
  )
}));

// Mock del crafting store
const mockCraftingStore = {
  allRecipes: [],
  selectedRecipeIndex: 0,
  isOpen: false,
  initializeRecipes: jest.fn(),
  syncWithGameStore: jest.fn(),
  closeCrafting: jest.fn(),
  getSelectedRecipe: jest.fn(),
  getAvailableRecipes: jest.fn(),
  canCraftRecipe: jest.fn(),
  craftItem: jest.fn(),
  setSelectedRecipe: jest.fn()
};

jest.mock('../stores/craftingStore', () => ({
  useCraftingStore: () => mockCraftingStore
}));

// Mock del game store
const mockGameStore = {
  characterSheet: {
    inventory: [],
    stats: { adattamento: 10, potenza: 8, percezione: 12 }
  },
  items: {
    'knife_sharp': { name: 'Coltello Affilato' },
    'bandages_clean': { name: 'Bende Pulite' }
  }
};

jest.mock('../stores/gameStore', () => ({
  useGameStore: () => mockGameStore
}));

// Mock delle utility
jest.mock('../utils/craftingUtils', () => ({
  getMaterialStatus: jest.fn(() => []),
  meetsSkillRequirement: jest.fn(() => true)
}));

// Ricetta di test
const testRecipe = {
  id: 'test_knife',
  resultItemId: 'knife_sharp',
  resultQuantity: 1,
  components: [
    { itemId: 'knife_dull', quantity: 1 },
    { itemId: 'whetstone', quantity: 1 }
  ]
};

describe('CraftingScreen Component', () => {
  const mockOnExit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations
    mockCraftingStore.initializeRecipes.mockResolvedValue(undefined);
    mockCraftingStore.getSelectedRecipe.mockReturnValue(null);
    mockCraftingStore.getAvailableRecipes.mockReturnValue([]);
    mockCraftingStore.canCraftRecipe.mockReturnValue(false);
    mockCraftingStore.allRecipes = [];
  });

  describe('Inizializzazione', () => {
    test('dovrebbe mostrare stato di caricamento durante inizializzazione', async () => {
      // Mock inizializzazione lenta
      mockCraftingStore.initializeRecipes.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<CraftingScreen onExit={mockOnExit} />);

      expect(screen.getByText('Caricamento Sistema di Crafting')).toBeInTheDocument();
      expect(screen.getByText('Inizializzazione ricette e configurazioni...')).toBeInTheDocument();

      // Aspetta che l'inizializzazione finisca
      await waitFor(() => {
        expect(screen.queryByText('Caricamento Sistema di Crafting')).not.toBeInTheDocument();
      });
    });

    test('dovrebbe inizializzare ricette se non già caricate', async () => {
      mockCraftingStore.allRecipes = []; // Nessuna ricetta caricata

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(mockCraftingStore.initializeRecipes).toHaveBeenCalledTimes(1);
      });
    });

    test('non dovrebbe reinizializzare ricette se già caricate', async () => {
      mockCraftingStore.allRecipes = [testRecipe]; // Ricette già caricate

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(mockCraftingStore.initializeRecipes).not.toHaveBeenCalled();
      });
    });

    test('dovrebbe sincronizzare con game store', async () => {
      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(mockCraftingStore.syncWithGameStore).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Gestione errori', () => {
    test('dovrebbe mostrare stato di errore se inizializzazione fallisce', async () => {
      mockCraftingStore.initializeRecipes.mockRejectedValue(new Error('Initialization failed'));

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByText('Errore Sistema di Crafting')).toBeInTheDocument();
        expect(screen.getByText('Errore inizializzazione crafting: Initialization failed')).toBeInTheDocument();
      });
    });

    test('dovrebbe permettere di uscire dallo stato di errore', async () => {
      mockCraftingStore.initializeRecipes.mockRejectedValue(new Error('Test error'));

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        const exitButton = screen.getByText('Torna al Rifugio');
        fireEvent.click(exitButton);
        expect(mockOnExit).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Layout e componenti', () => {
    beforeEach(async () => {
      mockCraftingStore.allRecipes = [testRecipe];
      mockCraftingStore.getAvailableRecipes.mockReturnValue([testRecipe]);
    });

    test('dovrebbe renderizzare tutti i sotto-componenti', async () => {
      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
        expect(screen.getByTestId('recipe-details')).toBeInTheDocument();
        expect(screen.getByTestId('item-preview')).toBeInTheDocument();
        expect(screen.getByTestId('action-bar')).toBeInTheDocument();
      });
    });

    test('dovrebbe mostrare header con titolo e informazioni', async () => {
      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByText('BANCO DI LAVORO')).toBeInTheDocument();
        expect(screen.getByText('1 ricetta disponibile')).toBeInTheDocument();
        expect(screen.getByText('[ESC] Esci dal Banco di Lavoro')).toBeInTheDocument();
      });
    });

    test('dovrebbe mostrare informazioni ricetta selezionata nell\'header', async () => {
      mockCraftingStore.getSelectedRecipe.mockReturnValue(testRecipe);

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByText('• Selezionata:')).toBeInTheDocument();
        expect(screen.getByText('Coltello Affilato')).toBeInTheDocument();
      });
    });
  });

  describe('Gestione input tastiera', () => {
    beforeEach(async () => {
      mockCraftingStore.allRecipes = [testRecipe];
    });

    test('dovrebbe uscire quando si preme ESC', async () => {
      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(mockCraftingStore.closeCrafting).toHaveBeenCalledTimes(1);
        expect(mockOnExit).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Azioni crafting', () => {
    beforeEach(async () => {
      mockCraftingStore.allRecipes = [testRecipe];
      mockCraftingStore.getSelectedRecipe.mockReturnValue(testRecipe);
      mockCraftingStore.getAvailableRecipes.mockReturnValue([testRecipe]);
      mockCraftingStore.canCraftRecipe.mockReturnValue(true);
    });

    test('dovrebbe abilitare crafting quando possibile', async () => {
      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByText('Craft Enabled')).toBeInTheDocument();
      });
    });

    test('dovrebbe eseguire crafting quando richiesto', async () => {
      mockCraftingStore.craftItem.mockResolvedValue(true);

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        const craftButton = screen.getByText('Craft Enabled');
        fireEvent.click(craftButton);
        expect(mockCraftingStore.craftItem).toHaveBeenCalledWith('test_knife');
      });
    });

    test('dovrebbe aggiornare selezione dopo crafting riuscito', async () => {
      mockCraftingStore.craftItem.mockResolvedValue(true);
      mockCraftingStore.selectedRecipeIndex = 1;
      mockCraftingStore.getAvailableRecipes.mockReturnValue([]); // Nessuna ricetta dopo crafting

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        const craftButton = screen.getByText('Craft Enabled');
        fireEvent.click(craftButton);
      });

      await waitFor(() => {
        expect(mockCraftingStore.setSelectedRecipe).toHaveBeenCalledWith(0);
      });
    });

    test('dovrebbe gestire errori durante crafting', async () => {
      mockCraftingStore.craftItem.mockRejectedValue(new Error('Crafting failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        const craftButton = screen.getByText('Craft Enabled');
        fireEvent.click(craftButton);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Crafting failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Stato derivato', () => {
    test('dovrebbe calcolare stato materiali per ricetta selezionata', async () => {
      mockCraftingStore.getSelectedRecipe.mockReturnValue(testRecipe);
      const { getMaterialStatus } = require('../utils/craftingUtils');

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(getMaterialStatus).toHaveBeenCalledWith(
          testRecipe,
          mockGameStore.characterSheet.inventory,
          mockGameStore.items
        );
      });
    });

    test('dovrebbe verificare requisiti abilità per ricetta selezionata', async () => {
      mockCraftingStore.getSelectedRecipe.mockReturnValue(testRecipe);
      const { meetsSkillRequirement } = require('../utils/craftingUtils');

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(meetsSkillRequirement).toHaveBeenCalledWith(
          testRecipe,
          mockGameStore.characterSheet
        );
      });
    });

    test('dovrebbe gestire assenza di ricetta selezionata', async () => {
      mockCraftingStore.getSelectedRecipe.mockReturnValue(null);

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByTestId('recipe-details')).toHaveTextContent('Recipe Details - none - Materials: 0 - Skills: true');
        expect(screen.getByTestId('item-preview')).toHaveTextContent('Item Preview -  x1');
      });
    });
  });

  describe('Responsive layout', () => {
    test('dovrebbe applicare larghezze corrette alle sezioni', async () => {
      mockCraftingStore.allRecipes = [testRecipe];

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        const recipeListSection = screen.getByTestId('recipe-list').closest('div');
        const recipeDetailsSection = screen.getByTestId('recipe-details').closest('div');
        const itemPreviewSection = screen.getByTestId('item-preview').closest('div');

        expect(recipeListSection).toHaveStyle('width: 25%');
        expect(recipeDetailsSection).toHaveStyle('width: 40%');
        expect(itemPreviewSection).toHaveStyle('width: 35%');
      });
    });
  });

  describe('Cleanup', () => {
    test('dovrebbe pulire event listeners su unmount', async () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        unmount();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      });

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    test('dovrebbe gestire game store senza character sheet', async () => {
      const gameStoreWithoutCharacter = {
        ...mockGameStore,
        characterSheet: null
      };

      jest.doMock('../stores/gameStore', () => ({
        useGameStore: () => gameStoreWithoutCharacter
      }));

      render(<CraftingScreen onExit={mockOnExit} />);

      // Non dovrebbe crashare
      await waitFor(() => {
        expect(screen.getByText('BANCO DI LAVORO')).toBeInTheDocument();
      });
    });

    test('dovrebbe gestire ricette senza nome oggetto', async () => {
      const recipeWithUnknownItem = {
        ...testRecipe,
        resultItemId: 'unknown_item'
      };

      mockCraftingStore.getSelectedRecipe.mockReturnValue(recipeWithUnknownItem);

      render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByText('Oggetto Sconosciuto')).toBeInTheDocument();
      });
    });

    test('dovrebbe gestire plurali correttamente', async () => {
      // Test con 0 ricette
      mockCraftingStore.getAvailableRecipes.mockReturnValue([]);

      const { rerender } = render(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByText('0 ricette disponibili')).toBeInTheDocument();
      });

      // Test con 1 ricetta
      mockCraftingStore.getAvailableRecipes.mockReturnValue([testRecipe]);

      rerender(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByText('1 ricetta disponibile')).toBeInTheDocument();
      });

      // Test con multiple ricette
      mockCraftingStore.getAvailableRecipes.mockReturnValue([testRecipe, testRecipe]);

      rerender(<CraftingScreen onExit={mockOnExit} />);

      await waitFor(() => {
        expect(screen.getByText('2 ricette disponibili')).toBeInTheDocument();
      });
    });
  });
});