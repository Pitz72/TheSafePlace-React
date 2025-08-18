/**
 * Main Code Scanner for Documentation Sync Analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import type { CodeScanResult, VersionInfo } from '../interfaces/AnalysisTypes';
import { VersionExtractor } from './VersionExtractor';
import { FeatureDetector } from './FeatureDetector';
import { ErrorHandler } from '../utils/ErrorHandler';

export class CodeScanner {
  private versionExtractor: VersionExtractor;
  private featureDetector: FeatureDetector;
  private errorHandler: ErrorHandler;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
    this.versionExtractor = new VersionExtractor(errorHandler);
    this.featureDetector = new FeatureDetector(errorHandler);
  }

  /**
   * Perform complete code analysis
   */
  async scanCodebase(files: Map<string, string>): Promise<CodeScanResult> {
    try {
      console.log('🔍 Starting codebase analysis...');

      // Extract versions from key files
      const versions = await this.extractVersions(files);
      
      // Analyze project structure
      const structure = await this.analyzeStructure(files);
      
      // Detect implemented features
      const features = await this.analyzeFeatures(files);

      const result: CodeScanResult = {
        versions,
        features,
        structure
      };

      console.log('✅ Codebase analysis completed');
      return result;

    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'fatal',
          `Failed to scan codebase: ${error}`,
          undefined,
          undefined,
          false
        )
      );
      throw error;
    }
  }

  /**
   * Extract versions from key project files
   */
  private async extractVersions(files: Map<string, string>): Promise<CodeScanResult['versions']> {
    const versions = {
      package: 'unknown',
      startScreen: 'unknown',
      readme: 'unknown'
    };

    try {
      // Extract from package.json
      const packageContent = files.get('package.json');
      if (packageContent) {
        const packageVersion = await this.versionExtractor.extractFromPackageJson(
          packageContent, 
          'package.json'
        );
        if (packageVersion) {
          versions.package = packageVersion.version;
        }
      }

      // Extract from StartScreen.tsx
      const startScreenContent = files.get('src/components/StartScreen.tsx');
      if (startScreenContent) {
        const startScreenVersion = await this.versionExtractor.extractFromStartScreen(
          startScreenContent,
          'src/components/StartScreen.tsx'
        );
        if (startScreenVersion) {
          versions.startScreen = startScreenVersion.version;
        }
      }

      // Extract from README.md
      const readmeContent = files.get('README.md');
      if (readmeContent) {
        const readmeVersion = await this.versionExtractor.extractFromReadme(
          readmeContent,
          'README.md'
        );
        if (readmeVersion) {
          versions.readme = readmeVersion.version;
        }
      }

      return versions;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to extract versions: ${error}`
        )
      );
      return versions;
    }
  }

  /**
   * Analyze project structure
   */
  private async analyzeStructure(files: Map<string, string>): Promise<CodeScanResult['structure']> {
    try {
      const components = await this.featureDetector.scanComponents(files);
      const hooks = await this.featureDetector.scanHooks(files);
      const contexts = await this.featureDetector.scanContexts(files);
      
      // Identify style files
      const styles = Array.from(files.keys())
        .filter(path => path.endsWith('.css') || path.endsWith('.scss'))
        .map(path => path.split('/').pop() || path);

      return {
        components,
        hooks,
        contexts,
        styles
      };
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to analyze structure: ${error}`
        )
      );
      return {
        components: [],
        hooks: [],
        contexts: [],
        styles: []
      };
    }
  }

  /**
   * Analyze implemented features and configurations
   */
  private async analyzeFeatures(files: Map<string, string>): Promise<CodeScanResult['features']> {
    try {
      // Detect implemented features
      const implemented = await this.featureDetector.detectImplementedFeatures(files);
      
      // Analyze dependencies
      const packageContent = files.get('package.json');
      const dependencies = packageContent 
        ? await this.featureDetector.analyzeDependencies(packageContent)
        : {};

      // Extract configurations
      const configurations = await this.extractConfigurations(files);

      return {
        implemented,
        configurations,
        dependencies
      };
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to analyze features: ${error}`
        )
      );
      return {
        implemented: [],
        configurations: {},
        dependencies: {}
      };
    }
  }

  /**
   * Extract configuration settings from various files
   */
  private async extractConfigurations(files: Map<string, string>): Promise<Record<string, any>> {
    const configurations: Record<string, any> = {};

    try {
      // Vite configuration
      const viteConfig = files.get('vite.config.ts');
      if (viteConfig) {
        configurations.vite = this.parseViteConfig(viteConfig);
      }

      // TypeScript configuration
      const tsConfig = files.get('tsconfig.json');
      if (tsConfig) {
        configurations.typescript = this.parseTsConfig(tsConfig);
      }

      // Tailwind configuration
      const tailwindConfig = files.get('tailwind.config.js') || files.get('tailwind.config.ts');
      if (tailwindConfig) {
        configurations.tailwind = { present: true };
      }

      // PostCSS configuration
      const postcssConfig = files.get('postcss.config.js');
      if (postcssConfig) {
        configurations.postcss = { present: true };
      }

      return configurations;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to extract configurations: ${error}`
        )
      );
      return {};
    }
  }

  /**
   * Parse Vite configuration
   */
  private parseViteConfig(content: string): any {
    try {
      // Extract basic Vite config info
      const hasReact = content.includes('@vitejs/plugin-react');
      const hasSWC = content.includes('react-swc');
      
      return {
        hasReact,
        hasSWC,
        plugins: hasSWC ? ['react-swc'] : hasReact ? ['react'] : []
      };
    } catch (error) {
      return { error: 'Failed to parse Vite config' };
    }
  }

  /**
   * Parse TypeScript configuration
   */
  private parseTsConfig(content: string): any {
    try {
      const config = JSON.parse(content);
      return {
        hasReferences: !!config.references,
        referenceCount: config.references?.length || 0
      };
    } catch (error) {
      return { error: 'Failed to parse TypeScript config' };
    }
  }

  /**
   * Get analysis summary
   */
  getSummary(result: CodeScanResult): string {
    const { versions, features, structure } = result;
    
    return `
Code Analysis Summary:
- Package Version: ${versions.package}
- StartScreen Version: ${versions.startScreen}
- README Version: ${versions.readme}
- Components: ${structure.components.length}
- Hooks: ${structure.hooks.length}
- Contexts: ${structure.contexts.length}
- Features: ${features.implemented.length}
- Dependencies: ${Object.keys(features.dependencies).length}
    `.trim();
  }
}