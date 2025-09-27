import { getBiomeKeyFromChar } from '@/utils/mapUtils';

export const loadMapData = async (): Promise<{ mapData: string[]; startPos: { x: number; y: number }; startBiome: string }> => {
  try {
    const response = await fetch('/map.txt');
    const mapText = await response.text();
    const lines = mapText.split('\n').filter((line) => line);

    let startPos = { x: 75, y: 75 }; // Default start position
    lines.forEach((line, y) => {
      const x = line.indexOf('S');
      if (x !== -1) {
        startPos = { x, y };
      }
    });

    const startBiome = getBiomeKeyFromChar(lines[startPos.y][startPos.x]);

    return { mapData: lines, startPos, startBiome };
  } catch (error) {
    console.error("Failed to load map data:", error);
    throw error; // Re-throw to be handled by the caller
  }
};