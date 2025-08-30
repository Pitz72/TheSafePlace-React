/**
 * Logging System for Documentation Reorganization
 * The Safe Place - Documentation Management System
 */

import { MigrationOperation, CompletedOperation, MigrationError } from './config.js';

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: any;
}

export interface ProgressInfo {
  phase: string;
  completedItems: number;
  totalItems: number;
  estimatedTimeRemaining: number;
  currentOperation?: string;
}

export class MigrationLogger {
  private logs: LogEntry[] = [];
  private startTime: Date;
  private logFile: string;

  constructor(logFile: string = 'migration.log') {
    this.logFile = logFile;
    this.startTime = new Date();
    this.info('Migration logger initialized');
  }

  info(message: string, context?: any): void {
    this.addLog('info', message, context);
  }

  warn(message: string, context?: any): void {
    this.addLog('warn', message, context);
    console.warn(`⚠️  ${message}`, context || '');
  }

  error(message: string, context?: any): void {
    this.addLog('error', message, context);
    console.error(`❌ ${message}`, context || '');
  }

  debug(message: string, context?: any): void {
    this.addLog('debug', message, context);
    if (process.env.DEBUG) {
      console.log(`🔍 ${message}`, context || '');
    }
  }

  private addLog(level: LogEntry['level'], message: string, context?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context
    };
    
    this.logs.push(entry);
    
    // Console output for important messages
    if (level === 'info') {
      console.log(`ℹ️  ${message}`);
    }
  }

  logOperation(operation: MigrationOperation): void {
    this.info(`Planning operation: ${operation.type} ${operation.source}`, {
      operation,
      category: operation.category
    });
  }

  logCompletedOperation(operation: CompletedOperation): void {
    if (operation.success) {
      this.info(`✅ Completed: ${operation.type} ${operation.source}`, operation);
    } else {
      this.error(`❌ Failed: ${operation.type} ${operation.source}`, operation);
    }
  }

  logError(error: MigrationError): void {
    this.error(`Migration error: ${error.message}`, {
      type: error.type,
      file: error.file,
      recoverable: error.recoverable
    });
  }

  logProgress(progress: ProgressInfo): void {
    const percentage = Math.round((progress.completedItems / progress.totalItems) * 100);
    const eta = progress.estimatedTimeRemaining > 0 
      ? `ETA: ${Math.round(progress.estimatedTimeRemaining)}s` 
      : '';
    
    this.info(`📊 Progress: ${percentage}% (${progress.completedItems}/${progress.totalItems}) ${eta}`, {
      phase: progress.phase,
      currentOperation: progress.currentOperation
    });
  }

  generateSummary(): string {
    const duration = Date.now() - this.startTime.getTime();
    const errorCount = this.logs.filter(log => log.level === 'error').length;
    const warnCount = this.logs.filter(log => log.level === 'warn').length;
    const infoCount = this.logs.filter(log => log.level === 'info').length;

    return `
📋 MIGRATION SUMMARY
===================
Duration: ${Math.round(duration / 1000)}s
Total Log Entries: ${this.logs.length}
- Info: ${infoCount}
- Warnings: ${warnCount}
- Errors: ${errorCount}

Status: ${errorCount === 0 ? '✅ SUCCESS' : '❌ COMPLETED WITH ERRORS'}
`;
  }

  exportLogs(): LogEntry[] {
    return [...this.logs];
  }

  async saveLogs(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const logContent = this.logs.map(log => 
        `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}${
          log.context ? '\n  Context: ' + JSON.stringify(log.context, null, 2) : ''
        }`
      ).join('\n');

      await fs.writeFile(this.logFile, logContent, 'utf-8');
      this.info(`Logs saved to ${this.logFile}`);
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }

  // Progress tracking utilities
  createProgressTracker(totalItems: number, phase: string) {
    let completedItems = 0;
    const startTime = Date.now();

    return {
      increment: (currentOperation?: string) => {
        completedItems++;
        const elapsed = Date.now() - startTime;
        const estimatedTotal = (elapsed / completedItems) * totalItems;
        const estimatedTimeRemaining = (estimatedTotal - elapsed) / 1000;

        this.logProgress({
          phase,
          completedItems,
          totalItems,
          estimatedTimeRemaining,
          currentOperation
        });
      },
      
      complete: () => {
        const duration = (Date.now() - startTime) / 1000;
        this.info(`✅ Phase '${phase}' completed in ${Math.round(duration)}s`);
      }
    };
  }
}