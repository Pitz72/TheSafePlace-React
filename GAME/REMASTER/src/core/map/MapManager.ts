import { ORIGINAL_MAP_DATA } from './OriginalMap';
import { TILE_SIZE } from './TilesetMapping';

export class MapManager {
    private mapData: string[][];

    constructor() {
        this.mapData = ORIGINAL_MAP_DATA;
    }

    public getMapData(): string[][] {
        return this.mapData;
    }

    public isWalkable(x: number, y: number): boolean {
        if (y < 0 || y >= this.mapData.length || x < 0 || x >= this.mapData[0].length) {
            return false;
        }
        const tile = this.mapData[y][x];
        // 'M' (Mountain) and '~' (Water) are usually impassable, unless we have a boat
        // For now, let's say M and ~ are blocked.
        return tile !== 'M' && tile !== '~';
    }

    public gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
        return {
            x: gridX * TILE_SIZE,
            y: gridY * TILE_SIZE
        };
    }

    public worldToGrid(worldX: number, worldY: number): { x: number; y: number } {
        return {
            x: Math.floor(worldX / TILE_SIZE),
            y: Math.floor(worldY / TILE_SIZE)
        };
    }

    public getTileAt(x: number, y: number): string {
        if (y < 0 || y >= this.mapData.length || x < 0 || x >= this.mapData[0].length) {
            return '.';
        }
        return this.mapData[y][x];
    }

    public getStartPos(): { x: number; y: number } {
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                if (this.mapData[y][x] === 'S') {
                    return { x, y };
                }
            }
        }
        return { x: 10, y: 10 }; // Default fallback
    }
}

export const mapManager = new MapManager();
