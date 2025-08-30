/**
 * Master Validation Suite
 * 
 * Runs all validation tests for the crafting system
 * and provides a comprehensive report
 */

import { validateCraftingSystem, CraftingSystemValidator } from './crafting-system-validation';
import { validatePerformance, PerformanceValidator } from './performance-validation';
import { validateIntegration, IntegrationValidator } from './integration-validation';

/**
 * Master Test Result
 */
interface MasterTestResult {
  category: string;
  passed: number;
  total: number;
  score: number;
  details: any[];
  warnings: string[];
}

/**
 * Overall Test Summary
 */
interface TestSummary {
  overallScore: number;
  totalTests: number;
  totalPassed: number;
  categories: MasterTestResult[];
  recommendations: string[];
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
}

/**
 * Master Validation Runner
 */
export class MasterValidator {
  private results: MasterTestResult[] = [];

  /**
   * Run all validation suites
   */
  async runAllValidations(): Promise<TestSummary> {
    console.log('🚀 Starting Master Validation Suite...');
    console.log('=====================================');
    
    this.results = [];
    
    // Run Crafting System Tests
    console.log('\n1️⃣ Running Crafting System Validation...');
    const craftingResults = await validateCraftingSystem();
    this.processCraftingResults(craftingResults);
    
    // Run Performance Tests
    console.log('\n2️⃣ Running Performance Validation...');
    const performanceResults = await validatePerformance();
    this.processPerformanceResults(performanceResults);
    
    // Run Integration Tests
    console.log('\n3️⃣ Running Integration Validation...');
    const integrationResults = await validateIntegration();
    this.processIntegrationResults(integrationResults);
    
    // Generate summary
    const summary = this.generateSummary();
    this.printMasterReport(summary);
    
    return summary;
  }

  /**
   * Process crafting system test results
   */
  private processCraftingResults(results: any[]): void {
    const passed = results.filter(r => r.passed).length;
    const warnings: string[] = [];
    
    results.forEach(result => {
      if (!result.passed) {
        warnings.push(`Crafting: ${result.testName} - ${result.message}`);
      }
    });
    
    this.results.push({
      category: 'Crafting System Functionality',
      passed,
      total: results.length,
      score: Math.round((passed / results.length) * 100),
      details: results,
      warnings
    });
  }

  /**
   * Process performance test results
   */
  private processPerformanceResults(results: any[]): void {
    const passed = results.filter(r => r.passed).length;
    const warnings: string[] = [];
    
    // Calculate weighted performance score
    let totalScore = 0;
    let maxScore = 0;
    
    results.forEach(result => {
      if (result.benchmark) {
        const ratio = Math.min(result.benchmark.target / result.benchmark.actual, 1);
        totalScore += ratio * 100;
        maxScore += 100;
      }
      
      if (!result.passed) {
        warnings.push(`Performance: ${result.testName} - ${result.message}`);
      }
    });
    
    const weightedScore = maxScore > 0 ? Math.round(totalScore / maxScore * 100) : 0;
    
    this.results.push({
      category: 'Performance & Optimization',
      passed,
      total: results.length,
      score: weightedScore,
      details: results,
      warnings
    });
  }

  /**
   * Process integration test results
   */
  private processIntegrationResults(results: any[]): void {
    const passed = results.filter(r => r.passed).length;
    const warnings: string[] = [];
    
    results.forEach(result => {
      if (!result.passed) {
        warnings.push(`Integration: ${result.testName} - ${result.message}`);
      }
      
      if (result.warnings) {
        result.warnings.forEach((warning: string) => {
          warnings.push(`Integration Warning: ${warning}`);
        });
      }
    });
    
    this.results.push({
      category: 'System Integration',
      passed,
      total: results.length,
      score: Math.round((passed / results.length) * 100),
      details: results,
      warnings
    });
  }

  /**
   * Generate comprehensive summary
   */
  private generateSummary(): TestSummary {
    const totalTests = this.results.reduce((sum, result) => sum + result.total, 0);
    const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
    const overallScore = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    
    // Determine status
    let status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
    if (overallScore >= 90) {
      status = 'excellent';
    } else if (overallScore >= 75) {
      status = 'good';
    } else if (overallScore >= 50) {
      status = 'needs_improvement';
    } else {
      status = 'critical';
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations();
    
    return {
      overallScore,
      totalTests,
      totalPassed,
      categories: this.results,
      recommendations,
      status
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    this.results.forEach(category => {
      const passRate = category.passed / category.total;
      
      if (passRate < 0.8) {
        recommendations.push(`Improve ${category.category}: ${category.passed}/${category.total} tests passing`);
      }
      
      if (category.score < 70) {
        recommendations.push(`Address performance issues in ${category.category} (score: ${category.score}/100)`);
      }
      
      if (category.warnings.length > 0) {
        recommendations.push(`Review ${category.warnings.length} warnings in ${category.category}`);
      }
    });
    
    // Specific recommendations based on patterns
    const craftingCategory = this.results.find(r => r.category.includes('Crafting'));
    const performanceCategory = this.results.find(r => r.category.includes('Performance'));
    const integrationCategory = this.results.find(r => r.category.includes('Integration'));
    
    if (craftingCategory && craftingCategory.score < 80) {
      recommendations.push('Review core crafting functionality - basic features may not be working correctly');
    }
    
    if (performanceCategory && performanceCategory.score < 70) {
      recommendations.push('Optimize performance - consider implementing caching and memoization');
    }
    
    if (integrationCategory && integrationCategory.score < 80) {
      recommendations.push('Fix integration issues - ensure proper synchronization between systems');
    }
    
    // If no major issues, suggest improvements
    if (recommendations.length === 0) {
      recommendations.push('Consider adding more comprehensive error handling');
      recommendations.push('Implement additional performance monitoring');
      recommendations.push('Add more detailed logging for debugging');
    }
    
    return recommendations;
  }

  /**
   * Print comprehensive master report
   */
  private printMasterReport(summary: TestSummary): void {
    console.log('\n🎯 MASTER VALIDATION REPORT');
    console.log('===========================');
    
    // Overall status
    const statusEmoji = {
      excellent: '🎉',
      good: '👍',
      needs_improvement: '⚠️',
      critical: '🚨'
    };
    
    console.log(`${statusEmoji[summary.status]} Overall Status: ${summary.status.toUpperCase()}`);
    console.log(`📊 Overall Score: ${summary.overallScore}/100`);
    console.log(`✅ Tests Passed: ${summary.totalPassed}/${summary.totalTests}`);
    
    // Category breakdown
    console.log('\n📋 Category Breakdown:');
    console.log('----------------------');
    
    summary.categories.forEach(category => {
      const categoryEmoji = category.score >= 80 ? '✅' : category.score >= 60 ? '⚠️' : '❌';
      console.log(`${categoryEmoji} ${category.category}: ${category.score}/100 (${category.passed}/${category.total} tests)`);
      
      if (category.warnings.length > 0) {
        console.log(`   ⚠️ ${category.warnings.length} warnings`);
      }
    });
    
    // Recommendations
    if (summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      console.log('-------------------');
      summary.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    // Final assessment
    console.log('\n🎯 Final Assessment:');
    console.log('--------------------');
    
    switch (summary.status) {
      case 'excellent':
        console.log('🎉 Outstanding! The crafting system is production-ready with excellent quality.');
        console.log('   All major functionality works correctly with good performance.');
        break;
      case 'good':
        console.log('👍 Good quality system with minor issues to address.');
        console.log('   Core functionality works well, some optimizations recommended.');
        break;
      case 'needs_improvement':
        console.log('⚠️ System needs improvement before production deployment.');
        console.log('   Several issues need to be addressed for optimal performance.');
        break;
      case 'critical':
        console.log('🚨 Critical issues detected! System requires significant fixes.');
        console.log('   Do not deploy until major issues are resolved.');
        break;
    }
    
    console.log('\n===========================');
    console.log('🏁 Master Validation Complete');
  }

  /**
   * Get detailed results
   */
  getResults(): MasterTestResult[] {
    return this.results;
  }
}

/**
 * Export convenience function for running all validations
 */
export async function runMasterValidation(): Promise<TestSummary> {
  const validator = new MasterValidator();
  return await validator.runAllValidations();
}

/**
 * Export for console testing
 */
if (typeof window !== 'undefined') {
  (window as any).runMasterValidation = runMasterValidation;
  (window as any).MasterValidator = MasterValidator;
  
  // Add convenient console commands
  (window as any).testCrafting = validateCraftingSystem;
  (window as any).testPerformance = validatePerformance;
  (window as any).testIntegration = validateIntegration;
  (window as any).testAll = runMasterValidation;
  
  console.log('🧪 Crafting System Validation Tools Loaded!');
  console.log('Available commands:');
  console.log('  - testCrafting()     : Run crafting system tests');
  console.log('  - testPerformance()  : Run performance tests');
  console.log('  - testIntegration()  : Run integration tests');
  console.log('  - testAll()          : Run complete validation suite');
}