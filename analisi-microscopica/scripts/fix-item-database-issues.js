/**
 * Script per correggere i problemi critici identificati nella validazione database oggetti
 * Task 7.1 - Implementazione correzioni immediate
 */

import fs from 'fs';
import path from 'path';

class ItemDatabaseFixer {
    constructor() {
        this.itemsPath = path.join(process.cwd(), 'src/data/items');
        this.fixes = [];
    }

    async fixAllIssues() {
        console.log('🔧 Avvio correzione problemi database oggetti...\n');
        
        try {
            // 1. Correggi inconsistenza armor
            await this.fixArmorInconsistency();
            
            // 2. Aggiungi stackable per ammo
            await this.fixAmmoStackable();
            
            // 3. Implementa sistema rarità
            await this.implementRaritySystem();
            
            // 4. Genera report correzioni
            await this.generateFixReport();
            
        } catch (error) {
            console.error('❌ Errore durante correzioni:', error);
            throw error;
        }
    }

    async fixArmorInconsistency() {
        console.log('🛡️  Correzione inconsistenza campo armor...');
        
        const armorPath = path.join(this.itemsPath, 'armor.json');
        const armorData = JSON.parse(fs.readFileSync(armorPath, 'utf8'));
        
        // Correggi armorClass -> armor
        if (armorData.ARMOR_001 && armorData.ARMOR_001.armorClass) {
            armorData.ARMOR_001.armor = armorData.ARMOR_001.armorClass;
            delete armorData.ARMOR_001.armorClass;
            
            fs.writeFileSync(armorPath, JSON.stringify(armorData, null, 2));
            
            this.fixes.push({
                type: 'schema_fix',
                file: 'armor.json',
                description: 'Corretto armorClass -> armor per ARMOR_001',
                status: 'completed'
            });
            
            console.log('  ✅ Corretto campo armorClass -> armor in ARMOR_001');
        }
    }

    async fixAmmoStackable() {
        console.log('🎯 Aggiunta proprietà stackable per munizioni...');
        
        const ammoPath = path.join(this.itemsPath, 'ammo.json');
        const ammoData = JSON.parse(fs.readFileSync(ammoPath, 'utf8'));
        
        // Aggiungi stackable per tutte le munizioni
        for (const [itemId, item] of Object.entries(ammoData)) {
            if (!item.stackable) {
                item.stackable = true;
                
                this.fixes.push({
                    type: 'stackable_fix',
                    file: 'ammo.json',
                    itemId,
                    description: `Aggiunto stackable: true per ${itemId}`,
                    status: 'completed'
                });
            }
        }
        
        fs.writeFileSync(ammoPath, JSON.stringify(ammoData, null, 2));
        console.log('  ✅ Aggiunto stackable: true per tutte le munizioni');
    }

    async implementRaritySystem() {
        console.log('⭐ Implementazione sistema rarità...');
        
        const rarityMapping = {
            // Common items (starting/basic items)
            'WEAP_001': 'Common',
            'CONS_001': 'Common', 
            'CONS_002': 'Common',
            'CONS_003': 'Common',
            'ARMOR_001': 'Common',
            'AMMO_001': 'Common',
            'CRAFT_001': 'Common',
            
            // Uncommon items (improved equipment)
            'WEAP_002': 'Uncommon',
            
            // Unique items (quest items)
            'QUEST_001': 'Unique',
            
            // Legendary items (special items)
            'UNIQUE_001': 'Legendary'
        };

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
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                let modified = false;
                
                for (const [itemId, item] of Object.entries(data)) {
                    if (rarityMapping[itemId] && !item.rarity) {
                        item.rarity = rarityMapping[itemId];
                        modified = true;
                        
                        this.fixes.push({
                            type: 'rarity_implementation',
                            file,
                            itemId,
                            description: `Aggiunto rarity: ${rarityMapping[itemId]} per ${itemId}`,
                            status: 'completed'
                        });
                    }
                }
                
                if (modified) {
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    console.log(`  ✅ Aggiunta rarità in ${file}`);
                }
            }
        }
        
        console.log('  📊 Distribuzione rarità implementata:');
        const rarityCount = {};
        for (const rarity of Object.values(rarityMapping)) {
            rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
        }
        
        for (const [rarity, count] of Object.entries(rarityCount)) {
            console.log(`    ${rarity}: ${count} oggetti`);
        }
    }

    async generateFixReport() {
        console.log('📄 Generazione report correzioni...');
        
        const report = {
            timestamp: new Date().toISOString(),
            totalFixes: this.fixes.length,
            fixesByType: {},
            fixes: this.fixes,
            summary: {
                schemaFixes: this.fixes.filter(f => f.type === 'schema_fix').length,
                stackableFixes: this.fixes.filter(f => f.type === 'stackable_fix').length,
                rarityImplementation: this.fixes.filter(f => f.type === 'rarity_implementation').length
            }
        };
        
        // Conta fix per tipo
        for (const fix of this.fixes) {
            report.fixesByType[fix.type] = (report.fixesByType[fix.type] || 0) + 1;
        }
        
        const reportPath = path.join(process.cwd(), 'analisi-microscopica/07-consistenza/item-database-fixes-applied.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('📊 CORREZIONI APPLICATE:');
        console.log(`  🔧 Correzioni schema: ${report.summary.schemaFixes}`);
        console.log(`  📦 Correzioni stackable: ${report.summary.stackableFixes}`);
        console.log(`  ⭐ Implementazione rarità: ${report.summary.rarityImplementation}`);
        console.log(`  📄 Report salvato in: ${reportPath}`);
    }
}

// Esecuzione diretta
const fixer = new ItemDatabaseFixer();
fixer.fixAllIssues()
    .then(() => {
        console.log('\n✅ Tutte le correzioni applicate con successo!');
        console.log('🔄 Eseguire nuovamente la validazione per verificare i miglioramenti.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Correzioni fallite:', error);
        process.exit(1);
    });

export default ItemDatabaseFixer;