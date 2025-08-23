import * as fs from 'fs';
import * as path from 'path';
import { RoadmapParser, RoadmapDocument, RoadmapItem } from './RoadmapParser';

/**
 * Represents the status of a roadmap item compared to actual implementation
 */
export interface RoadmapItemStatus {
  item: RoadmapItem;
  actualStatus: 'implemented' | 'partially-implemented' | 'not-implemented' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
  discrepancy?: {
    documentedStatus: RoadmapItem['status'];
    actualStatus: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  };
}

/**
 * Represents a comprehensive roadmap analysis
 */
export interface RoadmapAnalysis {
  document: RoadmapDocument;
  itemStatuses: RoadmapItemStatus[];
  completionAnalysis: CompletionAnalysis;
  discrepancies: RoadmapDiscrepancy[];
  recommendations: RoadmapRecommendation[];
  lastAnalyzed: Date;
}

/**
 * Analysis of roadmap completion
 */
export interface CompletionAnalysis {
  totalItems: number;
  documentedAsCompleted: number;
  actuallyImplemented: number;
  partiallyImplemented: number;
  notImplemented: number;
  accuracyPercentage: number;
  completionTrend: CompletionTrend[];
}

/**
 * Represents completion trend over time
 */
export interface CompletionTrend {
  version?: string;
  date?: Date;
  completedItems: number;
  totalItems: number;
  completionPercentage: number;
}

/**
 * Represents a discrepancy between documented and actual status
 */
export interface RoadmapDiscrepancy {
  type: 'status-mismatch' | 'missing-implementation' | 'undocumented-feature' | 'outdated-item';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  item?: RoadmapItem;
  evidence: string[];
  recommendation: string;
}

/**
 * Represents a recommendation for roadmap improvement
 */
export interface RoadmapRecommendation {
  type: 'update-status' | 'add-item' | 'remove-item' | 'clarify-description' | 'update-priority';
  priority: 'high' | 'medium' | 'low';
  description: string;
  item?: RoadmapItem;
  suggestedAction: string;
}

/**
 * Configuration for roadmap analysis
 */
export interface RoadmapAnalysisConfig {
  projectPath: string;
  codePatterns: Record<string, RegExp[]>;
  confidenceThresholds: {
    high: number;
    medium: number;
  };
  includePartialMatches: boolean;
}

/**
 * Analyzes roadmap documents and compares them with actual implementation
 */
export class RoadmapStatusAnalyzer {
  private readonly roadmapParser: RoadmapParser;
  private readonly defaultConfig: RoadmapAnalysisConfig = {
    projectPath: '.',
    codePatterns: {
      components: [/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g],
      hooks: [/export\s+(?:const|function)\s+(use\w+)/g],
      contexts: [/createContext|useContext/g],
      apis: [/\/api\/|fetch\(|axios\./g],
      tests: [/describe\(|it\(|test\(/g]
    },
    confidenceThresholds: {
      high: 0.8,
      medium: 0.5
    },
    includePartialMatches: true
  };

  constructor() {
    this.roadmapParser = new RoadmapParser();
  }

  /**
   * Analyzes a roadmap document against actual project implementation
   */
  async analyzeRoadmap(
    roadmapPath: string, 
    config: Partial<RoadmapAnalysisConfig> = {}
  ): Promise<RoadmapAnalysis> {
    const analysisConfig = { ...this.defaultConfig, ...config };
    
    try {
      const document = await this.roadmapParser.parseRoadmapFile(roadmapPath);
      const itemStatuses = await this.analyzeRoadmapItems(document.items, analysisConfig);
      const completionAnalysis = this.calculateCompletionAnalysis(itemStatuses);
      const discrepancies = this.identifyDiscrepancies(itemStatuses);
      const recommendations = this.generateRecommendations(itemStatuses, discrepancies);

      return {
        document,
        itemStatuses,
        completionAnalysis,
        discrepancies,
        recommendations,
        lastAnalyzed: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to analyze roadmap ${roadmapPath}: ${error}`);
    }
  }

  /**
   * Analyzes multiple roadmap documents
   */
  async analyzeRoadmaps(
    roadmapPaths: string[], 
    config: Partial<RoadmapAnalysisConfig> = {}
  ): Promise<RoadmapAnalysis[]> {
    const analyzePromises = roadmapPaths.map(path => 
      this.analyzeRoadmap(path, config).catch(error => {
        console.warn(`Warning: Could not analyze roadmap ${path}:`, error);
        return null;
      })
    );

    const results = await Promise.all(analyzePromises);
    return results.filter((analysis): analysis is RoadmapAnalysis => analysis !== null);
  }

  /**
   * Analyzes individual roadmap items
   */
  private async analyzeRoadmapItems(
    items: RoadmapItem[], 
    config: RoadmapAnalysisConfig
  ): Promise<RoadmapItemStatus[]> {
    const itemStatuses: RoadmapItemStatus[] = [];

    for (const item of items) {
      const status = await this.analyzeRoadmapItem(item, config);
      itemStatuses.push(status);
    }

    return itemStatuses;
  }

  /**
   * Analyzes a single roadmap item
   */
  private async analyzeRoadmapItem(
    item: RoadmapItem, 
    config: RoadmapAnalysisConfig
  ): Promise<RoadmapItemStatus> {
    const evidence: string[] = [];
    let actualStatus: RoadmapItemStatus['actualStatus'] = 'unknown';
    let confidence: RoadmapItemStatus['confidence'] = 'low';

    try {
      // Search for evidence in code
      const codeEvidence = await this.searchForImplementationEvidence(item, config);
      evidence.push(...codeEvidence.evidence);

      // Determine actual status based on evidence
      const implementationScore = this.calculateImplementationScore(codeEvidence);
      
      if (implementationScore >= config.confidenceThresholds.high) {
        actualStatus = 'implemented';
        confidence = 'high';
      } else if (implementationScore >= config.confidenceThresholds.medium) {
        actualStatus = 'partially-implemented';
        confidence = 'medium';
      } else if (implementationScore > 0) {
        actualStatus = 'partially-implemented';
        confidence = 'low';
      } else {
        actualStatus = 'not-implemented';
        confidence = 'medium';
      }

      // Check for discrepancy
      let discrepancy: RoadmapItemStatus['discrepancy'];
      if (this.hasStatusDiscrepancy(item.status, actualStatus)) {
        discrepancy = {
          documentedStatus: item.status,
          actualStatus,
          severity: this.calculateDiscrepancySeverity(item, actualStatus)
        };
      }

      return {
        item,
        actualStatus,
        confidence,
        evidence,
        discrepancy
      };
    } catch (error) {
      console.warn(`Warning: Could not analyze item "${item.title}":`, error);
      return {
        item,
        actualStatus: 'unknown',
        confidence: 'low',
        evidence: [`Analysis error: ${error}`]
      };
    }
  }

  /**
   * Searches for implementation evidence in the codebase
   */
  private async searchForImplementationEvidence(
    item: RoadmapItem, 
    config: RoadmapAnalysisConfig
  ): Promise<{ evidence: string[]; score: number }> {
    const evidence: string[] = [];
    let score = 0;

    // Extract keywords from item title and description
    const keywords = this.extractKeywords(item.title + ' ' + item.description);
    
    // Search in different file types
    const searchResults = await this.searchInCodebase(keywords, config);
    
    for (const result of searchResults) {
      evidence.push(`Found in ${result.file}: ${result.match}`);
      score += result.relevance;
    }

    // Bonus points for specific patterns
    if (item.title.toLowerCase().includes('component')) {
      const componentEvidence = await this.searchForComponents(keywords, config);
      evidence.push(...componentEvidence.evidence);
      score += componentEvidence.score;
    }

    if (item.title.toLowerCase().includes('hook')) {
      const hookEvidence = await this.searchForHooks(keywords, config);
      evidence.push(...hookEvidence.evidence);
      score += hookEvidence.score;
    }

    if (item.title.toLowerCase().includes('api') || item.title.toLowerCase().includes('endpoint')) {
      const apiEvidence = await this.searchForAPIs(keywords, config);
      evidence.push(...apiEvidence.evidence);
      score += apiEvidence.score;
    }

    return { evidence, score };
  }

  /**
   * Extracts relevant keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful terms
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));

    // Remove duplicates and return
    return [...new Set(words)];
  }

  /**
   * Searches for keywords in the codebase
   */
  private async searchInCodebase(
    keywords: string[], 
    config: RoadmapAnalysisConfig
  ): Promise<Array<{ file: string; match: string; relevance: number }>> {
    const results: Array<{ file: string; match: string; relevance: number }> = [];
    
    try {
      // This is a simplified implementation
      // In a real scenario, you'd use tools like ripgrep or similar
      const files = await this.getCodeFiles(config.projectPath);
      
      for (const file of files) {
        try {
          const content = await fs.promises.readFile(file, 'utf-8');
          
          for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = content.match(regex);
            
            if (matches) {
              results.push({
                file: path.relative(config.projectPath, file),
                match: `${matches.length} occurrences of "${keyword}"`,
                relevance: matches.length * 0.1
              });
            }
          }
        } catch (error) {
          // Skip files that can't be read
          continue;
        }
      }
    } catch (error) {
      console.warn('Warning: Could not search codebase:', error);
    }

    return results;
  }

  /**
   * Gets list of code files to search
   */
  private async getCodeFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };

    await scanDirectory(projectPath);
    return files;
  }

  /**
   * Checks if a directory should be skipped
   */
  private shouldSkipDirectory(name: string): boolean {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.vscode', '.idea'];
    return skipDirs.includes(name);
  }

  /**
   * Searches for React components
   */
  private async searchForComponents(
    keywords: string[], 
    config: RoadmapAnalysisConfig
  ): Promise<{ evidence: string[]; score: number }> {
    const evidence: string[] = [];
    let score = 0;

    // Look for component files and exports
    const componentKeywords = keywords.filter(k => 
      k.includes('component') || 
      k.charAt(0).toUpperCase() === k.charAt(0)
    );

    for (const keyword of componentKeywords) {
      const componentFile = `${keyword}.tsx`;
      const componentPath = path.join(config.projectPath, 'src', 'components', componentFile);
      
      try {
        await fs.promises.access(componentPath);
        evidence.push(`Found component file: ${componentFile}`);
        score += 0.5;
      } catch {
        // Component file doesn't exist
      }
    }

    return { evidence, score };
  }

  /**
   * Searches for React hooks
   */
  private async searchForHooks(
    keywords: string[], 
    config: RoadmapAnalysisConfig
  ): Promise<{ evidence: string[]; score: number }> {
    const evidence: string[] = [];
    let score = 0;

    const hookKeywords = keywords.filter(k => k.startsWith('use') || k.includes('hook'));

    for (const keyword of hookKeywords) {
      const hookFile = `${keyword}.ts`;
      const hookPath = path.join(config.projectPath, 'src', 'hooks', hookFile);
      
      try {
        await fs.promises.access(hookPath);
        evidence.push(`Found hook file: ${hookFile}`);
        score += 0.5;
      } catch {
        // Hook file doesn't exist
      }
    }

    return { evidence, score };
  }

  /**
   * Searches for API implementations
   */
  private async searchForAPIs(
    keywords: string[], 
    config: RoadmapAnalysisConfig
  ): Promise<{ evidence: string[]; score: number }> {
    const evidence: string[] = [];
    let score = 0;

    // This is a simplified implementation
    // In practice, you'd search for API routes, fetch calls, etc.
    
    return { evidence, score };
  }

  /**
   * Calculates implementation score from evidence
   */
  private calculateImplementationScore(evidence: { evidence: string[]; score: number }): number {
    return Math.min(evidence.score, 1.0); // Cap at 1.0
  }

  /**
   * Checks if there's a discrepancy between documented and actual status
   */
  private hasStatusDiscrepancy(
    documentedStatus: RoadmapItem['status'], 
    actualStatus: RoadmapItemStatus['actualStatus']
  ): boolean {
    const statusMap: Record<RoadmapItem['status'], string[]> = {
      'completed': ['implemented'],
      'in-progress': ['partially-implemented', 'implemented'],
      'planned': ['not-implemented', 'partially-implemented'],
      'cancelled': ['not-implemented'],
      'on-hold': ['not-implemented', 'partially-implemented']
    };

    const expectedStatuses = statusMap[documentedStatus] || [];
    return !expectedStatuses.includes(actualStatus);
  }

  /**
   * Calculates the severity of a status discrepancy
   */
  private calculateDiscrepancySeverity(
    item: RoadmapItem, 
    actualStatus: string
  ): 'critical' | 'high' | 'medium' | 'low' {
    // Critical priority items with status mismatches are high severity
    if (item.priority === 'critical') {
      return 'high';
    }

    // Completed items that aren't implemented are high severity
    if (item.status === 'completed' && actualStatus !== 'implemented') {
      return 'high';
    }

    // In-progress items that aren't partially implemented are medium severity
    if (item.status === 'in-progress' && !actualStatus.includes('implemented')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Calculates completion analysis
   */
  private calculateCompletionAnalysis(itemStatuses: RoadmapItemStatus[]): CompletionAnalysis {
    const totalItems = itemStatuses.length;
    const documentedAsCompleted = itemStatuses.filter(s => s.item.status === 'completed').length;
    const actuallyImplemented = itemStatuses.filter(s => s.actualStatus === 'implemented').length;
    const partiallyImplemented = itemStatuses.filter(s => s.actualStatus === 'partially-implemented').length;
    const notImplemented = itemStatuses.filter(s => s.actualStatus === 'not-implemented').length;

    const accuracyPercentage = totalItems > 0 
      ? (itemStatuses.filter(s => !s.discrepancy).length / totalItems) * 100 
      : 100;

    return {
      totalItems,
      documentedAsCompleted,
      actuallyImplemented,
      partiallyImplemented,
      notImplemented,
      accuracyPercentage,
      completionTrend: [] // Would be populated with historical data
    };
  }

  /**
   * Identifies discrepancies in the roadmap
   */
  private identifyDiscrepancies(itemStatuses: RoadmapItemStatus[]): RoadmapDiscrepancy[] {
    const discrepancies: RoadmapDiscrepancy[] = [];

    itemStatuses.forEach(status => {
      if (status.discrepancy) {
        discrepancies.push({
          type: 'status-mismatch',
          severity: status.discrepancy.severity,
          description: `Item "${status.item.title}" is documented as ${status.discrepancy.documentedStatus} but appears to be ${status.discrepancy.actualStatus}`,
          item: status.item,
          evidence: status.evidence,
          recommendation: this.generateDiscrepancyRecommendation(status)
        });
      }
    });

    return discrepancies;
  }

  /**
   * Generates recommendations for roadmap improvements
   */
  private generateRecommendations(
    itemStatuses: RoadmapItemStatus[], 
    discrepancies: RoadmapDiscrepancy[]
  ): RoadmapRecommendation[] {
    const recommendations: RoadmapRecommendation[] = [];

    // Generate recommendations based on discrepancies
    discrepancies.forEach(discrepancy => {
      if (discrepancy.item) {
        recommendations.push({
          type: 'update-status',
          priority: discrepancy.severity === 'critical' ? 'high' : 'medium',
          description: `Update status of "${discrepancy.item.title}"`,
          item: discrepancy.item,
          suggestedAction: discrepancy.recommendation
        });
      }
    });

    // Generate recommendations for items with low confidence
    itemStatuses.forEach(status => {
      if (status.confidence === 'low' && status.actualStatus === 'unknown') {
        recommendations.push({
          type: 'clarify-description',
          priority: 'low',
          description: `Clarify implementation details for "${status.item.title}"`,
          item: status.item,
          suggestedAction: 'Add more specific implementation details or acceptance criteria'
        });
      }
    });

    return recommendations;
  }

  /**
   * Generates a recommendation for a specific discrepancy
   */
  private generateDiscrepancyRecommendation(status: RoadmapItemStatus): string {
    if (!status.discrepancy) return '';

    const { documentedStatus, actualStatus } = status.discrepancy;

    if (documentedStatus === 'completed' && actualStatus !== 'implemented') {
      return `Change status from "completed" to "in-progress" or investigate why implementation is missing`;
    }

    if (documentedStatus === 'planned' && actualStatus === 'implemented') {
      return `Update status from "planned" to "completed"`;
    }

    if (documentedStatus === 'in-progress' && actualStatus === 'not-implemented') {
      return `Verify if work has actually started or change status to "planned"`;
    }

    return `Review and update status to reflect actual implementation state`;
  }
}