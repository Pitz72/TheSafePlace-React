// Map Analyzer - Analisi completa simboli mappa
// Strumento per identificare tutti i biomi presenti nella mappa

export interface BiomeAnalysis {
  symbol: string;
  count: number;
  percentage: number;
  description: string;
  implemented: boolean;
}

export interface MapAnalysisResult {
  totalCells: number;
  uniqueSymbols: string[];
  biomes: BiomeAnalysis[];
  unknownSymbols: string[];
}

// Mappatura simboli conosciuti
const KNOWN_BIOMES: Record<string, string> = {
  '.': 'Pianura - terreno normale',
  'F': 'Foreste - aree boscose', 
  'M': 'Montagne - impassabili',
  '~': 'Fiumi - skill check richiesto',
  'V': 'Villaggi - centri abitati',
  'C': 'Città - aree urbane',
  'S': 'Start - punto partenza',
  'E': 'End - destinazione finale',
  'R': 'Rifugi/Riposo - logica da implementare',
  ' ': 'Spazio vuoto'
};

/**
 * Analizza la mappa e restituisce statistiche complete sui biomi
 */
export async function analyzeMap(): Promise<MapAnalysisResult> {
  try {
    // Carica la mappa
    const response = await fetch('/map.txt');
    if (!response.ok) throw new Error('Failed to load map');
    
    const mapText = await response.text();
    const lines = mapText.split('\n').filter(line => line.trim());
    
    // Conta tutti i simboli
    const symbolCounts: Record<string, number> = {};
    let totalCells = 0;
    
    for (const line of lines) {
      for (const char of line) {
        symbolCounts[char] = (symbolCounts[char] || 0) + 1;
        totalCells++;
      }
    }
    
    // Crea analisi biomi
    const uniqueSymbols = Object.keys(symbolCounts).sort();
    const biomes: BiomeAnalysis[] = [];
    const unknownSymbols: string[] = [];
    
    for (const symbol of uniqueSymbols) {
      const count = symbolCounts[symbol];
      const percentage = (count / totalCells) * 100;
      
      if (KNOWN_BIOMES[symbol]) {
        biomes.push({
          symbol,
          count,
          percentage,
          description: KNOWN_BIOMES[symbol],
          implemented: symbol !== 'R' // R non ha logica implementata
        });
      } else {
        unknownSymbols.push(symbol);
      }
    }
    
    // Ordina per frequenza
    biomes.sort((a, b) => b.count - a.count);
    
    return {
      totalCells,
      uniqueSymbols,
      biomes,
      unknownSymbols
    };
    
  } catch (error) {
    console.error('Error analyzing map:', error);
    throw error;
  }
}

/**
 * Stampa un report dettagliato dell'analisi mappa
 */
export function printMapAnalysis(analysis: MapAnalysisResult): void {
  console.log('=== ANALISI MAPPA BIOMI ===');
  console.log(`Celle totali: ${analysis.totalCells}`);
  console.log(`Simboli unici: ${analysis.uniqueSymbols.length}`);
  console.log('');
  
  console.log('BIOMI IDENTIFICATI:');
  for (const biome of analysis.biomes) {
    const status = biome.implemented ? '✅' : '⚠️';
    console.log(`${status} ${biome.symbol}: ${biome.count} celle (${biome.percentage.toFixed(1)}%) - ${biome.description}`);
  }
  
  if (analysis.unknownSymbols.length > 0) {
    console.log('');
    console.log('SIMBOLI SCONOSCIUTI:');
    for (const symbol of analysis.unknownSymbols) {
      console.log(`❌ '${symbol}': Non mappato`);
    }
  }
}