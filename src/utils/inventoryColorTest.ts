// Inventory Color Test - Test per verificare i colori degli oggetti inventario
// Strumento per testare la visualizzazione e differenziazione degli oggetti

import type { IItem } from '../interfaces/items';
import { getItemColorClass, getItemColor, getItemColorDescription } from './itemColors';

export interface InventoryColorTestResult {
  totalItems: number;
  colorDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  rarityDistribution: Record<string, number>;
  uniqueColors: number;
  coverageScore: number;
}

/**
 * Testa il sistema di colori dell'inventario
 */
export function testInventoryColors(items: Record<string, IItem>): InventoryColorTestResult {
  const colorDistribution: Record<string, number> = {};
  const typeDistribution: Record<string, number> = {};
  const rarityDistribution: Record<string, number> = {};
  
  for (const item of Object.values(items)) {
    // Conta colori
    const colorClass = getItemColorClass(item);
    colorDistribution[colorClass] = (colorDistribution[colorClass] || 0) + 1;
    
    // Conta tipi
    const type = item.type as string;
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    
    // Conta rarità
    const rarity = item.rarity || 'None';
    rarityDistribution[rarity] = (rarityDistribution[rarity] || 0) + 1;
  }
  
  const totalItems = Object.keys(items).length;
  const uniqueColors = Object.keys(colorDistribution).length;
  
  // Calcola punteggio copertura (0-100)
  const maxPossibleColors = 12; // Numero di colori definiti
  const coverageScore = Math.min((uniqueColors / maxPossibleColors) * 100, 100);
  
  return {
    totalItems,
    colorDistribution,
    typeDistribution,
    rarityDistribution,
    uniqueColors,
    coverageScore
  };
}

/**
 * Stampa un report dettagliato dei colori inventario
 */
export function printInventoryColorReport(result: InventoryColorTestResult, items: Record<string, IItem>): void {
  console.log('=== REPORT COLORI INVENTARIO ===');
  console.log('');
  
  console.log('📊 STATISTICHE GENERALI:');
  console.log(`   Oggetti totali: ${result.totalItems}`);
  console.log(`   Colori unici utilizzati: ${result.uniqueColors}/12`);
  console.log(`   Copertura colori: ${result.coverageScore.toFixed(1)}%`);
  console.log('');
  
  console.log('🎨 DISTRIBUZIONE COLORI:');
  for (const [colorClass, count] of Object.entries(result.colorDistribution)) {
    const percentage = (count / result.totalItems) * 100;
    const sampleItem = Object.values(items).find(item => getItemColorClass(item) === colorClass);
    const color = sampleItem ? getItemColor(sampleItem) : '#FFFFFF';
    console.log(`   ${colorClass}: ${count} oggetti (${percentage.toFixed(1)}%) - ${color}`);
  }
  console.log('');
  
  console.log('📦 DISTRIBUZIONE TIPI:');
  for (const [type, count] of Object.entries(result.typeDistribution)) {
    const percentage = (count / result.totalItems) * 100;
    console.log(`   ${type}: ${count} oggetti (${percentage.toFixed(1)}%)`);
  }
  console.log('');
  
  console.log('💎 DISTRIBUZIONE RARITÀ:');
  for (const [rarity, count] of Object.entries(result.rarityDistribution)) {
    const percentage = (count / result.totalItems) * 100;
    console.log(`   ${rarity}: ${count} oggetti (${percentage.toFixed(1)}%)`);
  }
  console.log('');
  
  console.log('🔍 ESEMPI PER COLORE:');
  const colorExamples: Record<string, IItem[]> = {};
  
  for (const item of Object.values(items)) {
    const colorClass = getItemColorClass(item);
    if (!colorExamples[colorClass]) {
      colorExamples[colorClass] = [];
    }
    if (colorExamples[colorClass].length < 3) { // Max 3 esempi per colore
      colorExamples[colorClass].push(item);
    }
  }
  
  for (const [colorClass, examples] of Object.entries(colorExamples)) {
    const color = getItemColor(examples[0]);
    const description = getItemColorDescription(examples[0]);
    console.log(`   ${colorClass} (${description}):`);
    for (const item of examples) {
      console.log(`     - ${item.name} (${item.type}${item.rarity ? `, ${item.rarity}` : ''})`);
    }
  }
}

/**
 * Verifica la qualità del sistema di colori
 */
export function validateInventoryColorSystem(items: Record<string, IItem>): boolean {
  const result = testInventoryColors(items);
  
  const criteria = {
    minItems: 5,
    minUniqueColors: 3,
    minCoverageScore: 50
  };
  
  const checks = [
    { name: 'Oggetti totali', value: result.totalItems, min: criteria.minItems, pass: result.totalItems >= criteria.minItems },
    { name: 'Colori unici', value: result.uniqueColors, min: criteria.minUniqueColors, pass: result.uniqueColors >= criteria.minUniqueColors },
    { name: 'Copertura colori', value: result.coverageScore, min: criteria.minCoverageScore, pass: result.coverageScore >= criteria.minCoverageScore }
  ];
  
  console.log('🔍 VALIDAZIONE SISTEMA COLORI:');
  let allPassed = true;
  
  for (const check of checks) {
    const status = check.pass ? '✅' : '❌';
    console.log(`   ${status} ${check.name}: ${check.value} (min: ${check.min})`);
    if (!check.pass) allPassed = false;
  }
  
  console.log('');
  
  // Verifica che ogni tipo abbia un colore distintivo
  const typeColors: Record<string, string> = {};
  for (const item of Object.values(items)) {
    const type = item.type as string;
    const colorClass = getItemColorClass(item);
    if (!typeColors[type]) {
      typeColors[type] = colorClass;
    } else if (typeColors[type] !== colorClass && !item.rarity) {
      // Solo warning se non è dovuto alla rarità
      console.log(`⚠️ Tipo ${type} ha colori multipli: ${typeColors[type]} e ${colorClass}`);
    }
  }
  
  console.log(allPassed ? '✅ Sistema colori validato con successo!' : '❌ Sistema colori necessita miglioramenti.');
  
  return allPassed;
}

/**
 * Test completo del sistema colori inventario
 */
export function runCompleteInventoryColorTest(items: Record<string, IItem>): void {
  console.log('🎨 AVVIO TEST COMPLETO COLORI INVENTARIO 🎨');
  console.log('');
  
  const result = testInventoryColors(items);
  printInventoryColorReport(result, items);
  
  console.log('');
  validateInventoryColorSystem(items);
  
  console.log('');
  console.log('✅ Test colori inventario completato!');
}