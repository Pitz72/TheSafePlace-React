import * as fs from 'fs';
import * as path from 'path';
import { FileDependencies, DependencyMap } from '../interfaces/ProjectStructure';

/**
 * Maps import/export dependencies between files
 */
export class DependencyMapper {
  private readonly importPatterns = [
    // ES6 imports
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g,
    // Dynamic imports
    /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    // CommonJS require
    /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    // TypeScript import type
    /import\s+type\s+(?:\{[^}]*\}|\w+)\s+from\s+['"`]([^'"`]+)['"`]/g
  ];

  private readonly exportPatterns = [
    // Named exports
    /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g,
    // Export declarations
    /export\s+\{\s*([^}]+)\s*\}(?:\s+from\s+['"`]([^'"`]+)['"`])?/g,
    // Default exports
    /export\s+default\s+(?:(?:const|let|var|function|class)\s+)?(\w+)?/g,
    // Re-exports
    /export\s+\*(?:\s+as\s+(\w+))?\s+from\s+['"`]([^'"`]+)['"`]/g,
    // Export assignments (TypeScript)
    /export\s*=\s*(\w+)/g
  ];

  /**
   * Analyzes dependencies for a single file
   */
  async analyzeDependencies(filePath: string): Promise<FileDependencies> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const imports = this.extractImports(content, filePath);
      const exports = this.extractExports(content);
      
      return { imports, exports };
    } catch (error) {
      console.warn(`Warning: Could not analyze dependencies for ${filePath}:`, error);
      return { imports: [], exports: [] };
    }
  }

  /**
   * Builds dependency map for multiple files
   */
  async buildDependencyMap(filePaths: string[]): Promise<DependencyMap> {
    const dependencyMap: DependencyMap = {};
    
    const analysisPromises = filePaths.map(async (filePath) => {
      const dependencies = await this.analyzeDependencies(filePath);
      return { filePath, dependencies };
    });

    const results = await Promise.all(analysisPromises);
    
    for (const { filePath, dependencies } of results) {
      dependencyMap[filePath] = dependencies;
    }

    return dependencyMap;
  }

  /**
   * Extracts import statements from file content
   */
  private extractImports(content: string, filePath: string): string[] {
    const imports: string[] = [];
    
    for (const pattern of this.importPatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex state
      
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath) {
          const resolvedPath = this.resolveImportPath(importPath, filePath);
          imports.push(resolvedPath);
        }
      }
    }

    return [...new Set(imports)]; // Remove duplicates
  }

  /**
   * Extracts export statements from file content
   */
  private extractExports(content: string): string[] {
    const exports: string[] = [];
    
    for (const pattern of this.exportPatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex state
      
      while ((match = pattern.exec(content)) !== null) {
        if (pattern.source.includes('from')) {
          // Re-export case
          const reexportPath = match[2];
          if (reexportPath) {
            exports.push(`*:${reexportPath}`);
          }
          
          // Named re-export
          const namedExport = match[1];
          if (namedExport && !reexportPath) {
            exports.push(namedExport);
          }
        } else if (pattern.source.includes('{')) {
          // Named exports
          const namedExports = match[1]
            .split(',')
            .map(e => e.trim())
            .filter(e => e.length > 0);
          exports.push(...namedExports);
        } else if (pattern.source.includes('default')) {
          // Default export
          const defaultExport = match[1] || 'default';
          exports.push(`default:${defaultExport}`);
        } else {
          // Regular export
          const exportName = match[1];
          if (exportName) {
            exports.push(exportName);
          }
        }
      }
    }

    return [...new Set(exports)]; // Remove duplicates
  }

  /**
   * Resolves import path relative to the importing file
   */
  private resolveImportPath(importPath: string, fromFile: string): string {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const fromDir = path.dirname(fromFile);
      return path.resolve(fromDir, importPath);
    }
    
    // Handle absolute imports from src
    if (importPath.startsWith('/')) {
      return importPath;
    }
    
    // Handle node_modules or aliased imports
    return importPath;
  }

  /**
   * Finds circular dependencies in the dependency map
   */
  findCircularDependencies(dependencyMap: DependencyMap): string[][] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (file: string, path: string[]): void => {
      if (recursionStack.has(file)) {
        // Found a cycle
        const cycleStart = path.indexOf(file);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), file]);
        }
        return;
      }

      if (visited.has(file)) {
        return;
      }

      visited.add(file);
      recursionStack.add(file);

      const dependencies = dependencyMap[file];
      if (dependencies) {
        for (const importPath of dependencies.imports) {
          // Only check local file dependencies
          if (this.isLocalFile(importPath)) {
            dfs(importPath, [...path, file]);
          }
        }
      }

      recursionStack.delete(file);
    };

    for (const file of Object.keys(dependencyMap)) {
      if (!visited.has(file)) {
        dfs(file, []);
      }
    }

    return cycles;
  }

  /**
   * Finds unused exports in the dependency map
   */
  findUnusedExports(dependencyMap: DependencyMap): Record<string, string[]> {
    const allImports = new Set<string>();
    const unusedExports: Record<string, string[]> = {};

    // Collect all imports
    for (const dependencies of Object.values(dependencyMap)) {
      for (const importPath of dependencies.imports) {
        if (this.isLocalFile(importPath)) {
          allImports.add(importPath);
        }
      }
    }

    // Find exports that are never imported
    for (const [filePath, dependencies] of Object.entries(dependencyMap)) {
      const unused = dependencies.exports.filter(exportName => {
        // Skip default exports and re-exports for now
        if (exportName.startsWith('default:') || exportName.startsWith('*:')) {
          return false;
        }
        
        // Check if this export is imported anywhere
        return !allImports.has(`${filePath}#${exportName}`);
      });

      if (unused.length > 0) {
        unusedExports[filePath] = unused;
      }
    }

    return unusedExports;
  }

  /**
   * Finds files that are never imported (dead code)
   */
  findDeadFiles(dependencyMap: DependencyMap, entryPoints: string[] = []): string[] {
    const importedFiles = new Set<string>();
    
    // Add entry points as always used
    for (const entryPoint of entryPoints) {
      importedFiles.add(entryPoint);
    }

    // Collect all imported files
    for (const dependencies of Object.values(dependencyMap)) {
      for (const importPath of dependencies.imports) {
        if (this.isLocalFile(importPath)) {
          importedFiles.add(importPath);
        }
      }
    }

    // Find files that are never imported
    return Object.keys(dependencyMap).filter(file => !importedFiles.has(file));
  }

  /**
   * Generates dependency graph in DOT format for visualization
   */
  generateDependencyGraph(dependencyMap: DependencyMap, options: {
    includeNodeModules?: boolean;
    maxDepth?: number;
    focusFile?: string;
  } = {}): string {
    const lines = ['digraph Dependencies {'];
    lines.push('  rankdir=LR;');
    lines.push('  node [shape=box];');
    
    const processedFiles = new Set<string>();
    const queue = options.focusFile ? [options.focusFile] : Object.keys(dependencyMap);
    let depth = 0;

    while (queue.length > 0 && (!options.maxDepth || depth < options.maxDepth)) {
      const currentLevelSize = queue.length;
      
      for (let i = 0; i < currentLevelSize; i++) {
        const file = queue.shift()!;
        
        if (processedFiles.has(file)) {
          continue;
        }
        
        processedFiles.add(file);
        const dependencies = dependencyMap[file];
        
        if (!dependencies) {
          continue;
        }

        const fileName = path.basename(file);
        lines.push(`  "${fileName}";`);

        for (const importPath of dependencies.imports) {
          if (!options.includeNodeModules && !this.isLocalFile(importPath)) {
            continue;
          }

          const importFileName = path.basename(importPath);
          lines.push(`  "${fileName}" -> "${importFileName}";`);
          
          if (this.isLocalFile(importPath) && !processedFiles.has(importPath)) {
            queue.push(importPath);
          }
        }
      }
      
      depth++;
    }

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * Checks if an import path refers to a local file
   */
  private isLocalFile(importPath: string): boolean {
    return importPath.startsWith('./') || 
           importPath.startsWith('../') || 
           importPath.startsWith('/') ||
           (!importPath.includes('node_modules') && !this.isNodeModule(importPath));
  }

  /**
   * Checks if an import path refers to a node module
   */
  private isNodeModule(importPath: string): boolean {
    // Common patterns for node modules
    return !importPath.startsWith('.') && 
           !importPath.startsWith('/') &&
           !importPath.includes('\\') &&
           !importPath.includes('/src/') &&
           !importPath.includes('/lib/');
  }

  /**
   * Analyzes dependency complexity metrics
   */
  analyzeDependencyMetrics(dependencyMap: DependencyMap): {
    totalFiles: number;
    totalImports: number;
    totalExports: number;
    averageImportsPerFile: number;
    averageExportsPerFile: number;
    maxImports: { file: string; count: number };
    maxExports: { file: string; count: number };
    circularDependencies: number;
    deadFiles: number;
  } {
    const files = Object.keys(dependencyMap);
    const totalFiles = files.length;
    
    let totalImports = 0;
    let totalExports = 0;
    let maxImports = { file: '', count: 0 };
    let maxExports = { file: '', count: 0 };

    for (const [file, dependencies] of Object.entries(dependencyMap)) {
      const importCount = dependencies.imports.length;
      const exportCount = dependencies.exports.length;
      
      totalImports += importCount;
      totalExports += exportCount;
      
      if (importCount > maxImports.count) {
        maxImports = { file, count: importCount };
      }
      
      if (exportCount > maxExports.count) {
        maxExports = { file, count: exportCount };
      }
    }

    const circularDependencies = this.findCircularDependencies(dependencyMap).length;
    const deadFiles = this.findDeadFiles(dependencyMap).length;

    return {
      totalFiles,
      totalImports,
      totalExports,
      averageImportsPerFile: totalFiles > 0 ? totalImports / totalFiles : 0,
      averageExportsPerFile: totalFiles > 0 ? totalExports / totalFiles : 0,
      maxImports,
      maxExports,
      circularDependencies,
      deadFiles
    };
  }
}