# The Safe Place Chronicles: The Echo of the Journey — il gioco

![Versione](https://img.shields.io/badge/versione-2.1.0-blue.svg)
![Stato](https://img.shields.io/badge/stato-completabile-brightgreen.svg)
![Tech](https://img.shields.io/badge/tech-React%2019%20%7C%20Ink%20%7C%20Electron-purple.svg)

GDR testuale di sopravvivenza post-apocalittico in estetica anni '80, giocabile interamente da tastiera.
È una single page application React (mappa su HTML Canvas, dialoghi e cutscene in [Ink](https://www.inklestudios.com/ink/))
distribuita come app desktop per Windows, macOS e Linux con Electron.

## Avvio rapido

```bash
npm install
npm run dev            # http://localhost:3000
```

| Comando | Cosa fa |
|---------|---------|
| `npm run dev` | server di sviluppo (ricompila prima la storia Ink) |
| `npm run build` | bundle di produzione in `dist/` |
| `npm test` | test una volta sola (`npm run test:watch` per lo sviluppo) |
| `npm run check` | tutto quello che controlla la CI: formato e validazione dei dati, typecheck, lint, test |
| `npm run validate:data` | controlla i dati di gioco (riferimenti, quest, ricette, mappa) |
| `npm run format:data` | riformatta i JSON di `public/data` nello stile del progetto |
| `npm run compile:ink` | ricompila `src/assets/story/main.ink` in `main.json` |
| `npm run electron` | apre l'app desktop sul bundle già compilato (`--dev` per il server di sviluppo) |
| `npm run dist` | installer per il sistema operativo corrente in `release/` |

Serve Node.js 20 o superiore.

## Com'è fatto

| Cartella | Contenuto |
|----------|-----------|
| `public/data/` | tutto il contenuto di gioco in JSON: oggetti, eventi, quest, luoghi, nemici, ricette, mercanti, trofei, talenti, cutscene, lore |
| `src/assets/story/` | dialoghi e cutscene in Ink (`main.ink` include i moduli; `main.json` è il compilato) |
| `src/data/` | caricamento dei JSON negli store di database, mappa (`mapData.ts`) |
| `src/store/` | stato di gioco con Zustand: personaggio, mondo, tempo, eventi, combattimento, interazioni, narrativa, commercio |
| `src/services/` | regole che attraversano più store: movimento, quest, uso degli oggetti, crafting, commercio, salvataggi, Ink |
| `src/components/` | le schermate (una per stato di gioco) e i pannelli dell'interfaccia |
| `src/test/` | test che giocano davvero il gioco (vedi sotto) |
| `scripts/` | validatore e formattatore dei dati |
| `electron/` | processo principale e preload dell'app desktop |

### Sistemi principali

- **Quest** (`quests.json`, `services/questService.ts`): ogni quest è una sequenza di fasi. Una fase avanza con un
  trigger di stato (`reachLocation`, `getItem`, `hasItems`, `hasFlags`, `enemyDefeated`) o con un segnale
  (`talkToNPC`, `interactWithObject`, `completeEvent`) emesso da dialoghi Ink ed eventi. Le fasi possono indicare un
  luogo: la bussola e la mappa mostrano l'obiettivo.
- **Luoghi** (`pois.json`): punti d'interesse sulla mappa, nascosti finché un dialogo, un evento o la radio non li
  rivelano. Camminarci sopra apre il loro evento (`events/poi_events.json`). Alcuni vengono registrati durante il
  gioco (la pompa del villaggio, il teatro).
- **Eventi** (`events/*.json`): incontri casuali per bioma, eventi dei luoghi, lore ed easter egg. Le scelte possono
  richiedere oggetti, quest o flag, nascondersi quando non hanno senso e cambiare la descrizione del luogo
  (`variants`) dopo che il giocatore ha agito.
- **Ink** (`services/NarrativeService.ts`): ogni funzione che la storia chiama nel gioco deve essere dichiarata
  `EXTERNAL` in `modules/common.ink` **e** collegata in `NarrativeService`.
- **Oggetti** (`services/itemUseService.ts`): consumabili, strumenti con usi limitati (torce, tende, kit di
  riparazione, canne da pesca, radio...), zaini, manuali che insegnano ricette, munizioni.
- **Salvataggi** (`store/gameStore.ts`, `utils/saveFormat.ts`): 5 slot in localStorage più esportazione e importazione
  in JSON. Formato 2.1.0 con migrazione dei salvataggi precedenti; un salvataggio danneggiato viene rifiutato e la
  partita in corso resta intatta.
- **Desktop** (`electron/main.cjs`): il bundle è servito dal protocollo `app://bundle` (origine stabile per i
  salvataggi), con Content-Security-Policy, nessun accesso a Node dalla pagina e un bridge minimo
  (`window.tspDesktop`: uscita e schermo intero).

## Aggiungere o modificare contenuti

1. Modifica i JSON in `public/data` (o i file `.ink` in `src/assets/story/modules`).
2. `npm run format:data` e `npm run validate:data`: il validatore segnala ID inesistenti, quest che non si possono
   completare, oggetti senza una fonte, ricette che non si possono imparare, luoghi fuori dalla mappa.
3. `npm test`: se hai toccato una quest, il suo test in `src/test/quests.test.ts` deve continuare a passare.

## Test

- `src/test/quests.test.ts` gioca ogni quest dall'inizio alla fine con i dati veri, la storia Ink compilata e gli
  store reali (muoversi sulla mappa, parlare, scegliere negli eventi, combattere).
- `src/test/regressions.test.ts` riproduce i bug corretti nella 2.1.0 e verifica che restino corretti.
- Un warning o un errore inatteso in console fa fallire il test (`src/test/setup.ts`).

La CI (`.github/workflows/ci.yml`, nella root del repository) esegue a ogni push e pull request la ricompilazione
della storia Ink, `npm run check` e la build. Il workflow di release fa gli stessi controlli prima di creare gli
installer.

## Documentazione

- Novità della versione corrente: [`docs/logs/v2.1.0-revisione-completa.md`](./docs/logs/v2.1.0-revisione-completa.md)
- Log delle versioni precedenti: [`docs/logs/`](./docs/logs/)
- Documenti di design e analisi storiche: [`docs/design/`](./docs/design/), [`docs/technical/`](./docs/technical/)
- Il README e la roadmap fino alla 2.0.17 sono archiviati in [`docs/storico/`](./docs/storico/): descrivono piani
  (Phaser, Tauri, Tailwind via CDN) che non corrispondono più al codice.

Progettato e realizzato da **Simone Pizzi** — produzione **Runtime Radio**.
