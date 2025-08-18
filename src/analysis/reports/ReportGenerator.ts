/**
 * Report Generator for Documentation Sync Analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import type { 
  ComparisonResult, 
  CodeScanResult, 
  DocScanResult, 
  Discrepancy, 
  Recommendation 
} from '../interfaces/AnalysisTypes';
import { ErrorHandler } from '../utils/ErrorHandler';

export class ReportGenerator {
  private errorHandler: ErrorHandler;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
  }

  /**
   * Generate comprehensive analysis report
   */
  async generateReport(
    codeResult: CodeScanResult,
    docResult: DocScanResult,
    comparisonResult: ComparisonResult,
    format: 'markdown' | 'json' | 'html' = 'markdown'
  ): Promise<string> {
    try {
      console.log(`📄 Generating ${format} report...`);

      switch (format) {
        case 'markdown':
          return this.generateMarkdownReport(codeResult, docResult, comparisonResult);
        case 'json':
          return this.generateJsonReport(codeResult, docResult, comparisonResult);
        case 'html':
          return this.generateHtmlReport(codeResult, docResult, comparisonResult);
        default:
          throw new Error(`Unsupported report format: ${format}`);
      }
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'fatal',
          `Failed to generate report: ${error}`,
          undefined,
          undefined,
          false
        )
      );
      throw error;
    }
  }

  /**
   * Generate Markdown report
   */
  private generateMarkdownReport(
    codeResult: CodeScanResult,
    docResult: DocScanResult,
    comparisonResult: ComparisonResult
  ): string {
    const { discrepancies, metrics, recommendations } = comparisonResult;
    const timestamp = new Date().toISOString();

    return `# 🔍 Documentation Sync Analysis Report

**Generated:** ${timestamp}  
**Project:** The Safe Place v${codeResult.versions.package}  
**Analysis Type:** Complete Documentation-Code Synchronization

---

## 📊 Executive Summary

**Overall Synchronization: ${metrics.syncPercentage}%** ${this.getSyncStatusEmoji(metrics.syncPercentage)}

- **Total Issues Found:** ${metrics.totalIssues}
- **Critical Issues:** ${metrics.criticalIssues} 🚨
- **High Priority:** ${metrics.categoryCounts.high || 0} ⚠️
- **Medium Priority:** ${metrics.categoryCounts.medium || 0} 📋
- **Low Priority:** ${metrics.categoryCounts.low || 0} ℹ️

${this.generateSyncStatusMessage(metrics)}

---

## 🔍 Code Analysis Results

### Version Information
- **Package.json:** ${codeResult.versions.package}
- **StartScreen:** ${codeResult.versions.startScreen}
- **README:** ${codeResult.versions.readme}

### Project Structure
- **Components:** ${codeResult.structure.components.length} (${codeResult.structure.components.join(', ')})
- **Hooks:** ${codeResult.structure.hooks.length} (${codeResult.structure.hooks.join(', ')})
- **Contexts:** ${codeResult.structure.contexts.length} (${codeResult.structure.contexts.join(', ')})
- **Style Files:** ${codeResult.structure.styles.length}

### Implemented Features
${codeResult.features.implemented.map(feature => `- ✅ ${feature}`).join('\n')}

### Dependencies
${Object.entries(codeResult.features.dependencies)
  .map(([name, version]) => `- **${name}:** ${version}`)
  .join('\n')}

---

## 📚 Documentation Analysis Results

### Version Information
- **Documented:** ${docResult.versions.documented}
- **Latest Changelog:** ${docResult.versions.changelog}
- **Latest Anti-Regression:** ${docResult.versions.antiRegression}

### Documented Features
${docResult.features.documented.slice(0, 10).map(feature => `- 📋 ${feature}`).join('\n')}
${docResult.features.documented.length > 10 ? `\n... and ${docResult.features.documented.length - 10} more` : ''}

### Roadmap Status
${docResult.features.roadmap.map(item => 
  `- ${item.status === 'completed' ? '✅' : item.status === 'in_progress' ? '🔄' : '📋'} **v${item.version}** ${item.name}`
).join('\n')}

### Protection Systems
- **Anti-Regression Documents:** ${docResult.protections.antiRegression.length}
- **DSAR Requirements:** ${docResult.protections.dsar.length}

---

## 🚨 Critical Discrepancies Found

${this.generateDiscrepanciesSection(discrepancies.filter(d => d.severity === 'critical'), 'critical')}

## ⚠️ High Priority Issues

${this.generateDiscrepanciesSection(discrepancies.filter(d => d.severity === 'high'), 'high')}

## 📋 Medium Priority Issues

${this.generateDiscrepanciesSection(discrepancies.filter(d => d.severity === 'medium'), 'medium')}

## ℹ️ Low Priority Issues

${this.generateDiscrepanciesSection(discrepancies.filter(d => d.severity === 'low'), 'low')}

---

## 🎯 Actionable Recommendations

${recommendations.map((rec, index) => `
### ${index + 1}. ${rec.action} (${rec.priority.toUpperCase()} Priority)

**Description:** ${rec.description}  
**Estimated Effort:** ${rec.estimatedEffort}  
**Files Affected:** ${rec.files.join(', ')}

`).join('')}

---

## 📈 Detailed Metrics

### Synchronization by Category
${Object.entries(metrics.categoryCounts)
  .map(([category, count]) => `- **${category}:** ${count} issues`)
  .join('\n')}

### Severity Distribution
- 🚨 **Critical:** ${metrics.criticalIssues} (${Math.round(metrics.criticalIssues / metrics.totalIssues * 100)}%)
- ⚠️ **High:** ${metrics.categoryCounts.high || 0} (${Math.round((metrics.categoryCounts.high || 0) / metrics.totalIssues * 100)}%)
- 📋 **Medium:** ${metrics.categoryCounts.medium || 0} (${Math.round((metrics.categoryCounts.medium || 0) / metrics.totalIssues * 100)}%)
- ℹ️ **Low:** ${metrics.categoryCounts.low || 0} (${Math.round((metrics.categoryCounts.low || 0) / metrics.totalIssues * 100)}%)

---

## 🔧 Next Steps

### Immediate Actions Required
${recommendations
  .filter(rec => rec.priority === 'immediate')
  .map(rec => `1. ${rec.action}`)
  .join('\n')}

### Short-term Improvements
${recommendations
  .filter(rec => rec.priority === 'high')
  .map(rec => `1. ${rec.action}`)
  .join('\n')}

### Long-term Maintenance
${recommendations
  .filter(rec => rec.priority === 'medium' || rec.priority === 'low')
  .map(rec => `1. ${rec.action}`)
  .join('\n')}

---

## 📋 Summary

This analysis reveals a **${metrics.syncPercentage}% synchronization level** between code and documentation. 
${metrics.criticalIssues > 0 ? 
  `**Immediate attention required** for ${metrics.criticalIssues} critical issues.` : 
  'No critical issues found.'
}

**Priority Actions:**
1. ${recommendations[0]?.action || 'No immediate actions required'}
2. ${recommendations[1]?.action || 'Continue regular maintenance'}

**Estimated Total Effort:** ${this.calculateTotalEffort(recommendations)}

---

*Report generated by Documentation Sync Analysis System*  
*The Safe Place - Documentation Refactoring v0.4.0*
`;
  }

  /**
   * Generate JSON report
   */
  private generateJsonReport(
    codeResult: CodeScanResult,
    docResult: DocScanResult,
    comparisonResult: ComparisonResult
  ): string {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        project: 'The Safe Place',
        version: codeResult.versions.package,
        analysisType: 'documentation-sync'
      },
      summary: {
        syncPercentage: comparisonResult.metrics.syncPercentage,
        totalIssues: comparisonResult.metrics.totalIssues,
        criticalIssues: comparisonResult.metrics.criticalIssues,
        status: this.getSyncStatus(comparisonResult.metrics.syncPercentage)
      },
      codeAnalysis: codeResult,
      documentationAnalysis: docResult,
      comparison: comparisonResult
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(
    codeResult: CodeScanResult,
    docResult: DocScanResult,
    comparisonResult: ComparisonResult
  ): string {
    const markdownContent = this.generateMarkdownReport(codeResult, docResult, comparisonResult);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation Sync Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 40px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #e9ecef; border-radius: 5px; }
        .critical { color: #dc3545; }
        .high { color: #fd7e14; }
        .medium { color: #ffc107; }
        .low { color: #6c757d; }
        .success { color: #28a745; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        h1, h2, h3 { color: #495057; }
        .sync-percentage { font-size: 2em; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Documentation Sync Analysis Report</h1>
        <div class="sync-percentage ${comparisonResult.metrics.syncPercentage >= 80 ? 'success' : 'critical'}">
            ${comparisonResult.metrics.syncPercentage}% Synchronized
        </div>
    </div>
    <pre>${markdownContent}</pre>
</body>
</html>`;
  }

  /**
   * Generate discrepancies section for markdown
   */
  private generateDiscrepanciesSection(discrepancies: Discrepancy[], severity: string): string {
    if (discrepancies.length === 0) {
      return `No ${severity} issues found. ✅`;
    }

    return discrepancies.map((disc, index) => `
### ${severity.toUpperCase()}-${index + 1}: ${disc.description}

**Type:** ${disc.type}  
**Code Value:** ${disc.codeValue || 'N/A'}  
**Documentation Value:** ${disc.docValue || 'N/A'}  
**Files:** ${disc.files.join(', ')}  
**Recommendation:** ${disc.recommendation}

`).join('');
  }

  /**
   * Helper methods
   */
  private getSyncStatusEmoji(percentage: number): string {
    if (percentage >= 90) return '🟢';
    if (percentage >= 70) return '🟡';
    return '🔴';
  }

  private getSyncStatus(percentage: number): string {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'needs-improvement';
    return 'critical';
  }

  private generateSyncStatusMessage(metrics: any): string {
    const { syncPercentage, criticalIssues } = metrics;
    
    if (criticalIssues > 0) {
      return `⚠️ **ATTENTION REQUIRED:** ${criticalIssues} critical synchronization issues need immediate resolution.`;
    }
    
    if (syncPercentage >= 90) {
      return `✅ **EXCELLENT:** Documentation and code are well synchronized.`;
    }
    
    if (syncPercentage >= 70) {
      return `👍 **GOOD:** Minor discrepancies found, regular maintenance recommended.`;
    }
    
    return `🔧 **NEEDS WORK:** Significant synchronization issues require attention.`;
  }

  private calculateTotalEffort(recommendations: Recommendation[]): string {
    const effortCounts = recommendations.reduce((counts, rec) => {
      counts[rec.estimatedEffort] = (counts[rec.estimatedEffort] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const parts = [];
    if (effortCounts.high) parts.push(`${effortCounts.high} high-effort`);
    if (effortCounts.medium) parts.push(`${effortCounts.medium} medium-effort`);
    if (effortCounts.low) parts.push(`${effortCounts.low} low-effort`);

    return parts.join(', ') || 'No actions required';
  }
}