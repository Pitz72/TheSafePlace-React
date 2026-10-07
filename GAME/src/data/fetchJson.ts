/**
 * Loads a JSON file shipped in public/data. Paths are relative to index.html,
 * so they work both on the web and under the Electron app:// protocol.
 * Throws on any failure: a missing data file must stop the boot with a clear
 * error instead of silently starting the game with an empty database.
 */
export async function fetchJson<T>(path: string): Promise<T> {
    let response: Response;
    try {
        response = await fetch(path);
    } catch (error) {
        throw new Error(`Impossibile leggere ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!response.ok) {
        throw new Error(`Impossibile leggere ${path} (HTTP ${response.status})`);
    }
    return response.json() as Promise<T>;
}

/** Indexes an array of records by their `id`. */
export const indexById = <T extends { id: string }>(list: T[]): Record<string, T> =>
    Object.fromEntries(list.map(entry => [entry.id, entry]));
