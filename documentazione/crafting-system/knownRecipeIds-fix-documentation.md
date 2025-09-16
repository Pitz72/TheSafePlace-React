# Fix del Bug knownRecipeIds Vuoto

## Problema Identificato

Il sistema di crafting presentava un bug critico dove `knownRecipeIds` rimaneva vuoto dopo l'inizializzazione del personaggio, impedendo la corretta visualizzazione delle ricette disponibili.

## Causa Root

Il bug era localizzato nella funzione `unlockStarterRecipes()` nel file `craftingStore.ts` alla riga 588:

```typescript
// CODICE PROBLEMATICO (PRIMA)
gameStore.characterSheet = updatedCharacter; // Mutazione diretta
```

La mutazione diretta dell'oggetto `characterSheet` bypassava i meccanismi di sincronizzazione tra store, causando:
- Mancata propagazione degli aggiornamenti
- Inconsistenza tra `gameStore` e `characterStore`
- `knownRecipeIds` non sincronizzato

## Soluzione Implementata

### 1. Correzione Architetturale

Sostituita la mutazione diretta con il metodo sicuro:

```typescript
// CODICE CORRETTO (DOPO)
useCharacterStore.getState().updateCharacterSheet(updatedCharacter);
```

### 2. Import Aggiunto

Aggiunto l'import necessario in `craftingStore.ts`:

```typescript
import { useCharacterStore } from './character/characterStore';
```

## Validazione

### Test Unitari Creati

Creato file `crafting-knownRecipeIds-fix.test.ts` con 6 test:

1. **Popolamento knownRecipeIds**: Verifica che le ricette starter vengano caricate
2. **Sincronizzazione store**: Conferma la corretta sincronizzazione tra store
3. **Prevenzione duplicati**: Evita ricette duplicate
4. **Funzionamento syncWithGameStore**: Verifica la sincronizzazione manuale
5. **Gestione edge case**: Gestisce gracefully `characterSheet` null
6. **Test di regressione**: Conferma che il fix funzioni correttamente

### Risultati Test

```
✓ unlockStarterRecipes should populate knownRecipeIds correctly
✓ should maintain synchronization between stores
✓ should not duplicate starter recipes if already present
✓ syncWithGameStore should work correctly
✓ should handle edge case with null characterSheet
✓ regression test: verify knownRecipeIds population works

Test Suites: 1 passed, 1 total
Tests: 6 passed, 6 total
```

## Impatto

### Benefici
- ✅ `knownRecipeIds` ora si popola correttamente
- ✅ Sincronizzazione store funzionante
- ✅ Ricette starter visibili nell'interfaccia
- ✅ Architettura più robusta e manutenibile

### Backward Compatibility
- ✅ Nessuna breaking change
- ✅ API esistenti invariate
- ✅ Comportamento utente migliorato senza modifiche UI

## File Modificati

1. **`src/stores/craftingStore.ts`**
   - Riga 31: Aggiunto import `useCharacterStore`
   - Riga 588: Sostituita mutazione diretta con metodo sicuro

2. **`src/tests/crafting-knownRecipeIds-fix.test.ts`** (nuovo)
   - Test completi per prevenire regressioni future

## Prevenzione Regressioni

- Test automatici integrati nella suite
- Documentazione del pattern corretto
- Validazione architetturale implementata

## Note Tecniche

### Pattern Architetturale
Il fix segue il principio che `characterStore` è la "fonte di verità" per i dati del personaggio, come specificato in `ZUSTAND_REFACTORING_SPEC.md`.

### Sincronizzazione Store
La correzione garantisce che tutti gli aggiornamenti passino attraverso i canali ufficiali di sincronizzazione, mantenendo la coerenza dei dati.

---

**Data Fix**: Gennaio 2025  
**Versione**: Post-fix knownRecipeIds  
**Status**: ✅ Completato e Testato