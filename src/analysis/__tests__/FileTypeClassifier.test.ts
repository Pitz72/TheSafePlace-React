import { describe, it, expect } from 'vitest';
import { FileTypeClassifier } from '../utils/FileTypeClassifier';

describe('FileTypeClassifier', () => {
  let classifier: FileTypeClassifier;

  beforeEach(() => {
    classifier = new FileTypeClassifier();
  });

  describe('classifyFile', () => {
    it('should classify TypeScript files correctly', () => {
      const result = classifier.classifyFile('Component.tsx');
      
      expect(result).toMatchObject({
        fileType: 'typescript-react',
        category: 'code',
        isCode: true,
        isConfig: false,
        isTest: false,
        isAsset: false
      });
    });

    it('should classify JavaScript files correctly', () => {
      const result = classifier.classifyFile('utils.js');
      
      expect(result).toMatchObject({
        fileType: 'javascript',
        category: 'code',
        isCode: true,
        isConfig: false,
        isTest: false,
        isAsset: false
      });
    });

    it('should classify configuration files correctly', () => {
      const result = classifier.classifyFile('package.json');
      
      expect(result).toMatchObject({
        fileType: 'package-manifest',
        category: 'package',
        isCode: false,
        isConfig: false,
        isTest: false,
        isAsset: false
      });
    });

    it('should classify test files correctly', () => {
      const testResult = classifier.classifyFile('Component.test.ts');
      
      expect(testResult).toMatchObject({
        fileType: 'test-typescript',
        category: 'tests',
        isCode: false,
        isConfig: false,
        isTest: true,
        isAsset: false
      });

      const specResult = classifier.classifyFile('utils.spec.js');
      
      expect(specResult).toMatchObject({
        fileType: 'test-javascript',
        category: 'tests',
        isTest: true
      });
    });

    it('should classify asset files correctly', () => {
      const imageResult = classifier.classifyFile('logo.png');
      
      expect(imageResult).toMatchObject({
        fileType: 'image-raster',
        category: 'assets',
        isCode: false,
        isConfig: false,
        isTest: false,
        isAsset: true
      });

      const fontResult = classifier.classifyFile('font.woff2');
      
      expect(fontResult).toMatchObject({
        fileType: 'font',
        category: 'assets',
        isAsset: true
      });
    });

    it('should classify documentation files correctly', () => {
      const result = classifier.classifyFile('README.md');
      
      expect(result).toMatchObject({
        fileType: 'markdown',
        category: 'documentation',
        isCode: false,
        isConfig: false,
        isTest: false,
        isAsset: false
      });
    });

    it('should classify style files correctly', () => {
      const cssResult = classifier.classifyFile('styles.css');
      
      expect(cssResult).toMatchObject({
        fileType: 'stylesheet',
        category: 'styles'
      });

      const scssResult = classifier.classifyFile('styles.scss');
      
      expect(scssResult).toMatchObject({
        fileType: 'sass',
        category: 'styles'
      });
    });

    it('should handle unknown file types', () => {
      const result = classifier.classifyFile('unknown.xyz');
      
      expect(result).toMatchObject({
        fileType: 'unknown',
        category: 'other'
      });
    });

    it('should handle files without extensions', () => {
      const result = classifier.classifyFile('Dockerfile');
      
      expect(result).toMatchObject({
        fileType: 'unknown',
        category: 'other'
      });
    });
  });

  describe('analyzeFileDistribution', () => {
    it('should analyze file distribution correctly', () => {
      const files = [
        'src/App.tsx',
        'src/utils.ts',
        'src/styles.css',
        'src/App.test.ts',
        'package.json',
        'README.md',
        'logo.png'
      ];

      const distribution = classifier.analyzeFileDistribution(files);

      expect(distribution.summary).toMatchObject({
        totalFiles: 7,
        codeFiles: 2, // App.tsx, utils.ts
        configFiles: 0, // package.json is in 'package' category
        testFiles: 1, // App.test.ts
        assetFiles: 1, // logo.png
        documentationFiles: 1, // README.md
        otherFiles: 2 // styles.css (styles category), package.json (package category)
      });

      expect(distribution.byType).toMatchObject({
        'typescript-react': 1,
        'typescript': 1,
        'stylesheet': 1,
        'test-typescript': 1,
        'package-manifest': 1,
        'markdown': 1,
        'image-raster': 1
      });

      expect(distribution.byCategory).toMatchObject({
        'code': 2,
        'styles': 1,
        'tests': 1,
        'package': 1,
        'documentation': 1,
        'assets': 1
      });

      expect(distribution.byExtension).toMatchObject({
        '.tsx': 1,
        '.ts': 2, // utils.ts and App.test.ts
        '.css': 1,
        '.json': 1,
        '.md': 1,
        '.png': 1
      });
    });

    it('should handle empty file list', () => {
      const distribution = classifier.analyzeFileDistribution([]);

      expect(distribution.summary).toMatchObject({
        totalFiles: 0,
        codeFiles: 0,
        configFiles: 0,
        testFiles: 0,
        assetFiles: 0,
        documentationFiles: 0,
        otherFiles: 0
      });
    });
  });

  describe('shouldAnalyzeDependencies', () => {
    it('should return true for code files', () => {
      expect(classifier.shouldAnalyzeDependencies('App.tsx')).toBe(true);
      expect(classifier.shouldAnalyzeDependencies('utils.ts')).toBe(true);
      expect(classifier.shouldAnalyzeDependencies('script.js')).toBe(true);
    });

    it('should return true for test files', () => {
      expect(classifier.shouldAnalyzeDependencies('App.test.ts')).toBe(true);
      expect(classifier.shouldAnalyzeDependencies('utils.spec.js')).toBe(true);
    });

    it('should return false for non-code files', () => {
      expect(classifier.shouldAnalyzeDependencies('package.json')).toBe(false);
      expect(classifier.shouldAnalyzeDependencies('README.md')).toBe(false);
      expect(classifier.shouldAnalyzeDependencies('styles.css')).toBe(false);
      expect(classifier.shouldAnalyzeDependencies('logo.png')).toBe(false);
    });
  });

  describe('getParserType', () => {
    it('should return correct parser types', () => {
      expect(classifier.getParserType('App.tsx')).toBe('typescript');
      expect(classifier.getParserType('utils.ts')).toBe('typescript');
      expect(classifier.getParserType('script.js')).toBe('javascript');
      expect(classifier.getParserType('config.json')).toBe('json');
      expect(classifier.getParserType('config.yaml')).toBe('yaml');
      expect(classifier.getParserType('README.md')).toBe('text');
      expect(classifier.getParserType('logo.png')).toBe('binary');
    });
  });

  describe('getSupportedFileTypes', () => {
    it('should return all supported file types', () => {
      const types = classifier.getSupportedFileTypes();
      
      expect(types).toContain('typescript');
      expect(types).toContain('typescript-react');
      expect(types).toContain('javascript');
      expect(types).toContain('json');
      expect(types).toContain('markdown');
      expect(types).toContain('stylesheet');
      expect(types).toContain('image-raster');
      expect(types.length).toBeGreaterThan(10);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', () => {
      const categories = classifier.getCategories();
      
      expect(categories).toContain('code');
      expect(categories).toContain('config');
      expect(categories).toContain('documentation');
      expect(categories).toContain('styles');
      expect(categories).toContain('assets');
      expect(categories).toContain('tests');
      expect(categories).toContain('package');
    });
  });
});