
# The Safe Place - Progetto React

Questo repository contiene il codice sorgente di **The Safe Place**, un progetto suddiviso in due parti principali: il gioco e il sito web dedicato. Entrambi sono sviluppati in React e TypeScript, ma gestiti come progetti separati all'interno di questa monorepo.

## Struttura del Repository

-   `GAME/`: Contiene il codice sorgente del gioco vero e proprio.
-   `SITO/`: Contiene il codice sorgente del sito web di presentazione.

---

## 🏛️ Architettura di Deployment

L'architettura di questo progetto è pensata per un deployment su un unico dominio con la seguente struttura:

-   **Sito Web (Landing Page):** Il contenuto del progetto `SITO` viene servito dalla **root** del dominio (es. `https://thesafeplace.runtimeradio.it/`).
-   **Gioco:** Il contenuto del progetto `GAME` viene servito da una **sottocartella** (es. `https://thesafeplace.runtimeradio.it/gioco/`).

Entrambi i progetti sono già configurati per supportare questa struttura. Il sito punta a una sottocartella per avviare il gioco, e il gioco è configurato per caricare tutte le sue risorse in modo relativo, garantendo la piena funzionalità.

---

## 🎮 The Safe Place - Il Gioco

Il cuore del progetto, un'avventura testuale con elementi GDR sviluppata per il web.

### Stack Tecnologico

-   **Framework**: [React](https://react.dev/) (`v19.2.0`)
-   **Linguaggio**: [TypeScript](https://www.typescriptlang.org/) (`v5.8.2`)
-   **Build Tool**: [Vite](https://vitejs.dev/) (`v6.2.0`)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand) (`v5.0.8`)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (`v4.1.14`) + **Custom CRT Shaders**
-   **Graphics**: **Custom SVG Tileset** (Ultima IV/V Style)
-   **Testing**: [Vitest](https://vitest.dev/) e [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Struttura del Progetto `GAME/`

Il codice è organizzato in cartelle specifiche per separare le responsabilità:

-   `assets/`: Contiene asset grafici e dati relativi (tileset, canvas, ecc.).
-   `components/`: Tutti i componenti React che formano le schermate del gioco (es. `MainMenuScreen`, `InventoryScreen`, `CombatScreen`).
-   `data/`: Gestisce i dati statici del gioco come dialoghi, nemici, oggetti, quest e ricette, spesso tramite file `.json` e moduli TypeScript che li elaborano.
-   `hooks/`: Custom hooks di React per logiche riutilizzabili (es. `useKeyboardInput`).
-   `log/`: Un changelog dettagliato suddiviso per versione, utile per tracciare l'evoluzione del progetto.
-   `services/`: Servizi che incapsulano la logica di business del gioco (es. `gameService`, `questService`).
-   `store/`: Contiene la configurazione dello store globale gestito con Zustand.
-   `scripts/`: Script di utility, come la validazione dei dati di gioco.

### Installazione e Avvio

Per eseguire il gioco in ambiente di sviluppo locale:

1.  **Naviga nella cartella del gioco:**
    ```bash
    cd GAME
    ```
2.  **Installa le dipendenze:**
    ```bash
    npm install
    ```
3.  **Avvia il server di sviluppo:**
    ```bash
    npm run dev
    ```
    Il gioco sarà accessibile all'indirizzo `http://localhost:3000`.

### Script Disponibili

-   `npm run dev`: Avvia il server di sviluppo.
-   `npm run build`: Compila il progetto per la produzione.
-   `npm run preview`: Avvia un server locale per testare la build di produzione.
-   `npm run test`: Esegue i test con Vitest.
-   `npm run validate:data`: Lancia lo script di validazione per i dati di gioco.

---

## 🌐 The Safe Place - Sito Web

Il sito web ufficiale del gioco, dove vengono presentate le caratteristiche principali, la storia e gli aggiornamenti.

### Stack Tecnologico

-   **Framework**: [React](https://react.dev/) (`v18.2.0`)
-   **Linguaggio**: [TypeScript](https://www.typescriptlang.org/) (`v5.4.5`)
-   **Build Tool**: [Vite](https://vitejs.dev/) (`v5.3.1`)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (`v3.4.4`)
-   **Linting**: [ESLint](https://eslint.org/)

### Installazione e Avvio

Per eseguire il sito in ambiente di sviluppo locale:

1.  **Naviga nella cartella del sito:**
    ```bash
    cd SITO
    ```
2.  **Installa le dipendenze:**
    ```bash
    npm install
    ```
3.  **Avvia il server di sviluppo:**
    ```bash
    npm run dev
    ```
    Il sito sarà accessibile all'indirizzo predefinito da Vite (solitamente `http://localhost:5173`).

### Script Disponibili

-   `npm run dev`: Avvia il server di sviluppo.
-   `npm run build`: Compila il progetto per la produzione.
-   `npm run lint`: Esegue l'analisi statica del codice con ESLint.
-   `npm run preview`: Avvia un server locale per testare la build di produzione.
