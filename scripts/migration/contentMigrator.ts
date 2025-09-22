/**
 * Content Migrator - Script per migrare contenuti esistenti nella v2.0
 * Valida e adatta database items, eventi e contenuti narrativi
 */

import * as fs from 'fs';
import * as path from 'path';

interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: string[];
  warnings: string[];
}

export class ContentMigrator {
  private sourceDir = path.join(process.cwd(), 'src', 'data');
  private targetDir = path.join(process.cwd(), 'src', 'data');

  /**
   * Migra tutti i contenuti
   */
  async migrateAll(): Promise<MigrationResult> {
    const results: MigrationResult[] = [];

    // Migra items
    results.push(await this.migrateItems());

    // Migra eventi
    results.push(await this.migrateEvents());

    // Migra contenuti narrativi
    results.push(await this.migrateNarrative());

    // Combina risultati
    return {
      success: results.every(r => r.success),
      migrated: results.reduce((sum, r) => sum + r.migrated, 0),
      errors: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings)
    };
  }

  /**
   * Migra database items
   */
  private async migrateItems(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrated: 0,
      errors: [],
      warnings: []
    };

    const itemFiles = [
      'weapons.json',
      'armor.json',
      'consumables.json',
      'crafting_materials.json',
      'ammo.json',
      'quest_items.json'
    ];

    for (const file of itemFiles) {
      try {
        const sourcePath = path.join(this.sourceDir, 'items', file);
        const targetPath = path.join(this.targetDir, 'items', file);

        if (!fs.existsSync(sourcePath)) {
          result.warnings.push(`File ${file} non trovato, saltato`);
          continue;
        }

        const content = fs.readFileSync(sourcePath, 'utf-8');
        const items = JSON.parse(content);

        // Valida struttura base
        if (!Array.isArray(items)) {
          result.errors.push(`File ${file}: struttura non valida (non è un array)`);
          continue;
        }

        // Adatta formato se necessario
        const migratedItems = items.map((item: any) => this.adaptItemFormat(item, file));

        // Scrivi file migrato
        fs.writeFileSync(targetPath, JSON.stringify(migratedItems, null, 2));

        result.migrated += migratedItems.length;
        console.log(`✓ Migrato ${file}: ${migratedItems.length} items`);

      } catch (error) {
        result.errors.push(`Errore migrazione ${file}: ${error}`);
        result.success = false;
      }
    }

    return result;
  }

  /**
   * Migra eventi di gioco
   */
  private async migrateEvents(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrated: 0,
      errors: [],
      warnings: []
    };

    const eventFiles = [
      'plains_events.json',
      'forest_events.json',
      'village_events.json',
      'city_events.json',
      'random_events.json',
      'main_quest_events.json',
      'sequences.json'
    ];

    for (const file of eventFiles) {
      try {
        const sourcePath = path.join(this.sourceDir, 'events', file);
        const targetPath = path.join(this.targetDir, 'events', file);

        if (!fs.existsSync(sourcePath)) {
          result.warnings.push(`File eventi ${file} non trovato, saltato`);
          continue;
        }

        const content = fs.readFileSync(sourcePath, 'utf-8');
        const events = JSON.parse(content);

        if (!Array.isArray(events) && typeof events !== 'object') {
          result.errors.push(`File ${file}: struttura non valida`);
          continue;
        }

        // Adatta formato eventi
        const migratedEvents = Array.isArray(events)
          ? events.map(event => this.adaptEventFormat(event))
          : this.adaptEventObjectFormat(events);

        fs.writeFileSync(targetPath, JSON.stringify(migratedEvents, null, 2));

        const count = Array.isArray(migratedEvents) ? migratedEvents.length : Object.keys(migratedEvents).length;
        result.migrated += count;
        console.log(`✓ Migrato ${file}: ${count} eventi`);

      } catch (error) {
        result.errors.push(`Errore migrazione eventi ${file}: ${error}`);
        result.success = false;
      }
    }

    return result;
  }

  /**
   * Migra contenuti narrativi
   */
  private async migrateNarrative(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrated: 0,
      errors: [],
      warnings: []
    };

    const narrativeFiles = [
      'loreEvents/thematicEvents.json',
      'mainQuest/stage1-testamento.json'
    ];

    for (const file of narrativeFiles) {
      try {
        const sourcePath = path.join(this.sourceDir, 'narrative', file);
        const targetPath = path.join(this.targetDir, 'narrative', file);

        if (!fs.existsSync(sourcePath)) {
          result.warnings.push(`File narrativo ${file} non trovato, saltato`);
          continue;
        }

        const content = fs.readFileSync(sourcePath, 'utf-8');
        const narrative = JSON.parse(content);

        // Adatta formato narrativo
        const migratedNarrative = this.adaptNarrativeFormat(narrative, file);

        // Assicura directory target
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(targetPath, JSON.stringify(migratedNarrative, null, 2));

        result.migrated += 1;
        console.log(`✓ Migrato contenuto narrativo ${file}`);

      } catch (error) {
        result.errors.push(`Errore migrazione narrativa ${file}: ${error}`);
        result.success = false;
      }
    }

    return result;
  }

  /**
   * Adatta formato item per v2.0
   */
  private adaptItemFormat(item: any, file: string): any {
    // Struttura base già compatibile, aggiungi campi mancanti se necessario
    const adapted = { ...item };

    // Assicura campi obbligatori
    if (!adapted.id) adapted.id = `item_${Date.now()}_${Math.random()}`;
    if (!adapted.name) adapted.name = 'Item Sconosciuto';
    if (!adapted.type) adapted.type = this.inferItemType(file);

    // Normalizza valori numerici
    if (typeof adapted.weight !== 'number') adapted.weight = 1;
    if (typeof adapted.value !== 'number') adapted.value = 0;

    return adapted;
  }

  /**
   * Adatta formato evento per v2.0
   */
  private adaptEventFormat(event: any): any {
    const adapted = { ...event };

    // Assicura campi base
    if (!adapted.id) adapted.id = `event_${Date.now()}_${Math.random()}`;
    if (!adapted.title) adapted.title = adapted.name || 'Evento Sconosciuto';
    if (!adapted.type) adapted.type = 'random';

    // Normalizza choices
    if (adapted.choices && Array.isArray(adapted.choices)) {
      adapted.choices = adapted.choices.map((choice: any) => ({
        id: choice.id || `choice_${Math.random()}`,
        text: choice.text || choice.label || 'Opzione',
        consequences: choice.consequences || {}
      }));
    }

    return adapted;
  }

  /**
   * Adatta oggetto eventi (per sequences.json)
   */
  private adaptEventObjectFormat(events: any): any {
    const adapted: any = {};

    for (const [key, value] of Object.entries(events)) {
      if (Array.isArray(value)) {
        adapted[key] = value.map(event => this.adaptEventFormat(event));
      } else {
        adapted[key] = this.adaptEventFormat(value);
      }
    }

    return adapted;
  }

  /**
   * Adatta formato narrativo per v2.0
   */
  private adaptNarrativeFormat(narrative: any, file: string): any {
    // Per ora mantiene struttura esistente, può essere adattata in futuro
    return narrative;
  }

  /**
   * Inferisci tipo item dal nome file
   */
  private inferItemType(filename: string): string {
    if (filename.includes('weapon')) return 'weapon';
    if (filename.includes('armor')) return 'armor';
    if (filename.includes('consumable')) return 'consumable';
    if (filename.includes('material')) return 'material';
    if (filename.includes('ammo')) return 'ammo';
    if (filename.includes('quest')) return 'quest';
    return 'misc';
  }

  /**
   * Genera report di migrazione
   */
  generateReport(result: MigrationResult): string {
    let report = '# Report Migrazione Contenuti v2.0\n\n';

    report += `## Risultato: ${result.success ? 'SUCCESSO' : 'FALLIMENTO'}\n\n`;
    report += `**Elementi migrati:** ${result.migrated}\n\n`;

    if (result.errors.length > 0) {
      report += '## Errori\n\n';
      result.errors.forEach(error => {
        report += `- ❌ ${error}\n`;
      });
      report += '\n';
    }

    if (result.warnings.length > 0) {
      report += '## Avvertimenti\n\n';
      result.warnings.forEach(warning => {
        report += `- ⚠️ ${warning}\n`;
      });
      report += '\n';
    }

    report += '## File Migrati\n\n';
    report += '- Database items (armi, armature, consumabili, materiali)\n';
    report += '- Eventi bioma (pianure, foreste, villaggi, città)\n';
    report += '- Eventi casuali e sequenze\n';
    report += '- Contenuti narrativi (main quest, eventi lore)\n';

    return report;
  }
}

// Script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new ContentMigrator();

  migrator.migrateAll()
    .then(result => {
      const report = migrator.generateReport(result);
      console.log('\n' + '='.repeat(50));
      console.log(report);
      console.log('='.repeat(50));

      // Scrivi report su file
      const reportPath = path.join(process.cwd(), 'migration-report.md');
      fs.writeFileSync(reportPath, report);
      console.log(`Report salvato in: ${reportPath}`);

      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Errore durante la migrazione:', error);
      process.exit(1);
    });
}