/**
 * Test per TerminalCraftingScreen
 * Verifica il rendering e la navigazione base del nuovo componente terminale
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalCraftingScreen } from '../components/crafting/TerminalCraftingScreen';

// Mock dei store
const mockCraftingStore = {
  getAvailableRecipes: jest.fn(() => []),
  canCraftRecipe: jest.fn(() => false),
  craftItem: jest.fn(() => Promise.resolve(false))
};

const mockGameStore = {
  characterSheet: {
    inventory: [],
    stats: { adattamento: 10, potenza: 8, percezione: 12 }
  },
  items: {}
};

jest.mock('../stores/craftingStore', () => ({
  useCraftingStore: () => mockCraftingStore
}));

jest.mock('../stores/gameStore', () => ({
  useGameStore: () => mockGameStore
}));

describe('TerminalCraftingScreen', () => {
  const mockOnExit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('dovrebbe renderizzare il layout terminale base', () => {
    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza elementi chiave del layout terminale
    expect(screen.getByText(/BANCO DI LAVORO/)).toBeInTheDocument();
    expect(screen.getByText(/Ricette Conosciute: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Non conosci ancora nessuna ricetta/)).toBeInTheDocument();
  });

  test('dovrebbe gestire ESC per uscire', () => {
    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(mockOnExit).toHaveBeenCalled();
  });

  test('dovrebbe gestire navigazione con W/S', () => {
    // Mock con alcune ricette per testare la navigazione
    mockCraftingStore.getAvailableRecipes.mockReturnValue([
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] },
      { id: 'recipe2', resultItemId: 'item2', resultQuantity: 1, components: [] }
    ]);
    
    mockGameStore.items = {
      item1: { name: 'Oggetto 1' },
      item2: { name: 'Oggetto 2' }
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica che la prima ricetta sia selezionata inizialmente
    expect(screen.getByText(/► \[1\] Oggetto 1/)).toBeInTheDocument();
    
    // Naviga in basso
    fireEvent.keyDown(window, { key: 's' });
    expect(screen.getByText(/► \[2\] Oggetto 2/)).toBeInTheDocument();
    
    // Naviga in alto (dovrebbe tornare alla prima)
    fireEvent.keyDown(window, { key: 'w' });
    expect(screen.getByText(/► \[1\] Oggetto 1/)).toBeInTheDocument();
  });

  test('dovrebbe gestire selezione diretta con numeri', () => {
    mockCraftingStore.getAvailableRecipes.mockReturnValue([
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] },
      { id: 'recipe2', resultItemId: 'item2', resultQuantity: 1, components: [] }
    ]);
    
    mockGameStore.items = {
      item1: { name: 'Oggetto 1' },
      item2: { name: 'Oggetto 2' }
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Seleziona direttamente la seconda ricetta
    fireEvent.keyDown(window, { key: '2' });
    expect(screen.getByText(/► \[2\] Oggetto 2/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare aiuto con tasto H', () => {
    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    fireEvent.keyDown(window, { key: 'h' });
    
    expect(screen.getByText(/Comandi:/)).toBeInTheDocument();
  });

  test('dovrebbe gestire filtri con tasto F', () => {
    mockCraftingStore.getAvailableRecipes.mockReturnValue([
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] }
    ]);
    
    mockGameStore.items = {
      item1: { name: 'Oggetto 1' }
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Test filter toggle
    fireEvent.keyDown(window, { key: 'f' });
    expect(screen.getByText(/Filtro:/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare indicatori di scroll per liste lunghe', () => {
    // Mock con molte ricette per testare lo scrolling
    const manyRecipes = Array.from({ length: 10 }, (_, i) => ({
      id: `recipe${i}`,
      resultItemId: `item${i}`,
      resultQuantity: 1,
      components: []
    }));
    
    mockCraftingStore.getAvailableRecipes.mockReturnValue(manyRecipes);
    
    const manyItems = Object.fromEntries(
      manyRecipes.map((_, i) => [`item${i}`, { name: `Oggetto ${i + 1}` }])
    );
    mockGameStore.items = manyItems;

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Dovrebbe mostrare indicatori di scroll
    expect(screen.getByText(/Ricette 1-6 di 10/)).toBeInTheDocument();
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });

  test('dovrebbe utilizzare simboli ASCII per stati ricette', () => {
    mockCraftingStore.getAvailableRecipes.mockReturnValue([
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] }
    ]);
    
    mockGameStore.items = {
      item1: { name: 'Oggetto 1' }
    };

    const { container } = render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza simboli di stato ASCII
    const content = container.textContent || '';
    expect(content).toMatch(/[●○◐×]/); // Simboli di stato
  });

  test('dovrebbe mostrare dettagli completi per ricetta selezionata', () => {
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

    mockCraftingStore.getAvailableRecipes.mockReturnValue([testRecipe]);
    
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
      stats: { adattamento: 6, potenza: 8, percezione: 10 }
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza dettagli ricetta
    expect(screen.getByText(/RICETTA: Oggetto Test x2/)).toBeInTheDocument();
    expect(screen.getByText(/Categoria: WEAPONS/)).toBeInTheDocument();
    expect(screen.getByText(/Tipo: CREATION/)).toBeInTheDocument();
    expect(screen.getByText(/Una ricetta di test/)).toBeInTheDocument();
    expect(screen.getByText(/Abilità: crafting Lv.3/)).toBeInTheDocument();
    expect(screen.getByText(/XP Stimato:/)).toBeInTheDocument();
    expect(screen.getByText(/Tempo Stimato:/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare stato materiali dettagliato', () => {
    const testRecipe = {
      id: 'test_recipe',
      resultItemId: 'test_item',
      resultQuantity: 1,
      components: [
        { itemId: 'material1', quantity: 2 },
        { itemId: 'material2', quantity: 1 }
      ]
    };

    mockCraftingStore.getAvailableRecipes.mockReturnValue([testRecipe]);
    
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
      stats: { adattamento: 10, potenza: 8, percezione: 10 }
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica stato materiali
    expect(screen.getByText(/MATERIALI \(1\/2 disponibili\):/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Materiale Sufficiente/)).toBeInTheDocument();
    expect(screen.getByText(/✗ Materiale Mancante/)).toBeInTheDocument();
    expect(screen.getByText(/Mancano 1 materiali/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare sezione comandi completa', () => {
    mockCraftingStore.getAvailableRecipes.mockReturnValue([
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] }
    ]);
    
    mockGameStore.items = {
      item1: { name: 'Oggetto 1' }
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza sezione comandi
    expect(screen.getByText(/COMANDI/)).toBeInTheDocument();
    expect(screen.getByText(/NAVIGAZIONE:/)).toBeInTheDocument();
    expect(screen.getByText(/AZIONI:/)).toBeInTheDocument();
    expect(screen.getByText(/FILTRI:/)).toBeInTheDocument();
    expect(screen.getByText(/AIUTO:/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare statistiche nell\'header', () => {
    mockCraftingStore.getAvailableRecipes.mockReturnValue([
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] },
      { id: 'recipe2', resultItemId: 'item2', resultQuantity: 1, components: [] }
    ]);
    
    mockGameStore.items = {
      item1: { name: 'Oggetto 1' },
      item2: { name: 'Oggetto 2' }
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica statistiche header
    expect(screen.getByText(/Ricette: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Craftabili:/)).toBeInTheDocument();
  });

  test('dovrebbe gestire aiuto sequenziale', () => {
    mockCraftingStore.getAvailableRecipes.mockReturnValue([
      { id: 'recipe1', resultItemId: 'item1', resultQuantity: 1, components: [] }
    ]);
    
    mockGameStore.items = {
      item1: { name: 'Oggetto 1' }
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Test aiuto sequenziale
    fireEvent.keyDown(window, { key: 'h' });
    expect(screen.getByText(/NAVIGAZIONE:/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare schermata di errore per inizializzazione fallita', () => {
    // Mock character sheet non disponibile
    mockGameStore.characterSheet = null;

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Dovrebbe mostrare errore di inizializzazione
    expect(screen.getByText(/ERRORE SISTEMA CRAFTING/)).toBeInTheDocument();
    expect(screen.getByText(/Character sheet non disponibile/)).toBeInTheDocument();
    expect(screen.getByText(/Possibili soluzioni:/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare schermata di caricamento durante inizializzazione', () => {
    // Mock inizializzazione lenta
    mockCraftingStore.initializeRecipes = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Dovrebbe mostrare schermata di caricamento
    expect(screen.getByText(/INIZIALIZZAZIONE/)).toBeInTheDocument();
    expect(screen.getByText(/Caricamento ricette.../)).toBeInTheDocument();
    expect(screen.getByText(/Sincronizzazione dati.../)).toBeInTheDocument();
  });

  test('dovrebbe gestire errori di crafting con messaggi specifici', async () => {
    const testRecipe = {
      id: 'test_recipe',
      resultItemId: 'test_item',
      resultQuantity: 1,
      components: [{ itemId: 'material1', quantity: 1 }]
    };

    mockCraftingStore.getAvailableRecipes.mockReturnValue([testRecipe]);
    mockCraftingStore.craftItem.mockResolvedValue(false); // Crafting fallisce
    
    mockGameStore.items = {
      test_item: { name: 'Oggetto Test' },
      material1: { name: 'Materiale Test' }
    };

    mockGameStore.characterSheet = {
      inventory: [],
      stats: { adattamento: 1, potenza: 1, percezione: 1 }
    };

    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Tenta crafting
    fireEvent.keyDown(window, { key: 'Enter' });
    
    // Dovrebbe mostrare messaggio di errore specifico
    await screen.findByText(/✗ ERRORE:/);
    expect(screen.getByText(/Materiali insufficienti/)).toBeInTheDocument();
  });

  test('dovrebbe mostrare messaggio quando non ci sono ricette', () => {
    render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    expect(screen.getByText(/Non conosci ancora nessuna ricetta/)).toBeInTheDocument();
    expect(screen.getByText(/Esplora il mondo per trovare manuali/)).toBeInTheDocument();
  });

  test('dovrebbe utilizzare solo caratteri ASCII per i bordi', () => {
    const { container } = render(<TerminalCraftingScreen onExit={mockOnExit} />);
    
    // Verifica presenza caratteri box-drawing ASCII
    const content = container.textContent || '';
    expect(content).toMatch(/[╔╗╚╝═║─]/);
  });

  test('dovrebbe avere layout a larghezza fissa', () => {
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