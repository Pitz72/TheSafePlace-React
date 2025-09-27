export const getBiomeKeyFromChar = (char: string): string => {
  const map: Record<string, string> = {
    'C': 'CITY',
    'F': 'FOREST',
    '.': 'PLAINS',
    '~': 'RIVER',
    'V': 'VILLAGE',
    'S': 'SETTLEMENT',
    'R': 'REST_STOP',
  };
  return map[char] || 'UNKNOWN';
};