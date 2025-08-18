/**
 * Configuration system for Documentation Sync Analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import type { AnalysisConfig } from '../interfaces/AnalysisTypes';

export const DEFAULT_CONFIG: AnalysisConfig = {
  paths: {
    sourceCode: 'src',
    documentation: 'documentazione',
    output: 'analysis-reports'
  },
  analysis: {
    enableVersionCheck: true,
    enableFeatureCheck: true,
    enableProtectionCheck: true,
    severityThresholds: {
      critical: 90,
      high: 70,
      medium: 50
    }
  },
  output: {
    format: 'markdown',
    includeMetrics: true,
    includeRecommendations: true
  }
};

export class ConfigManager {
  private config: AnalysisConfig;

  constructor(customConfig?: Partial<AnalysisConfig>) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, customConfig);
  }

  getConfig(): AnalysisConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AnalysisConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  private mergeConfig(base: AnalysisConfig, updates?: Partial<AnalysisConfig>): AnalysisConfig {
    if (!updates) return base;

    return {
      paths: { ...base.paths, ...updates.paths },
      analysis: { ...base.analysis, ...updates.analysis },
      output: { ...base.output, ...updates.output }
    };
  }

  validateConfig(): boolean {
    const { paths, analysis, output } = this.config;
    
    // Validate paths
    if (!paths.sourceCode || !paths.documentation || !paths.output) {
      throw new Error('All paths must be specified in configuration');
    }

    // Validate thresholds
    const { critical, high, medium } = analysis.severityThresholds;
    if (critical <= high || high <= medium || medium < 0) {
      throw new Error('Severity thresholds must be in descending order and non-negative');
    }

    // Validate output format
    if (!['markdown', 'json', 'html'].includes(output.format)) {
      throw new Error('Output format must be markdown, json, or html');
    }

    return true;
  }
}