/**
 * Test per il componente RecipeDetails
 * Verifica rendering dettagli ricetta, materiali e requisiti
 */

import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { RecipeDetails } from '../components/crafting/RecipeDetails';
import type { Recipe, MaterialStatus } from '../types/crafting';

// Mock del game store
jest.mock('../stores/gameStore', () => ({
  useGameStore: () => ({
    items: {
      'knife_sharp': { name: 'Coltello Affilato' },
      'bandages_clean': { name: 'Bende Pulite' },
      'unknown_item': { name: 'Oggetto Misterioso' }
    }
  })
}));

// Ricetta di test
const testRecipe: Recipe = {
  id: 'test_knife',
  resultItemId: 'knife_sharp',
  resultQuantity: 1,
  components: [
    { itemId: 'knife_dull', quantity: 1 },
    { itemId: 'whetstone', quantity: 1 }
  ],
  category: 'weapons',
  description: 'Affila un coltello smussato per renderlo più efficace in combattimento.',
  skillRequirement: {
    skill: 'crafting',
    level: 2
  },
  unlockedByLevel: 2
};

// Stato materiali di test
const testMaterialStatus: MaterialStatus[] = [
  {
    itemId: 'knife_dull',
    itemName: 'Coltello Smussato',
    owned: 1,
    required: 1,
    sufficient: true
  },
  {
    itemId: 'whetstone',
    itemName: 'Pietra per Affilare',
    owned: 0,
    required: 1,
    sufficient: false
  }
];

describe('RecipeDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Stato vuoto', () => {
    test('dovrebbe mostrare stato vuoto quando nessuna ricetta è selezionata', () => {
      render(
        <RecipeDetails
          recipe={null}
          materialStatus={[]}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Seleziona una ricetta')).toBeInTheDocument();
      expect(screen.getByText('Scegli una ricetta dalla lista per vedere i dettagli e i materiali richiesti.')).toBeInTheDocument();
    });
  });

  describe('Header ricetta', () => {
    test('dovrebbe mostrare nome e descrizione della ricetta', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Coltello Affilato')).toBeInTheDocument();
      expect(screen.getByText('Affila un coltello smussato per renderlo più efficace in combattimento.')).toBeInTheDocument();
    });

    test('dovrebbe mostrare quantità quando maggiore di 1', () => {
      const recipeWithQuantity = {
        ...testRecipe,
        resultQuantity: 3
      };

      render(
        <RecipeDetails
          recipe={recipeWithQuantity}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('x3')).toBeInTheDocument();
    });

    test('dovrebbe mostrare categoria della ricetta', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('weapons')).toBeInTheDocument();
    });

    test('dovrebbe gestire oggetti sconosciuti', () => {
      const recipeWithUnknownItem = {
        ...testRecipe,
        resultItemId: 'unknown_item_id'
      };

      render(
        <RecipeDetails
          recipe={recipeWithUnknownItem}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Oggetto Sconosciuto')).toBeInTheDocument();
    });
  });

  describe('Sezione materiali', () => {
    test('dovrebbe mostrare tutti i materiali richiesti', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Materiali Richiesti')).toBeInTheDocument();
      expect(screen.getByText('Coltello Smussato')).toBeInTheDocument();
      expect(screen.getByText('Pietra per Affilare')).toBeInTheDocument();
    });

    test('dovrebbe mostrare quantità possedute vs richieste', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('1 / 1')).toBeInTheDocument(); // Coltello sufficiente
      expect(screen.getByText('0 / 1')).toBeInTheDocument(); // Pietra insufficiente
    });

    test('dovrebbe indicare stato sufficiente/insufficiente', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Sufficiente')).toBeInTheDocument();
      expect(screen.getByText('Insufficiente')).toBeInTheDocument();
    });

    test('dovrebbe mostrare riepilogo materiali', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Materiali disponibili:')).toBeInTheDocument();
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    test('non dovrebbe mostrare sezione materiali se vuota', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={[]}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.queryByText('Materiali Richiesti')).not.toBeInTheDocument();
    });
  });

  describe('Sezione requisiti abilità', () => {
    test('dovrebbe mostrare requisiti abilità quando presenti', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Requisiti Abilità')).toBeInTheDocument();
      expect(screen.getByText('Crafting')).toBeInTheDocument();
      expect(screen.getByText('Livello 2')).toBeInTheDocument();
      expect(screen.getByText('Soddisfatto')).toBeInTheDocument();
    });

    test('dovrebbe indicare quando requisiti non sono soddisfatti', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={false}
        />
      );

      expect(screen.getByText('Non soddisfatto')).toBeInTheDocument();
    });

    test('non dovrebbe mostrare sezione se nessun requisito abilità', () => {
      const recipeWithoutSkill = {
        ...testRecipe,
        skillRequirement: undefined
      };

      render(
        <RecipeDetails
          recipe={recipeWithoutSkill}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.queryByText('Requisiti Abilità')).not.toBeInTheDocument();
    });
  });

  describe('Informazioni sblocco', () => {
    test('dovrebbe mostrare informazioni sblocco per livello', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Informazioni Sblocco')).toBeInTheDocument();
      expect(screen.getByText('Sbloccata al livello 2')).toBeInTheDocument();
    });

    test('dovrebbe mostrare informazioni sblocco per manuale', () => {
      const recipeWithManual = {
        ...testRecipe,
        unlockedByLevel: undefined,
        unlockedByManual: 'crafting_guide'
      };

      render(
        <RecipeDetails
          recipe={recipeWithManual}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Sbloccata dal manuale: crafting_guide')).toBeInTheDocument();
    });

    test('non dovrebbe mostrare sezione se nessuna info sblocco', () => {
      const recipeWithoutUnlock = {
        ...testRecipe,
        unlockedByLevel: undefined,
        unlockedByManual: undefined
      };

      render(
        <RecipeDetails
          recipe={recipeWithoutUnlock}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.queryByText('Informazioni Sblocco')).not.toBeInTheDocument();
    });
  });

  describe('Stato craftabilità', () => {
    test('dovrebbe mostrare stato craftabile quando tutti i requisiti sono soddisfatti', () => {
      const allSufficientMaterials: MaterialStatus[] = [
        {
          itemId: 'knife_dull',
          itemName: 'Coltello Smussato',
          owned: 1,
          required: 1,
          sufficient: true
        },
        {
          itemId: 'whetstone',
          itemName: 'Pietra per Affilare',
          owned: 1,
          required: 1,
          sufficient: true
        }
      ];

      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={allSufficientMaterials}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('✅ Pronto per Creare')).toBeInTheDocument();
      expect(screen.getByText('Tutti i requisiti sono soddisfatti')).toBeInTheDocument();
    });

    test('dovrebbe mostrare stato non craftabile per materiali insufficienti', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('❌ Materiali Insufficienti')).toBeInTheDocument();
      expect(screen.getByText('Raccogli i materiali mancanti')).toBeInTheDocument();
    });

    test('dovrebbe mostrare stato non craftabile per abilità insufficienti', () => {
      const allSufficientMaterials: MaterialStatus[] = [
        {
          itemId: 'knife_dull',
          itemName: 'Coltello Smussato',
          owned: 1,
          required: 1,
          sufficient: true
        },
        {
          itemId: 'whetstone',
          itemName: 'Pietra per Affilare',
          owned: 1,
          required: 1,
          sufficient: true
        }
      ];

      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={allSufficientMaterials}
          meetsSkillRequirement={false}
        />
      );

      expect(screen.getByText('❌ Abilità Insufficiente')).toBeInTheDocument();
      expect(screen.getByText('Migliora le tue abilità')).toBeInTheDocument();
    });
  });

  describe('Styling e layout', () => {
    test('dovrebbe applicare colori corretti per materiali sufficienti', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      const sufficientMaterial = screen.getByText('Coltello Smussato');
      const insufficientMaterial = screen.getByText('Pietra per Affilare');

      expect(sufficientMaterial).toHaveClass('text-green-400');
      expect(insufficientMaterial).toHaveClass('text-red-400');
    });

    test('dovrebbe applicare colori corretti per requisiti abilità', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      const skillName = screen.getByText('Crafting');
      expect(skillName).toHaveClass('text-green-300');
    });
  });

  describe('Edge cases', () => {
    test('dovrebbe gestire ricetta senza descrizione', () => {
      const recipeWithoutDescription = {
        ...testRecipe,
        description: undefined
      };

      render(
        <RecipeDetails
          recipe={recipeWithoutDescription}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Coltello Affilato')).toBeInTheDocument();
      // Non dovrebbe crashare senza descrizione
    });

    test('dovrebbe gestire ricetta senza categoria', () => {
      const recipeWithoutCategory = {
        ...testRecipe,
        category: undefined
      };

      render(
        <RecipeDetails
          recipe={recipeWithoutCategory}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Coltello Affilato')).toBeInTheDocument();
      expect(screen.queryByText('weapons')).not.toBeInTheDocument();
    });

    test('dovrebbe gestire lista materiali vuota', () => {
      render(
        <RecipeDetails
          recipe={testRecipe}
          materialStatus={[]}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.queryByText('Materiali Richiesti')).not.toBeInTheDocument();
      // Dovrebbe comunque mostrare stato craftabile
      expect(screen.getByText('✅ Pronto per Creare')).toBeInTheDocument();
    });

    test('dovrebbe gestire nomi abilità con capitalizzazione', () => {
      const recipeWithLowercaseSkill = {
        ...testRecipe,
        skillRequirement: {
          skill: 'smithing',
          level: 3
        }
      };

      render(
        <RecipeDetails
          recipe={recipeWithLowercaseSkill}
          materialStatus={testMaterialStatus}
          meetsSkillRequirement={true}
        />
      );

      expect(screen.getByText('Smithing')).toBeInTheDocument();
    });
  });
});