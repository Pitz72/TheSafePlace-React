#!/usr/bin/env node

/**
 * Main Migration Script for Documentation Reorganization
 * The Safe Place - Documentation Management System
 * 
 * Usage:
 *   npm run migrate-docs              # Run migration
 *   npm run migrate-docs --dry-run    # Preview changes without executing
 *   npm run migrate-docs --help       # Show help
 */

import { DEFAULT_CONFIG, ReorganizationConfig } from './config.js';
import { MigrationLogger } from './logger.js';
import { MigrationOrchestrator } from './migration-orchestrator.js';

interface CliOptions {
  dryRun: boolean;
  help: boolean;
  verbose: boolean;
  noBackup: boolean;
  configFile?: string;
}

class DocumentationMigrationCLI {
  private options: CliOptions;
  private config: ReorganizationConfig;
  private logger: MigrationLogger;

  constructor() {
    this.options = this.parseArguments();
    this.config = this.loadConfiguration();
    this.logger = new MigrationLogger('migration.log');
  }

  private parseArguments(): CliOptions {
    const args = process.argv.slice(2);
    
    const options: CliOptions = {
      dryRun: false,
      help: false,
      verbose: false,
      noBackup: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--dry-run':
        case '-d':
          options.dryRun = true;
          break;
        case '--help':
        case '-h':
          options.help = true;
          break;
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
        case '--no-backup':
          options.noBackup = true;
          break;
        case '--config':
        case '-c':
          options.configFile = args[++i];
          break;
        default:
          if (arg.startsWith('-')) {
            console.error(`Unknown option: ${arg}`);
            process.exit(1);
          }
      }
    }

    return options;
  }

  private loadConfiguration(): ReorganizationConfig {
    let config = { ...DEFAULT_CONFIG };
    
    // Apply CLI options
    if (this.options.dryRun) {
      config.dryRun = true;
    }
    
    if (this.options.noBackup) {
      config.backupEnabled = false;
    }

    // Load custom config file if specified
    if (this.options.configFile) {
      try {
        const fs = require('fs');
        const customConfig = JSON.parse(fs.readFileSync(this.options.configFile, 'utf-8'));
        config = { ...config, ...customConfig };
        console.log(`📄 Loaded configuration from ${this.options.configFile}`);
      } catch (error) {
        console.error(`❌ Failed to load config file ${this.options.configFile}:`, error);
        process.exit(1);
      }
    }

    return config;
  }

  private showHelp(): void {
    console.log(`
📚 Documentation Reorganization Tool
===================================

Reorganizes scattered documentation files into a structured hierarchy.

USAGE:
  npm run migrate-docs [options]

OPTIONS:
  -d, --dry-run        Preview changes without executing them
  -h, --help          Show this help message
  -v, --verbose       Enable verbose logging
  --no-backup         Skip backup creation (not recommended)
  -c, --config FILE   Use custom configuration file

EXAMPLES:
  npm run migrate-docs --dry-run     # Preview the migration
  npm run migrate-docs               # Execute the migration
  npm run migrate-docs --no-backup   # Migrate without backup

WHAT IT DOES:
  1. 🔍 Scans for markdown files in root and docs/ directories
  2. 📦 Creates backup of all files (unless --no-backup)
  3. 📁 Creates target directory structure in documentazione/
  4. 📄 Moves files to appropriate categories:
     - API docs → documentazione/api/
     - Changelogs → documentazione/changelog/
     - Anti-regression → documentazione/anti-regressione/
     - Consolidation → documentazione/consolidamento/
     - Other files → documentazione/root-docs/
  5. 🔗 Updates internal references and links
  6. ✅ Validates migration results
  7. 🧹 Cleans up empty directories

SAFETY FEATURES:
  - Automatic backup creation
  - Dry-run mode for preview
  - Rollback capability
  - Reference validation
  - Conflict detection

For more information, see: .kiro/specs/documentation-reorganization/
`);
  }

  private async showPreMigrationSummary(): Promise<void> {
    console.log(`
🚀 DOCUMENTATION REORGANIZATION
==============================

Configuration:
  Source directories: ${this.config.sourceDirectories.join(', ')}
  Target directory: ${this.config.targetDirectory}
  Backup enabled: ${this.config.backupEnabled ? '✅' : '❌'}
  Dry run mode: ${this.config.dryRun ? '✅' : '❌'}

Category Mappings:
${Object.entries(this.config.categoryMappings)
  .map(([cat, dir]) => `  ${cat} → ${this.config.targetDirectory}/${dir}/`)
  .join('\n')}

Excluded Patterns:
  ${this.config.excludePatterns.join(', ')}
`);

    if (this.config.dryRun) {
      console.log('🔍 DRY RUN MODE: No files will be modified\n');
    } else {
      console.log('⚠️  LIVE MODE: Files will be moved and modified\n');
    }
  }

  private async confirmExecution(): Promise<boolean> {
    if (this.config.dryRun) {
      return true; // No confirmation needed for dry run
    }

    // In a real CLI, we'd use a proper prompt library
    // For now, we'll assume confirmation
    console.log('⚠️  This will modify your file system. Make sure you have committed your changes to git.');
    console.log('✅ Proceeding with migration...\n');
    return true;
  }

  async run(): Promise<void> {
    try {
      if (this.options.help) {
        this.showHelp();
        return;
      }

      console.log('📚 The Safe Place - Documentation Reorganization Tool\n');

      await this.showPreMigrationSummary();

      const confirmed = await this.confirmExecution();
      if (!confirmed) {
        console.log('❌ Migration cancelled by user');
        return;
      }

      const orchestrator = new MigrationOrchestrator(this.config, this.logger);

      // Phase 1: Planning
      console.log('📋 Phase 1: Planning migration...');
      const plan = await orchestrator.planMigration();
      
      this.showMigrationPlan(plan);

      // Phase 2: Execution
      console.log('🚀 Phase 2: Executing migration...');
      const result = await orchestrator.executeMigration(plan);

      // Phase 3: Results
      console.log('📊 Phase 3: Migration results...');
      await this.showResults(result);

      // Save logs
      await this.logger.saveLogs();

      if (result.success) {
        console.log('\n✅ Documentation reorganization completed successfully!');
        console.log('📁 All files have been moved to the documentazione/ directory');
        console.log('🔗 Internal references have been updated');
        console.log(`📋 Migration log saved to migration.log`);
        
        if (this.config.backupEnabled) {
          console.log('💾 Backup created for safety - you can rollback if needed');
        }
      } else {
        console.log('\n❌ Migration completed with errors');
        console.log('📋 Check migration.log for details');
        process.exit(1);
      }

    } catch (error) {
      this.logger.error('Migration failed:', error);
      console.error('\n❌ Migration failed:', error);
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      
      console.log('📋 Check migration.log for detailed error information');
      process.exit(1);
    }
  }

  private showMigrationPlan(plan: any): void {
    console.log(`
📋 MIGRATION PLAN
================
Total files to migrate: ${plan.summary.totalFiles}
Estimated duration: ${plan.summary.estimatedDuration}s

Files by category:
${Object.entries(plan.summary.filesByCategory)
  .map(([cat, count]) => `  ${cat}: ${count} files`)
  .join('\n')}

Operations:
  File moves: ${plan.operations.length}
  Reference updates: ${plan.referencesToUpdate.length}
  Directories to create: ${plan.directoriesToCreate.length}
`);
  }

  private async showResults(result: any): Promise<void> {
    const successfulOps = result.operations.filter((op: any) => op.success).length;
    const failedOps = result.operations.filter((op: any) => !op.success).length;

    console.log(`
📊 MIGRATION RESULTS
===================
Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}
Duration: ${Math.round(result.duration / 1000)}s
Operations: ${successfulOps} successful, ${failedOps} failed
Errors: ${result.errors.length}
Warnings: ${result.warnings.length}
`);

    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach((error: any, index: number) => {
        console.log(`  ${index + 1}. ${error.message}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      result.warnings.forEach((warning: string, index: number) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    // Show summary from logger
    console.log(this.logger.generateSummary());
  }
}

// Main execution
if (require.main === module) {
  const cli = new DocumentationMigrationCLI();
  cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { DocumentationMigrationCLI };