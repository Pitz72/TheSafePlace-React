const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/recipes.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    JSON.parse(data);
    console.log('✅ recipes.json is valid JSON');
} catch (err) {
    console.error('❌ recipes.json is INVALID:', err.message);
    process.exit(1);
}
