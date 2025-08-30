# Design Document - Riorganizzazione Documentazione

## Overview

Il sistema di riorganizzazione della documentazione è progettato per consolidare tutti i documenti sparsi del progetto The Safe Place nella cartella `documentazione/`, mantenendo la struttura organizzativa esistente e migliorandola. Il sistema utilizzerà script automatizzati per garantire sicurezza e tracciabilità durante il processo di spostamento.

## Architecture

### Struttura Target

```
documentazione/
├── api/                          # ← Contenuto da docs/
│   ├── api-documentation.md
│   ├── crafting-system.md
│   └── crafting-user-guide.md
├── analisi/                      # ← Esistente, mantenuta
├── anti-regressione/             # ← Esistente, mantenuta
├── archivio/                     # ← Esistente, mantenuta
├── changelog/                    # ← Esistente, mantenuta
├── commit/                       # ← Esistente, mantenuta
├── consolidamento/               # ← Esistente, mantenuta
├── dsar/                         # ← Esistente, mantenuta
├── incidenti/                    # ← Esistente, mantenuta
├── roadmap/                      # ← Esistente, mantenuta
├── session-log/                  # ← Esistente, mantenuta
├── test/                         # ← Esistente, mantenuta
├── testing/                      # ← Esistente, mantenuta
├── versioni/                     # ← Esistente, mantenuta
├── root-docs/                    # ← Nuova: documenti dalla root
│   ├── ANALISI-CORRETTA-v0.7.0.md
│   ├── ANTI-REGRESSIONE-v0.8.3-CRAFTING-STYLE.md
│   ├── bug-fixes-verification.md
│   ├── CHANGELOG-v0.7.1.md
│   ├── CHANGELOG-v0.8.0.md
│   ├── CHANGELOG-v0.8.1.md
│   ├── CHANGELOG-v0.8.3-CRAFTING-STYLE-OMOLOGATION.md
│   ├── CONSOLIDAMENTO-v0.7.1-CHECKLIST.md
│   ├── CONSOLIDAMENTO-v0.8.0-CHECKLIST.md
│   ├── CONSOLIDAMENTO-v0.8.1-CHECKLIST.md
│   ├── CONSOLIDAMENTO-v0.8.3-FINALE.md
│   ├── eventi-GDD.md
│   ├── ROADMAP-CORRETTA-v0.7.0.md
│   └── ROADMAP-RIPRISTINO-TSP.md
├── index.md                      # ← Esistente, da aggiornare
├── index-release.md              # ← Esistente, da aggiornare
└── INDICE-DOCUMENTAZIONE-CONSOLIDATO.md  # ← Esistente, da aggiornare
```

### Categorizzazione Documenti Root

I documenti nella root saranno categorizzati come segue:

1. **API Documentation** → `documentazione/api/`
   - `docs/api-documentation.md`
   - `docs/crafting-system.md`
   - `docs/crafting-user-guide.md`

2. **Root Documents** → `documentazione/root-docs/`
   - Tutti i file `.md` dalla root che non appartengono ad altre categorie

3. **Changelog** → `documentazione/changelog/` (se non già presenti)
   - File che iniziano con `CHANGELOG-`

4. **Anti-Regressione** → `documentazione/anti-regressione/` (se non già presenti)
   - File che iniziano con `ANTI-REGRESSIONE-`

5. **Consolidamento** → `documentazione/consolidamento/` (se non già presenti)
   - File che iniziano con `CONSOLIDAMENTO-`

## Components and Interfaces

### 1. File Scanner Component

```typescript
interface FileScanner {
  scanRootDirectory(): Promise<DocumentFile[]>;
  scanDocsDirectory(): Promise<DocumentFile[]>;
  categorizeFile(file: DocumentFile): DocumentCategory;
}

interface DocumentFile {
  path: string;
  name: string;
  content: string;
  size: number;
  lastModified: Date;
}

type DocumentCategory = 
  | 'api'
  | 'changelog' 
  | 'anti-regressione'
  | 'consolidamento'
  | 'root-docs'
  | 'unknown';
```

### 2. Reference Updater Component

```typescript
interface ReferenceUpdater {
  findReferences(content: string): Reference[];
  updateReferences(content: string, mappings: PathMapping[]): string;
  validateReferences(content: string): ValidationResult;
}

interface Reference {
  originalPath: string;
  lineNumber: number;
  context: string;
}

interface PathMapping {
  oldPath: string;
  newPath: string;
}
```

### 3. Backup Manager Component

```typescript
interface BackupManager {
  createBackup(): Promise<BackupInfo>;
  restoreBackup(backupId: string): Promise<void>;
  listBackups(): BackupInfo[];
  cleanupOldBackups(): Promise<void>;
}

interface BackupInfo {
  id: string;
  timestamp: Date;
  files: string[];
  size: number;
}
```

### 4. Migration Orchestrator

```typescript
interface MigrationOrchestrator {
  planMigration(): Promise<MigrationPlan>;
  executeMigration(plan: MigrationPlan): Promise<MigrationResult>;
  validateMigration(result: MigrationResult): Promise<ValidationResult>;
  rollbackMigration(backupId: string): Promise<void>;
}

interface MigrationPlan {
  filesToMove: FileOperation[];
  referencesToUpdate: ReferenceUpdate[];
  directoriesToCreate: string[];
  directoriesToRemove: string[];
}

interface FileOperation {
  source: string;
  destination: string;
  category: DocumentCategory;
  action: 'move' | 'copy' | 'delete';
}
```

## Data Models

### Configuration Model

```typescript
interface ReorganizationConfig {
  sourceDirectories: string[];
  targetDirectory: string;
  categoryMappings: Record<DocumentCategory, string>;
  excludePatterns: string[];
  backupEnabled: boolean;
  dryRun: boolean;
}
```

### Report Model

```typescript
interface MigrationReport {
  timestamp: Date;
  totalFiles: number;
  filesProcessed: number;
  filesSkipped: number;
  errors: MigrationError[];
  warnings: string[];
  operations: CompletedOperation[];
  duration: number;
}

interface CompletedOperation {
  type: 'move' | 'copy' | 'delete' | 'update';
  source: string;
  destination?: string;
  success: boolean;
  error?: string;
}
```

## Error Handling

### Error Categories

1. **File System Errors**
   - Permessi insufficienti
   - File in uso
   - Spazio disco insufficiente
   - Path troppo lunghi

2. **Content Errors**
   - Encoding non supportato
   - File corrotti
   - Riferimenti circolari

3. **Validation Errors**
   - Link rotti dopo migrazione
   - Struttura directory invalida
   - Conflitti di naming

### Error Recovery Strategy

```typescript
interface ErrorRecoveryStrategy {
  handleFileSystemError(error: FileSystemError): RecoveryAction;
  handleContentError(error: ContentError): RecoveryAction;
  handleValidationError(error: ValidationError): RecoveryAction;
}

type RecoveryAction = 
  | 'retry'
  | 'skip'
  | 'abort'
  | 'manual-intervention';
```

### Rollback Mechanism

1. **Automatic Rollback Triggers**
   - Più del 10% di errori
   - Errori critici (corruzione dati)
   - Interruzione utente

2. **Manual Rollback**
   - Comando esplicito dell'utente
   - Validazione fallita post-migrazione

## Testing Strategy

### Unit Tests

1. **File Scanner Tests**
   - Scansione directory corretta
   - Categorizzazione file accurata
   - Gestione file speciali

2. **Reference Updater Tests**
   - Identificazione riferimenti corretta
   - Aggiornamento path accurato
   - Preservazione formato originale

3. **Backup Manager Tests**
   - Creazione backup completi
   - Ripristino accurato
   - Cleanup automatico

### Integration Tests

1. **End-to-End Migration**
   - Migrazione completa su dataset test
   - Validazione integrità post-migrazione
   - Performance su grandi volumi

2. **Error Scenarios**
   - Gestione errori file system
   - Recovery da interruzioni
   - Rollback completo

### Validation Tests

1. **Reference Integrity**
   - Tutti i link funzionanti
   - Path relativi corretti
   - Nessun riferimento rotto

2. **Content Preservation**
   - Contenuto file invariato
   - Metadata preservati
   - Encoding mantenuto

## Performance Considerations

### Optimization Strategies

1. **Batch Processing**
   - Elaborazione file in batch
   - Parallelizzazione operazioni I/O
   - Memory management efficiente

2. **Incremental Processing**
   - Checkpoint intermedi
   - Resume da interruzioni
   - Progress tracking

3. **Caching**
   - Cache risultati scansione
   - Cache mappings riferimenti
   - Cache validazioni

### Resource Management

```typescript
interface ResourceManager {
  maxConcurrentOperations: number;
  memoryLimit: number;
  tempDirectoryPath: string;
  cleanupTempFiles(): Promise<void>;
}
```

## Security Considerations

### File System Security

1. **Permission Validation**
   - Verifica permessi lettura/scrittura
   - Controllo ownership file
   - Validazione path sicuri

2. **Content Validation**
   - Scansione malware opzionale
   - Validazione encoding
   - Controllo dimensioni file

### Backup Security

1. **Backup Integrity**
   - Checksum per validazione
   - Encryption opzionale
   - Accesso controllato

2. **Cleanup Security**
   - Secure deletion
   - Audit trail
   - Retention policy

## Implementation Phases

### Phase 1: Infrastructure Setup
- Creazione struttura directory target
- Implementazione backup system
- Setup logging e monitoring

### Phase 2: File Analysis
- Scansione e categorizzazione file
- Analisi riferimenti
- Generazione migration plan

### Phase 3: Migration Execution
- Esecuzione spostamenti file
- Aggiornamento riferimenti
- Validazione continua

### Phase 4: Validation & Cleanup
- Validazione finale integrità
- Cleanup file temporanei
- Generazione report finale

## Monitoring and Logging

### Logging Strategy

```typescript
interface MigrationLogger {
  logOperation(operation: FileOperation): void;
  logError(error: MigrationError): void;
  logProgress(progress: ProgressInfo): void;
  generateReport(): MigrationReport;
}

interface ProgressInfo {
  phase: string;
  completedItems: number;
  totalItems: number;
  estimatedTimeRemaining: number;
}
```

### Monitoring Metrics

1. **Performance Metrics**
   - Throughput (file/sec)
   - Memory usage
   - Disk I/O

2. **Quality Metrics**
   - Success rate
   - Error rate
   - Validation pass rate

3. **Business Metrics**
   - Files migrated
   - References updated
   - Time saved

## Configuration Management

### Default Configuration

```typescript
const DEFAULT_CONFIG: ReorganizationConfig = {
  sourceDirectories: ['.', 'docs'],
  targetDirectory: 'documentazione',
  categoryMappings: {
    'api': 'api',
    'changelog': 'changelog',
    'anti-regressione': 'anti-regressione',
    'consolidamento': 'consolidamento',
    'root-docs': 'root-docs'
  },
  excludePatterns: [
    'node_modules/**',
    '.git/**',
    '.kiro/**',
    '*.log',
    '*.tmp'
  ],
  backupEnabled: true,
  dryRun: false
};
```

### Environment-Specific Overrides

- Development: `dryRun: true`, verbose logging
- Production: `backupEnabled: true`, minimal logging
- Testing: isolated directories, cleanup automatico