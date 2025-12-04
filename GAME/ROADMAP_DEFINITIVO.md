# ROADMAP DEFINITIVO: Completamento Migrazione & Cleanup

Questo documento traccia il percorso tecnico preciso per completare la transizione alla nuova architettura (React 19 + Phaser + Inkjs) e rimuovere definitivamente il codice legacy.

**Stato Attuale (v2.0.3):**
- ✅ **Narrativa**: Logica migrata su Inkjs (`story.json`).
- ✅ **Rendering**: Phaser integrato per mappa e movimento.
- ⚠️ **UI**: Le schermate (`QuestScreen`, `DialogueScreen`) leggono ancora i vecchi file JSON.
- ⚠️ **Interazione**: Il binding tra Phaser e Ink è parziale.

---

## FASE 1: Integrazione UI & Narrativa (Il "Ponte")
*Obiettivo: Disaccoppiare l'interfaccia utente dai vecchi database JSON e collegarla direttamente al NarrativeService.*

### 1.1 Refactoring `DialogueScreen.tsx`
- **Stato Attuale**: Legge `dialogues.json` tramite `useDialogueDatabaseStore`.
- **Nuova Logica**:
    - Deve sottoscriversi allo stato di `NarrativeService` (testo corrente, scelte disponibili).
    - Quando il giocatore sceglie un'opzione, deve chiamare `narrativeService.chooseChoiceIndex(i)`.
    - **Azione**: Creare un hook `useInkDialogue` che espone `currentText`, `choices`, `choose()` direttamente da Ink.

### 1.2 Refactoring `QuestScreen.tsx`
- **Stato Attuale**: Legge `quests.json` e `activeQuests` (formato vecchio).
- **Nuova Logica**:
    - Le quest attive e i loro stati devono essere letti dalle variabili globali di Ink o dai "Tag" delle quest.
    - **Azione**: Aggiornare `NarrativeService` per esporre una lista di quest attive (parsando le variabili Ink come `quest_find_atlas_active`).
    - Aggiornare la UI per renderizzare la lista basandosi su questi dati.

### 1.3 Refactoring `EventScreen.tsx` (Cutscenes)
- **Stato Attuale**: Gestisce eventi statici da `events.json`.
- **Nuova Logica**:
    - Deve visualizzare il testo proveniente da Ink quando il gioco è in modalità "Cutscene".

---

## FASE 2: Interazione Mondo di Gioco (Phaser -> Ink)
*Obiettivo: Far sì che camminare sulla mappa attivi la narrazione corretta senza codice "collante" legacy.*

### 2.1 Trigger System Unificato
- **Azione**: In `MainScene.ts`, quando il player tocca un punto di interesse (es. "Giona"), invece di cercare l'ID in `events.json`, deve chiamare:
  ```typescript
  narrativeService.startDialogue("giona_intro");
  ```
- **Mapping**: Creare un semplice oggetto di configurazione (o proprietà negli oggetti Tiled) che mappa `Sprite ID` -> `Ink Knot Name`.

### 2.2 Gestione Stati (Idle/Dialogo/Cutscene)
- Assicurarsi che quando Ink è attivo, l'input di Phaser (movimento) sia bloccato.
- Quando Ink finisce (`canContinue` è false), restituire il controllo a Phaser.

---

## FASE 3: Decoupling & Verifica
*Obiettivo: Assicurarsi che nulla dipenda più dai vecchi file.*

### 3.1 Audit delle Dipendenze
- Cercare globalmente nel progetto tutte le importazioni di:
    - `useQuestDatabaseStore`
    - `useDialogueDatabaseStore`
    - `useEventDatabaseStore`
    - `useMainStoryDatabaseStore`
- **Obiettivo**: 0 risultati. Se ne trovi, refactorizza quel componente.

### 3.2 Test Funzionale Completo
- Avviare Nuova Partita -> Intro (Ink) -> Gameplay (Phaser).
- Parlare con un NPC (Ink su UI React).
- Accettare una Quest (Variabile Ink aggiornata).
- Aprire il Diario (Legge variabile Ink).
- Salvare/Caricare (Deve salvare lo stato di Ink, non più il vecchio `gameState`).

---

## FASE 4: Grande Pulizia (The Purge)
*Obiettivo: Rimuovere i file morti. Eseguire SOLO dopo aver completato la Fase 3.*

### 4.1 Eliminazione Dati Statici
Cancellare in sicurezza:
- 🗑️ `public/data/dialogues.json`
- 🗑️ `public/data/quests.json`
- 🗑️ `public/data/events.json` (se migrati tutti)
- 🗑️ `public/data/mainStory.json`
- 🗑️ `public/data/cutscenes.json`

### 4.2 Eliminazione Codice Legacy
Cancellare in sicurezza:
- 🗑️ `src/data/dialogueDatabase.ts`
- 🗑️ `src/data/questDatabase.ts`
- 🗑️ `src/data/eventDatabase.ts`
- 🗑️ `src/services/dialogueService.ts` (il vecchio servizio)

---

## Stima dei Tempi
- **Fase 1 (UI)**: 1 Sessione (Focus React/Zustand)
- **Fase 2 (Phaser)**: 1 Sessione (Focus Game Loop)
- **Fase 3 & 4 (Cleanup)**: 0.5 Sessione

**Prossimo Passo Consigliato**: Iniziare dalla **Fase 1.1**, refactorizzando `DialogueScreen` per usare Ink.
