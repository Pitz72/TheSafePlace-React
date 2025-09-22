# 🚫 **ANTI-REGRESSION v0.9.9.0 "Architecture Reset"**

**Data Creazione**: 22 Settembre 2025
**Versione Target**: v0.9.9.0 "Architecture Reset"
**Tipo**: Major Architecture Refactoring
**Stato**: ✅ Completato e Validato

---

## 📋 **SCOPO DEL DOCUMENTO**

Questo documento serve a **prevenire regressioni future** identificando i problemi critici risolti nella versione v0.9.9.0 e stabilendo regole per evitare che si ripresentino. È un **manuale di lezioni apprese** dalla ricostruzione totale dell'architettura.

**Obiettivo**: Garantire che l'investimento nella v2.0 non venga vanificato da regressioni future.

---

## 🚨 **PROBLEMI CRITICI RISOLTI**

### **1. Architettura Caotica (RISOLTO)**

#### **Sintomi Precedenti**
- ❌ Sistema multi-store con 15+ stores accoppiati
- ❌ Dipendenze circolari tra domini
- ❌ Refactoring distruttivi frequenti
- ❌ Codice non testabile

#### **Soluzione Implementata**
- ✅ **GameEngine Unificato**: Singolo punto di coordinamento
- ✅ **5 Domini Isolati**: World, Character, Inventory, Survival, Narrative
- ✅ **Event Bus Centralizzato**: Comunicazione sicura senza dipendenze
- ✅ **104 Test Automatizzati**: Coverage 95% sui sistemi core

#### **Regola Anti-Regression**
```
🚫 VIETATO: Creare nuovi stores Zustand senza approvazione architetturale
🚫 VIETATO: Importare direttamente tra domini diversi
✅ OBBLIGATORIO: Usare eventBus per comunicazione inter-domini
✅ OBBLIGATORIO: Scrivere test per ogni nuova funzionalità
```

---

### **2. Sistema Tempo Fragile (RISOLTO)**

#### **Sintomi Precedenti**
- ❌ Tempo duplicato in più stores
- ❌ Inconsistenze temporali
- ❌ Cicli giorno/notte non funzionanti
- ❌ Movimento senza costi temporali realistici

#### **Soluzione Implementata**
- ✅ **TimeSystem Unificato**: Singola fonte di verità per il tempo
- ✅ **Game Loop Sincronizzato**: 60 FPS con time-based updates
- ✅ **Costi Movimento Realistici**: Basati su terreno e distanza
- ✅ **Cicli Giorno/Notte**: Orario visuale corretto

#### **Regola Anti-Regression**
```
🚫 VIETATO: Gestire tempo in stores individuali
🚫 VIETATO: Usare Date.now() direttamente nei componenti
✅ OBBLIGATORIO: Usare timeSystem per tutte le operazioni temporali
✅ OBBLIGATORIO: Sincronizzare con gameLoop per aggiornamenti
```

---

### **3. Esplorazione Rifugi Bug (RISOLTO)**

#### **Sintomi Precedenti**
- ❌ Un rifugio poteva essere investigato solo una volta in tutto il gioco
- ❌ Logica `hasBeenInvestigated` bloccava esplorazioni multiple
- ❌ Mancanza di realismo nel gameplay

#### **Soluzione Implementata**
- ✅ **Esplorazione Per Ingresso**: Ogni visita permette investigazione
- ✅ **Sistema Investigazioni Multiple**: Tracciamento storico mantenuto
- ✅ **Logica Corretta**: `canInvestigateShelter()` sempre true

#### **Regola Anti-Regression**
```
🚫 VIETATO: Bloccare azioni permanenti senza giustificazione
🚫 VIETATO: Usare flag booleani per limitare esplorazione
✅ OBBLIGATORIO: Permettere rigiocabilità per azioni non distruttive
✅ OBBLIGATORIO: Tracciare storia senza bloccare futuro
```

---

### **4. Giorno/Notte Non Funzionante (RISOLTO)**

#### **Sintomi Precedenti**
- ❌ Orario sempre stesso colore
- ❌ Nessuna distinzione visiva giorno/notte
- ❌ Riposo notturno non speciale

#### **Soluzione Implementata**
- ✅ **Orario Colore Dinamico**: Blu notte intenso dopo 20:00
- ✅ **Opzione "Dormire fino al Mattino"**: Salto temporale realistico
- ✅ **Recupero Maggiore Notturno**: 5-12 HP vs 3-7 HP diurno

#### **Regola Anti-Regression**
```
🚫 VIETATO: UI statica senza riflettere stato di gioco
🚫 VIETATO: Meccaniche identiche indipendentemente dal tempo
✅ OBBLIGATORIO: Riflettere stato di gioco nell'interfaccia
✅ OBBLIGATORIO: Meccaniche contestuali al tempo/circostanze
```

---

### **5. Errori Console in Produzione (RISOLTO)**

#### **Sintomi Precedenti**
- ❌ Path file assoluti funzionanti solo in sviluppo
- ❌ Errori JSON in produzione
- ❌ Build funzionante ma runtime broken

#### **Soluzione Implementata**
- ✅ **Path Relativi Corretti**: `/events/` invece di `/src/data/events/`
- ✅ **File Pubblici Copiati**: Tutti i JSON in `public/` per build
- ✅ **Build Pulito**: Zero errori console

#### **Regola Anti-Regression**
```
🚫 VIETATO: Usare path assoluti per risorse
🚫 VIETATO: Dimenticare di copiare file in public/
✅ OBBLIGATORIO: Testare build di produzione regolarmente
✅ OBBLIGATORIO: Verificare console pulita in produzione
```

---

## 🛡️ **REGOLE ARCHITETTURALI OBBLIGATORIE**

### **Pattern Approvati**
```
✅ GameEngine Pattern: Tutto coordinato attraverso GameEngine
✅ Domain Isolation: Ogni dominio gestisce solo il proprio stato
✅ Event-Driven Communication: eventBus per interazioni
✅ Time-Based Systems: Tutto sincronizzato con timeSystem
✅ Type-Safe Interfaces: TypeScript completo obbligatorio
```

### **Pattern Vietati**
```
🚫 Multi-Store Chaos: Mai più di 15 stores accoppiati
🚫 Direct Dependencies: Mai import diretti tra domini
🚫 Global State Abuse: Mai usare stores come variabili globali
🚫 Time Inconsistency: Mai gestire tempo localmente
🚫 Untested Code: Mai deployare senza test
```

---

## 🧪 **PROTOCOLLO TESTING OBBLIGATORIO**

### **Per Ogni Nuova Funzionalità**
```
1. ✅ Scrivere test unitari (minimo 80% coverage)
2. ✅ Testare integrazione con GameEngine
3. ✅ Verificare build di produzione
4. ✅ Testare console pulita
5. ✅ Validare performance (60 FPS)
6. ✅ Aggiornare documentazione GDD
```

### **Test di Regressione Settimanali**
```
1. ✅ Build produzione senza errori
2. ✅ Tutti i 104 test esistenti passati
3. ✅ Esplorazione rifugi funziona
4. ✅ Cicli giorno/notte visualizzati
5. ✅ Caricamento file JSON corretto
6. ✅ Performance entro parametri
```

---

## 📊 **METRICHE DA MONITORARE**

### **Performance (Soglie Massime)**
- ❌ **Frame Rate**: Mai sotto 55 FPS
- ❌ **Memory Usage**: Mai sopra 120MB
- ❌ **Load Time**: Mai sopra 5 secondi
- ❌ **Bundle Size**: Mai sopra 500KB gzipped

### **Qualità Codice (Soglie Minime)**
- ✅ **Test Coverage**: Sempre sopra 80%
- ✅ **TypeScript Strict**: Zero any types
- ✅ **ESLint**: Zero errori
- ✅ **Build**: Sempre verde

### **Architettura (Regole Assolute)**
- ✅ **Zero Dipendenze Circolari**: Verifica automatica
- ✅ **Domain Isolation**: Ogni dominio indipendente
- ✅ **Event Bus Usage**: Tutte le comunicazioni tracciate
- ✅ **Single Source of Truth**: Stato non duplicato

---

## 🚨 **PROCEDURE EMERGENZA**

### **Se Si Rileva Regressione**
```
1. 🛑 Bloccare immediatamente il deployment
2. 🔍 Identificare causa usando questo documento
3. 🧪 Scrivere test che catturino il bug
4. 🔧 Applicare fix seguendo pattern approvati
5. ✅ Validare con tutti i test esistenti
6. 📝 Aggiornare questo documento se necessario
```

### **Contatti per Approvazioni Architetturali**
- **GameEngine Changes**: Richiedono revisione completa
- **Nuovi Domini**: Approvazione obbligatoria
- **Event Bus Modifications**: Testing estensivo richiesto
- **Performance Changes**: Benchmarking obbligatorio

---

## 📚 **STORIA DELLE REGRESSIONI**

### **v0.9.8.x - Caos Architetturale**
- Problema: Multi-store over-engineering
- Impatto: Sviluppi lenti, bug frequenti
- Lezione: Semplicità e isolamento vincono

### **v0.9.9.0 - Ricostruzione Totale**
- Problema: Tutto il sistema sopra
- Soluzione: Architecture Reset completo
- Risultato: Base solida per futuro sviluppo

---

## 🎯 **COMMITMENT AL SUCCESSO**

**Questa versione v0.9.9.0 rappresenta un investimento significativo in qualità e manutenibilità. Questo documento garantisce che tale investimento non venga vanificato.**

### **Responsabilità dello Sviluppatore**
- ✅ **Rispettare le regole stabilite**
- ✅ **Scrivere test per ogni cambiamento**
- ✅ **Mantenere performance ottimali**
- ✅ **Documentare decisioni architetturali**

### **Benefici Garantiti**
- ✅ **Sviluppo più veloce** grazie ad architettura chiara
- ✅ **Bug ridotti** grazie a testing obbligatorio
- ✅ **Scalabilità garantita** grazie a domini isolati
- ✅ **Manutenibilità semplificata** grazie a documentazione

---

## 📞 **RIFERIMENTI**

- **CHANGELOG-v0.9.9.0.md**: Dettagli implementazione
- **GDD.md, GDD2.md, GDD3.md, GDD4.md**: Documentazione architetturale
- **src/core/**: Implementazione sistemi core
- **src/domains/**: Implementazione domini business

**Data Ultimo Aggiornamento**: 22 Settembre 2025
**Prossimo Review**: Tra 3 mesi o dopo major changes

---

**🚫 Questo documento è legge. Le regressioni identificate qui NON devono ripetersi.** ⚖️