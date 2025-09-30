#!/usr/bin/env node

/**
 * Feature Documentation Analyzer
 * Analizza le feature documentate vs implementate per identificare gap e incompletezze
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FeatureDocumentationAnalyzer {
  constructor() {
    this.documentedFeatures = new Map();
    this.implementedFeatures = new Map();
    this.gaps = [];
    this.incompleteFeatures = [];
    this.missingFeatures = [];
  }

  async analyzeProject() {
    console.log('🔍 Avvio analisi feature documentate vs implementate...\n');

    // Analizza documentazione
    await this.analyzeDocumentation();
    
    // Analizza implementazione
    await this.analyzeImplementation();
    
    // Confronta e identifica gap
    await this.identifyGaps();
    
    // Genera report
    await this.generateReport();
  }

  async analyzeDocumentation() {
    console.log('📚 Analisi documentazione...');

    // Analizza README.md
    await this.analyzeReadme();
    
    // Analizza changelog
    await this.analyzeChangelogs();
    
    // Analizza roadmap
    await this.analyzeRoadmaps();
    
    // Analizza DSAR
    await this.analyzeDSAR();

    console.log(`✅ Trovate ${this.documentedFeatures.size} feature documentate\n`);
  }

  async analyzeReadme() {
    try {
      const readmePath = path.join(process.cwd(), 'README.md');
      const content = await fs.readFile(readmePath, 'utf8');
      
      // Estrai feature dal README
      const features = this.extractFeaturesFromMarkdown(content, 'README.md');
      features.forEach(feature => {
        this.documentedFeatures.set(feature.name, {
          ...feature,
          source: 'README.md',
          status: 'documented'
        });
      });
    } catch (error) {
      console.warn('⚠️ Errore lettura README.md:', error.message);
    }
  }

  async analyzeChangelogs() {
    try {
      const changelogDir = path.join(process.cwd(), 'documentazione', 'changelog');
      const files = await fs.readdir(changelogDir);
      
      for (const file of files.filter(f => f.endsWith('.md'))) {
        const filePath = path.join(changelogDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        const features = this.extractFeaturesFromMarkdown(content, file);
        features.forEach(feature => {
          const existing = this.documentedFeatures.get(feature.name);
          if (existing) {
            existing.sources = existing.sources || [];
            existing.sources.push(file);
          } else {
            this.documentedFeatures.set(feature.name, {
              ...feature,
              source: file,
              status: 'documented'
            });
          }
        });
      }
    } catch (error) {
      console.warn('⚠️ Errore lettura changelog:', error.message);
    }
  }

  async analyzeRoadmaps() {
    try {
      const roadmapPath = path.join(process.cwd(), 'documentazione', 'roadmap', 'ROADMAP-GAMEPLAY-LOOP-v0.5.0.md');
      const content = await fs.readFile(roadmapPath, 'utf8');
      
      const features = this.extractRoadmapFeatures(content);
      features.forEach(feature => {
        this.documentedFeatures.set(feature.name, {
          ...feature,
          source: 'ROADMAP-GAMEPLAY-LOOP-v0.5.0.md',
          status: 'planned'
        });
      });
    } catch (error) {
      console.warn('⚠️ Errore lettura roadmap:', error.message);
    }
  }

  async analyzeDSAR() {
    try {
      const dsarDir = path.join(process.cwd(), 'documentazione', 'dsar');
      const files = await fs.readdir(dsarDir);
      
      for (const file of files.filter(f => f.endsWith('.md'))) {
        const filePath = path.join(dsarDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        const features = this.extractDSARFeatures(content, file);
        features.forEach(feature => {
          this.documentedFeatures.set(feature.name, {
            ...feature,
            source: file,
            status: 'immutable'
          });
        });
      }
    } catch (error) {
      console.warn('⚠️ Errore lettura DSAR:', error.message);
    }
  }

  async analyzeImplementation() {
    console.log('💻 Analisi implementazione...');

    // Analizza componenti React
    await this.analyzeComponents();
    
    // Analizza store Zustand
    await this.analyzeStores();
    
    // Analizza utilities e sistemi
    await this.analyzeUtilities();
    
    // Analizza dati di gioco
    await this.analyzeGameData();

    console.log(`✅ Trovate ${this.implementedFeatures.size} feature implementate\n`);
  }

  async analyzeComponents() {
    try {
      const componentsDir = path.join(process.cwd(), 'src', 'components');
      const files = await fs.readdir(componentsDir);
      
      for (const file of files.filter(f => f.endsWith('.tsx'))) {
        const filePath = path.join(componentsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        const features = this.extractImplementedFeatures(content, file);
        features.forEach(feature => {
          this.implementedFeatures.set(feature.name, {
            ...feature,
            source: `components/${file}`,
            type: 'component'
          });
        });
      }
    } catch (error) {
      console.warn('⚠️ Errore analisi componenti:', error.message);
    }
  }

  async analyzeStores() {
    try {
      const storesDir = path.join(process.cwd(), 'src', 'stores');
      const files = await fs.readdir(storesDir);
      
      for (const file of files.filter(f => f.endsWith('.ts'))) {
        const filePath = path.join(storesDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        const features = this.extractStoreFeatures(content, file);
        features.forEach(feature => {
          this.implementedFeatures.set(feature.name, {
            ...feature,
            source: `stores/${file}`,
            type: 'store'
          });
        });
      }
    } catch (error) {
      console.warn('⚠️ Errore analisi stores:', error.message);
    }
  }

  async analyzeUtilities() {
    try {
      const utilsDir = path.join(process.cwd(), 'src', 'utils');
      const files = await fs.readdir(utilsDir);
      
      for (const file of files.filter(f => f.endsWith('.ts'))) {
        const filePath = path.join(utilsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        const features = this.extractUtilityFeatures(content, file);
        features.forEach(feature => {
          this.implementedFeatures.set(feature.name, {
            ...feature,
            source: `utils/${file}`,
            type: 'utility'
          });
        });
      }
    } catch (error) {
      console.warn('⚠️ Errore analisi utilities:', error.message);
    }
  }

  async analyzeGameData() {
    try {
      const dataDir = path.join(process.cwd(), 'src', 'data');
      const subdirs = ['items', 'events'];
      
      for (const subdir of subdirs) {
        const subdirPath = path.join(dataDir, subdir);
        try {
          const files = await fs.readdir(subdirPath);
          
          for (const file of files.filter(f => f.endsWith('.json'))) {
            const filePath = path.join(subdirPath, file);
            const content = await fs.readFile(filePath, 'utf8');
            
            const features = this.extractDataFeatures(content, file, subdir);
            features.forEach(feature => {
              this.implementedFeatures.set(feature.name, {
                ...feature,
                source: `data/${subdir}/${file}`,
                type: 'data'
              });
            });
          }
        } catch (error) {
          // Directory potrebbe non esistere
        }
      }
    } catch (error) {
      console.warn('⚠️ Errore analisi dati di gioco:', error.message);
    }
  }

  extractFeaturesFromMarkdown(content, source) {
    const features = [];
    
    // Pattern per feature principali
    const patterns = [
      /### 🌟 Caratteristiche Principali v[\d.]+\s*\n([\s\S]*?)(?=###|##|$)/g,
      /#### 🌧️ Sistema Meteo Dinamico Avanzato/g,
      /#### 🏠 Sistema Rifugi/g,
      /#### 🎮 Miglioramenti Gameplay Core/g,
      /#### 🌊 Sistema Attraversamento Fiumi/g,
      /#### 🔧 Fondamenta Tecniche/g,
      /#### 📁 Sistema Save\/Load/g,
      /#### 🎲 Eventi/g,
      /#### ⚔️ Sistema Equipaggiamento/g,
      /#### 🔄 Gameplay Loop/g,
      /#### 🆙 Sistema Level Up/g,
      /#### 🎒 Inventario Avanzato/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const featureName = match[0].replace(/#{1,4}\s*/, '').replace(/🌟|🌧️|🏠|🎮|🌊|🔧|📁|🎲|⚔️|🔄|🆙|🎒/g, '').trim();
        features.push({
          name: featureName,
          description: match[1] || '',
          category: this.categorizeFeature(featureName),
          priority: this.getPriority(featureName)
        });
      }
    });

    return features;
  }

  extractRoadmapFeatures(content) {
    const features = [];
    
    // Estrai milestone e task dalla roadmap
    const milestonePattern = /### \*\*MILESTONE \d+: (.+?)\*\*/g;
    const taskPattern = /- \[ \] \*\*(\d+\.\d+\.\d+)\*\*: (.+)/g;
    
    let match;
    while ((match = milestonePattern.exec(content)) !== null) {
      features.push({
        name: match[1],
        description: 'Milestone dalla roadmap',
        category: 'milestone',
        priority: 'high',
        status: 'planned'
      });
    }
    
    while ((match = taskPattern.exec(content)) !== null) {
      features.push({
        name: match[2],
        description: `Task ${match[1]}`,
        category: 'task',
        priority: 'medium',
        status: 'planned'
      });
    }

    return features;
  }

  extractDSARFeatures(content, filename) {
    const features = [];
    
    // Estrai requisiti funzionali
    const rfPattern = /#### \*\*RF-\d+: (.+?)\*\*/g;
    const rnfPattern = /#### \*\*RNF-\d+: (.+?)\*\*/g;
    
    let match;
    while ((match = rfPattern.exec(content)) !== null) {
      features.push({
        name: match[1],
        description: 'Requisito funzionale DSAR',
        category: 'requirement',
        priority: 'critical',
        status: 'immutable'
      });
    }
    
    while ((match = rnfPattern.exec(content)) !== null) {
      features.push({
        name: match[1],
        description: 'Requisito non funzionale DSAR',
        category: 'requirement',
        priority: 'high',
        status: 'immutable'
      });
    }

    return features;
  }

  extractImplementedFeatures(content, filename) {
    const features = [];
    
    // Analizza componenti React
    const componentMatch = content.match(/const\s+(\w+)(?:Screen|Panel|Display|System)?\s*[:=]/g);
    if (componentMatch) {
      componentMatch.forEach(match => {
        const name = match.replace(/const\s+/, '').replace(/\s*[:=].*/, '');
        features.push({
          name: `Componente ${name}`,
          description: `Componente React implementato in ${filename}`,
          category: 'ui',
          completeness: this.analyzeComponentCompleteness(content, name)
        });
      });
    }

    // Analizza funzioni specifiche
    const functionPatterns = [
      /handleSave|saveGame|loadGame/g,
      /handleCombat|startCombat|attackEnemy/g,
      /handleCraft|craftItem|useWorkbench/g,
      /handleEvent|triggerEvent|processEvent/g,
      /handleMovement|movePlayer|updatePosition/g,
      /handleInventory|addItem|removeItem|useItem/g,
      /handleWeather|updateWeather|getWeatherEffect/g,
      /handleRiver|crossRiver|calculateRiverDifficulty/g
    ];

    functionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          features.push({
            name: `Sistema ${this.functionToSystemName(match)}`,
            description: `Funzione ${match} implementata`,
            category: 'system',
            completeness: this.analyzeFunctionCompleteness(content, match)
          });
        });
      }
    });

    return features;
  }

  extractStoreFeatures(content, filename) {
    const features = [];
    
    // Analizza store Zustand
    const storePattern = /(\w+):\s*\([^)]*\)\s*=>/g;
    let match;
    while ((match = storePattern.exec(content)) !== null) {
      features.push({
        name: `Store Action: ${match[1]}`,
        description: `Azione store implementata in ${filename}`,
        category: 'store',
        completeness: 'implemented'
      });
    }

    return features;
  }

  extractUtilityFeatures(content, filename) {
    const features = [];
    
    // Analizza utilities
    const utilityPatterns = [
      { pattern: /export.*save/gi, name: 'Sistema Salvataggio' },
      { pattern: /export.*load/gi, name: 'Sistema Caricamento' },
      { pattern: /export.*weather/gi, name: 'Sistema Meteo' },
      { pattern: /export.*river/gi, name: 'Sistema Fiumi' },
      { pattern: /export.*combat/gi, name: 'Sistema Combattimento' },
      { pattern: /export.*craft/gi, name: 'Sistema Crafting' },
      { pattern: /export.*event/gi, name: 'Sistema Eventi' }
    ];

    utilityPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(content)) {
        features.push({
          name,
          description: `Utility implementata in ${filename}`,
          category: 'utility',
          completeness: this.analyzeUtilityCompleteness(content, name)
        });
      }
    });

    return features;
  }

  extractDataFeatures(content, filename, subdir) {
    const features = [];
    
    try {
      const data = JSON.parse(content);
      
      if (subdir === 'items') {
        const itemCount = Array.isArray(data) ? data.length : Object.keys(data).length;
        features.push({
          name: `Database ${filename.replace('.json', '')}`,
          description: `${itemCount} oggetti definiti`,
          category: 'data',
          completeness: itemCount > 0 ? 'implemented' : 'empty'
        });
      }
      
      if (subdir === 'events') {
        const eventCount = Array.isArray(data) ? data.length : Object.keys(data).length;
        features.push({
          name: `Database Eventi ${filename.replace('.json', '')}`,
          description: `${eventCount} eventi definiti`,
          category: 'data',
          completeness: eventCount > 0 ? 'implemented' : 'empty'
        });
      }
    } catch (error) {
      // File JSON non valido
    }

    return features;
  }

  async identifyGaps() {
    console.log('🔍 Identificazione gap e incompletezze...');

    // Confronta feature documentate vs implementate
    for (const [name, docFeature] of this.documentedFeatures) {
      const implemented = this.findImplementedFeature(name);
      
      if (!implemented) {
        this.missingFeatures.push({
          name,
          ...docFeature,
          gap: 'missing_implementation'
        });
      } else if (implemented.completeness === 'partial') {
        this.incompleteFeatures.push({
          name,
          documented: docFeature,
          implemented,
          gap: 'incomplete_implementation'
        });
      }
    }

    // Identifica feature implementate ma non documentate
    for (const [name, implFeature] of this.implementedFeatures) {
      const documented = this.findDocumentedFeature(name);
      
      if (!documented) {
        this.gaps.push({
          name,
          ...implFeature,
          gap: 'undocumented_implementation'
        });
      }
    }

    console.log(`❌ ${this.missingFeatures.length} feature mancanti`);
    console.log(`⚠️ ${this.incompleteFeatures.length} feature incomplete`);
    console.log(`📝 ${this.gaps.length} feature non documentate\n`);
  }

  findImplementedFeature(docName) {
    // Cerca corrispondenze esatte o parziali
    for (const [implName, feature] of this.implementedFeatures) {
      if (this.featuresMatch(docName, implName)) {
        return feature;
      }
    }
    return null;
  }

  findDocumentedFeature(implName) {
    // Cerca corrispondenze esatte o parziali
    for (const [docName, feature] of this.documentedFeatures) {
      if (this.featuresMatch(docName, implName)) {
        return feature;
      }
    }
    return null;
  }

  featuresMatch(name1, name2) {
    const normalize = (str) => str.toLowerCase()
      .replace(/[🌟🌧️🏠🎮🌊🔧📁🎲⚔️🔄🆙🎒]/g, '')
      .replace(/sistema|system|componente|component/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const n1 = normalize(name1);
    const n2 = normalize(name2);
    
    return n1.includes(n2) || n2.includes(n1) || n1 === n2;
  }

  analyzeComponentCompleteness(content, componentName) {
    // Analizza se il componente è completo
    const hasHandlers = /handle\w+/.test(content);
    const hasState = /useState|useGameStore/.test(content);
    const hasEffects = /useEffect/.test(content);
    const hasTodos = /TODO|FIXME|placeholder/i.test(content);
    
    if (hasTodos) return 'partial';
    if (hasHandlers && hasState && hasEffects) return 'implemented';
    if (hasHandlers || hasState) return 'partial';
    return 'skeleton';
  }

  analyzeFunctionCompleteness(content, functionName) {
    const functionRegex = new RegExp(`${functionName}[^{]*{([^}]*)}`, 'g');
    const match = functionRegex.exec(content);
    
    if (!match) return 'missing';
    
    const body = match[1];
    if (body.includes('TODO') || body.includes('placeholder')) return 'partial';
    if (body.trim().length < 50) return 'skeleton';
    return 'implemented';
  }

  analyzeUtilityCompleteness(content, utilityName) {
    if (content.includes('TODO') || content.includes('placeholder')) return 'partial';
    if (content.length < 200) return 'skeleton';
    return 'implemented';
  }

  categorizeFeature(featureName) {
    const categories = {
      'ui': ['schermata', 'screen', 'panel', 'display', 'interfaccia'],
      'system': ['sistema', 'system', 'engine', 'manager'],
      'gameplay': ['gameplay', 'gioco', 'meccanica', 'loop'],
      'data': ['database', 'dati', 'oggetti', 'items'],
      'technical': ['performance', 'build', 'config', 'setup']
    };

    const name = featureName.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    return 'other';
  }

  getPriority(featureName) {
    const critical = ['save', 'load', 'movement', 'core', 'base'];
    const high = ['combat', 'inventory', 'character', 'survival'];
    const medium = ['weather', 'events', 'ui', 'display'];
    
    const name = featureName.toLowerCase();
    if (critical.some(keyword => name.includes(keyword))) return 'critical';
    if (high.some(keyword => name.includes(keyword))) return 'high';
    if (medium.some(keyword => name.includes(keyword))) return 'medium';
    return 'low';
  }

  functionToSystemName(functionName) {
    const mapping = {
      'handleSave': 'Salvataggio',
      'saveGame': 'Salvataggio',
      'loadGame': 'Caricamento',
      'handleCombat': 'Combattimento',
      'startCombat': 'Combattimento',
      'handleCraft': 'Crafting',
      'craftItem': 'Crafting',
      'handleEvent': 'Eventi',
      'handleMovement': 'Movimento',
      'handleInventory': 'Inventario',
      'handleWeather': 'Meteo',
      'handleRiver': 'Attraversamento Fiumi'
    };
    
    return mapping[functionName] || functionName;
  }

  async generateReport() {
    console.log('📊 Generazione report...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        documentedFeatures: this.documentedFeatures.size,
        implementedFeatures: this.implementedFeatures.size,
        missingFeatures: this.missingFeatures.length,
        incompleteFeatures: this.incompleteFeatures.length,
        undocumentedFeatures: this.gaps.length
      },
      missingFeatures: this.missingFeatures,
      incompleteFeatures: this.incompleteFeatures,
      undocumentedFeatures: this.gaps,
      recommendations: this.generateRecommendations()
    };

    // Salva report JSON
    const reportPath = path.join(process.cwd(), 'analisi-microscopica', '08-incomplete', 'feature-documentation-gap-analysis.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Genera report markdown
    await this.generateMarkdownReport(report);

    console.log(`✅ Report salvato in: ${reportPath}`);
  }

  async generateMarkdownReport(report) {
    const markdown = `# Analisi Gap Feature Documentate vs Implementate

**Data Analisi**: ${new Date(report.timestamp).toLocaleString('it-IT')}  
**Versione Progetto**: v0.6.4 "How hard is it to wade across a river?"

## 📊 Riepilogo Esecutivo

- **Feature Documentate**: ${report.summary.documentedFeatures}
- **Feature Implementate**: ${report.summary.implementedFeatures}
- **Feature Mancanti**: ${report.summary.missingFeatures}
- **Feature Incomplete**: ${report.summary.incompleteFeatures}
- **Feature Non Documentate**: ${report.summary.undocumentedFeatures}

## ❌ Feature Documentate ma Non Implementate

${report.missingFeatures.length === 0 ? '*Nessuna feature mancante identificata*' : ''}
${report.missingFeatures.map(feature => `
### ${feature.name}
- **Fonte**: ${feature.source}
- **Categoria**: ${feature.category}
- **Priorità**: ${feature.priority}
- **Status**: ${feature.status}
- **Descrizione**: ${feature.description}
`).join('\n')}

## ⚠️ Feature Parzialmente Implementate

${report.incompleteFeatures.length === 0 ? '*Nessuna feature incompleta identificata*' : ''}
${report.incompleteFeatures.map(feature => `
### ${feature.name}
- **Documentato in**: ${feature.documented.source}
- **Implementato in**: ${feature.implemented.source}
- **Completezza**: ${feature.implemented.completeness}
- **Gap**: ${feature.gap}
`).join('\n')}

## 📝 Feature Implementate ma Non Documentate

${report.undocumentedFeatures.length === 0 ? '*Nessuna feature non documentata identificata*' : ''}
${report.undocumentedFeatures.map(feature => `
### ${feature.name}
- **Implementato in**: ${feature.source}
- **Tipo**: ${feature.type}
- **Categoria**: ${feature.category}
- **Descrizione**: ${feature.description}
`).join('\n')}

## 🎯 Raccomandazioni

${report.recommendations.map(rec => `
### ${rec.category}
${rec.items.map(item => `- ${item}`).join('\n')}
`).join('\n')}

## 📋 Prossimi Passi

1. **Priorità Alta**: Completare le feature critiche mancanti
2. **Priorità Media**: Documentare le feature implementate ma non documentate
3. **Priorità Bassa**: Completare le feature parzialmente implementate

---

*Report generato automaticamente dal Feature Documentation Analyzer*
`;

    const markdownPath = path.join(process.cwd(), 'analisi-microscopica', '08-incomplete', 'feature-documentation-gap-analysis.md');
    await fs.writeFile(markdownPath, markdown);
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.missingFeatures.length > 0) {
      const critical = this.missingFeatures.filter(f => f.priority === 'critical');
      const high = this.missingFeatures.filter(f => f.priority === 'high');
      
      if (critical.length > 0) {
        recommendations.push({
          category: 'Feature Critiche Mancanti',
          items: critical.map(f => `Implementare ${f.name} (${f.source})`)
        });
      }
      
      if (high.length > 0) {
        recommendations.push({
          category: 'Feature Importanti Mancanti',
          items: high.map(f => `Implementare ${f.name} (${f.source})`)
        });
      }
    }

    if (this.incompleteFeatures.length > 0) {
      recommendations.push({
        category: 'Feature da Completare',
        items: this.incompleteFeatures.map(f => `Completare ${f.name} in ${f.implemented.source}`)
      });
    }

    if (this.gaps.length > 0) {
      recommendations.push({
        category: 'Documentazione da Aggiornare',
        items: this.gaps.map(f => `Documentare ${f.name} implementato in ${f.source}`)
      });
    }

    return recommendations;
  }
}

// Esecuzione
const analyzer = new FeatureDocumentationAnalyzer();
analyzer.analyzeProject().catch(console.error);

export default FeatureDocumentationAnalyzer;