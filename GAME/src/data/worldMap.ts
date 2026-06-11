/**
 * worldMap — dati del mondo per la mappa SVG navigabile (GDD v3, Sistema 1).
 *
 * Geografia canonica (GDD 04): viaggio diagonale da NW (partenza) a SE
 * (The Safe Place) attraverso pianure, foreste, rovine urbane, un fiume
 * e un valico montano. Il player si muove per tappe lungo percorsi
 * predefiniti tra POI; le coordinate sono nello spazio del disegno SVG
 * (viewBox 1200×800).
 */

export type PoiType =
  | 'start'      // punto di partenza
  | 'shelter'    // rifugio di fortuna — riposo, save
  | 'village'    // insediamento abitato
  | 'city'       // rovine urbane
  | 'water'      // punto acqua / guado
  | 'landmark'   // luogo speciale (lore/quest)
  | 'end';       // The Safe Place

export type BiomeKind = 'pianura' | 'bosco' | 'citta' | 'montagna' | 'fiume';

export interface WorldPoi {
  id: string;
  name: string;
  type: PoiType;
  biome: BiomeKind;
  x: number;
  y: number;
  /** Nota a mano mostrata sulla mappa accanto al nome (opzionale). */
  note?: string;
}

export type RouteKind = 'strada' | 'sentiero' | 'guado' | 'valico';

export interface WorldRoute {
  /** Coppia di POI collegati (bidirezionale). */
  a: string;
  b: string;
  kind: RouteKind;
  /** Ore di viaggio per percorrere la tratta. */
  hours: number;
  /** Punti intermedi per il disegno del tracciato (esclusi gli estremi). */
  via?: Array<[number, number]>;
}

export const WORLD_POIS: WorldPoi[] = [
  { id: 'casale',     name: 'Il Casale',                type: 'start',    biome: 'pianura',  x: 130, y: 110, note: 'dove tutto è iniziato' },
  { id: 'rif_collina', name: 'Rifugio della Collina',   type: 'shelter',  biome: 'pianura',  x: 285, y: 170 },
  { id: 'foresta',    name: 'Foresta dei Sospiri',      type: 'landmark', biome: 'bosco',    x: 380, y: 95,  note: 'gli alberi parlano' },
  { id: 'vecchia_citta', name: 'Vecchia Città',         type: 'city',     biome: 'citta',    x: 245, y: 330, note: 'radiazioni' },
  { id: 'crocevia',   name: 'Il Crocevia',              type: 'village',  biome: 'pianura',  x: 480, y: 260, note: 'avamposto sicuro' },
  { id: 'guado',      name: 'Il Guado',                 type: 'water',    biome: 'fiume',    x: 600, y: 360, note: 'acqua, se la filtri' },
  { id: 'erborista',  name: "Capanna dell'Erborista",   type: 'landmark', biome: 'bosco',    x: 540, y: 480 },
  { id: 'le_spine',   name: 'Le Spine',                 type: 'landmark', biome: 'pianura',  x: 740, y: 300, note: 'rovi e silenzio' },
  { id: 'rif_spine',  name: 'Rifugio delle Spine',      type: 'shelter',  biome: 'pianura',  x: 820, y: 420 },
  { id: 'biblioteca', name: 'La Biblioteca',            type: 'landmark', biome: 'citta',    x: 700, y: 560, note: 'carta e memoria' },
  { id: 'laboratorio', name: 'Il Laboratorio',          type: 'landmark', biome: 'citta',    x: 880, y: 600 },
  { id: 'nido',       name: 'Il Nido della Cenere',     type: 'landmark', biome: 'montagna', x: 960, y: 480, note: 'non andarci di notte' },
  { id: 'valico',     name: 'Il Valico',                type: 'landmark', biome: 'montagna', x: 1020, y: 620, note: 'vento tagliente' },
  { id: 'safe_place', name: 'The Safe Place',           type: 'end',      biome: 'montagna', x: 1110, y: 700, note: 'il segnale del padre' },
];

export const WORLD_ROUTES: WorldRoute[] = [
  { a: 'casale',     b: 'rif_collina',  kind: 'strada',   hours: 3, via: [[200, 150]] },
  { a: 'rif_collina', b: 'foresta',     kind: 'sentiero', hours: 3, via: [[330, 130]] },
  { a: 'rif_collina', b: 'vecchia_citta', kind: 'strada', hours: 4, via: [[260, 250]] },
  { a: 'rif_collina', b: 'crocevia',    kind: 'strada',   hours: 5, via: [[380, 210]] },
  { a: 'foresta',    b: 'crocevia',     kind: 'sentiero', hours: 4, via: [[440, 170]] },
  { a: 'vecchia_citta', b: 'crocevia',  kind: 'strada',   hours: 5, via: [[360, 300]] },
  { a: 'crocevia',   b: 'guado',        kind: 'strada',   hours: 3, via: [[540, 310]] },
  { a: 'guado',      b: 'erborista',    kind: 'sentiero', hours: 3, via: [[560, 420]] },
  { a: 'guado',      b: 'le_spine',     kind: 'guado',    hours: 4, via: [[670, 330]] },
  { a: 'le_spine',   b: 'rif_spine',    kind: 'sentiero', hours: 3, via: [[780, 360]] },
  { a: 'erborista',  b: 'biblioteca',   kind: 'sentiero', hours: 4, via: [[620, 530]] },
  { a: 'rif_spine',  b: 'biblioteca',   kind: 'strada',   hours: 4, via: [[760, 500]] },
  { a: 'rif_spine',  b: 'nido',         kind: 'sentiero', hours: 4, via: [[890, 440]] },
  { a: 'biblioteca', b: 'laboratorio',  kind: 'strada',   hours: 3, via: [[790, 590]] },
  { a: 'laboratorio', b: 'valico',      kind: 'valico',   hours: 4, via: [[950, 615]] },
  { a: 'nido',       b: 'valico',       kind: 'valico',   hours: 5, via: [[1000, 550]] },
  { a: 'valico',     b: 'safe_place',   kind: 'valico',   hours: 5, via: [[1070, 665]] },
];

export const START_POI_ID = 'casale';

export function getPoi(id: string): WorldPoi | undefined {
  return WORLD_POIS.find((p) => p.id === id);
}

export function getNeighbours(id: string): string[] {
  return WORLD_ROUTES
    .filter((r) => r.a === id || r.b === id)
    .map((r) => (r.a === id ? r.b : r.a));
}

export function getRoute(a: string, b: string): WorldRoute | undefined {
  return WORLD_ROUTES.find(
    (r) => (r.a === a && r.b === b) || (r.a === b && r.b === a)
  );
}

/** BFS sul grafo dei percorsi: sequenza di POI da `from` a `to` (inclusi). */
export function findPath(from: string, to: string): string[] | null {
  if (from === to) return [from];
  const queue: string[][] = [[from]];
  const seen = new Set([from]);
  while (queue.length > 0) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    for (const next of getNeighbours(last)) {
      if (seen.has(next)) continue;
      const nextPath = [...path, next];
      if (next === to) return nextPath;
      seen.add(next);
      queue.push(nextPath);
    }
  }
  return null;
}

/** Path SVG di una tratta (estremi + waypoint, curve morbide). */
export function routePathD(route: WorldRoute): string {
  const a = getPoi(route.a)!;
  const b = getPoi(route.b)!;
  const points: Array<[number, number]> = [[a.x, a.y], ...(route.via ?? []), [b.x, b.y]];
  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  }
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const mx = (cx + nx) / 2;
    const my = (cy + ny) / 2;
    d += ` Q ${cx} ${cy} ${mx} ${my}`;
  }
  const [lx, ly] = points[points.length - 1];
  d += ` L ${lx} ${ly}`;
  return d;
}
