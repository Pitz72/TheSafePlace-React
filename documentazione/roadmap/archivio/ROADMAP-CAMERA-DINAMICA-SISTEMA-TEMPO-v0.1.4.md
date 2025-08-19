# ROADMAP: Camera Dinamica e Sistema Tempo v0.1.4

**Data di Creazione**: 20 gennaio 2025  
**Versione Target**: v0.1.4 "The Blue Hour"  
**Stato**: ✅ COMPLETATO E CONSOLIDATO  
**Priorità**: ALTA - Evoluzione Core Gameplay

---

## 🎯 OBIETTIVO GENERALE

Implementare una **camera intelligente** che segue dinamicamente il player e un **sistema temporale** che traccia ore e giorni con ciclo giorno/notte visibile, trasformando "The Safe Place" da esperienza statica a mondo dinamico e reattivo.

---

## 📊 ANALISI FATTIBILITÀ

### ✅ PUNTI DI FORZA ARCHITETTURA ATTUALE

#### Sistema Esistente Solido
- **MapViewport.tsx**: Già implementa viewport virtualization con scroll programmato
- **GameContext**: Gestisce stato centralizzato con `playerPosition` e `mapData`
- **usePlayerMovement**: Hook robusto per movimento con validazione terreno
- **Coordinate System**: Sistema coordinate (x, y) già funzionante
- **Performance**: Rendering ottimizzato con viewport virtualization

#### Componenti Riutilizzabili
- **CHAR_WIDTH/CHAR_HEIGHT**: Costanti pixel già definite (25.6px, 38.4px)
- **Viewport Dimensions**: Sistema dinamico per dimensioni viewport
- **Tile Validation**: Logica movimento e terreno già implementata
- **State Management**: Pattern React Context consolidato

### ⚠️ SFIDE TECNICHE IDENTIFICATE

#### Camera Dinamica
- **Integrazione Scroll**: MapViewport ha scroll statico, serve dinamicizzazione
- **Clamping Logic**: Implementare logica bordi per evitare aree vuote
- **Performance**: Mantenere 60fps con aggiornamenti camera continui
- **Smooth Transitions**: Evitare scatti durante movimento

#### Sistema Tempo
- **State Persistence**: Tempo deve persistere tra sessioni
- **Movement Integration**: Collegare avanzamento tempo a movimento riuscito
- **UI Updates**: Aggiornare interfaccia senza impatto performance
- **Day/Night Cycle**: Implementare stili condizionali per ciclo

### 🔍 COMPLESSITÀ STIMATA

- **Camera Dinamica**: **MEDIA** (3-4 ore implementazione)
- **Sistema Tempo**: **BASSA** (2-3 ore implementazione)
- **Integrazione**: **MEDIA** (2 ore testing e ottimizzazione)
- **Documentazione**: **BASSA** (1 ora)

**TOTALE STIMATO**: 8-10 ore di sviluppo

---

## 🗺️ ROADMAP IMPLEMENTAZIONE

### **FASE 1: Camera Intelligente Player-Centric** 🎥

**Obiettivo**: Implementare camera che centra dinamicamente il player con logica di clamping ai bordi.

#### **Step 1.1: Estensione GameContext per Camera State**
- **File**: `src/contexts/GameContext.tsx`
- **Modifiche**:
  - Aggiungere `cameraPosition: { x: number; y: number }` al GameState
  - Implementare `updateCameraPosition()` function
  - Aggiungere logica di calcolo camera centrata su player
  - Implementare clamping logic per bordi mappa

```typescript
// Logica di implementazione
const calculateCameraPosition = (playerPos: {x: number, y: number}, viewportSize: {width: number, height: number}) => {
  // Centro ideale
  const idealScrollX = (playerPos.x * CHAR_WIDTH) - (viewportSize.width / 2);
  const idealScrollY = (playerPos.y * CHAR_HEIGHT) - (viewportSize.height / 2);
  
  // Clamping ai bordi
  const maxScrollX = (MAP_WIDTH * CHAR_WIDTH) - viewportSize.width;
  const maxScrollY = (MAP_HEIGHT * CHAR_HEIGHT) - viewportSize.height;
  
  return {
    x: Math.max(0, Math.min(idealScrollX, maxScrollX)),
    y: Math.max(0, Math.min(idealScrollY, maxScrollY))
  };
};
```

#### **Step 1.2: Modifica MapViewport per Camera Dinamica**
- **File**: `src/components/MapViewport.tsx`
- **Modifiche**:
  - Rimuovere stati locali `scrollX` e `scrollY`
  - Integrare `cameraPosition` da GameContext
  - Aggiornare calcoli viewport virtualization
  - Implementare smooth camera transitions (opzionale)

#### **Step 1.3: Integrazione Movement-Camera**
- **File**: `src/hooks/usePlayerMovement.ts`
- **Modifiche**:
  - Chiamare `updateCameraPosition()` dopo movimento riuscito
  - Passare dimensioni viewport per calcolo clamping
  - Mantenere performance con debouncing se necessario

#### **Step 1.4: Testing Camera System**
- **Validazioni**:
  - Player sempre centrato (quando possibile)
  - Nessuna area vuota visibile ai bordi
  - Performance mantenute (60fps)
  - Smooth transitions durante movimento

---

### **FASE 2: Sistema Tempo e Ciclo Giorno/Notte** ⏰

**Obiettivo**: Implementare sistema temporale che avanza con movimento e ciclo giorno/notte visibile.

#### **Step 2.1: Estensione GameContext per Time State**
- **File**: `src/contexts/GameContext.tsx`
- **Modifiche**:
  - Aggiungere `totalMinutesElapsed: number` (iniziale: 360 = 6:00 AM)
  - Implementare `advanceTime(minutes: number)` function
  - Creare `calculateGameTime()` helper function
  - Aggiungere `getCurrentTimeInfo()` per UI

```typescript
// Helper function per calcolo tempo
const calculateGameTime = (totalMinutes: number) => {
  const day = Math.floor(totalMinutes / 1440) + 1; // 1440 min = 1 giorno
  const hour = Math.floor((totalMinutes % 1440) / 60);
  const minute = totalMinutes % 60;
  const isNight = hour < 6 || hour >= 20; // Notte: 20:00-06:00
  
  return { day, hour, minute, isNight };
};
```

#### **Step 2.2: Integrazione Movement-Time**
- **File**: `src/hooks/usePlayerMovement.ts`
- **Modifiche**:
  - Chiamare `advanceTime(30)` dopo movimento riuscito
  - Escludere avanzamento tempo per movimenti bloccati
  - Mantenere logica esistente per fiumi e terreni

#### **Step 2.3: Aggiornamento UI Informazioni**
- **File**: `src/App.tsx`
- **Modifiche**:
  - Integrare `getCurrentTimeInfo()` da GameContext
  - Aggiornare sezione INFORMAZIONI con:
    - Giorno: "Giorno {day}"
    - Ora: "{hour:02d}:{minute:02d}" con stile condizionale
  - Implementare stile notturno (text-blue-400 o custom)

```typescript
// Esempio implementazione UI
const timeInfo = getCurrentTimeInfo();
const timeStyle = timeInfo.isNight ? 'text-blue-400' : 'text-phosphor-primary';

<div className="info-row">
  <span>Giorno:</span>
  <span>Giorno {timeInfo.day}</span>
</div>
<div className="info-row">
  <span>Ora:</span>
  <span className={timeStyle}>
    {timeInfo.hour.toString().padStart(2, '0')}:{timeInfo.minute.toString().padStart(2, '0')}
  </span>
</div>
```

#### **Step 2.4: Testing Sistema Tempo**
- **Validazioni**:
  - Tempo avanza di 30 min per movimento riuscito
  - Giorni scattano correttamente a mezzanotte
  - Ciclo giorno/notte visibile nell'UI
  - Nessun avanzamento per movimenti bloccati

---

### **FASE 3: Integrazione e Ottimizzazione** 🔧

#### **Step 3.1: Performance Optimization**
- Verificare impatto performance camera dinamica
- Ottimizzare re-rendering con useMemo/useCallback
- Implementare debouncing se necessario
- Validare 60fps mantenuti

#### **Step 3.2: Edge Cases Handling**
- Gestire resize viewport durante gioco
- Validare comportamento ai bordi mappa
- Testare con diverse risoluzioni
- Verificare compatibilità mobile

#### **Step 3.3: User Experience Polish**
- Smooth camera transitions (se performance permettono)
- Feedback visivo per ciclo giorno/notte
- Possibili effetti aggiuntivi per ore notturne
- Validazione accessibilità

---

## 🎯 CRITERI DI SUCCESSO

### Camera Dinamica ✅
1. **Player Centering**: Player sempre al centro viewport (quando possibile)
2. **Border Clamping**: Nessuna area vuota visibile ai bordi mappa
3. **Smooth Movement**: Transizioni fluide senza scatti
4. **Performance**: Mantenimento 60fps durante movimento
5. **Responsive**: Funziona con diverse dimensioni viewport

### Sistema Tempo ✅
1. **Time Advancement**: +30 min per movimento riuscito
2. **Day Cycling**: Giorni scattano correttamente a mezzanotte
3. **UI Integration**: Tempo visibile in sezione INFORMAZIONI
4. **Day/Night Cycle**: Stile condizionale per ore notturne
5. **Movement Integration**: Solo movimenti validi avanzano tempo

### Integrazione ✅
1. **No Conflicts**: Nessun conflitto con funzionalità esistenti
2. **Performance**: Nessun impatto negativo su rendering
3. **State Consistency**: Stato coerente tra componenti
4. **Error Handling**: Gestione robusta di edge cases
5. **Backward Compatibility**: Compatibilità con versioni precedenti

---

## 🛡️ CONSIDERAZIONI SICUREZZA

### Protezioni Anti-Regressione
- **File Critici**: MapViewport.tsx, GameContext.tsx, usePlayerMovement.ts
- **Funzionalità Protette**: Sistema movimento esistente, viewport virtualization
- **Test Obbligatori**: Movimento player, rendering mappa, performance

### Backup Strategy
- Backup completo prima di iniziare implementazione
- Commit incrementali per ogni step completato
- Rollback plan per ogni fase

---

## 📈 IMPATTO STIMATO

### Performance
- **CPU**: +5-10% per calcoli camera dinamica
- **Memoria**: +0.5KB per state aggiuntivo
- **Rendering**: Nessun impatto significativo
- **User Experience**: Miglioramento sostanziale

### Codebase
- **Linee Codice**: +150-200 linee
- **File Modificati**: 4 file principali
- **Complessità**: Incremento moderato
- **Manutenibilità**: Migliorata con pattern consolidati

---

## 🚀 ROADMAP FUTURA

### Post v0.1.4 Enhancements
- **Smooth Camera Easing**: Transizioni animate per camera
- **Time Persistence**: Salvataggio tempo tra sessioni
- **Weather System**: Sistema meteo basato su tempo
- **Dynamic Lighting**: Illuminazione dinamica giorno/notte
- **Time-based Events**: Eventi basati su orario

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### Pre-Implementation
- [ ] Backup completo progetto
- [ ] Review architettura attuale
- [ ] Setup ambiente di testing
- [ ] Definizione metriche performance

### Fase 1: Camera Dinamica ✅ COMPLETATA
- [x] Step 1.1: GameContext camera state ✅ COMPLETATO
- [x] Step 1.2: MapViewport integration ✅ COMPLETATO
- [x] Step 1.3: Movement-camera integration ✅ COMPLETATO
- [x] Step 1.4: Testing camera system ✅ COMPLETATO

### Fase 2: Sistema Tempo ✅ COMPLETATA
- [x] Step 2.1: GameContext time state ✅ COMPLETATO
- [x] Step 2.2: Movement-time integration ✅ COMPLETATO
- [x] Step 2.3: UI informazioni update ✅ COMPLETATO
- [x] Step 2.4: Testing sistema tempo ✅ COMPLETATO

### Fase 3: Integrazione ✅ COMPLETATA
- [x] Step 3.1: Performance optimization ✅ COMPLETATO
- [x] Step 3.2: Edge cases handling ✅ COMPLETATO
- [x] Step 3.3: UX polish ✅ COMPLETATO
- [x] Step 3.4: Final testing and validation ✅ COMPLETATO

### Post-Implementation
- [ ] Testing completo su multiple risoluzioni
- [ ] Validazione criteri di successo
- [ ] Documentazione aggiornata
- [ ] Anti-regressione implementato
- [ ] Changelog creato

---

**VERSIONE**: v0.1.4  
**DATA CREAZIONE**: 2025-01-20  
**ULTIMA MODIFICA**: 2025-01-20  
**STATO**: ✅ IMPLEMENTAZIONE COMPLETATA  
**TEAM**: Sviluppo TSP  
**APPROVAZIONE**: Richiesta Operatore Umano

---

**⚡ CONCLUSIONE ANALISI FATTIBILITÀ**: La roadmap è **TECNICAMENTE FATTIBILE** con l'architettura attuale. L'implementazione richiede modifiche moderate a componenti esistenti senza stravolgimenti architetturali. Il rischio è **BASSO-MEDIO** e i benefici per l'esperienza utente sono **ALTI**.