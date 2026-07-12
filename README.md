# The Safe Place Chronicles: The Echo of the Journey

![version](https://img.shields.io/badge/gioco-v2.0.16-blue.svg)
![platform](https://img.shields.io/badge/desktop-Windows%20%7C%20macOS%20%7C%20Linux-informational.svg)
![status](https://img.shields.io/badge/stato-completabile-brightgreen.svg)

Un **GDR testuale di sopravvivenza** post-apocalittico in estetica retrocomputazionale anni '80. Il giocatore — *Ultimo* — attraversa una mappa devastata per raggiungere il **Safe Place**, gestendo risorse, incontri, combattimenti e scelte morali, mentre gli "Echi della Memoria" svelano il suo passato fino al confronto finale.

Progetto di **Simone Pizzi** / **Runtime Radio**, nato come esperimento sul portare in fondo un videogioco non banale con l'aiuto di un LLM.

> **Stato**: il gioco è **giocabile dall'inizio alla fine** (nuova partita → 12 capitoli di trama → Safe Place → epilogo secondo la bussola morale → THE END). Lo sviluppo del codice è chiuso; il progetto viene distribuito come applicazione desktop.

---

## 📦 Download

Gli installer per Windows, macOS e Linux vengono prodotti dalla GitHub Action **Release** e pubblicati nella pagina **[Releases](../../releases)**:

| OS | Formati |
|----|---------|
| **Windows** | `.exe` (installer NSIS) · versione `portable` |
| **macOS** | `.dmg` · `.zip` — *app non firmata: al primo avvio click destro → Apri* |
| **Linux** | `.AppImage` · `.deb` |

---

## 🗂️ Struttura del repository

| Cartella | Contenuto |
|----------|-----------|
| [`GAME/`](./GAME) | Il gioco — React 19 + TypeScript + Zustand + Ink, impacchettato come app desktop con Electron |
| [`SITO/`](./SITO) | Sito web di presentazione (progetto separato) |
| [`GDD/`](./GDD) | Game Design Document completo e agnostico dal motore — la "bibbia" del design |
| [`COVER-UFFICIALE/`](./COVER-UFFICIALE) | Immagini di copertina ufficiali |

---

## 🎮 Il gioco (`GAME/`)

**Stack**: React 19 · TypeScript 5.8 · Vite 6 · Zustand 5 · [Ink](https://www.inklestudios.com/ink/) (narrativa) · Tailwind CSS · rendering mappa su HTML Canvas · packaging [Electron](https://www.electronjs.org/) + electron-builder.

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
npm run dist:mac
npm run dist:linux
```

Per generare **tutti e tre** gli OS in una volta si usa la GitHub Action (vedi sotto): i runner macOS e Linux non sono replicabili da una singola macchina Windows.

### Provare la build desktop senza installare

```bash
cd GAME
npm run build         # bundle web
npm run electron      # apre l'app Electron sul bundle
```

### Altri script utili

- `npm run test` — suite Vitest
- `npm run build` — bundle di produzione (`GAME/dist/`)
- `npm run validate:data` — validazione dei dati di gioco

---

## 🤖 Release automatica (GitHub Actions)

Il workflow [`.github/workflows/release.yml`](./.github/workflows/release.yml) si avvia **manualmente** (Actions → *Release (Win/Mac/Linux)* → *Run workflow*, oppure `gh workflow run release.yml -f version=2.0.16`):

1. builda il gioco su runner **Windows, macOS e Linux** in parallelo;
2. impacchetta gli installer con electron-builder;
3. crea una **Release** `vX.Y.Z` nella repo con tutti gli installer allegati.

---

## 📚 Game Design Document

La cartella [`GDD/`](./GDD) contiene 10 documenti che coprono ogni aspetto del progetto — panoramica, meccaniche, database contenuti, world design, trama principale, quest & lore, interfaccia, audio, script/testi e mappa. È scritto in modo indipendente dalla tecnologia e resta la fonte canonica del design.

---

## 📜 Crediti & licenza

Progettato e realizzato da **Simone Pizzi**. Produzione **Runtime Radio**.
© Runtime Radio 2025 — tutti i diritti riservati. Repository pubblico a scopo dimostrativo e di trasparenza sullo sviluppo.
