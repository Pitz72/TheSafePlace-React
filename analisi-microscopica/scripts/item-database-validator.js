/**
 * Item Database Validation Script
 * Implementa la validazione completa del database oggetti per task 7.1
 * 
 * Requisiti:
 * - Verificare integrità schema tutti gli oggetti
 * - Controllare unicità ID e referenze
 * - Validare completezza campi richiesti
 * - Testare bilanciamento valori oggetti
 * - Identificare oggetti orfani o non utilizzati
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ItemDatabaseValidator {
    constructor() {
        this.itemsPath = path.join(process.cwd(), 'src/data/items');
        this.results = {
            schemaValidation: [],
            idUniqueness: [],
            referenceIntegrity: [],
            requiredFields: [],
            balancing: [],
            orphanedItems: [],
            summary: {}
        };
        this.allItems = {};
        this.itemReferences = new Set();
    }

    async validateDatabase() {
        console.log('🔍 Avvio validazione database oggetti...\n');
        
        try {
            // 1. Carica tutti gli item
            await this.loadAllItems();
            
            // 2. Verifica schema
            await this.validateSchema();
            
            // 3. Controlla unicità ID
            await this.validateIdUniqueness();
            
            // 4. Valida campi richiesti
            await this.validateRequiredFields();
            
            // 5. Analizza referenze
            await this.validateReferences();
            
            // 6. Testa bilanciamento
            await this.validateBalancing();
            
            // 7. Identifica oggetti orfani
            await this.identifyOrphanedItems();
            
            // 8. Genera report finale
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Errore durante validazione:', error);
            throw error;
        }
    }

    async loadAllItems() {
        console.log('📂 Caricamento database oggetti...');
        
        const itemFiles = [
            'weapons.json',
            'armor.json', 
            'consumables.json',
            'ammo.json',
            'crafting_materials.json',
            'quest_items.json',
            'unique_items.json'
        ];

        for (const file of itemFiles) {
            const filePath = path.join(this.itemsPath, file);
            if (fs.existsSync(filePath)) {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                Object.assign(this.allItems, content);
                console.log(`  ✅ ${file}: ${Object.keys(content).length} oggetti`);
            } else {
                console.log(`  ⚠️  ${file}: File non trovato`);
            }
        }
        
        console.log(`📊 Totale oggetti caricati: ${Object.keys(this.allItems).length}\n`);
    }

    async validateSchema() {
        console.log('🔧 Validazione schema oggetti...');
        
        const requiredFields = ['id', 'name', 'description', 'type'];
        const optionalFields = ['weight', 'value', 'stackable', 'rarity', 'effect', 'effectValue', 
                               'damage', 'armor', 'armorClass', 'portionsPerUnit', 'portionEffect', 'portionSize'];
        
        for (const [itemId, item] of Object.entries(this.allItems)) {
            const issues = [];
            
            // Verifica campi richiesti
            for (const field of requiredFields) {
                if (!item.hasOwnProperty(field) || item[field] === null || item[field] === undefined) {
                    issues.push(`Campo richiesto mancante: ${field}`);
                }
            }
            
            // Verifica coerenza ID
            if (item.id !== itemId) {
                issues.push(`ID inconsistente: chiave=${itemId}, valore=${item.id}`);
            }
            
            // Verifica tipi di dati
            if (typeof item.name !== 'string') issues.push('name deve essere string');
            if (typeof item.description !== 'string') issues.push('description deve essere string');
            if (typeof item.type !== 'string') issues.push('type deve essere string');
            if (item.weight !== undefined && typeof item.weight !== 'number') issues.push('weight deve essere number');
            if (item.value !== undefined && typeof item.value !== 'number') issues.push('value deve essere number');
            
            // Verifica campi specifici per tipo
            if (item.type === 'weapon' && !item.damage) {
                issues.push('Arma senza campo damage');
            }
            
            if (item.type === 'armor' && !item.armor && !item.armorClass) {
                issues.push('Armatura senza campo armor/armorClass');
            }
            
            // Inconsistenza armor vs armorClass
            if (item.armorClass && !item.armor) {
                issues.push('Usa armorClass invece di armor (inconsistente con interfaccia)');
            }
            
            if (item.type === 'consumable') {
                if (!item.effect) issues.push('Consumabile senza effect');
                if (!item.stackable) issues.push('Consumabile dovrebbe essere stackable');
            }
            
            if (item.type === 'ammo' && !item.stackable) {
                issues.push('Munizioni dovrebbero essere stackable');
            }
            
            this.results.schemaValidation.push({
                itemId,
                valid: issues.length === 0,
                issues
            });
        }
        
        const validItems = this.results.schemaValidation.filter(r => r.valid).length;
        console.log(`  ✅ Oggetti validi: ${validItems}/${Object.keys(this.allItems).length}`);
        console.log(`  ❌ Oggetti con problemi: ${this.results.schemaValidation.length - validItems}\n`);
    }

    async validateIdUniqueness() {
        console.log('🔑 Validazione unicità ID...');
        
        const ids = Object.keys(this.allItems);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        
        if (duplicates.length > 0) {
            this.results.idUniqueness.push({
                valid: false,
                duplicates
            });
            console.log(`  ❌ ID duplicati trovati: ${duplicates.join(', ')}`);
        } else {
            this.results.idUniqueness.push({
                valid: true,
                duplicates: []
            });
            console.log(`  ✅ Tutti gli ID sono unici (${ids.length} oggetti)`);
        }
        
        // Verifica pattern naming convention
        const patterns = {
            'WEAP_': ids.filter(id => id.startsWith('WEAP_')),
            'ARMOR_': ids.filter(id => id.startsWith('ARMOR_')),
            'CONS_': ids.filter(id => id.startsWith('CONS_')),
            'AMMO_': ids.filter(id => id.startsWith('AMMO_')),
            'CRAFT_': ids.filter(id => id.startsWith('CRAFT_')),
            'QUEST_': ids.filter(id => id.startsWith('QUEST_')),
            'UNIQUE_': ids.filter(id => id.startsWith('UNIQUE_'))
        };
        
        console.log('  📋 Pattern ID identificati:');
        for (const [pattern, items] of Object.entries(patterns)) {
            if (items.length > 0) {
                console.log(`    ${pattern}: ${items.length} oggetti`);
            }
        }
        console.log();
    }

    async validateRequiredFields() {
        console.log('📋 Validazione campi richiesti...');
        
        const fieldStats = {
            id: 0, name: 0, description: 0, type: 0, weight: 0, value: 0,
            stackable: 0, rarity: 0, effect: 0, damage: 0, armor: 0
        };
        
        for (const item of Object.values(this.allItems)) {
            for (const field of Object.keys(fieldStats)) {
                if (item.hasOwnProperty(field) && item[field] !== null && item[field] !== undefined) {
                    fieldStats[field]++;
                }
            }
        }
        
        const totalItems = Object.keys(this.allItems).length;
        console.log('  📊 Completezza campi:');
        for (const [field, count] of Object.entries(fieldStats)) {
            const percentage = ((count / totalItems) * 100).toFixed(1);
            const status = count === totalItems ? '✅' : count > 0 ? '🟡' : '❌';
            console.log(`    ${status} ${field}: ${count}/${totalItems} (${percentage}%)`);
        }
        
        this.results.requiredFields = fieldStats;
        console.log();
    }

    async validateReferences() {
        console.log('🔗 Validazione integrità referenze...');
        
        // Cerca referenze negli starting items
        const characterGenPath = path.join(process.cwd(), 'src/rules/characterGenerator.ts');
        if (fs.existsSync(characterGenPath)) {
            const content = fs.readFileSync(characterGenPath, 'utf8');
            const itemIdMatches = content.match(/itemId:\s*['"]([^'"]+)['"]/g);
            
            if (itemIdMatches) {
                for (const match of itemIdMatches) {
                    const itemId = match.match(/['"]([^'"]+)['"]/)[1];
                    this.itemReferences.add(itemId);
                }
            }
        }
        
        // Cerca referenze nei test
        const testFiles = [
            'src/utils/itemOptionsTest.ts',
            'src/utils/portionSystemTest.ts',
            'src/utils/portionIntegrationTest.ts'
        ];
        
        for (const testFile of testFiles) {
            const testPath = path.join(process.cwd(), testFile);
            if (fs.existsSync(testPath)) {
                const content = fs.readFileSync(testPath, 'utf8');
                const itemIdMatches = content.match(/['"]([A-Z_]+_\d+)['"]/g);
                
                if (itemIdMatches) {
                    for (const match of itemIdMatches) {
                        const itemId = match.replace(/['"]/g, '');
                        if (itemId.match(/^[A-Z_]+_\d+$/)) {
                            this.itemReferences.add(itemId);
                        }
                    }
                }
            }
        }
        
        // Cerca referenze in ShelterScreen
        const shelterPath = path.join(process.cwd(), 'src/components/ShelterScreen.tsx');
        if (fs.existsSync(shelterPath)) {
            const content = fs.readFileSync(shelterPath, 'utf8');
            const itemIdMatches = content.match(/['"]([A-Z_]+_\d+)['"]/g);
            
            if (itemIdMatches) {
                for (const match of itemIdMatches) {
                    const itemId = match.replace(/['"]/g, '');
                    if (itemId.match(/^[A-Z_]+_\d+$/)) {
                        this.itemReferences.add(itemId);
                    }
                }
            }
        }
        
        // Verifica che tutte le referenze esistano
        const brokenReferences = [];
        const validReferences = [];
        
        for (const refId of this.itemReferences) {
            if (this.allItems[refId]) {
                validReferences.push(refId);
            } else {
                brokenReferences.push(refId);
            }
        }
        
        console.log(`  ✅ Referenze valide: ${validReferences.length}`);
        console.log(`  ❌ Referenze rotte: ${brokenReferences.length}`);
        
        if (brokenReferences.length > 0) {
            console.log(`    Referenze rotte: ${brokenReferences.join(', ')}`);
        }
        
        this.results.referenceIntegrity = {
            valid: brokenReferences.length === 0,
            validReferences,
            brokenReferences,
            totalReferences: this.itemReferences.size
        };
        console.log();
    }

    async validateBalancing() {
        console.log('⚖️  Analisi bilanciamento oggetti...');
        
        const balanceAnalysis = {
            weapons: [],
            armor: [],
            consumables: [],
            economic: [],
            rarity: { implemented: false, distribution: {} }
        };
        
        // Analisi armi
        const weapons = Object.values(this.allItems).filter(item => item.type === 'weapon');
        for (const weapon of weapons) {
            const avgDamage = this.calculateAverageDamage(weapon.damage);
            balanceAnalysis.weapons.push({
                id: weapon.id,
                name: weapon.name,
                damage: weapon.damage,
                avgDamage,
                value: weapon.value,
                weight: weapon.weight,
                valuePerDamage: weapon.value / avgDamage,
                damagePerWeight: avgDamage / weapon.weight
            });
        }
        
        // Analisi armature
        const armors = Object.values(this.allItems).filter(item => item.type === 'armor');
        for (const armor of armors) {
            const ac = armor.armor || armor.armorClass || 0;
            balanceAnalysis.armor.push({
                id: armor.id,
                name: armor.name,
                armor: ac,
                value: armor.value,
                weight: armor.weight,
                valuePerArmor: armor.value / ac,
                armorPerWeight: ac / armor.weight
            });
        }
        
        // Analisi consumabili
        const consumables = Object.values(this.allItems).filter(item => item.type === 'consumable');
        for (const consumable of consumables) {
            const totalEffect = consumable.effectValue || 0;
            const portions = consumable.portionsPerUnit || 1;
            balanceAnalysis.consumables.push({
                id: consumable.id,
                name: consumable.name,
                effect: consumable.effect,
                totalEffect,
                portions,
                effectPerPortion: totalEffect / portions,
                value: consumable.value,
                weight: consumable.weight,
                valuePerEffect: consumable.value / totalEffect,
                effectPerWeight: totalEffect / consumable.weight
            });
        }
        
        // Analisi economica generale
        for (const item of Object.values(this.allItems)) {
            if (item.value !== undefined && item.weight !== undefined) {
                balanceAnalysis.economic.push({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    value: item.value,
                    weight: item.weight,
                    valuePerWeight: item.weight > 0 ? item.value / item.weight : 0
                });
            }
        }
        
        // Analisi rarità
        const rarityCount = {};
        let hasRarity = false;
        for (const item of Object.values(this.allItems)) {
            if (item.rarity) {
                hasRarity = true;
                rarityCount[item.rarity] = (rarityCount[item.rarity] || 0) + 1;
            }
        }
        
        balanceAnalysis.rarity = {
            implemented: hasRarity,
            distribution: rarityCount
        };
        
        // Report bilanciamento
        console.log('  🗡️  Armi:');
        balanceAnalysis.weapons.forEach(w => {
            console.log(`    ${w.name}: ${w.damage} (avg: ${w.avgDamage.toFixed(1)}) - ${w.value}g - ${w.weight}kg`);
        });
        
        console.log('  🛡️  Armature:');
        balanceAnalysis.armor.forEach(a => {
            console.log(`    ${a.name}: AC ${a.armor} - ${a.value}g - ${a.weight}kg`);
        });
        
        console.log('  🧪 Consumabili:');
        balanceAnalysis.consumables.forEach(c => {
            console.log(`    ${c.name}: ${c.totalEffect} ${c.effect} (${c.portions} porzioni) - ${c.value}g`);
        });
        
        console.log(`  💰 Range economico: ${Math.min(...balanceAnalysis.economic.map(e => e.value))} - ${Math.max(...balanceAnalysis.economic.map(e => e.value))} gold`);
        console.log(`  ⚖️  Range peso: ${Math.min(...balanceAnalysis.economic.map(e => e.weight))} - ${Math.max(...balanceAnalysis.economic.map(e => e.weight))} kg`);
        
        if (!balanceAnalysis.rarity.implemented) {
            console.log('  ❌ Sistema rarità: NON IMPLEMENTATO');
        } else {
            console.log('  ✅ Sistema rarità: Implementato');
            for (const [rarity, count] of Object.entries(balanceAnalysis.rarity.distribution)) {
                console.log(`    ${rarity}: ${count} oggetti`);
            }
        }
        
        this.results.balancing = balanceAnalysis;
        console.log();
    }

    calculateAverageDamage(damageString) {
        if (!damageString) return 0;
        
        // Parse damage strings like "1d4", "1d6", "2d4+1"
        const match = damageString.match(/(\d+)d(\d+)(\+\d+)?/);
        if (!match) return 0;
        
        const numDice = parseInt(match[1]);
        const diceSize = parseInt(match[2]);
        const bonus = match[3] ? parseInt(match[3]) : 0;
        
        return numDice * (diceSize + 1) / 2 + bonus;
    }

    async identifyOrphanedItems() {
        console.log('🔍 Identificazione oggetti orfani...');
        
        const referencedItems = Array.from(this.itemReferences);
        const allItemIds = Object.keys(this.allItems);
        
        const orphanedItems = allItemIds.filter(id => !referencedItems.includes(id));
        const unreferencedItems = referencedItems.filter(id => !allItemIds.includes(id));
        
        console.log(`  📊 Oggetti totali: ${allItemIds.length}`);
        console.log(`  🔗 Oggetti referenziati: ${referencedItems.length}`);
        console.log(`  👻 Oggetti orfani: ${orphanedItems.length}`);
        console.log(`  ❌ Referenze rotte: ${unreferencedItems.length}`);
        
        if (orphanedItems.length > 0) {
            console.log('  👻 Oggetti orfani (definiti ma non utilizzati):');
            orphanedItems.forEach(id => {
                const item = this.allItems[id];
                console.log(`    - ${id}: ${item.name} (${item.type})`);
            });
        }
        
        if (unreferencedItems.length > 0) {
            console.log('  ❌ Referenze a oggetti inesistenti:');
            unreferencedItems.forEach(id => console.log(`    - ${id}`));
        }
        
        this.results.orphanedItems = {
            orphaned: orphanedItems,
            unreferenced: unreferencedItems,
            totalItems: allItemIds.length,
            referencedItems: referencedItems.length
        };
        console.log();
    }

    async generateReport() {
        console.log('📄 Generazione report finale...');
        
        const totalItems = Object.keys(this.allItems).length;
        const validSchemaItems = this.results.schemaValidation.filter(r => r.valid).length;
        const schemaCompliance = ((validSchemaItems / totalItems) * 100).toFixed(1);
        
        const criticalIssues = [];
        const minorIssues = [];
        
        // Identifica problemi critici
        if (!this.results.idUniqueness[0]?.valid) {
            criticalIssues.push('ID duplicati trovati');
        }
        
        if (this.results.referenceIntegrity.brokenReferences.length > 0) {
            criticalIssues.push('Referenze rotte nel codice');
        }
        
        if (!this.results.balancing.rarity.implemented) {
            criticalIssues.push('Sistema rarità non implementato');
        }
        
        // Identifica problemi minori
        const schemaIssues = this.results.schemaValidation.filter(r => !r.valid);
        if (schemaIssues.length > 0) {
            minorIssues.push(`${schemaIssues.length} oggetti con problemi di schema`);
        }
        
        if (this.results.orphanedItems.orphaned.length > 0) {
            minorIssues.push(`${this.results.orphanedItems.orphaned.length} oggetti orfani`);
        }
        
        this.results.summary = {
            totalItems,
            validItems: validSchemaItems,
            schemaCompliance: parseFloat(schemaCompliance),
            criticalIssues: criticalIssues.length,
            minorIssues: minorIssues.length,
            overallScore: this.calculateOverallScore(),
            status: criticalIssues.length === 0 ? 'ACCETTABILE' : 'PROBLEMI CRITICI'
        };
        
        // Salva report dettagliato
        const reportPath = path.join(process.cwd(), 'analisi-microscopica/07-consistenza/item-database-validation-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        
        console.log('📊 RISULTATI FINALI:');
        console.log(`  📦 Oggetti totali: ${totalItems}`);
        console.log(`  ✅ Conformità schema: ${schemaCompliance}%`);
        console.log(`  🔴 Problemi critici: ${criticalIssues.length}`);
        console.log(`  🟡 Problemi minori: ${minorIssues.length}`);
        console.log(`  🏆 Punteggio complessivo: ${this.results.summary.overallScore}/10`);
        console.log(`  📋 Status: ${this.results.summary.status}`);
        
        if (criticalIssues.length > 0) {
            console.log('\n🔴 PROBLEMI CRITICI DA RISOLVERE:');
            criticalIssues.forEach(issue => console.log(`  - ${issue}`));
        }
        
        if (minorIssues.length > 0) {
            console.log('\n🟡 PROBLEMI MINORI:');
            minorIssues.forEach(issue => console.log(`  - ${issue}`));
        }
        
        console.log(`\n📄 Report dettagliato salvato in: ${reportPath}`);
    }

    calculateOverallScore() {
        let score = 10;
        
        // Penalità per problemi critici
        if (!this.results.idUniqueness[0]?.valid) score -= 2;
        if (this.results.referenceIntegrity.brokenReferences.length > 0) score -= 2;
        if (!this.results.balancing.rarity.implemented) score -= 1.5;
        
        // Penalità per problemi minori
        const schemaIssues = this.results.schemaValidation.filter(r => !r.valid).length;
        score -= (schemaIssues * 0.3);
        
        if (this.results.orphanedItems.orphaned.length > 0) score -= 0.5;
        
        return Math.max(0, Math.round(score * 10) / 10);
    }
}

// Esecuzione diretta
const validator = new ItemDatabaseValidator();
validator.validateDatabase()
    .then(() => {
        console.log('\n✅ Validazione completata con successo!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Validazione fallita:', error);
        process.exit(1);
    });

export default ItemDatabaseValidator;