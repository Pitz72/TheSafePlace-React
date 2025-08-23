import * as fs from 'fs';
import * as path from 'path';

/**
 * Represents a parsed Markdown document
 */
export interface MarkdownDocument {
  filePath: string;
  title?: string;
  content: string;
  sections: MarkdownSection[];
  metadata: MarkdownMetadata;
  versions: VersionInfo[];
  features: FeatureInfo[];
  lastModified: Date;
}

/**
 * Represents a section in a Markdown document
 */
export interface MarkdownSection {
  level: number;
  title: string;
  content: string;
  startLine: number;
  endLine: number;
  subsections: MarkdownSection[];
}

/**
 * Metadata extracted from Markdown
 */
export interface MarkdownMetadata {
  wordCount: number;
  lineCount: number;
  headingCount: number;
  linkCount: number;
  codeBlockCount: number;
  listCount: number;
}

/**
 * Version information found in Markdown
 */
export interface VersionInfo {
  version: string;
  context: string;
  line: number;
  type: 'header' | 'text' | 'code' | 'link';
}

/**
 * Feature information found in Markdown
 */
export interface FeatureInfo {
  name: string;
  description: string;
  status?: 'implemented' | 'planned' | 'in-progress' | 'deprecated';
  line: number;
  section: string;
}

/**
 * Utility class for parsing Markdown documents
 */
export class MarkdownParser {
  private readonly versionPatterns: RegExp[] = [
    /v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/g,
    /version\s*:?\s*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi,
    /versione\s*:?\s*v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/gi
  ];

  private readonly featurePatterns: RegExp[] = [
    /(?:feature|funzionalità|caratteristica)\s*:?\s*([^\n]+)/gi,
    /(?:implemented|implementato|completato)\s*:?\s*([^\n]+)/gi,
    /(?:planned|pianificato|previsto)\s*:?\s*([^\n]+)/gi,
    /(?:in-progress|in corso|sviluppo)\s*:?\s*([^\n]+)/gi
  ];

  /**
   * Parses a Markdown file and returns structured data
   */
  async parseMarkdownFile(filePath: string): Promise<MarkdownDocument> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const stats = await fs.promises.stat(filePath);
      
      const lines = content.split('\n');
      const sections = this.parseSections(lines);
      const metadata = this.extractMetadata(content, lines);
      const versions = this.extractVersions(content, lines);
      const features = this.extractFeatures(content, lines, sections);
      const title = this.extractTitle(sections);

      return {
        filePath,
        title,
        content,
        sections,
        metadata,
        versions,
        features,
        lastModified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to parse Markdown file ${filePath}: ${error}`);
    }
  }

  /**
   * Parses multiple Markdown files
   */
  async parseMarkdownFiles(filePaths: string[]): Promise<MarkdownDocument[]> {
    const parsePromises = filePaths.map(filePath => 
      this.parseMarkdownFile(filePath).catch(error => {
        console.warn(`Warning: Could not parse ${filePath}:`, error);
        return null;
      })
    );

    const results = await Promise.all(parsePromises);
    return results.filter((doc): doc is MarkdownDocument => doc !== null);
  }

  /**
   * Parses sections from Markdown content
   */
  private parseSections(lines: string[]): MarkdownSection[] {
    const sections: MarkdownSection[] = [];
    const sectionStack: MarkdownSection[] = [];
    let currentContent: string[] = [];
    let currentStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        // Save previous section content
        if (sectionStack.length > 0) {
          const currentSection = sectionStack[sectionStack.length - 1];
          currentSection.content = currentContent.join('\n').trim();
          currentSection.endLine = i - 1;
        }

        const level = headingMatch[1].length;
        const title = headingMatch[2].trim();

        const newSection: MarkdownSection = {
          level,
          title,
          content: '',
          startLine: i,
          endLine: i,
          subsections: []
        };

        // Handle section hierarchy
        while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
          const completedSection = sectionStack.pop()!;
          if (sectionStack.length === 0) {
            sections.push(completedSection);
          } else {
            sectionStack[sectionStack.length - 1].subsections.push(completedSection);
          }
        }

        sectionStack.push(newSection);
        currentContent = [];
        currentStartLine = i + 1;
      } else {
        currentContent.push(line);
      }
    }

    // Handle remaining sections
    if (sectionStack.length > 0) {
      const currentSection = sectionStack[sectionStack.length - 1];
      currentSection.content = currentContent.join('\n').trim();
      currentSection.endLine = lines.length - 1;

      while (sectionStack.length > 0) {
        const completedSection = sectionStack.pop()!;
        if (sectionStack.length === 0) {
          sections.push(completedSection);
        } else {
          sectionStack[sectionStack.length - 1].subsections.push(completedSection);
        }
      }
    }

    return sections;
  }

  /**
   * Extracts metadata from Markdown content
   */
  private extractMetadata(content: string, lines: string[]): MarkdownMetadata {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const lineCount = lines.length;
    const headingCount = lines.filter(line => /^#{1,6}\s/.test(line)).length;
    const linkCount = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
    const codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;
    const listCount = lines.filter(line => /^\s*[-*+]\s/.test(line) || /^\s*\d+\.\s/.test(line)).length;

    return {
      wordCount,
      lineCount,
      headingCount,
      linkCount,
      codeBlockCount,
      listCount
    };
  }

  /**
   * Extracts version information from Markdown content
   */
  private extractVersions(content: string, lines: string[]): VersionInfo[] {
    const versions: VersionInfo[] = [];

    lines.forEach((line, index) => {
      // Check for versions in headers
      if (line.startsWith('#')) {
        this.versionPatterns.forEach(pattern => {
          pattern.lastIndex = 0;
          let match;
          while ((match = pattern.exec(line)) !== null) {
            versions.push({
              version: match[1],
              context: line.trim(),
              line: index + 1,
              type: 'header'
            });
          }
        });
      }

      // Check for versions in regular text
      this.versionPatterns.forEach(pattern => {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const type = line.includes('```') ? 'code' : 
                      line.includes('[') && line.includes('](') ? 'link' : 'text';
          
          versions.push({
            version: match[1],
            context: line.trim(),
            line: index + 1,
            type: type as 'header' | 'text' | 'code' | 'link'
          });
        }
      });
    });

    // Remove duplicates
    const uniqueVersions = versions.filter((version, index, self) => 
      index === self.findIndex(v => v.version === version.version && v.line === version.line)
    );

    return uniqueVersions;
  }

  /**
   * Extracts feature information from Markdown content
   */
  private extractFeatures(content: string, lines: string[], sections: MarkdownSection[]): FeatureInfo[] {
    const features: FeatureInfo[] = [];

    lines.forEach((line, index) => {
      this.featurePatterns.forEach(pattern => {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const featureName = match[1].trim();
          const section = this.findSectionForLine(index + 1, sections);
          
          let status: FeatureInfo['status'] = undefined;
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes('implemented') || lowerLine.includes('implementato') || lowerLine.includes('completato')) {
            status = 'implemented';
          } else if (lowerLine.includes('planned') || lowerLine.includes('pianificato') || lowerLine.includes('previsto')) {
            status = 'planned';
          } else if (lowerLine.includes('in-progress') || lowerLine.includes('in corso') || lowerLine.includes('sviluppo')) {
            status = 'in-progress';
          } else if (lowerLine.includes('deprecated') || lowerLine.includes('deprecato') || lowerLine.includes('rimosso')) {
            status = 'deprecated';
          }

          features.push({
            name: featureName,
            description: line.trim(),
            status,
            line: index + 1,
            section: section?.title || 'Unknown'
          });
        }
      });

      // Look for task lists and checkboxes
      const taskMatch = line.match(/^\s*[-*]\s*\[([x\s])\]\s*(.+)$/i);
      if (taskMatch) {
        const isCompleted = taskMatch[1].toLowerCase() === 'x';
        const taskName = taskMatch[2].trim();
        const section = this.findSectionForLine(index + 1, sections);

        features.push({
          name: taskName,
          description: line.trim(),
          status: isCompleted ? 'implemented' : 'planned',
          line: index + 1,
          section: section?.title || 'Tasks'
        });
      }
    });

    return features;
  }

  /**
   * Extracts the document title from sections
   */
  private extractTitle(sections: MarkdownSection[]): string | undefined {
    const h1Section = sections.find(section => section.level === 1);
    return h1Section?.title;
  }

  /**
   * Finds the section that contains a specific line number
   */
  private findSectionForLine(lineNumber: number, sections: MarkdownSection[]): MarkdownSection | undefined {
    for (const section of sections) {
      if (lineNumber >= section.startLine && lineNumber <= section.endLine) {
        // Check subsections first
        const subsection = this.findSectionForLine(lineNumber, section.subsections);
        return subsection || section;
      }
    }
    return undefined;
  }

  /**
   * Searches for specific patterns in Markdown content
   */
  searchInMarkdown(document: MarkdownDocument, pattern: RegExp): Array<{
    match: string;
    line: number;
    section: string;
    context: string;
  }> {
    const results: Array<{
      match: string;
      line: number;
      section: string;
      context: string;
    }> = [];

    const lines = document.content.split('\n');
    lines.forEach((line, index) => {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const section = this.findSectionForLine(index + 1, document.sections);
        results.push({
          match: match[0],
          line: index + 1,
          section: section?.title || 'Unknown',
          context: line.trim()
        });
      }
    });

    return results;
  }

  /**
   * Extracts all links from a Markdown document
   */
  extractLinks(document: MarkdownDocument): Array<{
    text: string;
    url: string;
    line: number;
    type: 'internal' | 'external' | 'relative';
  }> {
    const links: Array<{
      text: string;
      url: string;
      line: number;
      type: 'internal' | 'external' | 'relative';
    }> = [];

    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const lines = document.content.split('\n');

    lines.forEach((line, index) => {
      let match;
      linkPattern.lastIndex = 0;
      while ((match = linkPattern.exec(line)) !== null) {
        const text = match[1];
        const url = match[2];
        
        let type: 'internal' | 'external' | 'relative';
        if (url.startsWith('http://') || url.startsWith('https://')) {
          type = 'external';
        } else if (url.startsWith('#')) {
          type = 'internal';
        } else {
          type = 'relative';
        }

        links.push({
          text,
          url,
          line: index + 1,
          type
        });
      }
    });

    return links;
  }

  /**
   * Validates Markdown structure and reports issues
   */
  validateMarkdown(document: MarkdownDocument): Array<{
    type: 'warning' | 'error';
    message: string;
    line?: number;
    section?: string;
  }> {
    const issues: Array<{
      type: 'warning' | 'error';
      message: string;
      line?: number;
      section?: string;
    }> = [];

    // Check for missing title
    if (!document.title) {
      issues.push({
        type: 'warning',
        message: 'Document has no H1 title'
      });
    }

    // Check for empty sections
    document.sections.forEach(section => {
      if (!section.content.trim()) {
        issues.push({
          type: 'warning',
          message: `Section "${section.title}" is empty`,
          line: section.startLine,
          section: section.title
        });
      }
    });

    // Check for broken internal links
    const links = this.extractLinks(document);
    const sectionTitles = new Set(document.sections.map(s => s.title.toLowerCase()));
    
    links.filter(link => link.type === 'internal').forEach(link => {
      const anchor = link.url.substring(1).toLowerCase().replace(/-/g, ' ');
      if (!sectionTitles.has(anchor)) {
        issues.push({
          type: 'error',
          message: `Broken internal link: ${link.url}`,
          line: link.line
        });
      }
    });

    return issues;
  }
}