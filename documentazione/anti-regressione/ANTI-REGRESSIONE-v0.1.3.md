# ANTI-REGRESSIONE v0.1.3 "Coordinate"

**Data di Creazione**: 20 gennaio 2025  
**Versione Protetta**: v0.1.3  
**Nome in Codice**: "Coordinate"  
**Stato**: 🛡️ ATTIVO E IMMUTABILE

---

## 🚨 DICHIARAZIONE DI IMMUTABILITÀ

**QUESTA È UNA SOLUZIONE IMMUTABILE E DEFINITIVA**

La versione v0.1.3 "Coordinate" introduce funzionalità critiche per l'esperienza utente che **NON DEVONO MAI ESSERE MODIFICATE** senza seguire rigorosamente le procedure di sicurezza definite in questo documento.

**QUALSIASI MODIFICA NON AUTORIZZATA COMPORTERÀ REGRESSIONE IMMEDIATA.**

---

## 🛡️ FILE E SEZIONI PROTETTE

### PROTEZIONE LIVELLO 1 - CRITICA (Ereditata)

#### `src/index.css`
- **Sezioni Protette**:
  - Variabili CSS root (righe 7-85)
  - Game Container System (righe 110-150)
  - CRT Effects (righe 200-350)
  - **NUOVO**: Keyframe `@keyframes player-blink` (righe 215-218)
- **Motivo**: Fondamentale per rendering e nuova animazione player
- **Rischio Modifica**: CRITICO - Rottura completa interfaccia

#### `src/hooks/useGameScale.ts`
- **Sezioni Protette**: Intero file
- **Motivo**: Sistema di scaling viewport
- **Rischio Modifica**: CRITICO - Perdita adattamento schermo

### PROTEZIONE LIVELLO 2 - ALTA (Nuova)

#### `src/components/Player.tsx`
- **Sezioni Protette**:
  - Animazione blinking (riga 40): `animation: 'player-blink 1.2s ease-in-out infinite'`
  - Configurazione rendering (righe 15-20)
  - Calcolo posizione assoluta (righe 22-23)
- **Motivo**: Animazione player e posizionamento accurato
- **Rischio Modifica**: ALTO - Perdita animazione e posizionamento

#### `src/App.tsx`
- **Sezioni Protette**:
  - Funzione `getTileDescription()` (righe 10-22)
  - Funzione `getCurrentTile()` (righe 44-54)
  - Integrazione GameContext (riga 35)
  - Sezione INFORMAZIONI dinamiche (righe 207-209)
- **Motivo**: Sistema informazioni dinamiche e mappatura tile
- **Rischio Modifica**: ALTO - Perdita informazioni real-time

### PROTEZIONE LIVELLO 3 - MEDIA

#### `src/contexts/GameContext.tsx`
- **Sezioni Protette**:
  - Interface GameState (righe 3-12)
  - Hook useGameContext (righe 85-92)
  - State playerPosition e mapData
- **Motivo**: Dati essenziali per informazioni dinamiche
- **Rischio Modifica**: MEDIO - Perdita sincronizzazione dati

---

## ❌ DIVIETI ASSOLUTI

### 1. ANIMAZIONE PLAYER
- ❌ **VIETATO**: Modificare keyframe `player-blink`
- ❌ **VIETATO**: Cambiare timing da 1.2s
- ❌ **VIETATO**: Sostituire con altre animazioni
- ❌ **VIETATO**: Rimuovere fade in/out pattern

### 2. INFORMAZIONI DINAMICHE
- ❌ **VIETATO**: Modificare mappatura tile in `getTileDescription()`
- ❌ **VIETATO**: Alterare logica `getCurrentTile()`
- ❌ **VIETATO**: Rimuovere integrazione GameContext
- ❌ **VIETATO**: Hardcodare valori posizione/luogo

### 3. COMPATIBILITÀ CRT
- ❌ **VIETATO**: Modificare effetti CRT esistenti
- ❌ **VIETATO**: Introdurre conflitti con animazioni
- ❌ **VIETATO**: Alterare z-index o layering

### 4. PERFORMANCE
- ❌ **VIETATO**: Aggiungere animazioni pesanti
- ❌ **VIETATO**: Calcoli complessi in render loop
- ❌ **VIETATO**: Polling eccessivo per dati dinamici

---

## ✅ OBBLIGHI PRIMA DI QUALSIASI MODIFICA

### 1. BACKUP OBBLIGATORIO
```bash
# Creare backup completo prima di modifiche
cp -r TSP TSP-backup-$(date +%Y%m%d-%H%M%S)
```

### 2. ANALISI IMPATTO
- [ ] Verificare dipendenze tra componenti
- [ ] Analizzare effetti su animazioni esistenti
- [ ] Controllare compatibilità GameContext
- [ ] Testare su multiple risoluzioni

### 3. TEST PRELIMINARI
- [ ] Build di prova senza errori
- [ ] Verifica animazione blinking funzionante
- [ ] Test informazioni dinamiche accurate
- [ ] Controllo effetti CRT intatti

### 4. APPROVAZIONE
- [ ] Consenso Operatore Umano
- [ ] Revisione codice completa
- [ ] Documentazione modifiche
- [ ] Piano di rollback definito

---

## 🧪 TEST DI VERIFICA OBBLIGATORI

### TEST 1: Animazione Player Blinking
```typescript
// Verifica animazione attiva
const playerElement = document.querySelector('[style*="player-blink"]');
expect(playerElement).toBeTruthy();
expect(playerElement.style.animation).toContain('1.2s');
```

### TEST 2: Informazioni Dinamiche
```typescript
// Verifica aggiornamento posizione
const positionElement = document.querySelector('[data-testid="player-position"]');
expect(positionElement.textContent).toMatch(/\(\d+, \d+\)/);

// Verifica mappatura luogo
const locationElement = document.querySelector('[data-testid="player-location"]');
expected(locationElement.textContent).not.toBe('Sconosciuto');
```

### TEST 3: Compatibilità CRT
```typescript
// Verifica effetti CRT attivi
const crtElements = document.querySelectorAll('.crt-noise, .crt-gradient-overlay');
expect(crtElements.length).toBe(2);
```

### TEST 4: Performance
```typescript
// Verifica FPS stabile
const fps = performanceMonitor.getCurrentFPS();
expect(fps).toBeGreaterThan(55);
```

---

## 🚨 PROCEDURA DI EMERGENZA

### IN CASO DI REGRESSIONE RILEVATA:

#### STEP 1: STOP IMMEDIATO
```bash
# Fermare server di sviluppo
Ctrl+C
```

#### STEP 2: ROLLBACK AUTOMATICO
```bash
# Ripristinare backup più recente
cp -r TSP-backup-YYYYMMDD-HHMMSS/* .
```

#### STEP 3: VERIFICA RIPRISTINO
```bash
# Test build
npm run build

# Avvio server
npm run dev
```

#### STEP 4: VALIDAZIONE
- [ ] Animazione blinking funzionante
- [ ] Informazioni dinamiche accurate
- [ ] Effetti CRT intatti
- [ ] Nessun errore console

#### STEP 5: DOCUMENTAZIONE INCIDENTE
- Creare file `INCIDENTE-REGRESSIONE-v0.1.3-[DATA].md`
- Documentare causa, impatto e soluzione
- Aggiornare procedure anti-regressione

---

## 📊 METRICHE DI CONTROLLO

### Soglie di Allarme
- **FPS**: < 55 fps
- **Errori Console**: > 0
- **Tempo Caricamento**: > 3 secondi
- **Memoria**: > 100MB

### Indicatori di Salute
- ✅ **Animazione Blinking**: Visibile e fluida
- ✅ **Posizione Real-time**: Aggiornata al movimento
- ✅ **Luogo Dinamico**: Corrispondente al tile
- ✅ **Effetti CRT**: Attivi e stabili

---

## 📝 LOG DELLE PROTEZIONI

### v0.1.3 - 20/01/2025
- ✅ Protezione animazione player blinking
- ✅ Protezione informazioni dinamiche
- ✅ Protezione mappatura tile
- ✅ Protezione integrazione GameContext
- ✅ Test di verifica implementati
- ✅ Procedura di emergenza definita

---

## ⚖️ RESPONSABILITÀ

### Operatore Umano
- Approvazione modifiche critiche
- Supervisione test di verifica
- Decisioni di rollback

### LLM Assistant
- Implementazione protezioni
- Esecuzione test automatici
- Monitoraggio continuo

### Sistema Automatico
- Alert su soglie superate
- Backup automatici
- Validazione build

---

**VERSIONE**: v0.1.3  
**DATA CREAZIONE**: 2025-01-20  
**ULTIMA MODIFICA**: 2025-01-20  
**STATO**: 🛡️ ATTIVO E IMMUTABILE  
**LIVELLO PROTEZIONE**: CRITICO
**VALIDITÀ**: PERMANENTE FINO A NUOVA VERSIONE

---

**⚠️ ATTENZIONE: QUESTO DOCUMENTO È PARTE INTEGRANTE DELLA SICUREZZA DEL PROGETTO. LA SUA MODIFICA O RIMOZIONE È SEVERAMENTE VIETATA.**