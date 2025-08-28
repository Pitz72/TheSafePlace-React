#!/usr/bin/env node

/**
 * Analisi Manuale Dipendenze TypeScript
 * Scansiona tutti i file .ts/.tsx e estrae import/export
 */

import fs from 'fs';
import path from 'path';

class ManualDependencyAnalyzer {
  constructor() {
    this.dependencies = new Map();
    this.exports = new Map();
    this.files = [];
    this.results = {
      totalFiles: 0,
      totalImports: 0,
      totalExports: 0,
      circularDependencies: [],
      highCouplingFiles: [],
      dependencyGraph: {},
      exportGraph: {}
    };
  }

  async analyze() {
    console.log('🔍 Starting manual dependency analysis...');
    
    // Scansiona tutti i file TypeScript
    this.scanDirectory('src');
    
    console.log(`📁 Found ${this.files.length} TypeScript files`);
    
    // Analizza ogni file
    for (const file of this.files) {
      this.analyzeFile(file);
    }
    
    // Calcola metriche
    this.calculateMetrics();
    
    // Salva risultati
    this.saveResults();
    
    return this.results;
  }

  scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Skip node_modules e altre directory non necessarie
          if (!item.includes('node_modules') && !item.includes('.git')) {
            this.scanDirectory(fullPath);
          }
        } else if (stats.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          this.files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Cannot read directory: ${dir}`);
    }
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative('.', filePath);
      
      // Estrai import
      const imports = this.extractImports(content, filePath);
      this.dependencies.set(relativePath, imports);
      
      // Estrai export
      const exports = this.extractExports(content);
      this.exports.set(relativePath, exports);
      
      this.results.totalImports += imports.length;
      this.results.totalExports += exports.length;
      
    } catch (error) {
      console.warn(`⚠️  Cannot analyze file: ${filePath}`);
    }
  }

  extractImports(content, filePath) {
    const imports = [];
    
    // Pattern per import statements
    const importPatterns = [
      // import { something } from './path'
      /import\s*\{[^}]*\}\s*from\s*['"]([^'"]+)['"]/g,
      // import something from './path'
      /import\s+\w+\s+from\s*['"]([^'"]+)['"]/g,
      // import * as something from './path'
      /import\s*\*\s*as\s*\w+\s*from\s*['"]([^'"]+)['"]/g,
      // import './path'
      /import\s*['"]([^'"]+)['"]/g
    ];
    
    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        
        // Solo import relativi (file del progetto)
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          const resolvedPath = this.resolveImportPath(filePath, importPath);
          if (resolvedPath) {
            imports.push({
              from: importPath,
              resolved: resolvedPath,
              type: this.getImportType(match[0])
            });
          }
        }
      }
    }
    
    return imports;
  }

  extractExports(content) {
    const exports = [];
    
    // Pattern per export statements
    const exportPatterns = [
      // export { something }
      /export\s*\{[^}]*\}/g,
      // export default
      /export\s+default\s+/g,
      // export const/function/class
      /export\s+(const|function|class|interface|type)\s+(\w+)/g
    ];
    
    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        exports.push({
          statement: match[0],
          type: this.getExportType(match[0]),
          name: match[2] || 'default'
        });
      }
    }
    
    return exports;
  }

  resolveImportPath(fromFile, importPath) {
    try {
      const fromDir = path.dirname(fromFile);
      let resolvedPath = path.resolve(fromDir, importPath);
      
      // Prova diverse estensioni
      const extensions = ['.ts', '.tsx', '.js', '.jsx'];
      for (const ext of extensions) {
        const withExt = resolvedPath + ext;
        if (fs.existsSync(withExt)) {
          return path.relative('.', withExt);
        }
      }
      
      // Prova file index
      for (const ext of extensions) {
        const indexPath = path.join(resolvedPath, 'index' + ext);
        if (fs.existsSync(indexPath)) {
          return path.relative('.', indexPath);
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  getImportType(statement) {
    if (statement.includes('* as')) return 'namespace';
    if (statement.includes('{')) return 'named';
    if (statement.includes('from')) return 'default';
    return 'side-effect';
  }

  getExportType(statement) {
    if (statement.includes('default')) return 'default';
    if (statement.includes('const')) return 'const';
    if (statement.includes('function')) return 'function';
    if (statement.includes('class')) return 'class';
    if (statement.includes('interface')) return 'interface';
    if (statement.includes('type')) return 'type';
    return 'named';
  }

  calculateMetrics() {
    this.results.totalFiles = this.files.length;
    
    // Trova file con alto accoppiamento (molte dipendenze)
    for (const [file, deps] of this.dependencies.entries()) {
      if (deps.length > 10) {
        this.results.highCouplingFiles.push({
          file: file,
          dependencies: deps.length
        });
      }
    }
    
    // Ordina per numero di dipendenze
    this.results.highCouplingFiles.sort((a, b) => b.dependencies - a.dependencies);
    
    // Crea grafo dipendenze
    this.results.dependencyGraph = Object.fromEntries(
      Array.from(this.dependencies.entries()).map(([file, deps]) => [
        file,
        deps.map(d => d.resolved).filter(Boolean)
      ])
    );
    
    // Crea grafo export
    this.results.exportGraph = Object.fromEntries(this.exports);
  }

  saveResults() {
    const outputPath = 'analisi-microscopica/03-dipendenze/dependency-analysis-manual.json';
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`📊 Results saved to: ${outputPath}`);
  }

  printSummary() {
    console.log('\n📈 DEPENDENCY ANALYSIS SUMMARY:');
    console.log(`Total Files: ${this.results.totalFiles}`);
    console.log(`Total Imports: ${this.results.totalImports}`);
    console.log(`Total Exports: ${this.results.totalExports}`);
    console.log(`High Coupling Files: ${this.results.highCouplingFiles.length}`);
    
    if (this.results.highCouplingFiles.length > 0) {
      console.log('\n🔗 Files with highest coupling:');
      this.results.highCouplingFiles.slice(0, 5).forEach(file => {
        console.log(`  ${file.file}: ${file.dependencies} dependencies`);
      });
    }
  }
}

// Esegui analisi
const analyzer = new ManualDependencyAnalyzer();
analyzer.analyze().then(() => {
  analyzer.printSummary();
}).catch(error => {
  console.error('❌ Analysis failed:', error);
});