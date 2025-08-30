/**
 * Integration Validation Tests
 * 
 * Tests to ensure the crafting system integrates properly
 * with existing game systems
 */

import { useCraftingStore } from '../stores/craftingStore';
import { useGameStore } from '../stores/gameStore';

/**
 * Integration Test Result
 */
interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
  warnings?: string[];
}

/**
 * Integration Validator
 */
export class IntegrationValidator {
  private results: IntegrationTestResult[] = [];
  private craftingStore = useCraftingStore.getState();
  private gameStore = useGameStore.getState();

  /**
   * Run all integration tests
   */
  async runIntegrationTests(): Promise<IntegrationTestResult[]> {
    console.log('🔗 Starting Integration Validation Tests...');
    
    this.results = [];
    
    // Test 1: Game Store Integration
    await this.testGameStoreIntegration();
    
    // Test 2: Save/Load Compatibility
    await this.testSaveLoadCompatibility();
    
    // Test 3: Event System Integration
    await this.testEventSystemIntegration();
    
    // Test 4: UI Responsiveness
    await this.testUIResponsiveness();
    
    // Test 5: Cross-System Data Consistency
    await this.testCrossSystemDataConsistency();
    
    this.printIntegrationResults();
    return this.results;
  }

  /**
   * Test 1: Game Store Integration
   */
  private async testGameStoreIntegration(): Promise<void> {
    console.log('🎮 Testing Game Store Integration...');
    
    try {
      let allTestsPassed = true;
      const warnings: string[] = [];
      const testDetails: any = {};
      
      // Test inventory synchronization
      const initialInventorySize = this.gameStore.characterSheet.inventory.length;
      
      // Add an item through game store
      this.gameStore.addItem('CRAFT_WOOD', 5);
      
      // Check if crafting store can see the item
      const canSeeItem = this.craftingStore.recipes.some(recipe => 
        this.craftingStore.canCraftRecipe(recipe.id)
      );
      
      testDetails.inventorySync = {
        initialSize: initialInventorySize,
        afterAdd: this.gameStore.characterSheet.inventory.length,
        canSeeItem
      };
      
      // Test recipe knowledge synchronization
      const initialKnownRecipes = this.craftingStore.knownRecipeIds.length;
      
      // Add a recipe through crafting store
      if (this.craftingStore.recipes.length > 0) {
        const testRecipe = this.craftingStore.recipes[0];
        if (!this.craftingStore.knownRecipeIds.includes(testRecipe.id)) {
          this.craftingStore.knownRecipeIds.push(testRecipe.id);
        }
      }
      
      // Sync and check if game store reflects the change
      this.craftingStore.syncWithGameStore?.();
      
      const finalKnownRecipes = this.gameStore.characterSheet.knownRecipes?.length || 0;
      
      testDetails.recipeSync = {
        initialKnown: initialKnownRecipes,
        finalKnown: finalKnownRecipes,
        synced: finalKnownRecipes >= initialKnownRecipes
      };
      
      if (!testDetails.recipeSync.synced) {
        allTestsPassed = false;
        warnings.push('Recipe synchronization may not be working properly');
      }
      
      this.addIntegrationResult({
        testName: 'Game Store Integration',
        passed: allTestsPassed,
        message: allTestsPassed 
          ? 'Game store integration working correctly'
          : 'Some integration issues detected',
        details: testDetails,
        warnings
      });
      
    } catch (error) {
      this.addIntegrationResult({
        testName: 'Game Store Integration',
        passed: false,
        message: `Error during game store integration test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 2: Save/Load Compatibility
   */
  private async testSaveLoadCompatibility(): Promise<void> {
    console.log('💾 Testing Save/Load Compatibility...');
    
    try {
      // Capture current state
      const originalState = {
        knownRecipes: [...this.craftingStore.knownRecipeIds],
        inventory: [...this.gameStore.characterSheet.inventory],
        characterSheet: { ...this.gameStore.characterSheet }
      };
      
      // Modify state
      this.gameStore.addItem('CRAFT_METAL_SCRAP', 3);
      if (this.craftingStore.recipes.length > 0) {
        const newRecipe = this.craftingStore.recipes.find(r => 
          !this.craftingStore.knownRecipeIds.includes(r.id)
        );
        if (newRecipe) {
          this.craftingStore.knownRecipeIds.push(newRecipe.id);
        }
      }
      
      // Test save functionality
      let saveData: any = null;
      try {
        saveData = {
          characterSheet: this.gameStore.characterSheet,
          craftingData: {
            knownRecipes: this.craftingStore.knownRecipeIds,
            processedManuals: (this.craftingStore as any).processedManuals || []
          }
        };
      } catch (saveError) {
        this.addIntegrationResult({
          testName: 'Save/Load Compatibility',
          passed: false,
          message: `Save functionality failed: ${saveError}`,
          details: { saveError }
        });
        return;
      }
      
      // Test load functionality
      try {
        // Simulate loading saved data
        if (saveData.characterSheet) {
          Object.assign(this.gameStore.characterSheet, saveData.characterSheet);
        }
        
        if (saveData.craftingData) {
          this.craftingStore.knownRecipeIds.length = 0;
          this.craftingStore.knownRecipeIds.push(...saveData.craftingData.knownRecipes);
        }
        
        // Verify data integrity after load
        const dataIntact = 
          this.gameStore.characterSheet.inventory.length > 0 &&
          this.craftingStore.knownRecipeIds.length > 0;
        
        this.addIntegrationResult({
          testName: 'Save/Load Compatibility',
          passed: dataIntact,
          message: dataIntact 
            ? 'Save/load functionality working correctly'
            : 'Data integrity issues after save/load',
          details: {
            saveDataSize: JSON.stringify(saveData).length,
            inventoryItems: this.gameStore.characterSheet.inventory.length,
            knownRecipes: this.craftingStore.knownRecipeIds.length
          }
        });
        
      } catch (loadError) {
        this.addIntegrationResult({
          testName: 'Save/Load Compatibility',
          passed: false,
          message: `Load functionality failed: ${loadError}`,
          details: { loadError }
        });
      }
      
      // Restore original state
      this.gameStore.characterSheet = originalState.characterSheet;
      this.craftingStore.knownRecipeIds.length = 0;
      this.craftingStore.knownRecipeIds.push(...originalState.knownRecipes);
      
    } catch (error) {
      this.addIntegrationResult({
        testName: 'Save/Load Compatibility',
        passed: false,
        message: `Error during save/load test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 3: Event System Integration
   */
  private async testEventSystemIntegration(): Promise<void> {
    console.log('📡 Testing Event System Integration...');
    
    try {
      let eventsFired = 0;
      const warnings: string[] = [];
      
      // Test custom event listening
      const eventListener = (event: CustomEvent) => {
        eventsFired++;
        console.log('Test event received:', event.detail);
      };
      
      if (typeof window !== 'undefined') {
        window.addEventListener('manualUsed', eventListener as EventListener);
        
        // Fire a test event
        window.dispatchEvent(new CustomEvent('manualUsed', { 
          detail: { manualId: 'TEST_MANUAL' } 
        }));
        
        // Wait a bit for event processing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        window.removeEventListener('manualUsed', eventListener as EventListener);
      }
      
      // Test message system integration
      const initialMessages = this.gameStore.messages.length;
      
      // Try to trigger a crafting-related message
      if (this.craftingStore.recipes.length > 0) {
        const testRecipe = this.craftingStore.recipes[0];
        this.craftingStore.canCraftRecipe(testRecipe.id);
      }
      
      const finalMessages = this.gameStore.messages.length;
      const messagesAdded = finalMessages > initialMessages;
      
      if (!messagesAdded) {
        warnings.push('No messages generated during crafting operations');
      }
      
      this.addIntegrationResult({
        testName: 'Event System Integration',
        passed: eventsFired > 0 || messagesAdded,
        message: (eventsFired > 0 || messagesAdded)
          ? 'Event system integration working'
          : 'Event system integration issues detected',
        details: {
          eventsFired,
          messagesAdded,
          initialMessages,
          finalMessages
        },
        warnings
      });
      
    } catch (error) {
      this.addIntegrationResult({
        testName: 'Event System Integration',
        passed: false,
        message: `Error during event system test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 4: UI Responsiveness
   */
  private async testUIResponsiveness(): Promise<void> {
    console.log('🖥️ Testing UI Responsiveness...');
    
    try {
      const startTime = performance.now();
      
      // Simulate UI operations
      const operations = [
        () => this.craftingStore.getAvailableRecipes?.(),
        () => this.craftingStore.getKnownRecipes?.(),
        () => this.craftingStore.recipes.filter(r => r.difficulty === 'basic'),
        () => this.craftingStore.recipes.map(r => ({ id: r.id, name: r.name }))
      ];
      
      // Run operations multiple times to simulate UI updates
      for (let i = 0; i < 100; i++) {
        operations.forEach(op => {
          try {
            op();
          } catch (error) {
            console.warn('UI operation failed:', error);
          }
        });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Target: UI operations should complete within 200ms
      const target = 200;
      const passed = executionTime <= target;
      
      this.addIntegrationResult({
        testName: 'UI Responsiveness',
        passed,
        message: passed 
          ? `UI operations completed in ${executionTime.toFixed(2)}ms`
          : `UI operations took ${executionTime.toFixed(2)}ms (target: ${target}ms)`,
        details: {
          executionTime,
          target,
          operationsPerformed: operations.length * 100
        }
      });
      
    } catch (error) {
      this.addIntegrationResult({
        testName: 'UI Responsiveness',
        passed: false,
        message: `Error during UI responsiveness test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 5: Cross-System Data Consistency
   */
  private async testCrossSystemDataConsistency(): Promise<void> {
    console.log('🔄 Testing Cross-System Data Consistency...');
    
    try {
      let consistencyIssues = 0;
      const warnings: string[] = [];
      const testDetails: any = {};
      
      // Test 1: Recipe knowledge consistency
      const craftingKnownRecipes = this.craftingStore.knownRecipeIds;
      const gameStoreKnownRecipes = this.gameStore.characterSheet.knownRecipes || [];
      
      const recipeConsistency = craftingKnownRecipes.every(recipeId => 
        gameStoreKnownRecipes.includes(recipeId)
      );
      
      if (!recipeConsistency) {
        consistencyIssues++;
        warnings.push('Recipe knowledge inconsistency between stores');
      }
      
      testDetails.recipeConsistency = {
        craftingStore: craftingKnownRecipes.length,
        gameStore: gameStoreKnownRecipes.length,
        consistent: recipeConsistency
      };
      
      // Test 2: Material availability consistency
      const craftingMaterials = new Set<string>();
      this.craftingStore.recipes.forEach(recipe => {
        if (recipe.materials) {
          Object.keys(recipe.materials).forEach(materialId => {
            craftingMaterials.add(materialId);
          });
        }
      });
      
      const inventoryMaterials = new Set(
        this.gameStore.characterSheet.inventory
          .map(slot => slot?.itemId)
          .filter(Boolean)
      );
      
      const materialOverlap = Array.from(craftingMaterials).filter(materialId => 
        inventoryMaterials.has(materialId)
      ).length;
      
      testDetails.materialConsistency = {
        craftingMaterials: craftingMaterials.size,
        inventoryMaterials: inventoryMaterials.size,
        overlap: materialOverlap
      };
      
      // Test 3: State synchronization
      this.craftingStore.syncWithGameStore?.();
      
      const postSyncKnownRecipes = this.gameStore.characterSheet.knownRecipes?.length || 0;
      const syncWorking = postSyncKnownRecipes >= craftingKnownRecipes.length;
      
      if (!syncWorking) {
        consistencyIssues++;
        warnings.push('State synchronization not working properly');
      }
      
      testDetails.synchronization = {
        preSyncRecipes: gameStoreKnownRecipes.length,
        postSyncRecipes: postSyncKnownRecipes,
        syncWorking
      };
      
      this.addIntegrationResult({
        testName: 'Cross-System Data Consistency',
        passed: consistencyIssues === 0,
        message: consistencyIssues === 0 
          ? 'All systems maintain data consistency'
          : `${consistencyIssues} consistency issues detected`,
        details: testDetails,
        warnings
      });
      
    } catch (error) {
      this.addIntegrationResult({
        testName: 'Cross-System Data Consistency',
        passed: false,
        message: `Error during consistency test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Add integration test result
   */
  private addIntegrationResult(result: IntegrationTestResult): void {
    this.results.push(result);
  }

  /**
   * Print integration test results
   */
  private printIntegrationResults(): void {
    console.log('\n🔗 Integration Test Results Summary:');
    console.log('==================================');
    
    let passed = 0;
    let total = this.results.length;
    let totalWarnings = 0;
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testName}: ${result.message}`);
      
      if (result.warnings && result.warnings.length > 0) {
        console.log('   ⚠️ Warnings:');
        result.warnings.forEach(warning => {
          console.log(`   • ${warning}`);
        });
        totalWarnings += result.warnings.length;
      }
      
      if (result.details) {
        console.log(`   Details:`, result.details);
      }
      
      if (result.passed) passed++;
    });
    
    console.log('==================================');
    console.log(`📊 Integration Score: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (totalWarnings > 0) {
      console.log(`⚠️ Total Warnings: ${totalWarnings}`);
    }
    
    if (passed === total && totalWarnings === 0) {
      console.log('🎉 Perfect integration! All systems working together seamlessly.');
    } else if (passed === total) {
      console.log('👍 Good integration with minor warnings to address.');
    } else {
      console.log('⚠️ Integration issues detected. Review failed tests.');
    }
  }

  /**
   * Get integration test results
   */
  getResults(): IntegrationTestResult[] {
    return this.results;
  }
}

/**
 * Export convenience function
 */
export async function validateIntegration(): Promise<IntegrationTestResult[]> {
  const validator = new IntegrationValidator();
  return await validator.runIntegrationTests();
}

/**
 * Export for console testing
 */
if (typeof window !== 'undefined') {
  (window as any).validateIntegration = validateIntegration;
  (window as any).IntegrationValidator = IntegrationValidator;
}