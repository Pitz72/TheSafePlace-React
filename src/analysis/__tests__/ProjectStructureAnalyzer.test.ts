import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectStructureAnalyzer } from '../scanners/ProjectStructureAnalyzer';
import { FileInfo, DirectoryNode } from '../interfaces/ProjectStructure';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    stat: vi.fn(),
    readdir: vi.fn(),
    readFile: vi.fn()
  }
}));

describe('ProjectStructureAnalyzer', () => {
  let analyzer: ProjectStructureAnalyzer;
  const mockFs = fs.promises as any;

  beforeEach(() => {
    analyzer = new ProjectStructureAnalyzer();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('analyzeProjectStructure', () => {
    it('should analyze a simple project structure', async () => {
      // Mock file system structure
      const mockStats = {
        isDirectory: vi.fn(),
        mtime: new Date('2024-01-01'),
        size: 1000
      };

      mockFs.stat.mockResolvedValueOnce({ ...mockStats, isDirectory: () => true });
      mockFs.readdir.mockResolvedValueOnce(['src', 'package.json']);
      
      // Mock src directory
      mockFs.stat.mockResolvedValueOnce({ ...mockStats, isDirectory: () => true });
      mockFs.readdir.mockResolvedValueOnce(['index.ts']);
      
      // Mock index.ts file
      mockFs.stat.mockResolvedValueOnce({ ...mockStats, isDirectory: () => false, size: 500 });
      
      // Mock package.json file
      mockFs.stat.mockResolvedValueOnce({ ...mockStats, isDirectory: () => false, size: 300 });
      
      // Mock file contents for dependency analysis
      mockFs.readFile.mockResolvedValueOnce('import React from "react";\nexport const App = () => {};');

      const result = await analyzer.analyzeProjectStructure('/test/project');

      expect(result).toMatchObject({
        rootPath: '/test/project',
        directoryTree: expect.objectContaining({
          name: 'project',
          type: 'directory',
          children: expect.arrayContaining([
            expect.objectContaining({
              name: 'src',
              type: 'directory'
            }),
            expect.objectContaining({
              name: 'package.json',
              type: 'file'
            })
          ])
        }),
        fileList: expect.arrayContaining([
          expect.objectContaining({
            name: 'index.ts',
            type: 'file',
            extension: '.ts',
            fileType: 'typescript'
          }),
          expect.objectContaining({
            name: 'package.json',
            type: 'file',
            extension: '.json',
            fileType: 'json'
          })
        ]),
        statistics: expect.objectContaining({
          totalFiles: 2,
          totalSize: 800,
          fileTypeDistribution: expect.objectContaining({
            typescript: 1,
            json: 1
          })
        })
      });
    });

    it('should handle file system errors gracefully', async () => {
      mockFs.stat.mockResolvedValueOnce({ 
        isDirectory: () => true,
        mtime: new Date(),
        size: 0
      });
      mockFs.readdir.mockRejectedValueOnce(new Error('Permission denied'));

      const result = await analyzer.analyzeProjectStructure('/test/project');

      expect(result.directoryTree.children).toHaveLength(0);
      expect(result.fileList).toHaveLength(0);
    });

    it('should exclude node_modules and other ignored patterns', async () => {
      const mockStats = {
        isDirectory: vi.fn(),
        mtime: new Date('2024-01-01'),
        size: 1000
      };

      mockFs.stat.mockResolvedValueOnce({ ...mockStats, isDirectory: () => true });
      mockFs.readdir.mockResolvedValueOnce(['src', 'node_modules', '.git', 'dist']);
      
      // Mock src directory (should be included)
      mockFs.stat.mockResolvedValueOnce({ ...mockStats, isDirectory: () => true });
      mockFs.readdir.mockResolvedValueOnce(['index.ts']);
      mockFs.stat.mockResolvedValueOnce({ ...mockStats, isDirectory: () => false, size: 500 });
      mockFs.readFile.mockResolvedValueOnce('export const test = "test";');

      const result = await analyzer.analyzeProjectStructure('/test/project');

      // Should only include src directory, not node_modules, .git, or dist
      expect(result.directoryTree.children).toHaveLength(1);
      expect(result.directoryTree.children[0]).toMatchObject({
        name: 'src',
        type: 'directory'
      });
    });
  });

  describe('file type classification', () => {
    it('should correctly classify TypeScript files', async () => {
      const mockStats = {
        isDirectory: () => false,
        mtime: new Date('2024-01-01'),
        size: 500
      };

      mockFs.stat.mockResolvedValue({ ...mockStats, isDirectory: () => true });
      mockFs.readdir.mockResolvedValue(['Component.tsx', 'utils.ts', 'styles.css']);
      
      // Mock file stats
      mockFs.stat.mockResolvedValue(mockStats);
      
      // Mock file contents
      mockFs.readFile.mockResolvedValue('// TypeScript content');

      const result = await analyzer.analyzeProjectStructure('/test');

      expect(result.statistics.fileTypeDistribution).toMatchObject({
        'typescript-react': 1,
        'typescript': 1,
        'stylesheet': 1
      });
    });

    it('should handle unknown file types', async () => {
      const mockStats = {
        isDirectory: () => false,
        mtime: new Date('2024-01-01'),
        size: 100
      };

      mockFs.stat.mockResolvedValue({ ...mockStats, isDirectory: () => true });
      mockFs.readdir.mockResolvedValue(['unknown.xyz']);
      mockFs.stat.mockResolvedValue(mockStats);

      const result = await analyzer.analyzeProjectStructure('/test');

      const unknownFile = result.fileList.find(f => f.name === 'unknown.xyz');
      expect(unknownFile?.fileType).toBe('unknown');
    });
  });

  describe('dependency analysis', () => {
    it('should extract import statements correctly', async () => {
      const mockStats = {
        isDirectory: () => false,
        mtime: new Date('2024-01-01'),
        size: 500
      };

      mockFs.stat.mockResolvedValue({ ...mockStats, isDirectory: () => true });
      mockFs.readdir.mockResolvedValue(['index.ts']);
      mockFs.stat.mockResolvedValue(mockStats);
      
      const fileContent = `
        import React from 'react';
        import { useState } from 'react';
        import './styles.css';
        import { helper } from '../utils/helper';
        const dynamicImport = import('./dynamic');
      `;
      
      mockFs.readFile.mockResolvedValue(fileContent);

      const result = await analyzer.analyzeProjectStructure('/test');

      expect(result.dependencyMap['index.ts']).toMatchObject({
        imports: expect.arrayContaining([
          'react',
          './styles.css',
          '../utils/helper',
          './dynamic'
        ])
      });
    });

    it('should extract export statements correctly', async () => {
      const mockStats = {
        isDirectory: () => false,
        mtime: new Date('2024-01-01'),
        size: 500
      };

      mockFs.stat.mockResolvedValue({ ...mockStats, isDirectory: () => true });
      mockFs.readdir.mockResolvedValue(['index.ts']);
      mockFs.stat.mockResolvedValue(mockStats);
      
      const fileContent = `
        export const myFunction = () => {};
        export class MyClass {}
        export default App;
        export { helper, utils };
        export * from './types';
      `;
      
      mockFs.readFile.mockResolvedValue(fileContent);

      const result = await analyzer.analyzeProjectStructure('/test');

      expect(result.dependencyMap['index.ts']).toMatchObject({
        exports: expect.arrayContaining([
          'myFunction',
          'MyClass',
          'App',
          'helper',
          'utils',
          '*:./types'
        ])
      });
    });

    it('should handle dependency analysis errors gracefully', async () => {
      const mockStats = {
        isDirectory: () => false,
        mtime: new Date('2024-01-01'),
        size: 500
      };

      mockFs.stat.mockResolvedValue({ ...mockStats, isDirectory: () => true });
      mockFs.readdir.mockResolvedValue(['index.ts']);
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockRejectedValue(new Error('File read error'));

      const result = await analyzer.analyzeProjectStructure('/test');

      expect(result.dependencyMap['index.ts']).toMatchObject({
        imports: [],
        exports: []
      });
    });
  });

  describe('statistics calculation', () => {
    it('should calculate correct statistics', async () => {
      const files: FileInfo[] = [
        {
          name: 'index.ts',
          path: 'src/index.ts',
          type: 'file',
          extension: '.ts',
          fileType: 'typescript',
          size: 1000,
          lastModified: new Date()
        },
        {
          name: 'App.tsx',
          path: 'src/App.tsx',
          type: 'file',
          extension: '.tsx',
          fileType: 'typescript-react',
          size: 2000,
          lastModified: new Date()
        },
        {
          name: 'styles.css',
          path: 'src/styles.css',
          type: 'file',
          extension: '.css',
          fileType: 'stylesheet',
          size: 500,
          lastModified: new Date()
        }
      ];

      // Mock the analyzer to return our test files
      const mockStats = { isDirectory: () => true, mtime: new Date(), size: 0 };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readdir.mockResolvedValue([]);

      const result = await analyzer.analyzeProjectStructure('/test');
      
      // Manually set the file list for testing statistics
      result.fileList = files;
      result.statistics = (analyzer as any).calculateStatistics(files);

      expect(result.statistics).toMatchObject({
        totalFiles: 3,
        totalSize: 3500,
        fileTypeDistribution: {
          typescript: 1,
          'typescript-react': 1,
          stylesheet: 1
        }
      });

      expect(result.statistics.largestFiles[0]).toMatchObject({
        name: 'App.tsx',
        size: 2000
      });
    });
  });
});