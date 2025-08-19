// Item Actions Test - Test per verificare il sistema opzioni utilizzo oggetti
// Strumento per testare le azioni disponibili per ogni tipo di oggetto

import type { IItem } from '../interfaces/items';
import { getAvailableActions, getDefaultAction, getDetailedExamination } from './itemActions';

export interface ItemActionTestResult {
  totalItems: number;
  itemsWithActions: number;
  actionDistribution: Record<string, number>;
  defaultActionDistribution: Record<string, number>;
  coverageScore: number;
}

/**
 * Testa il sistema di azioni oggetti
 */
export function testItemActions(items: Record<string, IItem>): ItemActionTestResult {
  const actionDistribution: Record<string, number> = {};
  const defaultActionDistribution: Record<string, number> = {};
  let itemsWithActions = 0;
  
  for (const item of Object.values(items)) {
    const actions = getAvailableActions(item);
    const availableActions = actions.filter(a => a.available);
    
    if (availableActions.length > 0) {
      itemsWithActions++;
    }
    
    // Conta azioni disponibili
    for (const action of availableActions) {
      actionDistribution[action.key] = (actionDistribution[action.key] || 0) + 1;
    }
    
    // Conta azioni di default
    const defaultAction = getDefaultAction(item);
    if (defaultAction) {
      defaultActionDistribution[defaultAction.key] = (defaultActionDistribution[defaultAction.key] || 0) + 1;
    }
  }
  
  const totalItems = Object.keys(items).length;
  const coverageScore = (itemsWithActions / totalItems) * 100;
  
  return {
    totalItems,
    itemsWithActions,
    actionDistribution,
    defaultActionDistribution,
    coverageScore
  };
}

/**
 * Stampa un report dettagliato delle azioni oggetti
 */
export function printItemActionsReport(result: ItemActionTestResult, items: Record<string, IItem>): void {
  console.log('=== REPORT AZIONI OGGETTI ===');
  console.log('');
  
  console.log('📊 STATISTICHE GENERALI:');
  console.log(`   Oggetti totali: ${result.totalItems}`);
  console.log(`   Oggetti con azioni: ${result.itemsWithActions}`);
  console.log(`   Copertura azioni: ${result.coverageScore.toFixed(1)}%`);
  console.log('');
  
  console.log('🎯 DISTRIBUZIONE AZIONI DISPONIBILI:');
  const actionNames = {
    'U': 'USA',
    'E': 'EQUIPAGGIA',
    'X': 'ESAMINA',
    'G': 'GETTA'
  };
  
  for (const [key, count] of Object.entries(result.actionDistribution)) {
    const name = actionNames[key as keyof typeof actionNames] || key;
    const percentage = (count / result.totalItems) * 100;
    console.log(`   ${name} (${key}): ${count} oggetti (${percentage.toFixed(1)}%)`);
  }
  console.log('');
  
  console.log('⭐ DISTRIBUZIONE AZIONI DEFAULT:');
  for (const [key, count] of Object.entries(result.defaultActionDistribution)) {
    const name = actionNames[key as keyof typeof actionNames] || key;
    const percentage = (count / result.totalItems) * 100;
    console.log(`   ${name} (${key}): ${count} oggetti (${percentage.toFixed(1)}%)`);
  }
  console.log('');
  
  console.log('🔍 ESEMPI PER TIPO:');
  const typeExamples: Record<string, IItem[]> = {};
  
  for (const item of Object.values(items)) {
    const type = item.type as string;
    if (!typeExamples[type]) {
      typeExamples[type] = [];
    }
    if (typeExamples[type].length < 2) { // Max 2 esempi per tipo
      typeExamples[type].push(item);
    }
  }
  
  for (const [type, examples] of Object.entries(typeExamples)) {
    console.log(`   ${type.toUpperCase()}:`);
    for (const item of examples) {
      const actions = getAvailableActions(item);
      const availableActions = actions.filter(a => a.available).map(a => a.key).join(', ');
      const defaultAction = getDefaultAction(item);
      console.log(`     - ${item.name}: [${availableActions}] (default: ${defaultAction?.key || 'nessuna'})`);
    }
  }
}

/**
 * Testa l'esame dettagliato degli oggetti
 */
export function testDetailedExamination(items: Record<string, IItem>): void {
  console.log('🔍 TEST ESAME DETTAGLIATO:');
  console.log('');
  
  // Testa alcuni oggetti rappresentativi
  const testItems = Object.values(items).slice(0, 3);
  
  for (const item of testItems) {
    console.log(`📋 ESAME: ${item.name}`);
    const examination = getDetailedExamination(item);
    for (const line of examination) {
      if (line === '') {
        console.log('');
      } else {
        console.log(`   ${line}`);
      }
    }
    console.log('');
  }
}

/**
 * Verifica la qualità del sistema azioni
 */
export function validateItemActionsSystem(items: Record<string, IItem>): boolean {
  const result = testItemActions(items);
  
  const criteria = {
    minCoverageScore: 80, // 80% degli oggetti dovrebbero avere azioni
    minActionTypes: 3,    // Almeno 3 tipi di azioni diverse
    minDefaultActions: 50 // Almeno 50% degli oggetti dovrebbe avere azione default
  };
  
  const actionTypes = Object.keys(result.actionDistribution).length;
  const defaultActionRate = Object.values(result.defaultActionDistribution).reduce((sum, count) => sum + count, 0) / result.totalItems * 100;
  
  const checks = [
    { name: 'Copertura azioni', value: result.coverageScore, min: criteria.minCoverageScore, pass: result.coverageScore >= criteria.minCoverageScore },
    { name: 'Tipi di azioni', value: actionTypes, min: criteria.minActionTypes, pass: actionTypes >= criteria.minActionTypes },
    { name: 'Azioni default', value: defaultActionRate, min: criteria.minDefaultActions, pass: defaultActionRate >= criteria.minDefaultActions }
  ];
  
  console.log('🔍 VALIDAZIONE SISTEMA AZIONI:');
  let allPassed = true;
  
  for (const check of checks) {
    const status = check.pass ? '✅' : '❌';
    console.log(`   ${status} ${check.name}: ${check.value.toFixed(1)} (min: ${check.min})`);
    if (!check.pass) allPassed = false;
  }
  
  console.log('');
  console.log(allPassed ? '✅ Sistema azioni validato con successo!' : '❌ Sistema azioni necessita miglioramenti.');
  
  return allPassed;
}

/**
 * Test completo del sistema azioni oggetti
 */
export function runCompleteItemActionsTest(items: Record<string, IItem>): void {
  console.log('⚙️ AVVIO TEST COMPLETO AZIONI OGGETTI ⚙️');
  console.log('');
  
  const result = testItemActions(items);
  printItemActionsReport(result, items);
  
  console.log('');
  testDetailedExamination(items);
  
  console.log('');
  validateItemActionsSystem(items);
  
  console.log('');
  console.log('✅ Test azioni oggetti completato!');
}