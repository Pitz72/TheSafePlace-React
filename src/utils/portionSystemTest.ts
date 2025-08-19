// Portion System Test - Test per verificare il sistema porzioni consumabili
// Strumento per testare la logica di consumo porzioni

import type { IItem, IInventorySlot, IConsumableItem } from '../interfaces/items';
import { 
  isPortionableItem, 
  initializePortions, 
  getTotalPortions, 
  consumePortion, 
  getPortionDescription,
  addPortions,
  hasPortionsAvailable,
  getRemainingUses,
  getTotalEffectRemaining,
  convertToPortionableItem,
  migrateSlotToPortions
} from './portionSystem';

export interface PortionTestScenario {
  name: string;
  item: IItem;
  initialQuantity: number;
  consumptions: number;
  expectedResult: {
    finalPortions: number;
    finalUnits: number;
    totalEffectConsumed: number;
    itemConsumed: boolean;
  };
}

export interface PortionSystemTestResult {
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  coverageScore: number;
  detailedResults: Array<{
    scenario: string;
    passed: boolean;
    expected: any;
    actual: any;
    error?: string;
  }>;
}

/**
 * Scenari di test per il sistema porzioni
 */
export const PORTION_TEST_SCENARIOS: PortionTestScenario[] = [
  {
    name: 'Consumo parziale bottiglia acqua',
    item: {
      id: 'CONS_002',
      name: 'Bottiglia d\'acqua',
      type: 'consumable',
      effect: 'hydration',
      effectValue: 25,
      portionsPerUnit: 5,
      portionEffect: 5,
      portionSize: 'sorso'
    },
    initialQuantity: 1,
    consumptions: 3,
    expectedResult: {
      finalPortions: 2,
      finalUnits: 1,
      totalEffectConsumed: 15,
      itemConsumed: false
    }
  },
  {
    name: 'Consumo completo razione cibo',
    item: {
      id: 'CONS_001',
      name: 'Razione di cibo',
      type: 'consumable',
      effect: 'satiety',
      effectValue: 25,
      portionsPerUnit: 4,
      portionEffect: 6,
      portionSize: 'boccone'
    },
    initialQuantity: 1,
    consumptions: 4,
    expectedResult: {
      finalPortions: 0,
      finalUnits: 0,
      totalEffectConsumed: 24,
      itemConsumed: true
    }
  },
  {
    name: 'Consumo multiplo unità bende',
    item: {
      id: 'CONS_003',
      name: 'Bende',
      type: 'consumable',
      effect: 'heal',
      effectValue: 10,
      portionsPerUnit: 2,
      portionEffect: 5,
      portionSize: 'applicazione'
    },
    initialQuantity: 2,
    consumptions: 3,
    expectedResult: {
      finalPortions: 1,
      finalUnits: 1,
      totalEffectConsumed: 15,
      itemConsumed: false
    }
  },
  {
    name: 'Oggetto non-porzioni (arma)',
    item: {
      id: 'WEAP_001',
      name: 'Coltello',
      type: 'weapon',
      damage: '1d4'
    },
    initialQuantity: 1,
    consumptions: 1,
    expectedResult: {
      finalPortions: 0,
      finalUnits: 0,
      totalEffectConsumed: 0,
      itemConsumed: true
    }
  }
];

/**
 * Esegue un singolo scenario di test
 */
function runPortionTestScenario(scenario: PortionTestScenario): { passed: boolean; expected: any; actual: any; error?: string } {
  try {
    // Inizializza lo slot
    const slot = initializePortions(scenario.item, scenario.initialQuantity);
    let totalEffectConsumed = 0;
    
    // Esegue i consumi
    for (let i = 0; i < scenario.consumptions; i++) {
      const result = consumePortion(scenario.item, slot);
      if (result.success) {
        totalEffectConsumed += result.effectApplied;
      }
    }
    
    const actual = {
      finalPortions: getTotalPortions(scenario.item, slot),
      finalUnits: slot.quantity,
      totalEffectConsumed,
      itemConsumed: slot.quantity === 0
    };
    
    const passed = JSON.stringify(actual) === JSON.stringify(scenario.expectedResult);
    
    return {
      passed,
      expected: scenario.expectedResult,
      actual,
      error: passed ? undefined : 'Risultato non corrisponde alle aspettative'
    };
    
  } catch (error) {
    return {
      passed: false,
      expected: scenario.expectedResult,
      actual: null,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Esegue tutti i test del sistema porzioni
 */
export function testPortionSystem(): PortionSystemTestResult {
  const detailedResults = [];
  let passedScenarios = 0;
  
  for (const scenario of PORTION_TEST_SCENARIOS) {
    const result = runPortionTestScenario(scenario);
    
    detailedResults.push({
      scenario: scenario.name,
      passed: result.passed,
      expected: result.expected,
      actual: result.actual,
      error: result.error
    });
    
    if (result.passed) {
      passedScenarios++;
    }
  }
  
  const totalScenarios = PORTION_TEST_SCENARIOS.length;
  const failedScenarios = totalScenarios - passedScenarios;
  const coverageScore = (passedScenarios / totalScenarios) * 100;
  
  return {
    totalScenarios,
    passedScenarios,
    failedScenarios,
    coverageScore,
    detailedResults
  };
}

/**
 * Stampa un report dettagliato dei test porzioni
 */
export function printPortionTestReport(result: PortionSystemTestResult): void {
  console.log('=== REPORT TEST SISTEMA PORZIONI ===');
  console.log('');
  
  console.log('📊 STATISTICHE GENERALI:');
  console.log(`   Scenari totali: ${result.totalScenarios}`);
  console.log(`   Scenari passati: ${result.passedScenarios}`);
  console.log(`   Scenari falliti: ${result.failedScenarios}`);
  console.log(`   Punteggio copertura: ${result.coverageScore.toFixed(1)}%`);
  console.log('');
  
  console.log('🧪 RISULTATI DETTAGLIATI:');
  for (const test of result.detailedResults) {
    const status = test.passed ? '✅' : '❌';
    console.log(`   ${status} ${test.scenario}`);
    
    if (!test.passed) {
      console.log(`      Atteso: ${JSON.stringify(test.expected)}`);
      console.log(`      Ottenuto: ${JSON.stringify(test.actual)}`);
      if (test.error) {
        console.log(`      Errore: ${test.error}`);
      }
    }
  }
  
  console.log('');
  
  if (result.coverageScore >= 90) {
    console.log('✅ ECCELLENTE: Sistema porzioni funziona perfettamente!');
  } else if (result.coverageScore >= 75) {
    console.log('✅ BUONO: Sistema porzioni funziona bene con piccoli problemi.');
  } else if (result.coverageScore >= 50) {
    console.log('⚠️ ACCETTABILE: Sistema porzioni ha alcuni problemi da risolvere.');
  } else {
    console.log('❌ PROBLEMATICO: Sistema porzioni necessita correzioni significative.');
  }
}

/**
 * Testa le funzioni utility del sistema porzioni
 */
export function testPortionUtilities(items: Record<string, IItem>): void {
  console.log('🔧 TEST UTILITÀ SISTEMA PORZIONI:');
  console.log('');
  
  // Test identificazione oggetti porzioni
  let portionableCount = 0;
  let nonPortionableCount = 0;
  
  for (const item of Object.values(items)) {
    if (isPortionableItem(item)) {
      portionableCount++;
      console.log(`   ✅ ${item.name}: ${item.portionsPerUnit} ${item.portionSize}i per unità`);
    } else {
      nonPortionableCount++;
    }
  }
  
  console.log('');
  console.log(`📊 Oggetti con porzioni: ${portionableCount}`);
  console.log(`📊 Oggetti senza porzioni: ${nonPortionableCount}`);
  console.log('');
  
  // Test descrizioni porzioni
  console.log('📝 TEST DESCRIZIONI PORZIONI:');
  const testItem = Object.values(items).find(item => isPortionableItem(item));
  if (testItem && isPortionableItem(testItem)) {
    const slot = initializePortions(testItem, 2);
    console.log(`   Slot completo: ${getPortionDescription(testItem, slot)}`);
    
    consumePortion(testItem, slot);
    console.log(`   Dopo 1 consumo: ${getPortionDescription(testItem, slot)}`);
    
    consumePortion(testItem, slot);
    consumePortion(testItem, slot);
    console.log(`   Dopo 3 consumi: ${getPortionDescription(testItem, slot)}`);
  }
}

/**
 * Test completo del sistema porzioni
 */
export function runCompletePortionTest(items: Record<string, IItem>): void {
  console.log('🍽️ AVVIO TEST COMPLETO SISTEMA PORZIONI 🍽️');
  console.log('');
  
  const result = testPortionSystem();
  printPortionTestReport(result);
  
  console.log('');
  testPortionUtilities(items);
  
  console.log('');
  console.log('✅ Test sistema porzioni completato!');
}