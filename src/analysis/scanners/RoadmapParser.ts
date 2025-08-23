import * as fs from 'fs';
import * as path from 'path';
import { MarkdownParser, MarkdownDocument, FeatureInfo } from './MarkdownParser';

/**
 * Represents a roadmap item
 */
export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  priority: 'critical' | 'high' | 'medium' | 'low';
  version?: string;
  estimatedDate?: Date;
  actualDate?: Date;
  dependencies: string[];
  tags: string[];
  section: string;
  line: number;
}

/**
 * Represents a parsed roadmap document
 */
export interface RoadmapDocument {
  filePath: string;
  title: string;
  version?: string;
  items: RoadmapItem[];
  sections: RoadmapSection[];
  metadata: RoadmapMetadata;
  lastModified: Date;
}

/**
 * Represents a section in the roadmap
 */
export interface RoadmapSection {
  title: string;
  items: RoadmapItem[];
  subsections: RoadmapSection[];
}

/**
 * Metadata about the roadmap
 */
export interface RoadmapMetadata {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  plannedItems: number;
  completionPercentage: number;
  lastUpdated: Date;
}

/**
 * Parses roadmap documents and extracts structured information
 */
export class RoadmapParser {
  private readonly markdownParser: MarkdownParser;

  private readonly statusPatterns: Array<{
    pattern: RegExp;
    status: RoadmapItem['status'];
  }> = [
    { pattern: /\[x\]/i, status: 'completed' },
    { pattern: /\[ \]/i, status: 'planned' },
    { pattern: /\[-\]/i, status: 'cancelled' },
    { pattern: /\[~\]/i, status: 'on-hold' },
    { pattern: /\[>\]/i, status: 'in-progress' },
    { pattern: /(?:completed|completato|fatto|done)/i, status: 'completed' },
    { pattern: /(?:in-progress|in corso|sviluppo|wip)/i, status: 'in-progress' },
    { pattern: /(?:planned|pianificato|previsto|todo)/i, status: 'planned' },
    { pattern: /(?:cancelled|cancellato|rimosso|removed)/i, status: 'cancelled' },
    { pattern: /(?:on-hold|sospeso|paused)/i, status: 'on-hold' }
  ];

  private readonly priorityPatterns: Array<{
    pattern: RegExp;
    priority: RoadmapItem['priority'];
  }> = [
    { pattern: /(?:critical|critico|urgente|urgent)/i, priority: 'critical' },
    { pattern: /(?:high|alto|importante|important)/i, priority: 'high' },
    { pattern: /(?:medium|medio|normale|normal)/i, priority: 'medium' },
    { pattern: /(?:low|basso|opzionale|optional)/i, priority: 'low' }
  ];

  constructor() {
    this.markdownParser = new MarkdownParser();
  }

  /**
   * Parses a roadmap file and returns structured data
   */
  async parseRoadmapFile(filePath: string): Promise<RoadmapDocument> {
    try {
      const document = await this.markdownParser.parseMarkdownFile(filePath);
      const stats = await fs.promises.stat(filePath);
      
      const items = this.extractRoadmapItems(document);
      const sections = this.buildRoadmapSections(document, items);
      const metadata = this.calculateMetadata(items, stats.mtime);
      const version = this.extractRoadmapVersion(document);

      return {
        filePath,
        title: document.title || path.basename(filePath),
        version,
        items,
        sections,
        metadata,
        lastModified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to parse roadmap file ${filePath}: ${error}`);
    }
  }

  /**
   * Parses multiple roadmap files
   */
  async parseRoadmapFiles(filePaths: string[]): Promise<RoadmapDocument[]> {
    const parsePromises = filePaths.map(filePath => 
      this.parseRoadmapFile(filePath).catch(error => {
        console.warn(`Warning: Could not parse roadmap ${filePath}:`, error);
        return null;
      })
    );

    const results = await Promise.all(parsePromises);
    return results.filter((doc): doc is RoadmapDocument => doc !== null);
  }

  /**
   * Extracts roadmap items from the document
   */
  private extractRoadmapItems(document: MarkdownDocument): RoadmapItem[] {
    const items: RoadmapItem[] = [];
    const lines = document.content.split('\n');
    let currentSection = 'General';

    lines.forEach((line, index) => {
      // Update current section based on headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        currentSection = headerMatch[2].trim();
        return;
      }

      // Look for list items (roadmap items)
      const listMatch = line.match(/^\s*[-*+]\s*(.+)$/);
      if (listMatch) {
        const itemText = listMatch[1].trim();
        const item = this.parseRoadmapItem(itemText, currentSection, index + 1);
        if (item) {
          items.push(item);
        }
        return;
      }

      // Look for numbered list items
      const numberedMatch = line.match(/^\s*\d+\.\s*(.+)$/);
      if (numberedMatch) {
        const itemText = numberedMatch[1].trim();
        const item = this.parseRoadmapItem(itemText, currentSection, index + 1);
        if (item) {
          items.push(item);
        }
        return;
      }

      // Look for task list items
      const taskMatch = line.match(/^\s*[-*]\s*\[([x\s~>-])\]\s*(.+)$/i);
      if (taskMatch) {
        const statusChar = taskMatch[1];
        const itemText = taskMatch[2].trim();
        const item = this.parseRoadmapItem(itemText, currentSection, index + 1);
        if (item) {
          // Override status based on checkbox
          if (statusChar.toLowerCase() === 'x') item.status = 'completed';
          else if (statusChar === '-') item.status = 'cancelled';
          else if (statusChar === '~') item.status = 'on-hold';
          else if (statusChar === '>') item.status = 'in-progress';
          else item.status = 'planned';
          
          items.push(item);
        }
      }
    });

    return items;
  }

  /**
   * Parses a single roadmap item from text
   */
  private parseRoadmapItem(text: string, section: string, line: number): RoadmapItem | null {
    if (!text.trim()) return null;

    // Generate ID from text
    const id = this.generateItemId(text, line);
    
    // Extract title (everything before first colon or dash)
    const titleMatch = text.match(/^([^:-]+)(?:[:-]\s*(.+))?$/);
    const title = titleMatch ? titleMatch[1].trim() : text.trim();
    const description = titleMatch && titleMatch[2] ? titleMatch[2].trim() : '';

    // Determine status
    let status: RoadmapItem['status'] = 'planned';
    for (const { pattern, status: patternStatus } of this.statusPatterns) {
      if (pattern.test(text)) {
        status = patternStatus;
        break;
      }
    }

    // Determine priority
    let priority: RoadmapItem['priority'] = 'medium';
    for (const { pattern, priority: patternPriority } of this.priorityPatterns) {
      if (pattern.test(text)) {
        priority = patternPriority;
        break;
      }
    }

    // Extract version
    const versionMatch = text.match(/v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/);
    const version = versionMatch ? versionMatch[1] : undefined;

    // Extract dates
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
    const estimatedDate = dateMatch ? new Date(dateMatch[1]) : undefined;

    // Extract dependencies (items in parentheses)
    const dependencyMatch = text.match(/\(depends on:?\s*([^)]+)\)/i);
    const dependencies = dependencyMatch 
      ? dependencyMatch[1].split(',').map(d => d.trim())
      : [];

    // Extract tags (hashtags)
    const tagMatches = text.match(/#(\w+)/g);
    const tags = tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];

    return {
      id,
      title,
      description,
      status,
      priority,
      version,
      estimatedDate,
      dependencies,
      tags,
      section,
      line
    };
  }

  /**
   * Generates a unique ID for a roadmap item
   */
  private generateItemId(text: string, line: number): string {
    const cleanText = text.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const shortText = words.slice(0, 3).join('-');
    return `${shortText}-${line}`;
  }

  /**
   * Builds roadmap sections from document and items
   */
  private buildRoadmapSections(document: MarkdownDocument, items: RoadmapItem[]): RoadmapSection[] {
    const sections: RoadmapSection[] = [];
    const sectionMap = new Map<string, RoadmapSection>();

    // Create sections from document structure
    document.sections.forEach(docSection => {
      const section: RoadmapSection = {
        title: docSection.title,
        items: [],
        subsections: []
      };
      sections.push(section);
      sectionMap.set(docSection.title, section);
    });

    // Assign items to sections
    items.forEach(item => {
      const section = sectionMap.get(item.section);
      if (section) {
        section.items.push(item);
      } else {
        // Create a new section if it doesn't exist
        const newSection: RoadmapSection = {
          title: item.section,
          items: [item],
          subsections: []
        };
        sections.push(newSection);
        sectionMap.set(item.section, newSection);
      }
    });

    return sections;
  }

  /**
   * Calculates metadata about the roadmap
   */
  private calculateMetadata(items: RoadmapItem[], lastModified: Date): RoadmapMetadata {
    const totalItems = items.length;
    const completedItems = items.filter(item => item.status === 'completed').length;
    const inProgressItems = items.filter(item => item.status === 'in-progress').length;
    const plannedItems = items.filter(item => item.status === 'planned').length;
    const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      totalItems,
      completedItems,
      inProgressItems,
      plannedItems,
      completionPercentage,
      lastUpdated: lastModified
    };
  }

  /**
   * Extracts version information from roadmap document
   */
  private extractRoadmapVersion(document: MarkdownDocument): string | undefined {
    // Look for version in title
    if (document.title) {
      const versionMatch = document.title.match(/v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/);
      if (versionMatch) {
        return versionMatch[1];
      }
    }

    // Look for version in first section
    if (document.sections.length > 0) {
      const firstSection = document.sections[0];
      const versionMatch = firstSection.content.match(/version\s*:?\s*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/i);
      if (versionMatch) {
        return versionMatch[1];
      }
    }

    return undefined;
  }

  /**
   * Finds items by status
   */
  findItemsByStatus(document: RoadmapDocument, status: RoadmapItem['status']): RoadmapItem[] {
    return document.items.filter(item => item.status === status);
  }

  /**
   * Finds items by priority
   */
  findItemsByPriority(document: RoadmapDocument, priority: RoadmapItem['priority']): RoadmapItem[] {
    return document.items.filter(item => item.priority === priority);
  }

  /**
   * Finds items by version
   */
  findItemsByVersion(document: RoadmapDocument, version: string): RoadmapItem[] {
    return document.items.filter(item => item.version === version);
  }

  /**
   * Finds items with dependencies
   */
  findItemsWithDependencies(document: RoadmapDocument): RoadmapItem[] {
    return document.items.filter(item => item.dependencies.length > 0);
  }

  /**
   * Validates roadmap consistency
   */
  validateRoadmap(document: RoadmapDocument): Array<{
    type: 'warning' | 'error';
    message: string;
    item?: RoadmapItem;
  }> {
    const issues: Array<{
      type: 'warning' | 'error';
      message: string;
      item?: RoadmapItem;
    }> = [];

    // Check for items without descriptions
    document.items.forEach(item => {
      if (!item.description.trim()) {
        issues.push({
          type: 'warning',
          message: `Item "${item.title}" has no description`,
          item
        });
      }
    });

    // Check for broken dependencies
    const itemIds = new Set(document.items.map(item => item.id));
    document.items.forEach(item => {
      item.dependencies.forEach(dep => {
        if (!itemIds.has(dep)) {
          issues.push({
            type: 'error',
            message: `Item "${item.title}" has unknown dependency: ${dep}`,
            item
          });
        }
      });
    });

    // Check for circular dependencies
    const circularDeps = this.findCircularDependencies(document.items);
    circularDeps.forEach(cycle => {
      issues.push({
        type: 'error',
        message: `Circular dependency detected: ${cycle.join(' -> ')}`
      });
    });

    return issues;
  }

  /**
   * Finds circular dependencies in roadmap items
   */
  private findCircularDependencies(items: RoadmapItem[]): string[][] {
    const itemMap = new Map(items.map(item => [item.id, item]));
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (itemId: string, path: string[]): void => {
      if (recursionStack.has(itemId)) {
        const cycleStart = path.indexOf(itemId);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), itemId]);
        }
        return;
      }

      if (visited.has(itemId)) {
        return;
      }

      visited.add(itemId);
      recursionStack.add(itemId);

      const item = itemMap.get(itemId);
      if (item) {
        for (const dep of item.dependencies) {
          dfs(dep, [...path, itemId]);
        }
      }

      recursionStack.delete(itemId);
    };

    for (const item of items) {
      if (!visited.has(item.id)) {
        dfs(item.id, []);
      }
    }

    return cycles;
  }
}