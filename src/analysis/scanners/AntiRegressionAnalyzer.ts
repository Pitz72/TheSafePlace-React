import * as fs from 'fs';
import * as path from 'path';
import { MarkdownParser, MarkdownDocument } from './MarkdownParser';

/**
 * Represents an anti-regression protection rule
 */
export interface AntiRegressionRule {
  id: string;
  type: 'immutable' | 'dsar' | 'version-lock' | 'file-protection' | 'config-protection' | 'other';
  target: string;
  description: string;
  rules: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  version?: string;
  isActive: boolean;
  lastVerified?: Date;
  line: number;
  section: string;
}

/**
 * Represents a DSAR (Data Subject Access Request) requirement
 */
export interface DSARRequirement {
  id: string;
  description: string;
  dataType: string;
  retention: string;
  access: string;
  deletion: string;
  isImplemented: boolean;
  implementationNotes?: string;
  line: number;
  section: string;
}

/**
 * Represents an analyzed anti-regression document
 */
export interface AntiRegressionDocument {
  filePath: string;
  title: string;
  version?: string;
  protectionRules: AntiRegressionRule[];
  dsarRequirements: DSARRequirement[];
  metadata: AntiRegressionMetadata;
  lastModified: Date;
}

/**
 * Metadata about anti-regression protections
 */
export interface AntiRegressionMetadata {
  totalRules: number;
  activeRules: number;
  rulesByType: Record<string, number>;
  rulesBySeverity: Record<string, number>;
  totalDSARRequirements: number;
  implementedDSARRequirements: number;
  lastUpdated: Date;
}

/**
 * Analyzes anti-regression and DSAR documents
 */
export class AntiRegressionAnalyzer {
  private readonly markdownParser: MarkdownParser;

  private readonly ruleTypePatterns: Array<{
    pattern: RegExp;
    type: AntiRegressionRule['type'];
  }> = [
    { pattern: /immutable|immutabile|non\s*modificabile/i, type: 'immutable' },
    { pattern: /dsar|gdpr|privacy|data\s*subject/i, type: 'dsar' },
    { pattern: /version\s*lock|versione\s*bloccata|freeze/i, type: 'version-lock' },
    { pattern: /file\s*protection|protezione\s*file/i, type: 'file-protection' },
    { pattern: /config\s*protection|protezione\s*config/i, type: 'config-protection' }
  ];

  private readonly severityPatterns: Array<{
    pattern: RegExp;
    severity: AntiRegressionRule['severity'];
  }> = [
    { pattern: /critical|critico|urgente/i, severity: 'critical' },
    { pattern: /high|alto|importante/i, severity: 'high' },
    { pattern: /medium|medio|normale/i, severity: 'medium' },
    { pattern: /low|basso|opzionale/i, severity: 'low' }
  ];

  private readonly dsarPatterns = {
    dataType: /data\s*type\s*:?\s*([^\n]+)/gi,
    retention: /retention\s*:?\s*([^\n]+)/gi,
    access: /access\s*:?\s*([^\n]+)/gi,
    deletion: /deletion\s*:?\s*([^\n]+)/gi,
    implemented: /implemented\s*:?\s*(yes|no|true|false|sì|no)/gi
  };

  constructor() {
    this.markdownParser = new MarkdownParser();
  }

  /**
   * Analyzes an anti-regression document
   */
  async analyzeAntiRegressionFile(filePath: string): Promise<AntiRegressionDocument> {
    try {
      const document = await this.markdownParser.parseMarkdownFile(filePath);
      const stats = await fs.promises.stat(filePath);
      
      const protectionRules = this.extractProtectionRules(document);
      const dsarRequirements = this.extractDSARRequirements(document);
      const metadata = this.calculateMetadata(protectionRules, dsarRequirements, stats.mtime);
      const version = this.extractVersion(document);

      return {
        filePath,
        title: document.title || path.basename(filePath),
        version,
        protectionRules,
        dsarRequirements,
        metadata,
        lastModified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to analyze anti-regression file ${filePath}: ${error}`);
    }
  }

  /**
   * Analyzes multiple anti-regression documents
   */
  async analyzeAntiRegressionFiles(filePaths: string[]): Promise<AntiRegressionDocument[]> {
    const analyzePromises = filePaths.map(filePath => 
      this.analyzeAntiRegressionFile(filePath).catch(error => {
        console.warn(`Warning: Could not analyze anti-regression file ${filePath}:`, error);
        return null;
      })
    );

    const results = await Promise.all(analyzePromises);
    return results.filter((doc): doc is AntiRegressionDocument => doc !== null);
  }

  /**
   * Extracts protection rules from the document
   */
  private extractProtectionRules(document: MarkdownDocument): AntiRegressionRule[] {
    const rules: AntiRegressionRule[] = [];
    const lines = document.content.split('\n');
    let currentSection = 'General';
    let ruleCounter = 1;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Update current section
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        currentSection = headerMatch[2].trim();
        return;
      }

      // Look for protection rules
      const ruleMatch = this.matchProtectionRule(line);
      if (ruleMatch) {
        const rule: AntiRegressionRule = {
          id: `rule-${ruleCounter++}`,
          type: ruleMatch.type,
          target: ruleMatch.target,
          description: ruleMatch.description,
          rules: ruleMatch.rules,
          severity: ruleMatch.severity,
          version: ruleMatch.version,
          isActive: ruleMatch.isActive,
          line: lineNumber,
          section: currentSection
        };

        rules.push(rule);
      }
    });

    return rules;
  }

  /**
   * Matches protection rules in a line
   */
  private matchProtectionRule(line: string): {
    type: AntiRegressionRule['type'];
    target: string;
    description: string;
    rules: string[];
    severity: AntiRegressionRule['severity'];
    version?: string;
    isActive: boolean;
  } | null {
    // Look for rule patterns
    const rulePatterns = [
      /^[-*+]\s*\[([x\s])\]\s*(.+)$/i, // Checkbox format
      /^[-*+]\s*(?:RULE|REGOLA)\s*:?\s*(.+)$/i, // Rule prefix
      /^[-*+]\s*(?:PROTECTION|PROTEZIONE)\s*:?\s*(.+)$/i, // Protection prefix
      /^[-*+]\s*(?:IMMUTABLE|IMMUTABILE)\s*:?\s*(.+)$/i // Immutable prefix
    ];

    for (const pattern of rulePatterns) {
      const match = pattern.exec(line);
      if (match) {
        const isCheckbox = pattern.source.includes('[');
        const isActive = isCheckbox ? match[1].toLowerCase() === 'x' : true;
        const ruleText = isCheckbox ? match[2] : match[1];

        // Determine rule type
        let type: AntiRegressionRule['type'] = 'other';
        for (const { pattern: typePattern, type: ruleType } of this.ruleTypePatterns) {
          if (typePattern.test(ruleText)) {
            type = ruleType;
            break;
          }
        }

        // Determine severity
        let severity: AntiRegressionRule['severity'] = 'medium';
        for (const { pattern: sevPattern, severity: ruleSeverity } of this.severityPatterns) {
          if (sevPattern.test(ruleText)) {
            severity = ruleSeverity;
            break;
          }
        }

        // Extract target and description
        const targetMatch = ruleText.match(/^([^:]+):\s*(.+)$/);
        const target = targetMatch ? targetMatch[1].trim() : 'General';
        const description = targetMatch ? targetMatch[2].trim() : ruleText.trim();

        // Extract version if present
        const versionMatch = ruleText.match(/v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/);
        const version = versionMatch ? versionMatch[1] : undefined;

        // Extract individual rules (semicolon or comma separated)
        const rules = description.split(/[;,]/).map(r => r.trim()).filter(r => r.length > 0);

        return {
          type,
          target,
          description,
          rules,
          severity,
          version,
          isActive
        };
      }
    }

    return null;
  }

  /**
   * Extracts DSAR requirements from the document
   */
  private extractDSARRequirements(document: MarkdownDocument): DSARRequirement[] {
    const requirements: DSARRequirement[] = [];
    const lines = document.content.split('\n');
    let currentSection = 'General';
    let requirementCounter = 1;
    let currentRequirement: Partial<DSARRequirement> | null = null;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Update current section
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        currentSection = headerMatch[2].trim();
        
        // Save previous requirement if exists
        if (currentRequirement && currentRequirement.description) {
          requirements.push(currentRequirement as DSARRequirement);
          currentRequirement = null;
        }
        return;
      }

      // Look for DSAR requirement start
      const dsarMatch = line.match(/^[-*+]\s*(?:DSAR|GDPR|Privacy)\s*:?\s*(.+)$/i);
      if (dsarMatch) {
        // Save previous requirement if exists
        if (currentRequirement && currentRequirement.description) {
          requirements.push(currentRequirement as DSARRequirement);
        }

        currentRequirement = {
          id: `dsar-${requirementCounter++}`,
          description: dsarMatch[1].trim(),
          dataType: 'Unknown',
          retention: 'Unknown',
          access: 'Unknown',
          deletion: 'Unknown',
          isImplemented: false,
          line: lineNumber,
          section: currentSection
        };
        return;
      }

      // Extract DSAR properties if we're in a requirement
      if (currentRequirement) {
        for (const [property, pattern] of Object.entries(this.dsarPatterns)) {
          pattern.lastIndex = 0;
          const match = pattern.exec(line);
          if (match) {
            const value = match[1].trim();
            
            if (property === 'implemented') {
              currentRequirement.isImplemented = /yes|true|sì/i.test(value);
            } else {
              (currentRequirement as any)[property] = value;
            }
          }
        }

        // Look for implementation notes
        const notesMatch = line.match(/notes?\s*:?\s*(.+)/i);
        if (notesMatch) {
          currentRequirement.implementationNotes = notesMatch[1].trim();
        }
      }
    });

    // Save last requirement if exists
    if (currentRequirement && currentRequirement.description) {
      requirements.push(currentRequirement as DSARRequirement);
    }

    return requirements;
  }

  /**
   * Extracts version from the document
   */
  private extractVersion(document: MarkdownDocument): string | undefined {
    // Look for version in title
    if (document.title) {
      const versionMatch = document.title.match(/v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/);
      if (versionMatch) {
        return versionMatch[1];
      }
    }

    // Look for version in content
    const versionMatch = document.content.match(/(?:version|versione)\s*:?\s*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/i);
    if (versionMatch) {
      return versionMatch[1];
    }

    return undefined;
  }

  /**
   * Calculates metadata about the anti-regression document
   */
  private calculateMetadata(
    rules: AntiRegressionRule[], 
    dsarRequirements: DSARRequirement[], 
    lastModified: Date
  ): AntiRegressionMetadata {
    const totalRules = rules.length;
    const activeRules = rules.filter(rule => rule.isActive).length;
    
    const rulesByType: Record<string, number> = {};
    rules.forEach(rule => {
      rulesByType[rule.type] = (rulesByType[rule.type] || 0) + 1;
    });

    const rulesBySeverity: Record<string, number> = {};
    rules.forEach(rule => {
      rulesBySeverity[rule.severity] = (rulesBySeverity[rule.severity] || 0) + 1;
    });

    const totalDSARRequirements = dsarRequirements.length;
    const implementedDSARRequirements = dsarRequirements.filter(req => req.isImplemented).length;

    return {
      totalRules,
      activeRules,
      rulesByType,
      rulesBySeverity,
      totalDSARRequirements,
      implementedDSARRequirements,
      lastUpdated: lastModified
    };
  }

  /**
   * Validates anti-regression rules against current project state
   */
  async validateRulesAgainstProject(
    document: AntiRegressionDocument, 
    projectPath: string
  ): Promise<Array<{
    rule: AntiRegressionRule;
    status: 'compliant' | 'violation' | 'unknown';
    message: string;
  }>> {
    const validationResults: Array<{
      rule: AntiRegressionRule;
      status: 'compliant' | 'violation' | 'unknown';
      message: string;
    }> = [];

    for (const rule of document.protectionRules) {
      if (!rule.isActive) {
        continue;
      }

      const result = await this.validateSingleRule(rule, projectPath);
      validationResults.push(result);
    }

    return validationResults;
  }

  /**
   * Validates a single rule against the project
   */
  private async validateSingleRule(
    rule: AntiRegressionRule, 
    projectPath: string
  ): Promise<{
    rule: AntiRegressionRule;
    status: 'compliant' | 'violation' | 'unknown';
    message: string;
  }> {
    try {
      switch (rule.type) {
        case 'file-protection':
          return await this.validateFileProtection(rule, projectPath);
        case 'version-lock':
          return await this.validateVersionLock(rule, projectPath);
        case 'immutable':
          return await this.validateImmutableRule(rule, projectPath);
        case 'config-protection':
          return await this.validateConfigProtection(rule, projectPath);
        default:
          return {
            rule,
            status: 'unknown',
            message: `Unknown rule type: ${rule.type}`
          };
      }
    } catch (error) {
      return {
        rule,
        status: 'unknown',
        message: `Validation error: ${error}`
      };
    }
  }

  /**
   * Validates file protection rules
   */
  private async validateFileProtection(
    rule: AntiRegressionRule, 
    projectPath: string
  ): Promise<{
    rule: AntiRegressionRule;
    status: 'compliant' | 'violation' | 'unknown';
    message: string;
  }> {
    const targetPath = path.join(projectPath, rule.target);
    
    try {
      const stats = await fs.promises.stat(targetPath);
      
      // Check if file exists (basic protection)
      if (stats.isFile()) {
        return {
          rule,
          status: 'compliant',
          message: `Protected file ${rule.target} exists`
        };
      } else {
        return {
          rule,
          status: 'violation',
          message: `Protected file ${rule.target} is not a file`
        };
      }
    } catch (error) {
      return {
        rule,
        status: 'violation',
        message: `Protected file ${rule.target} does not exist`
      };
    }
  }

  /**
   * Validates version lock rules
   */
  private async validateVersionLock(
    rule: AntiRegressionRule, 
    projectPath: string
  ): Promise<{
    rule: AntiRegressionRule;
    status: 'compliant' | 'violation' | 'unknown';
    message: string;
  }> {
    if (!rule.version) {
      return {
        rule,
        status: 'unknown',
        message: 'Version lock rule has no specified version'
      };
    }

    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageContent = await fs.promises.readFile(packageJsonPath, 'utf-8');
      const packageData = JSON.parse(packageContent);
      
      if (packageData.version === rule.version) {
        return {
          rule,
          status: 'compliant',
          message: `Version locked at ${rule.version}`
        };
      } else {
        return {
          rule,
          status: 'violation',
          message: `Version mismatch: expected ${rule.version}, found ${packageData.version}`
        };
      }
    } catch (error) {
      return {
        rule,
        status: 'unknown',
        message: `Could not validate version lock: ${error}`
      };
    }
  }

  /**
   * Validates immutable rules
   */
  private async validateImmutableRule(
    rule: AntiRegressionRule, 
    projectPath: string
  ): Promise<{
    rule: AntiRegressionRule;
    status: 'compliant' | 'violation' | 'unknown';
    message: string;
  }> {
    // This would require comparing against a baseline or git history
    // For now, just check if the target exists
    const targetPath = path.join(projectPath, rule.target);
    
    try {
      await fs.promises.access(targetPath);
      return {
        rule,
        status: 'compliant',
        message: `Immutable target ${rule.target} exists`
      };
    } catch (error) {
      return {
        rule,
        status: 'violation',
        message: `Immutable target ${rule.target} is missing`
      };
    }
  }

  /**
   * Validates configuration protection rules
   */
  private async validateConfigProtection(
    rule: AntiRegressionRule, 
    projectPath: string
  ): Promise<{
    rule: AntiRegressionRule;
    status: 'compliant' | 'violation' | 'unknown';
    message: string;
  }> {
    const configPath = path.join(projectPath, rule.target);
    
    try {
      const content = await fs.promises.readFile(configPath, 'utf-8');
      
      // Check if all required rules are present in the config
      const missingRules = rule.rules.filter(ruleText => !content.includes(ruleText));
      
      if (missingRules.length === 0) {
        return {
          rule,
          status: 'compliant',
          message: `All configuration rules are present in ${rule.target}`
        };
      } else {
        return {
          rule,
          status: 'violation',
          message: `Missing configuration rules in ${rule.target}: ${missingRules.join(', ')}`
        };
      }
    } catch (error) {
      return {
        rule,
        status: 'violation',
        message: `Could not validate configuration protection: ${error}`
      };
    }
  }
}