
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

// Load Traders
const tradersPath = path.join(dataDir, 'traders.json');
const traders = JSON.parse(fs.readFileSync(tradersPath, 'utf-8'));

// Load Items
const itemFiles = [
    'items/weapons.json',
    'items/armor.json',
    'items/consumables.json',
    'items/materials.json',
    'items/quest.json',
    'items/ammo.json',
    'items/restored_items.json'
];

const allItems = {};

itemFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
        const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        items.forEach(item => {
            allItems[item.id] = item;
        });
    } else {
        console.error(`Missing item file: ${file}`);
    }
});

console.log(`Loaded ${Object.keys(allItems).length} items.`);

// Verify Traders
let errors = 0;
traders.forEach(trader => {
    console.log(`Checking trader: ${trader.id} (${trader.name})`);
    trader.inventory.forEach(item => {
        if (!allItems[item.itemId]) {
            console.error(`[ERROR] Trader ${trader.id} sells unknown item: ${item.itemId}`);
            errors++;
        } else {
            // console.log(`[OK] ${item.itemId}`);
        }
    });
});

if (errors === 0) {
    console.log("All trader items verified successfully.");
} else {
    console.error(`Found ${errors} errors.`);
    process.exit(1);
}
