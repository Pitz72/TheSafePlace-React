# Implementation Plan - Game Improvements v0.6.1

## FASE 1: CRITICAL BUG FIXES (Settimana 1)

### 1. Sistema Rifugi - Correzione Bug Critico

- [x] **1.1 Implementare ShelterAccessInfo nel gameStore**


  - Aggiungere `shelterAccessState: Record<string, ShelterAccessInfo>` al GameState
  - Creare interfaccia `ShelterAccessInfo` con tracking accessi
  - Implementare logica di inizializzazione stato rifugi
  - _Requirements: 2.1, 2.2, 2.3_


- [ ] **1.2 Correggere logica accesso rifugi diurni**
  - Modificare `updateBiome()` per controllare `shelterAccessState`
  - Implementare regola "una visita diurna per rifugio"
  - Aggiungere messaggio informativo per rifugi inaccessibili
  - Mantenere accesso notturno sempre disponibile
  - _Requirements: 2.1, 2.4_


- [ ] **1.3 Correggere investigazione rifugi**
  - Modificare `ShelterScreen.tsx` per tracciare investigazioni per sessione
  - Implementare `hasBeenInvestigated` flag temporaneo
  - Prevenire investigazioni multiple nella stessa sessione
  - Aggiungere messaggio per investigazione già completata
  - _Requirements: 2.2, 2.3_

- [ ] **1.4 Testing sistema rifugi corretto**
  - Testare scenario: visita diurna → rifugio inaccessibile
  - Testare scenario: investigazione → non ripetibile in sessione
  - Testare scenario: accesso notturno sempre disponibile
  - Verificare persistenza stato tra sessioni di gioco
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_



### 2. Correzione Probabilità Eventi

- [ ] **2.1 Ridurre probabilità eventi da 25% a 20%**
  - Modificare `EVENT_CHANCE` da 0.25 a 0.20 in `gameStore.ts`
  - Testare frequenza eventi durante gameplay normale
  - Verificare che la riduzione non impatti negativamente l'esperienza
  - _Requirements: 11.1, 11.2_



## FASE 2: CORE SYSTEMS (Settimana 2-3)

### 3. Sistema Meteo Completo


- [x] **3.1 Implementare WeatherState nel gameStore**
  - Aggiungere `weatherState: WeatherState` al GameState
  - Creare interfacce `WeatherState`, `WeatherType`, `WeatherEffects`
  - Implementare funzioni `updateWeather()`, `getWeatherEffects()`
  - _Requirements: 7.1, 7.2_


- [x] **3.2 Creare sistema pattern meteo**
  - Creare file `src/data/weather/weatherPatterns.json`
  - Implementare logica transizioni meteo basata su probabilità
  - Aggiungere durata variabile per ogni tipo di meteo
  - Integrare con ciclo giorno/notte per transizioni realistiche
  - _Requirements: 7.1, 7.3_

- [ ] **3.3 Integrare meteo con movimento**
  - Modificare `updatePlayerPosition()` per applicare modificatori meteo
  - Implementare penalità movimento per maltempo
  - Aggiungere consumo risorse extra durante tempeste

  - _Requirements: 7.1, 7.2, 9.1, 9.2_

- [x] **3.4 Creare componente WeatherDisplay**
  - Creare `src/components/WeatherDisplay.tsx`
  - Mostrare condizioni meteo attuali nell'interfaccia
  - Aggiungere icone/simboli ASCII per diversi tipi di meteo
  - Integrare nel layout principale del gioco
  - _Requirements: 7.3, 7.5_

- [ ] **3.5 Implementare messaggi atmosferici meteo**
  - Aggiungere messaggi per cambi meteo in `MessageArchive.ts`

  - Creare descrizioni immersive per ogni condizione meteo
  - Integrare messaggi nel journal quando cambia il tempo
  - _Requirements: 7.3_

### 4. Sistema Attraversamento Fiumi Migliorato


- [x] **4.1 Implementare danni per fallimento attraversamento**
  - Modificare logica attraversamento fiumi in `gameStore.ts`
  - Aggiungere danni 1-3 HP per skill check falliti
  - Creare messaggi descrittivi per danni da fiume
  - _Requirements: 6.2, 6.3_



- [ ] **4.2 Integrare meteo con attraversamento fiumi**
  - Applicare penalità skill check durante maltempo
  - Aumentare difficoltà attraversamento con pioggia/tempesta
  - Modificare danni potenziali basati su condizioni meteo
  - _Requirements: 6.4, 7.2_

- [ ] **4.3 Aggiungere modificatori equipaggiamento**
  - Implementare bonus agilità da equipaggiamento leggero
  - Aggiungere penalità per equipaggiamento pesante
  - Considerare bonus da oggetti specifici (corde, stivali, etc.)
  - _Requirements: 6.4_

### 5. Sistema Eventi Dinamici Trasparente

- [ ] **5.1 Migliorare trasparenza skill check negli eventi**
  - Modificare `resolveChoice()` per mostrare dettagli completi del tiro
  - Aggiungere visualizzazione "Dado + Modificatore = Totale vs Difficoltà"
  - Implementare `EventResolutionResult` con rollDetails completi
  - _Requirements: 4.1, 4.2_

- [ ] **5.2 Integrare equipaggiamento negli eventi**
  - Modificare struttura eventi per supportare `equipmentModifiers`
  - Implementare bonus armi per eventi di combattimento
  - Implementare bonus armature per eventi di resistenza
  - Aggiornare `performAbilityCheck()` per considerare equipaggiamento
  - _Requirements: 4.4, 4.5_

- [-] **5.3 Migliorare feedback risultati eventi**

  - Modificare messaggi journal per mostrare tutti gli effetti ottenuti
  - Aggiungere dettagli su oggetti guadagnati/persi
  - Implementare messaggi per danni/guarigioni da eventi
  - Creare sistema di notifiche per cambiamenti importanti
  - _Requirements: 4.3_

- [ ] **5.4 Aggiornare EventScreen per nuova trasparenza**
  - Modificare `EventScreen.tsx` per mostrare difficoltà skill check
  - Aggiungere preview modificatori equipaggiamento
  - Implementare visualizzazione risultati dettagliati
  - _Requirements: 4.1, 4.2_

## FASE 3: USER EXPERIENCE (Settimana 4)

### 6. Sistema Save/Load User-Friendly

- [x] **6.1 Creare LoadScreen component**

  - Creare `src/components/LoadScreen.tsx`
  - Implementare visualizzazione slot salvataggio con preview
  - Aggiungere informazioni dettagliate (nome, livello, tempo gioco, posizione)
  - Integrare con sistema navigazione keyboard
  - _Requirements: 3.1, 3.2_

- [x] **6.2 Migliorare feedback operazioni save/load**


  - Aggiungere conferme visive per salvataggio riuscito
  - Implementare messaggi di errore user-friendly
  - Creare indicatori di caricamento per operazioni lunghe
  - Aggiungere validazione pre-caricamento con recovery options
  - _Requirements: 3.2, 3.3, 3.4_


- [x] **6.3 Implementare export/import salvataggi**

  - Aggiungere funzionalità export salvataggio come JSON
  - Implementare import salvataggio da file
  - Creare validazione robusta per salvataggi importati
  - Aggiungere feedback per operazioni export/import
  - _Requirements: 3.5_

- [x] **6.4 Integrare LoadScreen nel menu principale**



  - Aggiungere opzione "Carica Partita" nel menu principale
  - Implementare navigazione tra StartScreen e LoadScreen
  - Aggiungere gestione errori per salvataggi corrotti
  - _Requirements: 3.1_

### 7. Sistema Audio Retrò

- [ ] **7.1 Implementare AudioSystem base**
  - Creare `src/systems/audioSystem.ts`
  - Implementare generazione beep con Web Audio API
  - Creare pattern beep per diversi eventi
  - Aggiungere controlli volume e mute
  - _Requirements: 8.1, 8.4, 8.5_

- [ ] **7.2 Creare AudioManager component**
  - Creare `src/components/AudioManager.tsx`
  - Implementare hook per riproduzione audio eventi
  - Integrare con Zustand store per settings audio
  - Aggiungere gestione errori per browser senza audio support
  - _Requirements: 8.2_

- [ ] **7.3 Definire pattern audio per eventi**
  - Creare mapping eventi → pattern beep
  - Implementare beep distintivi per menu, azioni, eventi
  - Aggiungere sequenze speciali per level up, danni, successi
  - Testare pattern per chiarezza e distinzione
  - _Requirements: 8.1, 8.3_

- [ ] **7.4 Integrare audio nel gameplay**
  - Aggiungere chiamate audio per navigazione menu
  - Implementare feedback audio per azioni giocatore
  - Integrare audio con eventi meteo e ambientali
  - Aggiungere audio settings nel menu opzioni
  - _Requirements: 8.2, 8.4_

## FASE 4: CONTENT EXPANSION (Settimana 5-6)

### 8. Database Eventi Espanso

- [ ] **8.1 Creare 15 eventi misteriosi per Città**
  - Creare `src/data/events/expanded_city_events.json`
  - Scrivere eventi con temi: tecnologia perduta, esperimenti falliti, echi del passato
  - Includere elementi sovrannaturali: suoni inspiegabili, luci strane, presenze
  - Aggiungere momenti commoventi: messaggi di addio, foto di famiglia, diari
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] **8.2 Creare 15 eventi misteriosi per Foresta**
  - Creare `src/data/events/expanded_forest_events.json`
  - Scrivere eventi con temi: natura mutata, animali strani, rovine nascoste
  - Includere elementi sovrannaturali: alberi che sussurrano, ombre che si muovono
  - Aggiungere scoperte raccapriccianti: scheletri, trappole, esperimenti su animali
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] **8.3 Creare 15 eventi misteriosi per Pianura**
  - Creare `src/data/events/expanded_plains_events.json`
  - Scrivere eventi con temi: vastità desolata, strutture isolate, fenomeni atmosferici
  - Includere elementi sovrannaturali: miraggi, voci nel vento, luci all'orizzonte
  - Aggiungere momenti toccanti: memoriali improvvisati, giardini abbandonati
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] **8.4 Creare 15 eventi misteriosi per Fiume**
  - Creare `src/data/events/expanded_river_events.json`
  - Scrivere eventi con temi: acqua contaminata, ponti crollati, relitti
  - Includere elementi sovrannaturali: riflessi che non corrispondono, suoni sott'acqua
  - Aggiungere scoperte raccapriccianti: corpi nell'acqua, rifiuti tossici
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] **8.5 Creare 15 eventi misteriosi per Villaggio**
  - Creare `src/data/events/expanded_village_events.json`
  - Scrivere eventi con temi: case abbandonate, oggetti personali, storie di vita
  - Includere elementi sovrannaturali: porte che si aprono, voci di bambini
  - Aggiungere momenti commoventi: lettere d'amore, giocattoli abbandonati, foto di famiglia
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] **8.6 Integrare nuovi eventi nel sistema**
  - Aggiornare caricamento eventi in `gameStore.ts`
  - Testare distribuzione casuale dei nuovi eventi
  - Verificare bilanciamento difficoltà e ricompense
  - Aggiungere logging per tracking eventi mostrati
  - _Requirements: 5.5_

### 9. Sistema Movimento Avanzato

- [ ] **9.1 Implementare modificatori terreno**
  - Aggiungere modificatori velocità per diversi biomi
  - Implementare penalità movimento per foreste dense
  - Aggiungere bonus velocità per pianure aperte
  - Integrare modificatori con sistema meteo
  - _Requirements: 9.1_

- [ ] **9.2 Implementare penalità movimento notturno**
  - Modificare `updatePlayerPosition()` per considerare ora del giorno
  - Aggiungere penalità movimento e consumo risorse di notte
  - Implementare maggiore probabilità di eventi pericolosi notturni
  - Aggiungere messaggi informativi per movimento notturno
  - _Requirements: 9.2_

- [ ] **9.3 Implementare effetti equipaggiamento su movimento**
  - Calcolare peso totale equipaggiamento
  - Applicare penalità movimento per equipaggiamento pesante
  - Implementare bonus agilità per equipaggiamento leggero
  - Aggiungere feedback visivo per modificatori movimento
  - _Requirements: 9.3_

- [ ] **9.4 Implementare effetti salute su movimento**
  - Aggiungere penalità movimento per HP bassi
  - Implementare modificatori per stati di fame/sete critici
  - Aggiungere messaggi descrittivi per movimento rallentato
  - Integrare con sistema sopravvivenza esistente
  - _Requirements: 9.4, 9.5_

### 10. Sistema Tempo Dinamico

- [ ] **10.1 Implementare eventi probabilistici basati su ora**
  - Modificare probabilità eventi basata su ora del giorno
  - Aumentare eventi misteriosi/pericolosi di notte
  - Implementare eventi speciali per alba/tramonto
  - Aggiungere eventi rari per mezzanotte
  - _Requirements: 10.1_

- [ ] **10.2 Implementare skill check modificati per ora**
  - Aggiungere penalità skill check notturni
  - Implementare bonus per alcune abilità di giorno
  - Modificare difficoltà percezione basata su visibilità
  - Integrare con sistema meteo per effetti combinati
  - _Requirements: 10.2_

- [ ] **10.3 Implementare sistema stagionale base**
  - Aggiungere tracking stagione basato su giorni trascorsi
  - Implementare modificatori sopravvivenza stagionali
  - Aggiungere messaggi descrittivi per cambi stagione
  - Preparare base per future espansioni stagionali
  - _Requirements: 10.3_

- [ ] **10.4 Implementare disponibilità risorse dinamica**
  - Modificare loot rifugi basato su tempo trascorso
  - Implementare degradazione risorse in aree visitate
  - Aggiungere rigenerazione lenta di alcune risorse
  - Bilanciare per evitare exploit temporali
  - _Requirements: 10.4_

- [ ] **10.5 Migliorare calcolo tempo riposo dinamico**
  - Modificare durata riposo basata su condizioni meteo
  - Implementare tempo variabile basato su salute del personaggio
  - Aggiungere modificatori per comfort rifugio
  - Integrare con sistema sopravvivenza per calcoli realistici
  - _Requirements: 10.5_

## TESTING E QUALITY ASSURANCE

### 11. Testing Completo Sistema

- [ ] **11.1 Testing regressione funzionalità esistenti**
  - Verificare che tutte le funzionalità v0.6.0 funzionino ancora
  - Testare compatibilità salvataggi esistenti
  - Verificare performance con nuovi sistemi attivi
  - _Requirements: Tutti_

- [ ] **11.2 Testing integrazione sistemi nuovi**
  - Testare interazione meteo + movimento + eventi
  - Verificare bilanciamento difficoltà con nuovi modificatori
  - Testare edge cases per tutti i nuovi sistemi
  - _Requirements: Tutti_

- [ ] **11.3 Testing user experience**
  - Verificare chiarezza interfacce nuove
  - Testare accessibilità keyboard per tutte le funzioni
  - Validare feedback audio e visivo
  - _Requirements: 3.*, 8.*_

- [ ] **11.4 Performance testing**
  - Verificare che il gioco mantenga 60fps con tutti i sistemi
  - Testare consumo memoria con salvataggi grandi
  - Ottimizzare bottleneck identificati
  - _Requirements: Tutti_

## PROBLEMI IDENTIFICATI - SESSIONE GENNAIO 2025

### 13. Fix Critici Post-Loop Resolution

- [ ] **13.1 Correggere dimensioni mappa**
  - La mappa non riempie correttamente il suo riquadro
  - Dovrebbe avere almeno 3-4 righe di visualizzazione in più
  - Verificare CSS e dimensioni viewport per il rendering della mappa
  - Testare su diverse risoluzioni per assicurare consistenza
  - _Priority: HIGH - Impatta visibilità gameplay_

- [ ] **13.2 Migliorare sistema eventi - Skill Check Visibility**
  - Gli eventi non hanno skill check chiari e visibili
  - Manca visualizzazione del premio/ricompensa
  - Manca visualizzazione del danno/penalità
  - Implementare UI trasparente per mostrare:
    - Difficoltà del skill check
    - Modificatori applicati
    - Risultato del tiro (dado + modificatori)
    - Conseguenze chiare (premio/danno)
  - _Priority: HIGH - Impatta comprensione gameplay_

- [ ] **13.3 Fix caricamento partita - Player invisibile**
  - Quando si carica una partita dal menu, il player non è visibile
  - Il gioco risulta bloccato dopo il caricamento
  - Possibile problema di inizializzazione posizione player
  - Verificare che playerPosition sia correttamente ripristinato
  - Verificare che la camera sia centrata sul player
  - Testare sia quick load che load da menu
  - _Priority: CRITICAL - Blocca gameplay dopo load_

- [ ] **13.4 Migliorare sistema salvataggio rapido (F5)**
  - F5 mostra popup salvataggio ma manca comando per scegliere slot
  - Aggiungere tasto [S] o altro per aprire menu selezione slot
  - Il popup del salvataggio rapido deve avere sfondo opaco
  - Attualmente si confonde con le scritte sottostanti
  - Implementare:
    - Sfondo semi-trasparente scuro per popup
    - Comando keyboard per selezione slot (es. [S] = Save Menu)
    - Feedback visivo chiaro per operazione completata
  - _Priority: MEDIUM - Migliora UX salvataggio_

### 14. Ottimizzazioni UI/UX Post-Fix

- [ ] **14.1 Ottimizzare rendering mappa**
  - Verificare che la mappa utilizzi tutto lo spazio disponibile
  - Controllare padding/margin che potrebbero ridurre l'area visibile
  - Assicurare che il viewport sia calcolato correttamente
  - Testare responsive design per diverse dimensioni finestra

- [ ] **14.2 Migliorare feedback visivo eventi**
  - Aggiungere icone o colori per distinguere tipi di skill check
  - Implementare animazioni per risultati positivi/negativi
  - Migliorare leggibilità del testo degli eventi
  - Aggiungere preview delle conseguenze prima della scelta

- [ ] **14.3 Stabilizzare sistema save/load**
  - Aggiungere validazione robusta per stati di gioco caricati
  - Implementare recovery automatico per salvataggi parzialmente corrotti
  - Migliorare feedback durante operazioni di caricamento
  - Aggiungere logging per debug problemi di caricamento

## DEPLOYMENT E DOCUMENTAZIONE

### 15. Preparazione Release v0.6.2+

- [ ] **15.1 Aggiornare documentazione**
  - Aggiornare README.md con fix implementati
  - Creare CHANGELOG per v0.6.2 con correzioni loop infinito
  - Aggiornare documentazione anti-regressione
  - Documentare problemi noti e workaround
  - _Requirements: Tutti_

- [ ] **15.2 Preparare build produzione**
  - Verificare build ottimizzata post-fix
  - Testare stabilità in diversi browser
  - Preparare note di release con fix critici
  - Validare che tutti i fix siano inclusi nel build
  - _Requirements: Tutti_

---

**Note Implementazione:**
- Ogni task include riferimenti ai requirements specifici
- Le fasi sono organizzate per priorità e dipendenze
- I test sono integrati in ogni fase per garantire qualità
- La compatibilità con l'architettura Zustand è mantenuta
- Focus su user experience e stabilità del gioco