// Item Options Test - Test sistema opzioni utilizzo oggetti
// Verifica funzionamento USO, EQUIPAGGIA, GETTA

import type { IItem } from '../interfaces/items';
import type { ICharacterSheet } from '../rules/types';
import { getAvailableActions, getDefaultAction, executeItemAction } from './itemActions';
import { equipItem, canEquipItem, getEquipmentSlotType } from './equipmentManager';
import { itemDatabase } from '../data/items/itemDatabase';

export interface ItemOptionsTestResult {
  testName: string;
  passed: boolean;
  details: string;
  error?: string;
}

/**
 * Test azioni disponibili per diversi tipi di oggetti
 */
export function testAvailableActions(): ItemOptionsTestResult {
  try {
    const testItems = [
      { id: 'CONS_001', expectedActions: ['U', 'X', 'G'] }, // Consumabile
      { id: 'WEAP_001', expectedActions: ['E', 'X', 'G'] }, // Arma
      { id: 'ARMOR_001', expectedActions: ['E', 'X', 'G'] }, // Armatura
    ];
    
    const details: string[] = [];
    let allPassed = true;
    
    for (const testCase of testItems) {
      const item = itemDatabase[testCase.id];
      if (!item) {
        allPassed = false;
        details.push(`❌ Oggetto ${testCase.id} non trovato`);
        continue;
      }
      
      const actions = getAvailableActions(item);
      const availableKeys = actions.filter(a => a.available).map(a => a.key);
      
      const missingActions = testCase.expectedActions.filter(key => !availableKeys.includes(key));
      const extraActions = availableKeys.filter(key => !testCase.expectedActions.includes(key));
      
      if (missingActions.length === 0 && extraActions.length === 0) {
        details.push(`✅ ${item.name}: azioni corrette [${availableKeys.join(', ')}]`);
      } else {
        allPassed = false;
        details.push(`❌ ${item.name}: attese [${testCase.expectedActions.join(', ')}], ottenute [${availableKeys.join(', ')}]`);
        if (missingActions.length > 0) {
          details.push(`   Mancanti: [${missingActions.join(', ')}]`);
        }
        if (extraActions.length > 0) {
          details.push(`   Extra: [${extraActions.join(', ')}]`);
        }
      }
    }
    
    return {
      testName: 'Azioni Disponibili per Tipo Oggetto',
      passed: allPassed,
      details: details.join('\\n   ')
    };
    
  } catch (error) {
    return {
      testName: 'Azioni Disponibili per Tipo Oggetto',
      passed: false,
      details: 'Test fallito con errore',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Test azioni di default per oggetti
 */
export function testDefaultActions(): ItemOptionsTestResult {
  try {
    const testCases = [
      { id: 'CONS_001', expectedDefault: 'U' }, // Consumabile -> USO
      { id: 'WEAP_001', expectedDefault: 'E' }, // Arma -> EQUIPAGGIA
      { id: 'ARMOR_001', expectedDefault: 'E' }, // Armatura -> EQUIPAGGIA
    ];
    
    const details: string[] = [];
    let allPassed = true;
    
    for (const testCase of testCases) {
      const item = itemDatabase[testCase.id];
      if (!item) {
        allPassed = false;
        details.push(`❌ Oggetto ${testCase.id} non trovato`);
        continue;
      }
      
      const defaultAction = getDefaultAction(item);
      
      if (defaultAction && defaultAction.key === testCase.expectedDefault) {
        details.push(`✅ ${item.name}: azione default corretta [${defaultAction.key}] ${defaultAction.label}`);
      } else {
        allPassed = false;
        const actualKey = defaultAction ? defaultAction.key : 'nessuna';
        details.push(`❌ ${item.name}: attesa [${testCase.expectedDefault}], ottenuta [${actualKey}]`);
      }
    }
    
    return {
      testName: 'Azioni Default per Tipo Oggetto',
      passed: allPassed,
      details: details.join('\\n   ')
    };
    
  } catch (error) {
    return {
      testName: 'Azioni Default per Tipo Oggetto',
      passed: false,
      details: 'Test fallito con errore',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Test sistema equipaggiamento
 */
export function testEquipmentSystem(): ItemOptionsTestResult {
  try {
    const details: string[] = [];
    let allPassed = true;
    
    // Test riconoscimento oggetti equipaggiabili
    const equipmentTests = [
      { id: 'WEAP_001', canEquip: true, slotType: 'weapon' },
      { id: 'ARMOR_001', canEquip: true, slotType: 'armor' },
      { id: 'CONS_001', canEquip: false, slotType: null },
    ];
    
    for (const test of equipmentTests) {
      const item = itemDatabase[test.id];
      if (!item) {
        allPassed = false;
        details.push(`❌ Oggetto ${test.id} non trovato`);
        continue;
      }
      
      const canEquip = canEquipItem(item);
      const slotType = getEquipmentSlotType(item);
      
      if (canEquip === test.canEquip && slotType === test.slotType) {
        details.push(`✅ ${item.name}: equipaggiabile=${canEquip}, slot=${slotType || 'nessuno'}`);
      } else {
        allPassed = false;
        details.push(`❌ ${item.name}: atteso equipaggiabile=${test.canEquip}, slot=${test.slotType || 'nessuno'}`);
        details.push(`   Ottenuto equipaggiabile=${canEquip}, slot=${slotType || 'nessuno'}`);
      }
    }
    
    return {
      testName: 'Sistema Equipaggiamento',
      passed: allPassed,
      details: details.join('\\n   ')
    };
    
  } catch (error) {
    return {
      testName: 'Sistema Equipaggiamento',
      passed: false,
      details: 'Test fallito con errore',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Test esecuzione azioni
 */
export function testActionExecution(): ItemOptionsTestResult {
  try {
    const details: string[] = [];
    let allPassed = true;
    
    const item = itemDatabase['WEAP_001']; // Coltello
    if (!item) {
      return {
        testName: 'Esecuzione Azioni',
        passed: false,
        details: 'Oggetto test non trovato'
      };
    }
    
    const actions = getAvailableActions(item);
    let executionResults: string[] = [];
    
    // Test esecuzione di ogni azione
    for (const action of actions.filter(a => a.available)) {
      const result = executeItemAction(
        action,
        item,
        0, // slot index
        (slotIndex) => executionResults.push(`USO eseguito su slot ${slotIndex}`),
        (item, slotIndex) => executionResults.push(`EQUIPAGGIA ${item.name} da slot ${slotIndex}`),
        (item) => executionResults.push(`ESAMINA ${item.name}`),
        (slotIndex) => executionResults.push(`GETTA da slot ${slotIndex}`)
      );
      
      if (result && result.length > 0) {
        details.push(`✅ Azione ${action.key} (${action.label}): "${result}"`);
      } else {
        allPassed = false;
        details.push(`❌ Azione ${action.key} (${action.label}): nessun risultato`);
      }
    }
    
    // Verifica che i callback siano stati chiamati
    if (executionResults.length > 0) {
      details.push(`✅ Callback eseguiti: ${executionResults.length}`);
      executionResults.forEach(result => {
        details.push(`   - ${result}`);
      });
    } else {
      details.push(`⚠️ Nessun callback eseguito (normale per test)`);
    }
    
    return {
      testName: 'Esecuzione Azioni',
      passed: allPassed,
      details: details.join('\\n   ')
    };
    
  } catch (error) {
    return {
      testName: 'Esecuzione Azioni',
      passed: false,
      details: 'Test fallito con errore',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Test controlli tastiera
 */
export function testKeyboardControls(): ItemOptionsTestResult {
  try {
    const details: string[] = [];
    let allPassed = true;
    
    const keyMappings = [
      { key: 'U', expectedAction: 'USA' },
      { key: 'E', expectedAction: 'EQUIPAGGIA' },
      { key: 'X', expectedAction: 'ESAMINA' },
      { key: 'G', expectedAction: 'GETTA' }
    ];
    
    const item = itemDatabase['WEAP_001'];
    if (!item) {
      return {
        testName: 'Controlli Tastiera',
        passed: false,
        details: 'Oggetto test non trovato'
      };
    }
    
    const actions = getAvailableActions(item);
    
    for (const mapping of keyMappings) {
      const action = actions.find(a => a.key === mapping.key);
      
      if (action && action.label === mapping.expectedAction) {
        details.push(`✅ Tasto ${mapping.key}: ${action.label} (${action.available ? 'disponibile' : 'non disponibile'})`);
      } else if (action) {
        allPassed = false;
        details.push(`❌ Tasto ${mapping.key}: atteso "${mapping.expectedAction}", ottenuto "${action.label}"`);
      } else {
        allPassed = false;
        details.push(`❌ Tasto ${mapping.key}: azione non trovata`);
      }
    }
    
    return {
      testName: 'Controlli Tastiera',
      passed: allPassed,
      details: details.join('\\n   ')
    };
    
  } catch (error) {
    return {
      testName: 'Controlli Tastiera',
      passed: false,
      details: 'Test fallito con errore',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Esegue tutti i test del sistema opzioni oggetti
 */
export function runAllItemOptionsTests(): ItemOptionsTestResult[] {
  return [
    testAvailableActions(),
    testDefaultActions(),
    testEquipmentSystem(),
    testActionExecution(),
    testKeyboardControls()
  ];
}

/**
 * Stampa report completo dei test opzioni oggetti
 */
export function printItemOptionsTestReport(results: ItemOptionsTestResult[]): void {
  console.log('=== REPORT TEST SISTEMA OPZIONI OGGETTI ===');
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
    console.log('🎉 ECCELLENTE: Sistema opzioni oggetti perfetto!');
  } else if (percentage >= 75) {
    console.log('✅ BUONO: Sistema opzioni oggetti funziona bene.');
  } else {
    console.log('⚠️ PROBLEMI: Sistema opzioni oggetti necessita correzioni.');
  }
}

/**
 * Test completo sistema opzioni oggetti
 */
export function runCompleteItemOptionsTest(): void {
  console.log('⚙️ AVVIO TEST COMPLETO SISTEMA OPZIONI OGGETTI ⚙️');
  console.log('');
  
  const results = runAllItemOptionsTests();
  printItemOptionsTestReport(results);
  
  console.log('');
  console.log('✅ Test sistema opzioni oggetti completato!');
}