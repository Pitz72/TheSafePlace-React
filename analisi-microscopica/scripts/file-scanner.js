#!/usr/bin/env node

/**
 * File Scanner per Analisi Microscopica TSP
 * Scansiona ricorsivamente il progetto e cataloga tutti i file
 */

const fs = require('fs');
const path = require('path');

class FileScanner {
  constructor(baseDir = '.', excludeDirs = ['node_modules', '.git', 'dist', 'build']) {
    this.baseDir = baseDir;
    this.excludeDirs = excludeDirs;
    this.results = {
      totalFiles: 0,
      totalSize: 0,
      filesByType: {},
      filesByDirectory: {},
      largestFiles: [],
      oldestFiles: [],
      newestFiles: [],
      orphanedFiles: [],
      detailedInventory: []
    };
  }

  scan() {
    console.log(`🔍 Scanning project from: ${this.baseDir}`);
    this.scanDirectory(this.baseDir);
    this.analyzeResults();
    return this.results;
  }

  scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(this.baseDir, fullPath);
        
        // Skip excluded directories
        if (this.excludeDirs.some(excluded => relativePath.includes(excluded))) {
          continue;
        }

        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          this.scanDirectory(fullPath);
        } else if (stats.isFile()) {
          this.processFile(fullPath, relativePath, stats);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Cannot read directory: ${dir} - ${error.message}`);
    }
  }

  processFile(fullPath, relativePath, stats) {
    const ext = path.extname(relativePath).toLowerCase();
    const dir = path.dirname(relativePath);
    
    // Count by type
    this.results.filesByType[ext] = (this.results.filesByType[ext] || 0) + 1;
    
    // Count by directory
    this.results.filesByDirectory[dir] = (this.results.filesByDirectory[dir] || 0) + 1;
    
    // Calculate lines of code for text files
    let linesOfCode = 0;
    if (this.isTextFile(ext)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        linesOfCode = content.split('\n').length;
      } catch (error) {
        console.warn(`⚠️  Cannot read file: ${relativePath}`);
      }
    }

    const fileInfo = {
      path: relativePath,
      fullPath: fullPath,
      extension: ext,
      directory: dir,
      size: stats.size,
      linesOfCode: linesOfCode,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime
    };

    this.results.detailedInventory.push(fileInfo);
    this.results.totalFiles++;
    this.results.totalSize += stats.size;
  }

  isTextFile(ext) {
    const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.css', '.scss', '.html', '.xml', '.yml', '.yaml'];
    return textExtensions.includes(ext);
  }

  analyzeResults() {
    // Sort files by size (largest first)
    this.results.largestFiles = [...this.results.detailedInventory]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    // Sort files by date (oldest first)
    this.results.oldestFiles = [...this.results.detailedInventory]
      .sort((a, b) => a.modified - b.modified)
      .slice(0, 10);

    // Sort files by date (newest first)
    this.results.newestFiles = [...this.results.detailedInventory]
      .sort((a, b) => b.modified - a.modified)
      .slice(0, 10);

    // Identify potentially orphaned files
    this.identifyOrphanedFiles();
  }

  identifyOrphanedFiles() {
    // Simple heuristic: files that haven't been modified in a long time
    // and are not in common directories
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    this.results.orphanedFiles = this.results.detailedInventory.filter(file => {
      return file.modified < sixMonthsAgo && 
             !file.directory.includes('node_modules') &&
             !file.directory.includes('documentazione') &&
             file.extension !== '.md';
    });
  }

  generateReport() {
    const report = {
      summary: {
        totalFiles: this.results.totalFiles,
        totalSizeMB: (this.results.totalSize / (1024 * 1024)).toFixed(2),
        fileTypes: Object.keys(this.results.filesByType).length,
        directories: Object.keys(this.results.filesByDirectory).length
      },
      filesByType: this.results.filesByType,
      filesByDirectory: this.results.filesByDirectory,
      largestFiles: this.results.largestFiles.map(f => ({
        path: f.path,
        sizeMB: (f.size / (1024 * 1024)).toFixed(2),
        linesOfCode: f.linesOfCode
      })),
      oldestFiles: this.results.oldestFiles.map(f => ({
        path: f.path,
        modified: f.modified.toISOString().split('T')[0]
      })),
      newestFiles: this.results.newestFiles.map(f => ({
        path: f.path,
        modified: f.modified.toISOString().split('T')[0]
      })),
      potentialOrphans: this.results.orphanedFiles.map(f => ({
        path: f.path,
        lastModified: f.modified.toISOString().split('T')[0],
        sizeMB: (f.size / (1024 * 1024)).toFixed(2)
      }))
    };

    return report;
  }

  saveReport(outputPath) {
    const report = this.generateReport();
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved to: ${outputPath}`);
    return report;
  }
}

// Se eseguito direttamente
if (require.main === module) {
  const scanner = new FileScanner();
  const results = scanner.scan();
  const report = scanner.saveReport('analisi-microscopica/01-inventario/file-inventory.json');
  
  console.log('\n📈 SCAN SUMMARY:');
  console.log(`Total Files: ${report.summary.totalFiles}`);
  console.log(`Total Size: ${report.summary.totalSizeMB} MB`);
  console.log(`File Types: ${report.summary.fileTypes}`);
  console.log(`Directories: ${report.summary.directories}`);
  console.log(`Potential Orphans: ${report.potentialOrphans.length}`);
}

module.exports = FileScanner;