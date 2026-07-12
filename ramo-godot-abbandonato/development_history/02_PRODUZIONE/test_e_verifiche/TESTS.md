# TESTS.md - File dei Test Manuali SafePlace

Questo file mantiene tutti i test manuali per prevenire regressioni durante lo sviluppo, seguendo il **PRINCIPIO 4 del PROTOCOLLO DI SVILUPPO UMANO-LLM**.

**VERSIONE CORRENTE**: v0.3.0 "The Chosen One"
**ULTIMO AGGIORNAMENTO**: 2025-01-28
**TEST TOTALI**: 89/89 SUPERATI (100%)

> Aggiornamento v0.3.0: aggiunti 10 test dedicati al sistema di Creazione Personaggio (vedi `ARCHIVIO/02_LOGS_DI_PRODUZIONE/ANTI_REGRESSION_TESTS_v0.3.0.md`).

═══════════════════════════════════════════════════════════════════════════════

## 🏆 RIEPILOGO STATO TEST PER RELEASE v0.2.5

**MILESTONE 0**: 18/18 test superati ✅
**MILESTONE 1**: 12/12 test superati ✅  
**MILESTONE 2**: 49/49 test superati ✅
**MILESTONE 3**: 10/10 test superati ✅
**TOTALE**: 89/89 test superati (100%) ✅

**ARCHITETTURA TESTATA**:
- ✅ 5 Singleton (ThemeManager, DataManager, PlayerManager, InputManager, TimeManager)
- ✅ Sistema TileMap completo (62.500 tiles)
- ✅ Perfect Engine con camera smooth
- ✅ UI reattiva con 13 pannelli + StatusLabel
- ✅ Mappa bilanciata con rifugi ottimizzati
- ✅ Sistema temporale con penalità sopravvivenza
- ✅ Sistema stati personaggio (ferito/malato/avvelenato)
- ✅ Sistema eventi dinamico con cooldown intelligente
- ✅ EventManager con probabilità per bioma
- ✅ Signal architecture robusta
- ✅ Performance AAA-quality (60+ FPS)

═══════════════════════════════════════════════════════════════════════════════

## Milestone 0 Task 1: Setup del Font e del Tema Globale

### Test M0.T1: Verifica Tema Globale e Font

**Obiettivo:** Verificare che il tema `main_theme.tres` sia applicato correttamente con il font Perfect DOS VGA 437.

**Passi:**
1. Aprire il progetto Godot
2. Avviare la scena `TestScene.tscn`
3. Verificare visivamente gli elementi

**Risultato Atteso:**
- ✅ Il font di tutti i testi deve essere **Perfect DOS VGA 437 Win**
- ✅ Il colore del testo deve essere **verde #4EA162**
- ✅ Lo sfondo deve essere **verde scurissimo #000503**
- ✅ I bottoni devono avere bordi verdi e testo verde
- ✅ Non devono esserci errori nella console di Godot

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato con successo - v0.0.1

---

### Test M0.T2: Verifica ThemeManager

**Obiettivo:** Verificare che il ThemeManager funzioni correttamente come Singleton.

**Passi:**
1. Avviare la scena `TestScene.tscn`
2. Premere il pulsante "Test Button" per cambiare tema
3. Verificare i cambi di tema nella console

**Risultato Atteso:**
- ✅ Console mostra: "🎨 ThemeManager inizializzato - Tema: DEFAULT"
- ✅ Premendo il pulsante, i temi cambiano in ordine: DEFAULT → CRT_GREEN → HIGH_CONTRAST → DEFAULT
- ✅ Ogni cambio è confermato in console
- ✅ I colori dell'interfaccia cambiano visivamente con i temi

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato con successo - v0.0.1

---

### Test M0.T3: Test Funzione apply_theme()

**Obiettivo:** Verificare che la funzione `ThemeManager.apply_theme("standard")` funzioni.

**Passi:**
1. Aprire la console di Godot (Remote Inspector)
2. Nella console di debug, eseguire: `ThemeManager.apply_theme("standard")`
3. Verificare che il tema cambi

**Risultato Atteso:**
- ✅ Il comando non produce errori
- ✅ Il tema cambia visivamente
- ✅ Console conferma: "✅ Tema applicato: DEFAULT"

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato con successo - v0.0.1

---

## Milestone 0 Task 2: Shader CRT e Effetti Terminale (v0.0.2b)

### Test M0.T2.1: Verifica Sistema CRT Funzionale

**Obiettivo:** Verificare che il sistema CRT completamente riparato funzioni correttamente con architettura ColorRect overlay.

**Passi:**
1. Aprire il progetto Godot
2. Avviare la scena `TestScene.tscn`
3. Verificare stato iniziale (CRT disattivo)
4. Premere F1 per attivare CRT manualmente
5. Osservare effetti: scanline, fosfori verdi, rumore vintage

**Risultato Atteso:**
- ✅ Avvio normale: schermo pulito senza effetti CRT
- ✅ F1 attiva CRT: effetti fosfori verdi autentici
- ✅ Scanline orizzontali visibili e realistiche
- ✅ Colore fosforoso verde (#00FF40) applicato correttamente
- ✅ Rumore vintage leggero e discreto
- ✅ Console mostra: "🎥 CRT: ATTIVO/DISATTIVO"
- ✅ Performance mantenute (60+ FPS)

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Sistema completamente funzionale - v0.0.2b

---

### Test M0.T2.2: Integrazione Automatica con Temi

**Obiettivo:** Verificare attivazione automatica CRT con tema CRT_GREEN.

**Passi:**
1. Avviare con tema DEFAULT (CRT spento)
2. Premere "Test Button" per passare a CRT_GREEN
3. Verificare attivazione automatica CRT
4. Cambiare a HIGH_CONTRAST
5. Verificare disattivazione automatica CRT

**Risultato Atteso:**
- ✅ Tema DEFAULT: CRT spento
- ✅ Tema CRT_GREEN: CRT si attiva automaticamente
- ✅ Tema HIGH_CONTRAST: CRT si spegne automaticamente
- ✅ Transizioni fluide senza glitch
- ✅ UI "CRT Info" aggiornata correttamente
- ✅ Console conferma ogni cambio stato

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Integrazione perfetta - v0.0.2b

---

### Test M0.T2.3: Controllo Manuale F1

**Obiettivo:** Verificare controllo manuale indipendente dal tema.

**Passi:**
1. Impostare tema DEFAULT
2. Premere F1 per attivare CRT manualmente
3. Cambiare tema a CRT_GREEN (dovrebbe rimanere attivo)
4. Premere F1 per disattivare
5. Verificare che rimanga spento anche con tema CRT_GREEN

**Risultato Atteso:**
- ✅ F1 funziona indipendentemente dal tema attivo
- ✅ Controllo manuale ha precedenza su quello automatico
- ✅ Toggle immediato e responsivo
- ✅ Stato visuale coerente con stato logico
- ✅ Console conferma ogni toggle manuale

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Controllo manuale perfetto - v0.0.2b

---

### Test M0.T2.4: Regressione Architettura Precedente

**Obiettivo:** Verificare che la nuova architettura non abbia introdotto regressioni.

**Passi:**
1. Verificare che tutti i test M0.T1 passino ancora
2. Verificare font Perfect DOS VGA 437 funzionante
3. Verificare temi DEFAULT e HIGH_CONTRAST senza problemi
4. Verificare performance e stabilità generale

**Risultato Atteso:**
- ✅ Tutti i test M0.T1 ancora superati
- ✅ Font perfetto in tutti i temi
- ✅ Colori temi corretti
- ✅ Nessun errore in console
- ✅ Stabilità generale mantenuta
- ✅ Architettura ColorRect più semplice e robusta

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Zero regressioni - architettura migliorata - v0.0.2b

---

## Milestone 2: Perfect Gameplay Engine ✅ COMPLETATA

### Test M2.T6.1: Camera Engine Perfetto

**Obiettivo:** Verificare camera smooth senza saltelli

**Passi:**
1. Avviare MainGame.tscn
2. Muovere player con WASD in tutte direzioni
3. Osservare movimento camera

**Risultato Atteso:**
- ✅ Camera segue player smoothly
- ✅ Zero saltelli durante movimento
- ✅ Coordinate intere per posizionamento
- ✅ 60+ FPS stabili durante movimento
- ✅ Zoom 1.065x applicato correttamente

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Camera engine perfetto - v0.1.7

---

### Test M2.T6.2: Log Movimento Real-Time

**Obiettivo:** Verificare feedback movimento immediato

**Passi:**
1. Muovere player verso Nord (W)
2. Verificare messaggio diario
3. Testare tutte e 4 direzioni

**Risultato Atteso:**
- ✅ Messaggio immediato: "Ti sposti verso Nord, raggiungendo: [TERRENO]"
- ✅ Direzioni corrette: Nord, Sud, Est, Ovest
- ✅ Terreni mappati correttamente
- ✅ Timestamp aggiornato nel diario
- ✅ Colori categorizzati [MONDO]

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Log movimento real-time perfetto - v0.1.7

---

### Test M2.T6.3: Pannelli Info Sincronizzati

**Obiettivo:** Verificare aggiornamento pannelli <16ms

**Passi:**
1. Osservare pannello posizione
2. Muovere player
3. Verificare aggiornamento immediato

**Risultato Atteso:**
- ✅ Posizione aggiornata istantaneamente
- ✅ Coordinate corrette visualizzate
- ✅ Segnale player_moved funzionante
- ✅ Auto-connessione GameUI attiva
- ✅ Performance <16ms per aggiornamento

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Sincronizzazione perfetta - v0.1.7

---

## 🏠 Milestone 2 Task 7: The Balanced World (v0.2.0)

### Test M2.T7.1: Verifica Rifugi Integrati

**Obiettivo:** Verificare che i rifugi (R) siano visibili e renderizzati correttamente

**Passi:**
1. Avviare MainGame.tscn
2. Esplorare la mappa in diverse aree
3. Osservare presenza rifugi dorati

**Risultato Atteso:**
- ✅ Rifugi (R) visibili come tile dorate
- ✅ Texture rest_stop.png caricata correttamente
- ✅ Distribuzione bilanciata su tutta mappa
- ✅ Rifugi non sovrapposti ad altri elementi
- ✅ Rendering stabile senza glitch

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Rifugi integrati perfettamente - v0.2.0

---

### Test M2.T7.2: Verifica Ottimizzazione Mappa

**Obiettivo:** Verificare che il numero rifugi sia bilanciato (non eccessivo)

**Passi:**
1. Esplorare diverse sezioni mappa
2. Contare approssimativamente rifugi in area 10x10
3. Verificare distribuzione uniforme

**Risultato Atteso:**
- ✅ Rifugi presenti ma non eccessivi
- ✅ Distribuzione strategica vicino insediamenti
- ✅ Aree vuote bilanciate con aree popolate
- ✅ Gameplay non compromesso da sovraffollamento
- ✅ Esperienza utente ottimale

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Bilanciamento ottimale - v0.2.0

---

### Test M2.T7.3: Performance con Rifugi

**Obiettivo:** Verificare che performance rimangano ottimali

**Passi:**
1. Muovere rapidamente per tutta mappa
2. Osservare FPS durante esplorazione
3. Verificare caricamento areas dense rifugi

**Risultato Atteso:**
- ✅ 60+ FPS mantenuti costantemente
- ✅ Zero lag durante movimento
- ✅ Caricamento aree istantaneo
- ✅ Memoria stabile senza leak
- ✅ Rendering efficiente rifugi

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Performance AAA mantenute - v0.2.0

---

### Test M2.T7.4: Compatibilità Architettura TileMap

**Obiettivo:** Verificare che rifugi non abbiano causato regressioni TileMap

**Passi:**
1. Testare tutti terreni esistenti (., F, M, ~, V, C, S, E)
2. Verificare collision montagne
3. Verificare penalità movimento fiumi

**Risultato Atteso:**
- ✅ Tutti terreni renderizzati correttamente
- ✅ Collision montagne funzionante
- ✅ Penalità fiumi attiva
- ✅ Player movement fluido
- ✅ Mapping char_to_tile_id corretto

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Zero regressioni TileMap - v0.2.0

---

### Test M2.T7.5: Sistema Backup Mappa

**Obiettivo:** Verificare che backup automatici siano stati creati

**Passi:**
1. Verificare esistenza file backup nella root progetto
2. Controllare integrità backup precedenti
3. Verificare possibilità ripristino se necessario

**Risultato Atteso:**
- ✅ File backup presenti e accessibili
- ✅ Backup pre-ottimizzazione salvato
- ✅ Backup Python-ottimizzazione disponibile
- ✅ Integrità file verificata
- ✅ Sistema rollback funzionante

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Sistema backup robusto - v0.2.0

---

### Test M2.T7.6: Regressione Complete Milestone 2

**Obiettivo:** Verificare che TUTTE le funzionalità M2 funzionino ancora

**Passi:**
1. Eseguire tutti test M2.T1-T6 precedenti
2. Verificare PlayerManager funzionante
3. Verificare GameUI reattiva
4. Verificare InputManager centralizzato
5. Verificare Perfect Engine

**Risultato Atteso:**
- ✅ Tutti 37 test M2 precedenti ancora superati
- ✅ PlayerManager API complete
- ✅ GameUI 13 pannelli funzionanti
- ✅ InputManager segnali attivi
- ✅ Perfect Engine camera smooth
- ✅ Zero regressioni introdotte

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Backward compatibility 100% - v0.2.0

---

## Milestone 2 Task 8: Inventario e Oggetti Iniziali (The Survivor's Pack)

### Test M2.T8.1: Verifica Inventario Iniziale

**Obiettivo:** Verificare oggetti di partenza corretti e quantità fisse

**Passi:**
1. Avviare MainGame.tscn
2. Aprire inventario con [I]
3. Verificare oggetti presenti

**Risultato Atteso:**
- ✅ [1] Coltello Arrugginito x1 (arma base)
- ✅ [2] Pacco di Razioni x3 (consumabile cibo)
- ✅ [3] Acqua Purificata (3/3) x2 (consumabile con porzioni)
- ✅ Inventario mostra esattamente questi 3 tipi oggetto
- ✅ Nessun oggetto extra o mancante

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - inventario iniziale fisso implementato - v0.2.1

---

### Test M2.T8.2: Verifica Consumo a Porzioni

**Obiettivo:** Verificare che Acqua Purificata si consumi per porzioni

**Passi:**
1. Inventario: selezionare Acqua Purificata (3/3)
2. Premere [ENTER] o [3] per usare
3. Verificare consumo porzione
4. Ripetere fino esaurimento

**Risultato Atteso:**
- ✅ Primo uso: (3/3) → (2/3), oggetto rimane inventario
- ✅ Secondo uso: (2/3) → (1/3), oggetto rimane inventario  
- ✅ Terzo uso: (1/3) → oggetto rimosso completamente
- ✅ Idratazione aumenta +40 per ogni porzione
- ✅ Secondo Acqua Purificata rimane intatta (3/3)

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - sistema porzioni funzionante - v0.2.1

---

### Test M2.T8.3: Verifica Consumo Standard (Regressione)

**Obiettivo:** Verificare che oggetti senza porzioni si consumino normalmente

**Passi:**
1. Inventario: selezionare Pacco di Razioni x3
2. Premere [ENTER] o [2] per usare
3. Verificare consumo quantità standard

**Risultato Atteso:**
- ✅ Primo uso: x3 → x2, oggetto rimane inventario
- ✅ Secondo uso: x2 → x1, oggetto rimane inventario
- ✅ Terzo uso: x1 → oggetto rimosso completamente  
- ✅ Nutrimento aumenta per ogni uso
- ✅ Nessuna interferenza con sistema porzioni

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - backward compatibility mantenuta - v0.2.1

---

## Milestone 2 Task 9: Popup Interazione Oggetti (The Item Inspector)

### Test M2.T9.1: Verifica Apertura e Chiusura Popup

**Obiettivo:** Verificare ciclo completo apertura/chiusura popup

**Passi:**
1. Aprire inventario [I]
2. Premere hotkey [1] per Coltello Arrugginito
3. Verificare popup aperto
4. Premere [ESC] per chiudere
5. Ripetere con [ENTER] su oggetto selezionato

**Risultato Atteso:**
- ✅ Hotkey 1-9: popup si apre immediatamente
- ✅ ENTER su selezione: popup si apre per oggetto evidenziato
- ✅ ESC: popup si chiude e torna a inventario
- ✅ Input movimento bloccato quando popup attivo
- ✅ Background scurito (0.6 opacità)

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - gestione popup completa - v0.2.1

---

### Test M2.T9.2: Verifica Azioni Contestuali del Popup

**Obiettivo:** Verificare generazione azioni basate su tipo oggetto

**Passi:**
1. Aprire popup per Coltello Arrugginito (weapon)
2. Verificare azioni disponibili
3. Aprire popup per Acqua Purificata (consumable)  
4. Verificare azioni diverse

**Risultato Atteso:**
- ✅ Coltello (weapon): "Equipaggia", "Ripara", "Scarta", "Chiudi"
- ✅ Acqua (consumable): "Usa", "Scarta", "Chiudi"
- ✅ Azioni generate dinamicamente per tipo
- ✅ Navigazione frecce tra azioni
- ✅ Indicatore selezione (>) visibile

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - azioni contestuali implementate - v0.2.1

---

### Test M2.T9.3: Verifica Interazione Completa

**Obiettivo:** Verificare workflow completo uso oggetto via popup

**Passi:**
1. Popup Acqua Purificata → selezionare "Usa" → ENTER
2. Popup Coltello → selezionare "Equipaggia" → ENTER
3. Verificare effetti e chiusura popup

**Risultato Atteso:**
- ✅ "Usa" Acqua: idratazione +40, popup si chiude
- ✅ "Equipaggia" Coltello: appare pannello equipaggiamento
- ✅ Log narrativo: messaggi immersivi (non debug)
- ✅ Ritorno automatico a modalità MAP
- ✅ Inventario aggiornato immediatamente

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - workflow completo funzionante - v0.2.1

---

## Milestone 2 Task 10: Rework Grafico e Strutturale del Popup

### Test M2.T10.1: Verifica Estetica Popup (Bordo e Sfondo)

**Obiettivo:** Verificare miglioramenti visuali popup

**Passi:**
1. Aprire qualsiasi popup oggetto
2. Verificare elementi visuali
3. Controllare readability testi

**Risultato Atteso:**
- ✅ Panel ha bordo verde 2px ben visibile
- ✅ Sfondo Panel opaco (#000503) per readability
- ✅ Schermo in background oscurato ma non nero
- ✅ Statistiche in griglia 2-colonne ordinate
- ✅ Separatori orizzontali per divisione sezioni

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - estetica professionale - v0.2.1

---

### Test M2.T10.2: Verifica Navigazione Keyboard (Effetto Negativo)

**Obiettivo:** Verificare evidenziazione azioni come inventario principale

**Passi:**
1. Aprire popup con multiple azioni disponibili
2. Usare frecce SU/GIÙ per navigare
3. Verificare evidenziazione tipo inventario

**Risultato Atteso:**
- ✅ Azione selezionata: sfondo verde, testo nero con [>]
- ✅ Azioni non selezionate: testo verde normale
- ✅ Wrap-around: dall'ultima alla prima azione
- ✅ Effetto identico a evidenziazione inventario principale
- ✅ Navigazione fluida e responsive

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - UX coerente con resto interfaccia - v0.2.1

---

## Milestone 2 Task 11: Localizzazione e Formattazione Dati UI

### Test M2.T11.1: Verifica Localizzazione Tipo Oggetto

**Obiettivo:** Verificare traduzione tipi oggetto in italiano

**Passi:**
1. Aprire popup Coltello Arrugginito
2. Verificare campo "Tipo" nelle statistiche
3. Testare altri tipi oggetto se disponibili

**Risultato Atteso:**
- ✅ Coltello mostra "Tipo: Arma" (non "Weapon")
- ✅ Acqua mostra "Tipo: Consumabile" (non "Consumable")
- ✅ Tutti tipi localizzati correttamente in italiano
- ✅ Fallback .capitalize() per tipi non mappati
- ✅ Formattazione coerente Sentence case

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - localizzazione completa - v0.2.1

---

### Test M2.T11.2: Verifica Localizzazione Rarità

**Obiettivo:** Verificare traduzione rarità tramite database

**Passi:**
1. Aprire popup oggetto con rarità COMMON
2. Verificare campo "Rarità" nelle statistiche
3. Testare oggetti con rarità diverse se disponibili

**Risultato Atteso:**
- ✅ COMMON mostra "Rarità: Comune" (non "COMMON")
- ✅ RARE mostra "Rarità: Raro" (non "RARE")
- ✅ Integrazione DataManager.get_rarity_data() funzionante
- ✅ Nome estratto da chiave "name" del database
- ✅ Fallback per rarità non presenti nel database

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - database integration perfetta - v0.2.1

---

### Test M2.T11.3: Verifica Formattazione Generale Dati

**Obiettivo:** Verificare tutti i dati popup formattati correttamente

**Passi:**
1. Aprire popup per oggetti diversi
2. Verificare tutti campi statistiche
3. Controllare coerenza formattazione

**Risultato Atteso:**
- ✅ Nessun testo in maiuscolo raw (COMMON, WEAPON, etc.)
- ✅ Format coerente: "Chiave: Valore" con spazi appropriati
- ✅ Numeri formattati correttamente (es. "1.5 kg", "15 caps")
- ✅ Porzioni mostrate come "2/3" quando presenti
- ✅ Layout griglia pulito e leggibile

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato - polish finale completato - v0.2.1

---

## Milestone 3 Task 4.2: Implementazione SkillCheckManager

### Test M3.T4.2: Verifica SkillCheckManager e Debug Key F9

**Obiettivo:** Verificare che il Singleton `SkillCheckManager` esegua correttamente un test di abilità e che il tasto di debug `F9` attivi il test e ne stampi il risultato in console.

**Passi:**
1. Avviare la scena `MainGame.tscn`.
2. Una volta in gioco, premere il tasto `F9`.
3. Controllare l'output nella console di debug di Godot.

**Risultato Atteso:**
- ✅ Alla pressione di `F9`, non devono verificarsi errori.
- ✅ La console di Godot deve stampare un blocco di testo formattato, contenente le seguenti chiavi: `stat_used`, `stat_value`, `modifier`, `roll`, `total`, `difficulty`, `success`.
- ✅ Esempio di output atteso (i valori numerici possono variare):
  ```
  --- SKILL CHECK TEST (Forza vs 12) ---
  stat_used: forza
  stat_value: 5
  modifier: -3
  roll: 15
  total: 12
  difficulty: 12
  success: True
  ------------------------------------
  ```
- ✅ Il valore di `stat_used` deve essere "forza" e `difficulty` deve essere 12, come specificato nel codice di debug.

**Risultato Test:** [ ] PASS / [ ] FAIL

**Note:** Test per la nuova funzionalità di skill check.

═══════════════════════════════════════════════════════════════════════════════