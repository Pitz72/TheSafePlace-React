import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsDir = path.join(__dirname, '../data/events');
const itemsDir = path.join(__dirname, '../data/items');

console.log('--- Starting Data Integrity Check (ESM) ---');

// 1. Load all Item IDs
const itemIds = new Set();
const itemFiles = fs.readdirSync(itemsDir).filter(f => f.endsWith('.json'));

console.log(`Loading items from ${itemFiles.length} files...`);
itemFiles.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(itemsDir, file), 'utf8');
        const items = JSON.parse(content);
        items.forEach(item => itemIds.add(item.id));
    } catch (err) {
        console.error(`❌ Error reading item file ${file}:`, err.message);
    }
});
console.log(`✅ Loaded ${itemIds.size} unique item IDs.`);

// 2. Scan Events for Invalid Item References
const eventFiles = fs.readdirSync(eventsDir).filter(f => f.endsWith('.json'));
let errorCount = 0;
const errors = [];

console.log(`Scanning ${eventFiles.length} event files...`);

function checkItem(itemId, location) {
    if (!itemIds.has(itemId)) {
        const msg = `❌ MISSING ITEM: '${itemId}' referenced in ${location}`;
        console.error(msg);
        errors.push(msg);
        errorCount++;
    }
}

function scanOutcomes(outcomes, eventId, filename) {
    if (!outcomes) return;
    outcomes.forEach(outcome => {
        // Check 'success' array
        if (outcome.success) {
            outcome.success.forEach(result => {
                if (result.type === 'addItem' && result.value && result.value.itemId) {
                    checkItem(result.value.itemId, `${filename} -> Event: ${eventId} -> Success Outcome`);
                }
            });
        }
        // Check 'failure' array
        if (outcome.failure) {
            outcome.failure.forEach(result => {
                if (result.type === 'addItem' && result.value && result.value.itemId) {
                    checkItem(result.value.itemId, `${filename} -> Event: ${eventId} -> Failure Outcome`);
                }
            });
        }
        // Check 'results' array (direct outcomes)
        if (outcome.results) {
            outcome.results.forEach(result => {
                if (result.type === 'addItem' && result.value && result.value.itemId) {
                    checkItem(result.value.itemId, `${filename} -> Event: ${eventId} -> Direct Result`);
                }
            });
        }
    });
}

eventFiles.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(eventsDir, file), 'utf8');
        const events = JSON.parse(content);

        events.forEach(event => {
            if (event.choices) {
                event.choices.forEach(choice => {
                    scanOutcomes(choice.outcomes, event.id, file);
                });
            }
        });
    } catch (err) {
        console.error(`❌ Error reading event file ${file}:`, err.message);
    }
});

console.log('--- Check Complete ---');
const reportPath = path.join(__dirname, 'integrity_report.txt');
let reportContent = `Data Integrity Check Report\nDate: ${new Date().toISOString()}\n\n`;

if (errorCount > 0) {
    console.error(`❌ Found ${errorCount} missing item references. See integrity_report.txt for details.`);
    reportContent += `❌ Found ${errorCount} missing item references:\n`;
    errors.forEach(err => reportContent += err + '\n');
} else {
    console.log('✅ All item references are valid.');
    reportContent += '✅ All item references are valid.\n';
}

fs.writeFileSync(reportPath, reportContent);
if (errorCount > 0) process.exit(1);
