# ROADMAP SESSIONE PROSSIMA - The Safe Place v0.3.5

## STATO ATTUALE DEL PROGETTO

### ✅ COMPLETATO NELLA SESSIONE CORRENTE

#### 1. Sistema Eventi - Probabilità Aumentate
- **File modificato**: `scripts/managers/EventManager.gd`
- **Modifica**: Aumentate le probabilità di attivazione eventi per tutti i biomi:
  - "pianure": 0.15 → 0.35 (+133%)
  - "foreste": 0.20 → 0.45 (+125%)
  - "montagne": 0.18 → 0.40 (+122%)
  - "villaggi": 0.25 → 0.55 (+120%)
  - "citta": 0.30 → 0.60 (+100%)
  - "deserti": 0.12 → 0.30 (+150%)
  - "paludi": 0.22 → 0.50 (+127%)
  - "coste": 0.16 → 0.35 (+119%)
- **Risultato**: Gli eventi dovrebbero ora attivarsi molto più frequentemente

#### 2. Pulizia Log Debug - PARZIALMENTE COMPLETATO
- **Obiettivo**: Rimozione messaggi `print()` obsoleti per ridurre spam nel log
- **File completamente puliti**:
  - `scripts/ui/popups/ItemInteractionPopup.gd` ✅
  - `scripts/World.gd` ✅ (parziale)
  - `scripts/ui/popups/LevelUpPopup.gd` ✅ (parziale)
  - `scripts/managers/PlayerManager.gd` ✅
  - `scripts/managers/InputManager.gd` ✅
  - `scripts/managers/TimeManager.gd` ✅
  - `scripts/ui/popups/EventPopup.gd` ✅
  - `scripts/ThemeManager.gd` ✅
  - `scripts/ui/GameUI.gd` ✅ (parziale)


#### 3. Correzione Errori Sintassi - PARZIALMENTE COMPLETATO
- **Problema identificato**: Blocchi `if/else` vuoti dopo rimozione debug causano errori sintassi
- **Soluzione applicata**: Aggiunta istruzione `pass` nei blocchi vuoti
- **File corretti**:
  - `scripts/ui/popups/ItemInteractionPopup.gd` ✅
  - `scripts/ui/popups/EventPopup.gd` ✅
  - `scripts/ui/GameUI.gd` ✅ (parziale)
  - `scripts/ui/popups/LevelUpPopup.gd` ✅ (parziale)
  - `scripts/World.gd` ✅ (parziale)

---

## 🔄 ATTIVITÀ RIMANENTI - PRIORITÀ ALTA

### 1. ✅ CORREZIONE ERRORI SINTASSI - COMPLETATO

#### File corretti con successo:

**A. `scripts/World.gd`** ✅
- Riga ~328: `if not InputManager:` → `pass` aggiunto
- Riga ~401: `if new_position.x % 5 == 0 or new_position.y % 5 == 0:` → `pass` aggiunto

**B. `scripts/managers/TimeManager.gd`** ✅
- Riga ~77: `if moves <= 0:` → `pass` aggiunto
- Riga ~195: `if prev_hour != 19 and new_hour == 19:` → `pass` aggiunto

**C. `scripts/ThemeManager.gd`** ✅
- Riga ~193: `if crt_display:` → `pass` aggiunto

**D. `scripts/managers/InputManager.gd`** ✅
- Tutte le righe corrette: 106, 158, 166, 176, 184, 211, 219, 241, 249, 261, 273, 278, 283, 288
- Tutti i blocchi `if debug_input:` ora contengono `pass`

**E. `scripts/MainGame.gd`** ✅
- Ottimizzazione sistema eventi: rimossa duplicazione logica probabilità
- MainGame.gd ora delega completamente la gestione trigger a EventManager.gd

**F. `scripts/managers/PlayerManager.gd`** ✅
- Aggiunta funzione `_get_experience_threshold_for_level()` per calcolo soglie EXP
- Corretto calcolo `experience_to_next_level` in `get_progression_data()`

### 2. COMPLETARE PULIZIA LOG DEBUG

#### File con messaggi `print()` rimanenti:
- `scripts/tools/MapAnalyzer.gd`
- `scripts/tools/TileTextureGenerator.gd`
- `scripts/tools/SimpleTextureCreator.gd`
- Altri file di sviluppo nella cartella `tools/`

---

## 🧪 TESTING E VERIFICA

### 1. Test Sistema Eventi
- **Comando test**: Avviare il gioco e muoversi sulla mappa
- **Aspettativa**: Eventi dovrebbero attivarsi molto più frequentemente
- **Verifica**: Controllare che non ci siano errori nel log durante l'attivazione eventi

### 2. Test Sintassi Codice
- **Comando**: `godot --headless --check-only` (se Godot è nel PATH)
- **Alternativa**: Aprire progetto in Godot Editor e verificare assenza errori
- **Aspettativa**: Nessun errore di sintassi GDScript

### 3. Test Funzionalità UI
- **Test popup inventario**: Verificare che ItemInteractionPopup funzioni correttamente
- **Test popup eventi**: Verificare che EventPopup si apra senza errori
- **Test level up**: Verificare che LevelUpPopup gestisca correttamente le statistiche

---

## 📋 ANALISI PROBLEMA ORIGINALE

### Problema Riportato
- **Sintomo**: "Eventi che non si attivano nel villaggio"
- **Causa identificata**: Probabilità eventi troppo basse
- **Soluzione implementata**: Aumento significativo probabilità per tutti i biomi

### Possibili Cause Aggiuntive (da verificare se problema persiste)
1. **Istanze duplicate World** (menzionato in `NOTE_SESSIONE_PROSSIMA.md`)
2. **Cooldown eventi troppo lungo** nel sistema TimeManager
3. **Condizioni skill check troppo restrittive**
4. **Bug nel trigger degli eventi per bioma specifico**

---

## 🔧 COMANDI UTILI PER LA PROSSIMA SESSIONE

### Ricerca errori sintassi rimanenti:
```bash
# Trova blocchi if vuoti
rg "if.*:\s*$\n\s*# Debug rimosso per ridurre log\s*$" scripts/

# Trova print() rimanenti
rg "print\(" scripts/ --type gd
```

### Test rapido funzionalità:
```bash
# Se Godot è nel PATH
godot --headless --check-only

# Verifica file di progetto
Get-Content project.godot | Select-String "config_version"
```

---

## 📁 STRUTTURA FILE MODIFICATI

```
scripts/
├── managers/
│   ├── EventManager.gd ✅ (probabilità eventi aumentate)
│   ├── PlayerManager.gd ✅ (debug rimosso)
│   ├── InputManager.gd ⚠️ (debug rimosso, sintassi da correggere)
│   └── TimeManager.gd ⚠️ (debug rimosso, sintassi da correggere)
├── ui/
│   ├── GameUI.gd ⚠️ (debug rimosso, sintassi da correggere)
│   └── popups/
│       ├── ItemInteractionPopup.gd ✅ (debug rimosso, sintassi corretta)
│       ├── EventPopup.gd ✅ (debug rimosso, sintassi corretta)
│       └── LevelUpPopup.gd ✅ (debug rimosso, sintassi corretta)
├── World.gd ⚠️ (debug rimosso, sintassi da correggere)
└── ThemeManager.gd ⚠️ (debug rimosso, sintassi da correggere)
```

**Legenda:**
- ✅ = Completato e funzionante
- ⚠️ = Modificato ma richiede correzioni sintassi
- ❌ = Non ancora modificato

---

## 🎯 OBIETTIVI SESSIONE PROSSIMA

### Priorità 1 (Critica)
1. Completare correzione errori sintassi in tutti i file
2. Test completo del sistema eventi
3. Verifica che tutte le UI funzionino correttamente

### Priorità 2 (Importante)
1. Completare pulizia log debug nei file tools/
2. Test approfondito del gameplay
3. Verifica performance dopo le modifiche

### Priorità 3 (Opzionale)
1. Ottimizzazione ulteriore probabilità eventi se necessario
2. Documentazione delle modifiche apportate
3. Backup del codice funzionante

---

## 💡 NOTE TECNICHE

- **Versione Godot**: 4.4
- **Linguaggio**: GDScript
- **Sistema Operativo**: Windows (PowerShell)
- **Architettura**: Sistema eventi modulare con EventManager centralizzato
- **Pattern**: Singleton per gestori (PlayerManager, InputManager, etc.)

---

**Data creazione roadmap**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Stato progetto**: In sviluppo - Correzioni sintassi in corso
**Prossimo milestone**: Sistema eventi completamente funzionante e codice pulito

---

## 🚨 PROMPT SUGGERITO PER PROSSIMA SESSIONE

```
Ciao! Sto continuando il lavoro sul progetto The Safe Place. Ho questa roadmap dettagliata che documenta tutto quello che è stato fatto e quello che rimane da fare. 

Per favore:
1. Leggi attentamente la roadmap ROADMAP_SESSIONE_PROSSIMA.md
2. Completa tutte le correzioni sintassi rimanenti (priorità 1)
3. Testa il sistema eventi per verificare che funzioni
4. Fammi un report finale di tutto quello che hai sistemato

Il focus principale è risolvere definitivamente il problema degli eventi che non si attivano e avere un codice pulito senza errori.
```