/**
 * Core interfaces for Documentation Sync Analysis System
 * The Safe Place - Documentation Refactoring v0.4.0
 */

export interface VersionInfo {
  source: string;
  version: string;
  location: string;
  lastUpdated?: Date;
}

export interface CodeScanResult {
  versions: {
    package: string;
    startScreen: string;
    readme: string;
  };
  features: {
    implemented: string[];
    configurations: Record<string, any>;
    dependencies: Record<string, string>;
  };
  structure: {
    components: string[];
    hooks: string[];
    contexts: string[];
    styles: string[];
  };
}

export interface DocScanResult {
  versions: {
    documented: string;
    changelog: string;
    antiRegression: string;
  };
  features: {
    documented: string[];
    roadmap: RoadmapItem[];
    bugFixes: BugFix[];
  };
  protections: {
    antiRegression: Protection[];
    dsar: DSARRequirement[];
  };
}

export interface RoadmapItem {
  version: string;
  name: string;
  status: 'completed' | 'in_progress' | 'planned';
  features: string[];
}

export interface BugFix {
  version: string;
  description: string;
  files: string[];
  implemented: boolean;
}

export interface Protection {
  type: 'anti-regression' | 'dsar' | 'immutable';
  target: string;
  rules: string[];
  isEnforced: boolean;
  location: string;
}

export interface DSARRequirement {
  id: string;
  description: string;
  status: 'active' | 'obsolete';
  enforcementLevel: 'critical' | 'high' | 'medium';
}

export interface Discrepancy {
  type: 'version' | 'feature' | 'configuration' | 'structure' | 'protection';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  codeValue: any;
  docValue: any;
  recommendation: string;
  files: string[];
}

export interface ComparisonResult {
  discrepancies: Discrepancy[];
  metrics: {
    syncPercentage: number;
    criticalIssues: number;
    totalIssues: number;
    categoryCounts: Record<string, number>;
  };
  recommendations: Recommendation[];
}

export interface Recommendation {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  action: string;
  description: string;
  files: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface AnalysisConfig {
  paths: {
    sourceCode: string;
    documentation: string;
    output: string;
  };
  analysis: {
    enableVersionCheck: boolean;
    enableFeatureCheck: boolean;
    enableProtectionCheck: boolean;
    severityThresholds: {
      critical: number;
      high: number;
      medium: number;
    };
  };
  output: {
    format: 'markdown' | 'json' | 'html';
    includeMetrics: boolean;
    includeRecommendations: boolean;
  };
}

export interface AnalysisError {
  category: 'file_access' | 'parsing' | 'analysis';
  severity: 'fatal' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  recoverable: boolean;
}