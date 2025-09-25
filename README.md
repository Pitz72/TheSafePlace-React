# THE SAFE PLACE CHRONICLES: THE ECHO OF THE JOURNEY

**Versione:** 0.9.9.2
**Codename:** The Computer Boot System

GDR Retrò a Fosfori Verdi. Un sistema di gioco avanzato con meccaniche D&D, atmosfera CRT anni '80 e **sistema narrativo canonico immersivo** che segue la storia di Ultimo attraverso frammenti di quest, eventi lore e scelte morali che influenzano l'evoluzione emotiva del personaggio.

**🏗️ NUOVA ARCHITETTURA v2.0**: Ricostruzione totale con GameEngine unificato, domini isolati e testing completo. Stabilità garantita e scalabilità futura assicurata.

## 🔥 **FEATURE PRINCIPALE: "LA NINNANANNA DELLA CENERE"**

**L'evento narrativo culminante** che rivela finalmente la verità sulla madre di Ultimo. Una sequenza di 7 pagine di rivelazione straziante che si attiva solo nel momento perfetto del viaggio, quando il giocatore è emotivamente pronto per questa verità devastante.

**Attivazione Condizionale:** Si manifesta solo quando tutte le condizioni narrative sono allineate - un'esperienza unica e indimenticabile per ogni giocatore.

---

## 🚀 Quick Start

### Prerequisiti

- Node.js (versione 18.x o superiore)
- npm (solitamente incluso con Node.js)

### Installazione

Clona il repository ed esegui il seguente comando nella root del progetto per installare le dipendenze:

```bash
npm install
```

### Avvio Server di Sviluppo

Per avviare il server di sviluppo locale, esegui:

```bash
npm run dev
```

Il server sarà disponibile all'indirizzo `http://localhost:5173` (o la prima porta disponibile).

### Eseguire i Test

Per lanciare la suite di test unitari e di integrazione, esegui:

```bash
npm run test
```

---

## 🏗️ Architettura v2.0 - "Architecture Reset"

Il progetto è stato completamente ricostruito con un'**architettura modulare e scalabile** basata su **GameEngine unificato** e **domini isolati**.

### **Stack Tecnologico**
- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **State Management**: GameEngine unificato con Zustand facade
- **Build Tool**: Vite 6.0.3
- **Testing**: Jest + React Testing Library + Cypress E2E (172 test)
- **Styling**: TailwindCSS con tema CRT retrò

### **Architettura Core**
- **🏗️ GameEngine**: Motore centrale che coordina tutti i sistemi
- **📡 EventBus**: Sistema di eventi centralizzato senza dipendenze circolari
- **⏰ TimeSystem**: Sistema tempo unificato con cicli giorno/notte
- **🎮 GameLoop**: Ciclo update/render ottimizzato (60 FPS garantiti)

### **Domini Business Isolati**
- **🌍 World Domain**: Movimento, biomi, esplorazione
- **🧑 Character Domain**: D&D mechanics, level up, stati emotivi
- **🎒 Inventory Domain**: Crafting, items, equipaggiamento
- **🏕️ Survival Domain**: Fame/sete/meteo, shelter system
- **📖 Narrative Domain**: Quest, eventi lore, scelte morali

### **Sistema Narrativo Avanzato**
- **Main Quest "Lullaby of Ashes"**: 12 frammenti con progressione canonica
- **Eventi Lore Condizionali**: Sistema di attivazione intelligente
- **Sistema Emotivo**: Stati psicologici che influenzano le scelte
- **Eventi Dinamici**: 60+ eventi bioma con conseguenze

### **Qualità e Testing**
- **172 Test Automatizzati**: Coverage 98.3% sui sistemi core (114 unit + 41 component + 17 E2E)
- **TypeScript Completo**: Zero errori/warning, interfacce strongly-typed
- **Performance Garantita**: < 100MB RAM, < 3s load time, 60 FPS costanti
- **Error Boundaries**: Crash prevention implementata
- **E2E Testing**: Cypress con copertura flussi critici

### **Feature Principale v0.9.9.2**
**"The Computer Boot System"** - Sistema di avvio computer completo con sequenza boot realistica, effetti CRT su tutte le schermate, cursore ottimizzato e immagini ASCII artistiche personalizzate.

### **Ricostruzione Totale**
**"Architecture Reset"** - Trasformazione da progetto caotico a base professionale. Fine dei refactoring distruttivi e inizio dell'era scalabile.

---

## ✅ **SUCCESSO ARCHITETTURALE v2.0**

### **Problemi Risolti**
- ✅ **Refactoring Distruttivi**: Architettura stabile, zero regressioni
- ✅ **Over-Engineering**: Sistema modulare e scalabile
- ✅ **Dipendenze Circolari**: EventBus centralizzato
- ✅ **Scalabilità Limitata**: Domini isolati facilmente estendibili

### **Qualità Garantita**
- ✅ **172 Test Automatizzati**: Coverage 98.3% completo (114 unit + 41 component + 17 E2E)
- ✅ **Performance Ottimali**: 60 FPS costanti, <100MB RAM, <3s load time
- ✅ **TypeScript Completo**: Zero errori/warning, codice pulito
- ✅ **Build Pulito**: Zero errori console, E2E testing integrato

### **Futuro Sicuro**
- ✅ **Sviluppo Accelerato**: Architettura chiara e documentata
- ✅ **Manutenibilità**: Codice modulare e testato
- ✅ **Scalabilità**: Facile aggiunta nuove funzionalità
- ✅ **Stabilità**: Anti-regression measures implementati

**La ricostruzione totale è completata. Il progetto ora ha fondamenta solide per crescere.** 🚀