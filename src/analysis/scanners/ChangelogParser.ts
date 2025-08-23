import * as fs from 'fs';
import * as path from 'path';
import { MarkdownParser, MarkdownDocument } from './MarkdownParser';

/**
 * Represents a changelog entry
 */
export interface ChangelogEntry {
  version: string;
  date?: Date;
  title?: string;
  changes: ChangelogChange[];
  section: string;
  line: number;
  rawContent: string;
}

/**
 * Represents a single change in a changelog entry
 */
export interface ChangelogChange {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security' | 'other';
  description: string;
  line: number;
  category?: string;
}

/**
 * Represents a parsed changelog document
 */
export interface ChangelogDocument {
  filePath: string;
  title: string;
  entries: ChangelogEntry[];
  latestVersion?: string;
  metadata: ChangelogMetadata;
  lastModified: Date;
}

/**
 * Metadata about the changelog
 */
export interface ChangelogMetadata {
  totalEntries: number;
  totalChanges: number;
  changesByType: Record<string, number>;
  versionRange: {
    earliest?: string;
    latest?: string;
  };
  lastUpdated: Date;
}

/**
 * Parses changelog documents and extracts structured information
 */
export class ChangelogParser {
  private readonly markdownParser: MarkdownParser;

  private readonly versionPatterns: RegExp[] = [
    /^##?\s*\[?v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)\]?\s*-?\s*(\d{4}-\d{2}-\d{2})?/gi,
    /^##?\s*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)\s*\((\d{4}-\d{2}-\d{2})\)/gi,
    /^##?\s*Release\s+v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)\s*-?\s*(\d{4}-\d{2}-\d{2})?/gi,
    /^##?\s*Version\s+v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)\s*-?\s*(\d{4}-\d{2}-\d{2})?/gi
  ];

  private readonly changeTypePatterns: Array<{
    pattern: RegExp;
    type: ChangelogChange['type'];
  }> = [
    { pattern: /^###?\s*(?:Added|Aggiunto|Nuovo)/i, type: 'added' },
    { pattern: /^###?\s*(?:Changed|Modificato|Cambiato)/i, type: 'changed' },
    { pattern: /^###?\s*(?:Deprecated|Deprecato|Obsoleto)/i, type: 'deprecated' },
    { pattern: /^###?\s*(?:Removed|Rimosso|Eliminato)/i, type: 'removed' },
    { pattern: /^###?\s*(?:Fixed|Corretto|Risolto|Bug\s*Fix)/i, type: 'fixed' },
    { pattern: /^###?\s*(?:Security|Sicurezza)/i, type: 'security' },
    { pattern: /^\s*[-*+]\s*(?:Added|Aggiunto|Nuovo):/i, type: 'added' },
    { pattern: /^\s*[-*+]\s*(?:Changed|Modificato|Cambiato):/i, type: 'changed' },
    { pattern: /^\s*[-*+]\s*(?:Fixed|Corretto|Risolto):/i, type: 'fixed' },
    { pattern: /^\s*[-*+]\s*(?:Removed|Rimosso|Eliminato):/i, type: 'removed' }
  ];

  constructor() {
    this.markdownParser = new MarkdownParser();
  }

  /**
   * Parses a changelog file and returns structured data
   */
  async parseChangelogFile(filePath: string): Promise<ChangelogDocument> {
    try {
      const document = await this.markdownParser.parseMarkdownFile(filePath);
      const stats = await fs.promises.stat(filePath);
      
      const entries = this.extractChangelogEntries(document);
      const metadata = this.calculateMetadata(entries, stats.mtime);
      const latestVersion = this.findLatestVersion(entries);

      return {
        filePath,
        title: document.title || path.basename(filePath),
        entries,
        latestVersion,
        metadata,
        lastModified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to parse changelog file ${filePath}: ${error}`);
    }
  }

  /**
   * Parses multiple changelog files
   */
  async parseChangelogFiles(filePaths: string[]): Promise<ChangelogDocument[]> {
    const parsePromises = filePaths.map(filePath => 
      this.parseChangelogFile(filePath).catch(error => {
        console.warn(`Warning: Could not parse changelog ${filePath}:`, error);
        return null;
      })
    );

    const results = await Promise.all(parsePromises);
    return results.filter((doc): doc is ChangelogDocument => doc !== null);
  }

  /**
   * Extracts changelog entries from the document
   */
  private extractChangelogEntries(document: MarkdownDocument): ChangelogEntry[] {
    const entries: ChangelogEntry[] = [];
    const lines = document.content.split('\n');
    let currentEntry: Partial<ChangelogEntry> | null = null;
    let currentChangeType: ChangelogChange['type'] = 'other';
    let currentSection = '';

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check for version headers
      const versionMatch = this.matchVersionHeader(line);
      if (versionMatch) {
        // Save previous entry
        if (currentEntry) {
          entries.push(currentEntry as ChangelogEntry);
        }

        // Start new entry
        currentEntry = {
          version: versionMatch.version,
          date: versionMatch.date,
          title: versionMatch.title,
          changes: [],
          section: currentSection,
          line: lineNumber,
          rawContent: line
        };
        return;
      }

      // Check for section headers (H1)
      const sectionMatch = line.match(/^#\s+(.+)$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1].trim();
        return;
      }

      // Check for change type headers
      const changeTypeMatch = this.matchChangeTypeHeader(line);
      if (changeTypeMatch) {
        currentChangeType = changeTypeMatch;
        return;
      }

      // Check for change items
      if (currentEntry) {
        const changeMatch = line.match(/^\s*[-*+]\s*(.+)$/);
        if (changeMatch) {
          const description = changeMatch[1].trim();
          const change: ChangelogChange = {
            type: this.inferChangeType(description) || currentChangeType,
            description,
            line: lineNumber
          };

          currentEntry.changes!.push(change);
          currentEntry.rawContent += '\n' + line;
        } else if (line.trim() && !line.startsWith('#')) {
          // Add non-empty lines to raw content
          currentEntry.rawContent += '\n' + line;
        }
      }
    });

    // Save last entry
    if (currentEntry) {
      entries.push(currentEntry as ChangelogEntry);
    }

    return entries;
  }

  /**
   * Matches version headers in changelog
   */
  private matchVersionHeader(line: string): { version: string; date?: Date; title?: string } | null {
    for (const pattern of this.versionPatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(line);
      if (match) {
        const version = match[1];
        const dateStr = match[2];
        const date = dateStr ? new Date(dateStr) : undefined;
        
        // Extract title if present
        const titleMatch = line.match(/^##?\s*[^\s]+\s*-?\s*\d{4}-\d{2}-\d{2}?\s*-?\s*(.+)$/);
        const title = titleMatch ? titleMatch[1].trim() : undefined;

        return { version, date, title };
      }
    }
    return null;
  }

  /**
   * Matches change type headers
   */
  private matchChangeTypeHeader(line: string): ChangelogChange['type'] | null {
    for (const { pattern, type } of this.changeTypePatterns) {
      if (pattern.test(line)) {
        return type;
      }
    }
    return null;
  }

  /**
   * Infers change type from description
   */
  private inferChangeType(description: string): ChangelogChange['type'] | null {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('add') || lowerDesc.includes('nuovo') || lowerDesc.includes('aggiunto')) {
      return 'added';
    }
    if (lowerDesc.includes('fix') || lowerDesc.includes('corretto') || lowerDesc.includes('risolto')) {
      return 'fixed';
    }
    if (lowerDesc.includes('change') || lowerDesc.includes('modifica') || lowerDesc.includes('update')) {
      return 'changed';
    }
    if (lowerDesc.includes('remove') || lowerDesc.includes('delete') || lowerDesc.includes('rimosso')) {
      return 'removed';
    }
    if (lowerDesc.includes('deprecat') || lowerDesc.includes('obsoleto')) {
      return 'deprecated';
    }
    if (lowerDesc.includes('security') || lowerDesc.includes('sicurezza')) {
      return 'security';
    }
    
    return null;
  }

  /**
   * Calculates metadata about the changelog
   */
  private calculateMetadata(entries: ChangelogEntry[], lastModified: Date): ChangelogMetadata {
    const totalEntries = entries.length;
    const totalChanges = entries.reduce((sum, entry) => sum + entry.changes.length, 0);
    
    const changesByType: Record<string, number> = {};
    entries.forEach(entry => {
      entry.changes.forEach(change => {
        changesByType[change.type] = (changesByType[change.type] || 0) + 1;
      });
    });

    // Find version range
    const versions = entries.map(e => e.version).filter(v => v);
    const sortedVersions = this.sortVersions(versions);
    const versionRange = {
      earliest: sortedVersions[0],
      latest: sortedVersions[sortedVersions.length - 1]
    };

    return {
      totalEntries,
      totalChanges,
      changesByType,
      versionRange,
      lastUpdated: lastModified
    };
  }

  /**
   * Finds the latest version in the changelog
   */
  private findLatestVersion(entries: ChangelogEntry[]): string | undefined {
    if (entries.length === 0) return undefined;
    
    const versions = entries.map(e => e.version).filter(v => v);
    const sortedVersions = this.sortVersions(versions);
    
    return sortedVersions[sortedVersions.length - 1];
  }

  /**
   * Sorts versions in semantic version order
   */
  private sortVersions(versions: string[]): string[] {
    return versions.sort((a, b) => {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        
        if (aPart !== bPart) {
          return aPart - bPart;
        }
      }
      
      return 0;
    });
  }

  /**
   * Finds entries for a specific version
   */
  findEntriesByVersion(document: ChangelogDocument, version: string): ChangelogEntry[] {
    return document.entries.filter(entry => entry.version === version);
  }

  /**
   * Finds changes by type
   */
  findChangesByType(document: ChangelogDocument, type: ChangelogChange['type']): ChangelogChange[] {
    const changes: ChangelogChange[] = [];
    document.entries.forEach(entry => {
      entry.changes.forEach(change => {
        if (change.type === type) {
          changes.push(change);
        }
      });
    });
    return changes;
  }

  /**
   * Finds entries within a date range
   */
  findEntriesByDateRange(document: ChangelogDocument, startDate: Date, endDate: Date): ChangelogEntry[] {
    return document.entries.filter(entry => {
      if (!entry.date) return false;
      return entry.date >= startDate && entry.date <= endDate;
    });
  }

  /**
   * Validates changelog structure
   */
  validateChangelog(document: ChangelogDocument): Array<{
    type: 'warning' | 'error';
    message: string;
    entry?: ChangelogEntry;
  }> {
    const issues: Array<{
      type: 'warning' | 'error';
      message: string;
      entry?: ChangelogEntry;
    }> = [];

    // Check for entries without dates
    document.entries.forEach(entry => {
      if (!entry.date) {
        issues.push({
          type: 'warning',
          message: `Entry for version ${entry.version} has no date`,
          entry
        });
      }
    });

    // Check for entries without changes
    document.entries.forEach(entry => {
      if (entry.changes.length === 0) {
        issues.push({
          type: 'warning',
          message: `Entry for version ${entry.version} has no changes listed`,
          entry
        });
      }
    });

    // Check for duplicate versions
    const versionCounts = new Map<string, number>();
    document.entries.forEach(entry => {
      const count = versionCounts.get(entry.version) || 0;
      versionCounts.set(entry.version, count + 1);
    });

    versionCounts.forEach((count, version) => {
      if (count > 1) {
        issues.push({
          type: 'error',
          message: `Duplicate entries found for version ${version}`
        });
      }
    });

    // Check chronological order
    const datedEntries = document.entries.filter(e => e.date).sort((a, b) => a.line - b.line);
    for (let i = 1; i < datedEntries.length; i++) {
      const prev = datedEntries[i - 1];
      const curr = datedEntries[i];
      
      if (prev.date! > curr.date!) {
        issues.push({
          type: 'warning',
          message: `Entries may not be in chronological order: ${prev.version} (${prev.date!.toISOString().split('T')[0]}) comes before ${curr.version} (${curr.date!.toISOString().split('T')[0]})`,
          entry: curr
        });
      }
    }

    return issues;
  }
}