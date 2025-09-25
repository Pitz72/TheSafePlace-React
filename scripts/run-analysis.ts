/**
 * CLI Script to run Documentation Sync Analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import { runDocumentationAnalysis } from './src/analysis/AnalysisRunner';

async function main() {
  try {
    console.log('🚀 Starting Documentation Sync Analysis for The Safe Place');
    console.log('=========================================================\n');

    const result = await runDocumentationAnalysis({
      output: {
        format: 'markdown',
        includeMetrics: true,
        includeRecommendations: true
      }
    });

    if (result.success) {
      console.log('\n✅ Analysis completed successfully!');
      console.log('\n📄 FULL REPORT:');
      console.log('================');
      console.log(result.report);
      
      if (result.errors.length > 0) {
        console.log('\n⚠️ Warnings encountered:');
        result.errors.forEach(error => console.log(`- ${error}`));
      }
    } else {
      console.error('\n❌ Analysis failed:');
      console.error(result.summary);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the analysis
main();