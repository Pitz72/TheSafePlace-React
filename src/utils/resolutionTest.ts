// Utility per testing multi-risoluzione
export interface ResolutionTest {
  name: string;
  width: number;
  height: number;
  expectedScale: number;
  description: string;
}

export const RESOLUTION_TESTS: ResolutionTest[] = [
  {
    name: 'Desktop 1920x1080',
    width: 1920,
    height: 1080,
    expectedScale: 1.0,
    description: 'Risoluzione nativa - scale 100%'
  },
  {
    name: 'Desktop 1366x768',
    width: 1366,
    height: 768,
    expectedScale: 0.71,
    description: 'Desktop standard - scale 71%'
  }
  // Rimossi test mobile e tablet - gioco keyboard-only desktop
];

export const runResolutionTest = (test: ResolutionTest): boolean => {
  const gameWidth = 1920;
  const gameHeight = 1080;
  
  const scaleX = test.width / gameWidth;
  const scaleY = test.height / gameHeight;
  const calculatedScale = Math.min(scaleX, scaleY);
  const finalScale = Math.max(0.4, Math.min(1.0, calculatedScale));
  
  const isCorrect = Math.abs(finalScale - test.expectedScale) < 0.01;
  
  console.log(`🧪 ${test.name}:`);
  console.log(`   Risoluzione: ${test.width}x${test.height}`);
  console.log(`   Scale atteso: ${test.expectedScale}`);
  console.log(`   Scale calcolato: ${finalScale.toFixed(2)}`);
  console.log(`   Risultato: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Descrizione: ${test.description}`);
  console.log('');
  
  return isCorrect;
};

export const runAllResolutionTests = (): void => {
  console.log('🚀 INIZIO TEST DESKTOP-ONLY RISOLUZIONE');
  console.log('==========================================');
  
  let passedTests = 0;
  let totalTests = RESOLUTION_TESTS.length;
  
  RESOLUTION_TESTS.forEach(test => {
    if (runResolutionTest(test)) {
      passedTests++;
    }
  });
  
  console.log('📊 RISULTATI FINALI');
  console.log('====================');
  console.log(`Test superati: ${passedTests}/${totalTests}`);
  console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TUTTI I TEST SUPERATI! Sistema multi-risoluzione OK');
  } else {
    console.log('⚠️  ALCUNI TEST FALLITI - Verificare implementazione');
  }
};