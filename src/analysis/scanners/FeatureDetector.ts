/**
 * Feature detection system for Documentation Sync Analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import type { CodeScanResult } from '../interfaces/AnalysisTypes';
import { ErrorHandler } from '../utils/ErrorHandler';

export class FeatureDetector {
  private errorHandler: ErrorHandler;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
  }

  /**
   * Scan React components in the codebase
   */
  async scanComponents(files: Map<string, string>): Promise<string[]> {
    const components: string[] = [];

    try {
      for (const [filePath, content] of files.entries()) {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
          const componentNames = this.extractComponentNames(content, filePath);
          components.push(...componentNames);
        }
      }

      return [...new Set(components)]; // Remove duplicates
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to scan components: ${error}`
        )
      );
      return [];
    }
  }

  /**
   * Scan custom hooks in the codebase
   */
  async scanHooks(files: Map<string, string>): Promise<string[]> {
    const hooks: string[] = [];

    try {
      for (const [filePath, content] of files.entries()) {
        if (filePath.includes('/hooks/') || filePath.includes('\\hooks\\')) {
          const hookNames = this.extractHookNames(content, filePath);
          hooks.push(...hookNames);
        }
      }

      return [...new Set(hooks)];
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to scan hooks: ${error}`
        )
      );
      return [];
    }
  }

  /**
   * Scan React contexts in the codebase
   */
  async scanContexts(files: Map<string, string>): Promise<string[]> {
    const contexts: string[] = [];

    try {
      for (const [filePath, content] of files.entries()) {
        if (filePath.includes('/contexts/') || filePath.includes('\\contexts\\')) {
          const contextNames = this.extractContextNames(content, filePath);
          contexts.push(...contextNames);
        }
      }

      return [...new Set(contexts)];
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to scan contexts: ${error}`
        )
      );
      return [];
    }
  }

  /**
   * Analyze package.json dependencies
   */
  async analyzeDependencies(packageContent: string): Promise<Record<string, string>> {
    try {
      const packageData = JSON.parse(packageContent);
      const dependencies = {
        ...packageData.dependencies,
        ...packageData.devDependencies
      };

      return dependencies || {};
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to parse dependencies: ${error}`
        )
      );
      return {};
    }
  }

  /**
   * Detect implemented features based on code analysis
   */
  async detectImplementedFeatures(files: Map<string, string>): Promise<string[]> {
    const features: string[] = [];

    try {
      // Detect specific features based on code patterns
      const featurePatterns = [
        { name: 'CRT Effects', pattern: /crt-|phosphor-|scan-lines/ },
        { name: 'Game Journal', pattern: /GameJournal|journal-/ },
        { name: 'Character Creation', pattern: /CharacterCreation|createTestCharacter/ },
        { name: 'Inventory System', pattern: /inventory|InventoryPanel/ },
        { name: 'Movement System', pattern: /usePlayerMovement|updatePlayerPosition/ },
        { name: 'Time System', pattern: /timeState|advanceTime/ },
        { name: 'Settings Store', pattern: /useSettingsStore|videoMode/ },
        { name: 'Keyboard Commands', pattern: /useKeyboardCommands|keyboard/ },
        { name: 'Game Scaling', pattern: /useGameScale|scale-ratio/ },
        { name: 'Map Viewport', pattern: /MapViewport|viewport/ },
        { name: 'Anti-Regression Protection', pattern: /ANTI-REGRESSIONE|anti-regression/ },
        { name: 'DSAR System', pattern: /DSAR|Documento.*Specifica/ },
        { name: 'Screen Navigation', pattern: /currentScreen|setCurrentScreen/ },
        { name: 'Theme System', pattern: /theme-|applyTheme/ }
      ];

      for (const [filePath, content] of files.entries()) {
        for (const feature of featurePatterns) {
          if (feature.pattern.test(content) && !features.includes(feature.name)) {
            features.push(feature.name);
          }
        }
      }

      return features;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'analysis',
          'warning',
          `Failed to detect features: ${error}`
        )
      );
      return [];
    }
  }

  /**
   * Extract component names from React file content
   */
  private extractComponentNames(content: string, filePath: string): string[] {
    const components: string[] = [];

    try {
      // Match React component declarations
      const patterns = [
        /const\s+(\w+):\s*React\.FC/g,
        /function\s+(\w+)\s*\(/g,
        /export\s+default\s+(\w+)/g,
        /export\s+(?:const|function)\s+(\w+)/g
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const componentName = match[1];
          if (componentName && /^[A-Z]/.test(componentName)) {
            components.push(componentName);
          }
        }
      });

      return components;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract component names from ${filePath}: ${error}`,
          filePath
        )
      );
      return [];
    }
  }

  /**
   * Extract hook names from hook files
   */
  private extractHookNames(content: string, filePath: string): string[] {
    const hooks: string[] = [];

    try {
      // Match custom hook declarations
      const hookPattern = /export\s+(?:const|function)\s+(use\w+)/g;
      let match;

      while ((match = hookPattern.exec(content)) !== null) {
        hooks.push(match[1]);
      }

      return hooks;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract hook names from ${filePath}: ${error}`,
          filePath
        )
      );
      return [];
    }
  }

  /**
   * Extract context names from context files
   */
  private extractContextNames(content: string, filePath: string): string[] {
    const contexts: string[] = [];

    try {
      // Match React context declarations
      const contextPattern = /createContext<.*?>\s*\(\s*.*?\s*\)|export\s+const\s+(\w+Context)/g;
      let match;

      while ((match = contextPattern.exec(content)) !== null) {
        if (match[1]) {
          contexts.push(match[1]);
        }
      }

      // Also look for context providers
      const providerPattern = /export\s+const\s+(\w+Provider)/g;
      while ((match = providerPattern.exec(content)) !== null) {
        contexts.push(match[1]);
      }

      return contexts;
    } catch (error) {
      this.errorHandler.handleError(
        this.errorHandler.createError(
          'parsing',
          'warning',
          `Failed to extract context names from ${filePath}: ${error}`,
          filePath
        )
      );
      return [];
    }
  }

  /**
   * Create feature mapping utilities
   */
  createFeatureMap(
    components: string[],
    hooks: string[],
    contexts: string[],
    implementedFeatures: string[]
  ): Record<string, any> {
    return {
      ui: {
        components: components.length,
        componentList: components
      },
      logic: {
        hooks: hooks.length,
        hookList: hooks
      },
      state: {
        contexts: contexts.length,
        contextList: contexts
      },
      features: {
        implemented: implementedFeatures.length,
        featureList: implementedFeatures
      }
    };
  }
}