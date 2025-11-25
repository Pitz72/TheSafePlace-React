# ROADMAP - The Safe Place REMASTER

Questo documento traccia il percorso di sviluppo per il completamento del gioco e definisce la filosofia tecnica da seguire.

## 🧠 Filosofia di Sviluppo

### 1. NO GOD OBJECT
- **Regola Aurea:** Evitare classi o file monolitici (es. un singolo `Main.ts` che fa tutto).
- **Soluzione:** Suddividere la logica in moduli piccoli e specializzati (es. `GameRules`, `MapManager`, `InputHandler`).
- **Stato:** Utilizzare Zustand per lo stato globale, evitando di passare props in profondità o usare singleton globali complessi.

### 2. Componenti Puri & UI
- L'UI (React) deve essere **puramente reattiva**.
- I componenti non devono contenere logica di gioco complessa, ma solo visualizzare dati dagli Store e inviare comandi.
- Separazione netta tra **Logica di Gioco** (Phaser/Typescript puro) e **Livello di Presentazione** (React).

### 3. Configurabilità
- Evitare "magic numbers" nel codice.
- Usare costanti in `constants.ts` o file di configurazione dedicati per parametri di gioco (costi movimento, statistiche iniziali, ecc.).

---

## 🗺️ Percorso di Completamento

### Fase 1: Fondamenta (Completata ✅)
- [x] Setup Progetto (Vite/React/TS).
- [x] Integrazione Phaser.
- [x] Sistema di Mappa (Tileset Ultima).
- [x] Movimento Base.

### Fase 2: UI & Core Loop (Completata ✅)
- [x] Layout "Modern Retro" (CRT, Grid).
- [x] Pannelli Informativi (Status, Stats, Inventory, Log).
- [x] Creazione Personaggio.
- [x] Regole di Gioco Base (Biomi, Statistiche).
- [x] Data Binding (Store -> UI).

### Fase 3: Contenuti & Interazione (DA FARE 🚧)
Questa è la fase attuale. L'obiettivo è rendere il mondo "vivo".

- [ ] **Sistema di Interazione:**
    - [ ] Interagire con oggetti sulla mappa (Ceste, Cartelli, NPC).
    - [ ] Raccogliere oggetti (Looting).
- [ ] **Inventario Avanzato:**
    - [ ] Usare oggetti (es. mangiare cibo, bere acqua).
    - [ ] Equipaggiare oggetti (Armi, Armature).
    - [ ] Droppare oggetti.
- [ ] **Sistema Narrativo (Ink):**
    - [ ] Integrare `inkjs` per i dialoghi.
    - [ ] Creare finestra di dialogo modale.
    - [ ] Collegare eventi di gioco alle storie (es. entrare in una città).

### Fase 4: Combattimento & Progressione
- [ ] **Combattimento:**
    - [ ] Incontri casuali o nemici su mappa.
    - [ ] UI di combattimento (a turni o real-time, da definire).
- [ ] **Progressione:**
    - [ ] Guadagno XP.
    - [ ] Level Up e aumento statistiche.

### Fase 5: Audio & Salvataggio
- [ ] **Audio:**
    - [ ] Effetti sonori (passi, UI, azioni).
    - [ ] Musica di sottofondo dinamica.
- [ ] **Persistenza:**
    - [ ] Salvare/Caricare partita (LocalStorage o File).

### Fase 6: Polish & Release
- [ ] Bilanciamento valori.
- [ ] Test completi.
- [ ] Ottimizzazione performance.

---

## 📝 Note per le Future Sessioni
- **Controllare sempre `task.md`** per lo stato corrente dettagliato.
- **Mantenere `types.ts` pulito:** Se un file diventa troppo grande, spezzarlo in `types/character.ts`, `types/map.ts`, ecc.
- **Non rompere la build:** Eseguire sempre un controllo dei tipi prima di concludere un task complesso.
