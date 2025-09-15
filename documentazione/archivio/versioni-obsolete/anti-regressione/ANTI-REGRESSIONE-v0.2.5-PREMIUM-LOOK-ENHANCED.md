# Dichiarazione di Immutabilità e Protezione Anti-Regressione

**Versione:** v0.2.5 "Premium Look Enhanced"
**Data:** 23 luglio 2025

---

## Oggetto della Dichiarazione

Questa dichiarazione formalizza l'immutabilità delle seguenti funzionalità e file, consolidati nella versione `v0.2.5` del progetto "The Safe Place".

### 1. Miglioramenti all'Effetto CRT Premium

- **File Coinvolti**:
  - `src/index.css`
  - `src/styles/crt-premium.css`

- **Funzionalità Dichiarate Immutabili**:
  - **Curvatura dello Schermo**: L'implementazione della curvatura tramite `border-radius` e `radial-gradient` è considerata definitiva e ottimale.
  - **Animazione di Riscaldamento (Warm-up)**: I keyframes e le proprietà dell'animazione `crt-warmup` sono bloccati per preservare l'effetto visivo raggiunto.
  - **Effetto Ghosting**: L'animazione `crt-ghosting` e la sua applicazione all'overlay sono considerate stabili e non devono essere alterate senza una nuova valutazione formale.

## Razionale della Protezione

Le modifiche introdotte nella v0.2.5 rappresentano il culmine del perfezionamento estetico dell'emulazione CRT. Ogni ulteriore modifica non pianificata potrebbe compromettere l'equilibrio visivo e l'autenticità dell'esperienza utente. Questa dichiarazione serve a prevenire regressioni e a garantire che la qualità visiva rimanga costante.

## Clausola di Modifica

Qualsiasi modifica ai file o alle funzionalità sopra elencate richiederà una nuova analisi di impatto, la creazione di una nuova roadmap e una successiva dichiarazione di anti-regressione per la versione futura.