## **VERSIONE 1.4.3** - "Echoes of the Past & Ash Nests"
- **Nuovi Eventi Lore:** Aggiunti due eventi lore che approfondiscono la storia del mondo:
    - **"L'Ultimo Messaggio"**: Rivelazioni sulla "Guerra Inespressa" e il "Grande Silenzio", introducendo il "Progetto Eco" come un'interfaccia neurale collettiva.
    - **"Il Nido della Cenere"**: Approfondisce la natura degli Angeli della Cenere, rivelando che raccolgono e trasformano i corpi umani, aggiungendo un senso di orrore cosmico.
- **Miglioramenti Eventi Lore Esistenti:**
    - **"L'Eco di una Tosse"**: Descrizione della malattia resa più specifica per aumentare la profondità narrativa.
    - **"Voci nel Silenzio"**: La scelta di riparare la radio ora ricompensa con un oggetto quest "Registrazione Criptica", bilanciando la scelta con una ricompensa tangibile a lungo termine.

---

## **VERSIONE 1.4.1** - "The Humanoid Fix"
- **Fix Narrativo Critico (CS_FIRST_KILL):** Risolto un bug che attivava una cutscene sull'uccisione di un umano dopo aver sconfitto un animale. La cutscene ora si attiva correttamente solo dopo la prima vittoria contro un nemico umanoide.
- **Categorizzazione Nemici:** Introdotta la distinzione tra nemici `humanoid` e `beast` per tutti i 14 nemici, garantendo coerenza narrativa.
- **Fix Trigger Cutscene Essenziali:**
    - `CS_BEING_WATCHED`: Ora si attiva automaticamente al giorno 3, garantendo che ogni giocatore veda l'introduzione degli Angeli della Cenere.
    - `CS_ASH_LULLABY`: Ora si attiva al primo rifugio notturno dal giorno 3 in poi, assicurando che la rivelazione chiave sulla madre non venga mancata.
- **4 Nuove Cutscene Contestuali:** Aggiunte brevi scene narrative che si attivano in momenti chiave del gioco (prima scelta morale, ingresso in città, livello 5, HP bassi) per aumentare l'impatto emotivo.
- **Bonus Meccanico "Sull'Orlo":** Scendere sotto il 10% di HP per la prima volta non solo attiva una cutscene, ma fornisce anche un bonus permanente a tutte le statistiche.
- **Impatto:** Trasforma l'esperienza da "narrativamente fragile" a "narrativamente robusta", garantendo che ogni momento chiave della storia venga vissuto dal giocatore.

---

## **VERSIONE 1.0.1** - "Segreti e Conseguenze"
- Sistema Easter Egg (eventi rari 2% probabilità, 4 eventi segreti)
- Nuovi oggetti speciali per Easter Egg
- Meccanica `revealMapPOI` per rivelare punti di interesse
- Game Over contestuali (cause morte specifiche: combattimento, fame, veleno, ambiente)
- Game Over Easter Egg ironico (10% probabilità: "Sei morto di... MORTE!")
- Componente `GameOverScreen.tsx` con messaggi dinamici

---

## **VERSIONE 1.0.2** - "Il Sentiero della Gloria"
- Sistema Trofei completo: 50 trofei unici
- Copertura trofei per: missione principale, esplorazione, sopravvivenza, combattimento, crafting, sviluppo personaggio, allineamento morale, segreti
- Schermata Trofei (`TrophyScreen.tsx`) con trofei nascosti
- Notifiche trofei sbloccati in gioco (colore dorato)
- Database trofei (`data/trophies.json`)
- Store dedicato (`useTrophyDatabaseStore`)
- Tracking progressi con `unlockedTrophies: Set<string>`

---

## **VERSIONE 1.0.3** - "Coerenza Narrativa e Visiva"
- Fix colori diario di viaggio (ripristino colori unici per tipo evento)
- Fix colori in modalità Alto Contrasto
- Fix testo "Generazione statistiche in corso" in creazione personaggio
- Trigger Missione Principale legati al tempo (no trigger notturni tranne per capitoli specifici)
- Flag `allowNightTrigger` per capitoli notturni specifici
- Maggiore immersione narrativa tempo/trama

---

## **VERSIONE 1.1.0** - "Refactoring Architetturale e Nuove Meccaniche"
- Service Layer (`gameService.ts`) per logica business
- Sistema Salvataggio modulare v2.0 con `toJSON()` e `fromJSON()` per ogni store
- Gestione salvataggi centralizzata (`saveGameService.ts`)
- Sistema Stanchezza (Fatigue): aumenta con tempo/movimento/combattimento, applica penalità
- Sistema Sovraccarico (Encumbrance): limite peso basato su Forza, aumenta fatica
- Crafting potenziato: ricette con risultati multipli
- Indicatori UI per Stanchezza e SOVRACCARICO
- Feedback peso in inventario (corrente/massimo)
- Flash rosso a schermo per danni
- Feedback audio esteso
- Script validazione dati (`npm run validate:data`)

---

## **VERSIONE 1.1.1** - "Bug Fix Critici"
- Fix import path `saveGameService` (crash avvio)
- Fix rifugi non attivabili (decommentata `enterRefuge()`)
- Fix crash schermo crafting (optional chaining per `results` e `ingredients`)
- Import mancanti aggiunti
- Defensive programming implementato

---

## **VERSIONE 1.1.2** - "Production Ready"
- **SECURITY:** Rimossa `GEMINI_API_KEY` da `vite.config.ts`
- Font VT323 self-hosted (FCP +62%: da 3.5s a 1.2s)
- Rimozione Tailwind CDN (zero warning, CSS ottimizzato)
- HTML minimale (da 178 righe a 28 righe, -84%)
- Base path flessibile (`base: './'`) per deploy ovunque
- Favicon personalizzata (5 formati: SVG, PNG 32/16, Apple, Android)
- Meta tags SEO + Open Graph
- Componente `ErrorScreen.tsx`
- Error handling robusto in `App.tsx`
- Lighthouse score stimato: +20 punti Performance

---

## **VERSIONE 1.1.3** - "The Great Debugging Session"
- Fix path database da `./data/` a `/data/`
- Ripristinato `base: '/'` in vite.config
- Rimossa validazione errata database in `App.tsx`
- Logging debug in tutti i database stores
- **ROLLBACK COMPLETO:** Ripristinato Tailwind CDN (v4 incompatibile)
- **ROLLBACK:** Ripristinato Google Fonts CDN
- CSS inline completo in `index.html` (temi, effetti CRT, animazioni)
- Documentato: "NON AGGIORNARE MAI TAILWIND CSS"

---

## **VERSIONE 1.2.0** - "Massive Content Expansion"
- **88 nuovi eventi** distribuiti per bioma (Pianura: 23, Foresta: 22, Città: 23, Villaggio: 21)
- **12 nuovi nemici** (3 per bioma + 3 universali)
- **7 nuovi talenti** (livelli 2, 5, 8)
- **14 nuove ricette crafting** (armi, armature, consumabili, utility)
- **5 nuovi status conditions** (Ipotermia, Esausto, Affamato, Disidratato, Infezione)
- **4 nuove armature Legs** (pantaloni logori → gambali corazzati)
- **4 nuove cutscene narrative**
- **~90 descrizioni combattimento** narrative
- Sistema status auto-applicazione/rimozione
- HP loss automatico ogni ora per status dannosi
- Manuali crafting come loot
- Progressione armature completa (Head, Chest, Legs)

---

## **VERSIONE 1.2.1** - "QoL & Global Trophy System"
- Font schermata PRESENTS ridotto 25%
- Box testo allargato (da `max-w-7xl` a `w-[90%]`)
- Cursore lampeggiante fixato (opacity)
- Istruzioni completamente riscritte (+150% lunghezza)
- Sezioni istruzioni organizzate (Movimento, Tempo, Inventario, Combattimento, Scelte)
- **Save slots da 3 a 5**
- **Export salvataggi in JSON** (nome: `TSP_Save_Slot1_Lv5_Day12_2025-10-19.json`)
- **Import salvataggi da JSON** con validazione
- **Elimina salvataggi** con conferma
- Migrazione automatica save 1.0.0 → 2.0.0
- **Trofei Globali Permanenti** (localStorage separato: `tsp_global_trophies`)
- Service `globalTrophyService.ts`
- Trofei persistono anche senza salvare partita
- Indicatore "(Globale)" per trofei permanenti
- Documentazione completa sistema trofei globali

---

## **VERSIONE 1.2.2** - "Leggibilità e Accessibilità"
- **Fix critico:** Import `src/index.css` in `index.tsx` (CSS non veniva caricato)
- **Font interfaccia gioco aumentati +69%** (da quasi illeggibili a perfettamente leggibili)
- Override CSS modulare per `.game-screen-container` (solo GameScreen)
- Font schermata presentazione aumentati +20%
- Fix colore testo "Generazione statistiche in corso" (verde standard)
- Fix cursore lampeggiante creazione personaggio (no reflow, usa opacity)
- **Sistema esportazione salvataggi keyboard-driven completo:**
  - Menu SAVE: opzione "Esporta Slot in File JSON"
  - Menu LOAD: opzione "Importa da File JSON"
  - Modalità Export dedicata con navigazione slot
  - Keybindings: [E] Esporta, [I] Importa, [D] Elimina, [A] Azioni, [ESC] Annulla
- Footer comandi contestuali dinamici
- Titolo menu dinamico per modalità export
- Backup configurazioni CSS multiple

---

**RIEPILOGO STATISTICHE FINALI v1.2.2:**
- Eventi totali: 101 (+741% da v1.0.3)
- Nemici: 17 (+240%)
- Talenti: 10 (+233%)
- Ricette: 20 (+233%)
- Cutscene: 8 (+100%)
- Status: 8 (+166%)
- Slot Armor: 3 completi
- Slot Save: 5
- Trofei: 50 (globali permanenti)
- Interfaccia: 100% keyboard-driven
- Performance: Lighthouse ~92/100
- Leggibilità: **RISOLTA** ✅

---

## **VERSIONE 1.2.3** - "Critical Bugfix & Game Balance"
- Fix crafting bloccante: oggetti craftati appaiono correttamente, nessun disequipaggiamento
- Validazione robusta database con error handling per race conditions
- Database sincronizzati: recipes.json e talents.json allineati
- Sistema stanchezza ribilanciato: Quick Rest recupera 15 fatica, cibo/bevande +10 fatica
- Riposo notturno rifugi: 50 fatica (bilanciato), riposo diurno: 15 fatica
- Status ESAUSTO: soglia aumentata a 85 fatica
- Fix menu rifugio: cursore si resetta correttamente dopo riposo
- Sistema RNG combattimenti verificato: 7% probabilità per step (corretto)
- Gestione fatica sostenibile per 16 ore di esplorazione

---

## **VERSIONE 1.2.4** - "Quality of Life & Balance Fixes"
- Fix bug cutscene: risolto crash dopo eventi narrativi
- HP sempre numeri interi: eliminati decimali nei punti salute
- Sonno rifugi sempre consentito: con risorse (100% HP + 50 fatica), senza risorse (30% HP + 25 fatica + MALATO)
- Talenti duplicati: i talenti già appresi non compaiono più al level-up
- Bussola morale visibile: barra allineamento Lena-Elian chiaramente leggibile
- Acqua: drop rate +25%, quantità raddoppiata/triplicata negli eventi
- Manuali crafting: probabilità rifugi aumentata dal 3% al 20%
- Nuovo sistema loot: 15 oggetti diversi invece di 3, loot table pesata
- Bilanciamento: sfidante ma elimina situazioni di stallo inevitabili

---

## **VERSIONE 1.3.0** - "The Survival Overhaul"
- **Sistema Purificazione Acqua:** 3 nuove ricette, 4 nuovi materiali
- Ricette: Purifica Acqua, Raccogli Acqua, Benda di Fortuna
- Materiali: Acqua Contaminata, Bottiglia Vuota, Straccio Pulito, Nastro Adesivo
- **Ricerca Attiva (Tasto F):** Nuova meccanica proattiva per cercare risorse
- Loot specifico per bioma: acqua in pianura, legna in foresta, metallo in città, cibo in villaggio
- Bonus tile Fiume: acqua garantita + idratazione immediata
- Talento Scavenger raddoppia quantità trovate
- **Starter Kit Completo:** 2 acqua, 2 cibo, 3 bende, materiali crafting
- **5 Ricette Iniziali** (era 3): cure base e gestione acqua accessibili dall'inizio
- **Loot da Combattimenti:** Nemici droppano materiali e consumabili
- 3 tier loot (common/uncommon/rare) basati su potenza nemico
- Loot rifugi ampliato: 15 oggetti nel pool (+50%)
- Skill Sopravvivenza centrale per gameplay
- Risultato: morte sempre conseguenza di decisioni, non di RNG

---

## **VERSIONE 1.3.1** - "The Survival Overhaul II"
- Revisione completa sistema sopravvivenza
- Sistema purificazione acqua con ciclo completo: raccolta, filtrazione, consumo
- Ricerca Attiva (F): meccanica proattiva per cercare risorse (CD Sopravvivenza 10, 30 min)
- Loot specifico per bioma: pianura (acqua), foresta (legna), città (metallo), villaggio (cibo)
- Starter kit potenziato: 2 acqua, 2 cibo, 3 bende, materiali per crafting
- 5 ricette iniziali invece di 3: cure base accessibili dall'inizio
- Loot da combattimenti: materiali e consumabili da nemici sconfitti
- 3 tier di loot (common/uncommon/rare) basati su potenza
- Scavenger: 2 roll invece di 1 sui nemici
- Loot rifugi espanso: 15 oggetti diversi (prima 10)
- Skill Sopravvivenza diventa centrale invece che situazionale
- Giocatore passa da passivo a proattivo nel controllo risorse

---

## **VERSIONE 1.3.2** - "The Medical Overhaul"
- **Problema risolto:** Status incurabili (AVVELENATO quasi impossibile, INFEZIONE incurabile)
- **2 Nuovi Oggetti Curativi:**
  - Antibiotici (MED_ANTIBIOTICS): cura MALATO + 15 HP (uncommon)
  - Erbe Curative (MED_HEALING_HERBS): cura INFEZIONE + 10 HP (uncommon)
- **2 Nuove Ricette:**
  - Antibiotici: 2x Antibiotici Scaduti + Sostanze Chimiche + Disinfettante (Medicina DC 16)
  - Erbe Curative: 2x Funghi + Bacche (Medicina DC 12)
- **Eventi Città Potenziati:**
  - Farmacia: Antibiotici validi + opzione frigorifero con Antidoti
  - Ospedale Abbandonato (NUOVO): fonte ripetibile di cure avanzate
- **Eventi Foresta/Villaggio:**
  - Rifugio Eremita: orto con Erbe Curative
  - Clinica Medico: Antibiotici + giardino medicinale
- Descrizioni oggetti aggiornate per chiarezza immediata
- Distribuzione logica: Città (medicine moderne), Foresta (rimedi naturali), Villaggio (mix)
- Skill Medicina diventa centrale per accesso cure migliori
- Ogni status ha almeno 2 vie di cura (crafting + eventi)
- **Bug Fix Critico:** Crash combattimento per `unlockedTalents` e `addItem` mancanti in combatStore
- Risultato: nessuno status più incurabile, morte sempre conseguenza di scelte