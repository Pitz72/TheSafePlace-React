# Test Anti-Regressione v0.7.0 "Top-Ranking Kid"

## Panoramica
Questo documento definisce i test di regressione per la versione 0.7.0 di The Safe Place. Questa versione ha introdotto significative correzioni di stabilità e la ricostruzione completa del sistema di Level Up.

## Test di Stabilità Core

### 1. Gestione Stato Zustand
- [ ] **Test Crash Prevention**: Verificare che non si verifichino crash durante la navigazione tra schermate
- [ ] **Test Loop Infiniti**: Confermare che non ci siano loop infiniti durante l'aggiornamento dello stato
- [ ] **Test Persistenza Stato**: Verificare che lo stato del gioco persista correttamente tra le sessioni

### 2. Navigazione e UI
- [ ] **Test Tasto ESC**: Verificare che ESC chiuda correttamente le schermate "Istruzioni" e "Storia"
- [ ] **Test Pannello Impostazioni**: Confermare che la disattivazione dell'effetto CRT non nasconda la schermata di gioco
- [ ] **Test Transizioni Schermata**: Verificare che tutte le transizioni tra schermate funzionino senza errori

### 3. Camera di Gioco
- [ ] **Test Movimento Camera**: Verificare che la camera segua correttamente il movimento del giocatore
- [ ] **Test Centraggio**: Confermare che il giocatore rimanga centrato nella viewport
- [ ] **Test Limiti Mappa**: Verificare che la camera gestisca correttamente i bordi della mappa

### 4. Persistenza Dati
- [ ] **Test Salvataggio**: Verificare che i salvataggi funzionino correttamente
- [ ] **Test Caricamento**: Confermare che i caricamenti ripristinino lo stato corretto
- [ ] **Test Quick Save/Load**: Verificare funzionalità F5/F9
- [ ] **Test Persistenza Personaggio**: Confermare che i dati del personaggio non si resettino

## Test Sistema Level Up

### 5. Meccaniche Base Level Up
- [ ] **Test Attivazione canLevelUp**: Verificare che la flag si attivi al raggiungimento degli XP necessari
- [ ] **Test Accesso Schermata**: Confermare che il tasto L apra la schermata di Level Up
- [ ] **Test Opzioni Disponibili**: Verificare che vengano mostrate le opzioni corrette per il livello
- [ ] **Test Applicazione Scelte**: Confermare che i miglioramenti vengano applicati permanentemente

### 6. Multi-Level-Up
- [ ] **Test Ricalcolo XP**: Verificare che gli XP vengano ricalcolati dopo ogni scelta
- [ ] **Test Livelli Consecutivi**: Confermare che si possa salire di più livelli in una sessione
- [ ] **Test Aggiornamento Schermata**: Verificare che la schermata si aggiorni istantaneamente
- [ ] **Test Limite Livello 20**: Confermare che il sistema si fermi al livello massimo

### 7. Opzioni Level Up Specifiche
- [ ] **Test Statistiche Base**: Verificare aumenti di Potenza, Agilità, Vigore, Percezione, Adattamento, Carisma
- [ ] **Test HP Boost**: Confermare aumento HP massimi
- [ ] **Test Addestramento Guerriero**: Verificare requisiti livello 3 e effetti combinati
- [ ] **Test Addestramento Esploratore**: Verificare requisiti livello 3 e bonus esplorazione
- [ ] **Test Addestramento Sopravvivenza**: Verificare requisiti livello 5 e bonus sopravvivenza

## Test Sistema Eventi

### 8. Gestione Eventi
- [ ] **Test resolveChoice**: Verificare che tutte le ricompense vengano applicate correttamente
- [ ] **Test Danno**: Confermare che i danni vengano applicati agli HP
- [ ] **Test Esperienza**: Verificare che l'XP guadagnata venga aggiunta correttamente
- [ ] **Test Oggetti**: Confermare che gli oggetti vengano aggiunti all'inventario
- [ ] **Test Penalità**: Verificare che le penalità vengano applicate correttamente

## Test di Integrazione

### 9. Flusso Completo di Gioco
- [ ] **Test Creazione Personaggio**: Verificare che la creazione funzioni senza errori
- [ ] **Test Progressione**: Confermare che si possa progredire dal livello 1 al 20
- [ ] **Test Salvataggio/Caricamento con Level Up**: Verificare persistenza dopo level up
- [ ] **Test Eventi + Level Up**: Confermare che eventi e level up interagiscano correttamente

### 10. Performance e Stabilità
- [ ] **Test Memory Leaks**: Verificare che non ci siano perdite di memoria
- [ ] **Test Performance Level Up**: Confermare che il multi-level-up non causi lag
- [ ] **Test Stabilità Lunga Sessione**: Verificare stabilità durante sessioni prolungate

## Criteri di Accettazione

### Critici (Devono Passare)
- Tutti i test di stabilità core (1-4)
- Meccaniche base Level Up (5)
- Multi-Level-Up funzionante (6)
- Sistema eventi stabile (8)

### Importanti (Fortemente Raccomandati)
- Tutte le opzioni Level Up funzionanti (7)
- Flusso completo di gioco (9)

### Opzionali (Nice to Have)
- Test di performance avanzati (10)

## Note per i Tester

1. **Focus su Stabilità**: Questa versione prioritizza la stabilità dopo il refactoring Zustand
2. **Test Multi-Level**: Prestare particolare attenzione al nuovo sistema multi-level-up
3. **Regressioni Zustand**: Verificare che non ci siano regressioni legate al cambio di state management
4. **Persistenza Dati**: Testare intensivamente salvataggio/caricamento

## Ambiente di Test

- **Browser Supportati**: Chrome, Firefox, Safari, Edge
- **Risoluzioni**: 1920x1080, 1366x768, 2560x1440
- **Dispositivi**: Desktop, Laptop
- **Modalità**: Effetti CRT attivi/disattivi

---

**Data Creazione**: $(date)
**Versione Target**: v0.7.0 "Top-Ranking Kid"
**Responsabile Test**: Team QA
**Stato**: In Preparazione