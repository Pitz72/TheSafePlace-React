#!/usr/bin/env node

/**
 * UI Completeness Analyzer
 * Analizza la completezza di tutti i componenti UI e identifica problemi UX/UI
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UICompletenessAnalyzer {
  constructor() {
    this.components = new Map();
    this.uiIssues = [];
    this.incompleteComponents = [];
    this.accessibilityIssues = [];
    this.usabilityIssues = [];
  }

  async analyzeProject() {
    console.log('🎨 Avvio analisi completezza UI e componenti...\n');

    // Analizza tutti i componenti
    await this.analyzeComponents();
    
    // Analizza App.tsx per routing e integrazione
    await this.analyzeAppIntegration();
    
    // Analizza accessibilità
    await this.analyzeAccessibility();
    
    // Analizza usabilità
    await this.analyzeUsability();
    
    // Identifica edge cases
    await this.analyzeEdgeCases();
    
    // Genera report
    await this.generateReport();
  }

  async analyzeComponents() {
    console.log('🔍 Analisi componenti React...');

    const componentsDir = path.join(process.cwd(), 'src', 'components');
    const files = await fs.readdir(componentsDir);
    
    for (const file of files.filter(f => f.endsWith('.tsx'))) {
      const filePath = path.join(componentsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      const analysis = await this.analyzeComponent(file, content);
      this.components.set(file, analysis);
      
      if (analysis.completeness < 0.8) {
        this.incompleteComponents.push({
          name: file,
          ...analysis
        });
      }
    }

    console.log(`✅ Analizzati ${this.components.size} componenti\n`);
  }

  async analyzeComponent(filename, content) {
    const analysis = {
      name: filename,
      type: this.getComponentType(filename),
      completeness: 0,
      issues: [],
      features: {
        hasState: false,
        hasEffects: false,
        hasKeyboardHandling: false,
        hasErrorHandling: false,
        hasLoading: false,
        hasValidation: false,
        hasAccessibility: false
      },
      placeholders: [],
      todos: [],
      complexity: this.calculateComplexity(content),
      lineCount: content.split('\n').length
    };

    // Analizza caratteristiche del componente
    analysis.features.hasState = /useState|useGameStore/.test(content);
    analysis.features.hasEffects = /useEffect/.test(content);
    analysis.features.hasKeyboardHandling = /onKeyDown|addEventListener.*keydown/i.test(content);
    analysis.features.hasErrorHandling = /try\s*{|catch\s*\(/.test(content);
    analysis.features.hasLoading = /loading|isLoading|LoadingSpinner/.test(content);
    analysis.features.hasValidation = /validate|validation|error/.test(content);
    analysis.features.hasAccessibility = /aria-|role=|tabIndex/.test(content);

    // Cerca placeholder e TODO
    analysis.placeholders = this.findPlaceholders(content);
    analysis.todos = this.findTodos(content);

    // Analisi specifica per tipo di componente
    await this.analyzeComponentSpecific(analysis, content);

    // Calcola completezza
    analysis.completeness = this.calculateCompleteness(analysis);

    return analysis;
  }

  getComponentType(filename) {
    const name = filename.replace('.tsx', '').toLowerCase();
    
    if (name.includes('screen')) return 'screen';
    if (name.includes('panel')) return 'panel';
    if (name.includes('display')) return 'display';
    if (name.includes('system')) return 'system';
    if (name.includes('spinner') || name.includes('loading')) return 'utility';
    
    return 'component';
  }

  calculateComplexity(content) {
    // Calcola complessità ciclomatica approssimativa
    const conditions = (content.match(/if\s*\(|else|switch|case|\?|\&\&|\|\|/g) || []).length;
    const loops = (content.match(/for\s*\(|while\s*\(|\.map\(|\.forEach\(/g) || []).length;
    const functions = (content.match(/function\s+\w+|=>\s*{|const\s+\w+\s*=\s*\(/g) || []).length;
    
    return conditions + loops + functions;
  }

  findPlaceholders(content) {
    const placeholders = [];
    const patterns = [
      /placeholder/gi,
      /TODO.*implement/gi,
      /not implemented/gi,
      /coming soon/gi,
      /work in progress/gi,
      /wip/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        placeholders.push({
          text: match[0],
          line: lineNumber,
          context: this.getLineContext(content, lineNumber)
        });
      }
    });

    return placeholders;
  }

  findTodos(content) {
    const todos = [];
    const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX).*$/gim;
    
    let match;
    while ((match = todoPattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      todos.push({
        type: match[1],
        text: match[0],
        line: lineNumber,
        context: this.getLineContext(content, lineNumber)
      });
    }

    return todos;
  }

  getLineContext(content, lineNumber) {
    const lines = content.split('\n');
    const start = Math.max(0, lineNumber - 2);
    const end = Math.min(lines.length, lineNumber + 1);
    return lines.slice(start, end).join('\n');
  }

  async analyzeComponentSpecific(analysis, content) {
    switch (analysis.type) {
      case 'screen':
        await this.analyzeScreen(analysis, content);
        break;
      case 'panel':
        await this.analyzePanel(analysis, content);
        break;
      case 'display':
        await this.analyzeDisplay(analysis, content);
        break;
      case 'system':
        await this.analyzeSystem(analysis, content);
        break;
    }
  }

  async analyzeScreen(analysis, content) {
    // Analisi specifica per schermate
    const screenChecks = {
      hasNavigation: /goBack|setCurrentScreen|navigate/.test(content),
      hasKeyboardNav: /handleKeyDown.*ArrowUp|ArrowDown|Enter|Escape/.test(content),
      hasTitle: /<h[1-6]|panel-title/.test(content),
      hasInstructions: /istruzioni|comandi|help|guida/.test(content),
      hasErrorStates: /error|Error|errore/.test(content),
      hasLoadingStates: /loading|caricamento/.test(content)
    };

    Object.entries(screenChecks).forEach(([check, passed]) => {
      if (!passed) {
        analysis.issues.push(`Manca ${check} nella schermata`);
      }
    });

    // Controlla se è una schermata critica
    const criticalScreens = ['StartScreen', 'CharacterCreationScreen', 'LoadScreen'];
    if (criticalScreens.some(screen => analysis.name.includes(screen))) {
      analysis.priority = 'critical';
      
      // Controlli aggiuntivi per schermate critiche
      if (!screenChecks.hasErrorStates) {
        analysis.issues.push('Schermata critica senza gestione errori');
      }
    }
  }

  async analyzePanel(analysis, content) {
    // Analisi specifica per pannelli
    const panelChecks = {
      hasData: /items|data|props/.test(content),
      hasEmptyState: /empty|vuoto|nessun/.test(content),
      hasScrolling: /overflow|scroll/.test(content),
      hasInteraction: /onClick|onSelect|handleClick/.test(content)
    };

    Object.entries(panelChecks).forEach(([check, passed]) => {
      if (!passed) {
        analysis.issues.push(`Pannello manca ${check}`);
      }
    });
  }

  async analyzeDisplay(analysis, content) {
    // Analisi specifica per componenti di visualizzazione
    const displayChecks = {
      hasFormatting: /format|Format/.test(content),
      hasConditionalDisplay: /\?\s*.*:/.test(content),
      hasDefaultValues: /\|\||default|Default/.test(content)
    };

    Object.entries(displayChecks).forEach(([check, passed]) => {
      if (!passed) {
        analysis.issues.push(`Display component manca ${check}`);
      }
    });
  }

  async analyzeSystem(analysis, content) {
    // Analisi specifica per componenti di sistema
    const systemChecks = {
      hasConfiguration: /config|Config|settings/.test(content),
      hasCleanup: /cleanup|unmount|removeEventListener/.test(content),
      hasErrorBoundary: /ErrorBoundary|componentDidCatch/.test(content)
    };

    Object.entries(systemChecks).forEach(([check, passed]) => {
      if (!passed) {
        analysis.issues.push(`Sistema manca ${check}`);
      }
    });
  }

  calculateCompleteness(analysis) {
    let score = 1.0;

    // Penalità per placeholder e TODO
    score -= analysis.placeholders.length * 0.1;
    score -= analysis.todos.length * 0.05;

    // Penalità per problemi identificati
    score -= analysis.issues.length * 0.1;

    // Bonus per feature implementate
    const featureCount = Object.values(analysis.features).filter(Boolean).length;
    const totalFeatures = Object.keys(analysis.features).length;
    const featureScore = featureCount / totalFeatures;
    score = (score + featureScore) / 2;

    // Penalità per complessità eccessiva
    if (analysis.complexity > 50) {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  async analyzeAppIntegration() {
    console.log('🔗 Analisi integrazione App.tsx...');

    try {
      const appPath = path.join(process.cwd(), 'src', 'App.tsx');
      const content = await fs.readFile(appPath, 'utf8');

      // Analizza routing e integrazione componenti
      const integrationIssues = [];

      // Controlla se tutti i componenti sono importati
      const imports = content.match(/import.*from.*components/g) || [];
      const componentUsage = content.match(/currentScreen === ['"`](\w+)['"`]/g) || [];

      // Controlla gestione stati
      if (!content.includes('GameScreenInputHandler')) {
        integrationIssues.push('Manca gestione input centralizzata');
      }

      // Controlla error boundary
      if (!content.includes('GameErrorBoundary')) {
        integrationIssues.push('Manca error boundary globale');
      }

      // Controlla sistema notifiche
      if (!content.includes('NotificationSystem')) {
        integrationIssues.push('Manca sistema notifiche');
      }

      this.uiIssues.push({
        component: 'App.tsx',
        category: 'integration',
        issues: integrationIssues
      });

    } catch (error) {
      console.warn('⚠️ Errore analisi App.tsx:', error.message);
    }

    console.log('✅ Analisi integrazione completata\n');
  }

  async analyzeAccessibility() {
    console.log('♿ Analisi accessibilità...');

    for (const [filename, analysis] of this.components) {
      const accessibilityIssues = [];

      // Controlla attributi ARIA
      if (!analysis.features.hasAccessibility) {
        accessibilityIssues.push('Mancano attributi ARIA');
      }

      // Controlla navigazione da tastiera
      if (analysis.type === 'screen' && !analysis.features.hasKeyboardHandling) {
        accessibilityIssues.push('Navigazione da tastiera incompleta');
      }

      // Controlla contrasto e leggibilità (pattern comuni)
      const filePath = path.join(process.cwd(), 'src', 'components', filename);
      const content = await fs.readFile(filePath, 'utf8');
      
      if (!content.includes('text-') && !content.includes('color')) {
        accessibilityIssues.push('Possibili problemi di contrasto');
      }

      if (accessibilityIssues.length > 0) {
        this.accessibilityIssues.push({
          component: filename,
          issues: accessibilityIssues
        });
      }
    }

    console.log(`⚠️ ${this.accessibilityIssues.length} componenti con problemi accessibilità\n`);
  }

  async analyzeUsability() {
    console.log('👤 Analisi usabilità...');

    for (const [filename, analysis] of this.components) {
      const usabilityIssues = [];

      // Controlla feedback utente
      if (analysis.type === 'screen' && !analysis.features.hasLoading) {
        usabilityIssues.push('Manca feedback di caricamento');
      }

      // Controlla gestione errori
      if (!analysis.features.hasErrorHandling) {
        usabilityIssues.push('Gestione errori insufficiente');
      }

      // Controlla validazione input
      if (filename.includes('Creation') || filename.includes('Input')) {
        if (!analysis.features.hasValidation) {
          usabilityIssues.push('Manca validazione input utente');
        }
      }

      // Controlla istruzioni e help
      if (analysis.type === 'screen') {
        const filePath = path.join(process.cwd(), 'src', 'components', filename);
        const content = await fs.readFile(filePath, 'utf8');
        
        if (!content.includes('help') && !content.includes('istruzioni') && !content.includes('comandi')) {
          usabilityIssues.push('Mancano istruzioni per l\'utente');
        }
      }

      if (usabilityIssues.length > 0) {
        this.usabilityIssues.push({
          component: filename,
          issues: usabilityIssues
        });
      }
    }

    console.log(`⚠️ ${this.usabilityIssues.length} componenti con problemi usabilità\n`);
  }

  async analyzeEdgeCases() {
    console.log('🔍 Analisi edge cases...');

    for (const [filename, analysis] of this.components) {
      const filePath = path.join(process.cwd(), 'src', 'components', filename);
      const content = await fs.readFile(filePath, 'utf8');

      const edgeCaseIssues = [];

      // Controlla gestione dati vuoti
      if (!content.includes('length === 0') && !content.includes('empty') && !content.includes('null')) {
        edgeCaseIssues.push('Possibile mancanza gestione dati vuoti');
      }

      // Controlla gestione errori di rete/caricamento
      if (content.includes('fetch') || content.includes('load')) {
        if (!content.includes('catch') && !content.includes('error')) {
          edgeCaseIssues.push('Manca gestione errori di caricamento');
        }
      }

      // Controlla limiti e validazioni
      if (content.includes('input') || content.includes('Input')) {
        if (!content.includes('max') && !content.includes('min') && !content.includes('length')) {
          edgeCaseIssues.push('Possibili problemi con limiti input');
        }
      }

      if (edgeCaseIssues.length > 0) {
        analysis.edgeCaseIssues = edgeCaseIssues;
      }
    }

    console.log('✅ Analisi edge cases completata\n');
  }

  async generateReport() {
    console.log('📊 Generazione report...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalComponents: this.components.size,
        incompleteComponents: this.incompleteComponents.length,
        accessibilityIssues: this.accessibilityIssues.length,
        usabilityIssues: this.usabilityIssues.length,
        averageCompleteness: this.calculateAverageCompleteness()
      },
      componentAnalysis: Array.from(this.components.entries()).map(([name, analysis]) => ({
        name,
        ...analysis
      })),
      incompleteComponents: this.incompleteComponents,
      accessibilityIssues: this.accessibilityIssues,
      usabilityIssues: this.usabilityIssues,
      uiIssues: this.uiIssues,
      recommendations: this.generateRecommendations()
    };

    // Salva report JSON
    const reportPath = path.join(process.cwd(), 'analisi-microscopica', '08-incomplete', 'ui-completeness-analysis.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Genera report markdown
    await this.generateMarkdownReport(report);

    console.log(`✅ Report salvato in: ${reportPath}`);
  }

  calculateAverageCompleteness() {
    const completenessValues = Array.from(this.components.values()).map(c => c.completeness);
    return completenessValues.reduce((sum, val) => sum + val, 0) / completenessValues.length;
  }

  generateRecommendations() {
    const recommendations = [];

    // Raccomandazioni per componenti incompleti
    if (this.incompleteComponents.length > 0) {
      recommendations.push({
        category: 'Componenti Incompleti',
        priority: 'high',
        items: this.incompleteComponents.map(c => 
          `Completare ${c.name} (completezza: ${(c.completeness * 100).toFixed(1)}%)`
        )
      });
    }

    // Raccomandazioni accessibilità
    if (this.accessibilityIssues.length > 0) {
      recommendations.push({
        category: 'Accessibilità',
        priority: 'medium',
        items: [
          'Aggiungere attributi ARIA a tutti i componenti interattivi',
          'Implementare navigazione da tastiera completa',
          'Verificare contrasto colori per conformità WCAG'
        ]
      });
    }

    // Raccomandazioni usabilità
    if (this.usabilityIssues.length > 0) {
      recommendations.push({
        category: 'Usabilità',
        priority: 'medium',
        items: [
          'Aggiungere feedback di caricamento a tutte le operazioni async',
          'Implementare gestione errori user-friendly',
          'Aggiungere istruzioni e help contestuale'
        ]
      });
    }

    return recommendations;
  }

  async generateMarkdownReport(report) {
    const markdown = `# Analisi Completezza UI e Componenti

**Data Analisi**: ${new Date(report.timestamp).toLocaleString('it-IT')}  
**Versione Progetto**: v0.6.4 "How hard is it to wade across a river?"

## 📊 Riepilogo Esecutivo

- **Componenti Totali**: ${report.summary.totalComponents}
- **Componenti Incompleti**: ${report.summary.incompleteComponents}
- **Problemi Accessibilità**: ${report.summary.accessibilityIssues}
- **Problemi Usabilità**: ${report.summary.usabilityIssues}
- **Completezza Media**: ${(report.summary.averageCompleteness * 100).toFixed(1)}%

## 🎨 Analisi Componenti per Categoria

### Schermate (Screens)
${this.generateComponentCategorySection(report.componentAnalysis, 'screen')}

### Pannelli (Panels)
${this.generateComponentCategorySection(report.componentAnalysis, 'panel')}

### Componenti di Sistema
${this.generateComponentCategorySection(report.componentAnalysis, 'system')}

### Altri Componenti
${this.generateComponentCategorySection(report.componentAnalysis, 'component')}

## ❌ Componenti Incompleti

${report.incompleteComponents.length === 0 ? '*Nessun componente significativamente incompleto*' : ''}
${report.incompleteComponents.map(comp => `
### ${comp.name}
- **Completezza**: ${(comp.completeness * 100).toFixed(1)}%
- **Tipo**: ${comp.type}
- **Complessità**: ${comp.complexity}
- **Problemi**: ${comp.issues.length}
- **Placeholder**: ${comp.placeholders.length}
- **TODO**: ${comp.todos.length}

**Problemi Principali**:
${comp.issues.map(issue => `- ${issue}`).join('\n')}

${comp.placeholders.length > 0 ? `**Placeholder Trovati**:
${comp.placeholders.map(p => `- Linea ${p.line}: ${p.text}`).join('\n')}` : ''}

${comp.todos.length > 0 ? `**TODO Trovati**:
${comp.todos.map(t => `- Linea ${t.line}: ${t.text}`).join('\n')}` : ''}
`).join('\n')}

## ♿ Problemi di Accessibilità

${report.accessibilityIssues.length === 0 ? '*Nessun problema di accessibilità critico identificato*' : ''}
${report.accessibilityIssues.map(issue => `
### ${issue.component}
${issue.issues.map(i => `- ${i}`).join('\n')}
`).join('\n')}

## 👤 Problemi di Usabilità

${report.usabilityIssues.length === 0 ? '*Nessun problema di usabilità critico identificato*' : ''}
${report.usabilityIssues.map(issue => `
### ${issue.component}
${issue.issues.map(i => `- ${i}`).join('\n')}
`).join('\n')}

## 🔗 Problemi di Integrazione

${report.uiIssues.map(issue => `
### ${issue.component}
**Categoria**: ${issue.category}
${issue.issues.map(i => `- ${i}`).join('\n')}
`).join('\n')}

## 🎯 Raccomandazioni

${report.recommendations.map(rec => `
### ${rec.category} (Priorità: ${rec.priority})
${rec.items.map(item => `- ${item}`).join('\n')}
`).join('\n')}

## 📋 Piano di Azione

### Priorità 1 - Componenti Critici Incompleti
${report.incompleteComponents
  .filter(c => c.completeness < 0.6)
  .map(c => `- [ ] Completare ${c.name} (${(c.completeness * 100).toFixed(1)}% completezza)`)
  .join('\n')}

### Priorità 2 - Accessibilità
- [ ] Implementare attributi ARIA per tutti i componenti interattivi
- [ ] Aggiungere supporto navigazione da tastiera completa
- [ ] Verificare e correggere contrasto colori

### Priorità 3 - Usabilità
- [ ] Aggiungere feedback di caricamento
- [ ] Migliorare gestione errori user-friendly
- [ ] Implementare help contestuale

### Priorità 4 - Edge Cases
- [ ] Implementare gestione stati vuoti
- [ ] Aggiungere validazione input robusta
- [ ] Gestire errori di rete e timeout

## 📊 Metriche Dettagliate

### Distribuzione Completezza
- **90-100%**: ${report.componentAnalysis.filter(c => c.completeness >= 0.9).length} componenti
- **80-89%**: ${report.componentAnalysis.filter(c => c.completeness >= 0.8 && c.completeness < 0.9).length} componenti
- **70-79%**: ${report.componentAnalysis.filter(c => c.completeness >= 0.7 && c.completeness < 0.8).length} componenti
- **<70%**: ${report.componentAnalysis.filter(c => c.completeness < 0.7).length} componenti

### Feature Implementation
- **State Management**: ${report.componentAnalysis.filter(c => c.features.hasState).length}/${report.componentAnalysis.length}
- **Keyboard Handling**: ${report.componentAnalysis.filter(c => c.features.hasKeyboardHandling).length}/${report.componentAnalysis.length}
- **Error Handling**: ${report.componentAnalysis.filter(c => c.features.hasErrorHandling).length}/${report.componentAnalysis.length}
- **Loading States**: ${report.componentAnalysis.filter(c => c.features.hasLoading).length}/${report.componentAnalysis.length}
- **Accessibility**: ${report.componentAnalysis.filter(c => c.features.hasAccessibility).length}/${report.componentAnalysis.length}

---

*Report generato automaticamente dal UI Completeness Analyzer*
`;

    const markdownPath = path.join(process.cwd(), 'analisi-microscopica', '08-incomplete', 'ui-completeness-analysis.md');
    await fs.writeFile(markdownPath, markdown);
  }

  generateComponentCategorySection(components, category) {
    const categoryComponents = components.filter(c => c.type === category);
    
    if (categoryComponents.length === 0) {
      return '*Nessun componente in questa categoria*';
    }

    return categoryComponents.map(comp => `
**${comp.name}**
- Completezza: ${(comp.completeness * 100).toFixed(1)}%
- Complessità: ${comp.complexity}
- Problemi: ${comp.issues.length}
- Features: ${Object.values(comp.features).filter(Boolean).length}/${Object.keys(comp.features).length}
`).join('\n');
  }
}

// Esecuzione
const analyzer = new UICompletenessAnalyzer();
analyzer.analyzeProject().catch(console.error);

export default UICompletenessAnalyzer;