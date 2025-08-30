/**
 * Performance Validation Tests
 * 
 * Tests to ensure the crafting system performs well
 * under various load conditions
 */

import { useCraftingStore } from '../stores/craftingStore';
import { useGameStore } from '../stores/gameStore';

/**
 * Performance Test Result
 */
interface PerformanceTestResult {
  testName: string;
  passed: boolean;
  executionTime: number; // milliseconds
  memoryUsage?: number; // MB
  message: string;
  benchmark?: {
    target: number;
    actual: number;
    unit: string;
  };
  details?: any;
}

/**
 * Performance Validator
 */
export class PerformanceValidator {
  private results: PerformanceTestResult[] = [];
  private craftingStore = useCraftingStore.getState();
  private gameStore = useGameStore.getState();

  /**
   * Run all performance tests
   */
  async runPerformanceTests(): Promise<PerformanceTestResult[]> {
    console.log('🚀 Starting Performance Validation Tests...');
    
    this.results = [];
    
    // Test 1: Crafting Store Initialization Time
    await this.testInitializationTime();
    
    // Test 2: Recipe Lookup Performance
    await this.testRecipeLookupPerformance();
    
    // Test 3: Large Recipe Set Handling
    await this.testLargeRecipeSetHandling();
    
    // Test 4: Synchronization Efficiency
    await this.testSynchronizationEfficiency();
    
    // Test 5: Memory Usage During Extended Gameplay
    await this.testMemoryUsage();
    
    this.printPerformanceResults();
    return this.results;
  }

  /**
   * Test 1: Crafting Store Initialization Time
   */
  private async testInitializationTime(): Promise<void> {
    console.log('⏱️ Testing Crafting Store Initialization Time...');
    
    try {
      const startTime = performance.now();
      
      // Reinitialize the crafting system
      this.craftingStore.initializeCraftingSystem?.();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Target: initialization should complete within 100ms
      const target = 100;
      const passed = executionTime <= target;
      
      this.addPerformanceResult({
        testName: 'Crafting Store Initialization Time',
        passed,
        executionTime,
        message: passed 
          ? `Initialization completed in ${executionTime.toFixed(2)}ms`
          : `Initialization took ${executionTime.toFixed(2)}ms (target: ${target}ms)`,
        benchmark: {
          target,
          actual: executionTime,
          unit: 'ms'
        }
      });
      
    } catch (error) {
      this.addPerformanceResult({
        testName: 'Crafting Store Initialization Time',
        passed: false,
        executionTime: 0,
        message: `Error during initialization test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 2: Recipe Lookup Performance
   */
  private async testRecipeLookupPerformance(): Promise<void> {
    console.log('🔍 Testing Recipe Lookup Performance...');
    
    try {
      const recipes = this.craftingStore.recipes;
      const iterations = 1000;
      
      const startTime = performance.now();
      
      // Perform multiple recipe lookups
      for (let i = 0; i < iterations; i++) {
        const randomIndex = Math.floor(Math.random() * recipes.length);
        const recipe = recipes[randomIndex];
        
        // Simulate common operations
        this.craftingStore.canCraftRecipe(recipe.id);
        this.craftingStore.getRecipeById?.(recipe.id);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const avgTimePerLookup = executionTime / iterations;
      
      // Target: average lookup should be under 1ms
      const target = 1;
      const passed = avgTimePerLookup <= target;
      
      this.addPerformanceResult({
        testName: 'Recipe Lookup Performance',
        passed,
        executionTime,
        message: passed 
          ? `${iterations} lookups completed, avg ${avgTimePerLookup.toFixed(3)}ms per lookup`
          : `Lookups too slow: ${avgTimePerLookup.toFixed(3)}ms per lookup (target: ${target}ms)`,
        benchmark: {
          target,
          actual: avgTimePerLookup,
          unit: 'ms per lookup'
        },
        details: {
          iterations,
          totalTime: executionTime,
          recipeCount: recipes.length
        }
      });
      
    } catch (error) {
      this.addPerformanceResult({
        testName: 'Recipe Lookup Performance',
        passed: false,
        executionTime: 0,
        message: `Error during lookup performance test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 3: Large Recipe Set Handling
   */
  private async testLargeRecipeSetHandling(): Promise<void> {
    console.log('📚 Testing Large Recipe Set Handling...');
    
    try {
      // Create a large number of test recipes
      const originalRecipes = [...this.craftingStore.recipes];
      const testRecipes = [];
      
      for (let i = 0; i < 100; i++) {
        testRecipes.push({
          id: `test_recipe_${i}`,
          name: `Test Recipe ${i}`,
          description: `Test recipe number ${i}`,
          materials: {
            'CRAFT_WOOD': Math.floor(Math.random() * 5) + 1,
            'CRAFT_STONE': Math.floor(Math.random() * 3) + 1
          },
          result: {
            itemId: `test_item_${i}`,
            quantity: 1
          },
          craftingTime: 5,
          difficulty: 'basic'
        });
      }
      
      const startTime = performance.now();
      
      // Add test recipes and perform operations
      this.craftingStore.recipes.push(...testRecipes);
      
      // Test filtering and searching with large dataset
      const availableRecipes = this.craftingStore.getAvailableRecipes?.() || [];
      const knownRecipes = this.craftingStore.getKnownRecipes?.() || [];
      
      // Test crafting operations
      for (let i = 0; i < 10; i++) {
        const randomRecipe = testRecipes[Math.floor(Math.random() * testRecipes.length)];
        this.craftingStore.canCraftRecipe(randomRecipe.id);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Restore original recipes
      this.craftingStore.recipes.length = 0;
      this.craftingStore.recipes.push(...originalRecipes);
      
      // Target: operations with 100+ recipes should complete within 50ms
      const target = 50;
      const passed = executionTime <= target;
      
      this.addPerformanceResult({
        testName: 'Large Recipe Set Handling',
        passed,
        executionTime,
        message: passed 
          ? `Large dataset operations completed in ${executionTime.toFixed(2)}ms`
          : `Large dataset operations took ${executionTime.toFixed(2)}ms (target: ${target}ms)`,
        benchmark: {
          target,
          actual: executionTime,
          unit: 'ms'
        },
        details: {
          testRecipeCount: testRecipes.length,
          totalRecipeCount: originalRecipes.length + testRecipes.length,
          availableRecipes: availableRecipes.length,
          knownRecipes: knownRecipes.length
        }
      });
      
    } catch (error) {
      this.addPerformanceResult({
        testName: 'Large Recipe Set Handling',
        passed: false,
        executionTime: 0,
        message: `Error during large dataset test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 4: Synchronization Efficiency
   */
  private async testSynchronizationEfficiency(): Promise<void> {
    console.log('🔄 Testing Synchronization Efficiency...');
    
    try {
      const iterations = 100;
      const startTime = performance.now();
      
      // Perform multiple synchronizations
      for (let i = 0; i < iterations; i++) {
        this.craftingStore.syncWithGameStore?.();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const avgSyncTime = executionTime / iterations;
      
      // Target: average sync should be under 5ms
      const target = 5;
      const passed = avgSyncTime <= target;
      
      this.addPerformanceResult({
        testName: 'Synchronization Efficiency',
        passed,
        executionTime,
        message: passed 
          ? `${iterations} syncs completed, avg ${avgSyncTime.toFixed(3)}ms per sync`
          : `Sync too slow: ${avgSyncTime.toFixed(3)}ms per sync (target: ${target}ms)`,
        benchmark: {
          target,
          actual: avgSyncTime,
          unit: 'ms per sync'
        },
        details: {
          iterations,
          totalTime: executionTime
        }
      });
      
    } catch (error) {
      this.addPerformanceResult({
        testName: 'Synchronization Efficiency',
        passed: false,
        executionTime: 0,
        message: `Error during sync efficiency test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Test 5: Memory Usage During Extended Gameplay
   */
  private async testMemoryUsage(): Promise<void> {
    console.log('💾 Testing Memory Usage During Extended Gameplay...');
    
    try {
      const startMemory = this.getMemoryUsage();
      
      // Simulate extended gameplay operations
      for (let i = 0; i < 1000; i++) {
        // Simulate crafting operations
        const recipes = this.craftingStore.recipes;
        if (recipes.length > 0) {
          const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
          this.craftingStore.canCraftRecipe(randomRecipe.id);
        }
        
        // Simulate inventory operations
        this.gameStore.addItem('CRAFT_WOOD', 1);
        this.gameStore.removeItem('CRAFT_WOOD', 1);
        
        // Simulate sync operations
        if (i % 10 === 0) {
          this.craftingStore.syncWithGameStore?.();
        }
      }
      
      const endMemory = this.getMemoryUsage();
      const memoryIncrease = endMemory - startMemory;
      
      // Target: memory increase should be less than 10MB
      const target = 10;
      const passed = memoryIncrease <= target;
      
      this.addPerformanceResult({
        testName: 'Memory Usage During Extended Gameplay',
        passed,
        executionTime: 0,
        memoryUsage: memoryIncrease,
        message: passed 
          ? `Memory increase: ${memoryIncrease.toFixed(2)}MB (acceptable)`
          : `Memory increase: ${memoryIncrease.toFixed(2)}MB (target: <${target}MB)`,
        benchmark: {
          target,
          actual: memoryIncrease,
          unit: 'MB'
        },
        details: {
          startMemory,
          endMemory,
          operations: 1000
        }
      });
      
    } catch (error) {
      this.addPerformanceResult({
        testName: 'Memory Usage During Extended Gameplay',
        passed: false,
        executionTime: 0,
        message: `Error during memory usage test: ${error}`,
        details: { error }
      });
    }
  }

  /**
   * Get current memory usage (approximation)
   */
  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0; // Fallback if memory API not available
  }

  /**
   * Add performance test result
   */
  private addPerformanceResult(result: PerformanceTestResult): void {
    this.results.push(result);
  }

  /**
   * Print performance test results
   */
  private printPerformanceResults(): void {
    console.log('\n🚀 Performance Test Results Summary:');
    console.log('===================================');
    
    let passed = 0;
    let total = this.results.length;
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testName}`);
      console.log(`   ${result.message}`);
      
      if (result.benchmark) {
        console.log(`   Benchmark: ${result.benchmark.actual.toFixed(3)} ${result.benchmark.unit} (target: ${result.benchmark.target} ${result.benchmark.unit})`);
      }
      
      if (result.details) {
        console.log(`   Details:`, result.details);
      }
      
      if (result.passed) passed++;
    });
    
    console.log('===================================');
    console.log(`📊 Performance Score: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 Excellent performance! All benchmarks met.');
    } else {
      console.log('⚠️ Some performance issues detected. Review failed tests.');
    }
  }

  /**
   * Get performance test results
   */
  getResults(): PerformanceTestResult[] {
    return this.results;
  }
}

/**
 * Export convenience function
 */
export async function validatePerformance(): Promise<PerformanceTestResult[]> {
  const validator = new PerformanceValidator();
  return await validator.runPerformanceTests();
}

/**
 * Export for console testing
 */
if (typeof window !== 'undefined') {
  (window as any).validatePerformance = validatePerformance;
  (window as any).PerformanceValidator = PerformanceValidator;
}