import * as path from 'path';

/**
 * Classifies files based on their extension and content patterns
 */
export class FileTypeClassifier {
  private readonly fileTypeMap: Record<string, string> = {
    // TypeScript/JavaScript
    '.ts': 'typescript',
    '.tsx': 'typescript-react',
    '.js': 'javascript',
    '.jsx': 'javascript-react',
    '.mjs': 'javascript-module',
    '.cjs': 'javascript-commonjs',
    
    // Configuration
    '.json': 'json',
    '.jsonc': 'json-with-comments',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.toml': 'toml',
    '.ini': 'ini',
    '.env': 'environment',
    
    // Documentation
    '.md': 'markdown',
    '.mdx': 'markdown-jsx',
    '.txt': 'text',
    '.rst': 'restructured-text',
    
    // Styles
    '.css': 'stylesheet',
    '.scss': 'sass',
    '.sass': 'sass',
    '.less': 'less',
    '.styl': 'stylus',
    
    // Templates
    '.html': 'html',
    '.htm': 'html',
    '.xml': 'xml',
    '.svg': 'svg',
    '.ejs': 'ejs-template',
    '.hbs': 'handlebars-template',
    '.mustache': 'mustache-template',
    
    // Images
    '.png': 'image-raster',
    '.jpg': 'image-raster',
    '.jpeg': 'image-raster',
    '.gif': 'image-raster',
    '.bmp': 'image-raster',
    '.webp': 'image-raster',
    '.ico': 'icon',
    '.svg': 'image-vector',
    
    // Fonts
    '.woff': 'font',
    '.woff2': 'font',
    '.ttf': 'font',
    '.otf': 'font',
    '.eot': 'font',
    
    // Build/Config files
    '.gitignore': 'git-config',
    '.gitattributes': 'git-config',
    '.npmignore': 'npm-config',
    '.dockerignore': 'docker-config',
    '.eslintrc': 'eslint-config',
    '.prettierrc': 'prettier-config',
    '.babelrc': 'babel-config',
    
    // Package managers
    'package.json': 'package-manifest',
    'package-lock.json': 'package-lock',
    'yarn.lock': 'yarn-lock',
    'pnpm-lock.yaml': 'pnpm-lock',
    'composer.json': 'composer-manifest',
    'Cargo.toml': 'cargo-manifest',
    
    // Build tools
    'webpack.config.js': 'webpack-config',
    'vite.config.js': 'vite-config',
    'vite.config.ts': 'vite-config',
    'rollup.config.js': 'rollup-config',
    'gulpfile.js': 'gulp-config',
    'Gruntfile.js': 'grunt-config',
    
    // Testing
    '.test.js': 'test-javascript',
    '.test.ts': 'test-typescript',
    '.spec.js': 'spec-javascript',
    '.spec.ts': 'spec-typescript',
    'jest.config.js': 'jest-config',
    'vitest.config.js': 'vitest-config',
    
    // Other
    '.log': 'log',
    '.lock': 'lock-file',
    '.tmp': 'temporary',
    '.bak': 'backup',
    '.zip': 'archive',
    '.tar': 'archive',
    '.gz': 'archive',
    '.7z': 'archive'
  };

  private readonly categoryMap: Record<string, string> = {
    // Code categories
    'typescript': 'code',
    'typescript-react': 'code',
    'javascript': 'code',
    'javascript-react': 'code',
    'javascript-module': 'code',
    'javascript-commonjs': 'code',
    
    // Config categories
    'json': 'config',
    'json-with-comments': 'config',
    'yaml': 'config',
    'toml': 'config',
    'ini': 'config',
    'environment': 'config',
    'git-config': 'config',
    'npm-config': 'config',
    'docker-config': 'config',
    'eslint-config': 'config',
    'prettier-config': 'config',
    'babel-config': 'config',
    'webpack-config': 'config',
    'vite-config': 'config',
    'rollup-config': 'config',
    'gulp-config': 'config',
    'grunt-config': 'config',
    'jest-config': 'config',
    'vitest-config': 'config',
    
    // Documentation categories
    'markdown': 'documentation',
    'markdown-jsx': 'documentation',
    'text': 'documentation',
    'restructured-text': 'documentation',
    
    // Style categories
    'stylesheet': 'styles',
    'sass': 'styles',
    'less': 'styles',
    'stylus': 'styles',
    
    // Asset categories
    'image-raster': 'assets',
    'image-vector': 'assets',
    'icon': 'assets',
    'font': 'assets',
    
    // Test categories
    'test-javascript': 'tests',
    'test-typescript': 'tests',
    'spec-javascript': 'tests',
    'spec-typescript': 'tests',
    
    // Package categories
    'package-manifest': 'package',
    'package-lock': 'package',
    'yarn-lock': 'package',
    'pnpm-lock': 'package',
    'composer-manifest': 'package',
    'cargo-manifest': 'package'
  };

  /**
   * Classifies a file based on its name and extension
   */
  classifyFile(fileName: string): {
    fileType: string;
    category: string;
    isCode: boolean;
    isConfig: boolean;
    isTest: boolean;
    isAsset: boolean;
  } {
    const extension = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName).toLowerCase();
    
    // Check for specific file names first
    let fileType = this.fileTypeMap[baseName] || this.fileTypeMap[extension] || 'unknown';
    
    // Special handling for test files
    if (this.isTestFile(fileName)) {
      if (extension === '.ts' || extension === '.tsx') {
        fileType = 'test-typescript';
      } else if (extension === '.js' || extension === '.jsx') {
        fileType = 'test-javascript';
      }
    }
    
    const category = this.categoryMap[fileType] || 'other';
    
    return {
      fileType,
      category,
      isCode: category === 'code',
      isConfig: category === 'config',
      isTest: category === 'tests',
      isAsset: category === 'assets'
    };
  }

  /**
   * Checks if a file is a test file based on naming patterns
   */
  private isTestFile(fileName: string): boolean {
    const testPatterns = [
      /\.test\./,
      /\.spec\./,
      /__tests__/,
      /\.stories\./,
      /\.e2e\./
    ];
    
    return testPatterns.some(pattern => pattern.test(fileName));
  }

  /**
   * Gets all supported file types
   */
  getSupportedFileTypes(): string[] {
    return [...new Set(Object.values(this.fileTypeMap))];
  }

  /**
   * Gets all categories
   */
  getCategories(): string[] {
    return [...new Set(Object.values(this.categoryMap))];
  }

  /**
   * Analyzes file type distribution in a list of files
   */
  analyzeFileDistribution(fileNames: string[]): {
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byExtension: Record<string, number>;
    summary: {
      totalFiles: number;
      codeFiles: number;
      configFiles: number;
      testFiles: number;
      assetFiles: number;
      documentationFiles: number;
      otherFiles: number;
    };
  } {
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byExtension: Record<string, number> = {};
    
    let codeFiles = 0;
    let configFiles = 0;
    let testFiles = 0;
    let assetFiles = 0;
    let documentationFiles = 0;
    let otherFiles = 0;

    for (const fileName of fileNames) {
      const classification = this.classifyFile(fileName);
      const extension = path.extname(fileName).toLowerCase() || 'no-extension';
      
      // Count by type
      byType[classification.fileType] = (byType[classification.fileType] || 0) + 1;
      
      // Count by category
      byCategory[classification.category] = (byCategory[classification.category] || 0) + 1;
      
      // Count by extension
      byExtension[extension] = (byExtension[extension] || 0) + 1;
      
      // Count by summary categories
      if (classification.isCode) codeFiles++;
      else if (classification.isConfig) configFiles++;
      else if (classification.isTest) testFiles++;
      else if (classification.isAsset) assetFiles++;
      else if (classification.category === 'documentation') documentationFiles++;
      else otherFiles++;
    }

    return {
      byType,
      byCategory,
      byExtension,
      summary: {
        totalFiles: fileNames.length,
        codeFiles,
        configFiles,
        testFiles,
        assetFiles,
        documentationFiles,
        otherFiles
      }
    };
  }

  /**
   * Determines if a file should be analyzed for dependencies
   */
  shouldAnalyzeDependencies(fileName: string): boolean {
    const classification = this.classifyFile(fileName);
    return classification.isCode || classification.isTest;
  }

  /**
   * Gets appropriate parser for a file type
   */
  getParserType(fileName: string): 'typescript' | 'javascript' | 'json' | 'yaml' | 'text' | 'binary' {
    const classification = this.classifyFile(fileName);
    
    if (['typescript', 'typescript-react'].includes(classification.fileType)) {
      return 'typescript';
    }
    
    if (['javascript', 'javascript-react', 'javascript-module', 'javascript-commonjs'].includes(classification.fileType)) {
      return 'javascript';
    }
    
    if (['json', 'json-with-comments'].includes(classification.fileType)) {
      return 'json';
    }
    
    if (['yaml'].includes(classification.fileType)) {
      return 'yaml';
    }
    
    if (classification.category === 'assets' || classification.fileType.includes('archive')) {
      return 'binary';
    }
    
    return 'text';
  }
}