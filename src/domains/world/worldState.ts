/**
 * World Domain - Stato del mondo di gioco
 * Gestisce posizione giocatore, biomi, esplorazione
 */

export interface Position {
  x: number;
  y: number;
}

export interface Biome {
  id: string;
  name: string;
  description: string;
  movementModifier: number;
  encounterRate: number;
  resources: string[];
  dangerLevel: 'safe' | 'moderate' | 'dangerous' | 'deadly';
}

export interface WorldLocation {
  position: Position;
  biome: Biome;
  discovered: boolean;
  visited: boolean;
  landmarks: string[];
  resources: Record<string, number>;
}

export interface WorldState {
  /** Posizione corrente del giocatore */
  playerPosition: Position;
  /** Mappa delle posizioni conosciute */
  knownLocations: Map<string, WorldLocation>;
  /** Biomi disponibili */
  biomes: Map<string, Biome>;
  /** Raggio di esplorazione */
  explorationRadius: number;
  /** Posizioni visitate */
  visitedPositions: Set<string>;
}

export const defaultBiomes: Record<string, Biome> = {
  plains: {
    id: 'plains',
    name: 'Praterie',
    description: 'Vaste praterie aperte, ideali per il movimento veloce.',
    movementModifier: 1.0,
    encounterRate: 0.3,
    resources: ['erba', 'fiori', 'animali'],
    dangerLevel: 'safe'
  },
  forest: {
    id: 'forest',
    name: 'Foresta',
    description: 'Boschi densi che rallentano il movimento ma offrono riparo.',
    movementModifier: 1.5,
    encounterRate: 0.6,
    resources: ['legno', 'funghi', 'animali'],
    dangerLevel: 'moderate'
  },
  mountain: {
    id: 'mountain',
    name: 'Montagne',
    description: 'Terreno accidentato che richiede grande sforzo per attraversare.',
    movementModifier: 2.0,
    encounterRate: 0.4,
    resources: ['pietre', 'minerali', 'erbe rare'],
    dangerLevel: 'dangerous'
  },
  river: {
    id: 'river',
    name: 'Fiume',
    description: 'Corso d\'acqua che può essere attraversato o seguito.',
    movementModifier: 3.0,
    encounterRate: 0.5,
    resources: ['acqua', 'pesci', 'piante acquatiche'],
    dangerLevel: 'moderate'
  },
  city: {
    id: 'city',
    name: 'Città',
    description: 'Rovine urbane abbandonate, piene di risorse ma anche pericoli.',
    movementModifier: 1.2,
    encounterRate: 0.8,
    resources: ['metallo', 'elettronica', 'cibo conservato'],
    dangerLevel: 'dangerous'
  },
  village: {
    id: 'village',
    name: 'Villaggio',
    description: 'Piccoli insediamenti rurali, spesso saccheggiati.',
    movementModifier: 1.1,
    encounterRate: 0.7,
    resources: ['cibo', 'strumenti', 'tessuti'],
    dangerLevel: 'moderate'
  }
};

export function createInitialWorldState(): WorldState {
  const biomes = new Map(Object.entries(defaultBiomes));

  return {
    playerPosition: { x: 0, y: 0 },
    knownLocations: new Map(),
    biomes,
    explorationRadius: 5,
    visitedPositions: new Set(['0,0'])
  };
}

export function positionToKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function keyToPosition(key: string): Position {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

export function getDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getBiomeAtPosition(biomes: Map<string, Biome>, pos: Position): Biome {
  // Simple biome determination based on position
  // In a real implementation, this could use noise functions or predefined maps
  const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y);

  if (distance < 2) return biomes.get('plains')!;
  if (distance < 5) return biomes.get('forest')!;
  if (distance < 8) return biomes.get('mountain')!;
  if (Math.abs(pos.x) < 3 && Math.abs(pos.y) < 3) return biomes.get('village')!;
  if (Math.abs(pos.x) > 6 || Math.abs(pos.y) > 6) return biomes.get('city')!;

  // Rivers along certain paths
  if (Math.abs(pos.x) < 1 || Math.abs(pos.y) < 1) return biomes.get('river')!;

  return biomes.get('plains')!;
}