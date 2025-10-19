import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// --- Schemas ---

const itemSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.string(),
    rarity: z.string(),
    weight: z.number(),
    value: z.number(),
    stackable: z.boolean(),
    color: z.string().optional(),
    damage: z.number().optional(),
    durability: z.number().optional(),
    weaponType: z.string().optional(),
    defense: z.number().optional(),
    slot: z.string().optional(),
    effects: z.array(z.object({ type: z.string(), value: z.union([z.string(), z.number()]) })).optional(),
    unlocksRecipe: z.string().optional(),
});

const recipeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    skill: z.string(),
    dc: z.number(),
    timeCost: z.number(),
    ingredients: z.array(z.object({ itemId: z.string(), quantity: z.number() })),
    results: z.array(z.object({ itemId: z.string(), quantity: z.number() })),
});

// Aggiungere altri schemi per eventi, nemici, ecc.

// --- Main Validation Logic ---

async function validateFile(filePath: string, schema: z.ZodSchema<any>) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(data);
        schema.parse(jsonData);
        console.log(`✅ ${path.basename(filePath)} is valid.`);
    } catch (error) {
        console.error(`❌ ${path.basename(filePath)} is invalid:`, error);
        process.exit(1);
    }
}

async function main() {
    console.log('--- Validating Data Files ---');

    // Validate items
    const itemsDir = path.join(__dirname, '../data/items');
    const itemFiles = await fs.readdir(itemsDir);
    for (const file of itemFiles) {
        if (file.endsWith('.json')) {
            await validateFile(path.join(itemsDir, file), z.array(itemSchema));
        }
    }

    // Validate recipes
    await validateFile(path.join(__dirname, '../data/recipes.json'), z.array(recipeSchema));

    // Aggiungere altre convalide qui

    console.log('--- Validation Complete ---');
}

main();
