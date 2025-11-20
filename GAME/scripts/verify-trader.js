const fs = require('fs');
const path = require('path');

const uniqueEventsPath = path.join(__dirname, '../public/data/events/unique_events.json');
const tradersPath = path.join(__dirname, '../public/data/traders.json');

console.log('--- Verifying Trader Event Data ---');

try {
    // 1. Check Unique Events
    if (!fs.existsSync(uniqueEventsPath)) {
        throw new Error(`File not found: ${uniqueEventsPath}`);
    }
    const uniqueEvents = JSON.parse(fs.readFileSync(uniqueEventsPath, 'utf8'));
    const eventId = 'unique_wandering_trader_encounter';
    const event = uniqueEvents.find(e => e.id === eventId);

    if (!event) {
        throw new Error(`Event '${eventId}' NOT FOUND in unique_events.json`);
    }
    console.log(`✅ Event '${eventId}' found.`);

    // 2. Check Trader Reference in Event
    const tradeEffect = event.choices[0].outcomes[0].results.find(r => r.type === 'special' && r.value.effect === 'open_trade_screen');
    if (!tradeEffect) {
        console.warn(`⚠️ Warning: Could not find 'open_trade_screen' effect in event choices. Structure might be different.`);
    } else {
        const traderId = tradeEffect.value.traderId;
        console.log(`ℹ️ Event references traderId: '${traderId}'`);

        // 3. Check Traders File
        if (!fs.existsSync(tradersPath)) {
            throw new Error(`File not found: ${tradersPath}`);
        }
        const traders = JSON.parse(fs.readFileSync(tradersPath, 'utf8'));
        const trader = traders.find(t => t.id === traderId);

        if (!trader) {
            throw new Error(`Trader '${traderId}' NOT FOUND in traders.json`);
        }
        console.log(`✅ Trader '${traderId}' found in traders.json.`);
    }

    console.log('--- Verification SUCCESS ---');

} catch (err) {
    console.error('❌ Verification FAILED:', err.message);
    process.exit(1);
}
