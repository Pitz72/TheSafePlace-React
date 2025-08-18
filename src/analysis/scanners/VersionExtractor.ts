/**
 * Version extraction utilities for Documentation Sync Analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import type { VersionInfo } from '../interfaces/AnalysisTypes';
import { ErrorHandler } from '../utils/ErrorHandler';

export class VersionExtractor {
  private errorHandler: ErrorHandler;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
  }

  /**
   * Extract version from package.json
   */
  async extractFromPackageJson(content: string, filePath: string): Promise<VersionInfo | null> {
    try {
      const packageData = JSON.parse(content);
      
      if (!packageData.version) {
        this.errorHandler.handleError(
          this.errorHandler.createError(
            'parsing',
            'warning',
            'No version field found in package.json',
            filePath
          )
        );
        return null;
      }

      return {
        source: 'package.json',
        version: packageData.version,
        location: filePath,
        lastUpdated: new Date()
      };
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'fatal',
          `Failed to parse package.json: ${error}`,
          filePath,
          undefined,
          false
        )
      );
      return null;
    }
  }

  /**
   * Extract version from StartScreen.tsx component
   */
  async extractFromStartScreen(content: string, filePath: string): Promise<VersionInfo | null> {
    try {
      // Look for version pattern in StartScreen component
      const versionRegex = /v(\d+\.\d+\.\d+)\s*-\s*([^"'<]+)/;
      const match = content.match(versionRegex);

      if (!match) {
        this.errorHandler.handleError(
          this.errorHandler.createError(
            'parsing',
            'warning',
            'No version pattern found in StartScreen component',
            filePath
          )
        );
        return null;
      }

      const fullVersion = `${match[1]} - ${match[2].trim()}`;

      return {
        source: 'StartScreen.tsx',
        version: fullVersion,
        location: filePath,
        lastUpdated: new Date()
      };
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract version from StartScreen: ${error}`,
          filePath
        )
      );
      return null;
    }
  }

  /**
   * Extract version from README.md
   */
  async extractFromReadme(content: string, filePath: string): Promise<VersionInfo | null> {
    try {
      // Look for version in title or header
      const titleRegex = /#\s*The Safe Place\s+v(\d+\.\d+\.\d+)\s*"([^"]+)"/;
      const match = content.match(titleRegex);

      if (!match) {
        this.errorHandler.handleError(
          this.errorHandler.createError(
            'parsing',
            'warning',
            'No version pattern found in README title',
            filePath
          )
        );
        return null;
      }

      const fullVersion = `${match[1]} "${match[2]}"`;

      return {
        source: 'README.md',
        version: fullVersion,
        location: filePath,
        lastUpdated: new Date()
      };
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract version from README: ${error}`,
          filePath
        )
      );
      return null;
    }
  }

  /**
   * Extract version from documentation files
   */
  async extractFromDocumentation(content: string, filePath: string): Promise<VersionInfo[]> {
    const versions: VersionInfo[] = [];

    try {
      // Look for various version patterns in documentation
      const patterns = [
        /v(\d+\.\d+\.\d+)\s*"([^"]+)"/g,  // v0.4.0 "Name"
        /versione[:\s]+(\d+\.\d+\.\d+)/gi, // Versione: 0.4.0
        /version[:\s]+(\d+\.\d+\.\d+)/gi,  // Version: 0.4.0
        /ANTI-REGRESSIONE-v(\d+\.\d+\.\d+)/g, // ANTI-REGRESSIONE-v0.4.0
        /CHANGELOG-v(\d+\.\d+\.\d+)/g     // CHANGELOG-v0.4.0
      ];

      patterns.forEach((pattern, index) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const version = match[1] + (match[2] ? ` "${match[2]}"` : '');
          versions.push({
            source: `documentation-pattern-${index}`,
            version,
            location: filePath,
            lastUpdated: new Date()
          });
        }
      });

      return versions;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract versions from documentation: ${error}`,
          filePath
        )
      );
      return [];
    }
  }

  /**
   * Compare versions and identify discrepancies
   */
  compareVersions(versions: VersionInfo[]): {
    canonical: string | null;
    discrepancies: Array<{
      source: string;
      expected: string;
      actual: string;
      location: string;
    }>;
  } {
    if (versions.length === 0) {
      return { canonical: null, discrepancies: [] };
    }

    // Use package.json as canonical source if available
    const packageVersion = versions.find(v => v.source === 'package.json');
    const canonical = packageVersion?.version || versions[0].version;

    const discrepancies = versions
      .filter(v => !this.versionsMatch(v.version, canonical))
      .map(v => ({
        source: v.source,
        expected: canonical,
        actual: v.version,
        location: v.location
      }));

    return { canonical, discrepancies };
  }

  /**
   * Check if two version strings match (allowing for format differences)
   */
  private versionsMatch(version1: string, version2: string): boolean {
    // Extract numeric version from both strings
    const extractNumeric = (v: string) => {
      const match = v.match(/(\d+\.\d+\.\d+)/);
      return match ? match[1] : v;
    };

    const v1Numeric = extractNumeric(version1);
    const v2Numeric = extractNumeric(version2);

    return v1Numeric === v2Numeric;
  }

  /**
   * Normalize version string to standard format
   */
  normalizeVersion(version: string): string {
    const match = version.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : version;
  }
}