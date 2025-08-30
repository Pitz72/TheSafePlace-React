# Crafting System Validation Tests

Questa directory contiene una suite completa di test per validare il sistema di crafting dopo le implementazioni e i fix.

## File di Test

### 1. `crafting-system-validation.ts`
Test funzionali del sistema di crafting:
- ✅ Applicazione starter kit
- ✅ Scoperta e utilizzo manuali
- ✅ Progressione unlock ricette
- ✅ Crafting con nuovi materiali
- ✅ Gestione errori e casi limite

### 2. `performance-validation.ts`
Test di performance e ottimizzazione:
- ⏱️ Tempo di inizializzazione (<100ms)
- 🔍 Performance lookup ricette (<1ms per lookup)
- 📚 Gestione dataset grandi (<50ms per 100+ ricette)
- 🔄 Efficienza sincronizzazione (<5ms per sync)
- 💾 Utilizzo memoria durante gameplay esteso

### 3. `integration-validation.ts`
Test di integrazione tra sistemi:
- 🎮 Integrazione con Game Store
- 💾 Compatibilità save/load
- 📡 Integrazione sistema eventi
- 🖥️ Responsività UI (<200ms)
- 🔄 Consistenza dati cross-system

### 4. `master-validation.ts`
Suite completa che esegue tutti i test e genera un report dettagliato.

## Come Utilizzare i Test

### Opzione 1: Console del Browser
1. Apri l'applicazione nel browser
2. Apri Developer Tools (F12)
3. Vai alla Console
4. Esegui uno dei seguenti comandi:

```javascript
// Test singoli
testCrafting()      // Test funzionalità crafting
testPerformance()   // Test performance
testIntegration()   // Test integrazione

// Suite completa
testAll()           // Esegue tutti i test e genera report
```

### Opzione 2: Import Diretto
```typescript
import { runMasterValidation } from './tests/master-validation';

// Esegui tutti i test
const results = await runMasterValidation();
console.log('Test Results:', results);
```

### Opzione 3: Test Individuali
```typescript
import { validateCraftingSystem } from './tests/crafting-system-validation';
import { validatePerformance } from './tests/performance-validation';
import { validateIntegration } from './tests/integration-validation';

// Test specifici
const craftingResults = await validateCraftingSystem();
const performanceResults = await validatePerformance();
const integrationResults = await validateIntegration();
```

## Interpretazione Risultati

### Punteggi
- **90-100**: Eccellente - Sistema pronto per produzione
- **75-89**: Buono - Piccoli miglioramenti raccomandati
- **50-74**: Necessita miglioramenti - Problemi da risolvere
- **0-49**: Critico - Problemi significativi da correggere

### Simboli nei Risultati
- ✅ Test superato
- ❌ Test fallito
- ⚠️ Warning/Attenzione
- 🎉 Tutti i test superati
- 🚨 Problemi critici

## Benchmark di Performance

### Target di Performance
- **Inizializzazione**: < 100ms
- **Lookup Ricette**: < 1ms per operazione
- **Dataset Grandi**: < 50ms per 100+ ricette
- **Sincronizzazione**: < 5ms per sync
- **Operazioni UI**: < 200ms
- **Memoria**: < 10MB incremento durante gameplay esteso

### Cosa Fare se i Test Falliscono

1. **Test Funzionali Falliti**:
   - Controlla implementazione starter kit
   - Verifica sistema manuali
   - Controlla unlock ricette

2. **Test Performance Falliti**:
   - Implementa memoization
   - Ottimizza algoritmi lookup
   - Aggiungi caching

3. **Test Integrazione Falliti**:
   - Verifica sincronizzazione stores
   - Controlla sistema eventi
   - Testa save/load

## Aggiungere Nuovi Test

Per aggiungere nuovi test:

1. Crea il test nella classe appropriata
2. Aggiungi il test al metodo `run*Tests()`
3. Aggiorna la documentazione
4. Testa il nuovo test

### Esempio Nuovo Test
```typescript
private async testNewFeature(): Promise<void> {
  try {
    // Implementa test
    const result = this.craftingStore.newFeature();
    
    this.addResult({
      testName: 'New Feature Test',
      passed: result === expectedValue,
      message: result === expectedValue 
        ? 'New feature works correctly'
        : 'New feature failed',
      details: { result, expected: expectedValue }
    });
  } catch (error) {
    this.addResult({
      testName: 'New Feature Test',
      passed: false,
      message: `Error: ${error}`,
      details: { error }
    });
  }
}
```

## Note Tecniche

- I test utilizzano le istanze reali degli store
- Alcuni test modificano temporaneamente lo stato (viene ripristinato)
- I test di performance utilizzano `performance.now()` per misurazioni precise
- I test di memoria richiedono browser con supporto `performance.memory`
- Tutti i test sono progettati per essere non-distruttivi

## Troubleshooting

### Errori Comuni

1. **"Store not initialized"**: Assicurati che l'app sia completamente caricata
2. **"Performance API not available"**: Alcuni test potrebbero non funzionare in tutti i browser
3. **"Memory API not available"**: Test memoria disponibile solo in Chrome/Edge

### Debug

Per debug dettagliato, abilita i log:
```javascript
// In console
localStorage.setItem('debug-crafting', 'true');
```

Questo abiliterà log dettagliati durante l'esecuzione dei test.