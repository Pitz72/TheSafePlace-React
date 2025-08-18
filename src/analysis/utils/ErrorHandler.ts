/**
 * Error handling system for Documentation Sync Analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import type { AnalysisError } from '../interfaces/AnalysisTypes';

export class ErrorHandler {
  private errors: AnalysisError[] = [];
  private warnings: AnalysisError[] = [];

  handleError(error: AnalysisError): void {
    if (error.severity === 'fatal') {
      this.errors.push(error);
      console.error(`[FATAL] ${error.message}`, error.file ? `in ${error.file}` : '');
      
      if (!error.recoverable) {
        throw new Error(`Fatal error: ${error.message}`);
      }
    } else if (error.severity === 'warning') {
      this.warnings.push(error);
      console.warn(`[WARNING] ${error.message}`, error.file ? `in ${error.file}` : '');
    } else {
      console.info(`[INFO] ${error.message}`, error.file ? `in ${error.file}` : '');
    }
  }

  createError(
    category: AnalysisError['category'],
    severity: AnalysisError['severity'],
    message: string,
    file?: string,
    line?: number,
    recoverable: boolean = true
  ): AnalysisError {
    return {
      category,
      severity,
      message,
      file,
      line,
      recoverable
    };
  }

  getErrors(): AnalysisError[] {
    return [...this.errors];
  }

  getWarnings(): AnalysisError[] {
    return [...this.warnings];
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  clear(): void {
    this.errors = [];
    this.warnings = [];
  }

  getSummary(): string {
    const errorCount = this.errors.length;
    const warningCount = this.warnings.length;
    
    if (errorCount === 0 && warningCount === 0) {
      return 'No errors or warnings';
    }
    
    const parts = [];
    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
    }
    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount > 1 ? 's' : ''}`);
    }
    
    return parts.join(', ');
  }
}