/**
 * File Scanner Component for Documentation Reorganization
 * The Safe Place - Documentation Management System
 */

import { DocumentFile, DocumentCategory, CATEGORIZATION_RULES, ReorganizationConfig } from './config.js';
import { MigrationLogger } from './logger.js';

export class FileScanner {
  private config: ReorganizationConfig;
  private logger: MigrationLogger;

  constructor(config: ReorganizationConfig, logger: MigrationLogger) {
    this.config = config;
    this.logger = logger;
  }

  async scanRootDirectory(): Promise<DocumentFile[]> {
    this.logger.info('🔍 Scanning root directory for markdown files...');
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const files = await fs.readdir('.', { withFileTypes: true });
      const markdownFiles: DocumentFile[] = [];

      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.md')) {
          // Check if file should be excluded
          if (this.shouldExcludeFile(file.name)) {
            this.logger.debug(`Excluding file: ${file.name}`);
            continue;
          }

          try {
            const filePath = path.join('.', file.name);
            const content = await fs.readFile(filePath, 'utf-8');
            const stats = await fs.stat(filePath);
            
            const documentFile: DocumentFile = {
              path: filePath,
              name: file.name,
              content,
              size: stats.size,
              lastModified: stats.mtime,
              category: this.categorizeFile(file.name, content)
            };

            markdownFiles.push(documentFile);
            this.logger.debug(`Found: ${file.name} (${documentFile.category})`);
          } catch (error) {
            this.logger.error(`Failed to read file ${file.name}:`, error);
          }
        }
      }

      this.logger.info(`✅ Found ${markdownFiles.length} markdown files in root directory`);
      return markdownFiles;
    } catch (error) {
      this.logger.error('Failed to scan root directory:', error);
      throw error;
    }
  }

  async scanDocsDirectory(): Promise<DocumentFile[]> {
    this.logger.info('🔍 Scanning docs/ directory...');
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Check if docs directory exists
      try {
        await fs.access('docs');
      } catch {
        this.logger.info('📁 docs/ directory not found, skipping...');
        return [];
      }

      const files = await fs.readdir('docs', { withFileTypes: true });
      const markdownFiles: DocumentFile[] = [];

      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.md')) {
          try {
            const filePath = path.join('docs', file.name);
            const content = await fs.readFile(filePath, 'utf-8');
            const stats = await fs.stat(filePath);
            
            const documentFile: DocumentFile = {
              path: filePath,
              name: file.name,
              content,
              size: stats.size,
              lastModified: stats.mtime,
              category: 'api' // All docs files are categorized as API documentation
            };

            markdownFiles.push(documentFile);
            this.logger.debug(`Found: ${filePath} (API documentation)`);
          } catch (error) {
            this.logger.error(`Failed to read file ${file.name}:`, error);
          }
        }
      }

      this.logger.info(`✅ Found ${markdownFiles.length} markdown files in docs/ directory`);
      return markdownFiles;
    } catch (error) {
      this.logger.error('Failed to scan docs directory:', error);
      throw error;
    }
  }

  categorizeFile(fileName: string, content?: string): DocumentCategory {
    // Check against categorization rules
    for (const [category, pattern] of Object.entries(CATEGORIZATION_RULES)) {
      if (pattern.test(fileName)) {
        switch (category) {
          case 'changelog':
            return 'changelog';
          case 'antiRegressione':
            return 'anti-regressione';
          case 'consolidamento':
            return 'consolidamento';
          case 'roadmap':
            return 'roadmap';
          case 'analisi':
            return 'analisi';
          case 'api':
            return 'api';
        }
      }
    }

    // Content-based categorization for edge cases
    if (content) {
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes('changelog') || lowerContent.includes('version')) {
        return 'changelog';
      }
      
      if (lowerContent.includes('anti-regressione') || lowerContent.includes('protezione')) {
        return 'anti-regressione';
      }
      
      if (lowerContent.includes('consolidamento') || lowerContent.includes('refactoring')) {
        return 'consolidamento';
      }
      
      if (lowerContent.includes('roadmap') || lowerContent.includes('piano di sviluppo')) {
        return 'roadmap';
      }
      
      if (lowerContent.includes('analisi') || lowerContent.includes('report')) {
        return 'analisi';
      }
      
      if (lowerContent.includes('api') || lowerContent.includes('documentation')) {
        return 'api';
      }
    }

    // Default category for unclassified files
    return 'root-docs';
  }

  private shouldExcludeFile(fileName: string): boolean {
    // Check against exclude patterns
    for (const pattern of this.config.excludePatterns) {
      // Simple pattern matching (could be enhanced with glob patterns)
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        if (regex.test(fileName)) {
          return true;
        }
      } else if (fileName === pattern) {
        return true;
      }
    }
    
    return false;
  }

  async getAllDocumentFiles(): Promise<DocumentFile[]> {
    this.logger.info('🔍 Starting comprehensive file scan...');
    
    const [rootFiles, docsFiles] = await Promise.all([
      this.scanRootDirectory(),
      this.scanDocsDirectory()
    ]);

    const allFiles = [...rootFiles, ...docsFiles];
    
    // Generate summary
    const summary = this.generateScanSummary(allFiles);
    this.logger.info('📊 Scan Summary:', summary);
    
    return allFiles;
  }

  private generateScanSummary(files: DocumentFile[]): Record<string, any> {
    const summary = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      byCategory: {} as Record<DocumentCategory, number>,
      byLocation: {
        root: files.filter(f => !f.path.startsWith('docs/')).length,
        docs: files.filter(f => f.path.startsWith('docs/')).length
      }
    };

    // Count by category
    for (const file of files) {
      summary.byCategory[file.category] = (summary.byCategory[file.category] || 0) + 1;
    }

    return summary;
  }

  // Utility method to check if a file exists in target location
  async checkTargetConflicts(files: DocumentFile[]): Promise<string[]> {
    const conflicts: string[] = [];
    const fs = await import('fs/promises');
    const path = await import('path');

    for (const file of files) {
      const targetDir = this.config.categoryMappings[file.category];
      const targetPath = path.join(this.config.targetDirectory, targetDir, file.name);
      
      try {
        await fs.access(targetPath);
        conflicts.push(`${file.path} -> ${targetPath} (file already exists)`);
      } catch {
        // File doesn't exist, no conflict
      }
    }

    if (conflicts.length > 0) {
      this.logger.warn(`⚠️  Found ${conflicts.length} potential conflicts:`, conflicts);
    }

    return conflicts;
  }
}