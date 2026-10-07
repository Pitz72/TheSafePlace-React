/** Save slots live in localStorage under these keys. */
export const SAVE_SLOT_KEY_PREFIX = 'tspc_save_';
export const NUM_SAVE_SLOTS = 5;

export const slotKey = (slot: number) => `${SAVE_SLOT_KEY_PREFIX}${slot}`;

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Structural check of a save file. Returns an error message (Italian, shown to
 * the player) or null when the save can be loaded.
 */
export function validateSaveData(data: unknown): string | null {
    if (!isObject(data)) return 'Dati di salvataggio non validi.';
    if (typeof data.saveVersion !== 'string') return 'Versione del salvataggio mancante.';
    const { metadata, character, game, time } = data;
    if (!isObject(metadata) || !isObject(character) || !isObject(game) || !isObject(time)) {
        return 'Dati di salvataggio incompleti.';
    }
    if (!['level', 'day', 'hour', 'minute'].every(key => typeof metadata[key] === 'number')) {
        return 'Intestazione del salvataggio non valida.';
    }
    if (!Array.isArray(character.inventory) || !isObject(character.hp)) return 'Dati del personaggio non validi.';
    if (!isObject(game.playerPos)) return 'Posizione del giocatore mancante.';
    if (!isObject(time.gameTime)) return 'Orologio di gioco mancante.';
    return null;
}

/** localStorage access that never throws (private mode, blocked storage). */
export const storage = {
    get(key: string): string | null {
        try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key: string, value: string): void {
        localStorage.setItem(key, value);
    },
    remove(key: string): void {
        try { localStorage.removeItem(key); } catch { /* nothing to remove */ }
    },
};
