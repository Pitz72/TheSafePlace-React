import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import { DependencyMapper } from '../utils/DependencyMapper';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn()
  }
}));

describe('DependencyMapper', () => {
  let mapper: DependencyMapper;
  const mockFs = fs.promises as any;

  beforeEach(() => {
    mapper = new DependencyMapper();
    vi.clearAllMocks();
  });

  describe('analyzeDependencies', () => {
    it('should extract ES6 imports correctly', async () => {
      const fileContent = `
        import React from 'react';
        import { useState, useEffect } from 'react';
        import * as utils from './utils';
        import type { User } from './types';
        import './styles.css';
      `;

      mockFs.readFile.mockResolvedValue(fileContent);

      const result = await mapper.analyzeDependencies('src/App.tsx');

      expect(result.imports).toEqual(
        expect.arrayContaining([
          'react',
          './utils',
          './types',
          './styles.css'
        ])
      );
    });

    it('should extract CommonJS requires correctly', async () => {
      const fileContent = `
        const fs = require('fs');
        const path = require('path');
        const utils = require('./utils');
      `;

      mockFs.readFile.mockResolvedValue(fileContent);

      const result = await mapper.analyzeDependencies('src/server.js');

      expect(result.imports).toEqual(
        expect.arrayContaining([
          'fs',
          'path',
          './utils'
        ])
      );
    });

    it('should extract dynamic imports correctly', async () => {
      const fileContent = `
        const loadModule = async () => {
          const module = await import('./dynamic-module');
          return module;
        };
      `;

      mockFs.readFile.mockResolvedValue(fileContent);

      const result = await mapper.analyzeDependencies('src/loader.ts');

      expect(result.imports).toContain('./dynamic-module');
    });

    it('should extract exports correctly', async () => {
      const fileContent = `
        export const myFunction = () => {};
        export class MyClass {}
        export interface MyInterface {}
        export type MyType = string;
        export default App;
        export { helper, utils };
        export * from './types';
        export * as helpers from './helpers';
      `;

      mockFs.readFile.mockResolvedValue(fileContent);

      const result = await mapper.analyzeDependencies('src/exports.ts');

      expect(result.exports).toEqual(
        expect.arrayContaining([
          'myFunction',
          'MyClass',
          'MyInterface',
          'MyType',
          'default:App',
          'helper',
          'utils',
          '*:./types',
          'helpers:./helpers'
        ])
      );
    });

    it('should handle file read errors gracefully', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await mapper.analyzeDependencies('nonexistent.ts');

      expect(result).toEqual({
        imports: [],
        exports: []
      });
    });

    it('should remove duplicate imports and exports', async () => {
      const fileContent = `
        import React from 'react';
        import React from 'react'; // Duplicate
        export const func = () => {};
        export const func = () => {}; // Duplicate (won't actually compile, but test parser)
      `;

      mockFs.readFile.mockResolvedValue(fileContent);

      const result = await mapper.analyzeDependencies('src/duplicates.ts');

      // Should only have one instance of each
      expect(result.imports.filter(imp => imp === 'react')).toHaveLength(1);
      expect(result.exports.filter(exp => exp === 'func')).toHaveLength(1);
    });
  });

  describe('buildDependencyMap', () => {
    it('should build dependency map for multiple files', async () => {
      const files = ['src/App.tsx', 'src/utils.ts'];

      mockFs.readFile
        .mockResolvedValueOnce('import React from "react"; export const App = () => {};')
        .mockResolvedValueOnce('export const helper = () => {};');

      const result = await mapper.buildDependencyMap(files);

      expect(result).toMatchObject({
        'src/App.tsx': {
          imports: ['react'],
          exports: ['App']
        },
        'src/utils.ts': {
          imports: [],
          exports: ['helper']
        }
      });
    });

    it('should handle errors in individual files', async () => {
      const files = ['src/good.ts', 'src/bad.ts'];

      mockFs.readFile
        .mockResolvedValueOnce('export const good = true;')
        .mockRejectedValueOnce(new Error('Bad file'));

      const result = await mapper.buildDependencyMap(files);

      expect(result).toMatchObject({
        'src/good.ts': {
          imports: [],
          exports: ['good']
        },
        'src/bad.ts': {
          imports: [],
          exports: []
        }
      });
    });
  });

  describe('findCircularDependencies', () => {
    it('should detect simple circular dependencies', () => {
      const dependencyMap = {
        'A.ts': { imports: ['B.ts'], exports: [] },
        'B.ts': { imports: ['A.ts'], exports: [] }
      };

      const cycles = mapper.findCircularDependencies(dependencyMap);

      expect(cycles).toHaveLength(1);
      expect(cycles[0]).toEqual(['A.ts', 'B.ts']);
    });

    it('should detect complex circular dependencies', () => {
      const dependencyMap = {
        'A.ts': { imports: ['B.ts'], exports: [] },
        'B.ts': { imports: ['C.ts'], exports: [] },
        'C.ts': { imports: ['A.ts'], exports: [] }
      };

      const cycles = mapper.findCircularDependencies(dependencyMap);

      expect(cycles).toHaveLength(1);
      expect(cycles[0]).toEqual(['A.ts', 'B.ts', 'C.ts']);
    });

    it('should not detect false positives', () => {
      const dependencyMap = {
        'A.ts': { imports: ['B.ts'], exports: [] },
        'B.ts': { imports: ['C.ts'], exports: [] },
        'C.ts': { imports: [], exports: [] }
      };

      const cycles = mapper.findCircularDependencies(dependencyMap);

      expect(cycles).toHaveLength(0);
    });
  });

  describe('findUnusedExports', () => {
    it('should find unused exports', () => {
      const dependencyMap = {
        'A.ts': { imports: [], exports: ['usedFunction', 'unusedFunction'] },
        'B.ts': { imports: ['A.ts#usedFunction'], exports: [] }
      };

      const unused = mapper.findUnusedExports(dependencyMap);

      expect(unused['A.ts']).toContain('unusedFunction');
      expect(unused['A.ts']).not.toContain('usedFunction');
    });

    it('should ignore default exports and re-exports', () => {
      const dependencyMap = {
        'A.ts': { imports: [], exports: ['default:App', '*:./types', 'unusedFunction'] },
        'B.ts': { imports: [], exports: [] }
      };

      const unused = mapper.findUnusedExports(dependencyMap);

      expect(unused['A.ts']).toContain('unusedFunction');
      expect(unused['A.ts']).not.toContain('default:App');
      expect(unused['A.ts']).not.toContain('*:./types');
    });
  });

  describe('findDeadFiles', () => {
    it('should find files that are never imported', () => {
      const dependencyMap = {
        'A.ts': { imports: ['B.ts'], exports: [] },
        'B.ts': { imports: [], exports: [] },
        'C.ts': { imports: [], exports: [] } // Dead file
      };

      const deadFiles = mapper.findDeadFiles(dependencyMap, ['A.ts']);

      expect(deadFiles).toContain('C.ts');
      expect(deadFiles).not.toContain('A.ts'); // Entry point
      expect(deadFiles).not.toContain('B.ts'); // Imported by A.ts
    });

    it('should respect entry points', () => {
      const dependencyMap = {
        'main.ts': { imports: [], exports: [] },
        'unused.ts': { imports: [], exports: [] }
      };

      const deadFiles = mapper.findDeadFiles(dependencyMap, ['main.ts']);

      expect(deadFiles).toContain('unused.ts');
      expect(deadFiles).not.toContain('main.ts');
    });
  });

  describe('generateDependencyGraph', () => {
    it('should generate DOT format graph', () => {
      const dependencyMap = {
        'A.ts': { imports: ['B.ts'], exports: [] },
        'B.ts': { imports: ['C.ts'], exports: [] },
        'C.ts': { imports: [], exports: [] }
      };

      const graph = mapper.generateDependencyGraph(dependencyMap);

      expect(graph).toContain('digraph Dependencies {');
      expect(graph).toContain('"A.ts" -> "B.ts";');
      expect(graph).toContain('"B.ts" -> "C.ts";');
      expect(graph).toContain('}');
    });

    it('should respect maxDepth option', () => {
      const dependencyMap = {
        'A.ts': { imports: ['B.ts'], exports: [] },
        'B.ts': { imports: ['C.ts'], exports: [] },
        'C.ts': { imports: ['D.ts'], exports: [] },
        'D.ts': { imports: [], exports: [] }
      };

      const graph = mapper.generateDependencyGraph(dependencyMap, { maxDepth: 2 });

      expect(graph).toContain('"A.ts" -> "B.ts";');
      expect(graph).toContain('"B.ts" -> "C.ts";');
      expect(graph).not.toContain('"C.ts" -> "D.ts";');
    });

    it('should focus on specific file when focusFile is provided', () => {
      const dependencyMap = {
        'A.ts': { imports: ['B.ts'], exports: [] },
        'B.ts': { imports: [], exports: [] },
        'C.ts': { imports: ['D.ts'], exports: [] },
        'D.ts': { imports: [], exports: [] }
      };

      const graph = mapper.generateDependencyGraph(dependencyMap, { focusFile: 'A.ts' });

      expect(graph).toContain('"A.ts" -> "B.ts";');
      expect(graph).not.toContain('"C.ts" -> "D.ts";');
    });
  });

  describe('analyzeDependencyMetrics', () => {
    it('should calculate correct metrics', () => {
      const dependencyMap = {
        'A.ts': { imports: ['react', 'B.ts'], exports: ['ComponentA'] },
        'B.ts': { imports: ['lodash'], exports: ['utilB', 'helperB'] },
        'C.ts': { imports: [], exports: [] }
      };

      const metrics = mapper.analyzeDependencyMetrics(dependencyMap);

      expect(metrics).toMatchObject({
        totalFiles: 3,
        totalImports: 3,
        totalExports: 3,
        averageImportsPerFile: 1,
        averageExportsPerFile: 1,
        maxImports: { file: 'A.ts', count: 2 },
        maxExports: { file: 'B.ts', count: 2 }
      });
    });

    it('should handle empty dependency map', () => {
      const metrics = mapper.analyzeDependencyMetrics({});

      expect(metrics).toMatchObject({
        totalFiles: 0,
        totalImports: 0,
        totalExports: 0,
        averageImportsPerFile: 0,
        averageExportsPerFile: 0,
        maxImports: { file: '', count: 0 },
        maxExports: { file: '', count: 0 }
      });
    });
  });
});