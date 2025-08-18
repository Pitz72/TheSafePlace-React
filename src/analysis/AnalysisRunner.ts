/**
 * Main Analysis Runner for Documentation Sync Analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import { CodeScanner } from './scanners/CodeScanner';
import { DocumentationScanner } from './scanners/DocumentationScanner';
import { ComparisonEngine } from './engine/ComparisonEngine';
import { ReportGenerator } from './reports/ReportGenerator';
import { ConfigManager } from './config/AnalysisConfig';
import { ErrorHandler } from './utils/ErrorHandler';
import { FileSystemReader } from './utils/FileSystemReader';
import type { AnalysisConfig, ComparisonResult } from './interfaces/AnalysisTypes';

export class AnalysisRunner {
  private configManager: ConfigManager;
  private errorHandler: ErrorHandler;
  private codeScanner: CodeScanner;
  private docScanner: DocumentationScanner;
  private comparisonEngine: ComparisonEngine;
  private reportGenerator: ReportGenerator;

  constructor(customConfig?: Partial<AnalysisConfig>) {
    this.configManager = new ConfigManager(customConfig);
    this.errorHandler = new ErrorHandler();
    this.codeScanner = new CodeScanner(this.errorHandler);
    this.docScanner = new DocumentationScanner(this.errorHandler);
    this.comparisonEngine = new ComparisonEngine(this.errorHandler);
    this.reportGenerator = new ReportGenerator(this.errorHandler);
  }

  /**
   * Run complete documentation sync analysis
   */
  async runAnalysis(): Promise<{
    success: boolean;
    report: string;
    summary: string;
    errors: string[];
  }> {
    try {
      console.log('🚀 Starting Documentation Sync Analysis...');
      console.log('=====================================');

      // Validate configuration
      this.configManager.validateConfig();
      const config = this.configManager.getConfig();

      // Load project files
      console.log('📁 Loading project files...');
      const files = await this.loadProjectFiles(config);
      console.log(`✅ Loaded ${files.size} files`);

      // Scan codebase
      console.log('\n🔍 Analyzing codebase...');
      const codeResult = await this.codeScanner.scanCodebase(files);
      console.log('✅ Code analysis completed');
      console.log(this.codeScanner.getSummary(codeResult));

      // Scan documentation
      console.log('\n📚 Analyzing documentation...');
      const docResult = await this.docScanner.scanDocumentation(files);
      console.log('✅ Documentation analysis completed');
      console.log(this.docScanner.getSummary(docResult));

      // Compare results
      console.log('\n⚖️ Comparing code and documentation...');
      const comparisonResult = await this.comparisonEngine.compareCodeAndDocumentation(
        codeResult,
        docResult
      );
      console.log('✅ Comparison completed');

      // Generate report
      console.log('\n📄 Generating report...');
      const report = await this.reportGenerator.generateReport(
        codeResult,
        docResult,
        comparisonResult,
        config.output.format
      );
      console.log('✅ Report generated');

      // Create summary
      const summary = this.createSummary(comparisonResult);

      console.log('\n🎯 Analysis Summary:');
      console.log(summary);

      const errors = this.errorHandler.hasErrors()
        ? this.errorHandler.getErrors().map(e => e.message)
        : [];

      return {
        success: true,
        report,
        summary,
        errors
      };

    } catch (error) {
      console.error('❌ Analysis failed:', error);

      return {
        success: false,
        report: '',
        summary: `Analysis failed: ${error}`,
        errors: [String(error)]
      };
    }
  }

  /**
   * Load project files for analysis
   */
  private async loadProjectFiles(config: AnalysisConfig): Promise<Map<string, string>> {
    try {
      // Use FileSystemReader to load real files
      const fileReader = new FileSystemReader();

      console.log('📁 Reading real project files...');
      const files = await fileReader.readProjectFiles('.');

      if (files.size === 0) {
        console.warn('⚠️ No files found, falling back to mock data');
        return this.createMockFiles();
      }

      console.log(`✅ Successfully loaded ${files.size} real files`);
      return files;

    } catch (error) {
      console.warn('⚠️ Failed to read real files, using mock data:', error);
      return this.createMockFiles();
    }
  }

  /**
   * Create mock files as fallback
   */
  private createMockFiles(): Map<string, string> {
    const files = new Map<string, string>();

    // Simplified mock data for fallback
    files.set('package.json', JSON.stringify({
      name: 'the-safe-place',
      version: '0.4.0',
      dependencies: {
        'react': '^18.3.1',
        'tailwindcss': '^4.1.11',
        'zustand': '^4.5.2'
      }
    }, null, 2));

    files.set('README.md', `# The Safe Place v0.4.0 "Journal Bug Fix"`);

    return files;
  }

  /**
   * Create analysis summary
   */
  private createSummary(comparisonResult: ComparisonResult): string {
    const { metrics, discrepancies } = comparisonResult;

    const criticalIssues = discrepancies.filter(d => d.severity === 'critical');
    const highIssues = discrepancies.filter(d => d.severity === 'high');

    return `
📊 SYNCHRONIZATION LEVEL: ${metrics.syncPercentage}%
🚨 Critical Issues: ${metrics.criticalIssues}
⚠️ High Priority: ${metrics.categoryCounts.high || 0}
📋 Total Issues: ${metrics.totalIssues}

${criticalIssues.length > 0 ? '🚨 CRITICAL ISSUES FOUND:' : ''}
${criticalIssues.map(issue => `- ${issue.description}`).join('\n')}

${highIssues.length > 0 ? '\n⚠️ HIGH PRIORITY ISSUES:' : ''}
${highIssues.map(issue => `- ${issue.description}`).join('\n')}

${metrics.syncPercentage >= 80 ?
        '✅ Overall synchronization is good!' :
        '🔧 Synchronization needs improvement.'
      }
    `.trim();
  }

  /**
   * Get error summary
   */
  getErrorSummary(): string {
    return this.errorHandler.getSummary();
  }

  /**
   * Clear all errors and warnings
   */
  clearErrors(): void {
    this.errorHandler.clear();
  }
}

// Export for CLI usage
export async function runDocumentationAnalysis(config?: Partial<AnalysisConfig>) {
  const runner = new AnalysisRunner(config);
  return await runner.runAnalysis();
}