/**
 * File System Reader for real file analysis
 * The Safe Place - Documentation Refactoring v0.4.0
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

export class FileSystemReader {
  /**
   * Read all project files for analysis
   */
  async readProjectFiles(rootPath: string = '.'): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    
    try {
      // Read key project files
      await this.readKeyFiles(files, rootPath);
      
      // Read source code files
      await this.readSourceFiles(files, rootPath);
      
      // Read documentation files
      await this.readDocumentationFiles(files, rootPath);
      
      return files;
    } catch (error) {
      console.error('Failed to read project files:', error);
      return new Map();
    }
  }

  /**
   * Read key project configuration files
   */
  private async readKeyFiles(files: Map<string, string>, rootPath: string): Promise<void> {
    const keyFiles = [
      'package.json',
      'README.md',
      'index.html',
      'vite.config.ts',
      'tsconfig.json',
      'tsconfig.app.json'
    ];

    for (const fileName of keyFiles) {
      try {
        const filePath = join(rootPath, fileName);
        const content = await readFile(filePath, 'utf-8');
        files.set(fileName, content);
      } catch (error) {
        // File doesn't exist, skip
        console.warn(`Key file ${fileName} not found`);
      }
    }
  }

  /**
   * Read source code files
   */
  private async readSourceFiles(files: Map<string, string>, rootPath: string): Promise<void> {
    const srcPath = join(rootPath, 'src');
    
    try {
      await this.readDirectoryRecursive(files, srcPath, 'src', ['.tsx', '.ts', '.css']);
    } catch (error) {
      console.warn('Source directory not found or inaccessible');
    }
  }

  /**
   * Read documentation files
   */
  private async readDocumentationFiles(files: Map<string, string>, rootPath: string): Promise<void> {
    const docPath = join(rootPath, 'documentazione');
    
    try {
      await this.readDirectoryRecursive(files, docPath, 'documentazione', ['.md', '.txt']);
    } catch (error) {
      console.warn('Documentation directory not found or inaccessible');
    }
  }

  /**
   * Read directory recursively
   */
  private async readDirectoryRecursive(
    files: Map<string, string>,
    dirPath: string,
    relativePath: string,
    allowedExtensions: string[]
  ): Promise<void> {
    try {
      const entries = await readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const relativeFilePath = join(relativePath, entry).replace(/\\/g, '/');
        
        try {
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            // Recursively read subdirectory
            await this.readDirectoryRecursive(files, fullPath, relativeFilePath, allowedExtensions);
          } else if (stats.isFile()) {
            const ext = extname(entry);
            if (allowedExtensions.includes(ext)) {
              const content = await readFile(fullPath, 'utf-8');
              files.set(relativeFilePath, content);
            }
          }
        } catch (error) {
          console.warn(`Failed to read ${relativeFilePath}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${dirPath}:`, error);
    }
  }

  /**
   * Get file statistics
   */
  async getProjectStats(rootPath: string = '.'): Promise<{
    totalFiles: number;
    sourceFiles: number;
    documentationFiles: number;
    configFiles: number;
  }> {
    const files = await this.readProjectFiles(rootPath);
    
    let sourceFiles = 0;
    let documentationFiles = 0;
    let configFiles = 0;
    
    for (const [filePath] of files) {
      if (filePath.startsWith('src/')) {
        sourceFiles++;
      } else if (filePath.startsWith('documentazione/')) {
        documentationFiles++;
      } else {
        configFiles++;
      }
    }
    
    return {
      totalFiles: files.size,
      sourceFiles,
      documentationFiles,
      configFiles
    };
  }
}