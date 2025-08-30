/**
 * Reference Updater Component for Documentation Reorganization
 * The Safe Place - Documentation Management System
 */

import { DocumentFile, ReferenceUpdate, ReorganizationConfig } from './config.js';
import { MigrationLogger } from './logger.js';

export interface Reference {
  originalPath: string;
  lineNumber: number;
  context: string;
  type: 'markdown-link' | 'relative-path' | 'absolute-path';
}

export interface PathMapping {
  oldPath: string;
  newPath: string;
  category: string;
}

export class ReferenceUpdater {
  private config: ReorganizationConfig;
  private logger: MigrationLogger;
  
  // Regex patterns for different types of references
  private readonly REFERENCE_PATTERNS = {
    // Markdown links: [text](path) or [text](path "title")
    markdownLink: /\[([^\]]*)\]\(([^)]+)\)/g,
    // Relative paths: ./path or ../path
    relativePath: /(?:\.\/|\.\.\/)[^\s\)]+\.md/g,
    // Documentation references: documentazione/path
    docPath: /documentazione\/[^\s\)]+\.md/g,
    // Root references: /path.md or just path.md
    rootPath: /(?:^|[^\/])([A-Z][A-Z0-9-]+\.md)/g
  };

  constructor(config: ReorganizationConfig, logger: MigrationLogger) {
    this.config = config;
    this.logger = logger;
  }

  async findReferences(files: DocumentFile[]): Promise<Map<string, Reference[]>> {
    this.logger.info('🔍 Scanning for internal references...');
    
    const allReferences = new Map<string, Reference[]>();
    const progress = this.logger.createProgressTracker(files.length, 'Reference Scanning');
    
    for (const file of files) {
      const references = this.findReferencesInFile(file);
      if (references.length > 0) {
        allReferences.set(file.path, references);
        this.logger.debug(`Found ${references.length} references in ${file.name}`);
      }
      progress.increment(`Scanning ${file.name}`);
    }
    
    progress.complete();
    
    const totalReferences = Array.from(allReferences.values()).reduce((sum, refs) => sum + refs.length, 0);
    this.logger.info(`✅ Found ${totalReferences} references across ${allReferences.size} files`);
    
    return allReferences;
  }

  private findReferencesInFile(file: DocumentFile): Reference[] {
    const references: Reference[] = [];
    const lines = file.content.split('\n');
    
    lines.forEach((line, index) => {
      // Find markdown links
      const markdownMatches = Array.from(line.matchAll(this.REFERENCE_PATTERNS.markdownLink));
      for (const match of markdownMatches) {
        const [fullMatch, text, path] = match;
        if (this.isInternalReference(path)) {
          references.push({
            originalPath: path,
            lineNumber: index + 1,
            context: line.trim(),
            type: 'markdown-link'
          });
        }
      }
      
      // Find relative paths
      const relativeMatches = Array.from(line.matchAll(this.REFERENCE_PATTERNS.relativePath));
      for (const match of relativeMatches) {
        references.push({
          originalPath: match[0],
          lineNumber: index + 1,
          context: line.trim(),
          type: 'relative-path'
        });
      }
      
      // Find documentation paths
      const docMatches = Array.from(line.matchAll(this.REFERENCE_PATTERNS.docPath));
      for (const match of docMatches) {
        references.push({
          originalPath: match[0],
          lineNumber: index + 1,
          context: line.trim(),
          type: 'absolute-path'
        });
      }
      
      // Find root file references (like CHANGELOG-v0.8.0.md)
      const rootMatches = Array.from(line.matchAll(this.REFERENCE_PATTERNS.rootPath));
      for (const match of rootMatches) {
        const path = match[1];
        if (this.isDocumentationFile(path)) {
          references.push({
            originalPath: path,
            lineNumber: index + 1,
            context: line.trim(),
            type: 'absolute-path'
          });
        }
      }
    });
    
    return references;
  }

  private isInternalReference(path: string): boolean {
    // Check if it's a relative path to a markdown file
    if (path.startsWith('./') || path.startsWith('../')) {
      return path.endsWith('.md');
    }
    
    // Check if it's a documentation path
    if (path.startsWith('documentazione/')) {
      return path.endsWith('.md');
    }
    
    // Check if it's a root markdown file
    return /^[A-Z][A-Z0-9-]+\.md$/i.test(path);
  }

  private isDocumentationFile(fileName: string): boolean {
    // Check if it matches our documentation file patterns
    const patterns = [
      /^CHANGELOG-.*\.md$/i,
      /^ANTI-REGRESSIONE-.*\.md$/i,
      /^CONSOLIDAMENTO-.*\.md$/i,
      /^ROADMAP-.*\.md$/i,
      /^ANALISI-.*\.md$/i
    ];
    
    return patterns.some(pattern => pattern.test(fileName));
  }

  generatePathMappings(files: DocumentFile[]): PathMapping[] {
    this.logger.info('🗺️  Generating path mappings...');
    
    const mappings: PathMapping[] = [];
    
    for (const file of files) {
      const targetDir = this.config.categoryMappings[file.category];
      const newPath = `documentazione/${targetDir}/${file.name}`;
      
      mappings.push({
        oldPath: file.path,
        newPath: newPath,
        category: file.category
      });
      
      // Also create mapping for just the filename (for root references)
      if (file.path.startsWith('./')) {
        mappings.push({
          oldPath: file.name,
          newPath: newPath,
          category: file.category
        });
      }
    }
    
    this.logger.info(`✅ Generated ${mappings.length} path mappings`);
    return mappings;
  }

  async updateReferences(
    files: DocumentFile[], 
    references: Map<string, Reference[]>, 
    pathMappings: PathMapping[]
  ): Promise<ReferenceUpdate[]> {
    this.logger.info('🔄 Updating references...');
    
    const updates: ReferenceUpdate[] = [];
    const mappingLookup = new Map(pathMappings.map(m => [m.oldPath, m.newPath]));
    
    const progress = this.logger.createProgressTracker(references.size, 'Reference Updates');
    
    for (const [filePath, fileReferences] of references) {
      const file = files.find(f => f.path === filePath);
      if (!file) continue;
      
      let updatedContent = file.content;
      let hasChanges = false;
      
      // Sort references by line number (descending) to avoid offset issues
      const sortedRefs = [...fileReferences].sort((a, b) => b.lineNumber - a.lineNumber);
      
      for (const ref of sortedRefs) {
        const newPath = this.resolveNewPath(ref.originalPath, mappingLookup, file);
        
        if (newPath && newPath !== ref.originalPath) {
          // Update the content
          const oldContent = updatedContent;
          updatedContent = this.replaceReference(updatedContent, ref, newPath);
          
          if (updatedContent !== oldContent) {
            hasChanges = true;
            updates.push({
              filePath: file.path,
              oldReference: ref.originalPath,
              newReference: newPath,
              lineNumber: ref.lineNumber
            });
            
            this.logger.debug(`Updated reference: ${ref.originalPath} -> ${newPath} in ${file.name}:${ref.lineNumber}`);
          }
        }
      }
      
      // Update the file content if there were changes
      if (hasChanges) {
        file.content = updatedContent;
      }
      
      progress.increment(`Processing ${file.name}`);
    }
    
    progress.complete();
    
    this.logger.info(`✅ Updated ${updates.length} references`);
    return updates;
  }

  private resolveNewPath(originalPath: string, mappingLookup: Map<string, string>, currentFile: DocumentFile): string | null {
    // Direct mapping lookup
    let newPath = mappingLookup.get(originalPath);
    if (newPath) {
      return this.makeRelativePath(newPath, currentFile);
    }
    
    // Try to resolve relative paths
    if (originalPath.startsWith('./') || originalPath.startsWith('../')) {
      const resolvedPath = this.resolveRelativePath(originalPath, currentFile.path);
      newPath = mappingLookup.get(resolvedPath);
      if (newPath) {
        return this.makeRelativePath(newPath, currentFile);
      }
    }
    
    // Try filename-only lookup for root files
    const fileName = originalPath.split('/').pop();
    if (fileName) {
      newPath = mappingLookup.get(fileName);
      if (newPath) {
        return this.makeRelativePath(newPath, currentFile);
      }
    }
    
    return null;
  }

  private resolveRelativePath(relativePath: string, currentFilePath: string): string {
    const path = require('path');
    const currentDir = path.dirname(currentFilePath);
    const resolved = path.resolve(currentDir, relativePath);
    return path.relative('.', resolved).replace(/\\/g, '/');
  }

  private makeRelativePath(targetPath: string, currentFile: DocumentFile): string {
    const path = require('path');
    
    // Determine where the current file will be after migration
    const currentTargetDir = this.config.categoryMappings[currentFile.category];
    const currentNewPath = `documentazione/${currentTargetDir}`;
    
    // Calculate relative path from new location
    const relativePath = path.relative(currentNewPath, targetPath).replace(/\\/g, '/');
    
    // Ensure it starts with ./ if it's a relative path
    if (!relativePath.startsWith('../') && !relativePath.startsWith('./')) {
      return './' + relativePath;
    }
    
    return relativePath;
  }

  private replaceReference(content: string, reference: Reference, newPath: string): string {
    const lines = content.split('\n');
    const lineIndex = reference.lineNumber - 1;
    
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      
      // Replace the specific reference in the line
      if (reference.type === 'markdown-link') {
        // For markdown links, replace the path part while preserving the text
        lines[lineIndex] = line.replace(
          new RegExp(`\\[([^\\]]*)\\]\\(${this.escapeRegex(reference.originalPath)}([^)]*)\\)`, 'g'),
          `[$1](${newPath}$2)`
        );
      } else {
        // For other types, direct replacement
        lines[lineIndex] = line.replace(
          new RegExp(this.escapeRegex(reference.originalPath), 'g'),
          newPath
        );
      }
    }
    
    return lines.join('\n');
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async validateReferences(files: DocumentFile[]): Promise<{ valid: boolean; brokenLinks: string[] }> {
    this.logger.info('✅ Validating updated references...');
    
    const brokenLinks: string[] = [];
    const fs = await import('fs/promises');
    
    for (const file of files) {
      const references = this.findReferencesInFile(file);
      
      for (const ref of references) {
        try {
          // Check if the referenced file exists
          const referencedPath = this.resolveRelativePath(ref.originalPath, file.path);
          await fs.access(referencedPath);
        } catch {
          brokenLinks.push(`${file.path}:${ref.lineNumber} -> ${ref.originalPath}`);
        }
      }
    }
    
    const isValid = brokenLinks.length === 0;
    
    if (isValid) {
      this.logger.info('✅ All references are valid');
    } else {
      this.logger.warn(`⚠️  Found ${brokenLinks.length} broken references:`, brokenLinks);
    }
    
    return { valid: isValid, brokenLinks };
  }
}