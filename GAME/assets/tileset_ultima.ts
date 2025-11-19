
// Ultima IV/V Style Tileset (C64 Palette)
// Generated as SVG Data URI for immediate usage

const C64_COLORS = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  RED: '#880000',
  CYAN: '#AAFFEE',
  PURPLE: '#CC44CC',
  GREEN: '#00CC55',
  BLUE: '#0000AA',
  YELLOW: '#EEEE77',
  ORANGE: '#DD8855',
  BROWN: '#664400',
  LIGHTRED: '#FF7777',
  DARKGREY: '#333333',
  GREY: '#777777',
  LIGHTGREEN: '#AAFF66',
  LIGHTBLUE: '#0088FF',
  LIGHTGREY: '#BBBBBB',
};

// SVG Construction
export const TILE_SIZE = 32;
const COLS = 8;
const ROWS = 4;
const WIDTH = TILE_SIZE * COLS;
const HEIGHT = TILE_SIZE * ROWS;

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <style>
    .pixel { shape-rendering: crispEdges; }
  </style>
  
  <!-- BACKGROUND -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${C64_COLORS.BLACK}" />

  <!-- ROW 0: TERRAIN -->
  
  <!-- 0,0: GRASS (.) -->
  <g transform="translate(0, 0)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <rect x="4" y="8" width="2" height="2" fill="${C64_COLORS.GREEN}" />
    <rect x="12" y="20" width="2" height="2" fill="${C64_COLORS.GREEN}" />
    <rect x="20" y="6" width="2" height="2" fill="${C64_COLORS.GREEN}" />
    <rect x="26" y="24" width="2" height="2" fill="${C64_COLORS.GREEN}" />
    <rect x="8" y="16" width="2" height="2" fill="${C64_COLORS.GREEN}" />
  </g>

  <!-- 1,0: FOREST (F) -->
  <g transform="translate(32, 0)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <!-- Tree 1 -->
    <path d="M8 24 L8 28 M4 24 L12 24 L8 12 Z" fill="${C64_COLORS.GREEN}" />
    <!-- Tree 2 -->
    <path d="M24 24 L24 28 M20 24 L28 24 L24 12 Z" fill="${C64_COLORS.GREEN}" />
    <!-- Tree 3 (Back) -->
    <path d="M16 20 L16 24 M12 20 L20 20 L16 8 Z" fill="${C64_COLORS.LIGHTGREEN}" />
  </g>

  <!-- 2,0: MOUNTAIN (M) -->
  <g transform="translate(64, 0)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <path d="M4 28 L12 12 L20 28 Z" fill="${C64_COLORS.BROWN}" />
    <path d="M16 28 L24 8 L32 28 Z" fill="${C64_COLORS.BROWN}" />
    <path d="M12 12 L14 8 L16 12" fill="${C64_COLORS.WHITE}" /> <!-- Snow cap -->
    <path d="M24 8 L26 4 L28 8" fill="${C64_COLORS.WHITE}" /> <!-- Snow cap -->
  </g>

  <!-- 3,0: WATER (~) -->
  <g transform="translate(96, 0)">
    <rect width="32" height="32" fill="${C64_COLORS.BLUE}" />
    <path d="M4 8 Q8 4 12 8 T20 8 T28 8" stroke="${C64_COLORS.WHITE}" fill="none" stroke-width="2" />
    <path d="M4 16 Q8 12 12 16 T20 16 T28 16" stroke="${C64_COLORS.WHITE}" fill="none" stroke-width="2" />
    <path d="M4 24 Q8 20 12 24 T20 24 T28 24" stroke="${C64_COLORS.WHITE}" fill="none" stroke-width="2" />
  </g>

  <!-- 4,0: CITY (C) -->
  <g transform="translate(128, 0)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <rect x="4" y="12" width="24" height="16" fill="${C64_COLORS.LIGHTGREY}" />
    <rect x="4" y="8" width="4" height="4" fill="${C64_COLORS.LIGHTGREY}" />
    <rect x="14" y="8" width="4" height="4" fill="${C64_COLORS.LIGHTGREY}" />
    <rect x="24" y="8" width="4" height="4" fill="${C64_COLORS.LIGHTGREY}" />
    <rect x="12" y="20" width="8" height="8" fill="${C64_COLORS.BROWN}" /> <!-- Gate -->
  </g>

  <!-- 5,0: WALL (#) -->
  <g transform="translate(160, 0)">
    <rect width="32" height="32" fill="${C64_COLORS.GREY}" />
    <line x1="0" y1="8" x2="32" y2="8" stroke="${C64_COLORS.BLACK}" stroke-width="2" />
    <line x1="0" y1="16" x2="32" y2="16" stroke="${C64_COLORS.BLACK}" stroke-width="2" />
    <line x1="0" y1="24" x2="32" y2="24" stroke="${C64_COLORS.BLACK}" stroke-width="2" />
    <line x1="8" y1="0" x2="8" y2="8" stroke="${C64_COLORS.BLACK}" stroke-width="2" />
    <line x1="24" y1="0" x2="24" y2="8" stroke="${C64_COLORS.BLACK}" stroke-width="2" />
    <line x1="16" y1="8" x2="16" y2="16" stroke="${C64_COLORS.BLACK}" stroke-width="2" />
    <line x1="8" y1="16" x2="8" y2="24" stroke="${C64_COLORS.BLACK}" stroke-width="2" />
    <line x1="24" y1="16" x2="24" y2="24" stroke="${C64_COLORS.BLACK}" stroke-width="2" />
  </g>

  <!-- ROW 1: ACTORS -->

  <!-- 0,1: PLAYER (@) -->
  <g transform="translate(0, 32)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <!-- Head -->
    <rect x="12" y="4" width="8" height="8" fill="${C64_COLORS.WHITE}" />
    <!-- Body -->
    <rect x="10" y="12" width="12" height="10" fill="${C64_COLORS.BLUE}" />
    <!-- Legs -->
    <rect x="10" y="22" width="4" height="8" fill="${C64_COLORS.GREY}" />
    <rect x="18" y="22" width="4" height="8" fill="${C64_COLORS.GREY}" />
    <!-- Arms -->
    <rect x="6" y="12" width="4" height="8" fill="${C64_COLORS.WHITE}" />
    <rect x="22" y="12" width="4" height="8" fill="${C64_COLORS.WHITE}" />
  </g>

  <!-- 1,1: TRADER (T) -->
  <g transform="translate(32, 32)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <!-- Head -->
    <rect x="12" y="4" width="8" height="8" fill="${C64_COLORS.YELLOW}" />
    <!-- Body -->
    <rect x="10" y="12" width="12" height="10" fill="${C64_COLORS.BROWN}" />
    <!-- Pack -->
    <rect x="6" y="14" width="4" height="10" fill="${C64_COLORS.ORANGE}" />
  </g>

  <!-- 2,1: ENEMY (E - Generic) -->
  <g transform="translate(64, 32)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <path d="M8 8 L24 8 L20 28 L12 28 Z" fill="${C64_COLORS.RED}" />
    <circle cx="12" cy="14" r="2" fill="${C64_COLORS.YELLOW}" />
    <circle cx="20" cy="14" r="2" fill="${C64_COLORS.YELLOW}" />
  </g>

  <!-- 3,1: START (S) -->
  <g transform="translate(96, 32)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <rect x="4" y="4" width="24" height="24" fill="${C64_COLORS.BLUE}" />
    <text x="16" y="24" font-family="monospace" font-size="24" fill="${C64_COLORS.WHITE}" text-anchor="middle">S</text>
    <path d="M16 4 L16 28" stroke="${C64_COLORS.WHITE}" stroke-width="2" />
    <path d="M16 4 L28 10 L16 16" fill="${C64_COLORS.WHITE}" />
  </g>

  <!-- 4,1: SHELTER (R) -->
  <g transform="translate(128, 32)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <path d="M16 4 L4 16 L4 28 L28 28 L28 16 Z" fill="${C64_COLORS.BROWN}" />
    <rect x="12" y="20" width="8" height="8" fill="${C64_COLORS.BLACK}" />
    <path d="M16 4 L28 16 L4 16 Z" fill="${C64_COLORS.ORANGE}" /> <!-- Roof -->
  </g>

  <!-- ROW 2: MARKERS & SPECIALS -->

  <!-- 0,2: MAIN QUEST (!M) -->
  <g transform="translate(0, 64)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <path d="M16 4 L20 14 L30 14 L22 20 L25 30 L16 24 L7 30 L10 20 L2 14 L12 14 Z" fill="${C64_COLORS.RED}" stroke="${C64_COLORS.YELLOW}" stroke-width="2" />
  </g>

  <!-- 1,2: SUB QUEST (!S) -->
  <g transform="translate(32, 64)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <circle cx="16" cy="16" r="10" fill="${C64_COLORS.YELLOW}" />
    <rect x="14" y="8" width="4" height="10" fill="${C64_COLORS.BLACK}" />
    <rect x="14" y="20" width="4" height="4" fill="${C64_COLORS.BLACK}" />
  </g>

  <!-- 2,2: CROSSROADS (A) -->
  <g transform="translate(64, 64)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <path d="M16 4 L28 16 L16 28 L4 16 Z" fill="${C64_COLORS.ORANGE}" />
    <rect x="12" y="12" width="8" height="8" fill="${C64_COLORS.BLACK}" />
  </g>

  <!-- 3,2: HERBALIST (H) -->
  <g transform="translate(96, 64)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <circle cx="16" cy="16" r="12" fill="${C64_COLORS.GREEN}" />
    <path d="M16 8 L16 24 M8 16 L24 16" stroke="${C64_COLORS.WHITE}" stroke-width="4" />
  </g>

  <!-- 4,2: LIBRARY (B) -->
  <g transform="translate(128, 64)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <rect x="6" y="6" width="20" height="20" fill="${C64_COLORS.BLUE}" />
    <line x1="16" y1="6" x2="16" y2="26" stroke="${C64_COLORS.WHITE}" stroke-width="2" />
    <line x1="6" y1="12" x2="26" y2="12" stroke="${C64_COLORS.WHITE}" stroke-width="2" />
    <line x1="6" y1="18" x2="26" y2="18" stroke="${C64_COLORS.WHITE}" stroke-width="2" />
  </g>

  <!-- 5,2: LAB (L) -->
  <g transform="translate(160, 64)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <path d="M16 4 L24 12 L20 28 L12 28 L8 12 Z" fill="${C64_COLORS.CYAN}" />
    <rect x="14" y="4" width="4" height="8" fill="${C64_COLORS.WHITE}" />
  </g>

  <!-- 6,2: NEST (N) -->
  <g transform="translate(192, 64)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <circle cx="16" cy="16" r="12" fill="${C64_COLORS.PURPLE}" />
    <circle cx="16" cy="16" r="6" fill="${C64_COLORS.BLACK}" />
  </g>

  <!-- 7,2: DESTINATION (E) -->
  <g transform="translate(224, 64)">
    <rect width="32" height="32" fill="${C64_COLORS.BLACK}" />
    <rect x="4" y="4" width="24" height="24" fill="${C64_COLORS.RED}" />
    <path d="M4 4 L28 28 M28 4 L4 28" stroke="${C64_COLORS.WHITE}" stroke-width="4" />
  </g>

</svg>
`;

export const TILESET_SRC = `data:image/svg+xml;base64,${btoa(svgContent)}`;



// Mapping characters to tile coordinates (x, y in pixels)
export const TILE_MAP: Record<string, { x: number; y: number }> = {
  '.': { x: 0, y: 0 },   // Grass
  'F': { x: 32, y: 0 },  // Forest
  'M': { x: 64, y: 0 },  // Mountain
  '~': { x: 96, y: 0 },  // Water
  'C': { x: 128, y: 0 }, // City
  '#': { x: 160, y: 0 }, // Wall

  '@': { x: 0, y: 32 },  // Player
  'T': { x: 32, y: 32 }, // Trader
  'X': { x: 64, y: 32 }, // Enemy
  'S': { x: 96, y: 32 }, // Start
  'R': { x: 128, y: 32 },// Shelter

  '!M': { x: 0, y: 64 },   // Main Quest
  '!S': { x: 32, y: 64 },  // Sub Quest
  'A': { x: 64, y: 64 },   // Crossroads
  'H': { x: 96, y: 64 },   // Herbalist
  'B': { x: 128, y: 64 },  // Library
  'L': { x: 160, y: 64 },  // Lab
  'N': { x: 192, y: 64 },  // Nest
  'E': { x: 224, y: 64 },  // Destination
};
