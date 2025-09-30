#!/usr/bin/env node

/**
 * Priority Impact Calculator
 * Implementa algoritmo prioritizzazione multi-criterio per tutti i findings
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PriorityImpactCalculator {
  constructor() {
    this.findings = [];
    this.prioritizedFindings = [];
    this.impactMatrix = new Map();
    this.effortEstimates = new Map();
    this.dependencies = new Map();
    this.riskMatrix = [];
  }

  async calculatePrioritiesAndImpact() {
    console.log('🎯 Avvio calcolo priorità e impatto problemi...\n');

    // Carica findings consolidati
    await this.loadConsolidatedFindings();
    
    // Calcola impatto su utenti finali
    await this.calculateUserImpact();
    
    // Stima effort richiesto
    await this.estimateEffortRequired();
    
    // Analizza dipendenze tra problemi
    await this.analyzeDependencies();
    
    // Implementa algoritmo prioritizzazione
    await this.implementPrioritizationAlgorithm();
    
    // Crea matrice rischio/impatto
    await this.createRiskImpactMatrix();
    
    // Genera report prioritizzazione
    await this.generatePrioritizationReport();
    
    console.log('✅ Calcolo priorità completato');
  }

  async loadConsolidatedFindings() {
    console.log('📂 Caricamento findings consolidati...');

    try {
      const dbPath = path.join(process.cwd(), 'analisi-microscopica', '09-aggregazione', 'unified-findings-database.json');
      const content = await fs.readFile(dbPath, 'utf8');
      const database = JSON.parse(content);
      
      this.findings = database.findings;
      console.log(`✅ Caricati ${this.findings.length} findings\n`);
    } catch (error) {
      console.error('❌ Errore caricamento database:', error.message);
      process.exit(1);
    }
  }

  async calculateUserImpact() {
    console.log('👤 Calcolo impatto su utenti finali...');

    for (const finding of this.findings) {
      const impact = this.assessUserImpact(finding);
      this.impactMatrix.set(finding.id, impact);
    }

    console.log(`📊 Calcolato impatto per ${this.impactMatrix.size} findings\n`);
  }

  assessUserImpact(finding) {
    let impactScore = 0;
    let impactDescription = [];

    // Impatto basato su categoria
    const categoryImpact = {
      'ui': 8, // UI problems directly affect user experience
      'system': 9, // System issues can cause crashes
      'feature': 7, // Missing features affect functionality
      'performance': 6, // Performance affects usability
      'data': 8, // Data issues can cause loss
      'security': 10, // Security is critical
      'documentation': 3, // Documentation is less critical
      'code': 4, // Code quality affects maintainability
      'architecture': 5 // Architecture affects scalability
    };

    impactScore += categoryImpact[finding.category] || 5;

    // Impatto basato su severità
    const severityImpact = {
      'critical': 10,
      'high': 7,
      'medium': 4,
      'low': 1
    };

    impactScore += severityImpact[finding.severity] || 4;

    // Impatto specifico per tipo di problema
    if (finding.type === 'ui_incomplete') {
      impactScore += 3;
      impactDescription.push('Interfaccia incompleta frustra utenti');
    }

    if (finding.type === 'feature_missing') {
      impactScore += 4;
      impactDescription.push('Funzionalità mancante limita utilizzo');
    }

    if (finding.type === 'critical_issue') {
      impactScore += 5;
      impactDescription.push('Problema critico può bloccare utenti');
    }

    // Impatto basato su componente
    if (finding.component) {
      const criticalComponents = [
        'StartScreen', 'CharacterCreationScreen', 'LoadScreen',
        'gameStore', 'saveSystem', 'MapViewport'
      ];
      
      if (criticalComponents.some(comp => finding.component.includes(comp))) {
        impactScore += 3;
        impactDescription.push('Componente critico per esperienza utente');
      }
    }

    // Normalizza score (0-100)
    impactScore = Math.min(100, Math.max(0, impactScore * 4));

    return {
      score: impactScore,
      level: this.getImpactLevel(impactScore),
      description: impactDescription,
      userFacing: this.isUserFacing(finding),
      businessCritical: this.isBusinessCritical(finding)
    };
  }

  getImpactLevel(score) {
    if (score >= 80) return 'very_high';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'very_low';
  }

  isUserFacing(finding) {
    const userFacingCategories = ['ui', 'feature', 'performance'];
    const userFacingTypes = ['ui_incomplete', 'feature_missing'];
    
    return userFacingCategories.includes(finding.category) || 
           userFacingTypes.includes(finding.type);
  }

  isBusinessCritical(finding) {
    const criticalKeywords = ['crash', 'data loss', 'security', 'login', 'save', 'load'];
    const title = finding.title.toLowerCase();
    const description = finding.description.toLowerCase();
    
    return criticalKeywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
  }

  async estimateEffortRequired() {
    console.log('⏱️ Stima effort richiesto per ogni fix...');

    for (const finding of this.findings) {
      const effort = this.estimateEffort(finding);
      this.effortEstimates.set(finding.id, effort);
    }

    console.log(`📊 Stimato effort per ${this.effortEstimates.size} findings\n`);
  }

  estimateEffort(finding) {
    let effortHours = 0;
    let complexity = 'medium';
    let skillsRequired = [];

    // Effort basato su categoria
    const categoryEffort = {
      'ui': 8, // UI fixes usually require design + implementation
      'system': 16, // System issues are complex
      'feature': 24, // New features require significant work
      'performance': 12, // Performance optimization takes time
      'data': 6, // Data fixes are usually straightforward
      'security': 20, // Security fixes require careful work
      'documentation': 2, // Documentation is quick
      'code': 4, // Code cleanup is moderate
      'architecture': 40 // Architecture changes are major
    };

    effortHours += categoryEffort[finding.category] || 8;

    // Effort basato su severità
    const severityMultiplier = {
      'critical': 1.5, // Critical issues need extra care
      'high': 1.2,
      'medium': 1.0,
      'low': 0.8
    };

    effortHours *= severityMultiplier[finding.severity] || 1.0;

    // Effort specifico per tipo
    if (finding.type === 'ui_incomplete') {
      effortHours += 4;
      skillsRequired.push('React', 'CSS', 'UX Design');
      complexity = 'medium';
    }

    if (finding.type === 'feature_missing') {
      effortHours += 16;
      skillsRequired.push('TypeScript', 'Game Logic', 'Testing');
      complexity = 'high';
    }

    if (finding.type === 'critical_issue') {
      effortHours += 8;
      skillsRequired.push('Debugging', 'System Architecture');
      complexity = 'high';
    }

    // Effort basato su componente
    if (finding.component) {
      const complexComponents = ['gameStore', 'saveSystem', 'MapViewport'];
      if (complexComponents.some(comp => finding.component.includes(comp))) {
        effortHours *= 1.3;
        complexity = 'high';
      }
    }

    // Determina complessità finale
    if (effortHours > 30) complexity = 'very_high';
    else if (effortHours > 15) complexity = 'high';
    else if (effortHours > 5) complexity = 'medium';
    else complexity = 'low';

    return {
      hours: Math.round(effortHours),
      complexity,
      skillsRequired: [...new Set(skillsRequired)],
      canParallelize: this.canParallelize(finding),
      blocksOthers: this.blocksOthers(finding)
    };
  }

  canParallelize(finding) {
    // UI fixes can usually be done in parallel
    if (finding.category === 'ui') return true;
    
    // Documentation can be done in parallel
    if (finding.category === 'documentation') return true;
    
    // Code cleanup can often be parallelized
    if (finding.category === 'code') return true;
    
    return false;
  }

  blocksOthers(finding) {
    // System and architecture changes block others
    if (['system', 'architecture'].includes(finding.category)) return true;
    
    // Critical issues should be fixed first
    if (finding.severity === 'critical') return true;
    
    return false;
  }

  async analyzeDependencies() {
    console.log('🔗 Analisi dipendenze tra problemi...');

    for (const finding of this.findings) {
      const dependencies = this.findDependencies(finding);
      this.dependencies.set(finding.id, dependencies);
    }

    console.log(`📊 Analizzate dipendenze per ${this.dependencies.size} findings\n`);
  }

  findDependencies(finding) {
    const dependencies = {
      blockedBy: [],
      blocks: [],
      relatedTo: []
    };

    for (const otherFinding of this.findings) {
      if (otherFinding.id === finding.id) continue;

      // Dipendenze architetturali
      if (otherFinding.category === 'architecture' && finding.category !== 'architecture') {
        dependencies.blockedBy.push({
          id: otherFinding.id,
          reason: 'Architectural changes must be done first'
        });
      }

      // Dipendenze di sistema
      if (otherFinding.category === 'system' && finding.category === 'ui') {
        dependencies.blockedBy.push({
          id: otherFinding.id,
          reason: 'System stability required for UI work'
        });
      }

      // Dipendenze per componente
      if (finding.component && otherFinding.component === finding.component) {
        dependencies.relatedTo.push({
          id: otherFinding.id,
          reason: 'Same component affected'
        });
      }

      // Dipendenze critiche
      if (otherFinding.severity === 'critical' && finding.severity !== 'critical') {
        dependencies.blockedBy.push({
          id: otherFinding.id,
          reason: 'Critical issues have priority'
        });
      }
    }

    return dependencies;
  }

  async implementPrioritizationAlgorithm() {
    console.log('🧮 Implementazione algoritmo prioritizzazione multi-criterio...');

    this.prioritizedFindings = this.findings.map(finding => {
      const impact = this.impactMatrix.get(finding.id);
      const effort = this.effortEstimates.get(finding.id);
      const dependencies = this.dependencies.get(finding.id);

      const priority = this.calculatePriorityScore(finding, impact, effort, dependencies);

      return {
        ...finding,
        impact,
        effort,
        dependencies,
        priority
      };
    });

    // Ordina per priorità
    this.prioritizedFindings.sort((a, b) => b.priority.score - a.priority.score);

    console.log(`✅ Prioritizzati ${this.prioritizedFindings.length} findings\n`);
  }

  calculatePriorityScore(finding, impact, effort, dependencies) {
    let score = 0;
    let factors = [];

    // Fattore impatto (40% del peso)
    const impactWeight = 0.4;
    const impactScore = impact.score * impactWeight;
    score += impactScore;
    factors.push(`Impact: ${impactScore.toFixed(1)}`);

    // Fattore effort (30% del peso, inverso)
    const effortWeight = 0.3;
    const maxEffort = 100; // Assumiamo 100 ore come massimo
    const effortScore = (1 - (effort.hours / maxEffort)) * 100 * effortWeight;
    score += effortScore;
    factors.push(`Effort: ${effortScore.toFixed(1)}`);

    // Fattore severità (20% del peso)
    const severityWeight = 0.2;
    const severityScores = { 'critical': 100, 'high': 75, 'medium': 50, 'low': 25 };
    const severityScore = (severityScores[finding.severity] || 50) * severityWeight;
    score += severityScore;
    factors.push(`Severity: ${severityScore.toFixed(1)}`);

    // Fattore dipendenze (10% del peso)
    const dependencyWeight = 0.1;
    let dependencyScore = 50; // Base score
    
    // Bonus se non è bloccato da altri
    if (dependencies.blockedBy.length === 0) {
      dependencyScore += 25;
    }
    
    // Bonus se sblocca altri
    if (dependencies.blocks.length > 0) {
      dependencyScore += 25;
    }
    
    dependencyScore *= dependencyWeight;
    score += dependencyScore;
    factors.push(`Dependencies: ${dependencyScore.toFixed(1)}`);

    // Bonus per problemi user-facing
    if (impact.userFacing) {
      score += 5;
      factors.push('User-facing: +5');
    }

    // Bonus per problemi business-critical
    if (impact.businessCritical) {
      score += 10;
      factors.push('Business-critical: +10');
    }

    return {
      score: Math.round(score),
      level: this.getPriorityLevel(score),
      factors,
      recommendation: this.getPriorityRecommendation(score, impact, effort)
    };
  }

  getPriorityLevel(score) {
    if (score >= 80) return 'immediate';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'deferred';
  }

  getPriorityRecommendation(score, impact, effort) {
    if (score >= 80) {
      return 'Fix immediately - high impact, critical for users';
    } else if (score >= 60) {
      return 'Schedule for next sprint - important improvement';
    } else if (score >= 40) {
      return 'Include in backlog - moderate priority';
    } else if (score >= 20) {
      return 'Consider for future releases';
    } else {
      return 'Low priority - defer unless resources available';
    }
  }

  async createRiskImpactMatrix() {
    console.log('📊 Creazione matrice rischio/impatto...');

    this.riskMatrix = this.prioritizedFindings.map(finding => ({
      id: finding.id,
      title: finding.title,
      impact: finding.impact.score,
      effort: finding.effort.hours,
      priority: finding.priority.score,
      riskLevel: this.calculateRiskLevel(finding),
      quadrant: this.getMatrixQuadrant(finding.impact.score, finding.effort.hours)
    }));

    console.log(`📊 Creata matrice per ${this.riskMatrix.length} findings\n`);
  }

  calculateRiskLevel(finding) {
    let risk = 0;

    // Rischio basato su severità
    const severityRisk = { 'critical': 40, 'high': 30, 'medium': 20, 'low': 10 };
    risk += severityRisk[finding.severity] || 20;

    // Rischio basato su complessità
    const complexityRisk = { 'very_high': 30, 'high': 20, 'medium': 10, 'low': 5 };
    risk += complexityRisk[finding.effort.complexity] || 10;

    // Rischio basato su dipendenze
    risk += finding.dependencies.blockedBy.length * 5;

    // Rischio se blocca altri
    risk += finding.dependencies.blocks.length * 3;

    return Math.min(100, risk);
  }

  getMatrixQuadrant(impact, effort) {
    const highImpact = impact >= 60;
    const highEffort = effort >= 20;

    if (highImpact && !highEffort) return 'quick_wins';
    if (highImpact && highEffort) return 'major_projects';
    if (!highImpact && !highEffort) return 'fill_ins';
    return 'thankless_tasks';
  }

  async generatePrioritizationReport() {
    console.log('📄 Generazione report prioritizzazione...');

    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalFindings: this.prioritizedFindings.length,
        algorithm: 'Multi-criteria prioritization (Impact 40%, Effort 30%, Severity 20%, Dependencies 10%)'
      },
      summary: {
        immediate: this.prioritizedFindings.filter(f => f.priority.level === 'immediate').length,
        high: this.prioritizedFindings.filter(f => f.priority.level === 'high').length,
        medium: this.prioritizedFindings.filter(f => f.priority.level === 'medium').length,
        low: this.prioritizedFindings.filter(f => f.priority.level === 'low').length,
        deferred: this.prioritizedFindings.filter(f => f.priority.level === 'deferred').length
      },
      prioritizedFindings: this.prioritizedFindings,
      riskMatrix: this.riskMatrix,
      quadrants: {
        quick_wins: this.riskMatrix.filter(f => f.quadrant === 'quick_wins').length,
        major_projects: this.riskMatrix.filter(f => f.quadrant === 'major_projects').length,
        fill_ins: this.riskMatrix.filter(f => f.quadrant === 'fill_ins').length,
        thankless_tasks: this.riskMatrix.filter(f => f.quadrant === 'thankless_tasks').length
      }
    };

    // Salva report JSON
    const reportPath = path.join(process.cwd(), 'analisi-microscopica', '09-aggregazione', 'priority-impact-analysis.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Genera report markdown
    await this.generateMarkdownReport(report);

    console.log(`✅ Report salvato: ${reportPath}`);
  }

  async generateMarkdownReport(report) {
    const markdown = `# Analisi Priorità e Impatto - Findings

**Data Generazione**: ${new Date(report.metadata.generatedAt).toLocaleString('it-IT')}  
**Algoritmo**: ${report.metadata.algorithm}

## 📊 Riepilogo Prioritizzazione

### Distribuzione per Livello di Priorità
- **🚨 Immediata**: ${report.summary.immediate} findings
- **🔥 Alta**: ${report.summary.high} findings  
- **⚠️ Media**: ${report.summary.medium} findings
- **📝 Bassa**: ${report.summary.low} findings
- **⏸️ Rimandata**: ${report.summary.deferred} findings

### Matrice Rischio/Impatto - Quadranti
- **🎯 Quick Wins** (Alto Impatto, Basso Effort): ${report.quadrants.quick_wins}
- **🏗️ Major Projects** (Alto Impatto, Alto Effort): ${report.quadrants.major_projects}
- **📋 Fill-ins** (Basso Impatto, Basso Effort): ${report.quadrants.fill_ins}
- **😤 Thankless Tasks** (Basso Impatto, Alto Effort): ${report.quadrants.thankless_tasks}

## 🚨 Top 10 - Priorità Immediata

${this.prioritizedFindings
  .filter(f => f.priority.level === 'immediate')
  .slice(0, 10)
  .map((finding, index) => `
### ${index + 1}. ${finding.title}
- **Score Priorità**: ${finding.priority.score}/100
- **Impatto**: ${finding.impact.score}/100 (${finding.impact.level})
- **Effort**: ${finding.effort.hours}h (${finding.effort.complexity})
- **Severità**: ${finding.severity}
- **Categoria**: ${finding.category}
- **Raccomandazione**: ${finding.priority.recommendation}
- **Skills Richieste**: ${finding.effort.skillsRequired.join(', ')}
${finding.dependencies.blockedBy.length > 0 ? `- **Bloccato da**: ${finding.dependencies.blockedBy.length} findings` : ''}
${finding.dependencies.blocks.length > 0 ? `- **Blocca**: ${finding.dependencies.blocks.length} findings` : ''}
`).join('\n')}

## 🎯 Quick Wins - Alto Impatto, Basso Effort

${this.riskMatrix
  .filter(f => f.quadrant === 'quick_wins')
  .slice(0, 10)
  .map((finding, index) => {
    const fullFinding = this.prioritizedFindings.find(f => f.id === finding.id);
    return `
### ${index + 1}. ${finding.title}
- **Impatto**: ${finding.impact}/100
- **Effort**: ${finding.effort}h
- **Priorità**: ${finding.priority}/100
- **Skills**: ${fullFinding.effort.skillsRequired.join(', ')}
- **Può essere parallelizzato**: ${fullFinding.effort.canParallelize ? 'Sì' : 'No'}
`;
  }).join('\n')}

## 🏗️ Major Projects - Alto Impatto, Alto Effort

${this.riskMatrix
  .filter(f => f.quadrant === 'major_projects')
  .slice(0, 5)
  .map((finding, index) => {
    const fullFinding = this.prioritizedFindings.find(f => f.id === finding.id);
    return `
### ${index + 1}. ${finding.title}
- **Impatto**: ${finding.impact}/100
- **Effort**: ${finding.effort}h
- **Priorità**: ${finding.priority}/100
- **Complessità**: ${fullFinding.effort.complexity}
- **Skills**: ${fullFinding.effort.skillsRequired.join(', ')}
- **Blocca altri**: ${fullFinding.effort.blocksOthers ? 'Sì' : 'No'}
`;
  }).join('\n')}

## 📈 Analisi Dipendenze

### Findings che Bloccano Altri (Critical Path)
${this.prioritizedFindings
  .filter(f => f.dependencies.blocks.length > 0)
  .sort((a, b) => b.dependencies.blocks.length - a.dependencies.blocks.length)
  .slice(0, 5)
  .map((finding, index) => `${index + 1}. **${finding.title}** - Blocca ${finding.dependencies.blocks.length} findings`)
  .join('\n')}

### Findings Bloccati (Dipendenti)
${this.prioritizedFindings
  .filter(f => f.dependencies.blockedBy.length > 0)
  .sort((a, b) => b.dependencies.blockedBy.length - a.dependencies.blockedBy.length)
  .slice(0, 5)
  .map((finding, index) => `${index + 1}. **${finding.title}** - Bloccato da ${finding.dependencies.blockedBy.length} findings`)
  .join('\n')}

## 🎯 Raccomandazioni Strategiche

### Sprint 1 (Priorità Immediata)
**Durata Stimata**: ${this.prioritizedFindings.filter(f => f.priority.level === 'immediate').reduce((sum, f) => sum + f.effort.hours, 0)} ore

${this.prioritizedFindings
  .filter(f => f.priority.level === 'immediate')
  .slice(0, 5)
  .map(f => `- ${f.title} (${f.effort.hours}h)`)
  .join('\n')}

### Sprint 2-3 (Alta Priorità)
**Durata Stimata**: ${this.prioritizedFindings.filter(f => f.priority.level === 'high').reduce((sum, f) => sum + f.effort.hours, 0)} ore

${this.prioritizedFindings
  .filter(f => f.priority.level === 'high')
  .slice(0, 8)
  .map(f => `- ${f.title} (${f.effort.hours}h)`)
  .join('\n')}

### Backlog (Media Priorità)
**Durata Stimata**: ${this.prioritizedFindings.filter(f => f.priority.level === 'medium').reduce((sum, f) => sum + f.effort.hours, 0)} ore

### Skills Richieste per Team
${this.getRequiredSkills().map(skill => `- **${skill.skill}**: ${skill.count} findings`).join('\n')}

## 📊 Metriche di Pianificazione

- **Effort Totale**: ${this.prioritizedFindings.reduce((sum, f) => sum + f.effort.hours, 0)} ore
- **Effort Critico**: ${this.prioritizedFindings.filter(f => f.priority.level === 'immediate').reduce((sum, f) => sum + f.effort.hours, 0)} ore
- **Findings Parallelizzabili**: ${this.prioritizedFindings.filter(f => f.effort.canParallelize).length}
- **Findings Bloccanti**: ${this.prioritizedFindings.filter(f => f.effort.blocksOthers).length}

---

*Report generato automaticamente dal Priority Impact Calculator*
`;

    const reportPath = path.join(process.cwd(), 'analisi-microscopica', '09-aggregazione', 'priority-impact-report.md');
    await fs.writeFile(reportPath, markdown);
  }

  getRequiredSkills() {
    const skillsMap = new Map();
    
    for (const finding of this.prioritizedFindings) {
      for (const skill of finding.effort.skillsRequired) {
        skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
      }
    }

    return Array.from(skillsMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// Esecuzione
const calculator = new PriorityImpactCalculator();
calculator.calculatePrioritiesAndImpact().catch(console.error);

export default PriorityImpactCalculator;