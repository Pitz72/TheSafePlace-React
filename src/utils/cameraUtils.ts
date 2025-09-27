export const calculateCameraPosition = (
  playerPosition: { x: number; y: number },
  mapData: string[],
  viewportSize: { width: number; height: number },
  oldCameraPosition: { x: number; y: number }
): { x: number; y: number } => {
  if (!mapData || mapData.length === 0 || !viewportSize || viewportSize.width === 0 || viewportSize.height === 0) {
    return oldCameraPosition;
  }

  const CHAR_WIDTH = 25.6;
  const CHAR_HEIGHT = 38.4;
  const MAP_WIDTH_IN_TILES = mapData[0].length;
  const MAP_HEIGHT_IN_TILES = mapData.length;

  const idealCameraX = (playerPosition.x * CHAR_WIDTH) - (viewportSize.width / 2) + (CHAR_WIDTH / 2);
  const idealCameraY = (playerPosition.y * CHAR_HEIGHT) - (viewportSize.height / 2) + (CHAR_HEIGHT / 2);

  const maxScrollX = (MAP_WIDTH_IN_TILES * CHAR_WIDTH) - viewportSize.width;
  const maxScrollY = (MAP_HEIGHT_IN_TILES * CHAR_HEIGHT) - viewportSize.height;

  let newCameraX = Math.max(0, Math.min(idealCameraX, maxScrollX));
  let newCameraY = Math.max(0, Math.min(idealCameraY, maxScrollY));

  // Ensure the player is always visible after clamping
  const playerLeft = (playerPosition.x * CHAR_WIDTH) - newCameraX;
  const playerTop = (playerPosition.y * CHAR_HEIGHT) - newCameraY;

  if (playerLeft < 0) {
    newCameraX = playerPosition.x * CHAR_WIDTH;
  } else if (playerLeft > viewportSize.width - CHAR_WIDTH) {
    newCameraX = (playerPosition.x * CHAR_WIDTH) - (viewportSize.width - CHAR_WIDTH);
  }

  if (playerTop < 0) {
    newCameraY = playerPosition.y * CHAR_HEIGHT;
  } else if (playerTop > viewportSize.height - CHAR_HEIGHT) {
    newCameraY = (playerPosition.y * CHAR_HEIGHT) - (viewportSize.height - CHAR_HEIGHT);
  }

  newCameraX = Math.max(0, Math.min(newCameraX, maxScrollX));
  newCameraY = Math.max(0, Math.min(newCameraY, maxScrollY));

  return { x: newCameraX, y: newCameraY };
};