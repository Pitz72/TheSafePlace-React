import * as fs from 'fs';
import * as path from 'path';
import { MarkdownParser, MarkdownDocument, VersionInfo } from './MarkdownParser';

/**
 * Version information extracted from documentation
 */
export interface DocumentationVersionInfo {
  source: string;
  version: string;
  context: string;
  line: number;
  type: 'changelog' | 'readme' | 'roadmap' | 'anti-regression' | 'other';
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Consolidated version information from all documentation sources
 */
export interface DocumentationVersionSummary {
  primaryVersion?: string;
  allVersions: DocumentationVersionInfo[];
  versionsBySource: Record<string, DocumentationVersionInfo[]>;
  inconsistencies: VersionInconsistency[];
  lastUpdated: Date;
}

/**
 * Represents a version inconsistency between documentation sources
 */
export interface VersionInconsistency {
  expectedVersion: string;
  actualVersion: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

/**
 * Extracts version information from documentation files
 */
export class DocumentationVersionExtractor {
  private readonly markdownParser: MarkdownParser;
  
  private readonly versionPatterns: Array<{
    pattern: RegExp;
    confidence: 'high' | 'medium' | 'low';
    context: string;
  }> = [
    {
      pattern: /^#\s+(?:version|versione)\s+v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi,
      confidence: 'high',
      context: 'header'
    },
    {
      pattern: /^##\s+v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi,
      confidence: 'high',
      context: 'changelog-entry'
    },
    {
      pattern: /version\s*:?\s*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi,
      confidence: 'high',
      context: 'explicit-version'
    },
    {
      pattern: /versione\s*:?\s*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi,
      confidence: 'high',
      context: 'explicit-version-italian'
    },
    {
      pattern: /v(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/g,
      confidence: 'medium',
      context: 'version-reference'
    },
    {
      pattern: /(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/g,
      confidence: 'low',
      context: 'number-pattern'
    }
  ];

  constructor() {
    this.markdownParser = new MarkdownParser();
  }

  /**
   * Extracts version information from a single documentation file
   */
  async extractVersionsFromFile(filePath: string): Promise<DocumentationVersionInfo[]> {
    try {
      const document = await this.markdownParser.parseMarkdownFile(filePath);
      const fileType = this.classifyDocumentationType(filePath);
      
      const versions: DocumentationVersionInfo[] = [];
      const lines = document.content.split('\n');

      lines.forEach((line, index) => {
        for (const { pattern, confidence, context } of this.versionPatterns) {
          pattern.lastIndex = 0;
          let match;
          while ((match = pattern.exec(line)) !== null) {
            const version = match[1];
            
            // Skip obviously invalid versions
            if (!this.isValidVersion(version)) {
              continue;
            }

            versions.push({
              source: path.basename(filePath),
              version,
              context: line.trim(),
              line: index + 1,
              type: fileType,
              confidence
            });
          }
        }
      });

      // Remove duplicates and sort by confidence
      return this.deduplicateVersions(versions);
    } catch (error) {
      console.warn(`Warning: Could not extract versions from ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Extracts version information from multiple documentation files
   */
  async extractVersionsFromFiles(filePaths: string[]): Promise<DocumentationVersionSummary> {
    const allVersions: DocumentationVersionInfo[] = [];
    const versionsBySource: Record<string, DocumentationVersionInfo[]> = {};

    for (const filePath of filePaths) {
      const versions = await this.extractVersionsFromFile(filePath);
      const source = path.basename(filePath);
      
      allVersions.push(...versions);
      versionsBySource[source] = versions;
    }

    const primaryVersion = this.determinePrimaryVersion(allVersions);
    const inconsistencies = this.findVersionInconsistencies(allVersions, primaryVersion);

    return {
      primaryVersion,
      allVersions,
      versionsBySource,
      inconsistencies,
      lastUpdated: new Date()
    };
  }

  /**
   * Extracts versions from README files specifically
   */
  async extractVersionsFromReadme(readmePath: string): Promise<DocumentationVersionInfo[]> {
    const versions = await this.extractVersionsFromFile(readmePath);
    
    // Look for specific README patterns
    try {
      const content = await fs.promises.readFile(readmePath, 'utf-8');
      const lines = content.split('\n');
      
      // Look for badge patterns
      const badgePattern = /!\[Version\]\([^)]*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)[^)]*\)/gi;
      lines.forEach((line, index) => {
        let match;
        badgePattern.lastIndex = 0;
        while ((match = badgePattern.exec(line)) !== null) {
          versions.push({
            source: 'README.md',
            version: match[1],
            context: line.trim(),
            line: index + 1,
            type: 'readme',
            confidence: 'high'
          });
        }
      });
    } catch (error) {
      console.warn(`Warning: Could not read README file ${readmePath}:`, error);
    }

    return this.deduplicateVersions(versions);
  }

  /**
   * Extracts versions from changelog files
   */
  async extractVersionsFromChangelog(changelogPath: string): Promise<DocumentationVersionInfo[]> {
    const versions = await this.extractVersionsFromFile(changelogPath);
    
    try {
      const content = await fs.promises.readFile(changelogPath, 'utf-8');
      const lines = content.split('\n');
      
      // Look for changelog-specific patterns
      const changelogPatterns = [
        /^##?\s*\[?v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)\]?\s*-?\s*\d{4}-\d{2}-\d{2}/gi,
        /^##?\s*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)\s*\(/gi,
        /^##?\s*Release\s+v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi
      ];

      lines.forEach((line, index) => {
        changelogPatterns.forEach(pattern => {
          pattern.lastIndex = 0;
          let match;
          while ((match = pattern.exec(line)) !== null) {
            versions.push({
              source: path.basename(changelogPath),
              version: match[1],
              context: line.trim(),
              line: index + 1,
              type: 'changelog',
              confidence: 'high'
            });
          }
        });
      });
    } catch (error) {
      console.warn(`Warning: Could not read changelog file ${changelogPath}:`, error);
    }

    return this.deduplicateVersions(versions);
  }

  /**
   * Extracts versions from anti-regression files
   */
  async extractVersionsFromAntiRegression(filePath: string): Promise<DocumentationVersionInfo[]> {
    const versions = await this.extractVersionsFromFile(filePath);
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Look for anti-regression specific patterns
      const antiRegressionPatterns = [
        /ANTI-REGRESSIONE-v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi,
        /protezione\s+versione\s+v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi,
        /immutable.*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi
      ];

      lines.forEach((line, index) => {
        antiRegressionPatterns.forEach(pattern => {
          pattern.lastIndex = 0;
          let match;
          while ((match = pattern.exec(line)) !== null) {
            versions.push({
              source: path.basename(filePath),
              version: match[1],
              context: line.trim(),
              line: index + 1,
              type: 'anti-regression',
              confidence: 'high'
            });
          }
        });
      });
    } catch (error) {
      console.warn(`Warning: Could not read anti-regression file ${filePath}:`, error);
    }

    return this.deduplicateVersions(versions);
  }

  /**
   * Classifies the type of documentation file
   */
  private classifyDocumentationType(filePath: string): DocumentationVersionInfo['type'] {
    const fileName = path.basename(filePath).toLowerCase();
    
    if (fileName.includes('readme')) return 'readme';
    if (fileName.includes('changelog') || fileName.includes('change-log')) return 'changelog';
    if (fileName.includes('roadmap')) return 'roadmap';
    if (fileName.includes('anti-regressione') || fileName.includes('anti-regression')) return 'anti-regression';
    
    return 'other';
  }

  /**
   * Validates if a version string is valid
   */
  private isValidVersion(version: string): boolean {
    // Check if it's a valid semantic version
    const semverPattern = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/;
    if (!semverPattern.test(version)) return false;
    
    // Check for reasonable version numbers (not dates or other numbers)
    const parts = version.split('.');
    const major = parseInt(parts[0]);
    const minor = parseInt(parts[1]);
    const patch = parseInt(parts[2].split('-')[0]);
    
    // Reasonable bounds for version numbers
    return major >= 0 && major < 100 && 
           minor >= 0 && minor < 100 && 
           patch >= 0 && patch < 1000;
  }

  /**
   * Removes duplicate versions from the list
   */
  private deduplicateVersions(versions: DocumentationVersionInfo[]): DocumentationVersionInfo[] {
    const seen = new Set<string>();
    const unique: DocumentationVersionInfo[] = [];

    // Sort by confidence first (high confidence first)
    const sorted = versions.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });

    for (const version of sorted) {
      const key = `${version.version}-${version.line}-${version.source}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(version);
      }
    }

    return unique;
  }

  /**
   * Determines the primary version from all extracted versions
   */
  private determinePrimaryVersion(versions: DocumentationVersionInfo[]): string | undefined {
    if (versions.length === 0) return undefined;

    // Group versions by version string
    const versionCounts = new Map<string, { count: number; confidence: number }>();
    
    versions.forEach(v => {
      const current = versionCounts.get(v.version) || { count: 0, confidence: 0 };
      const confidenceScore = v.confidence === 'high' ? 3 : v.confidence === 'medium' ? 2 : 1;
      
      versionCounts.set(v.version, {
        count: current.count + 1,
        confidence: current.confidence + confidenceScore
      });
    });

    // Find version with highest combined score
    let bestVersion = '';
    let bestScore = 0;

    for (const [version, { count, confidence }] of versionCounts) {
      const score = count * confidence;
      if (score > bestScore) {
        bestScore = score;
        bestVersion = version;
      }
    }

    return bestVersion || undefined;
  }

  /**
   * Finds inconsistencies between versions
   */
  private findVersionInconsistencies(
    versions: DocumentationVersionInfo[], 
    primaryVersion?: string
  ): VersionInconsistency[] {
    if (!primaryVersion) return [];

    const inconsistencies: VersionInconsistency[] = [];
    
    versions.forEach(version => {
      if (version.version !== primaryVersion) {
        const severity = this.calculateInconsistencySeverity(version, primaryVersion);
        
        inconsistencies.push({
          expectedVersion: primaryVersion,
          actualVersion: version.version,
          source: `${version.source}:${version.line}`,
          severity,
          description: `Version mismatch in ${version.source} at line ${version.line}: found ${version.version}, expected ${primaryVersion}`
        });
      }
    });

    return inconsistencies;
  }

  /**
   * Calculates the severity of a version inconsistency
   */
  private calculateInconsistencySeverity(
    version: DocumentationVersionInfo, 
    primaryVersion: string
  ): VersionInconsistency['severity'] {
    // High confidence mismatches are more severe
    if (version.confidence === 'high') {
      return 'high';
    }

    // README and changelog mismatches are critical
    if (version.type === 'readme' || version.type === 'changelog') {
      return 'critical';
    }

    // Anti-regression mismatches are high severity
    if (version.type === 'anti-regression') {
      return 'high';
    }

    // Check semantic version difference
    const versionParts = version.version.split('.').map(Number);
    const primaryParts = primaryVersion.split('.').map(Number);
    
    // Major version difference is critical
    if (versionParts[0] !== primaryParts[0]) {
      return 'critical';
    }

    // Minor version difference is high
    if (versionParts[1] !== primaryParts[1]) {
      return 'high';
    }

    // Patch version difference is medium
    return 'medium';
  }
}