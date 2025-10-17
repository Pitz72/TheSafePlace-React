export const TILE_SIZE = 32;

// The SVG tileset is the primary and only tileset. It is defined in code,
// cannot be corrupted, and provides a clean, retro aesthetic.
export const TILESET_SRC = `data:image/svg+xml;base64,${btoa(`
<svg width="160" height="96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .mono { font-family: 'VT323', monospace; }
    </style>
    <pattern id="plainsPattern" patternUnits="userSpaceOnUse" width="4" height="4">
      <rect width="4" height="4" fill="#15803d"/>
      <path d="M0 2 H4 M2 0 V4" stroke="#16a34a" stroke-width="0.5"/>
    </pattern>
    <pattern id="waterPattern" patternUnits="userSpaceOnUse" width="16" height="8">
      <rect width="16" height="8" fill="#0ea5e9"/>
      <path d="M0,4 Q4,2 8,4 T16,4" stroke="#0284c7" stroke-width="1.5" fill="none"/>
    </pattern>
  </defs>

  <!-- Row 1 -->
  <g transform="translate(0, 0)">
    <title>Plains (.)</title>
    <rect width="32" height="32" fill="#14532d"/>
    <rect width="32" height="32" fill="url(#plainsPattern)"/>
  </g>
  <g transform="translate(32, 0)">
    <title>Forest (F)</title>
    <rect width="32" height="32" fill="#14532d"/>
    <polygon points="16,4 4,28 28,28" fill="#166534"/>
    <polygon points="24,12 16,28 32,28" fill="#15803d"/>
  </g>
  <g transform="translate(64, 0)">
    <title>Water (~)</title>
    <rect width="32" height="32" fill="url(#waterPattern)"/>
  </g>
  <g transform="translate(96, 0)">
    <title>Mountain (M)</title>
    <rect width="32" height="32" fill="#374151"/>
    <polygon points="16,2 2,28 30,28" fill="#6b7280"/>
    <polygon points="16,2 22,14 10,14" fill="#f9fafb"/>
  </g>
  <g transform="translate(128, 0)">
    <title>City (C)</title>
    <rect width="32" height="32" fill="#1f2937"/>
    <rect x="4" y="10" width="8" height="18" fill="#4b5563"/>
    <rect x="13" y="4" width="7" height="24" fill="#374151"/>
    <rect x="21" y="14" width="6" height="14" fill="#4b5563"/>
    <rect x="6" y="12" width="2" height="2" fill="#facc15"/>
    <rect x="15" y="8" width="2" height="2" fill="#facc15"/>
    <rect x="23" y="18" width="2" height="2" fill="#facc15"/>
  </g>

  <!-- Row 2 -->
  <g transform="translate(0, 32)">
    <title>Refuge (R)</title>
    <rect width="32" height="32" fill="#1f2937"/>
    <rect x="6" y="8" width="20" height="16" fill="#374151"/>
    <rect x="13" y="4" width="6" height="24" fill="#4ade80"/>
    <rect x="8" y="15" width="16" height="6" fill="#4ade80"/>
  </g>
  <g transform="translate(32, 32)">
    <title>City (C) - Old position, now using (128,0)</title>
    <rect width="32" height="32" fill="black"/>
  </g>
  <g transform="translate(64, 32)">
    <title>Village (V)</title>
    <rect width="32" height="32" fill="#1f2937"/>
    <polygon points="8,12 2,20 14,20" fill="#a16207" stroke="#d97706" stroke-width="1"/>
    <polygon points="22,8 15,22 29,22" fill="#a16207" stroke="#d97706" stroke-width="1"/>
  </g>
  <g transform="translate(96, 32)">
    <title>Start (S)</title>
    <rect width="32" height="32" fill="#422006"/>
    <rect x="2" y="2" width="28" height="28" fill="#d97706"/>
    <text x="16" y="24" class="mono" font-size="24" text-anchor="middle" fill="#422006">S</text>
  </g>
  <g transform="translate(128, 32)">
    <title>End (E)</title>
    <rect width="32" height="32" fill="#450a0a"/>
    <rect x="2" y="2" width="28" height="28" fill="#dc2626"/>
    <text x="16" y="24" class="mono" font-size="24" text-anchor="middle" fill="#fef2f2">E</text>
  </g>
  
  <!-- Row 3 -->
  <g transform="translate(0, 64)">
    <title>Player (@)</title>
    <rect width="32" height="32" fill="black"/>
    <text x="16" y="26" class="mono" font-size="32" text-anchor="middle" fill="#facc15" style="text-shadow: 0 0 5px #facc15;">@</text>
  </g>
  <g transform="translate(32, 64)"><rect width="32" height="32" fill="black"/></g>
  <g transform="translate(64, 64)"><rect width="32" height="32" fill="black"/></g>
  <g transform="translate(96, 64)"><rect width="32" height="32" fill="black"/></g>
  <g transform="translate(128, 64)"><rect width="32" height="32" fill="black"/></g>

</svg>
`)}`;

export const TILE_MAP: { [key: string]: { x: number; y: number } } = {
  '.': { x: 0 * TILE_SIZE, y: 0 * TILE_SIZE },   // Plains
  'F': { x: 1 * TILE_SIZE, y: 0 * TILE_SIZE },   // Forest
  '~': { x: 2 * TILE_SIZE, y: 0 * TILE_SIZE },   // Water
  'M': { x: 3 * TILE_SIZE, y: 0 * TILE_SIZE },   // Mountain
  'C': { x: 4 * TILE_SIZE, y: 0 * TILE_SIZE },   // City (New Position)
  'R': { x: 0 * TILE_SIZE, y: 1 * TILE_SIZE },   // Refuge
  'V': { x: 2 * TILE_SIZE, y: 1 * TILE_SIZE },   // Village
  'S': { x: 3 * TILE_SIZE, y: 1 * TILE_SIZE },   // Start
  'E': { x: 4 * TILE_SIZE, y: 1 * TILE_SIZE },   // End
  '@': { x: 0 * TILE_SIZE, y: 2 * TILE_SIZE },   // Player
};
