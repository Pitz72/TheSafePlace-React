import { 
  ProjectStructure, 
  FileInfo, 
  StructureComparison, 
  DependencyChange, 
  StatisticsComparison,
  DirectoryNode 
} from '../interfaces/ProjectStructure';

/**
 * Utility class for comparing project structures
 */
export class StructureComparator {
  /**
   * Compares two project structures and returns detailed differences
   */
  compareStructures(oldStructure: ProjectStructure, newStructure: ProjectStructure): StructureComparison {
    const addedFiles = this.findAddedFiles(oldStructure.fileList, newStructure.fileList);
    const removedFiles = this.findRemovedFiles(oldStructure.fileList, newStructure.fileList);
    const modifiedFiles = this.findModifiedFiles(oldStructure.fileList, newStructure.fileList);
    
    const oldDirectories = this.extractDirectoryPaths(oldStructure.directoryTree);
    const newDirectories = this.extractDirectoryPaths(newStructure.directoryTree);
    const addedDirectories = newDirectories.filter(dir => !oldDirectories.includes(dir));
    const removedDirectories = oldDirectories.filter(dir => !newDirectories.includes(dir));
    
    const dependencyChanges = this.findDependencyChanges(
      oldStructure.dependencyMap, 
      newStructure.dependencyMap
    );
    
    const statisticsComparison = this.compareStatistics(
      oldStructure.statistics, 
      newStructure.statistics
    );

    return {
      addedFiles,
      removedFiles,
      modifiedFiles,
      addedDirectories,
      removedDirectories,
      dependencyChanges,
      statisticsComparison
    };
  }

  /**
   * Finds files that were added between two structures
   */
  private findAddedFiles(oldFiles: FileInfo[], newFiles: FileInfo[]): FileInfo[] {
    const oldPaths = new Set(oldFiles.map(f => f.path));
    return newFiles.filter(file => !oldPaths.has(file.path));
  }

  /**
   * Finds files that were removed between two structures
   */
  private findRemovedFiles(oldFiles: FileInfo[], newFiles: FileInfo[]): FileInfo[] {
    const newPaths = new Set(newFiles.map(f => f.path));
    return oldFiles.filter(file => !newPaths.has(file.path));
  }

  /**
   * Finds files that were modified between two structures
   */
  private findModifiedFiles(oldFiles: FileInfo[], newFiles: FileInfo[]): FileInfo[] {
    const oldFileMap = new Map(oldFiles.map(f => [f.path, f]));
    const modifiedFiles: FileInfo[] = [];

    for (const newFile of newFiles) {
      const oldFile = oldFileMap.get(newFile.path);
      if (oldFile && this.isFileModified(oldFile, newFile)) {
        modifiedFiles.push(newFile);
      }
    }

    return modifiedFiles;
  }

  /**
   * Checks if a file has been modified based on size and modification time
   */
  private isFileModified(oldFile: FileInfo, newFile: FileInfo): boolean {
    return oldFile.size !== newFile.size || 
           oldFile.lastModified.getTime() !== newFile.lastModified.getTime();
  }

  /**
   * Extracts all directory paths from a directory tree
   */
  private extractDirectoryPaths(directoryTree: DirectoryNode): string[] {
    const paths: string[] = [];
    
    const traverse = (node: DirectoryNode | FileInfo, currentPath: string = '') => {
      if (node.type === 'directory') {
        const dirNode = node as DirectoryNode;
        const fullPath = currentPath ? `${currentPath}/${dirNode.name}` : dirNode.name;
        paths.push(fullPath);
        
        dirNode.children.forEach(child => {
          if (child.type === 'directory') {
            traverse(child, fullPath);
          }
        });
      }
    };
    
    traverse(directoryTree);
    return paths;
  }

  /**
   * Finds changes in file dependencies between two structures
   */
  private findDependencyChanges(
    oldDependencies: Record<string, { imports: string[], exports: string[] }>,
    newDependencies: Record<string, { imports: string[], exports: string[] }>
  ): DependencyChange[] {
    const changes: DependencyChange[] = [];
    const allFiles = new Set([...Object.keys(oldDependencies), ...Object.keys(newDependencies)]);

    for (const filePath of allFiles) {
      const oldDeps = oldDependencies[filePath] || { imports: [], exports: [] };
      const newDeps = newDependencies[filePath] || { imports: [], exports: [] };

      const addedImports = newDeps.imports.filter(imp => !oldDeps.imports.includes(imp));
      const removedImports = oldDeps.imports.filter(imp => !newDeps.imports.includes(imp));
      const addedExports = newDeps.exports.filter(exp => !oldDeps.exports.includes(exp));
      const removedExports = oldDeps.exports.filter(exp => !newDeps.exports.includes(exp));

      if (addedImports.length > 0 || removedImports.length > 0 || 
          addedExports.length > 0 || removedExports.length > 0) {
        changes.push({
          filePath,
          addedImports,
          removedImports,
          addedExports,
          removedExports
        });
      }
    }

    return changes;
  }

  /**
   * Compares statistics between two project structures
   */
  private compareStatistics(
    oldStats: { totalFiles: number, totalSize: number, fileTypeDistribution: Record<string, number> },
    newStats: { totalFiles: number, totalSize: number, fileTypeDistribution: Record<string, number> }
  ): StatisticsComparison {
    const fileCountChange = newStats.totalFiles - oldStats.totalFiles;
    const sizeChange = newStats.totalSize - oldStats.totalSize;
    
    const fileTypeChanges: Record<string, number> = {};
    const allFileTypes = new Set([
      ...Object.keys(oldStats.fileTypeDistribution),
      ...Object.keys(newStats.fileTypeDistribution)
    ]);

    for (const fileType of allFileTypes) {
      const oldCount = oldStats.fileTypeDistribution[fileType] || 0;
      const newCount = newStats.fileTypeDistribution[fileType] || 0;
      const change = newCount - oldCount;
      
      if (change !== 0) {
        fileTypeChanges[fileType] = change;
      }
    }

    return {
      fileCountChange,
      sizeChange,
      fileTypeChanges
    };
  }

  /**
   * Generates a summary report of structure changes
   */
  generateComparisonSummary(comparison: StructureComparison): string {
    const lines: string[] = [];
    
    lines.push('# Project Structure Comparison Summary');
    lines.push('');
    
    // File changes
    lines.push('## File Changes');
    lines.push(`- Added files: ${comparison.addedFiles.length}`);
    lines.push(`- Removed files: ${comparison.removedFiles.length}`);
    lines.push(`- Modified files: ${comparison.modifiedFiles.length}`);
    lines.push('');
    
    // Directory changes
    lines.push('## Directory Changes');
    lines.push(`- Added directories: ${comparison.addedDirectories.length}`);
    lines.push(`- Removed directories: ${comparison.removedDirectories.length}`);
    lines.push('');
    
    // Statistics
    lines.push('## Statistics');
    lines.push(`- File count change: ${comparison.statisticsComparison.fileCountChange > 0 ? '+' : ''}${comparison.statisticsComparison.fileCountChange}`);
    lines.push(`- Size change: ${comparison.statisticsComparison.sizeChange > 0 ? '+' : ''}${this.formatBytes(comparison.statisticsComparison.sizeChange)}`);
    lines.push('');
    
    // Dependency changes
    lines.push('## Dependency Changes');
    lines.push(`- Files with dependency changes: ${comparison.dependencyChanges.length}`);
    
    if (comparison.dependencyChanges.length > 0) {
      lines.push('');
      lines.push('### Files with Changes:');
      comparison.dependencyChanges.forEach(change => {
        lines.push(`- ${change.filePath}`);
        if (change.addedImports.length > 0) {
          lines.push(`  - Added imports: ${change.addedImports.join(', ')}`);
        }
        if (change.removedImports.length > 0) {
          lines.push(`  - Removed imports: ${change.removedImports.join(', ')}`);
        }
        if (change.addedExports.length > 0) {
          lines.push(`  - Added exports: ${change.addedExports.join(', ')}`);
        }
        if (change.removedExports.length > 0) {
          lines.push(`  - Removed exports: ${change.removedExports.join(', ')}`);
        }
      });
    }
    
    return lines.join('\n');
  }

  /**
   * Formats bytes into human-readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    
    const value = bytes / Math.pow(k, i);
    const sign = bytes < 0 ? '-' : '';
    
    return `${sign}${parseFloat(value.toFixed(2))} ${sizes[i]}`;
  }
}