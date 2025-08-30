/**
 * Backup Manager for Documentation Reorganization
 * The Safe Place - Documentation Management System
 */

import { BackupInfo, DocumentFile } from './config.js';
import { MigrationLogger } from './logger.js';

export class BackupManager {
  private logger: MigrationLogger;
  private backupDir: string;

  constructor(logger: MigrationLogger, backupDir: string = 'scripts/documentation-reorganization/backups') {
    this.logger = logger;
    this.backupDir = backupDir;
  }

  async createBackup(files: DocumentFile[]): Promise<BackupInfo> {
    const backupId = this.generateBackupId();
    const backupPath = `${this.backupDir}/${backupId}`;
    
    this.logger.info(`💾 Creating backup: ${backupId}`);
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Create backup directory
      await fs.mkdir(backupPath, { recursive: true });
      
      const backedUpFiles: string[] = [];
      let totalSize = 0;
      
      // Create progress tracker
      const progress = this.logger.createProgressTracker(files.length, 'Backup Creation');
      
      // Copy each file to backup directory
      for (const file of files) {
        try {
          // Create subdirectory structure in backup
          const relativePath = file.path.startsWith('./') ? file.path.slice(2) : file.path;
          const backupFilePath = path.join(backupPath, relativePath);
          const backupFileDir = path.dirname(backupFilePath);
          
          // Ensure directory exists
          await fs.mkdir(backupFileDir, { recursive: true });
          
          // Copy file
          await fs.copyFile(file.path, backupFilePath);
          
          backedUpFiles.push(relativePath);
          totalSize += file.size;
          
          progress.increment(`Backing up ${file.name}`);
        } catch (error) {
          this.logger.error(`Failed to backup file ${file.path}:`, error);
          throw error;
        }
      }
      
      progress.complete();
      
      // Create backup manifest
      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp: new Date(),
        files: backedUpFiles,
        size: totalSize,
        path: backupPath
      };
      
      await this.saveBackupManifest(backupInfo);
      
      this.logger.info(`✅ Backup created successfully: ${backupId} (${backedUpFiles.length} files, ${this.formatSize(totalSize)})`);
      
      return backupInfo;
    } catch (error) {
      this.logger.error(`Failed to create backup ${backupId}:`, error);
      throw error;
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    this.logger.info(`🔄 Restoring backup: ${backupId}`);
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const backupInfo = await this.loadBackupManifest(backupId);
      const backupPath = backupInfo.path;
      
      // Verify backup exists
      try {
        await fs.access(backupPath);
      } catch {
        throw new Error(`Backup ${backupId} not found at ${backupPath}`);
      }
      
      const progress = this.logger.createProgressTracker(backupInfo.files.length, 'Backup Restoration');
      
      // Restore each file
      for (const relativePath of backupInfo.files) {
        try {
          const backupFilePath = path.join(backupPath, relativePath);
          const originalPath = relativePath;
          
          // Ensure target directory exists
          const targetDir = path.dirname(originalPath);
          if (targetDir !== '.') {
            await fs.mkdir(targetDir, { recursive: true });
          }
          
          // Copy file back to original location
          await fs.copyFile(backupFilePath, originalPath);
          
          progress.increment(`Restoring ${path.basename(originalPath)}`);
        } catch (error) {
          this.logger.error(`Failed to restore file ${relativePath}:`, error);
          throw error;
        }
      }
      
      progress.complete();
      
      this.logger.info(`✅ Backup restored successfully: ${backupId}`);
    } catch (error) {
      this.logger.error(`Failed to restore backup ${backupId}:`, error);
      throw error;
    }
  }

  async listBackups(): Promise<BackupInfo[]> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Check if backup directory exists
      try {
        await fs.access(this.backupDir);
      } catch {
        return [];
      }
      
      const backupDirs = await fs.readdir(this.backupDir, { withFileTypes: true });
      const backups: BackupInfo[] = [];
      
      for (const dir of backupDirs) {
        if (dir.isDirectory()) {
          try {
            const backupInfo = await this.loadBackupManifest(dir.name);
            backups.push(backupInfo);
          } catch (error) {
            this.logger.warn(`Failed to load backup manifest for ${dir.name}:`, error);
          }
        }
      }
      
      // Sort by timestamp (newest first)
      backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      return backups;
    } catch (error) {
      this.logger.error('Failed to list backups:', error);
      return [];
    }
  }

  async cleanupOldBackups(maxBackups: number = 5): Promise<void> {
    this.logger.info(`🧹 Cleaning up old backups (keeping ${maxBackups} most recent)...`);
    
    try {
      const backups = await this.listBackups();
      
      if (backups.length <= maxBackups) {
        this.logger.info('No cleanup needed');
        return;
      }
      
      const backupsToDelete = backups.slice(maxBackups);
      const fs = await import('fs/promises');
      
      for (const backup of backupsToDelete) {
        try {
          await fs.rm(backup.path, { recursive: true, force: true });
          this.logger.info(`🗑️  Deleted old backup: ${backup.id}`);
        } catch (error) {
          this.logger.error(`Failed to delete backup ${backup.id}:`, error);
        }
      }
      
      this.logger.info(`✅ Cleanup completed: removed ${backupsToDelete.length} old backups`);
    } catch (error) {
      this.logger.error('Failed to cleanup old backups:', error);
    }
  }

  private generateBackupId(): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const random = Math.random().toString(36).substring(2, 8);
    return `backup-${timestamp}-${random}`;
  }

  private async saveBackupManifest(backupInfo: BackupInfo): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const manifestPath = path.join(backupInfo.path, 'manifest.json');
    const manifestContent = JSON.stringify(backupInfo, null, 2);
    
    await fs.writeFile(manifestPath, manifestContent, 'utf-8');
  }

  private async loadBackupManifest(backupId: string): Promise<BackupInfo> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const manifestPath = path.join(this.backupDir, backupId, 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const backupInfo = JSON.parse(manifestContent) as BackupInfo;
    
    // Convert timestamp string back to Date object
    backupInfo.timestamp = new Date(backupInfo.timestamp);
    
    return backupInfo;
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  }

  // Utility method to verify backup integrity
  async verifyBackup(backupId: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const backupInfo = await this.loadBackupManifest(backupId);
      
      // Check if all files exist in backup
      for (const relativePath of backupInfo.files) {
        const backupFilePath = path.join(backupInfo.path, relativePath);
        try {
          await fs.access(backupFilePath);
        } catch {
          this.logger.error(`Backup verification failed: missing file ${relativePath}`);
          return false;
        }
      }
      
      this.logger.info(`✅ Backup ${backupId} verification passed`);
      return true;
    } catch (error) {
      this.logger.error(`Backup verification failed for ${backupId}:`, error);
      return false;
    }
  }

  // Emergency restore method that doesn't require manifest
  async emergencyRestore(backupPath: string): Promise<void> {
    this.logger.warn(`🚨 Performing emergency restore from ${backupPath}`);
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Recursively copy all files from backup to current directory
      await this.copyDirectoryRecursive(backupPath, '.');
      
      this.logger.info('✅ Emergency restore completed');
    } catch (error) {
      this.logger.error('Emergency restore failed:', error);
      throw error;
    }
  }

  private async copyDirectoryRecursive(source: string, destination: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDirectoryRecursive(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }
}