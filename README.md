# The Safe Place Chronicles: The Echo of the Journey

![version](https://img.shields.io/badge/gioco-v3.1.0-blue.svg)
![platform](https://img.shields.io/badge/desktop-Windows%20%7C%20Linux-informational.svg)
![status](https://img.shields.io/badge/stato-completabile-brightgreen.svg)

Un **gioco di ruolo narrativo di sopravvivenza** in un'Europa post-apocalittica. Il giocatore — *Ultimo* — attraversa una mappa devastata per raggiungere il **Safe Place**, gestendo risorse, incontri, combattimenti e scelte morali, mentre gli "Echi della Memoria" svelano il suo passato fino al confronto finale.

Dalla **3.0** il gioco ha un'identità visiva nuova, disegnata da zero: illustrazioni vettoriali al crepuscolo, una mappa del mondo dipinta in tempo reale con luce del giorno e meteo, un'interfaccia da gioco narrativo moderno. Nessun terminale, nessun CRT, nessun pixel. Con la **3.1** anche il suono cambia: niente più beep, ma suoni morbidi di legno, feltro e vetro e un paesaggio sonoro che segue luogo, ora e meteo (vento, pioggia, uccelli all'alba, grilli di notte), tutto sintetizzato in tempo reale.

Progetto di **Simone Pizzi** / **Runtime Radio**, nato come esperimento sul portare in fondo un videogioco non banale con l'aiuto di un LLM.

> **Stato**: il gioco è **giocabile dall'inizio alla fine** (nuova partita → 12 capitoli di trama → Safe Place → epilogo secondo la bussola morale → THE END) e tutte le 21 quest si possono completare: dalla v2.1.0 lo verificano test automatici che giocano ogni quest. Il progetto viene distribuito come applicazione desktop. Ultima release pubblicata: **[v3.1.0](../../releases/tag/v3.1.0)** (22 ottobre 2026).

---

## 📦 Download

Gli installer per Windows e Linux vengono prodotti dalla GitHub Action **Release** e pubblicati nella pagina **[Releases](../../releases)**:

| OS | Formati |
|----|---------|
| **Windows** | `.exe` (installer NSIS) |
| **Linux** | `.AppImage` · `.deb` |

macOS non è più incluso nelle release (app non firmata, nessun certificato): chi ha un Mac può comunque costruire l'app da sorgente con `npm run dist:mac`. Il gioco non ha un aggiornamento automatico: le nuove versioni si scaricano a mano dalla pagina Releases.

---

## 🗂️ Struttura del repository

| Cartella | Contenuto |
|----------|-----------|
| [`GAME/`](./GAME) | Il gioco — React 19 + TypeScript + Zustand + Ink, impacchettato come app desktop con Electron |
| [`SITO/`](./SITO) | Sito web di presentazione (progetto separato) |
| [`GDD/`](./GDD) | Game Design Document completo e agnostico dal motore — la "bibbia" del design |
| [`COVER-UFFICIALE/`](./COVER-UFFICIALE) | Copertine, poster, key art e icona ufficiali, con la direzione artistica e i prompt per i generatori di immagini |

---

## 🎮 Il gioco (`GAME/`)

**Stack**: React 19 · TypeScript 5.8 · Vite 6 · Zustand 5 · [Ink](https://www.inklestudios.com/ink/) (narrativa) · Tailwind CSS · mappa illustrata su HTML Canvas e grafica vettoriale SVG · packaging [Electron](https://www.electronjs.org/) + electron-builder.

### Eseguire da sorgente (sviluppo)

```bash
cd GAME
npm install
npm run dev        # http://localhost:3000
```

### Costruire gli installer desktop

```bash
cd GAME
npm run dist          # installer per il TUO sistema operativo → GAME/release/
# oppure, per un OS specifico:
npm run dist:win
npm run dist:linux
npm run dist:mac      # solo da un Mac, non fa parte delle release
```

Per generare Windows e Linux in una volta si usa la GitHub Action (vedi sotto): il runner Linux non è replicabile da una singola macchina Windows.

### Provare la build desktop senza installare

```bash
cd GAME
npm run build         # bundle web
npm run electron      # apre l'app Electron sul bundle
```

### Controlli e test

- `npm run check` — tutti i controlli della CI: formato e validazione dei dati, typecheck, lint, test
- `npm test` — test (ogni quest giocata dall'inizio alla fine, più i test di regressione)
- `npm run validate:data` — validazione dei dati di gioco
- `npm run build` — bundle di produzione (`GAME/dist/`)

Dettagli sull'architettura e su come aggiungere contenuti: [`GAME/README.md`](./GAME/README.md).

---

## 🤖 CI e release (GitHub Actions)

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) gira a ogni push e pull request che tocca `GAME/`: storia Ink compilata e aggiornata, `npm run check` e build.
- [`.github/workflows/release.yml`](./.github/workflows/release.yml) si avvia **manualmente** (Actions → *Release (Win/Linux)* → *Run workflow*, oppure `gh workflow run release.yml -f version=3.1.0`):
  1. verifica che la versione richiesta coincida con `GAME/package.json` ed esegue gli stessi controlli della CI;
  2. builda il gioco su runner **Windows e Linux** in parallelo e impacchetta gli installer con electron-builder;
  3. crea una **Release** `vX.Y.Z` nella repo con tutti gli installer allegati.
- [`.github/workflows/deploy-site.yml`](./.github/workflows/deploy-site.yml) (deploy del sito su DreamHost via SFTP) è **sospeso**: parte solo a mano (*Run workflow*), non più a ogni push su `main`. Il sito in `SITO/` ha già la nuova identità 3.0 ma non è stato ancora pubblicato; i suoi download puntano ancora alla v2.0.17.

---

## 📚 Game Design Document

La cartella [`GDD/`](./GDD) contiene 10 documenti che coprono ogni aspetto del progetto — panoramica, meccaniche, database contenuti, world design, trama principale, quest & lore, interfaccia, audio, script/testi e mappa. È scritto in modo indipendente dalla tecnologia e resta la fonte canonica del design.

---

## 📜 Crediti & licenza

Progettato e realizzato da **Simone Pizzi**. Produzione **Runtime Radio**.
Font inclusi nel gioco: Barlow, Barlow Condensed, Cormorant Garamond e Literata (SIL Open Font License, vedi `GAME/src/assets/fonts/OFL.txt`).
© Runtime Radio 2025 — tutti i diritti riservati. Repository pubblico a scopo dimostrativo e di trasparenza sullo sviluppo.
