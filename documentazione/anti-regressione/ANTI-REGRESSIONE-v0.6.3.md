# ANTI-REGRESSIONE v0.6.3 - "It's raining heavily today"

**Data:** 26 Gennaio 2025  
**Versione:** 0.6.3  
**Codename:** "It's raining heavily today"  
**Tipo:** Major Feature Update  

## 🎯 Obiettivo del Documento

Questo documento definisce i test di regressione critici per garantire che le nuove funzionalità della v0.6.3 non abbiano compromesso le funzionalità esistenti e che tutti i sistemi funzionino correttamente insieme.

## 🧪 Test Suite Automatizzati

### Sistema Rifugi (shelterSystem.test.ts)
```typescript
✅ Prima visita diurna dovrebbe essere sempre permessa
✅ Dopo visita diurna, rifugio dovrebbe essere inaccessibile per future visite diurne
✅ Accesso notturno dovrebbe essere sempre permesso
✅ Prima investigazione dovrebbe essere sempre permessa
✅ Investigazione dovrebbe essere non ripetibile nella stessa sessione
✅ Reset investigazioni dovrebbe permettere nuove investigazioni
✅ Stato rifugio dovrebbe persistere tra visite
✅ Rifugi diversi dovrebbero avere stati indipendenti
```

**Comando esecuzione**: `npm test -- src/tests/shelterSystem.test.ts`

## 🔍 Test Manuali Critici

### 1. Sistema Rifugi - Scenari Core

#### Test 1.1: Accesso Rifugio Diurno
**Scenario**: Primo accesso a rifugio durante il giorno
- [ ] Avviare nuova partita
- [ ] Muoversi verso un rifugio (R) durante il giorno
- [ ] Verificare accesso permesso
- [ ] Verificare messaggio: "rifugio sicuro trovato - puoi riposare e investigare..."
- [ ] Uscire dal rifugio
- [ ] Tentare rientro nello stesso rifugio di giorno
- [ ] Verificare accesso negato
- [ ] Verificare messaggio: "rifugio già visitato durante il giorno - ora è sigillato..."

#### Test 1.2: Accesso Rifugio Notturno
**Scenario**: Accesso notturno sempre permesso
- [ ] Continuare partita precedente
- [ ] Attendere che diventi notte (dopo 20:00)
- [ ] Muoversi verso rifugio già visitato di giorno
- [ ] Verificare accesso permesso
- [ ] Verificare riposo automatico e guarigione
- [ ] Verificare avanzamento tempo al mattino

#### Test 1.3: Investigazione Rifugio
**Scenario**: Una investigazione per sessione
- [ ] Entrare in rifugio di giorno
- [ ] Selezionare "Investigare il rifugio"
- [ ] Verificare esecuzione skill check Percezione
- [ ] Verificare risultato mostrato
- [ ] Tentare seconda investigazione
- [ ] Verificare blocco con messaggio appropriato
- [ ] Uscire e rientrare nel rifugio
- [ ] Verificare che investigazione rimanga bloccata
- [ ] Salvare e ricaricare partita
- [ ] Verificare reset investigazione (nuova sessione)

### 2. Sistema Meteo - Integrazione Movimento

#### Test 2.1: Movimento con Tempo Sereno
**Scenario**: Movimento normale con bel tempo
- [ ] Verificare meteo corrente (dovrebbe essere CLEAR all'inizio)
- [ ] Muoversi di una casella
- [ ] Verificare tempo movimento normale (10 minuti)
- [ ] Verificare nessun messaggio di rallentamento

#### Test 2.2: Movimento con Maltempo
**Scenario**: Movimento rallentato da condizioni avverse
- [ ] Attendere cambio meteo o forzare tempesta (se possibile in dev)
- [ ] Muoversi durante HEAVY_RAIN o STORM
- [ ] Verificare tempo movimento aumentato (>10 minuti)
- [ ] Verificare messaggio di rallentamento nel journal
- [ ] Verificare possibili danni da condizioni estreme

#### Test 2.3: Messaggi Atmosferici
**Scenario**: Messaggi casuali basati su meteo
- [ ] Muoversi per 10-15 caselle
- [ ] Verificare apparizione occasionale di messaggi atmosferici (10% chance)
- [ ] Verificare che messaggi siano coerenti con meteo corrente
- [ ] Verificare varietà nei messaggi (non sempre gli stessi)

### 3. Sistema Eventi - Probabilità Ridotta

#### Test 3.1: Frequenza Eventi
**Scenario**: Verifica riduzione probabilità eventi
- [ ] Muoversi per 20-30 caselle in biomi diversi
- [ ] Contare numero eventi triggerati
- [ ] Verificare frequenza circa 20% (4-6 eventi su 20-30 movimenti)
- [ ] Confrontare con versioni precedenti (dovrebbe essere meno frequente)

### 4. Compatibilità Salvataggi

#### Test 4.1: Migrazione da v0.6.2
**Scenario**: Caricamento salvataggio precedente
- [ ] Avere salvataggio da v0.6.2 (se disponibile)
- [ ] Caricare salvataggio in v0.6.3
- [ ] Verificare caricamento senza errori
- [ ] Verificare reset investigazioni rifugi
- [ ] Verificare funzionamento normale di tutti i sistemi

#### Test 4.2: Salvataggio/Caricamento v0.6.3
**Scenario**: Ciclo completo save/load
- [ ] Giocare per 30+ minuti
- [ ] Visitare alcuni rifugi
- [ ] Investigare rifugi
- [ ] Salvare partita
- [ ] Ricaricare partita
- [ ] Verificare stato rifugi mantenuto
- [ ] Verificare investigazioni resettate (nuova sessione)

## ⚠️ Regressioni Critiche da Monitorare

### Sistema Core
- [ ] **Movimento base**: Verifica che movimento funzioni senza meteo
- [ ] **Sistema combattimento**: Verifica che eventi combattimento funzionino
- [ ] **Gestione inventario**: Verifica raccolta/uso oggetti
- [ ] **Sistema XP/Level**: Verifica guadagno esperienza e level up
- [ ] **Sopravvivenza**: Verifica consumo fame/sete

### Interfaccia Utente
- [ ] **Navigazione menu**: Tutti i menu devono essere accessibili
- [ ] **Controlli keyboard**: Tutti i controlli devono rispondere
- [ ] **Visualizzazione mappa**: Mappa deve renderizzare correttamente
- [ ] **Journal**: Messaggi devono apparire correttamente
- [ ] **Schermata rifugio**: Interfaccia rifugio deve funzionare

### Performance
- [ ] **Tempo caricamento**: Non deve essere significativamente più lento
- [ ] **Memoria**: Nessun memory leak evidente
- [ ] **Framerate**: Mantenere 60fps durante gameplay normale

## 🚨 Scenari di Fallimento Noti

### Problemi Identificati in Sessione Gennaio 2025
Questi problemi erano noti prima della v0.6.3 e dovrebbero essere testati:

#### Test Critici Post-Loop Resolution
- [ ] **Dimensioni mappa**: Verificare che mappa riempia correttamente il riquadro
- [ ] **Skill check eventi**: Verificare visibilità difficoltà e risultati negli eventi
- [ ] **Caricamento partita**: Verificare che player sia visibile dopo load
- [ ] **Salvataggio rapido F5**: Verificare popup con sfondo opaco e comandi chiari

## 📊 Metriche di Successo

### Criteri di Accettazione
- [ ] **Test automatizzati**: 100% pass rate su shelterSystem.test.ts
- [ ] **Build**: Compilazione senza errori TypeScript
- [ ] **Funzionalità core**: Tutti i test manuali critici passati
- [ ] **Performance**: Nessuna regressione significativa
- [ ] **Compatibilità**: Salvataggi v0.6.2 caricabili senza errori

### Soglie di Allarme
- ❌ **Critico**: Qualsiasi test automatizzato fallito
- ❌ **Critico**: Impossibilità di salvare/caricare partite
- ❌ **Critico**: Crash durante gameplay normale
- ⚠️ **Warning**: Performance degradata >20%
- ⚠️ **Warning**: Regressioni UI minori

## 🔧 Procedure di Rollback

### In caso di regressioni critiche:

1. **Identificazione**: Documentare esattamente il problema
2. **Valutazione**: Determinare se è fix rapido o rollback necessario
3. **Rollback**: Tornare a v0.6.2 se necessario
4. **Fix**: Correggere problema in branch separato
5. **Re-test**: Eseguire tutti i test prima di nuovo deploy

### Comandi Rollback
```bash
git checkout v0.6.2
npm install
npm run build
```

## 📝 Log Test Execution

### Data: ___________
### Tester: ___________

#### Test Automatizzati
- [ ] shelterSystem.test.ts: ✅ PASS / ❌ FAIL
- [ ] Build TypeScript: ✅ PASS / ❌ FAIL

#### Test Manuali Critici
- [ ] Sistema Rifugi: ✅ PASS / ❌ FAIL
- [ ] Sistema Meteo: ✅ PASS / ❌ FAIL  
- [ ] Sistema Eventi: ✅ PASS / ❌ FAIL
- [ ] Compatibilità Salvataggi: ✅ PASS / ❌ FAIL

#### Note Aggiuntive:
```
[Spazio per note del tester]
```

---

**Importante**: Questo documento deve essere eseguito completamente prima di ogni release in produzione e ogni volta che si sospettano regressioni.