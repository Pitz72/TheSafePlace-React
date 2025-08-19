// Mountain Message Test - Test per verificare i messaggi ironici delle montagne
// Strumento per analizzare varietà, tono e qualità dei messaggi

import { MessageType, getRandomMessage } from '../data/MessageArchive';

export interface MountainMessageAnalysis {
  message: string;
  length: number;
  hasIrony: boolean;
  tone: 'sarcastic' | 'humorous' | 'philosophical' | 'scientific';
  keywords: string[];
}

export interface MountainTestResult {
  totalMessages: number;
  averageLength: number;
  toneDistribution: Record<string, number>;
  ironicMessages: number;
  uniqueMessages: Set<string>;
  qualityScore: number;
}

/**
 * Analizza un singolo messaggio montagna
 */
function analyzeMountainMessage(message: string): MountainMessageAnalysis {
  const length = message.length;
  
  // Parole chiave che indicano ironia/umorismo
  const ironicKeywords = [
    'rincorsa', 'declini educatamente', 'fisica', 'ottimismo', 
    'gravità', 'testarda', 'supereroi', 'aggirare', 'abbandono',
    'congratulazioni', 'immobilità', 'letteralmente'
  ];
  
  const keywords = ironicKeywords.filter(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const hasIrony = keywords.length > 0 || 
    message.includes('?') || 
    message.includes(':') ||
    message.includes('.');
  
  // Determina il tono
  let tone: 'sarcastic' | 'humorous' | 'philosophical' | 'scientific' = 'humorous';
  
  if (message.includes('Fisica:') || message.includes('gravità') || message.includes('immobilità')) {
    tone = 'scientific';
  } else if (message.includes('declini educatamente') || message.includes('congratulazioni')) {
    tone = 'sarcastic';
  } else if (message.includes('supereroi') || message.includes('rincorsa')) {
    tone = 'humorous';
  } else if (message.includes('testarda') || message.includes('sfida')) {
    tone = 'philosophical';
  }
  
  return {
    message,
    length,
    hasIrony,
    tone,
    keywords
  };
}

/**
 * Testa tutti i messaggi montagna
 */
export function testMountainMessages(samples: number = 1000): MountainTestResult {
  const messages = new Set<string>();
  const analyses: MountainMessageAnalysis[] = [];
  const toneDistribution: Record<string, number> = {
    sarcastic: 0,
    humorous: 0,
    philosophical: 0,
    scientific: 0
  };
  
  // Raccoglie campioni di messaggi
  for (let i = 0; i < samples; i++) {
    const message = getRandomMessage(MessageType.MOVEMENT_FAIL_MOUNTAIN);
    messages.add(message);
  }
  
  // Analizza ogni messaggio unico
  for (const message of messages) {
    const analysis = analyzeMountainMessage(message);
    analyses.push(analysis);
    toneDistribution[analysis.tone]++;
  }
  
  const totalMessages = messages.size;
  const averageLength = analyses.reduce((sum, a) => sum + a.length, 0) / totalMessages;
  const ironicMessages = analyses.filter(a => a.hasIrony).length;
  
  // Calcola punteggio qualità (0-100)
  let qualityScore = 0;
  qualityScore += Math.min(totalMessages * 10, 100); // Varietà (max 10 messaggi = 100 punti)
  qualityScore += (ironicMessages / totalMessages) * 100; // % messaggi ironici
  qualityScore += averageLength > 30 ? 50 : (averageLength / 30) * 50; // Lunghezza appropriata
  qualityScore += Object.keys(toneDistribution).filter(tone => toneDistribution[tone] > 0).length * 10; // Varietà toni
  qualityScore = Math.min(qualityScore / 4, 100); // Media e cap a 100
  
  return {
    totalMessages,
    averageLength,
    toneDistribution,
    ironicMessages,
    uniqueMessages: messages,
    qualityScore
  };
}

/**
 * Stampa un report dettagliato dei messaggi montagna
 */
export function printMountainMessageReport(result: MountainTestResult): void {
  console.log('=== REPORT MESSAGGI IRONICI MONTAGNE ===');
  console.log('');
  
  console.log('📊 STATISTICHE GENERALI:');
  console.log(`   Messaggi unici: ${result.totalMessages}`);
  console.log(`   Lunghezza media: ${result.averageLength.toFixed(1)} caratteri`);
  console.log(`   Messaggi ironici: ${result.ironicMessages}/${result.totalMessages} (${((result.ironicMessages/result.totalMessages)*100).toFixed(1)}%)`);
  console.log(`   Punteggio qualità: ${result.qualityScore.toFixed(1)}/100`);
  console.log('');
  
  console.log('🎭 DISTRIBUZIONE TONI:');
  for (const [tone, count] of Object.entries(result.toneDistribution)) {
    const percentage = (count / result.totalMessages) * 100;
    console.log(`   ${tone}: ${count} messaggi (${percentage.toFixed(1)}%)`);
  }
  console.log('');
  
  console.log('💬 TUTTI I MESSAGGI:');
  let index = 1;
  for (const message of result.uniqueMessages) {
    const analysis = analyzeMountainMessage(message);
    const ironicIcon = analysis.hasIrony ? '😄' : '😐';
    console.log(`   ${index}. ${ironicIcon} "${message}"`);
    console.log(`      Tono: ${analysis.tone}, Parole chiave: [${analysis.keywords.join(', ')}]`);
    index++;
  }
  console.log('');
  
  // Valutazione qualità
  if (result.qualityScore >= 90) {
    console.log('✅ ECCELLENTE: Messaggi di altissima qualità con varietà e ironia perfette!');
  } else if (result.qualityScore >= 75) {
    console.log('✅ OTTIMO: Messaggi di buona qualità con ironia appropriata.');
  } else if (result.qualityScore >= 60) {
    console.log('⚠️ BUONO: Messaggi accettabili ma potrebbero beneficiare di più varietà.');
  } else {
    console.log('❌ MIGLIORABILE: Messaggi necessitano di più ironia e varietà.');
  }
}

/**
 * Verifica che i messaggi rispettino i criteri di qualità
 */
export function validateMountainMessageQuality(): boolean {
  const result = testMountainMessages(1000);
  
  const criteria = {
    minMessages: 4,
    minIronicPercentage: 0.8, // 80% dei messaggi dovrebbero essere ironici
    minQualityScore: 75,
    minToneVariety: 2 // Almeno 2 toni diversi
  };
  
  const toneVariety = Object.values(result.toneDistribution).filter(count => count > 0).length;
  const ironicPercentage = result.ironicMessages / result.totalMessages;
  
  const checks = [
    { name: 'Numero messaggi', value: result.totalMessages, min: criteria.minMessages, pass: result.totalMessages >= criteria.minMessages },
    { name: 'Percentuale ironica', value: ironicPercentage, min: criteria.minIronicPercentage, pass: ironicPercentage >= criteria.minIronicPercentage },
    { name: 'Punteggio qualità', value: result.qualityScore, min: criteria.minQualityScore, pass: result.qualityScore >= criteria.minQualityScore },
    { name: 'Varietà toni', value: toneVariety, min: criteria.minToneVariety, pass: toneVariety >= criteria.minToneVariety }
  ];
  
  console.log('🔍 VALIDAZIONE QUALITÀ MESSAGGI:');
  let allPassed = true;
  
  for (const check of checks) {
    const status = check.pass ? '✅' : '❌';
    console.log(`   ${status} ${check.name}: ${check.value} (min: ${check.min})`);
    if (!check.pass) allPassed = false;
  }
  
  console.log('');
  console.log(allPassed ? '✅ Tutti i criteri di qualità sono soddisfatti!' : '❌ Alcuni criteri necessitano miglioramenti.');
  
  return allPassed;
}

/**
 * Test completo dei messaggi montagna
 */
export function runCompleteMountainTest(): void {
  console.log('⛰️ AVVIO TEST COMPLETO MESSAGGI MONTAGNE ⛰️');
  console.log('');
  
  const result = testMountainMessages(1000);
  printMountainMessageReport(result);
  
  console.log('');
  validateMountainMessageQuality();
  
  console.log('');
  console.log('✅ Test messaggi montagne completato!');
}