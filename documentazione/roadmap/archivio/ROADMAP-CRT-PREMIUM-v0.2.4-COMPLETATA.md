# ROADMAP - Implementazione CRT Premium e Consolidamento Tailwind

**Versione Target:** v0.2.4
**Stato:** In Corso

---

## Piano di Implementazione

Questo documento traccia l'implementazione del nuovo sistema CRT Premium e il completamento della migrazione a Tailwind CSS. Ogni fase verrà segnata come completata prima di procedere alla successiva.

### FASE 1: Setup e Consolidamento Stili CRT

- [x] **1.1 Creazione del file `src/styles/crt-premium.css`**: Centralizzare tutti gli stili dell'effetto CRT in un unico file dedicato per manutenibilità e chiarezza.
- [x] **1.2 Definizione Stili Base CRT Premium**: Migrare e potenziare gli stili CRT esistenti da `index.css` nel nuovo file, includendo scanlines, curvatura, vignette e animazioni.
- [x] **1.3 Importazione del nuovo file CSS in `main.tsx`**: Assicurarsi che gli stili vengano caricati globalmente.

### FASE 2: Applicazione Globale dell'Overlay CRT

- [x] **2.1 Modifica di `App.tsx`**: Introdurre un `div` overlay a livello radice dell'applicazione che applichi l'effetto CRT Premium su tutto il contenuto.
- [x] **2.2 Rimozione delle vecchie classi CRT**: Eliminare le classi CRT legacy (`.crt-screen`, `.scan-lines`, `.game-container`) dai componenti e da `index.css` per evitare conflitti.

### FASE 3: Pulizia e Ottimizzazione Tailwind

- [x] **3.1 Rimozione delle utility CRT da `tailwind.config.js`**: Eliminare le classi di utility CRT semplificate che non sono più necessarie.
- [x] **3.2 Verifica e Refactoring**: Ispezionare i componenti per assicurarsi che la migrazione a Tailwind sia completa e che non ci siano stili inline o classi CSS residue.

### FASE 4: Verifica Finale e Convalida

- [x] **4.1 Test Anti-Regressione**: Verificare che l'implementazione non abbia introdotto bug visivi o funzionali.
- [x] **4.2 Aggiornamento Documentazione**: Aggiornare `CHANGELOG.md` e altri documenti rilevanti per riflettere le modifiche.
- [x] **4.3 Convalida Finale**: Conferma del completamento con successo della migrazione e dell'implementazione.