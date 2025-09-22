# 🎯 **PROMPT COMPLETO - RICOSTRUZIONE TOTALE THE SAFE PLACE v2.0**
# **"ARCHITECTURE RESET" - Sessione LLM Guidata**

**Data Creazione**: 22 Settembre 2025
**Target LLM**: Kilo Code o equivalente
**Obiettivo**: Ricostruzione totale del progetto con architettura v2.0
**Durata Stimata**: 12 settimane di sviluppo guidato

---

## **📋 CONTEXTO COMPLETO DEL PROGETTO**

### **Stato Attuale del Progetto**
- **Versione Corrente**: The Safe Place v0.9.8.1 "Fix and Fix"
- **Tecnologie**: React 18.3.1, TypeScript 5.8.3, Zustand 5.0.1, Vite 6.0.3
- **Architettura Problemi**:
  - Sistema state management over-engineered con multi-store caotico
  - Dipendenze circolari tra stores specializzati
  - Refactoring costanti che hanno creato instabilità
  - Sistema tempo duplicato e fragile
  - Codice difficile da testare e mantenere

### **Contenuti Esistenti da Preservare**
- **Database Ricchi**: 57+ items, 60+ eventi, narrativa complessa
- **Sistema Narrativo**: Main quest "Lullaby of Ashes" con 12 frammenti
- **Eventi Bioma**: Sistemi complessi per pianure, foreste, città, villaggi, fiumi
- **Items System**: Armi, armature, consumabili, crafting materials bilanciati
- **UI/UX**: Interfaccia CRT funzionante con navigazione keyboard-only

### **Problemi Strutturali Documentati**
1. **Over-Engineering**: Sistema stores troppo granulare
2. **Dipendenze Circolari**: Coupling tra domini che causa instabilità
3. **Refactoring Distruttivi**: "Aggiusti una cosa, ne rompi un'altra"
4. **Mancanza Architettura Pianificata**: Design emergente caotico

---

## **🎯 STRATEGIA DI RICOSTRUZIONE DECISA**

### **Approccio Scelto: Smantellamento e Ristrutturazione**
**NON ricominciare da zero**, ma **migrare contenuti esistenti** nella nuova architettura v2.0

**Vantaggi:**
- Preserva 6+ mesi di contenuti sviluppati
- Mantiene momentum di sviluppo
- Rischi controllati con backup completo
- Continuità con versione giocabile esistente

### **Struttura di Sviluppo: 6 Fasi, 12 Settimane**

#### **FASE 1 (Settimane 1-2): Setup e Core Architecture**
- Creare nuovo progetto con struttura GDD
- Implementare sistemi core (time, events, config)
- Setup testing infrastructure

#### **FASE 2 (Settimane 3-4): Domain Implementation**
- Implementare domini World, Character, Inventory
- Creare sistemi base funzionanti

#### **FASE 3 (Settimane 5-6): Survival & Narrative**
- Sistema sopravvivenza e narrativa
- Integrazione emotiva personaggio

#### **FASE 4 (Settimane 7-8): UI/UX Migration**
- Design system CRT e componenti
- Canvas rendering ottimizzato

#### **FASE 5 (Settimane 9-10): Content Migration**
- Migrare database esistenti
- Adattare eventi e items

#### **FASE 6 (Settimane 11-12): Integration & Polish**
- Testing completo e ottimizzazioni
- Balancing finale e deployment

---

## **📚 DOCUMENTAZIONE DI RIFERIMENTO**

### **File GDD Principali (LEGGI PER PRIMI):**

#### **GDD.md** - Architettura Core
- Sezioni 1-2: Visione, obiettivi, stack tecnologico
- Sezione 3: Sistemi core (game loop, time system, config)
- Sezione 4.1-4.2: Domini World e Character (implementare per primi)

#### **GDD2.md** - Domini Business
- Sezione 4.3: Dominio Inventory (crafting system)
- Sezione 4.4: Dominio Survival (fame, sete, meteo)
- Database items completi (armi, armature, consumabili)

#### **GDD3.md** - Narrative & Game Systems
- Sezione 4.5: Dominio Narrative (quest, stati emotivi)
- Sezioni 5.1-5.3: D&D mechanics, movimento, eventi
- Database eventi (biome, random, quest)

#### **GDD4.md** - UI/UX & Implementation
- Sezione 6: Design system CRT, componenti UI
- Sezione 7: Database e contenuti strutturati
- Sezione 8: Testing strategy e performance
- Sezione 9: Roadmap dettagliato 12 settimane

### **File Progetto Esistente (RIFERIMENTO CONTENUTI):**
```
src/data/events/*.json          # Eventi da migrare
src/data/items/*.json           # Items da migrare
src/data/narrative/*.json       # Quest narrative da migrare
src/interfaces/*.ts             # Tipi da adattare
src/stores/*/*.ts               # Logica da riscrivere
```

### **Documentazione Storica:**
```
documentazione/changelog/*.md    # Cronaca problemi risolti
documentazione/archivio/anti-regressione/*.md  # Lezioni apprese
```

---

## **🛠️ ISTRUZIONI TECNICHE DETTAGLIATE**

### **Setup Ambiente di Sviluppo**

```bash
# 1. Creare backup completo del progetto esistente
cp -r TheSafePlace-React TheSafePlace-React-BACKUP-v0.9.8.1

# 2. Creare nuovo progetto
mkdir TheSafePlace-v2.0
cd TheSafePlace-v2.0
npm init -y

# 3. Installare dipendenze secondo GDD
npm install react react-dom typescript zustand tailwindcss autoprefixer postcss
npm install -D @types/react @types/react-dom @types/node
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D cypress eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D vite @vitejs/plugin-react-swc

# 4. Copiare file di configurazione dal GDD
# - tailwind.config.js
# - vite.config.ts
# - jest.config.js
# - eslint.config.js
```

### **Struttura Cartelle da Creare (GDD.md Sezione 2.1)**

```
src/
├── core/                    # 🌟 Sistema core unificato
│   ├── game/               # Game loop e stato principale
│   ├── time/               # Sistema tempo unificato
│   ├── events/             # Event bus centralizzato
│   └── config/             # Configurazioni globali
├── domains/                 # 🎯 Domini business isolati
│   ├── world/              # Dominio mondo
│   ├── character/          # Dominio personaggio
│   ├── inventory/          # Dominio inventario
│   ├── survival/           # Dominio sopravvivenza
│   └── narrative/          # Dominio narrativa
├── ui/                     # 🎨 Componenti UI
│   ├── screens/            # Schermate principali
│   ├── components/         # Componenti riutilizzabili
│   ├── canvas/             # Rendering canvas
│   └── theme/              # Tema CRT
├── data/                   # 📊 Database strutturati
│   ├── events/             # Eventi di gioco
│   ├── items/              # Database oggetti
│   ├── narrative/          # Contenuti narrativi
│   └── config/             # Configurazioni dati
├── services/               # 🔧 Servizi business
├── utils/                  # 🛠️ Utility functions
├── types/                  # 📝 Definizioni TypeScript
└── tests/                  # 🧪 Testing suite
```

### **Implementazione Sistema Core (FASE 1)**

**Prima implementare (GDD.md Sezione 3):**
1. **Event Bus** (core/events/eventBus.ts)
2. **Time System** (core/time/timeSystem.ts)
3. **Game Loop** (core/game/gameLoop.ts)
4. **Configuration** (core/config/)

**Poi implementare (GDD2.md Sezione 4):**
1. **World Domain** con movimento e biomi
2. **Character Domain** con D&D mechanics
3. **Inventory Domain** con crafting

### **Migrazione Contenuti (FASE 5)**

**Database da migrare:**
```typescript
// DA: src/data/items/*.json
// A:   src/data/items/*.json (stessa struttura, validare)

// DA: src/data/events/*.json
// A:   src/data/events/*.json (adattare ai nuovi tipi)

// DA: src/data/narrative/*.json
// A:   src/data/narrative/*.json (mantenere struttura narrativa)
```

**Codice da riscrivere:**
```typescript
// NON COPIARE: src/stores/* (architettura problematica)
// USARE: Logica di gioco da migrare nei nuovi domini

// COPIARE E ADATTARE: src/components/* (UI utilizzabile)
// MIGRARE: src/services/* (logica business riutilizzabile)
```

---

## **🎮 REQUISITI FUNZIONALI MINIMI**

### **MVP v2.0 (Fine Fase 2)**
- ✅ Nuovo progetto con architettura v2.0
- ✅ Sistemi core funzionanti (time, events)
- ✅ Movimento giocatore con calcolo tempo
- ✅ Personaggio con statistiche D&D
- ✅ Inventario base con items
- ✅ UI minima funzionante

### **Versione Completa (Fine Fase 6)**
- ✅ Tutti i domini implementati
- ✅ Contenuti migrati e funzionanti
- ✅ UI/UX completa con design CRT
- ✅ Testing completo (>80% coverage)
- ✅ Performance ottimizzate
- ✅ Save/load funzionante

---

## **🧪 TESTING E QUALITÀ**

### **Testing Requirements (GDD4.md Sezione 8)**
- **Unit Tests**: Ogni funzione/componente
- **Integration Tests**: Interazioni tra domini
- **E2E Tests**: Flussi utente completi
- **Performance Tests**: 60 FPS, <100MB RAM

### **Anti-Regression Measures**
- **Backup giornaliero** del progetto
- **Testing automatico** su ogni commit
- **Performance monitoring** integrato
- **Error boundaries** per crash prevention

---

## **⚠️ CONSIDERAZIONI IMPORTANTI**

### **Errori da Evitare (Lezioni dal v1.0)**
1. **NON creare multi-store caotico** - Usa facade pattern
2. **NON permettere dipendenze circolari** - Flusso unidirezionale
3. **NON fare refactoring distruttivi** - Architettura stabile dall'inizio
4. **NON trascurare testing** - Testing integrato nel workflow

### **Best Practices da Seguire**
1. **Single Source of Truth** per ogni dominio
2. **Interface Segregation** - Tipi piccoli e focalizzati
3. **Fail-Fast Design** - Errori catturati presto
4. **Composition over Inheritance** - Componenti flessibili

### **Contenuti Prioritari da Migrare**
1. **Database Items** - Armi, armature, consumabili
2. **Eventi Bioma** - Sistemi di incontro dinamici
3. **Main Quest** - Narrativa "Lullaby of Ashes"
4. **UI Components** - Schermate funzionanti

---

## **📊 METRICHE DI SUCCESSO**

### **Qualitative**
- ✅ Architettura stabile senza dipendenze circolari
- ✅ Codice completamente testato
- ✅ Performance 60 FPS costante
- ✅ Manutenibilità semplificata

### **Quantitative**
- ✅ 80%+ test coverage
- ✅ < 3 secondi load time
- ✅ < 100MB memory usage
- ✅ 0 errori console in produzione

---

## **🚀 PIANO DI CONSEGNA**

### **Deliverables per Fase**
- **Fase 1**: Progetto base con core systems
- **Fase 2**: Domini base funzionanti
- **Fase 3**: Survival e narrativa complete
- **Fase 4**: UI/UX migrata
- **Fase 5**: Contenuti migrati
- **Fase 6**: Versione completa testata

### **Documentazione Richiesta**
- **Changelog settimanale** delle implementazioni
- **Documentazione tecnica** per ogni sistema
- **Guide di migrazione** per contenuti
- **Testing reports** dettagliati

---

## **💡 ISTRUZIONI FINALI PER L'LLM**

**TU SEI KILO CODE**, software engineer specializzato. Il tuo compito è:

1. **LEGGI TUTTI I FILE GDD** (GDD.md, GDD2.md, GDD3.md, GDD4.md) PRIMA di iniziare
2. **ANALIZZA il progetto esistente** per capire contenuti da migrare
3. **SEGUI IL PIANO 12 SETTIMANE** senza deviazioni architetturali
4. **IMPLEMENTA incrementalmente** con testing continuo
5. **DOCUMENTA ogni decisione** e problema risolto
6. **MANIENI STABILITÀ** - non introdurre regressioni

**RICORDA**: Questo NON è ricominciare da zero. È **migrazione intelligente** di contenuti validi in un'architettura superiore.

**INIZIA CON FASE 1**: Setup progetto e implementazione sistemi core.

**SE HAI DUBBI**: Riferisciti sempre ai file GDD per decisioni architetturali.

---

**🎯 PRONTO PER LA RICOSTRUZIONE? INIZIA CON LA FASE 1!** 🚀