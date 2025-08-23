import { describe, it, expect } from 'vitest';
import { StructureComparator } from '../utils/StructureComparator';
import { ProjectStructure, FileInfo, DirectoryNode } from '../interfaces/ProjectStructure';

describe('StructureComparator', () => {
  let comparator: StructureComparator;

  beforeEach(() => {
    comparator = new StructureComparator();
  });

  const createMockFile = (name: string, path: string, size: number = 1000): FileInfo => ({
    name,
    path,
    type: 'file',
    extension: name.includes('.') ? '.' + name.split('.').pop()! : '',
    fileType: 'typescript',
    size,
    lastModified: new Date('2024-01-01')
  });

  const createMockDirectory = (name: string, path: string, children: (DirectoryNode | FileInfo)[] = []): DirectoryNode => ({
    name,
    path,
    type: 'directory',
    children,
    size: children.reduce((sum, child) => sum + child.size, 0),
    lastModified: new Date('2024-01-01')
  });

  const createMockStructure = (files: FileInfo[], directoryTree: DirectoryNode): ProjectStructure => ({
    rootPath: '/test',
    directoryTree,
    fileList: files,
    dependencyMap: {},
    statistics: {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      fileTypeDistribution: { typescript: files.length },
      largestFiles: files
    },
    scannedAt: new Date('2024-01-01')
  });

  describe('compareStructures', () => {
    it('should detect added files', () => {
      const oldFiles = [
        createMockFile('index.ts', 'src/index.ts')
      ];
      const newFiles = [
        createMockFile('index.ts', 'src/index.ts'),
        createMockFile('App.tsx', 'src/App.tsx')
      ];

      const oldStructure = createMockStructure(oldFiles, createMockDirectory('root', '.'));
      const newStructure = createMockStructure(newFiles, createMockDirectory('root', '.'));

      const comparison = comparator.compareStructures(oldStructure, newStructure);

      expect(comparison.addedFiles).toHaveLength(1);
      expect(comparison.addedFiles[0].name).toBe('App.tsx');
      expect(comparison.removedFiles).toHaveLength(0);
    });

    it('should detect removed files', () => {
      const oldFiles = [
        createMockFile('index.ts', 'src/index.ts'),
        createMockFile('App.tsx', 'src/App.tsx')
      ];
      const newFiles = [
        createMockFile('index.ts', 'src/index.ts')
      ];

      const oldStructure = createMockStructure(oldFiles, createMockDirectory('root', '.'));
      const newStructure = createMockStructure(newFiles, createMockDirectory('root', '.'));

      const comparison = comparator.compareStructures(oldStructure, newStructure);

      expect(comparison.removedFiles).toHaveLength(1);
      expect(comparison.removedFiles[0].name).toBe('App.tsx');
      expect(comparison.addedFiles).toHaveLength(0);
    });

    it('should detect modified files', () => {
      const oldFiles = [
        createMockFile('index.ts', 'src/index.ts', 1000)
      ];
      const newFiles = [
        createMockFile('index.ts', 'src/index.ts', 1500) // Different size
      ];

      const oldStructure = createMockStructure(oldFiles, createMockDirectory('root', '.'));
      const newStructure = createMockStructure(newFiles, createMockDirectory('root', '.'));

      const comparison = comparator.compareStructures(oldStructure, newStructure);

      expect(comparison.modifiedFiles).toHaveLength(1);
      expect(comparison.modifiedFiles[0].name).toBe('index.ts');
      expect(comparison.modifiedFiles[0].size).toBe(1500);
    });

    it('should detect added and removed directories', () => {
      const oldDirectoryTree = createMockDirectory('root', '.', [
        createMockDirectory('src', 'src'),
        createMockDirectory('lib', 'lib')
      ]);
      
      const newDirectoryTree = createMockDirectory('root', '.', [
        createMockDirectory('src', 'src'),
        createMockDirectory('dist', 'dist')
      ]);

      const oldStructure = createMockStructure([], oldDirectoryTree);
      const newStructure = createMockStructure([], newDirectoryTree);

      const comparison = comparator.compareStructures(oldStructure, newStructure);

      expect(comparison.addedDirectories).toContain('dist');
      expect(comparison.removedDirectories).toContain('lib');
    });

    it('should detect dependency changes', () => {
      const oldStructure = createMockStructure([], createMockDirectory('root', '.'));
      oldStructure.dependencyMap = {
        'src/index.ts': {
          imports: ['react', './utils'],
          exports: ['App']
        }
      };

      const newStructure = createMockStructure([], createMockDirectory('root', '.'));
      newStructure.dependencyMap = {
        'src/index.ts': {
          imports: ['react', './components'], // Changed import
          exports: ['App', 'utils'] // Added export
        }
      };

      const comparison = comparator.compareStructures(oldStructure, newStructure);

      expect(comparison.dependencyChanges).toHaveLength(1);
      expect(comparison.dependencyChanges[0]).toMatchObject({
        filePath: 'src/index.ts',
        addedImports: ['./components'],
        removedImports: ['./utils'],
        addedExports: ['utils'],
        removedExports: []
      });
    });

    it('should calculate statistics comparison', () => {
      const oldStructure = createMockStructure(
        [createMockFile('index.ts', 'src/index.ts', 1000)],
        createMockDirectory('root', '.')
      );
      
      const newStructure = createMockStructure(
        [
          createMockFile('index.ts', 'src/index.ts', 1000),
          createMockFile('App.tsx', 'src/App.tsx', 500)
        ],
        createMockDirectory('root', '.')
      );

      const comparison = comparator.compareStructures(oldStructure, newStructure);

      expect(comparison.statisticsComparison).toMatchObject({
        fileCountChange: 1,
        sizeChange: 500,
        fileTypeChanges: {
          typescript: 1
        }
      });
    });
  });

  describe('generateComparisonSummary', () => {
    it('should generate a readable summary', () => {
      const comparison = {
        addedFiles: [createMockFile('new.ts', 'src/new.ts')],
        removedFiles: [createMockFile('old.ts', 'src/old.ts')],
        modifiedFiles: [createMockFile('changed.ts', 'src/changed.ts')],
        addedDirectories: ['dist'],
        removedDirectories: ['lib'],
        dependencyChanges: [{
          filePath: 'src/index.ts',
          addedImports: ['./new-module'],
          removedImports: ['./old-module'],
          addedExports: ['newFunction'],
          removedExports: ['oldFunction']
        }],
        statisticsComparison: {
          fileCountChange: 0,
          sizeChange: 1024,
          fileTypeChanges: { typescript: 1 }
        }
      };

      const summary = comparator.generateComparisonSummary(comparison);

      expect(summary).toContain('# Project Structure Comparison Summary');
      expect(summary).toContain('Added files: 1');
      expect(summary).toContain('Removed files: 1');
      expect(summary).toContain('Modified files: 1');
      expect(summary).toContain('Added directories: 1');
      expect(summary).toContain('Removed directories: 1');
      expect(summary).toContain('Size change: +1.00 KB');
      expect(summary).toContain('Files with dependency changes: 1');
      expect(summary).toContain('src/index.ts');
      expect(summary).toContain('Added imports: ./new-module');
      expect(summary).toContain('Removed imports: ./old-module');
    });

    it('should handle empty comparison', () => {
      const comparison = {
        addedFiles: [],
        removedFiles: [],
        modifiedFiles: [],
        addedDirectories: [],
        removedDirectories: [],
        dependencyChanges: [],
        statisticsComparison: {
          fileCountChange: 0,
          sizeChange: 0,
          fileTypeChanges: {}
        }
      };

      const summary = comparator.generateComparisonSummary(comparison);

      expect(summary).toContain('Added files: 0');
      expect(summary).toContain('Size change: +0 Bytes');
      expect(summary).toContain('Files with dependency changes: 0');
    });
  });
});