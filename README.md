# The Safe Place - v0.9.3 "Modularization and Fix"

## 📜 Descrizione

**The Safe Place** è un gioco di ruolo (GDR) retro-computazionale a fosfori verdi, progettato per emulare l'atmosfera dei CRT degli anni '80, combinata con un sistema di gioco avanzato basato su meccaniche D&D-style.

Questa versione, **0.9.3 "Modularization and Fix"**, rappresenta un'importante ristrutturazione architettonica del progetto. Il cuore dell'applicazione è stato refattorizzato da un singolo, monolitico "game store" a un'architettura modulare e robusta basata su 8 store specializzati (UI, Personaggio, Inventario, Mondo, Eventi, Meteo, Rifugi, Salvataggio).

Questo cambiamento migliora drasticamente la manutenibilità, la scalabilità e la stabilità del codice, ponendo le basi per future espansioni del gioco.

## 🚀 Avvio Rapido

Per avviare il progetto in modalità di sviluppo locale, seguire questi passaggi:

1.  **Installare le dipendenze:**
    ```bash
    npm install
    ```

2.  **Avviare il server di sviluppo:**
    ```bash
    npm run dev
    ```
    Il gioco sarà accessibile all'indirizzo `http://localhost:5173` (o la porta indicata nel terminale).

## 🧪 Eseguire i Test

Per verificare l'integrità del codice e l'assenza di regressioni, è possibile eseguire la suite di test completa:

```bash
npm test
```

---
*© 2025 Runtime Radio - Simone Pizzi*
