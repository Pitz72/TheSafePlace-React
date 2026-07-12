# 📊 Diagrammi Architetturali - The Safe Place

Questa cartella contiene i diagrammi architetturali del progetto "The Safe Place", creati per visualizzare le relazioni tra componenti, il flusso di dati e l'architettura generale del sistema.

## 📁 Contenuto Diagrammi

### 🏗️ `architecture_overview.svg`
**Panoramica Architetturale Generale**
- Visualizzazione dell'architettura completa del sistema
- Singleton Managers e loro interconnessioni
- Layer architetturali (Data, World, UI, Game Loop)
- Metriche di performance e dipendenze

**Quando usarlo:**
- Onboarding di nuovi sviluppatori
- Revisioni architetturali
- Documentazione per stakeholder tecnici

### 🔗 `manager_dependencies.svg`
**Mappa delle Dipendenze tra Manager**
- Dipendenze forti (chiamate dirette)
- Comunicazione tramite segnali
- Dipendenze deboli (opzionali)
- Ordine di inizializzazione degli Autoload

**Quando usarlo:**
- Debug di problemi di inizializzazione
- Refactoring di manager esistenti
- Analisi dell'impatto delle modifiche

### 🎮 `game_flow.svg`
**Diagramma di Flusso del Gioco**
- Stati di gioco e transizioni
- Game loop e ciclo di vita
- Condizioni di vittoria/sconfitta
- Performance targets per stato

**Quando usarlo:**
- Design di nuove funzionalità
- Debug di problemi di stato
- Ottimizzazione del game loop

### 📊 `data_flow.svg`
**Flusso dei Dati nel Sistema**
- Sorgenti dati (JSON, input, eventi)
- Processori (Manager)
- Stato centrale (PlayerState)
- Output (UI, audio, persistenza)

**Quando usarlo:**
- Ottimizzazione delle performance
- Debug di problemi di sincronizzazione
- Analisi del carico dati

## 🎯 Utilizzo dei Diagrammi

### Per Sviluppatori
1. **Nuovi Feature**: Consulta `game_flow.svg` per capire dove inserire nuovi stati
2. **Bug Fixing**: Usa `manager_dependencies.svg` per tracciare le dipendenze
3. **Performance**: Analizza `data_flow.svg` per identificare bottleneck

### Per Game Designer
1. **Meccaniche**: `game_flow.svg` mostra come le meccaniche si integrano
2. **Bilanciamento**: `data_flow.svg` aiuta a capire l'impatto delle modifiche
3. **UX**: `architecture_overview.svg` mostra l'interazione tra sistemi

### Per DevOps/QA
1. **Testing**: I diagrammi mostrano i punti critici da testare
2. **Monitoring**: Identifica i componenti da monitorare in produzione
3. **Deployment**: Comprendi le dipendenze per il deployment

## 🔧 Manutenzione Diagrammi

### Quando Aggiornare
- ✅ Aggiunta di nuovi Manager
- ✅ Modifica delle dipendenze tra componenti
- ✅ Cambiamenti nel game flow
- ✅ Ottimizzazioni architetturali significative

### Come Aggiornare
1. **Modifica SVG**: I diagrammi sono in formato SVG per facilità di editing
2. **Mantieni Consistenza**: Usa gli stessi colori e stili
3. **Aggiorna Metriche**: Mantieni aggiornate le performance metrics
4. **Documenta Cambiamenti**: Aggiorna questo README se necessario

## 📈 Metriche di Performance

### Target Architetturali
- **Inizializzazione Manager**: < 100ms totale
- **Dipendenze Circolari**: 0 (verificato tramite diagrammi)
- **Accoppiamento**: Minimizzato tramite pattern Signal
- **Coesione**: Massimizzata per singolo Manager

### Monitoraggio
- **Memory Usage**: ~50MB runtime
- **Signal Propagation**: < 0.1ms
- **State Transitions**: < 100ms
- **Data Loading**: ~50ms (cached)

## 🔍 Strumenti Consigliati

### Visualizzazione
- **Browser**: Tutti i diagrammi sono SVG, visualizzabili in qualsiasi browser
- **VS Code**: Estensione SVG Preview per editing inline
- **Inkscape**: Per modifiche avanzate ai diagrammi

### Analisi
- **Godot Profiler**: Per verificare le metriche mostrate nei diagrammi
- **Godot Remote Debugger**: Per analizzare il flusso in runtime
- **Git History**: Per tracciare l'evoluzione dell'architettura

## 📚 Riferimenti

- **Documentazione Tecnica**: `/Progetto/35_API_REFERENCE.md`
- **Architettura**: `/Progetto/01_ARCHITETTURA_SISTEMA.md`
- **Performance**: `/Progetto/17_PERFORMANCE_CONSIDERATIONS.md`
- **Indice Globale**: `/DOCUMENTATION_INDEX.md`

---

**Versione**: v1.0  
**Ultimo Aggiornamento**: Dicembre 2024  
**Compatibilità**: Godot 4.x, The Safe Place v0.9.7+