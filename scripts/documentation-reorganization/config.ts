/**
 * Configuration for Documentation Reorganization
 * The Safe Place - Documentation Management System
 */

export interface ReorganizationConfig {
  sourceDirectories: string[];
  targetDirectory: string;
  categoryMappings: Record<DocumentCategory, string>;
  excludePatterns: string[];
  backupEnabled: boolean;
  dryRun: boolean;
}

export type DocumentCategory = 
  | 'api'
  | 'changelog' 
  | 'anti-regressione'
  | 'consolidamento'
  | 'root-docs'
  | 'roadmap'
  | 'analisi'
  | 'unknown';

export const DEFAULT_CONFIG: ReorganizationConfig = {
  sourceDirectories: ['.', 'docs'],
  targetDirectory: 'documentazione',
  categoryMappings: {
    'api': 'api',
    'changelog': 'changelog',
    'anti-regressione': 'anti-regressione',
    'consolidamento': 'consolidamento',
    'root-docs': 'root-docs',
    'roadmap': 'roadmap',
    'analisi': 'analisi',
    'unknown': 'root-docs'
  },
  excludePatterns: [
    'node_modules/**',
    '.git/**',
    '.kiro/**',
    'analisi-microscopica/**',
    '*.log',
    '*.tmp',
    'README.md', // Keep in root
    'package*.json',
    'tsconfig*.json',
    'vite*.config.ts',
    'tailwind*.config.js',
    'eslint.config.js',
    'jest.config.js',
    'postcss.config.js',
    '*.html',
    '*.txt',
    '*.ts' // Exclude TypeScript files
  ],
  backupEnabled: true,
  dryRun: false
};

export interface DocumentFile {
  path: string;
  name: string;
  content: string;
  size: number;
  lastModified: Date;
  category: DocumentCategory;
}

export interface MigrationOperation {
  type: 'move' | 'copy' | 'delete' | 'update';
  source: string;
  destination?: string;
  category: DocumentCategory;
}

export interface MigrationPlan {
  operations: MigrationOperation[];
  referencesToUpdate: ReferenceUpdate[];
  directoriesToCreate: string[];
  summary: {
    totalFiles: number;
    filesByCategory: Record<DocumentCategory, number>;
    estimatedDuration: number;
  };
}

export interface ReferenceUpdate {
  filePath: string;
  oldReference: string;
  newReference: string;
  lineNumber: number;
}

export interface MigrationResult {
  success: boolean;
  timestamp: Date;
  operations: CompletedOperation[];
  errors: MigrationError[];
  warnings: string[];
  duration: number;
}

export interface CompletedOperation {
  type: 'move' | 'copy' | 'delete' | 'update';
  source: string;
  destination?: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface MigrationError {
  type: 'file-system' | 'content' | 'validation';
  message: string;
  file?: string;
  operation?: MigrationOperation;
  recoverable: boolean;
}

export interface BackupInfo {
  id: string;
  timestamp: Date;
  files: string[];
  size: number;
  path: string;
}

// File categorization rules
export const CATEGORIZATION_RULES = {
  changelog: /^CHANGELOG-.*\.md$/i,
  antiRegressione: /^ANTI-REGRESSIONE-.*\.md$/i,
  consolidamento: /^CONSOLIDAMENTO-.*\.md$/i,
  roadmap: /^ROADMAP-.*\.md$/i,
  analisi: /^ANALISI-.*\.md$/i,
  api: /^(api-|crafting-|system-).*\.md$/i
};

// Directories to create in target structure
export const TARGET_DIRECTORIES = [
  'documentazione/api',
  'documentazione/root-docs'
];