import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const EVENTS_DIR = path.join(DATA_DIR, 'events');
const TRADERS_FILE = path.join(DATA_DIR, 'traders.json');
const DIALOGUES_FILE = path.join(DATA_DIR, '../public/data/dialogues.json');

// Load reference data
let traders = [];
let dialogues = {};

try {
    if (fs.existsSync(TRADERS_FILE)) {
        traders = JSON.parse(fs.readFileSync(TRADERS_FILE, 'utf8'));
    }
    if (fs.existsSync(DIALOGUES_FILE)) {
        dialogues = JSON.parse(fs.readFileSync(DIALOGUES_FILE, 'utf8'));
    }
} catch (e) {
    console.error("Error loading reference data:", e.message);
    process.exit(1);
}

const traderIds = new Set(Array.isArray(traders) ? traders.map(t => t.id) : Object.keys(traders));
const dialogueIds = new Set(Array.isArray(dialogues) ? dialogues.map(d => d.id) : Object.keys(dialogues));

console.log(`Loaded ${traderIds.size} traders and ${dialogueIds.size} dialogues.`);
console.log("Scanning events for integrity issues...\n");

let errorCount = 0;

function scanEvents(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            scanEvents(filePath);
        } else if (file.endsWith('.json')) {
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const events = Array.isArray(content) ? content : [content]; // Handle both array and single object files if any

                events.forEach(event => {
                    if (!event.choices) return;

                    event.choices.forEach((choice, cIdx) => {
                        if (!choice.outcomes) return;

                        choice.outcomes.forEach((outcome, oIdx) => {
                            const results = outcome.results || (outcome.success ? outcome.success : []) || (outcome.failure ? outcome.failure : []);

                            results.forEach((result, rIdx) => {
                                if (result.type === 'special' && result.value) {
                                    const { effect, traderId, dialogueId } = result.value;

                                    // Check Trading
                                    if (effect === 'startTrading' || effect === 'open_trade_screen') {
                                        if (!traderId) {
                                            console.error(`[ERROR] ${file} -> Event '${event.id}': Missing 'traderId' for effect '${effect}'`);
                                            errorCount++;
                                        } else if (!traderIds.has(traderId)) {
                                            console.error(`[ERROR] ${file} -> Event '${event.id}': Trader ID '${traderId}' not found in traders.json`);
                                            errorCount++;
                                        }
                                    }

                                    // Check Dialogue
                                    if (effect === 'startDialogue' || effect === 'start_dialogue') {
                                        if (!dialogueId) {
                                            console.error(`[ERROR] ${file} -> Event '${event.id}': Missing 'dialogueId' for effect '${effect}'`);
                                            errorCount++;
                                        } else if (!dialogueIds.has(dialogueId)) {
                                            console.error(`[ERROR] ${file} -> Event '${event.id}': Dialogue ID '${dialogueId}' not found in dialogues.json`);
                                            errorCount++;
                                        }
                                    }
                                }
                            });
                        });
                    });
                });

            } catch (e) {
                console.error(`[ERROR] Failed to parse ${file}:`, e.message);
                errorCount++;
            }
        }
    });
}

if (fs.existsSync(EVENTS_DIR)) {
    scanEvents(EVENTS_DIR);
} else {
    console.error(`Events directory not found at ${EVENTS_DIR}`);
}

console.log(`\nScan complete. Found ${errorCount} errors.`);
if (errorCount > 0) process.exit(1);
