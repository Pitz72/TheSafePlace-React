// Mapping characters to tile indices for Phaser Tilemap
// Tileset size: 256x128, Tile size: 32x32
// Columns: 8, Rows: 4

export const TILE_MAPPING: Record<string, number> = {
    '.': 0,   // Grass (0,0)
    'F': 1,   // Forest (1,0)
    'M': 2,   // Mountain (2,0)
    '~': 3,   // Water (3,0)
    'C': 4,   // City (4,0)
    '#': 5,   // Wall (5,0)
    'V': 6,   // Village (6,0)

    // Row 1 (Index 8-15) - Actors (Mostly dynamic, but some might be static on map)
    '@': 8,   // Player (Dynamic)
    'T': 9,   // Trader (Dynamic)
    'X': 10,  // Enemy (Dynamic)
    'S': 11,  // Start (Static)
    'R': 12,  // Shelter (Static)

    // Row 2 (Index 16-23) - Markers & Specials
    '!M': 16, // Main Quest
    '!S': 17, // Sub Quest
    'A': 18,  // Crossroads
    'H': 19,  // Herbalist
    'B': 20,  // Library
    'L': 21,  // Lab
    'N': 22,  // Nest
    'E': 23,  // Destination
};

export const TILE_SIZE = 32;
export const TILESET_KEY = 'ultima_tileset';
