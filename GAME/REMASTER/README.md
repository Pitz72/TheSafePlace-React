## Current### Versione Attuale: 0.0.6 (Gameplay Integration)

- **Engine:** React 18 + Phaser 3 + Zustand
- **Stato:** Alpha / Prototipazione Avanzata
- **Ultime Modifiche:**
    - Integrazione Creazione Personaggio.
    - Implementazione Game Rules (Biomi, Statistiche).
    - Data Binding completo per UI (Status, Inventory, Log).
    - Fix grafici e tecnici. project.
- **v0.0.2**: Integrated Original Map & Player Sprite. Fixed layout to 16:9.
- **v0.0.1**: Initial Project Setup (Vite + React + Phaser + Ink).

## 📝 Descrizione
Questa è la versione **Remastered** di "The Safe Place".
Il progetto è stato riscritto da zero per garantire scalabilità, performance e una migliore gestione della narrativa.

### ✅ Stato Attuale
- **Core Architecture:** Funzionante.
- **Narrative Pipeline:** Funzionante.
- **RPG Systems:** Stats, Skills, Inventory.
- **World System:**
    - Mappa Originale Integrata (ASCII -> Tilemap).
    - Grid Movement (10 min/step).
    - Zoom & Camera Follow ottimizzati.
- **UI/UX:**
    - Layout 16:9 "Cinema Mode".
    - HUD Ibrido (React overlay su Phaser).

## 🛠️ Tech Stack
- **Phaser 3:** Motore di gioco (Rendering, Fisica, Input).
- **Ink (inkjs):** Motore narrativo (Dialoghi, Scelte).
- **React:** Layer UI (HUD, Menu, Inventario).
- **TypeScript:** Logica Core.
- **Vite:** Build tool.

## 🚀 Come Avviare
1.  `npm install`
2.  `npm run dev`

## 📂 Struttura
- `src/core`: Logica pura, Eventi, Store.
- `src/engine`: Scene e configurazione Phaser.
- `src/narrative`: Wrapper per Ink.
- `src/ui`: Componenti React.
