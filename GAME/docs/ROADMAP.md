# ROADMAP: Completamento Migrazione & Desktop Release (Tauri)

Percorso tecnico per completare la transizione architetturale (React 19 + Phaser + Inkjs) e arrivare a un'applicazione desktop Win+Linux distribuibile via Tauri.

**Target finale**: app desktop autonoma su Windows e Linux. Niente più target web come obiettivo primario.

---

## FASE 0 — Preparazione ✅ COMPLETATA

Pulizia del repository e ripristino della pipeline narrativa.

- ✅ Rimosse cartelle morte: `_LEGACY_BACKUP/`, `src_backup/`, `TEMP_IMPORT/`, `_localization_work/`, backup CSS/HTML, sprite sparsi
- ✅ Rimossa cartella `GODOT/` (porting abbandonato)
- ✅ Bonifica chiamate legacy `dialogueService.startDialogue()` → instradate al NarrativeService
- ✅ Pipeline compilazione Ink wired: `npm run compile:ink` via CLI `inkjs-compiler`, eseguita automaticamente da `predev` e `prebuild`
- ✅ Fix sorgenti `.ink` (8 dichiarazioni `function` non valide, escape di `[ECHO]/[QUEST]/[TAGLIA]`, collisione knot `start`, ref `-> start` → `-> hub`)
- ✅ Loader Ink: da `fetch('/data/story.json')` (path morto) a `import` statico di `main.json` bundlato
- ✅ Bind delle EXTERNAL Ink (`addXp`, `learnRecipe`, `upgradeArmor` stub, `revealMapPOI` stub) + `allowExternalFunctionFallbacks` come safety
- ✅ Speaker UI sticky: `#speaker:` tag latched nel narrativeStore, non scompare nei sub-knot

---

## FASE 1 — Integrazione UI & Narrativa (Il "Ponte")
*Disaccoppiare la UI dai vecchi database JSON, collegarla al NarrativeService.*

### 1.1 `DialogueScreen.tsx` ✅
Migrato a `narrativeStore` + `narrativeService`. Speaker tag sticky funzionante.

### 1.2 `QuestScreen.tsx` ⚠️ PARZIALE
- **Stato Attuale**: Importa ancora `useQuestDatabaseStore`, legge `quests` come fonte di verità.
- **Da fare**:
    - Esporre le quest attive da Ink (variabili globali e/o tag) in `narrativeStore.activeQuests`
    - Aggiornare la UI per renderizzare quel dato invece dei JSON statici
    - Mantenere fallback dal questService finché alcune quest non sono migrate

### 1.3 `MainStoryScreen.tsx` ❌ DA MIGRARE
- **Stato Attuale**: Legge solo `useGameStore.activeMainStoryEvent` (sistema legacy).
- **Da fare**: routing tramite NarrativeService (knot `main_story` o equivalente), rimuovere lo store legacy quando libero.

### 1.4 `CutsceneScreen.tsx` ❌ DA MIGRARE
- **Stato Attuale**: Legge solo `useGameStore.activeCutscene` (legacy).
- **Da fare**: idem, instradare a Ink. La cutscene di intro è già scritta in `modules/cutscenes/intro.ink` (138 righe).

---

## FASE 2 — Interazione Mondo di Gioco (Phaser → Ink)
*Camminare sulla mappa attiva la narrazione corretta senza glue legacy.*

### 2.1 Trigger System Unificato
- In `MainScene.ts` mappare `Sprite ID` → `Ink Knot Name`
- Chiamata: `narrativeService.startDialogue("giona_intro")`

### 2.2 Stati Idle/Dialogo/Cutscene
- Quando Ink è attivo, bloccare input di Phaser
- Quando Ink termina (`canContinue=false`), restituire il controllo

---

## FASE 3 — Decoupling & Verifica
*Niente più dipendenze dai vecchi DB JSON.*

### 3.1 Audit dipendenze legacy
Target zero importazioni di: `useQuestDatabaseStore`, `useDialogueDatabaseStore`, `useEventDatabaseStore`, `useMainStoryDatabaseStore`.

Stato a inizio sessione: 9 file importatori, attivi. Stato attuale: invariato (lavoro di FASE 1.2/1.3/1.4 lo riduce).

### 3.2 Test funzionale completo
- Nuova Partita → Intro (Ink) → Gameplay (Phaser)
- Dialogo NPC (Ink su UI React)
- Accettare Quest (variabile Ink aggiornata)
- Aprire Diario (legge variabili Ink)
- Save/Load (deve persistere stato Ink)

---

## FASE 4 — Grande Pulizia (The Purge)
*Eseguire SOLO dopo Fase 3.*

### 4.1 Dati statici (cancellare)
- `public/data/dialogues.json`, `quests.json`, `events.json`, `mainStory.json`, `cutscenes.json`

### 4.2 Codice legacy (cancellare)
- `src/data/dialogueDatabase.ts`, `questDatabase.ts`, `eventDatabase.ts`, `mainStoryDatabase.ts`, `cutsceneDatabase.ts`
- `src/services/dialogueService.ts` già rimosso (zero importatori dopo FASE 0)

---

## FASE 5 — Save/Load Ink
*Persistere correttamente lo stato narrativo.*

- Estendere `saveGameService` per serializzare `story.state.toJson()` e ripristinarlo con `story.state.LoadJson(...)`
- Aggiornare lo schema del save con un campo `inkState`
- Invalidare i save vecchi (versioning del file save) — accettato che i save di versioni precedenti non saranno più caricabili

---

## FASE 6 — Packaging Tauri
*Distribuzione desktop Win+Linux.*

- Installare toolchain Rust (`rustup`) sulla macchina di build
- `npm install -D @tauri-apps/cli @tauri-apps/api`
- `npx tauri init` con config minima: dimensione finestra, titolo, niente menù di sistema
- Verifica build locale Win
- Verifica build locale Linux (WSL o macchina dedicata)
- Aggiungere icone (esistono già in `COVER-UFFICIALE/`)

---

## Stato avanzamento

| Fase | Stato | Sessioni stimate |
|---|---|---|
| 0 | ✅ Completa | — (fatta) |
| 1.1 DialogueScreen | ✅ Completa | — |
| 1.2 QuestScreen | ❌ | 1 |
| 1.3 MainStoryScreen | ❌ | 0.5 |
| 1.4 CutsceneScreen | ❌ | 0.5 |
| 2 Phaser binding | ❌ | 1 |
| 3 Audit | ❌ | 0.5 |
| 4 Purge | ❌ | 0.5 |
| 5 Save/Load | ❌ | 1 |
| 6 Tauri | ❌ | 1 |

**Prossimo Passo Consigliato**: FASE 1.3 (MainStoryScreen) o FASE 1.4 (CutsceneScreen) — sono brevi e completano la migrazione delle schermate narrative. QuestScreen (1.2) è più articolata, va affrontata con calma.
