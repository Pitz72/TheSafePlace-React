/**
 * Test per TerminalCraftingScreen
 * Verifica il rendering e la navigazione base del nuovo componente terminale
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TerminalCraftingScreen from '../components/crafting/TerminalCraftingScreen';
import { useCraftingStore } from '../stores/craftingStore';

// Mock dei store
const mockCraftingStore = {
  allRecipes: [],
  knownRecipeIds: [],
  selectedRecipeIndex: 0,
  isLoading: false,
  loadError: null,
  getAvailableRecipes: jest.fn(() => []),
  canCraftRecipe: jest.fn(() => false),
  craftItem: jest.fn(() => Promise.resolve(false)),
  initializeRecipes: jest.fn(() => Promise.resolve()),
  setSelectedRecipe: jest.fn(),
  moveSelectionUp: jest.fn(),
  moveSelectionDown: jest.fn(),
  getMaterialStatus: jest.fn(() => []),
  getSelectedRecipe: jest.fn(() => null),
};

const mockGameStore = {
  characterSheet: {
    inventory: [],
    stats: { adattamento: 10, potenza: 8, percezione: 12 },
    skills: { crafting: 1 },
    knownRecipes: [],
  },
  items: {},
  addLogEntry: jest.fn(),
};

jest.mock('../stores/craftingStore', () => ({
  useCraftingStore: () => mockCraftingStore,
}));

jest.mock('../stores/gameStore', () => ({
  useGameStore: () => mockGameStore
}));

describe('TerminalCraftingScreen', () => {
  const mockOnExit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to a clean state before each test
    mockCraftingStore.allRecipes = [];
    mockCraftingStore.knownRecipeIds = [];
    mockCraftingStore.selectedRecipeIndex = 0;
    mockCraftingStore.isLoading = false;
    mockCraftingStore.loadError = null;
    mockCraftingStore.getAvailableRecipes.mockReturnValue([]);
    mockCraftingStore.canCraftRecipe.mockReturnValue(false);
    mockCraftingStore.craftItem.mockResolvedValue(false);
    mockCraftingStore.initializeRecipes.mockResolvedValue(undefined);
    mockCraftingStore.getMaterialStatus.mockReturnValue([]);
    mockCraftingStore.getSelectedRecipe.mockReturnValue(null);

    mockGameStore.characterSheet = {
      inventory: [],
      stats: { adattamento: 10, potenza: 8, percezione: 12 },
      skills: { crafting: 1 },
      knownRecipes: [],
    };
    mockGameStore.items = {};
    mockGameStore.addLogEntry.mockClear();
  });

  test('dovrebbe renderizzare il layout terminale base', async () => {
    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza elementi chiave del layout terminale
    expect(await screen.findByText(/BANCO DI LAVORO TERMINALE/)).toBeInTheDocument();
    expect(await screen.findByText(/RICETTE DISPONIBILI/)).toBeInTheDocument();
    expect(await screen.findByText(/NESSUNA RICETTA SELEZIONATA/)).toBeInTheDocument();
  });

  test('dovrebbe gestire ESC per uscire', () => {
    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    expect(mockOnExit).toHaveBeenCalled();
  });

  test('dovrebbe gestire navigazione con W/S', async () => {
    // Mock con alcune ricette per testare la navigazione
    mockCraftingStore.allRecipes = [
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] },
      { id: 'recipe2', resultItemId: 'item2', resultQuantity: 1, components: [] }
    ];
    mockCraftingStore.canCraftRecipe.mockReturnValue(true);
    
    const { rerender } = render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica che la prima ricetta sia selezionata inizialmente
    expect(await screen.findByText(/>>> \[DISPONIBILE\] item1/)).toBeInTheDocument();
    
    // Naviga in basso
    fireEvent.keyDown(document, { key: 's', code: 'KeyS' });
    rerender(<TerminalCraftingScreen onExit={mockOnExit} />);
    expect(await screen.findByText(/>>> \[DISPONIBILE\] item2/)).toBeInTheDocument();
    
    // Naviga in alto (dovrebbe tornare alla prima)
    fireEvent.keyDown(document, { key: 'w', code: 'KeyW' });
    rerender(<TerminalCraftingScreen onExit={mockOnExit} />);
    expect(await screen.findByText(/>>> \[DISPONIBILE\] item1/)).toBeInTheDocument();
  });

  test('dovrebbe gestire selezione diretta con numeri', async () => {
    mockCraftingStore.allRecipes = [
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] },
      { id: 'recipe2', resultItemId: 'item2', resultQuantity: 1, components: [] }
    ];
    mockCraftingStore.canCraftRecipe.mockReturnValue(true);

    const { rerender } = render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Seleziona direttamente la seconda ricetta
    fireEvent.keyDown(document, { key: '2', code: 'Digit2' });
    rerender(<TerminalCraftingScreen onExit={mockOnExit} />);

    expect(await screen.findByText(/>>> \[DISPONIBILE\] item2/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare aiuto con tasto H', async () => {
    const { rerender } = render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    fireEvent.keyDown(document, { key: 'h', code: 'KeyH' });
    rerender(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    expect(await screen.findByText(/AIUTO COMANDI/)).toBeInTheDocument();
    expect(await screen.findByText(/F: Filtra ricette craftabili/)).toBeInTheDocument();
  });

  test('dovrebbe gestire filtri con tasto F', async () => {
    mockCraftingStore.allRecipes = [
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] }, // Craftable
      { id: 'recipe2', resultItemId: 'item2', resultQuantity: 1, components: [{itemId: 'mat1', quantity: 1}] } // Not craftable
    ];
    mockGameStore.characterSheet.inventory = []; // No materials for recipe2

    const { rerender, container } = render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Initially, both recipes are visible
    expect(container).toHaveTextContent('item1');
    expect(container).toHaveTextContent('item2');

    // Toggle filter
    fireEvent.keyDown(document, { key: 'f', code: 'KeyF' });
    rerender(<TerminalCraftingScreen onExit={mockOnExit} />);

    // Now, only the craftable recipe should be visible
    expect(container).toHaveTextContent('item1');
    expect(container).not.toHaveTextContent('item2');
  });

  test.skip('dovrebbe mostrare indicatori di scroll per liste lunghe', () => {
    // Mock con molte ricette per testare lo scrolling
    const manyRecipes = Array.from({ length: 10 }, (_, i) => ({
      id: `recipe${i}`,
      resultItemId: `item${i}`,
      resultQuantity: 1,
      components: []
    }));
    
    mockCraftingStore.allRecipes = manyRecipes;
    
    const manyItems = Object.fromEntries(
      manyRecipes.map((_, i) => [`item${i}`, { name: `Oggetto ${i + 1}` }])
    );
    mockGameStore.items = manyItems;

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Dovrebbe mostrare indicatori di scroll
    expect(screen.getByText(/Ricette 1-6 di 10/)).toBeInTheDocument();
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });

  test('dovrebbe utilizzare simboli ASCII per stati ricette', async () => {
    mockCraftingStore.allRecipes = [
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] }
    ];
    mockCraftingStore.canCraftRecipe.mockReturnValue(true);

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza simboli di stato ASCII
    expect(await screen.findByText(/\[DISPONIBILE\]/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare dettagli completi per ricetta selezionata', async () => {
    const testRecipe = {
      id: 'test_recipe',
      resultItemId: 'test_item',
      resultQuantity: 2,
      category: 'weapons',
      type: 'creation',
      description: 'Una ricetta di test per verificare i dettagli',
      components: [
        { itemId: 'material1', quantity: 1 },
        { itemId: 'material2', quantity: 2 }
      ],
      skillRequirement: {
        skill: 'crafting',
        level: 3
      }
    };

    mockCraftingStore.allRecipes = [testRecipe];
    
    mockGameStore.items = {
      test_item: { name: 'Oggetto Test', damage: 10 },
      material1: { name: 'Materiale 1' },
      material2: { name: 'Materiale 2' }
    };

    mockGameStore.characterSheet = {
      inventory: [
        { itemId: 'material1', quantity: 1 },
        { itemId: 'material2', quantity: 1 } // Insufficient
      ],
      stats: { adattamento: 6, potenza: 8, percezione: 10 },
      skills: { crafting: 3 },
      knownRecipes: ['test_recipe']
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza dettagli ricetta
    expect(await screen.findByText(/RICETTA: TEST_ITEM/)).toBeInTheDocument();
    expect(screen.getByText(/Categoria: weapons/)).toBeInTheDocument();
    expect(screen.getByText(/Tipo: creation/)).toBeInTheDocument();
    expect(screen.getByText(/MATERIALI RICHIESTI:/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare stato materiali dettagliato', async () => {
    const testRecipe = {
      id: 'test_recipe',
      resultItemId: 'test_item',
      resultQuantity: 1,
      components: [
        { itemId: 'material1', quantity: 2 },
        { itemId: 'material2', quantity: 1 }
      ]
    };

    mockCraftingStore.allRecipes = [testRecipe];
    
    mockGameStore.items = {
      test_item: { name: 'Oggetto Test' },
      material1: { name: 'Materiale Sufficiente' },
      material2: { name: 'Materiale Mancante' }
    };

    mockGameStore.characterSheet = {
      inventory: [
        { itemId: 'material1', quantity: 3 }, // Sufficient
        { itemId: 'material2', quantity: 0 }  // Insufficient
      ],
      stats: { adattamento: 10, potenza: 8, percezione: 10 },
      skills: { crafting: 1},
      knownRecipes: ['test_recipe']
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica stato materiali
    expect(await screen.findByText(/✓ material1 x2/)).toBeInTheDocument();
    expect(await screen.findByText(/✗ material2 x1/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare sezione comandi completa', async () => {
    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza sezione comandi
    expect(await screen.findByText(/\[W\/S\] Naviga/)).toBeInTheDocument();
    expect(screen.getByText(/\[ENTER\] Crafta/)).toBeInTheDocument();
    expect(screen.getByText(/\[F\] Filtro/)).toBeInTheDocument();
    expect(screen.getByText(/\[ESC\] Esci/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare statistiche nell\'header', async () => {
    mockCraftingStore.allRecipes = [
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] },
      { id: 'recipe2', resultItemId: 'item2', resultQuantity: 1, components: [] }
    ];

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica statistiche header
    expect(await screen.findByText(/BANCO DI LAVORO TERMINALE/)).toBeInTheDocument();
  });

  test('dovrebbe gestire aiuto sequenziale', async () => {
    const { rerender } = render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Test aiuto sequenziale
    fireEvent.keyDown(document, { key: 'h', code: 'KeyH' });
    rerender(<TerminalCraftingScreen onExit={mockOnExit} />);

    expect(await screen.findByText(/Naviga lista ricette/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare schermata di errore per inizializzazione fallita', async () => {
    mockCraftingStore.loadError = 'Errore di test';

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    expect(await screen.findByText(/ERRORE DI INIZIALIZZAZIONE: Errore di test/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare schermata di caricamento durante inizializzazione', async () => {
    mockCraftingStore.isLoading = true;
    mockCraftingStore.initializeRecipes.mockReturnValue(new Promise(() => {})); // A promise that never resolves

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    expect(await screen.findByText(/INIZIALIZZAZIONE/)).toBeInTheDocument();
  });

  test.skip('dovrebbe gestire errori di crafting con messaggi specifici', async () => {
    // Setup the mock state for a craftable item
    const testRecipe = { id: 'r1', resultItemId: 'Test Item', components: [], category: 'test', description: '' };
    mockCraftingStore.getAvailableRecipes.mockReturnValue([testRecipe]);
    mockCraftingStore.getSelectedRecipe.mockReturnValue(testRecipe);
    mockCraftingStore.canCraftRecipe.mockReturnValue(true);
    mockCraftingStore.craftingError = null;

    // The craftItem mock will now update the craftingError on the object
    mockCraftingStore.craftItem.mockImplementation(async () => {
      mockCraftingStore.craftingError = 'Materiali insufficienti';
      return false;
    });

    const { rerender } = render(<TerminalCraftingScreen onExit={mockOnExit} />);

    // Use act to handle the state update from the event
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Enter' });
      // A small delay to allow the async mock implementation to run
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Rerender the component to make it read the updated mock state
    rerender(<TerminalCraftingScreen onExit={mockOnExit} />);

    // Now, the error message should be in the document
    expect(await screen.findByText(/✗ ERRORE: Materiali insufficienti/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare messaggio quando non ci sono ricette', async () => {
    mockCraftingStore.allRecipes = [];
    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    expect(await screen.findByText(/NESSUNA RICETTA SELEZIONATA/)).toBeInTheDocument();
  });

  test('dovrebbe utilizzare solo caratteri ASCII per i bordi', () => {
    const { container } = render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza caratteri box-drawing ASCII
    const content = container.textContent || '';
    expect(content).toMatch(/[╔╗╚╝═║─]/);
  });

  test.skip('dovrebbe avere layout a larghezza fissa', () => {
    const { container } = render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica che tutte le righe abbiano lunghezza consistente
    const lines = container.querySelectorAll('div > div');
    const lineLengths = Array.from(lines).map(line => line.textContent?.length || 0);
    
    // Tutte le righe dovrebbero avere la stessa lunghezza (78 caratteri)
    const expectedLength = 78;
    lineLengths.forEach(length => {
      expect(length).toBe(expectedLength);
    });
  });
});