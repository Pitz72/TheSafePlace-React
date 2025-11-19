
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper for dirname in ESM if needed, but we'll assume simple node execution or ts-node
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

const gameDir = process.cwd();

function validateGameData() {
    console.log("Starting Game Data Validation...");
    console.log(`Game Directory: ${gameDir}`);

    let errorCount = 0;
    let warningCount = 0;

    // --- 1. Load Data ---

    // Load Quests
    const questsPath = path.join(gameDir, 'public/data/quests.json'); // Wait, quests.json is in data/ or public/data/?
    // In the previous steps I saw quests.json in GAME/data/quests.json (viewed_file)
    // But dialogues.json was in GAME/public/data/dialogues.json
    // Let's check both or assume standard path.
    // The viewed file for quests.json was C:\Users\Utente\Documents\GitHub\TheSafePlace-React\GAME\data\quests.json

    let questsPathReal = path.join(gameDir, 'data/quests.json');
    if (!fs.existsSync(questsPathReal)) {
        // Try public
        questsPathReal = path.join(gameDir, 'public/data/quests.json');
    }

    if (!fs.existsSync(questsPathReal)) {
        console.error(`CRITICAL: Quests file not found at ${questsPathReal}`);
        return;
    }
    const quests = JSON.parse(fs.readFileSync(questsPathReal, 'utf8'));
    console.log(`Loaded ${quests.length} quests.`);

    // Load Dialogues
    const dialoguesPath = path.join(gameDir, 'public/data/dialogues.json');
    if (!fs.existsSync(dialoguesPath)) {
        console.error(`CRITICAL: Dialogues file not found at ${dialoguesPath}`);
        return;
    }
    const dialogues = JSON.parse(fs.readFileSync(dialoguesPath, 'utf8'));
    console.log(`Loaded ${dialogues.length} dialogue trees.`);

    // Load Map
    const mapPath = path.join(gameDir, 'data/mapData.ts');
    if (!fs.existsSync(mapPath)) {
        console.error(`CRITICAL: Map file not found at ${mapPath}`);
        return;
    }
    const mapContent = fs.readFileSync(mapPath, 'utf8');
    const mapStringMatch = mapContent.match(/MAP_STRING = `([\s\S]*?)`;/);
    if (!mapStringMatch) {
        console.error("CRITICAL: Could not parse map data");
        return;
    }
    const mapLines = mapStringMatch[1].split('\n');
    console.log(`Loaded Map (${mapLines[0].length}x${mapLines.length}).`);

    // --- 2. Validation Logic ---

    // 2.1 Validate Quest Triggers
    quests.forEach((quest: any) => {
        quest.stages.forEach((stage: any) => {
            // Check Location Triggers
            if (stage.trigger.type === 'reachLocation') {
                const { x, y } = stage.trigger.value;
                if (y >= mapLines.length || x >= mapLines[0].length) {
                    console.error(`[ERROR] Quest '${quest.id}' stage ${stage.stage}: Coordinate (${x},${y}) out of bounds.`);
                    errorCount++;
                } else {
                    const tile = mapLines[y][x];
                    if (tile === '~') {
                        console.warn(`[WARN] Quest '${quest.id}' stage ${stage.stage}: Target (${x},${y}) is on Water ('~').`);
                        warningCount++;
                    }
                }
            }

            // Check Dialogue Triggers
            if (stage.trigger.type === 'talkToNPC') {
                const targetNodeId = stage.trigger.value;
                let nodeFound = false;

                // Search in all dialogue trees
                for (const d of dialogues) {
                    if (d.nodes[targetNodeId]) {
                        nodeFound = true;
                        break;
                    }
                }

                if (!nodeFound) {
                    console.error(`[ERROR] Quest '${quest.id}' stage ${stage.stage}: talkToNPC trigger references unknown node '${targetNodeId}'`);
                    errorCount++;
                }
            }
        });
    });

    // 2.2 Validate Dialogue Links (Internal Consistency)
    dialogues.forEach((d: any) => {
        Object.values(d.nodes).forEach((node: any) => {
            node.options.forEach((opt: any, idx: number) => {
                if (opt.consequence.type === 'jumpToNode') {
                    const targetId = opt.consequence.value;
                    if (!d.nodes[targetId]) {
                        console.error(`[ERROR] Dialogue '${d.id}' Node '${node.id}' Option ${idx + 1}: jumpToNode references unknown node '${targetId}'`);
                        errorCount++;
                    }
                }
            });
        });
    });

    // --- 3. Summary ---
    console.log("\n--- Validation Summary ---");
    console.log(`Errors: ${errorCount}`);
    console.log(`Warnings: ${warningCount}`);

    if (errorCount === 0) {
        console.log("✅ VALIDATION PASSED");
        process.exit(0);
    } else {
        console.log("❌ VALIDATION FAILED");
        process.exit(1);
    }
}

validateGameData();
