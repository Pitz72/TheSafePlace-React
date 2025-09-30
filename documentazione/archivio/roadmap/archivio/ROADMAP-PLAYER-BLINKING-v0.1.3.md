# ROADMAP PLAYER BLINKING & DYNAMIC INFO v0.1.3

## 🎯 OBIETTIVI

### 1. Animazione Blinking Player
- **STATO**: ✅ COMPLETATO
- **DESCRIZIONE**: Sostituire animazione `pulse` del player `@` con blinking (fade in/out)
- **PATTERN**: Simile a cursore PC anni 70/80
- **TIMING**: 1.2s ciclo completo

### 2. Informazioni Dinamiche
- **STATO**: ✅ COMPLETATO  
- **DESCRIZIONE**: Aggiornare sezione INFORMAZIONI con dati real-time
- **CAMPI**: Posizione (coordinate) e Luogo (tipo tile)

## 📋 PIANO IMPLEMENTAZIONE

### FASE 1: Animazione Blinking Player
**PRIORITÀ**: ALTA
**TEMPO STIMATO**: 15 minuti

#### Step 1.1: Creazione CSS Keyframe
- **FILE**: `src/index.css`
- **AZIONE**: Aggiungere keyframe `player-blink`
- **CODICE**:
```css
@keyframes player-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

#### Step 1.2: Modifica Player Component
- **FILE**: `src/components/Player.tsx`
- **AZIONE**: Sostituire `player-pulse` con `player-blink`
- **LINEA**: ~25 (style animation)

#### Step 1.3: Test Visivo
- **VERIFICA**: Animazione blinking funzionante
- **CONTROLLO**: Nessun conflitto con effetti CRT

### FASE 2: Informazioni Dinamiche
**PRIORITÀ**: MEDIA
**TEMPO STIMATO**: 20 minuti

#### Step 2.1: Mappatura Tile Types
- **FUNZIONE**: `getTileDescription(char: string)`
- **MAPPATURA**:
  - `.` → "Pianura"
  - `~` → "Acqua"
  - `C` → "Città"
  - `F` → "Foresta"
  - `M` → "Montagna"
  - `V` → "Villaggio"
  - `R` → "Risorsa"
  - `S` → "Start"
  - `E` → "End"

#### Step 2.2: Aggiornamento App.tsx
- **FILE**: `src/App.tsx`
- **LINEE**: 169-171 (sezione INFORMAZIONI)
- **SOSTITUZIONI**:
  - Posizione: `({playerPosition.x}, {playerPosition.y})`
  - Luogo: `{getTileDescription(currentTile)}`

#### Step 2.3: Integrazione Context
- **HOOK**: `useGameContext()`
- **DATI**: `playerPosition`, `mapData`
- **CALCOLO**: Tile corrente da coordinate

## 🔧 DETTAGLI TECNICI

### Dipendenze
- ✅ `useGameContext` disponibile
- ✅ `playerPosition` nel context
- ✅ `mapData` nel context
- ✅ Pattern blinking esistente (S/E)

### File Coinvolti
1. `src/index.css` - Keyframe animazione
2. `src/components/Player.tsx` - Applicazione animazione
3. `src/App.tsx` - Informazioni dinamiche
4. `src/contexts/GameContext.tsx` - Dati player/mappa

### Rischi
- 🟡 **BASSO**: Conflitto animazioni CSS
- 🟢 **NULLO**: Impatto performance
- 🟢 **NULLO**: Regressione funzionalità

## 📊 STATO AVANZAMENTO

### ✅ COMPLETATO
- [x] Step 1.1: CSS Keyframe - Aggiunto @keyframes player-blink
- [x] Step 1.2: Player Component - Sostituito player-pulse con player-blink (1.2s)
- [x] Step 1.3: Test Blinking - Animazione funzionante, nessun errore
- [x] Step 2.1: Tile Mapping - Funzione getTileDescription implementata
- [x] Step 2.2: App.tsx Update - Informazioni dinamiche attive
- [x] Step 2.3: Context Integration - playerPosition e mapData integrati

### 🔄 IN CORSO
- [ ] Nessuno

### ⏳ DA FARE
- [ ] Nessuno

## 🎯 CRITERI SUCCESSO

1. **Animazione Blinking**:
   - Player `@` lampeggia con fade in/out
   - Timing 1.2s ciclo completo
   - Nessun conflitto con CRT effects

2. **Informazioni Dinamiche**:
   - Posizione aggiornata in real-time
   - Luogo corretto basato su tile
   - Nessun errore console

## 📝 NOTE

- **Politica Piccoli Passi**: Implementazione incrementale con test ad ogni step
- **Backup**: Già presente `backup-TSP-2025-07-23-1715-BLINKING-ANIMATION`
- **Rollback**: Possibile tramite backup in caso di problemi
- **Documentazione**: Aggiornamento roadmap ad ogni completamento step

---

**VERSIONE**: v0.1.3  
**DATA CREAZIONE**: 2025-01-20  
**ULTIMA MODIFICA**: 2025-01-20  
**STATO GENERALE**: ✅ COMPLETATO - TUTTE LE FASI IMPLEMENTATE