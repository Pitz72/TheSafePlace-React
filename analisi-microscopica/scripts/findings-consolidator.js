#!/usr/bin/env node

/**
 * Findings Consolidator
 * Aggrega e consolida tutti i findings da tutte le fasi di analisi
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FindingsConsolidator {
  constructor() {
    this.allFindings = [];
    this.consolidatedFindings = [];
    this.categories = new Map();
    this.severityLevels = new Map();
    this.duplicates = [];
    this.metrics = {
      totalFindings: 0,
      criticalFindings: 0,
      highFindings: 0,
      mediumFindings: 0,
      lowFindings: 0,
      duplicatesRemoved: 0
    };
  }

  async consolidateAllFindings() {
    console.log('🔄 Avvio consolidamento findings da tutti i moduli...\n');

    // Carica findings da tutti i moduli
    await this.loadFindingsFromAllModules();
    
    // Elimina duplicati e consolida
    await this.removeDuplicatesAndConsolidate();
    
    // Classifica per categoria e severità
    await this.classifyFindings();
    
    // Calcola metriche aggregate
    await this.calculateAggregateMetrics();
    
    // Genera database unificato
    await this.generateUnifiedDatabase();
    
    console.log('✅ Consolidamento completato');
  }

  async loadFindingsFromAllModules() {
    console.log('📂 Caricamento findings da tutti i moduli...');

    const modules = [
      { name: 'Inventario', path: '01-inventario' },
      { name: 'Architettura', path: '02-architettura' },
      { name: 'Dipendenze', path: '03-dipendenze' },
      { name: 'Funzionalità', path: '04-funzionalita' },
      { name: 'Regressioni', path: '05-regressioni' },
      { name: 'Qualità', path: '06-qualita' },
      { name: 'Consistenza', path: '07-consistenza' },
      { name: 'Incomplete', path: '08-incomplete' }
    ];

    for (const module of modules) {
      await this.loadModuleFindings(module);
    }

    console.log(`📊 Caricati ${this.allFindings.length} findings totali\n`);
  }

  async loadModuleFindings(module) {
    try {
      const modulePath = path.join(process.cwd(), 'analisi-microscopica', module.path);
      const files = await fs.readdir(modulePath);
      
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.md')) {
          await this.extractFindingsFromFile(path.join(modulePath, file), module.name);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Errore caricamento modulo ${module.name}:`, error.message);
    }
  }

  async extractFindingsFromFile(filePath, moduleName) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const filename = path.basename(filePath);

      if (filename.endsWith('.json')) {
        await this.extractFromJSON(content, moduleName, filename);
      } else {
        await this.extractFromMarkdown(content, moduleName, filename);
      }
    } catch (error) {
      // File non leggibile o formato non valido
    }
  }

  async extractFromJSON(content, moduleName, filename) {
    try {
      const data = JSON.parse(content);
      
      // Estrai findings da strutture JSON comuni
      if (data.findings) {
        data.findings.forEach(finding => this.addFinding(finding, moduleName, filename));
      }
      
      if (data.issues) {
        data.issues.forEach(issue => this.addFinding(issue, moduleName, filename));
      }
      
      if (data.problems) {
        data.problems.forEach(problem => this.addFinding(problem, moduleName, filename));
      }
      
      if (data.violations) {
        data.violations.forEach(violation => this.addFinding(violation, moduleName, filename));
      }

      // Strutture specifiche per moduli
      if (data.incompleteComponents) {
        data.incompleteComponents.forEach(comp => {
          this.addFinding({
            type: 'ui_incomplete',
            title: `Componente incompleto: ${comp.name}`,
            description: `Completezza: ${(comp.completeness * 100).toFixed(1)}%`,
            severity: comp.completeness < 0.5 ? 'critical' : 'high',
            category: 'ui',
            component: comp.name,
            details: comp
          }, moduleName, filename);
        });
      }

      if (data.missingFeatures) {
        data.missingFeatures.forEach(feature => {
          this.addFinding({
            type: 'feature_missing',
            title: `Feature mancante: ${feature.name}`,
            description: feature.description || '',
            severity: feature.priority === 'critical' ? 'critical' : 'high',
            category: 'feature',
            details: feature
          }, moduleName, filename);
        });
      }

    } catch (error) {
      // JSON non valido
    }
  }

  async extractFromMarkdown(content, moduleName, filename) {
    // Estrai findings da markdown usando pattern comuni
    const findings = [];

    // Pattern per problemi critici
    const criticalPattern = /🚨.*?CRITICO.*?:(.+?)(?=\n|$)/gi;
    let match;
    while ((match = criticalPattern.exec(content)) !== null) {
      findings.push({
        type: 'critical_issue',
        title: match[1].trim(),
        severity: 'critical',
        category: 'system'
      });
    }

    // Pattern per problemi identificati
    const problemPattern = /❌.*?Problema.*?:(.+?)(?=\n|$)/gi;
    while ((match = problemPattern.exec(content)) !== null) {
      findings.push({
        type: 'problem',
        title: match[1].trim(),
        severity: 'high',
        category: 'issue'
      });
    }

    // Pattern per raccomandazioni
    const recommendationPattern = /🎯.*?Raccomandazione.*?:(.+?)(?=\n|$)/gi;
    while ((match = recommendationPattern.exec(content)) !== null) {
      findings.push({
        type: 'recommendation',
        title: match[1].trim(),
        severity: 'medium',
        category: 'improvement'
      });
    }

    // Pattern per TODO e FIXME
    const todoPattern = /TODO|FIXME.*?:(.+?)(?=\n|$)/gi;
    while ((match = todoPattern.exec(content)) !== null) {
      findings.push({
        type: 'todo',
        title: match[1].trim(),
        severity: 'low',
        category: 'maintenance'
      });
    }

    findings.forEach(finding => this.addFinding(finding, moduleName, filename));
  }

  addFinding(finding, moduleName, filename) {
    const normalizedFinding = {
      id: this.generateFindingId(finding, moduleName),
      module: moduleName,
      source: filename,
      type: finding.type || 'unknown',
      title: finding.title || finding.name || 'Untitled Finding',
      description: finding.description || '',
      severity: this.normalizeSeverity(finding.severity || finding.priority),
      category: this.normalizeCategory(finding.category),
      component: finding.component || null,
      details: finding.details || finding,
      timestamp: new Date().toISOString()
    };

    this.allFindings.push(normalizedFinding);
  }

  generateFindingId(finding, moduleName) {
    const title = finding.title || finding.name || 'unknown';
    const hash = this.simpleHash(moduleName + title);
    return `${moduleName.toLowerCase()}_${hash}`;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  normalizeSeverity(severity) {
    if (!severity) return 'medium';
    
    const sev = severity.toLowerCase();
    if (sev.includes('critical') || sev.includes('critico')) return 'critical';
    if (sev.includes('high') || sev.includes('alto')) return 'high';
    if (sev.includes('medium') || sev.includes('medio')) return 'medium';
    if (sev.includes('low') || sev.includes('basso')) return 'low';
    
    return 'medium';
  }

  normalizeCategory(category) {
    if (!category) return 'general';
    
    const cat = category.toLowerCase();
    const categoryMap = {
      'ui': 'ui',
      'ux': 'ui',
      'interface': 'ui',
      'system': 'system',
      'sistema': 'system',
      'architecture': 'architecture',
      'architettura': 'architecture',
      'performance': 'performance',
      'security': 'security',
      'sicurezza': 'security',
      'feature': 'feature',
      'functionality': 'feature',
      'funzionalita': 'feature',
      'data': 'data',
      'dati': 'data',
      'code': 'code',
      'codice': 'code',
      'documentation': 'documentation',
      'documentazione': 'documentation'
    };

    return categoryMap[cat] || 'general';
  }

  async removeDuplicatesAndConsolidate() {
    console.log('🔄 Rimozione duplicati e consolidamento...');

    const uniqueFindings = new Map();
    
    for (const finding of this.allFindings) {
      const key = this.generateDuplicateKey(finding);
      
      if (uniqueFindings.has(key)) {
        // Duplicato trovato - consolida
        const existing = uniqueFindings.get(key);
        const consolidated = this.consolidateFindings(existing, finding);
        uniqueFindings.set(key, consolidated);
        this.duplicates.push({ original: existing, duplicate: finding });
      } else {
        uniqueFindings.set(key, finding);
      }
    }

    this.consolidatedFindings = Array.from(uniqueFindings.values());
    this.metrics.duplicatesRemoved = this.allFindings.length - this.consolidatedFindings.length;

    console.log(`🗑️ Rimossi ${this.metrics.duplicatesRemoved} duplicati`);
    console.log(`📊 ${this.consolidatedFindings.length} findings unici\n`);
  }

  generateDuplicateKey(finding) {
    // Genera chiave per identificare duplicati basata su titolo e categoria
    const title = finding.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const category = finding.category;
    return `${category}_${title}`;
  }

  consolidateFindings(existing, duplicate) {
    // Consolida due findings duplicati
    return {
      ...existing,
      modules: [...(existing.modules || [existing.module]), duplicate.module],
      sources: [...(existing.sources || [existing.source]), duplicate.source],
      severity: this.getHigherSeverity(existing.severity, duplicate.severity),
      description: this.mergDescriptions(existing.description, duplicate.description),
      details: {
        ...existing.details,
        consolidated: true,
        duplicateCount: (existing.details?.duplicateCount || 1) + 1
      }
    };
  }

  getHigherSeverity(sev1, sev2) {
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    const score1 = severityOrder[sev1] || 2;
    const score2 = severityOrder[sev2] || 2;
    
    return score1 >= score2 ? sev1 : sev2;
  }

  mergDescriptions(desc1, desc2) {
    if (!desc1) return desc2;
    if (!desc2) return desc1;
    if (desc1 === desc2) return desc1;
    
    return `${desc1} | ${desc2}`;
  }

  async classifyFindings() {
    console.log('📊 Classificazione findings per categoria e severità...');

    // Raggruppa per categoria
    for (const finding of this.consolidatedFindings) {
      const category = finding.category;
      if (!this.categories.has(category)) {
        this.categories.set(category, []);
      }
      this.categories.get(category).push(finding);

      // Conta per severità
      const severity = finding.severity;
      if (!this.severityLevels.has(severity)) {
        this.severityLevels.set(severity, 0);
      }
      this.severityLevels.set(severity, this.severityLevels.get(severity) + 1);
    }

    console.log(`📂 ${this.categories.size} categorie identificate`);
    console.log(`⚡ ${this.severityLevels.size} livelli di severità\n`);
  }

  async calculateAggregateMetrics() {
    console.log('📈 Calcolo metriche aggregate...');

    this.metrics.totalFindings = this.consolidatedFindings.length;
    this.metrics.criticalFindings = this.severityLevels.get('critical') || 0;
    this.metrics.highFindings = this.severityLevels.get('high') || 0;
    this.metrics.mediumFindings = this.severityLevels.get('medium') || 0;
    this.metrics.lowFindings = this.severityLevels.get('low') || 0;

    // Metriche per categoria
    this.metrics.categoriesBreakdown = {};
    for (const [category, findings] of this.categories) {
      this.metrics.categoriesBreakdown[category] = {
        total: findings.length,
        critical: findings.filter(f => f.severity === 'critical').length,
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
        low: findings.filter(f => f.severity === 'low').length
      };
    }

    // Metriche per modulo
    this.metrics.modulesBreakdown = {};
    const moduleFindings = new Map();
    
    for (const finding of this.consolidatedFindings) {
      const modules = finding.modules || [finding.module];
      for (const module of modules) {
        if (!moduleFindings.has(module)) {
          moduleFindings.set(module, []);
        }
        moduleFindings.get(module).push(finding);
      }
    }

    for (const [module, findings] of moduleFindings) {
      this.metrics.modulesBreakdown[module] = {
        total: findings.length,
        critical: findings.filter(f => f.severity === 'critical').length,
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
        low: findings.filter(f => f.severity === 'low').length
      };
    }

    console.log(`📊 Metriche calcolate per ${Object.keys(this.metrics.categoriesBreakdown).length} categorie`);
    console.log(`📊 Metriche calcolate per ${Object.keys(this.metrics.modulesBreakdown).length} moduli\n`);
  }

  async generateUnifiedDatabase() {
    console.log('💾 Generazione database unificato...');

    const database = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: 'v0.6.4',
        totalFindings: this.metrics.totalFindings,
        duplicatesRemoved: this.metrics.duplicatesRemoved,
        analysisModules: Object.keys(this.metrics.modulesBreakdown)
      },
      metrics: this.metrics,
      findings: this.consolidatedFindings,
      categories: Object.fromEntries(
        Array.from(this.categories.entries()).map(([cat, findings]) => [
          cat, 
          findings.map(f => f.id)
        ])
      ),
      duplicates: this.duplicates.map(d => ({
        originalId: d.original.id,
        duplicateId: d.duplicate.id,
        reason: 'Similar title and category'
      }))
    };

    // Salva database JSON
    const dbPath = path.join(process.cwd(), 'analisi-microscopica', '09-aggregazione', 'unified-findings-database.json');
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(database, null, 2));

    // Genera report markdown
    await this.generateConsolidatedReport(database);

    console.log(`✅ Database salvato: ${dbPath}`);
  }

  async generateConsolidatedReport(database) {
    const markdown = `# Consolidamento Findings - Analisi Microscopica

**Data Generazione**: ${new Date(database.metadata.generatedAt).toLocaleString('it-IT')}  
**Versione Progetto**: ${database.metadata.version}

## 📊 Riepilogo Esecutivo

### Statistiche Generali
- **Findings Totali**: ${database.metadata.totalFindings}
- **Duplicati Rimossi**: ${database.metadata.duplicatesRemoved}
- **Moduli Analizzati**: ${database.metadata.analysisModules.length}

### Distribuzione per Severità
- **🚨 Critici**: ${this.metrics.criticalFindings} (${((this.metrics.criticalFindings / this.metrics.totalFindings) * 100).toFixed(1)}%)
- **🔥 Alti**: ${this.metrics.highFindings} (${((this.metrics.highFindings / this.metrics.totalFindings) * 100).toFixed(1)}%)
- **⚠️ Medi**: ${this.metrics.mediumFindings} (${((this.metrics.mediumFindings / this.metrics.totalFindings) * 100).toFixed(1)}%)
- **📝 Bassi**: ${this.metrics.lowFindings} (${((this.metrics.lowFindings / this.metrics.totalFindings) * 100).toFixed(1)}%)

## 📂 Breakdown per Categoria

${Object.entries(this.metrics.categoriesBreakdown).map(([category, stats]) => `
### ${category.toUpperCase()}
- **Totale**: ${stats.total}
- **Critici**: ${stats.critical}
- **Alti**: ${stats.high}
- **Medi**: ${stats.medium}
- **Bassi**: ${stats.low}
`).join('\n')}

## 🏗️ Breakdown per Modulo

${Object.entries(this.metrics.modulesBreakdown).map(([module, stats]) => `
### ${module}
- **Totale**: ${stats.total}
- **Critici**: ${stats.critical}
- **Alti**: ${stats.high}
- **Medi**: ${stats.medium}
- **Bassi**: ${stats.low}
`).join('\n')}

## 🚨 Top 10 Findings Critici

${this.consolidatedFindings
  .filter(f => f.severity === 'critical')
  .slice(0, 10)
  .map((finding, index) => `
### ${index + 1}. ${finding.title}
- **Modulo**: ${finding.modules ? finding.modules.join(', ') : finding.module}
- **Categoria**: ${finding.category}
- **Tipo**: ${finding.type}
- **Descrizione**: ${finding.description}
${finding.component ? `- **Componente**: ${finding.component}` : ''}
`).join('\n')}

## 🔥 Top 10 Findings Alta Priorità

${this.consolidatedFindings
  .filter(f => f.severity === 'high')
  .slice(0, 10)
  .map((finding, index) => `
### ${index + 1}. ${finding.title}
- **Modulo**: ${finding.modules ? finding.modules.join(', ') : finding.module}
- **Categoria**: ${finding.category}
- **Tipo**: ${finding.type}
- **Descrizione**: ${finding.description}
${finding.component ? `- **Componente**: ${finding.component}` : ''}
`).join('\n')}

## 🔄 Duplicati Consolidati

**Totale Duplicati Rimossi**: ${database.metadata.duplicatesRemoved}

${this.duplicates.slice(0, 10).map((dup, index) => `
### ${index + 1}. ${dup.original.title}
- **Originale**: ${dup.original.module} (${dup.original.source})
- **Duplicato**: ${dup.duplicate.module} (${dup.duplicate.source})
- **Motivo**: ${dup.reason}
`).join('\n')}

## 📈 Metriche di Qualità del Progetto

### Indice di Salute Generale
- **Score Critico**: ${(100 - (this.metrics.criticalFindings / this.metrics.totalFindings) * 100).toFixed(1)}%
- **Score Qualità**: ${(100 - ((this.metrics.criticalFindings + this.metrics.highFindings) / this.metrics.totalFindings) * 100).toFixed(1)}%

### Aree di Maggiore Criticità
${Object.entries(this.metrics.categoriesBreakdown)
  .sort((a, b) => (b[1].critical + b[1].high) - (a[1].critical + a[1].high))
  .slice(0, 5)
  .map(([category, stats], index) => `${index + 1}. **${category}**: ${stats.critical + stats.high} problemi critici/alti`)
  .join('\n')}

### Moduli con Maggiori Problemi
${Object.entries(this.metrics.modulesBreakdown)
  .sort((a, b) => (b[1].critical + b[1].high) - (a[1].critical + a[1].high))
  .slice(0, 5)
  .map(([module, stats], index) => `${index + 1}. **${module}**: ${stats.critical + stats.high} problemi critici/alti`)
  .join('\n')}

---

*Report generato automaticamente dal Findings Consolidator*
`;

    const reportPath = path.join(process.cwd(), 'analisi-microscopica', '09-aggregazione', 'consolidated-findings-report.md');
    await fs.writeFile(reportPath, markdown);
  }
}

// Esecuzione
const consolidator = new FindingsConsolidator();
consolidator.consolidateAllFindings().catch(console.error);

export default FindingsConsolidator;