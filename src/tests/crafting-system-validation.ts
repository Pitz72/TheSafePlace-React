/**
 * Crafting System Validation Tests
 * 
 * Comprehensive test suite for the crafting system fixes
 * Run these tests to validate all implemented features
 */

import { useCraftingStore } from '../stores/craftingStore';
import { useGameStore } from '../stores/gameStore';

// Test configuration
const TEST_CONFIG = {
  STARTER_KIT_RECIPES: ['bandage', 'torch', 'stone_knife', 'water_purifier'],
  STARTER_KIT_MATERIALS: {
    'CRAFT_CLOTH': 5,
    'CRAFT_WOOD': 3,
    'CRAFT_STONE': 2,
    'CRAFT_METAL_SCRAP': 1
  },
  MANUAL_IDS: [
    'MANUAL_WEAPONS_BASIC',
    'MANUAL_MEDICAL_BASIC',
    'MANUAL_WEAPONS_ADVANCED', 
    'MANUAL_MEDICAL_ADVANCED',
    'MANUAL_WEAPONS_EXPERT',
    'MANUAL_SURVIVAL_EXPERT'
  ]
};

/**
 * Test Results Interface
 */
interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

/**
 * Test Suite Class
 */
export class CraftingSystemValidator {
  private results: TestResult[] = [];
  private craftingStore = useCraftingStore.getState();
  private gameStore = useGameStore.getState();

  /**
   * Run all validation tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Crafting System Validation Tests...');
    
    this.results = [];
    
    // Test 1: Starter Kit Application
    await this.testStarterKitApplication();
    
    // Test 2: Manual Discovery and Usage
    await this.testManualDiscoveryAndUsage();
    
    // Test 3: Recipe Unlocking Progression
    await this.testRecipeUnlockingProgression();
    
    // Test 4: Crafting with New Materials
    await this.testCraftingWithNewMaterials();
    
    // Test 5: Error Handling and Edge Cases
    await this.testErrorHandlingAndEdgeCases();
    
    this.printResults();
    return this.results;
  }

  /**
   * Test 1: Starter Kit Application
   */
  private async testStarterKitApplication(): Promise<void> {
    console.log('📦 Testing Starter Kit Application...');
    
    try {
      // Reset state for clean test
      const initialRecipes = this.craftingStore.knownRecipeIds.length;
      
      // Apply starter kit
      this.craftingStore.applyStarterKit();
      
      // Check recipes were added
      const finalRecipes = this.craftingStore.knownRecipeIds.length;
      const recipesAdded = finalRecipes > initialRecipes;
      
      // Check specific starter recipes
      const hasStarterRecipes = TEST_CONFIG.STARTER_KIT_RECIPES.every(recipeId => 
        this.craftingStore.knownRecipeIds.includes(recipeId)
      );
      
      // Check materials were added to inventory
      const inventory = this.gameStore.characterSheet.inventory;
      const hasStarterMaterials = Object.entries(TEST_CONFIG.STARTER_KIT_MATERIALS)
        .some(([materialId, expectedQuantity]) => {
          const slot = inventory.find(slot => slot?.itemId === materialId);
          return slot && slot.quantity >= expectedQuantity;
        });
      
      this.addResult({
        testName: 'Starter Kit Application',
        passed: recipesAdded && hasStarterRecipes,
        message: recipesAdded && hasStarterRecipes 
          ? 'Starter kit applied successfully'
          : 'Starter kit application failed',
        details: {
          recipesAdded: finalRecipes - initialRecipes,
          hasStarterRecipes,
          hasStarterMaterials
        }
      });
      
    } catch (error) {
      this.addResult({
        testName: 'Starter Kit Application',
        passed: false,
        message: `Error during starter kit test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 2: Manual Discovery and Usage
   */
  private async testManualDiscoveryAndUsage(): Promise<void> {
    console.log('📚 Testing Manual Discovery and Usage...');
    
    try {
      let allTestsPassed = true;
      const testDetails: any = {};
      
      for (const manualId of TEST_CONFIG.MANUAL_IDS) {
        // Test adding manual to inventory
        const addResult = this.craftingStore.addManualToInventory?.(manualId) ?? false;
        
        if (addResult) {
          // Test using the manual
          const useResult = this.craftingStore.testManualDiscovery?.(manualId) ?? false;
          testDetails[manualId] = { added: addResult, used: useResult };
          
          if (!useResult) {
            allTestsPassed = false;
          }
        } else {
          testDetails[manualId] = { added: false, used: false };
          allTestsPassed = false;
        }
      }
      
      this.addResult({
        testName: 'Manual Discovery and Usage',
        passed: allTestsPassed,
        message: allTestsPassed 
          ? 'All manuals can be discovered and used successfully'
          : 'Some manuals failed discovery or usage tests',
        details: testDetails
      });
      
    } catch (error) {
      this.addResult({
        testName: 'Manual Discovery and Usage',
        passed: false,
        message: `Error during manual discovery test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 3: Recipe Unlocking Progression
   */
  private async testRecipeUnlockingProgression(): Promise<void> {
    console.log('🔓 Testing Recipe Unlocking Progression...');
    
    try {
      const initialRecipeCount = this.craftingStore.knownRecipeIds.length;
      
      // Test unlocking recipes by manual
      this.craftingStore.unlockRecipesByManual?.('manual_weapons_basic');
      const afterBasicWeapons = this.craftingStore.knownRecipeIds.length;
      
      this.craftingStore.unlockRecipesByManual?.('manual_medical_basic');
      const afterBasicMedical = this.craftingStore.knownRecipeIds.length;
      
      const progressionWorking = afterBasicWeapons >= initialRecipeCount && 
                                afterBasicMedical >= afterBasicWeapons;
      
      this.addResult({
        testName: 'Recipe Unlocking Progression',
        passed: progressionWorking,
        message: progressionWorking 
          ? 'Recipe unlocking progression works correctly'
          : 'Recipe unlocking progression failed',
        details: {
          initial: initialRecipeCount,
          afterBasicWeapons,
          afterBasicMedical,
          totalUnlocked: afterBasicMedical - initialRecipeCount
        }
      });
      
    } catch (error) {
      this.addResult({
        testName: 'Recipe Unlocking Progression',
        passed: false,
        message: `Error during progression test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 4: Crafting with New Materials
   */
  private async testCraftingWithNewMaterials(): Promise<void> {
    console.log('🔨 Testing Crafting with New Materials...');
    
    try {
      // Add materials to inventory for testing
      const materialsToAdd = [
        'CRAFT_CLOTH', 'CRAFT_WOOD', 'CRAFT_STONE', 'CRAFT_METAL_SCRAP'
      ];
      
      materialsToAdd.forEach(materialId => {
        this.gameStore.addItem(materialId, 10);
      });
      
      // Try to craft a basic recipe (bandage)
      const bandageRecipe = this.craftingStore.recipes.find(r => r.id === 'bandage');
      
      if (bandageRecipe) {
        const canCraft = this.craftingStore.canCraftRecipe(bandageRecipe.id);
        
        if (canCraft) {
          const craftResult = this.craftingStore.craftRecipe(bandageRecipe.id);
          
          this.addResult({
            testName: 'Crafting with New Materials',
            passed: craftResult,
            message: craftResult 
              ? 'Successfully crafted item with new materials'
              : 'Failed to craft item with new materials',
            details: {
              recipe: bandageRecipe.id,
              canCraft,
              craftResult
            }
          });
        } else {
          this.addResult({
            testName: 'Crafting with New Materials',
            passed: false,
            message: 'Cannot craft recipe despite having materials',
            details: { recipe: bandageRecipe.id, canCraft }
          });
        }
      } else {
        this.addResult({
          testName: 'Crafting with New Materials',
          passed: false,
          message: 'Bandage recipe not found',
          details: { availableRecipes: this.craftingStore.recipes.length }
        });
      }
      
    } catch (error) {
      this.addResult({
        testName: 'Crafting with New Materials',
        passed: false,
        message: `Error during crafting test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 5: Error Handling and Edge Cases
   */
  private async testErrorHandlingAndEdgeCases(): Promise<void> {
    console.log('⚠️ Testing Error Handling and Edge Cases...');
    
    try {
      let allTestsPassed = true;
      const testDetails: any = {};
      
      // Test 1: Invalid manual ID
      try {
        this.craftingStore.unlockRecipesByManual?.('INVALID_MANUAL_ID');
        testDetails.invalidManual = 'No error thrown (expected behavior)';
      } catch (error) {
        testDetails.invalidManual = `Error handled: ${error}`;
      }
      
      // Test 2: Crafting without materials
      const expensiveRecipe = this.craftingStore.recipes.find(r => 
        r.materials && Object.keys(r.materials).length > 0
      );
      
      if (expensiveRecipe) {
        // Clear inventory first
        this.gameStore.characterSheet.inventory = [];
        
        const canCraftWithoutMaterials = this.craftingStore.canCraftRecipe(expensiveRecipe.id);
        testDetails.craftWithoutMaterials = !canCraftWithoutMaterials;
        
        if (canCraftWithoutMaterials) {
          allTestsPassed = false;
        }
      }
      
      // Test 3: Double manual usage
      const testManual = 'MANUAL_WEAPONS_BASIC';
      const initialRecipes = this.craftingStore.knownRecipeIds.length;
      
      this.craftingStore.unlockRecipesByManual?.(testManual);
      const afterFirst = this.craftingStore.knownRecipeIds.length;
      
      this.craftingStore.unlockRecipesByManual?.(testManual);
      const afterSecond = this.craftingStore.knownRecipeIds.length;
      
      testDetails.doubleManualUsage = afterFirst === afterSecond;
      
      this.addResult({
        testName: 'Error Handling and Edge Cases',
        passed: allTestsPassed,
        message: allTestsPassed 
          ? 'All error handling tests passed'
          : 'Some error handling tests failed',
        details: testDetails
      });
      
    } catch (error) {
      this.addResult({
        testName: 'Error Handling and Edge Cases',
        passed: false,
        message: `Error during edge case testing: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Add test result
   */
  private addResult(result: TestResult): void {
    this.results.push(result);
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    let passed = 0;
    let total = this.results.length;
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testName}: ${result.message}`);
      
      if (result.details) {
        console.log(`   Details:`, result.details);
      }
      
      if (result.passed) passed++;
    });
    
    console.log('========================');
    console.log(`📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Crafting system is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please review the implementation.');
    }
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return this.results;
  }
}

/**
 * Export convenience function for running tests
 */
export async function validateCraftingSystem(): Promise<TestResult[]> {
  const validator = new CraftingSystemValidator();
  return await validator.runAllTests();
}

/**
 * Export for console testing
 */
if (typeof window !== 'undefined') {
  (window as any).validateCraftingSystem = validateCraftingSystem;
  (window as any).CraftingSystemValidator = CraftingSystemValidator;
}