# BUGFIX v1.3.0.1 - Correzioni Post-Release

**Data:** 21 Ottobre 2025  
**Tipo:** Hotfix Critici  
**Versione:** 1.3.0 → 1.3.0 (patch)

---

## BUG RISOLTI

### 1. ✅ UI Comando F Mancante
**Problema:** Il comando F per Ricerca Attiva non era visualizzato nel pannello comandi
**Fix:** Aggiunto `[F] Cerca Risorse` nel CommandsPanel

### 2. ✅ Cooldown Ricerca Mancante
**Problema:** F poteva essere usato indiscriminatamente, spammando risorse
**Fix:** 
- Aggiunto `lastSearchedBiome` nello state
- Ricerca Attiva ora funziona 1 volta per bioma
- Reset automatico quando entri in un nuovo bioma
- Messaggio di feedback: "Hai già perlustra questa zona. Esplora un nuovo bioma per cercare ancora."

### 3. ✅ Loot Non Assegnato Dopo Check Passato
**Problema:** A volte il check Sopravvivenza passava ma nessun item veniva dato
**Causa:** `itemDatabase` poteva essere vuoto, causando skip del loot
**Fix:** 
- `addItem()` viene ora chiamato SEMPRE
- Fallback al nome item se database non caricato
- Maggiore robustezza nel sistema di loot

---

## BUG PARZIALI (Richiede New Game)

### 4. ⚠️ Ricette Solo 2 Visibili
**Problema:** L'utente vede solo 2 ricette invece di 5
**Causa Probabile:** Salvataggio v1.2.4 caricato in v1.3.0
**Soluzione:** 
- **NEW GAME** per vedere tutte e 5 le ricette
- Salvataggi vecchi potrebbero avere `knownRecipes` con solo 3 ID vecchi
- 2 delle 3 ricette vecchie potrebbero non esistere più nel database aggiornato

**Ricette Corrette (v1.3.0):**
1. recipe_purify_water (NEW)
2. recipe_makeshift_bandage (NEW)
3. recipe_collect_water (NEW)
4. recipe_makeshift_knife (Esistente)
5. recipe_repair_kit_basic (Esistente)

### 5. ⚠️ Items "Invisibili" nell'Inventario
**Problema:** Scorrendo l'inventario, "Benda di fortuna x3" e "Rottame Metallico x3" sembrano non esistere
**Causa:** Race condition nel caricamento di `itemDatabase`
**Workaround:** Aspetta 2-3 secondi dopo l'avvio prima di aprire l'inventario
**Fix Permanente Necessario:** Filtrare `inventory` PRIMA di calcolare indici di selezione

---

## FILE MODIFICATI (3)

1. **types.ts** - Aggiunto `lastSearchedBiome: string | null`
2. **store/gameStore.ts** - Cooldown bioma + fix loot sempre assegnato
3. **components/GameScreen.tsx** - Aggiunto [F] nei comandi

---

## TESTING

**Scenario 1: Ricerca Attiva**
1. Avvia gioco → Muoviti in Pianura
2. Premi F → Ricevi loot
3. Premi F di nuovo → Messaggio "già perlustra"
4. Muoviti in Foresta
5. Premi F → Ricevi nuovo loot

**Scenario 2: New Game**
1. New Game → Apri Crafting (C da rifugio)
2. Verifica: 5 ricette visibili
3. Verifica inventario: 10 items

**Scenario 3: Inventario**
1. Aspetta 3 secondi dopo avvio
2. Premi I → Scorri inventario
3. Tutti gli items dovrebbero essere selezionabili

---

## COMPATIBILITÀ

- ✅ Retrocompatibile con salvataggi v1.2.4
- ⚠️ Salvataggi vecchi potrebbero non avere tutte le ricette (NEW GAME consigliato)
- ✅ Zero breaking changes

---

## PROSSIMI FIX NECESSARI (v1.3.1)

1. **Race Condition ItemDatabase:**
   - Assicurare che database sia caricato prima di renderizzare UI
   - Oppure filtrare inventory eliminando items con itemId non validi

2. **Migration System:**
   - Auto-aggiungere nuove ricette ai salvataggi vecchi
   - Quando load save v1.2.4 → auto-add le 3 nuove ricette

3. **Debug Tools:**
   - Console log per verificare stato caricamento database
   - Warning se `itemDatabase` è vuoto ma si tenta di renderizzare items

---

**Status:** Build completata, gioco funzionante con workaround

