#!/usr/bin/env node

/**
 * Dependency Analyzer per Analisi Microscopica TSP
 * Analizza le dipendenze TypeScript e crea il grafo delle dipendenze
 */

import fs from 'fs';
import path from 'path';

class DependencyAnalyzer {
  constructor(baseDir = '.', includePatterns = ['src/**/*.ts', 'src/**/*.tsx']) {
    this.baseDir = baseDir;
    this.includePatterns = includePatterns;
    this.dependencies = new Map();
    this.reverseDependencies = new Map();
    this.circularDependencies = [];
    this.metrics = {
      totalFiles: 0,
      totalDependencies: 0,
      averageDependencies: 0,
      maxDependencies: 0,
      maxDependentsFile: '',
      circularCount: 0
    };
  }

  analyze() {
    console.log('🔗 Analyzing dependencies...');
    this.scanForTypeScriptFiles();
    this.buildDependencyGraph();
    this.findCircularDependencies();
    this.calculateMetrics();
    return this.generateReport();
  }

  scanForTypeScriptFiles() {
    this.tsFiles = [];
    this.scanDirectory(this.baseDir);
    console.log(`Found ${this.tsFiles.length} TypeScript files`);
  }

  scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(this.baseDir, fullPath);
        
        // Skip node_modules and other excluded directories
        if (relativePath.includes('node_modules') || 
            relativePath.includes('.git') ||
            relativePath.includes('dist') ||
            relativePath.includes('build')) {
          continue;
        }

        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          this.scanDirectory(fullPath);
        } else if (stats.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
          this.tsFiles.push({
            fullPath: fullPath,
            relativePath: relativePath
          });
        }
      }
    } catch (error) {
      console.warn(`Cannot read directory: ${dir}`);
    }
  }

  buildDependencyGraph() {
    for (const file of this.tsFiles) {
      const deps = this.extractDependencies(file.fullPath);
      this.dependencies.set(file.relativePath, deps);
      
      // Build reverse dependencies
      for (const dep of deps) {
        if (!this.reverseDependencies.has(dep)) {
          this.reverseDependencies.set(dep, []);
        }
        this.reverseDependencies.get(dep).push(file.relativePath);
      }
    }
  }

  extractDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dependencies = [];
      
      // Match import statements
      const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Only include relative imports (project files)
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          const resolvedPath = this.resolveImportPath(filePath, importPath);
          if (resolvedPath) {
            dependencies.push(resolvedPath);
          }
        }
      }
      
      return dependencies;
    } catch (error) {
      console.warn(`Cannot read file: ${filePath}`);
      return [];
    }
  }

  resolveImportPath(fromFile, importPath) {
    try {
      const fromDir = path.dirname(fromFile);
      let resolvedPath = path.resolve(fromDir, importPath);
      
      // Try different extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx'];
      for (const ext of extensions) {
        const withExt = resolvedPath + ext;
        if (fs.existsSync(withExt)) {
          return path.relative(this.baseDir, withExt);
        }
      }
      
      // Try index files
      for (const ext of extensions) {
        const indexPath = path.join(resolvedPath, 'index' + ext);
        if (fs.existsSync(indexPath)) {
          return path.relative(this.baseDir, indexPath);
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  findCircularDependencies() {
    const visited = new Set();
    const recursionStack = new Set();
    
    for (const file of this.dependencies.keys()) {
      if (!visited.has(file)) {
        this.dfsCircular(file, visited, recursionStack, []);
      }
    }
  }

  dfsCircular(file, visited, recursionStack, path) {
    visited.add(file);
    recursionStack.add(file);
    path.push(file);
    
    const deps = this.dependencies.get(file) || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        this.dfsCircular(dep, visited, recursionStack, [...path]);
      } else if (recursionStack.has(dep)) {
        // Found circular dependency
        const cycleStart = path.indexOf(dep);
        const cycle = path.slice(cycleStart).concat([dep]);
        this.circularDependencies.push(cycle);
      }
    }
    
    recursionStack.delete(file);
  }

  calculateMetrics() {
    this.metrics.totalFiles = this.dependencies.size;
    this.metrics.totalDependencies = Array.from(this.dependencies.values())
      .reduce((sum, deps) => sum + deps.length, 0);
    this.metrics.averageDependencies = this.metrics.totalDependencies / this.metrics.totalFiles;
    
    let maxDeps = 0;
    let maxDepsFile = '';
    for (const [file, deps] of this.dependencies.entries()) {
      if (deps.length > maxDeps) {
        maxDeps = deps.length;
        maxDepsFile = file;
      }
    }
    this.metrics.maxDependencies = maxDeps;
    this.metrics.maxDependentsFile = maxDepsFile;
    this.metrics.circularCount = this.circularDependencies.length;
  }

  generateReport() {
    // Find files with highest fan-in (most depended upon)
    const fanIn = Array.from(this.reverseDependencies.entries())
      .map(([file, dependents]) => ({ file, count: dependents.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Find files with highest fan-out (depend on most others)
    const fanOut = Array.from(this.dependencies.entries())
      .map(([file, deps]) => ({ file, count: deps.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      metrics: this.metrics,
      highestFanIn: fanIn,
      highestFanOut: fanOut,
      circularDependencies: this.circularDependencies,
      dependencyGraph: Object.fromEntries(this.dependencies),
      reverseDependencyGraph: Object.fromEntries(this.reverseDependencies)
    };
  }

  saveReport(outputPath) {
    const report = this.generateReport();
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📊 Dependency report saved to: ${outputPath}`);
    return report;
  }
}

// Se eseguito direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new DependencyAnalyzer();
  const report = analyzer.analyze();
  analyzer.saveReport('analisi-microscopica/03-dipendenze/dependency-analysis.json');
  
  console.log('\n📈 DEPENDENCY ANALYSIS SUMMARY:');
  console.log(`Total Files: ${report.metrics.totalFiles}`);
  console.log(`Total Dependencies: ${report.metrics.totalDependencies}`);
  console.log(`Average Dependencies per File: ${report.metrics.averageDependencies.toFixed(2)}`);
  console.log(`Max Dependencies: ${report.metrics.maxDependencies} (${report.metrics.maxDependentsFile})`);
  console.log(`Circular Dependencies: ${report.metrics.circularCount}`);
}

export default DependencyAnalyzer;