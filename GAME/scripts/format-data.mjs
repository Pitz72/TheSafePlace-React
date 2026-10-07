#!/usr/bin/env node
// Formats every JSON file under public/data with one consistent style:
// 2-space indentation, and arrays/objects kept on a single line when they fit
// in MAX_WIDTH columns (so short things like {"x": 3, "y": 4} stay compact).
//
//   node scripts/format-data.mjs          → rewrite files in place
//   node scripts/format-data.mjs --check  → exit 1 if any file is not formatted
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_WIDTH = 100;
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data');

const inline = (value) => {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(inline).join(', ')}]`;
    return `{${Object.keys(value).map(k => `${JSON.stringify(k)}: ${inline(value[k])}`).join(', ')}}`;
};

export function formatJson(value, indent = 0) {
    const pad = '  '.repeat(indent);
    const padIn = '  '.repeat(indent + 1);
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    const flat = inline(value);
    if (pad.length + flat.length <= MAX_WIDTH) return flat;
    if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        return `[\n${value.map(v => padIn + formatJson(v, indent + 1)).join(',\n')}\n${pad}]`;
    }
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return `{\n${keys.map(k => `${padIn}${JSON.stringify(k)}: ${formatJson(value[k], indent + 1)}`).join(',\n')}\n${pad}}`;
}

function* jsonFiles(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* jsonFiles(full);
        else if (entry.name.endsWith('.json')) yield full;
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const check = process.argv.includes('--check');
    let dirty = 0;
    for (const file of jsonFiles(ROOT)) {
        const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
        const formatted = formatJson(JSON.parse(raw)) + '\n';
        // Line endings don't count: Git on Windows may check files out with CRLF.
        if (formatted !== raw.replace(/\r\n/g, '\n')) {
            dirty++;
            if (check) console.error(`non formattato: ${path.relative(process.cwd(), file)}`);
            else fs.writeFileSync(file, formatted);
        }
    }
    if (check && dirty > 0) process.exit(1);
    console.log(check ? 'Tutti i file dati sono formattati.' : `File riformattati: ${dirty}`);
}
