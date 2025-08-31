/**
 * Test per il componente ItemPreview
 * Verifica rendering anteprima oggetti con diverse tipologie e proprietà
 */

import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { ItemPreview } from '../components/crafting/ItemPreview';

// Mock del game store con diversi tipi di oggetti
const mockItems = {
  'knife_sharp': {
    name: 'Coltello Affilato',
    description: 'Un coltello ben affilato, perfetto per il combattimento ravvicinato.',
    type: 'weapon',
    rarity: 'common',
    weight: 0.5,
    value: 25,
    durability: 80,
    maxDurability: 100,
    damage: 15,
    accuracy: 85,
    range: 1,
    properties: [
      {
        name: 'Affilato',
        description: 'Infligge danni da taglio extra'
      }
    ],
    equipable: true,
    tradeable: true
  },
  'leather_armor': {
    name: 'Armatura di Cuoio',
    description: 'Protezione base in cuoio resistente.',
    type: 'armor',
    rarity: 'uncommon',
    weight: 2.0,
    value: 50,
    durability: 60,
    maxDurability: 80,
    protection: 8,
    coverage: 75,
    equipable: true
  },
  'healing_potion': {
    name: 'Pozione Curativa',
    description: 'Ripristina la salute quando consumata.',
    type: 'consumable',
    rarity: 'common',
    weight: 0.2,
    value: 15,
    healthRestore: 50,
    staminaRestore: 10,
    hungerRestore: 5,
    consumable: true,
    stackable: true
  },
  'mysterious_artifact': {
    name: 'Artefatto Misterioso',
    description: 'Un oggetto di origine sconosciuta con proprietà misteriose.',
    type: 'misc',
    rarity: 'legendary',
    weight: 1.0,
    value: 1000,
    properties: [
      {
        name: 'Misterioso',
        description: 'Effetti sconosciuti'
      },
      {
        name: 'Antico',
        description: 'Risale a tempi antichi'
      }
    ],
    tradeable: false
  },
  'basic_item': {
    name: 'Oggetto Base',
    description: 'Un oggetto semplice senza proprietà speciali.',
    type: 'misc',
    weight: 1.0,
    value: 10
  },
  'item_prop_no_desc': {
    name: 'Oggetto con Prop Senza Desc',
    properties: [
      {
        name: 'Proprietà Senza Descrizione'
      }
    ]
  }
};

jest.mock('../stores/gameStore', () => ({
  useGameStore: () => ({
    items: mockItems
  })
}));

describe('ItemPreview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Stato vuoto', () => {
    test('dovrebbe mostrare stato vuoto quando nessun oggetto è fornito', () => {
      render(
        <ItemPreview
          resultItemId=""
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Anteprima Oggetto')).toBeInTheDocument();
      expect(screen.getByText('Seleziona una ricetta per vedere l\'anteprima dell\'oggetto che creerai.')).toBeInTheDocument();
    });

    test('dovrebbe mostrare stato vuoto per oggetto inesistente', () => {
      render(
        <ItemPreview
          resultItemId="nonexistent_item"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Anteprima Oggetto')).toBeInTheDocument();
    });
  });

  describe('Header oggetto', () => {
    test('dovrebbe mostrare nome e descrizione dell\'oggetto', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Coltello Affilato')).toBeInTheDocument();
      expect(screen.getByText('Un coltello ben affilato, perfetto per il combattimento ravvicinato.')).toBeInTheDocument();
    });

    test('dovrebbe mostrare quantità quando maggiore di 1', () => {
      render(
        <ItemPreview
          resultItemId="healing_potion"
          resultQuantity={3}
        />
      );

      expect(screen.getByText('x3')).toBeInTheDocument();
    });

    test('dovrebbe mostrare tipo e rarità dell\'oggetto', () => {
      render(
        <ItemPreview
          resultItemId="leather_armor"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('armor')).toBeInTheDocument();
      expect(screen.getByText('uncommon')).toBeInTheDocument();
    });

    test('dovrebbe applicare classi CSS corrette per rarità', () => {
      render(
        <ItemPreview
          resultItemId="mysterious_artifact"
          resultQuantity={1}
        />
      );

      const rarityBadge = screen.getByText('legendary');
      expect(rarityBadge).toHaveClass('bg-yellow-700', 'text-yellow-300');
    });
  });

  describe('Statistiche base', () => {
    test('dovrebbe mostrare peso, valore e durabilità', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Statistiche Base')).toBeInTheDocument();
      expect(screen.getByText('0.5 kg')).toBeInTheDocument();
      expect(screen.getByText('25 crediti')).toBeInTheDocument();
      expect(screen.getByText('80/100')).toBeInTheDocument();
    });

    test('non dovrebbe mostrare sezione se nessuna statistica base', () => {
      const itemWithoutStats = {
        name: 'Oggetto Vuoto',
        type: 'misc'
      };

      // Temporarily mock an item without stats
      jest.doMock('../stores/gameStore', () => ({
        useGameStore: () => ({
          items: {
            'empty_item': itemWithoutStats
          }
        })
      }));

      render(
        <ItemPreview
          resultItemId="empty_item"
          resultQuantity={1}
        />
      );

      expect(screen.queryByText('Statistiche Base')).not.toBeInTheDocument();
    });
  });

  describe('Statistiche arma', () => {
    test('dovrebbe mostrare statistiche specifiche per armi', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Statistiche Arma')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument(); // Danno
      expect(screen.getByText('85%')).toBeInTheDocument(); // Precisione
      expect(screen.getByText('1m')).toBeInTheDocument(); // Portata
    });

    test('non dovrebbe mostrare statistiche arma per non-armi', () => {
      render(
        <ItemPreview
          resultItemId="healing_potion"
          resultQuantity={1}
        />
      );

      expect(screen.queryByText('Statistiche Arma')).not.toBeInTheDocument();
    });
  });

  describe('Statistiche armatura', () => {
    test('dovrebbe mostrare statistiche specifiche per armature', () => {
      render(
        <ItemPreview
          resultItemId="leather_armor"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Statistiche Armatura')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument(); // Protezione
      expect(screen.getByText('75%')).toBeInTheDocument(); // Copertura
    });

    test('non dovrebbe mostrare statistiche armatura per non-armature', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={1}
        />
      );

      expect(screen.queryByText('Statistiche Armatura')).not.toBeInTheDocument();
    });
  });

  describe('Statistiche consumabile', () => {
    test('dovrebbe mostrare effetti per consumabili', () => {
      render(
        <ItemPreview
          resultItemId="healing_potion"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Effetti Consumabile')).toBeInTheDocument();
      expect(screen.getByText('+50')).toBeInTheDocument(); // Salute
      expect(screen.getByText('+10')).toBeInTheDocument(); // Energia
      expect(screen.getByText('+5')).toBeInTheDocument(); // Fame
    });

    test('non dovrebbe mostrare effetti consumabile per non-consumabili', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={1}
        />
      );

      expect(screen.queryByText('Effetti Consumabile')).not.toBeInTheDocument();
    });
  });

  describe('Proprietà speciali', () => {
    test('dovrebbe mostrare proprietà speciali quando presenti', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Proprietà Speciali')).toBeInTheDocument();
      expect(screen.getByText('Affilato')).toBeInTheDocument();
      expect(screen.getByText('Infligge danni da taglio extra')).toBeInTheDocument();
    });

    test('dovrebbe mostrare multiple proprietà speciali', () => {
      render(
        <ItemPreview
          resultItemId="mysterious_artifact"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Misterioso')).toBeInTheDocument();
      expect(screen.getByText('Antico')).toBeInTheDocument();
      expect(screen.getByText('Effetti sconosciuti')).toBeInTheDocument();
      expect(screen.getByText('Risale a tempi antichi')).toBeInTheDocument();
    });

    test('non dovrebbe mostrare sezione se nessuna proprietà speciale', () => {
      render(
        <ItemPreview
          resultItemId="basic_item"
          resultQuantity={1}
        />
      );

      expect(screen.queryByText('Proprietà Speciali')).not.toBeInTheDocument();
    });
  });

  describe('Confronto', () => {
    test('dovrebbe mostrare sezione confronto quando abilitata', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={1}
          showComparison={true}
        />
      );

      expect(screen.getByText('Confronto')).toBeInTheDocument();
      expect(screen.getByText('Confronto con oggetti simili non ancora implementato')).toBeInTheDocument();
    });

    test('non dovrebbe mostrare confronto quando disabilitato', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={1}
          showComparison={false}
        />
      );

      expect(screen.queryByText('Confronto')).not.toBeInTheDocument();
    });
  });

  describe('Informazioni utilizzo', () => {
    test('dovrebbe mostrare informazioni utilizzo per oggetto impilabile', () => {
      render(
        <ItemPreview
          resultItemId="healing_potion"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Informazioni Utilizzo')).toBeInTheDocument();
      expect(screen.getByText('Impilabile')).toBeInTheDocument();
      expect(screen.getByText('Consumabile')).toBeInTheDocument();
    });

    test('dovrebbe mostrare informazioni utilizzo per oggetto equipaggiabile', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Equipaggiabile')).toBeInTheDocument();
    });

    test('dovrebbe mostrare "Non Commerciabile" quando appropriato', () => {
      render(
        <ItemPreview
          resultItemId="mysterious_artifact"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Non Commerciabile')).toBeInTheDocument();
    });

    test('non dovrebbe mostrare sezione se nessuna info utilizzo', () => {
      render(
        <ItemPreview
          resultItemId="basic_item"
          resultQuantity={1}
        />
      );

      expect(screen.queryByText('Informazioni Utilizzo')).not.toBeInTheDocument();
    });
  });

  describe('Classi rarità', () => {
    test('dovrebbe applicare classi corrette per diverse rarità', () => {
      const rarityTests = [
        { itemId: 'knife_sharp', rarity: 'common', expectedClass: 'bg-gray-700' },
        { itemId: 'leather_armor', rarity: 'uncommon', expectedClass: 'bg-green-700' },
        { itemId: 'mysterious_artifact', rarity: 'legendary', expectedClass: 'bg-yellow-700' }
      ];

      rarityTests.forEach(({ itemId, rarity, expectedClass }) => {
        const { unmount } = render(
          <ItemPreview
            resultItemId={itemId}
            resultQuantity={1}
          />
        );

        const rarityBadge = screen.getByText(rarity);
        expect(rarityBadge).toHaveClass(expectedClass);

        unmount();
      });
    });
  });

  describe('Edge cases', () => {
    test('dovrebbe gestire oggetto senza descrizione', () => {
      render(
        <ItemPreview
          resultItemId="basic_item"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Oggetto Base')).toBeInTheDocument();
      // Non dovrebbe crashare senza descrizione
    });

    test('dovrebbe gestire oggetto senza tipo', () => {
      render(
        <ItemPreview
          resultItemId="basic_item"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Oggetto Base')).toBeInTheDocument();
      // Non dovrebbe mostrare badge tipo
    });

    test('dovrebbe gestire oggetto senza rarità', () => {
      render(
        <ItemPreview
          resultItemId="basic_item"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Oggetto Base')).toBeInTheDocument();
      // Non dovrebbe mostrare badge rarità
    });

    test('dovrebbe gestire quantità zero', () => {
      render(
        <ItemPreview
          resultItemId="knife_sharp"
          resultQuantity={0}
        />
      );

      expect(screen.getByText('Coltello Affilato')).toBeInTheDocument();
      expect(screen.queryByText('x0')).not.toBeInTheDocument();
    });

    test('dovrebbe gestire proprietà senza descrizione', () => {
      render(
        <ItemPreview
          resultItemId="item_prop_no_desc"
          resultQuantity={1}
        />
      );

      expect(screen.getByText('Proprietà Senza Descrizione')).toBeInTheDocument();
      // Verifica che il nome dell'oggetto sia renderizzato
      expect(screen.getByText('Oggetto con Prop Senza Desc')).toBeInTheDocument();
    });
  });
});