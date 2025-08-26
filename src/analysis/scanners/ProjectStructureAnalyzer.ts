import * as fs from 'fs';
import * as path from 'path';
import type { ProjectStructure, FileInfo, DirectoryNode, DependencyMap } from '../interfaces/ProjectStructure';

/**
 * Analyzes project structure by scanning directories and files
 */
export class ProjectStructureAnalyzer {
  private readonly excludePatterns: RegExp[] = [
    /node_modules/,
    /\.git/,
    /dist/,
    /build/,
    /coverage/,
    /\.vscode/,
    /\.idea/,
    /\.DS_Store/,
    /thumbs\.db/i
  ];

  private readonly fileTypeMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript-react',
    '.js': 'javascript',
    '.jsx': 'javascript-react',
    '.json': 'json',
    '.md': 'markdown',
    '.css': 'stylesheet',
    '.scss': 'sass',
    '.less': 'less',
    '.html': 'html',
    '.svg': 'image',
    '.png': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.gif': 'image',
    '.ico': 'image'
  };

  /**
   * Scans the project directory and returns complete structure analysis
   */
  async analyzeProjectStructure(rootPath: string): Promise<ProjectStructure> {
    const directoryTree = await this.scanDirectory(rootPath);
    const fileList = this.extractFileList(directoryTree);
    const dependencyMap = await this.buildDependencyMap(fileList);
    
    return {
      rootPath,
      directoryTree,
      fileList,
      dependencyMap,
      statistics: this.calculateStatistics(fileList),
      scannedAt: new Date()
    };
  }

  /**
   * Recursively scans directory structure
   */
  private async scanDirectory(dirPath: string, relativePath: string = ''): Promise<DirectoryNode> {
    const stats = await fs.promises.stat(dirPath);
    const name = path.basename(dirPath);
    
    if (!stats.isDirectory()) {
      throw new Error(`Path ${dirPath} is not a directory`);
    }

    const node: DirectoryNode = {
      name,
      path: relativePath || '.',
      type: 'directory',
      children: [],
      size: 0,
      lastModified: stats.mtime
    };

    try {
      const entries = await fs.promises.readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const relativeEntryPath = path.join(relativePath, entry);
        
        // Skip excluded patterns
        if (this.shouldExclude(relativeEntryPath)) {
          continue;
        }

        const entryStats = await fs.promises.stat(fullPath);
        
        if (entryStats.isDirectory()) {
          const childNode = await this.scanDirectory(fullPath, relativeEntryPath);
          node.children.push(childNode);
          node.size += childNode.size;
        } else {
          const fileNode: FileInfo = {
            name: entry,
            path: relativeEntryPath,
            type: 'file',
            extension: path.extname(entry),
            fileType: this.classifyFileType(entry),
            size: entryStats.size,
            lastModified: entryStats.mtime
          };
          
          node.children.push(fileNode);
          node.size += fileNode.size;
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dirPath}:`, error);
    }

    return node;
  }

  /**
   * Extracts flat list of files from directory tree
   */
  private extractFileList(directoryTree: DirectoryNode): FileInfo[] {
    const files: FileInfo[] = [];
    
    const traverse = (node: DirectoryNode | FileInfo) => {
      if (node.type === 'file') {
        files.push(node as FileInfo);
      } else {
        const dirNode = node as DirectoryNode;
        dirNode.children.forEach(traverse);
      }
    };
    
    traverse(directoryTree);
    return files;
  }

  /**
   * Builds dependency map by analyzing import/export statements
   */
  private async buildDependencyMap(files: FileInfo[]): Promise<DependencyMap> {
    const dependencyMap: DependencyMap = {};
    
    const codeFiles = files.filter(file => 
      ['.ts', '.tsx', '.js', '.jsx'].includes(file.extension)
    );

    for (const file of codeFiles) {
      try {
        const dependencies = await this.extractDependencies(file.path);
        dependencyMap[file.path] = dependencies;
      } catch (error) {
        console.warn(`Warning: Could not analyze dependencies for ${file.path}:`, error);
        dependencyMap[file.path] = { imports: [], exports: [] };
      }
    }

    return dependencyMap;
  }

  /**
   * Extracts import/export dependencies from a file
   */
  private async extractDependencies(filePath: string): Promise<{ imports: string[], exports: string[] }> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    
    const imports = this.extractImports(content);
    const exports = this.extractExports(content);
    
    return { imports, exports };
  }

  /**
   * Extracts import statements from file content
   */
  private extractImports(content: string): string[] {
    const imports: string[] = [];
    
    // Match various import patterns
    const importPatterns = [
      /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g,
      /import\s+['"`]([^'"`]+)['"`]/g,
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1]);
      }
    }

    return [...new Set(imports)]; // Remove duplicates
  }

  /**
   * Extracts export statements from file content
   */
  private extractExports(content: string): string[] {
    const exports: string[] = [];
    
    // Match various export patterns
    const exportPatterns = [
      /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
      /export\s+\{\s*([^}]+)\s*\}/g,
      /export\s+\*\s+from\s+['"`]([^'"`]+)['"`]/g
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (pattern.source.includes('from')) {
          // Re-export case
          exports.push(`*:${match[1]}`);
        } else if (pattern.source.includes('{')) {
          // Named exports
          const namedExports = match[1].split(',').map(e => e.trim());
          exports.push(...namedExports);
        } else {
          // Default or named export
          exports.push(match[1]);
        }
      }
    }

    return [...new Set(exports)]; // Remove duplicates
  }

  /**
   * Classifies file type based on extension
   */
  private classifyFileType(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    return this.fileTypeMap[extension] || 'unknown';
  }

  /**
   * Checks if path should be excluded from scanning
   */
  private shouldExclude(filePath: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Calculates statistics about the project structure
   */
  private calculateStatistics(files: FileInfo[]): {
    totalFiles: number;
    totalSize: number;
    fileTypeDistribution: Record<string, number>;
    largestFiles: FileInfo[];
  } {
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    const fileTypeDistribution: Record<string, number> = {};
    files.forEach(file => {
      fileTypeDistribution[file.fileType] = (fileTypeDistribution[file.fileType] || 0) + 1;
    });

    const largestFiles = files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    return {
      totalFiles,
      totalSize,
      fileTypeDistribution,
      largestFiles
    };
  }
}