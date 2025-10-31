# 🧪 GUIDA TESTING COMPLETA - Subquest v1.8.1-1.8.4

**Data:** 31 Ottobre 2025  
**Versioni:** v1.8.1, v1.8.2, v1.8.3, v1.8.4  
**Quest Totali da Testare:** 21 (12 base + 9 nuove)  
**Tempo Stimato:** 8-12 ore testing completo

---

## 📋 CHECKLIST GENERALE PRE-TEST

### Verifica Database Loading
- [ ] Avvia gioco
- [ ] Console: Verifica caricamento tutti database
  - [ ] ✅ QUEST STORE updated
  - [ ] ✅ DIALOGUE STORE updated
  - [ ] ✅ TRADER STORE updated
  - [ ] ✅ EVENT DB loaded
- [ ] Nessun errore 404 in console
- [ ] Nessun errore TypeScript

### Verifica PNG al Crocevia
- [ ] Vai al Crocevia (tile 'A')
- [ ] Menu Avamposto visibile
- [ ] Opzioni presenti:
  - [ ] Parla con Marcus
  - [ ] Parla con Anya
  - [ ] Parla con Silas
  - [ ] Commercia
  - [ ] Riposa
  - [ ] Lascia

---

## 🎯 TEST v1.8.1 - ECHI DEL MONDO PERDUTO

### Setup Iniziale
- [ ] Vai al Crocevia
- [ ] Parla con Anya
- [ ] Scegli "Cosa cerchi esattamente?"
- [ ] Dialogo `what_do_you_seek` appare
- [ ] Scegli "Terrò gli occhi aperti..."
- [ ] Quest `collect_world_echoes` auto-start
- [ ] Premi [J] → Quest visibile in MISSIONI SECONDARIE

### Echo #1: Placca PixelDebh
- [ ] Esplora Città
- [ ] Trova evento `city_easter_egg_pixeldebh_v2`
- [ ] Scegli "Tienila come portafortuna"
- [ ] Ottieni `pixeldebh_plate`
- [ ] Torna al Crocevia
- [ ] Parla con Anya
- [ ] Opzione [ECHO] Placca PixelDebh visibile
- [ ] Consegna placca
- [ ] Verifica ricetta `recipe_repair_kit_advanced` sbloccata
- [ ] Verifica item rimosso da inventario
- [ ] Verifica flag `ANYA_ECHO_PIXELDEBH` settato

### Echo #2: Chip Drone
- [ ] Trova evento drone (città)
- [ ] Ottieni `drone_memory_chip`
- [ ] Equipaggia armatura chest
- [ ] Torna da Anya
- [ ] Opzione [ECHO] Chip visibile
- [ ] Consegna chip
- [ ] Verifica armatura durabilità ripristinata
- [ ] Verifica flag `ANYA_ECHO_DRONE_CHIP`

### Echo #3: Registrazione Criptica
- [ ] Trova evento `lore_broken_radio`
- [ ] Scegli "Tenta di riparare" + successo
- [ ] Ottieni `cryptic_recording`
- [ ] Torna da Anya
- [ ] Consegna registrazione
- [ ] Verifica journal: coordinate (62, 73)
- [ ] Verifica +75 XP
- [ ] Verifica flag `ANYA_ECHO_CRYPTIC_RECORDING`

### Echo #4: Note Progetto Rinascita
- [ ] Vai a Laboratorio (tile 'L')
- [ ] Evento `unique_scientist_notes`
- [ ] Scegli "Leggi documenti" + successo
- [ ] Ottieni `research_notes_rebirth`
- [ ] Equipaggia armatura legs
- [ ] Torna da Anya
- [ ] Consegna note
- [ ] Verifica armatura legs durabilità ripristinata
- [ ] Verifica flag `ANYA_ECHO_PROJECT_REBIRTH`

### Echo #5: Biglietto Eurocenter
- [ ] Trova evento `unique_eurocenter`
- [ ] Scegli "Fruga tra i suoi averi"
- [ ] Ottieni `eurocenter_business_card`
- [ ] Torna da Anya
- [ ] Consegna biglietto
- [ ] Ricevi `tool_multitool`
- [ ] Verifica flag `ANYA_ECHO_EUROCENTER`

### Completamento Collezione
- [ ] Consegna tutti 5 Echi
- [ ] Verifica tutti flags settati
- [ ] Quest `collect_world_echoes` completa
- [ ] Ricevi 500 XP + INT +2

---

## 🔍 TEST v1.8.2 - I SEGNI DELLA CENERE

### Stage 1: Attivazione
- [ ] Esplora Foresta
- [ ] Trova evento `forest_ritual_circle`
- [ ] Scegli "Esamina i simboli con attenzione"
- [ ] Skill check Storia DC 15 (successo)
- [ ] Ottieni `cultist_coded_journal`
- [ ] Quest `signs_of_ash` auto-start
- [ ] Premi [J] → Quest visibile
- [ ] Obiettivo: Trova altri 2 siti rituali

### Stage 2: Sito Rituale #1 - Grotta
- [ ] Esplora Montagna
- [ ] Trova evento `unique_ritual_cave`
- [ ] Scegli "Esamina l'altare e i simboli"
- [ ] Skill check Investigare DC 13
- [ ] Flag `RITUAL_SITE_CAVE_VISITED` settato
- [ ] Ricevi 75 XP
- [ ] Journal: "Hai documentato il secondo luogo"

### Stage 3: Sito Rituale #2 - Albero
- [ ] Esplora Foresta
- [ ] Trova evento `unique_ancient_tree_ritual`
- [ ] Scegli "Studia le incisioni"
- [ ] Skill check Natura DC 14
- [ ] Flag `RITUAL_SITE_TREE_VISITED` settato
- [ ] Ricevi 75 XP
- [ ] Journal: "Hai tutti i pezzi del puzzle"
- [ ] Quest avanza automaticamente a Stage 2

### Stage 4: L'Eremita - Decifrazione
- [ ] Esplora Foresta (casuale)
- [ ] Trova evento `unique_hermit_cabin`
- [ ] Scegli "Saluta l'eremita"
- [ ] Dialogo `hermit_main` inizia
- [ ] Opzione [QUEST] "Ho trovato questo diario" visibile
- [ ] Dialogo `hermit_deciphers_journal`
- [ ] Eremita richiede erbe
- [ ] Quest avanza a Stage 3

### Stage 5: Raccolta Erbe
- [ ] Raccogli 3× `MED_HEALING_HERBS`
- [ ] Raccogli 5× `edible_mushrooms`
- [ ] Quest avanza automaticamente a Stage 4

### Stage 6: Completamento
- [ ] Torna dall'Eremita
- [ ] Opzione [QUEST] "Ho raccolto le erbe" visibile
- [ ] Dialogo `hermit_receives_herbs`
- [ ] Cutscene trance
- [ ] Quest completa
- [ ] Ricevi `manual_sonic_dissuader`
- [ ] Ricevi 500 XP
- [ ] Ricetta `recipe_sonic_dissuader` sbloccata

### Post-Quest: Crafting Dissuasore
- [ ] Raccogli ingredienti:
  - [ ] 3× tech_components
  - [ ] 2× copper_wire
  - [ ] 1× precious_stone
- [ ] Crafta `sonic_dissuader`
- [ ] Usa da inventario
- [ ] Verifica effetto (6h protezione - da implementare)

---

## 🎯 TEST v1.8.3 - CACCIATORI E PREDE

### Setup Bounty System
- [ ] Vai al Crocevia
- [ ] Parla con Silas
- [ ] Dialogo `silas_main` inizia
- [ ] Scegli "Che tipo di 'affari'?"
- [ ] Dialogo `bounty_board` appare
- [ ] 3 opzioni bounty visibili

### Bounty #1: Cinghiali
- [ ] Accetta "Taglia: Flagello dei Cinghiali"
- [ ] Quest `bounty_kill_boars` auto-start
- [ ] Premi [J] → Quest visibile
- [ ] Obiettivo: Uccidi 3× Cinghiali Aggressivi
- [ ] Esplora Foresta
- [ ] Combatti `aggressive_boar` #1
- [ ] Vinci combattimento
- [ ] Console: Kill count 1/3
- [ ] Combatti `aggressive_boar` #2 → 2/3
- [ ] Combatti `aggressive_boar` #3 → 3/3
- [ ] Quest auto-complete
- [ ] Ricevi: 350 XP + 15× AMMO_12G + 5× animal_hide
- [ ] Verifica `questKillCounts` reset

### Bounty #2: Lupi
- [ ] Accetta "Taglia: Branco di Lupi"
- [ ] Caccia 4× `mutated_wolf`
- [ ] Verifica progresso incrementale (1/4, 2/4, 3/4, 4/4)
- [ ] Quest auto-complete
- [ ] Ricevi: 400 XP + 20× ammo_arrow + 6× animal_hide

### Bounty #3: Predoni
- [ ] Accetta "Taglia: Predoni Armati"
- [ ] Caccia 5× `armed_raider`
- [ ] Verifica progresso (1/5 → 5/5)
- [ ] Quest auto-complete
- [ ] Ricevi: 500 XP + 30× AMMO_9MM + 2× first_aid_kit

### Test Persistenza Bounty
- [ ] Accetta bounty Cinghiali
- [ ] Uccidi 2/3 cinghiali
- [ ] Salva partita (slot qualsiasi)
- [ ] Carica partita
- [ ] Verifica `questKillCounts` preservato (2/3)
- [ ] Uccidi terzo cinghiale
- [ ] Quest completa normalmente

### Test Insegnamento Silas
- [ ] Raccogli 5× `animal_hide`
- [ ] Parla con Silas
- [ ] Scegli "Insegni quello che sai?"
- [ ] Opzione [5× Pelli] visibile
- [ ] Consegna pelli
- [ ] Ricetta `recipe_advanced_bear_trap` sbloccata
- [ ] Pelli rimosse da inventario

---

## 🔧 TEST v1.8.4 - EREDITÀ INFRANTE

### Repair Quest #1: La Melodia Spezzata

**Setup:**
- [ ] Esplora Città
- [ ] Trova evento `city_theater_ruins`
- [ ] Scegli "Esamina il pianoforte"
- [ ] Quest `broken_melody` auto-start
- [ ] Obiettivo: Trova precision_tools

**Raccolta Componenti:**
- [ ] Cerca `precision_tools` in città (loot raro)
- [ ] Ottieni precision_tools
- [ ] Quest avanza automaticamente a Stage 2

**Completamento:**
- [ ] Torna a `city_theater_ruins`
- [ ] Opzione [QUEST] "Tenta di accordare" visibile
- [ ] Verifica item requirement (precision_tools)
- [ ] Scegli opzione
- [ ] Skill check Investigare DC 15

**Test Successo:**
- [ ] Successo skill check
- [ ] Cutscene pianoforte accordato
- [ ] precision_tools rimosso
- [ ] CAR +1 permanente
- [ ] 200 XP ricevuti
- [ ] Quest completa
- [ ] Journal: "[EREDITÀ] Hai riportato in vita l'arte"

**Test Fallimento:**
- [ ] (Carica save pre-tentativo)
- [ ] Fallimento skill check
- [ ] Pianoforte distrutto
- [ ] precision_tools rimosso
- [ ] Quest failed (non in completedQuests)
- [ ] 50 XP ricevuti
- [ ] Journal: "[FALLIMENTO] Il pianoforte è perduto"

### Repair Quest #2: La Luce nella Torre

**Setup:**
- [ ] Trova torre radio (pianura o città)
- [ ] Evento `unique_radio_tower_console`
- [ ] Scegli "Esamina la console"
- [ ] Quest `tower_of_light` auto-start

**Raccolta Componenti:**
- [ ] Raccogli 3× `military_grade_electronics`
  - [ ] Fonte: Easter egg PixelDebh, checkpoint militari
- [ ] Raccogli 1× `portable_generator`
  - [ ] Fonte: Stazioni servizio, officine
- [ ] Quest avanza a Stage 2

**Completamento:**
- [ ] Torna a torre radio
- [ ] Opzione [QUEST] "Installa componenti" visibile
- [ ] Skill check Investigare DC 17

**Test Successo:**
- [ ] Successo skill check
- [ ] Cutscene contatto Stazione Delta
- [ ] Componenti rimossi
- [ ] 600 XP + walkie_talkie
- [ ] Quest completa
- [ ] Journal: "[SCOPERTA] Stazione Delta"

**Test Fallimento:**
- [ ] Fallimento skill check
- [ ] Torre fritta
- [ ] Componenti persi
- [ ] Quest failed
- [ ] 100 XP

### Repair Quest #3: L'Acqua della Vita

**Setup:**
- [ ] Trova `unique_water_treatment_plant` (Città)
- [ ] Scegli "Ispeziona i sistemi"
- [ ] Quest `water_of_life` auto-start (4 stage)

**Stage 1: Manuale**
- [ ] Trova `hydraulic_manual`
  - [ ] Fonte: Biblioteche, uffici tecnici
- [ ] Quest avanza a Stage 2

**Stage 2: Filtri**
- [ ] Raccogli 3× `industrial_filter`
  - [ ] Fonte: Magazzini industriali, fabbriche
- [ ] Quest avanza a Stage 3

**Stage 3: Batteria**
- [ ] Trova `vehicle_battery`
  - [ ] Fonte: Camion abbandonati, officine
- [ ] Quest avanza a Stage 4

**Stage 4: Riparazione**
- [ ] Torna a `unique_water_treatment_plant`
- [ ] Opzione [QUEST] "Ripara l'impianto" visibile
- [ ] Skill check Investigare DC 16

**Test Successo:**
- [ ] Successo skill check
- [ ] Cutscene impianto riattivato
- [ ] Tutti componenti rimossi
- [ ] 800 XP
- [ ] worldState.waterPlantActive = true
- [ ] worldState.waterPlantLocation settato
- [ ] Quest completa
- [ ] Journal: "[EREDITÀ] Impianto attivo"

**Test World Change:**
- [ ] Vai in area vicina all'impianto
- [ ] Usa Active Search [F]
- [ ] Verifica maggiore probabilità acqua pulita
- [ ] (Richiede implementazione in performActiveSearch)

**Test Fallimento:**
- [ ] Fallimento skill check
- [ ] Impianto distrutto
- [ ] Componenti persi
- [ ] Quest failed
- [ ] 150 XP

---

## 💾 TEST PERSISTENZA GLOBALE

### Save/Load con Tutte le Quest

**Setup Complesso:**
- [ ] Attiva 3-4 quest simultaneamente
- [ ] Progredisci parzialmente ognuna:
  - [ ] Echi: 2/5 consegnati
  - [ ] Segni Cenere: Stage 2/4
  - [ ] Bounty: 2/3 kill
  - [ ] Repair: Stage 1/2
- [ ] Salva partita (slot 1)

**Verifica Load:**
- [ ] Carica partita (slot 1)
- [ ] Premi [J] → Tutte quest attive visibili
- [ ] Verifica obiettivi corretti per ogni stage
- [ ] Verifica gameFlags preservati
- [ ] Verifica questKillCounts preservato
- [ ] Completa una quest
- [ ] Verifica funzionamento normale

### Export/Import JSON
- [ ] Con quest attive, Export slot
- [ ] Elimina slot
- [ ] Import JSON
- [ ] Verifica tutto ripristinato

---

## 🔄 TEST INTEGRAZIONE SISTEMI

### Dialogue → Quest → Inventory
- [ ] Parla con Anya
- [ ] Opzioni [ECHO] appaiono solo con item
- [ ] Consegna item
- [ ] Item rimosso
- [ ] Ricompensa ricevuta
- [ ] Dialogo termina correttamente

### Event → Quest → Completion
- [ ] Evento avvia quest
- [ ] Quest visibile in [J]
- [ ] Progresso tracciato
- [ ] Completamento da evento
- [ ] Ricompense assegnate

### Combat → Kill Count → Quest
- [ ] Bounty attiva
- [ ] Combatti nemico target
- [ ] Vinci
- [ ] Kill count incrementa
- [ ] Console log corretto
- [ ] Quest completa al target

---

## ⚠️ TEST EDGE CASES

### Fallimenti Permanenti
- [ ] Repair quest con skill check fallito
- [ ] Quest NON in completedQuests
- [ ] Quest NON in activeQuests
- [ ] Componenti persi
- [ ] Impossibile ritentare

### Quest Simultanee
- [ ] 5+ quest attive contemporaneamente
- [ ] Tutte visibili in [J]
- [ ] Progresso indipendente
- [ ] Nessun conflitto

### Conditional Dialogue
- [ ] Opzioni [QUEST] appaiono solo se:
  - [ ] Quest attiva
  - [ ] Item posseduto (se richiesto)
  - [ ] Stage corretto
- [ ] Opzioni scompaiono dopo consegna

---

## 🐛 CHECKLIST ERRORI COMUNI

### Console Errors
- [ ] Nessun "Quest not found"
- [ ] Nessun "Item not found"
- [ ] Nessun "Dialogue not found"
- [ ] Nessun "undefined" in logs

### UI Errors
- [ ] Quest Screen rendering corretto
- [ ] Nessun overflow testo
- [ ] Colori corretti (yellow quest, green complete)
- [ ] [J] apre/chiude correttamente

### State Errors
- [ ] Nessun quest duplicata
- [ ] Kill counts non negativi
- [ ] Flags non duplicati
- [ ] WorldState coerente

---

## 📊 METRICHE SUCCESSO

### Completamento Minimo
- [ ] Almeno 1 quest per pacchetto completata
- [ ] Nessun crash durante gameplay
- [ ] Save/Load funzionante
- [ ] Tutti PNG accessibili

### Completamento Ideale
- [ ] Tutte 9 nuove quest testate
- [ ] Successo E fallimento testati
- [ ] Persistenza verificata
- [ ] Edge cases coperti

---

## 🎯 PRIORITÀ TESTING

### Priorità Alta (Critici)
1. Quest start/complete correttamente
2. Save/Load preserva stato
3. Kill count tracking funziona
4. Dialogue conditional options corrette

### Priorità Media (Importanti)
5. Ricompense assegnate correttamente
6. Flags settati e verificati
7. World state modifications
8. Skill checks bilanciati

### Priorità Bassa (Nice-to-have)
9. Cutscene text formatting
10. Journal color coding
11. Audio feedback
12. UI polish

---

## ✅ SIGN-OFF FINALE

**Tester:** _______________  
**Data:** _______________  
**Versioni Testate:** v1.8.1 ☐ | v1.8.2 ☐ | v1.8.3 ☐ | v1.8.4 ☐  
**Bugs Critici Trovati:** _______________  
**Stato:** ☐ APPROVED | ☐ NEEDS FIXES

---

**Fine Guida Testing**

📅 **Creato:** 31 Ottobre 2025  
🎯 **Scope:** 4 pacchetti subquest (v1.8.1-1.8.4)  
⏱️ **Tempo Stimato:** 8-12 ore  
✍️ **Autore:** Kilo Code (Claude Sonnet 4.5)