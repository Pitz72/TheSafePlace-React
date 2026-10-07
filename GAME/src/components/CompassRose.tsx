import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { getActiveQuestMarkers } from '../services/questService';
import { useQuestDatabaseStore } from '../data/questDatabase';
import { Position } from '../types';

/**
 * CompassRose Component
 * 
 * @description Directional indicators on map borders showing POI locations.
 * Helps player navigate large map by showing direction and distance to important locations.
 * 
 * Shows:
 * - Quest markers (MAIN red, SUB yellow)
 * - Special locations (Crocevia, Biblioteca, Laboratorio, Nido, Capanna)
 * - Wandering Trader (if active)
 * - Destination (E tile)
 * 
 * Display:
 * - North border: POI to the north
 * - South border: POI to the south
 * - East border: POI to the east
 * - West border: POI to the west
 * 
 * Format: "↑ [ICON] Nome (25t)" where 25t = distance in tiles
 * 
 * @version 1.9.9
 */

interface POI {
  name: string;
  position: Position;
  color: string;
  priority: number; // Higher = more important
  icon: string; // v1.9.9 - Distinctive icon
}

const distanceTo = (poi: POI, from: Position): number =>
  Math.floor(Math.hypot(poi.position.x - from.x, poi.position.y - from.y));

/** Main direction of a POI, or null when it is close enough to see on the map. */
const directionOf = (poi: POI, from: Position): 'north' | 'south' | 'east' | 'west' | null => {
  const dx = poi.position.x - from.x;
  const dy = poi.position.y - from.y;
  if (Math.hypot(dx, dy) < 3) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'east' : 'west';
  return dy > 0 ? 'south' : 'north';
};

export const CompassRose: React.FC = () => {
  const playerPos = useGameStore(state => state.playerPos);
  const map = useGameStore(state => state.map);
  const wanderingTrader = useGameStore(state => state.wanderingTrader);
  const knownPois = useGameStore(state => state.pois);
  const activeQuests = useCharacterStore(state => state.activeQuests);
  const quests = useQuestDatabaseStore(state => state.quests);

  const allPOIs = useMemo(() => {
    const pois: POI[] = [];

    // Quest markers (highest priority)
    const questMarkers = getActiveQuestMarkers(activeQuests);
    questMarkers.forEach(marker => {
      pois.push({
        name: quests[marker.id]?.title ?? (marker.type === 'MAIN' ? 'Missione principale' : 'Missione'),
        position: marker.pos,
        color: marker.type === 'MAIN' ? '#ef4444' : '#facc15',
        priority: marker.type === 'MAIN' ? 100 : 80,
        icon: marker.type === 'MAIN' ? '★' : '!'
      });
    });

    // Special locations (scan map for tiles)
    const specialTiles: Record<string, { name: string; color: string; priority: number; icon: string }> = {
      'A': { name: 'Crocevia', color: '#f59e0b', priority: 70, icon: '⌂' },
      'H': { name: 'Capanna Erborista', color: '#4ade80', priority: 65, icon: '♣' },
      'B': { name: 'Biblioteca', color: '#9f1239', priority: 60, icon: '📖' },
      'L': { name: 'Laboratorio', color: '#0891b2', priority: 60, icon: '⚡' },
      'N': { name: 'Nido Cenere', color: '#7e22ce', priority: 50, icon: '☠' },
      'E': { name: 'DESTINAZIONE', color: '#dc2626', priority: 90, icon: '🏁' }
    };

    // Scan map for special tiles
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        if (specialTiles[tile]) {
          pois.push({
            name: specialTiles[tile].name,
            position: { x, y },
            color: specialTiles[tile].color,
            priority: specialTiles[tile].priority,
            icon: specialTiles[tile].icon
          });
        }
      }
    }

    // Places discovered or marked on the map.
    knownPois.forEach(poi => {
      if (!poi.revealed || poi.marker === false || poi.consumed) return;
      pois.push({ name: poi.name, position: { x: poi.x, y: poi.y }, color: '#c084fc', priority: 55, icon: '◆' });
    });

    // Wandering Trader (if active)
    if (wanderingTrader) {
      pois.push({
        name: 'Commerciante',
        position: wanderingTrader.position,
        color: '#facc15',
        priority: 75,
        icon: '☻'
      });
    }

    return pois;
    // Quest markers also move with the places discovered on the map (knownPois).
  }, [map, wanderingTrader, activeQuests, knownPois, quests]);

  // Group POIs by direction
  const poiByDirection = useMemo(() => {
    const grouped: Record<string, POI[]> = {
      north: [],
      south: [],
      east: [],
      west: []
    };

    allPOIs.forEach(poi => {
      const dir = directionOf(poi, playerPos);
      if (dir) {
        grouped[dir].push(poi);
      }
    });

    // Sort by priority (highest first), then by distance (closest first)
    Object.keys(grouped).forEach(dir => {
      grouped[dir].sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return distanceTo(a, playerPos) - distanceTo(b, playerPos);
      });
      // Keep only top 3 per direction
      grouped[dir] = grouped[dir].slice(0, 3);
    });

    return grouped;
  }, [allPOIs, playerPos]);

  const renderPOI = (poi: POI, arrow: string) => {
    const distance = distanceTo(poi, playerPos);
    return (
      <div
        key={`${poi.name}-${poi.position.x}-${poi.position.y}`}
        className="text-xs whitespace-nowrap flex items-center gap-1"
        style={{ color: poi.color }}
      >
        <span>{arrow}</span>
        <span className="text-base">{poi.icon}</span>
        <span>{poi.name} ({distance}t)</span>
      </div>
    );
  };

  return (
    <>
      {/* North indicators */}
      {poiByDirection.north.length > 0 && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black/80 border border-green-500/50 px-2 py-1 flex gap-3">
          {poiByDirection.north.map(poi => renderPOI(poi, '↑'))}
        </div>
      )}

      {/* South indicators */}
      {poiByDirection.south.length > 0 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/80 border border-green-500/50 px-2 py-1 flex gap-3">
          {poiByDirection.south.map(poi => renderPOI(poi, '↓'))}
        </div>
      )}

      {/* East indicators */}
      {poiByDirection.east.length > 0 && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/80 border border-green-500/50 px-2 py-1 flex flex-col gap-1">
          {poiByDirection.east.map(poi => renderPOI(poi, '→'))}
        </div>
      )}

      {/* West indicators */}
      {poiByDirection.west.length > 0 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/80 border border-green-500/50 px-2 py-1 flex flex-col gap-1">
          {poiByDirection.west.map(poi => renderPOI(poi, '←'))}
        </div>
      )}
    </>
  );
};