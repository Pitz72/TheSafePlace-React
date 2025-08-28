/**
 * Scanner TODO, FIXME e Commenti Sviluppo
 * Task 8.1 - Identificazione funzionalità incomplete
 * 
 * Scansiona il codebase per:
 * - Commenti TODO/FIXME
 * - Funzionalità parzialmente implementate
 * - Commenti che indicano problemi noti
 * - Work-in-progress abbandonato
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TodoFixmeScanner {
    constructor() {
        this.srcPath = path.join(process.cwd(), 'src');
        this.results = {
            todoComments: [],
            fixmeComments: [],
            developmentComments: [],
            deprecatedCode: [],
            partialImplementations: [],
            workInProgress: [],
            summary: {}
        };
        this.patterns = {
            todo: /(?:\/\/|\/\*|\*|#)\s*TODO:?\s*(.+)/gi,
            fixme: /(?:\/\/|\/\*|\*|#)\s*FIXME:?\s*(.+)/gi,
            hack: /(?:\/\/|\/\*|\*|#)\s*HACK:?\s*(.+)/gi,
            temp: /(?:\/\/|\/\*|\*|#)\s*(?:TEMP|TEMPORARY):?\s*(.+)/gi,
            note: /(?:\/\/|\/\*|\*|#)\s*NOTE:?\s*(.+)/gi,
            bug: /(?:\/\/|\/\*|\*|#)\s*BUG:?\s*(.+)/gi,
            deprecated: /(?:\/\/|\/\*|\*|#).*(?:deprecated|obsolete|legacy)/gi,
            partial: /(?:\/\/|\/\*|\*|#).*(?:partial|incomplete|unfinished|not implemented|placeholder)/gi,
            wip: /(?:\/\/|\/\*|\*|#).*(?:work in progress|wip|coming soon|future|later|eventually)/gi,
            console: /console\.(log|warn|error|debug|info)\s*\(/gi
        };
    }

    async scanCodebase() {
        console.log('🔍 Avvio scansione TODO, FIXME e commenti sviluppo...\n');
        
        try {
            await this.scanDirectory(this.srcPath);
            await this.analyzeResults();
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Errore durante scansione:', error);
            throw error;
        }
    }

    async scanDirectory(dirPath) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                // Salta node_modules e altre directory non rilevanti
                if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
                    await this.scanDirectory(fullPath);
                }
            } else if (this.shouldScanFile(entry.name)) {
                await this.scanFile(fullPath);
            }
        }
    }

    shouldScanFile(filename) {
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'];
        return extensions.some(ext => filename.endsWith(ext));
    }

    async scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const relativePath = path.relative(process.cwd(), filePath);
            
            lines.forEach((line, index) => {
                const lineNumber = index + 1;
                
                // Scansiona per ogni pattern
                this.scanLineForPattern(relativePath, lineNumber, line, 'todo', this.patterns.todo, this.results.todoComments);
                this.scanLineForPattern(relativePath, lineNumber, line, 'fixme', this.patterns.fixme, this.results.fixmeComments);
                this.scanLineForPattern(relativePath, lineNumber, line, 'deprecated', this.patterns.deprecated, this.results.deprecatedCode);
                this.scanLineForPattern(relativePath, lineNumber, line, 'partial', this.patterns.partial, this.results.partialImplementations);
                this.scanLineForPattern(relativePath, lineNumber, line, 'wip', this.patterns.wip, this.results.workInProgress);
                
                // Scansiona commenti di sviluppo generici
                this.scanDevelopmentComments(relativePath, lineNumber, line);
            });
            
        } catch (error) {
            console.warn(`⚠️  Errore leggendo ${filePath}:`, error.message);
        }
    }

    scanLineForPattern(filePath, lineNumber, line, type, pattern, resultArray) {
        pattern.lastIndex = 0; // Reset regex
        const matches = [...line.matchAll(pattern)];
        
        for (const match of matches) {
            resultArray.push({
                file: filePath,
                line: lineNumber,
                type,
                content: line.trim(),
                comment: match[1] || match[0],
                severity: this.calculateSeverity(type, match[0])
            });
        }
    }

    scanDevelopmentComments(filePath, lineNumber, line) {
        // Cerca pattern di commenti di sviluppo
        const devPatterns = [
            { pattern: this.patterns.hack, type: 'hack' },
            { pattern: this.patterns.temp, type: 'temporary' },
            { pattern: this.patterns.note, type: 'note' },
            { pattern: this.patterns.bug, type: 'bug' },
            { pattern: this.patterns.console, type: 'console_log' }
        ];

        for (const { pattern, type } of devPatterns) {
            pattern.lastIndex = 0;
            const matches = [...line.matchAll(pattern)];
            
            for (const match of matches) {
                this.results.developmentComments.push({
                    file: filePath,
                    line: lineNumber,
                    type,
                    content: line.trim(),
                    comment: match[1] || match[0],
                    severity: this.calculateSeverity(type, match[0])
                });
            }
        }
    }

    calculateSeverity(type, content) {
        const highSeverityKeywords = ['critical', 'urgent', 'important', 'bug', 'error', 'broken'];
        const mediumSeverityKeywords = ['deprecated', 'fixme', 'hack', 'temporary'];
        const lowSeverityKeywords = ['todo', 'note', 'future', 'later'];

        const lowerContent = content.toLowerCase();
        
        if (highSeverityKeywords.some(keyword => lowerContent.includes(keyword))) {
            return 'high';
        } else if (mediumSeverityKeywords.some(keyword => lowerContent.includes(keyword))) {
            return 'medium';
        } else if (lowSeverityKeywords.some(keyword => lowerContent.includes(keyword))) {
            return 'low';
        }
        
        // Default severity based on type
        switch (type) {
            case 'fixme':
            case 'bug':
                return 'high';
            case 'hack':
            case 'deprecated':
            case 'temporary':
                return 'medium';
            case 'todo':
            case 'note':
            case 'wip':
                return 'low';
            default:
                return 'low';
        }
    }

    async analyzeResults() {
        console.log('📊 Analisi risultati scansione...');
        
        const totalFiles = await this.countScannedFiles();
        const totalComments = this.results.todoComments.length + 
                             this.results.fixmeComments.length + 
                             this.results.developmentComments.length + 
                             this.results.deprecatedCode.length + 
                             this.results.partialImplementations.length + 
                             this.results.workInProgress.length;

        // Raggruppa per file
        const fileGroups = {};
        const allComments = [
            ...this.results.todoComments,
            ...this.results.fixmeComments,
            ...this.results.developmentComments,
            ...this.results.deprecatedCode,
            ...this.results.partialImplementations,
            ...this.results.workInProgress
        ];

        for (const comment of allComments) {
            if (!fileGroups[comment.file]) {
                fileGroups[comment.file] = [];
            }
            fileGroups[comment.file].push(comment);
        }

        // Raggruppa per severità
        const severityGroups = {
            high: allComments.filter(c => c.severity === 'high'),
            medium: allComments.filter(c => c.severity === 'medium'),
            low: allComments.filter(c => c.severity === 'low')
        };

        this.results.summary = {
            totalFiles,
            totalComments,
            fileGroups,
            severityGroups,
            byType: {
                todo: this.results.todoComments.length,
                fixme: this.results.fixmeComments.length,
                development: this.results.developmentComments.length,
                deprecated: this.results.deprecatedCode.length,
                partial: this.results.partialImplementations.length,
                wip: this.results.workInProgress.length
            }
        };

        console.log(`  📁 File scansionati: ${totalFiles}`);
        console.log(`  💬 Commenti trovati: ${totalComments}`);
        console.log(`  🔴 Alta priorità: ${severityGroups.high.length}`);
        console.log(`  🟡 Media priorità: ${severityGroups.medium.length}`);
        console.log(`  🟢 Bassa priorità: ${severityGroups.low.length}`);
    }

    async countScannedFiles() {
        let count = 0;
        
        const countInDirectory = (dirPath) => {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
                        countInDirectory(fullPath);
                    }
                } else if (this.shouldScanFile(entry.name)) {
                    count++;
                }
            }
        };
        
        countInDirectory(this.srcPath);
        return count;
    }

    async generateReport() {
        console.log('📄 Generazione report...');
        
        const reportPath = path.join(process.cwd(), 'analisi-microscopica/08-incomplete/todo-fixme-analysis-detailed.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Genera anche report markdown
        await this.generateMarkdownReport();
        
        console.log('\n📊 RISULTATI FINALI:');
        console.log(`  📦 File scansionati: ${this.results.summary.totalFiles}`);
        console.log(`  💬 Commenti totali: ${this.results.summary.totalComments}`);
        
        console.log('\n📋 Per tipo:');
        console.log(`  📝 TODO: ${this.results.summary.byType.todo}`);
        console.log(`  🔧 FIXME: ${this.results.summary.byType.fixme}`);
        console.log(`  🚧 Deprecated: ${this.results.summary.byType.deprecated}`);
        console.log(`  ⚠️  Parziali: ${this.results.summary.byType.partial}`);
        console.log(`  🔄 Work in Progress: ${this.results.summary.byType.wip}`);
        console.log(`  💻 Sviluppo: ${this.results.summary.byType.development}`);
        
        console.log('\n🎯 Per priorità:');
        console.log(`  🔴 Alta: ${this.results.summary.severityGroups.high.length}`);
        console.log(`  🟡 Media: ${this.results.summary.severityGroups.medium.length}`);
        console.log(`  🟢 Bassa: ${this.results.summary.severityGroups.low.length}`);

        if (this.results.summary.severityGroups.high.length > 0) {
            console.log('\n🔴 PROBLEMI AD ALTA PRIORITÀ:');
            this.results.summary.severityGroups.high.forEach(comment => {
                console.log(`  - ${comment.file}:${comment.line} [${comment.type.toUpperCase()}] ${comment.comment}`);
            });
        }

        console.log(`\n📄 Report dettagliato salvato in: ${reportPath}`);
    }

    async generateMarkdownReport() {
        const markdownPath = path.join(process.cwd(), 'analisi-microscopica/08-incomplete/todo-fixme-detailed-report.md');
        
        let markdown = `# Analisi Dettagliata TODO, FIXME e Commenti Sviluppo

## Informazioni Scansione
- **Data**: ${new Date().toLocaleDateString('it-IT')}
- **File Scansionati**: ${this.results.summary.totalFiles}
- **Commenti Totali**: ${this.results.summary.totalComments}

## Sommario per Tipo

| Tipo | Quantità | Descrizione |
|------|----------|-------------|
| TODO | ${this.results.summary.byType.todo} | Funzionalità da implementare |
| FIXME | ${this.results.summary.byType.fixme} | Bug da correggere |
| Deprecated | ${this.results.summary.byType.deprecated} | Codice obsoleto |
| Parziali | ${this.results.summary.byType.partial} | Implementazioni incomplete |
| Work in Progress | ${this.results.summary.byType.wip} | Lavori in corso |
| Sviluppo | ${this.results.summary.byType.development} | Commenti di debug/sviluppo |

## Sommario per Priorità

| Priorità | Quantità | Azione Raccomandata |
|----------|----------|---------------------|
| 🔴 Alta | ${this.results.summary.severityGroups.high.length} | Correzione immediata |
| 🟡 Media | ${this.results.summary.severityGroups.medium.length} | Pianificare correzione |
| 🟢 Bassa | ${this.results.summary.severityGroups.low.length} | Correzione quando possibile |

`;

        // Sezioni dettagliate per ogni tipo
        if (this.results.summary.severityGroups.high.length > 0) {
            markdown += `\n## 🔴 Problemi Alta Priorità\n\n`;
            this.results.summary.severityGroups.high.forEach(comment => {
                markdown += `### ${comment.file}:${comment.line}\n`;
                markdown += `**Tipo**: ${comment.type.toUpperCase()}\n`;
                markdown += `**Contenuto**: \`${comment.content}\`\n`;
                markdown += `**Commento**: ${comment.comment}\n\n`;
            });
        }

        if (this.results.deprecatedCode.length > 0) {
            markdown += `\n## 🚧 Codice Deprecated\n\n`;
            this.results.deprecatedCode.forEach(comment => {
                markdown += `- **${comment.file}:${comment.line}**: ${comment.comment}\n`;
            });
        }

        if (this.results.partialImplementations.length > 0) {
            markdown += `\n## ⚠️ Implementazioni Parziali\n\n`;
            this.results.partialImplementations.forEach(comment => {
                markdown += `- **${comment.file}:${comment.line}**: ${comment.comment}\n`;
            });
        }

        // File con più commenti
        const filesWithMostComments = Object.entries(this.results.summary.fileGroups)
            .sort(([,a], [,b]) => b.length - a.length)
            .slice(0, 10);

        if (filesWithMostComments.length > 0) {
            markdown += `\n## 📁 File con Più Commenti\n\n`;
            filesWithMostComments.forEach(([file, comments]) => {
                markdown += `- **${file}**: ${comments.length} commenti\n`;
            });
        }

        markdown += `\n## Raccomandazioni

### Immediate (Alta Priorità)
${this.results.summary.severityGroups.high.length > 0 ? 
    '- Correggere tutti i problemi ad alta priorità identificati\n' : 
    '- ✅ Nessun problema ad alta priorità identificato\n'}

### Short-term (Media Priorità)
${this.results.summary.byType.deprecated > 0 ? 
    '- Rimuovere o aggiornare codice deprecated\n' : ''}${this.results.summary.byType.partial > 0 ? 
    '- Completare implementazioni parziali\n' : ''}${this.results.summary.severityGroups.medium.length === 0 ? 
    '- ✅ Pochi problemi a media priorità\n' : ''}

### Long-term (Bassa Priorità)
${this.results.summary.byType.todo > 0 ? 
    '- Implementare funzionalità TODO quando possibile\n' : ''}${this.results.summary.byType.development > 0 ? 
    '- Rimuovere commenti di debug/sviluppo\n' : ''}

---

*Report generato automaticamente dal TODO/FIXME Scanner - Task 8.1*
`;

        fs.writeFileSync(markdownPath, markdown);
        console.log(`📄 Report markdown salvato in: ${markdownPath}`);
    }
}

// Esecuzione diretta
const scanner = new TodoFixmeScanner();
scanner.scanCodebase()
    .then(() => {
        console.log('\n✅ Scansione completata con successo!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Scansione fallita:', error);
        process.exit(1);
    });

export default TodoFixmeScanner;