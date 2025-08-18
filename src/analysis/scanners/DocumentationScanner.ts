/**
 * Documentation Scanner for Documentation Sync Analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import type { DocScanResult, RoadmapItem, BugFix, Protection, DSARRequirement } from '../interfaces/AnalysisTypes';
import { VersionExtractor } from './VersionExtractor';
import { ErrorHandler } from '../utils/ErrorHandler';

export class DocumentationScanner {
  private versionExtractor: VersionExtractor;
  private errorHandler: ErrorHandler;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
    this.versionExtractor = new VersionExtractor(errorHandler);
  }

  /**
   * Perform complete documentation analysis
   */
  async scanDocumentation(files: Map<string, string>): Promise<DocScanResult> {
    try {
      console.log('📚 Starting documentation analysis...');

      // Extract versions from documentation
      const versions = await this.extractDocumentationVersions(files);
      
      // Analyze documented features
      const features = await this.analyzeDocumentedFeatures(files);
      
      // Analyze protection systems
      const protections = await this.analyzeProtections(files);

      const result: DocScanResult = {
        versions,
        features,
        protections
      };

      console.log('✅ Documentation analysis completed');
      return result;

    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'fatal',
          `Failed to scan documentation: ${error}`,
          undefined,
          undefined,
          false
        )
      );
      throw error;
    }
  }

  /**
   * Extract versions from documentation files
   */
  private async extractDocumentationVersions(files: Map<string, string>): Promise<DocScanResult['versions']> {
    const versions = {
      documented: 'unknown',
      changelog: 'unknown',
      antiRegression: 'unknown'
    };

    try {
      // Extract from main README
      const readmeContent = files.get('README.md');
      if (readmeContent) {
        const readmeVersion = await this.versionExtractor.extractFromReadme(
          readmeContent,
          'README.md'
        );
        if (readmeVersion) {
          versions.documented = readmeVersion.version;
        }
      }

      // Find latest changelog
      const changelogFiles = Array.from(files.keys())
        .filter(path => path.includes('changelog') && path.includes('CHANGELOG-v'));
      
      if (changelogFiles.length > 0) {
        const latestChangelog = this.findLatestVersionFile(changelogFiles);
        const changelogContent = files.get(latestChangelog);
        if (changelogContent) {
          const changelogVersion = this.extractVersionFromFilename(latestChangelog);
          versions.changelog = changelogVersion || 'unknown';
        }
      }

      // Find latest anti-regression document
      const antiRegressionFiles = Array.from(files.keys())
        .filter(path => path.includes('anti-regressione') && path.includes('ANTI-REGRESSIONE-v'));
      
      if (antiRegressionFiles.length > 0) {
        const latestAntiRegression = this.findLatestVersionFile(antiRegressionFiles);
        const antiRegressionVersion = this.extractVersionFromFilename(latestAntiRegression);
        versions.antiRegression = antiRegressionVersion || 'unknown';
      }

      return versions;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to extract documentation versions: ${error}`
        )
      );
      return versions;
    }
  }

  /**
   * Analyze documented features, roadmap, and bug fixes
   */
  private async analyzeDocumentedFeatures(files: Map<string, string>): Promise<DocScanResult['features']> {
    try {
      const documented = await this.extractDocumentedFeatures(files);
      const roadmap = await this.extractRoadmapItems(files);
      const bugFixes = await this.extractBugFixes(files);

      return {
        documented,
        roadmap,
        bugFixes
      };
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to analyze documented features: ${error}`
        )
      );
      return {
        documented: [],
        roadmap: [],
        bugFixes: []
      };
    }
  }

  /**
   * Extract documented features from various documentation files
   */
  private async extractDocumentedFeatures(files: Map<string, string>): Promise<string[]> {
    const features: Set<string> = new Set();

    try {
      for (const [filePath, content] of files.entries()) {
        if (filePath.endsWith('.md')) {
          // Look for feature mentions in documentation
          const featurePatterns = [
            /(?:✅|🎮|🌟|📋)\s*\*?\*?([^*\n]+)\*?\*?/g,
            /(?:Feature|Caratteristica|Funzionalità):\s*([^\n]+)/gi,
            /(?:Implementato|Implemented):\s*([^\n]+)/gi
          ];

          featurePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
              const feature = match[1].trim();
              if (feature && feature.length > 3) {
                features.add(feature);
              }
            }
          });
        }
      }

      return Array.from(features);
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract documented features: ${error}`
        )
      );
      return [];
    }
  }

  /**
   * Extract roadmap items from documentation
   */
  private async extractRoadmapItems(files: Map<string, string>): Promise<RoadmapItem[]> {
    const roadmapItems: RoadmapItem[] = [];

    try {
      // Look for roadmap in README and roadmap files
      const roadmapSources = Array.from(files.entries())
        .filter(([path]) => 
          path.includes('README') || 
          path.includes('roadmap') || 
          path.includes('ROADMAP')
        );

      for (const [filePath, content] of roadmapSources) {
        // Extract version-based roadmap items
        const versionPattern = /(?:\[x\]|\[ \])\s*\*?\*?v?(\d+\.\d+\.\d+)[:\s]*([^:\n]+)(?::\s*([^\n]+))?/gi;
        let match;

        while ((match = versionPattern.exec(content)) !== null) {
          const version = match[1];
          const name = match[2].trim();
          const description = match[3]?.trim() || '';
          
          // Determine status based on checkbox
          const fullMatch = match[0];
          const status = fullMatch.includes('[x]') ? 'completed' : 
                        fullMatch.includes('IN CORSO') ? 'in_progress' : 'planned';

          roadmapItems.push({
            version,
            name,
            status,
            features: description ? [description] : []
          });
        }
      }

      return roadmapItems;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract roadmap items: ${error}`
        )
      );
      return [];
    }
  }

  /**
   * Extract bug fixes from changelog and anti-regression documents
   */
  private async extractBugFixes(files: Map<string, string>): Promise<BugFix[]> {
    const bugFixes: BugFix[] = [];

    try {
      // Look for bug fixes in changelog files
      const changelogFiles = Array.from(files.entries())
        .filter(([path]) => path.includes('changelog') || path.includes('CHANGELOG'));

      for (const [filePath, content] of changelogFiles) {
        const version = this.extractVersionFromFilename(filePath) || 'unknown';
        
        // Extract bug fix sections
        const bugFixPattern = /(?:🐛|BUG FIX|Bug Fix|Risolto)[:\s]*([^\n]+)/gi;
        let match;

        while ((match = bugFixPattern.exec(content)) !== null) {
          const description = match[1].trim();
          
          bugFixes.push({
            version,
            description,
            files: [], // Would need more sophisticated parsing to extract files
            implemented: false // Will be determined by comparison with code
          });
        }
      }

      return bugFixes;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract bug fixes: ${error}`
        )
      );
      return [];
    }
  }

  /**
   * Analyze protection systems (anti-regression, DSAR)
   */
  private async analyzeProtections(files: Map<string, string>): Promise<DocScanResult['protections']> {
    try {
      const antiRegression = await this.extractAntiRegressionProtections(files);
      const dsar = await this.extractDSARRequirements(files);

      return {
        antiRegression,
        dsar
      };
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to analyze protections: ${error}`
        )
      );
      return {
        antiRegression: [],
        dsar: []
      };
    }
  }

  /**
   * Extract anti-regression protections
   */
  private async extractAntiRegressionProtections(files: Map<string, string>): Promise<Protection[]> {
    const protections: Protection[] = [];

    try {
      const antiRegressionFiles = Array.from(files.entries())
        .filter(([path]) => path.includes('anti-regressione') || path.includes('ANTI-REGRESSIONE'));

      for (const [filePath, content] of antiRegressionFiles) {
        // Extract protection rules
        const protectionPattern = /(?:❌|✅|VIETATO|OBBLIGATORIO)[:\s]*([^\n]+)/gi;
        const rules: string[] = [];
        let match;

        while ((match = protectionPattern.exec(content)) !== null) {
          rules.push(match[1].trim());
        }

        if (rules.length > 0) {
          protections.push({
            type: 'anti-regression',
            target: this.extractVersionFromFilename(filePath) || 'unknown',
            rules,
            isEnforced: content.includes('IMMUTABILE') || content.includes('CONSOLIDATO'),
            location: filePath
          });
        }
      }

      return protections;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract anti-regression protections: ${error}`
        )
      );
      return [];
    }
  }

  /**
   * Extract DSAR requirements
   */
  private async extractDSARRequirements(files: Map<string, string>): Promise<DSARRequirement[]> {
    const requirements: DSARRequirement[] = [];

    try {
      const dsarFiles = Array.from(files.entries())
        .filter(([path]) => path.includes('dsar') || path.includes('DSAR'));

      for (const [filePath, content] of dsarFiles) {
        // Extract requirements from DSAR documents
        const reqPattern = /(?:RF-|RNF-)(\d+)[:\s]*([^\n]+)/gi;
        let match;

        while ((match = reqPattern.exec(content)) !== null) {
          const id = match[1];
          const description = match[2].trim();
          
          requirements.push({
            id: `REQ-${id}`,
            description,
            status: content.includes('IMMUTABILE') ? 'active' : 'active',
            enforcementLevel: content.includes('CRITICO') ? 'critical' : 'high'
          });
        }
      }

      return requirements;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract DSAR requirements: ${error}`
        )
      );
      return [];
    }
  }

  /**
   * Find the latest version file from a list of versioned files
   */
  private findLatestVersionFile(files: string[]): string {
    return files.sort((a, b) => {
      const versionA = this.extractVersionFromFilename(a);
      const versionB = this.extractVersionFromFilename(b);
      
      if (!versionA || !versionB) return 0;
      
      return this.compareVersions(versionB, versionA); // Descending order
    })[0];
  }

  /**
   * Extract version from filename
   */
  private extractVersionFromFilename(filename: string): string | null {
    const match = filename.match(/v?(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Compare two version strings
   */
  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;
      
      if (partA > partB) return 1;
      if (partA < partB) return -1;
    }
    
    return 0;
  }

  /**
   * Get analysis summary
   */
  getSummary(result: DocScanResult): string {
    const { versions, features, protections } = result;
    
    return `
Documentation Analysis Summary:
- Documented Version: ${versions.documented}
- Latest Changelog: ${versions.changelog}
- Latest Anti-Regression: ${versions.antiRegression}
- Documented Features: ${features.documented.length}
- Roadmap Items: ${features.roadmap.length}
- Bug Fixes: ${features.bugFixes.length}
- Anti-Regression Protections: ${protections.antiRegression.length}
- DSAR Requirements: ${protections.dsar.length}
    `.trim();
  }
}