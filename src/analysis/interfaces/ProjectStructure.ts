/**
 * Represents a file in the project structure
 */
export interface FileInfo {
  name: string;
  path: string;
  type: 'file';
  extension: string;
  fileType: string;
  size: number;
  lastModified: Date;
}

/**
 * Represents a directory node in the project structure
 */
export interface DirectoryNode {
  name: string;
  path: string;
  type: 'directory';
  children: (DirectoryNode | FileInfo)[];
  size: number;
  lastModified: Date;
}

/**
 * Represents import/export dependencies for a file
 */
export interface FileDependencies {
  imports: string[];
  exports: string[];
}

/**
 * Maps file paths to their dependencies
 */
export interface DependencyMap {
  [filePath: string]: FileDependencies;
}

/**
 * Complete project structure analysis result
 */
export interface ProjectStructure {
  rootPath: string;
  directoryTree: DirectoryNode;
  fileList: FileInfo[];
  dependencyMap: DependencyMap;
  statistics: ProjectStatistics;
  scannedAt: Date;
}

/**
 * Statistical information about the project
 */
export interface ProjectStatistics {
  totalFiles: number;
  totalSize: number;
  fileTypeDistribution: Record<string, number>;
  largestFiles: FileInfo[];
}

/**
 * Comparison result between two project structures
 */
export interface StructureComparison {
  addedFiles: FileInfo[];
  removedFiles: FileInfo[];
  modifiedFiles: FileInfo[];
  addedDirectories: string[];
  removedDirectories: string[];
  dependencyChanges: DependencyChange[];
  statisticsComparison: StatisticsComparison;
}

/**
 * Represents a change in file dependencies
 */
export interface DependencyChange {
  filePath: string;
  addedImports: string[];
  removedImports: string[];
  addedExports: string[];
  removedExports: string[];
}

/**
 * Comparison of project statistics
 */
export interface StatisticsComparison {
  fileCountChange: number;
  sizeChange: number;
  fileTypeChanges: Record<string, number>;
}

/**
 * Configuration for structure analysis
 */
export interface StructureAnalysisConfig {
  excludePatterns?: RegExp[];
  includeHiddenFiles?: boolean;
  maxDepth?: number;
  analyzeDependencies?: boolean;
  fileTypeMapping?: Record<string, string>;
}