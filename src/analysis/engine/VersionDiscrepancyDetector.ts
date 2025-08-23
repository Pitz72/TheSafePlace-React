import { DocumentationVersionInfo, DocumentationVersionSummary } from '../scanners/DocumentationVersionExtractor';

/**
 * Represents a version discrepancy between different sources
 */
export interface VersionDiscrepancy {
  type: 'version-mismatch' | 'missing-version' | 'outdated-version' | 'inconsistent-format';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  sources: VersionSource[];
  expectedVersion?: string;
  actualVersions: string[];
  recommendation: string;
  impact: string;
}

/**
 * Represents a version source (code or documentation)
 */
export interface VersionSource {
  type: 'code' | 'documentation';
  source: string;
  version: string;
  location: string;
  confidence: 'high' | 'medium' | 'low';
  lastModified?: Date;
}

/**
 * Configuration for version discrepancy detection
 */
export interface VersionDiscrepancyConfig {
  primarySource: 'package.json' | 'documentation' | 'auto';
  toleratePrerelease: boolean;
  ignorePatchDifferences: boolean;
  customSeverityRules: SeverityRule[];
}

/**
 * Custom severity rule for specific version discrepancies
 */
export interface SeverityRule {
  condition: (discrepancy: VersionDiscrepancy) => boolean;
  severity: VersionDiscrepancy['severity'];
  reason: string;
}

/**
 * Result of version discrepancy analysis
 */
export interface VersionDiscrepancyAnalysis {
  primaryVersion: string;
  totalSources: number;
  consistentSources: number;
  discrepancies: VersionDiscrepancy[];
  recommendations: VersionRecommendation[];
  syncPercentage: number;
  lastAnalyzed: Date;
}

/**
 * Recommendation for fixing version discrepancies
 */
export interface VersionRecommendation {
  type: 'update-version' | 'standardize-format' | 'add-version' | 'remove-version';
  priority: 'high' | 'medium' | 'low';
  description: string;
  sources: string[];
  suggestedAction: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

/**
 * Detects and analyzes version discrepancies between code and documentation
 */
export class VersionDiscrepancyDetector {
  private readonly defaultConfig: VersionDiscrepancyConfig = {
    primarySource: 'auto',
    toleratePrerelease: false,
    ignorePatchDifferences: false,
    customSeverityRules: []
  };

  /**
   * Analyzes version discrepancies between code and documentation sources
   */
  analyzeVersionDiscrepancies(
    codeSources: VersionSource[],
    documentationSummary: DocumentationVersionSummary,
    config: Partial<VersionDiscrepancyConfig> = {}
  ): VersionDiscrepancyAnalysis {
    const analysisConfig = { ...this.defaultConfig, ...config };
    
    // Convert documentation sources to VersionSource format
    const docSources = this.convertDocumentationSources(documentationSummary);
    
    // Combine all sources
    const allSources = [...codeSources, ...docSources];
    
    // Determine primary version
    const primaryVersion = this.determinePrimaryVersion(allSources, analysisConfig);
    
    // Detect discrepancies
    const discrepancies = this.detectDiscrepancies(allSources, primaryVersion, analysisConfig);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(discrepancies, allSources);
    
    // Calculate metrics
    const consistentSources = allSources.filter(s => 
      this.normalizeVersion(s.version) === this.normalizeVersion(primaryVersion)
    ).length;
    
    const syncPercentage = allSources.length > 0 
      ? (consistentSources / allSources.length) * 100 
      : 100;

    return {
      primaryVersion,
      totalSources: allSources.length,
      consistentSources,
      discrepancies,
      recommendations,
      syncPercentage,
      lastAnalyzed: new Date()
    };
  }

  /**
   * Converts documentation version info to VersionSource format
   */
  private convertDocumentationSources(summary: DocumentationVersionSummary): VersionSource[] {
    return summary.allVersions.map(docVersion => ({
      type: 'documentation' as const,
      source: docVersion.source,
      version: docVersion.version,
      location: `${docVersion.source}:${docVersion.line}`,
      confidence: docVersion.confidence,
      lastModified: undefined
    }));
  }

  /**
   * Determines the primary version from all sources
   */
  private determinePrimaryVersion(
    sources: VersionSource[], 
    config: VersionDiscrepancyConfig
  ): string {
    if (sources.length === 0) {
      return '0.0.0';
    }

    switch (config.primarySource) {
      case 'package.json':
        const packageSource = sources.find(s => s.source === 'package.json');
        return packageSource?.version || sources[0].version;
        
      case 'documentation':
        const docSources = sources.filter(s => s.type === 'documentation');
        if (docSources.length > 0) {
          return this.getMostCommonVersion(docSources);
        }
        return sources[0].version;
        
      case 'auto':
      default:
        return this.autoDetectPrimaryVersion(sources);
    }
  }

  /**
   * Auto-detects the most likely primary version
   */
  private autoDetectPrimaryVersion(sources: VersionSource[]): string {
    // Prioritize high-confidence sources
    const highConfidenceSources = sources.filter(s => s.confidence === 'high');
    if (highConfidenceSources.length > 0) {
      return this.getMostCommonVersion(highConfidenceSources);
    }

    // Prioritize package.json if available
    const packageSource = sources.find(s => s.source === 'package.json');
    if (packageSource) {
      return packageSource.version;
    }

    // Fall back to most common version
    return this.getMostCommonVersion(sources);
  }

  /**
   * Gets the most common version from a list of sources
   */
  private getMostCommonVersion(sources: VersionSource[]): string {
    const versionCounts = new Map<string, number>();
    
    sources.forEach(source => {
      const normalizedVersion = this.normalizeVersion(source.version);
      versionCounts.set(normalizedVersion, (versionCounts.get(normalizedVersion) || 0) + 1);
    });

    let mostCommonVersion = sources[0].version;
    let maxCount = 0;

    for (const [version, count] of versionCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonVersion = version;
      }
    }

    return mostCommonVersion;
  }

  /**
   * Detects version discrepancies
   */
  private detectDiscrepancies(
    sources: VersionSource[], 
    primaryVersion: string, 
    config: VersionDiscrepancyConfig
  ): VersionDiscrepancy[] {
    const discrepancies: VersionDiscrepancy[] = [];
    const normalizedPrimary = this.normalizeVersion(primaryVersion);

    // Group sources by version
    const versionGroups = new Map<string, VersionSource[]>();
    sources.forEach(source => {
      const normalizedVersion = this.normalizeVersion(source.version);
      if (!versionGroups.has(normalizedVersion)) {
        versionGroups.set(normalizedVersion, []);
      }
      versionGroups.get(normalizedVersion)!.push(source);
    });

    // Check each version group against primary
    for (const [version, groupSources] of versionGroups) {
      if (version !== normalizedPrimary) {
        const discrepancy = this.createVersionDiscrepancy(
          groupSources, 
          primaryVersion, 
          version, 
          config
        );
        discrepancies.push(discrepancy);
      }
    }

    // Check for missing versions in critical sources
    const criticalSources = ['package.json', 'README.md'];
    const presentSources = new Set(sources.map(s => s.source));
    
    for (const criticalSource of criticalSources) {
      if (!presentSources.has(criticalSource)) {
        discrepancies.push({
          type: 'missing-version',
          severity: 'high',
          description: `Missing version information in ${criticalSource}`,
          sources: [],
          expectedVersion: primaryVersion,
          actualVersions: [],
          recommendation: `Add version ${primaryVersion} to ${criticalSource}`,
          impact: `${criticalSource} lacks version information, making it difficult to track releases`
        });
      }
    }

    // Apply custom severity rules
    discrepancies.forEach(discrepancy => {
      for (const rule of config.customSeverityRules) {
        if (rule.condition(discrepancy)) {
          discrepancy.severity = rule.severity;
          discrepancy.description += ` (${rule.reason})`;
          break;
        }
      }
    });

    return discrepancies;
  }

  /**
   * Creates a version discrepancy object
   */
  private createVersionDiscrepancy(
    sources: VersionSource[], 
    expectedVersion: string, 
    actualVersion: string, 
    config: VersionDiscrepancyConfig
  ): VersionDiscrepancy {
    const severity = this.calculateDiscrepancySeverity(
      expectedVersion, 
      actualVersion, 
      sources, 
      config
    );

    const type = this.determineDiscrepancyType(expectedVersion, actualVersion);
    
    const sourceNames = sources.map(s => s.source).join(', ');
    const description = `Version mismatch in ${sourceNames}: expected ${expectedVersion}, found ${actualVersion}`;
    
    const recommendation = this.generateDiscrepancyRecommendation(
      sources, 
      expectedVersion, 
      actualVersion
    );

    const impact = this.calculateDiscrepancyImpact(sources, severity);

    return {
      type,
      severity,
      description,
      sources,
      expectedVersion,
      actualVersions: [actualVersion],
      recommendation,
      impact
    };
  }

  /**
   * Calculates the severity of a version discrepancy
   */
  private calculateDiscrepancySeverity(
    expectedVersion: string, 
    actualVersion: string, 
    sources: VersionSource[], 
    config: VersionDiscrepancyConfig
  ): VersionDiscrepancy['severity'] {
    const expectedParts = this.parseVersion(expectedVersion);
    const actualParts = this.parseVersion(actualVersion);

    // Critical sources get higher severity
    const hasCriticalSource = sources.some(s => 
      ['package.json', 'README.md'].includes(s.source)
    );

    // Major version differences are critical
    if (expectedParts.major !== actualParts.major) {
      return hasCriticalSource ? 'critical' : 'high';
    }

    // Minor version differences are high severity
    if (expectedParts.minor !== actualParts.minor) {
      return hasCriticalSource ? 'high' : 'medium';
    }

    // Patch differences can be ignored if configured
    if (config.ignorePatchDifferences && expectedParts.patch !== actualParts.patch) {
      return 'low';
    }

    // Prerelease differences
    if (expectedParts.prerelease !== actualParts.prerelease) {
      if (config.toleratePrerelease) {
        return 'low';
      }
      return 'medium';
    }

    return 'medium';
  }

  /**
   * Determines the type of version discrepancy
   */
  private determineDiscrepancyType(
    expectedVersion: string, 
    actualVersion: string
  ): VersionDiscrepancy['type'] {
    const expectedParts = this.parseVersion(expectedVersion);
    const actualParts = this.parseVersion(actualVersion);

    // Check if it's just a format issue
    if (this.normalizeVersion(expectedVersion) === this.normalizeVersion(actualVersion)) {
      return 'inconsistent-format';
    }

    // Check if actual version is older
    if (this.compareVersions(actualVersion, expectedVersion) < 0) {
      return 'outdated-version';
    }

    return 'version-mismatch';
  }

  /**
   * Generates a recommendation for fixing a discrepancy
   */
  private generateDiscrepancyRecommendation(
    sources: VersionSource[], 
    expectedVersion: string, 
    actualVersion: string
  ): string {
    const sourceNames = sources.map(s => s.source).join(', ');
    
    if (sources.length === 1) {
      return `Update ${sourceNames} from ${actualVersion} to ${expectedVersion}`;
    }

    return `Update version in ${sourceNames} to ${expectedVersion} for consistency`;
  }

  /**
   * Calculates the impact of a version discrepancy
   */
  private calculateDiscrepancyImpact(
    sources: VersionSource[], 
    severity: VersionDiscrepancy['severity']
  ): string {
    const sourceTypes = [...new Set(sources.map(s => s.type))];
    const sourceNames = sources.map(s => s.source);

    if (severity === 'critical') {
      return `Critical inconsistency affecting ${sourceNames.join(', ')} may confuse users and break automated tools`;
    }

    if (severity === 'high') {
      return `High impact on ${sourceTypes.join(' and ')} synchronization, may cause deployment issues`;
    }

    if (severity === 'medium') {
      return `Medium impact on documentation accuracy and version tracking`;
    }

    return `Low impact, primarily affects documentation consistency`;
  }

  /**
   * Generates recommendations for fixing discrepancies
   */
  private generateRecommendations(
    discrepancies: VersionDiscrepancy[], 
    allSources: VersionSource[]
  ): VersionRecommendation[] {
    const recommendations: VersionRecommendation[] = [];

    // Group discrepancies by type
    const discrepancyGroups = new Map<string, VersionDiscrepancy[]>();
    discrepancies.forEach(d => {
      const key = d.type;
      if (!discrepancyGroups.has(key)) {
        discrepancyGroups.set(key, []);
      }
      discrepancyGroups.get(key)!.push(d);
    });

    // Generate recommendations for each group
    for (const [type, groupDiscrepancies] of discrepancyGroups) {
      const recommendation = this.createRecommendationForGroup(type, groupDiscrepancies);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Add general recommendations
    if (discrepancies.length > 0) {
      recommendations.push({
        type: 'standardize-format',
        priority: 'medium',
        description: 'Standardize version format across all sources',
        sources: allSources.map(s => s.source),
        suggestedAction: 'Use semantic versioning (x.y.z) consistently in all files',
        estimatedEffort: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Creates a recommendation for a group of similar discrepancies
   */
  private createRecommendationForGroup(
    type: string, 
    discrepancies: VersionDiscrepancy[]
  ): VersionRecommendation | null {
    const allSources = discrepancies.flatMap(d => d.sources.map(s => s.source));
    const uniqueSources = [...new Set(allSources)];
    
    const highSeverityCount = discrepancies.filter(d => 
      d.severity === 'critical' || d.severity === 'high'
    ).length;

    const priority = highSeverityCount > 0 ? 'high' : 'medium';

    switch (type) {
      case 'version-mismatch':
        return {
          type: 'update-version',
          priority,
          description: `Update mismatched versions in ${uniqueSources.length} sources`,
          sources: uniqueSources,
          suggestedAction: 'Update all sources to use the same version number',
          estimatedEffort: uniqueSources.length > 3 ? 'medium' : 'low'
        };

      case 'missing-version':
        return {
          type: 'add-version',
          priority: 'high',
          description: 'Add missing version information to critical files',
          sources: uniqueSources,
          suggestedAction: 'Add version information to all identified sources',
          estimatedEffort: 'low'
        };

      case 'outdated-version':
        return {
          type: 'update-version',
          priority: 'high',
          description: 'Update outdated version references',
          sources: uniqueSources,
          suggestedAction: 'Update all outdated version references to current version',
          estimatedEffort: 'low'
        };

      case 'inconsistent-format':
        return {
          type: 'standardize-format',
          priority: 'low',
          description: 'Standardize version format inconsistencies',
          sources: uniqueSources,
          suggestedAction: 'Use consistent version format (e.g., always include or exclude "v" prefix)',
          estimatedEffort: 'low'
        };

      default:
        return null;
    }
  }

  /**
   * Normalizes a version string for comparison
   */
  private normalizeVersion(version: string): string {
    // Remove 'v' prefix and normalize
    return version.replace(/^v/, '').trim();
  }

  /**
   * Parses a version string into components
   */
  private parseVersion(version: string): {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
  } {
    const normalized = this.normalizeVersion(version);
    const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    
    if (!match) {
      return { major: 0, minor: 0, patch: 0 };
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4]
    };
  }

  /**
   * Compares two version strings
   * Returns: -1 if a < b, 0 if a === b, 1 if a > b
   */
  private compareVersions(a: string, b: string): number {
    const aParts = this.parseVersion(a);
    const bParts = this.parseVersion(b);

    if (aParts.major !== bParts.major) {
      return aParts.major - bParts.major;
    }

    if (aParts.minor !== bParts.minor) {
      return aParts.minor - bParts.minor;
    }

    if (aParts.patch !== bParts.patch) {
      return aParts.patch - bParts.patch;
    }

    // Handle prerelease versions
    if (aParts.prerelease && !bParts.prerelease) return -1;
    if (!aParts.prerelease && bParts.prerelease) return 1;
    if (aParts.prerelease && bParts.prerelease) {
      return aParts.prerelease.localeCompare(bParts.prerelease);
    }

    return 0;
  }
}