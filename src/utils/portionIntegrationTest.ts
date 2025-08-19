// Portion Integration Test - Test integrazione sistema porzioni
// Verifica che il sistema porzioni funzioni correttamente con GameProvider e UI

import type { IItem } from '../interfaces/items';
import { 
  isPortionableItem, 
  initializePortions, 
  consumePortion, 
  getPortionDescription,
  getTotalPortions 
} from './portionSystem';

export interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  details: string;
  error?: string;
}

/**
 * Test integrazione con inventario iniziale
 */
export function testInitialInventoryIntegration(items: Record<string, IItem>): IntegrationTestResult {
  try {
    const testItems = ['CONS_001', 'CONS_002', 'CONS_003'];
    let allPassed = true;
    const details: string[] = [];
    
    for (const itemId of testItems) {
      const item = items[itemId];
      if (!item) {
        allPassed = false;
        details.push(`❌ Oggetto ${itemId} non trovato`);
        continue;
      }
      
      if (!isPortionableItem(item)) {
        allPassed = false;
        details.push(`❌ ${item.name} non è un oggetto con porzioni`);
        continue;
      }
      
      const slot = initializePortions(item, 2);
      const expectedPortions = 2 * item.portionsPerUnit;
      const actualPortions = getTotalPortions(item, slot);
      
      if (actualPortions === expectedPortions) {
        details.push(`✅ ${item.name}: ${actualPortions} porzioni inizializzate correttamente`);
      } else {
        allPassed = false;
        details.push(`❌ ${item.name}: attese ${expectedPortions} porzioni, ottenute ${actualPortions}`);
      }
    }
    
    return {
      testName: 'Integrazione Inventario Iniziale',
      passed: allPassed,
      details: details.join('\n   ')
    };
    
  } catch (error) {
    return {
      testName: 'Integrazione Inventario Iniziale',
      passed: false,
      details: 'Test fallito con errore',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Test consumo porzioni con effetti
 */
export function testPortionConsumptionWithEffects(items: Record<string, IItem>): IntegrationTestResult {
  try {
    const item = items['CONS_003']; // Bende con effetto heal
    if (!item || !isPortionableItem(item)) {
      return {
        testName: 'Consumo Porzioni con Effetti',
        passed: false,
        details: 'Oggetto bende non trovato o non supporta porzioni'
      };
    }
    
    const slot = initializePortions(item, 1); // 1 confezione = 2 applicazioni
    const details: string[] = [];
    
    // Prima applicazione
    const result1 = consumePortion(item, slot);
    if (result1.success && result1.effectApplied === 5) {
      details.push(`✅ Prima applicazione: ${result1.message}, effetto +${result1.effectApplied}`);
    } else {
      details.push(`❌ Prima applicazione fallita`);
      return {
        testName: 'Consumo Porzioni con Effetti',
        passed: false,
        details: details.join('\n   ')
      };
    }
    
    // Seconda applicazione
    const result2 = consumePortion(item, slot);
    if (result2.success && result2.effectApplied === 5 && result2.itemConsumed) {
      details.push(`✅ Seconda applicazione: ${result2.message}, oggetto consumato completamente`);
    } else {
      details.push(`❌ Seconda applicazione fallita`);
      return {
        testName: 'Consumo Porzioni con Effetti',
        passed: false,
        details: details.join('\n   ')
      };
    }
    
    return {
      testName: 'Consumo Porzioni con Effetti',
      passed: true,
      details: details.join('\n   ')
    };
    
  } catch (error) {
    return {
      testName: 'Consumo Porzioni con Effetti',
      passed: false,
      details: 'Test fallito con errore',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Test descrizioni porzioni per UI
 */
export function testPortionDescriptionsForUI(items: Record<string, IItem>): IntegrationTestResult {
  try {
    const testCases = [
      { itemId: 'CONS_002', quantity: 1, expected: '1 unità (5 sorsi)' },
      { itemId: 'CONS_001', quantity: 2, expected: '2 unità (8 bocconi)' },
      { itemId: 'WEAP_001', quantity: 1, expected: '1 unità' } // Non-porzioni
    ];
    
    const details: string[] = [];
    let allPassed = true;
    
    for (const testCase of testCases) {
      const item = items[testCase.itemId];
      if (!item) {
        allPassed = false;
        details.push(`❌ Oggetto ${testCase.itemId} non trovato`);
        continue;
      }
      
      const slot = initializePortions(item, testCase.quantity);
      const description = getPortionDescription(item, slot);
      
      if (description === testCase.expected) {
        details.push(`✅ ${item.name}: "${description}"`);
      } else {
        allPassed = false;
        details.push(`❌ ${item.name}: attesa "${testCase.expected}", ottenuta "${description}"`);
      }
    }
    
    return {
      testName: 'Descrizioni Porzioni per UI',
      passed: allPassed,
      details: details.join('\n   ')
    };
    
  } catch (error) {
    return {
      testName: 'Descrizioni Porzioni per UI',
      passed: false,
      details: 'Test fallito con errore',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Test compatibilità oggetti non-porzioni
 */
export function testNonPortionItemsCompatibility(items: Record<string, IItem>): IntegrationTestResult {
  try {
    const nonPortionItems = ['WEAP_001', 'ARMOR_001'];
    const details: string[] = [];
    let allPassed = true;
    
    for (const itemId of nonPortionItems) {
      const item = items[itemId];
      if (!item) {
        allPassed = false;
        details.push(`❌ Oggetto ${itemId} non trovato`);
        continue;
      }
      
      // Verifica che non sia identificato come oggetto con porzioni
      if (isPortionableItem(item)) {
        allPassed = false;
        details.push(`❌ ${item.name} erroneamente identificato come oggetto con porzioni`);
        continue;
      }
      
      // Verifica comportamento normale
      const slot = initializePortions(item, 1);
      const result = consumePortion(item, slot);
      
      if (result.success && result.itemConsumed && slot.quantity === 0) {
        details.push(`✅ ${item.name}: comportamento normale mantenuto`);
      } else {
        allPassed = false;
        details.push(`❌ ${item.name}: comportamento alterato`);
      }
    }
    
    return {
      testName: 'Compatibilità Oggetti Non-Porzioni',
      passed: allPassed,
      details: details.join('\n   ')
    };
    
  } catch (error) {
    return {
      testName: 'Compatibilità Oggetti Non-Porzioni',
      passed: false,
      details: 'Test fallito con errore',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Esegue tutti i test di integrazione
 */
export function runAllIntegrationTests(items: Record<string, IItem>): IntegrationTestResult[] {
  return [
    testInitialInventoryIntegration(items),
    testPortionConsumptionWithEffects(items),
    testPortionDescriptionsForUI(items),
    testNonPortionItemsCompatibility(items)
  ];
}

/**
 * Stampa report completo dei test di integrazione
 */
export function printIntegrationTestReport(results: IntegrationTestResult[]): void {
  console.log('=== REPORT TEST INTEGRAZIONE SISTEMA PORZIONI ===');
  console.log('');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = (passed / total) * 100;
  
  console.log('📊 RISULTATI GENERALI:');
  console.log(`   Test passati: ${passed}/${total} (${percentage.toFixed(1)}%)`);
  console.log('');
  
  console.log('🧪 DETTAGLI TEST:');
  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.testName}`);
    console.log(`   ${result.details}`);
    if (result.error) {
      console.log(`   Errore: ${result.error}`);
    }
    console.log('');
  }
  
  if (percentage >= 90) {
    console.log('🎉 ECCELLENTE: Integrazione sistema porzioni perfetta!');
  } else if (percentage >= 75) {
    console.log('✅ BUONO: Integrazione sistema porzioni funziona bene.');
  } else {
    console.log('⚠️ PROBLEMI: Integrazione sistema porzioni necessita correzioni.');
  }
}

/**
 * Test completo integrazione sistema porzioni
 */
export function runCompleteIntegrationTest(items: Record<string, IItem>): void {
  console.log('🔗 AVVIO TEST COMPLETO INTEGRAZIONE PORZIONI 🔗');
  console.log('');
  
  const results = runAllIntegrationTests(items);
  printIntegrationTestReport(results);
  
  console.log('');
  console.log('✅ Test integrazione sistema porzioni completato!');
}